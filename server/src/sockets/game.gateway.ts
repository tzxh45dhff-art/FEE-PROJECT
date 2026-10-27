import type { Server, Socket } from 'socket.io'
import { getRoom } from '../services/room.service.js'
import { socketUser } from './presence.gateway.js'
import { advance, createMatch, parseFlick, penStyle, shoot, type PenMatch } from '../games/penfight.js'

const channel = (id: string) => `game:${id}`
type Reply = (value: { ok?: boolean; error?: string }) => void
const object = (raw: unknown): Record<string, unknown> => raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}

/** Server-owned shots keep a phone sleeping mid-flick from freezing the room. */
export function attachGameGateway(io: Server) {
  const matches = new Map<string, PenMatch>()
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  let epoch = Date.now()
  const wire = (roomId: string, match: PenMatch) => ({ ...match, roomId, serverNow: Date.now() })
  const publish = (roomId: string, match: PenMatch) => {
    matches.set(roomId, match)
    io.to(channel(roomId)).emit('game:state', wire(roomId, match))
    clearTimeout(timers.get(roomId))
    // Finished desks are ephemeral too; do not accumulate rooms indefinitely.
    const delay = match.phase === 'over' ? 30 * 60_000 : Math.max(0, match.deadline - Date.now())
    const timer = setTimeout(() => {
      if (matches.get(roomId) !== match) return
      if (match.phase === 'over') {
        matches.delete(roomId)
        timers.delete(roomId)
        io.to(channel(roomId)).emit('game:state', { roomId, cleared: true })
      } else publish(roomId, advance(match, Math.max(Date.now(), match.deadline)))
    }, delay)
    timer.unref()
    timers.set(roomId, timer)
  }
  io.on('connection', (socket: Socket) => {
    const user = socketUser(socket)
    if (!user) return
    const seated = new Set<string>()
    socket.on('game:open', async (raw: unknown, reply?: Reply) => {
      const { roomId } = object(raw)
      if (typeof roomId !== 'string') return reply?.({ error: 'Choose a room first.' })
      try {
        await getRoom(user.userId, roomId)
        seated.add(roomId)
        await socket.join(channel(roomId))
        const match = matches.get(roomId)
        socket.emit('game:state', match ? wire(roomId, match) : { roomId, cleared: true })
        reply?.({ ok: true })
      } catch { reply?.({ error: 'You are no longer in this room.' }) }
    })
    socket.on('game:close', (raw: unknown) => {
      const { roomId } = object(raw)
      if (typeof roomId !== 'string') return
      seated.delete(roomId)
      void socket.leave(channel(roomId))
    })
    socket.on('game:start', async (raw: unknown, reply?: Reply) => {
      const { roomId, opponent, styles } = object(raw)
      if (typeof roomId !== 'string' || !seated.has(roomId)) return reply?.({ error: 'Reconnecting to the desk. Try again in a moment.' })
      try {
        const room = await getRoom(user.userId, roomId)
        const opponentId = object(opponent).id
        const other = room.members.find(m => m.id === opponentId && m.id !== user.userId)
        if (!other || !room.online.includes(other.id)) return reply?.({ error: 'That friend is not in the room right now.' })
        const current = matches.get(roomId)
        if (current && current.winner === null) return reply?.({ error: 'A match is already on this desk.' })
        const chosen = Array.isArray(styles) ? styles : []
        const match = createMatch([{ id: user.userId, name: user.name }, { id: other.id, name: other.name }], ++epoch, Date.now(), [penStyle(chosen[0]), penStyle(chosen[1] ?? 'gel')])
        publish(roomId, match)
        reply?.({ ok: true })
      } catch { reply?.({ error: 'Could not open this desk. Check your room connection.' }) }
    })
    socket.on('game:flick', (raw: unknown, reply?: Reply) => {
      const data = object(raw), roomId = data.roomId
      if (typeof roomId !== 'string' || !seated.has(roomId)) return reply?.({ error: 'Reconnect before flicking.' })
      const match = matches.get(roomId)
      if (!match || data.epoch !== match.epoch || data.seq !== match.seq) return reply?.({ error: 'The turn changed. Aim again.' })
      if (match.phase !== 'aim' || match.players[match.turn].id !== user.userId) return reply?.({ error: 'Wait for your turn.' })
      if (Date.now() >= match.deadline) return reply?.({ error: 'Time is up for that turn.' })
      const shot = parseFlick(data.shot)
      if (!shot) return reply?.({ error: 'Pull back from your pen to take a shot.' })
      publish(roomId, shoot(match, shot, Date.now()))
      reply?.({ ok: true })
    })
    // Legacy game:motion / game:settled deliberately have no handlers.
    socket.on('game:end', (raw: unknown, reply?: Reply) => {
      const data = object(raw), roomId = data.roomId
      if (typeof roomId !== 'string' || !seated.has(roomId)) return reply?.({ error: 'Reconnect to leave the match.' })
      const match = matches.get(roomId)
      if (!match || data.epoch !== match.epoch) return reply?.({ error: 'This match has already ended.' })
      if (!match.players.some(p => p.id === user.userId) && match.phase !== 'over') return reply?.({ error: 'Only a player can end the match.' })
      clearTimeout(timers.get(roomId))
      timers.delete(roomId)
      matches.delete(roomId)
      io.to(channel(roomId)).emit('game:state', { roomId, cleared: true })
      reply?.({ ok: true })
    })
  })
}
