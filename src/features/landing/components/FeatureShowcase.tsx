import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Code2, Gamepad2, Music, Play } from 'lucide-react'

import { CodingPanel, GamesPanel, MoviesPanel, MusicPanel } from '@/features/landing/components/panels'
import { Eyebrow } from '@/features/landing/components/ScrollRow'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const ICON = 'size-5'

type Column = {
  id: string
  tab: string
  icon: ReactNode
  title: string
  body: string
  points: string[]
  panel: ReactNode
  tint: string
}

const COLUMNS: Column[] = [
  {
    id: 'watch',
    tab: 'Watch',
    icon: <Play className={ICON} />,
    title: 'Press play once. Everyone’s in.',
    body: 'Every screen in the room lands on the same second. Pause for snacks and four screens pause with you.',
    points: ['One playhead for the room', 'Anyone can pause or seek', 'Late joiners land in sync'],
    panel: <MoviesPanel />,
    tint: '#ff2f5e',
  },
  {
    id: 'music',
    tab: 'Music',
    icon: <Music className={ICON} />,
    title: 'A queue everyone can reach.',
    body: 'Not one person DJing at everybody else. Anyone adds, reorders or skips, and it lands everywhere at once.',
    points: ['Shared queue, reordered live', 'Skips hit every device', 'Still there tomorrow'],
    panel: <MusicPanel />,
    tint: '#a01aff',
  },
  {
    id: 'games',
    tab: 'Games',
    icon: <Gamepad2 className={ICON} />,
    title: 'Something to play while you talk.',
    body: 'Small enough to start without a conversation about starting, competitive enough to become the conversation.',
    points: ['One click in, no lobby', 'Leaderboard across sessions', 'Nobody leaves the room'],
    panel: <GamesPanel />,
    tint: '#2b6bff',
  },
  {
    id: 'code',
    tab: 'Code',
    icon: <Code2 className={ICON} />,
    title: 'One editor, two sets of hands.',
    body: 'A shared file with live cursors. Fix a typo mid-line and argue about spacing in the chat already open beside it.',
    points: ['Real cursors, per person', 'Shared files, no setup', 'Chat stays open alongside'],
    panel: <CodingPanel />,
    tint: '#26e6c8',
  },
]

/**
 * Four columns that trade space with each other.
 *
 * Hovering one grows it and shrinks its neighbours — flex-grow rather than
 * width, so the row always adds up to exactly full width and nothing reflows
 * outside the section. With nothing hovered every column sits equal.
 *
 * Below `lg` the trade makes no sense (there isn't the width to give away), so
 * the columns stack and all show their detail at once.
 */
export function FeatureShowcase() {
  const [active, setActive] = useState<string | null>(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduced = usePrefersReducedMotion()
  const interactive = isDesktop && !reduced

  return (
    <section id="features" className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <Eyebrow>Inside the room</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-chalk">
            Four things you do
            <span className="block text-mist">without leaving.</span>
          </h2>
        </div>

        <div className="mt-14 flex flex-col gap-3 md:mt-16 lg:h-[34rem] lg:flex-row">
          {COLUMNS.map((column) => {
            const isActive = active === column.id
            const isDimmed = active !== null && !isActive

            return (
              <motion.article
                key={column.id}
                data-cursor="card"
                tabIndex={0}
                aria-label={column.tab}
                onHoverStart={() => interactive && setActive(column.id)}
                onHoverEnd={() => interactive && setActive(null)}
                onFocus={() => interactive && setActive(column.id)}
                onBlur={() => interactive && setActive(null)}
                initial={false}
                /* flexGrow, not width — the row stays exactly full width no
                   matter which column is open. */
                animate={{
                  flexGrow: interactive ? (isActive ? 2.6 : isDimmed ? 0.8 : 1) : 1,
                }}
                transition={{ duration: 0.62, ease: EASE }}
                className={cn(
                  'group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-panel',
                  'ring-1 ring-inset ring-white/[0.09] outline-none lg:min-h-0 lg:basis-0',
                  'transition-shadow duration-500',
                )}
              >
                {/* Panel art, held back so it never fights the copy. */}
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-[linear-gradient(170deg,#141418,#08080b)]"
                />
                <motion.div
                  aria-hidden
                  className="absolute inset-x-0 top-0 -z-10 h-[58%] overflow-hidden"
                  initial={false}
                  animate={{ opacity: isActive ? 0.85 : 0.4, scale: isActive ? 1 : 1.06 }}
                  transition={{ duration: 0.62, ease: EASE }}
                >
                  {column.panel}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#08080b]" />
                </motion.div>

                <motion.div
                  aria-hidden
                  className="absolute inset-0 -z-10"
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.62, ease: EASE }}
                  style={{
                    background: `radial-gradient(80% 50% at 50% 100%, ${column.tint}33, transparent 70%)`,
                  }}
                />

                <div className="relative p-6 md:p-7">
                  <div className="flex items-center gap-3">
                    <span style={{ color: column.tint }}>{column.icon}</span>
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mist">
                      {column.tab}
                    </span>
                  </div>

                  <motion.h3
                    initial={false}
                    animate={{ fontSize: isActive && interactive ? '1.75rem' : '1.15rem' }}
                    transition={{ duration: 0.62, ease: EASE }}
                    className="mt-4 font-display font-semibold leading-[1.1] tracking-[-0.025em] text-chalk"
                  >
                    {column.title}
                  </motion.h3>

                  {/*
                    Detail is always in the DOM and always readable — only its
                    height is animated. Fading text in on hover would mean the
                    content is invisible to anyone not using a mouse.
                  */}
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: interactive ? (isActive ? 1 : 0) : 1,
                      height: interactive ? (isActive ? 'auto' : 0) : 'auto',
                    }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 max-w-md text-[0.92rem] leading-relaxed text-mist">
                      {column.body}
                    </p>
                    <ul className="mt-5 flex flex-col gap-2.5">
                      {column.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <span
                            className="mt-[0.42rem] size-1.5 shrink-0 rounded-full"
                            style={{ background: column.tint }}
                          />
                          <span className="text-[0.85rem] leading-relaxed text-mist">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
