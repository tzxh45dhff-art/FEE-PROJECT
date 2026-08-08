import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const TRAFFIC_LIGHTS = ['#ff5f57', '#febc2e', '#28c840']

/** Sidebar geometry, in rem — the cursor targets are derived from it. */
const PAD = 0.75
const ITEM_H = 2.25
const GAP = 0.3
const CURSOR_X = 5.6

/** How long the cursor takes to reach its item before it "clicks". */
const TRAVEL_MS = 760

const EASE = [0.22, 1, 0.36, 1] as const

function Pointer() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 drop-shadow-[0_2px_4px_rgb(0_0_0/0.8)]">
      <path
        d="M5.5 3.2 19 12.4l-5.9.6-3 5.4z"
        fill="white"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export type DemoNavItem = { label: string; icon: ReactNode }

type DemoWindowProps = {
  url: string
  nav: DemoNavItem[]
  panel: ReactNode
  /** Which sidebar item this screen is showing. */
  activeIndex: number
  /** True once this screen is the one being read — runs the cursor. */
  awake?: boolean
  /** Skips the cursor entirely. */
  still?: boolean
  className?: string
}

/**
 * One dark glass window. When it becomes the active screen the cursor walks
 * over to its sidebar item and clicks, so each screen demonstrates itself
 * rather than sitting there as a static mock.
 */
export function DemoWindow({
  url,
  nav,
  panel,
  activeIndex,
  awake = false,
  still = false,
  className,
}: DemoWindowProps) {
  const [clicks, setClicks] = useState(0)

  useEffect(() => {
    if (!awake || still) return
    const id = window.setTimeout(() => setClicks((count) => count + 1), TRAVEL_MS)
    return () => window.clearTimeout(id)
  }, [awake, still])

  const targetTop = PAD + activeIndex * (ITEM_H + GAP) + ITEM_H / 2
  /* Parked out in the content area until this screen is the one being read. */
  const restingTop = PAD + nav.length * (ITEM_H + GAP) + 2.5

  return (
    <div className={cn('screen-panel overflow-hidden rounded-2xl', className)}>
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.03] px-4 py-3">
        <div className="flex gap-1.5">
          {TRAFFIC_LIGHTS.map((color) => (
            <span key={color} className="size-3 rounded-full" style={{ background: color }} />
          ))}
        </div>
        <div className="mx-auto flex max-w-[65%] items-center gap-1.5 truncate rounded-md bg-black/40 px-3 py-1">
          <svg viewBox="0 0 24 24" className="size-3 shrink-0 fill-none stroke-dusk stroke-[2.5]">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="truncate font-mono text-[0.68rem] text-dusk">{url}</span>
        </div>
        <div className="flex gap-1">
          <span className="size-1 rounded-full bg-white/15" />
          <span className="size-1 rounded-full bg-white/15" />
          <span className="size-1 rounded-full bg-white/15" />
        </div>
      </div>

      {/* Body */}
      <div className="relative grid aspect-[16/10] grid-cols-[7rem_1fr] sm:grid-cols-[10rem_1fr]">
        <aside
          className="relative flex flex-col border-r border-white/[0.06] bg-black/30"
          style={{ padding: `${PAD}rem`, gap: `${GAP}rem` }}
        >
          {nav.map((item, index) => {
            const isActive = index === activeIndex
            return (
              <div
                key={item.label}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-2.5 transition-colors duration-300',
                  isActive ? 'bg-white/[0.09]' : 'bg-transparent',
                )}
                style={{ height: `${ITEM_H}rem` }}
              >
                {isActive && (
                  <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-signal" />
                )}
                <span className={cn('shrink-0', isActive ? 'text-signal' : 'text-dusk')}>
                  {item.icon}
                </span>
                <span
                  className={cn(
                    'truncate text-[0.72rem] transition-colors duration-300 sm:text-[0.8rem]',
                    isActive ? 'text-chalk' : 'text-dusk',
                  )}
                >
                  {item.label}
                </span>
              </div>
            )
          })}

          <div className="mt-auto flex items-center gap-2 px-2.5">
            <span className="size-1.5 animate-signal-pulse rounded-full bg-signal" />
            <span className="text-[0.62rem] text-dusk">4 in room</span>
          </div>
        </aside>

        <main className="relative overflow-hidden bg-black/25">{panel}</main>

        {!still && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute z-30"
            initial={false}
            animate={{
              top: `${awake ? targetTop : restingTop}rem`,
              left: `${awake ? CURSOR_X : CURSOR_X + 5}rem`,
              opacity: awake ? 1 : 0.35,
            }}
            transition={{ duration: TRAVEL_MS / 1000, ease: EASE }}
          >
            <Pointer />
            {clicks > 0 && (
              <motion.span
                key={clicks}
                className="absolute -left-1 -top-1 block size-7 rounded-full border border-signal"
                initial={{ opacity: 0.85, scale: 0.25 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
