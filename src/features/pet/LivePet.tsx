import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { PetArt } from '@/features/pet/PetArt'
import type { MimicMode } from '@/features/pet/useMimic'
import { FOOD_EMOJI } from '@/features/pet/foods'
import type { Expression, Food, Pet, PetEvent, Reaction } from '@/features/pet/types'
import { cn } from '@/lib/utils'

/**
 * The pet, alive: a drawing plus everything that decides which face it pulls.
 *
 * Its resting face comes from how it actually is (hungry, sad, happy). On top
 * of that, anything anyone does to it plays a reaction for a moment — the same
 * one on every screen, because the server picked it — with a line it says, a
 * bump of the body, and sometimes hearts. Listening and talking back win over
 * everything, because you are looking right at it when it does that.
 */

/* What floats off it afterwards: love gets hearts, a giggle gets sparkles, a poke gets a little anger mark. */
const REACT: Record<Reaction, { face: Expression; bump: 'squash' | 'jump' | 'shake' | 'wiggle'; line: string[]; hearts?: number; glyph?: string }> = {
  yum: { face: 'yum', bump: 'squash', line: ['Nom nom nom', 'Mmm!', 'Tasty!'], hearts: 3, glyph: '✨' },
  love: { face: 'love', bump: 'jump', line: ['MY FAVOURITE!!', 'I love you!!', 'Best. Day. Ever.'], hearts: 6 },
  full: { face: 'full', bump: 'shake', line: ['I’m stuffed…', 'No more, please', 'Can’t… eat… another…'] },
  purr: { face: 'purr', bump: 'wiggle', line: ['Prrrrr…', 'Mmm, more', 'That’s the spot'], hearts: 3 },
  ouch: { face: 'ouch', bump: 'squash', line: ['Ow!', 'Hey!', 'Ouchie!'], hearts: 1, glyph: '💢' },
  giggle: { face: 'giggle', bump: 'wiggle', line: ['Hehehe!', 'That tickles!', 'Stoppp hehe'], hearts: 5, glyph: '✨' },
  grumpy: { face: 'grumpy', bump: 'shake', line: ['Hmph.', 'Rude.', 'Okay, that’s enough.'], hearts: 2, glyph: '💢' },
  play: { face: 'happy', bump: 'jump', line: ['Again! Again!', 'Wheee!', 'Catch me!'], hearts: 4, glyph: '⭐' },
  listen: { face: 'listen', bump: 'wiggle', line: [''] },
  sulk: { face: 'sad', bump: 'shake', line: ['…not now.', 'I’m too hungry to play', 'Leave me alone…'], hearts: 1, glyph: '💧' },
}

const DID: Record<PetEvent['action'], string> = { feed: 'fed me', pet: 'stroked me', poke: 'poked me', tickle: 'tickled me', play: 'played with me', talk: 'talked to me' }

const REST: Record<Pet['mood'], Expression> = { hungry: 'hungry', sad: 'sad', happy: 'idle', okay: 'idle' }

const pick = <T,>(list: T[], seed: string) => list[[...seed].reduce((n, c) => n + c.charCodeAt(0), 0) % list.length]!

export function LivePet({
  pet,
  event,
  selfId,
  mimic,
  level,
  speaker,
  className,
  bubbleSide = 'top',
  onTap,
}: {
  pet: Pet
  event: PetEvent | null
  selfId: string | undefined
  mimic: MimicMode
  /** Live mouth level while a voice plays, 0–1. */
  level: number
  /** Whose voice it is repeating right now, if someone else's. */
  speaker: string | null
  className?: string
  bubbleSide?: 'top' | 'right'
  onTap?: (point: { x: number; y: number }) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [reacting, setReacting] = useState<{ face: Expression; until: number } | null>(null)
  const [bump, setBump] = useState(0)
  const [bumpKind, setBumpKind] = useState<'squash' | 'jump' | 'shake' | 'wiggle'>('squash')
  const [bubble, setBubble] = useState<{ id: string; text: string; who?: string } | null>(null)
  const [hearts, setHearts] = useState<{ id: string; n: number; glyph: string } | null>(null)
  const [snack, setSnack] = useState<{ id: string; food: Food } | null>(null)

  /* Eyes follow the pointer anywhere on the page. */
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const r = box.current?.getBoundingClientRect()
      if (!r) return
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * 0.4
      setLook({ x: (e.clientX - cx) / Math.max(240, r.width * 2), y: (e.clientY - cy) / Math.max(240, r.height * 2) })
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  /* Somebody did something. */
  useEffect(() => {
    if (!event || Date.now() - event.at > 8000) return
    const r = REACT[event.reaction]
    const play = () => {
      setReacting({ face: r.face, until: Date.now() + 2200 })
      setBumpKind(r.bump)
      setBump((b) => b + 1)
      const line = pick(r.line, event.id)
      const who = event.by.id === selfId ? '' : event.by.name
      const action = event.action === 'feed' && event.food ? `${FOOD_EMOJI[event.food]} ` : ''
      if (line) setBubble({ id: event.id, text: `${action}${line}`, who: who ? `${who} ${event.reaction === 'full' ? 'tried to feed me' : DID[event.action]}` : undefined })
      else if (who) setBubble({ id: event.id, text: `${who} is talking to me` })
      if (r.hearts) setHearts({ id: event.id, n: r.hearts, glyph: r.glyph ?? '💗' })
    }
    /* Food flies in first; the reaction lands when it arrives. */
    if (event.action === 'feed' && event.food && event.reaction !== 'full') {
      setSnack({ id: event.id, food: event.food })
      const timer = window.setTimeout(play, 520)
      return () => window.clearTimeout(timer)
    }
    play()
  }, [event, selfId])

  useEffect(() => {
    if (!bubble) return
    const timer = window.setTimeout(() => setBubble(null), 2600)
    return () => window.clearTimeout(timer)
  }, [bubble])

  /* A reaction wears off on its own. */
  useEffect(() => {
    if (!reacting) return
    const timer = window.setTimeout(() => setReacting(null), Math.max(0, reacting.until - Date.now()))
    return () => window.clearTimeout(timer)
  }, [reacting])

  /* Someone else's voice arrives: say who, the first time. */
  useEffect(() => {
    if (speaker) setBubble({ id: `voice-${speaker}-${Date.now()}`, text: `${speaker} says…` })
  }, [speaker])

  const face: Expression =
    level > 0.04 || mimic === 'speaking' ? 'talk' : mimic === 'hearing' ? 'listen' : (reacting?.face ?? (mimic === 'listening' ? 'idle' : REST[pet.mood]))
  const scale = { baby: 0.78, kid: 0.88, teen: 0.96, grown: 1.04 }[pet.stage]

  return (
    <div ref={box} className={cn('relative select-none', className)}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className={cn(
              'pointer-events-none absolute z-10 max-w-[13rem] whitespace-nowrap rounded-2xl bg-white px-3.5 py-2 text-[0.82rem] font-semibold text-[#2a1f2f] shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)]',
              bubbleSide === 'top' ? 'left-1/2 -translate-x-1/2' : 'left-[78%] top-[8%]',
            )}
            /* Just over its head, however big it has grown. */
            style={bubbleSide === 'top' ? { bottom: `${scale * 84}%` } : undefined}
          >
            {bubble.text}
            {bubble.who && <span className="block text-[0.66rem] font-medium text-[#8a7690]">{bubble.who}</span>}
            <span
              className={cn('absolute size-3 rotate-45 bg-white', bubbleSide === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' : '-left-1 top-1/2 -translate-y-1/2')}
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={`${pet.name} — tap to poke`}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          onTap?.({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
        }}
        className="block size-full cursor-pointer outline-none focus-visible:rounded-3xl focus-visible:outline-2 focus-visible:outline-signal"
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        style={{ originY: 1 }}
        whileTap={{ scale: scale * 0.97 }}
      >
        <PetArt species={pet.species} expression={face} look={look} mouth={level} bump={bump} bumpKind={bumpKind} className="size-full drop-shadow-[0_18px_30px_rgba(0,0,0,.35)]" />
      </motion.button>

      {/* Hearts (or sparkles, or stars), floating up and away, swaying as they go. */}
      <AnimatePresence>
        {hearts &&
          (hearts.glyph === '💢' || hearts.glyph === '💧'
            ? /* A cross mark or a tear doesn't float: it pops by the head, like in a cartoon. */
              Array.from({ length: hearts.n }, (_, i) => (
                <motion.span
                  key={`${hearts.id}-${i}`}
                  aria-hidden
                  className="pointer-events-none absolute text-[1.35rem]"
                  style={{ bottom: `${scale * (72 - i * 10)}%`, left: i % 2 ? '30%' : '64%' }}
                  initial={{ opacity: 0, scale: 0.2, rotate: -20 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1.25, 1, 0.9], rotate: 0, y: hearts.glyph === '💧' ? [0, 0, 14, 22] : 0 }}
                  transition={{ duration: 1.3, delay: i * 0.15, ease: 'easeOut' }}
                  onAnimationComplete={() => i === hearts.n - 1 && setHearts(null)}
                >
                  {hearts.glyph}
                </motion.span>
              ))
            : Array.from({ length: hearts.n }, (_, i) => {
                const x = (i - (hearts.n - 1) / 2) * 20 + (i % 2 ? 6 : -6)
                return (
                  <motion.span
                    key={`${hearts.id}-${i}`}
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 -ml-[0.6rem] text-[1.2rem]"
                    style={{ bottom: `${scale * 60}%` }}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], x: [0, x, x + (i % 2 ? -8 : 8), x], y: -90 - (i % 3) * 22, scale: [0.4, 1.1, 1, 0.9], rotate: i % 2 ? 14 : -14 }}
                    transition={{ duration: 1.6, delay: i * 0.08, ease: 'easeOut' }}
                    onAnimationComplete={() => i === hearts.n - 1 && setHearts(null)}
                  >
                    {hearts.glyph}
                  </motion.span>
                )
              }))}
      </AnimatePresence>

      {/* A snack, tossed into its mouth. */}
      <AnimatePresence>
        {snack && (
          <motion.span
            key={snack.id}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 text-[2rem]"
            initial={{ x: 90, y: 120, opacity: 0, rotate: -30, scale: 1 }}
            animate={{ x: [90, 40, -12], y: [120, -10, -6], opacity: [0, 1, 1], rotate: 200, scale: [1, 1, 0.2] }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            onAnimationComplete={() => setSnack(null)}
          >
            {FOOD_EMOJI[snack.food]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
