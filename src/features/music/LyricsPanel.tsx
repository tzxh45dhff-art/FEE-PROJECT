import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useMusic } from '@/features/music/MusicContext'
import type { Lyrics } from '@/features/music/types'
import { activeLineAt } from '@/features/music/useLyrics'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/**
 * The words, following the record.
 *
 * The line being sung is the only one at full weight; everything else is
 * dimmed and smaller. That is the whole design — a lyric view is read at a
 * glance from across a room, so the question it answers has to be "where are
 * we" rather than "what does the page say".
 *
 * Lines are seekable. Once the words are on screen with timings against them,
 * they are the most precise scrubber the song has, and tapping the line you
 * want is a better way back to a chorus than dragging a bar.
 */

/** How long to leave the view alone after somebody scrolls it themselves. */
const MANUAL_HOLD_MS = 6000

export function LyricsPanel({
  lyrics,
  loading,
  onSeek,
}: {
  lyrics: Lyrics | null
  loading: boolean
  onSeek: (seconds: number) => void
}) {
  const { position } = useMusic()
  const reduced = usePrefersReducedMotion()

  const scroller = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([])
  /* When the reader took over. Autoscroll stands down until it lapses. */
  const heldUntil = useRef(0)
  /* Set while this component is the one scrolling, so its own smooth scroll
     is not mistaken for the reader grabbing the view. */
  const selfScrolling = useRef(false)

  const lines = lyrics?.kind === 'synced' ? lyrics.lines : null
  const index = lines ? activeLineAt(lines, position) : -1
  const [, force] = useState(0)

  /* Keep the active line centred. Layout effect so it is never painted in the
     wrong place first, which reads as a stutter on every line change. */
  useLayoutEffect(() => {
    if (!lines || index < 0) return
    if (performance.now() < heldUntil.current) return

    const node = lineRefs.current[index]
    const box = scroller.current
    if (!node || !box) return

    const target = node.offsetTop - box.clientHeight / 2 + node.clientHeight / 2
    if (Math.abs(box.scrollTop - target) < 4) return

    selfScrolling.current = true
    box.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' })
    /* Cleared on a timer rather than a scroll-end event, which Safari does
       not fire. Generous enough to cover a smooth scroll, short enough that a
       reader taking over immediately afterwards is still noticed. */
    window.setTimeout(() => {
      selfScrolling.current = false
    }, 700)
  }, [index, lines, reduced])

  /* A reader scrolling away should not be dragged back mid-verse. */
  useEffect(() => {
    const box = scroller.current
    if (!box) return

    const onScroll = () => {
      if (selfScrolling.current) return
      heldUntil.current = performance.now() + MANUAL_HOLD_MS
      /* Re-render so the "following" affordance updates immediately. */
      force((n) => n + 1)
    }

    box.addEventListener('scroll', onScroll, { passive: true })
    return () => box.removeEventListener('scroll', onScroll)
  }, [])

  const held = performance.now() < heldUntil.current

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <Loader2 aria-hidden className="size-5 animate-spin text-mist" />
      </div>
    )
  }

  if (!lyrics || lyrics.kind === 'none') {
    return (
      <div className="grid flex-1 place-items-center px-8">
        <p className="max-w-xs text-center text-[0.85rem] leading-relaxed text-mist">
          No lyrics for this one.
          <span className="mt-1 block text-[0.76rem] text-dusk">
            They come from a community database, so newer and regional tracks are
            often missing.
          </span>
        </p>
      </div>
    )
  }

  if (lyrics.kind === 'plain') {
    return (
      <div className="relative min-h-0 flex-1">
        <div
          ref={scroller}
          className="h-full overflow-y-auto overscroll-contain px-6 py-8 sm:px-10"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <p className="mx-auto max-w-xl whitespace-pre-wrap text-[1.05rem] leading-[1.9] text-chalk/80">
            {lyrics.plain}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-[0.74rem] text-dusk">
            Only the words are published for this one — nothing to follow along
            with.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scroller}
        className="h-full overflow-y-auto overscroll-contain px-6 sm:px-10"
        /*
         * Air above and below, so the first and last lines can still reach the
         * middle of the view.
         *
         * Viewport units, not a percentage: percentage padding resolves against
         * the containing block's *width*, so on a wide screen this became a
         * padding taller than the panel and the scroll broke outright.
         */
        style={{ paddingBlock: '38vh', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="mx-auto max-w-xl">
          {lyrics.lines.map((line, at) => {
            const current = at === index
            const past = at < index

            /* Instrumental gaps carry no words. Shown as a marker rather than
               skipped, because the pause is part of following the song. */
            if (!line.text) {
              return (
                <div
                  key={`${line.at}-${at}`}
                  ref={(node) => {
                    lineRefs.current[at] = node as unknown as HTMLButtonElement
                  }}
                  className="flex h-8 items-center gap-1.5"
                  aria-hidden
                >
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className={cn(
                        'size-1.5 rounded-full transition-colors duration-500',
                        current ? 'bg-chalk/70' : 'bg-white/15',
                      )}
                    />
                  ))}
                </div>
              )
            }

            return (
              <button
                key={`${line.at}-${at}`}
                ref={(node) => {
                  lineRefs.current[at] = node
                }}
                type="button"
                onClick={() => onSeek(line.at)}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'block w-full py-2 text-left font-display font-semibold tracking-[-0.01em]',
                  'rounded-lg outline-none transition-all duration-500 ease-glass',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                  current
                    ? 'text-[1.5rem] leading-tight text-chalk sm:text-[1.75rem]'
                    : cn(
                        'text-[1.15rem] leading-snug sm:text-[1.35rem] hover:text-chalk/70',
                        past ? 'text-chalk/25' : 'text-chalk/40',
                      ),
                )}
              >
                {line.text}
              </button>
            )
          })}
        </div>
      </div>

      {/* Fades rather than hard edges, so lines arrive and leave instead of
          being clipped at the boundary. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-void to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-void to-transparent" />

      {held && (
        <button
          type="button"
          onClick={() => {
            heldUntil.current = 0
            force((n) => n + 1)
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-chalk px-3.5 py-1.5 text-[0.74rem] font-medium text-void shadow-lg transition-transform duration-200 hover:scale-[1.03]"
        >
          Follow the song
        </button>
      )}
    </div>
  )
}
