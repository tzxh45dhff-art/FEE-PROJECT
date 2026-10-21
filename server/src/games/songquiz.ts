import { prisma } from '../models/prisma.js'
import { shuffle, type Ctx } from './engine.js'
import { quizGame, type QuizItem, type QuizOptions } from './quiz.js'

/**
 * Guess the song, from the room's own music.
 *
 * Everything this room has queued, saved to a playlist or liked is the pool —
 * songs these particular people chose, which is what makes the game theirs
 * rather than a radio quiz. Each round plays a clip from somewhere in the
 * middle of a song (intros are too easy and often silent) and offers four
 * titles from the same pool, so the wrong answers are songs they also know.
 *
 * The clip has to reach every player before the clock starts, so each round
 * opens with a few seconds of "get ready" while it buffers muted; the options
 * and the sound arrive together.
 */

export type Song = {
  source: string
  ref: string
  title: string
  artist: string | null
  artwork: string | null
  duration: number | null
}

type Options = QuizOptions & { pool: Song[] }

export const MIN_SONGS = 4

/** "Kesariya | Brahmastra | Official Video" → "Kesariya". */
function tidy(title: string) {
  const short = title.split(/\s+[|•]\s+/)[0]!.trim()
  return (short.length > 70 ? `${short.slice(0, 67)}…` : short) || title.slice(0, 70)
}

const key = (title: string) => title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

/** One song per title — two uploads of the same song would make a round with two right answers. */
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

/** Where the clip starts: past the intro, before the outro. */
function clipStart(song: Song, ctx: Ctx) {
  const d = song.duration
  if (!d || d <= 0) return 30
  if (d < 45) return 0
  const from = Math.floor(d * 0.25)
  const to = Math.max(from + 1, Math.floor(d * 0.6) - 20)
  return from + ctx.random(to - from)
}

export function songItems(pool: Song[], rounds: number, ctx: Ctx): QuizItem[] {
  const order = shuffle(pool, ctx).slice(0, rounds)
  return order.map((song, i) => {
    const others = shuffle(
      pool.filter((s) => s !== song),
      ctx,
    ).slice(0, 3)
    const options = shuffle([song.title, ...others.map((s) => s.title)], ctx)
    return {
      prompt: 'Name that song',
      tag: `Song ${i + 1}`,
      category: 'music',
      options,
      answer: options.indexOf(song.title),
      media: { source: song.source, ref: song.ref, start: clipStart(song, ctx) },
      reveal: { title: song.title, artist: song.artist, artwork: song.artwork },
    }
  })
}

const select = { source: true, ref: true, title: true, artist: true, artwork: true, duration: true } as const

export async function roomSongs(roomId: string): Promise<Song[]> {
  const [queued, listed, liked] = await Promise.all([
    prisma.trackItem.findMany({ where: { roomId }, select, take: 300, orderBy: { createdAt: 'desc' } }),
    prisma.playlistTrack.findMany({ where: { playlist: { roomId } }, select, take: 300, orderBy: { createdAt: 'desc' } }),
    prisma.likedTrack.findMany({ where: { roomId }, select, take: 300, orderBy: { createdAt: 'desc' } }),
  ])
  return distinctSongs([...queued, ...listed, ...liked].filter((s) => s.source === 'youtube' || s.source === 'file'))
}

export const songQuiz = quizGame<Options>({
  id: 'songquiz',
  label: 'Guess the song',
  readyMs: 4_000,

  options(raw) {
    const body = (raw ?? {}) as { rounds?: unknown; seconds?: unknown; lateJoin?: unknown }
    const rounds = [5, 10, 15].includes(body.rounds as number) ? (body.rounds as number) : 10
    const seconds = [10, 15, 20].includes(body.seconds as number) ? (body.seconds as number) : 15
    return { rounds, seconds, pool: [], lateJoin: body.lateJoin !== false }
  },

  async prepare(roomId, options) {
    const pool = await roomSongs(roomId)
    if (pool.length < MIN_SONGS) {
      return {
        error:
          pool.length === 0
            ? 'Your room has no songs yet — play or save a few in Listen first'
            : `Your room has ${pool.length} song${pool.length === 1 ? '' : 's'} — play or save at least ${MIN_SONGS} in Listen first`,
      }
    }
    return { ...options, pool, rounds: Math.min(options.rounds, pool.length) }
  },

  items({ pool, rounds }, ctx) {
    return songItems(pool, rounds, ctx)
  },
})
