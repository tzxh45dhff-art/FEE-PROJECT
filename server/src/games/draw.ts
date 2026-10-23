import { WORDS } from './draw.words.js'
import { byFreshness, text, type Ctx, type GameDef, type Player } from './engine.js'

/**
 * Draw and guess.
 *
 * One person draws a word only they can see; everyone else types guesses.
 * Wrong guesses scroll past for all to enjoy, a right one is announced without
 * the word, and a near miss is whispered to the guesser alone. Letters reveal
 * themselves as the clock runs down, so a bad drawing still gets there.
 *
 * The strokes are not part of this state. They arrive twenty times a second
 * and only the drawer may send them; the gateway relays them on a side
 * channel, asking `canDraw` who that is. Folding them in here would publish a
 * personalised view of the whole game to everyone on every pen movement.
 */

type FeedEntry = {
  id: number
  by: Player | null
  text: string
  kind: 'guess' | 'correct' | 'close' | 'system'
  /** Seen only by this person — near misses must not help everyone else. */
  only?: string
}

export type Draw = {
  players: Player[]
  scores: Record<string, number>
  turn: number
  turns: number
  drawer: number
  phase: 'choose' | 'draw' | 'reveal' | 'over'
  choices: string[]
  word: string | null
  revealed: number[]
  deadline: number | null
  drawSeconds: number
  guessed: string[]
  feed: FeedEntry[]
  used: string[]
  feedId: number
}

type Options = { rounds: number; drawSeconds: number }

const CHOOSE_MS = 15_000
const REVEAL_MS = 5_000

export const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Close enough to tell the guesser they are nearly there.
 *
 * Edit distance, with more slack for longer words: "elefant" is two edits from
 * "elephant" and any person would call it close, while two edits on a
 * four-letter word is a different word.
 */
function close(guess: string, word: string) {
  if (word.length < 4) return false
  const limit = word.length >= 7 ? 2 : 1
  if (Math.abs(guess.length - word.length) > limit) return false
  let prev = Array.from({ length: word.length + 1 }, (_, j) => j)
  for (let i = 1; i <= guess.length; i++) {
    const row = [i]
    for (let j = 1; j <= word.length; j++) {
      row[j] = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + (guess[i - 1] === word[j - 1] ? 0 : 1))
    }
    prev = row
  }
  const distance = prev[word.length]!
  return distance > 0 && distance <= limit
}

function say(state: Draw, entry: Omit<FeedEntry, 'id'>) {
  state.feedId += 1
  state.feed.push({ ...entry, id: state.feedId })
  if (state.feed.length > 80) state.feed.shift()
}

function choose(state: Draw, ctx: Ctx) {
  const fresh = WORDS.filter((w) => !state.used.includes(w))
  state.choices = byFreshness(fresh.length >= 3 ? fresh : WORDS, (word) => word, ctx).slice(0, 3)
  state.word = null
  state.revealed = []
  state.guessed = []
  state.deadline = ctx.now() + CHOOSE_MS
  state.phase = 'choose'
  ctx.schedule(CHOOSE_MS, 'autopick', { turn: state.turn })
}

function begin(state: Draw, word: string, ctx: Ctx) {
  state.word = word
  state.used.push(word)
  state.choices = []
  state.phase = 'draw'
  const ms = state.drawSeconds * 1000
  state.deadline = ctx.now() + ms
  ctx.clearSchedule()
  ctx.schedule(Math.round(ms * 0.45), 'hint', { turn: state.turn })
  ctx.schedule(Math.round(ms * 0.7), 'hint', { turn: state.turn })
  ctx.schedule(ms, 'timeup', { turn: state.turn })
  say(state, { by: null, kind: 'system', text: `${state.players[state.drawer]!.name} is drawing` })
}

function reveal(state: Draw, ctx: Ctx) {
  state.phase = 'reveal'
  state.deadline = ctx.now() + REVEAL_MS
  ctx.clearSchedule()
  ctx.schedule(REVEAL_MS, 'next', { turn: state.turn })
  say(state, { by: null, kind: 'system', text: `The word was “${state.word}”` })
}

const sameTurn = (state: Draw, payload: Record<string, unknown>) => payload.turn === state.turn

export const drawGame: GameDef<Draw, Options> = {
  id: 'draw',
  label: 'Draw and guess',
  minPlayers: 2,
  maxPlayers: 10,

  options(raw) {
    const body = (raw ?? {}) as { rounds?: unknown; drawSeconds?: unknown }
    const rounds = [1, 2, 3].includes(body.rounds as number) ? (body.rounds as number) : 2
    const drawSeconds = [60, 80, 100].includes(body.drawSeconds as number) ? (body.drawSeconds as number) : 80
    return { rounds, drawSeconds }
  },

  start(players, { rounds, drawSeconds }, ctx) {
    const state: Draw = {
      players,
      scores: Object.fromEntries(players.map((p) => [p.id, 0])),
      turn: 0,
      turns: players.length * rounds,
      drawer: 0,
      phase: 'choose',
      choices: [],
      word: null,
      revealed: [],
      deadline: null,
      drawSeconds,
      guessed: [],
      feed: [],
      used: [],
      feedId: 0,
    }
    choose(state, ctx)
    return state
  },

  act(prev, by, action, payload, ctx) {
    const state: Draw = structuredClone(prev)
    const me = state.players.findIndex((p) => p.id === by?.id)
    const drawing = me >= 0 && me === state.drawer

    if (action === 'end') {
      if (me < 0) return { error: 'Only players can end the game' }
      ctx.clearSchedule()
      state.phase = 'over'
      return state
    }

    /* The server's own timers. Each carries the turn it was set for, so a
       timer from a turn that already ended early does nothing. */
    if (by === null) {
      if (!sameTurn(state, payload)) return prev
      if (action === 'autopick' && state.phase === 'choose') {
        begin(state, state.choices[ctx.random(state.choices.length)]!, ctx)
        return state
      }
      if (action === 'hint' && state.phase === 'draw' && state.word) {
        const hidden = [...state.word].map((c, i) => (c !== ' ' && !state.revealed.includes(i) ? i : -1)).filter((i) => i >= 0)
        /* Never give the whole word away: keep at least two letters back. */
        if (hidden.length > 2) state.revealed.push(hidden[ctx.random(hidden.length)]!)
        return state
      }
      if (action === 'timeup' && state.phase === 'draw') {
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
        state.drawer = state.turn % state.players.length
        choose(state, ctx)
        return state
      }
      return prev
    }

    switch (action) {
      case 'pick': {
        if (state.phase !== 'choose') return { error: 'Not choosing a word right now' }
        if (!drawing) return { error: `${state.players[state.drawer]!.name} is choosing` }
        const word = state.choices[Number(payload.index)]
        if (!word) return { error: 'Pick one of the three' }
        begin(state, word, ctx)
        return state
      }

      case 'guess': {
        if (state.phase !== 'draw' || !state.word) return { error: 'Nothing to guess yet' }
        if (me < 0) return { error: 'Join the game to guess' }
        if (drawing) return { error: 'No guessing your own drawing' }
        if (state.guessed.includes(by.id)) return { error: 'You already got it' }
        const guess = text(payload.text, 60)
        if (!guess) return prev

        if (normalise(guess) === normalise(state.word)) {
          const total = state.drawSeconds * 1000
          const left = Math.max(0, (state.deadline ?? ctx.now()) - ctx.now())
          const first = state.guessed.length === 0
          const points = Math.max(20, Math.round(100 * (left / total))) + (first ? 20 : 0)
          state.scores[by.id] = (state.scores[by.id] ?? 0) + points
          const drawer = state.players[state.drawer]!
          state.scores[drawer.id] = (state.scores[drawer.id] ?? 0) + 20
          state.guessed.push(by.id)
          say(state, { by, kind: 'correct', text: `${by.name} guessed it! +${points}` })
          const guessers = state.players.filter((_, i) => i !== state.drawer)
          if (guessers.every((p) => state.guessed.includes(p.id))) reveal(state, ctx)
          return state
        }

        if (close(normalise(guess), normalise(state.word))) {
          say(state, { by, kind: 'close', text: `“${guess}” is so close!`, only: by.id })
          return state
        }
        say(state, { by, kind: 'guess', text: guess })
        return state
      }

      case 'skip': {
        if (!drawing || (state.phase !== 'draw' && state.phase !== 'choose')) return { error: 'Only the drawer can skip' }
        if (state.phase === 'choose') state.word = state.choices[0] ?? null
        reveal(state, ctx)
        return state
      }

      default:
        return { error: 'Unknown move' }
    }
  },

  view(state, viewer) {
    const drawerId = state.players[state.drawer]?.id
    const sees = viewer === drawerId || state.phase === 'reveal' || state.phase === 'over'
    const { used: _used, choices, word, ...rest } = state
    return {
      ...rest,
      choices: viewer === drawerId ? choices : [],
      word: sees ? word : null,
      /* Underscores for letters, spaces kept, revealed hints filled in. */
      mask: word ? [...word].map((c, i) => (c === ' ' ? ' ' : sees || state.revealed.includes(i) ? c : '_')).join('') : null,
      feed: state.feed.filter((f) => !f.only || f.only === viewer),
    }
  },

  join(state, player) {
    if (state.players.some((p) => p.id === player.id) || state.players.length >= 10) return null
    return { ...state, players: [...state.players, player], scores: { ...state.scores, [player.id]: 0 } }
  },

  used: (state) => state.used,

  over(state) {
    if (state.phase !== 'over' || state.turn === 0) return null
    const ranked = state.players.map((p) => ({ id: p.id, name: p.name, score: state.scores[p.id] ?? 0 })).sort((a, b) => b.score - a.score)
    return { summary: { players: ranked, winner: ranked[0]?.name ?? null, turns: state.turn } }
  },
}

/** Who may put ink on the canvas right now. */
export const drawCanvas = {
  canDraw: (state: Draw, userId: string) => state.phase === 'draw' && state.players[state.drawer]?.id === userId,
  /** The canvas belongs to a turn; a new turn starts a clean one. */
  key: (state: Draw) => `${state.turn}`,
}
