import { useState } from 'react'
import { Check, Dices } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Character } from '@/lib/characters'
import { cn } from '@/lib/utils'
import { ARCS, ARC_IDS, type ArcChoice } from './arcs'
import { Skyline } from './art'
import { MAX_SPECIALISTS, callName, dealCounts, dealLine, maxFamily } from './helpers'
import { Portrait } from './Seat'
import type { MafiaOptions } from './types'
import { useNoirFonts } from './useNoirFonts'
import './noir.css'

type Person = { id: string; name: string; you: boolean; character?: Character }
type Where = 'online' | 'table' | 'mixed'

/**
 * The back room: a card table under a hanging lamp, everyone in the room
 * seated round it, and the terms typed on a contract. The seal deals the cards.
 */
export function MafiaSetup({
  players,
  error,
  starting,
  onStart,
}: {
  players: Person[]
  error: string | null
  starting: boolean
  onStart: (options: MafiaOptions) => void
}) {
  useNoirFonts(STORIES)
  const [arc, pickArc] = useState<ArcChoice>(savedArc)
  const chooseArc = (next: ArcChoice) => {
    pickArc(next)
    try {
      localStorage.setItem(ARC_KEY, next)
    } catch {
      /* Private mode: it just won't be remembered. */
    }
  }
  /* A surprise is dressed as the house story until the cards say otherwise. */
  const look = ARCS[arc === 'surprise' ? 'bombay' : arc]
  const [where, setWhere] = useState<Where>('online')
  const [night, setNight] = useState(45)
  const [day, setDay] = useState(180)
  const [vote, setVote] = useState(45)
  const [reveal, setReveal] = useState(true)
  const [godfather, setGodfather] = useState(true)
  const [jester, setJester] = useState(false)
  const [story, setStory] = useState(true)
  const [randomPowers, setRandomPowers] = useState(true)
  /* The host's own deal. Null is "recommended for this many" — and stays that way as people come and go. */
  const [familyWanted, setFamily] = useState<number | null>(null)
  const [doctorsWanted, setDoctors] = useState<number | null>(null)
  const [detectivesWanted, setDetectives] = useState<number | null>(null)
  /* AI regulars fill the empty chairs: enough for a game by default, more if you like. */
  const [aiWanted, setAi] = useState(() => Math.max(0, 4 - players.length))
  const ai = Math.max(0, Math.min(aiWanted, 12 - players.length))
  const n = players.length + ai
  const seats: (Person & { ai?: boolean })[] = [...players, ...Array.from({ length: ai }, (_, i) => ({ id: `ai-${i}`, name: 'AI player', you: false, ai: true }))]
  const can = n >= 4 && n <= 12 && !starting
  /*
   * Automatic: how many Family, Doctors and Inspectors is rolled in secret
   * from the size of the table — nobody, the host included, knows. Choose:
   * the host sets the numbers, and that exact deal is what's dealt.
   */
  const auto = randomPowers
  const custom = { godfather, jester, family: familyWanted, doctors: doctorsWanted, detectives: detectivesWanted }
  const deal = dealCounts(Math.max(4, n), custom)
  const room = Math.max(4, n) - deal.family - deal.jester
  const customised = familyWanted !== null || doctorsWanted !== null || detectivesWanted !== null

  return (
    <div className="noir noir-room relative flex h-full min-h-0 w-full flex-col overflow-y-auto overflow-x-hidden" data-arc={look.id} data-lenis-prevent>
      <div className="noir-grain" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 pb-10 pt-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-8 lg:pt-10">
        {/* The table. */}
        <div className="flex flex-col items-center">
          <p className="font-type text-[0.72rem] uppercase tracking-[0.45em] text-[var(--noir-brass)]">{arc === 'surprise' ? 'A new story every game' : look.label}</p>
          <h1 className="font-deco mt-2 text-center text-[clamp(2.6rem,7vw,4.6rem)] leading-none text-[var(--noir-paper)] [text-shadow:0_4px_30px_rgba(0,0,0,.8)]">Mafia</h1>
          <p className="font-old mt-3 max-w-md text-center text-[1rem] italic text-[var(--noir-paper-dim)]">
            Somebody at this table works for the Family. By morning, somebody else will be dead.
          </p>
          <p className="font-type mt-2 max-w-md text-center text-[0.8rem] text-[var(--noir-paper-dim)]/80">
            Never played? No need to read rules — the story explains everything as it goes.
          </p>
          {/* On a phone: a compact roster — everyone readable, nothing squeezed round an ellipse. */}
          <ul className="mt-6 grid w-full grid-cols-2 gap-1.5 sm:hidden" aria-label="Players">
            {seats.map((p) => (
              <li key={p.id} className={cn('flex min-h-12 items-center gap-2.5 rounded-sm border px-2.5 py-1.5', p.ai ? 'border-dashed border-[var(--noir-brass)]/40 bg-[var(--noir-brass)]/[0.06]' : 'border-[var(--noir-brass)]/25 bg-black/30')}>
                {p.ai ? <AiFace className="size-9" /> : <Portrait name={p.name} character={p.character} className="size-9 shrink-0 rounded-full ring-1 ring-[var(--noir-brass)]/60" />}
                <span className="font-type min-w-0 flex-1 truncate text-[0.9rem] text-[var(--noir-paper)]">{p.ai ? 'AI player' : p.you ? 'You' : callName(p.name)}</span>
                {!p.ai && <span className="size-2 shrink-0 rounded-full bg-emerald-400" title="In the room" />}
              </li>
            ))}
            <li className="font-type col-span-2 pt-1 text-center text-[0.8rem] text-[var(--noir-paper-dim)]">{n} seated · 4 to 12</li>
          </ul>
          <div className="relative mt-8 hidden aspect-[16/10] w-[calc(100%-4rem)] max-w-[34rem] sm:block">
            <div className="absolute inset-[12%] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_40%,var(--noir-felt-hi),var(--noir-felt)_70%)] shadow-[0_0_0_10px_var(--noir-wood),0_0_0_12px_var(--noir-smoke),0_30px_80px_-20px_rgba(0,0,0,.95),inset_0_10px_40px_rgba(0,0,0,.5)]" />
            <div className="absolute left-1/2 top-[34%] -translate-x-1/2 text-center">
              <p className="font-deco text-[1.1rem] text-[var(--noir-brass)]/80">{n} seated</p>
              <p className="font-type text-[0.65rem] uppercase tracking-[0.25em] text-[var(--noir-paper-dim)]/70">4 to 12 seats</p>
            </div>
            {seats.slice(0, 12).map((p, i) => {
              const angle = (i / Math.max(seats.length, 1)) * Math.PI * 2 - Math.PI / 2
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="absolute flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center sm:w-20"
                  style={{ left: `${50 + Math.cos(angle) * 44}%`, top: `${50 + Math.sin(angle) * 44}%` }}
                >
                  {p.ai ? (
                    <AiFace className="size-12 sm:size-14" />
                  ) : (
                    <Portrait name={p.name} character={p.character} className="size-12 rounded-full ring-2 ring-[var(--noir-brass)]/70 sm:size-14" />
                  )}
                  <span className="font-type mt-1 max-w-full truncate text-[0.72rem] text-[var(--noir-paper)]">{p.ai ? 'AI' : p.you ? 'You' : callName(p.name)}</span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* The contract. */}
        <div className="noir-paper noir-paper-edge relative rounded-sm px-5 pb-6 pt-5 sm:px-7">
          <p className="font-deco text-[1.5rem] text-[var(--noir-ink-1)]">The terms</p>
          <p className="font-type text-[0.86rem] text-[var(--noir-ink-5)]">{auto && n >= 4 && n <= 12 ? `${n} at the table. How many are Family, Doctors and Inspectors is decided in secret by the size of the table.` : dealLine(n, custom)}</p>

          <Field label="The story">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3" role="radiogroup" aria-label="The story">
              <StoryChoice on={arc === 'surprise'} onClick={() => chooseArc('surprise')} name="Surprise me" note="One you haven’t played lately" />
              {ARC_IDS.map((id) => (
                <StoryChoice key={id} id={id} on={arc === id} onClick={() => chooseArc(id)} name={ARCS[id].name} note={ARCS[id].label} />
              ))}
            </div>
            <p className="font-type mt-2 text-[0.82rem] leading-snug text-[var(--noir-ink-5)]">
              {arc === 'surprise' ? 'Same rules, a different world each game — its own city, paper, narrator and regulars.' : ARCS[arc].blurb}
            </p>
          </Field>

          <Field label="AI players">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="font-type text-[0.82rem] leading-snug text-[var(--noir-ink-5)]">
                {arc === 'surprise' ? 'The story’s regulars' : look.regulars.charAt(0).toUpperCase() + look.regulars.slice(1)}, who argue, lie and vote. They read the table talk, and can listen if you let them.
              </p>
              <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <Step label="One fewer AI player" disabled={ai === 0} onClick={() => setAi(ai - 1)}>
                  −
                </Step>
                <span className="font-deco w-8 text-center text-[1.3rem] text-[var(--noir-ink-1)]" aria-live="polite">
                  {ai}
                </span>
                <Step label="One more AI player" disabled={n >= 12} onClick={() => setAi(ai + 1)}>
                  +
                </Step>
              </div>
            </div>
          </Field>

          <Field label="The cards">
            <div className="grid grid-cols-2 gap-1.5">
              <Choice on={auto} onClick={() => setRandomPowers(true)}>
                <span className="block font-deco text-[0.95rem]">Automatic</span>
                <span className="block text-[0.74rem] opacity-75">secret, by table size</span>
              </Choice>
              <Choice on={!auto} onClick={() => setRandomPowers(false)}>
                <span className="block font-deco text-[0.95rem]">Choose</span>
                <span className="block text-[0.74rem] opacity-75">set each number</span>
              </Choice>
            </div>
            {auto ? (
              <p className="font-type mt-2 text-[0.82rem] leading-snug text-[var(--noir-ink-5)]">
                The game picks how many Family, Doctors and Inspectors from how many are playing — and keeps it secret from everyone, you included, until the case file.
                {deal.godfather ? ' One of the Family is the Godfather.' : ''}
                {deal.jester ? ' There’s a Jester.' : ''}
              </p>
            ) : (
              <>
            <div className="mt-2 divide-y divide-[var(--noir-ink-2)]/15">
              <Count
                title="The Family"
                note={`up to ${maxFamily(Math.max(4, n))} at this table${deal.godfather ? ' · one is the Godfather' : ''}`}
                value={deal.family}
                min={1}
                max={maxFamily(Math.max(4, n))}
                onChange={setFamily}
              />
              <Count title="Doctors" note="each saves one life a night" value={deal.doctors} min={0} max={Math.min(MAX_SPECIALISTS, room)} onChange={setDoctors} />
              <Count title="Inspectors" note={deal.detectives > 1 ? 'share one case file' : 'each checks one person a night'} value={deal.detectives} min={0} max={Math.min(MAX_SPECIALISTS, room - deal.doctors)} onChange={setDetectives} />
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="font-type text-[0.8rem] text-[var(--noir-ink-5)]">
                {deal.citizens} {deal.citizens === 1 ? 'Citizen' : 'Citizens'} fill the other chairs{deal.jester ? ', with a Jester' : ''}.
              </p>
              {customised && (
                <button
                  type="button"
                  onClick={() => {
                    setFamily(null)
                    setDoctors(null)
                    setDetectives(null)
                  }}
                  className="font-type min-h-9 shrink-0 rounded-sm px-2 text-[0.8rem] text-[var(--noir-ink-2)] underline underline-offset-2 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]"
                >
                  Recommended
                </button>
              )}
            </div>
              </>
            )}
          </Field>

          <Field label="Where are you playing?">
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  ['online', 'Online', 'on the call'],
                  ['table', 'Together', 'one room'],
                  ['mixed', 'Mixed', 'some of each'],
                ] as const
              ).map(([id, title, note]) => (
                <Choice key={id} on={where === id} onClick={() => setWhere(id)}>
                  <span className="block font-deco text-[0.95rem]">{title}</span>
                  <span className="block text-[0.74rem] opacity-75">{note}</span>
                </Choice>
              ))}
            </div>
            <p className="font-type mt-2 text-[0.82rem] leading-snug text-[var(--noir-ink-5)]">
              {where === 'online'
                ? 'Everyone sees each other on the room call. No new call — the one you are on.'
                : where === 'table'
                  ? 'Each phone is a private, silent dossier. Put one more device in the middle and choose “Use this screen as the town square” — it shows public things only and reads the story aloud.'
                  : 'Everyone starts online; those sitting together tap "At the table" on their phone.'}
            </p>
          </Field>

          <Field label="How long">
            <div className="divide-y divide-[var(--noir-ink-2)]/15">
              <Duration title="Night" note="to choose in the dark" value={night} options={[30, 45, 60]} format={(s) => `${s}s`} onChange={setNight} />
              <Duration title="Discussion" note="to argue it out" value={day} options={[120, 180, 300]} format={(s) => `${s / 60} min`} onChange={setDay} />
              <Duration title="Voting" note="to nominate, then to judge" value={vote} options={[30, 45, 60]} format={(s) => `${s}s`} onChange={setVote} />
            </div>
          </Field>

          <Field label="House rules">
            <Toggle on={story} onChange={setStory} title="Tell the story first" note="A one-minute narrated opening that explains the game — best for new players" />
            <Toggle on={reveal} onChange={setReveal} title="Reveal the dead" note="Show a role when its owner dies" />
            <Toggle on={godfather} onChange={setGodfather} title="The Godfather" note="7+ players · reads clean to the Inspector" />
            <Toggle on={jester} onChange={setJester} title="The Jester" note="6+ players · wins if the town hangs them" />
          </Field>

          {error && (
            <p role="alert" className="font-type mt-3 text-[0.8rem] text-[var(--noir-blood)]">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-4">
            <span className="font-type text-[0.84rem] text-[var(--noir-ink-5)]">{can ? 'Press the seal to deal' : n < 4 ? 'Four seats at least — add an AI player or wait for friends' : ''}</span>
            <motion.button
              type="button"
              disabled={!can}
              whileHover={can ? { rotate: -8, scale: 1.04 } : undefined}
              whileTap={can ? { scale: 0.92 } : undefined}
              onClick={() => onStart({ nightSeconds: night, daySeconds: day, voteSeconds: vote, reveal, godfather, jester, together: where === 'table', bots: ai, story, arc, randomPowers: auto, family: auto ? null : familyWanted, doctors: auto ? null : doctorsWanted, detectives: auto ? null : detectivesWanted })}
              className="relative grid size-24 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--noir-blood-bright),var(--noir-blood)_70%)] text-[var(--noir-on-accent)] shadow-[0_10px_24px_-8px_rgba(80,10,5,.9),inset_0_-4px_10px_rgba(0,0,0,.35)] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)] focus-visible:ring-offset-2 disabled:opacity-40"
            >
              <span className="absolute inset-2 rounded-full border-2 border-dashed border-[var(--noir-on-accent)]/40" />
              <span className="font-deco relative text-[1.15rem] tracking-wider">{starting ? '…' : 'Deal'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

const STORIES = ARC_IDS.map((id) => ARCS[id])
const ARC_KEY = 'huddle:mafia-story'
function savedArc(): ArcChoice {
  try {
    const saved = localStorage.getItem(ARC_KEY)
    return saved && (saved === 'surprise' || (ARC_IDS as readonly string[]).includes(saved)) ? (saved as ArcChoice) : 'surprise'
  } catch {
    return 'surprise'
  }
}

/** A story to play: a little window onto its city, at night, in its own colours. */
function StoryChoice({ id, on, onClick, name, note }: { id?: (typeof ARC_IDS)[number]; on: boolean; onClick: () => void; name: string; note: string }) {
  return (
    <div className={cn('relative rounded-[5px] p-[3px] transition-colors', on ? 'bg-[var(--noir-blood)]' : 'bg-transparent')}>
      {on && (
        <span className="absolute -right-1.5 -top-1.5 z-10 grid size-5 place-items-center rounded-full bg-[var(--noir-blood)] text-[var(--noir-on-accent)] shadow" aria-hidden>
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
      <motion.button
        type="button"
        role="radio"
        aria-checked={on}
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        data-arc={id ?? 'bombay'}
        className="noir group block w-full overflow-hidden rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--noir-brass)]"
      >
        <span className="relative block h-14 overflow-hidden bg-[linear-gradient(180deg,var(--noir-sky-1),var(--noir-sky-2))] sm:h-16">
          {id ? (
            <>
              <span className="absolute right-[14%] top-[18%] size-4 rounded-full bg-[var(--noir-moon-disc)] opacity-80" aria-hidden />
              <Skyline arc={id} className="absolute inset-x-0 bottom-0 h-[78%] w-full text-[var(--noir-skyline)] transition-transform duration-500 group-hover:scale-105" />
            </>
          ) : (
            <Dices aria-hidden className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 text-[var(--noir-brass)] transition-transform duration-500 group-hover:rotate-12" />
          )}
        </span>
        <span className="block bg-[var(--noir-panel)] px-2 py-1.5">
          <span className="font-deco block min-h-[2.2em] text-[0.82rem] leading-[1.1] text-[var(--noir-paper)] [text-wrap:balance]">{name}</span>
          <span className="font-type block truncate text-[0.68rem] text-[var(--noir-paper-dim)]">{note}</span>
        </span>
      </motion.button>
    </div>
  )
}

/** A card and how many of it: − and +, held to what this table can take. */
function Count({ title, note, value, shown, min, max, onChange }: { title: string; note: string; value: number; shown?: string; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="font-type block text-[0.92rem] text-[var(--noir-ink-1)]">{title}</span>
        <span className="font-type block text-[0.76rem] text-[var(--noir-ink-6)]">{note}</span>
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Step label={`One fewer: ${title}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </Step>
        <span className="font-deco min-w-8 px-0.5 text-center text-[1.3rem] text-[var(--noir-ink-1)]" aria-live="polite">
          {shown ?? value}
        </span>
        <Step label={`One more: ${title}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </Step>
      </div>
    </div>
  )
}

function Step({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="font-type grid size-11 place-items-center rounded-sm border border-[var(--noir-ink-2)]/40 text-[1.3rem] text-[var(--noir-ink-1)] outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)] disabled:opacity-30"
    >
      {children}
    </button>
  )
}

/** An empty chair waiting for an AI: a brass monogram rather than a face. */
function AiFace({ className }: { className?: string }) {
  return (
    <span className={cn('font-deco grid shrink-0 place-items-center rounded-full border border-dashed border-[var(--noir-brass)]/70 bg-[var(--noir-ink-1)] text-[0.8rem] text-[var(--noir-brass)]', className)}>
      AI
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="font-type mb-1.5 text-[0.74rem] uppercase tracking-[0.22em] text-[var(--noir-ink-6)]">{label}</p>
      {children}
    </div>
  )
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'font-type min-h-11 rounded-sm border px-2 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]',
        on ? 'border-[var(--noir-ink-2)] bg-[var(--noir-ink-2)] text-[var(--noir-paper)]' : 'border-[var(--noir-ink-2)]/30 text-[var(--noir-ink-2)] hover:bg-black/5',
      )}
    >
      {children}
    </button>
  )
}

function Duration({ title, note, ...pills }: { title: string; note: string; value: number; options: number[]; format: (n: number) => string; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span>
        <span className="font-type block text-[0.92rem] text-[var(--noir-ink-1)]">{title}</span>
        <span className="font-type block text-[0.76rem] text-[var(--noir-ink-6)]">{note}</span>
      </span>
      <Pills {...pills} />
    </div>
  )
}

function Pills({ value, options, format, onChange }: { value: number; options: number[]; format: (n: number) => string; onChange: (n: number) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:w-56">
      {options.map((o) => (
        <Choice key={o} on={value === o} onClick={() => onChange(o)}>
          <span className="block text-center text-[0.9rem]">{format(o)}</span>
        </Choice>
      ))}
    </div>
  )
}

function Toggle({ on, onChange, title, note }: { on: boolean; onChange: (on: boolean) => void; title: string; note: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 border-b border-[var(--noir-ink-2)]/15 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--noir-ink-2)]">
      <span>
        <span className="font-type block text-[0.92rem] text-[var(--noir-ink-1)]">{title}</span>
        <span className="font-type block text-[0.76rem] text-[var(--noir-ink-6)]">{note}</span>
      </span>
      <span className={cn('relative h-5 w-9 shrink-0 rounded-full border border-[var(--noir-ink-2)]/50 transition-colors', on ? 'bg-[var(--noir-blood)]' : 'bg-transparent')}>
        <span className={cn('absolute top-0.5 size-3.5 rounded-full bg-[var(--noir-paper)] shadow transition-transform', on ? 'translate-x-[1.1rem]' : 'translate-x-0.5')} />
      </span>
    </button>
  )
}
