import type { SearchResult } from './sources.service.js'

/**
 * Song search that finds the song.
 *
 * Search a title on YouTube and the first page is as likely to be a reaction,
 * a slowed-and-reverb edit, a cover or a fan's lyric video as the record
 * itself — and every one of those is a different recording, with its own
 * intro, its own tempo, and lyrics that land in the wrong place. So results
 * are ranked by how official the upload is, and the obvious not-the-song
 * kinds are left out — unless the search asked for exactly that kind, in
 * which case the person knows what they want.
 *
 * Official, best first:
 *   0  YouTube's own "Artist - Topic" art tracks: the studio master, which is
 *      also what lyric files are timed against.
 *   1  The artist's official audio — the record, without a video's opening.
 *   2  Other official uploads: VEVO, verified channels, the artist's own
 *      videos. Often with an intro, which the lyrics then have to allow for.
 *   3  Everything else that isn't one of the excluded kinds.
 */

const KINDS: { word: RegExp; asked: RegExp }[] = [
  { word: /\breact(ion|ing|s)?\b/i, asked: /\breact/i },
  { word: /\bcover(ed)?\b/i, asked: /\bcover/i },
  { word: /\bkaraoke\b/i, asked: /\bkaraoke\b/i },
  { word: /\binstrumental\b/i, asked: /\binstrumental\b/i },
  { word: /\bslowed\b|\breverb\b/i, asked: /\bslowed\b|\breverb\b/i },
  { word: /\bsped\s*up\b|\bspeed\s*up\b/i, asked: /\bsped\b|\bspeed\b/i },
  { word: /\bnightcore\b/i, asked: /\bnightcore\b/i },
  { word: /\b8d\b/i, asked: /\b8d\b/i },
  { word: /\b(1|one|10)\s*hours?\b|\bloop(ed)?\b/i, asked: /\bhours?\b|\bloop/i },
  { word: /\bmash\s*-?up\b/i, asked: /\bmash/i },
  { word: /\bremix(es)?\b|\bbootleg\b|\bedit\b/i, asked: /\bremix|\bbootleg\b|\bedit\b/i },
  { word: /\blive\b|\bconcert\b|\bunplugged\b|\btour\b/i, asked: /\blive\b|\bconcert\b|\bunplugged\b|\btour\b/i },
  { word: /\btutorial\b|\blesson\b|\bhow to (play|sing)\b/i, asked: /\btutorial\b|\blesson\b|\bhow to\b/i },
  { word: /\bfanmade\b|\bfan[- ]made\b|\bamv\b/i, asked: /\bfan\b|\bamv\b/i },
  { word: /\bbehind\s+the\s+scenes\b|\bmaking\s+of\b|\bbts\b/i, asked: /\bbehind\b|\bmaking\b/i },
  { word: /\bteaser\b|\btrailer\b|\bsnippet\b|\bpreview\b|\binterview\b|#shorts\b/i, asked: /\bteaser\b|\btrailer\b|\bsnippet\b|\bpreview\b|\binterview\b|\bshorts\b/i },
]

const OFFICIAL_TITLE = /\bofficial\s*(music\s*)?(audio|video|lyric\s*video|visuali[sz]er)\b/i

/** Not the record, and not what was asked for. */
export function excluded(result: Pick<SearchResult, 'title'>, query: string) {
  return KINDS.some((kind) => kind.word.test(result.title) && !kind.asked.test(query))
}

export function officialTier(result: SearchResult): 0 | 1 | 2 | 3 {
  const channel = result.channel.trim()
  /* Song-catalogue results are the auto-generated "Artist - Topic" tracks; the
     keyless instances just report the channel without the suffix. */
  if (result.track || /\s-\sTopic$/i.test(channel)) return 0
  /* "Artist - Song" uploaded by the artist's own channel. */
  const lead = result.title.split(/\s[-–—]\s/)[0]?.trim().toLowerCase()
  const own = Boolean(lead && channel && lead === channel.toLowerCase())
  const official = /vevo$/i.test(channel) || result.verified || OFFICIAL_TITLE.test(result.title) || own
  if (!official) return 3
  return /\baudio\b/i.test(result.title) ? 1 : 2
}

const NOISE = new Set(['official', 'audio', 'video', 'music', 'lyric', 'lyrics', 'visualizer', 'visualiser', 'hd', 'hq', '4k', 'full', 'song', 'ft', 'feat', 'featuring', 'topic', 'vevo', 'the', 'a', 'an', 'of', 'and', 'by', 'x'])

const tokens = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&[a-z]+;|&#\d+;/g, ' ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\u0900-\u097f]+/g, ' ')
    .split(' ')
    .filter((w) => w && !NOISE.has(w))

/** The song's name as the upload states it: no brackets, no "| credits | movie | 4K" tail. */
const coreTitle = (title: string) => title.replace(/\([^)]*\)|\[[^\]]*\]|"[^"]*"|&quot;.*?&quot;/g, ' ').split(/\s*\|/)[0] ?? title

/**
 * How well a result is the thing searched for: every searched word should be
 * somewhere in its title or channel, and the title should not carry words the
 * search didn't — "Kesariya Rangu" is a different song from "Kesariya".
 */
function relevance(result: SearchResult, query: string) {
  const wanted = tokens(query)
  const have = new Set([...tokens(result.title), ...tokens(result.channel)])
  const covered = wanted.every((w) => have.has(w) || [...have].some((h) => h.length >= 4 && (h.startsWith(w) || w.startsWith(h))))
  const asked = new Set([...wanted, ...tokens(result.channel)])
  const extra = tokens(coreTitle(result.title)).filter((w) => !asked.has(w)).length
  return { covered, closeness: extra === 0 ? 0 : extra <= 2 ? 1 : 2 }
}

/**
 * The song searched for first, the most official upload of it first among
 * those, YouTube's own order after that; the excluded kinds dropped. If that
 * would leave almost nothing, the excluded ones come back at the end rather
 * than showing an empty page.
 */
export function rankSongs(results: SearchResult[], query: string, keep = 12): SearchResult[] {
  const kept = results.filter((r) => !excluded(r, query))
  const ranked = kept
    .map((r, i) => ({ r, i, tier: officialTier(r), ...relevance(r, query) }))
    .sort((a, b) => Number(b.covered) - Number(a.covered) || a.closeness - b.closeness || a.tier - b.tier || a.i - b.i)
    .map(({ r }) => r)
  if (ranked.length >= 4) return ranked.slice(0, keep)
  return [...ranked, ...results.filter((r) => excluded(r, query))].slice(0, keep)
}

/**
 * What kind of upload a result is, in a word or two — so three results that
 * all tidy to "Eyes Wide — Alfie Jukes" can still be told apart.
 */
export function uploadKind(result: SearchResult): string | null {
  const title = result.title
  if (/\s-\sTopic$/i.test(result.channel.trim())) return 'Studio'
  if (/\blive\b|\bconcert\b|\bunplugged\b/i.test(title)) return 'Live'
  if (/\blyric(s|al)?\b/i.test(title)) return officialTier(result) <= 2 ? 'Official lyric video' : 'Lyric video'
  if (/\baudio\b/i.test(title)) return officialTier(result) <= 2 ? 'Official audio' : 'Audio'
  if (/\bvisuali[sz]er\b/i.test(title)) return 'Visualizer'
  if (officialTier(result) <= 2) return 'Music video'
  return null
}
