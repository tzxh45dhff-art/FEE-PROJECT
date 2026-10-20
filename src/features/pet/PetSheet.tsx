import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Hand, Mic, MicOff, Pencil, Sparkles, Utensils, Volleyball, X } from 'lucide-react'

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
            <button type="button" onClick={() => setRenaming(true)} className="group flex items-center gap-2 text-left">
              <h2 className="font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] text-chalk">{pet.name}</h2>
              <Pencil className="size-3.5 text-dusk opacity-0 transition-opacity group-hover:opacity-100" aria-label="Rename" />
            </button>
          )}
          <p className="mt-1.5 text-[0.82rem] text-mist">
            {STAGE_LABEL[pet.stage]} · {days === 1 ? 'born today' : `${days} days old`}
          </p>
        </div>

        <div className="space-y-3">
          <Meter label="Tummy" value={100 - pet.hunger} tone="from-amber-300 to-orange-400" low="Starving" />
          <Meter label="Happiness" value={pet.happiness} tone="from-pink-300 to-fuchsia-400" low="Lonely" />
          <div>
            <div className="flex justify-between text-[0.72rem] text-mist">
              <span className="font-semibold uppercase tracking-[0.14em]">Growing</span>
              <span>{next ? `${Math.round(pet.progress * 100)}% to ${next}` : 'Fully grown'}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-violet-400" animate={{ width: `${pet.progress * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Action icon={<Utensils className="size-4" />} label="Feed" active={tray} onClick={() => setTray((t) => !t)} />
          <Action icon={<Volleyball className="size-4" />} label="Play" onClick={() => void pets.act('play')} />
          <Action icon={<Sparkles className="size-4" />} label="Tickle" onClick={() => void pets.act('tickle')} />
          <Action
            icon={listening ? <Mic className="size-4" /> : <MicOff className="size-4" />}
            label={listening ? 'Listening' : 'Talk to me'}
            active={listening}
            onClick={() => (listening ? mimic.stop() : void mimic.start())}
          />
        </div>

        <AnimatePresence>
          {tray && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex justify-between gap-1.5 rounded-2xl bg-white/[0.04] p-2" role="group" aria-label="Food">
                {FOODS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => void pets.act('feed', f)}
                    aria-label={`Feed ${f}`}
                    className="grid size-11 place-items-center rounded-xl text-[1.6rem] outline-none transition-transform hover:-translate-y-1 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-signal"
                  >
                    {FOOD_EMOJI[f]}
                  </button>
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

        <ul className="mt-auto space-y-1.5 text-[0.78rem] text-mist" aria-label="Recently">
          {log.map((e) => (
            <li key={e.id} className="flex items-center gap-2">
              <Hand className="size-3 text-dusk" aria-hidden />
              <span>
                <span className="text-chalk">{e.by.id === selfId ? 'You' : e.by.name}</span> {describe(e, pet.name)}
              </span>
            </li>
          ))}
        </ul>
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

function Meter({ label, value, tone, low }: { label: string; value: number; tone: string; low: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="flex justify-between text-[0.72rem] text-mist">
        <span className="font-semibold uppercase tracking-[0.14em]">{label}</span>
        <span className={cn(v < 25 && 'text-signal-bright')}>{v < 25 ? low : `${Math.round(v)}%`}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]" role="meter" aria-label={label} aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className={cn('h-full rounded-full bg-gradient-to-r', tone)} animate={{ width: `${v}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
    </div>
  )
}

function Action({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[0.85rem] font-semibold outline-none transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-signal',
        active ? 'border-white/40 bg-white/[0.12] text-chalk' : 'border-white/10 bg-white/[0.04] text-chalk hover:border-white/25',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
