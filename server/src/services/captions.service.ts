import { wordStream, type TimedWord } from './lyricsAlign.js'

/**
 * A YouTube video's own captions, as timed words.
 *
 * Used for one thing: lining lyrics up with the upload that is playing (see
 * lyricsAlign.ts). Asked of YouTube's player API the way its Android app asks,
 * because that is the route that still hands back caption files a server can
 * read — the web player's caption links now need a token only a browser can
 * mint. Anything going wrong here means "no captions", never an error: the
 * lyrics are simply left as the lyric file timed them.
 */

const PLAYER = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false'
const CLIENT = { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 34, hl: 'en' }

type Track = { languageCode?: string; kind?: string; baseUrl?: string; vssId?: string }

const cache = new Map<string, { at: number; value: TimedWord[] | null }>()
const TTL_MS = 1000 * 60 * 60 * 12
const MAX_ENTRIES = 300

export const isVideoId = (raw: unknown): raw is string => typeof raw === 'string' && /^[\w-]{11}$/.test(raw)

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))

/** Both caption formats YouTube serves: `<text start dur>` in seconds, `<p t d>` in milliseconds. */
export function parseCaptionXml(xml: string): { start: number; duration: number; text: string }[] {
  const cues: { start: number; duration: number; text: string }[] = []
  for (const m of xml.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const start = Number(m[1]!.match(/start="([\d.]+)"/)?.[1])
    const duration = Number(m[1]!.match(/dur="([\d.]+)"/)?.[1] ?? 0)
    if (Number.isFinite(start)) cues.push({ start, duration, text: decode(m[2]!) })
  }
  if (cues.length > 0) return cues
  for (const m of xml.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)) {
    const t = Number(m[1]!.match(/\bt="(\d+)"/)?.[1])
    const d = Number(m[1]!.match(/\bd="(\d+)"/)?.[1] ?? 0)
    if (Number.isFinite(t)) cues.push({ start: t / 1000, duration: d / 1000, text: decode(m[2]!) })
  }
  return cues
}

/**
 * The best caption track for matching sung words: someone's own English
 * captions first (they are usually the lyrics), then YouTube's automatic ones,
 * then anything.
 */
function pick(tracks: Track[]): Track | undefined {
  const en = (t: Track) => t.languageCode?.toLowerCase().startsWith('en')
  return tracks.find((t) => en(t) && t.kind !== 'asr') ?? tracks.find((t) => en(t) && t.kind === 'asr') ?? tracks.find((t) => t.kind !== 'asr') ?? tracks[0]
}

async function fetchWords(videoId: string): Promise<TimedWord[] | null> {
  const player = await fetch(PLAYER, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip' },
    body: JSON.stringify({ context: { client: CLIENT }, videoId }),
    signal: AbortSignal.timeout(3500),
  })
  if (!player.ok) return null
  const data = (await player.json()) as { captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: Track[] } } }
  const track = pick(data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [])
  if (!track?.baseUrl) return null

  const file = await fetch(track.baseUrl.replace(/&fmt=[^&]*/, ''), { signal: AbortSignal.timeout(3500) })
  if (!file.ok) return null
  const stream = wordStream(parseCaptionXml(await file.text()))
  return stream.length > 0 ? stream : null
}

/** Timed caption words for a video, or null. Cached — a room asks once per song. */
export async function captionWords(videoId: string): Promise<TimedWord[] | null> {
  if (!isVideoId(videoId)) return null
  const hit = cache.get(videoId)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value
  let value: TimedWord[] | null = null
  try {
    value = await fetchWords(videoId)
  } catch {
    /* Offline, slow, or YouTube changed something: no captions, and the lyrics stay as timed. */
    return null
  }
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(videoId, { at: Date.now(), value })
  return value
}
