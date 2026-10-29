import {
  freshSongPool,
  SONG_CATEGORIES,
  type CatalogSong,
  type SongCategory,
} from '../services/songQuizCatalog.service.js'
import { shuffle, type Ctx, type GameDef } from './engine.js'
import { quizGame, type Quiz, type QuizItem, type QuizOptions } from './quiz.js'
import { discoverSongs } from '../services/songMetadata.service.js'
import { seenFor } from '../services/seen.service.js'
import { heardSong, normaliseSongText, songIdentityKey, songLanguage, type SongIdentity } from '../services/songQuizPacks.js'

/**
 * Guess the Song, from a fresh game-only YouTube catalogue.
 *
 * The room's queue, playlists, likes and listening history are deliberately
 * absent from this module. The host chooses up to three packs, the server
 * searches and caches a broad pool for them, then the normal quiz engine keeps
 * the answer private and opens the same clip for everybody at the same time.
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'ramp'
export type Song = CatalogSong

type Options = QuizOptions & {
  categories: SongCategory[]
  difficulty: Difficulty
  pool: Song[]
  choices?: SongIdentity[]
}

export const MIN_SONGS = 4
export const SONG_DIFFICULTIES = ['easy', 'medium', 'hard', 'ramp'] as const

const ALL_CATEGORIES = Object.keys(SONG_CATEGORIES) as SongCategory[]
const LEVEL = {
  easy: { seconds: 15, label: 'Easy' },
  medium: { seconds: 10, label: 'Medium' },
  hard: { seconds: 6, label: 'Hard' },
} as const
type Level = keyof typeof LEVEL

/** "Kesariya | Brahmastra | Official Video" → "Kesariya". */
function tidy(title: string) {
  const short = title.split(/\s+[|•]\s+/)[0]!.trim()
  return (short.length > 70 ? `${short.slice(0, 67)}…` : short) || title.slice(0, 70)
}

const key = (title: string) => title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

/** One song per title — two uploads of it would create two right answers. */
export function distinctSongs(songs: Song[]): Song[] {
  const seen = new Set<string>()
  const out: Song[] = []
  for (const song of songs) {
    const title = tidy(song.title)
    const k = key(title)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push({ ...song, title })
  }
  return out
}

function roundLevel(mode: Difficulty, round: number, rounds: number): Level {
  if (mode !== 'ramp') return mode
  const progress = rounds <= 1 ? 0 : round / (rounds - 1)
  return progress < 0.34 ? 'easy' : progress < 0.67 ? 'medium' : 'hard'
}

/** Past the intro, with wider and shorter samples as the game gets harder. */
function clipStart(song: Song, level: Level, ctx: Ctx) {
  const d = song.duration
  if (!d || d <= 0) {
    const [from, width] = level === 'easy' ? [45, 31] : level === 'medium' ? [30, 61] : [20, 91]
    return from + ctx.random(width)
  }

  const seconds = LEVEL[level].seconds
  if (d <= seconds + 8) return 0
  const from = Math.max(8, Math.floor(d * (level === 'easy' ? 0.3 : level === 'hard' ? 0.12 : 0.22)))
  const to = Math.max(from + 1, Math.floor(d * (level === 'easy' ? 0.58 : 0.72)) - seconds)
  return from + ctx.random(to - from)
}

function balancedOrder(pool: Song[], rounds: number, ctx: Ctx) {
  const categories = shuffle([...new Set(pool.map((song) => song.category))], ctx)
  const piles = new Map(categories.map((category) => [category, shuffle(pool.filter((song) => song.category === category), ctx)]))
  const drawn: Song[] = []
  for (let i = 0; drawn.length < rounds && [...piles.values()].some((pile) => pile.length > 0); i++) {
    const pile = piles.get(categories[i % categories.length]!)!
    // Avoid a run of the same voice when the pack has other artists ready.
    const previous = drawn.at(-1)?.artist
    const hasFresh = [...piles.values()].some((songs) => songs.some((song) => !heardSong(song, ctx.seen)))
    const allowed = (song: Song) => !hasFresh || !heardSong(song, ctx.seen)
    let index = pile.findIndex((song) => allowed(song) && song.artist !== previous)
    if (index < 0) index = pile.findIndex(allowed)
    if (index < 0) continue
    const next = pile.splice(index, 1)[0]
    if (next) drawn.push(next)
  }
  return drawn
}

type ChoiceSong = Pick<Song, 'title' | 'artist' | 'category' | 'year'>

export function distractors(song: Song, library: readonly ChoiceSong[], level: Level, ctx: Pick<Ctx, 'random'>) {
  const seen = new Set([normaliseSongText(song.title)])
  const candidates = shuffle(library, ctx).filter((candidate) => {
    const title = normaliseSongText(candidate.title)
    if (!title || seen.has(title) || candidate.category !== song.category || songLanguage(candidate.category, candidate.artist) !== songLanguage(song.category, song.artist)) return false
    seen.add(title)
    return true
  })
  const sameArtist = (candidate: ChoiceSong) => !!song.artist && normaliseSongText(candidate.artist ?? '') === normaliseSongText(song.artist)
  const closeness = (candidate: ChoiceSong) => {
    const artist = sameArtist(candidate) ? 100 : 0
    const era = song.year && candidate.year ? Math.max(0, 20 - Math.abs(song.year - candidate.year)) : 0
    return artist + era
  }
  candidates.sort((a, b) => closeness(b) - closeness(a))
  const siblings = candidates.filter(sameArtist)
  const neighbours = candidates.filter((candidate) => !sameArtist(candidate))
  const count = level === 'easy' ? 2 : 3
  // Keep the language/pack consistent and make knowing the singer insufficient.
  const preferred = siblings.slice(0, count)
  return [...preferred, ...neighbours, ...siblings.slice(count)].slice(0, 3)
}

export function songItems(pool: Song[], rounds: number, difficulty: Difficulty, ctx: Ctx, choices: readonly ChoiceSong[] = pool): QuizItem[] {
  const eligible = pool.filter((song) => distractors(song, choices, 'hard', ctx).length === 3)
  const order = balancedOrder(eligible, rounds, ctx)
  return order.map((song, i) => {
    const level = roundLevel(difficulty, i, order.length)
    const others = distractors(song, choices, level, ctx)
    const options = shuffle([song.title, ...others.map((other) => other.title)], ctx)
    return {
      prompt: 'Name that song',
      tag: SONG_CATEGORIES[song.category].label,
      category: song.category,
      difficulty: LEVEL[level].label,
      seconds: LEVEL[level].seconds,
      options,
      answer: options.indexOf(song.title),
      repeatKeys: [songIdentityKey(song)],
      media: { source: song.source, ref: song.ref, start: clipStart(song, level, ctx) },
      reveal: { title: song.title, artist: song.artist, artwork: song.artwork },
    }
  })
}

const base = quizGame<Options>({
  id: 'songquiz',
  label: 'Guess the song',
  readyMs: 1_500,

  options(raw) {
    const body = (raw ?? {}) as { rounds?: unknown; categories?: unknown; difficulty?: unknown; lateJoin?: unknown }
    const rounds = [5, 10, 15].includes(body.rounds as number) ? (body.rounds as number) : 10
    const categories = Array.isArray(body.categories)
      ? ALL_CATEGORIES.filter((category) => (body.categories as unknown[]).includes(category))
      : (['bollywood', 'punjabi', 'global'] satisfies SongCategory[])
    if (categories.length === 0) return { error: 'Pick at least one music pack' }
    if (categories.length > 3) return { error: 'Pick up to three music packs' }
    const difficulty = SONG_DIFFICULTIES.includes(body.difficulty as Difficulty) ? (body.difficulty as Difficulty) : 'medium'
    return { rounds, seconds: 10, categories, difficulty, pool: [], lateJoin: body.lateJoin !== false }
  },

  async prepare(roomId, options) {
    const discovered = await Promise.allSettled(options.categories.map(discoverSongs))
    const choices = discovered.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    const library = choices.filter((song) => distractors({ ...song, source: 'youtube', ref: '', artwork: null }, choices, 'hard', { random: () => 0 }).length === 3)
    const pool = distinctSongs(await freshSongPool(options.categories, { discover: async (category) => library.filter((song) => song.category === category), limit: options.rounds + 5, avoid: await seenFor(roomId, 'songquiz') }))
    if (pool.length < MIN_SONGS) {
      return {
        error:
          pool.length === 0
            ? 'YouTube could not build this mix right now — try again in a moment'
            : `Only ${pool.length} playable song${pool.length === 1 ? '' : 's'} came back — try another music pack`,
      }
    }
    return { ...options, pool, choices, rounds: Math.min(options.rounds, pool.length) }
  },

  items({ pool, rounds, difficulty, choices }, ctx) {
    return songItems(pool, rounds, difficulty, ctx, choices)
  },
})

type SongState = Quiz & {
  spares?: QuizItem[]
  clipReady?: string[]
  clipPlaying?: string[]
  soundBlocked?: string[]
  clipFailures?: number
  playbackLoading?: boolean
  playbackStarting?: boolean
  playbackError?: string | null
  /** Missed a deadline (a closed tab, a dead phone): not waited on again until they report back. */
  quiet?: string[]
}

/** The players a round still waits on before it can go on. */
const waitingOn = (state: SongState) => state.players.filter((player) => !state.quiet?.includes(player.id))

function waitForAudio(state: SongState, ctx: Ctx) {
  ctx.clearSchedule()
  state.phase = 'ready'
  state.clipReady = []
  state.playbackLoading = true
  state.playbackStarting = false
  state.clipPlaying = []
  state.soundBlocked = []
  state.playbackError = null
  state.deadline = null
  ctx.schedule(15_000, 'clip-load-timeout', { round: state.round, ref: state.items[state.round]!.media!.ref })
  return state
}

function pauseAudio(state: SongState, ctx: Ctx) {
  ctx.clearSchedule()
  state.phase = 'ready'
  state.deadline = null
  state.playbackLoading = false
  state.playbackStarting = false
  state.playbackError = 'The music didn’t start for anyone, so the game is paused — no points lost. Try again, or open Huddle in Chrome or Safari.'
  return state
}

/** Everyone who can hear it is in: count down to the options. */
function loaded(state: SongState, ctx: Ctx) {
  state.playbackLoading = false
  state.soundBlocked = []
  state.opensAt = ctx.now() + state.readyMs
  state.deadline = state.opensAt
  ctx.clearSchedule()
  ctx.schedule(state.readyMs, 'open', { round: state.round })
  return state
}

/** Everyone who can hear it hears it: start the clock. */
function audible(state: SongState, ctx: Ctx) {
  state.playbackStarting = false
  state.soundBlocked = []
  state.clipFailures = 0
  return base.act(state, null, 'open', { round: state.round }, ctx)
}

export const songQuiz: GameDef<Quiz, Options> = {
  ...base,
  start(players, options, ctx) {
    const state: SongState = base.start(players, options, ctx)
    const used = new Set(state.items.map((item) => item.media?.ref))
    const reserve = options.pool.filter((song) => !used.has(song.ref))
    state.spares = reserve.length ? songItems(options.pool, options.pool.length, options.difficulty, ctx, options.choices).filter((item) => !used.has(item.media?.ref)) : []
    state.clipFailures = 0
    return waitForAudio(state, ctx)
  },
  act(previous, by, action, payload, ctx) {
    const old = previous as SongState
    const current = previous.items[previous.round]
    if (action === 'clip-blocked') {
      if (!by || !old.players.some((player) => player.id === by.id)) return { error: 'Join the game to play' }
      if (old.phase !== 'ready' || old.playbackError || payload.round !== old.round || payload.ref !== current?.media?.ref || old.soundBlocked?.includes(by.id)) return previous
      const state: SongState = structuredClone(old)
      state.soundBlocked = [...(state.soundBlocked ?? []), by.id]
      state.clipReady = state.clipReady?.filter((id) => id !== by.id)
      state.clipPlaying = state.clipPlaying?.filter((id) => id !== by.id)
      // The load timer keeps running: if others can already hear it, the
      // room goes on and this person joins in once they allow sound.
      return state
    }
    if (!by && action === 'clip-load-timeout') {
      if (old.phase !== 'ready' || !(old.playbackLoading || old.playbackStarting) || payload.round !== old.round || payload.ref !== current?.media?.ref) return previous
      // One closed tab or slow phone must not hold the whole room. Go on with
      // whoever confirmed; the rest catch up mid-clip when their player starts.
      const confirmed = old.playbackLoading ? old.clipReady : old.clipPlaying
      if (confirmed?.length) {
        const state: SongState = structuredClone(old)
        state.quiet = state.players.filter((player) => !confirmed.includes(player.id)).map((player) => player.id)
        return state.playbackLoading ? loaded(state, ctx) : audible(state, ctx)
      }
      // Nobody is in yet, but someone is only waiting on a permission tap —
      // that is a person deciding, not a failure. Their tap restarts the timer.
      if (old.soundBlocked?.length) return previous
      return pauseAudio(structuredClone(old), ctx)
    }
    if (action === 'clip-retry') {
      if (!by || !old.players.some((player) => player.id === by.id)) return { error: 'Join the game to play' }
      if (old.phase !== 'ready' || !old.playbackError || payload.round !== old.round) return previous
      const state: SongState = structuredClone(old)
      // A fresh song if there is one (this upload may be the problem), the
      // same one otherwise; a new attempt gives every screen a fresh player.
      const replacement = state.spares?.shift() ?? current!
      state.items[state.round] = { ...replacement, difficulty: current!.difficulty, seconds: current!.seconds, media: { ...replacement.media, attempt: Number(current?.media?.attempt ?? 0) + 1 } }
      state.clipFailures = 0
      return waitForAudio(state, ctx)
    }
    if (action === 'clip-ready') {
      if (!by || !previous.players.some((player) => player.id === by.id)) return { error: 'Join the game to play' }
      if (old.phase !== 'ready' || !old.playbackLoading || payload.round !== old.round || payload.ref !== current?.media?.ref || old.clipReady?.includes(by.id)) return previous
      const state: SongState = structuredClone(old)
      state.clipReady = [...(state.clipReady ?? []), by.id]
      state.soundBlocked = state.soundBlocked?.filter((id) => id !== by.id)
      state.quiet = state.quiet?.filter((id) => id !== by.id)
      if (waitingOn(state).every((player) => state.clipReady!.includes(player.id))) {
        return loaded(state, ctx)
      } else if (!state.soundBlocked?.length) {
        ctx.clearSchedule()
        ctx.schedule(15_000, 'clip-load-timeout', { round: state.round, ref: current!.media!.ref })
      }
      return state
    }
    if (action === 'power') return { error: 'Song rounds use the same clip and clock for everyone — no power-ups' }
    if (!by && action === 'open') {
      if (old.phase !== 'ready' || old.playbackLoading || old.playbackError || old.playbackStarting || payload.round !== old.round) return previous
      const state: SongState = structuredClone(old)
      state.playbackStarting = true
      state.deadline = null
      ctx.clearSchedule()
      ctx.schedule(15_000, 'clip-load-timeout', { round: state.round, ref: current!.media!.ref })
      return state
    }
    if (action === 'clip-playing') {
      if (!by || !old.players.some((player) => player.id === by.id)) return { error: 'Join the game to play' }
      if (!old.playbackStarting || old.phase !== 'ready' || payload.round !== old.round || payload.ref !== current?.media?.ref || old.clipPlaying?.includes(by.id)) return previous
      const state: SongState = structuredClone(old)
      state.clipPlaying = [...(state.clipPlaying ?? []), by.id]
      state.soundBlocked = state.soundBlocked?.filter((id) => id !== by.id)
      state.quiet = state.quiet?.filter((id) => id !== by.id)
      if (!waitingOn(state).every((player) => state.clipPlaying!.includes(player.id))) return state
      return audible(state, ctx)
    }
    if (action !== 'clip-failed') {
      const next = base.act(previous, by, action, payload, ctx)
      if (!('error' in next) && next !== previous && action === 'next' && next.phase === 'ready') return waitForAudio(next as SongState, ctx)
      return next
    }
    if (!by || !previous.players.some((player) => player.id === by.id)) return { error: 'Join the game to play' }
    if (old.playbackError || !['ready', 'question'].includes(previous.phase) || payload.round !== previous.round || payload.ref !== current?.media?.ref) return previous
    if (![2, 5, 100, 101, 150].includes(Number(payload.code))) return previous
    const state: SongState = structuredClone(previous)
    ctx.clearSchedule()
    state.picks = {}
    state.gains = {}
    state.hidden = {}
    state.extra = {}
    state.graceUntil = null
    state.clipFailures = (state.clipFailures ?? 0) + 1
    const replacement = state.clipFailures <= 1 ? state.spares?.shift() : undefined
    if (replacement && state.clipFailures <= 1) {
      // Keep the chosen challenge and full clock when YouTube rejects an upload.
      state.items[state.round] = { ...replacement, difficulty: current!.difficulty, seconds: current!.seconds, media: { ...replacement.media, attempt: Number(current?.media?.attempt ?? 0) + 1 } }
      return waitForAudio(state, ctx)
    } else {
      return pauseAudio(state, ctx)
    }
  },
  view(state, viewer) {
    const { spares: _spares, clipReady: _ready, clipPlaying: _playing, soundBlocked, clipFailures: _failures, quiet: _quiet, ...publicState } = state as SongState
    const view = base.view(publicState, viewer) as { item: QuizItem | null; powers?: string[] }
    if (state.phase === 'ready' && view.item) view.item.options = []
    view.powers = []
    return { ...view, soundBlocked: soundBlocked?.length ?? 0 }
  },
}
