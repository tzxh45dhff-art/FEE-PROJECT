import { shuffle, type Ctx, type GameDef, type Player } from './engine.js'

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
  /** Which category, for the icon beside the label. */
  category?: string
  /** A per-round label used by modes whose challenge changes as they go. */
  difficulty?: string
  /** Overrides the game's default answer clock for this round. */
  seconds?: number
  options: string[]
  answer: number
  /** Whatever the client needs to play the round — a song clip. Hidden at reveal. */
  media?: Record<string, unknown>
  /** Shown only once it is revealed — the song's cover and artist. */
  reveal?: Record<string, unknown>
  /** Stable content identities, independent of upload IDs or presentation. Server only. */
  repeatKeys?: string[]
  attribution?: { label: string; url: string; license: string; licenseUrl: string }
}

/** A skip is recorded as a pick of -1: answered, scores nothing, keeps the streak. */
export type Pick = { option: number; ms: number }

/*
 * Power-ups, one of each per player per game. A 50/50 hides two wrong
 * answers from whoever used it; a skip passes the question without breaking
 * a streak; extra time gives that one player ten more seconds.
 */
export const POWERS = ['fifty', 'skip', 'time'] as const
export type Power = (typeof POWERS)[number]
export const EXTRA_MS = 10_000

export const QUIZ_REACTIONS = ['🔥', '😂', '😱', '👏', '💀', '🤯', '❤️', '😭'] as const

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
  powers: Record<string, Power[]>
  /** This round's 50/50s: which options each person no longer sees. */
  hidden: Record<string, number[]>
  /** This round's extra time, per person. */
  extra: Record<string, number>
  /** When the extra time runs out, if anyone took some. */
  graceUntil: number | null
  reactions: { id: number; by: string; emoji: string }[]
  reactionId: number
  /** One-line facts about the answers, written after the start — by round. */
  facts: Record<number, string>
  lateJoin: boolean
}

export type QuizOptions = { rounds: number; seconds: number; lateJoin?: boolean }

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
  state.hidden = {}
  state.extra = {}
  state.graceUntil = null
  state.phase = 'ready'
  state.opensAt = ctx.now() + state.readyMs
  state.deadline = state.opensAt
  ctx.clearSchedule()
  ctx.schedule(state.readyMs, 'open', { round: state.round })
}

/**
 * Whether anyone could still answer. Past the main clock that is only the
 * people who bought extra time, so once they're in there is no need to wait.
 */
function everyoneIn(state: Quiz, now: number) {
  const pastClock = state.deadline !== null && now > state.deadline
  return state.players.every((p) => p.id in state.picks || (pastClock && !(state.extra[p.id] ?? 0)))
}

function reveal(state: Quiz, ctx: Ctx) {
  const item = state.items[state.round]!
  const seconds = item.seconds ?? state.seconds
  for (const p of state.players) {
    const pick = state.picks[p.id]
    if (pick?.option === -1) {
      /* Skipped: nothing gained, nothing lost, streak intact. */
      state.gains[p.id] = 0
    } else if (pick && pick.option === item.answer) {
      const streak = (state.streaks[p.id] ?? 0) + 1
      state.streaks[p.id] = streak
      state.best[p.id] = Math.max(state.best[p.id] ?? 0, streak)
      const gain = points(pick.ms, (seconds * 1000 + (state.extra[p.id] ?? 0)) / 1000, streak)
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
  background?: GameDef<Quiz, O>['background']
}): GameDef<Quiz, O> {
  return {
    id: def.id,
    label: def.label,
    minPlayers: 1,
    maxPlayers: 12,
    options: def.options,
    prepare: def.prepare,
    background: def.background,

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
        powers: Object.fromEntries(players.map((p) => [p.id, [...POWERS]])),
        hidden: {},
        extra: {},
        graceUntil: null,
        reactions: [],
        reactionId: 0,
        facts: {},
        lateJoin: options.lateJoin !== false,
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

      if (by === null && action === 'facts') {
        const facts = payload.facts
        if (!Array.isArray(facts)) return prev
        facts.forEach((fact, i) => {
          if (typeof fact === 'string' && fact.trim()) state.facts[i] = fact.trim().slice(0, 220)
        })
        return state
      }

      if (by === null) {
        if (payload.round !== state.round) return prev
        if (action === 'open' && state.phase === 'ready') {
          const seconds = state.items[state.round]?.seconds ?? state.seconds
          state.phase = 'question'
          state.opensAt = ctx.now()
          state.deadline = ctx.now() + seconds * 1000
          ctx.clearSchedule()
          ctx.schedule(seconds * 1000, 'timeup', { round: state.round })
          return state
        }
        if (action === 'timeup' && state.phase === 'question') {
          /* Someone bought extra time and hasn't answered yet: wait for them, once. */
          const waiting = state.players.some((p) => (state.extra[p.id] ?? 0) > 0 && !(p.id in state.picks))
          if (waiting && !payload.final) {
            state.graceUntil = ctx.now() + EXTRA_MS
            ctx.schedule(EXTRA_MS, 'timeup', { round: state.round, final: true })
            return state
          }
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

      if (!state.players.some((p) => p.id === by.id)) return { error: 'Join the game to play' }

      if (action === 'react') {
        if (state.phase === 'over') return { error: 'The game is over' }
        const emoji = QUIZ_REACTIONS.find((e) => e === payload.emoji)
        if (!emoji) return { error: 'Pick a reaction' }
        state.reactionId += 1
        state.reactions = [...state.reactions, { id: state.reactionId, by: by.name, emoji }].slice(-14)
        return state
      }

      if (action !== 'answer' && action !== 'power') return { error: 'Unknown move' }
      if (state.phase !== 'question') return { error: state.phase === 'ready' ? 'Not yet — get ready' : 'Too late for that one' }
      if (by.id in state.picks) return { error: 'You’ve locked in' }
      /* After the clock, only someone who bought extra time may still answer. */
      if (state.deadline !== null && ctx.now() > state.deadline && !(state.extra[by.id] ?? 0)) return { error: 'Too late for that one' }
      const item = state.items[state.round]!

      if (action === 'power') {
        const kind = POWERS.find((k) => k === payload.kind)
        const left = state.powers[by.id] ?? []
        if (!kind || !left.includes(kind)) return { error: 'You’ve used that one' }
        state.powers[by.id] = left.filter((k) => k !== kind)
        if (kind === 'fifty') {
          const wrong = item.options.map((_, i) => i).filter((i) => i !== item.answer && !(state.hidden[by.id] ?? []).includes(i))
          state.hidden[by.id] = shuffle(wrong, ctx).slice(0, 2)
        } else if (kind === 'time') {
          state.extra[by.id] = EXTRA_MS
        } else {
          state.picks[by.id] = { option: -1, ms: Math.max(0, ctx.now() - state.opensAt) }
          if (everyoneIn(state, ctx.now())) reveal(state, ctx)
        }
        return state
      }

      const option = Number(payload.option)
      if (!Number.isInteger(option) || option < 0 || option >= item.options.length) return { error: 'Pick one of the options' }
      if ((state.hidden[by.id] ?? []).includes(option)) return { error: 'That one’s been ruled out' }

      state.picks[by.id] = { option, ms: Math.max(0, ctx.now() - state.opensAt) }
      if (everyoneIn(state, ctx.now())) reveal(state, ctx)
      return state
    },

    view(state, viewer) {
      const { items, picks, powers, hidden, extra, facts, ...rest } = state
      const item = items[state.round]
      const revealed = state.phase === 'reveal' || state.phase === 'over'
      const mine = extra[viewer] ?? 0
      return {
        ...rest,
        seconds: item?.seconds ?? state.seconds,
        /* Your own power-ups and what they did this round — nobody else's. */
        powers: powers[viewer] ?? [],
        hidden: hidden[viewer] ?? [],
        extraMs: mine,
        /* With extra time, your clock runs longer than everyone else's. */
        deadline: state.phase === 'question' && state.deadline !== null && mine ? state.deadline + mine : state.deadline,
        fact: revealed ? (facts[state.round] ?? null) : null,
        item: item
          ? {
              prompt: item.prompt,
              tag: item.tag,
              category: item.category ?? null,
              difficulty: item.difficulty ?? null,
              attribution: item.attribution ?? null,
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
      if (!state.lateJoin || state.players.some((p) => p.id === player.id) || state.players.length >= 12) return null
      return {
        ...state,
        players: [...state.players, player],
        scores: { ...state.scores, [player.id]: 0 },
        powers: { ...state.powers, [player.id]: [...POWERS] },
      }
    },

    used(state) {
      const played = Math.min(state.items.length, state.round + 1)
      return state.items.slice(0, played).flatMap((item) => [
        item.media?.ref ? String(item.media.ref) : item.prompt,
        ...(item.repeatKeys ?? []),
      ])
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
