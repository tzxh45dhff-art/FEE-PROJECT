import { useCallback, useEffect, useState } from 'react'

import * as roomsApi from '@/features/rooms/api'
import type { Room, RoomChanges, RoomVisibility } from '@/features/rooms/api'
import { getSocket } from '@/lib/socket'

/**
 * The caller's rooms, plus a `create` that folds the new room into the list
 * without a refetch — the API already returns the created room in full.
 */
export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setRooms(await roomsApi.fetchRooms())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your rooms')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = useCallback(async (input: { name: string; type: string; visibility: RoomVisibility }) => {
      const room = await roomsApi.createRoom(input)
      setRooms((current) => [room, ...current])
      return room
    },
    [],
  )

  /** Join by shared code. Replaces the room if you were already a member. */
  const join = useCallback(async (code: string) => {
    const room = await roomsApi.joinRoomByCode(code)
    setRooms((current) => [room, ...current.filter((entry) => entry.id !== room.id)])
    return room
  }, [])

  /*
   * A room's settings changed — by you, or by its owner while you were in it.
   * Presence keeps its own live list, so that is carried over rather than
   * replaced by the server's snapshot of a moment ago.
   */
  const replace = useCallback((room: Room) => {
    setRooms((current) => current.map((entry) => (entry.id === room.id ? { ...room, online: entry.online } : entry)))
  }, [])

  useEffect(() => {
    const socket = getSocket()
    const onUpdated = (raw: { room: Room }) => raw?.room && replace(raw.room)
    socket.on('room:updated', onUpdated)
    return () => {
      socket.off('room:updated', onUpdated)
    }
  }, [replace])

  /** Save new settings, then tell everyone else in the room. */
  const update = useCallback(
    async (id: string, changes: RoomChanges) => {
      const room = await roomsApi.updateRoom(id, changes)
      replace(room)
      getSocket().emit('room:changed', { roomId: id })
      return room
    },
    [replace],
  )

  /** Patch one room's live member list from a presence event. */
  const setOnline = useCallback((roomId: string, online: string[]) => {
    setRooms((current) =>
      current.map((room) => (room.id === roomId ? { ...room, online } : room)),
    )
  }, [])

  return { rooms, loading, error, reload: load, create, join, update, setOnline }
}
