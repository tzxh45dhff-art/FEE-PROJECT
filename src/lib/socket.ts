import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

/**
 * One socket for the whole tab, opened lazily.
 *
 * Socket.IO multiplexes rooms and events over a single connection, so presence
 * and watch share this rather than opening one each — and because they share
 * it, the server can treat "joined to the room" as the permission for both.
 *
 * The handshake carries the session cookie automatically — same auth as REST.
 */
export function getSocket() {
  if (!socket) socket = io({ path: '/socket.io', withCredentials: true })
  return socket
}
