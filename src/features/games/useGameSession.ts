import { useCallback, useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket'
import type { GameSnapshot } from './types'

export function useGameSession(roomId: string | null, open: boolean) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const latest = useRef<GameSnapshot | null>(null)
  useEffect(() => {
    if (!roomId || !open) return
    const socket = getSocket()
    let active = true
    const onState = (incoming: GameSnapshot | { roomId: string; cleared: true }) => {
      if (!incoming || incoming.roomId !== roomId) return
      if ('cleared' in incoming) { latest.current = null; setSnapshot(null); return }
      const previous = latest.current
      if (previous && incoming.epoch === previous.epoch && incoming.seq < previous.seq) return
      const next = { ...incoming, receivedAt: Date.now() }
      latest.current = next
      setSnapshot(next)
      setError(null)
    }
    const onConnect = () => {
      setConnected(true)
      socket.emit('game:open', { roomId }, (result: { error?: string }) => {
        if (active && result?.error) setError(result.error)
      })
    }
    const onDisconnect = () => setConnected(false)
    socket.on('game:state', onState)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    setConnected(socket.connected)
    if (socket.connected) onConnect()
    return () => {
      active = false
      socket.emit('game:close', { roomId })
      socket.off('game:state', onState)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      latest.current = null
      setSnapshot(null)
    }
  }, [roomId, open])
  const send = useCallback(async (event: string, payload: Record<string, unknown> = {}): Promise<{ error?: string }> => {
    const socket = getSocket()
    if (!roomId || !socket.connected) {
      const error = 'Connection lost. Your desk will resume when you reconnect.'
      setError(error)
      return { error }
    }
    return new Promise(resolve => {
      socket.timeout(5000).emit(event, { roomId, epoch: latest.current?.epoch, seq: latest.current?.seq, ...payload }, (err: Error | null, result: { error?: string } = {}) => {
        const error = err ? 'No reply from the desk. Check your connection.' : result.error
        setError(error ?? null)
        resolve(error ? { error } : {})
      })
    })
  }, [roomId])
  return { snapshot, connected, error, send }
}
