import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

import type { PlayerHandle } from '@/features/watch/types'

/**
 * A direct media URL in a plain `<video>`.
 *
 * The best-behaved of the three sources: arbitrary playback rates mean drift is
 * absorbed by running imperceptibly fast or slow instead of seeking, so a
 * client that falls behind catches up without anyone seeing a jump.
 *
 * Handles both shapes a file can arrive in. A plain MP4 the element plays by
 * itself. An HLS playlist it cannot, except on Safari — everywhere else the
 * manifest has to be parsed in JavaScript and the segments fed in, which is
 * what `hls.js` is for. Both end up driving the same `<video>`, so everything
 * downstream — the sync engine, the drift loop, the handle below — is unaware
 * of which one it got.
 */

const isHls = (src: string) => /\.m3u8(\?|$)/i.test(src)

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

  /* Callbacks land in an effect that must not re-run when the parent
     re-renders — attaching HLS twice tears down playback mid-frame. */
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  useEffect(() => {
    setReady(false)
  }, [src])

  /*
   * Attach the media source.
   *
   * Safari plays HLS natively and must be left to do it: running hls.js on top
   * of a player that already understands the format costs a JavaScript
   * transmux for no benefit, and on iOS fullscreen only works properly for the
   * native path.
   */
  useEffect(() => {
    const element = video.current
    if (!element) return

    if (!isHls(src)) {
      element.src = src
      return () => {
        element.removeAttribute('src')
        element.load()
      }
    }

    if (element.canPlayType('application/vnd.apple.mpegurl')) {
      element.src = src
      return () => {
        element.removeAttribute('src')
        element.load()
      }
    }

    if (!Hls.isSupported()) {
      onErrorRef.current("This browser can't play HLS video.")
      return
    }

    const hls = new Hls({
      /* The room decides where playback is, so there is no value in holding a
         long buffer — it only delays the seek when someone scrubs. */
      backBufferLength: 30,
      enableWorker: true,
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      /* Most errors are recoverable and hls.js expects to be told to try:
         a dropped segment or a stalled network is normal on a long film and
         should not end playback. Only a genuinely fatal one surfaces. */
      if (!data.fatal) return

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad()
        return
      }
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError()
        return
      }

      onErrorRef.current("That video couldn't be played — the stream may still be publishing.")
      hls.destroy()
    })

    hls.loadSource(src)
    hls.attachMedia(element)

    return () => hls.destroy()
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

  /* Stop playback hard on unmount — removing the element from the DOM is not
     enough; the browser can keep the media session (and its audio) alive on a
     detached node until GC collects it. */
  useEffect(() => {
    const el = video.current
    return () => {
      if (!el) return
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [])

  return (
    <video
      ref={video}
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
      onError={() => {
        /* With HLS the element's own error is a symptom — hls.js reports the
           real cause through its ERROR event, and reporting both would race
           two different messages onto the screen. */
        if (isHls(src) && !video.current?.canPlayType('application/vnd.apple.mpegurl')) return
        onErrorRef.current(
          "That file couldn't be played. It needs to be a direct video URL the browser can fetch — and the host has to allow it.",
        )
      }}
    />
  )
}
