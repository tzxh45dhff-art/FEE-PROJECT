import { useEffect, useRef, useState } from 'react'

import { audioContext, wakeAudio } from '@/features/music/audioGraph'
import type { AudioHandle } from '@/features/music/types'
import { apiUrl } from '@/lib/config'

/**
 * A track in a plain `<audio>` element.
 *
 * Nothing is rendered — the record and the bars are the interface, and a
 * second set of native controls would only disagree with the room about who is
 * in charge.
 *
 * Also owns the Web Audio graph. The element is tapped once and the node is
 * handed up through the handle, because a `MediaElementSourceNode` can only be
 * created once per element for its whole lifetime: creating a second throws,
 * and the first one silently keeps the audio routed through itself.
 */
export function TrackPlayer({
  src,
  startAt,
  volume,
  onHandle,
  onEnded,
  onError,
  onDuration,
}: {
  src: string
  startAt: number
  volume: number
  onHandle: (handle: AudioHandle | null) => void
  onEnded: () => void
  onError: (message: string) => void
  /** The element is the only thing that knows how long the file actually is. */
  onDuration: (seconds: number) => void
}) {
  const audio = useRef<HTMLAudioElement>(null)
  const buffering = useRef(false)
  const [ready, setReady] = useState(false)

  const node = useRef<MediaElementAudioSourceNode | null>(null)

  const startRef = useRef(startAt)
  startRef.current = startAt
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const onDurationRef = useRef(onDuration)
  onDurationRef.current = onDuration

  useEffect(() => {
    setReady(false)
  }, [src])

  /*
   * The source is attached here rather than as a `src` prop.
   *
   * Teardown below removes the attribute and calls `load()`, and React's
   * double-invoked effects in development mean that teardown can run against
   * an element React then reuses — at which point it sees an unchanged `src`
   * prop and does not re-apply it, leaving a player pointed at nothing. Owning
   * both halves imperatively keeps them in step.
   */
  useEffect(() => {
    const element = audio.current
    if (!element) return

    /* Uploads are a server-relative path, which would resolve against the
       frontend once the two are on different origins. */
    element.src = apiUrl(src)
    element.load()

    return () => {
      element.pause()
      element.removeAttribute('src')
      element.load()
    }
  }, [src])

  /* Volume is a personal setting, not room state, so it is applied directly
     rather than going anywhere near the sync engine. */
  useEffect(() => {
    if (audio.current) audio.current.volume = Math.min(1, Math.max(0, volume))
  }, [volume, ready])

  useEffect(() => {
    if (!ready || !audio.current) return

    const element = audio.current

    const ensureGraph = () => {
      if (node.current) return node.current
      try {
        /* The page's one graph — see `audioGraph`. If nobody has touched the
           page yet it is still asleep, which `play` below notices and reports,
           so the keeper can wait for that first touch. */
        const ctx = audioContext()
        const created = ctx.createMediaElementSource(element)
        /* Straight to the speakers. The analyser taps this node separately. */
        created.connect(ctx.destination)
        node.current = created
        return created
      } catch {
        /* A tainted cross-origin stream, or an element already tapped. Either
           way the visualiser falls back — playback is unaffected. */
        return null
      }
    }

    const handle: AudioHandle = {
      /*
       * "No" when the browser refused to start, and also when the element
       * started but the graph it plays through is still asleep — that is
       * silence too, just quieter about it.
       */
      play: async () => {
        try {
          await element.play()
        } catch (cause) {
          if (cause instanceof DOMException && cause.name === 'NotAllowedError') return false
        }
        return node.current ? wakeAudio(node.current.context as AudioContext) : true
      },
      pause: () => element.pause(),
      setMuted: (muted) => {
        element.muted = muted
        if (!muted && node.current) void (node.current.context as AudioContext).resume().catch(() => undefined)
      },
      isPlaying: () => !element.paused && !element.ended && element.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA,
      seek: (seconds) => {
        element.currentTime = Math.max(0, seconds)
      },
      setRate: (rate) => {
        /* Explicit rather than assumed. It is the default on every current
           engine, but it is the whole reason a nudge is inaudible here, so
           it is not left to one. */
        element.preservesPitch = true
        element.playbackRate = rate
      },
      getPosition: () => element.currentTime || 0,
      getDuration: () => (Number.isFinite(element.duration) ? element.duration : 0),
      isBuffering: () => !element.paused && (buffering.current || element.readyState < HTMLMediaElement.HAVE_FUTURE_DATA),
      isPaused: () => element.paused,
      supportsFineRate: true,
      setVolume: (level) => {
        element.volume = Math.min(1, Math.max(0, level))
      },
      getAnalyserSource: ensureGraph,
    }

    onHandle(handle)
    return () => onHandle(null)
  }, [ready, onHandle])

  /* The element itself is torn down by the source effect above. The graph is
     the page's and stays; this player only unplugs its own node from it. */
  useEffect(
    () => () => {
      try {
        node.current?.disconnect()
      } catch {
        /* Already unplugged. */
      }
      node.current = null
    },
    [],
  )

  return (
    <audio
      ref={audio}
      /* `src` is attached in an effect above, not here — see the note there. */
      preload="auto"
      crossOrigin="anonymous"
      onLoadedMetadata={() => {
        const element = audio.current
        if (!element) return
        if (startRef.current > 1) element.currentTime = startRef.current
        if (Number.isFinite(element.duration) && element.duration > 0) {
          onDurationRef.current(element.duration)
        }
        setReady(true)
      }}
      onWaiting={() => {
        buffering.current = true
      }}
      onPause={() => {
        buffering.current = false
      }}
      onPlaying={() => {
        buffering.current = false
      }}
      onEnded={onEnded}
      onError={() =>
        onErrorRef.current(
          "That track couldn't be played. It needs to be a direct audio URL the browser can fetch — and the host has to allow it.",
        )
      }
    />
  )
}
