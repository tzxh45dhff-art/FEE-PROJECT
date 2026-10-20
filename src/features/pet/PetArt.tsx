import { useEffect, useId, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

import type { Expression, Species } from '@/features/pet/types'

/**
 * The pet, drawn.
 *
 * One chibi body — a big round head on a small round body — dressed four ways
 * by its ears, colours and markings. Everything that makes it feel alive is
 * motion rather than detail: it breathes, it blinks at uneven intervals, its
 * eyes follow you, its ears twitch, its tail never quite stops, and every
 * interaction lands as a squash or a jump before the face changes. Faces are
 * built from a handful of eye and mouth shapes so a new mood is a new
 * combination, not a new drawing.
 */

type Palette = { fur: string; shade: string; belly: string; inner: string; dark: string; cheek: string }

const PALETTES: Record<Species, Palette> = {
  cat: { fur: '#F7A35C', shade: '#D9763A', belly: '#FFE6CC', inner: '#F6A3A8', dark: '#3A2433', cheek: '#FF8A8A' },
  pup: { fur: '#E8C291', shade: '#BF8F5B', belly: '#FFF3E0', inner: '#9C6A43', dark: '#2F2226', cheek: '#FF9B8F' },
  bunny: { fur: '#F4EFFA', shade: '#CBBDE2', belly: '#FFFFFF', inner: '#F9B4CB', dark: '#2E2438', cheek: '#FF9DBB' },
  panda: { fur: '#F7F6F2', shade: '#D3D1CA', belly: '#FFFFFF', inner: '#2B2A30', dark: '#232228', cheek: '#FF9AA8' },
}

/** How the face is put together for each expression. */
type Face = { eyes: 'open' | 'happy' | 'squeeze' | 'half' | 'wide' | 'sad'; mouth: 'smile' | 'cat' | 'open' | 'frown' | 'flat' | 'o' | 'chew' | 'laugh'; blush: number; ears: 'up' | 'down' | 'perk' }

const FACES: Record<Expression, Face> = {
  idle: { eyes: 'open', mouth: 'cat', blush: 0.35, ears: 'up' },
  happy: { eyes: 'happy', mouth: 'smile', blush: 0.7, ears: 'up' },
  sad: { eyes: 'sad', mouth: 'frown', blush: 0.15, ears: 'down' },
  hungry: { eyes: 'sad', mouth: 'o', blush: 0.2, ears: 'down' },
  ouch: { eyes: 'squeeze', mouth: 'open', blush: 0.5, ears: 'down' },
  giggle: { eyes: 'happy', mouth: 'laugh', blush: 0.9, ears: 'up' },
  grumpy: { eyes: 'half', mouth: 'flat', blush: 0.1, ears: 'down' },
  purr: { eyes: 'happy', mouth: 'cat', blush: 0.9, ears: 'up' },
  yum: { eyes: 'happy', mouth: 'chew', blush: 0.6, ears: 'up' },
  love: { eyes: 'happy', mouth: 'chew', blush: 1, ears: 'up' },
  full: { eyes: 'half', mouth: 'flat', blush: 0.4, ears: 'up' },
  listen: { eyes: 'wide', mouth: 'o', blush: 0.35, ears: 'perk' },
  talk: { eyes: 'open', mouth: 'open', blush: 0.5, ears: 'perk' },
  sleepy: { eyes: 'half', mouth: 'cat', blush: 0.3, ears: 'down' },
}

export function PetArt({
  species,
  expression,
  look = { x: 0, y: 0 },
  mouth = 0,
  bump = 0,
  bumpKind = 'squash',
  className,
}: {
  species: Species
  expression: Expression
  /** Where it is looking, −1…1 on each axis. */
  look?: { x: number; y: number }
  /** 0–1: how open the mouth is while it talks. */
  mouth?: number
  /** Change this to play a one-off body animation. */
  bump?: number
  bumpKind?: 'squash' | 'jump' | 'shake' | 'wiggle'
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const p = PALETTES[species]
  const face = FACES[expression]
  const blink = useBlink(face.eyes === 'open' || face.eyes === 'wide' || face.eyes === 'sad')
  const body = useAnimationControls()

  useEffect(() => {
    if (!bump) return
    const moves = {
      squash: { scaleX: [1, 1.14, 0.94, 1.03, 1], scaleY: [1, 0.84, 1.07, 0.98, 1], transition: { duration: 0.5 } },
      jump: { y: [0, -26, 0, -8, 0], scaleY: [1, 1.06, 0.92, 1.02, 1], transition: { duration: 0.65 } },
      shake: { rotate: [0, -7, 7, -5, 5, -2, 0], transition: { duration: 0.55 } },
      wiggle: { rotate: [0, 4, -4, 4, -4, 0], y: [0, -3, 0, -3, 0, 0], transition: { duration: 0.8 } },
    }
    void body.start(moves[bumpKind])
  }, [bump, bumpKind, body])

  const lx = Math.max(-1, Math.min(1, look.x)) * 5
  const ly = Math.max(-1, Math.min(1, look.y)) * 3.5

  return (
    <svg viewBox="0 -36 200 246" className={className} role="img" aria-label={`${species}, ${expression}`}>
      <defs>
        <radialGradient id={`${id}fur`} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor={lighten(p.fur)} />
          <stop offset="60%" stopColor={p.fur} />
          <stop offset="100%" stopColor={p.shade} />
        </radialGradient>
        <radialGradient id={`${id}belly`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor={p.belly} />
        </radialGradient>
        <radialGradient id={`${id}eye`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#4a3a55" />
          <stop offset="100%" stopColor={p.dark} />
        </radialGradient>
      </defs>

      {/* Ground shadow — stays put while the body moves. */}
      <motion.ellipse cx="100" cy="200" rx="52" ry="7" fill="black" opacity={0.28} animate={{ rx: [52, 48, 52] }} transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }} />

      <motion.g animate={body} style={{ originX: 0.5, originY: 1 }}>
        {/* Breathing. */}
        <motion.g animate={{ scaleY: [1, 1.025, 1], scaleX: [1, 0.99, 1] }} transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }} style={{ originX: 0.5, originY: 1 }}>
          <Tail species={species} p={p} id={id} happy={face.ears !== 'down'} />

          {/* Feet. */}
          <ellipse cx="78" cy="192" rx="17" ry="10" fill={species === 'panda' ? p.inner : p.fur} />
          <ellipse cx="122" cy="192" rx="17" ry="10" fill={species === 'panda' ? p.inner : p.fur} />

          {/* Body. */}
          <ellipse cx="100" cy="160" rx="46" ry="38" fill={`url(#${id}fur)`} />
          <ellipse cx="100" cy="168" rx="28" ry="25" fill={`url(#${id}belly)`} />

          {/* Arms. */}
          <motion.ellipse
            cx="60"
            cy="160"
            rx="11"
            ry="17"
            fill={species === 'panda' ? p.inner : p.fur}
            animate={expression === 'giggle' || expression === 'love' ? { rotate: [20, 40, 20] } : expression === 'hungry' ? { rotate: -35, x: 12 } : { rotate: 18 }}
            transition={expression === 'giggle' || expression === 'love' ? { repeat: Infinity, duration: 0.4 } : { duration: 0.3 }}
            style={{ originX: 0.5, originY: 0.1 }}
          />
          <motion.ellipse
            cx="140"
            cy="160"
            rx="11"
            ry="17"
            fill={species === 'panda' ? p.inner : p.fur}
            animate={expression === 'giggle' || expression === 'love' ? { rotate: [-20, -40, -20] } : expression === 'hungry' ? { rotate: 35, x: -12 } : { rotate: -18 }}
            transition={expression === 'giggle' || expression === 'love' ? { repeat: Infinity, duration: 0.4, delay: 0.2 } : { duration: 0.3 }}
            style={{ originX: 0.5, originY: 0.1 }}
          />

          {/* Head, which tilts a little toward wherever it's looking. */}
          <motion.g animate={{ rotate: lx * 0.9, y: ly * 0.6 }} transition={{ type: 'spring', stiffness: 80, damping: 14 }} style={{ originX: 0.5, originY: 0.9 }}>
            <Ears species={species} p={p} id={id} pose={face.ears} />
            <circle cx="100" cy="86" r="60" fill={`url(#${id}fur)`} />
            {species === 'cat' && (
              <g fill={p.shade} opacity={0.55}>
                <path d="M100 27 q-5 12 0 20 q5 -8 0 -20z" />
                <path d="M82 30 q-3 10 1 16 q3 -8 -1 -16z" />
                <path d="M118 30 q3 10 -1 16 q-3 -8 1 -16z" />
              </g>
            )}
            {species === 'pup' && <ellipse cx="124" cy="70" rx="16" ry="14" fill={p.inner} opacity={0.55} />}
            {/* Muzzle. */}
            <ellipse cx="100" cy="112" rx="26" ry="18" fill={species === 'panda' ? '#fff' : p.belly} opacity={0.95} />

            {/* Eyes follow you. */}
            <motion.g animate={{ x: lx, y: ly }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
              {species === 'panda' && (
                <g fill={p.inner}>
                  <ellipse cx="76" cy="88" rx="17" ry="21" transform="rotate(25 76 88)" />
                  <ellipse cx="124" cy="88" rx="17" ry="21" transform="rotate(-25 124 88)" />
                </g>
              )}
              <Eye cx={76} cy={88} kind={face.eyes} blink={blink} id={id} side="left" light={species === 'panda'} />
              <Eye cx={124} cy={88} kind={face.eyes} blink={blink} id={id} side="right" light={species === 'panda'} />
            </motion.g>

            {/* Cheeks. */}
            <motion.g animate={{ opacity: face.blush }} transition={{ duration: 0.4 }}>
              <ellipse cx="62" cy="108" rx="11" ry="6.5" fill={p.cheek} opacity={0.55} />
              <ellipse cx="138" cy="108" rx="11" ry="6.5" fill={p.cheek} opacity={0.55} />
            </motion.g>

            {/* Nose. */}
            <path d={species === 'pup' || species === 'panda' ? 'M92 101 q8 -6 16 0 q-2 7 -8 8 q-6 -1 -8 -8z' : 'M95 103 q5 -3 10 0 q-2 5 -5 5.5 q-3 -0.5 -5 -5.5z'} fill={species === 'bunny' ? p.inner : p.dark} />
            <Mouth kind={face.mouth} open={mouth} dark={p.dark} tongue={p.inner} species={species} />

            {species === 'cat' && (
              <g stroke={p.dark} strokeWidth="1.6" strokeLinecap="round" opacity={0.45}>
                <path d="M70 110 l-24 -4" />
                <path d="M70 116 l-24 3" />
                <path d="M130 110 l24 -4" />
                <path d="M130 116 l24 3" />
              </g>
            )}
            {expression === 'sad' && <Tear />}
            {expression === 'grumpy' && <AngerMark />}
            {expression === 'ouch' && <SweatDrop />}
          </motion.g>
        </motion.g>
      </motion.g>
    </svg>
  )
}

/** Blinks every few seconds, irregularly, sometimes twice. */
function useBlink(enabled: boolean) {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    if (!enabled) return
    let timer: number
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          setShut(true)
          window.setTimeout(() => {
            setShut(false)
            if (Math.random() < 0.2) {
              window.setTimeout(() => {
                setShut(true)
                window.setTimeout(() => setShut(false), 110)
              }, 160)
            }
            schedule()
          }, 120)
        },
        2200 + Math.random() * 3200,
      )
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [enabled])
  return shut
}

function Eye({ cx, cy, kind, blink, id, side, light }: { cx: number; cy: number; kind: Face['eyes']; blink: boolean; id: string; side: 'left' | 'right'; light: boolean }) {
  const stroke = light ? '#fff' : '#3a2433'
  if (kind === 'happy') {
    return <path d={`M${cx - 10} ${cy + 3} Q${cx} ${cy - 10} ${cx + 10} ${cy + 3}`} fill="none" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
  }
  if (kind === 'squeeze') {
    const d = side === 'left' ? `M${cx - 9} ${cy - 8} L${cx + 7} ${cy} L${cx - 9} ${cy + 8}` : `M${cx + 9} ${cy - 8} L${cx - 7} ${cy} L${cx + 9} ${cy + 8}`
    return <path d={d} fill="none" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  }
  const wide = kind === 'wide'
  const rx = wide ? 11 : 10
  const ry = wide ? 14.5 : 13
  return (
    <g>
      <motion.g animate={{ scaleY: blink ? 0.08 : kind === 'half' ? 0.5 : 1 }} transition={{ duration: 0.07 }} style={{ originX: 0.5, originY: kind === 'half' ? 1 : 0.5 }}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}eye)`} />
        <circle cx={cx + 3.5} cy={cy - 5} r={wide ? 4.6 : 4} fill="#fff" />
        <circle cx={cx - 3.5} cy={cy + 5} r={wide ? 2.2 : 1.8} fill="#fff" opacity={0.85} />
      </motion.g>
      {kind === 'half' && <path d={`M${cx - 12} ${cy - 1} L${cx + 12} ${cy - 1}`} stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />}
      {kind === 'sad' && (
        <path
          d={side === 'left' ? `M${cx - 11} ${cy - 18} L${cx + 7} ${cy - 23}` : `M${cx + 11} ${cy - 18} L${cx - 7} ${cy - 23}`}
          stroke={stroke}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
    </g>
  )
}

function Mouth({ kind, open, dark, tongue, species }: { kind: Face['mouth']; open: number; dark: string; tongue: string; species: Species }) {
  const t = species === 'panda' || species === 'pup' ? '#F48B9A' : tongue
  const line = { fill: 'none', stroke: dark, strokeWidth: 3, strokeLinecap: 'round' as const }
  /* Talking: an opening that follows the voice. */
  if (kind === 'open' || open > 0.05) {
    const h = 4 + Math.max(open, kind === 'open' ? 0.6 : 0) * 12
    return (
      <g>
        <ellipse cx="100" cy={116 + h / 2} rx={8 + h * 0.25} ry={h} fill={dark} />
        <ellipse cx="100" cy={116 + h * 1.1} rx={6} ry={h * 0.45} fill={t} />
      </g>
    )
  }
  switch (kind) {
    case 'smile':
      return <path d="M88 113 Q100 125 112 113" {...line} />
    case 'cat':
      return <path d="M89 112 Q94.5 118 100 112 Q105.5 118 111 112" {...line} />
    case 'frown':
      return <path d="M90 120 Q100 111 110 120" {...line} />
    case 'flat':
      return <path d="M92 116 L108 116" {...line} />
    case 'o':
      return <ellipse cx="100" cy="117" rx="4.5" ry="5.5" fill={dark} />
    case 'laugh':
      return (
        <g>
          <path d="M86 112 Q100 134 114 112 Z" fill={dark} />
          <path d="M93 121 Q100 128 107 121 Q100 118 93 121Z" fill={t} />
        </g>
      )
    case 'chew':
      return (
        <motion.path
          d="M90 113 Q100 122 110 113"
          {...line}
          animate={{ d: ['M90 113 Q100 122 110 113', 'M92 115 Q100 112 108 115', 'M90 113 Q100 122 110 113'] }}
          transition={{ repeat: Infinity, duration: 0.35 }}
        />
      )
  }
}

function Ears({ species, p, id, pose }: { species: Species; p: Palette; id: string; pose: Face['ears'] }) {
  const tilt = pose === 'down' ? 1 : pose === 'perk' ? -1 : 0
  const twitch = { repeat: Infinity, repeatDelay: 4.5, duration: 0.35 }
  if (species === 'cat') {
    return (
      <>
        <motion.g animate={{ rotate: [tilt * -22, tilt * -22 - 8, tilt * -22] }} transition={twitch} style={{ originX: 0.75, originY: 1 }}>
          <path d="M48 62 L56 14 L92 40 Z" fill={`url(#${id}fur)`} stroke={p.shade} strokeWidth="1" strokeLinejoin="round" />
          <path d="M58 52 L61 26 L80 41 Z" fill={p.inner} />
        </motion.g>
        <motion.g animate={{ rotate: tilt * 22 }} transition={{ duration: 0.3 }} style={{ originX: 0.25, originY: 1 }}>
          <path d="M152 62 L144 14 L108 40 Z" fill={`url(#${id}fur)`} stroke={p.shade} strokeWidth="1" strokeLinejoin="round" />
          <path d="M142 52 L139 26 L120 41 Z" fill={p.inner} />
        </motion.g>
      </>
    )
  }
  if (species === 'pup') {
    return (
      <>
        <motion.ellipse cx="44" cy="80" rx="17" ry="34" fill={p.inner} animate={{ rotate: 20 + tilt * 12 }} transition={{ type: 'spring', stiffness: 120, damping: 8 }} style={{ originX: 0.5, originY: 0 }} />
        <motion.ellipse cx="156" cy="80" rx="17" ry="34" fill={p.inner} animate={{ rotate: [-20 - tilt * 12, -26 - tilt * 12, -20 - tilt * 12] }} transition={twitch} style={{ originX: 0.5, originY: 0 }} />
      </>
    )
  }
  if (species === 'bunny') {
    return (
      <>
        <motion.g animate={{ rotate: -10 + tilt * -38 }} transition={{ type: 'spring', stiffness: 90, damping: 10 }} style={{ originX: 0.5, originY: 1 }}>
          <rect x="64" y="-30" width="30" height="80" rx="15" fill={`url(#${id}fur)`} />
          <rect x="71" y="-20" width="16" height="60" rx="8" fill={p.inner} />
        </motion.g>
        <motion.g animate={{ rotate: [10 + tilt * 38, 18 + tilt * 38, 10 + tilt * 38] }} transition={twitch} style={{ originX: 0.5, originY: 1 }}>
          <rect x="106" y="-30" width="30" height="80" rx="15" fill={`url(#${id}fur)`} />
          <rect x="113" y="-20" width="16" height="60" rx="8" fill={p.inner} />
        </motion.g>
      </>
    )
  }
  return (
    <>
      <motion.circle cx="52" cy="42" r="18" fill={p.inner} animate={{ y: tilt * 6 }} />
      <motion.circle cx="148" cy="42" r="18" fill={p.inner} animate={{ y: [tilt * 6, tilt * 6 - 3, tilt * 6] }} transition={twitch} />
    </>
  )
}

function Tail({ species, p, id, happy }: { species: Species; p: Palette; id: string; happy: boolean }) {
  const wag = { repeat: Infinity, duration: happy ? 0.5 : 2.2, ease: 'easeInOut' as const }
  if (species === 'cat') {
    return (
      <motion.path
        d="M140 176 Q178 172 172 136 Q168 116 178 106"
        fill="none"
        stroke={p.fur}
        strokeWidth="11"
        strokeLinecap="round"
        animate={{ rotate: happy ? [-6, 8, -6] : [-3, 3, -3] }}
        transition={wag}
        style={{ originX: 0, originY: 1 }}
      />
    )
  }
  if (species === 'pup') {
    return (
      <motion.ellipse cx="150" cy="168" rx="8" ry="20" fill={p.shade} animate={{ rotate: happy ? [10, 42, 10] : [22, 28, 22] }} transition={wag} style={{ originX: 0.5, originY: 1 }} />
    )
  }
  if (species === 'bunny') {
    return <motion.circle cx="144" cy="180" r="12" fill={`url(#${id}fur)`} animate={{ scale: [1, 1.08, 1] }} transition={wag} />
  }
  return <circle cx="142" cy="180" r="9" fill={p.inner} />
}

function Tear() {
  return (
    <motion.path
      d="M66 100 q-4 8 0 11 q4 -3 0 -11z"
      fill="#8fd3ff"
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: [0, 14], opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 1.8, repeatDelay: 1.2 }}
    />
  )
}

function AngerMark() {
  return (
    <g stroke="#ff5a5f" strokeWidth="4" strokeLinecap="round" transform="translate(140 40)">
      <path d="M0 6 q6 -2 6 -8 M10 -2 q2 6 8 6 M18 12 q-6 2 -6 8 M8 20 q-2 -6 -8 -6" fill="none" />
    </g>
  )
}

function SweatDrop() {
  return <motion.path d="M150 52 q-6 10 0 14 q6 -4 0 -14z" fill="#9edcff" initial={{ y: -6, opacity: 0 }} animate={{ y: 4, opacity: 1 }} />
}

/** A lighter tone of a hex colour, for the highlight side of the fur. */
function lighten(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * 0.35)
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
