import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type RailItem = {
  key: string
  label: string
  hint?: string
  icon: LucideIcon
  onClick: () => void
  active?: boolean
  /** Leaving a room is destructive-ish; it should not look like the others. */
  danger?: boolean
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * A rail of controls down one edge of the hub.
 *
 * Frosted rather than filled on purpose: these sit over live artwork, and a
 * solid button would punch a hole in the scene. The blur keeps the background
 * readable through the control while the hairline edge and the top-edge
 * highlight are what make it legible against both bright sky and dark water.
 */
export function HubRail({
  side,
  items,
  className,
}: {
  side: 'left' | 'right'
  items: RailItem[]
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <motion.nav
      className={cn(
        'pointer-events-auto absolute top-1/2 z-20 flex w-[15.5rem] max-w-[42vw] -translate-y-1/2 flex-col gap-3',
        side === 'left' ? 'left-4 md:left-8' : 'right-4 items-end md:right-8',
        className,
      )}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
      }}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <motion.button
            key={item.key}
            type="button"
            onClick={item.onClick}
            aria-pressed={item.active ? true : undefined}
            variants={{
              hidden: { opacity: 0, x: side === 'left' ? -28 : 28, filter: 'blur(8px)' },
              visible: {
                opacity: 1,
                x: 0,
                filter: 'blur(0px)',
                transition: { duration: 0.7, ease: EASE },
              },
            }}
            /* Nudged into the screen rather than scaled up — a control on an
               edge should feel like it slides out to meet you. */
            whileHover={{ x: side === 'left' ? 6 : -6 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={cn(
              'group/rail flex w-full items-center gap-3 rounded-card px-4 py-3 text-left outline-none',
              /*
               * Frosted over a *dark scrim*, not clear glass. Clear glass is
               * only legible over bright artwork — it vanishes against dark
               * water or a night sky, and these backdrops are photographs with
               * both in the same frame. The scrim is what guarantees white text
               * reads anywhere the scene puts it.
               */
              'border border-white/20 bg-black/30 backdrop-blur-xl backdrop-saturate-150',
              'shadow-[inset_0_1px_0_0_rgb(255_255_255/0.22),0_14px_40px_-18px_rgb(0_0_0/0.85)]',
              'transition-[box-shadow,border-color,background-color] duration-500 ease-glass',
              'hover:border-white/35 hover:bg-black/40 hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.28),0_20px_50px_-22px_rgb(0_0_0/0.9)]',
              'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal',
              item.active && 'border-signal/50 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-signal)_35%,transparent)]',
              item.danger && 'hover:border-signal/55',
            )}
          >
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-chalk ring-1 ring-inset ring-white/15',
                'transition-colors duration-500',
                item.active && 'bg-signal/25 text-white ring-signal/40',
                item.danger && 'group-hover/rail:bg-signal/25 group-hover/rail:text-white',
              )}
            >
              <Icon aria-hidden className="size-[1.05rem]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-[0.95rem] font-semibold tracking-[-0.015em] text-chalk">
                {item.label}
              </span>
              {item.hint && (
                <span className="block truncate text-[0.72rem] text-mist">{item.hint}</span>
              )}
            </span>
          </motion.button>
        )
      })}
    </motion.nav>
  )
}
