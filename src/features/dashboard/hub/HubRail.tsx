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
  /** Something is happening in here right now, even if you aren't in it. */
  live?: boolean
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
  insetRight = 0,
}: {
  side: 'left' | 'right'
  items: RailItem[]
  className?: string
  /** Rem the side panel occupies. The right rail slides in front of it. */
  insetRight?: number
}) {
  if (items.length === 0) return null

  return (
    <motion.nav
      className={cn(
        'pointer-events-auto absolute top-1/2 z-20 flex w-[15.5rem] max-w-[42vw] flex-col gap-3',
        'transition-[right] duration-500 ease-glass',
        side === 'left' ? 'left-4 md:left-8' : 'items-end',
        className,
      )}
      style={
        side === 'right'
          ? { right: `calc(${insetRight}rem + 1rem)`, translate: '0 -50%' }
          : { translate: '0 -50%' }
      }
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
              'liquid-btn is-scrim',
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
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate font-display text-[0.95rem] font-semibold tracking-[-0.015em] text-chalk">
                  {item.label}
                </span>
                {item.live && (
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 animate-signal-pulse rounded-full bg-emerald-400"
                  />
                )}
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
