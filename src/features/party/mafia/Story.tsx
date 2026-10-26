import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Gavel, Hand, MessagesSquare, Moon, Newspaper, Scale } from 'lucide-react'

import type { Character } from '@/lib/characters'
import { cn } from '@/lib/utils'
import { Emblem, Skyline } from './art'
import { PHASE_GUIDE, ROLE_GUIDE, rolesInPlay } from './guide'
import { callName } from './helpers'
import { Portrait } from './Seat'
import { ROLE_TITLE, isFamily, type MafiaView, type Phase, type Role, type StoryKey } from './types'

const COUNT = ['No one', 'One', 'Two', 'Three', 'Four']

/* ── the opening story ────────────────────────────────────────────────── */

/**
 * Before the cards: the city, the people at the table, the Family among
 * them, what the town can do, and how a day goes — each a page with its own
 * picture, read aloud. The rules arrive as the story, so the first night
 * makes sense before it starts.
 */
export function Prologue({
  view,
  selfId,
  isHost,
  progress,
  character,
  onNext,
  onSkip,
}: {
  view: MafiaView
  selfId: string | undefined
  isHost: boolean
  /** How much of this page's time is left, 1 → 0. */
  progress: number
  character: (id: string) => Character | undefined
  onNext: () => void
  onSkip: () => void
}) {
  const story = view.story
  if (!story) return null
  const read = !!selfId && view.next.includes(selfId)
  const playing = !!selfId && view.players.some((p) => p.id === selfId)
  const last = story.at === story.of - 1
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={story.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col gap-3 sm:gap-4"
        >
          <Picture page={story.key} view={view} selfId={selfId} character={character} />
          <div className="noir-paper noir-paper-edge rounded-sm px-4 py-3 sm:px-6 sm:py-4">
            <Typed id={`${view.game}-${story.key}`} text={view.narration?.text ?? ''} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Where we are in the story, and the way on. */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5" aria-label={`Page ${story.at + 1} of ${story.of}`}>
          {Array.from({ length: story.of }, (_, i) => (
            <span key={i} className={cn('h-1.5 rounded-full transition-all', i === story.at ? 'w-6 bg-[var(--noir-brass)]' : i < story.at ? 'w-1.5 bg-[var(--noir-brass)]/70' : 'w-1.5 bg-[var(--noir-paper-dim)]/30')} />
          ))}
        </div>
        <div className="h-0.5 min-w-12 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <div className="h-full bg-[var(--noir-brass)]/60 transition-[width] duration-300 ease-linear" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        {isHost && (
          <button type="button" onClick={onSkip} className="font-type min-h-11 rounded-sm px-2 text-[0.84rem] text-[var(--noir-paper-dim)] underline-offset-4 outline-none hover:text-[var(--noir-paper)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--noir-brass)]">
            Skip the story
          </button>
        )}
        {playing && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            disabled={read}
            className="font-type flex min-h-11 items-center gap-1.5 rounded-sm border border-[var(--noir-brass)] bg-[var(--noir-brass)] px-4 text-[0.92rem] font-semibold text-[#1c140b] outline-none focus-visible:ring-2 focus-visible:ring-white disabled:border-[var(--noir-paper-dim)]/40 disabled:bg-transparent disabled:font-normal disabled:text-[var(--noir-paper-dim)]"
          >
            {read ? 'Waiting for the others…' : last ? 'Deal the cards' : 'Next'}
            {!read && <ChevronRight aria-hidden className="size-4" />}
          </motion.button>
        )}
      </div>
    </div>
  )
}

/** The words of the page, typed out at about the pace they are read aloud. */
function Typed({ id, text }: { id: string; text: string }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    setShown(0)
    if (!text) return
    const timer = window.setInterval(() => setShown((n) => (n >= text.length ? n : n + 1)), 1000 / 20)
    return () => window.clearInterval(timer)
  }, [id, text])
  return (
    /* Too slow for you? Tap it and the whole page is there. */
    <p onClick={() => setShown(text.length)} className="font-old cursor-default text-[1.02rem] leading-relaxed text-[#1c140b] first-letter:float-left first-letter:mr-1.5 first-letter:font-deco first-letter:text-[2.4rem] first-letter:leading-[0.85] sm:text-[1.15rem]" aria-live="polite">
      {text.slice(0, shown)}
      <span className="opacity-0">{text.slice(shown)}</span>
    </p>
  )
}

function Picture({ page, view, selfId, character }: { page: StoryKey; view: MafiaView; selfId: string | undefined; character: (id: string) => Character | undefined }) {
  const n = view.players.length
  const cards = rolesInPlay(n, view.options.godfather, view.options.jester)
  if (page === 'city') {
    return (
      <div className="relative aspect-[16/8] max-h-[38vh] w-full overflow-hidden rounded-sm bg-[linear-gradient(180deg,#0b1424,#05080f)] noir-frame sm:aspect-[16/7]">
        <div className="noir-rain" data-on="true" aria-hidden />
        <div className="absolute right-[12%] top-[14%] size-14 rounded-full bg-[#e9dcc0] opacity-80 shadow-[0_0_60px_20px_rgba(233,220,192,.25)] sm:size-20" aria-hidden />
        <Skyline className="absolute inset-x-0 bottom-0 h-[58%] w-full text-[#020409]" />
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
          <p className="font-type text-[0.7rem] uppercase tracking-[0.4em] text-[var(--noir-brass)]">Monsoon · July</p>
          <p className="font-deco text-[clamp(1.6rem,min(7vw,9vh),3.4rem)] leading-none text-[var(--noir-paper)] [text-shadow:0_4px_24px_rgba(0,0,0,.9)]">Bombay, 1956</p>
        </div>
        <motion.p
          initial={{ opacity: 0, rotate: 6, y: 20 }}
          animate={{ opacity: 1, rotate: -3, y: 0 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 120, damping: 14 }}
          className="font-old absolute bottom-3 left-4 max-w-[70%] bg-[#e7d9b6] [@media(max-height:520px)]:hidden px-2.5 py-1 text-[0.72rem] font-black uppercase leading-tight text-[#1c140b] shadow-[0_6px_18px_-6px_rgba(0,0,0,.9)] sm:bottom-5 sm:text-[0.9rem]"
        >
          Fourth body at the docks this month — police baffled
        </motion.p>
      </div>
    )
  }
  if (page === 'cast') {
    return (
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {view.players.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12 }}
            className={cn('flex items-center gap-2.5 rounded-sm border px-2 py-2', p.id === selfId ? 'border-[var(--noir-brass)] bg-[var(--noir-brass)]/10' : 'border-[var(--noir-brass)]/25 bg-black/30')}
          >
            <Portrait name={p.name} character={character(p.id)} className="size-11 shrink-0 rounded-full ring-1 ring-[var(--noir-brass)]/60 sm:size-12" />
            <span className="min-w-0">
              <span className="font-type block truncate text-[0.9rem] text-[var(--noir-paper)]">
                {p.id === selfId ? 'You' : callName(p.name)}
                {p.bot && <span className="ml-1.5 rounded-sm bg-[var(--noir-brass)] px-1 text-[0.6rem] font-bold text-[#1c140b]">AI</span>}
              </span>
              <span className="font-type block text-[0.72rem] leading-snug text-[var(--noir-paper-dim)]">{p.cover}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    )
  }
  if (page === 'family') {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: cards.family }, (_, i) => (
            <motion.div key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4 + i * 0.25, type: 'spring' }}>
              <Emblem role="mafia" className="size-14 text-[var(--noir-blood-bright)] drop-shadow-[0_0_14px_rgba(212,58,47,.6)] sm:size-16" />
            </motion.div>
          ))}
        </div>
        <div className="flex max-w-full flex-wrap justify-center gap-1.5">
          {view.players.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="grid aspect-[5/7] w-9 place-items-center rounded-[3px] border border-[var(--noir-brass)]/50 bg-[repeating-linear-gradient(45deg,#5a1210_0_5px,#3d0c0a_5px_10px)] sm:w-11"
            >
              <span className="font-deco text-[0.9rem] text-[var(--noir-brass)]">?</span>
            </motion.div>
          ))}
        </div>
        <p className="font-type text-center text-[0.86rem] text-[var(--noir-paper-dim)]">
          {COUNT[cards.family] ?? cards.family} of these {n} cards {cards.family === 1 ? 'belongs' : 'belong'} to the Family. Nobody knows which — except the Family.
        </p>
      </div>
    )
  }
  if (page === 'town') {
    const citizens = n - cards.family - 1 - (cards.inspector ? 1 : 0) - (cards.jester ? 1 : 0)
    const tiles: { role: Role; count?: number; note: string }[] = [
      { role: 'doctor', note: 'Saves one person each night' },
      ...(cards.inspector ? [{ role: 'detective' as Role, note: 'Checks one person each night' }] : []),
      { role: 'villager', count: citizens, note: 'Eyes, ears — and a vote' },
      ...(cards.godfather ? [{ role: 'godfather' as Role, note: 'Runs the Family; checks out clean' }] : []),
      ...(cards.jester ? [{ role: 'jester' as Role, note: 'Wins only if hanged' }] : []),
    ]
    return (
      <ul className={cn('grid gap-2', tiles.length > 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3')}>
        {tiles.map((t, i) => (
          <motion.li
            key={t.role}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.2 + i * 0.35 }}
            className="noir-paper flex flex-col items-center rounded-md px-2 py-3 text-center"
          >
            <Emblem role={t.role} className={cn('size-12 sm:size-14', isFamily(t.role) ? 'text-[var(--noir-blood)]' : t.role === 'jester' ? 'text-[#6b3fa0]' : 'text-[#2b2015]')} />
            <span className="font-deco mt-1 text-[1rem] leading-tight text-[#1c140b]">
              {ROLE_TITLE[t.role]}
              {t.count && t.count > 1 ? ` ×${t.count}` : ''}
            </span>
            <span className="font-type text-[0.74rem] leading-snug text-[#5a4a35]">{t.note}</span>
          </motion.li>
        ))}
      </ul>
    )
  }
  return <RoundFlow />
}

/** One round, start to finish — and how it ends. */
export function RoundFlow({ compact = false }: { compact?: boolean }) {
  const steps = [
    { icon: Moon, title: 'Night', note: 'The Family kill. The Doctor saves. The Inspector checks.' },
    { icon: Newspaper, title: 'Morning', note: 'The paper names the dead.' },
    { icon: MessagesSquare, title: 'Talk', note: 'Argue. Question. Accuse.' },
    { icon: Hand, title: 'Nominate', note: 'Name a suspect.' },
    { icon: Gavel, title: 'Trial', note: 'They defend themselves.' },
    { icon: Scale, title: 'Verdict', note: 'Guilty or innocent.' },
  ]
  return (
    <div className="flex flex-col gap-3">
      <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {steps.map((s, i) => (
          <motion.li
            key={s.title}
            initial={compact ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.3 }}
            className={cn('flex flex-col items-center rounded-sm border px-1.5 py-2 text-center', compact ? 'border-[#2a2015]/20' : 'border-[var(--noir-brass)]/30 bg-black/30')}
          >
            <s.icon aria-hidden className={cn('size-5', compact ? 'text-[#6a5638]' : 'text-[var(--noir-brass)]')} />
            <span className={cn('font-deco mt-1 text-[0.9rem]', compact ? 'text-[#1c140b]' : 'text-[var(--noir-paper)]')}>
              {i + 1}. {s.title}
            </span>
            <span className={cn('font-type text-[0.7rem] leading-snug', compact ? 'text-[#5a4a35]' : 'text-[var(--noir-paper-dim)]')}>{s.note}</span>
          </motion.li>
        ))}
      </ol>
      <div className="grid grid-cols-2 gap-2">
        <div className={cn('rounded-sm border px-3 py-2', compact ? 'border-[#1f5a3a]/40' : 'border-[#3f8a5f]/50 bg-[#1f5a3a]/20')}>
          <p className={cn('font-type text-[0.7rem] uppercase tracking-[0.2em]', compact ? 'text-[#1f5a3a]' : 'text-[#8fd0a8]')}>The town wins</p>
          <p className={cn('font-type text-[0.82rem] leading-snug', compact ? 'text-[#2b2015]' : 'text-[var(--noir-paper)]')}>when every member of the Family is hanged.</p>
        </div>
        <div className={cn('rounded-sm border px-3 py-2', compact ? 'border-[var(--noir-blood)]/40' : 'border-[var(--noir-blood-bright)]/50 bg-[var(--noir-blood)]/20')}>
          <p className={cn('font-type text-[0.7rem] uppercase tracking-[0.2em]', compact ? 'text-[var(--noir-blood)]' : 'text-[#f0a49c]')}>The Family wins</p>
          <p className={cn('font-type text-[0.82rem] leading-snug', compact ? 'text-[#2b2015]' : 'text-[var(--noir-paper)]')}>when they equal the town in number.</p>
        </div>
      </div>
    </div>
  )
}

/* ── your card, explained ─────────────────────────────────────────────── */

/** Under the turned card: what you do at night, how you win, a tip — then Ready. */
export function RoleBrief({ role, title, friends, ready, waiting, onReady }: { role: Role; title: string; friends: string | null; ready: boolean; waiting: boolean; onReady: () => void }) {
  const guide = ROLE_GUIDE[role]
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="noir-paper noir-paper-edge w-full max-w-md rounded-sm px-4 py-3 sm:px-5">
      <p className="font-type text-[0.72rem] uppercase tracking-[0.22em] text-[#6a5638]">You are</p>
      <p className="font-deco text-[1.35rem] leading-tight" style={{ color: isFamily(role) ? 'var(--noir-blood)' : '#1c140b' }}>
        {title}
      </p>
      {friends && <p className="font-type mt-1 text-[0.86rem] text-[var(--noir-blood)]">{friends}</p>}
      <dl className="font-type mt-2 space-y-1.5 text-[0.86rem] leading-snug text-[#2b2015]">
        <div>
          <dt className="inline font-semibold">At night: </dt>
          <dd className="inline">{guide.night}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">You win </dt>
          <dd className="inline">{guide.win}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Tip: </dt>
          <dd className="inline">{guide.tip}</dd>
        </div>
      </dl>
      <div className="mt-3 flex items-center justify-end gap-3">
        {ready && <span className="font-type text-[0.8rem] text-[#6a5638]">{waiting ? 'Waiting for the others to read their cards…' : 'Night is falling…'}</span>}
        {!ready && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onReady}
            className="font-type min-h-11 rounded-sm bg-[#1c140b] px-4 text-[0.92rem] font-semibold text-[#efe3c8] outline-none focus-visible:ring-2 focus-visible:ring-[#2a2015] focus-visible:ring-offset-2"
          >
            Got it — I’m ready
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

/* ── the first time each part of a round comes up ─────────────────────── */

export function PhaseGuide({ phase, role, accused, withAIs, onClose }: { phase: Phase; role: Role | null; accused: boolean; withAIs: boolean; onClose: () => void }) {
  const guide = PHASE_GUIDE[phase]
  if (!guide) return null
  return (
    <motion.aside
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto w-full max-w-4xl rounded-sm border border-[var(--noir-brass)]/50 bg-[#1a140e]/95 px-4 py-3 shadow-[0_14px_30px_-14px_rgba(0,0,0,.9)] sm:px-5"
      aria-label={`How it works: ${guide.title}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-type text-[0.7rem] uppercase tracking-[0.24em] text-[var(--noir-brass)]">First time · {guide.title}</p>
          <p className="font-old mt-0.5 text-[1rem] italic leading-snug text-[var(--noir-paper)]">{guide.story}</p>
          <p className="font-type mt-1 text-[0.86rem] leading-snug text-[var(--noir-paper-dim)]">{guide.plain({ role, accused, withAIs })}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-type min-h-10 shrink-0 rounded-sm border border-[var(--noir-brass)]/50 px-3 text-[0.84rem] text-[var(--noir-paper)] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[var(--noir-brass)]"
        >
          Got it
        </button>
      </div>
    </motion.aside>
  )
}

/* ── how to play, any time ────────────────────────────────────────────── */

export function HowToPlay({ view }: { view: MafiaView }) {
  const cards = rolesInPlay(view.players.length, view.options.godfather, view.options.jester)
  const roles: Role[] = ['villager', 'doctor', ...(cards.inspector ? ['detective' as Role] : []), 'mafia', ...(cards.godfather ? ['godfather' as Role] : []), ...(cards.jester ? ['jester' as Role] : [])]
  return (
    <div className="flex flex-col gap-5">
      <p className="font-old text-[1rem] italic leading-relaxed text-[#2b2015]">
        Bombay, 1956. {COUNT[cards.family] ?? cards.family} of the {view.players.length} people at this table secretly {cards.family === 1 ? 'works' : 'work'} for the Family, a gang that kills one
        person every night. Everyone else is the town. Work out who the Family are — and hang them — before they take over.
      </p>
      <section>
        <h4 className="font-type mb-2 text-[0.74rem] uppercase tracking-[0.22em] text-[#6a5638]">Each round</h4>
        <RoundFlow compact />
      </section>
      <section>
        <h4 className="font-type mb-2 text-[0.74rem] uppercase tracking-[0.22em] text-[#6a5638]">The cards in this game</h4>
        <ul className="space-y-2.5">
          {roles.map((role) => (
            <li key={role} className="flex gap-3">
              <Emblem role={role} className={cn('size-10 shrink-0', isFamily(role) ? 'text-[var(--noir-blood)]' : 'text-[#2b2015]')} />
              <div>
                <p className="font-deco text-[1rem] text-[#1c140b]">{ROLE_TITLE[role]}</p>
                <p className="font-type text-[0.82rem] leading-snug text-[#3a2c1c]">
                  {ROLE_GUIDE[role].night} Wins {ROLE_GUIDE[role].win}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="font-type mb-1.5 text-[0.74rem] uppercase tracking-[0.22em] text-[#6a5638]">Playing with the AIs</h4>
        <p className="font-type text-[0.86rem] leading-snug text-[#3a2c1c]">
          The AI players only know what a real player in their seat would know. Talk to them in Table talk — say a name and that person answers. They notice
          contradictions and remember how everyone voted, so watch what you say. Tap “Ready to vote” when you want to move on; they follow your lead.
        </p>
      </section>
    </div>
  )
}
