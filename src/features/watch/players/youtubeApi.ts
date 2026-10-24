/**
 * The YouTube IFrame Player API, loaded on demand.
 *
 * Not imported at module scope anywhere — the script only downloads once
 * somebody actually opens a YouTube video, the same lazy-gate philosophy as
 * three.js in the hub. Nobody pays for it just by being signed in.
 */

/* Minimal surface, hand-typed rather than pulling in @types/youtube for the
   handful of members this adapter touches. */
export type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  getVideoUrl: () => string
  loadVideoById: (options: { videoId: string; startSeconds?: number }) => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  /** 0–100, unlike every other volume in this codebase. */
  setVolume: (level: number) => void
  getVolume: () => number
  /*
   * The captions module. Not in YouTube's published reference, but the same
   * calls its own player makes: load the module, read its track list, pick a
   * track by language — or an empty track to hide captions.
   */
  loadModule?: (module: 'captions') => void
  getOption?: (module: 'captions', option: 'tracklist') => YTCaptionTrack[] | undefined
  setOption?: (module: 'captions', option: 'track', value: { languageCode?: string }) => void
  destroy: () => void
}

export type YTCaptionTrack = { languageCode: string; displayName?: string; languageName?: string; kind?: string }

export type YTNamespace = {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: { target: YTPlayer }) => void
        onStateChange?: (event: { data: number; target: YTPlayer }) => void
        onError?: (event: { data: number; target: YTPlayer }) => void
        onAutoplayBlocked?: () => void
        /** A module (captions, for one) finished loading and can be asked things. */
        onApiChange?: (event: { target: YTPlayer }) => void
      }
    },
  ) => YTPlayer
  PlayerState: {
    UNSTARTED: number
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const SRC = 'https://www.youtube.com/iframe_api'

let pending: Promise<YTNamespace> | null = null

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (pending) return pending

  pending = new Promise<YTNamespace>((resolve, reject) => {
    /*
     * The API signals readiness through a single global callback, so anything
     * else on the page that also waits on it has to be chained rather than
     * clobbered.
     */
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('YouTube API loaded without a Player'))
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`)
    if (existing) return

    const script = document.createElement('script')
    script.src = SRC
    script.async = true
    script.onerror = () => reject(new Error('Could not load the YouTube player'))
    document.head.appendChild(script)
  })

  /* A failed load must not be cached, or every later attempt inherits it. */
  pending.catch(() => {
    pending = null
  })

  return pending
}

/** Human-readable reasons for the numeric codes `onError` reports. */
export function youtubeError(code: number) {
  switch (code) {
    case 2:
      return 'YouTube rejected that video id.'
    case 5:
      return "This video can't play in an embedded player."
    case 100:
      return 'That video is private or no longer exists.'
    case 101:
    case 150:
      return "The uploader doesn't allow this video to be embedded. Try another."
    default:
      return 'YouTube could not play that video.'
  }
}
