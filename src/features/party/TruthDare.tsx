import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, PenLine, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Truth or dare, on screen.
 *
 * Everyone sits around the bottle. The game decides the cards — the asker is
 * handed three from the decks the room picked and only has to choose — and the
 * person answering sees three face-down cards wobbling until the asker does.
 */

type Person = { id: string; name: string }
type Kind = 'truth' | 'dare'
type Card = { id: string; deck: string; kind: Kind; text: string; custom: boolean }
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
  log: { asker: string; answerer: string; kind: Kind; text: string; outcome: 'done' | 'chicken' }[]
}

const DECKS: { id: string; label: string; blurb: string; tone: string }[] = [
  { id: 'funny', label: 'Funny', blurb: 'Silly, harmless, loud', tone: 'from-amber-400/30 to-orange-500/20' },
  { id: 'friends', label: 'Friends', blurb: 'Secrets and roasts', tone: 'from-sky-400/30 to-indigo-500/20' },
  { id: 'couples', label: 'Couples', blurb: 'Sweet, for two', tone: 'from-pink-400/30 to-rose-500/20' },
  { id: 'deep', label: 'Deep', blurb: 'The real stuff', tone: 'from-violet-400/30 to-purple-600/20' },
  { id: 'spicy', label: 'Spicy', blurb: 'Flirty and bold · 18+', tone: 'from-red-500/40 to-rose-700/25' },
]

const deckLabel = (id: string) => DECKS.find((d) => d.id === id)?.label ?? id

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
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 pb-10 pt-4 text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">Truth or dare</p>
      <h2 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em] text-chalk">
        What kind of night is it?
      </h2>
      <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-mist">
        Pick the decks. The game writes the questions — whoever asks just chooses from three, or writes their own.
      </p>

      <div className="mt-7 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3" role="group" aria-label="Decks">
        {DECKS.map((deck) => {
          const on = decks.includes(deck.id)
          return (
            <button
              key={deck.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(deck.id)}
              className={cn(
                'relative overflow-hidden rounded-[1.1rem] border p-4 text-left outline-none transition-[transform,border-color] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                on ? 'border-white/40' : 'border-white/10 hover:border-white/25',
              )}
            >
              <span className={cn('absolute inset-0 bg-gradient-to-br transition-opacity duration-300', deck.tone, on ? 'opacity-100' : 'opacity-35')} />
              <span className="relative flex items-center gap-1.5 font-display text-[1.05rem] font-semibold text-chalk">
                {deck.id === 'spicy' && <Flame aria-hidden className="size-4 text-red-300" />}
                {deck.label}
              </span>
              <span className="relative mt-0.5 block text-[0.74rem] text-mist">{deck.blurb}</span>
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

      <AnimatePresence>
        {spicy && (
          <motion.label
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-left text-[0.82rem] text-chalk"
          >
            <input
              type="checkbox"
              checked={adults}
              onChange={(e) => setAdults(e.target.checked)}
              className="size-4 accent-red-500"
            />
            Everyone playing is 18 or older.
          </motion.label>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-4 text-[0.8rem] text-signal-bright">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!ready}
        onClick={() => onStart({ decks, adults })}
        className="mt-6 rounded-full bg-chalk px-8 py-3 text-[0.9rem] font-semibold text-void outline-none transition-[transform,opacity] duration-300 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        {people < 2 ? 'Needs one more person in the room' : `Start with ${people} players`}
      </button>
    </div>
  )
}

// ── the table ─────────────────────────────────────────────────────────────────

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
  const name = (p: Person | null | undefined) => (p?.id === selfId ? 'You' : (p?.name ?? 'Someone'))

  if (view.phase === 'over') return <Summary view={view} selfId={selfId} onLeaveTable={onLeaveTable} />

  return (
    <div className="relative grid h-full min-h-0 w-full grid-cols-1 gap-4 px-4 pb-6 lg:grid-cols-[1fr_15rem] lg:px-8">
      <div className="flex min-h-0 flex-col items-center justify-center">
        <Ring view={view} selfId={selfId} />

        <div className="mt-6 flex min-h-[11rem] w-full max-w-2xl flex-col items-center">
          <AnimatePresence mode="wait">
            {view.phase === 'spin' && (
              <Step key={`spin-${view.round}`}>
                <p className="text-[0.95rem] text-mist">
                  Round {view.round} · <span className="text-chalk">{name(asker)}</span> {iAsk ? 'spin' : 'spins'} the bottle
                </p>
                {iAsk && (
                  <BigButton onClick={() => act('spin')} autoFocus>
                    Spin the bottle
                  </BigButton>
                )}
              </Step>
            )}

            {view.phase === 'choose' && (
              <Step key={`choose-${view.round}`}>
                <p className="text-[0.95rem] text-mist">
                  It landed on <span className="font-semibold text-chalk">{name(answerer)}</span>.{' '}
                  {iAnswer ? 'Truth or dare?' : `${answerer?.name} is choosing…`}
                </p>
                {iAnswer && (
                  <div className="mt-4 flex gap-3">
                    {(['truth', 'dare'] as const).map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => act('choose', { kind })}
                        className={cn(
                          'group relative h-32 w-36 overflow-hidden rounded-[1.4rem] border border-white/15 outline-none transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-1.5deg] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:w-44',
                          kind === 'truth' ? 'bg-gradient-to-br from-sky-500/40 to-indigo-700/40' : 'bg-gradient-to-br from-red-500/45 to-rose-800/45',
                        )}
                      >
                        <span className="font-display text-[1.7rem] font-semibold capitalize tracking-[-0.02em] text-chalk">{kind}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Step>
            )}

            {view.phase === 'pick' &&
              (iAsk ? (
                <Picker key={`pick-${view.round}`} view={view} answerer={answerer} act={act} />
              ) : (
                <Step key={`pick-${view.round}`}>
                  <p className="text-[0.95rem] text-mist">
                    {name(answerer)} chose <span className="font-semibold capitalize text-chalk">{view.choice}</span>.{' '}
                    {asker?.name} is picking {iAnswer ? 'your' : 'their'} fate…
                  </p>
                  <div className="mt-4 flex gap-3" aria-hidden>
                    {Array.from({ length: view.offeredCount || 3 }, (_, i) => (
                      <motion.div
                        key={i}
                        className="h-32 w-24 rounded-2xl border border-white/15 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.06)_0_8px,rgba(255,255,255,.02)_8px_16px)] shadow-[0_18px_40px_-20px_rgba(0,0,0,.9)]"
                        animate={{ y: [0, -6, 0], rotate: [i - 1, (i - 1) * -1.5, i - 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </Step>
              ))}

            {view.phase === 'perform' && view.card && (
              <Step key={`perform-${view.round}`}>
                <motion.div
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 16 }}
                  className={cn(
                    'w-full max-w-xl rounded-[1.6rem] border border-white/15 px-7 py-6 text-left shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)]',
                    view.card.kind === 'truth' ? 'bg-gradient-to-br from-sky-500/25 to-indigo-800/30' : 'bg-gradient-to-br from-red-500/30 to-rose-900/35',
                  )}
                >
                  <p className="flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mist">
                    <span>
                      {view.card.kind} for {name(answerer)}
                    </span>
                    <span>{view.card.custom ? `written by ${name(asker)}` : deckLabel(view.card.deck)}</span>
                  </p>
                  <p className="mt-3 font-display text-[clamp(1.3rem,2.6vw,1.8rem)] font-semibold leading-snug tracking-[-0.02em] text-chalk">
                    {view.card.text}
                  </p>
                </motion.div>
                {(iAnswer || iAsk) && (
                  <div className="mt-5 flex gap-3">
                    <BigButton onClick={() => act('done')} autoFocus>
                      Done ✅
                    </BigButton>
                    <button
                      type="button"
                      onClick={() => act('chicken')}
                      className="rounded-full border border-white/20 px-6 py-3 text-[0.88rem] font-semibold text-chalk outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      Chicken out 🐔
                    </button>
                  </div>
                )}
              </Step>
            )}
          </AnimatePresence>

          {error && (
            <p role="alert" className="mt-3 text-[0.8rem] text-signal-bright">
              {error}
            </p>
          )}
        </div>
      </div>

      <aside className="hidden flex-col gap-3 lg:flex">
        <Scoreboard view={view} selfId={selfId} />
        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            onClick={() => act('skip')}
            className="rounded-full border border-white/12 px-4 py-2 text-[0.78rem] text-mist outline-none transition-colors hover:bg-white/5 hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
          >
            Skip this turn
          </button>
          <button
            type="button"
            onClick={() => act('end')}
            className="rounded-full border border-white/12 px-4 py-2 text-[0.78rem] text-mist outline-none transition-colors hover:bg-white/5 hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
          >
            End the game
          </button>
        </div>
      </aside>
    </div>
  )
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28 }}
      className="flex w-full flex-col items-center text-center"
      role="status"
      aria-live="polite"
    >
      {children}
    </motion.div>
  )
}

function BigButton({ children, onClick, autoFocus }: { children: React.ReactNode; onClick: () => void; autoFocus?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      className="mt-4 rounded-full bg-chalk px-7 py-3 text-[0.9rem] font-semibold text-void outline-none transition-transform duration-300 hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:scale-95"
    >
      {children}
    </button>
  )
}

/** Everyone in a circle with the bottle in the middle, pointing where it landed. */
function Ring({ view, selfId }: { view: TruthDareView; selfId: string | undefined }) {
  const n = view.players.length
  const angleOf = (i: number) => (i / n) * 360
  /* Cumulative, so each spin carries on from where the last one stopped
     rather than snapping back to zero first. */
  const rotation = useRef(0)
  const [target, setTarget] = useState(0)
  useEffect(() => {
    if (!view.spin || view.answerer === null) return
    const want = angleOf(view.answerer)
    const base = rotation.current - (rotation.current % 360)
    const next = base + view.spin.turns * 360 + want
    rotation.current = next
    setTarget(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.spin?.n])

  return (
    <div className="relative aspect-square w-[min(19rem,70vw)]">
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.08),transparent_70%)]" />
      {view.players.map((p, i) => {
        const a = ((angleOf(i) - 90) * Math.PI) / 180
        const active = i === view.answerer && view.phase !== 'spin'
        const asking = i === view.asker
        return (
          <div
            key={p.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${50 + Math.cos(a) * 44}%`, top: `${50 + Math.sin(a) * 44}%` }}
          >
            <motion.span
              animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatDelay: 0.8 }}
              className={cn(
                'grid size-12 place-items-center rounded-full font-display text-[1rem] font-semibold text-chalk ring-2 transition-colors',
                active ? 'bg-signal/70 ring-signal' : asking ? 'bg-white/20 ring-white/60' : 'bg-white/10 ring-white/15',
              )}
            >
              {p.name.slice(0, 1).toUpperCase()}
            </motion.span>
            <span className="max-w-[6rem] truncate text-[0.7rem] text-mist">{p.id === selfId ? 'You' : p.name}</span>
          </div>
        )
      })}
      <motion.svg
        viewBox="0 0 40 120"
        className="absolute left-1/2 top-1/2 h-[42%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_14px_20px_rgba(0,0,0,.6)]"
        animate={{ rotate: target }}
        transition={{ duration: 2.6, ease: [0.12, 0.65, 0.2, 1] }}
        aria-hidden
      >
        <defs>
          <linearGradient id="tdGlass" x1="0" x2="1">
            <stop offset="0" stopColor="#0d5c3a" />
            <stop offset="0.45" stopColor="#2fa36b" />
            <stop offset="1" stopColor="#0a4a2e" />
          </linearGradient>
        </defs>
        <rect x="15" y="2" width="10" height="8" rx="2" fill="#c9a227" />
        <path d="M16 10h8v22c0 6 10 12 10 24v54a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V56c0-12 10-18 10-24z" fill="url(#tdGlass)" />
        <path d="M11 60c0-6 2-10 5-13" stroke="#fff" strokeOpacity=".45" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="8" y="70" width="24" height="26" rx="3" fill="#f4ecd8" opacity=".9" />
      </motion.svg>
    </div>
  )
}

function Picker({
  view,
  answerer,
  act,
}: {
  view: TruthDareView
  answerer: Person | null | undefined
  act: (action: string, payload?: Record<string, unknown>) => void
}) {
  const [writing, setWriting] = useState(false)
  const [custom, setCustom] = useState('')
  return (
    <Step>
      <p className="text-[0.95rem] text-mist">
        {answerer?.name} chose <span className="font-semibold capitalize text-chalk">{view.choice}</span>. Pick one for them:
      </p>
      <div className="mt-4 grid w-full gap-2.5 sm:grid-cols-3">
        {view.offered.map((card, i) => (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => act('pick', { index: i })}
            initial={{ opacity: 0, y: 14, rotate: (i - 1) * 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              'flex min-h-36 flex-col rounded-[1.2rem] border border-white/15 p-4 text-left outline-none transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
              card.kind === 'truth' ? 'bg-gradient-to-br from-sky-500/20 to-indigo-800/25' : 'bg-gradient-to-br from-red-500/22 to-rose-900/28',
            )}
          >
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-mist">{deckLabel(card.deck)}</span>
            <span className="mt-2 text-[0.92rem] leading-snug text-chalk">{card.text}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => act('shuffle')}
          className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[0.8rem] text-chalk outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal"
        >
          <RefreshCw aria-hidden className="size-3.5" /> Three different ones
        </button>
        <button
          type="button"
          onClick={() => setWriting((w) => !w)}
          aria-expanded={writing}
          className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[0.8rem] text-chalk outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal"
        >
          <PenLine aria-hidden className="size-3.5" /> Write my own
        </button>
      </div>
      {writing && (
        <form
          className="mt-3 flex w-full max-w-xl gap-2"
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
            placeholder={view.choice === 'truth' ? 'Ask them anything…' : 'Dare them to…'}
            className="min-w-0 flex-1 rounded-full bg-white/[0.07] px-4 py-2.5 text-[0.88rem] text-chalk placeholder:text-dusk focus:outline-none focus:ring-2 focus:ring-signal/60"
          />
          <button
            type="submit"
            className="rounded-full bg-chalk px-5 text-[0.82rem] font-semibold text-void outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Use it
          </button>
        </form>
      )}
    </Step>
  )
}

function Scoreboard({ view, selfId }: { view: TruthDareView; selfId: string | undefined }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-mist">Tonight</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {view.players.map((p) => {
          const t = view.tally[p.id] ?? { truths: 0, dares: 0, chickens: 0 }
          return (
            <li key={p.id} className="flex items-center justify-between gap-2 text-[0.82rem]">
              <span className="truncate text-chalk">{p.id === selfId ? 'You' : p.name}</span>
              <span className="flex shrink-0 gap-2 tabular-nums text-mist" aria-label={`${t.truths} truths, ${t.dares} dares, ${t.chickens} chickened out`}>
                <span title="Truths">💬{t.truths}</span>
                <span title="Dares">🔥{t.dares}</span>
                <span title="Chickened out">🐔{t.chickens}</span>
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-[0.7rem] text-dusk">Decks: {view.decks.map(deckLabel).join(' · ')}</p>
    </div>
  )
}

function Summary({ view, selfId, onLeaveTable }: { view: TruthDareView; selfId: string | undefined; onLeaveTable: () => void }) {
  const ranked = [...view.players].sort(
    (a, b) => (view.tally[b.id]?.dares ?? 0) - (view.tally[a.id]?.dares ?? 0) || (view.tally[a.id]?.chickens ?? 0) - (view.tally[b.id]?.chickens ?? 0),
  )
  const brave = ranked[0]
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pt-6 text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">That’s the game</p>
      <h2 className="mt-2 font-display text-[2.2rem] font-semibold tracking-[-0.03em] text-chalk">
        {view.log.length} {view.log.length === 1 ? 'round' : 'rounds'}
      </h2>
      {brave && (view.tally[brave.id]?.dares ?? 0) > 0 && (
        <p className="mt-1 text-[0.95rem] text-mist">
          Bravest: <span className="font-semibold text-chalk">{brave.id === selfId ? 'you' : brave.name}</span> 🔥
        </p>
      )}
      <ul className="mt-6 w-full space-y-2 text-left">
        {view.log.slice(-5).reverse().map((l, i) => (
          <li key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[0.84rem]">
            <span className="text-mist">
              {l.answerer} · {l.kind} · {l.outcome === 'chicken' ? 'chickened out 🐔' : 'did it ✅'}
            </span>
            <span className="mt-0.5 block text-chalk">{l.text}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onLeaveTable}
        className="mt-6 rounded-full bg-chalk px-7 py-3 text-[0.88rem] font-semibold text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        Back to games
      </button>
    </div>
  )
}
