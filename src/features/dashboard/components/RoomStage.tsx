import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Room } from '@/features/rooms/api'
import { roomStyle } from '@/features/rooms/roomStyle'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The room card, opened out.
 *
 * It shares `layoutId` with the card in the grid, so Framer morphs the actual
 * element rather than cross-fading two of them — the card *becomes* the page.
 *
 * The shape and the contents are deliberately on separate timelines: the box
 * resizes first and the inner copy fades in a beat behind it. Animating both
 * together is what makes shared-element transitions look stretched.
 */
export function RoomStage({ room, onClose }: { room: Room; onClose: () => void }) {
  const art = roomStyle(room.type)
  const online = room.members.filter((member) => room.online.includes(member.id))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    // The page behind must not scroll while the stage is open.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4 md:p-8">
      <motion.button
        type="button"
        aria-label="Close room"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-void/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      />

      <motion.div
        layoutId={`room-${room.id}`}
        className="relative w-full max-w-4xl overflow-hidden rounded-panel ring-1 ring-inset ring-white/[0.1]"
        style={{ backgroundImage: `linear-gradient(160deg, ${art.from}, ${art.to})` }}
        transition={{ duration: 0.62, ease: EASE }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(90% 60% at 26% 8%, ${art.glow}55, transparent 62%)`,
          }}
        />
        <div className="grain absolute inset-0 opacity-[0.13] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/45 to-transparent" />

        <motion.div
          className="relative flex min-h-[26rem] flex-col justify-end p-6 md:min-h-[32rem] md:p-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          /* Held back so the box has finished resizing before copy appears. */
          transition={{ duration: 0.45, ease: EASE, delay: 0.22 }}
        >
          <div className="absolute right-5 top-5 md:right-7 md:top-7">
            <Button variant="outline" size="icon" onClick={onClose} aria-label="Close" plain>
              <X aria-hidden />
            </Button>
          </div>

          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-mist/80">{art.name}</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-chalk">
            {room.name}
          </h2>
          <p className="mt-3 font-mono text-[0.78rem] text-mist">syncroom.app/r/{room.slug}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-dusk">In the room</p>
              <p className="mt-1.5 font-display text-2xl font-semibold text-chalk">
                {online.length}
                <span className="ml-1 text-base font-normal text-mist">
                  / {room.members.length}
                </span>
              </p>
            </div>

            <div className="flex -space-x-2">
              {room.members.slice(0, 6).map((member) => (
                <span
                  key={member.id}
                  title={member.name}
                  className={[
                    'grid size-10 place-items-center rounded-full text-[0.8rem] font-semibold text-chalk ring-2',
                    room.online.includes(member.id) ? 'ring-signal' : 'ring-void/70 opacity-55',
                  ].join(' ')}
                  style={{ backgroundImage: `linear-gradient(150deg, ${art.glow}, ${art.from})` }}
                >
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
              ))}
            </div>

            <Button size="lg" className="ml-auto">
              Walk in
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
