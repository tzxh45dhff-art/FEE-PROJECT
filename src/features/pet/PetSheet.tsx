import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, X } from 'lucide-react'

import { FOOD_EMOJI } from '@/features/pet/foods'
import { LivePet } from '@/features/pet/LivePet'
import { PetArt } from '@/features/pet/PetArt'
import { Egg } from '@/features/pet/PetCorner'
import type { useMimic } from '@/features/pet/useMimic'
import type { usePet } from '@/features/pet/usePet'
import type { Food, PetEvent, Species } from '@/features/pet/types'
import { cn } from '@/lib/utils'

/**
 * Looking after the pet, up close.
 *
 * Big enough to play with properly: tap it to poke, drag across it to stroke,
 * feed it from a little tray, throw it a ball, or switch the microphone on and
 * talk to it. Everyone in the room sees it react, wherever they are.
 */

const SPECIES: { id: Species; label: string; names: string[] }[] = [
  { id: 'cat', label: 'Kitten', names: ['Mochi', 'Biscuit', 'Gulab'] },
  { id: 'pup', label: 'Puppy', names: ['Bruno', 'Laddoo', 'Toffee'] },
  { id: 'bunny', label: 'Bunny', names: ['Coco', 'Rasmalai', 'Puff'] },
  { id: 'panda', label: 'Panda', names: ['Bao', 'Momo', 'Dumpling'] },
]

const FOODS: Food[] = ['cookie', 'fish', 'carrot', 'bamboo', 'icecream', 'pizza']
const STAGE_LABEL = { baby: 'Baby', kid: 'Little one', teen: 'Teen', grown: 'All grown up' }
const NEXT_STAGE = { baby: 'little one', kid: 'teen', teen: 'grown-up', grown: null }
const MOTES = [
  { x: '42%', y: '22%', drift: 6, t: 6 },
  { x: '55%', y: '34%', drift: -8, t: 7.5 },
  { x: '47%', y: '48%', drift: 5, t: 5.5 },
  { x: '58%', y: '16%', drift: -4, t: 8 },
  { x: '38%', y: '40%', drift: 7, t: 6.5 },
]

type Pets = ReturnType<typeof usePet>
type Mimic = ReturnType<typeof useMimic>

export function PetSheet({
  pets,
  selfId,
  mimic,
  level,
  speaker,
  onClose,
}: {
  pets: Pets
  selfId: string | undefined
  mimic: Mimic
  level: number
  speaker: string | null
  onClose: () => void
}) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  /* Portalled, so it sits over the page header too. */
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[140] grid place-items-center bg-black/55 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={pets.pet ? `${pets.pet.name}, your room pet` : 'Adopt a room pet'}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[56rem] overflow-y-auto overscroll-contain rounded-[2rem] border border-white/10 bg-[#141017]/95 shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)]"
        initial={{ y: 30, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/[0.07] text-mist outline-none transition-colors hover:bg-white/15 hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
        >
          <X className="size-4" />
        </button>
        {pets.pet ? <Care pets={pets} selfId={selfId} mimic={mimic} level={level} speaker={speaker} /> : <Adopt pets={pets} />}
      </motion.div>
    </motion.div>,
    document.body,
  )
}

/* ── Adopting ─────────────────────────────────────────────────────────── */

function Adopt({ pets }: { pets: Pets }) {
  const [species, setSpecies] = useState<Species>('cat')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const choice = SPECIES.find((s) => s.id === species)!
  const placeholder = choice.names[0]!

  const submit = async () => {
    setBusy(true)
    await pets.adopt(species, name.trim() || placeholder)
    setBusy(false)
  }

  return (
    <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center sm:px-10">
      <Egg className="h-20 w-16" />
      <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">A room pet</p>
      <h2 className="mt-2 text-balance font-display text-[clamp(1.7rem,3.6vw,2.4rem)] font-semibold leading-tight tracking-[-0.03em] text-chalk">Someone to look after, together.</h2>
      <p className="mt-2 max-w-md text-pretty text-[0.9rem] leading-relaxed text-mist">
        They get hungry, they get lonely, and they grow up if you’re good to them. Talk to them and they’ll say it right back.
      </p>

      <div className="mt-7 grid w-full grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Who to adopt">
        {SPECIES.map((s) => {
          const on = s.id === species
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSpecies(s.id)}
              className={cn(
                'group relative flex flex-col items-center overflow-hidden rounded-[1.4rem] border pb-3 pt-2 outline-none transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-signal',
                on ? 'border-white/45 bg-white/[0.09]' : 'border-white/10 bg-white/[0.03] hover:border-white/25',
              )}
            >
              <PetArt species={s.id} expression={on ? 'happy' : 'idle'} className="h-32 w-28" />
              <span className="text-[0.88rem] font-semibold text-chalk">{s.label}</span>
            </button>
          )
        })}
      </div>

      <label className="mt-6 flex w-full max-w-sm flex-col items-start gap-1.5 text-left">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist">Their name</span>
        <input
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !busy && void submit()}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-[1rem] text-chalk outline-none placeholder:text-dusk focus:border-white/35"
        />
        <span className="flex flex-wrap gap-1.5 pt-1">
          {choice.names.map((n) => (
            <button key={n} type="button" onClick={() => setName(n)} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.72rem] text-mist hover:bg-white/12 hover:text-chalk">
              {n}
            </button>
          ))}
        </span>
      </label>
      {pets.error && (
        <p role="alert" className="mt-3 text-[0.8rem] text-signal-bright">
          {pets.error}
        </p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="mt-6 rounded-full bg-chalk px-8 py-3 text-[0.9rem] font-semibold text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-50"
      >
        Adopt {name.trim() || placeholder}
      </button>
    </div>
  )
}

/* ── Caring ───────────────────────────────────────────────────────────── */

function Care({ pets, selfId, mimic, level, speaker }: { pets: Pets; selfId: string | undefined; mimic: Mimic; level: number; speaker: string | null }) {
  const pet = pets.pet!
  const [tray, setTray] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(pet.name)
  const [log, setLog] = useState<PetEvent[]>([])

  useEffect(() => {
    const e = pets.event
    if (e && e.action !== 'talk') setLog((l) => (l.some((x) => x.id === e.id) ? l : [e, ...l].slice(0, 4)))
  }, [pets.event])

  /* Stroking: a drag across the pet counts as petting it, once per stroke. */
  const stroke = useRef<{ x: number; y: number; travelled: number; sent: boolean } | null>(null)
  const lastPet = useRef(0)

  const days = Math.max(1, Math.ceil((Date.now() - pet.bornAt) / 86_400_000))
  const next = NEXT_STAGE[pet.stage]
  const listening = mimic.mode === 'listening' || mimic.mode === 'hearing' || mimic.mode === 'speaking' || mimic.mode === 'starting'

  return (
    <div className="grid md:grid-cols-[1.1fr_1fr]">
      {/* The pet, on a little lit stage. */}
      <div className="relative flex min-h-[24rem] flex-col items-center justify-end overflow-hidden bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,170,110,.28),transparent_65%),radial-gradient(ellipse_at_30%_0%,rgba(140,110,255,.18),transparent_60%)] px-6 pb-5 pt-16 md:min-h-[33rem]">
        {/* A warm lamp overhead, and dust drifting through its light. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[conic-gradient(from_180deg_at_50%_-8%,transparent_157deg,rgba(255,214,170,.09)_172deg,rgba(255,226,190,.13)_180deg,rgba(255,214,170,.09)_188deg,transparent_203deg)]"
        />
        {MOTES.map((m, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute size-1 rounded-full bg-[#ffe2c0]"
            style={{ left: m.x, top: m.y }}
            animate={{ y: [0, -18, 0], x: [0, m.drift, 0], opacity: [0, 0.55, 0] }}
            transition={{ duration: m.t, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
          />
        ))}
        {/* A rug to sit on, so it is somewhere rather than nowhere. */}
        <div
          aria-hidden
          className="absolute bottom-12 left-1/2 h-20 w-[19rem] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,214,170,.32),rgba(255,160,120,.14)_55%,transparent_72%)]"
        />
        <div
          aria-hidden
          className="absolute bottom-[3.6rem] left-1/2 h-12 w-[15rem] -translate-x-1/2 rounded-[50%] border border-dashed border-white/15"
        />
        <div
          className="touch-none"
          onPointerDown={(e) => (stroke.current = { x: e.clientX, y: e.clientY, travelled: 0, sent: false })}
          onPointerMove={(e) => {
            const s = stroke.current
            if (!s || s.sent) return
            s.travelled += Math.hypot(e.clientX - s.x, e.clientY - s.y)
            s.x = e.clientX
            s.y = e.clientY
            if (s.travelled > 110 && Date.now() - lastPet.current > 1200) {
              s.sent = true
              lastPet.current = Date.now()
              void pets.act('pet')
            }
          }}
          onPointerUp={() => (stroke.current = null)}
          onPointerLeave={() => (stroke.current = null)}
        >
          <LivePet
            pet={pet}
            event={pets.event}
            selfId={selfId}
            mimic={mimic.mode}
            level={level}
            speaker={speaker}
            className="relative h-80 w-72 md:h-[24rem] md:w-80"
            onTap={() => {
              /* A tap is a poke unless it turns into a stroke. */
              window.setTimeout(() => {
                if (!stroke.current?.sent) void pets.act('poke')
              }, 180)
            }}
          />
        </div>
        <p className="mt-3 text-[0.75rem] text-dusk">
          {mimic.mode === 'listening'
            ? 'Listening — say something!'
            : mimic.mode === 'hearing'
              ? 'Hearing you…'
              : mimic.mode === 'denied'
                ? 'The microphone is blocked for this site'
                : 'Tap to poke · drag across to stroke'}
        </p>
      </div>

      {/* Everything else. */}
      <div className="flex flex-col gap-5 border-t border-white/[0.06] p-6 md:border-l md:border-t-0 md:p-8">
        <div>
          {renaming ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (draft.trim()) void pets.rename(draft.trim())
                setRenaming(false)
              }}
            >
              <input
                autoFocus
                value={draft}
                maxLength={20}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => setRenaming(false)}
                className="w-48 rounded-xl border border-white/20 bg-white/[0.06] px-3 py-1.5 font-display text-[1.5rem] font-semibold text-chalk outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setRenaming(true)}
              title={`Rename ${pet.name}`}
              className="group -mx-1.5 flex items-center gap-2 rounded-xl px-1.5 text-left outline-none focus-visible:outline-2 focus-visible:outline-signal"
            >
              <h2 className="font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] text-chalk">{pet.name}</h2>
              {/* Faintly there on touch screens, where there is no hover to find it. */}
              <Pencil className="size-3.5 text-dusk opacity-40 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:opacity-0" aria-label="Rename" />
            </button>
          )}
          <p className="mt-1.5 text-[0.82rem] text-mist">
            {STAGE_LABEL[pet.stage]} · {days === 1 ? 'born today' : `${days} days old`}
          </p>
        </div>

        <div className="space-y-3.5 rounded-2xl bg-white/[0.025] p-4 ring-1 ring-inset ring-white/[0.05]">
          <Meter icon="🍪" label="Tummy" value={100 - pet.hunger} tone="from-amber-300 to-orange-400" low="Starving" />
          <Meter icon="💗" label="Happiness" value={pet.happiness} tone="from-pink-300 to-fuchsia-400" low="Lonely" />
          <Meter
            icon="🌱"
            label="Growing"
            value={pet.progress * 100}
            tone="from-sky-300 to-violet-400"
            note={next ? `${Math.round(pet.progress * 100)}% to ${next}` : 'Fully grown'}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Action emoji="🍽️" label="Feed" active={tray} onClick={() => setTray((t) => !t)} />
          <Action emoji="🎾" label="Play" onClick={() => void pets.act('play')} />
          <Action emoji="🪶" label="Tickle" onClick={() => void pets.act('tickle')} />
          <Action
            emoji={listening ? '👂' : '🎙️'}
            label={listening ? 'Listening' : 'Talk to me'}
            active={listening}
            live={listening}
            onClick={() => (listening ? mimic.stop() : void mimic.start())}
          />
        </div>

        <AnimatePresence>
          {tray && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              {/* A little wooden tray of treats; each one lifts off it when you reach for it. */}
              <div
                className="flex justify-between gap-1 rounded-2xl bg-gradient-to-b from-[#3a2a22]/70 to-[#2a1d18]/70 p-2 shadow-[inset_0_1px_0_rgba(255,220,180,.12),inset_0_-3px_0_rgba(0,0,0,.25)] ring-1 ring-inset ring-[#ffcf9f]/10"
                role="group"
                aria-label="Food"
              >
                {FOODS.map((f, i) => (
                  <motion.button
                    key={f}
                    type="button"
                    onClick={() => void pets.act('feed', f)}
                    aria-label={`Feed ${f}`}
                    title={f}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ y: -6, rotate: i % 2 ? 8 : -8, scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18, delay: i * 0.03 }}
                    className="grid size-11 place-items-center rounded-xl text-[1.6rem] outline-none drop-shadow-[0_6px_6px_rgba(0,0,0,.35)] hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-signal"
                  >
                    {FOOD_EMOJI[f]}
                  </motion.button>
                ))}
              </div>
              <p className="mt-1.5 text-center text-[0.7rem] text-dusk">Everyone has a favourite. Find theirs.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {pets.error && (
          <p role="alert" className="text-[0.8rem] text-signal-bright">
            {pets.error}
          </p>
        )}

        <div className="mt-auto">
          <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-dusk">Recently</p>
          <ul className="space-y-1.5 text-[0.78rem] text-mist" aria-label="Recently">
            <AnimatePresence initial={false}>
              {log.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex items-center gap-2"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[0.7rem]" aria-hidden>
                    {LOG_GLYPH[e.action]}
                  </span>
                  <span>
                    <span className="text-chalk">{e.by.id === selfId ? 'You' : e.by.name}</span> {describe(e, pet.name)}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
            {log.length === 0 && <li className="text-dusk">Nothing yet — say hello.</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}

function describe(e: PetEvent, name: string) {
  switch (e.action) {
    case 'feed':
      return e.reaction === 'full' ? `tried to feed ${name} — too full` : `fed ${name} ${e.food ? FOOD_EMOJI[e.food] : ''}${e.reaction === 'love' ? ' — a favourite!' : ''}`
    case 'pet':
      return `stroked ${name}`
    case 'poke':
      return `poked ${name}${e.reaction === 'grumpy' ? ' (not a fan)' : ''}`
    case 'tickle':
      return `tickled ${name}`
    case 'play':
      return e.reaction === 'sulk' ? `wanted to play — ${name} is too hungry` : `played with ${name}`
    default:
      return `talked to ${name}`
  }
}

const LOG_GLYPH: Record<PetEvent['action'], string> = { feed: '🍽️', pet: '🤚', poke: '👉', tickle: '🪶', play: '🎾', talk: '💬' }

function Meter({ icon, label, value, tone, low, note }: { icon: string; label: string; value: number; tone: string; low?: string; note?: string }) {
  const v = Math.max(0, Math.min(100, value))
  const warn = low !== undefined && v < 25
  return (
    <div className="flex items-center gap-3">
      <span className={cn('grid size-8 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-[1rem]', warn && 'animate-pulse bg-signal/15')} aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between text-[0.72rem] text-mist">
          <span className="font-semibold uppercase tracking-[0.14em]">{label}</span>
          <span className={cn('tabular-nums', warn && 'font-semibold text-signal-bright')}>{note ?? (warn ? low : `${Math.round(v)}%`)}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]" role="meter" aria-label={label} aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className={cn('relative h-full overflow-hidden rounded-full bg-gradient-to-r', tone, warn && 'animate-pulse')}
            initial={false}
            animate={{ width: `${v}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            {/* A soft glint along the top, like a filled glass tube. */}
            <span className="absolute inset-x-1 top-[1px] h-[2px] rounded-full bg-white/40" aria-hidden />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Action({ emoji, label, active, live, onClick }: { emoji: string; label: string; active?: boolean; live?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94, y: 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 22 }}
      className={cn(
        'group flex items-center justify-center gap-2.5 rounded-2xl border px-3 py-2.5 text-[0.85rem] font-semibold text-chalk outline-none transition-[background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-signal',
        'shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_3px_0_rgba(0,0,0,.35)]',
        active ? 'border-white/40 bg-white/[0.12]' : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]',
      )}
    >
      <span className="relative grid size-7 place-items-center rounded-full bg-white/[0.07] text-[0.95rem] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" aria-hidden>
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-signal/40" />}
        <span className="relative">{emoji}</span>
      </span>
      {label}
    </motion.button>
  )
}
