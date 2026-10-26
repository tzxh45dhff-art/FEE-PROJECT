import { useEffect, useRef, useSyncExternalStore } from 'react'
import confetti from 'canvas-confetti'

import { music, onSoundSettings, sfx, soundSettings, unlockAudio } from './geoSound'
import type { GeoView } from './types'

export const still = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The game's sound, driven by its state: music that tightens with the clock,
 * a tick for each of the last ten seconds, a hit as the round closes, a
 * countdown before it opens, and a fanfare (and confetti) at the finish.
 */
export function useGeoSound(v: GeoView, clockMs: number, playing: boolean) {
  /* Any tap anywhere wakes the browser's audio. */
  useEffect(() => {
    const wake = () => unlockAudio()
    window.addEventListener('pointerdown', wake)
    return () => window.removeEventListener('pointerdown', wake)
  }, [])

  const settings = useSoundSettings()
  const seconds = Math.ceil(clockMs / 1000)
  const total = v.options.seconds * 1000

  /* The music: on from the countdown through the round, building as time runs out. */
  const live = playing && (v.phase === 'countdown' || v.phase === 'playing')
  useEffect(() => {
    if (live && settings.music) music.start()
    else music.stop()
  }, [live, settings.music])
  useEffect(() => {
    if (v.phase === 'playing') music.setIntensity(1 - clockMs / total)
    else if (v.phase === 'countdown') music.setIntensity(0)
  }, [clockMs, total, v.phase])
  useEffect(() => () => music.stop(), [])

  /* The last ten seconds tick; the countdown counts. */
  const lastSecond = useRef(seconds)
  useEffect(() => {
    if (seconds === lastSecond.current) return
    lastSecond.current = seconds
    if (v.phase === 'playing' && seconds <= 10 && seconds > 0) sfx.tick(seconds <= 5)
    if (v.phase === 'countdown' && seconds >= 1 && seconds <= 3) sfx.count(seconds)
  }, [seconds, v.phase])

  /* Phase changes: go, the closing hit, the finish. */
  const lastPhase = useRef(v.phase)
  useEffect(() => {
    const was = lastPhase.current
    lastPhase.current = v.phase
    if (was === v.phase) return
    if (was === 'countdown' && v.phase === 'playing') sfx.go()
    if (was === 'playing' && (v.phase === 'reveal' || v.phase === 'over')) sfx.hit()
    if (v.phase === 'over' && v.history.length > 0) {
      window.setTimeout(() => {
        sfx.fanfare()
        celebrate(1.4)
      }, was === 'playing' ? 900 : 200)
    }
  }, [v.phase, v.history.length])
}

export function useSoundSettings() {
  return useSyncExternalStore(onSoundSettings, soundSettings, soundSettings)
}

/** Confetti, for the moments that earned it. */
export function celebrate(scale = 1) {
  if (still()) return
  const burst = (x: number) =>
    confetti({ particleCount: Math.round(70 * scale), spread: 70, startVelocity: 42, origin: { x, y: 0.75 }, colors: ['#ef795c', '#f4c96a', '#5cd5c0', '#edf0df'], disableForReducedMotion: true })
  burst(0.3)
  window.setTimeout(() => burst(0.7), 160)
}

