import type { Ctx, GameDef, Player } from './engine.js'

/**
 * The shape shared by live trivia and guess the song.
 *
 * Everybody answers the same thing at the same time: a short "get ready" beat
 * (long enough to read the category, or for a song clip to buffer), then four
 * options against the clock, then the reveal. Answers lock on the first tap —
 * that is what makes speed worth points — and the round ends early once
 * everyone is in, because waiting for a timer nobody needs is the dullest
 * thing a quiz can do.
 *
 * The rounds are all drawn at the start and kept here, server-side, with their
 * answers. A player only ever sees the current round, and never its answer
 * until the reveal.
 */

export type QuizItem = {
  prompt: string
  /** A label above the prompt: "Cricket", "Round 3". */
  tag: string
  options: string[]
  answer: number
  /** Whatever the client needs to play the round — a song clip. Hidden at reveal. */
  media?: Record<string, unknown>
  /** Shown only once it is revealed — the song's cover and artist. */
  reveal?: Record<string, unknown>
}

export type Pick = { option: number; ms: number }

export type Quiz = {
  players: Player[]
  scores: Record<string, number>
  streaks: Record<string, number>
  best: Record<string, number>
  round: number
  rounds: number
  phase: 'ready' | 'question' | 'reveal' | 'over'
  picks: Record<string, Pick>
  /** Points each player earned this round — the reveal shows them. */
  gains: Record<string, number>
  /** Server time the options open. */
  opensAt: number
  deadline: number | null
  seconds: number
  readyMs: number
  items: QuizItem[]
}

export type QuizOptions = { rounds: number; seconds: number }

const REVEAL_MS = 5_000
const BASE = 500
const SPEED = 500
const STREAK_BONUS = 100

/** The points for a right answer, by how quickly it came. */
export function points(ms: number, seconds: number, streak: number) {
  const left = Math.max(0, 1 - ms / (seconds * 1000))
  return BASE + Math.round(SPEED * left) + (streak >= 3 ? STREAK_BONUS : 0)
}

function begin(state: Quiz, ctx: Ctx) {
  state.picks = {}
  state.gains = {}
  state.phase = 'ready'
  state.opensAt = ctx.now() + state.readyMs
  state.deadline = state.opensAt
  ctx.clearSchedule()
  ctx.schedule(state.readyMs, 'open', { round: state.round })
}

function reveal(state: Quiz, ctx: Ctx) {
  const item = state.items[state.round]!
  for (const p of state.players) {
    const pick = state.picks[p.id]
    if (pick && pick.option === item.answer) {
      const streak = (state.streaks[p.id] ?? 0) + 1
      state.streaks[p.id] = streak
      state.best[p.id] = Math.max(state.best[p.id] ?? 0, streak)
      const gain = points(pick.ms, state.seconds, streak)
      state.gains[p.id] = gain
      state.scores[p.id] = (state.scores[p.id] ?? 0) + gain
    } else {
      state.streaks[p.id] = 0
      state.gains[p.id] = 0
    }
  }
  state.phase = 'reveal'
  state.deadline = ctx.now() + REVEAL_MS
  ctx.clearSchedule()
  ctx.schedule(REVEAL_MS, 'next', { round: state.round })
}

export function quizGame<O extends QuizOptions>(def: {
  id: string
  label: string
  /** How long the "get ready" beat lasts before the options open. */
  readyMs: number
  options: (raw: unknown) => O | { error: string }
  prepare?: (roomId: string, options: O) => Promise<O | { error: string }>
  items: (options: O, ctx: Ctx) => QuizItem[]
}): GameDef<Quiz, O> {
  return {
    id: def.id,
    label: def.label,
    minPlayers: 1,
    maxPlayers: 12,
    options: def.options,
    prepare: def.prepare,

    start(players, options, ctx) {
      const items = def.items(options, ctx)
      const state: Quiz = {
        players,
        scores: Object.fromEntries(players.map((p) => [p.id, 0])),
        streaks: {},
        best: {},
        round: 0,
        rounds: items.length,
        phase: 'ready',
        picks: {},
        gains: {},
        opensAt: 0,
        deadline: null,
        seconds: options.seconds,
        readyMs: def.readyMs,
        items,
      }
      begin(state, ctx)
      return state
    },

    act(prev, by, action, payload, ctx) {
      const state: Quiz = structuredClone(prev)

      if (action === 'end') {
        if (!by || !state.players.some((p) => p.id === by.id)) return { error: 'Only players can end the game' }
        ctx.clearSchedule()
        state.phase = 'over'
        state.deadline = null
        return state
      }

      if (by === null) {
        if (payload.round !== state.round) return prev
        if (action === 'open' && state.phase === 'ready') {
          state.phase = 'question'
          state.opensAt = ctx.now()
          state.deadline = ctx.now() + state.seconds * 1000
          ctx.clearSchedule()
          ctx.schedule(state.seconds * 1000, 'timeup', { round: state.round })
          return state
        }
        if (action === 'timeup' && state.phase === 'question') {
          reveal(state, ctx)
          return state
        }
        if (action === 'next' && state.phase === 'reveal') {
          state.round += 1
          if (state.round >= state.rounds) {
            state.phase = 'over'
            state.deadline = null
            return state
          }
          begin(state, ctx)
          return state
        }
        return prev
      }

      if (action !== 'answer') return { error: 'Unknown move' }
      if (!state.players.some((p) => p.id === by.id)) return { error: 'Join the game to play' }
      if (state.phase !== 'question') return { error: state.phase === 'ready' ? 'Not yet — get ready' : 'Too late for that one' }
      if (by.id in state.picks) return { error: 'You’ve locked in' }
      const option = Number(payload.option)
      const item = state.items[state.round]!
      if (!Number.isInteger(option) || option < 0 || option >= item.options.length) return { error: 'Pick one of the options' }

      state.picks[by.id] = { option, ms: Math.max(0, ctx.now() - state.opensAt) }
      if (state.players.every((p) => p.id in state.picks)) reveal(state, ctx)
      return state
    },

    view(state, viewer) {
      const { items, picks, ...rest } = state
      const item = items[state.round]
      const revealed = state.phase === 'reveal' || state.phase === 'over'
      return {
        ...rest,
        item: item
          ? {
              prompt: item.prompt,
              tag: item.tag,
              /* The options stay hidden through "get ready": reading time is for the question. */
              options: state.phase === 'ready' && !item.media ? [] : item.options,
              answer: revealed ? item.answer : null,
              /* Kept through the reveal so the song plays on while its name comes up. */
              media: state.phase === 'over' ? null : (item.media ?? null),
              reveal: revealed ? (item.reveal ?? null) : null,
            }
          : null,
        picks: revealed ? picks : viewer in picks ? { [viewer]: picks[viewer] } : {},
        answered: Object.keys(picks),
      }
    },

    join(state, player) {
      if (state.players.some((p) => p.id === player.id) || state.players.length >= 12) return null
      return { ...state, players: [...state.players, player], scores: { ...state.scores, [player.id]: 0 } }
    },

    over(state) {
      if (state.phase !== 'over' || state.round === 0) return null
      const ranked = state.players
        .map((p) => ({ id: p.id, name: p.name, score: state.scores[p.id] ?? 0, streak: state.best[p.id] ?? 0 }))
        .sort((a, b) => b.score - a.score)
      return { summary: { players: ranked, winner: ranked[0]?.name ?? null, rounds: state.round } }
    },
  }
}
