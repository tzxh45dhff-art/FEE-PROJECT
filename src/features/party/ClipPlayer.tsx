import { useEffect, useRef } from 'react'

import { loadYouTubeApi, type YTPlayer } from '@/features/watch/players/youtubeApi'
import { apiUrl } from '@/lib/config'

/**
 * Plays guess-the-song clips, in step with everyone else.
 *
 * During "get ready" the clip is loaded muted and parked at its start, so when
 * the options open the sound can begin at once on every screen rather than
 * whenever each connection gets around to buffering. If the options opened a
 * moment ago (a slow join, a tab that was asleep) the clip starts that far in,
 * so everyone hears the same second.
 *
 * Browsers only allow sound after the person has touched the page. Whoever
 * started the game has; someone who walked in mid-game may not have, so when
 * playback is refused the screen offers a tap to hear instead of silence.
 */

export type ClipMedia = { source: string; ref: string; start: number }
export type ClipStatus = 'loading' | 'ready' | 'playing' | 'blocked' | 'error'

export function ClipPlayer({
  media,
  playing,
  elapsedMs,
  onStatus,
  unlock,
}: {
  media: ClipMedia | null
  playing: boolean
  /** How long ago the options opened — where in the clip everyone else is. */
  elapsedMs: () => number
  onStatus: (status: ClipStatus) => void
  /** Bumped by a tap when playback was blocked; try again with that gesture. */
  unlock: number
}) {
  const statusRef = useRef(onStatus)
  statusRef.current = onStatus
  const elapsedRef = useRef(elapsedMs)
  elapsedRef.current = elapsedMs

  if (!media) return null
  return media.source === 'youtube' ? (
    <YouTubeClip key="yt" media={media} playing={playing} elapsed={elapsedRef} status={statusRef} unlock={unlock} />
  ) : (
    <FileClip key="file" media={media} playing={playing} elapsed={elapsedRef} status={statusRef} unlock={unlock} />
  )
}

type Inner = {
  media: ClipMedia
  playing: boolean
  elapsed: React.RefObject<() => number>
  status: React.RefObject<(s: ClipStatus) => void>
  unlock: number
}

function FileClip({ media, playing, elapsed, status, unlock }: Inner) {
  const audio = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const el = audio.current
    if (!el) return
    status.current('loading')
    /* Uploads are server-relative paths. */
    el.src = apiUrl(media.ref)
    el.currentTime = media.start
    el.load()
    const ready = () => {
      el.currentTime = media.start
      status.current('ready')
    }
    const failed = () => status.current('error')
    el.addEventListener('canplay', ready, { once: true })
    el.addEventListener('error', failed, { once: true })
    return () => {
      el.removeEventListener('canplay', ready)
      el.removeEventListener('error', failed)
      el.pause()
    }
  }, [media.ref, media.start, status])

  useEffect(() => {
    const el = audio.current
    if (!el) return
    if (!playing) {
      el.pause()
      return
    }
    el.currentTime = media.start + elapsed.current() / 1000
    el.volume = 0.9
    el.play().then(
      () => status.current('playing'),
      () => status.current('blocked'),
    )
  }, [playing, media.start, elapsed, status, unlock])

  return <audio ref={audio} preload="auto" className="hidden" />
}

function YouTubeClip({ media, playing, elapsed, status, unlock }: Inner) {
  const mount = useRef<HTMLDivElement>(null)
  const player = useRef<YTPlayer | null>(null)
  const ready = useRef(false)
  const wanted = useRef({ media, playing })
  wanted.current = { media, playing }
  /** The clip the player is parked on, so a repeat render doesn't reload it. */
  const loaded = useRef<string | null>(null)
  const parked = useRef(false)

  /* One player for the whole game; re-pointed per round. */
  useEffect(() => {
    let disposed = false
    let host: HTMLDivElement | null = null
    void loadYouTubeApi()
      .then((YT) => {
        if (disposed || !mount.current) return
        host = document.createElement('div')
        mount.current.append(host)
        try {
          player.current = new YT.Player(host, {
            playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, iv_load_policy: 3, origin: window.location.origin },
            events: {
              onReady: () => {
                if (disposed) return
                ready.current = true
                sync()
              },
              onStateChange: ({ data, target }) => {
                if (disposed) return
                try {
                  if (data === YT.PlayerState.PLAYING) {
                    if (!wanted.current.playing) {
                      /* The muted preload got going: park it at the start. */
                      target.pauseVideo()
                      target.seekTo(wanted.current.media.start, true)
                      parked.current = true
                      status.current('ready')
                    } else if (!target.isMuted()) {
                      status.current('playing')
                    }
                  }
                } catch {
                  /* The player went away mid-event. */
                }
              },
              onError: () => {
                if (!disposed) status.current('error')
              },
            },
          })
        } catch {
          status.current('error')
        }
      })
      .catch(() => status.current('error'))

    return () => {
      disposed = true
      ready.current = false
      try {
        player.current?.destroy()
      } catch {
        /* Already gone. */
      }
      player.current = null
      host?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sync = () => {
    const p = player.current
    if (!p || !ready.current) return
    const { media: m, playing: on } = wanted.current
    try {
      const id = `${m.ref}@${m.start}`
      if (loaded.current !== id) {
        loaded.current = id
        parked.current = false
        status.current('loading')
        p.mute()
        p.loadVideoById({ videoId: m.ref, startSeconds: m.start })
        if (!on) return
      }
      if (on) {
        p.seekTo(m.start + elapsed.current() / 1000, true)
        p.unMute()
        p.setVolume(90)
        p.playVideo()
        /* If the browser refuses sound, the player sits paused or muted. */
        window.setTimeout(() => {
          try {
            if (!wanted.current.playing) return
            if (p.getPlayerState() !== 1 || p.isMuted()) status.current('blocked')
            else status.current('playing')
          } catch {
            /* Gone. */
          }
        }, 1500)
      } else if (parked.current) {
        p.pauseVideo()
      }
    } catch {
      status.current('error')
    }
  }

  useEffect(sync, [media.ref, media.start, playing, unlock]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Off-screen, not display:none — a hidden iframe does not play. */
  return <div ref={mount} aria-hidden className="pointer-events-none fixed -left-[9999px] top-0 size-px overflow-hidden opacity-0" />
}
