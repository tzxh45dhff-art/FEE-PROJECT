import posterData from '@/data/posters.json'
import { SCREEN_YOUTUBE, type ScreenSlot } from '@/data/screens'

/* ── Drop-in videos ───────────────────────────────────────────────
   Any file in src/assets/videos/ named after a device slot is used
   for that device. See that folder's README.                       */

const videoModules = import.meta.glob('../assets/videos/*.{mp4,webm,mov}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const VIDEO_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(videoModules).map(([filePath, url]) => [
    filePath
      .split('/')
      .pop()!
      .replace(/\.(mp4|webm|mov)$/i, '')
      .toLowerCase(),
    url,
  ]),
)

export function videoUrl(slot: string): string | undefined {
  return VIDEO_URLS[slot.toLowerCase()]
}

/* ── Still fallbacks ──────────────────────────────────────────────
   Backdrops are proper 16:9 frames. Posters are 2:3 and get cropped,
   which is worse but still reads as "something is playing" — they
   only get used when `npm run posters` hasn't fetched backdrops yet. */

type Still = { src: string; title: string }

/* Casts needed because the committed JSON can ship these arrays empty, which
   TS infers as never[] until `npm run posters` fills them in. */
const backdropEntries = (posterData.backdrops ?? []) as { path: string; title: string }[]

const backdrops: Still[] = backdropEntries.map((entry) => ({
  src: posterData.backdropBase + entry.path,
  title: entry.title,
}))

const posters: Still[] = posterData.posters.map((entry) => ({
  src: posterData.imageBase + entry.path,
  title: entry.title,
}))

export const hasBackdrops = backdrops.length > 0

/**
 * A still for a device screen. Prefers a real 16:9 backdrop; falls back to a
 * cropped poster; returns undefined only when there is no artwork at all.
 */
export function screenStill(index: number): Still | undefined {
  if (backdrops.length > 0) return backdrops[index % backdrops.length]
  if (posters.length > 0) return posters[(index * 7) % posters.length]
  return undefined
}

/* ── Real footage ─────────────────────────────────────────────────
   TMDB indexes each title's official YouTube trailer. Those are
   publisher-uploaded and embeddable, so they're how the mockups show
   actual film footage without hosting anyone's content.             */

type ScreenEntry = { youtubeId: string; backdrop: string; title: string }

const screenEntries = (posterData.screens ?? []) as ScreenEntry[]

export type ScreenSource = {
  video?: string
  youtubeId?: string
  still?: string
  title?: string
}

/**
 * Everything a device screen might play, in priority order: a dropped-in video
 * file wins, then a pinned or fetched trailer, then artwork.
 */
export function screenSource(slot: string, index: number): ScreenSource {
  const entry = screenEntries.length > 0 ? screenEntries[index % screenEntries.length] : undefined
  const pinned = SCREEN_YOUTUBE[slot as ScreenSlot]

  return {
    video: videoUrl(slot),
    youtubeId: pinned || entry?.youtubeId,
    still: entry ? posterData.backdropBase + entry.backdrop : screenStill(index)?.src,
    title: entry?.title,
  }
}
