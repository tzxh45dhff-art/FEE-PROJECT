import { useEffect, useRef, useState } from 'react'

import type { PlayerHandle } from '@/features/watch/types'

/**
 * A direct media URL in a plain `<video>`.
 *
 * The best-behaved of the three sources: arbitrary playback rates mean drift is
 * absorbed by running imperceptibly fast or slow instead of seeking, so a
 * client that falls behind catches up without anyone seeing a jump.
 */
export function FilePlayer({
  src,
  startAt,
  onHandle,
  onEnded,
  onError,
}: {
  src: string
  startAt: number
  onHandle: (handle: PlayerHandle | null) => void
  onEnded: () => void
  onError: (message: string) => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const buffering = useRef(false)
  const [ready, setReady] = useState(false)

  const startRef = useRef(startAt)
  startRef.current = startAt

  useEffect(() => {
    setReady(false)
  }, [src])

  useEffect(() => {
    if (!ready || !video.current) return

    const element = video.current
    const handle: PlayerHandle = {
      play: () => void element.play().catch(() => undefined),
      pause: () => element.pause(),
      seek: (seconds) => {
        element.currentTime = Math.max(0, seconds)
      },
      setRate: (rate) => {
        element.playbackRate = rate
      },
      getPosition: () => element.currentTime || 0,
      getDuration: () => (Number.isFinite(element.duration) ? element.duration : 0),
      isBuffering: () => buffering.current,
      supportsFineRate: true,
    }

    onHandle(handle)
    return () => onHandle(null)
  }, [ready, onHandle])

  return (
    <video
      ref={video}
      src={src}
      className="absolute inset-0 size-full bg-black object-contain"
      playsInline
      /* Ours are the only controls — see the note in YouTubePlayer. */
      controls={false}
      preload="auto"
      onLoadedMetadata={() => {
        if (video.current && startRef.current > 1) video.current.currentTime = startRef.current
        setReady(true)
      }}
      onWaiting={() => {
        buffering.current = true
      }}
      onPlaying={() => {
        buffering.current = false
      }}
      onEnded={onEnded}
      onError={() =>
        onError(
          "That file couldn't be played. It needs to be a direct video URL the browser can fetch — and the host has to allow it.",
        )
      }
    />
  )
}
