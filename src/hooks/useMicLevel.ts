import { useCallback, useEffect, useRef, useState } from 'react'

type MicState = 'off' | 'requesting' | 'live' | 'denied'

/**
 * Your own microphone, metered.
 *
 * This is deliberately local-only: it proves the mic works and drives the
 * button's level ring, but it does not transmit anywhere yet — room audio needs
 * a WebRTC/SFU path that doesn't exist server-side. Keeping it honest means the
 * button reflects a real captured stream rather than miming one.
 */
export function useMicLevel() {
  const [state, setState] = useState<MicState>('off')
  /** 0 → 1, read by the button's ring. Updated via ref-driven rAF, not state. */
  const level = useRef(0)
  const [, force] = useState(0)

  const stream = useRef<MediaStream | null>(null)
  const context = useRef<AudioContext | null>(null)
  const frame = useRef(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current)
    stream.current?.getTracks().forEach((track) => track.stop())
    void context.current?.close()
    stream.current = null
    context.current = null
    level.current = 0
    setState('off')
  }, [])

  const start = useCallback(async () => {
    /* Same browser rule as the call: no mic outside a secure context. Saying
       so beats a bare "denied" the user cannot act on. */
    if (!window.isSecureContext) {
      setState('denied')
      return
    }

    setState('requesting')
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audio = new AudioContext()
      const source = audio.createMediaStreamSource(media)
      const analyser = audio.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)

      const samples = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteTimeDomainData(samples)
        /* RMS around the 128 midpoint — peak alone flickers too hard to look
           like a voice level. */
        let sum = 0
        for (const sample of samples) {
          const centred = (sample - 128) / 128
          sum += centred * centred
        }
        level.current = Math.min(1, Math.sqrt(sum / samples.length) * 3.2)
        frame.current = requestAnimationFrame(tick)
      }

      stream.current = media
      context.current = audio
      frame.current = requestAnimationFrame(tick)
      setState('live')
      /* One re-render so the button can start reading `level` each frame. */
      force((count) => count + 1)
    } catch {
      setState('denied')
    }
  }, [])

  const toggle = useCallback(() => {
    if (state === 'live') stop()
    else if (state !== 'requesting') void start()
  }, [state, start, stop])

  useEffect(() => stop, [stop])

  return { state, level, toggle }
}
