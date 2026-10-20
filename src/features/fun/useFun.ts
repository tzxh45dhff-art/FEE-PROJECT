import { useCallback, useEffect, useRef, useState } from 'react'

import { getSocket } from '@/lib/socket'

/**
 * The room's live fun: emotes, things being thrown, toys being played.
 *
 * Events arrive from the server (everyone's, including your own — nothing is
 * drawn until the room has seen it, so you and the person you are with watch
 * exactly the same thing) and are kept just long enough to animate, then
 * dropped. There is nothing to load and nothing to persist.
 */

type Person = { id: string; name: string }

export type EmoteEvent = { kind: 'emote'; id: string; from: Person; emote: string; at: number }
export type ThrowEvent = { kind: 'throw'; id: string; from: Person; to: Person; item: string; at: number }
export type ToyEvent = { kind: 'toy'; id: string; from: Person; at: number } & (
  | { toy: 'dice'; values: number[] }
  | { toy: 'coin'; side: 'heads' | 'tails' }
  | { toy: 'bottle'; target: Person; turns: number }
  | { toy: 'fortune'; text: string }
  | { toy: 'eightball'; question: string; text: string }
)
export type FunEvent = EmoteEvent | ThrowEvent | ToyEvent

/** How long each kind stays on screen before it is dropped. */
const LIFETIME: Record<FunEvent['kind'], number> = {
  emote: 2600,
  throw: 3200,
  toy: 7000,
}

/** Enough to stay lively, few enough that a burst never becomes a wall. */
const MAX_LIVE = 40

export function useFun(roomId: string | null) {
  const [events, setEvents] = useState<FunEvent[]>([])
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  const add = useCallback((event: FunEvent) => {
    setEvents((current) => [...current.slice(-(MAX_LIVE - 1)), event])
    const timer = setTimeout(() => {
      timers.current.delete(timer)
      setEvents((current) => current.filter((e) => e.id !== event.id))
    }, LIFETIME[event.kind])
    timers.current.add(timer)
  }, [])

  useEffect(() => {
    if (!roomId) return
    const socket = getSocket()
    const mine = (raw: { roomId?: string }) => raw?.roomId === roomId

    const onEmote = (raw: Omit<EmoteEvent, 'kind'> & { roomId: string }) => mine(raw) && add({ ...raw, kind: 'emote' })
    const onThrow = (raw: Omit<ThrowEvent, 'kind'> & { roomId: string }) => mine(raw) && add({ ...raw, kind: 'throw' })
    /* The server's payload is the toy's own union minus `kind`; the shape is
       its contract, so it is labelled here rather than re-validated. */
    const onToy = (raw: Record<string, unknown> & { roomId: string }) =>
      mine(raw) && add({ ...raw, kind: 'toy' } as unknown as ToyEvent)

    socket.on('fun:emote', onEmote)
    socket.on('fun:throw', onThrow)
    socket.on('fun:toy', onToy)
    return () => {
      socket.off('fun:emote', onEmote)
      socket.off('fun:throw', onThrow)
      socket.off('fun:toy', onToy)
    }
  }, [roomId, add])

  /* Switching rooms clears whatever was mid-flight in the old one. */
  useEffect(() => {
    setEvents([])
    const live = timers.current
    return () => {
      live.forEach(clearTimeout)
      live.clear()
    }
  }, [roomId])

  const emote = useCallback(
    (id: string) => roomId && getSocket().emit('fun:emote', { roomId, emote: id }),
    [roomId],
  )
  const throwAt = useCallback(
    (to: string, item: string) => roomId && getSocket().emit('fun:throw', { roomId, to, item }),
    [roomId],
  )
  const play = useCallback(
    (toy: string, extra: Record<string, unknown> = {}) =>
      roomId && getSocket().emit('fun:toy', { roomId, toy, ...extra }),
    [roomId],
  )

  return { events, emote, throwAt, play }
}
