import { useEffect } from 'react'
import { io, type Socket } from 'socket.io-client'

type PresenceEvent = { roomId: string; present: { userId: string; name: string }[] }

let socket: Socket | null = null

/**
 * One socket for the whole tab, opened lazily. Socket.IO multiplexes rooms over
 * a single connection, so opening one per component would be waste.
 *
 * The handshake carries the session cookie automatically — same auth as REST.
 */
function getSocket() {
  if (!socket) socket = io({ path: '/socket.io', withCredentials: true })
  return socket
}

/**
 * Joins every given room and reports who is in them, live.
 *
 * Joining is what puts *you* in the presence list too, so this is both a read
 * and a write — leaving the page removes you on disconnect.
 */
export function usePresence(roomIds: string[], onUpdate: (roomId: string, online: string[]) => void) {
  /* Depend on the joined ids, not the array identity — a re-render that
     produces an equal-but-new array must not re-join every room. */
  const key = roomIds.join(',')

  useEffect(() => {
    if (!key) return

    const ids = key.split(',')
    const connection = getSocket()

    const handleUpdate = (event: PresenceEvent) => {
      onUpdate(
        event.roomId,
        event.present.map((person) => person.userId),
      )
    }

    connection.on('presence:update', handleUpdate)
    for (const roomId of ids) connection.emit('room:join', { roomId })

    return () => {
      connection.off('presence:update', handleUpdate)
      for (const roomId of ids) connection.emit('room:leave', { roomId })
    }
    // `onUpdate` is a stable useCallback from useRooms.
  }, [key, onUpdate])
}
