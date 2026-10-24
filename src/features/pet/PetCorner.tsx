import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { useMusic } from '@/features/music/MusicContext'
import { LivePet } from '@/features/pet/LivePet'
import { PetFeelings } from '@/features/pet/PetFeelings'
import { PetSheet } from '@/features/pet/PetSheet'
import { playSqueaky, useMimic } from '@/features/pet/useMimic'
import { usePet } from '@/features/pet/usePet'
import type { Pet } from '@/features/pet/types'
import { petCue, petWatching, usePetCues, usePetScene, type PetCue } from '@/features/pet/petCues'
import { PetSuggestion } from '@/features/pet/PetSuggestion'
import type { PetSuggestion as Suggestion, SuggestAction, SuggestMoment } from '@/features/pet/usePet'
import type { ChatMessage } from '@/features/room-panel/useChat'
import { cn } from '@/lib/utils'

/**
 * The room's pet, sitting in the corner of the room.
 *
 * Always there, always reacting — to you, to whoever else is in the room, to
 * the pointer moving past it. Tap it and it reacts; open its sheet to feed it,
 * play, or turn the microphone on and have it repeat you. A room without one
 * shows an egg instead.
 */

const MOOD_LINE: Record<Pet['mood'], string> = {
  hungry: 'hungry',
  sad: 'lonely',
  happy: 'happy',
  okay: 'content',
}

/** Where the companion sits in each activity, clear of that activity's own controls. */
const COMPANION_SPOT: Record<string, string> = {
  watch: 'bottom-[10rem] left-3 sm:bottom-[7.5rem] sm:left-5',
  music: 'bottom-[10rem] left-3 sm:bottom-[8rem] sm:left-5',
  games: 'bottom-20 left-3 sm:bottom-5 sm:left-5',
  study: 'bottom-3 left-3 sm:bottom-5 sm:left-5',
}

const FACE: Record<Pet['species'], string> = { cat: '🐱', pup: '🐶', bunny: '🐰', panda: '🐼' }

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function PetCorner({
  roomId,
  selfId,
  activity,
  messages,
  onCall,
  onSuggest,
}: {
  roomId: string
  selfId: string | undefined
  /** The activity on screen, if any: the pet comes along as a small companion. */
  activity: string | null
  messages: ChatMessage[]
  onCall: boolean
  /** Carry out what the pet suggested, for the things outside the pet itself. */
  onSuggest: (action: 'games' | 'watch' | 'study' | 'call' | 'music') => void
}) {
  const hidden = activity !== null
  const pets = usePet(roomId)
  const [open, setOpen] = useState(false)

  /*
   * What is going on around it, from any activity, at a pace it can keep up
   * with: one reaction every few seconds, except the big moments.
   */
  const [cue, setCue] = useState<PetCue | null>(null)
  const lastCue = useRef(0)
  usePetCues((next) => {
    const now = Date.now()
    const big = next.kind === 'win' || next.kind === 'lose' || next.kind === 'break'
    if (!big && now - lastCue.current < 3000) return
    lastCue.current = now
    setCue(next)
    /* After a game or at a study break, it may have an idea — a moment later, once the cheering is over. */
    if (next.kind === 'win' || next.kind === 'lose') window.setTimeout(() => ask.current('gameover', next.kind as 'win' | 'lose'), 7000)
    if (next.kind === 'break') window.setTimeout(() => ask.current('break'), 4000)
  })
  const scene = usePetScene()

  /*
   * The room's music, read from the shared session (never driven from here):
   * it bobs along while something plays and notices when the song changes.
   */
  const music = useMusic()
  const track = music.snapshot?.track ?? null
  const dancing = !!track && !!music.snapshot?.playing
  const lastTrack = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    const id = track?.id ?? null
    const was = lastTrack.current
    lastTrack.current = id
    if (was !== undefined && id && id !== was && dancing) petCue('tune', track?.artist ?? undefined)
  }, [track?.id, track?.artist, dancing])
  const listening = dancing && track ? `${track.title}${track.artist ? ` by ${track.artist}` : ''}` : null

  /* The room's chat: it laughs along, goes soft at hearts, and answers to its name. */
  const mountedAt = useRef(Date.now())
  const heard = useRef<string | null>(null)
  const petName = pets.pet?.name ?? null
  useEffect(() => {
    const latest = messages.at(-1)
    if (!latest || latest.id === heard.current || Date.parse(latest.createdAt) < mountedAt.current - 2000) return
    heard.current = latest.id
    const text = latest.body
    const who = latest.author.name
    if (petName && new RegExp(`(^|[^\\p{L}])${escapeRegExp(petName)}([^\\p{L}]|$)`, 'iu').test(text) && !/\bsorry\b/i.test(text)) petCue('hello', who)
    else if (/😂|🤣|💀|\b(lol+|lmao+|haha+|hehe+)\b/i.test(text)) petCue('laugh', who)
    else if (/❤️|😍|🥰|💗|💕/.test(text)) petCue('love', who)
    else if (/😭|😢|🥺/.test(text)) petCue('aww', who)
  }, [messages, petName])

  /* Tucked away by choice, on this device. */
  const [tucked, setTucked] = useState(() => {
    try {
      return localStorage.getItem('huddle.petTucked') === '1'
    } catch {
      return false
    }
  })
  const tuck = (value: boolean) => {
    setTucked(value)
    try {
      localStorage.setItem('huddle.petTucked', value ? '1' : '0')
    } catch {
      /* Not remembered; still tucked for now. */
    }
  }
  const spot = activity ? COMPANION_SPOT[activity] : undefined

  /*
   * Suggestions, in its own words (written by the model on the server).
   *
   * Asked for only at natural moments — walking in, coming back to the hub,
   * a few quiet minutes, after a game, a long pause in a film, a study break —
   * and never mid-round or mid-focus. Waving one off makes it wait longer
   * next time; taking one up resets that. The server holds the room to one
   * line every few minutes whoever asks, so this can't run up a bill.
   */
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const askedAt = useRef(0)
  const patience = useRef(4 * 60_000)
  const sheetOpen = useRef(false)
  sheetOpen.current = open
  const now = useRef({ activity, onCall, scene, tucked, listening, pet: pets.pet, suggest: pets.suggest })
  now.current = { activity, onCall, scene, tucked, listening, pet: pets.pet, suggest: pets.suggest }
  const ask = useRef(async (_moment: SuggestMoment, _result: 'win' | 'lose' | null = null) => {})
  ask.current = async (moment, result = null) => {
    const c = now.current
    if (!c.pet || c.pet.pose !== 'normal' || sheetOpen.current || document.hidden || c.scene === 'focus') return
    if (c.activity && (c.tucked || !COMPANION_SPOT[c.activity])) return
    /* The big moments only need a short breather; anything else waits its turn. */
    const wait = moment === 'gameover' || moment === 'break' ? 90_000 : patience.current
    if (Date.now() - askedAt.current < wait) return
    askedAt.current = Date.now()
    const line = await c.suggest({
      moment,
      activity: c.activity ?? 'hub',
      hour: new Date().getHours(),
      onCall: c.onCall,
      watching: c.activity === 'watch' ? petWatching() : null,
      listening: c.listening,
      result,
    })
    if (line) setSuggestion(line)
  }

  /* Walking in, and coming back to the hub from an activity. */
  const previousActivity = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    const was = previousActivity.current
    previousActivity.current = activity
    if (activity !== null) return
    const moment: SuggestMoment = was === undefined ? 'arrived' : 'back'
    const timer = window.setTimeout(() => ask.current(moment), moment === 'arrived' ? 25_000 : 12_000)
    return () => window.clearTimeout(timer)
  }, [activity])

  /* A few quiet minutes in the hub. */
  useEffect(() => {
    if (activity !== null) return
    const timer = window.setInterval(() => ask.current('idle'), 60_000)
    return () => window.clearInterval(timer)
  }, [activity])

  /* The film has been paused long enough for it to doze off. */
  useEffect(() => {
    if (scene === 'dozing') void ask.current('paused')
  }, [scene])

  /* A suggestion nobody answered fades on its own, and counts as a soft no. */
  useEffect(() => {
    if (!suggestion) return
    const timer = window.setTimeout(() => {
      setSuggestion(null)
      patience.current = Math.min(40 * 60_000, patience.current * 1.5)
    }, 25_000)
    return () => window.clearTimeout(timer)
  }, [suggestion])

  const accept = (action: SuggestAction) => {
    setSuggestion(null)
    patience.current = 4 * 60_000
    if (action === 'feed') setOpen(true)
    else if (action === 'play') void pets.act('play')
    else if (action !== 'none') onSuggest(action)
  }
  const dismiss = () => {
    setSuggestion(null)
    patience.current = Math.min(40 * 60_000, patience.current * 2)
  }
  const [level, setLevel] = useState(0)
  const [speaker, setSpeaker] = useState<string | null>(null)
  const mimic = useMimic({
    onClip: (blob) => {
      void pets.sendVoice(blob)
      void pets.act('talk')
    },
    onLevel: setLevel,
  })

  /* Someone else talked to it: say it back here too. */
  const playing = useRef(false)
  const hiddenRef = useRef(hidden)
  hiddenRef.current = hidden
  useEffect(() => {
    const clip = pets.voice
    /* Not over a film or a song — only when the pet is actually in view. */
    if (!clip || playing.current || hiddenRef.current) return
    playing.current = true
    setSpeaker(clip.by.name)
    void playSqueaky(clip.blob, setLevel).finally(() => {
      playing.current = false
      setSpeaker(null)
    })
  }, [pets.voice])

  /* The microphone is only for the sheet; closing it, or leaving, turns it off. */
  const stopMimic = mimic.stop
  useEffect(() => {
    if (!open) stopMimic()
  }, [open, stopMimic])

  if (!pets.loaded) return null

  return (
    <>
      <AnimatePresence>
        {!hidden && (
          <motion.div
            key="corner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            data-pet-corner
            className="pointer-events-auto absolute left-2 top-4 z-20 flex w-[11.5rem] flex-col items-center sm:bottom-3 sm:left-3 sm:top-auto md:left-5"
          >
            {pets.pet ? (
              <>
                <PetSuggestion suggestion={hidden ? null : suggestion} name={pets.pet.name} placement="responsive" onAccept={accept} onDismiss={dismiss} />
                <LivePet
                  pet={pets.pet}
                  event={pets.event}
                  selfId={selfId}
                  mimic={mimic.mode}
                  level={level}
                  speaker={speaker}
                  className="h-28 w-24 sm:h-52 sm:w-48 sm:[@media(max-height:760px)]:h-40 sm:[@media(max-height:760px)]:w-36"
                  onTap={() => void pets.act('poke')}
                  onStroke={() => void pets.act('pet')}
                  cue={cue}
                  scene={scene}
                  dancing={dancing}
                />
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="glass-pill-ink -mt-1 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.78rem] outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-signal"
                >
                  <span className="font-semibold text-chalk">{pets.pet.name}</span>
                  <span className={cn('text-[0.7rem]', pets.pet.mood === 'hungry' || pets.pet.mood === 'sad' ? 'text-signal-bright' : 'text-mist')}>
                    {pets.pet.pose === 'away' ? 'away' : pets.pet.pose === 'corner' ? 'sulking' : MOOD_LINE[pets.pet.mood]}
                  </span>
                </button>
                <PetFeelings pet={pets.pet} selfId={selfId} onSorry={() => void pets.act('sorry')} compact />
              </>
            ) : (
              <button type="button" onClick={() => setOpen(true)} className="group flex flex-col items-center outline-none" aria-label="Adopt a room pet">
                <Egg />
                <span className="glass-pill-ink -mt-1 rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold text-chalk transition-transform group-hover:scale-[1.04]">
                  Adopt a pet
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        The companion: the same pet, smaller, along for whatever you are doing.
        Portalled, so it sits above the activity's stage (135) and under the
        room panel (138), which can cover it.
      */}
      {createPortal(
        <AnimatePresence>
          {spot && pets.pet && (
            <motion.div
              key="companion"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className={cn('fixed z-[136] flex flex-col items-center', spot)}
            >
              {tucked ? (
                <button
                  type="button"
                  onClick={() => tuck(false)}
                  aria-label={`Bring ${pets.pet.name} back`}
                  title={`Bring ${pets.pet.name} back`}
                  className="glass-pill-ink grid size-11 place-items-center rounded-full text-[1.3rem] outline-none transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-signal"
                >
                  {FACE[pets.pet.species]}
                </button>
              ) : (
                <>
                  <PetSuggestion suggestion={suggestion} name={pets.pet.name} placement="above" onAccept={accept} onDismiss={dismiss} />
                  <LivePet
                    pet={pets.pet}
                    event={pets.event}
                    selfId={selfId}
                    mimic={mimic.mode}
                    level={level}
                    speaker={speaker}
                    className="h-24 w-20 sm:h-32 sm:w-28"
                    onTap={() => void pets.act('poke')}
                    onStroke={() => void pets.act('pet')}
                    cue={cue}
                    scene={scene}
                    dancing={dancing}
                  />
                  <div className="-mt-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="glass-pill-ink rounded-full px-2.5 py-1 text-[0.7rem] font-semibold text-chalk outline-none transition-transform hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-signal"
                    >
                      {pets.pet.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => tuck(true)}
                      aria-label={`Tuck ${pets.pet.name} away`}
                      title={`Tuck ${pets.pet.name} away`}
                      className="glass-pill-ink grid size-6 place-items-center rounded-full text-[0.8rem] leading-none text-mist outline-none hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
                    >
                      –
                    </button>
                  </div>
                  <PetFeelings pet={pets.pet} selfId={selfId} onSorry={() => void pets.act('sorry')} compact />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <AnimatePresence>
        {open && (
          <PetSheet
            key="sheet"
            pets={pets}
            selfId={selfId}
            mimic={mimic}
            level={level}
            speaker={speaker}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/** An egg that can't keep still. */
export function Egg({ className = 'h-32 w-28' }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 120 140"
      className={className}
      aria-hidden
      animate={{ rotate: [0, -6, 5, -3, 0, 0, 0, 0] }}
      transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
      style={{ originX: 0.5, originY: 1 }}
    >
      <defs>
        <radialGradient id="egg-shell" cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fffaf2" />
          <stop offset="70%" stopColor="#f3e3cf" />
          <stop offset="100%" stopColor="#d6bfa3" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="132" rx="34" ry="6" fill="black" opacity="0.3" />
      <path d="M60 8 C 92 8 108 62 108 88 C 108 116 86 132 60 132 C 34 132 12 116 12 88 C 12 62 28 8 60 8 Z" fill="url(#egg-shell)" />
      <g fill="#f4a3b8" opacity="0.85">
        <circle cx="42" cy="58" r="7" />
        <circle cx="76" cy="44" r="5" />
        <circle cx="80" cy="92" r="8" />
        <circle cx="38" cy="100" r="5" />
        <circle cx="60" cy="76" r="4" />
      </g>
      <path d="M30 70 l10 -8 l8 8 l10 -9 l10 9 l9 -8 l12 9" fill="none" stroke="#c9ad8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </motion.svg>
  )
}
