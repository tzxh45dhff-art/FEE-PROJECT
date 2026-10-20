import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { emoteById, throwById, type ThrowDef } from '@/features/fun/catalog'
import { anchorFor, requestWave, type Anchor } from '@/features/fun/anchors'
import { ThrowArt } from '@/features/fun/ThrowArt'
import type { EmoteEvent, FunEvent, ThrowEvent, ToyEvent } from '@/features/fun/useFun'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Everything fun that is happening in the room, drawn over the people doing it.
 *
 * Positions come from `anchorFor`, measured once when an effect starts: people
 * stand still on the dashboard, and an effect is over within three seconds, so
 * there is nothing to track. Nothing here takes pointer input — the layer sits
 * over the whole hub and must never swallow a click meant for the room.
 */

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const emojiFont: CSSProperties = {
  fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
  lineHeight: 1,
}

export function FunLayer({ events, youId }: { events: FunEvent[]; youId: string | null }) {
  const reduced = usePrefersReducedMotion()
  const toy = [...events].reverse().find((e): e is ToyEvent => e.kind === 'toy')

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {events.map((event) =>
          event.kind === 'emote' ? (
            <Emote key={event.id} event={event} reduced={reduced} />
          ) : event.kind === 'throw' ? (
            <Throw key={event.id} event={event} reduced={reduced} />
          ) : null,
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {toy && <Toy key={toy.id} event={toy} reduced={reduced} youId={youId} />}
      </AnimatePresence>
    </div>
  )
}

// ── emotes ────────────────────────────────────────────────────────────────────

function useAnchor(id: string): Anchor {
  /* Measured once, at the moment the effect begins. */
  return useState(() => anchorFor(id) ?? { x: window.innerWidth / 2, y: window.innerHeight * 0.3, h: 400 })[0]
}

function Emote({ event, reduced }: { event: EmoteEvent; reduced: boolean }) {
  const def = emoteById(event.emote)
  const at = useAnchor(event.from.id)

  useEffect(() => {
    if (def?.clip === 'wave') requestWave(event.from.id)
  }, [def?.clip, event.from.id])

  if (!def) return null
  const size = Math.max(40, Math.min(64, at.h * 0.12))
  const base: CSSProperties = { ...emojiFont, position: 'absolute', left: at.x, top: at.y, fontSize: size }

  if (reduced) {
    return (
      <motion.div
        style={{ ...base, x: '-50%', y: '-100%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.2, times: [0, 0.1, 0.8, 1] }}
      >
        {def.glyph}
      </motion.div>
    )
  }

  if (def.motion === 'fountain') {
    return (
      <>
        {Array.from({ length: 8 }, (_, i) => {
          const dx = rand(-70, 70)
          const rise = rand(110, 190)
          const scale = rand(0.55, 1)
          return (
            <motion.div
              key={i}
              style={{ ...base, x: '-50%', y: '-100%' }}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.2, scale * 1.15, scale],
                translateX: [0, dx * 0.4, dx],
                translateY: [0, -rise * 0.55, -rise],
                rotate: [0, rand(-25, 25)],
              }}
              transition={{ duration: rand(1.6, 2.2), delay: i * 0.07, ease: 'easeOut', times: [0, 0.18, 1] }}
            >
              {def.glyph}
            </motion.div>
          )
        })}
      </>
    )
  }

  const motionFor = {
    pop: { scale: [0.2, 1.35, 1, 1, 0.9], translateY: [12, -18, -30, -44, -60], rotate: [0, -6, 0, 0, 0] },
    wobble: { scale: [0.3, 1.2, 1, 1, 0.9], translateY: [10, -16, -30, -44, -58], rotate: [0, -18, 16, -14, 0] },
    bounce: { scale: [0.3, 1.2, 1, 1, 0.9], translateY: [10, -36, -16, -40, -58], rotate: [0, 0, 0, 0, 0] },
  }[def.motion]

  return (
    <motion.div
      style={{ ...base, x: '-50%', y: '-100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 1, 0], ...motionFor }}
      transition={{ duration: 2.3, times: [0, 0.14, 0.32, 0.8, 1], ease: 'easeOut' }}
    >
      {/* A soft glow behind, so it reads on any backdrop. */}
      <span
        className="absolute left-1/2 top-1/2 -z-10 size-[1.6em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 blur-xl"
      />
      {def.glyph}
    </motion.div>
  )
}

// ── throwing ──────────────────────────────────────────────────────────────────

function Throw({ event, reduced }: { event: ThrowEvent; reduced: boolean }) {
  const def = throwById(event.item)
  const from = useAnchor(event.from.id)
  const to = useAnchor(event.to.id)
  const [landed, setLanded] = useState(reduced)

  const path = useMemo(() => {
    if (!def) return null
    const distance = Math.hypot(to.x - from.x, to.y - from.y)
    /* High enough to read as a throw, never so high it sails through the top
       bar — on a laptop the heads are already near the top of the screen. */
    const ceiling = Math.max(30, Math.min(from.y, to.y) - 96)
    const loft = Math.min(ceiling, Math.max(70, distance * def.loft))
    const steps = 24
    const xs: number[] = []
    const ys: number[] = []
    const angles: number[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      xs.push(from.x + (to.x - from.x) * t)
      /* A parabola: steady across, up and back down. */
      ys.push(from.y + (to.y - from.y) * t - 4 * loft * t * (1 - t))
      const dx = to.x - from.x
      const dy = to.y - from.y - 4 * loft * (1 - 2 * t)
      angles.push((Math.atan2(dy, dx) * 180) / Math.PI)
    }
    return { xs, ys, angles }
  }, [def, from, to])

  useEffect(() => {
    if (reduced || !def) return
    const timer = setTimeout(() => setLanded(true), def.flight * 1000)
    return () => clearTimeout(timer)
  }, [def, reduced])

  /* The person who was hit flinches — their nameplate gives a little jolt. */
  useEffect(() => {
    if (!landed || reduced) return
    const plate = document.querySelector<HTMLElement>(`[data-hub-member="${CSS.escape(event.to.id)}"]`)
    plate?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-7px) rotate(-2deg)' },
        { transform: 'translateX(6px) rotate(1.5deg)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 460, easing: 'ease-out' },
    )
  }, [landed, reduced, event.to.id])

  if (!def || !path) return null
  const aimed = def.spin === 0
  const size = Math.max(38, Math.min(56, to.h * 0.1))

  return (
    <>
      {!landed && (
        <motion.div
          style={{ position: 'absolute', left: 0, top: 0, x: '-50%', y: '-50%' }}
          initial={{ translateX: path.xs[0], translateY: path.ys[0], scale: 0.6 }}
          animate={{
            translateX: path.xs,
            translateY: path.ys,
            scale: [0.6, 1.1, 1, 1, 0.95],
            rotate: aimed ? path.angles.map((a) => a + (def.id === 'plane' ? 45 : -45)) : [0, def.spin * 360],
          }}
          transition={{ duration: def.flight, ease: 'linear' }}
        >
          <ThrowArt def={def} size={size} />
        </motion.div>
      )}
      {landed && <Impact def={def} at={to} reduced={reduced} />}
    </>
  )
}

const CONFETTI = ['#ff5a5a', '#ffd166', '#06d6a0', '#4cc9f0', '#b15efb', '#ff8fab']

function Impact({ def, at, reduced }: { def: ThrowDef; at: Anchor; reduced: boolean }) {
  const reaction = (
    <motion.div
      style={{ ...emojiFont, position: 'absolute', left: at.x, top: at.y - 8, fontSize: Math.max(40, at.h * 0.11), x: '-50%', y: '-100%' }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.25, 1, 0.95], translateY: [8, -10, -18, -30] }}
      transition={{ duration: 1.9, delay: reduced ? 0 : 0.18, times: [0, 0.15, 0.75, 1] }}
    >
      {def.reaction}
    </motion.div>
  )
  if (reduced) return reaction

  const burst = (count: number, render: (i: number) => React.ReactNode) => Array.from({ length: count }, (_, i) => render(i))

  let particles: React.ReactNode = null
  switch (def.impact) {
    case 'confetti':
      particles = burst(34, (i) => {
        const angle = rand(0, Math.PI * 2)
        const speed = rand(60, 190)
        return (
          <motion.span
            key={i}
            className="absolute block"
            style={{ left: at.x, top: at.y, width: rand(6, 11), height: rand(10, 16), background: CONFETTI[i % CONFETTI.length], borderRadius: 2 }}
            initial={{ opacity: 1 }}
            animate={{
              translateX: [0, Math.cos(angle) * speed, Math.cos(angle) * speed * 1.2],
              translateY: [0, Math.sin(angle) * speed - 40, Math.sin(angle) * speed + 160],
              rotate: [0, rand(-540, 540)],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: rand(1.3, 2), ease: 'easeOut' }}
          />
        )
      })
      break
    case 'petals':
    case 'hearts':
      particles = burst(def.impact === 'hearts' ? 9 : 12, (i) => {
        const dx = rand(-90, 90)
        return (
          <motion.span
            key={i}
            className="absolute block"
            style={{ ...emojiFont, left: at.x, top: at.y, fontSize: rand(16, 26) }}
            animate={{
              translateX: [0, dx * 0.5, dx, dx * 0.8],
              translateY: [0, rand(-70, -30), rand(30, 80), rand(120, 190)],
              rotate: [0, rand(-160, 160)],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: rand(1.6, 2.3), ease: 'easeOut' }}
          >
            {def.impact === 'hearts' ? '💗' : '🌸'}
          </motion.span>
        )
      })
      break
    case 'feathers':
      particles = burst(12, (i) => {
        const dx = rand(-110, 110)
        return (
          <motion.span
            key={i}
            className="absolute block rounded-[50%] bg-white/90 shadow-[0_0_6px_rgba(255,255,255,.6)]"
            style={{ left: at.x, top: at.y, width: rand(10, 16), height: rand(4, 7) }}
            animate={{
              translateX: [0, dx * 0.6, dx * 0.9, dx],
              translateY: [0, rand(-80, -40), rand(20, 60), rand(130, 200)],
              rotate: [0, rand(-90, 90), rand(-180, 180)],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: rand(2, 2.8), ease: 'easeOut' }}
          />
        )
      })
      break
    case 'splash':
      particles = (
        <>
          <motion.span
            className="absolute block rounded-full border-4 border-sky-300/80"
            style={{ left: at.x, top: at.y, width: 40, height: 40, x: '-50%', y: '-50%' }}
            animate={{ scale: [0.4, 3.6], opacity: [0.9, 0] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
          {burst(16, (i) => {
            const angle = rand(Math.PI * 1.05, Math.PI * 1.95)
            const speed = rand(60, 150)
            return (
              <motion.span
                key={i}
                className="absolute block rounded-full bg-sky-300"
                style={{ left: at.x, top: at.y, width: rand(6, 11), height: rand(8, 14) }}
                animate={{
                  translateX: [0, Math.cos(angle) * speed],
                  translateY: [0, Math.sin(angle) * speed, Math.sin(angle) * speed + 180],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: rand(0.9, 1.3), ease: 'easeOut' }}
              />
            )
          })}
        </>
      )
      break
    case 'snow':
      particles = burst(14, (i) => {
        const angle = rand(0, Math.PI * 2)
        const r = rand(20, 70)
        return (
          <motion.span
            key={i}
            className="absolute block rounded-full bg-white"
            style={{ left: at.x, top: at.y, width: rand(10, 26), height: rand(10, 26), filter: 'blur(1px)' }}
            animate={{
              translateX: [0, Math.cos(angle) * r],
              translateY: [0, Math.sin(angle) * r, Math.sin(angle) * r + 50],
              scale: [0.3, 1.2, 0.6],
              opacity: [0.95, 0.85, 0],
            }}
            transition={{ duration: rand(0.9, 1.5), ease: 'easeOut' }}
          />
        )
      })
      break
    case 'splat':
      particles = (
        <motion.svg
          viewBox="0 0 100 100"
          width={110}
          height={110}
          className="absolute"
          style={{ left: at.x, top: at.y, x: '-50%', y: '-50%' }}
          animate={{ scale: [0.2, 1.15, 1, 1], opacity: [1, 1, 0.9, 0], translateY: [0, 0, 6, 26] }}
          transition={{ duration: 2.2, times: [0, 0.12, 0.6, 1] }}
        >
          <path
            d="M50 18c7 0 9 10 15 9s11-6 15 0-3 12 1 17 12 3 12 10-11 6-12 12 7 13 0 16-11-5-17-2-8 12-15 11-6-11-12-13-15 6-18-1 6-12 3-17-14-3-13-11 13-6 14-12-6-13 1-16 12 6 17 2 2-15 9-15z"
            fill="#e63946"
          />
          <circle cx="22" cy="80" r="5" fill="#e63946" />
          <circle cx="84" cy="22" r="4" fill="#e63946" />
          <circle cx="50" cy="50" r="10" fill="#ff7b84" opacity="0.7" />
        </motion.svg>
      )
      break
    case 'glide':
      particles = burst(6, (i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{ ...emojiFont, left: at.x, top: at.y, fontSize: 16 }}
          animate={{ translateX: [0, rand(-50, 50)], translateY: [0, rand(-60, -10)], opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6] }}
          transition={{ duration: 1, delay: i * 0.05 }}
        >
          ✨
        </motion.span>
      ))
      break
  }

  return (
    <>
      {particles}
      {reaction}
    </>
  )
}

// ── toys ──────────────────────────────────────────────────────────────────────

/**
 * Where a toy's card sits: a single compact row, in the sky above everybody.
 *
 * Its bottom edge goes just above the highest head in the room so nobody's
 * face is covered while the result is on screen, and it never rises into the
 * top bar. The card is one row tall on purpose — on a laptop screen the
 * characters stand high, and a tall card had nowhere to go but over a face.
 */
function useCardSpot() {
  return useState(() => {
    const heads = [...document.querySelectorAll<HTMLElement>('[data-hub-member]')]
      .map((el) => anchorFor(el.dataset.hubMember!)?.y)
      .filter((y): y is number => typeof y === 'number')
    const highest = heads.length ? Math.min(...heads) : window.innerHeight * 0.3
    /* Head anchors are the crown; leave a little air above it. */
    return { bottom: Math.max(window.innerHeight - (highest - 14), 0), minTop: 64 }
  })[0]
}

function Toy({ event, reduced, youId }: { event: ToyEvent; reduced: boolean; youId: string | null }) {
  const who = event.from.id === youId ? 'You' : event.from.name
  const spot = useCardSpot()
  if (event.toy === 'bottle') return <Bottle event={event} reduced={reduced} youId={youId} />

  const verb = { dice: 'rolled', coin: 'flipped', fortune: 'cracked a fortune', eightball: 'asked the 8-ball' }[event.toy]

  return (
    <motion.div
      className="absolute left-1/2 w-max max-w-[min(34rem,90vw)] -translate-x-1/2"
      style={{ bottom: spot.bottom, maxHeight: `calc(100vh - ${spot.bottom}px - ${spot.minTop}px)` }}
      initial={{ opacity: 0, y: -14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
    >
      <div className="glass-pill-ink flex items-center gap-4 rounded-[1.25rem] py-2.5 pl-3 pr-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,.85)]">
        {event.toy === 'dice' && <Dice values={event.values} reduced={reduced} who={who} verb={verb} />}
        {event.toy === 'coin' && <Coin side={event.side} reduced={reduced} who={who} verb={verb} />}
        {event.toy === 'fortune' && <Fortune text={event.text} reduced={reduced} who={who} />}
        {event.toy === 'eightball' && (
          <EightBall question={event.question} text={event.text} reduced={reduced} who={who} />
        )}
      </div>
    </motion.div>
  )
}

/** Who did it, then what came of it — the text half of every toy card. */
function Caption({ who, verb, result, done }: { who: string; verb: string; result: string; done: boolean }) {
  return (
    <div className="min-w-0 text-left">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-mist">
        {who} {verb}
      </p>
      <motion.p
        className="font-display text-[1.3rem] font-semibold leading-tight tracking-[-0.02em] text-chalk"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 4 }}
      >
        {result}
      </motion.p>
    </div>
  )
}

/** Becomes true after `ms`, or at once with reduced motion. */
function useSettled(ms: number, reduced: boolean) {
  const [done, setDone] = useState(reduced)
  useEffect(() => {
    if (reduced) return
    const timer = setTimeout(() => setDone(true), ms)
    return () => clearTimeout(timer)
  }, [ms, reduced])
  return done
}

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
}

function Die({ value, delay, reduced }: { value: number; delay: number; reduced: boolean }) {
  /* Tumbles through random faces, then lands on the one the server rolled —
     everyone's screen settles on the same number. */
  const [face, setFace] = useState(reduced ? value : 1 + Math.floor(Math.random() * 6))
  useEffect(() => {
    if (reduced) return
    let ticks = 0
    const timer = setInterval(() => {
      ticks += 1
      if (ticks >= 9) {
        setFace(value)
        clearInterval(timer)
      } else setFace(1 + Math.floor(Math.random() * 6))
    }, 85)
    return () => clearInterval(timer)
  }, [value, reduced])

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="size-12 shrink-0 drop-shadow-[0_8px_14px_rgba(0,0,0,.45)]"
      initial={reduced ? false : { rotate: -220, y: -26, scale: 0.6 }}
      animate={{ rotate: 0, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 12, delay }}
    >
      <defs>
        <linearGradient id="dieShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="20" fill="#fafafa" />
      <rect x="6" y="6" width="88" height="88" rx="20" fill="url(#dieShade)" />
      {PIPS[face]!.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8.5" fill={face === 1 ? '#e63946' : '#18181b'} />
      ))}
    </motion.svg>
  )
}

function Dice({ values, reduced, who, verb }: { values: number[]; reduced: boolean; who: string; verb: string }) {
  const done = useSettled(900, reduced)
  const total = values.reduce((a, b) => a + b, 0)
  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        {values.map((v, i) => (
          <Die key={i} value={v} delay={i * 0.08} reduced={reduced} />
        ))}
      </div>
      <Caption who={who} verb={verb} done={done} result={values.length > 1 ? `${values.join(' + ')} = ${total}` : String(total)} />
    </>
  )
}

function Coin({ side, reduced, who, verb }: { side: 'heads' | 'tails'; reduced: boolean; who: string; verb: string }) {
  const done = useSettled(1300, reduced)
  /* An even number of half-turns lands heads-up; odd lands tails. */
  const turns = side === 'heads' ? 8 : 9
  return (
    <>
      <div className="shrink-0 [perspective:500px]">
        <motion.div
          className="relative size-12"
          style={{ transformStyle: 'preserve-3d' }}
          initial={reduced ? false : { rotateX: 0, y: 0 }}
          animate={reduced ? { rotateX: side === 'heads' ? 0 : 180 } : { rotateX: turns * 180, y: [0, -46, 0] }}
          transition={{ duration: 1.3, ease: [0.2, 0.7, 0.3, 1] }}
        >
          {(['heads', 'tails'] as const).map((face) => (
            <div
              key={face}
              className="absolute inset-0 grid place-items-center rounded-full font-display text-[1.15rem] font-bold text-amber-950 shadow-[inset_0_-5px_10px_rgba(0,0,0,.25),inset_0_3px_8px_rgba(255,255,255,.5)]"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #ffe8a3, #f2b33d 55%, #b9771a)',
                backfaceVisibility: 'hidden',
                transform: face === 'tails' ? 'rotateX(180deg)' : undefined,
              }}
            >
              {face === 'heads' ? '₹' : '★'}
            </div>
          ))}
        </motion.div>
      </div>
      <Caption who={who} verb={verb} done={done} result={side === 'heads' ? 'Heads' : 'Tails'} />
    </>
  )
}

function Fortune({ text, reduced, who }: { text: string; reduced: boolean; who: string }) {
  return (
    <>
      <div className="relative h-10 w-14 shrink-0">
        {/* The cookie cracks in two and the halves tip apart. */}
        {[-1, 1].map((dir) => (
          <motion.div
            key={dir}
            className="absolute top-1 h-8 w-7 rounded-[50%_50%_45%_45%/70%_70%_30%_30%]"
            style={{
              left: dir < 0 ? 0 : '50%',
              background: 'radial-gradient(circle at 40% 30%, #ffd89a, #e2a24c 60%, #b8742a)',
              boxShadow: 'inset 0 -4px 8px rgba(0,0,0,.2)',
            }}
            initial={false}
            animate={reduced ? {} : { x: [0, 0, dir * 6], rotate: [0, dir * -4, dir * 24], y: [0, -3, 2] }}
            transition={{ duration: 0.8, times: [0, 0.35, 1], ease: 'easeOut' }}
          />
        ))}
      </div>
      <div className="min-w-0 text-left">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-mist">{who} cracked a fortune</p>
        <motion.p
          className="max-w-[26rem] text-[1rem] italic leading-snug text-chalk"
          initial={reduced ? false : { opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
          transition={{ delay: reduced ? 0 : 0.55, duration: 0.7, ease: 'easeOut' }}
        >
          “{text}”
        </motion.p>
      </div>
    </>
  )
}

function EightBall({ question, text, reduced, who }: { question: string; text: string; reduced: boolean; who: string }) {
  const done = useSettled(1000, reduced)
  return (
    <>
      <motion.div
        className="relative grid size-14 shrink-0 place-items-center rounded-full"
        style={{ background: 'radial-gradient(circle at 34% 28%, #55555e, #0b0b0d 62%)', boxShadow: '0 12px 26px -10px rgba(0,0,0,.8)' }}
        animate={reduced ? {} : { x: [0, -6, 6, -5, 5, -2, 2, 0], rotate: [0, -8, 8, -6, 6, -2, 2, 0] }}
        transition={{ duration: 0.85 }}
      >
        <motion.span
          className="block size-6"
          style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)', background: 'linear-gradient(#3d5bff, #1c2fa8)' }}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: done ? 1 : 0 }}
        />
      </motion.div>
      <div className="min-w-0 text-left">
        <p className="truncate text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-mist">
          {question ? `${who}: “${question}”` : `${who} asked the 8-ball`}
        </p>
        <motion.p
          className="font-display text-[1.3rem] font-semibold leading-tight tracking-[-0.02em] text-chalk"
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
        >
          {text}
        </motion.p>
      </div>
    </>
  )
}

function Bottle({ event, reduced, youId }: { event: ToyEvent & { toy: 'bottle' }; reduced: boolean; youId: string | null }) {
  const stage = document.querySelector<HTMLElement>('[data-hub-stage]')?.getBoundingClientRect()
  const cx = stage ? stage.left + stage.width / 2 : window.innerWidth / 2
  /* On the floor between everyone, where a bottle would actually be spun. */
  const cy = stage ? stage.top + stage.height * 0.84 : window.innerHeight * 0.7
  const target = useAnchor(event.target.id)
  /* 0deg points straight up; aim the neck at the target's head. */
  const aim = (Math.atan2(target.y - cy, target.x - cx) * 180) / Math.PI + 90
  const final = event.turns * 360 + aim
  const [done, setDone] = useState(reduced)
  useEffect(() => {
    if (reduced) return
    const timer = setTimeout(() => setDone(true), 2600)
    return () => clearTimeout(timer)
  }, [reduced])
  const name = event.target.id === youId ? 'You!' : `${event.target.name}!`

  return (
    <>
      <motion.div
        className="absolute"
        style={{ left: cx, top: cy, x: '-50%', y: '-50%' }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <motion.svg
          viewBox="0 0 40 120"
          width={46}
          height={138}
          initial={{ rotate: reduced ? aim : 0 }}
          animate={{ rotate: final }}
          transition={{ duration: reduced ? 0 : 2.6, ease: [0.12, 0.65, 0.2, 1] }}
          style={{ filter: 'drop-shadow(0 12px 18px rgba(0,0,0,.55))' }}
        >
          <defs>
            <linearGradient id="glass" x1="0" x2="1">
              <stop offset="0" stopColor="#0d5c3a" />
              <stop offset="0.45" stopColor="#2fa36b" />
              <stop offset="1" stopColor="#0a4a2e" />
            </linearGradient>
          </defs>
          <rect x="15" y="2" width="10" height="8" rx="2" fill="#c9a227" />
          <path d="M16 10h8v22c0 6 10 12 10 24v54a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V56c0-12 10-18 10-24z" fill="url(#glass)" />
          <path d="M11 60c0-6 2-10 5-13" stroke="#fff" strokeOpacity=".45" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="8" y="70" width="24" height="26" rx="3" fill="#f4ecd8" opacity=".9" />
        </motion.svg>
      </motion.div>
      {done && (
        <motion.div
          className="absolute"
          style={{ left: target.x, top: target.y - 10, x: '-50%', y: '-100%' }}
          initial={{ opacity: 0, scale: 0.5, y: '-80%' }}
          animate={{ opacity: 1, scale: 1, y: '-100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        >
          <span className="glass-pill-ink block whitespace-nowrap rounded-full px-5 py-2 font-display text-[1.25rem] font-semibold text-chalk ring-2 ring-signal/70">
            {name}
          </span>
        </motion.div>
      )}
    </>
  )
}
