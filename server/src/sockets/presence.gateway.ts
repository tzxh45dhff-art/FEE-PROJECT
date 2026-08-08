import * as cookie from 'cookie'
import { Server, type Socket } from 'socket.io'
import type { Server as HttpServer } from 'node:http'

import { SESSION_COOKIE } from '../config/env.js'
import * as userModel from '../models/user.model.js'
import { addPresence, presenceFor, removePresence } from '../services/presence.service.js'
import { assertMembership } from '../services/room.service.js'
import { readSession } from '../services/token.service.js'

type SocketState = { userId: string; name: string; joined: Set<string> }
const state = new WeakMap<Socket, SocketState>()

function roomIdFrom(raw: unknown): string | null {
  if (typeof raw !== 'object' || raw === null) return null
  const value = (raw as { roomId?: unknown }).roomId
  return typeof value === 'string' ? value : null
}

/** Real-time presence. Who is in a room, updated the moment it changes. */
export function attachPresenceGateway(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    // Same-origin in dev through the Vite proxy, so no CORS config is needed.
    serveClient: false,
  })

  /*
   * The handshake carries the same httpOnly session cookie as the REST API,
   * so there is no second auth mechanism to keep in step.
   */
  io.use(async (socket, next) => {
    const header = socket.handshake.headers.cookie
    const token = header ? cookie.parse(header)[SESSION_COOKIE] : undefined
    const userId = readSession(token)
    if (!userId) return next(new Error('Not signed in'))

    const user = await userModel.findById(userId)
    if (!user) return next(new Error('Not signed in'))

    state.set(socket, { userId: user.id, name: user.name, joined: new Set() })
    next()
  })

  io.on('connection', (socket) => {
    const self = state.get(socket)!

    const broadcast = (roomId: string) => {
      io.to(roomId).emit('presence:update', { roomId, present: presenceFor(roomId) })
    }

    socket.on('room:join', async (raw: unknown) => {
      const roomId = roomIdFrom(raw)
      if (!roomId || self.joined.has(roomId)) return

      try {
        // Presence is membership-gated, exactly like the REST route.
        await assertMembership(self.userId, roomId)
      } catch {
        socket.emit('room:error', { roomId, error: 'You are not in this room' })
        return
      }

      self.joined.add(roomId)
      socket.join(roomId)
      addPresence(roomId, self.userId, self.name)
      broadcast(roomId)
    })

    socket.on('room:leave', (raw: unknown) => {
      const roomId = roomIdFrom(raw)
      if (!roomId || !self.joined.has(roomId)) return

      self.joined.delete(roomId)
      socket.leave(roomId)
      removePresence(roomId, self.userId)
      broadcast(roomId)
    })

    socket.on('disconnect', () => {
      for (const roomId of self.joined) {
        removePresence(roomId, self.userId)
        broadcast(roomId)
      }
      self.joined.clear()
    })
  })

  return io
}
