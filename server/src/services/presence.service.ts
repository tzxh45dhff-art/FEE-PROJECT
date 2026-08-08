export type Present = { userId: string; name: string }

/**
 * Who is in which room, right now.
 *
 * Deliberately in memory: presence is only true while a socket is open, so it
 * has no meaning across a restart, and writing it to SQLite would leave ghosts
 * behind after a crash. The tradeoff is that it doesn't survive running more
 * than one server process — that's the point at which this moves to Redis.
 *
 * roomId → userId → { name, sockets }. `sockets` is a count because one person
 * can have the same room open in two tabs.
 */
const rooms = new Map<string, Map<string, { name: string; sockets: number }>>()

export function presenceFor(roomId: string): Present[] {
  const room = rooms.get(roomId)
  if (!room) return []
  return [...room.entries()].map(([userId, entry]) => ({ userId, name: entry.name }))
}

export function addPresence(roomId: string, userId: string, name: string) {
  let room = rooms.get(roomId)
  if (!room) {
    room = new Map()
    rooms.set(roomId, room)
  }

  const existing = room.get(userId)
  if (existing) existing.sockets += 1
  else room.set(userId, { name, sockets: 1 })
}

export function removePresence(roomId: string, userId: string) {
  const room = rooms.get(roomId)
  const entry = room?.get(userId)
  if (!room || !entry) return

  entry.sockets -= 1
  if (entry.sockets <= 0) room.delete(userId)
  if (room.size === 0) rooms.delete(roomId)
}
