import { useCallback, useEffect, useRef, useState } from 'react'

import { getSocket } from '@/lib/socket'
import type { QueueItem, WatchSnapshot } from '@/features/watch/types'

/**
 * The room's playback session, as this client sees it.
 *
 * Owns three things the UI should not have to think about:
 *
 * 1. **Clock offset.** Browser clocks are routinely seconds out, and every
 *    correction below is a subtraction against server time. Measured on open
 *    with a few round trips, median of the samples.
 * 2. **Sequence guarding.** Snapshots can arrive out of order on a flaky
 *    connection; anything not newer than what we've applied is dropped.
 * 3. **Resync on reconnect.** A socket that drops and comes back must ask where
 *    the room is now, not resume from its own stale position.
 */

const PING_SAMPLES = 5

export type WatchSessionState = {
  snapshot: WatchSnapshot | null
  queue: QueueItem[]
  /** Server clock minus local clock, in ms. */
  offset: number
  connected: boolean
}

export function useWatchSession(roomId: string | null, open: boolean) {
  const [snapshot, setSnapshot] = useState<WatchSnapshot | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [connected, setConnected] = useState(true)

  /* Refs, not state: these are read inside animation-rate loops and must not
     re-render the stage on every tick. */
  const offset = useRef(0)
  const appliedSeq = useRef(-1)
  const epoch = useRef<number | null>(null)

  useEffect(() => {
    if (!roomId || !open) return

    const socket = getSocket()
    let disposed = false

    /* Median of several round trips — a single sample lands on whatever the
       network was doing that instant, and one bad one skews every correction. */
    const samples: number[] = []
    const measure = () => {
      const sent = performance.timeOrigin + performance.now()
      socket.emit('watch:ping', { sent })
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

    const onState = (incoming: WatchSnapshot) => {
      if (incoming.roomId !== roomId) return

      /*
       * A new epoch means `seq` restarted — the server was restarted, or the
       * session was rebuilt from scratch. Without this the guard below would
       * read every fresh snapshot as ancient and discard it, leaving the stage
       * frozen on state that no longer exists anywhere.
       */
      if (epoch.current !== incoming.epoch) {
        epoch.current = incoming.epoch
        appliedSeq.current = -1
      }

      /* `open` snapshots don't bump seq, so an equal one still applies —
         otherwise the very first paint would have no state at all. */
      if (incoming.seq < appliedSeq.current) return
      appliedSeq.current = incoming.seq
      setSnapshot(incoming)
    }

    const onQueue = ({ roomId: id, items }: { roomId: string; items: QueueItem[] }) => {
      if (id === roomId) setQueue(items)
    }

    const onViewers = ({ roomId: id, viewers }: { roomId: string; viewers: WatchSnapshot['viewers'] }) => {
      if (id !== roomId) return
      setSnapshot((current) => (current ? { ...current, viewers } : current))
    }

    const onConnect = () => {
      if (disposed) return
      setConnected(true)
      /* Re-announce and re-ask. A reconnect means the server has forgotten this
         socket was on the stage, and our own position is now a guess. */
      socket.emit('watch:open', { roomId })
      socket.emit('watch:sync-request', { roomId })
      samples.length = 0
      measure()
    }

    const onDisconnect = () => setConnected(false)

    socket.on('watch:pong', onPong)
    socket.on('watch:state', onState)
    socket.on('watch:queue', onQueue)
    socket.on('watch:viewers', onViewers)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    socket.emit('watch:open', { roomId })
    measure()

    /*
     * Insurance against a lost first snapshot.
     *
     * One dropped `watch:open` used to mean the stage sat on "Syncing…"
     * forever, because nothing else ever asked again. This keeps asking until
     * something arrives, then stops.
     */
    const retry = setInterval(() => {
      if (appliedSeq.current === -1) socket.emit('watch:sync-request', { roomId })
    }, 1200)

    return () => {
      disposed = true
      clearInterval(retry)
      socket.emit('watch:close', { roomId })
      socket.off('watch:pong', onPong)
      socket.off('watch:state', onState)
      socket.off('watch:queue', onQueue)
      socket.off('watch:viewers', onViewers)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      appliedSeq.current = -1
      epoch.current = null
      setSnapshot(null)
    }
  }, [roomId, open])

  /** Where the video should be, right now, in server time. */
  const targetPosition = useCallback(() => {
    if (!snapshot) return 0
    if (!snapshot.playing) return snapshot.position

    const nowOnServer = performance.timeOrigin + performance.now() + offset.current
    const elapsed = (nowOnServer - snapshot.serverTime) / 1000
    const projected = snapshot.position + elapsed * snapshot.rate

    const duration = snapshot.item?.duration
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
