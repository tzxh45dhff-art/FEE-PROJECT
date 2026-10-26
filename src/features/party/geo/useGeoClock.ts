import { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket'
import type { PartyState } from '../useParty'
import type { GeoView } from './types'

/** Calibrate a monotonic countdown with the fastest ping, independent of device time. */
export function useGeoClock(party: PartyState<GeoView>) {
  const calibrated = useRef<number | null>(null)
  const snapshot = useRef({ serverTime: party.serverTime, deadline: party.view.deadline, at: performance.now() })
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    snapshot.current = { serverTime: party.serverTime, deadline: party.view.deadline, at: performance.now() }
  }, [party])
  useEffect(() => {
    const socket = getSocket()
    const outstanding = new Set<number>()
    let fastest = Infinity
    let followup: ReturnType<typeof setTimeout> | undefined
    let sentCount = 0
    const now = () => performance.timeOrigin + performance.now()
    const measure = () => {
      if (!socket.connected) return
      const sent = now()
      outstanding.add(sent)
      sentCount += 1
      socket.emit('geo:ping', { sent })
    }
    const batch = () => {
      clearTimeout(followup)
      outstanding.clear()
      fastest = Infinity
      sentCount = 0
      measure()
    }
    const pong = ({ sent, serverTime }: { sent: number; serverTime: number }) => {
      if (!outstanding.delete(sent) || !Number.isFinite(serverTime)) return
      const received = now(),
        rtt = received - sent
      if (rtt < fastest) {
        fastest = rtt
        calibrated.current = serverTime + rtt / 2 - received
      }
      if (sentCount < 5) followup = setTimeout(measure, 120)
    }
    socket.on('geo:pong', pong)
    socket.on('connect', batch)
    batch()
    const resync = setInterval(batch, 30_000)
    const tick = () => {
      const s = snapshot.current
      const serverNow =
        calibrated.current === null ? s.serverTime + performance.now() - s.at : now() + calibrated.current
      setRemaining(s.deadline === null ? 0 : Math.max(0, s.deadline - serverNow))
    }
    tick()
    const timer = setInterval(tick, 100)
    return () => {
      clearTimeout(followup)
      clearInterval(resync)
      clearInterval(timer)
      socket.off('geo:pong', pong)
      socket.off('connect', batch)
    }
  }, [])
  return remaining
}
