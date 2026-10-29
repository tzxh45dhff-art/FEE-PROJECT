import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Camera, Check, ChevronRight, CircleHelp, Crown, Flame, Heart, Laugh, Moon, PenLine, Send, Shuffle, Sparkles, Trophy, Users, X } from 'lucide-react'

import { BorderBeam } from '@/components/ui/border-beam'
import { Particles } from '@/components/ui/particles'
import { Ripple } from '@/components/ui/ripple'
import { ShineBorder } from '@/components/ui/shine-border'
import { cn } from '@/lib/utils'

/**
 * Truth or dare, on screen.
 *
 * A neon stage: everyone around the bottle, a blue truth and a pink dare to
 * choose between, and the card flipping over like one dealt from a deck.
 * Built for people who are not in the same room as much as for people who
 * are — the truth can be typed for everyone to read, a dare can come with a
 * photo, and everyone watching can react or say they are not convinced.
 */

type Person = { id: string; name: string }
type Kind = 'truth' | 'dare'
type Card = { id: string; deck: string; kind: Kind; text: string; custom: boolean; fresh?: boolean }
type Tally = { truths: number; dares: number; chickens: number }

export type TruthDareView = {
  decks: string[]
  players: Person[]
  phase: 'spin' | 'choose' | 'pick' | 'perform' | 'over'
  asker: number
  answerer: number | null
  spin: { n: number; turns: number } | null
  choice: Kind | null
  offered: Card[]
  offeredCount: number
  card: Card | null
  tally: Record<string, Tally>
  round: number
  log: { asker: string; answerer: string; kind: Kind; text: string; outcome: 'done' | 'chicken'; answer?: string }[]
  answer: string | null
  proof: string | null
  reactions: { id: number; by: string; emoji: string }[]
  doubts: string[]
}

const MODES = [
  { id: 'funny', label: 'Funny', blurb: 'Bad decisions, petty confessions and roasting yourself.', icon: Laugh, tone: 'from-amber-400/35 via-orange-500/15', glow: '#f59e0b' },
  { id: 'friends', label: 'Friends', blurb: 'Inside jokes, honest opinions and calling each other out.', icon: Users, tone: 'from-sky-400/35 via-blue-600/15', glow: '#38bdf8' },
  { id: 'couples', label: 'Couples', blurb: 'Chemistry, jealousy and things left unsaid.', icon: Heart, tone: 'from-pink-400/35 via-rose-500/15', glow: '#f472b6' },
  { id: 'deep', label: 'Deep', blurb: 'Ego, insecurities and the things you dodge.', icon: Moon, tone: 'from-violet-400/35 via-purple-600/15', glow: '#a78bfa' },
  { id: 'spicy', label: 'Spicy', blurb: 'Turn-ons, risky confessions and obvious tension. 18+.', icon: Flame, tone: 'from-red-500/40 via-fuchsia-600/15', glow: '#f43f5e' },
] as const

const REACTIONS = ['😂', '🔥', '😳', '💀', '👏', '🥺', '😍', '🙈'] as const

const deckLabel = (id: string) => MODES.find((d) => d.id === id)?.label ?? id

/** Each person keeps one colour all game, from their id. */
function hueFor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

/** The neon room every screen of the game sits in. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-[20%] top-[10%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(56,130,246,.28),transparent)]" />
      <div className="absolute -right-[15%] bottom-[0%] h-[75%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(236,72,153,.26),transparent)]" />
      <div className="absolute left-[30%] top-[-20%] h-[50%] w-[45%] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,.22),transparent)]" />
      <Particles className="absolute inset-0" quantity={55} ease={70} size={0.5} color="#d8ccff" refresh={false} />
    </div>
  )
}

function NeonTitle({ compact = false }: { compact?: boolean }) {
  return (
    <motion.div
      className={cn('relative flex flex-col items-center leading-none select-none', compact ? 'gap-0.5' : 'gap-1')}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.span animate={{ y: [0, -4, 0], rotate: [-4, 2, -4] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <Crown aria-hidden className={cn('text-violet-300 drop-shadow-[0_0_12px_rgba(167,139,250,.9)]', compact ? 'size-6' : 'size-9')} />
      </motion.span>
      <span
        className={cn(
          /* Padded so the italic's lean isn't cut off where the gradient ends; glow by text-shadow, which draws under a clipped-text fill without a filter's layer. */
          'px-[0.14em] font-display font-black italic tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 [text-shadow:0_0_26px_rgba(56,189,248,.55),0_0_60px_rgba(56,189,248,.25)]',
          compact ? 'text-[2.2rem]' : 'text-[clamp(3rem,7vw,5.2rem)]',
        )}
      >
        TRUTH
      </span>
      <span className={cn('font-display font-semibold italic text-white/80', compact ? 'text-[0.9rem]' : 'text-[1.4rem]')}>or</span>
      <span
        className={cn(
          'px-[0.14em] font-display font-black italic tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-400 [text-shadow:0_0_26px_rgba(236,72,153,.6),0_0_60px_rgba(236,72,153,.28)]',
          compact ? 'text-[2.2rem]' : 'text-[clamp(3rem,7vw,5.2rem)]',
        )}
      >
        DARE
      </span>
    </motion.div>
  )
}

// ── setup ─────────────────────────────────────────────────────────────────────

export function TruthDareSetup({
  people,
  error,
  onStart,
}: {
  people: number
  error: string | null
  onStart: (options: { decks: string[]; adults: boolean }) => void
}) {
  const [decks, setDecks] = useState<string[]>(['funny', 'friends'])
  const [adults, setAdults] = useState(false)
  const spicy = decks.includes('spicy')
  const toggle = (id: string) => setDecks((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  const ready = decks.length > 0 && (!spicy || adults) && people >= 2

  return (
    <div className="relative isolate min-h-full w-full overflow-hidden">
      <Backdrop />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 pb-10 pt-4 lg:min-h-[calc(100dvh-6rem)] lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-10">
        {/* The poster. */}
        <div className="flex flex-col items-center text-center">
          <NeonTitle />
          <p className="mt-5 text-[1rem] font-medium text-white/85 sm:text-[1.1rem]">Secrets. Tension. Your turn.</p>
          <p className="mt-2 max-w-sm text-pretty text-[0.85rem] leading-relaxed text-mist">
            Pick your decks. Roast yourself, call out a friend, or say the thing you keep turning into a joke.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[0.78rem] text-chalk backdrop-blur">
            <Users aria-hidden className="size-3.5 text-violet-300" /> {people} {people === 1 ? 'person' : 'people'} in the room
          </span>
        </div>

        {/* The decks. */}
        <div className="flex flex-col">
          <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-violet-200/80">Choose your decks</p>
          <div className="flex flex-col gap-2.5" role="group" aria-label="Decks">
            {MODES.map((mode, i) => {
              const on = decks.includes(mode.id)
              const Icon = mode.icon
              return (
                <motion.button
                  key={mode.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(mode.id)}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  className={cn(
                    'group relative flex items-center gap-4 overflow-hidden rounded-[1.3rem] border p-3.5 text-left outline-none transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:p-4',
                    on ? 'border-white/25 bg-white/[0.06]' : 'border-white/[0.08] bg-white/[0.025] hover:border-white/20',
                  )}
                >
                  <span className={cn('absolute inset-0 bg-gradient-to-r to-transparent transition-opacity duration-300', mode.tone, on ? 'opacity-100' : 'opacity-40 group-hover:opacity-70')} />
                  {on && <ShineBorder borderWidth={1.5} duration={10} shineColor={[mode.glow, '#ffffff', mode.glow]} />}
                  <span
                    className="relative grid size-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-black/30"
                    style={{ boxShadow: on ? `0 0 22px -4px ${mode.glow}` : undefined }}
                  >
                    <Icon aria-hidden className="size-5" style={{ color: mode.glow }} />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block font-display text-[1.08rem] font-semibold text-chalk">
                      {mode.label}
                      {mode.id === 'spicy' && <span className="ml-2 rounded-full bg-rose-500/25 px-1.5 py-0.5 align-middle text-[0.62rem] font-bold text-rose-200">18+</span>}
                    </span>
                    <span className="mt-0.5 block text-[0.8rem] leading-snug text-mist">{mode.blurb}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'relative grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300',
                      on ? 'scale-100 border-white bg-white text-void' : 'border-white/25 text-white/50',
                    )}
                  >
                    {on ? <Check className="size-4" strokeWidth={3} /> : <ChevronRight className="size-4" />}
                  </span>
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {spicy && (
              <motion.label
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-[0.84rem] text-chalk"
              >
                <input type="checkbox" checked={adults} onChange={(e) => setAdults(e.target.checked)} className="size-4 accent-rose-500" />
                Everyone playing is 18 or older.
              </motion.label>
            )}
          </AnimatePresence>

          {error && (
            <p role="alert" className="mt-3 text-[0.82rem] text-signal-bright">
              {error}
            </p>
          )}

          <motion.button
            type="button"
            disabled={!ready}
            onClick={() => onStart({ decks, adults })}
            whileHover={ready ? { scale: 1.015 } : undefined}
            whileTap={ready ? { scale: 0.98 } : undefined}
            className="relative mt-5 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 px-8 py-4 text-[1.02rem] font-semibold text-white shadow-[0_18px_50px_-14px_rgba(139,92,246,.9)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ready && <BorderBeam size={90} duration={5} colorFrom="#ffffff" colorTo="#f0abfc" />}
            {people < 2 ? 'Needs one more person in the room' : `Start the game`}
            <ChevronRight aria-hidden className="size-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// ── the table ─────────────────────────────────────────────────────────────────

const SPIN_MS = 3400

export function TruthDareTable({
  view,
  selfId,
  error,
  act,
  onLeaveTable,
}: {
  view: TruthDareView
  selfId: string | undefined
  error: string | null
  act: (action: string, payload?: Record<string, unknown>) => void
  onLeaveTable: () => void
}) {
  const asker = view.players[view.asker]
  const answerer = view.answerer !== null ? view.players[view.answerer] : null
  const iAsk = asker?.id === selfId
  const iAnswer = answerer?.id === selfId
  const [sheet, setSheet] = useState(false)

  /* The bottle gets to finish spinning before anyone is asked anything. */
  const [settled, setSettled] = useState<number | null>(view.spin?.n ?? null)
  const spinning = view.phase === 'choose' && view.spin !== null && settled !== view.spin.n
  useEffect(() => {
    if (!view.spin) return
    const n = view.spin.n
    /* Spin, then a beat on whoever it landed on, then the question. */
    const timer = window.setTimeout(() => setSettled(n), SPIN_MS + 1100)
    return () => window.clearTimeout(timer)
  }, [view.spin?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  /* A dare done is a small celebration, on every screen. */
  const logLength = useRef(view.log.length)
  useEffect(() => {
    if (view.log.length > logLength.current && view.log.at(-1)?.outcome === 'done') {
      void confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { y: 0.65 }, colors: ['#22d3ee', '#a78bfa', '#f472b6', '#facc15'], disableForReducedMotion: true })
    }
    logLength.current = view.log.length
  }, [view.log])

  if (view.phase === 'over') return <Summary view={view} selfId={selfId} onLeaveTable={onLeaveTable} />

  const status =
    view.phase === 'spin'
      ? iAsk
        ? 'Your turn to spin'
        : `${asker?.name} is spinning`
      : spinning
        ? 'Round and round…'
        : view.phase === 'choose'
          ? iAnswer
            ? 'Truth or dare?'
            : `${answerer?.name} is choosing`
          : view.phase === 'pick'
            ? iAsk
              ? `Pick ${answerer?.name}’s ${view.choice}`
              : `${asker?.name} is picking ${iAnswer ? 'your' : `${answerer?.name}’s`} ${view.choice}`
            : iAnswer
              ? 'You’re up'
              : `${answerer?.name} is up`

  return (
    <div className="relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden">
      <Backdrop />

      {/* What's happening, at a glance. */}
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 lg:px-8">
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-violet-200 backdrop-blur">
          Round {view.round}
        </span>
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="min-w-0 truncate text-center font-display text-[1rem] font-semibold text-chalk sm:text-[1.1rem]"
            role="status"
            aria-live="polite"
          >
            {status}
          </motion.p>
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.75rem] text-chalk backdrop-blur lg:invisible"
        >
          <Trophy aria-hidden className="size-3.5 text-amber-300" /> Scores
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 px-4 pb-5 lg:grid-cols-[1fr_18rem] lg:px-8">
        {/* Centred with auto margins, not justify-center: content taller than
            the screen then scrolls from its top instead of being cut off. */}
        <div data-lenis-prevent className="relative flex min-h-0 flex-col items-center overflow-y-auto py-2 [&>*:not(.absolute)]:my-auto">
          <Floaters reactions={view.reactions} />
          <AnimatePresence mode="wait">
            {(view.phase === 'spin' || spinning) && (
              <Scene key="arena">
                <Arena view={view} selfId={selfId} landed={!spinning && view.phase !== 'spin'} />
                {view.phase === 'spin' &&
                  (iAsk ? (
                    <GlowButton onClick={() => act('spin')} autoFocus>
                      Spin the bottle
                    </GlowButton>
                  ) : (
                    <p className="mt-5 text-[0.9rem] text-mist">Waiting for {asker?.name} to spin…</p>
                  ))}
              </Scene>
            )}

            {view.phase === 'choose' && !spinning && (
              <Scene key={`choose-${view.round}`}>
                <Choose canChoose={iAnswer} who={answerer?.name ?? ''} onChoose={(kind) => act('choose', { kind })} />
              </Scene>
            )}

            {view.phase === 'pick' && (
              <Scene key={`pick-${view.round}`}>{iAsk ? <Picker view={view} answerer={answerer} act={act} /> : <Waiting view={view} />}</Scene>
            )}

            {view.phase === 'perform' && view.card && (
              <Scene key={`perform-${view.round}`}>
                <Perform view={view} selfId={selfId} answerer={answerer} asker={asker} iAnswer={iAnswer} iAsk={iAsk} act={act} />
              </Scene>
            )}
          </AnimatePresence>

          {error && (
            <p role="alert" className="mt-3 text-center text-[0.82rem] text-signal-bright">
              {error}
            </p>
          )}
        </div>

        <aside className="hidden min-h-0 flex-col gap-3 lg:flex">
          <Side view={view} selfId={selfId} act={act} />
        </aside>
      </div>

      {/* On a phone the scores live in a sheet, so the stage keeps the screen. */}
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-[150] flex items-end bg-black/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
            <motion.div
              data-lenis-prevent
              className="max-h-[80dvh] w-full overflow-y-auto rounded-t-[1.6rem] border-t border-white/10 bg-[#120c1d] p-4 pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
              <Side view={view} selfId={selfId} act={act} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center"
    >
      {children}
    </motion.div>
  )
}

function GlowButton({
  children,
  onClick,
  autoFocus,
  tone = 'violet',
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  autoFocus?: boolean
  tone?: 'violet' | 'pink'
  className?: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'relative mt-6 flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-[0.98rem] font-semibold text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        tone === 'violet'
          ? 'bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 shadow-[0_16px_44px_-12px_rgba(139,92,246,.9)]'
          : 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 shadow-[0_16px_44px_-12px_rgba(236,72,153,.9)]',
        className,
      )}
    >
      <BorderBeam size={70} duration={4} colorFrom="#ffffff" colorTo={tone === 'violet' ? '#e9d5ff' : '#fbcfe8'} />
      {children}
    </motion.button>
  )
}

/** A face, in its owner's colour, with their role worn on it. */
function Avatar({ person, size = 'md', role }: { person: Person; size?: 'sm' | 'md'; role?: 'asker' | 'answerer' | null }) {
  const hue = hueFor(person.id)
  return (
    <span className={cn('relative grid shrink-0 place-items-center rounded-full p-[2px]', size === 'md' ? 'size-14' : 'size-9')} style={{ background: `conic-gradient(from 210deg, hsl(${hue} 90% 65%), hsl(${(hue + 60) % 360} 90% 60%), hsl(${hue} 90% 65%))` }}>
      <span
        className={cn('grid size-full place-items-center rounded-full font-display font-semibold text-white', size === 'md' ? 'text-[1.15rem]' : 'text-[0.8rem]')}
        style={{ background: `radial-gradient(circle at 35% 30%, hsl(${hue} 70% 42%), hsl(${hue} 60% 18%))` }}
      >
        {person.name.slice(0, 1).toUpperCase()}
      </span>
      {role === 'asker' && <Crown aria-label="Spinning" className={cn('absolute -top-3 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,.9)]', size === 'md' ? 'size-5' : 'size-3.5')} />}
    </span>
  )
}

/** Everyone around a lit platform, and the bottle that decides. */
function Arena({ view, selfId, landed }: { view: TruthDareView; selfId: string | undefined; landed: boolean }) {
  const n = view.players.length
  const angleOf = (i: number) => (i / n) * 360
  /* Cumulative, so each spin carries on from where the last one stopped. */
  const rotation = useRef(view.answerer !== null ? angleOf(view.answerer) : 0)
  const [target, setTarget] = useState(rotation.current)
  useEffect(() => {
    if (!view.spin || view.answerer === null) return
    const want = angleOf(view.answerer)
    const base = rotation.current - (rotation.current % 360)
    const next = base + (view.spin.turns + 2) * 360 + want
    rotation.current = next
    setTarget(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.spin?.n])

  return (
    <div className="relative aspect-square w-[min(27rem,84vw,52dvh)]">
      {/* The platform. */}
      <div className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,.35),rgba(76,29,149,.18)_45%,transparent_70%)]" />
      <div className="absolute inset-[22%] rounded-full border border-violet-300/25 shadow-[0_0_60px_-10px_rgba(167,139,250,.8),inset_0_0_40px_rgba(167,139,250,.25)]" />
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <Ripple mainCircleSize={110} numCircles={5} mainCircleOpacity={0.18} className="[mask-image:none]" />
      </div>

      {view.players.map((p, i) => {
        const a = ((angleOf(i) - 90) * Math.PI) / 180
        const chosen = landed && i === view.answerer
        return (
          <motion.div
            key={p.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ left: `${50 + Math.cos(a) * 43}%`, top: `${50 + Math.sin(a) * 43}%` }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: chosen ? 1.18 : 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: chosen ? 0 : i * 0.05 }}
          >
            <span className="relative">
              {chosen && (
                <motion.span
                  aria-hidden
                  className="absolute -inset-2 rounded-full bg-pink-500/40 blur-md"
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
              <Avatar person={p} role={i === view.asker ? 'asker' : chosen ? 'answerer' : null} />
            </span>
            <span className={cn('max-w-[6.5rem] truncate rounded-full px-2 py-0.5 text-[0.72rem] font-medium backdrop-blur', chosen ? 'bg-pink-500/30 text-white' : 'bg-black/40 text-white/80')}>
              {p.id === selfId ? 'You' : p.name}
            </span>
          </motion.div>
        )
      })}

      {/* The bottle: fast at first, then easing to a stop like a real one. */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[46%] w-[15%] -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: target }}
        transition={{ duration: SPIN_MS / 1000, ease: [0.15, 0.85, 0.25, 1] }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <Bottle />
      </motion.div>
    </div>
  )
}

function Bottle() {
  return (
    <svg viewBox="0 0 40 130" className="size-full drop-shadow-[0_18px_22px_rgba(0,0,0,.65)]" aria-hidden>
      <defs>
        <linearGradient id="tdBody" x1="0" x2="1">
          <stop offset="0" stopColor="#14532d" />
          <stop offset="0.35" stopColor="#22c55e" />
          <stop offset="0.55" stopColor="#4ade80" />
          <stop offset="1" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="tdShine" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="tdGlow" cx="0.5" cy="0.1" r="0.6">
          <stop offset="0" stopColor="#f0abfc" stopOpacity=".9" />
          <stop offset="1" stopColor="#f0abfc" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* The neck points at the chosen one, so it glows. */}
      <ellipse cx="20" cy="8" rx="14" ry="10" fill="url(#tdGlow)" />
      <rect x="15" y="2" width="10" height="9" rx="2.5" fill="#fbbf24" />
      <rect x="15" y="9" width="10" height="2" fill="#b45309" />
      <path d="M16 11h8v22c0 7 11 12 11 26v56a10 10 0 0 1-10 10H15A10 10 0 0 1 5 115V59c0-14 11-19 11-26z" fill="url(#tdBody)" />
      <path d="M16 11h8v22c0 7 11 12 11 26v56a10 10 0 0 1-10 10H15A10 10 0 0 1 5 115V59c0-14 11-19 11-26z" fill="none" stroke="#bbf7d0" strokeOpacity=".5" strokeWidth=".8" />
      <path d="M10 64c0-7 2-12 6-15" stroke="url(#tdShine)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="9" y="64" width="3" height="44" rx="1.5" fill="#fff" opacity=".25" />
      <rect x="7" y="76" width="26" height="24" rx="3" fill="#fdf4e3" opacity=".95" />
      <text x="20" y="91" textAnchor="middle" fontSize="7" fontWeight="800" fill="#9d174d" fontFamily="system-ui">T·D</text>
    </svg>
  )
}

/** Two cards on a lit stand: a blue truth, a pink dare. */
function Choose({ canChoose, who, onChoose }: { canChoose: boolean; who: string; onChoose: (kind: Kind) => void }) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative flex items-end justify-center gap-4 pt-4 sm:gap-8">
        {(['truth', 'dare'] as const).map((kind, i) => {
          const truth = kind === 'truth'
          return (
            <motion.button
              key={kind}
              type="button"
              disabled={!canChoose}
              onClick={() => onChoose(kind)}
              initial={{ opacity: 0, y: 40, rotate: truth ? -14 : 14 }}
              animate={{ opacity: canChoose ? 1 : 0.75, y: 0, rotate: truth ? -7 : 7 }}
              whileHover={canChoose ? { y: -14, rotate: truth ? -3 : 3, scale: 1.05 } : undefined}
              whileTap={canChoose ? { scale: 0.96 } : undefined}
              transition={{ type: 'spring', stiffness: 200, damping: 16, delay: i * 0.08 }}
              aria-label={truth ? 'Truth' : 'Dare'}
              className={cn(
                'relative flex h-[min(16rem,36dvh)] w-[min(11.5rem,40vw)] flex-col items-center justify-center gap-4 overflow-hidden rounded-[1.6rem] border-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-default',
                truth
                  ? 'border-cyan-300/70 bg-[linear-gradient(160deg,#0b2a5b,#0a1637_60%,#081026)] shadow-[0_0_40px_-6px_rgba(34,211,238,.75),inset_0_0_30px_rgba(34,211,238,.25)]'
                  : 'border-pink-400/70 bg-[linear-gradient(160deg,#5b0b3d,#3a0a2e_60%,#200718)] shadow-[0_0_40px_-6px_rgba(236,72,153,.8),inset_0_0_30px_rgba(236,72,153,.25)]',
              )}
            >
              {canChoose && <BorderBeam size={120} duration={6} delay={i * 1.5} colorFrom={truth ? '#67e8f9' : '#f9a8d4'} colorTo={truth ? '#3b82f6' : '#e11d48'} />}
              {truth ? (
                <CircleHelp aria-hidden className="size-[34%] text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,.9)]" />
              ) : (
                <Flame aria-hidden className="size-[34%] text-pink-400 drop-shadow-[0_0_14px_rgba(236,72,153,.9)]" />
              )}
              <span
                className={cn(
                  'font-display text-[clamp(1.4rem,4vw,2rem)] font-black italic tracking-[-0.02em]',
                  truth ? 'text-cyan-200 [text-shadow:0_0_18px_rgba(34,211,238,.8)]' : 'text-pink-200 [text-shadow:0_0_18px_rgba(236,72,153,.85)]',
                )}
              >
                {truth ? 'TRUTH' : 'DARE'}
              </span>
            </motion.button>
          )
        })}
      </div>
      {/* The stand they rest on. */}
      <div className="relative -mt-3 h-10 w-[min(28rem,86vw)] rounded-[50%] border border-violet-300/30 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,.45),rgba(236,72,153,.15)_50%,transparent_72%)] shadow-[0_0_50px_-8px_rgba(167,139,250,.8)]" />
      <p className="mt-4 text-[0.95rem] text-white/80">{canChoose ? 'What will you choose?' : `What will ${who} choose?`}</p>
    </div>
  )
}

/** For everyone but the asker: three cards face down, while one is chosen. */
function Waiting({ view }: { view: TruthDareView }) {
  const truth = view.choice === 'truth'
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-3 sm:gap-4" aria-hidden>
        {Array.from({ length: view.offeredCount || 3 }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              'h-40 w-28 rounded-2xl border-2 sm:h-48 sm:w-32',
              truth ? 'border-cyan-300/50 shadow-[0_0_30px_-8px_rgba(34,211,238,.6)]' : 'border-pink-400/50 shadow-[0_0_30px_-8px_rgba(236,72,153,.6)]',
            )}
            /* The pattern sits on the colour, as on the back of a real card. */
            style={{
              backgroundImage: `repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 8px,transparent 8px 16px),linear-gradient(160deg,${truth ? '#0b2a5b,#081026' : '#5b0b3d,#200718'})`,
            }}
            animate={{ y: [0, -10, 0], rotate: [(i - 1) * 6, (i - 1) * -3, (i - 1) * 6] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <p className="mt-6 text-[0.9rem] text-mist">The cards are being chosen…</p>
    </div>
  )
}

function Picker({ view, answerer, act }: { view: TruthDareView; answerer: Person | null | undefined; act: (action: string, payload?: Record<string, unknown>) => void }) {
  const [writing, setWriting] = useState(false)
  const [custom, setCustom] = useState('')
  const truth = view.choice === 'truth'
  return (
    <div className="flex w-full max-w-4xl flex-col items-center">
      <p className="text-[0.9rem] text-mist">
        {answerer?.name} chose <span className={cn('font-semibold', truth ? 'text-cyan-300' : 'text-pink-400')}>{view.choice}</span>. Deal them one:
      </p>
      <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">
        {view.offered.map((card, i) => (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => act('pick', { index: i })}
            initial={{ opacity: 0, y: 30, rotate: (i - 1) * 6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: i * 0.07 }}
            className={cn(
              'relative flex min-h-40 flex-col overflow-hidden rounded-[1.3rem] border p-4 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
              truth ? 'border-cyan-300/40 bg-[linear-gradient(160deg,rgba(14,58,120,.7),rgba(8,16,38,.85))]' : 'border-pink-400/40 bg-[linear-gradient(160deg,rgba(120,14,80,.7),rgba(32,7,24,.85))]',
            )}
          >
            <span className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/60">
              {deckLabel(card.deck)}
              {card.fresh && (
                <span className="flex items-center gap-1 rounded-full bg-amber-300/20 px-2 py-0.5 tracking-normal text-amber-200 normal-case">
                  <Sparkles aria-hidden className="size-3" /> New
                </span>
              )}
            </span>
            <span className="mt-3 text-[0.98rem] font-medium leading-snug text-white">{card.text}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => act('shuffle')} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[0.82rem] text-chalk outline-none backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">
          <Shuffle aria-hidden className="size-3.5" /> Three different ones
        </button>
        <button type="button" onClick={() => setWriting((w) => !w)} aria-expanded={writing} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[0.82rem] text-chalk outline-none backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">
          <PenLine aria-hidden className="size-3.5" /> Write my own
        </button>
      </div>
      <AnimatePresence>
        {writing && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex w-full max-w-xl gap-2 overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault()
              if (custom.trim().length >= 3) act('custom', { text: custom })
            }}
          >
            <label htmlFor="td-custom" className="sr-only">
              Your own {view.choice}
            </label>
            <input
              id="td-custom"
              autoFocus
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              maxLength={200}
              placeholder={truth ? 'Ask them anything…' : 'Dare them to…'}
              className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2.5 text-[0.9rem] text-chalk placeholder:text-dusk focus:border-violet-400/60 focus:outline-none"
            />
            <button type="submit" className="rounded-full bg-white px-5 text-[0.84rem] font-semibold text-void outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
              Use it
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

/** The card, turned over — and everything people apart need to play it. */
function Perform({
  view,
  selfId,
  answerer,
  asker,
  iAnswer,
  iAsk,
  act,
}: {
  view: TruthDareView
  selfId: string | undefined
  answerer: Person | null | undefined
  asker: Person | undefined
  iAnswer: boolean
  iAsk: boolean
  act: (action: string, payload?: Record<string, unknown>) => void
}) {
  const card = view.card!
  const truth = card.kind === 'truth'
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const doubting = selfId ? view.doubts.includes(selfId) : false
  const others = view.players.length - 1

  async function sendPhoto(input: File) {
    setSending(true)
    try {
      act('proof', { image: await shrink(input) })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center">
      {/* The card flips in. */}
      <motion.div
        initial={{ rotateY: 100, opacity: 0, scale: 0.9 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        style={{ transformPerspective: 1200 }}
        className={cn(
          'relative w-full overflow-hidden rounded-[1.8rem] border-2 px-6 pb-8 pt-6 text-center sm:px-10',
          truth
            ? 'border-cyan-300/60 bg-[linear-gradient(165deg,#0d2d63,#0a1637_55%,#070d22)] shadow-[0_0_60px_-10px_rgba(34,211,238,.7)]'
            : 'border-pink-400/60 bg-[linear-gradient(165deg,#5e0d40,#3a0a2e_55%,#1d0716)] shadow-[0_0_60px_-10px_rgba(236,72,153,.75)]',
        )}
      >
        <BorderBeam size={160} duration={8} colorFrom={truth ? '#a5f3fc' : '#fbcfe8'} colorTo={truth ? '#3b82f6' : '#e11d48'} />
        <p className="flex items-center justify-between text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/60">
          <span>
            {card.kind} for {answerer?.id === selfId ? 'you' : answerer?.name}
          </span>
          <span className="flex items-center gap-1">
            {card.custom ? `written by ${asker?.id === selfId ? 'you' : asker?.name}` : deckLabel(card.deck)}
            {card.fresh && <Sparkles aria-label="a new card" className="size-3 text-amber-200" />}
          </span>
        </p>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 14 }} className="mt-4 flex justify-center">
          {truth ? <CircleHelp aria-hidden className="size-10 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,.9)]" /> : <Flame aria-hidden className="size-10 text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,.9)]" />}
        </motion.div>
        <p className="mt-4 text-balance font-display text-[clamp(1.35rem,3.2vw,2rem)] font-semibold leading-snug tracking-[-0.015em] text-white">{card.text}</p>
      </motion.div>

      {/* The answer, for whoever isn't sitting next to them. */}
      <AnimatePresence>
        {view.answer && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mt-4 w-full rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-4 text-left">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">{answerer?.id === selfId ? 'Your answer' : `${answerer?.name} says`}</p>
            <p className="mt-1 text-[1.02rem] leading-relaxed text-white">“{view.answer}”</p>
          </motion.div>
        )}
        {view.proof && (
          <motion.figure initial={{ opacity: 0, y: 14, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -1.5 }} className="mt-4 rounded-md bg-[#fbf8f2] p-2 pb-7 shadow-[0_24px_50px_-18px_rgba(0,0,0,.9)]">
            <img src={view.proof} alt={`${answerer?.name}'s dare`} className="max-h-64 w-auto rounded-sm object-contain" />
            <figcaption className="mt-1.5 text-center text-[0.72rem] italic text-[#3a3340]">proof, from {answerer?.id === selfId ? 'you' : answerer?.name}</figcaption>
          </motion.figure>
        )}
      </AnimatePresence>

      {iAnswer && truth && !view.answer && (
        <form
          className="mt-4 flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim()) act('answer', { text: draft })
          }}
        >
          <label htmlFor="td-answer" className="sr-only">
            Your answer
          </label>
          <input
            id="td-answer"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={280}
            placeholder="Type your answer — or just say it on the call"
            className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-[0.92rem] text-chalk placeholder:text-dusk focus:border-cyan-300/60 focus:outline-none"
          />
          <button type="submit" disabled={!draft.trim()} aria-label="Send answer" className="grid size-12 shrink-0 place-items-center rounded-full bg-cyan-400 text-void outline-none transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40">
            <Send className="size-4" />
          </button>
        </form>
      )}

      {iAnswer && !truth && !view.proof && (
        <>
          <input
            ref={file}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void sendPhoto(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={sending}
            onClick={() => file.current?.click()}
            className="mt-4 flex items-center gap-2 rounded-full border border-pink-300/40 bg-pink-500/10 px-5 py-2.5 text-[0.86rem] font-medium text-pink-100 outline-none transition-colors hover:bg-pink-500/20 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50"
          >
            <Camera aria-hidden className="size-4" /> {sending ? 'Sending…' : 'Send photo proof'}
            <span className="text-pink-200/60">· or do it on camera</span>
          </button>
        </>
      )}

      {/* Everyone else: react, or call it out. */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
        {REACTIONS.map((emoji) => (
          <motion.button
            key={emoji}
            type="button"
            onClick={() => act('react', { emoji })}
            whileHover={{ scale: 1.2, y: -2 }}
            whileTap={{ scale: 0.85 }}
            aria-label={`React ${emoji}`}
            className="grid size-10 place-items-center rounded-full bg-white/[0.06] text-[1.25rem] outline-none backdrop-blur focus-visible:outline-2 focus-visible:outline-white"
          >
            {emoji}
          </motion.button>
        ))}
        {!iAnswer && (
          <button
            type="button"
            onClick={() => act('doubt')}
            aria-pressed={doubting}
            className={cn(
              'ml-1 rounded-full border px-3.5 py-2 text-[0.8rem] font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-white',
              doubting ? 'border-amber-300/70 bg-amber-400/20 text-amber-100' : 'border-white/15 bg-white/[0.04] text-chalk hover:bg-white/10',
            )}
          >
            🤨 Not convinced
          </button>
        )}
      </div>
      {view.doubts.length > 0 && (
        <p className="mt-2 text-[0.8rem] text-amber-200">
          {view.doubts.length} of {others} not convinced{view.doubts.length * 2 > others ? ' — do it properly!' : ''}
        </p>
      )}

      {(iAnswer || iAsk) && (
        <div className="mt-5 flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
          <GlowButton tone="pink" onClick={() => act('done')} className="mt-0 flex-1">
            <Check aria-hidden className="size-5" strokeWidth={3} /> Done
          </GlowButton>
          <button
            type="button"
            onClick={() => act('chicken')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-6 py-3.5 text-[0.92rem] font-semibold text-chalk outline-none backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X aria-hidden className="size-4" /> Chicken out 🐔
          </button>
        </div>
      )}
    </div>
  )
}

/** Reactions rise over the stage as they arrive. */
function Floaters({ reactions }: { reactions: TruthDareView['reactions'] }) {
  const seen = useRef(new Set(reactions.map((r) => r.id)))
  const [flying, setFlying] = useState<{ id: number; emoji: string; by: string; x: number }[]>([])
  useEffect(() => {
    const fresh = reactions.filter((r) => !seen.current.has(r.id))
    if (fresh.length === 0) return
    fresh.forEach((r) => seen.current.add(r.id))
    setFlying((f) => [...f, ...fresh.map((r) => ({ ...r, x: 15 + ((r.id * 37) % 70) }))].slice(-16))
  }, [reactions])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <AnimatePresence>
        {flying.map((f) => (
          <motion.span
            key={f.id}
            className="absolute bottom-6 flex flex-col items-center"
            style={{ left: `${f.x}%` }}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -260, scale: [0.6, 1.2, 1, 0.9], x: [0, 14, -10, 6] }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
            onAnimationComplete={() => setFlying((all) => all.filter((x) => x.id !== f.id))}
          >
            <span className="text-[2rem]">{f.emoji}</span>
            <span className="rounded-full bg-black/50 px-1.5 text-[0.6rem] text-white/80">{f.by}</span>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Who's here, how brave they've been, and what's been said. */
function Side({ view, selfId, act }: { view: TruthDareView; selfId: string | undefined; act: (action: string, payload?: Record<string, unknown>) => void }) {
  return (
    <>
      <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-violet-200/80">Players</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {view.players.map((p, i) => {
            const t = view.tally[p.id] ?? { truths: 0, dares: 0, chickens: 0 }
            return (
              <li key={p.id} className="flex items-center gap-3">
                <Avatar person={p} size="sm" role={i === view.asker ? 'asker' : null} />
                <span className={cn('min-w-0 flex-1 truncate text-[0.86rem]', i === view.answerer && view.phase !== 'spin' ? 'font-semibold text-pink-200' : 'text-chalk')}>{p.id === selfId ? 'You' : p.name}</span>
                <span className="flex shrink-0 gap-1.5 text-[0.74rem] tabular-nums text-mist" aria-label={`${t.truths} truths, ${t.dares} dares, ${t.chickens} chickened out`}>
                  <span title="Truths" className="rounded-full bg-cyan-400/10 px-1.5 text-cyan-200">{t.truths}</span>
                  <span title="Dares" className="rounded-full bg-pink-500/10 px-1.5 text-pink-200">{t.dares}</span>
                  <span title="Chickened out">🐔{t.chickens}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-[0.7rem] text-dusk">{view.decks.map(deckLabel).join(' · ')}</p>
      </div>

      <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto rounded-[1.3rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-violet-200/80">Tonight so far</p>
        {view.log.length === 0 ? (
          <p className="mt-3 text-[0.8rem] text-dusk">Nothing yet. Spin it.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2.5">
            {view.log
              .slice(-6)
              .reverse()
              .map((l, i) => (
                <li key={`${view.log.length}-${i}`} className="text-[0.78rem] leading-snug">
                  <span className={l.kind === 'truth' ? 'text-cyan-200' : 'text-pink-200'}>{l.answerer}</span>
                  <span className="text-mist"> · {l.outcome === 'chicken' ? 'chickened out 🐔' : l.kind === 'truth' ? 'told the truth' : 'did the dare 🔥'}</span>
                  {l.answer && <span className="mt-0.5 block text-white/80">“{l.answer}”</span>}
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => act('skip')} className="flex-1 rounded-full border border-white/12 px-4 py-2 text-[0.78rem] text-mist outline-none transition-colors hover:bg-white/5 hover:text-chalk focus-visible:outline-2 focus-visible:outline-white">
          Skip turn
        </button>
        <button type="button" onClick={() => act('end')} className="flex-1 rounded-full border border-white/12 px-4 py-2 text-[0.78rem] text-mist outline-none transition-colors hover:bg-white/5 hover:text-chalk focus-visible:outline-2 focus-visible:outline-white">
          End game
        </button>
      </div>
    </>
  )
}

function Summary({ view, selfId, onLeaveTable }: { view: TruthDareView; selfId: string | undefined; onLeaveTable: () => void }) {
  const ranked = [...view.players].sort(
    (a, b) => (view.tally[b.id]?.dares ?? 0) - (view.tally[a.id]?.dares ?? 0) || (view.tally[a.id]?.chickens ?? 0) - (view.tally[b.id]?.chickens ?? 0),
  )
  const brave = ranked[0]
  return (
    <div className="relative isolate min-h-full w-full overflow-hidden">
      <Backdrop />
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pt-6 text-center">
        <NeonTitle compact />
        <h2 className="mt-5 font-display text-[2rem] font-semibold tracking-[-0.03em] text-chalk">
          {view.log.length} {view.log.length === 1 ? 'round' : 'rounds'} played
        </h2>
        {brave && (view.tally[brave.id]?.dares ?? 0) > 0 && (
          <p className="mt-1 text-[0.98rem] text-mist">
            Bravest tonight: <span className="font-semibold text-pink-200">{brave.id === selfId ? 'you' : brave.name}</span> 🔥
          </p>
        )}
        <ul className="mt-6 w-full space-y-2 text-left">
          {view.log
            .slice(-5)
            .reverse()
            .map((l, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn('rounded-2xl border px-4 py-3 text-[0.86rem]', l.kind === 'truth' ? 'border-cyan-300/20 bg-cyan-400/[0.06]' : 'border-pink-400/20 bg-pink-500/[0.06]')}
              >
                <span className="text-mist">
                  {l.answerer} · {l.kind} · {l.outcome === 'chicken' ? 'chickened out 🐔' : 'did it ✅'}
                </span>
                <span className="mt-0.5 block text-chalk">{l.text}</span>
                {l.answer && <span className="mt-1 block text-[0.82rem] text-cyan-100">“{l.answer}”</span>}
              </motion.li>
            ))}
        </ul>
        <GlowButton onClick={onLeaveTable}>Back to games</GlowButton>
      </div>
    </div>
  )
}

/** A photo, small enough to send to everyone: longest side 640px, JPEG. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  for (const quality of [0.8, 0.65, 0.5]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length < 230_000) return url
  }
  return canvas.toDataURL('image/jpeg', 0.4)
}
