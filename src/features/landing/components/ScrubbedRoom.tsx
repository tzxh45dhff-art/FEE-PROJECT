import { useEffect, useRef } from 'react'
import { motion, type MotionValue } from 'framer-motion'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * The room behind the hero, scrubbed by the scroll wheel.
 *
 * When a scene ships a video, the hero stops being a photograph and becomes a
 * shot the visitor is holding the playhead of: scrolling does not move the
 * video, it *is* the video's time. Push down and the camera moves into the
 * room; push back up and it retreats, frame for frame.
 *
 * Nothing autoplays. A clip that runs on its own is a background video, which
 * is the thing every site has; a clip that only moves when you do is the page
 * responding to you, and it also means no motion at all for a visitor who
 * simply stops scrolling.
 */

/** Seek no more often than this. Fighting the decoder looks worse than lag. */
const SEEK_INTERVAL_MS = 45

export function ScrubbedRoom({
  src,
  poster,
  progress,
}: {
  /** The scene's clip. Without one the caller shows the still instead. */
  src: string
  /** First frame, painted immediately so the hero is never empty. */
  poster?: string
  /** 0 → 1 across the hero, from the same scroll the parallax uses. */
  progress: MotionValue<number>
}) {
  const video = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()
  const wanted = useRef(0)
  const lastSeek = useRef(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const element = video.current
    if (!element || reduced) return

    /*
     * Seeking is asynchronous and expensive, so the scroll handler only ever
     * records where the playhead *should* be. A single loop does the actual
     * seeking, at a rate the decoder can keep up with — driving `currentTime`
     * straight from the scroll event queues seeks faster than they complete
     * and the picture stops updating altogether.
     */
    const pump = () => {
      frame.current = requestAnimationFrame(pump)

      const now = performance.now()
      if (now - lastSeek.current < SEEK_INTERVAL_MS) return
      if (element.readyState < 1 || element.seeking) return

      const duration = element.duration
      if (!Number.isFinite(duration) || duration <= 0) return

      const target = wanted.current * duration
      /* Below a frame's worth of difference there is nothing to show. */
      if (Math.abs(element.currentTime - target) < 0.04) return

      lastSeek.current = now
      element.currentTime = target
    }

    const stop = progress.on('change', (value) => {
      wanted.current = Math.max(0, Math.min(1, value))
    })

    frame.current = requestAnimationFrame(pump)

    return () => {
      stop()
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [progress, reduced])

  return (
    <motion.video
      ref={video}
      src={src}
      poster={poster}
      aria-hidden
      /* Muted and inline are what let a browser hold a decoded frame at all
         without a gesture; it is never asked to play, only to seek. */
      muted
      playsInline
      preload="auto"
      className="absolute inset-0 -z-20 size-full object-cover"
    />
  )
}
