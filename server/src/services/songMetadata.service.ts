import { env } from '../config/env.js'
import { catalogueCacheGet, catalogueCacheSet } from './songQuizCache.js'
import { SONG_CATEGORIES, isQuizSong, normaliseSongText, songTitle, type SongCategory, type SongIdentity } from './songQuizPacks.js'

type AppleTrack = { kind?: string; trackName?: string; artistName?: string; trackTimeMillis?: number; releaseDate?: string; primaryGenreName?: string }
type LastTrack = { name?: string; artist?: { name?: string }; duration?: string; '@attr'?: { rank?: string } }
const WEEK = 7 * 24 * 60 * 60 * 1000
const pending = new Map<string, Promise<SongIdentity[]>>()
const cursors = new Map<SongCategory, number>()
let appleQueue = Promise.resolve()
let nextAppleRequest = 0

export function appleSongs(tracks: AppleTrack[], artist: string, category: SongCategory): SongIdentity[] {
  const wanted = normaliseSongText(artist)
  return tracks.flatMap((track, index) => {
    if (track.kind !== 'song' || !track.trackName || !track.artistName || !` ${normaliseSongText(track.artistName)} `.includes(` ${wanted} `)) return []
    // A Bollywood singer's Bengali/Tamil/etc. discography is not Bollywood.
    if (category === 'bollywood' && track.primaryGenreName !== 'Bollywood') return []
    const year = Number(track.releaseDate?.slice(0, 4)) || null
    const song: SongIdentity = { title: songTitle(track.trackName), artist, duration: track.trackTimeMillis ? track.trackTimeMillis / 1000 : null, year, category, rank: index + 1 }
    return isQuizSong(song) ? [song] : []
  })
}

export function lastfmSongs(tracks: LastTrack[], artist: string, category: SongCategory): SongIdentity[] {
  return tracks.flatMap((track, index) => {
    if (!track.name || normaliseSongText(track.artist?.name ?? '') !== normaliseSongText(artist)) return []
    const song: SongIdentity = { title: songTitle(track.name), artist, duration: Number(track.duration) || null, year: null, category, rank: Number(track['@attr']?.rank) || index + 1 }
    return isQuizSong(song) ? [song] : []
  })
}

async function appleArtist(artist: string, category: SongCategory) {
  // Apple asks clients to stay near 20 calls/minute. Serialize starts, not games.
  const request = appleQueue.then(async () => {
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, nextAppleRequest - Date.now())))
    nextAppleRequest = Date.now() + 3_100
    const url = new URL('https://itunes.apple.com/search')
    for (const [key, value] of Object.entries({ term: artist, country: SONG_CATEGORIES[category].country, media: 'music', entity: 'song', attribute: 'artistTerm', limit: '40' })) url.searchParams.set(key, value)
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) })
    if (!response.ok) throw new Error('Song catalogue temporarily unavailable')
    const body = await response.json() as { results?: AppleTrack[] }
    return appleSongs(body.results ?? [], artist, category).slice(0, 15)
  })
  appleQueue = request.then(() => undefined, () => undefined)
  return request
}

async function artistSongs(artist: string, category: SongCategory) {
  const key = `artist:${env.lastfmApiKey ? 'lastfm' : 'apple'}:${category}:${artist}`
  const cached = await catalogueCacheGet<SongIdentity[]>(key)
  if (cached) return cached.map((song, index) => ({ ...song, rank: song.rank ?? index + 1 }))
  const existing = pending.get(key)
  if (existing) return existing
  const job = (async () => {
    let songs: SongIdentity[] = []
    // Throwbacks need release years, which artist.getTopTracks does not supply.
    if (env.lastfmApiKey && category !== 'throwbacks') {
      try {
        const url = new URL('https://ws.audioscrobbler.com/2.0/')
        for (const [key, value] of Object.entries({ method: 'artist.gettoptracks', artist, api_key: env.lastfmApiKey, format: 'json', limit: '25', autocorrect: '1' })) url.searchParams.set(key, value)
        const response = await fetch(url, { signal: AbortSignal.timeout(6_000) })
        if (response.ok) {
          const body = await response.json() as { toptracks?: { track?: LastTrack[] } }
          songs = lastfmSongs(body.toptracks?.track ?? [], artist, category)
        }
      } catch { /* Fall back to public metadata; never to broad video search. */ }
    }
    if (category === 'bollywood') {
      const classified = await appleArtist(artist, category)
      const popular = new Set(songs.map((song) => normaliseSongText(song.title)))
      songs = [...classified.filter((song) => popular.has(normaliseSongText(song.title))), ...classified.filter((song) => !popular.has(normaliseSongText(song.title)))]
    } else if (songs.length < 4) songs = await appleArtist(artist, category)
    if (songs.length) await catalogueCacheSet(key, songs, WEEK)
    return songs
  })().finally(() => pending.delete(key))
  pending.set(key, job)
  return job
}

/** Rotate artists as the catalogue grows; reuse all already discovered songs. */
export async function discoverSongs(category: SongCategory): Promise<SongIdentity[]> {
  const artists = SONG_CATEGORIES[category].artists
  const cursor = cursors.get(category) ?? Math.floor(Date.now() / 86_400_000) % artists.length
  cursors.set(category, (cursor + 2) % artists.length)
  const selected = [artists[cursor]!, artists[(cursor + 1) % artists.length]!]
  const existing = await Promise.all(artists.map((artist) => catalogueCacheGet<SongIdentity[]>(`artist:${env.lastfmApiKey ? 'lastfm' : 'apple'}:${category}:${artist}`)))
  const cached = existing.flatMap((songs) => songs?.map((song, index) => ({ ...song, rank: song.rank ?? index + 1 })) ?? [])
  const discovery = Promise.allSettled(selected.map((artist) => artistSongs(artist, category)))
  // Already playable: grow the catalogue in the background instead of making
  // each rematch wait on another metadata provider request.
  const fresh = cached.length >= 20 ? [] : await discovery
  const unique = new Map<string, SongIdentity>()
  for (const song of [...cached, ...fresh.flatMap((result) => result.status === 'fulfilled' ? result.value : [])]) {
    unique.set(`${normaliseSongText(song.title)}:${normaliseSongText(song.artist)}`, song)
  }
  return [...unique.values()]
}
