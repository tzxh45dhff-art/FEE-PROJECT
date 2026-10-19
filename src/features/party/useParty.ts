import { useCallback, useEffect, useState } from 'react'

import { getSocket } from '@/lib/socket'

/**
 * The room's party game, whichever one is on.
 *
 * The server sends each person their own view of the game — the asker's cards,
 * the drawer's word and unrevealed answers never reach anyone else — so this
 * only ever holds what you are allowed to see, and renders from that.
 */

export type PartyState<V = unknown> = {
  game: string
  label: string
  seq: number
  startedBy: { id: string; name: string }
  /** Server clock at send, and our clock at receipt — for countdowns. */
  serverTime: number
  receivedAt: number
  view: V
}

/** Milliseconds until a server-time deadline, measured on the server's clock. */
export function remaining(party: Pick<PartyState, 'serverTime' | 'receivedAt'>, deadline: number | null) {
  if (!deadline) return 0
  return Math.max(0, deadline - party.serverTime - (Date.now() - party.receivedAt))
}

type Reply = { ok?: boolean; error?: string }

export function useParty<V = unknown>(roomId: string) {
  const [party, setParty] = useState<PartyState<V> | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = getSocket()
    const onState = (raw: { roomId: string; game: string | null } & Partial<PartyState<V>>) => {
      if (raw.roomId !== roomId) return
      setLoaded(true)
      setParty((current) => {
        if (!raw.game) return null
        /* Out-of-order delivery after a reconnect must not wind the game back. */
        if (current && current.game === raw.game && (raw.seq ?? 0) < current.seq) return current
        return { ...(raw as PartyState<V>), receivedAt: Date.now() }
      })
    }
    const open = () => socket.emit('party:open', { roomId })
    socket.on('party:state', onState)
    socket.on('connect', open)
    open()
    return () => {
      socket.off('party:state', onState)
      socket.off('connect', open)
      socket.emit('party:close', { roomId })
    }
  }, [roomId])

  const call = useCallback(
    (event: string, payload: Record<string, unknown>) =>
      new Promise<Reply>((resolve) => {
        setError(null)
        getSocket().emit(event, { roomId, ...payload }, (reply: Reply) => {
          if (reply?.error) setError(reply.error)
          resolve(reply ?? {})
        })
      }),
    [roomId],
  )

  const start = useCallback((game: string, options: unknown) => call('party:start', { game, options }), [call])
  const act = useCallback(
    (action: string, payload: Record<string, unknown> = {}) => call('party:act', { action, payload }),
    [call],
  )
  const dismiss = useCallback(() => call('party:dismiss', {}), [call])
  const join = useCallback(() => call('party:join', {}), [call])

  /* A refusal is worth a few seconds on screen, not forever. */
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 3500)
    return () => clearTimeout(timer)
  }, [error])

  return { party, loaded, error, start, act, dismiss, join }
}
