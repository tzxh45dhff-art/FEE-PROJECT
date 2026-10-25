import { useEffect, useState } from 'react'

import { characterThumbnail } from '@/features/dashboard/hub/thumbnail'
import type { Character } from '@/lib/characters'

/* ── who is talking ───────────────────────────────────────────────────── */

let listening: AudioContext | null = null

/**
 * Whether a stream is making sound right now — for the brass ring around a
 * speaker. One shared audio context and a slow poll (not every frame): a
 * dozen seats watching a dozen streams must stay cheap on a phone.
 */
export function useSpeaking(stream: MediaStream | null, enabled = true) {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => {
    if (!stream || !enabled || !stream.getAudioTracks().length || typeof AudioContext === 'undefined') return
    listening ??= new AudioContext()
    const ctx = listening
    let source: MediaStreamAudioSourceNode
    try {
      source = ctx.createMediaStreamSource(stream)
    } catch {
      return
    }
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    const samples = new Uint8Array(analyser.fftSize)
    const timer = window.setInterval(() => {
      if (ctx.state === 'suspended') void ctx.resume()
      analyser.getByteTimeDomainData(samples)
      let peak = 0
      for (const s of samples) peak = Math.max(peak, Math.abs(s - 128))
      setSpeaking(peak > 10)
    }, 160)
    return () => {
      window.clearInterval(timer)
      source.disconnect()
      setSpeaking(false)
    }
  }, [stream, enabled])
  return speaking
}

/* ── a face for everyone ──────────────────────────────────────────────── */

export function usePortrait(character: Character | undefined) {
  const [src, setSrc] = useState<string | null>(character?.png ?? null)
  useEffect(() => {
    if (character?.png) return setSrc(character.png)
    if (!character?.glb) return setSrc(null)
    let live = true
    void characterThumbnail(character.glb).then((url) => live && setSrc(url))
    return () => {
      live = false
    }
  }, [character?.png, character?.glb])
  return src
}

