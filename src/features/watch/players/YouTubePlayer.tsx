import { useEffect, useRef, useState } from 'react'

import {
  loadYouTubeApi,
  youtubeError,
  type YTNamespace,
  type YTPlayer,
} from '@/features/watch/players/youtubeApi'
import type { PlayerHandle } from '@/features/watch/types'

/**
 * YouTube, driven by us rather than by its own chrome.
 *
 * Native controls are off: two sets of controls that disagree about who is in
 * charge is exactly how a synced player ends up fighting itself. Everything the
 * viewer can press goes through the room.
 */
export function YouTubePlayer({
  videoId,
  startAt,
  onHandle,
  onEnded,
  onError,
}: {
  videoId: string
  /** Where to begin — a late joiner starts mid-video, not at zero. */
  startAt: number
  onHandle: (handle: PlayerHandle | null) => void
  onEnded: () => void
  onError: (message: string) => void
}) {
  const mount = useRef<HTMLDivElement>(null)
  const player = useRef<YTPlayer | null>(null)
  const api = useRef<YTNamespace | null>(null)
  const buffering = useRef(false)
  const [ready, setReady] = useState(false)

  /* Held in refs so the effect below can stay keyed on `videoId` alone —
     re-running it would tear down and rebuild the iframe on every render. */
  const startRef = useRef(startAt)
  const endedRef = useRef(onEnded)
  const errorRef = useRef(onError)
  const handleRef = useRef(onHandle)
  startRef.current = startAt
  endedRef.current = onEnded
  errorRef.current = onError
  handleRef.current = onHandle

  useEffect(() => {
    let disposed = false

    void loadYouTubeApi()
      .then((YT) => {
        if (disposed || !mount.current) return
        api.current = YT

        const instance = new YT.Player(mount.current, {
          videoId,
          playerVars: {
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            /* Origin is required for the API to talk to the iframe reliably. */
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              if (disposed) return
              if (startRef.current > 1) target.seekTo(startRef.current, true)
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

        player.current = instance
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
        /* Destroying a player whose iframe React already removed throws; the
           node is gone either way, which is all we wanted. */
      }
      player.current = null
    }
  }, [videoId])

  /* Published only once the player is genuinely ready — a handle whose methods
     are still undefined would have the sync engine calling into nothing. */
  useEffect(() => {
    if (!ready || !player.current) return

    const instance = player.current
    const handle: PlayerHandle = {
      play: () => instance.playVideo(),
      pause: () => instance.pauseVideo(),
      seek: (seconds) => instance.seekTo(Math.max(0, seconds), true),
      setRate: (rate) => instance.setPlaybackRate(rate),
      getPosition: () => instance.getCurrentTime() || 0,
      getDuration: () => instance.getDuration() || 0,
      isBuffering: () => buffering.current,
      /* YouTube only accepts its own rate list, so drift is corrected by
         seeking rather than by nudging the speed. */
      supportsFineRate: false,
      /* The iframe API has no alternate-audio concept to expose, and YouTube
         draws its own captions inside the iframe where we can't reach them. */
      getAudioTracks: () => [],
      getAudioTrack: () => 0,
      setAudioTrack: () => undefined,
      getSubtitleTrack: () => -1,
      setSubtitleTrack: () => undefined,
    }

    onHandle(handle)
    return () => onHandle(null)
  }, [ready, onHandle])

  return (
    <div className="absolute inset-0">
      <div ref={mount} className="size-full [&>iframe]:size-full" />
    </div>
  )
}
