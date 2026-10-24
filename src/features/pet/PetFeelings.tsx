import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import type { Pet } from '@/features/pet/types'
import { cn } from '@/lib/utils'

/**
 * What the pet feels about the person looking at it, in words.
 *
 * Personal on purpose: the one it is upset with gets "say sorry" and then a
 * little meter of making up; everyone else just sees what is going on and
 * who caused it. Nothing here for a pet with nothing on its mind.
 */
export function PetFeelings({
  pet,
  selfId,
  onSorry,
  compact = false,
}: {
  pet: Pet
  selfId: string | undefined
  onSorry: () => void
  compact?: boolean
}) {
  const mine = pet.grudges.find((g) => g.id === selfId)
  const first = (name: string) => name.split(' ')[0] ?? name
  const [, tick] = useState(0)

  /* "Back in 12 min" counts down while it is open. */
  useEffect(() => {
    if (!pet.away) return
    const timer = window.setInterval(() => tick((n) => n + 1), 30_000)
    return () => window.clearInterval(timer)
  }, [pet.away])

  let note: { key: string; text: string; sorry?: boolean; progress?: { have: number; need: number } } | null = null
  if (pet.away) {
    const minutes = Math.max(1, Math.ceil((pet.away.until - Date.now()) / 60_000))
    note =
      pet.away.because.id === selfId
        ? { key: 'away-me', text: `${pet.name} left because of you. Back in ${minutes} min — or say sorry.`, sorry: true }
        : { key: 'away', text: `${pet.name} needs some space after ${first(pet.away.because.name)}. Back in ${minutes} min.` }
  } else if (mine && mine.level !== 'wary') {
    note = mine.sorry
      ? { key: 'amends', text: `Making up with ${pet.name} — stroke it, feed it`, progress: { have: Math.min(mine.amends, mine.need), need: mine.need } }
      : { key: 'upset', text: `${pet.name} is upset with you`, sorry: true }
  } else if (pet.pose === 'corner') {
    const who = pet.grudges[0]
    note = { key: 'corner', text: `${pet.name} is sulking${who ? ` — ${first(who.name)} upset it` : ''}. Be gentle.` }
  }

  return (
    <AnimatePresence mode="popLayout">
      {note && (
        <motion.div
          key={note.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          role="status"
          className={cn(
            'glass-pill-ink flex flex-col items-center gap-1.5 rounded-2xl text-center',
            compact ? 'mt-1.5 max-w-[11.5rem] px-3 py-2 text-[0.7rem]' : 'mt-3 max-w-xs px-4 py-2.5 text-[0.8rem]',
          )}
        >
          <span className="leading-snug text-mist">{note.text}</span>
          {note.progress && (
            <span className="flex gap-1" aria-label={`${note.progress.have} of ${note.progress.need}`}>
              {Array.from({ length: note.progress.need }, (_, i) => (
                <span key={i} className={cn('transition-opacity', i < note.progress!.have ? 'opacity-100' : 'opacity-25')}>
                  💗
                </span>
              ))}
            </span>
          )}
          {note.sorry && (
            <button
              type="button"
              onClick={onSorry}
              className={cn(
                'rounded-full bg-chalk font-semibold text-void outline-none transition-transform hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                compact ? 'px-3 py-1 text-[0.7rem]' : 'px-4 py-1.5 text-[0.78rem]',
              )}
            >
              Say sorry 🥺
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
