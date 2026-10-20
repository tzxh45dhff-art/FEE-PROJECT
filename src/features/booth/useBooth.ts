import { useCallback, useEffect, useState } from 'react'

import type { Photo } from '@/features/booth/api'
import { getSocket } from '@/lib/socket'

/**
 * The room's photo booth, as this screen sees it: whether someone is counting
 * down (and when the shutter fires, on this clock), and the latest photo
 * anyone saved.
 */

type Person = { id: string; name: string }
export type Countdown = { id: string; by: Person; firesAt: number }

export function useBooth(roomId: string | null) {
  const [countdown, setCountdown] = useState<Countdown | null>(null)
  const [latest, setLatest] = useState<Photo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) return
    const socket = getSocket()
    const onCountdown = (raw: { id: string; roomId: string; by: Person; firesAt: number; serverTime: number }) => {
      if (raw.roomId !== roomId) return
      /* Re-expressed on this machine's clock, whatever it thinks the time is. */
      setCountdown({ id: raw.id, by: raw.by, firesAt: Date.now() + (raw.firesAt - raw.serverTime) })
    }
    const onPhoto = (raw: { roomId: string; photo: Photo }) => {
      if (raw.roomId === roomId) setLatest(raw.photo)
    }
    socket.on('booth:countdown', onCountdown)
    socket.on('photo:new', onPhoto)
    return () => {
      socket.off('booth:countdown', onCountdown)
      socket.off('photo:new', onPhoto)
    }
  }, [roomId])

  /* The countdown clears itself a moment after the flash. */
  useEffect(() => {
    if (!countdown) return
    const timer = window.setTimeout(() => setCountdown(null), Math.max(0, countdown.firesAt - Date.now()) + 900)
    return () => window.clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    if (!error) return
    const timer = window.setTimeout(() => setError(null), 3500)
    return () => window.clearTimeout(timer)
  }, [error])

  const start = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        if (!roomId) return resolve(false)
        getSocket().emit('booth:countdown', { roomId }, (reply: { ok?: boolean; error?: string }) => {
          if (reply?.error) setError(reply.error)
          resolve(!!reply?.ok)
        })
      }),
    [roomId],
  )

  const announce = useCallback((id: string) => roomId && getSocket().emit('photo:shared', { roomId, id }), [roomId])

  return { countdown, latest, error, start, announce }
}
