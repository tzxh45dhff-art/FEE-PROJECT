import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { PetArt } from '@/features/pet/PetArt'
import type { MimicMode } from '@/features/pet/useMimic'
import { FOOD_EMOJI } from '@/features/pet/foods'
import type { PetCue, PetCueKind, PetScene } from '@/features/pet/petCues'
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
  sulk: { face: 'sad', bump: 'shake', line: ['That really hurt, {name}.', 'I’m going to sit over here.', 'Leave me alone, {name}…'], hearts: 2, glyph: '💧' },
  /* Feelings. `{name}` is whoever did it. */
  leave: { face: 'sad', bump: 'shake', line: ['That’s it. I’m leaving.', 'I need some space, {name}.', 'Bye.'], hearts: 3, glyph: '💧' },
  turnaway: { face: 'grumpy', bump: 'shake', line: ['Not until you say sorry, {name}.', 'Hmph. No.', 'I’m not talking to you.'], hearts: 1, glyph: '💢' },
  sniff: { face: 'sad', bump: 'wiggle', line: ['*sniff* …okay.', '…go on.', 'A little better…'], hearts: 1, glyph: '💗' },
  forgive: { face: 'love', bump: 'jump', line: ['Okay… I forgive you, {name}', 'Friends again?', 'Fine. Come here, {name}.'], hearts: 7 },
  away: { face: 'sad', bump: 'shake', line: [''] },
  comfort: { face: 'purr', bump: 'wiggle', line: ['…thanks.', 'At least you’re nice to me.', '*sniffle*'], hearts: 2 },
}

/* What it makes of what is going on around it. `{name}` is whoever did it, if anyone. */
const CUE: Record<PetCueKind, { face: Expression; bump: 'squash' | 'jump' | 'shake' | 'wiggle'; line: string[]; hearts?: number; glyph?: string }> = {
  laugh: { face: 'giggle', bump: 'wiggle', line: ['Hahaha!', 'Stop, I can’t 😂', 'LOL'], hearts: 4, glyph: '✨' },
  aww: { face: 'sad', bump: 'wiggle', line: ['Awww…', '*sniff*', 'That’s so sad'], hearts: 1, glyph: '💧' },
  gasp: { face: 'ouch', bump: 'shake', line: ['WHAT?!', 'No way!', 'Did you see that?!'], hearts: 1, glyph: '❗' },
  cheer: { face: 'happy', bump: 'jump', line: ['YESSS!', 'Woo!', 'That was so good'], hearts: 4, glyph: '⭐' },
  love: { face: 'love', bump: 'jump', line: ['Awww 💗', 'I love this', 'So cute'], hearts: 4 },
  snack: { face: 'yum', bump: 'squash', line: ['Can I have some?', 'Share? 🍿', 'Popcorn!!'], hearts: 2, glyph: '🍿' },
  right: { face: 'happy', bump: 'jump', line: ['You got it!', 'Big brain!', 'Nailed it!'], hearts: 3, glyph: '⭐' },
  wrong: { face: 'sad', bump: 'shake', line: ['Ooh, so close', 'Next one!', 'Hmm, nope'] },
  win: { face: 'love', bump: 'jump', line: ['CHAMPION!!', 'You won!! 🏆', 'I knew you would!'], hearts: 7, glyph: '🎉' },
  lose: { face: 'sad', bump: 'shake', line: ['Rematch?', 'Next time, for sure', '{name} got lucky.'], hearts: 1, glyph: '💧' },
  break: { face: 'happy', bump: 'jump', line: ['Break time! Stretch!', 'You earned it', 'Water? Snack?'], hearts: 3, glyph: '✨' },
  hello: { face: 'happy', bump: 'wiggle', line: ['You called?', 'Hi {name}!', 'That’s me!'], hearts: 2 },
  tune: { face: 'happy', bump: 'jump', line: ['Ooh, I love this one!', 'Tuuune 🎶', 'Turn it up!'], hearts: 3, glyph: '♪' },
}

const DID: Record<PetEvent['action'], string> = { feed: 'fed me', pet: 'stroked me', poke: 'hit me', tickle: 'tickled me', play: 'played with me', talk: 'talked to me', sorry: 'said sorry' }

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
  onStroke,
  cue = null,
  scene = 'none',
  dancing = false,
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
  /** A quick tap: a hit. */
  onTap?: () => void
  /** Rubbing across it: love. Fires again every so often while the rubbing goes on. */
  onStroke?: () => void
  /** Something happening around it — a laugh at the film, a right answer. */
  cue?: PetCue | null
  /** What it is doing in the background: watching along, dozing, keeping quiet. */
  scene?: PetScene
  /** Music is playing in the room: it bobs along. */
  dancing?: boolean
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
      const line = pick(r.line, event.id).replaceAll('{name}', event.by.name.split(' ')[0] ?? event.by.name)
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

  /*
   * Whatever is going on around it. Not while it is upset — a sulking pet does
   * not cheer — and only a face, no chatter, while someone is focusing.
   */
  const upset = pet.pose !== 'normal'
  useEffect(() => {
    if (!cue || upset) return
    const r = CUE[cue.kind]
    setReacting({ face: r.face, until: Date.now() + 2200 })
    setBumpKind(r.bump)
    setBump((b) => b + 1)
    if (scene !== 'focus' || cue.kind === 'break') {
      const line = pick(r.line, cue.id).replaceAll('{name}', cue.who?.split(' ')[0] ?? 'they')
      setBubble({ id: cue.id, text: line })
    }
    if (r.hearts) setHearts({ id: cue.id, n: r.hearts, glyph: r.glyph ?? '💗' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue])

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

  /*
   * How it is with *you*. Upset with you and no apology yet: it stays grumpy
   * and won't look your way. Sulking in the corner: small and sad for
   * everyone, eyes on the floor.
   */
  const mine = pet.grudges.find((g) => g.id === selfId)
  const coldToMe = !!mine && mine.level !== 'wary' && !mine.sorry
  const sulking = pet.pose === 'corner'
  const rest: Expression = sulking ? 'sad' : coldToMe ? 'grumpy' : scene === 'dozing' ? 'sleepy' : REST[pet.mood]
  const face: Expression =
    level > 0.04 || mimic === 'speaking' ? 'talk' : mimic === 'hearing' ? 'listen' : (reacting?.face ?? (mimic === 'listening' ? 'idle' : rest))
  const gaze = sulking ? { x: 0.25, y: 0.35 } : coldToMe ? { x: -look.x * 1.5, y: look.y } : look
  const scale = { baby: 0.78, kid: 0.88, teen: 0.96, grown: 1.04 }[pet.stage] * (sulking ? 0.82 : 1)
  /* Bobbing to the music — unless it is upset, focusing, asleep, or mid-reaction. */
  const grooving = dancing && !upset && scene !== 'focus' && scene !== 'dozing' && !reacting

  /*
   * One rule for a hand on the pet, decided by what the hand did rather than
   * by a timer racing it: lifted after barely moving is a tap (a hit), moving
   * across it is a stroke (love). A stroke keeps counting while you keep
   * rubbing, but no faster than the pet can enjoy it.
   */
  const hand = useRef<{ x: number; y: number; at: number; travelled: number; stroked: boolean } | null>(null)
  const lastStroke = useRef(0)

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

      {pet.pose === 'away' ? (
        /* Gone for a while: an empty spot with a little bag disappearing off it. */
        <div className="flex size-full items-end justify-center pb-[12%]" aria-label={`${pet.name} has gone off for a while`}>
          <motion.span
            aria-hidden
            className="text-[2.2rem]"
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 70, opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeIn' }}
          >
            🧳
          </motion.span>
          <span aria-hidden className="absolute bottom-[10%] h-3 w-1/2 rounded-[50%] bg-black/25" />
        </div>
      ) : (
      <motion.button
        type="button"
        aria-label={`${pet.name} — rub to stroke, tap to poke`}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.currentTarget.setPointerCapture(e.pointerId)
          hand.current = { x: e.clientX, y: e.clientY, at: Date.now(), travelled: 0, stroked: false }
        }}
        onPointerMove={(e) => {
          const h = hand.current
          if (!h) return
          h.travelled += Math.hypot(e.clientX - h.x, e.clientY - h.y)
          h.x = e.clientX
          h.y = e.clientY
          if (h.travelled >= 40 && Date.now() - lastStroke.current > 900) {
            h.stroked = true
            h.travelled = 0
            lastStroke.current = Date.now()
            onStroke?.()
          }
        }}
        onPointerUp={() => {
          const h = hand.current
          hand.current = null
          if (h && !h.stroked && h.travelled < 14 && Date.now() - h.at < 600) onTap?.()
        }}
        onPointerCancel={() => (hand.current = null)}
        onKeyDown={(e) => {
          /* From a keyboard: Enter strokes. Nobody needs a key for hitting it. */
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onStroke?.()
          }
        }}
        className="block size-full cursor-pointer touch-none outline-none focus-visible:rounded-3xl focus-visible:outline-2 focus-visible:outline-signal"
        animate={{ scale, y: sulking ? '8%' : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        style={{ originY: 1 }}
        whileTap={{ scale: scale * 0.97 }}
      >
        <motion.div
          className="size-full"
          style={{ originY: 1 }}
          animate={grooving ? { y: [0, -5, 0], rotate: [-3, 3, -3] } : { y: 0, rotate: 0 }}
          transition={grooving ? { repeat: Infinity, duration: 0.9, ease: 'easeInOut' } : { duration: 0.3 }}
        >
          <PetArt species={pet.species} expression={face} look={gaze} mouth={level} bump={bump} bumpKind={bumpKind} className="size-full drop-shadow-[0_18px_30px_rgba(0,0,0,.35)]" />
        </motion.div>
      </motion.button>
      )}

      {/* Notes drifting off it while it grooves. */}
      <AnimatePresence>
        {grooving &&
          [0, 1].map((i) => (
            <motion.span
              key={`note-${i}`}
              aria-hidden
              className="pointer-events-none absolute text-[1rem] font-bold text-white/70"
              style={{ top: '18%', left: i ? '70%' : '22%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0], y: [0, -22], x: [0, i ? 8 : -8], rotate: [0, i ? 14 : -14] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 1, ease: 'easeOut' }}
            >
              {i ? '♫' : '♪'}
            </motion.span>
          ))}
      </AnimatePresence>

      {/* Dozing through a paused film. */}
      <AnimatePresence>
        {scene === 'dozing' && !upset && !reacting && (
          <motion.span
            key="zzz"
            aria-hidden
            className="pointer-events-none absolute right-[18%] top-[12%] text-[1.1rem] font-bold text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, -16], x: [0, 6] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeOut' }}
          >
            z
          </motion.span>
        )}
      </AnimatePresence>

      {/* Sulking: its own little rain cloud. */}
      <AnimatePresence>
        {sulking && (
          <motion.span
            key="cloud"
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[14%] -ml-4 text-[1.9rem]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }, opacity: { duration: 0.4 } }}
          >
            🌧️
          </motion.span>
        )}
      </AnimatePresence>

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
