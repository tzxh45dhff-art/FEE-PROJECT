import { QUESTIONS, type Question } from './knowme.questions.js'
import { shuffle, type Ctx, type GameDef, type Player } from './engine.js'

/**
 * How well do you know me.
 *
 * Each turn someone is in the hot seat. A question about them comes up with
 * four answers; they secretly pick the true one while everybody else guesses
 * which they will pick — all at the same time, so nobody can copy. When
 * everyone has answered, or the clock runs out, it is revealed.
 *
 * Guessing right scores; the person in the hot seat scores for everyone who
 * read them right, so being knowable is rewarded too. The game also keeps who
 * guessed right about whom, which is the result people actually want at the
 * end: not who won, but who knows who best.
 */

export type KnowMe = {
  players: Player[]
  scores: Record<string, number>
  /** guesser id → subject id → [right, asked]. */
  reads: Record<string, Record<string, [number, number]>>
  turn: number
  turns: number
  subject: number
  phase: 'answer' | 'reveal' | 'over'
  question: Question
  /** The subject's real answer — secret until reveal. */
  truth: number | null
  /** Everybody else's guesses — secret until reveal. */
  guesses: Record<string, number>
  deadline: number | null
  answerSeconds: number
  deck: number[]
}

type Options = { perPerson: number; answerSeconds: number }

const REVEAL_MS = 6500

function ask(state: KnowMe, ctx: Ctx) {
  if (state.deck.length === 0) state.deck = shuffle(QUESTIONS.map((_, i) => i), ctx)
  state.question = QUESTIONS[state.deck.pop()!]!
  state.truth = null
  state.guesses = {}
  state.phase = 'answer'
  state.deadline = ctx.now() + state.answerSeconds * 1000
  ctx.clearSchedule()
  ctx.schedule(state.answerSeconds * 1000, 'timeup', { turn: state.turn })
}

function reveal(state: KnowMe, ctx: Ctx) {
  const subject = state.players[state.subject]!
  if (state.truth !== null) {
    for (const [guesser, pick] of Object.entries(state.guesses)) {
      const right = pick === state.truth
      const row = (state.reads[guesser] ??= {})
      const cell = (row[subject.id] ??= [0, 0])
      cell[1] += 1
      if (right) {
        cell[0] += 1
        state.scores[guesser] = (state.scores[guesser] ?? 0) + 100
        state.scores[subject.id] = (state.scores[subject.id] ?? 0) + 50
      }
    }
  }
  state.phase = 'reveal'
  state.deadline = ctx.now() + REVEAL_MS
  ctx.clearSchedule()
  ctx.schedule(REVEAL_MS, 'next', { turn: state.turn })
}

export const knowMe: GameDef<KnowMe, Options> = {
  id: 'knowme',
  label: 'How well do you know me?',
  minPlayers: 2,
  maxPlayers: 10,

  options(raw) {
    const body = (raw ?? {}) as { perPerson?: unknown; answerSeconds?: unknown }
    const perPerson = [3, 5, 8].includes(body.perPerson as number) ? (body.perPerson as number) : 5
    const answerSeconds = [20, 30, 45].includes(body.answerSeconds as number) ? (body.answerSeconds as number) : 30
    return { perPerson, answerSeconds }
  },

  start(players, { perPerson, answerSeconds }, ctx) {
    const state: KnowMe = {
      players,
      scores: Object.fromEntries(players.map((p) => [p.id, 0])),
      reads: {},
      turn: 0,
      turns: players.length * perPerson,
      subject: 0,
      phase: 'answer',
      question: QUESTIONS[0]!,
      truth: null,
      guesses: {},
      deadline: null,
      answerSeconds,
      deck: shuffle(QUESTIONS.map((_, i) => i), ctx),
    }
    ask(state, ctx)
    return state
  },

  act(prev, by, action, payload, ctx) {
    const state: KnowMe = structuredClone(prev)
    const me = state.players.findIndex((p) => p.id === by?.id)

    if (action === 'end') {
      if (me < 0) return { error: 'Only players can end the game' }
      ctx.clearSchedule()
      state.phase = 'over'
      return state
    }

    if (by === null) {
      if (payload.turn !== state.turn) return prev
      if (action === 'timeup' && state.phase === 'answer') {
        reveal(state, ctx)
        return state
      }
      if (action === 'next' && state.phase === 'reveal') {
        state.turn += 1
        if (state.turn >= state.turns) {
          state.phase = 'over'
          state.deadline = null
          return state
        }
        state.subject = state.turn % state.players.length
        ask(state, ctx)
        return state
      }
      return prev
    }

    if (action !== 'answer') return { error: 'Unknown move' }
    if (state.phase !== 'answer') return { error: 'Wait for the next question' }
    if (me < 0) return { error: 'Join the game to play' }
    const pick = Number(payload.option)
    if (!Number.isInteger(pick) || pick < 0 || pick > 3) return { error: 'Pick one of the four' }

    /* Answers can be changed until the reveal — changing your mind is half the game. */
    if (me === state.subject) state.truth = pick
    else state.guesses[by.id] = pick

    const everyone = state.players.every((p, i) => (i === state.subject ? state.truth !== null : p.id in state.guesses))
    if (everyone) reveal(state, ctx)
    return state
  },

  view(state, viewer) {
    const { deck: _deck, guesses, truth, ...rest } = state
    const revealed = state.phase !== 'answer'
    return {
      ...rest,
      truth: revealed || state.players[state.subject]?.id === viewer ? truth : null,
      /* Before the reveal: only who has answered, and your own pick. */
      guesses: revealed ? guesses : viewer in guesses ? { [viewer]: guesses[viewer] } : {},
      answered: [
        ...Object.keys(guesses),
        ...(truth !== null ? [state.players[state.subject]!.id] : []),
      ],
    }
  },

  join(state, player) {
    if (state.players.some((p) => p.id === player.id) || state.players.length >= 10) return null
    return { ...state, players: [...state.players, player], scores: { ...state.scores, [player.id]: 0 } }
  },

  over(state) {
    if (state.phase !== 'over' || state.turn === 0) return null
    const ranked = state.players.map((p) => ({ id: p.id, name: p.name, score: state.scores[p.id] ?? 0 })).sort((a, b) => b.score - a.score)
    /* The best read in the room: highest share right, at least two asked. */
    let best: { guesser: string; subject: string; right: number; asked: number } | null = null
    for (const [g, row] of Object.entries(state.reads)) {
      for (const [s, [right, asked]] of Object.entries(row)) {
        if (asked < 2) continue
        if (!best || right / asked > best.right / best.asked) best = { guesser: g, subject: s, right, asked }
      }
    }
    const nameOf = (id: string) => state.players.find((p) => p.id === id)?.name ?? 'Someone'
    return {
      summary: {
        players: ranked,
        winner: ranked[0]?.name ?? null,
        bestRead: best ? { guesser: nameOf(best.guesser), subject: nameOf(best.subject), right: best.right, asked: best.asked } : null,
      },
    }
  },
}
