import { randomUUID } from 'node:crypto'

import type { Server, Socket } from 'socket.io'

import { isError, liveCtx, type GameDef, type Player } from '../games/engine.js'
import { markSeen, seenFor } from '../services/seen.service.js'
import { drawCanvas, drawGame } from '../games/draw.js'
import { knowMe } from '../games/knowme.js'
import { mafia } from '../games/mafia.js'
import { geoGame } from '../games/geo.js'
import { trivia } from '../games/trivia.js'
import { songQuiz } from '../games/songquiz.js'
import { truthDare } from '../games/truthdare.js'
import { prisma } from '../models/prisma.js'
import { presenceFor } from '../services/presence.service.js'
import { socketUser } from './presence.gateway.js'
import { roomGuard } from './roomAuth.js'

/**
 * Party games for a room — one at a time, everyone in it.
 *
 * Each game is a state machine in src/games; this is only the plumbing around
 * it. It keeps one session per room, applies actions in order, and sends every
 * person watching *their own* view of the state — which is what keeps the
 * asker's cards, the drawer's word and everybody's unrevealed answers on the
 * server where they belong.
 *
 * Sessions live in memory. A game is an evening's thing; what lasts is the
 * result, which is written to the database when a game ends so the memory wall
 * and running scores can find it.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGame = GameDef<any, any>

const GAMES: Record<string, AnyGame> = {
  [truthDare.id]: truthDare,
  [drawGame.id]: drawGame,
  [knowMe.id]: knowMe,
  [trivia.id]: trivia,
  [songQuiz.id]: songQuiz,
  [mafia.id]: mafia,
  [geoGame.id]: geoGame,
}

/**
 * Games with a shared canvas, and who may draw on it.
 *
 * Strokes are a side channel: they arrive many times a second and only matter
 * to the canvas, so they are relayed directly instead of being folded into the
 * game state and re-published as a personalised view on every pen movement.
 */
const CANVASES: Record<string, { canDraw: (state: never, userId: string) => boolean; key: (state: never) => string }> = {
  [drawGame.id]: drawCanvas as unknown as { canDraw: (state: never, userId: string) => boolean; key: (state: never) => string },
}

type Stroke = { id: string; color: string; size: number; tool: 'pen' | 'eraser' | 'fill' | 'clear'; points: [number, number][] }
const canvases = new Map<string, { key: string; strokes: Stroke[]; redo: Stroke[]; points: number }>()
const MAX_POINTS = 40_000
const COLOR = /^#[0-9a-f]{6}$/i

function canvasFor(roomId: string, key: string) {
  const current = canvases.get(roomId)
  if (current && current.key === key) return current
  const fresh = { key, strokes: [] as Stroke[], redo: [] as Stroke[], points: 0 }
  canvases.set(roomId, fresh)
  return fresh
}

/** Register another game. The games themselves call this from their modules. */
export function registerGame(game: AnyGame) {
  GAMES[game.id] = game
}

type Session = {
  game: AnyGame
  state: unknown
  /** Which game this is — a rematch of the same game restarts `seq`. */
  id: string
  seq: number
  startedBy: Player
  saved: boolean
  ctx: ReturnType<typeof liveCtx>
}

const sessions = new Map<string, Session>()
/** Who is looking at each room's game, so each gets their own view. */
const watchers = new Map<string, Map<string, { socket: Socket; userId: string; name: string }>>()
/**
 * Who had the game screen open and lost their connection, and when.
 *
 * A dropped connection is not somebody leaving: a phone locks, a signal
 * dips, and a few seconds later the same person is back. Dealing a game in
 * those seconds used to leave them out of it. Anyone who dropped within
 * `RECONNECTING_MS` is treated as still at the table.
 */
const dropped = new Map<string, Map<string, { name: string; at: number }>>()
const RECONNECTING_MS = 60_000

type Ack = (reply: unknown) => void
const ackFrom = (maybe: unknown): Ack => (typeof maybe === 'function' ? (maybe as Ack) : () => undefined)

function publish(io: Server, roomId: string) {
  const session = sessions.get(roomId)
  const board = session ? CANVASES[session.game.id] : undefined
  if (board) {
    const key = `${session!.id}:${board.key(session!.state as never)}`
    if (canvases.get(roomId)?.key !== key) {
      canvasFor(roomId, key)
      for (const { socket } of watchers.get(roomId)?.values() ?? []) socket.emit('party:canvas', { roomId, key, strokes: [] })
    }
  }
  for (const { socket, userId } of watchers.get(roomId)?.values() ?? []) {
    socket.emit(
      'party:state',
      session
        ? {
            roomId,
            game: session.game.id,
            label: session.game.label,
            session: session.id,
            seq: session.seq,
            startedBy: session.startedBy,
            /* Deadlines are server time; this lets a client count down
               without trusting its own clock. */
            serverTime: Date.now(),
            view: session.game.view(session.state, userId),
          }
        : { roomId, game: null },
    )
  }
  /* The hub and the game picker only need to know something is on. */
  io.to(roomId).emit('party:status', {
    roomId,
    game: session?.game.id ?? null,
    label: session?.game.label ?? null,
    over: session ? (session.state as { phase?: string }).phase === 'over' : false,
  })
}

/** Note what this game showed, so the room's next one leads with new things. */
function remember(roomId: string, session: Session | undefined) {
  if (!session?.game.used) return
  void markSeen(roomId, session.game.id, session.game.used(session.state)).catch(() => undefined)
}

async function settle(roomId: string, session: Session) {
  if (session.saved) return
  const result = session.game.over(session.state)
  if (!result) return
  session.saved = true
  session.ctx.dispose()
  remember(roomId, session)
  await prisma.gameResult
    .create({ data: { roomId, game: session.game.id, summary: JSON.stringify(result.summary) } })
    .catch(() => undefined)
}

/** At most `burst` moves per `windowMs` from one connection, refilling smoothly. */
function actLimiter(burst: number, windowMs: number) {
  let tokens = burst
  let refilled = Date.now()
  return () => {
    const now = Date.now()
    tokens = Math.min(burst, tokens + ((now - refilled) / windowMs) * burst)
    refilled = now
    if (tokens < 1) return false
    tokens -= 1
    return true
  }
}

/** Whatever slow work this state asks for, applied when it is done — if the same game is still on. */
function followUp(io: Server, roomId: string, session: Session) {
  const work = session.game.after?.(roomId, session.state)
  if (!work) return
  for (const later of Array.isArray(work) ? work : [work]) {
    later
      .then((result) => {
        if (result && sessions.get(roomId) === session) apply(io, roomId, null, result.action, result.payload)
      })
      .catch(() => undefined)
  }
}

function apply(io: Server, roomId: string, by: Player | null, action: string, payload: Record<string, unknown>) {
  const session = sessions.get(roomId)
  if (!session) return { error: 'No game is running' }
  const next = session.game.act(session.state, by, action, payload, session.ctx)
  if (isError(next)) return next
  session.state = next
  session.seq += 1
  publish(io, roomId)
  void settle(roomId, session)
  followUp(io, roomId, session)
  return { ok: true }
}

export function attachPartyGateway(io: Server) {
  io.on('connection', (socket: Socket) => {
    const state = socketUser(socket)
    if (!state) return
    const self: Player = { id: state.userId, name: state.name }
    const may = roomGuard(socket, self.id)
    /* A person taps a few times a second at most; a flood is a bug or abuse, and must not take the server down. */
    const allowAct = actLimiter(20, 4_000)
    const allowGeoPing = actLimiter(8, 4_000)
    const allowFill = actLimiter(4, 1_000)
    socket.on('geo:ping', (raw: unknown) => {
      const sent = (raw as { sent?: unknown } | null)?.sent
      if (typeof sent === 'number' && Number.isFinite(sent) && allowGeoPing()) socket.emit('geo:pong', { sent, serverTime: Date.now() })
    })
    const watching = new Set<string>()

    const unwatch = (roomId: string) => {
      watchers.get(roomId)?.delete(socket.id)
      watching.delete(roomId)
    }

    socket.on('party:open', async (raw: unknown) => {
      const roomId = await may((raw as { roomId?: unknown })?.roomId)
      if (!roomId) return
      if (!watchers.has(roomId)) watchers.set(roomId, new Map())
      watchers.get(roomId)!.set(socket.id, { socket, userId: self.id, name: self.name })
      dropped.get(roomId)?.delete(self.id)
      watching.add(roomId)
      const session = sessions.get(roomId)
      const existing = canvases.get(roomId)
      if (session && CANVASES[session.game.id] && existing) {
        socket.emit('party:canvas', { roomId, key: existing.key, strokes: existing.strokes, canRedo: existing.redo.length > 0 })
      }
      socket.emit(
        'party:state',
        session
          ? {
              roomId,
              game: session.game.id,
              label: session.game.label,
              session: session.id,
            seq: session.seq,
              startedBy: session.startedBy,
              serverTime: Date.now(),
              view: session.game.view(session.state, self.id),
            }
          : { roomId, game: null },
      )
    })

    socket.on('party:close', (raw: unknown) => {
      const roomId = (raw as { roomId?: unknown })?.roomId
      if (typeof roomId === 'string') unwatch(roomId)
    })

    socket.on('party:start', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId) return ack({ error: 'Not in this room' })
      const game = typeof body.game === 'string' ? GAMES[body.game] : undefined
      if (!game) return ack({ error: 'Unknown game' })

      const running = sessions.get(roomId)
      if (running && (running.state as { phase?: string }).phase !== 'over') {
        return ack({ error: `${running.game.label} is already going — end it first` })
      }

      /*
       * Everyone standing in the room plays, starter first — and everyone
       * with the game screen open, too. Room presence is rebuilt on every
       * reconnect and every refresh of the room list, so for a moment
       * somebody plainly at the table can be missing from it; dealing at that
       * moment used to leave them watching a game they were meant to be in,
       * with no controls and no word why.
       */
      const here = presenceFor(roomId).map((p) => ({ id: p.userId, name: p.name }))
      const looking = [...(watchers.get(roomId)?.values() ?? [])].map((w) => ({ id: w.userId, name: w.name }))
      const returning = [...(dropped.get(roomId)?.entries() ?? [])]
        .filter(([, d]) => Date.now() - d.at < RECONNECTING_MS)
        .map(([id, d]) => ({ id, name: d.name }))
      const everyone = new Map<string, Player>()
      for (const person of [self, ...here, ...looking, ...returning]) if (!everyone.has(person.id)) everyone.set(person.id, person)
      const players = [...everyone.values()].slice(0, game.maxPlayers)
      const parsed = game.options(body.options)
      if (isError(parsed)) return ack(parsed)
      if (game.id === 'geo' && parsed.mode === 'duel' && parsed.opponent && !players.slice(1).some(p => p.id === parsed.opponent)) {
        return ack({ error: 'That friend is no longer available. Pick someone else for the duel.' })
      }
      const needed = game.minPeople?.(parsed) ?? game.minPlayers
      if (players.length < needed) {
        return ack({ error: `${game.label} needs at least ${needed} ${needed === 1 ? 'person' : 'people'} in the room` })
      }

      const options = game.prepare ? await game.prepare(roomId, parsed) : parsed
      if (isError(options)) return ack(options)
      /* The last game here goes on the record before this one reads it — one dropped before its first night was never recorded when it ended. */
      if (running?.game.used) await markSeen(roomId, running.game.id, running.game.used(running.state)).catch(() => undefined)
      const seen = game.used ? await seenFor(roomId, game.id) : undefined
      /* Someone else may have started a game while this one was preparing. */
      const raced = sessions.get(roomId)
      if (raced && raced !== running && (raced.state as { phase?: string }).phase !== 'over') {
        return ack({ error: `${raced.game.label} is already going — end it first` })
      }

      const previous = sessions.get(roomId)
      previous?.ctx.dispose()
      remember(roomId, previous)
      const ctx = liveCtx(
        (action, payload) => apply(io, roomId, null, action, payload),
        seen,
        () => presenceFor(roomId).map((p) => p.userId),
      )
      const session = {
        game,
        state: game.start(players, options, ctx),
        id: randomUUID(),
        seq: 1,
        startedBy: self,
        saved: false,
        ctx,
      }
      sessions.set(roomId, session)
      publish(io, roomId)
      ack({ ok: true })
      followUp(io, roomId, session)

      /* Whatever the game wants to do after it has started, without anyone waiting on it. */
      game.background?.(roomId, options, session.state)
        .then((result) => {
          if (result && sessions.get(roomId) === session) apply(io, roomId, null, result.action, result.payload)
        })
        .catch(() => undefined)
    })

    socket.on('party:act', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      if (!allowAct()) return ack({ error: 'Slow down a moment' })
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId || typeof body.action !== 'string') return ack({ error: 'Not in this room' })
      const payload = (typeof body.payload === 'object' && body.payload !== null ? body.payload : {}) as Record<string, unknown>
      ack(apply(io, roomId, self, body.action, payload))
    })

    socket.on('party:join', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const roomId = await may((raw as { roomId?: unknown })?.roomId)
      const session = roomId ? sessions.get(roomId) : undefined
      if (!roomId || !session?.game.join) return ack({ error: 'Nothing to join' })
      const next = session.game.join(session.state, self, session.ctx)
      if (!next) return ack({ error: 'Cannot join this one' })
      session.state = next
      session.seq += 1
      publish(io, roomId)
      ack({ ok: true })
    })

    /** Clear the table, so a different game can start. */
    socket.on('party:dismiss', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const roomId = await may((raw as { roomId?: unknown })?.roomId)
      const session = roomId ? sessions.get(roomId) : undefined
      if (!roomId || !session) return ack({ error: 'Nothing to clear' })
      await settle(roomId, session)
      session.ctx.dispose()
      sessions.delete(roomId)
      publish(io, roomId)
      ack({ ok: true })
    })

    /* The drawer's pen, relayed to everyone else watching. */
    const drawer = (roomId: string) => {
      const session = sessions.get(roomId)
      const board = session ? CANVASES[session.game.id] : undefined
      if (!session || !board || !watching.has(roomId)) return null
      if (!board.canDraw(session.state as never, self.id)) return null
      return canvasFor(roomId, `${session.id}:${board.key(session.state as never)}`)
    }
    const others = (roomId: string) =>
      [...(watchers.get(roomId)?.values() ?? [])].filter((w) => w.socket.id !== socket.id).map((w) => w.socket)

    /* The board mounts after party:open and may have missed its snapshot.
       Requesting just the canvas also avoids reopening the whole table. */
    socket.on('party:canvas:request', async (raw: unknown) => {
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      const session = roomId ? sessions.get(roomId) : undefined
      const canvas = session ? CANVASES[session.game.id] : undefined
      if (!roomId || !session || !canvas || !watching.has(roomId)) return
      const key = `${session.id}:${canvas.key(session.state as never)}`
      if (body.key !== key) return
      const board = canvasFor(roomId, key)
      socket.emit('party:canvas', { roomId, key, strokes: board.strokes, canRedo: board.redo.length > 0 })
    })

    socket.on('party:stroke', (raw: unknown) => {
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = typeof body.roomId === 'string' ? body.roomId : ''
      const board = drawer(roomId)
      if (!board || body.key !== board.key) return
      const id = typeof body.id === 'string' && body.id.length <= 40 ? body.id : null
      const color = typeof body.color === 'string' && COLOR.test(body.color) ? body.color : null
      const size = typeof body.size === 'number' && body.size >= 1 && body.size <= 40 ? body.size : null
      const tool = body.tool === 'eraser' ? 'eraser' : body.tool === 'fill' ? 'fill' : 'pen'
      if (tool === 'fill' && !allowFill()) return
      const points = Array.isArray(body.points)
        ? (body.points as unknown[])
            .slice(0, tool === 'fill' ? 1 : 200)
            .filter(
              (p): p is [number, number] =>
                Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && n >= -0.05 && n <= 1.05),
            )
        : []
      if (!id || !color || !size || points.length === 0) return
      if (board.points + points.length > MAX_POINTS) return

      let stroke = board.strokes.find((st) => st.id === id)
      if (!stroke) {
        stroke = { id, color, size, tool, points: [] }
        board.strokes.push(stroke)
        board.redo = []
      } else if (stroke.tool === 'fill' || stroke.color !== color || stroke.size !== size || stroke.tool !== tool) return
      stroke.points.push(...points)
      board.points += points.length
      for (const s of others(roomId)) s.emit('party:stroke', { roomId, key: board.key, id, color, size, tool, points })
    })

    socket.on('party:undo', (raw: unknown) => {
      const roomId = typeof (raw as { roomId?: unknown })?.roomId === 'string' ? (raw as { roomId: string }).roomId : ''
      const board = drawer(roomId)
      if (!board || (raw as { key?: unknown })?.key !== board.key) return
      const gone = board.strokes.pop()
      if (gone) { board.points -= gone.points.length; board.redo.push(gone) }
      for (const { socket: s } of watchers.get(roomId)?.values() ?? []) s.emit('party:canvas', { roomId, key: board.key, strokes: board.strokes, canRedo: board.redo.length > 0 })
    })

    socket.on('party:redo', (raw: unknown) => {
      const roomId = typeof (raw as { roomId?: unknown })?.roomId === 'string' ? (raw as { roomId: string }).roomId : ''
      const board = drawer(roomId)
      if (!board || (raw as { key?: unknown })?.key !== board.key) return
      const restored = board.redo.pop()
      if (restored) { board.strokes.push(restored); board.points += restored.points.length }
      for (const { socket: s } of watchers.get(roomId)?.values() ?? []) s.emit('party:canvas', { roomId, key: board.key, strokes: board.strokes, canRedo: board.redo.length > 0 })
    })

    socket.on('party:clear', (raw: unknown) => {
      const roomId = typeof (raw as { roomId?: unknown })?.roomId === 'string' ? (raw as { roomId: string }).roomId : ''
      const board = drawer(roomId)
      if (!board || (raw as { key?: unknown })?.key !== board.key) return
      if (!board.strokes.length || board.strokes.at(-1)?.tool === 'clear' || board.points >= MAX_POINTS) return
      // A clear is an undoable operation; it never destroys the page history.
      board.strokes.push({ id: randomUUID(), color: '#fbfaf7', size: 1, tool: 'clear', points: [[0, 0]] })
      board.points += 1
      board.redo = []
      for (const { socket: s } of watchers.get(roomId)?.values() ?? []) s.emit('party:canvas', { roomId, key: board.key, strokes: board.strokes, canRedo: false })
    })

    socket.on('disconnect', () => {
      for (const roomId of watching) {
        watchers.get(roomId)?.delete(socket.id)
        /* Remembered as on their way back, unless they are still watching from another connection. */
        if (![...(watchers.get(roomId)?.values() ?? [])].some((w) => w.userId === self.id)) {
          if (!dropped.has(roomId)) dropped.set(roomId, new Map())
          dropped.get(roomId)!.set(self.id, { name: self.name, at: Date.now() })
        }
      }
      watching.clear()
    })
  })
}
