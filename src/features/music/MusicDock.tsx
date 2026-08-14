import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Music4, Pause, Play, SkipForward, X } from 'lucide-react'

import { useMusic } from '@/features/music/MusicContext'
import { useCoverPalette } from '@/features/music/useCoverPalette'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The music, still playing, while you are doing something else.
 *
 * Deliberately small and deliberately incomplete: play, skip, and a way back
 * in. Anything more would be rebuilding the page in a corner, and the page is
 * one tap away.
 *
 * Hidden — not stopped — while the record view is open, because that view is
 * this same session at full size. It is also hidden during a film: the watch
 * stage pauses the music entirely, and a transport for something that is not
 * playing is just clutter over the video.
 */
export function MusicDock({
  visible,
  onOpen,
  insetRight = 0,
}: {
  visible: boolean
  /** Given the dock's own box, so the page opens out of it too. */
  onOpen: (from?: DOMRect) => void
  /** Rem the room panel occupies, so the dock never hides behind it. */
  insetRight?: number
}) {
  const { snapshot, queue, send, handle, singalong } = useMusic()
  const track = snapshot?.track ?? null
  const palette = useCoverPalette(track?.artwork)

  /*
   * Which song the bar was dismissed for.
   *
   * Stored as a track id rather than a boolean so the next song brings the bar
   * back on its own. "Hide this" means this one — a dismissal that silently
   * persisted would leave the room playing with no visible way back in.
   */
  const [dismissedFor, setDismissedFor] = useState<string | null>(null)

  return createPortal(
    <AnimatePresence>
      {visible && track && dismissedFor !== track.id && (
        <motion.div
          className="pointer-events-auto fixed bottom-4 z-[120] transition-[right] duration-500 ease-glass"
          style={{ right: `calc(${insetRight}rem + 1rem)` }}
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div
            className="flex items-center gap-3 rounded-full border border-white/12 py-2 pl-2 pr-3 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            style={{
              /* Tinted by the cover, faintly. Enough to feel like the record on
                 the page, not enough to fight the screen behind it. */
              background: palette
                ? `color-mix(in oklab, ${palette.base} 42%, rgba(6,6,8,0.82))`
                : 'rgba(6,6,8,0.82)',
            }}
          >
            <button
              type="button"
              onClick={(event) => onOpen(event.currentTarget.getBoundingClientRect())}
              aria-label="Open the music page"
              className="relative size-10 shrink-0 overflow-hidden rounded-full outline-none ring-1 ring-inset ring-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              {track.artwork ? (
                <img
                  src={track.artwork}
                  alt=""
                  className="size-full object-cover"
                  style={{
                    animation: 'music-spin 7s linear infinite',
                    animationPlayState: snapshot?.playing ? 'running' : 'paused',
                  }}
                />
              ) : (
                <span className="grid size-full place-items-center bg-white/10 text-chalk">
                  <Music4 aria-hidden className="size-4" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={(event) => onOpen(event.currentTarget.getBoundingClientRect())}
              className="min-w-0 max-w-[9rem] text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:max-w-[13rem]"
            >
              <span className="block truncate text-[0.8rem] font-medium text-chalk">
                {track.title}
              </span>
              <span className="block truncate text-[0.68rem] text-mist">
                {singalong.singing ? 'Singing along' : (track.artist ?? 'In the room')}
              </span>
            </button>

            {singalong.singing && (
              <Mic aria-hidden className="size-3.5 shrink-0 text-signal-bright" />
            )}

            <button
              type="button"
              onClick={() =>
                snapshot &&
                send('music:control', {
                  action: snapshot.playing ? 'pause' : 'play',
                  position: handle ? handle.getPosition() : undefined,
                })
              }
              aria-label={snapshot?.playing ? 'Pause' : 'Play'}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-chalk text-void outline-none transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              {snapshot?.playing ? (
                <Pause aria-hidden className="size-3.5 fill-current" />
              ) : (
                <Play aria-hidden className="size-3.5 translate-x-px fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => snapshot && send('music:next', { seq: snapshot.seq })}
              disabled={queue.length === 0}
              aria-label="Next track"
              className="grid size-8 shrink-0 place-items-center rounded-full text-chalk outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-30"
            >
              <SkipForward aria-hidden className="size-3.5" />
            </button>

            {/*
              Dismisses this bar, and nothing else.
              It used to pause the room — which made a control that looks like
              "hide this" silently stop the music for everybody else in it. The
              room's playback is a shared decision; getting the bar off your own
              screen is not.
            */}
            <button
              type="button"
              onClick={() => setDismissedFor(track.id)}
              aria-label="Hide the player"
              className="grid size-8 shrink-0 place-items-center rounded-full text-mist outline-none transition-colors hover:bg-white/10 hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
