import { useCallback, useEffect, useRef, useState } from 'react'

import { getSocket } from '@/lib/socket'

type Person = { id: string; name: string }

export type ReactionEvent = { id: string; from: Person; reaction: string; at: number }

export type Moment = {
  id: string
  itemId: string | null
  title: string
  position: number
  emoji: string
  note: string
  createdAt: string
  createdBy: Person
}

/** How long a reaction stays on screen, floating up. */
const REACTION_MS = 3200

/**
 * Reactions and pinned moments for whatever the room is watching.
 *
 * Moments are loaded for the film on screen and kept live: anyone pinning one
 * makes it appear for everybody immediately, and the latest arrival is exposed
 * separately so the stage can announce it ("Rohan pinned 😭 at 1:02:13").
 */
export function useWatchFun(roomId: string, itemId: string | null) {
  const [reactions, setReactions] = useState<ReactionEvent[]>([])
  const [moments, setMoments] = useState<Moment[]>([])
  const [arrival, setArrival] = useState<Moment | null>(null)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const socket = getSocket()
    const onReact = (raw: ReactionEvent & { roomId: string }) => {
      if (raw.roomId !== roomId) return
      setReactions((current) => [...current.slice(-29), raw])
      const timer = setTimeout(() => {
        timers.current.delete(timer)
        setReactions((current) => current.filter((r) => r.id !== raw.id))
      }, REACTION_MS)
      timers.current.add(timer)
    }
    const onAdded = (raw: { roomId: string; moment: Moment }) => {
      if (raw.roomId !== roomId || raw.moment.itemId !== itemId) return
      setMoments((current) =>
        current.some((m) => m.id === raw.moment.id)
          ? current
          : [...current, raw.moment].sort((a, b) => a.position - b.position),
      )
      setArrival(raw.moment)
    }
    const onRemoved = (raw: { roomId: string; momentId: string }) => {
      if (raw.roomId !== roomId) return
      setMoments((current) => current.filter((m) => m.id !== raw.momentId))
    }
    socket.on('fun:react', onReact)
    socket.on('moment:added', onAdded)
    socket.on('moment:removed', onRemoved)
    const live = timers.current
    return () => {
      socket.off('fun:react', onReact)
      socket.off('moment:added', onAdded)
      socket.off('moment:removed', onRemoved)
      live.forEach(clearTimeout)
      live.clear()
    }
  }, [roomId, itemId])

  /* A different film means a different set of moments. */
  useEffect(() => {
    setMoments([])
    setArrival(null)
    if (!itemId) return
    let current = true
    getSocket().emit('moment:list', { roomId, itemId }, (reply: { ok: boolean; moments: Moment[] }) => {
      if (current && reply?.ok) setMoments(reply.moments)
    })
    return () => {
      current = false
    }
  }, [roomId, itemId])

  const react = useCallback((reaction: string) => getSocket().emit('fun:react', { roomId, reaction }), [roomId])

  const pin = useCallback(
    (input: { title: string; position: number; emoji: string; note: string }) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        getSocket().emit('moment:add', { roomId, itemId, ...input }, (reply: { ok: boolean; error?: string }) =>
          resolve(reply ?? { ok: false }),
        )
      }),
    [roomId, itemId],
  )

  const remove = useCallback(
    (momentId: string) => getSocket().emit('moment:remove', { roomId, momentId }),
    [roomId],
  )

  return { reactions, moments, arrival, dismissArrival: () => setArrival(null), react, pin, remove }
}
