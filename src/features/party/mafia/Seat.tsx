import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MicOff, Armchair } from 'lucide-react'

import type { Character } from '@/lib/characters'
import { cn } from '@/lib/utils'
import { callName } from './helpers'
import { usePortrait, useSpeaking } from './hooks'
import { ROLE_TITLE, isFamily, type SeatView } from './types'

export function Portrait({ name, character, className }: { name: string; character?: Character; className?: string }) {
  const src = usePortrait(character)
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className={cn('relative grid place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#4a3a26,#1a120a)] noir-sepia', className)}>
      {src ? (
        /* A full-body cutout is cropped to head and shoulders; a rendered still already is one. */
        <img
          src={src}
          alt=""
          draggable={false}
          className={cn(
            'max-w-none opacity-95 [filter:grayscale(0.5)_sepia(0.45)_contrast(1.08)]',
            src === character?.png ? 'absolute left-1/2 top-[3%] h-[340%] w-auto -translate-x-1/2' : 'size-full object-cover',
          )}
        />
      ) : (
        <span className="font-deco text-[2rem] text-[var(--noir-brass)] opacity-80">{initials}</span>
      )}
    </div>
  )
}

/* ── the seat ─────────────────────────────────────────────────────────── */

export function Seat({
  seat,
  you,
  character,
  stream,
  cameraOff,
  onCall,
  callLive,
  micMuted,
  mood,
  selectable,
  selected,
  dim,
  badge,
  pins,
  spotlight,
  bubble,
  onPick,
  seatRef,
}: {
  seat: SeatView
  you: boolean
  character?: Character
  stream: MediaStream | null
  cameraOff: boolean
  onCall: boolean
  /** Whether this screen is on the room call at all. */
  callLive?: boolean
  micMuted: boolean
  mood: 'night' | 'day'
  selectable: boolean
  selected: boolean
  dim?: boolean
  /** A small note in the corner: ready, voted, the Family's pick. */
  badge?: string | null
  /** Accusing hands: who is voting for this seat. */
  pins?: string[]
  spotlight?: boolean
  /** What they just said at the table — or `null` text while an AI is thinking. */
  bubble?: { text: string | null } | null
  onPick?: () => void
  seatRef?: (el: HTMLElement | null) => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const showVideo = !!stream && !cameraOff && onCall && seat.alive && mood === 'day'
  const speaking = useSpeaking(seat.alive && onCall ? stream : null, !micMuted)

  useEffect(() => {
    if (video.current && video.current.srcObject !== stream) video.current.srcObject = stream
  }, [stream, showVideo])

  const role = seat.role
  const Tag = selectable ? motion.button : motion.div

  return (
    <Tag
      ref={seatRef as never}
      type={selectable ? 'button' : undefined}
      onClick={selectable ? onPick : undefined}
      whileHover={selectable ? { y: -3 } : undefined}
      whileTap={selectable ? { scale: 0.97 } : undefined}
      aria-pressed={selectable ? selected : undefined}
      aria-label={selectable ? `Choose ${seat.name}` : undefined}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[0.35rem] bg-[var(--noir-smoke)] text-left outline-none noir-frame transition-[opacity,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-[var(--noir-brass)]',
        selectable && 'cursor-pointer',
        selected && 'ring-2 ring-[var(--noir-blood-bright)] ring-offset-2 ring-offset-black',
        speaking && 'shadow-[0_0_0_2px_var(--noir-brass),0_0_28px_-4px_rgba(200,164,94,.7)]',
        (dim || !seat.alive) && 'opacity-60',
        spotlight && 'z-10 shadow-[0_0_0_2px_#f3d9a0,0_0_80px_10px_rgba(255,220,150,.35)]',
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {showVideo ? (
          <div className="absolute inset-0 noir-sepia">
            {/* Picture only: the call's sound plays from the always-on call audio. */}
            <video ref={video} autoPlay playsInline muted className={cn('size-full object-cover', you && '-scale-x-100')} />
          </div>
        ) : (
          <Portrait name={seat.name} character={character} className="absolute inset-0" />
        )}

        {/* Night: everyone's eyes are closed. */}
        {mood === 'night' && seat.alive && (
          <div className="absolute inset-0 grid place-items-center bg-[#050912]/70">
            <span className="font-type text-[0.7rem] uppercase tracking-[0.3em] text-[#9fb4d8]/80">asleep</span>
          </div>
        )}

        {/* The dead: a chalk outline and the date of death. */}
        {!seat.alive && (
          <div className="absolute inset-0 grid place-items-center bg-black/55">
            <span className="noir-stamp rounded-sm px-3 py-1 text-[0.95rem] text-[#e6d9bd]">{seat.died?.how === 'voted' ? 'HANGED' : 'R.I.P.'}</span>
          </div>
        )}

        {badge && (
          <span className="font-type absolute left-1.5 top-1.5 rounded-sm bg-black/70 px-1.5 py-0.5 text-[0.7rem] uppercase tracking-wider text-[var(--noir-brass)]">
            {badge}
          </span>
        )}
        {seat.bot && (
          <span title={`AI player · ${seat.bot}`} className="font-type absolute right-1.5 top-1.5 rounded-sm bg-[var(--noir-brass)] px-1.5 py-0.5 text-[0.66rem] font-bold uppercase tracking-wider text-[#1c140b]">
            AI
          </span>
        )}
        {seat.presence === 'table' && !seat.bot && (
          <span title="At the table" className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/70 text-[var(--noir-paper-dim)]">
            <Armchair aria-hidden className="size-3.5" />
          </span>
        )}
        {/* Only worth saying when there is a call to be on. */}
        {callLive && !onCall && !seat.bot && seat.presence === 'online' && seat.alive && mood === 'day' && (
          <span className="font-type absolute bottom-1.5 right-1.5 hidden rounded-sm bg-black/70 px-1.5 py-0.5 text-[0.64rem] uppercase tracking-wider text-[var(--noir-paper-dim)] sm:block">off the call</span>
        )}
        {onCall && micMuted && seat.alive && mood === 'day' && seat.presence === 'online' && (
          <span className="absolute bottom-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-black/70 text-[var(--noir-paper-dim)]">
            <MicOff aria-hidden className="size-3" />
          </span>
        )}
        {pins && pins.length > 0 && (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--noir-blood)] px-1.5 font-deco text-[0.8rem] text-white shadow-[0_2px_6px_rgba(0,0,0,.6)]">{pins.length}</span>
          </div>
        )}

        {/*
         * What they just said — a typed slip along the bottom of the
         * photograph, inside its frame so it is never cut off. The whole line
         * is in table talk; this is the glance.
         */}
        <AnimatePresence>
          {bubble && seat.alive && (
            <motion.p
              key={bubble.text ?? 'thinking'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'font-type pointer-events-none absolute inset-x-1 bottom-1 z-10 max-h-[calc(100%-0.5rem)] overflow-hidden rounded-sm bg-[#efe3c8]/95 px-1.5 py-1 text-[0.7rem] leading-snug text-[#1c140b] shadow-[0_6px_16px_-6px_rgba(0,0,0,.9)] sm:px-2 sm:text-[0.78rem]',
                bubble.text ? 'line-clamp-3 sm:line-clamp-4' : 'w-fit',
              )}
              aria-live="polite"
            >
              {bubble.text ?? <span className="inline-flex gap-1 py-0.5" aria-label={`${seat.name} is thinking`}><Dot /><Dot delay={0.15} /><Dot delay={0.3} /></span>}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* The name, typed on a card under the photograph. */}
      <div className="flex flex-col gap-0 border-t border-[var(--noir-brass)]/25 bg-[linear-gradient(180deg,#221a12,#15100b)] px-2 py-1.5 sm:px-2.5">
        <span className="font-type min-w-0 truncate text-[0.86rem] text-[var(--noir-paper)]">
          {/* A small card has room for what the table calls you; a big one for the full name. */}
          <span className="sm:hidden">{callName(seat.name)}</span>
          <span className="hidden sm:inline">{seat.name}</span>
          {you && <span className="ml-1 text-[var(--noir-brass)]">(you)</span>}
        </span>
        {role && (
          <span className={cn('font-type shrink-0 text-[0.68rem] uppercase tracking-wider', isFamily(role) ? 'text-[var(--noir-blood-bright)]' : 'text-[var(--noir-paper-dim)]')}>
            {ROLE_TITLE[role]}
          </span>
        )}
      </div>

    </Tag>
  )
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="size-1.5 rounded-full bg-[#1c140b]"
      animate={{ opacity: [0.25, 1, 0.25] }}
      transition={{ repeat: Infinity, duration: 0.9, delay }}
    />
  )
}
