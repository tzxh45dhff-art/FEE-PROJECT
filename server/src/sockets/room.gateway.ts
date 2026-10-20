import type { Server, Socket } from 'socket.io'

import { getRoom } from '../services/room.service.js'
import { socketUser } from './presence.gateway.js'
import { roomGuard } from './roomAuth.js'

/**
 * Telling a room it changed.
 *
 * Settings are saved over HTTP, which has no socket to broadcast from, so the
 * owner's screen nudges the room here once the save succeeds. What goes out
 * is read back from the database — never what the nudge claimed — so a
 * member cannot use this to tell everyone a room is called something it is
 * not.
 */
export function attachRoomGateway(io: Server) {
  io.on('connection', (socket: Socket) => {
    const state = socketUser(socket)
    if (!state) return
    const may = roomGuard(socket, state.userId)
    let last = 0

    socket.on('room:changed', async (raw: unknown) => {
      const roomId = await may((raw as { roomId?: unknown } | null)?.roomId)
      const now = Date.now()
      if (!roomId || now - last < 1000) return
      last = now
      try {
        const room = await getRoom(state.userId, roomId)
        io.to(roomId).emit('room:updated', { room })
      } catch {
        /* Gone, or not theirs — nothing to tell anyone. */
      }
    })
  })
}
