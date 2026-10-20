import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Segmented } from '@/features/party/Segmented'
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
const MEDALS = ['🥇', '🥈', '🥉']

/* Everyone keeps the same colour all game, so a guess on a tile reads as a face. */
const HUES = ['from-rose-400 to-pink-600', 'from-amber-300 to-orange-500', 'from-sky-400 to-indigo-500', 'from-violet-400 to-fuchsia-600', 'from-emerald-300 to-teal-500', 'from-lime-300 to-green-500']
const hue = (id: string) => HUES[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % HUES.length]!

function Face({ person, className }: { person: Person; className?: string }) {
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white', hue(person.id), className)} aria-hidden>
      {person.name.slice(0, 1).toUpperCase()}
    </span>
  )
}

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
  const urgent = view.phase === 'answer' && left > 0 && left <= 5000

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
          <>
            {/* The pair who know each other best, side by side, with a heart between them. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative mt-6 flex items-center"
            >
              <span aria-hidden className="absolute -inset-6 rounded-full bg-pink-500/20 blur-3xl" />
              {[best.g, best.s].map((id, k) => {
                const p = view.players.find((x) => x.id === id)
                return p ? (
                  <motion.span
                    key={id}
                    initial={{ x: k ? 26 : -26, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
                    className={cn('relative', k && '-ml-3')}
                  >
                    <Face person={p} className="size-16 font-display text-[1.5rem] ring-4 ring-[#120e15]" />
                  </motion.span>
                ) : null
              })}
              <motion.span
                aria-hidden
                className="absolute left-1/2 top-1/2 -ml-[0.8rem] -mt-[0.85rem] text-[1.6rem] leading-none"
                animate={{ scale: [1, 1.22, 1, 1.12, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
              >
                💞
              </motion.span>
            </motion.div>
            <h2 className="mt-4 text-balance font-display text-[clamp(1.6rem,5vw,2rem)] font-semibold leading-tight tracking-[-0.03em] text-chalk">
              {who(best.g)} {best.g === selfId ? 'know' : 'knows'} {best.s === selfId ? 'you' : who(best.s)} best
              <span className="mt-1 block text-[1rem] font-normal text-mist">
                {best.right} of {best.asked} right
              </span>
            </h2>
          </>
        ) : (
          <h2 className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.03em] text-chalk">Game over</h2>
        )}
        <ol className="mt-6 w-full space-y-2">
          {ranked.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 300, damping: 26 }}
              className={cn(
                'flex items-center justify-between rounded-2xl border px-4 py-3',
                i === 0 ? 'border-amber-200/30 bg-amber-300/[0.08] shadow-[0_0_40px_-14px_rgba(252,211,77,.5)]' : 'border-white/10 bg-white/[0.04]',
              )}
            >
              <span className="flex min-w-0 items-center gap-3 text-[0.92rem] text-chalk">
                <span className="w-5 text-center tabular-nums text-dusk">{MEDALS[i] ?? i + 1}</span>
                <Face person={p} className="size-7 text-[0.7rem]" />
                <span className="truncate">{name(p)}</span>
              </span>
              <span className={cn('font-display text-[1.1rem] font-semibold tabular-nums', i === 0 ? 'text-amber-100' : 'text-chalk')}>{view.scores[p.id] ?? 0}</span>
            </motion.li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onLeaveTable}
          className="mt-6 rounded-full bg-chalk px-7 py-3 text-[0.88rem] font-semibold text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:scale-[0.97]"
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
        <span
          className={cn(
            'font-display text-[1.1rem] font-semibold tabular-nums transition-colors',
            urgent ? 'text-signal-bright' : 'text-chalk',
          )}
          role="timer"
          aria-label={`${Math.ceil(left / 1000)} seconds`}
        >
          {view.phase === 'answer' ? `${Math.ceil(left / 1000)}s` : ''}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300 ease-linear',
            urgent ? 'animate-pulse bg-signal-bright shadow-[0_0_14px_rgba(255,90,90,.85)]' : 'bg-gradient-to-r from-pink-300/70 to-violet-300',
          )}
          style={{
            width: view.phase === 'answer' ? `${Math.min(100, (left / (view.answerSeconds * 1000)) * 100)}%` : '0%',
          }}
        />
      </div>

      <div className="my-auto flex w-full flex-col items-center py-6">
        <motion.div key={view.turn} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
          {/* The hot seat: a warm halo turning slowly round whoever's in it. */}
          <div className="relative grid size-[5.5rem] place-items-center">
            <span aria-hidden className="absolute -inset-4 rounded-full bg-gradient-to-br from-orange-500/30 to-pink-500/30 blur-2xl" />
            <span
              aria-hidden
              className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#fb923c,#ec4899,#a78bfa,#fb923c)]"
              style={{ animationDuration: hotSeat && !revealed ? '3s' : '8s' }}
            />
            <span className="relative grid size-[4.9rem] place-items-center rounded-full bg-[#140f17]">
              <Face person={subject} className="size-[4.4rem] font-display text-[1.7rem]" />
            </span>
            <motion.span
              initial={{ y: 6, scale: 0.7, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 480, damping: 20, delay: 0.15 }}
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_6px_16px_-6px_rgba(236,72,153,.8)]"
            >
              🔥 Hot seat
            </motion.span>
          </div>
          <p className="mt-5 font-display text-[1.05rem] font-semibold text-chalk">{hotSeat ? 'You' : subject.name}</p>
          <div role="status" aria-live="polite" className="mt-1">
            {hotSeat && !revealed ? (
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.25 }}
                className="text-[0.85rem] text-orange-200"
              >
                You’re in the hot seat. Answer honestly — they’re guessing.
              </motion.p>
            ) : (
              <p className="text-[0.85rem] text-mist">
                {hotSeat ? 'Here’s how well they know you' : revealed ? `${subject.name}’s answer` : `What will ${subject.name} pick?`}
              </p>
            )}
          </div>
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, scale: truth ? [1, 1.05, 1.03] : 1 }}
                whileTap={revealed ? undefined : { scale: 0.97, y: 2 }}
                transition={{ delay: revealed ? 0 : i * 0.05, type: 'spring', stiffness: 400, damping: 24, scale: truth ? { duration: 0.5 } : undefined }}
                className={cn(
                  'group relative flex min-h-20 items-center gap-3 overflow-hidden rounded-[1.2rem] border p-4 text-left outline-none transition-[border-color,background-color,opacity] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                  'shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_4px_0_rgba(0,0,0,.35)]',
                  truth
                    ? 'border-emerald-400/70 bg-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_4px_0_rgba(0,0,0,.35),0_0_44px_-10px_rgba(52,211,153,.7)]'
                    : revealed
                      ? 'border-white/5 bg-white/[0.02] opacity-55'
                      : picked
                        ? 'border-white/70 bg-white/[0.1]'
                        : 'border-white/10 bg-white/[0.04] hover:border-white/30',
                )}
              >
                {!revealed && <span className={cn('absolute inset-0 bg-gradient-to-br to-transparent transition-opacity', TONES[i], picked ? 'opacity-100' : 'opacity-60')} />}
                {truth && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ left: '-60%' }}
                    animate={{ left: '130%' }}
                    transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                  />
                )}
                <span
                  className={cn(
                    'relative grid size-8 shrink-0 place-items-center rounded-full text-[0.78rem] font-semibold transition-colors',
                    truth ? 'bg-emerald-300 text-void' : picked ? 'bg-chalk text-void' : 'bg-white/10 text-chalk',
                  )}
                >
                  {truth ? '✓' : LETTERS[i]}
                </span>
                <span className="relative flex-1 text-[0.98rem] font-medium text-chalk">{option}</span>
                {picked && !revealed && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="relative shrink-0 rounded-full bg-black/35 px-2.5 py-1 text-[0.7rem] font-semibold text-chalk"
                  >
                    {hotSeat ? 'My answer' : 'My guess'}
                  </motion.span>
                )}
                {guessers.length > 0 && (
                  <span className="relative flex -space-x-1.5" aria-label={`Guessed by ${guessers.map((g) => g.name).join(', ')}`}>
                    {guessers.map((g, k) => (
                      <motion.span
                        key={g.id}
                        title={g.name}
                        initial={{ scale: 0, y: 8 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 18, delay: 0.35 + k * 0.08 }}
                        className={cn('relative rounded-full ring-2', truth ? 'ring-emerald-300' : 'ring-[#140f17]')}
                      >
                        <Face person={g} className="size-7 text-[0.7rem]" />
                      </motion.span>
                    ))}
                  </span>
                )}
                {truth && <span className="sr-only">the true answer</span>}
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
              className={cn(
                'mt-5 rounded-full px-5 py-2 text-center text-[0.92rem] font-medium text-chalk ring-1',
                selfId !== undefined && view.truth !== null && view.guesses[selfId] === view.truth && !hotSeat
                  ? 'bg-emerald-400/15 ring-emerald-300/30'
                  : 'bg-white/[0.06] ring-white/10',
              )}
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

      <div className="flex w-full flex-wrap items-center justify-between gap-3 pt-2">
        <ul className="flex flex-wrap gap-1.5 text-[0.78rem]" aria-label="Scores">
          {view.players.map((p) => (
            <li
              key={p.id}
              className={cn(
                'flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-mist',
                p.id === subject.id ? 'bg-orange-400/15 ring-1 ring-orange-300/30' : 'bg-white/[0.05]',
              )}
            >
              <Face person={p} className="size-5 text-[0.58rem]" />
              <span className="text-chalk">{name(p)}</span> <span className="font-semibold tabular-nums">{view.scores[p.id] ?? 0}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => act('end')}
          className="rounded-full border border-white/12 px-4 py-2 text-[0.75rem] text-mist outline-none transition-colors hover:bg-white/5 hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
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
