import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Check, Flame, Volume2, X } from 'lucide-react'

import { ClipPlayer, type ClipMedia, type ClipStatus } from '@/features/party/ClipPlayer'
import { Segmented } from '@/features/party/Segmented'
import { remaining, type PartyState } from '@/features/party/useParty'
import { cn } from '@/lib/utils'

/**
 * Live trivia and guess the song, on screen.
 *
 * Both are the same game underneath — a beat to get ready, four options
 * against the clock, a reveal — so they share this table. The song quiz only
 * adds a record that spins while the clip plays and a cover at the reveal.
 */

type Person = { id: string; name: string }

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
  item: {
    prompt: string
    tag: string
    options: string[]
    answer: number | null
    media: ClipMedia | null
    reveal: { title: string; artist: string | null; artwork: string | null } | null
  } | null
  picks: Record<string, { option: number; ms: number }>
  answered: string[]
}

const TILES = [
  { tone: 'from-rose-500/45 to-rose-600/10', ring: 'ring-rose-400/70', dot: 'bg-rose-400', shape: '▲' },
  { tone: 'from-amber-400/45 to-amber-600/10', ring: 'ring-amber-300/70', dot: 'bg-amber-300', shape: '◆' },
  { tone: 'from-sky-400/45 to-sky-600/10', ring: 'ring-sky-300/70', dot: 'bg-sky-300', shape: '●' },
  { tone: 'from-violet-400/45 to-violet-600/10', ring: 'ring-violet-300/70', dot: 'bg-violet-300', shape: '■' },
]

const TRIVIA_CATEGORIES = [
  { id: 'bollywood', label: 'Bollywood', emoji: '🎬', tone: 'from-rose-500/50 via-orange-500/15' },
  { id: 'cricket', label: 'Cricket', emoji: '🏏', tone: 'from-emerald-500/45 via-teal-500/15' },
  { id: 'movies', label: 'Movies', emoji: '🍿', tone: 'from-amber-400/45 via-yellow-500/15' },
  { id: 'music', label: 'Music', emoji: '🎵', tone: 'from-fuchsia-500/45 via-violet-500/15' },
  { id: 'gk', label: 'General knowledge', emoji: '🌍', tone: 'from-sky-500/45 via-indigo-500/15' },
] as const

const startLabel = (people: number) => (people === 1 ? 'Play solo' : `Start with ${people} players`)

/* ── Setup ─────────────────────────────────────────────────────────────── */

function SetupShell({ kicker, title, blurb, children }: { kicker: string; title: string; blurb: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 pb-10 pt-4 text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">{kicker}</p>
      <h2 className="mt-2 text-balance font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em] text-chalk">{title}</h2>
      <p className="mt-2 max-w-md text-pretty text-[0.9rem] leading-relaxed text-mist">{blurb}</p>
      {children}
    </div>
  )
}

function StartButton({ disabled, label, onClick }: { disabled?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-7 rounded-full bg-chalk px-8 py-3 text-[0.9rem] font-semibold text-void outline-none transition-[transform,opacity] duration-300 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
    >
      {label}
    </button>
  )
}

export function TriviaSetup({
  people,
  error,
  onStart,
}: {
  people: number
  error: string | null
  onStart: (options: { categories: string[]; rounds: number; seconds: number }) => void
}) {
  const [categories, setCategories] = useState<string[]>(TRIVIA_CATEGORIES.map((c) => c.id))
  const [rounds, setRounds] = useState(10)
  const [seconds, setSeconds] = useState(15)
  const toggle = (id: string) => setCategories((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  return (
    <SetupShell kicker="Live trivia" title="Fastest right answer wins." blurb="Same question, same moment, for everyone. Answers lock on the first tap — so be quick, but be right.">
      <div className="mt-7 flex w-full flex-wrap justify-center gap-2.5" role="group" aria-label="Categories">
        {TRIVIA_CATEGORIES.map((c) => {
          const on = categories.includes(c.id)
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.id)}
              className={cn(
                'relative w-[calc(50%-0.35rem)] overflow-hidden rounded-[1.1rem] border p-4 text-left outline-none transition-[transform,border-color] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:w-[calc(33.333%-0.45rem)]',
                on ? 'border-white/40' : 'border-white/10 hover:border-white/25',
              )}
            >
              <span className={cn('absolute inset-0 bg-gradient-to-br to-transparent transition-opacity duration-300', c.tone, on ? 'opacity-100' : 'opacity-30')} />
              <span className="relative block text-[1.5rem] leading-none" aria-hidden>
                {c.emoji}
              </span>
              <span className="relative mt-2 block font-display text-[1rem] font-semibold text-chalk">{c.label}</span>
              <span
                aria-hidden
                className={cn(
                  'absolute right-3 top-3 grid size-5 place-items-center rounded-full border text-[0.6rem] transition-colors',
                  on ? 'border-chalk bg-chalk text-void' : 'border-white/30',
                )}
              >
                {on ? '✓' : ''}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-x-10">
        <Segmented label="Questions" values={[5, 10, 15, 20]} value={rounds} onChange={setRounds} />
        <Segmented label="Seconds each" values={[10, 15, 20]} value={seconds} onChange={setSeconds} />
      </div>
      {error && (
        <p role="alert" className="mt-4 text-[0.8rem] text-signal-bright">
          {error}
        </p>
      )}
      <StartButton
        disabled={categories.length === 0}
        label={categories.length === 0 ? 'Pick a category' : startLabel(people)}
        onClick={() => onStart({ categories, rounds, seconds })}
      />
    </SetupShell>
  )
}

export function SongQuizSetup({
  people,
  error,
  onStart,
}: {
  people: number
  error: string | null
  onStart: (options: { rounds: number; seconds: number }) => void
}) {
  const [rounds, setRounds] = useState(10)
  const [seconds, setSeconds] = useState(15)
  return (
    <SetupShell
      kicker="Guess the song"
      title="How well do you know your own music?"
      blurb="Clips come from everything this room has played, saved and liked. Name it before anyone else does."
    >
      <Disc spinning className="mt-8 size-36" />
      <div className="flex flex-wrap justify-center gap-x-10">
        <Segmented label="Songs" values={[5, 10, 15]} value={rounds} onChange={setRounds} />
        <Segmented label="Seconds each" values={[10, 15, 20]} value={seconds} onChange={setSeconds} />
      </div>
      {error && (
        <p role="alert" className="mt-4 max-w-sm text-[0.82rem] text-signal-bright">
          {error}
        </p>
      )}
      <StartButton label={startLabel(people)} onClick={() => onStart({ rounds, seconds })} />
    </SetupShell>
  )
}

/* ── Table ─────────────────────────────────────────────────────────────── */

export function QuizTable({
  party,
  selfId,
  error,
  act,
  onJoin,
  onLeaveTable,
}: {
  party: PartyState<QuizView>
  selfId: string | undefined
  error: string | null
  act: (action: string, payload?: Record<string, unknown>) => void
  onJoin: () => void
  onLeaveTable: () => void
}) {
  const view = party.view
  const item = view.item
  const playing = selfId !== undefined && view.players.some((p) => p.id === selfId)
  const mine = selfId !== undefined ? view.picks[selfId] : undefined
  const revealed = view.phase === 'reveal'
  const song = !!item?.media || !!item?.reveal

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
  partyRef.current = party
  const elapsed = () => {
    const p = partyRef.current
    return Math.max(0, p.serverTime + (Date.now() - p.receivedAt) - p.view.opensAt)
  }

  if (view.phase === 'over') return <Podium view={view} selfId={selfId} onLeaveTable={onLeaveTable} />
  if (!item) return null

  const total = view.phase === 'ready' ? view.readyMs : view.seconds * 1000
  const name = (p: Person) => (p.id === selfId ? 'You' : p.name)
  const myGain = selfId ? view.gains[selfId] : undefined
  const myStreak = selfId ? (view.streaks[selfId] ?? 0) : 0

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl gap-8 px-5 pb-6">
      {item.media && (
        <ClipPlayer media={item.media} playing={view.phase === 'question' || revealed} elapsedMs={elapsed} onStatus={setClip} unlock={unlock} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header: what, where, how long. */}
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist">
            <span className="rounded-full bg-white/[0.07] px-2.5 py-1 normal-case tracking-normal text-chalk">{item.tag}</span>
            {song ? `of ${view.rounds}` : `${view.round + 1} of ${view.rounds}`}
          </p>
          <span className={cn('font-display text-[1.15rem] font-semibold tabular-nums', view.phase === 'question' && left < 4000 ? 'text-signal-bright' : 'text-chalk')} role="timer">
            {view.phase === 'question' ? Math.ceil(left / 1000) : ''}
          </span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
          <div
            className={cn('h-full rounded-full transition-[width] duration-100 ease-linear', view.phase === 'question' && left < 4000 ? 'bg-signal-bright' : 'bg-chalk/70')}
            style={{ width: view.phase === 'reveal' ? '0%' : `${Math.min(100, (left / total) * 100)}%` }}
          />
        </div>

        <div className="my-auto flex w-full flex-col items-center py-6">
          {/* The stage: the question, or the record. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${view.round}-${song ? 'song' : 'q'}`}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex w-full flex-col items-center text-center"
            >
              {song ? (
                <SongStage view={view} clip={clip} left={left} onUnlock={() => setUnlock((n) => n + 1)} />
              ) : (
                <>
                  {view.phase === 'ready' && <Countdown left={left} />}
                  <h2 className="mt-2 max-w-2xl text-balance font-display text-[clamp(1.5rem,3.4vw,2.35rem)] font-semibold leading-tight tracking-[-0.025em] text-chalk">
                    {item.prompt}
                  </h2>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Four options. */}
          <div className="mt-7 grid w-full gap-2.5 sm:grid-cols-2">
            {item.options.length === 0
              ? TILES.map((_, i) => <div key={i} className="h-[4.5rem] animate-pulse rounded-[1.2rem] bg-white/[0.04]" />)
              : item.options.map((option, i) => {
                  const tile = TILES[i]!
                  const right = revealed && item.answer === i
                  const wrongPick = revealed && mine?.option === i && item.answer !== i
                  const picked = mine?.option === i
                  const locked = mine !== undefined || !playing || view.phase !== 'question'
                  const pickers = revealed ? view.players.filter((p) => view.picks[p.id]?.option === i) : []
                  return (
                    <motion.button
                      key={`${view.round}-${i}`}
                      type="button"
                      disabled={locked}
                      onClick={() => act('answer', { option: i })}
                      aria-pressed={picked}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{
                        opacity: revealed ? (right || picked ? 1 : 0.4) : mine && !picked ? 0.45 : 1,
                        y: 0,
                        scale: right ? 1.02 : 1,
                      }}
                      transition={{ delay: view.phase === 'question' && !mine ? i * 0.04 : 0, duration: 0.25 }}
                      className={cn(
                        'group relative flex min-h-[4.5rem] items-center gap-3 overflow-hidden rounded-[1.2rem] border p-4 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                        right
                          ? 'border-emerald-300/80 bg-emerald-500/25'
                          : wrongPick
                            ? 'border-rose-400/60 bg-rose-500/15'
                            : picked
                              ? cn('border-transparent ring-2', tile.ring)
                              : 'border-white/10',
                        !locked && 'transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]',
                      )}
                    >
                      {!right && !wrongPick && <span className={cn('absolute inset-0 bg-gradient-to-br', tile.tone)} />}
                      <span className={cn('relative grid size-8 shrink-0 place-items-center rounded-lg text-[0.8rem] text-void', right ? 'bg-emerald-300' : tile.dot)} aria-hidden>
                        {right ? <Check className="size-4" strokeWidth={3} /> : wrongPick ? <X className="size-4" strokeWidth={3} /> : tile.shape}
                      </span>
                      <span className="relative flex-1 text-[1rem] font-semibold leading-snug text-chalk">{option}</span>
                      {picked && view.phase === 'question' && (
                        <span className="relative rounded-full bg-black/30 px-2.5 py-1 text-[0.7rem] font-semibold text-chalk">Locked in</span>
                      )}
                      {pickers.length > 0 && (
                        <span className="relative flex -space-x-1.5">
                          {pickers.slice(0, 5).map((p) => (
                            <span key={p.id} title={p.name} className="grid size-7 place-items-center rounded-full bg-white/90 text-[0.7rem] font-bold text-void ring-2 ring-black/40">
                              {p.name.slice(0, 1).toUpperCase()}
                            </span>
                          ))}
                        </span>
                      )}
                    </motion.button>
                  )
                })}
          </div>

          {/* Under the options: who's in, or how you did. */}
          <div className="mt-5 flex min-h-12 items-center justify-center">
            <AnimatePresence mode="wait">
              {revealed && playing ? (
                <motion.div
                  key={`gain-${view.round}`}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  {myGain ? (
                    <>
                      <span className="font-display text-[1.9rem] font-semibold tabular-nums text-emerald-300">+{myGain}</span>
                      {myStreak >= 2 && (
                        <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-[0.8rem] font-semibold text-orange-200">
                          <Flame className="size-3.5" aria-hidden /> {myStreak} in a row
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[0.95rem] text-mist">{mine ? 'Not this time.' : 'Too slow — no answer.'}</span>
                  )}
                </motion.div>
              ) : view.phase === 'question' ? (
                <motion.p key="answered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[0.8rem] text-dusk">
                  {view.answered.length} of {view.players.length} answered
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
          {!playing && (
            <button type="button" onClick={onJoin} className="mt-1 rounded-full bg-chalk px-5 py-2 text-[0.8rem] font-semibold text-void">
              Join in
            </button>
          )}
          {error && (
            <p role="alert" className="mt-2 text-[0.8rem] text-signal-bright">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 lg:hidden">
          <Leaderboard view={view} selfId={selfId} compact />
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" onClick={() => act('end')} className="rounded-full border border-white/12 px-4 py-2 text-[0.75rem] text-mist hover:bg-white/5 hover:text-chalk">
            End the game
          </button>
        </div>
      </div>

      <aside className="hidden w-60 shrink-0 flex-col pt-10 lg:flex" aria-label="Scores">
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mist">Leaderboard</p>
        <Leaderboard view={view} selfId={selfId} name={name} />
      </aside>
    </div>
  )
}

function Countdown({ left }: { left: number }) {
  const n = Math.max(1, Math.ceil(left / 1000))
  return (
    <div className="relative mb-3 grid size-16 place-items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={n}
          initial={{ scale: 1.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="absolute font-display text-[2.8rem] font-semibold tabular-nums text-chalk"
        >
          {n}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function SongStage({ view, clip, left, onUnlock }: { view: QuizView; clip: ClipStatus; left: number; onUnlock: () => void }) {
  const reveal = view.phase === 'reveal' ? view.item?.reveal : null
  const live = view.phase === 'question' || view.phase === 'reveal'
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Disc spinning={live && clip === 'playing'} artwork={reveal?.artwork ?? null} className="size-44" />
        {view.phase === 'ready' && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-black/70 backdrop-blur">
              <Countdown left={left} />
            </span>
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {reveal ? (
          <motion.div key="reveal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <h2 className="text-balance font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold leading-tight tracking-[-0.025em] text-chalk">{reveal.title}</h2>
            {reveal.artist && <p className="mt-1 text-[0.95rem] text-mist">{reveal.artist}</p>}
          </motion.div>
        ) : (
          <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex flex-col items-center">
            <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-chalk">
              {view.phase === 'ready' ? 'Get ready…' : 'Name that song'}
            </h2>
            {view.phase === 'question' && clip === 'blocked' ? (
              <button type="button" onClick={onUnlock} className="mt-3 flex items-center gap-2 rounded-full bg-chalk px-5 py-2 text-[0.85rem] font-semibold text-void">
                <Volume2 className="size-4" aria-hidden /> Tap to hear it
              </button>
            ) : view.phase === 'question' && clip === 'error' ? (
              <p className="mt-2 text-[0.85rem] text-signal-bright">This clip won’t play here — go with your gut.</p>
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
        <div className="absolute inset-[30%] overflow-hidden rounded-full bg-gradient-to-br from-signal to-fuchsia-600 ring-4 ring-black/60">
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
          className="w-1.5 rounded-full bg-chalk/80"
          animate={on ? { height: [`${h * 30}%`, `${h * 100}%`, `${h * 45}%`, `${h * 85}%`] } : { height: '18%' }}
          transition={on ? { repeat: Infinity, repeatType: 'mirror', duration: 0.5 + i * 0.07, ease: 'easeInOut' } : { duration: 0.3 }}
        />
      ))}
    </div>
  )
}

function Leaderboard({ view, selfId, compact, name }: { view: QuizView; selfId: string | undefined; compact?: boolean; name?: (p: Person) => string }) {
  const ranked = [...view.players].sort((a, b) => (view.scores[b.id] ?? 0) - (view.scores[a.id] ?? 0))
  const label = name ?? ((p: Person) => (p.id === selfId ? 'You' : p.name))
  if (compact) {
    return (
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]">
        {ranked.map((p) => (
          <li key={p.id} className="text-mist">
            <span className="text-chalk">{label(p)}</span> <span className="tabular-nums">{view.scores[p.id] ?? 0}</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <LayoutGroup>
      <ol className="space-y-1.5">
        {ranked.map((p, i) => {
          const gain = view.phase === 'reveal' ? (view.gains[p.id] ?? 0) : 0
          return (
            <motion.li
              layout
              key={p.id}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5',
                p.id === selfId ? 'bg-white/[0.09] ring-1 ring-white/15' : 'bg-white/[0.035]',
              )}
            >
              <span className="w-4 text-[0.75rem] tabular-nums text-dusk">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-[0.85rem] text-chalk">{label(p)}</span>
              {(view.streaks[p.id] ?? 0) >= 2 && <Flame className="size-3.5 text-orange-300" aria-label={`${view.streaks[p.id]} in a row`} />}
              <span className="relative text-[0.88rem] font-semibold tabular-nums text-chalk">
                {view.scores[p.id] ?? 0}
                <AnimatePresence>
                  {gain > 0 && (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-3.5 right-0 text-[0.65rem] font-semibold text-emerald-300"
                    >
                      +{gain}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </motion.li>
          )
        })}
      </ol>
    </LayoutGroup>
  )
}

function Podium({ view, selfId, onLeaveTable }: { view: QuizView; selfId: string | undefined; onLeaveTable: () => void }) {
  const ranked = [...view.players].sort((a, b) => (view.scores[b.id] ?? 0) - (view.scores[a.id] ?? 0))
  const top = ranked.slice(0, 3)
  /* Second, first, third — the shape of a podium. */
  const order = [top[1], top[0], top[2]].filter(Boolean) as Person[]
  const height = (p: Person) => (p === top[0] ? 'h-36' : p === top[1] ? 'h-24' : 'h-16')
  const label = (p: Person) => (p.id === selfId ? 'You' : p.name)
  const streaker = [...view.players].sort((a, b) => (view.best[b.id] ?? 0) - (view.best[a.id] ?? 0))[0]
  const bestStreak = streaker ? (view.best[streaker.id] ?? 0) : 0

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-5 pt-6 text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">Final scores</p>
      <h2 className="mt-2 font-display text-[2.1rem] font-semibold tracking-[-0.03em] text-chalk">
        {top[0] ? (top[0].id === selfId ? 'You win! 🏆' : `${top[0].name} wins 🏆`) : 'Game over'}
      </h2>
      <div className="mt-8 flex w-full items-end justify-center gap-3">
        {order.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + (p === top[0] ? 0.4 : i * 0.15), type: 'spring', stiffness: 200, damping: 20 }}
            className="flex w-28 flex-col items-center"
          >
            <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-signal to-fuchsia-600 font-display text-[1.2rem] font-semibold text-white ring-2 ring-white/30">
              {p.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="mt-2 max-w-full truncate text-[0.85rem] text-chalk">{label(p)}</span>
            <span className="text-[0.8rem] font-semibold tabular-nums text-mist">{view.scores[p.id] ?? 0}</span>
            <div
              className={cn(
                'mt-2 grid w-full place-items-start justify-center rounded-t-xl pt-2 font-display text-[1.3rem] font-semibold',
                height(p),
                p === top[0] ? 'bg-gradient-to-b from-amber-300/50 to-amber-300/5 text-amber-100' : 'bg-gradient-to-b from-white/15 to-white/[0.02] text-chalk/80',
              )}
            >
              {ranked.indexOf(p) + 1}
            </div>
          </motion.div>
        ))}
      </div>
      {ranked.length > 3 && (
        <ol className="mt-4 w-full space-y-1.5 text-left" start={4}>
          {ranked.slice(3).map((p, i) => (
            <li key={p.id} className="flex justify-between rounded-xl bg-white/[0.04] px-4 py-2 text-[0.85rem] text-chalk">
              <span>
                <span className="mr-3 text-dusk">{i + 4}</span>
                {label(p)}
              </span>
              <span className="tabular-nums">{view.scores[p.id] ?? 0}</span>
            </li>
          ))}
        </ol>
      )}
      {bestStreak >= 3 && streaker && (
        <p className="mt-5 flex items-center gap-1.5 text-[0.85rem] text-orange-200">
          <Flame className="size-4" aria-hidden /> Best streak: {label(streaker)}, {bestStreak} in a row
        </p>
      )}
      <button
        type="button"
        onClick={onLeaveTable}
        className="mt-7 rounded-full bg-chalk px-7 py-3 text-[0.88rem] font-semibold text-void outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        Back to games
      </button>
    </div>
  )
}
