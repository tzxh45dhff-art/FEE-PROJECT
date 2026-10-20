import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { LivePet } from '@/features/pet/LivePet'
import { PetSheet } from '@/features/pet/PetSheet'
import { playSqueaky, useMimic } from '@/features/pet/useMimic'
import { usePet } from '@/features/pet/usePet'
import type { Pet } from '@/features/pet/types'
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

export function PetCorner({ roomId, selfId, hidden }: { roomId: string; selfId: string | undefined; hidden: boolean }) {
  const pets = usePet(roomId)
  const [open, setOpen] = useState(false)
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
            className="pointer-events-auto absolute left-3 top-24 z-20 flex flex-col items-center sm:bottom-[5.6rem] sm:left-5 sm:top-auto"
          >
            {pets.pet ? (
              <>
                <LivePet
                  pet={pets.pet}
                  event={pets.event}
                  selfId={selfId}
                  mimic={mimic.mode}
                  level={level}
                  speaker={speaker}
                  className="h-36 w-32 sm:h-52 sm:w-48"
                  onTap={() => void pets.act('poke')}
                />
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="glass-pill-ink -mt-1 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.78rem] outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-signal"
                >
                  <span className="font-semibold text-chalk">{pets.pet.name}</span>
                  <span className={cn('text-[0.7rem]', pets.pet.mood === 'hungry' || pets.pet.mood === 'sad' ? 'text-signal-bright' : 'text-mist')}>
                    {MOOD_LINE[pets.pet.mood]}
                  </span>
                </button>
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
