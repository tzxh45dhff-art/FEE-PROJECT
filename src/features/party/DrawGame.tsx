import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { DrawBoard } from '@/features/party/DrawBoard'
import { remaining, type PartyState } from '@/features/party/useParty'
import { cn } from '@/lib/utils'

/**
 * Draw and guess, on screen: the board on the left, the guesses on the right,
 * the word (or its blanks) and the clock across the top.
 */

type Person = { id: string; name: string }

export type DrawView = {
  players: Person[]
  scores: Record<string, number>
  turn: number
  turns: number
  drawer: number
  phase: 'choose' | 'draw' | 'reveal' | 'over'
  choices: string[]
  word: string | null
  mask: string | null
  deadline: number | null
  drawSeconds: number
  guessed: string[]
  feed: { id: number; by: Person | null; text: string; kind: 'guess' | 'correct' | 'close' | 'system' }[]
}

export function DrawSetup({
  people,
  error,
  onStart,
}: {
  people: number
  error: string | null
  onStart: (options: { rounds: number; drawSeconds: number }) => void
}) {
  const [rounds, setRounds] = useState(2)
  const [seconds, setSeconds] = useState(80)
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pb-10 pt-4 text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">Draw and guess</p>
      <h2 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.03em] text-chalk">
        Can’t draw? Perfect.
      </h2>
      <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-mist">
        Everyone takes turns drawing a word. The faster you guess, the more you score — and the drawer scores for every person who gets it.
      </p>
      <Choice label="Turns each" values={[1, 2, 3]} value={rounds} onChange={setRounds} />
      <Choice label="Seconds to draw" values={[60, 80, 100]} value={seconds} onChange={setSeconds} />
      {error && (
        <p role="alert" className="mt-4 text-[0.8rem] text-signal-bright">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={people < 2}
        onClick={() => onStart({ rounds, drawSeconds: seconds })}
        className="mt-7 rounded-full bg-chalk px-8 py-3 text-[0.9rem] font-semibold text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-40 disabled:hover:scale-100"
      >
        {people < 2 ? 'Needs one more person in the room' : `Start with ${people} players`}
      </button>
    </div>
  )
}

function Choice({ label, values, value, onChange }: { label: string; values: number[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist">{label}</span>
      <div className="flex gap-1 rounded-full bg-white/[0.06] p-1" role="radiogroup" aria-label={label}>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={cn(
              'min-w-14 rounded-full px-4 py-1.5 text-[0.85rem] font-semibold tabular-nums outline-none transition-colors focus-visible:outline-2 focus-visible:outline-signal',
              value === v ? 'bg-chalk text-void' : 'text-mist hover:text-chalk',
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

function useCountdown(party: PartyState<DrawView>) {
  const [left, setLeft] = useState(() => remaining(party, party.view.deadline))
  useEffect(() => {
    const tick = () => setLeft(remaining(party, party.view.deadline))
    tick()
    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [party])
  return left
}

export function DrawTable({
  roomId,
  party,
  selfId,
  error,
  act,
  onLeaveTable,
}: {
  roomId: string
  party: PartyState<DrawView>
  selfId: string | undefined
  error: string | null
  act: (action: string, payload?: Record<string, unknown>) => void
  onLeaveTable: () => void
}) {
  const view = party.view
  const drawer = view.players[view.drawer]
  const drawing = drawer?.id === selfId
  const left = useCountdown(party)
  const total = (view.phase === 'choose' ? 15 : view.drawSeconds) * 1000
  const name = (p: Person | null | undefined) => (p?.id === selfId ? 'You' : (p?.name ?? ''))

  if (view.phase === 'over') {
    const ranked = [...view.players].sort((a, b) => (view.scores[b.id] ?? 0) - (view.scores[a.id] ?? 0))
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-8 text-center">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">Final scores</p>
        <h2 className="mt-2 font-display text-[2.2rem] font-semibold tracking-[-0.03em] text-chalk">
          {ranked[0] ? `${name(ranked[0])} ${ranked[0].id === selfId ? 'win' : 'wins'}! 🎨` : 'Game over'}
        </h2>
        <ol className="mt-6 w-full space-y-2">
          {ranked.map((p, i) => (
            <li key={p.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <span className="text-[0.92rem] text-chalk">
                <span className="mr-3 tabular-nums text-dusk">{i + 1}</span>
                {name(p)}
              </span>
              <span className="font-display text-[1.1rem] font-semibold tabular-nums text-chalk">{view.scores[p.id] ?? 0}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onLeaveTable}
          className="mt-6 rounded-full bg-chalk px-7 py-3 text-[0.88rem] font-semibold text-void outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Back to games
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-1 gap-4 px-4 pb-6 lg:grid-cols-[1fr_19rem] lg:px-6">
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist">
              Turn {Math.min(view.turn + 1, view.turns)} of {view.turns} · {drawing ? 'You are drawing' : `${drawer?.name} is drawing`}
            </p>
            <p
              className="mt-1 truncate font-mono text-[clamp(1.3rem,3vw,1.9rem)] font-semibold tracking-[0.18em] text-chalk"
              aria-label={view.word ? `The word is ${view.word}` : view.mask ? `${view.mask.replace(/ /g, '').length} letters` : 'Choosing a word'}
            >
              {view.phase === 'choose' ? (drawing ? 'Pick a word' : 'Choosing a word…') : (view.word ?? view.mask)}
            </p>
          </div>
          <Clock left={left} total={total} />
        </div>

        <div className="relative">
          <DrawBoard roomId={roomId} canDraw={drawing && view.phase === 'draw'} />

          <AnimatePresence>
            {view.phase === 'choose' && drawing && (
              <Overlay key="choose">
                <p className="text-[0.95rem] text-mist">Pick what to draw</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                  {view.choices.map((word, i) => (
                    <button
                      key={word}
                      type="button"
                      autoFocus={i === 0}
                      onClick={() => act('pick', { index: i })}
                      className="rounded-full bg-chalk px-5 py-2.5 font-display text-[1.05rem] font-semibold capitalize text-void outline-none transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </Overlay>
            )}
            {view.phase === 'reveal' && (
              <Overlay key="reveal">
                <p className="text-[0.95rem] text-mist">The word was</p>
                <p className="mt-1 font-display text-[2.4rem] font-semibold capitalize tracking-[-0.02em] text-chalk">{view.word}</p>
                <p className="mt-2 text-[0.85rem] text-mist">
                  {view.guessed.length === 0 ? 'Nobody got it 😬' : `${view.guessed.length} got it`}
                </p>
              </Overlay>
            )}
          </AnimatePresence>
        </div>
      </div>

      <aside className="flex min-h-0 flex-col gap-3">
        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
          <ul className="flex flex-col gap-2">
            {[...view.players]
              .sort((a, b) => (view.scores[b.id] ?? 0) - (view.scores[a.id] ?? 0))
              .map((p) => (
                <li key={p.id} className="flex items-center justify-between text-[0.85rem]">
                  <span className={cn('flex items-center gap-2 truncate', view.guessed.includes(p.id) ? 'text-emerald-300' : 'text-chalk')}>
                    {p.id === drawer?.id && <span aria-label="drawing">✏️</span>}
                    {view.guessed.includes(p.id) && <span aria-label="guessed it">✓</span>}
                    {name(p)}
                  </span>
                  <span className="font-semibold tabular-nums text-chalk">{view.scores[p.id] ?? 0}</span>
                </li>
              ))}
          </ul>
        </div>
        <Feed view={view} selfId={selfId} drawing={drawing} act={act} error={error} />
        <div className="flex gap-2">
          {drawing && (view.phase === 'draw' || view.phase === 'choose') && (
            <button type="button" onClick={() => act('skip')} className="flex-1 rounded-full border border-white/12 px-3 py-2 text-[0.75rem] text-mist hover:bg-white/5 hover:text-chalk">
              Skip my turn
            </button>
          )}
          <button type="button" onClick={() => act('end')} className="flex-1 rounded-full border border-white/12 px-3 py-2 text-[0.75rem] text-mist hover:bg-white/5 hover:text-chalk">
            End the game
          </button>
        </div>
      </aside>
    </div>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 grid place-items-center rounded-[1.1rem] bg-void/75 p-6 text-center backdrop-blur-sm"
    >
      <div>{children}</div>
    </motion.div>
  )
}

function Clock({ left, total }: { left: number; total: number }) {
  const seconds = Math.ceil(left / 1000)
  const fraction = total > 0 ? Math.min(1, left / total) : 0
  const urgent = seconds <= 10 && left > 0
  return (
    <div className="relative grid size-14 shrink-0 place-items-center" aria-label={`${seconds} seconds left`} role="timer">
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke={urgent ? '#ff5a5a' : '#fafafa'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={100.5}
          strokeDashoffset={100.5 * (1 - fraction)}
          style={{ transition: 'stroke-dashoffset .25s linear' }}
        />
      </svg>
      <span className={cn('font-display text-[1.05rem] font-semibold tabular-nums', urgent ? 'text-signal-bright' : 'text-chalk')}>{seconds}</span>
    </div>
  )
}

function Feed({
  view,
  selfId,
  drawing,
  act,
  error,
}: {
  view: DrawView
  selfId: string | undefined
  drawing: boolean
  act: (action: string, payload?: Record<string, unknown>) => void
  error: string | null
}) {
  const [guess, setGuess] = useState('')
  const list = useRef<HTMLUListElement>(null)
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [view.feed.length])
  const done = selfId ? view.guessed.includes(selfId) : false
  const canGuess = view.phase === 'draw' && !drawing && !done

  return (
    <div className="flex min-h-[14rem] flex-1 flex-col rounded-[1.2rem] border border-white/10 bg-white/[0.03]">
      <ul ref={list} className="flex-1 space-y-1 overflow-y-auto p-3 text-[0.84rem]" aria-live="polite" aria-label="Guesses">
        {view.feed.map((f) => (
          <li
            key={f.id}
            className={cn(
              'rounded-lg px-2 py-1',
              f.kind === 'correct' && 'bg-emerald-400/15 font-semibold text-emerald-200',
              f.kind === 'close' && 'bg-amber-400/15 text-amber-200',
              f.kind === 'system' && 'text-dusk italic',
              f.kind === 'guess' && 'text-chalk',
            )}
          >
            {f.kind === 'guess' && <span className="mr-1.5 font-semibold text-mist">{f.by?.id === selfId ? 'You' : f.by?.name}</span>}
            {f.text}
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2 border-t border-white/10 p-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!guess.trim()) return
          act('guess', { text: guess })
          setGuess('')
        }}
      >
        <label htmlFor="draw-guess" className="sr-only">
          Your guess
        </label>
        <input
          id="draw-guess"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={!canGuess}
          maxLength={60}
          autoComplete="off"
          placeholder={drawing ? 'You’re drawing' : done ? 'You got it!' : view.phase === 'draw' ? 'Type your guess…' : 'Wait for the drawing'}
          className="min-w-0 flex-1 rounded-full bg-white/[0.07] px-4 py-2 text-[0.88rem] text-chalk placeholder:text-dusk focus:outline-none focus:ring-2 focus:ring-signal/60 disabled:opacity-60"
        />
      </form>
      {error && (
        <p role="alert" className="px-3 pb-2 text-[0.75rem] text-signal-bright">
          {error}
        </p>
      )}
    </div>
  )
}
