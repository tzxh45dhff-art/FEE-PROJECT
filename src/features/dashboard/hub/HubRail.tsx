import { motion } from 'framer-motion'
import { ChevronsLeft, ChevronsRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type RailItem = {
  key: string
  label: string
  /** For the folded rail, where a label sits under a 48px button. */
  short?: string
  hint?: string
  icon: LucideIcon
  /** Given this control's box, so a screen can open *from* where it sits. */
  onClick: (from?: DOMRect) => void
  active?: boolean
  /** Something is happening in here right now, even if you aren't in it. */
  live?: boolean
  /** Leaving a room is destructive-ish; it should not look like the others. */
  danger?: boolean
  /** A count worth showing on the button itself — unread messages. */
  badge?: number
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
  compact = [],
  collapsed = false,
  onToggleCollapsed,
  className,
  insetRight = 0,
}: {
  side: 'left' | 'right'
  items: RailItem[]
  /**
   * Things you need now and then rather than every visit — switching room,
   * settings, leaving. Shown as one row of small round buttons under the big
   * ones, so the rail reads as "the one thing you came to do" plus a tray,
   * not a column of equally loud choices.
   */
  compact?: RailItem[]
  /**
   * Icons with a short label under each, instead of full tiles. For screens
   * where two columns of tiles would cover the people standing between them.
   */
  collapsed?: boolean
  /** Given, a small toggle at the end of the rail switches between the two. */
  onToggleCollapsed?: () => void
  className?: string
  /** Rem the side panel occupies. The right rail slides in front of it. */
  insetRight?: number
}) {
  if (items.length === 0 && compact.length === 0) return null

  if (collapsed) {
    return <SlimRail side={side} items={[...items, ...compact]} insetRight={insetRight} onExpand={onToggleCollapsed} className={className} />
  }

  return (
    <motion.nav
      className={cn(
        /*
         * Two rails face each other across the scene, so each can only ever
         * have somewhat under half the width — which on a phone is about 150px,
         * and after the icon and padding leaves barely enough for a word. The
         * cap is loosened a little there and the labels below are allowed to
         * wrap rather than truncate, which is what actually buys the room.
         */
        /*
         * Lower on a phone. Centred vertically the two rails meet in the
         * middle of the screen, which on a narrow one is exactly where the
         * character's head and chest are — the thing the hub is built to
         * show. Dropping them towards the legs keeps the figure readable
         * without moving the controls out of thumb reach.
         */
        'pointer-events-auto absolute top-[62%] z-20 flex w-[15.5rem] max-w-[46vw] flex-col gap-2.5 sm:top-1/2',
        'sm:max-w-[42vw] sm:gap-3',
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
            onClick={(event) => item.onClick(event.currentTarget.getBoundingClientRect())}
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
              'group/rail flex w-full items-center gap-2.5 rounded-card px-3 py-2.5 text-left outline-none',
              'sm:gap-3 sm:px-4 sm:py-3',
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
                'grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-chalk ring-1 ring-inset ring-white/15 sm:size-9',
                'transition-colors duration-500',
                item.active && 'bg-signal/25 text-white ring-signal/40',
                item.danger && 'group-hover/rail:bg-signal/25 group-hover/rail:text-white',
              )}
            >
              <Icon aria-hidden className="size-[1.05rem]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                {/* Wraps on a phone, truncates once there's width for one
                    line. "Create a room" over two lines still says what it
                    does; "Create …" does not. */}
                <span className="font-display text-[0.9rem] font-semibold leading-tight tracking-[-0.015em] text-chalk sm:truncate sm:text-[0.95rem]">
                  {item.label}
                </span>
                {item.live && (
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 animate-signal-pulse rounded-full bg-emerald-400"
                  />
                )}
              </span>
              {/* The hint is a nicety, and on a phone it only ever rendered as
                  a cut-off fragment — "Start your o…" tells you less than the
                  space it costs the label above it. */}
              {item.hint && (
                <span className="hidden truncate text-[0.72rem] text-mist sm:block">
                  {item.hint}
                </span>
              )}
            </span>
          </motion.button>
        )
      })}

      {onToggleCollapsed && (
        <motion.button
          type="button"
          onClick={onToggleCollapsed}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="liquid-btn is-scrim flex w-max items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold text-mist outline-none transition-colors hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
        >
          <ChevronsLeft aria-hidden className="size-3.5" /> Less
        </motion.button>
      )}

      {compact.length > 0 && (
        <motion.div
          className={cn('flex gap-2 pt-1', side === 'right' ? 'justify-end' : 'justify-start')}
          variants={{
            hidden: { opacity: 0, y: 10, filter: 'blur(6px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
          }}
        >
          {compact.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                onClick={(event) => item.onClick(event.currentTarget.getBoundingClientRect())}
                aria-label={item.hint ? `${item.label} — ${item.hint}` : item.label}
                className={cn(
                  'group/mini liquid-btn is-scrim relative grid size-11 place-items-center rounded-full outline-none transition-transform duration-300 hover:-translate-y-0.5 active:scale-95',
                  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal',
                  item.danger && 'hover:border-signal/55',
                )}
              >
                <Icon aria-hidden className={cn('size-[1.05rem] text-chalk transition-colors', item.danger && 'group-hover/mini:text-signal-bright')} />
                {/* A label on hover and focus — an icon alone is a guess. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-[calc(100%+0.5rem)] whitespace-nowrap rounded-full bg-black/75 px-2.5 py-1 text-[0.7rem] font-medium text-chalk opacity-0 backdrop-blur-md transition-[opacity,transform] duration-200 group-hover/mini:translate-y-0 group-hover/mini:opacity-100 group-focus-visible/mini:opacity-100 -translate-y-1"
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </motion.div>
      )}
    </motion.nav>
  )
}

/**
 * The rail, folded down to icons.
 *
 * Each control keeps its label — a row of bare icons asks people to guess —
 * but the label sits small under a round button rather than beside it, so a
 * column is the width of one button instead of a third of the screen. Same
 * frosted scrim as the tiles, so it is the same control, just smaller.
 */
function SlimRail({
  side,
  items,
  insetRight,
  onExpand,
  className,
}: {
  side: 'left' | 'right'
  items: RailItem[]
  insetRight: number
  onExpand?: () => void
  className?: string
}) {
  return (
    <motion.nav
      className={cn(
        'pointer-events-auto absolute top-[56%] z-20 flex w-[4.5rem] flex-col items-center gap-2 sm:top-1/2 sm:gap-2.5',
        'transition-[right] duration-500 ease-glass',
        side === 'left' ? 'left-1.5 sm:left-3' : '',
        className,
      )}
      style={side === 'right' ? { right: `calc(${insetRight}rem + 0.375rem)`, translate: '0 -50%' } : { translate: '0 -50%' }}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <motion.button
            key={item.key}
            type="button"
            onClick={(event) => item.onClick(event.currentTarget.getBoundingClientRect())}
            aria-pressed={item.active ? true : undefined}
            aria-label={item.hint ? `${item.label} — ${item.hint}` : item.label}
            variants={{
              hidden: { opacity: 0, x: side === 'left' ? -16 : 16, scale: 0.9 },
              visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
            }}
            whileTap={{ scale: 0.92 }}
            className="group/slim flex w-full flex-col items-center gap-1 rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <span
              className={cn(
                'liquid-btn is-scrim relative grid size-12 place-items-center rounded-full transition-transform duration-300 group-hover/slim:-translate-y-0.5',
                item.active && 'border-signal/60 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-signal)_40%,transparent)]',
              )}
            >
              <Icon aria-hidden className={cn('size-[1.15rem] text-chalk', item.danger && 'group-hover/slim:text-signal-bright')} />
              {item.live && <span aria-hidden className="absolute right-0.5 top-0.5 size-2 animate-signal-pulse rounded-full bg-emerald-400 ring-2 ring-black/50" />}
            </span>
            {/* Legible over bright sky and dark water alike. */}
            <span className="max-w-full truncate text-[0.66rem] font-semibold leading-none text-chalk [text-shadow:0_1px_6px_rgba(0,0,0,.9)]">
              {item.short ?? item.label}
            </span>
          </motion.button>
        )
      })}
      {onExpand && (
        <motion.button
          type="button"
          onClick={onExpand}
          aria-label="Show the full menu"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="liquid-btn is-scrim mt-1 grid size-8 place-items-center rounded-full text-mist outline-none transition-colors hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
        >
          <ChevronsRight aria-hidden className="size-3.5" />
        </motion.button>
      )}
    </motion.nav>
  )
}
