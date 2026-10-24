import { useCallback, useEffect, useState } from 'react'

import { getSocket } from '@/lib/socket'
import type { Food, Person, Pet, PetAction, PetEvent, Species } from '@/features/pet/types'

/**
 * The room's pet, as this screen knows it: its state, the last thing anyone
 * did to it, and the last thing anyone said to it.
 */

type Reply = { ok?: boolean; error?: string; reaction?: string; pet?: Pet | null; suggestion?: PetSuggestion; skip?: string }

export type SuggestAction = 'none' | 'games' | 'watch' | 'study' | 'call' | 'feed' | 'play' | 'music'
export type PetSuggestion = { id: string; line: string; action: SuggestAction }
export type SuggestMoment = 'arrived' | 'back' | 'idle' | 'gameover' | 'paused' | 'break'
export type SuggestContext = {
  moment: SuggestMoment
  activity: string
  hour: number
  onCall: boolean
  watching: string | null
  listening: string | null
  result: 'win' | 'lose' | null
}
export type VoiceClip = { id: string; by: Person; blob: Blob }

export function usePet(roomId: string | null) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [event, setEvent] = useState<PetEvent | null>(null)
  const [voice, setVoice] = useState<VoiceClip | null>(null)
  const [adoptedBy, setAdoptedBy] = useState<Person | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) return
    const socket = getSocket()
    setLoaded(false)
    setPet(null)
    const load = () =>
      socket.emit('pet:get', { roomId }, (reply: Reply) => {
        if (reply && 'pet' in reply) setPet(reply.pet ?? null)
        setLoaded(true)
      })
    const onState = (raw: { roomId: string; pet: Pet | null; adoptedBy?: Person | null }) => {
      if (raw.roomId !== roomId) return
      setPet(raw.pet)
      if (raw.adoptedBy) setAdoptedBy(raw.adoptedBy)
      setLoaded(true)
    }
    const onEvent = (raw: PetEvent) => {
      if (raw.roomId === roomId) setEvent(raw)
    }
    const onVoice = (raw: { id: string; roomId: string; by: Person; audio: ArrayBuffer; mime: string }) => {
      if (raw.roomId !== roomId) return
      setVoice({ id: raw.id, by: raw.by, blob: new Blob([raw.audio], { type: raw.mime }) })
    }
    socket.on('pet:state', onState)
    socket.on('pet:event', onEvent)
    socket.on('pet:voice', onVoice)
    socket.on('connect', load)
    load()
    return () => {
      socket.off('pet:state', onState)
      socket.off('pet:event', onEvent)
      socket.off('pet:voice', onVoice)
      socket.off('connect', load)
    }
  }, [roomId])

  /*
   * Walked off: it comes back on its own when its time is up, and every screen
   * should see it walk back in without anyone having to touch anything.
   */
  const awayUntil = pet?.away?.until ?? null
  useEffect(() => {
    if (!roomId || !awayUntil) return
    const timer = window.setTimeout(() => {
      getSocket().emit('pet:get', { roomId }, (reply: Reply) => {
        if (reply && 'pet' in reply) setPet(reply.pet ?? null)
      })
    }, Math.max(0, awayUntil - Date.now()) + 800)
    return () => window.clearTimeout(timer)
  }, [roomId, awayUntil])

  /* An error is a moment, not a state. */
  useEffect(() => {
    if (!error) return
    const timer = window.setTimeout(() => setError(null), 3500)
    return () => window.clearTimeout(timer)
  }, [error])

  const call = useCallback(
    (event: string, payload: Record<string, unknown>) =>
      new Promise<Reply>((resolve) => {
        if (!roomId) return resolve({ error: 'No room' })
        getSocket().emit(event, { roomId, ...payload }, (reply: Reply) => {
          if (reply?.error) setError(reply.error)
          resolve(reply ?? {})
        })
      }),
    [roomId],
  )

  const adopt = useCallback((species: Species, name: string) => call('pet:adopt', { species, name }), [call])
  const act = useCallback((action: PetAction, food?: Food) => call('pet:act', { action, food }), [call])
  const rename = useCallback((name: string) => call('pet:rename', { name }), [call])
  const sendVoice = useCallback(
    async (blob: Blob) => {
      const audio = await blob.arrayBuffer()
      return call('pet:voice', { audio, mime: blob.type || 'audio/webm' })
    },
    [call],
  )

  /* Quiet on purpose: a skipped or failed suggestion is the pet saying nothing, never an error. */
  const suggest = useCallback(
    (context: SuggestContext) =>
      new Promise<PetSuggestion | null>((resolve) => {
        if (!roomId) return resolve(null)
        getSocket()
          .timeout(10_000)
          .emit('pet:suggest', { roomId, ...context }, (err: Error | null, reply: Reply) => resolve(err ? null : (reply?.suggestion ?? null)))
      }),
    [roomId],
  )

  return { pet, loaded, event, voice, adoptedBy, error, adopt, act, rename, sendVoice, suggest }
}
