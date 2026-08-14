import { useCallback, useEffect, useRef, useState } from 'react'

import { getSocket } from '@/lib/socket'
import type { MusicSnapshot, QueuedTrack } from '@/features/music/types'

/**
 * The room's listening session, as this client sees it.
 *
 * The same three responsibilities as the watch session — clock offset,
 * sequence guarding, resync on reconnect — because they are properties of
 * synchronising anything over a socket, not of video specifically. See
 * `useWatchSession` for why each one exists; this is that machinery pointed at
 * music, with its own room membership so the two never share a position.
 */

const PING_SAMPLES = 5

export function useMusicSession(roomId: string | null, open: boolean) {
  const [snapshot, setSnapshot] = useState<MusicSnapshot | null>(null)
  const [queue, setQueue] = useState<QueuedTrack[]>([])
  const [connected, setConnected] = useState(true)

  /* Refs, not state: read inside animation-rate loops, and re-rendering the
     page on every tick would fight the visualiser for frames. */
  const offset = useRef(0)
  const appliedSeq = useRef(-1)
  const epoch = useRef<number | null>(null)

  useEffect(() => {
    if (!roomId || !open) return

    const socket = getSocket()
    let disposed = false

    const samples: number[] = []
    const measure = () => {
      const sent = performance.timeOrigin + performance.now()
      socket.emit('music:ping', { sent })
    }

    const onPong = ({ sent, serverTime }: { sent: number; serverTime: number }) => {
      const now = performance.timeOrigin + performance.now()
      const rtt = now - sent
      samples.push(serverTime + rtt / 2 - now)

      if (samples.length < PING_SAMPLES) {
        setTimeout(measure, 120)
      } else {
        const sorted = [...samples].sort((a, b) => a - b)
        offset.current = sorted[Math.floor(sorted.length / 2)] ?? 0
      }
    }

    const onState = (incoming: MusicSnapshot) => {
      if (incoming.roomId !== roomId) return

      if (epoch.current !== incoming.epoch) {
        epoch.current = incoming.epoch
        appliedSeq.current = -1
      }

      if (incoming.seq < appliedSeq.current) return
      appliedSeq.current = incoming.seq
      setSnapshot(incoming)
    }

    const onQueue = ({ roomId: id, items }: { roomId: string; items: QueuedTrack[] }) => {
      if (id === roomId) setQueue(items)
    }

    const onListeners = ({
      roomId: id,
      listeners,
    }: {
      roomId: string
      listeners: MusicSnapshot['listeners']
    }) => {
      if (id !== roomId) return
      setSnapshot((current) => (current ? { ...current, listeners } : current))
    }

    const onConnect = () => {
      if (disposed) return
      setConnected(true)
      socket.emit('music:open', { roomId })
      socket.emit('music:sync-request', { roomId })
      samples.length = 0
      measure()
    }

    const onDisconnect = () => setConnected(false)

    socket.on('music:pong', onPong)
    socket.on('music:state', onState)
    socket.on('music:queue', onQueue)
    socket.on('music:listeners', onListeners)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    socket.emit('music:open', { roomId })
    measure()

    /* Insurance against a lost first snapshot — keeps asking until something
       arrives, then stops. */
    const retry = setInterval(() => {
      if (appliedSeq.current === -1) socket.emit('music:sync-request', { roomId })
    }, 1200)

    return () => {
      disposed = true
      clearInterval(retry)
      socket.emit('music:close', { roomId })
      socket.off('music:pong', onPong)
      socket.off('music:state', onState)
      socket.off('music:queue', onQueue)
      socket.off('music:listeners', onListeners)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      appliedSeq.current = -1
      epoch.current = null
      setSnapshot(null)
    }
  }, [roomId, open])

  /** Where the track should be, right now, in server time. */
  const targetPosition = useCallback(() => {
    if (!snapshot) return 0
    if (!snapshot.playing) return snapshot.position

    const nowOnServer = performance.timeOrigin + performance.now() + offset.current
    const elapsed = (nowOnServer - snapshot.serverTime) / 1000
    const projected = snapshot.position + elapsed

    const duration = snapshot.track?.duration
    return duration != null ? Math.min(projected, duration) : projected
  }, [snapshot])

  const send = useCallback(
    (event: string, payload: Record<string, unknown> = {}) => {
      if (!roomId) return
      getSocket().emit(event, { roomId, ...payload })
    },
    [roomId],
  )

  return { snapshot, queue, setQueue, connected, offset, targetPosition, send }
}
