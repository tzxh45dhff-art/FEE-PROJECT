import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

import { Eyebrow } from '@/features/landing/components/ScrollRow'
import { ROOM_TYPES, type RoomType } from '@/data/rooms'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

function RoomCard({ room }: { room: RoomType }) {
  return (
    <article
      tabIndex={0}
      aria-label={`${room.name} room`}
      className={[
        'group relative aspect-[3/4] overflow-hidden rounded-card ring-1 ring-inset ring-white/[0.08]',
        'transition-all duration-500 ease-glass will-change-transform',
        'hover:-translate-y-2 hover:ring-signal/45',
        'hover:shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--color-red)_55%,transparent)]',
        'focus-visible:-translate-y-2',
      ].join(' ')}
      style={{ backgroundImage: `linear-gradient(160deg, ${room.from}, ${room.to})` }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(110% 70% at 26% 8%, ${room.glow}55, transparent 62%)`,
        }}
      />
      <div className="grain absolute inset-0 opacity-[0.13] mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-void/92 via-void/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-base font-semibold tracking-[-0.015em] text-chalk">
          {room.name}
        </h3>
        <p className="mt-1.5 text-[0.76rem] leading-relaxed text-mist/85">{room.description}</p>
      </div>
    </article>
  )
}

const ALSO_INSIDE = [
  ['Chat', 'Always open beside whatever else is running — never a separate window.'],
  ['Leaderboard', 'Every game, every session, one running scoreboard for the room.'],
  ['Presence', 'You can see who is actually here, because they are actually here.'],
]

export function InfoSection() {
  const section = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const headingY = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])

  return (
    <section
      ref={section}
      id="rooms"
      className="relative overflow-hidden px-6 py-28 md:px-10 md:py-36"
    >
      <div className="relative mx-auto max-w-6xl">
        <motion.div className="max-w-2xl" style={reduced ? undefined : { y: headingY }}>
          <Eyebrow>Room types</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-chalk">
            A room that fits who’s in it
          </h2>
          <p className="mt-5 text-base leading-relaxed text-mist">
            Pick a type when you create it and SyncRoom sets the mood — who’s in control, what’s
            front and centre, how it feels to be there. Change it anytime.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {ROOM_TYPES.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        <div className="mt-20 border-t border-white/[0.07] pt-12">
          <Eyebrow>Also in every room</Eyebrow>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {ALSO_INSIDE.map(([title, body]) => (
              <div key={title}>
                <div className="flex items-center gap-2.5">
                  <span className="size-1.5 rounded-full bg-signal" />
                  <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-chalk">
                    {title}
                  </h3>
                </div>
                <p className="mt-2.5 text-[0.9rem] leading-relaxed text-mist">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
