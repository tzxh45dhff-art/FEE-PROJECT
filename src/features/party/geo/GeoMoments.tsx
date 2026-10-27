import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Music, Volume2, VolumeX } from 'lucide-react'

import { cn } from '@/lib/utils'
import { REVEAL_LINE_MS } from './GeoCanvas'
import { setSoundSettings, sfx } from './geoSound'
import { celebrate, still, useSoundSettings } from './useGeoSound'
import { formatDistance } from './types'

/** When the points start counting, and for how long — after the reveal lines land. */
const COUNT_FROM_MS = REVEAL_LINE_MS + 250
const COUNT_FOR_MS = 1_200

/* ── the round intro ──────────────────────────────────────────────────── */

/** "Round 2 of 5", then 3 · 2 · 1, each number punching in. */
export function RoundIntro({ round, of, seconds, label }: { round: number; of: number; seconds: number; label: string }) {
  const n = Math.max(1, Math.min(3, seconds))
  return (
    <div className="geo-countin" role="status" aria-live="polite">
      <motion.div className="geo-countin-card" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
        <span className="geo-countin-kicker">{label}</span>
        <h2>
          Round <b>{round}</b> <span>of {of}</span>
        </h2>
        <div className="geo-countin-count" aria-label={`${n}`}>
          <AnimatePresence mode="popLayout">
            <motion.strong key={n} initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 22 }}>
              {n}
            </motion.strong>
          </AnimatePresence>
        </div>
        <p>Take a good look.</p>
      </motion.div>
    </div>
  )
}

/* ── the reveal ───────────────────────────────────────────────────────── */

/** The distance, popping onto the map when the lines arrive. */
export function DistancePill({ km, round }: { km: number | null | undefined; round: number }) {
  return (
    <motion.div
      key={round}
      className="geo-distance-pill"
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: still() ? 0 : REVEAL_LINE_MS / 1000, type: 'spring', stiffness: 380, damping: 22 }}
    >
      {km == null ? 'No pin this round' : <>{formatDistance(km)} <span>away</span></>}
    </motion.div>
  )
}

/**
 * Points counting up from zero, after the lines land. Only your own row makes
 * sound: a rising tally, then a ding, a chime or a thud — and confetti for a
 * guess within a kilometre.
 */
export function CountUp({ value, round, mine, km }: { value: number; round: number; mine: boolean; km: number | null | undefined }) {
  const [shown, setShown] = useState(still() ? value : 0)
  const played = useRef<number | null>(null)
  useEffect(() => {
    if (still()) return setShown(value)
    setShown(0)
    let raf = 0
    let lastStep = -1
    const begin = performance.now() + COUNT_FROM_MS
    const frame = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - begin) / COUNT_FOR_MS))
      const eased = 1 - (1 - t) ** 3
      setShown(Math.round(value * eased))
      const step = Math.floor(t * 18)
      if (mine && value > 0 && t > 0 && step !== lastStep && t < 1) {
        lastStep = step
        sfx.tally(eased)
      }
      if (t < 1) raf = requestAnimationFrame(frame)
      else if (mine && played.current !== round) {
        played.current = round
        if (value >= 4_000) sfx.ding()
        else if (value >= 1_500) sfx.chime()
        else sfx.thud()
        if (km != null && km < 1) celebrate()
      }
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // Restart only for a new round's result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, value])
  return <>+{shown.toLocaleString()}</>
}

/* ── the switches ─────────────────────────────────────────────────────── */

export function SoundToggles() {
  const settings = useSoundSettings()
  return (
    <div className="geo-sound">
      <button
        type="button"
        aria-pressed={settings.music}
        aria-label={settings.music ? 'Turn music off' : 'Turn music on'}
        title={settings.music ? 'Music on' : 'Music off'}
        onClick={() => setSoundSettings({ music: !settings.music })}
        className={cn(!settings.music && 'off')}
      >
        <Music size={16} />
      </button>
      <button
        type="button"
        aria-pressed={settings.effects}
        aria-label={settings.effects ? 'Turn sound effects off' : 'Turn sound effects on'}
        title={settings.effects ? 'Sound on' : 'Sound off'}
        onClick={() => setSoundSettings({ effects: !settings.effects })}
        className={cn(!settings.effects && 'off')}
      >
        {settings.effects ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  )
}
