import * as cookie from 'cookie'
import { Server, type Socket } from 'socket.io'
import type { Server as HttpServer } from 'node:http'

import { SESSION_COOKIE } from '../config/env.js'
import * as userModel from '../models/user.model.js'
import {
  addPresence,
  dropSocket,
  presenceFor,
  removePresence,
  setCharacter,
} from '../services/presence.service.js'
import { assertMembership } from '../services/room.service.js'
import { readSession } from '../services/token.service.js'

type SocketState = { userId: string; name: string; joined: Set<string> }
const state = new WeakMap<Socket, SocketState>()

/**
 * The authenticated user behind a socket.
 *
 * Exported so other gateways can register their own handlers on the same
 * connection without repeating the handshake — the auth middleware here runs
 * before any `connection` listener, so this is populated by the time they see
 * the socket.
 */
export function socketUser(socket: Socket) {
  return state.get(socket)
}

function roomIdFrom(raw: unknown): string | null {
  if (typeof raw !== 'object' || raw === null) return null
  const value = (raw as { roomId?: unknown }).roomId
  return typeof value === 'string' ? value : null
}

function characterIdFrom(raw: unknown): string | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined
  const value = (raw as { characterId?: unknown }).characterId
  return typeof value === 'string' && value.length <= 80 ? value : undefined
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

    /*
     * Join and leave are *intents*, reconciled toward a desired state.
     *
     * They cannot be handled as immediate commands, because the membership
     * check is async and React fires join → leave → join on mount. Handling
     * each in isolation loses whichever one lands mid-flight: guarding drops
     * the final join, not guarding double-registers. Recording what the client
     * last asked for and converging on it is the only version that ends in the
     * right place regardless of ordering or how many arrive at once.
     */
    const desired = new Map<string, boolean>()
    const settling = new Set<string>()
    /** Last character this socket reported, replayed on (re)join. */
    let character: string | undefined

    const reconcile = async (roomId: string) => {
      if (settling.has(roomId)) return
      settling.add(roomId)

      try {
        /* Loops because the desired state can change while we await below;
           each pass re-reads it, so the last intent is the one that sticks. */
        for (;;) {
          const want = desired.get(roomId) ?? false
          const have = self.joined.has(roomId)
          if (want === have) return

          if (!want) {
            self.joined.delete(roomId)
            socket.leave(roomId)
            removePresence(roomId, socket.id)
            broadcast(roomId)
            continue
          }

          try {
            // Presence is membership-gated, exactly like the REST route.
            await assertMembership(self.userId, roomId)
          } catch {
            socket.emit('room:error', { roomId, error: 'You are not in this room' })
            desired.set(roomId, false)
            return
          }

          // They may have left while that was in flight.
          if (!(desired.get(roomId) ?? false)) continue

          self.joined.add(roomId)
          socket.join(roomId)
          addPresence(roomId, socket.id, self.userId, self.name, character)
          broadcast(roomId)
        }
      } finally {
        settling.delete(roomId)
      }
    }

    socket.on('room:join', (raw: unknown) => {
      const roomId = roomIdFrom(raw)
      if (!roomId) return
      /* Carried on the join so a late arrival is drawn correctly the first
         time, rather than popping from a fallback to their real character. */
      character = characterIdFrom(raw) ?? character
      desired.set(roomId, true)
      void reconcile(roomId)
    })

    socket.on('presence:character', (raw: unknown) => {
      const roomId = roomIdFrom(raw)
      if (!roomId) return
      character = characterIdFrom(raw)
      if (setCharacter(roomId, socket.id, character)) broadcast(roomId)
    })

    socket.on('room:leave', (raw: unknown) => {
      const roomId = roomIdFrom(raw)
      if (!roomId) return
      desired.set(roomId, false)
      void reconcile(roomId)
    })

    socket.on('disconnect', () => {
      /* Swept by socket id rather than by what this connection *believed* it
         had joined, so a room it never finished leaving still gets cleaned. */
      for (const roomId of dropSocket(socket.id)) broadcast(roomId)
      self.joined.clear()
    })
  })

  return io
}
