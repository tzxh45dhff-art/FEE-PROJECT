import { Suspense, lazy, type ReactNode } from 'react'
import { motion, type MotionStyle, type TargetAndTransition } from 'framer-motion'

import { ModelBoundary } from '@/components/background/ModelBoundary'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { hasModels, modelUrl } from '@/lib/models'
import { cn, type CSSVars } from '@/lib/utils'

/* Only reached when a `.glb` exists, so three.js stays out of the main bundle. */
const ModelObject = lazy(() => import('@/components/background/ModelObject'))

/* ───────────────────────────────────────────────────────────────
   Drift wrapper — every object gets its own duration, delay and
   path so the group never reads as a synced carousel.
   ─────────────────────────────────────────────────────────────── */

type DrifterProps = {
  className?: string
  style?: MotionStyle
  duration: number
  delay?: number
  drift: TargetAndTransition
  still: boolean
  children: ReactNode
}

function Drifter({ className, style, duration, delay = 0, drift, still, children }: DrifterProps) {
  return (
    <motion.div
      className={cn('absolute', className)}
      style={style}
      animate={still ? undefined : drift}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   The objects.

   Each one is a different material *and* a different form, so they
   read as six things rather than six frosted blobs:

     orb    frosted sphere, brightest, internal orbits
     vinyl  black lacquer disc with a coloured label
     play   the most solid and opaque — it's the primary action
     code   thin cool-tinted plate, squared off
     dice   warm frosted cube with real thickness
     chat   thinnest and clearest, a sharp-cornered shard
   ─────────────────────────────────────────────────────────────── */

/** The room itself. The only sphere, and the only object with interior motion. */
function GlassOrb() {
  return (
    <div className="relative size-full [perspective:700px]">
      <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-signal)_16%,transparent),transparent_68%)] blur-2xl" />

      <div
        className="glass absolute inset-0 overflow-hidden rounded-full ring-1 ring-inset ring-white/20"
        style={{ '--glass-fill': '14%' } as CSSVars}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(110%_110%_at_28%_18%,rgb(255_255_255/0.58),rgb(255_255_255/0.09)_38%,transparent_58%)]" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(70%_70%_at_78%_88%,color-mix(in_oklab,var(--color-signal)_20%,transparent),transparent_60%)]" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(80%_80%_at_62%_72%,rgb(0_0_0/0.38),transparent_58%)]" />
      </div>

      <div className="absolute inset-[10%] [transform:rotateX(66deg)]">
        <div
          className="relative size-full animate-orbit rounded-full border border-white/25"
          style={{ '--orbit-duration': '13s' } as CSSVars}
        >
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_14px_3px_color-mix(in_oklab,var(--color-signal)_55%,transparent)]" />
        </div>
      </div>

      <div className="absolute inset-[22%] [transform:rotateX(-56deg)_rotateZ(22deg)]">
        <div
          className="relative size-full animate-orbit rounded-full border border-white/18"
          style={{ '--orbit-duration': '21s', animationDirection: 'reverse' } as CSSVars}
        >
          <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/75" />
        </div>
      </div>

      <div className="absolute inset-[34%]">
        <div
          className="relative size-full animate-orbit rounded-full border border-white/14"
          style={{ '--orbit-duration': '9s' } as CSSVars}
        >
          <span className="absolute left-1/2 top-0 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45" />
        </div>
      </div>
    </div>
  )
}

/** Music. Black lacquer, not frost — the one dark object in the set. */
function VinylRecord() {
  return (
    <div className="glass-obsidian relative size-full animate-spin-slow overflow-hidden rounded-full">
      {/* Grooves */}
      {[10, 17, 24, 31].map((inset) => (
        <div
          key={inset}
          className="absolute rounded-full border border-white/[0.07]"
          style={{ inset: `${inset}%` }}
        />
      ))}
      {/* Light sweep across the lacquer */}
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_130deg,rgb(255_255_255/0.2),transparent_16%,transparent_46%,rgb(255_255_255/0.12)_54%,transparent_84%)]" />
      {/* Paper label */}
      <div className="absolute inset-[37%] rounded-full bg-[linear-gradient(145deg,#e8a83f,#8a1c30)] shadow-[0_0_0_1px_rgb(0_0_0/0.4)]" />
      <div className="absolute inset-[47.5%] rounded-full bg-void ring-1 ring-white/20" />
    </div>
  )
}

/** Watch Party. The most opaque and solid object — it reads as the button it is. */
function PlayDisc() {
  return (
    <div className="relative size-full">
      <div
        className="absolute -inset-[11%] animate-disc-pulse rounded-full border border-white/12"
        style={{ animationDelay: '-1.4s' }}
      />
      <div
        className="glass absolute inset-0 grid animate-disc-pulse place-items-center rounded-full"
        style={{ '--glass-fill': '22%', '--glass-edge': '26%' } as CSSVars}
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-[34%] translate-x-[6%] fill-white/85">
          <path d="M8 5.2v13.6L19 12z" />
        </svg>
      </div>
    </div>
  )
}

/** Coding Arena. A thin, squared-off plate of cool glass. */
function CodeBracket() {
  return (
    <div
      className="glass-clear relative grid size-full place-items-center rounded-[22%]"
      style={{ '--glass-tint': 'var(--color-glow-cool)' } as CSSVars}
    >
      <div className="absolute inset-[9%] rounded-[18%] border border-white/[0.08]" />
      <span className="font-mono text-lg font-medium tracking-tight text-chalk/75 md:text-xl">
        &lt;/&gt;
      </span>
    </div>
  )
}

/** Games. A warm frosted cube — the offset back face gives it real thickness. */
function GameDie() {
  return (
    <div className="relative size-full">
      {/* Back face, offset to suggest a solid body rather than a flat card */}
      <div className="absolute inset-0 translate-x-[7%] translate-y-[7%] rounded-[28%] bg-white/[0.05] ring-1 ring-inset ring-white/10" />
      <div
        className="glass absolute inset-0 grid place-items-center rounded-[28%] p-[26%]"
        style={{ '--glass-tint': 'var(--color-glow-warm)', '--glass-fill': '16%' } as CSSVars}
      >
        <div className="grid size-full grid-cols-2 grid-rows-2 gap-[26%]">
          {[0, 1, 2, 3].map((pip) => (
            <span key={pip} className="rounded-full bg-white/70" />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Chat. The thinnest, clearest object — barely more than an edge. */
function ChatShard() {
  return (
    /* Fully square bottom-left corner — that's what makes it read as a
       speech bubble rather than another rounded tile like the die. */
    <div className="glass-clear grid size-full place-items-center rounded-[1.4rem_1.4rem_1.4rem_0]">
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-white/45" />
        <span className="size-1.5 rounded-full bg-white/45" />
        <span className="size-1.5 animate-signal-pulse rounded-full bg-signal" />
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Layout
   ─────────────────────────────────────────────────────────────── */

type FloatSpec = {
  /** Matches the `.glb` basename in src/assets/models/. */
  slot: string
  className: string
  style?: MotionStyle
  duration: number
  delay: number
  drift: TargetAndTransition
  /** Radians per second for the 3D model, when one is present. */
  spin: number
  fallback: ReactNode
}

/**
 * Positions keep the objects out of the centre column where the hero copy
 * sits. Below `md` only two objects survive — the rest would crowd the type.
 */
const OBJECTS: FloatSpec[] = [
  {
    slot: 'orb',
    /* On phones the top band belongs to the header and badge, so the orb
       drops into the empty space below the CTAs instead of fighting them. */
    className:
      '-left-[12%] bottom-[6%] size-32 sm:-left-[8%] sm:bottom-auto sm:top-[16%] sm:size-44 md:left-[6%] md:top-[23%] md:size-56',
    duration: 26,
    delay: 0,
    spin: 0.14,
    drift: { x: [0, 14, -10, 0], y: [0, -26, 14, 0], rotate: [0, 3, -2, 0] },
    fallback: <GlassOrb />,
  },
  {
    slot: 'vinyl',
    className: 'hidden md:block md:right-[7%] md:top-[16%] md:size-32',
    duration: 22,
    delay: 1.2,
    spin: 0.55,
    drift: { x: [0, -12, 8, 0], y: [0, 18, -12, 0] },
    fallback: <VinylRecord />,
  },
  {
    slot: 'play',
    className: '-right-[5%] bottom-[14%] size-20 sm:size-24 md:right-[12%] md:bottom-[19%] md:size-28',
    duration: 19,
    delay: 0.6,
    spin: 0.2,
    drift: { x: [0, -14, 10, 0], y: [0, -20, 10, 0], rotate: [0, -5, 4, 0] },
    fallback: <PlayDisc />,
  },
  {
    slot: 'code',
    className: 'hidden md:block md:bottom-[15%] md:left-[13%] md:size-24',
    duration: 24,
    delay: 1.8,
    spin: 0.3,
    drift: { x: [0, 10, -8, 0], y: [0, 16, -14, 0], rotate: [0, -14, 10, 0] },
    fallback: <CodeBracket />,
  },
  {
    slot: 'dice',
    className: 'hidden md:block md:bottom-[11%] md:right-[22%] md:size-20',
    style: { transformPerspective: 800 },
    duration: 21,
    delay: 2.6,
    spin: 0.42,
    drift: { x: [0, 12, -14, 0], y: [0, -18, 12, 0], rotate: [0, 20, -14, 0], rotateY: [0, -34, 22, 0] },
    fallback: <GameDie />,
  },
  {
    slot: 'chat',
    className:
      'hidden sm:block sm:right-[8%] sm:top-[15%] sm:h-16 sm:w-20 md:left-[23%] md:right-auto md:top-[12%] md:h-20 md:w-24',
    duration: 17,
    delay: 3.2,
    spin: 0.24,
    drift: { x: [0, 8, -12, 0], y: [0, -14, 10, 0], rotate: [0, 4, -6, 0] },
    fallback: <ChatShard />,
  },
]

/**
 * Glass objects floating around the hero copy, one per thing you can do inside
 * a room. Pure resting-state motion — nothing here is scroll-driven.
 *
 * Drop a matching `.glb` into `src/assets/models/` and it replaces that slot's
 * CSS object automatically. See that folder's README.
 */
export function FloatingObjects({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion()

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      {OBJECTS.map((spec) => {
        const url = hasModels ? modelUrl(spec.slot) : undefined

        return (
          <Drifter
            key={spec.slot}
            className={spec.className}
            style={spec.style}
            duration={spec.duration}
            delay={spec.delay}
            drift={spec.drift}
            still={reduced}
          >
            {url ? (
              <ModelBoundary fallback={spec.fallback}>
                <Suspense fallback={spec.fallback}>
                  <ModelObject url={url} spin={spec.spin} still={reduced} />
                </Suspense>
              </ModelBoundary>
            ) : (
              spec.fallback
            )}
          </Drifter>
        )
      })}
    </div>
  )
}
