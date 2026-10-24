import { AnimatePresence, motion } from 'framer-motion'

import type { PetSuggestion as Suggestion, SuggestAction } from '@/features/pet/usePet'
import { cn } from '@/lib/utils'

const LABEL: Record<Exclude<SuggestAction, 'none'>, string> = {
  games: 'Pick a game',
  watch: 'Open Watch',
  study: 'Study together',
  call: 'Open call',
  feed: 'Feed me',
  play: 'Play with me',
}

/**
 * Something the pet would like to say, with at most one thing to do about it.
 *
 * A speech bubble rather than a notification: it comes from the pet, it can be
 * waved off, and nothing happens unless you press the button.
 */
export function PetSuggestion({
  suggestion,
  name,
  placement,
  onAccept,
  onDismiss,
}: {
  suggestion: Suggestion | null
  name: string
  /** Above the pet, or below it where the pet sits at the top of the screen. */
  placement: 'above' | 'below' | 'responsive'
  onAccept: (action: SuggestAction) => void
  onDismiss: () => void
}) {
  return (
    <AnimatePresence>
      {suggestion && (
        <motion.div
          key={suggestion.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: placement === 'below' ? -8 : 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className={cn(
            'absolute left-0 z-30 w-[min(15rem,calc(100vw-1.5rem))] rounded-2xl bg-white p-3 text-[#2a1f2f] shadow-[0_14px_40px_-12px_rgba(0,0,0,.6)]',
            placement === 'above' && 'bottom-full mb-2',
            placement === 'below' && 'top-full mt-2',
            placement === 'responsive' && 'top-full mt-2 sm:bottom-full sm:top-auto sm:mb-2 sm:mt-0',
          )}
        >
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#2a1f2f]/45">{name}</p>
          <p className="mt-0.5 text-[0.84rem] font-semibold leading-snug">{suggestion.line}</p>
          <div className="mt-2.5 flex items-center gap-1.5">
            {suggestion.action !== 'none' && (
              <button
                type="button"
                onClick={() => onAccept(suggestion.action)}
                className="rounded-full bg-[#2a1f2f] px-3 py-1.5 text-[0.74rem] font-semibold text-white outline-none transition-transform hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                {LABEL[suggestion.action]}
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full px-2.5 py-1.5 text-[0.74rem] font-medium text-[#2a1f2f]/60 outline-none hover:bg-black/5 hover:text-[#2a1f2f] focus-visible:outline-2 focus-visible:outline-signal"
            >
              {suggestion.action === 'none' ? 'Aww' : 'Not now'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
