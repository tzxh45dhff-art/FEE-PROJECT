export type WatchSource = 'youtube' | 'file' | 'external'

export type WatchAction = 'load' | 'play' | 'pause' | 'seek' | 'rate' | 'advance' | 'open'

export type WatchItem = {
  id: string
  source: WatchSource
  /** YouTube video id, a direct media URL, or a free-text title. */
  ref: string
  title: string
  duration: number | null
  thumbnail: string | null
}

export type QueueItem = WatchItem & {
  position: number
  addedBy: { id: string; name: string }
}

export type Viewer = { id: string; name: string }

/** The server's authoritative view, as it arrives on the socket. */
export type WatchSnapshot = {
  roomId: string
  item: WatchItem | null
  playing: boolean
  position: number
  rate: number
  /** Monotonic within an epoch. Anything below what we've applied is stale. */
  seq: number
  /** Changes when `seq` restarts, so a restarted session isn't read as stale. */
  epoch: number
  by: { id: string; name: string; action: WatchAction } | null
  viewers: Viewer[]
  serverTime: number
}

export type ResolvedSource = {
  source: WatchSource
  ref: string
  title: string
  duration: number | null
  thumbnail: string | null
  /** Present when a platform can't be embedded, explaining what happens instead. */
  note?: string
}

export type SearchResult = {
  id: string
  title: string
  channel: string
  thumbnail: string
}

/**
 * What a player adapter has to be able to do.
 *
 * Every source implements the same handle, so the sync engine never needs to
 * know whether it is driving a YouTube iframe, an HTML5 `<video>`, or nothing
 * at all — which is what leaves room for Vimeo or Twitch to drop in later.
 */
export type PlayerHandle = {
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
  setRate: (rate: number) => void
  /** Seconds into the media, or 0 before it is ready. */
  getPosition: () => number
  getDuration: () => number
  /**
   * True while stalled. Drift correction has to stand down during a buffer, or
   * it fights the loading and seek-loops.
   */
  isBuffering: () => boolean
  /**
   * Whether arbitrary playback rates are honoured. HTML5 video can be nudged
   * to 1.03 to soak up small drift; YouTube only accepts a fixed set, so it
   * has to correct by seeking instead.
   */
  supportsFineRate: boolean
}

export const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const secs = whole % 60

  const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes)
  return `${hours > 0 ? `${hours}:` : ''}${mm}:${String(secs).padStart(2, '0')}`
}
