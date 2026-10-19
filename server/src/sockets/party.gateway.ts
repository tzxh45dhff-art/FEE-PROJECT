import type { Server, Socket } from 'socket.io'

import { isError, liveCtx, type GameDef, type Player } from '../games/engine.js'
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
      socket.emit(
        'party:state',
        session
          ? {
              roomId,
              game: session.game.id,
              label: session.game.label,
              seq: session.seq,
              startedBy: session.startedBy,
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

    socket.on('disconnect', () => {
      for (const roomId of watching) watchers.get(roomId)?.delete(socket.id)
      watching.clear()
    })
  })
}
