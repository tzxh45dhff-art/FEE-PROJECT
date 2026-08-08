import { motion } from 'framer-motion'

import type { Room } from '@/features/rooms/api'
import { roomStyle } from '@/features/rooms/roomStyle'
import { revealItem } from '@/features/dashboard/reveal'

const EASE = [0.16, 1, 0.3, 1] as const

function timeAgo(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function RoomCard({ room, onOpen }: { room: Room; onOpen: () => void }) {
  const art = roomStyle(room.type)
  const online = room.online.length
  const lastSeen = room.members.reduce(
    (latest, member) => (member.lastSeen > latest ? member.lastSeen : latest),
    room.createdAt,
  )

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      variants={revealItem}
      aria-label={`Open ${room.name}`}
      /* Shared with RoomStage — this element becomes the opened page. */
      layoutId={`room-${room.id}`}
      whileHover={{ y: -6, transition: { duration: 0.45, ease: EASE } }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.62, ease: EASE }}
      className="group relative aspect-[4/3] overflow-hidden rounded-card text-left ring-1 ring-inset ring-white/[0.08] outline-none transition-shadow duration-500 hover:ring-signal/45 hover:shadow-[0_28px_60px_-30px_color-mix(in_oklab,var(--color-red)_55%,transparent)] focus-visible:ring-signal/60"
      style={{ backgroundImage: `linear-gradient(160deg, ${art.from}, ${art.to})` }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(110% 70% at 26% 8%, ${art.glow}55, transparent 62%)`,
        }}
      />
      <div className="grain absolute inset-0 opacity-[0.13] mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-void/92 via-void/25 to-transparent" />

      {online > 0 && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1">
          <span className="size-1.5 animate-signal-pulse rounded-full bg-signal" />
          <span className="text-[0.62rem] font-medium text-chalk">{online} live</span>
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-mist/70">{art.name}</p>
        <h3 className="mt-1.5 truncate font-display text-base font-semibold tracking-[-0.015em] text-chalk">
          {room.name}
        </h3>
        <p className="mt-1 text-[0.72rem] text-mist/80">
          {room.members.length} {room.members.length === 1 ? 'member' : 'members'} ·{' '}
          {timeAgo(lastSeen)}
        </p>
      </div>
    </motion.button>
  )
}

export function RoomsGrid({ rooms, onOpen }: { rooms: Room[]; onOpen: (room: Room) => void }) {
  if (rooms.length === 0) {
    return (
      <motion.div variants={revealItem} className="panel rounded-card px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-chalk">No rooms yet</p>
        <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-relaxed text-mist">
          Make one below. It stays open after you close the tab — that's the whole idea.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onOpen={() => onOpen(room)} />
      ))}
    </div>
  )
}
