import { randomInt } from 'node:crypto'
import { env } from '../config/env.js'
import { excluded, officialTier, rankSongs } from './musicRank.js'
import { searchViaPiped, searchYouTube, type SearchResult } from './sources.service.js'
import { catalogueCacheGet, catalogueCacheSet } from './songQuizCache.js'
import { discoverSongs } from './songMetadata.service.js'
import { heardSong, normaliseSongText, songIdentityKey, type SongCategory, type SongIdentity } from './songQuizPacks.js'

export { SONG_CATEGORIES, type SongCategory } from './songQuizPacks.js'
export type CatalogSong = {
  source: 'youtube'; ref: string; title: string; artist: string | null
  artwork: string | null; duration: number | null; category: SongCategory
  year?: number | null; rank?: number
}
export type VideoDetails = { duration: number; embeddable: boolean }
type Inspect = (results: SearchResult[]) => Promise<Map<string, VideoDetails>>
const WEEK = 7 * 86_400_000
const inFlight = new Map<string, Promise<SearchResult[]>>()

/**
 * Up to two dozen lookups per new game. Through the API key that is 2,400 of
 * its 10,000 daily units, so a few games would leave Watch and Listen with no
 * search for the rest of the day. The free instances answer first; the key is
 * only the fallback when they are all down.
 */
const quizSearch: typeof searchYouTube = (query, options) =>
  searchViaPiped(query, options?.music ?? false).catch(() => searchYouTube(query, options))

function shuffled<T>(values: T[], random: (max: number) => number) {
  const out = [...values]
  for (let i = out.length - 1; i > 0; i--) {
    const j = random(i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function artistBalanced(songs: SongIdentity[], random: (max: number) => number) {
  const artists = shuffled([...new Set(songs.map((song) => song.artist))], random)
  // Difficulty should test recognition, not turn the game into deep-cut roulette.
  const piles = artists.map((artist) => shuffled(songs.filter((song) => song.artist === artist && (song.rank ?? 1) <= 40), random))
  const out: SongIdentity[] = []
  while (piles.some((pile) => pile.length)) for (const pile of piles) {
    const song = pile.pop()
    if (song) out.push(song)
  }
  return out.reverse()
}
const identityKey = (song: SongIdentity) => `${normaliseSongText(song.artist)}:${normaliseSongText(song.title)}`
const words = (value: string) => normaliseSongText(value).split(' ').filter(Boolean)

/** A title match alone can be a cover, compilation or another artist. */
export function matchesRecording(result: SearchResult, song: SongIdentity) {
  const query = `${song.title} ${song.artist}`
  if (excluded(result, query) || /\b(jukebox|non[ -]?stop|playlist|collection|medley|mashup|greatest hits|top\s*\d+|hits of|album)\b/i.test(result.title)) return false
  const title = ` ${normaliseSongText(result.title)} `
  const credit = ` ${normaliseSongText(`${result.title} ${result.channel}`)} `
  if (!words(song.title).every((word) => title.includes(` ${word} `))) return false
  if (!words(song.artist).every((word) => credit.includes(` ${word} `))) return false
  return officialTier(result) <= 2
}

export function parseVideoDuration(value: string) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(value)
  return match ? Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0) : 0
}

async function inspectVideos(results: SearchResult[]): Promise<Map<string, VideoDetails>> {
  if (!results.length) return new Map()
  if (!env.youtubeApiKey) return new Map(results.filter((result) => result.duration).map((result) => [result.id, { duration: result.duration!, embeddable: true }]))
  const details = new Map<string, VideoDetails>()
  const ids = [...new Set(results.map((result) => result.id))]
  for (let offset = 0; offset < ids.length; offset += 50) {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos')
    url.searchParams.set('part', 'contentDetails,status')
    url.searchParams.set('id', ids.slice(offset, offset + 50).join(','))
    url.searchParams.set('key', env.youtubeApiKey)
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) })
    if (!response.ok) continue
    const body = await response.json() as { items?: { id: string; contentDetails?: { duration?: string; contentRating?: { ytRating?: string } }; status?: { embeddable?: boolean; uploadStatus?: string } }[] }
    for (const item of body.items ?? []) details.set(item.id, {
      duration: parseVideoDuration(item.contentDetails?.duration ?? ''),
      embeddable: item.status?.embeddable === true && item.status.uploadStatus === 'processed' && item.contentDetails?.contentRating?.ytRating !== 'ytAgeRestricted',
    })
  }
  return details
}

async function candidates(song: SongIdentity, search: typeof searchYouTube) {
  const key = identityKey(song)
  if (search !== quizSearch) return search(`${song.title} ${song.artist} official audio`, { music: true })
  const pending = inFlight.get(key)
  if (pending) return pending
  const job = search(`${song.title} ${song.artist} official audio`, { music: true }).finally(() => inFlight.delete(key))
  inFlight.set(key, job)
  return job
}

export type PoolDependencies = {
  discover?: (category: SongCategory) => Promise<SongIdentity[]>
  search?: typeof searchYouTube
  inspect?: Inspect
  random?: (max: number) => number
  limit?: number
  /** Videos this room has already heard; they only fill in once new songs run out. */
  avoid?: ReadonlySet<string>
}

/** Catalogue identity -> exact upload -> duration/embedding check -> game pool.
 * Upload titles are never used as answers. Caches hold public metadata only.
 */
export async function freshSongPool(categories: SongCategory[], dependencies: PoolDependencies = {}): Promise<CatalogSong[]> {
  const { discover = discoverSongs, search = quizSearch, inspect = inspectVideos, random = randomInt, limit = 15, avoid = new Set<string>() } = dependencies
  const cacheable = search === quizSearch && inspect === inspectVideos
  const libraries = await Promise.allSettled(categories.map(discover))
  const piles = libraries.map((result) => artistBalanced(result.status === 'fulfilled' ? result.value : [], random))
  const identities: SongIdentity[] = []
  while (piles.some((pile) => pile.length)) for (const pile of piles) {
    const song = pile.pop()
    if (song) identities.push(song)
  }
  const cached: CatalogSong[] = []
  const unresolved: SongIdentity[] = []
  const seen = new Set<string>()
  for (const song of identities) {
    const key = identityKey(song)
    if (seen.has(key)) continue
    seen.add(key)
    const hit = cacheable ? await catalogueCacheGet<CatalogSong | null>(`video:${key}`) : undefined
    if (hit) cached.push({ ...hit, category: song.category, year: song.year, rank: song.rank })
    else if (hit !== null) unresolved.push(song)
  }
  /*
   * Lead with songs this room hasn't heard. The catalogue knows hundreds of
   * songs but only the ones already matched to an exact upload are instant,
   * so a game also matches new ones: enough to cover what the room hasn't
   * heard (waited for), plus a few more in the background so the next game
   * has more to choose from. Searches here are the free instances, so growing
   * the catalogue costs no quota.
   */
  const unheard = cached.filter((song) => !heardSong(song, avoid))
  const heard = cached.filter((song) => heardSong(song, avoid))
  // Match unheard identities before spending the search budget on another upload of an old song.
  unresolved.sort((a, b) => Number(avoid.has(songIdentityKey(a))) - Number(avoid.has(songIdentityKey(b))))
  const needed = Math.max(0, limit - unheard.length)
  const budget = needed === 0 ? 0 : Math.min(24, needed * 2 + 4)
  const refs = new Set(cached.map((song) => song.ref))

  async function resolve(songs: SongIdentity[], want: number) {
    const found: CatalogSong[] = []
    for (let offset = 0; offset < songs.length && found.length < want; offset += 4) {
      const batch = songs.slice(offset, offset + 4)
      const settled = await Promise.allSettled(batch.map(async (song) => {
        const query = `${song.title} ${song.artist}`
        const results = await candidates(song, search)
        return { song, results: rankSongs(results.filter((result) => matchesRecording(result, song)), query, 3) }
      }))
      const successful = settled.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
      const details = await inspect(successful.flatMap((result) => result.results))
      for (const { song, results } of successful) {
        const result = results.find((candidate) => {
          const video = details.get(candidate.id)
          return !refs.has(candidate.id) && video?.embeddable && video.duration >= 90 && video.duration <= 540 &&
            (song.duration === null || Math.abs(video.duration - song.duration) <= Math.max(40, song.duration * 0.2))
        })
        const resolved: CatalogSong | null = result ? {
          source: 'youtube', ref: result.id, title: song.title, artist: song.artist,
          artwork: result.thumbnail || null, duration: details.get(result.id)!.duration, category: song.category, year: song.year, rank: song.rank,
        } : null
        if (cacheable) await catalogueCacheSet(`video:${identityKey(song)}`, resolved, resolved ? WEEK : 60 * 60 * 1000)
        if (!resolved) continue
        refs.add(resolved.ref)
        /* Matched now but heard before (an earlier match that expired): a filler, not a lead. */
        if (heardSong(resolved, avoid)) heard.push(resolved)
        else found.push(resolved)
      }
    }
    return found
  }

  const selected = await resolve(unresolved.slice(0, budget), needed)
  if (cacheable) void resolve(unresolved.slice(budget, budget + 8), 8).catch(() => undefined)

  const pool: CatalogSong[] = []
  while (pool.length < limit && (unheard.length || selected.length)) {
    for (const pile of [unheard, selected]) {
      const song = pile.shift()
      if (song && pool.length < limit) pool.push(song)
    }
  }
  /* Nothing new left to match: songs already heard fill the rest. */
  while (pool.length < limit && heard.length) pool.push(heard.shift()!)
  return pool
}
