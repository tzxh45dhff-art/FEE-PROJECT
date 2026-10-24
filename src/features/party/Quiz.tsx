import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ArrowRight, Binoculars, Check, ChevronDown, Clapperboard, Disc3, FastForward, Film, Globe2, Hash, Headphones, Loader2, LockKeyhole, LogIn, Music2, Radio, RotateCcw, Sparkles, Timer, Trophy, Volume2, X } from 'lucide-react'

import { BorderBeam } from '@/components/ui/border-beam'
import { Particles } from '@/components/ui/particles'
import { ClipPlayer, type ClipMedia, type ClipStatus } from '@/features/party/ClipPlayer'
import { Segmented } from '@/features/party/Segmented'
import { remaining, type PartyState } from '@/features/party/useParty'
import { cn } from '@/lib/utils'
import { petCue } from '@/features/pet/petCues'

/**
 * Live trivia and guess the song, on screen — a game show.
 *
 * A dark studio lit in amber, the question on a glass card above a lit
 * pedestal, a ring of a clock, four big answer tiles, and a verdict in marker
 * pen. Both games are the same underneath — a beat to get ready, four options
 * against the clock, a reveal — so they share this table; the song quiz swaps
 * the question card for a record that spins while the clip plays.
 */

type Person = { id: string; name: string }
type Power = 'fifty' | 'skip' | 'time'
type Act = (action: string, payload?: Record<string, unknown>) => void

export type QuizView = {
  players: Person[]
  scores: Record<string, number>
  streaks: Record<string, number>
  best: Record<string, number>
  round: number
  rounds: number
  phase: 'ready' | 'question' | 'reveal' | 'over'
  gains: Record<string, number>
  opensAt: number
  deadline: number | null
  seconds: number
  readyMs: number
  playbackLoading?: boolean
  playbackStarting?: boolean
  soundBlocked?: number
  playbackError?: string | null
  item: {
    prompt: string
    tag: string
    category?: string | null
    difficulty?: string | null
    options: string[]
    answer: number | null
    media: ClipMedia | null
    reveal: { title: string; artist: string | null; artwork: string | null } | null
  } | null
  picks: Record<string, { option: number; ms: number }>
  answered: string[]
  powers?: Power[]
  hidden?: number[]
  extraMs?: number
  fact?: string | null
  reactions?: { id: number; by: string; emoji: string }[]
}

const CATEGORY: Record<string, { icon: typeof Film; tint: string }> = {
  bollywood: { icon: Clapperboard, tint: 'text-rose-300' },
  punjabi: { icon: Music2, tint: 'text-amber-300' },
  global: { icon: Globe2, tint: 'text-sky-300' },
  desiHipHop: { icon: Radio, tint: 'text-violet-300' },
  throwbacks: { icon: Disc3, tint: 'text-orange-300' },
  indie: { icon: Headphones, tint: 'text-emerald-300' },
  cricket: { icon: Trophy, tint: 'text-emerald-300' },
  movies: { icon: Film, tint: 'text-amber-300' },
  music: { icon: Music2, tint: 'text-fuchsia-300' },
  gk: { icon: Globe2, tint: 'text-sky-300' },
}

const TRIVIA_CATEGORIES = [
  { id: 'bollywood', label: 'Bollywood' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'movies', label: 'Movies' },
  { id: 'music', label: 'Music' },
  { id: 'gk', label: 'General knowledge' },
] as const

const SONG_CATEGORIES = [
  { id: 'bollywood', label: 'Bollywood hits', hint: 'Big Hindi songs', icon: Clapperboard },
  { id: 'punjabi', label: 'Punjabi bangers', hint: 'Anthems and new heat', icon: Music2 },
  { id: 'global', label: 'English hits', hint: 'Pop, anthems & chart hits', icon: Globe2 },
  { id: 'desiHipHop', label: 'Desi hip-hop', hint: 'Rap across India', icon: Radio },
  { id: 'throwbacks', label: '90s & 2000s', hint: 'English classics', icon: Disc3 },
  { id: 'indie', label: 'Indie & alt', hint: 'Fresh left-field picks', icon: Headphones },
] as const

type SongDifficulty = 'easy' | 'medium' | 'hard' | 'ramp'
const SONG_DIFFICULTIES: { id: SongDifficulty; label: string; hint: string }[] = [
  { id: 'easy', label: 'Easy', hint: '15 sec · familiar hits' },
  { id: 'medium', label: 'Standard', hint: '10 sec · close calls' },
  { id: 'hard', label: 'Hard', hint: '6 sec · closest matches' },
  { id: 'ramp', label: 'Ramp up', hint: '15 → 10 → 6 seconds' },
]

/* Four answer tiles, each its own lit scene rather than a flat colour. */
const TILE_ART = [
  'bg-[radial-gradient(120%_90%_at_20%_10%,rgba(251,146,60,.55),transparent_55%),linear-gradient(160deg,#3b1d0b,#170c07)]',
  'bg-[radial-gradient(120%_90%_at_80%_10%,rgba(56,189,248,.5),transparent_55%),linear-gradient(160deg,#0a2240,#070f1f)]',
  'bg-[radial-gradient(120%_90%_at_20%_90%,rgba(167,139,250,.5),transparent_55%),linear-gradient(160deg,#21123d,#0d0819)]',
  'bg-[radial-gradient(120%_90%_at_80%_90%,rgba(52,211,153,.45),transparent_55%),linear-gradient(160deg,#0b2d26,#06130f)]',
]

const REACTIONS = ['🔥', '😂', '😱', '👏', '💀', '🤯', '❤️', '😭'] as const

function hueFor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

// ── the studio ────────────────────────────────────────────────────────────────

/** The set every trivia screen sits on: a dark studio, stage lights from above, dust in the beams. */
function Studio() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,#0a0e1c,#070a14_55%,#0b0a12)]">
      <div className="absolute inset-x-0 top-0 h-[70%] bg-[conic-gradient(from_180deg_at_50%_-10%,transparent_150deg,rgba(251,191,36,.10)_165deg,transparent_172deg,rgba(251,191,36,.08)_182deg,transparent_190deg,rgba(251,191,36,.10)_198deg,transparent_212deg)]" />
      <div className="absolute -left-[10%] bottom-[-10%] h-[60%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(245,158,11,.20),transparent)]" />
      <div className="absolute -right-[10%] top-[10%] h-[55%] w-[50%] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,.18),transparent)]" />
      <Particles className="absolute inset-0" quantity={45} ease={80} size={0.45} color="#fcd34d" refresh={false} />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(0,0,0,.6))]" />
    </div>
  )
}

function Marker({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('font-marker leading-[0.95]', className)}>{children}</span>
}

function Avatar({ person, size = 'md', ring }: { person: Person; size?: 'sm' | 'md' | 'lg'; ring?: string }) {
  const hue = hueFor(person.id)
  const box = size === 'lg' ? 'size-16 text-[1.4rem]' : size === 'md' ? 'size-12 text-[1.05rem]' : 'size-8 text-[0.78rem]'
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-full font-display font-semibold text-white ring-2', box, ring ?? 'ring-white/20')}
      style={{ background: `radial-gradient(circle at 35% 30%, hsl(${hue} 70% 50%), hsl(${hue} 60% 22%))` }}
    >
      {person.name.slice(0, 1).toUpperCase()}
    </span>
  )
}

// ── setup ─────────────────────────────────────────────────────────────────────

function Lobby({
  poster,
  players,
  children,
  error,
  ready,
  busy = false,
  label,
  onStart,
}: {
  poster: React.ReactNode
  players: Person[]
  children: React.ReactNode
  error: string | null
  ready: boolean
  busy?: boolean
  label: string
  onStart: () => void
}) {
  return (
    <div className="relative isolate min-h-full w-full overflow-hidden">
      <Studio />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 pb-10 pt-4 lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-2 lg:gap-14 lg:px-10">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {poster}
          <motion.button
            type="button"
            disabled={!ready}
            onClick={onStart}
            whileHover={ready ? { scale: 1.03 } : undefined}
            whileTap={ready ? { scale: 0.97 } : undefined}
            className="relative mt-8 hidden items-center gap-3 overflow-hidden rounded-full bg-lime-300 px-9 py-4 text-[1.05rem] font-bold text-[#0d1206] shadow-[0_18px_50px_-14px_rgba(190,242,100,.85)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40 lg:flex"
          >
            {ready && <BorderBeam size={80} duration={5} colorFrom="#ffffff" colorTo="#d9f99d" />}
            {busy ? 'Building the mix…' : 'Play now'}
            {busy ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <ArrowRight aria-hidden className="size-5" />}
          </motion.button>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md sm:p-6">
          <p className="flex items-center gap-2">
            <Marker className="text-[1.9rem] text-white">Your lobby</Marker>
            <span className="text-[1.3rem]" aria-hidden>
              👑
            </span>
            <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[0.72rem] font-semibold text-white/75">{players.length} in the room</span>
          </p>
          <ul className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {players.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 18 }}
                className="flex min-w-0 flex-col items-center gap-1.5"
              >
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.4 + (i % 3) * 0.4, ease: 'easeInOut', delay: i * 0.2 }}>
                  <Avatar person={p} />
                </motion.span>
                <span className="max-w-full truncate text-[0.72rem] text-white/80">{p.name}</span>
              </motion.li>
            ))}
          </ul>
          <fieldset
            disabled={busy}
            aria-busy={busy}
            className="mt-5 flex min-w-0 flex-col divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-black/20 disabled:opacity-70"
          >
            {children}
          </fieldset>
          {error && (
            <p role="alert" className="mt-3 text-[0.82rem] text-signal-bright">
              {error}
            </p>
          )}
          {/* The brush-stroke start, like a sign painted on the set. */}
          <motion.button
            type="button"
            disabled={!ready}
            onClick={onStart}
            whileHover={ready ? { scale: 1.03, rotate: -1 } : undefined}
            whileTap={ready ? { scale: 0.97 } : undefined}
            className="relative mx-auto mt-6 flex -rotate-2 items-center gap-3 rounded-[0.6rem_1.6rem_0.8rem_1.4rem] bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-10 py-3.5 text-[#1a1203] shadow-[0_16px_40px_-12px_rgba(251,191,36,.8)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40"
          >
            <Marker className="text-[1.45rem]">{label}</Marker>
            {busy ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <ArrowRight aria-hidden className="size-5" />}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <span className="flex items-center gap-2.5 text-[0.86rem] text-white/85">
        <span className="text-white/55" aria-hidden>
          {icon}
        </span>
        {label}
      </span>
      {children}
    </div>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn('relative flex h-7 w-12 items-center rounded-full px-1 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-white', on ? 'justify-end bg-lime-400' : 'justify-start bg-white/15')}
    >
      <motion.span layout className="size-5 rounded-full bg-white shadow" transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
    </button>
  )
}

const startLabel = (people: number) => (people === 1 ? 'Play solo' : 'Start game')

export function TriviaSetup({
  people,
  players = [],
  error,
  onStart,
}: {
  people: number
  players?: Person[]
  error: string | null
  onStart: (options: { categories: string[]; rounds: number; seconds: number; lateJoin: boolean }) => void
}) {
  const [categories, setCategories] = useState<string[]>(TRIVIA_CATEGORIES.map((c) => c.id))
  const [rounds, setRounds] = useState(10)
  const [seconds, setSeconds] = useState(15)
  const [lateJoin, setLateJoin] = useState(true)
  const toggle = (id: string) => setCategories((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  return (
    <Lobby
      players={players}
      error={error}
      ready={categories.length > 0}
      label={categories.length === 0 ? 'Pick a category' : startLabel(people)}
      onStart={() => onStart({ categories, rounds, seconds, lateJoin })}
      poster={
        <>
          <p className="-rotate-3 font-marker text-[1.05rem] leading-tight text-white/65">
            Know fast.
            <br />
            Play live.
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 14, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 160, damping: 16 }}
            className="mt-3 px-2 text-white [text-shadow:0_0_40px_rgba(251,191,36,.35)]"
          >
            <Marker className="block text-[clamp(3.4rem,8vw,6rem)]">Trivia</Marker>
            <Marker className="block pl-[0.6em] text-[clamp(3.4rem,8vw,6rem)]">Live</Marker>
          </motion.h2>
          <svg viewBox="0 0 220 14" className="mt-1 w-56 text-amber-400" aria-hidden>
            <motion.path d="M3 9 C 60 2, 140 2, 217 7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.7 }} />
          </svg>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-white/80">
            Real people.
            <br />
            Real questions.
            <br />
            Real-time chaos.
          </p>
        </>
      }
    >
      <Row icon={<Hash className="size-4" />} label="Questions">
        <Segmented label="Questions" values={[5, 10, 15, 20]} value={rounds} onChange={setRounds} compact />
      </Row>
      <div className="px-4 py-3">
        <span className="text-[0.86rem] text-white/85">Categories</span>
        <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label="Categories">
          {TRIVIA_CATEGORIES.map((c) => {
            const on = categories.includes(c.id)
            const Icon = CATEGORY[c.id]!.icon
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(c.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.78rem] font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-white active:scale-95',
                  on ? 'border-amber-300/60 bg-amber-300/15 text-white' : 'border-white/10 text-white/50 hover:text-white',
                )}
              >
                <Icon aria-hidden className={cn('size-3.5', on && CATEGORY[c.id]!.tint)} />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>
      <Row icon={<Timer className="size-4" />} label="Seconds per question">
        <Segmented label="Seconds per question" values={[10, 15, 20]} value={seconds} onChange={setSeconds} compact />
      </Row>
      <Row icon={<LogIn className="size-4" />} label="Allow late join">
        <Toggle on={lateJoin} onChange={setLateJoin} label="Allow late join" />
      </Row>
    </Lobby>
  )
}

export function SongQuizSetup({
  people,
  players = [],
  error,
  starting = false,
  onStart,
}: {
  people: number
  players?: Person[]
  error: string | null
  starting?: boolean
  onStart: (options: { categories: string[]; difficulty: SongDifficulty; rounds: number; lateJoin: boolean }) => void
}) {
  const [categories, setCategories] = useState<string[]>(['bollywood', 'punjabi', 'global'])
  const [difficulty, setDifficulty] = useState<SongDifficulty>('medium')
  const [rounds, setRounds] = useState(10)
  const [lateJoin, setLateJoin] = useState(true)
  const toggleCategory = (id: string) => {
    setCategories((current) => {
      if (current.includes(id)) return current.length === 1 ? current : current.filter((category) => category !== id)
      return current.length === 3 ? current : [...current, id]
    })
  }
  return (
    <Lobby
      players={players}
      error={error}
      ready={categories.length > 0 && !starting}
      busy={starting}
      label={starting ? 'Building the mix…' : startLabel(people)}
      onStart={() => onStart({ categories, difficulty, rounds, lateJoin })}
      poster={
        <>
          <Disc spinning className="size-40" />
          <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, rotate: -3 }} className="mt-6 px-2 text-white [text-shadow:0_0_40px_rgba(232,121,249,.35)]">
            <Marker className="block text-[clamp(2.8rem,7vw,4.8rem)]">Guess the song</Marker>
          </motion.h2>
          <p className="mt-4 max-w-sm text-[1rem] leading-relaxed text-white/80">One clip. Four believable answers. Music starts on its own—listen closely and lock it in.</p>
        </>
      }
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-lime-300 text-[#101508] shadow-[0_0_22px_-8px_rgba(190,242,100,.8)]">
          <LockKeyhole aria-hidden className="size-4" />
        </span>
        <span>
          <strong className="block text-[0.82rem] text-white">Fresh picks only</strong>
          <span className="mt-0.5 block text-[0.72rem] leading-relaxed text-white/50">Never reads your likes, saved songs, playlists, queue or listening history.</span>
        </span>
      </div>
      <div className="px-4 py-3.5">
        <span className="flex items-center justify-between gap-3 text-[0.86rem] text-white/85">
          Music packs
          <span className="text-[0.7rem] text-white/40">Pick 1–3 · {categories.length}/3</span>
        </span>
        <div className="mt-2.5 grid grid-cols-2 gap-2" role="group" aria-label="Music packs">
          {SONG_CATEGORIES.map((category) => {
            const on = categories.includes(category.id)
            const capped = !on && categories.length === 3
            const Icon = category.icon
            return (
              <button
                key={category.id}
                type="button"
                disabled={capped || starting}
                aria-pressed={on}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'group flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left outline-none transition-[border-color,background-color,transform,opacity] focus-visible:outline-2 focus-visible:outline-white active:scale-[0.98]',
                  on ? 'border-lime-300/60 bg-lime-300/[0.09]' : 'border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]',
                  capped && 'cursor-not-allowed opacity-35',
                )}
              >
                <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', on ? 'bg-lime-300 text-[#101508]' : 'bg-white/[0.06] text-white/55')}>
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-[0.76rem] font-semibold text-white">{category.label}</strong>
                  <span className="block truncate text-[0.62rem] text-white/40">{category.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="px-4 py-3.5">
        <span className="flex items-center gap-2 text-[0.86rem] text-white/85">
          <Sparkles aria-hidden className="size-4 text-fuchsia-300" /> Difficulty
        </span>
        <div className="mt-2.5 grid grid-cols-2 gap-2" role="group" aria-label="Difficulty">
          {SONG_DIFFICULTIES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              disabled={starting}
              aria-pressed={difficulty === choice.id}
              onClick={() => setDifficulty(choice.id)}
              className={cn(
                'rounded-xl border px-2.5 py-2.5 text-left outline-none transition-colors focus-visible:outline-2 focus-visible:outline-white',
                difficulty === choice.id ? 'border-fuchsia-300/60 bg-fuchsia-300/[0.1]' : 'border-white/[0.08] bg-white/[0.025] hover:border-white/20',
              )}
            >
              <strong className="block text-[0.72rem] text-white">{choice.label}</strong>
              <span className="mt-0.5 block text-[0.59rem] leading-tight text-white/40">{choice.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <Row icon={<Music2 className="size-4" />} label="Songs">
        <Segmented label="Songs" values={[5, 10, 15]} value={rounds} onChange={setRounds} compact />
      </Row>
      <Row icon={<LogIn className="size-4" />} label="Allow late join">
        <Toggle on={lateJoin} onChange={setLateJoin} label="Allow late join" />
      </Row>
    </Lobby>
  )
}

// ── the table ─────────────────────────────────────────────────────────────────

export function QuizTable({
  party,
  selfId,
  error,
  act,
  onJoin,
  onLeaveTable,
  onPlayAgain,
}: {
  party: PartyState<QuizView>
  selfId: string | undefined
  error: string | null
  act: Act
  onJoin: () => void
  onLeaveTable: () => void
  onPlayAgain?: () => void
}) {
  const view = party.view
  const item = view.item
  const playing = selfId !== undefined && view.players.some((p) => p.id === selfId)
  const mine = selfId !== undefined ? view.picks[selfId] : undefined
  const revealed = view.phase === 'reveal'
  const song = !!item?.media || !!item?.reveal
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    if (!song || !playing || view.phase !== 'question' || mine) return
    const pick = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || !/^[1-4]$/.test(event.key)) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))) return
      const option = Number(event.key) - 1
      if (option >= (item?.options.length ?? 0) || view.hidden?.includes(option)) return
      event.preventDefault()
      act('answer', { option })
    }
    window.addEventListener('keydown', pick)
    return () => window.removeEventListener('keydown', pick)
  }, [song, playing, view.phase, view.hidden, item?.options.length, mine, act])

  const [left, setLeft] = useState(() => remaining(party, view.deadline))
  useEffect(() => {
    const tick = () => setLeft(remaining(party, view.deadline))
    tick()
    const timer = setInterval(tick, 100)
    return () => clearInterval(timer)
  }, [party, view.deadline])

  /* Clip playback — the media stays mounted across rounds so the player isn't rebuilt. */
  const [clip, setClip] = useState<ClipStatus>('loading')
  const [unlock, setUnlock] = useState(0)
  const partyRef = useRef(party)
  useEffect(() => {
    partyRef.current = party
  }, [party])
  const elapsed = () => {
    const p = partyRef.current
    if (p.view.phase === 'ready') return 0
    return Math.max(0, p.serverTime + (Date.now() - p.receivedAt) - p.view.opensAt)
  }

  /* A right answer is a moment — confetti on the screen of whoever got it. */
  const myGain = selfId ? view.gains[selfId] : undefined
  const celebrated = useRef(-1)
  const answered = mine !== undefined
  useEffect(() => {
    if (!revealed || celebrated.current === view.round) return
    celebrated.current = view.round
    if (myGain) {
      void confetti({ particleCount: 70, spread: 70, startVelocity: 34, origin: { y: 0.55 }, colors: ['#bef264', '#fcd34d', '#f472b6', '#7dd3fc'], disableForReducedMotion: true })
      petCue('right')
    } else if (answered) petCue('wrong')
  }, [revealed, myGain, view.round, answered])

  if (view.phase === 'over') return <Podium view={view} selfId={selfId} onLeaveTable={onLeaveTable} onPlayAgain={onPlayAgain} />
  if (!item) return null

  const total = view.phase === 'ready' ? view.readyMs : view.seconds * 1000 + (view.extraMs ?? 0)

  return (
    <div className="relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden">
      <Studio />
      {item.media && <ClipPlayer media={item.media} playing={view.phase === 'question' || !!view.playbackStarting || revealed} preparing={!!view.playbackLoading} confirming={!!view.playbackStarting} syncAt={view.phase === 'question' ? view.opensAt : 0} elapsedMs={elapsed} onStatus={(status) => {
        setClip(status)
        if (status === 'ready' && playing) act('clip-ready', { round: view.round, ref: item.media!.ref })
        if (status === 'playing' && playing && view.playbackStarting) act('clip-playing', { round: view.round, ref: item.media!.ref })
        if (status === 'blocked' && playing) act('clip-blocked', { round: view.round, ref: item.media!.ref })
      }} unlock={unlock} onUnavailable={(ref, code) => {
        if (playing) act('clip-failed', { round: view.round, ref, code })
      }} />}

      {/* Where we are, and how long is left. */}
      <div className="flex shrink-0 items-center gap-4 px-4 pb-2 pt-1 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="text-[0.85rem] font-semibold text-white/90">
            {song ? 'Song' : 'Question'} {view.round + 1}
            <span className="text-white/45">/{view.rounds}</span>
          </p>
          <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400" animate={{ width: `${((view.round + (revealed ? 1 : 0)) / view.rounds) * 100}%` }} />
          </div>
        </div>
        <button type="button" onClick={() => setSheet(true)} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.75rem] text-white backdrop-blur lg:hidden">
          <Trophy aria-hidden className="size-3.5 text-amber-300" /> Board
        </button>
        <Clock left={view.phase === 'question' ? left : 0} total={total} active={view.phase === 'question'} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-8">
        <div data-lenis-prevent className="relative flex min-h-0 flex-col items-center overflow-y-auto py-2 [&>*:not(.absolute)]:my-auto">
          <Floaters reactions={view.reactions ?? []} />
          <div className="flex w-full max-w-3xl flex-col items-center">
            <AnimatePresence mode="wait">
              {view.phase === 'ready' && !song ? (
                <NextUp key={`next-${view.round}`} view={view} left={left} />
              ) : (
                <motion.div
                  key={`q-${view.round}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex w-full flex-col items-center"
                >
                  {song ? <SongStage view={view} clip={clip} left={left} onUnlock={() => setUnlock((n) => n + 1)} onRetry={playing ? () => act('clip-retry', { round: view.round }) : undefined} /> : <QuestionCard view={view} />}

                  {song && view.phase === 'ready' && (
                    <p className="mt-4 text-center text-[0.78rem] text-white/45">Answers appear with the music. Same clip, same clock for everyone.</p>
                  )}
                  {item.options.length > 0 && (
                    <>
                      <div className="mt-5 flex w-full items-center justify-between gap-3 text-[0.78rem] text-white/55">
                        <p className="font-semibold uppercase tracking-[0.18em]">{revealed ? 'The answer' : mine ? 'Locked in' : 'Your answer'}</p>
                        {song && !revealed && !mine && <span className="hidden text-[0.7rem] sm:inline">Tap a title or press 1–4</span>}
                      </div>
                      <div className="mt-2.5 grid w-full grid-cols-2 gap-3">
                        {item.options.map((option, i) => (
                          <Tile
                            key={`${view.round}-${i}`}
                            index={i}
                            text={option}
                            view={view}
                            mine={mine?.option}
                            locked={mine !== undefined || !playing || view.phase !== 'question'}
                            onPick={() => act('answer', { option: i })}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <AnimatePresence>
                    {revealed && playing && (
                      <Verdict
                        key={`v-${view.round}`}
                        view={view}
                        gain={myGain ?? 0}
                        skipped={mine?.option === -1}
                        answered={mine !== undefined}
                        streak={selfId ? (view.streaks[selfId] ?? 0) : 0}
                      />
                    )}
                  </AnimatePresence>
                  {revealed && !playing && view.fact && <p className="mt-4 max-w-xl text-center text-[0.95rem] text-white/80">{view.fact}</p>}

                  {view.phase === 'question' && (
                    <p className="mt-4 text-[0.8rem] text-white/50">
                      {view.answered.length} of {view.players.length} answered
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!playing && (
              <button type="button" onClick={onJoin} className="mt-4 rounded-full bg-lime-300 px-6 py-2.5 text-[0.86rem] font-bold text-[#0d1206]">
                Join in
              </button>
            )}
            {error && (
              <p role="alert" className="mt-3 text-[0.82rem] text-signal-bright">
                {error}
              </p>
            )}
          </div>
        </div>

        <aside data-lenis-prevent className="hidden min-h-0 flex-col gap-3 overflow-y-auto lg:flex">
          <Side view={view} selfId={selfId} playing={playing} act={act} showPowers={!song} />
        </aside>
      </div>

      {/* Phones: the power-ups stay on screen; the board slides up. */}
      {playing && !song && (
        <div className="flex shrink-0 items-center justify-center gap-4 border-t border-white/[0.06] bg-black/30 px-4 py-3 backdrop-blur lg:hidden">
          <PowerUps view={view} act={act} answered={mine !== undefined} compact />
        </div>
      )}
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-[150] flex items-end bg-black/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
            <motion.div
              data-lenis-prevent
              className="flex max-h-[80dvh] w-full flex-col gap-3 overflow-y-auto rounded-t-[1.6rem] border-t border-white/10 bg-[#0c1020] p-4 pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-1 h-1 w-10 shrink-0 rounded-full bg-white/20" />
              <Side view={view} selfId={selfId} playing={playing} act={act} showPowers={false} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** A ring that drains with the clock — calm, then amber, then red. */
function Clock({ left, total, active }: { left: number; total: number; active: boolean }) {
  const secs = Math.ceil(left / 1000)
  const share = total > 0 ? Math.min(1, left / total) : 0
  const tone = share > 0.5 ? '#86efac' : share > 0.25 ? '#fbbf24' : '#f87171'
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid size-16 shrink-0 place-items-center" role="timer" aria-label={active ? `${secs} seconds left` : 'Waiting'}>
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="rgba(0,0,0,.45)" stroke="rgba(255,255,255,.12)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - (active ? share : 0))}
          style={{ transition: 'stroke-dashoffset .1s linear, stroke .3s', filter: `drop-shadow(0 0 6px ${tone})` }}
        />
      </svg>
      {active ? (
        <motion.span
          key={secs}
          initial={{ scale: secs <= 3 ? 1.6 : 1.15, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative font-display text-[1.35rem] font-bold tabular-nums"
          style={{ color: secs <= 3 ? '#fca5a5' : '#fff' }}
        >
          {secs}
        </motion.span>
      ) : (
        <Timer aria-hidden className="relative size-5 text-white/40" />
      )}
    </div>
  )
}

function CategoryChip({ item }: { item: NonNullable<QuizView['item']> }) {
  const meta = item.category ? CATEGORY[item.category] : undefined
  const Icon = meta?.icon ?? Globe2
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/90">
      <Icon aria-hidden className={cn('size-4', meta?.tint ?? 'text-sky-300')} /> {item.tag}
    </span>
  )
}

/** The question, on glass, above a lit pedestal. */
function QuestionCard({ view }: { view: QuizView }) {
  const item = view.item!
  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative w-full overflow-hidden rounded-[1.6rem] border border-white/12 bg-[linear-gradient(170deg,rgba(255,255,255,.09),rgba(255,255,255,.02))] px-6 py-7 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)] backdrop-blur-md sm:px-10">
        <BorderBeam size={150} duration={9} colorFrom="#fcd34d" colorTo="#60a5fa" />
        <CategoryChip item={item} />
        <h2 className="mt-4 text-balance font-display text-[clamp(1.35rem,3.2vw,2.1rem)] font-semibold leading-snug tracking-[-0.015em] text-white">{item.prompt}</h2>
      </div>
      <Pedestal />
    </div>
  )
}

function Pedestal() {
  return (
    <div aria-hidden className="relative -mt-3 h-9 w-[min(26rem,80%)]">
      <div className="absolute inset-0 rounded-[50%] border border-amber-300/40 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,.35),rgba(251,146,60,.12)_50%,transparent_72%)] shadow-[0_0_40px_-6px_rgba(251,191,36,.7)]" />
      <div className="absolute inset-x-[18%] top-[35%] h-3 rounded-[50%] bg-amber-200/30 blur-sm" />
    </div>
  )
}

/** "Next up": what kind of question is coming, and a count to it. */
function NextUp({ view, left }: { view: QuizView; left: number }) {
  const item = view.item!
  const n = Math.max(1, Math.ceil(left / 1000))
  const meta = item.category ? CATEGORY[item.category] : undefined
  const Icon = meta?.icon ?? Globe2
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: -2 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="flex flex-col items-center py-6"
    >
      <Marker className="text-[2.4rem] text-white">Next up…</Marker>
      <div className="mt-4 rotate-1 rounded-2xl bg-[#f5ecd7] px-8 py-5 text-center text-[#2b2116] shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)]">
        <p className="font-display text-[1.3rem] font-bold">
          Question {view.round + 1}/{view.rounds}
        </p>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white">
          <Icon aria-hidden className="size-3.5" /> {item.tag}
        </span>
      </div>
      <p className="mt-7 text-[0.9rem] text-white/70">Starting in…</p>
      <div className="relative mt-2 grid size-20 place-items-center rounded-full border-4 border-white/80 shadow-[0_0_30px_-6px_rgba(255,255,255,.6)]">
        <AnimatePresence mode="popLayout">
          <motion.span key={n} initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 20 }} className="absolute font-display text-[2.4rem] font-bold text-white">
            {n}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function Tile({ index, text, view, mine, locked, onPick }: { index: number; text: string; view: QuizView; mine: number | undefined; locked: boolean; onPick: () => void }) {
  const revealed = view.phase === 'reveal'
  const right = revealed && view.item?.answer === index
  const wrong = revealed && mine === index && !right
  const picked = mine === index
  const ruledOut = (view.hidden ?? []).includes(index)
  const pickers = revealed ? view.players.filter((p) => view.picks[p.id]?.option === index) : []
  const live = !locked && !ruledOut
  return (
    <motion.button
      type="button"
      disabled={!live}
      onClick={onPick}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: ruledOut ? 0.22 : revealed && !right && !picked ? 0.42 : 1, y: 0, scale: right ? 1.03 : 1 }}
      whileHover={live ? { y: -4, scale: 1.02 } : undefined}
      whileTap={live ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: view.phase === 'question' && mine === undefined ? index * 0.05 : 0 }}
      aria-label={`${'ABCD'[index]}: ${text}${right ? ', correct' : ''}${ruledOut ? ', ruled out' : ''}`}
      className={cn(
        'relative flex min-h-[5.5rem] items-end overflow-hidden rounded-[1.2rem] border-2 p-4 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default sm:min-h-[7rem]',
        TILE_ART[index],
        right
          ? 'border-lime-300 shadow-[0_0_40px_-6px_rgba(190,242,100,.85)]'
          : wrong
            ? 'border-rose-400 shadow-[0_0_30px_-8px_rgba(251,113,133,.8)]'
            : picked
              ? 'border-lime-300 shadow-[0_0_34px_-8px_rgba(190,242,100,.75)]'
              : 'border-white/12',
      )}
    >
      <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-black/40 text-[0.72rem] font-bold text-white/80">{'ABCD'[index]}</span>
      {right && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute left-3 top-3 grid size-8 place-items-center rounded-full bg-lime-300 text-[#0d1206]">
          <Check aria-hidden className="size-5" strokeWidth={3} />
        </motion.span>
      )}
      {wrong && (
        <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-full bg-rose-400 text-white">
          <X aria-hidden className="size-5" strokeWidth={3} />
        </span>
      )}
      <span className={cn('relative pr-6 font-display text-[clamp(1rem,2.4vw,1.3rem)] font-semibold leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,.7)]', ruledOut && 'line-through')}>{text}</span>
      {pickers.length > 0 && (
        <span className="absolute bottom-3 right-3 flex -space-x-2">
          {pickers.slice(0, 4).map((p) => (
            <Avatar key={p.id} person={p} size="sm" ring="ring-black/60" />
          ))}
        </span>
      )}
    </motion.button>
  )
}

/** The verdict, in marker pen: what happened, a line about it, and the points. */
function Verdict({ view, gain, skipped, answered, streak }: { view: QuizView; gain: number; skipped: boolean; answered: boolean; streak: number }) {
  const good = gain > 0
  const title = good ? 'Correct!' : skipped ? 'Skipped' : answered ? 'Not quite' : 'Too slow!'
  /* On a phone the verdict lands below the tiles — bring it up to where the eyes are. */
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const timer = setTimeout(() => box.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 450)
    return () => clearTimeout(timer)
  }, [])
  return (
    <motion.div
      ref={box}
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
      className="mt-5 flex flex-col items-center px-2 text-center"
    >
      <Marker className={cn('-rotate-3 px-2 text-[2.6rem]', good ? 'text-lime-300 [text-shadow:0_0_24px_rgba(190,242,100,.6)]' : skipped ? 'text-white/80' : 'text-rose-300')}>{title}</Marker>
      {view.fact && <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-white/85">{view.fact}</p>}
      {good && (
        <span className="relative mt-3 inline-grid place-items-center px-8 py-2">
          <svg viewBox="0 0 200 64" className="absolute inset-0 size-full text-lime-300" aria-hidden preserveAspectRatio="none">
            <motion.path
              d="M14 34 C 18 10, 176 4, 188 28 C 198 52, 40 64, 12 42 C 2 32, 30 16, 60 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            />
          </svg>
          <Marker className="relative text-[1.4rem] text-lime-200">+{gain} points</Marker>
        </span>
      )}
      {good && streak >= 2 && <p className="mt-1 text-[0.82rem] font-semibold text-orange-200">🔥 {streak} in a row</p>}
    </motion.div>
  )
}

function PowerUps({ view, act, answered, compact }: { view: QuizView; act: Act; answered: boolean; compact?: boolean }) {
  const can = view.phase === 'question' && !answered
  const powers = view.powers ?? []
  const list: { kind: Power; label: string; icon: typeof Timer; tint: string }[] = [
    { kind: 'fifty', label: '50/50', icon: Binoculars, tint: 'text-sky-300 border-sky-400/50' },
    { kind: 'skip', label: 'Skip', icon: FastForward, tint: 'text-violet-300 border-violet-400/50' },
    { kind: 'time', label: '+10s', icon: Timer, tint: 'text-amber-300 border-amber-400/50' },
  ]
  return (
    <div className={cn('flex', compact ? 'gap-5' : 'justify-around gap-2')}>
      {list.map(({ kind, label, icon: Icon, tint }) => {
        const has = powers.includes(kind)
        return (
          <motion.button
            key={kind}
            type="button"
            disabled={!has || !can}
            onClick={() => act('power', { kind })}
            whileHover={has && can ? { y: -3 } : undefined}
            whileTap={has && can ? { scale: 0.92 } : undefined}
            aria-label={`${label}${has ? '' : ' (used)'}`}
            className={cn('flex flex-col items-center gap-1 outline-none focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed', !has && 'opacity-30', has && !can && 'opacity-55')}
          >
            <span className={cn('grid place-items-center rounded-full border-2 bg-black/40 shadow-[0_0_20px_-6px_currentColor]', compact ? 'size-11' : 'size-14', tint)}>
              <Icon aria-hidden className={compact ? 'size-5' : 'size-6'} />
            </span>
            <span className="text-[0.72rem] font-semibold text-white/85">{label}</span>
            {!compact && <span className="text-[0.62rem] text-white/45">{has ? '1 left' : 'used'}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

/** Board, power-ups and reactions. */
function Side({ view, selfId, playing, act, showPowers = true }: { view: QuizView; selfId: string | undefined; playing: boolean; act: Act; showPowers?: boolean }) {
  const mine = selfId ? view.picks[selfId] : undefined
  return (
    <>
      <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Marker className="text-[1.35rem] text-white">Live leaderboard</Marker>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.7rem] font-semibold text-white/80">
            Q{view.round + 1}/{view.rounds}
          </span>
        </div>
        <Leaderboard view={view} selfId={selfId} />
      </div>
      {playing && showPowers && (
        <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <Marker className="text-[1.2rem] text-white">⚡ Power-ups</Marker>
            <span className="font-marker text-[0.8rem] text-white/45">use wisely!</span>
          </div>
          <div className="mt-3">
            <PowerUps view={view} act={act} answered={mine !== undefined} />
          </div>
        </div>
      )}
      <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
        <p className="px-1 pb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/45">Reactions</p>
        <div className="grid grid-cols-8 gap-0.5">
          {REACTIONS.map((emoji) => (
            <motion.button
              key={emoji}
              type="button"
              disabled={!playing || view.phase === 'over'}
              onClick={() => act('react', { emoji })}
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.85 }}
              aria-label={`React ${emoji}`}
              className="grid aspect-square place-items-center rounded-full text-[1.15rem] outline-none hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </>
  )
}

const MEDAL = ['bg-gradient-to-br from-amber-200 to-amber-500 text-[#3b2a05]', 'bg-gradient-to-br from-slate-100 to-slate-400 text-[#1f2430]', 'bg-gradient-to-br from-orange-300 to-orange-700 text-[#2d1404]']
const BAR = ['from-amber-300 to-yellow-400', 'from-violet-400 to-fuchsia-400', 'from-orange-400 to-rose-400']

function Leaderboard({ view, selfId }: { view: QuizView; selfId: string | undefined }) {
  const ranked = [...view.players].sort((a, b) => (view.scores[b.id] ?? 0) - (view.scores[a.id] ?? 0))
  const top = Math.max(1, ...ranked.map((p) => view.scores[p.id] ?? 0))
  return (
    <LayoutGroup>
      <ol className="mt-3 space-y-1.5">
        {ranked.map((p, i) => {
          const score = view.scores[p.id] ?? 0
          const gain = view.phase === 'reveal' ? (view.gains[p.id] ?? 0) : 0
          const answered = view.phase === 'question' && view.answered.includes(p.id)
          return (
            <motion.li layout key={p.id} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={cn('flex items-center gap-2.5 rounded-xl px-2 py-1.5', p.id === selfId && 'bg-white/[0.07]')}>
              <span className={cn('grid size-6 shrink-0 place-items-center rounded-full text-[0.68rem] font-bold', MEDAL[i] ?? 'bg-white/10 text-white/70')}>{i + 1}</span>
              <span className="relative">
                <Avatar person={p} size="sm" />
                {answered && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0c1020] bg-lime-300" aria-label="answered" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[0.82rem] text-white">{p.id === selfId ? 'You' : p.name}</span>
                  <span className="relative font-display text-[0.95rem] font-bold tabular-nums text-white">
                    {score}
                    <AnimatePresence>
                      {gain > 0 && (
                        <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-3.5 right-0 text-[0.62rem] font-bold text-lime-300">
                          +{gain}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.span className={cn('block h-full rounded-full bg-gradient-to-r', BAR[i] ?? 'from-slate-300 to-slate-400')} animate={{ width: `${(score / top) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </span>
              </span>
            </motion.li>
          )
        })}
      </ol>
    </LayoutGroup>
  )
}

/** Reactions rise over the stage as they arrive. */
function Floaters({ reactions }: { reactions: NonNullable<QuizView['reactions']> }) {
  const seen = useRef<Set<number> | null>(null)
  const [flying, setFlying] = useState<{ id: number; emoji: string; by: string; x: number }[]>([])
  useEffect(() => {
    /* The ones already there when the table opened are history, not news. */
    if (!seen.current) {
      seen.current = new Set(reactions.map((r) => r.id))
      return
    }
    const known = seen.current
    const fresh = reactions.filter((r) => !known.has(r.id))
    if (fresh.length === 0) return
    fresh.forEach((r) => known.add(r.id))
    setFlying((f) => [...f, ...fresh.map((r) => ({ ...r, x: 12 + ((r.id * 41) % 76) }))].slice(-16))
  }, [reactions])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <AnimatePresence>
        {flying.map((f) => (
          <motion.span
            key={f.id}
            className="absolute bottom-4 flex flex-col items-center"
            style={{ left: `${f.x}%` }}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -240, scale: [0.6, 1.2, 1, 0.9], x: [0, 12, -10, 6] }}
            transition={{ duration: 2.3, ease: 'easeOut' }}
            onAnimationComplete={() => setFlying((all) => all.filter((x) => x.id !== f.id))}
          >
            <span className="text-[1.9rem]">{f.emoji}</span>
            <span className="rounded-full bg-black/50 px-1.5 text-[0.6rem] text-white/80">{f.by}</span>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

function SongStage({ view, clip, left, onUnlock, onRetry }: { view: QuizView; clip: ClipStatus; left: number; onUnlock: () => void; onRetry?: () => void }) {
  const reveal = view.phase === 'reveal' ? view.item?.reveal : null
  const live = view.phase === 'question'
  const item = view.item!
  let heading = 'Name that song'
  if (view.phase === 'ready') heading = 'Get ready…'
  if (view.playbackStarting) heading = 'Listen…'
  if (view.playbackLoading) heading = clip === 'ready' ? 'Waiting for the room…' : 'Checking sound…'
  if (view.soundBlocked) heading = 'Waiting for sound…'
  if (clip === 'blocked') heading = 'Sound is blocked'
  if (view.playbackError) heading = 'Playback paused'
  return (
    <div className="flex flex-col items-center">
      <span className="mb-3 flex items-center gap-2">
        <CategoryChip item={item} />
        {item.difficulty && <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/[0.08] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-fuchsia-200">{item.difficulty}</span>}
      </span>
      <div className="relative">
        <Disc spinning={(live || !!reveal) && clip === 'playing'} artwork={reveal?.artwork ?? null} className="size-44" />
        {view.phase === 'ready' && !view.playbackLoading && !view.playbackStarting && !view.playbackError && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-black/70 font-display text-[2rem] font-bold text-white backdrop-blur">{Math.max(1, Math.ceil(left / 1000))}</span>
          </div>
        )}
      </div>
      <Pedestal />
      <AnimatePresence mode="wait">
        {reveal ? (
          <motion.div key="reveal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center">
            <h2 className="text-balance font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold leading-tight tracking-[-0.025em] text-white">{reveal.title}</h2>
            {reveal.artist && <p className="mt-1 text-[0.95rem] text-white/70">{reveal.artist}</p>}
          </motion.div>
        ) : (
          <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-col items-center">
            <Marker className="px-2 text-center text-[2rem] text-white">{heading}</Marker>
            {clip === 'blocked' && !view.playbackError ? (
              <div className="mt-3 flex max-w-sm flex-col items-center gap-2 px-3 text-center">
                <p className="text-[0.8rem] leading-relaxed text-white/65">Your browser needs permission for sound.{view.phase === 'ready' ? ' The round hasn’t started.' : ''}</p>
                <button type="button" onClick={onUnlock} className="flex items-center gap-2 rounded-full bg-lime-300 px-5 py-2 text-[0.85rem] font-bold text-[#0d1206]">
                  <Volume2 className="size-4" aria-hidden /> Enable game sound
                </button>
              </div>
            ) : view.playbackError ? (
              <div className="mt-3 flex max-w-md flex-col items-center gap-3 px-3 text-center">
                <p role="alert" className="text-[0.85rem] leading-relaxed text-rose-200">{view.playbackError}</p>
                {onRetry && (
                  <button type="button" onClick={onRetry} className="flex items-center gap-2 rounded-full bg-lime-300 px-5 py-2 text-[0.85rem] font-bold text-[#0d1206] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    <RotateCcw className="size-4" aria-hidden /> Try again
                  </button>
                )}
              </div>
            ) : view.phase === 'question' && clip === 'error' ? (
              <p role="status" className="mt-2 text-[0.85rem] text-signal-bright">YouTube couldn’t play this clip.</p>
            ) : (
              <Bars on={view.phase === 'question' && clip === 'playing'} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** A record. Spins while there is something to hear; wears the cover once you know what it is. */
function Disc({ spinning, artwork = null, className }: { spinning: boolean; artwork?: string | null; className?: string }) {
  return (
    <div className={cn('relative rounded-full shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)]', className)} aria-hidden>
      <div
        className="absolute inset-0 animate-spin rounded-full"
        style={{
          background: 'repeating-radial-gradient(circle at center, #111 0 2px, #1b1b1f 2px 4px)',
          animationDuration: '2.4s',
          animationPlayState: spinning ? 'running' : 'paused',
        }}
      >
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent_0deg,rgba(255,255,255,.12)_40deg,transparent_80deg,transparent_200deg,rgba(255,255,255,.08)_230deg,transparent_270deg)]" />
        <div className="absolute inset-[30%] overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 ring-4 ring-black/60">
          {artwork && <img src={artwork} alt="" className="size-full scale-[1.35] object-cover" />}
          <div className="absolute inset-[38%] rounded-full border border-white/25" />
        </div>
        <div className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
      </div>
    </div>
  )
}

function Bars({ on }: { on: boolean }) {
  return (
    <div className="mt-3 flex h-6 items-end gap-1" aria-hidden>
      {[0.9, 0.5, 1, 0.65, 0.8, 0.45, 0.95].map((h, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-white/80"
          animate={on ? { height: [`${h * 30}%`, `${h * 100}%`, `${h * 45}%`, `${h * 85}%`] } : { height: '18%' }}
          transition={on ? { repeat: Infinity, repeatType: 'mirror', duration: 0.5 + i * 0.07, ease: 'easeInOut' } : { duration: 0.3 }}
        />
      ))}
    </div>
  )
}

/** Game over: a podium with trophies, the rest below, and another go. */
function Podium({ view, selfId, onLeaveTable, onPlayAgain }: { view: QuizView; selfId: string | undefined; onLeaveTable: () => void; onPlayAgain?: () => void }) {
  const ranked = [...view.players].sort((a, b) => (view.scores[b.id] ?? 0) - (view.scores[a.id] ?? 0))
  const top = ranked.slice(0, 3)
  const order = [top[1], top[0], top[2]].filter(Boolean) as Person[]
  const [full, setFull] = useState(false)
  const label = (p: Person) => (p.id === selfId ? 'You' : p.name)
  useEffect(() => {
    void confetti({ particleCount: 140, spread: 100, startVelocity: 42, origin: { y: 0.4 }, colors: ['#fcd34d', '#bef264', '#c4b5fd', '#f9a8d4'], disableForReducedMotion: true })
    /* The pet takes it personally — but only if you were playing. */
    const winner = ranked[0]
    if (winner && view.players.some((p) => p.id === selfId)) petCue(winner.id === selfId ? 'win' : 'lose', winner.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const height = (p: Person) => (p === top[0] ? 'h-32' : p === top[1] ? 'h-24' : 'h-16')
  const cup = (p: Person) => (p === top[0] ? 'text-amber-300' : p === top[1] ? 'text-slate-200' : 'text-orange-400')

  return (
    <div data-lenis-prevent className="relative isolate h-full w-full overflow-y-auto">
      <Studio />
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center px-5 pb-10 pt-6 text-center">
        <span className="text-[1.6rem]" aria-hidden>
          👑
        </span>
        <Marker className="px-2 text-[clamp(2.6rem,7vw,3.6rem)] text-white [text-shadow:0_0_30px_rgba(251,191,36,.4)]">Game over</Marker>
        <div className="mt-8 flex w-full items-end justify-center gap-3">
          {order.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (p === top[0] ? 0.5 : i * 0.2), type: 'spring', stiffness: 180, damping: 18 }}
              className="flex w-28 min-w-0 flex-col items-center"
            >
              <Trophy aria-hidden className={cn('mb-1 drop-shadow-[0_0_14px_currentColor]', cup(p), p === top[0] ? 'size-10' : 'size-7')} />
              <Avatar person={p} size={p === top[0] ? 'lg' : 'md'} ring={p === top[0] ? 'ring-amber-300' : 'ring-white/30'} />
              <span className="mt-2 max-w-full truncate text-[0.88rem] font-semibold text-white">{label(p)}</span>
              <span className="font-display text-[1.3rem] font-bold tabular-nums text-white">{view.scores[p.id] ?? 0}</span>
              <div
                className={cn(
                  'mt-2 grid w-full place-items-start justify-center rounded-t-xl pt-2 font-display text-[1.3rem] font-bold',
                  height(p),
                  p === top[0] ? 'bg-gradient-to-b from-amber-300/50 to-amber-300/5 text-amber-100' : 'bg-gradient-to-b from-white/15 to-white/[0.02] text-white/80',
                )}
              >
                {ranked.indexOf(p) + 1}
              </div>
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setFull((f) => !f)}
          aria-expanded={full}
          className="mt-5 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[0.86rem] text-white/85 hover:bg-white/[0.07]"
        >
          View full results
          <ChevronDown aria-hidden className={cn('size-4 transition-transform', full && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {full && (
            <motion.ol initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 w-full space-y-1.5 overflow-hidden text-left">
              {ranked.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-2 text-[0.86rem] text-white">
                  <span className="w-5 text-white/50">{i + 1}</span>
                  <Avatar person={p} size="sm" />
                  <span className="flex-1 truncate">{label(p)}</span>
                  {(view.best[p.id] ?? 0) >= 3 && <span className="text-[0.75rem] text-orange-200">🔥{view.best[p.id]}</span>}
                  <span className="font-bold tabular-nums">{view.scores[p.id] ?? 0}</span>
                </li>
              ))}
            </motion.ol>
          )}
        </AnimatePresence>

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
          {onPlayAgain && (
            <motion.button
              type="button"
              onClick={onPlayAgain}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-400 to-purple-500 px-6 py-3.5 text-[0.95rem] font-bold text-white shadow-[0_16px_40px_-12px_rgba(167,139,250,.9)]"
            >
              <BorderBeam size={70} duration={5} colorFrom="#ffffff" colorTo="#e9d5ff" />
              Play again <ArrowRight aria-hidden className="size-4" />
            </motion.button>
          )}
          <button type="button" onClick={onLeaveTable} className="flex-1 rounded-full border border-white/15 px-6 py-3.5 text-[0.9rem] font-semibold text-white hover:bg-white/10">
            Back to games
          </button>
        </div>
      </div>
    </div>
  )
}
