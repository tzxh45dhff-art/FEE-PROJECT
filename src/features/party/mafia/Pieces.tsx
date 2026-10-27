import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Emblem } from './art'
import { storyDate, useArc } from './arcs'
import { callName } from './helpers'
import { ROLE_TITLE, isFamily, type CaseEvent, type MafiaView, type Role, type Winner } from './types'

/* ── the role card ────────────────────────────────────────────────────── */

/**
 * A playing card from a 1950s deck. Face down until you turn it — and at a
 * table, it only shows while you hold it, so the person beside you can't
 * read it over your shoulder.
 */
export function RoleCard({
  role,
  title,
  line,
  hold = false,
  shown: forced,
  onSeen,
  className,
}: {
  role: Role
  title: string
  line: string
  hold?: boolean
  shown?: boolean
  onSeen?: () => void
  className?: string
}) {
  const [turned, setTurned] = useState(false)
  const shown = forced ?? turned
  const arc = useArc()
  const red = isFamily(role)
  const reported = useRef(false)
  const reveal = (on: boolean) => {
    setTurned(on)
    if (on && !reported.current) {
      reported.current = true
      onSeen?.()
    }
  }
  return (
    <button
      type="button"
      aria-label={shown ? `Your role: ${title}` : hold ? 'Hold to see your role' : 'Turn over your card'}
      onClick={hold ? undefined : () => reveal(!turned)}
      onPointerDown={hold ? () => reveal(true) : undefined}
      onPointerUp={hold ? () => setTurned(false) : undefined}
      onPointerLeave={hold ? () => setTurned(false) : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') reveal(!turned)
      }}
      className={cn(
        /* As wide as fits — and never taller than the screen has room for, sideways on a phone included. */
        '@container relative aspect-[5/7] w-[clamp(6rem,calc((100dvh-15rem)*0.7),14rem)] select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--noir-brass)] sm:w-[clamp(6rem,calc((100dvh-15rem)*0.7),16rem)]',
        className,
      )}
    >
      {/* A flip that works everywhere: the card narrows to its edge, turns over, and opens again. */}
      <AnimatePresence mode="wait" initial={false}>
        {!shown ? (
          <motion.div
            key="back"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.16, ease: 'easeIn' }}
            className="absolute inset-0 grid place-items-center rounded-xl border border-[var(--noir-brass)]/60 bg-[repeating-linear-gradient(45deg,var(--noir-card-1)_0_10px,var(--noir-card-2)_10px_20px)] noir-frame"
          >
            <div className="grid size-[84%] place-items-center rounded-lg border-2 border-double border-[var(--noir-brass)]/80 bg-[var(--noir-card-3)]/60">
              <div className="text-center">
                <p className="font-deco text-[clamp(1rem,11cqw,1.6rem)] text-[var(--noir-brass)]">{arc.card[0]}</p>
                <p className="font-type mt-1 text-[0.7rem] uppercase tracking-[0.4em] text-[var(--noir-paper-dim)]">{arc.card[1]}</p>
                <p className="font-type mt-[8cqw] text-[0.72rem] text-[var(--noir-paper-dim)]/80">{hold ? 'hold to look' : 'tap to turn'}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="face"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-0 flex flex-col items-center justify-between rounded-xl px-[8cqw] py-[6cqw] noir-paper noir-paper-edge"
          >
            <div className="flex w-full justify-between font-deco text-[clamp(0.75rem,6.5cqw,1rem)]" style={{ color: red ? 'var(--noir-blood)' : 'var(--noir-ink-2)' }}>
              <span>{ROLE_TITLE[role][0]}</span>
              <span>{ROLE_TITLE[role][0]}</span>
            </div>
            <Emblem role={role} className={cn('min-h-0 w-[62%] shrink', line && 'w-[50%]', red ? 'text-[var(--noir-blood)]' : 'text-[var(--noir-ink-2)]')} />
            <div className="text-center">
              <p className="font-deco text-[clamp(0.85rem,9.5cqw,1.5rem)] leading-tight" style={{ color: red ? 'var(--noir-blood)' : 'var(--noir-ink-2)' }}>
                {title}
              </p>
              {line && <p className="font-type mt-[3cqw] text-[clamp(0.58rem,5.2cqw,0.8rem)] leading-snug text-[var(--noir-ink-3)]">{line}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

/* ── the morning edition ──────────────────────────────────────────────── */

/** The story's morning paper, spun onto the screen like an old film's front page. */
export function Newspaper({ round, headline, fact, story, photo }: { round: number; headline: string; fact?: string; story: string; photo?: React.ReactNode }) {
  const arc = useArc()
  return (
    <motion.article
      initial={{ rotate: -360, scale: 0.2, opacity: 0 }}
      animate={{ rotate: -2, scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 150, damping: 17 }}
      className="noir-paper noir-paper-edge mx-auto w-[calc(100%-0.5rem)] max-w-[34rem] rounded-sm px-5 py-4 sm:px-7 sm:py-6"
    >
      <header className="border-b-[3px] border-double border-[var(--noir-ink-2)] pb-2 text-center">
        <p className="font-old text-[2rem] font-black leading-none tracking-tight text-[var(--noir-ink-1)] sm:text-[2.6rem]">{arc.paper}</p>
        <div className="font-type mt-2 flex justify-between text-[0.7rem] uppercase tracking-wider text-[var(--noir-ink-4)]">
          <span>{storyDate(arc, round)}</span>
          <span>{arc.price}</span>
        </div>
      </header>
      <h2 className="font-old mt-3 text-center text-[1.55rem] font-black uppercase leading-[1.05] text-[var(--noir-ink-1)] sm:text-[2rem]">{headline}</h2>
      {fact && <p className="font-type mt-2 text-center text-[1rem] text-[var(--noir-blood)]">{fact}</p>}
      <div className="mt-3 flex gap-4">
        {photo && <div className="hidden w-28 shrink-0 sm:block">{photo}</div>}
        <p className="font-old text-[1rem] italic leading-relaxed text-[var(--noir-ink-2)] first-letter:float-left first-letter:mr-1.5 first-letter:font-deco first-letter:text-[2.6rem] first-letter:leading-[0.8]">
          {story}
        </p>
      </div>
    </motion.article>
  )
}

/* ── the clock ────────────────────────────────────────────────────────── */

/** A brass clock face that empties as the time runs out; the last ten seconds tick. */
export function Clock({ left, total, paused, onTick }: { left: number; total: number; paused: boolean; onTick?: () => void }) {
  const seconds = Math.ceil(left / 1000)
  const share = total > 0 ? Math.min(1, Math.max(0, left / total)) : 0
  const last = useRef(seconds)
  useEffect(() => {
    if (seconds !== last.current && seconds <= 10 && seconds > 0 && !paused) onTick?.()
    last.current = seconds
  }, [seconds, paused, onTick])
  const label = seconds >= 60 ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : `${seconds}`
  return (
    <div className="relative grid size-14 shrink-0 place-items-center rounded-full noir-brass shadow-[0_6px_18px_-6px_rgba(0,0,0,.8)] sm:size-16 [@media(max-height:520px)]:size-11" role="timer" aria-label={paused ? 'Paused' : `${seconds} seconds left`}>
      <div
        className="absolute inset-[3px] rounded-full"
        style={{ background: `conic-gradient(${seconds <= 10 ? 'var(--noir-blood)' : 'var(--noir-panel-hi)'} ${share * 360}deg, var(--noir-panel-lo) 0deg)` }}
      />
      <div className="absolute inset-[7px] rounded-full bg-[var(--noir-paper)] shadow-[inset_0_2px_6px_rgba(0,0,0,.45)]" />
      <span className={cn('font-deco relative text-[0.95rem] tracking-normal text-[var(--noir-ink-1)] sm:text-[1.15rem] [@media(max-height:520px)]:text-[0.78rem]', seconds <= 10 && !paused && 'text-[var(--noir-blood)]')}>
        {paused ? '❚❚' : label}
      </span>
    </div>
  )
}

/* ── subtitles ────────────────────────────────────────────────────────── */

/** The narrator's words, typed out as they are spoken. */
export function Subtitles({ id, text }: { id: string | null; text: string | null }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    setShown(0)
    if (!text) return
    const timer = window.setInterval(() => setShown((n) => (n >= text.length ? n : n + 1)), 1000 / 13)
    return () => window.clearInterval(timer)
  }, [id, text])
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.p
          key={id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="font-old mx-auto max-w-3xl px-4 text-center text-[0.95rem] italic leading-snug text-[var(--noir-paper)] [text-shadow:0_2px_12px_rgba(0,0,0,.9)] sm:text-[1.15rem] sm:leading-relaxed [@media(max-height:520px)]:text-[0.85rem] [@media(max-height:520px)]:leading-snug"
          aria-live="polite"
        >
          {text.slice(0, shown)}
          <span className="opacity-0">{text.slice(shown)}</span>
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/* ── the case file ────────────────────────────────────────────────────── */

const VERDICT: Record<Winner | 'none', { stamp: string; line: string; color: string }> = {
  town: { stamp: 'CASE CLOSED', line: 'The town wins. The Family is finished.', color: 'var(--noir-town)' },
  family: { stamp: 'UNSOLVED', line: 'The Family wins.', color: 'var(--noir-blood)' },
  jester: { stamp: 'A FOOL WINS', line: 'The Jester wins — they wanted the rope all along.', color: 'var(--noir-jester)' },
  none: { stamp: 'ABANDONED', line: 'The case was dropped before it was solved.', color: 'var(--noir-ink-5)' },
}

const WINNER_NAME: Record<Winner, string> = { town: 'the town', family: 'the Family', jester: 'the Jester' }

/** Everything, finally: the roles, the nights, the close calls, the hunches — and the table's own honours. */
export function CaseFile({
  view,
  selfId,
  isHost,
  onPlayAgain,
  onLeave,
  onBluff,
}: {
  view: MafiaView
  selfId: string | undefined
  isHost: boolean
  onPlayAgain: () => void
  onLeave: () => void
  onBluff: (target: string) => void
}) {
  const arc = useArc()
  const v = VERDICT[view.winner ?? 'none']
  const verdictLine = view.winner === 'family' ? `${v.line} ${arc.takeover}` : v.line
  const seat = (id: string | null | undefined) => view.players.find((p) => p.id === id)
  const name = (id: string | null | undefined) => {
    const s = seat(id)
    return s ? callName(s.name) : 'someone'
  }
  const rounds = new Map<number, CaseEvent[]>()
  for (const e of view.history ?? []) rounds.set(e.round, [...(rounds.get(e.round) ?? []), e])
  const playing = !!selfId && view.players.some((p) => p.id === selfId)

  /* The close calls: trials decided by one vote, or a tie. */
  const swings = view.ledger
    .filter((d) => d.accused)
    .map((d) => {
      const guilty = Object.values(d.judgement).filter(Boolean).length
      const innocent = Object.values(d.judgement).length - guilty
      return { d, guilty, innocent, margin: Math.abs(guilty - innocent) }
    })
    .filter((s) => s.margin <= 1)
  const saves = (view.history ?? []).filter((e): e is Extract<CaseEvent, { kind: 'saved' }> => e.kind === 'saved')

  /* Hunches: who the town suspected most at night, and who saw the Family first. */
  const counts = new Map<string, number>()
  for (const s of view.suspicions ?? []) counts.set(s.target, (counts.get(s.target) ?? 0) + 1)
  const topSuspect = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  const firstRight = (view.suspicions ?? []).filter((s) => isFamily(seat(s.target)?.role ?? null)).sort((a, b) => a.round - b.round)[0]
  const changes = new Map<string, Set<string>>()
  for (const s of view.suspicions ?? []) changes.set(s.by, (changes.get(s.by) ?? new Set()).add(s.target))
  const fickle = [...changes.entries()].sort((a, b) => b[1].size - a[1].size)[0]

  const predictions = Object.entries(view.predictions ?? {})
  const sharp = (view.history ?? []).filter((e): e is Extract<CaseEvent, { kind: 'file' }> => e.kind === 'file' && e.family).length

  /* Best bluff, by the table's own vote. */
  const bluffs = new Map<string, number>()
  for (const target of Object.values(view.bluff ?? {})) bluffs.set(target, (bluffs.get(target) ?? 0) + 1)
  const bluffLeader = [...bluffs.entries()].sort((a, b) => b[1] - a[1])[0]
  const myBluff = selfId ? view.bluff?.[selfId] : undefined

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="noir-paper noir-paper-edge relative mx-auto w-full max-w-[46rem] rounded-sm px-5 pb-6 pt-5 sm:px-8">
      <div className="absolute -top-3 left-6 rounded-t-md bg-[var(--noir-paper-dim)] px-4 py-1 font-type text-[0.74rem] uppercase tracking-[0.22em] text-[var(--noir-ink-4)]">{arc.caseFile}</div>
      <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div>
          <p className="font-deco text-[1.6rem] leading-tight text-[var(--noir-ink-1)] sm:text-[2.2rem]">The {view.round === 1 ? 'one-night' : `${view.round}-night`} affair</p>
          <p className="font-type mt-1 text-[0.92rem] text-[var(--noir-ink-3)]">{verdictLine}</p>
        </div>
        <span className="noir-stamp shrink-0 rounded-sm px-3 py-1.5 text-[1rem] sm:text-[1.2rem]" style={{ color: v.color }}>
          {v.stamp}
        </span>
      </div>

      <Heading>The cast</Heading>
      <ul className="mt-2 grid grid-cols-1 gap-2 min-[440px]:grid-cols-2 sm:grid-cols-3">
        {view.players.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 rounded-sm border border-[var(--noir-ink-2)]/20 bg-white/30 px-2.5 py-1.5">
            <span className={cn('font-type truncate text-[0.88rem]', !p.alive && 'line-through decoration-[var(--noir-ink-2)]/50')}>{callName(p.name)}</span>
            <span className="font-type shrink-0 text-[0.7rem] uppercase tracking-wider" style={{ color: isFamily(p.role) ? 'var(--noir-blood)' : 'var(--noir-ink-4)' }}>
              {p.role ? ROLE_TITLE[p.role] : '—'}
            </span>
          </li>
        ))}
      </ul>

      <Heading>Night by night</Heading>
      <ol className="mt-2 space-y-2">
        {[...rounds.entries()].map(([round, events]) => (
          <li key={round} className="flex gap-3">
            <span className="font-deco w-8 shrink-0 text-[1.1rem] text-[var(--noir-ink-6)]">{round}</span>
            <p className="font-type text-[0.88rem] leading-relaxed text-[var(--noir-ink-2)]">
              {events
                .map((e) =>
                  e.kind === 'kill'
                    ? `The Family killed ${name(e.victim)}.`
                    : e.kind === 'saved'
                      ? `The Family went for ${name(e.target)} — ${name(e.by)} saved them.`
                      : e.kind === 'quiet'
                        ? 'A quiet night.'
                        : e.kind === 'file'
                          ? `The Inspector looked into ${name(e.target)}: ${e.family ? 'Family' : 'no connection found'}.`
                          : e.kind === 'hanged'
                            ? `The town hanged ${name(e.target)}, ${e.guilty}–${e.innocent}.`
                            : e.kind === 'acquitted'
                              ? `${name(e.target)} stood trial and walked free, ${e.innocent}–${e.guilty}.`
                              : 'Nobody stood trial.',
                )
                .join(' ')}
            </p>
          </li>
        ))}
      </ol>

      {(swings.length > 0 || saves.length > 0 || firstRight || fickle) && (
        <>
          <Heading>Turning points</Heading>
          <ul className="font-type mt-2 space-y-1 text-[0.88rem] leading-relaxed text-[var(--noir-ink-2)]">
            {swings.map(({ d, guilty, innocent }) => (
              <li key={`swing-${d.round}`}>
                · Day {d.round}: {name(d.accused)} {d.outcome === 'hanged' ? `hanged by a single vote (${guilty}–${innocent})` : guilty === innocent ? `walked free on a tie (${guilty}–${innocent})` : `walked free by a single vote (${innocent}–${guilty})`}
                {d.outcome === 'acquitted' && isFamily(seat(d.accused)?.role ?? null) ? ' — and was Family all along.' : '.'}
              </li>
            ))}
            {saves.map((s) => (
              <li key={`save-${s.round}`}>
                · Night {s.round}: {name(s.by)} kept {name(s.target)} alive.
              </li>
            ))}
            {firstRight && (
              <li>
                · {name(firstRight.by)} suspected {name(firstRight.target)} on night {firstRight.round} — the first to see the Family.
              </li>
            )}
            {fickle && fickle[1].size > 1 && (
              <li>
                · {name(fickle[0])} changed their mind the most: {fickle[1].size} different suspects.
              </li>
            )}
          </ul>
        </>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {sharp > 0 && <Honour title="Sharpest eye" who="The Inspector" note={`${sharp} Family file${sharp === 1 ? '' : 's'} opened`} />}
        {topSuspect && seat(topSuspect[0]) && (
          <Honour title="The town’s hunch" who={name(topSuspect[0])} note={isFamily(seat(topSuspect[0])!.role) ? 'and the town was right' : 'and the town was wrong'} />
        )}
        {predictions.length > 0 && (
          <Honour
            title="The ghosts called it"
            who={predictions.filter(([, w]) => w === view.winner).map(([id]) => name(id)).join(', ') || 'Nobody'}
            note={predictions.map(([id, w]) => `${name(id)}: ${WINNER_NAME[w]}`).join(' · ')}
          />
        )}
      </div>

      <Heading>Best bluff · the table votes</Heading>
      {bluffLeader && (
        <p className="font-deco mt-1 text-[1.25rem] text-[var(--noir-ink-1)]">
          {name(bluffLeader[0])} <span className="font-type text-[0.86rem] text-[var(--noir-ink-5)]">· {bluffLeader[1]} vote{bluffLeader[1] === 1 ? '' : 's'}</span>
        </p>
      )}
      {playing ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {view.players
            .filter((p) => p.id !== selfId)
            .map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onBluff(p.id)}
                aria-pressed={myBluff === p.id}
                className={cn(
                  'font-type min-h-10 rounded-sm border px-3 text-[0.86rem] outline-none focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]',
                  myBluff === p.id ? 'border-[var(--noir-ink-2)] bg-[var(--noir-ink-2)] text-[var(--noir-paper)]' : 'border-[var(--noir-ink-2)]/30 text-[var(--noir-ink-2)] hover:bg-black/5',
                )}
              >
                {callName(p.name)}
                {bluffs.get(p.id) ? ` · ${bluffs.get(p.id)}` : ''}
              </button>
            ))}
        </div>
      ) : (
        !bluffLeader && <p className="font-type mt-1 text-[0.86rem] text-[var(--noir-ink-5)]">The players are voting.</p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onLeave} className="font-type min-h-11 rounded-sm border border-[var(--noir-ink-2)]/40 px-4 text-[0.9rem] text-[var(--noir-ink-2)] outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]">
          Back to games
        </button>
        {isHost && (
          <button type="button" onClick={onPlayAgain} className="font-type min-h-11 rounded-sm bg-[var(--noir-blood)] px-5 text-[0.95rem] font-semibold tracking-wide text-[var(--noir-on-accent)] shadow-[0_6px_18px_-6px_rgba(120,20,15,.8)] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]">
            Deal again
          </button>
        )}
      </div>
    </motion.div>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-type mt-5 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--noir-ink-6)]">{children}</h3>
}

function Honour({ title, who, note }: { title: string; who: string; note: string }) {
  return (
    <div className="rounded-sm border border-[var(--noir-ink-2)]/25 bg-white/25 px-3 py-2">
      <p className="font-type text-[0.72rem] uppercase tracking-[0.18em] text-[var(--noir-ink-6)]">{title}</p>
      <p className="font-deco text-[1.15rem] text-[var(--noir-ink-1)]">{who}</p>
      <p className="font-type text-[0.78rem] text-[var(--noir-ink-4)]">{note}</p>
    </div>
  )
}
