import { motion, useScroll, useTransform } from 'framer-motion'

import { Button } from '@/components/ui/button'
import type { Room } from '@/features/rooms/api'
import { roomStyle } from '@/features/rooms/roomStyle'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

function initials(name: string) {
  return name.slice(0, 1).toUpperCase()
}

/**
 * The dashboard's centrepiece: the room you were in most recently, with who is
 * in it right now. `online` comes from the live presence socket, not the DB.
 */
export function LiveRoomCard({ room }: { room: Room }) {
  const reduced = usePrefersReducedMotion()
  const { scrollY } = useScroll()

  /* Driven off the window rather than a measured target, so it can't go stale
     the way a `useScroll({ target })` measurement can. */
  const y = useTransform(scrollY, [0, 700], ['0%', '-12%'])
  const opacity = useTransform(scrollY, [0, 600], [1, 0.35])

  const art = roomStyle(room.type)
  const online = room.members.filter((member) => room.online.includes(member.id))
  const isLive = online.length > 0

  return (
    <motion.div
      className="relative"
      style={reduced ? undefined : { y, opacity }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] blur-[80px]"
        style={{ background: `radial-gradient(circle at 30% 40%, ${art.glow}44, transparent 70%)` }}
      />

      <div className="screen-panel overflow-hidden rounded-panel">
        <div className="relative aspect-[16/7] overflow-hidden sm:aspect-[16/6]">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `linear-gradient(150deg, ${art.from}, ${art.to})` }}
          />
          <div className="grain absolute inset-0 opacity-[0.14] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 md:p-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 backdrop-blur-sm">
              <span
                className={
                  isLive
                    ? 'size-1.5 animate-signal-pulse rounded-full bg-signal'
                    : 'size-1.5 rounded-full bg-white/30'
                }
              />
              <span className="text-[0.68rem] font-medium tracking-wide text-chalk">
                {isLive ? `${online.length} IN THE ROOM` : 'QUIET RIGHT NOW'}
              </span>
            </span>
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.68rem] text-mist backdrop-blur-sm">
              {art.name}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-5 p-5 md:p-7">
            <div className="min-w-0">
              <h2 className="font-display text-[clamp(1.6rem,4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-chalk">
                {room.name}
              </h2>
              <p className="mt-2 font-mono text-[0.72rem] text-mist">syncroom.app/r/{room.slug}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {room.members.slice(0, 5).map((member) => {
                  const isOnline = room.online.includes(member.id)
                  return (
                    <span
                      key={member.id}
                      title={`${member.name}${isOnline ? ' — in the room' : ''}`}
                      className={[
                        'grid size-9 place-items-center rounded-full text-[0.72rem] font-semibold text-chalk ring-2',
                        isOnline ? 'ring-signal' : 'ring-void/80 opacity-60',
                      ].join(' ')}
                      style={{ backgroundImage: `linear-gradient(150deg, ${art.glow}, ${art.from})` }}
                    >
                      {initials(member.name)}
                    </span>
                  )
                })}
              </div>
              <Button size="lg">Walk back in</Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
