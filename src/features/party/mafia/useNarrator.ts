import { useEffect, useRef, useState } from 'react'

import { apiUrl } from '@/lib/config'

/**
 * Reads the story aloud — once per line, on the devices that should.
 *
 * The voice is the server's (cached per line). Without it the line is
 * subtitles only. The narrator never talks over a moment the line doesn't
 * belong to: muting, a new line, or the phase moving on stops it at once.
 */
export function useNarrator(
  narration: { id: string; text: string; audio: string | null; ready: boolean } | null,
  { enabled, volume }: { enabled: boolean; volume: number },
) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const playing = useRef<string | null>(null)
  const played = useRef(new Set<string>())
  const [speaking, setSpeaking] = useState(false)

  const id = narration?.id ?? null
  const source = narration?.ready ? narration.audio : null

  /* The line this device should be saying right now — or nothing. */
  useEffect(() => {
    const stop = () => {
      audio.current?.pause()
      audio.current = null
      playing.current = null
      setSpeaking(false)
    }
    if (!enabled || !id) return stop()
    if (playing.current === id) return
    /* A line that belongs to a moment already gone is not reread. */
    if (playing.current) stop()
    if (!source || played.current.has(id)) return
    played.current.add(id)
    playing.current = id
    const element = new Audio(apiUrl(source))
    element.volume = volume
    audio.current = element
    element.onplay = () => setSpeaking(true)
    element.onended = () => {
      if (audio.current === element) setSpeaking(false)
    }
    element.onerror = () => setSpeaking(false)
    void element.play().catch(() => setSpeaking(false))
    /*
     * No server voice: the story stays on screen as subtitles. The browser's
     * own voices were tried and sound robotic — worse than none for a narrator
     * who is meant to carry the mood.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, source, enabled])

  useEffect(() => {
    if (audio.current) audio.current.volume = volume
  }, [volume])

  /* Stop talking when the game closes. */
  useEffect(
    () => () => {
      audio.current?.pause()
    },
    [],
  )

  return { speaking }
}
