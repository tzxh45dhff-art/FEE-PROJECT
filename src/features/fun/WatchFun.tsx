import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, Pin, X } from 'lucide-react'

import { MOMENT_FACES, REACTIONS, reactionById } from '@/features/fun/catalog'
import { clock } from '@/features/fun/time'
import type { Moment, ReactionEvent } from '@/features/fun/useWatchFun'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/**
 * The social layer over a film: reactions floating up the screen, and moments
 * pinned to timestamps so a room can go back to the scene that got them.
 *
 * Reactions are content, not chrome — they keep floating when the controls
 * fade, the same way they would in a cinema. The rail that sends them fades
 * with the controls, so it is never in the way of the picture.
 */

const emojiFont = {
  fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
  lineHeight: 1,
} as const

export function WatchFun({
  item,
  position,
  chromeVisible,
  selfId,
  reactions,
  moments,
  arrival,
  onDismissArrival,
  onReact,
  onPin,
  onRemove,
  onSeek,
}: {
  item: { id: string; title: string } | null
  position: number
  chromeVisible: boolean
  selfId: string | undefined
  reactions: ReactionEvent[]
  moments: Moment[]
  arrival: Moment | null
  onDismissArrival: () => void
  onReact: (id: string) => void
  onPin: (input: { title: string; position: number; emoji: string; note: string }) => Promise<{ ok: boolean; error?: string }>
  onRemove: (id: string) => void
  onSeek: (seconds: number) => void
}) {
  const [sheet, setSheet] = useState<'pin' | 'moments' | null>(null)

  /* Close a sheet if the film changes underneath it. */
  useEffect(() => setSheet(null), [item?.id])

  return (
    <>
      <ReactionStream reactions={reactions} selfId={selfId} />

      <ArrivalToast moment={arrival} selfId={selfId} onJump={onSeek} onDismiss={onDismissArrival} />

      {item && (
        <div
          className={cn(
            'absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1.5 transition-opacity duration-500 ease-glass md:right-5',
            chromeVisible || sheet ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <div className="glass-pill-ink flex flex-col items-center gap-0.5 rounded-full p-1.5" role="group" aria-label="React">
            {REACTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onReact(r.id)}
                aria-label={`React: ${r.label}`}
                title={r.label}
                className="grid size-10 place-items-center rounded-full text-[1.35rem] outline-none transition-transform duration-200 hover:scale-[1.18] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal active:scale-90"
                style={emojiFont}
              >
                <span aria-hidden>{r.glyph}</span>
              </button>
            ))}
          </div>
          <div className="glass-pill-ink flex flex-col items-center gap-0.5 rounded-full p-1.5">
            <button
              type="button"
              onClick={() => setSheet((s) => (s === 'pin' ? null : 'pin'))}
              aria-expanded={sheet === 'pin'}
              aria-label={`Pin this moment, at ${clock(position)}`}
              title="Pin this moment"
              className={cn(
                'grid size-10 place-items-center rounded-full text-chalk outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal',
                sheet === 'pin' && 'bg-signal/25',
              )}
            >
              <Pin aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setSheet((s) => (s === 'moments' ? null : 'moments'))}
              aria-expanded={sheet === 'moments'}
              aria-label={`Moments in this film: ${moments.length}`}
              title="Moments"
              className={cn(
                'relative grid size-10 place-items-center rounded-full text-chalk outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal',
                sheet === 'moments' && 'bg-white/15',
              )}
            >
              <Bookmark aria-hidden className="size-4" />
              {moments.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-signal px-1 text-[0.6rem] font-semibold leading-4 text-white">
                  {moments.length > 99 ? '99+' : moments.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {item && sheet === 'pin' && (
          <PinSheet
            key="pin"
            position={position}
            onClose={() => setSheet(null)}
            onPin={async (emoji, note, at) => {
              /* The time the sheet showed, not wherever the film has got to
                 while a face was being chosen. */
              const result = await onPin({ title: item.title, position: at, emoji, note })
              if (result.ok) setSheet(null)
              return result
            }}
          />
        )}
        {item && sheet === 'moments' && (
          <MomentsSheet
            key="moments"
            moments={moments}
            selfId={selfId}
            onClose={() => setSheet(null)}
            onJump={(seconds) => {
              onSeek(seconds)
              setSheet(null)
            }}
            onRemove={onRemove}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ── reactions ─────────────────────────────────────────────────────────────────

function ReactionStream({ reactions, selfId }: { reactions: ReactionEvent[]; selfId: string | undefined }) {
  const reduced = usePrefersReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 z-10 w-40 overflow-hidden md:right-20">
      <AnimatePresence>
        {reactions.map((r) => (
          <Floater key={r.id} reaction={r} mine={r.from.id === selfId} reduced={reduced} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Floater({ reaction, mine, reduced }: { reaction: ReactionEvent; mine: boolean; reduced: boolean }) {
  const def = reactionById(reaction.reaction)
  /* Each one takes its own lane and sway, decided once. */
  const [lane] = useState(() => ({ x: 20 + Math.random() * 80, sway: 14 + Math.random() * 20, dir: Math.random() > 0.5 ? 1 : -1 }))
  if (!def) return null
  return (
    <motion.div
      className="absolute bottom-24 flex flex-col items-center"
      style={{ left: lane.x }}
      initial={{ opacity: 0, y: 0, scale: 0.4 }}
      animate={
        reduced
          ? { opacity: [0, 1, 1, 0], y: -80, scale: 1 }
          : {
              opacity: [0, 1, 1, 0],
              y: [0, -160, -330, -470],
              x: [0, lane.dir * lane.sway, -lane.dir * lane.sway * 0.6, lane.dir * lane.sway * 0.3],
              scale: [0.4, 1.15, 1, 0.9],
            }
      }
      transition={{ duration: 3, ease: 'easeOut', times: [0, 0.25, 0.7, 1] }}
    >
      <span className="text-[2.1rem] drop-shadow-[0_4px_10px_rgba(0,0,0,.45)]" style={emojiFont}>
        {def.glyph}
      </span>
      {!mine && (
        <span className="mt-0.5 max-w-[7rem] truncate rounded-full bg-void/55 px-2 py-0.5 text-[0.6rem] font-semibold text-chalk backdrop-blur-sm">
          {reaction.from.name}
        </span>
      )}
    </motion.div>
  )
}

// ── moments ───────────────────────────────────────────────────────────────────

function ArrivalToast({
  moment,
  selfId,
  onJump,
  onDismiss,
}: {
  moment: Moment | null
  selfId: string | undefined
  onJump: (seconds: number) => void
  onDismiss: () => void
}) {
  useEffect(() => {
    if (!moment) return
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [moment, onDismiss])

  const mine = moment?.createdBy.id === selfId
  return (
    <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center px-4 md:top-20" role="status" aria-live="polite">
      <AnimatePresence>
        {moment && (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-pill-ink pointer-events-auto flex max-w-[min(32rem,92vw)] items-center gap-3 rounded-full py-1.5 pl-2 pr-2"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-[1.2rem]" style={emojiFont}>
              {moment.emoji}
            </span>
            <span className="min-w-0 text-[0.8rem] leading-tight text-chalk">
              <span className="font-semibold">{mine ? 'Pinned' : `${moment.createdBy.name} pinned a moment`}</span>
              <span className="text-mist"> at {clock(moment.position)}</span>
              {moment.note && <span className="block truncate text-mist">“{moment.note}”</span>}
            </span>
            {!mine && (
              <button
                type="button"
                onClick={() => {
                  onJump(moment.position)
                  onDismiss()
                }}
                className="shrink-0 rounded-full bg-chalk px-3 py-1.5 text-[0.72rem] font-semibold text-void outline-none transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                Jump there
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    ref.current?.querySelector<HTMLElement>('button, input')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={title}
      initial={{ opacity: 0, x: 12, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="glass-pill-ink absolute right-16 top-1/2 z-30 w-[min(21rem,calc(100%-6rem))] -translate-y-1/2 rounded-[1.4rem] p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,.85)] md:right-20"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-[0.95rem] font-semibold text-chalk">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-8 place-items-center rounded-full text-mist outline-none hover:bg-white/10 hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
      {children}
    </motion.div>
  )
}

function PinSheet({
  position,
  onClose,
  onPin,
}: {
  position: number
  onClose: () => void
  onPin: (emoji: string, note: string, at: number) => Promise<{ ok: boolean; error?: string }>
}) {
  /* Frozen at the moment the sheet opened: the film keeps playing while you
     choose a face, and the scene you meant is the one you were looking at. */
  const [at] = useState(position)
  const [face, setFace] = useState<string>(MOMENT_FACES[0])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <Sheet title={`Pin the moment at ${clock(at)}`} onClose={onClose}>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Face">
        {MOMENT_FACES.map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={face === f}
            onClick={() => setFace(f)}
            className={cn(
              'grid aspect-square place-items-center rounded-2xl text-[1.5rem] outline-none transition-[transform,background-color] hover:scale-105 focus-visible:outline-2 focus-visible:outline-signal',
              face === f ? 'bg-white/20 ring-2 ring-signal/70' : 'bg-white/[0.04] hover:bg-white/10',
            )}
            style={emojiFont}
          >
            {f}
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex flex-col gap-2"
        onSubmit={async (event) => {
          event.preventDefault()
          setBusy(true)
          setError(null)
          const result = await onPin(face, note, at)
          setBusy(false)
          if (!result.ok) setError(result.error ?? 'Could not pin that')
        }}
      >
        <label className="sr-only" htmlFor="moment-note">
          A line about this moment (optional)
        </label>
        <input
          id="moment-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={120}
          placeholder="Say something about it (optional)"
          className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-[0.85rem] text-chalk placeholder:text-dusk focus:outline-none focus:ring-2 focus:ring-signal/60"
        />
        {error && <p className="text-[0.75rem] text-signal-bright">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-chalk py-2.5 text-[0.82rem] font-semibold text-void outline-none transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-60"
        >
          {busy ? 'Pinning…' : `Pin ${face} at ${clock(at)}`}
        </button>
      </form>
    </Sheet>
  )
}

function MomentsSheet({
  moments,
  selfId,
  onClose,
  onJump,
  onRemove,
}: {
  moments: Moment[]
  selfId: string | undefined
  onClose: () => void
  onJump: (seconds: number) => void
  onRemove: (id: string) => void
}) {
  return (
    <Sheet title="Moments in this film" onClose={onClose}>
      {moments.length === 0 ? (
        <p className="py-4 text-center text-[0.82rem] leading-relaxed text-mist">
          Nothing pinned yet.
          <br />
          Press the pin when something gets you.
        </p>
      ) : (
        <ul className="-mx-1 flex max-h-[min(22rem,50vh)] flex-col gap-1 overflow-y-auto px-1">
          {moments.map((m) => (
            <li key={m.id} className="group flex items-center gap-2">
              <button
                type="button"
                onClick={() => onJump(m.position)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-2 text-left outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal"
                aria-label={`Jump to ${clock(m.position)}: ${m.note || 'pinned'} by ${m.createdBy.name}`}
              >
                <span className="text-[1.3rem]" style={emojiFont} aria-hidden>
                  {m.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[0.74rem] tabular-nums text-signal-bright">{clock(m.position)}</span>
                  <span className="block truncate text-[0.82rem] text-chalk">{m.note || 'Pinned'}</span>
                  <span className="block text-[0.68rem] text-dusk">{m.createdBy.id === selfId ? 'You' : m.createdBy.name}</span>
                </span>
              </button>
              {m.createdBy.id === selfId && (
                <button
                  type="button"
                  onClick={() => onRemove(m.id)}
                  aria-label={`Remove the moment at ${clock(m.position)}`}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-dusk opacity-0 outline-none transition-opacity hover:bg-white/10 hover:text-chalk focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-signal group-hover:opacity-100"
                >
                  <X aria-hidden className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}
