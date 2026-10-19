import type { Server, Socket } from 'socket.io'

import { isError, liveCtx, type GameDef, type Player } from '../games/engine.js'
import { drawCanvas, drawGame } from '../games/draw.js'
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

type Stroke = { id: string; color: string; size: number; tool: 'pen' | 'eraser'; points: [number, number][] }
const canvases = new Map<string, { key: string; strokes: Stroke[]; points: number }>()
const MAX_POINTS = 40_000
const COLOR = /^#[0-9a-f]{6}$/i

function canvasFor(roomId: string, key: string) {
  const current = canvases.get(roomId)
  if (current && current.key === key) return current
  const fresh = { key, strokes: [] as Stroke[], points: 0 }
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
  seq: number
  startedBy: Player
  saved: boolean
  ctx: ReturnType<typeof liveCtx>
}

const sessions = new Map<string, Session>()
/** Who is looking at each room's game, so each gets their own view. */
const watchers = new Map<string, Map<string, { socket: Socket; userId: string }>>()

type Ack = (reply: unknown) => void
const ackFrom = (maybe: unknown): Ack => (typeof maybe === 'function' ? (maybe as Ack) : () => undefined)

function publish(io: Server, roomId: string) {
  const session = sessions.get(roomId)
  const board = session ? CANVASES[session.game.id] : undefined
  if (board) {
    const key = board.key(session!.state as never)
    if (canvases.get(roomId)?.key !== key) {
      canvasFor(roomId, key)
      for (const { socket } of watchers.get(roomId)?.values() ?? []) socket.emit('party:canvas', { roomId, strokes: [] })
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

async function settle(roomId: string, session: Session) {
  if (session.saved) return
  const result = session.game.over(session.state)
  if (!result) return
  session.saved = true
  session.ctx.dispose()
  await prisma.gameResult
    .create({ data: { roomId, game: session.game.id, summary: JSON.stringify(result.summary) } })
    .catch(() => undefined)
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
  return { ok: true }
}

export function attachPartyGateway(io: Server) {
  io.on('connection', (socket: Socket) => {
    const state = socketUser(socket)
    if (!state) return
    const self: Player = { id: state.userId, name: state.name }
    const may = roomGuard(socket, self.id)
    const watching = new Set<string>()

    const unwatch = (roomId: string) => {
      watchers.get(roomId)?.delete(socket.id)
      watching.delete(roomId)
    }

    socket.on('party:open', async (raw: unknown) => {
      const roomId = await may((raw as { roomId?: unknown })?.roomId)
      if (!roomId) return
      if (!watchers.has(roomId)) watchers.set(roomId, new Map())
      watchers.get(roomId)!.set(socket.id, { socket, userId: self.id })
      watching.add(roomId)
      const session = sessions.get(roomId)
      const existing = canvases.get(roomId)
      if (session && CANVASES[session.game.id] && existing) {
        socket.emit('party:canvas', { roomId, strokes: existing.strokes })
      }
      socket.emit(
        'party:state',
        session
          ? {
              roomId,
              game: session.game.id,
              label: session.game.label,
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

      /* Everyone standing in the room plays, starter first. */
      const here = presenceFor(roomId).map((p) => ({ id: p.userId, name: p.name }))
      const players = [self, ...here.filter((p) => p.id !== self.id)].slice(0, game.maxPlayers)
      if (players.length < game.minPlayers) {
        return ack({ error: `${game.label} needs at least ${game.minPlayers} people in the room` })
      }

      const options = game.options(body.options)
      if (isError(options)) return ack(options)

      running?.ctx.dispose()
      const ctx = liveCtx((action, payload) => apply(io, roomId, null, action, payload))
      sessions.set(roomId, {
        game,
        state: game.start(players, options, ctx),
        seq: 1,
        startedBy: self,
        saved: false,
        ctx,
      })
      publish(io, roomId)
      ack({ ok: true })
    })

    socket.on('party:act', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
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
      const next = session.game.join(session.state, self)
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
      return canvasFor(roomId, board.key(session.state as never))
    }
    const others = (roomId: string) =>
      [...(watchers.get(roomId)?.values() ?? [])].filter((w) => w.socket.id !== socket.id).map((w) => w.socket)

    socket.on('party:stroke', (raw: unknown) => {
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = typeof body.roomId === 'string' ? body.roomId : ''
      const board = drawer(roomId)
      if (!board) return
      const id = typeof body.id === 'string' && body.id.length <= 40 ? body.id : null
      const color = typeof body.color === 'string' && COLOR.test(body.color) ? body.color : null
      const size = typeof body.size === 'number' && body.size >= 1 && body.size <= 40 ? body.size : null
      const tool = body.tool === 'eraser' ? 'eraser' : 'pen'
      const points = Array.isArray(body.points)
        ? (body.points as unknown[])
            .slice(0, 200)
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
      }
      stroke.points.push(...points)
      board.points += points.length
      for (const s of others(roomId)) s.emit('party:stroke', { roomId, id, color, size, tool, points })
    })

    socket.on('party:undo', (raw: unknown) => {
      const roomId = typeof (raw as { roomId?: unknown })?.roomId === 'string' ? (raw as { roomId: string }).roomId : ''
      const board = drawer(roomId)
      if (!board) return
      const gone = board.strokes.pop()
      if (gone) board.points -= gone.points.length
      for (const { socket: s } of watchers.get(roomId)?.values() ?? []) s.emit('party:canvas', { roomId, strokes: board.strokes })
    })

    socket.on('party:clear', (raw: unknown) => {
      const roomId = typeof (raw as { roomId?: unknown })?.roomId === 'string' ? (raw as { roomId: string }).roomId : ''
      const board = drawer(roomId)
      if (!board) return
      board.strokes = []
      board.points = 0
      for (const { socket: s } of watchers.get(roomId)?.values() ?? []) s.emit('party:canvas', { roomId, strokes: [] })
    })

    socket.on('disconnect', () => {
      for (const roomId of watching) watchers.get(roomId)?.delete(socket.id)
      watching.clear()
    })
  })
}
