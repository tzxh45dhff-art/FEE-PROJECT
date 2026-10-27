import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { callName, firstName } from './helpers'
import { Emblem } from './art'
import { HUNCH_LABEL, type Hunch } from './notes'
import { HowToPlay } from './Story'
import { isFamily, type MafiaView, type Winner } from './types'

/* ── a sheet: up from the bottom on a phone, in from the side on a computer ── */

export function Sheet({ open, onClose, title, kicker, children }: { open: boolean; onClose: () => void; title: string; kicker: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-40 flex items-end justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60" />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="noir-paper noir-paper-edge relative flex max-h-[86%] w-full flex-col rounded-t-md sm:m-4 sm:max-h-[calc(100%-2rem)] sm:w-[26rem] sm:rounded-md"
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--noir-ink-2)]/20 px-5 pb-3 pt-4">
              <div>
                <p className="font-type text-[0.74rem] uppercase tracking-[0.22em] text-[var(--noir-ink-6)]">{kicker}</p>
                <h3 className="font-deco text-[1.45rem] leading-tight text-[var(--noir-ink-1)]">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${title}`}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--noir-ink-2)]/30 text-[var(--noir-ink-2)] outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4" data-lenis-prevent>
              {children}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const RULES: Record<string, string[]> = {
  mafia: ['Each night, agree with the Family on one name. If you split, a coin decides.', 'By day, argue like a citizen. Win when the Family can no longer be outvoted.'],
  godfather: ['Your choice is the Family’s kill.', 'The Inspector’s file on you comes back clean.', 'Win when the Family can no longer be outvoted.'],
  doctor: ['Each night, protect one person from the Family.', 'Never the same person two nights running. Yourself, only once.', 'Win when the Family is gone.'],
  detective: ['Each night, open a file on one person. By morning you know if they work for the Family.', 'Share what you learn carefully — the Family will come for you.', 'Win when the Family is gone.'],
  villager: ['No powers — only your eyes, your ears and your vote.', 'At night, name who you suspect; it counts in the case file.', 'Win when the Family is gone.'],
  jester: ['You win only if the town hangs you.', 'Be suspicious enough to be nominated — and lose your defence on purpose.'],
}

const WINNER_LABEL: Record<Winner, string> = { town: 'The town', family: 'The Family', jester: 'The Jester' }

/** Your role, its rules, and everything you have learned that nobody else has. */
export function DossierSheet({
  view,
  open,
  onClose,
  onPredict,
  notes,
  onNote,
}: {
  view: MafiaView
  open: boolean
  onClose: () => void
  onPredict: (winner: Winner) => void
  notes: Record<string, Hunch>
  onNote: (id: string) => void
}) {
  const me = view.me
  if (!me) return null
  const seat = (id: string | null) => view.players.find((p) => p.id === id)
  const family = view.players.filter((p) => isFamily(p.role) && p.id !== me.id)
  const others = view.players.filter((p) => p.id !== me.id)
  return (
    <Sheet open={open} onClose={onClose} kicker="My dossier · for your eyes only" title={me.title}>
      <div className="flex gap-4">
        <div className="grid aspect-[5/7] w-20 shrink-0 place-items-center rounded-md border border-[var(--noir-ink-2)]/30 bg-white/30 noir-frame">
          <Emblem role={me.role} className={cn('w-[70%]', isFamily(me.role) ? 'text-[var(--noir-blood)]' : 'text-[var(--noir-ink-2)]')} />
        </div>
        <ul className="font-type space-y-1.5 text-[0.88rem] leading-snug text-[var(--noir-ink-2)]">
          {(RULES[me.role] ?? []).map((rule) => (
            <li key={rule}>· {rule}</li>
          ))}
        </ul>
      </div>

      {!me.alive && (
        <Section title="You are a ghost">
          <p className="font-type text-[0.88rem] text-[var(--noir-ink-3)]">You see every card now. Who do you think wins? Revealed in the case file.</p>
          <Predict value={me.prediction} onPredict={onPredict} jester={view.options.jester} />
        </Section>
      )}

      {isFamily(me.role) && (
        <Section title="The Family">
          <p className="font-type text-[0.88rem] text-[var(--noir-ink-2)]">{family.length ? family.map((p) => `${p.name}${p.alive ? '' : ' (dead)'}`).join(', ') : 'Just you. Work alone.'}</p>
        </Section>
      )}

      {me.role === 'detective' && (
        <Section title="Your files">
          {me.files.length === 0 ? (
            <p className="font-type text-[0.88rem] text-[var(--noir-ink-5)]">No files yet. Open one tonight.</p>
          ) : (
            <ul className="space-y-1.5">
              {me.files.map((f) => (
                <li key={f.round} className="font-type flex items-baseline justify-between gap-3 border-b border-[var(--noir-ink-2)]/15 pb-1.5 text-[0.88rem]">
                  <span className="text-[var(--noir-ink-2)]">
                    Night {f.round} · {firstName(seat(f.target))}
                  </span>
                  <span className={f.family ? 'text-[var(--noir-blood)]' : 'text-[var(--noir-town)]'}>{f.family ? 'Works for the Family' : 'No Family connection found'}</span>
                </li>
              ))}
            </ul>
          )}
          {view.options.godfather && view.players.length >= 7 && (
            <p className="font-type mt-2 text-[0.8rem] text-[var(--noir-ink-6)]">Remember: the Godfather’s papers are in order. He can come back clean.</p>
          )}
        </Section>
      )}

      {me.role === 'doctor' && (
        <Section title="Your rounds">
          <p className="font-type text-[0.88rem] text-[var(--noir-ink-2)]">
            {me.lastProtected ? `Last night you protected ${firstName(seat(me.lastProtected))} — not them again tonight.` : 'You have not protected anyone yet.'}
          </p>
          <p className="font-type mt-1 text-[0.88rem] text-[var(--noir-ink-2)]">{me.selfSaveUsed ? 'You have used your one self-save.' : 'You can still protect yourself once.'}</p>
        </Section>
      )}

      <Section title="Your notes">
        <p className="font-type mb-2 text-[0.8rem] text-[var(--noir-ink-6)]">Tap a name to mark it. Only this device sees these.</p>
        <div className="grid grid-cols-2 gap-1.5">
          {others.map((p) => {
            const note = notes[p.id]
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onNote(p.id)}
                aria-label={`${p.name}: ${note ? HUNCH_LABEL[note] : 'no note'}. Change`}
                className={cn(
                  'font-type flex min-h-11 items-center justify-between gap-2 rounded-sm border px-2.5 text-left text-[0.86rem] outline-none focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]',
                  !p.alive && 'opacity-55',
                  note === 'suspect' ? 'border-[var(--noir-blood)] bg-[var(--noir-blood)]/10' : note === 'trust' ? 'border-[var(--noir-town)] bg-[var(--noir-town)]/10' : 'border-[var(--noir-ink-2)]/25',
                )}
              >
                <span className={cn('truncate', !p.alive && 'line-through')}>{callName(p.name)}</span>
                <span className={cn('shrink-0 text-[0.72rem] uppercase tracking-wider', note === 'suspect' ? 'text-[var(--noir-blood)]' : note === 'trust' ? 'text-[var(--noir-town)]' : 'text-[var(--noir-ink-6)]')}>
                  {note ? HUNCH_LABEL[note] : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </Section>
    </Sheet>
  )
}

export function Predict({ value, onPredict, jester }: { value: Winner | null; onPredict: (w: Winner) => void; jester: boolean }) {
  const choices: Winner[] = jester ? ['town', 'family', 'jester'] : ['town', 'family']
  return (
    <div className={cn('mt-2 grid gap-1.5', jester ? 'grid-cols-3' : 'grid-cols-2')}>
      {choices.map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => onPredict(w)}
          aria-pressed={value === w}
          className={cn(
            'font-type min-h-11 rounded-sm border px-2 text-[0.86rem] outline-none focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]',
            value === w ? 'border-[var(--noir-ink-2)] bg-[var(--noir-ink-2)] text-[var(--noir-paper)]' : 'border-[var(--noir-ink-2)]/30 text-[var(--noir-ink-2)] hover:bg-black/5',
          )}
        >
          {WINNER_LABEL[w]}
        </button>
      ))}
    </div>
  )
}

/* ── the notebook: the town's public record ─────────────────────────── */

export function NotebookSheet({ view, open, onClose }: { view: MafiaView; open: boolean; onClose: () => void }) {
  const name = (id: string | null) => firstName(view.players.find((p) => p.id === id))
  const days = [...view.ledger].reverse()
  return (
    <Sheet open={open} onClose={onClose} kicker="The town’s notebook · public record" title="Who voted for whom">
      {days.length === 0 ? (
        <p className="font-type text-[0.9rem] leading-relaxed text-[var(--noir-ink-5)]">Nothing yet. Every nomination and every verdict gets written down here, so you can hold people to their votes.</p>
      ) : (
        <ol className="space-y-5">
          {days.map((day) => {
            const named = Object.entries(day.nominations)
            const guilty = Object.entries(day.judgement).filter(([, g]) => g).map(([id]) => name(id))
            const innocent = Object.entries(day.judgement).filter(([, g]) => !g).map(([id]) => name(id))
            return (
              <li key={day.round}>
                <div className="flex items-baseline justify-between gap-3 border-b-2 border-double border-[var(--noir-ink-2)]/40 pb-1">
                  <p className="font-deco text-[1.15rem] text-[var(--noir-ink-1)]">Day {day.round}</p>
                  <span
                    className="noir-stamp rounded-sm px-2 text-[0.78rem]"
                    style={{ color: day.outcome === 'hanged' ? 'var(--noir-blood)' : day.outcome === 'acquitted' ? 'var(--noir-town)' : 'var(--noir-ink-5)' }}
                  >
                    {day.outcome === 'hanged' ? `${name(day.accused).toUpperCase()} HANGED` : day.outcome === 'acquitted' ? `${name(day.accused).toUpperCase()} FREED` : 'NO TRIAL'}
                  </span>
                </div>
                <p className="font-type mt-2 text-[0.74rem] uppercase tracking-[0.2em] text-[var(--noir-ink-6)]">Nominations</p>
                {named.length === 0 ? (
                  <p className="font-type text-[0.86rem] text-[var(--noir-ink-5)]">Nobody named anyone.</p>
                ) : (
                  <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                    {named.map(([voter, target]) => (
                      <li key={voter} className="font-type text-[0.86rem] text-[var(--noir-ink-2)]">
                        {name(voter)} <span className="text-[var(--noir-sepia)]">→</span> {target ? name(target) : <span className="text-[var(--noir-ink-6)]">no one</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {day.accused && (
                  <>
                    <p className="font-type mt-2 text-[0.74rem] uppercase tracking-[0.2em] text-[var(--noir-ink-6)]">
                      Judgement of {name(day.accused)} · {guilty.length}–{innocent.length}
                    </p>
                    <p className="font-type text-[0.86rem] text-[var(--noir-blood)]">Guilty: {guilty.join(', ') || 'nobody'}</p>
                    <p className="font-type text-[0.86rem] text-[var(--noir-town)]">Innocent: {innocent.join(', ') || 'nobody'}</p>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </Sheet>
  )
}

export function HowToPlaySheet({ view, open, onClose }: { view: MafiaView; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} kicker="New to Mafia?" title="How to play">
      <HowToPlay view={view} />
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h4 className="font-type mb-1.5 text-[0.74rem] uppercase tracking-[0.22em] text-[var(--noir-ink-6)]">{title}</h4>
      {children}
    </section>
  )
}

