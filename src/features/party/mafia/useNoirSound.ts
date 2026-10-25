import { useCallback, useEffect, useState } from 'react'

/**
 * A few short stings for the big moments — a low piano chord at dawn, a drum
 * for the verdict, a soft tick as the clock runs out — made in the browser
 * from oscillators. No background loop: synthesised rain and crackle were
 * tried and on real speakers they read as static, not weather.
 */

type Mood = 'quiet' | 'day' | 'night'

let shared: AudioContext | null = null
function context() {
  if (!shared && typeof AudioContext !== 'undefined') shared = new AudioContext()
  return shared
}

export function useNoirSound(_mood: Mood, enabled: boolean) {
  const [unlocked, setUnlocked] = useState(false)

  /* Browsers start audio only from a gesture: the first tap anywhere in the game. */
  useEffect(() => {
    const unlock = () => {
      const ctx = context()
      if (!ctx) return
      void ctx.resume().then(() => setUnlocked(true))
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  /* Silence while hidden: nobody wants rain from a background tab. */
  useEffect(() => {
    const onVisibility = () => {
      const ctx = context()
      if (!ctx) return
      if (document.hidden) void ctx.suspend()
      else if (enabled) void ctx.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [enabled])

  /** A short musical cue: a low piano chord at dawn, a drum for a verdict, a tick near the end. */
  const sting = useCallback(
    (kind: 'dawn' | 'verdict' | 'tick' | 'deal') => {
      const ctx = context()
      if (!ctx || !enabled || ctx.state !== 'running') return
      const now = ctx.currentTime
      const out = ctx.createGain()
      out.connect(ctx.destination)
      const tone = (freq: number, type: OscillatorType, start: number, length: number, level: number) => {
        const osc = ctx.createOscillator()
        const env = ctx.createGain()
        osc.type = type
        osc.frequency.value = freq
        env.gain.setValueAtTime(0, now + start)
        env.gain.linearRampToValueAtTime(level, now + start + 0.01)
        env.gain.exponentialRampToValueAtTime(0.0001, now + start + length)
        osc.connect(env).connect(out)
        osc.start(now + start)
        osc.stop(now + start + length + 0.05)
      }
      if (kind === 'dawn') [146.8, 174.6, 220, 261.6].forEach((f, i) => tone(f, 'triangle', i * 0.06, 2.6, 0.08))
      if (kind === 'verdict') {
        tone(55, 'sine', 0, 1.4, 0.5)
        tone(110, 'triangle', 0.02, 0.6, 0.12)
      }
      if (kind === 'deal') [392, 523.3].forEach((f, i) => tone(f, 'triangle', i * 0.09, 0.5, 0.06))
      if (kind === 'tick') tone(1800, 'square', 0, 0.04, 0.02)
    },
    [enabled],
  )

  return { sting, unlocked }
}
