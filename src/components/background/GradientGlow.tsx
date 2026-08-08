import { motion } from 'framer-motion'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn, type CSSVars } from '@/lib/utils'

type Blob = {
  key: string
  color: string
  className: string
  blur: number
  /** Degrees of hue travel over one cycle — small, so it never reads as a colour cut. */
  hue: number
  min: number
  max: number
  /** Seconds for the hue/opacity loop. */
  cycle: number
  /** Negative delay so the three blobs start out of phase. */
  delay: number
  /** Seconds for the positional drift loop — deliberately unrelated to `cycle`. */
  driftCycle: number
  drift: { x: number[]; y: number[]; scale: number[] }
}

/** One warm, two cool. They overlap around the centre and intensify there. */
const BLOBS: Blob[] = [
  {
    key: 'cool',
    color: 'var(--color-glow-cool)',
    className: 'right-[-16%] top-[-20%] size-[34rem] md:size-[46rem]',
    blur: 110,
    hue: 26,
    min: 0.4,
    max: 0.72,
    cycle: 17,
    delay: -3,
    driftCycle: 24,
    drift: { x: [0, -70, 30, 0], y: [0, 50, -30, 0], scale: [1, 1.09, 0.96, 1] },
  },
  {
    key: 'warm',
    color: 'var(--color-glow-warm)',
    className: 'bottom-[-24%] left-[-18%] size-[30rem] md:size-[42rem]',
    blur: 120,
    hue: -20,
    min: 0.28,
    max: 0.54,
    cycle: 13,
    delay: -6,
    driftCycle: 29,
    drift: { x: [0, 80, -25, 0], y: [0, -55, 25, 0], scale: [1, 0.94, 1.08, 1] },
  },
  {
    key: 'violet',
    color: 'var(--color-glow-violet)',
    className: 'left-[34%] top-[24%] size-[24rem] md:size-[32rem]',
    blur: 130,
    hue: 34,
    min: 0.2,
    max: 0.42,
    cycle: 20,
    delay: -11,
    driftCycle: 34,
    drift: { x: [0, -50, 60, 0], y: [0, 40, -20, 0], scale: [1, 1.12, 0.98, 1] },
  },
]

type GradientGlowProps = {
  /** `soft` dials the whole layer back for secondary sections. */
  intensity?: 'hero' | 'soft'
  className?: string
}

/**
 * Ambient light: large blurred radial blobs that drift and shift hue on
 * independent loops. Should read as light in a room, not as a light show.
 */
export function GradientGlow({ intensity = 'hero', className }: GradientGlowProps) {
  const reduced = usePrefersReducedMotion()
  const scale = intensity === 'soft' ? 0.6 : 1

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {BLOBS.map((blob) => (
        <motion.div
          key={blob.key}
          className={cn('absolute', blob.className)}
          animate={reduced ? undefined : blob.drift}
          transition={{
            duration: blob.driftCycle,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.33, 0.66, 1],
          }}
        >
          <div
            className="size-full animate-glow-shift rounded-full will-change-[filter,opacity]"
            style={
              {
                backgroundImage: `radial-gradient(circle at center, ${blob.color}, transparent 68%)`,
                /* Base values double as the static reduced-motion state. */
                filter: `blur(${blob.blur}px)`,
                opacity: blob.min * scale,
                animationDelay: `${blob.delay}s`,
                '--glow-duration': `${blob.cycle}s`,
                '--glow-blur': `${blob.blur}px`,
                '--glow-hue': `${blob.hue}deg`,
                '--glow-min': blob.min * scale,
                '--glow-max': blob.max * scale,
              } as CSSVars
            }
          />
        </motion.div>
      ))}
    </div>
  )
}
