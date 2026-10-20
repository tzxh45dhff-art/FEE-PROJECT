import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { remaining, type PartyState } from '@/features/party/useParty'
import { cn } from '@/lib/utils'

/**
 * How well do you know me, on screen. The person in the hot seat picks the
 * truth about themselves; everyone else picks what they think it is; then the
 * answer turns green and everyone's guess is shown on the option they chose.
 */

type Person = { id: string; name: string }

export type KnowMeView = {
  players: Person[]
  scores: Record<string, number>
  turn: number
  turns: number
  subject: number
  phase: 'answer' | 'reveal' | 'over'
  question: { q: string; options: [string, string, string, string] }
  truth: number | null
  guesses: Record<string, number>
  answered: string[]
  deadline: number | null
  answerSeconds: number
  reads: Record<string, Record<string, [number, number]>>
}

const LETTERS = ['A', 'B', 'C', 'D']
const TONES = ['from-pink-500/25', 'from-amber-500/25', 'from-sky-500/25', 'from-violet-500/25']

export function KnowMeSetup({
  people,
  error,
  onStart,
}: {
  people: number
  error: string | null
  onStart: (options: { perPerson: number; answerSeconds: number }) => void
}) {
  const [perPerson, setPerPerson] = useState(5)
  const [seconds, setSeconds] = useState(30)
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pb-10 pt-4 text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">How well do you know me?</p>
      <h2 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.03em] text-balance text-chalk">
        Find out who really knows you.
      </h2>
      <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-mist">
        Take turns in the hot seat. You answer about yourself, in secret; everyone else guesses what you picked. Then it all comes out.
      </p>
      <Segmented label="Questions each" values={[3, 5, 8]} value={perPerson} onChange={setPerPerson} />
      <Segmented label="Seconds to answer" values={[20, 30, 45]} value={seconds} onChange={setSeconds} />
      {error && (
        <p role="alert" className="mt-4 text-[0.8rem] text-signal-bright">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={people < 2}
        onClick={() => onStart({ perPerson, answerSeconds: seconds })}
        className="mt-7 rounded-full bg-chalk px-8 py-3 text-[0.9rem] font-semibold text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-40 disabled:hover:scale-100"
      >
        {people < 2 ? 'Needs one more person in the room' : `Start with ${people} players`}
      </button>
    </div>
  )
}

function Segmented({ label, values, value, onChange }: { label: string; values: number[]; value: number; onChange: (v: number) => void }) {
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

export function KnowMeTable({
  party,
  selfId,
  error,
  act,
  onLeaveTable,
}: {
  party: PartyState<KnowMeView>
  selfId: string | undefined
  error: string | null
  act: (action: string, payload?: Record<string, unknown>) => void
  onLeaveTable: () => void
}) {
  const view = party.view
  const subject = view.players[view.subject]!
  const hotSeat = subject.id === selfId
  const mine = hotSeat ? view.truth : selfId !== undefined ? view.guesses[selfId] : undefined
  const revealed = view.phase === 'reveal'
  const [left, setLeft] = useState(() => remaining(party, view.deadline))
  useEffect(() => {
    const tick = () => setLeft(remaining(party, view.deadline))
    tick()
    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [party, view.deadline])
  const name = (p: Person | undefined) => (p?.id === selfId ? 'You' : (p?.name ?? ''))

  if (view.phase === 'over') {
    const ranked = [...view.players].sort((a, b) => (view.scores[b.id] ?? 0) - (view.scores[a.id] ?? 0))
    let best: { g: string; s: string; right: number; asked: number } | null = null
    for (const [g, row] of Object.entries(view.reads)) {
      for (const [s, [right, asked]] of Object.entries(row)) {
        if (asked >= 2 && (!best || right / asked > best.right / best.asked)) best = { g, s, right, asked }
      }
    }
    const who = (id: string) => name(view.players.find((p) => p.id === id))
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-8 text-center">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">The verdict</p>
        {best ? (
          <h2 className="mt-2 font-display text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-chalk">
            {who(best.g)} {best.g === selfId ? 'know' : 'knows'} {best.s === selfId ? 'you' : who(best.s)} best 💞
            <span className="mt-1 block text-[1rem] font-normal text-mist">
              {best.right} of {best.asked} right
            </span>
          </h2>
        ) : (
          <h2 className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.03em] text-chalk">Game over</h2>
        )}
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
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center px-5 pb-8">
      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist">
          Question {view.turn + 1} of {view.turns}
        </p>
        <span className="font-display text-[1.1rem] font-semibold tabular-nums text-chalk" role="timer" aria-label={`${Math.ceil(left / 1000)} seconds`}>
          {view.phase === 'answer' ? `${Math.ceil(left / 1000)}s` : ''}
        </span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
        <div
          className={cn('h-full rounded-full transition-[width] duration-300 ease-linear', left < 5000 ? 'bg-signal-bright' : 'bg-chalk/70')}
          style={{
            width: view.phase === 'answer' ? `${Math.min(100, (left / (view.answerSeconds * 1000)) * 100)}%` : '0%',
          }}
        />
      </div>

      <div className="my-auto flex w-full flex-col items-center py-6">
        <motion.div key={view.turn} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
          <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-pink-500/60 to-violet-600/60 font-display text-[1.5rem] font-semibold text-chalk ring-2 ring-white/30">
            {subject.name.slice(0, 1).toUpperCase()}
          </span>
          <p className="mt-3 text-[0.85rem] text-mist" role="status" aria-live="polite">
            {hotSeat
              ? revealed
                ? 'Here’s how well they know you'
                : 'You’re in the hot seat. Answer honestly — they’re guessing.'
              : revealed
                ? `${subject.name}’s answer`
                : `What will ${subject.name} pick?`}
          </p>
          <h2 className="mt-2 max-w-xl font-display text-[clamp(1.5rem,3.4vw,2.2rem)] font-semibold leading-tight tracking-[-0.025em] text-chalk">
            {view.question.q}
          </h2>
        </motion.div>

        <div className="mt-7 grid w-full gap-2.5 sm:grid-cols-2">
          {view.question.options.map((option, i) => {
            const truth = revealed && view.truth === i
            const picked = mine === i
            const guessers = revealed ? view.players.filter((p) => p.id !== subject.id && view.guesses[p.id] === i) : []
            return (
              <motion.button
                key={`${view.turn}-${i}`}
                type="button"
                disabled={revealed}
                onClick={() => act('answer', { option: i })}
                aria-pressed={picked}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, scale: truth ? 1.03 : 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'relative flex min-h-20 items-center gap-3 overflow-hidden rounded-[1.2rem] border p-4 text-left outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                  truth
                    ? 'border-emerald-400/70 bg-emerald-500/20'
                    : revealed
                      ? 'border-white/5 bg-white/[0.02] opacity-60'
                      : picked
                        ? 'border-white/60 bg-white/[0.08]'
                        : 'border-white/10 bg-white/[0.04] hover:border-white/30',
                )}
              >
                {!revealed && <span className={cn('absolute inset-0 bg-gradient-to-br to-transparent opacity-60', TONES[i])} />}
                <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-[0.78rem] font-semibold text-chalk">
                  {LETTERS[i]}
                </span>
                <span className="relative flex-1 text-[0.98rem] font-medium text-chalk">{option}</span>
                <span className="relative flex -space-x-1.5">
                  {guessers.map((g) => (
                    <span
                      key={g.id}
                      title={g.name}
                      className={cn(
                        'grid size-7 place-items-center rounded-full text-[0.7rem] font-semibold ring-2 ring-void',
                        truth ? 'bg-emerald-400 text-void' : 'bg-white/25 text-chalk',
                      )}
                    >
                      {g.name.slice(0, 1).toUpperCase()}
                    </span>
                  ))}
                  {truth && (
                    <span className="ml-2 text-[1.1rem]" aria-label="the true answer">
                      ✓
                    </span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {view.phase === 'answer' ? (
            <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 text-[0.8rem] text-dusk">
              {view.answered.length} of {view.players.length} answered
              {mine !== undefined && mine !== null ? ' · you can still change yours' : ''}
            </motion.p>
          ) : (
            <motion.p
              key={`verdict-${view.turn}`}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 22,
                delay: 0.25,
              }}
              className="mt-5 rounded-full bg-white/[0.06] px-5 py-2 text-[0.92rem] font-medium text-chalk"
            >
              {verdict(view, selfId, subject)}
            </motion.p>
          )}
        </AnimatePresence>
        {error && (
          <p role="alert" className="mt-2 text-[0.8rem] text-signal-bright">
            {error}
          </p>
        )}
      </div>

      <div className="flex w-full items-center justify-between pt-2">
        <ul className="flex flex-wrap gap-3 text-[0.8rem]">
          {view.players.map((p) => (
            <li key={p.id} className="text-mist">
              <span className="text-chalk">{name(p)}</span> <span className="tabular-nums">{view.scores[p.id] ?? 0}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => act('end')}
          className="rounded-full border border-white/12 px-4 py-2 text-[0.75rem] text-mist hover:bg-white/5 hover:text-chalk"
        >
          End the game
        </button>
      </div>
    </div>
  )
}

/** One line that says what just happened, from where you sit. */
function verdict(view: KnowMeView, selfId: string | undefined, subject: Person): string {
  if (view.truth === null) return `${subject.name} didn’t answer in time — no points`
  const guessers = view.players.filter((p) => p.id !== subject.id)
  const right = guessers.filter((p) => view.guesses[p.id] === view.truth)
  if (subject.id === selfId) {
    if (right.length === 0) return 'Nobody saw that coming 👀'
    if (right.length === guessers.length) return `${right.length === 1 ? right[0]!.name : 'Everyone'} read you right · +${right.length * 50}`
    return `${right.map((p) => p.name).join(', ')} read you right · +${right.length * 50}`
  }
  const mine = selfId !== undefined ? view.guesses[selfId] : undefined
  if (mine === view.truth) return `You got it · +100 🎉`
  if (mine === undefined) return `Too slow — it was “${view.question.options[view.truth]}”`
  return `Not quite — ${subject.name} picked “${view.question.options[view.truth]}”`
}
