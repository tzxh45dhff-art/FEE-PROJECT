import { useEffect, useRef, useState } from 'react'

import {
  loadYouTubeApi,
  youtubeError,
  type YTPlayer,
} from '@/features/watch/players/youtubeApi'
import type { AudioHandle } from '@/features/music/types'

/**
 * A YouTube video played for its sound.
 *
 * The iframe still exists — YouTube has no audio-only mode and hiding the
 * player is against nothing in its terms, but removing it from the document
 * would stop playback entirely. So it is mounted at one pixel, off-screen and
 * inert, while the record and the bars stand in for it visually.
 *
 * Its audio cannot be analysed. The stream lives inside a cross-origin iframe
 * that the Web Audio API has no route into, which is why `getAnalyserSource`
 * answers null and the visualiser falls back to its synthetic motion.
 */
export function YouTubeTrackPlayer({
  videoId,
  startAt,
  volume,
  onHandle,
  onEnded,
  onError,
  onDuration,
}: {
  videoId: string
  startAt: number
  volume: number
  onHandle: (handle: AudioHandle | null) => void
  onEnded: () => void
  onError: (message: string) => void
  onDuration: (seconds: number) => void
}) {
  const mount = useRef<HTMLDivElement>(null)
  /** The node handed to the API — ours to create and remove, never React's. */
  const hostNode = useRef<HTMLDivElement | null>(null)
  const player = useRef<YTPlayer | null>(null)
  const buffering = useRef(false)
  const [ready, setReady] = useState(false)

  const startRef = useRef(startAt)
  const endedRef = useRef(onEnded)
  const errorRef = useRef(onError)
  const handleRef = useRef(onHandle)
  const durationRef = useRef(onDuration)
  startRef.current = startAt
  endedRef.current = onEnded
  errorRef.current = onError
  handleRef.current = onHandle
  durationRef.current = onDuration

  useEffect(() => {
    let disposed = false

    void loadYouTubeApi()
      .then((YT) => {
        if (disposed || !mount.current) return

        /*
         * A fresh node for the API to consume, every time.
         *
         * `YT.Player` does not render *into* the element it is given — it
         * replaces it with an iframe. Handing it a React-owned ref means React
         * and the API both believe they own that node, and on the second mount
         * (StrictMode does one immediately) the API is handed a node it
         * already replaced. Its internals then dereference a player it has
         * torn down — the `this.g.src` throw — from inside a cross-origin
         * script where no stack survives.
         *
         * Creating and removing this child ourselves keeps the two apart:
         * React only ever owns the container, the API only ever owns the
         * child, and neither reaches into the other's node.
         */
        const host = document.createElement('div')
        host.style.width = '100%'
        host.style.height = '100%'
        mount.current.append(host)
        hostNode.current = host

        /*
         * Wrapped, because everything past this point is somebody else's
         * script running in our call stack. A throw from inside the iframe
         * API is not catchable anywhere else, is reported as a bare "Script
         * error." with no stack because it is cross-origin, and — without
         * this — unmounts the entire React tree to a blank page.
         */
        try {
          player.current = new YT.Player(host, {
            videoId,
            playerVars: {
              controls: 0,
              disablekb: 1,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              iv_load_policy: 3,
              origin: window.location.origin,
            },
            events: {
              onReady: ({ target }) => {
                if (disposed) return
                if (startRef.current > 1) target.seekTo(startRef.current, true)
                const duration = target.getDuration()
                if (duration > 0) durationRef.current(duration)
                setReady(true)
              },
              onStateChange: ({ data }) => {
                if (disposed) return
                buffering.current = data === YT.PlayerState.BUFFERING
                if (data === YT.PlayerState.ENDED) endedRef.current()
              },
              onError: ({ data }) => {
                if (!disposed) errorRef.current(youtubeError(data))
              },
            },
          })
        } catch {
          if (!disposed) errorRef.current('The YouTube player could not start for that track.')
        }
      })
      .catch((cause: unknown) => {
        if (!disposed) {
          errorRef.current(
            cause instanceof Error ? cause.message : 'Could not load the YouTube player',
          )
        }
      })

    return () => {
      disposed = true
      setReady(false)
      handleRef.current(null)
      try {
        player.current?.destroy()
      } catch {
        /* Destroying a player whose iframe is already gone throws; the node is
           gone either way, which is all we wanted. */
      }
      player.current = null
      /* Remove whatever the API left behind — by now the child is an iframe,
         not the div we appended. */
      hostNode.current?.remove()
      hostNode.current = null
    }
  }, [videoId])

  useEffect(() => {
    if (!ready || !player.current) return
    /* YouTube takes 0–100, everything else here is 0–1. */
    player.current.setVolume(Math.round(Math.min(1, Math.max(0, volume)) * 100))
  }, [volume, ready])

  useEffect(() => {
    if (!ready || !player.current) return

    const instance = player.current
    const handle: AudioHandle = {
      play: () => instance.playVideo(),
      pause: () => instance.pauseVideo(),
      seek: (seconds) => instance.seekTo(Math.max(0, seconds), true),
      getPosition: () => instance.getCurrentTime() || 0,
      getDuration: () => instance.getDuration() || 0,
      isBuffering: () => buffering.current,
      setVolume: (level) => instance.setVolume(Math.round(level * 100)),
      /* See the note at the top — there is nothing here to tap. */
      getAnalyserSource: () => null,
    }

    onHandle(handle)
    return () => onHandle(null)
  }, [ready, onHandle])

  return (
    <div
      aria-hidden
      /*
       * Off-screen at a real size, rather than collapsed to a pixel.
       *
       * The player has to stay in the layout — `display: none` and
       * `visibility: hidden` suspend playback in some browsers — but it also
       * has to have somewhere to build: given a 1px box, the iframe API is
       * being asked to lay out a video player inside nothing, and it throws
       * from inside its own cross-origin script where no stack survives.
       *
       * 320×180 is a normal small embed. Nobody sees it; it simply exists.
       */
      className="pointer-events-none fixed -left-[9999px] top-0 h-[180px] w-[320px] overflow-hidden opacity-0"
    >
      <div ref={mount} className="size-full" />
    </div>
  )
}
