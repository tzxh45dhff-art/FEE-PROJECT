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

/*
 * How many round trips to take before trusting the clock.
 *
 * The offset from any one exchange is only as good as that exchange was
 * symmetric, and the estimate below assumes the request took exactly half the
 * round trip to arrive. A few more samples buys a better chance that at least
 * one of them went out and came back cleanly.
 */
const PING_SAMPLES = 7
/*
 * And re-measured for the whole session, not just at the start.
 *
 * Measuring once means the reading is whatever the network and the main thread
 * were doing in the first second of the page — which is the worst moment to
 * ask, with scripts still parsing and a player starting up. A single bad
 * reading taken then used to persist for the entire film.
 */
const RESYNC_MS = 30_000

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

    /* Each sample carries the round trip that produced it — the selection
       below needs it, not just the offset it implies. */
    const samples: { offset: number; rtt: number }[] = []
    const measure = () => {
      const sent = performance.timeOrigin + performance.now()
      socket.emit('music:ping', { sent })
    }

    const onPong = ({ sent, serverTime }: { sent: number; serverTime: number }) => {
      const now = performance.timeOrigin + performance.now()
      const rtt = now - sent
      samples.push({ offset: serverTime + rtt / 2 - now, rtt })

      if (samples.length < PING_SAMPLES) {
        setTimeout(measure, 90)
        return
      }

      /*
       * The fastest exchange wins, not the middle one.
       *
       * `rtt / 2` is only right when both legs took the same time; the error
       * in a sample is exactly half the difference between them. A round trip
       * that came back quickly had little room to be delayed in either
       * direction, so it is the least asymmetric reading available.
       *
       * The median is very slightly better when congestion is even, because
       * symmetric errors cancel — but it is far worse when it is not. Against
       * a stall on one leg only, which is what a busy uplink through a tunnel
       * actually looks like, the median lands between the good samples and the
       * stalled ones: measured over thousands of runs, its worst case is about
       * 130ms of error where the fastest sample's is about 15ms. Trading a few
       * milliseconds in the calm case to cap the bad one is the right way
       * round for a room that has to agree on a frame.
       *
       * Neither helps against a path that is *always* slower one way. Nothing
       * measured from this end can see that.
       */
      const best = samples.reduce((a, b) => (b.rtt < a.rtt ? b : a))
      offset.current = best.offset
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
    const resync = setInterval(() => {
      samples.length = 0
      measure()
    }, RESYNC_MS)

    const retry = setInterval(() => {
      if (appliedSeq.current === -1) socket.emit('music:sync-request', { roomId })
    }, 1200)

    return () => {
      disposed = true
      clearInterval(retry)
      clearInterval(resync)
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
