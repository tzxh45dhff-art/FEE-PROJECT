import { rankSongs } from './musicRank.js'
import { searchViaPiped, type SearchResult } from './sources.service.js'
import { cleanTrackName } from './trackName.js'
import { HttpError } from '../utils/HttpError.js'

/**
 * Bringing a Spotify or Apple Music playlist into the room.
 *
 * Neither service will play here — there is no embed that syncs across a room
 * and no account to sign in with — so an import is a list of names, not of
 * recordings. Each name is then looked up on YouTube Music and the room plays
 * that. What comes across is the running order and the taste, which is what a
 * playlist actually is.
 *
 * Both lists are read from the public pages the services serve to anyone who
 * opens the link, so no keys are needed. Those pages carry at most the first
 * hundred songs, and that limit is passed on rather than worked around.
 */

export type ExternalTrack = {
  title: string
  artist: string | null
  /** Seconds, when the service said. Used to tell the song from a long edit of it. */
  duration: number | null
}

export type ExternalPlaylist = {
  service: 'spotify' | 'apple'
  name: string
  tracks: ExternalTrack[]
}

const LIMIT = 100

const BROWSER_HEADERS = {
  /* Both services serve a stripped page, or none, to anything that does not
     look like a browser. */
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
}

type Link = { service: 'spotify'; kind: 'playlist' | 'album'; id: string } | { service: 'apple'; url: string }

/** Which service and which list a pasted link points at, or null if neither. */
export function parsePlaylistLink(raw: string): Link | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')

  if (host === 'open.spotify.com' || host === 'play.spotify.com') {
    /* `/intl-de/playlist/…` and `/embed/playlist/…` are the same list. */
    const match = /\/(playlist|album)\/([A-Za-z0-9]+)/.exec(url.pathname)
    if (!match) return null
    return { service: 'spotify', kind: match[1] as 'playlist' | 'album', id: match[2]! }
  }

  if (host === 'music.apple.com' || host === 'embed.music.apple.com') {
    if (!/\/(playlist|album)\//.test(url.pathname)) return null
    /* The embed host serves the same path without the data in it. */
    return { service: 'apple', url: `https://music.apple.com${url.pathname}` }
  }

  return null
}

/** Whether this looks like a playlist link at all — short links included. */
export const isPlaylistLink = (raw: string) =>
  parsePlaylistLink(raw) !== null || /^https?:\/\/(spotify\.link|spoti\.fi)\//i.test(raw.trim())

async function fetchPage(url: string) {
  let response: Response
  try {
    response = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10_000) })
  } catch {
    throw HttpError.badGateway('Could not reach that playlist. Check the link and try again.')
  }
  if (response.status === 404) {
    throw HttpError.badRequest('That playlist does not exist, or it is private. Make it public and try again.')
  }
  if (!response.ok) throw HttpError.badGateway(`The music service answered ${response.status}. Try again in a moment.`)
  return { html: await response.text(), finalUrl: response.url }
}

function jsonScript(html: string, id: string): unknown {
  const pattern = new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`)
  const body = pattern.exec(html)?.[1]
  if (!body) return null
  try {
    return JSON.parse(body)
  } catch {
    return null
  }
}

const seconds = (ms: unknown) => (typeof ms === 'number' && ms > 0 ? Math.round(ms / 1000) : null)

/** Spotify's embed page carries the list as Next.js page data. */
export function parseSpotifyEmbed(html: string): ExternalPlaylist | null {
  const data = jsonScript(html, '__NEXT_DATA__') as {
    props?: { pageProps?: { state?: { data?: { entity?: Record<string, unknown> } } } }
  } | null
  const entity = data?.props?.pageProps?.state?.data?.entity
  if (!entity || !Array.isArray(entity.trackList)) return null

  const tracks = (entity.trackList as Record<string, unknown>[])
    .filter((item) => typeof item.title === 'string' && item.title.trim())
    .map((item) => ({
      title: String(item.title).trim(),
      artist: typeof item.subtitle === 'string' && item.subtitle.trim() ? item.subtitle.trim() : null,
      duration: seconds(item.duration),
    }))

  return {
    service: 'spotify',
    name: String(entity.name ?? entity.title ?? 'Spotify playlist'),
    tracks,
  }
}

/** Apple Music's page carries the list in its serialised server data. */
export function parseAppleMusic(html: string): ExternalPlaylist | null {
  const data = jsonScript(html, 'serialized-server-data') as {
    data?: { data?: { sections?: { itemKind?: string; items?: Record<string, unknown>[] }[] } }[]
  } | null
  const sections = data?.data?.[0]?.data?.sections
  if (!Array.isArray(sections)) return null

  const header = sections.find((section) => section.itemKind === 'containerDetailHeaderLockup')?.items?.[0]
  const list = sections.find((section) => section.itemKind === 'trackLockup')?.items
  if (!list) return null

  const names = (links: unknown) =>
    Array.isArray(links)
      ? links.map((link) => (link as { title?: unknown }).title).filter((t): t is string => typeof t === 'string')
      : []

  /* An album's rows name no artist — it is the one in the header. */
  const albumArtist = names(header?.subtitleLinks).join(', ') || null

  const tracks = list
    .filter((item) => typeof item.title === 'string' && item.title.trim())
    .map((item) => {
      const artist =
        names(item.subtitleLinks).join(', ') ||
        (typeof item.artistName === 'string' ? item.artistName : '') ||
        albumArtist
      return { title: String(item.title).trim(), artist: artist || null, duration: seconds(item.duration) }
    })

  return {
    service: 'apple',
    name: typeof header?.title === 'string' ? header.title : 'Apple Music playlist',
    tracks,
  }
}

/** Read the list behind a Spotify or Apple Music link. */
export async function readExternalPlaylist(raw: string): Promise<ExternalPlaylist> {
  let link = parsePlaylistLink(raw)

  /* Share sheets hand out short links; where they land is the real one. */
  if (!link && isPlaylistLink(raw)) {
    const { finalUrl } = await fetchPage(raw.trim())
    link = parsePlaylistLink(finalUrl)
  }

  if (!link) {
    throw HttpError.badRequest('Paste a Spotify or Apple Music playlist (or album) link.')
  }

  const result =
    link.service === 'spotify'
      ? parseSpotifyEmbed((await fetchPage(`https://open.spotify.com/embed/${link.kind}/${link.id}`)).html)
      : parseAppleMusic((await fetchPage(link.url)).html)

  if (!result) {
    throw HttpError.badGateway('Could not read that playlist. If it is private, make it public and try again.')
  }
  if (result.tracks.length === 0) throw HttpError.badRequest('That playlist is empty.')

  return { ...result, tracks: result.tracks.slice(0, LIMIT) }
}

/* ── Finding each song on YouTube Music ───────────────────────────────── */

export type MatchedTrack = {
  source: 'youtube'
  ref: string
  title: string
  artist: string | null
  album: null
  artwork: string
  duration: number | null
}

/**
 * The best of a search's results for one song, or null if none is it.
 *
 * Ranking already prefers the studio track and drops covers and edits; on top
 * of that the length decides between near-equals, since a song's length is the
 * one fact both services agree on exactly and an extended mix gets it wrong.
 */
export function pickMatch(results: SearchResult[], wanted: ExternalTrack): SearchResult | null {
  const query = [wanted.title, wanted.artist].filter(Boolean).join(' ')
  const ranked = rankSongs(results, query).slice(0, 6)
  if (ranked.length === 0) return null
  if (!wanted.duration) return ranked[0]!

  const close = ranked.find((result) => result.duration && Math.abs(result.duration - wanted.duration!) <= 8)
  if (close) return close

  /* Nothing close: take the top result unless its length says it is a
     different recording entirely (a ten-minute mix of a three-minute song). */
  const top = ranked[0]!
  if (top.duration && Math.abs(top.duration - wanted.duration) > Math.max(45, wanted.duration * 0.35)) {
    return ranked.find((result) => !result.duration) ?? null
  }
  return top
}

/**
 * Look one song up.
 *
 * Keyless search only, on purpose: a hundred-song import through the API key
 * would spend most of the day's shared quota in one go and leave the room's
 * search box dead. YouTube Music's song search first, then ordinary videos for
 * anything it does not carry.
 */
export async function findOnYouTube(wanted: ExternalTrack): Promise<MatchedTrack | null> {
  const query = [wanted.artist?.split(',')[0], wanted.title].filter(Boolean).join(' ')

  for (const music of [true, false]) {
    let results: SearchResult[]
    try {
      results = await searchViaPiped(query, music)
    } catch {
      continue
    }
    const hit = pickMatch(results, wanted)
    if (!hit) continue

    const named = cleanTrackName(hit.title, hit.channel)
    return {
      source: 'youtube',
      ref: hit.id,
      /* The service's own name is the clean one — an upload's title is not. */
      title: wanted.title || named.title,
      artist: wanted.artist ?? named.artist,
      album: null,
      artwork: hit.thumbnail,
      duration: hit.duration ?? wanted.duration,
    }
  }
  return null
}

/* ── The import itself ────────────────────────────────────────────────── */

export type ImportProgress = {
  total: number
  done: number
  found: number
  /** "Title — Artist" for every song nothing was found for. */
  missed: string[]
  finished: boolean
}

/**
 * Imports in flight, and recently finished, by playlist id.
 *
 * In memory: progress is only interesting while someone is watching it, and a
 * restart mid-import leaves an ordinary playlist with the songs found so far,
 * which is a fine thing to be left with.
 */
const progress = new Map<string, ImportProgress>()
const KEEP_RESULT_MS = 10 * 60 * 1000
const CONCURRENCY = 4

export const importProgress = (playlistId: string) => progress.get(playlistId) ?? null

type ImportHooks = {
  createPlaylist: (name: string) => Promise<{ id: string }>
  place: (playlistId: string, track: MatchedTrack, position: number) => Promise<unknown>
  /** Called as songs land, throttled, and once at the end. */
  changed: () => void
}

/**
 * Read the list, make the playlist, and answer — then find the songs.
 *
 * Finding a hundred songs takes the better part of a minute, which is far too
 * long to hold a request open and leave someone staring at a spinner. The
 * playlist exists the moment the list is read, and fills in while the room
 * watches.
 */
export async function startImport(link: string, hooks: ImportHooks) {
  const external = await readExternalPlaylist(link)
  const playlist = await hooks.createPlaylist(external.name.slice(0, 120))

  const state: ImportProgress = { total: external.tracks.length, done: 0, found: 0, missed: [], finished: false }
  progress.set(playlist.id, state)

  void (async () => {
    let lastPing = 0
    const ping = () => {
      if (Date.now() - lastPing < 1200) return
      lastPing = Date.now()
      hooks.changed()
    }

    let next = 0
    const worker = async () => {
      while (next < external.tracks.length) {
        const index = next++
        const wanted = external.tracks[index]!
        try {
          const match = await findOnYouTube(wanted)
          if (match) {
            await hooks.place(playlist.id, match, index)
            state.found++
          } else {
            state.missed.push([wanted.title, wanted.artist].filter(Boolean).join(' — '))
          }
        } catch {
          state.missed.push([wanted.title, wanted.artist].filter(Boolean).join(' — '))
        }
        state.done++
        ping()
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    state.finished = true
    hooks.changed()
    setTimeout(() => progress.delete(playlist.id), KEEP_RESULT_MS).unref?.()
  })()

  return { playlistId: playlist.id, total: state.total, service: external.service }
}
