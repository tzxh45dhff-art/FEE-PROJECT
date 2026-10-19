import { CARDS, DECKS, type Deck, type Kind } from './truthdare.cards.js'
import { shuffle, text, type Ctx, type GameDef, type Player } from './engine.js'

/**
 * Truth or dare, the way it goes in a room of friends on a call.
 *
 * The asker spins, the bottle lands on someone, they choose truth or dare —
 * and then the asker is handed three cards from the decks the room chose, can
 * shuffle for three more, or write their own. The asker does not have to come
 * up with anything; the game does that. The cards are hidden from the person
 * answering until one is picked, which is most of the fun.
 *
 * Whoever answered asks next, so the turn passes person to person rather than
 * round-robin — the same chain it follows when people play it in a room.
 */

export type Card = { id: string; deck: Deck; kind: Kind; text: string; custom: boolean }
type Tally = { truths: number; dares: number; chickens: number }

export type TruthDare = {
  decks: Deck[]
  players: Player[]
  phase: 'spin' | 'choose' | 'pick' | 'perform' | 'over'
  asker: number
  answerer: number | null
  /** For the bottle animation: which spin this is, and how many turns. */
  spin: { n: number; turns: number } | null
  choice: Kind | null
  offered: Card[]
  card: Card | null
  used: string[]
  tally: Record<string, Tally>
  round: number
  log: { asker: string; answerer: string; kind: Kind; text: string; outcome: 'done' | 'chicken' }[]
}

type Options = { decks: Deck[] }

const OFFER = 3

function draw(state: TruthDare, kind: Kind, ctx: Ctx, avoid: string[] = []): Card[] {
  const all = state.decks.flatMap((deck) =>
    CARDS[deck][kind].map((t, i) => ({ id: `${deck}:${kind}:${i}`, deck, kind, text: t, custom: false })),
  )
  let pool = all.filter((c) => !state.used.includes(c.id) && !avoid.includes(c.id))
  /* A long evening runs a deck dry. Start it over rather than offering
     nothing — by then nobody remembers card forty from two hours ago. */
  if (pool.length < OFFER) {
    state.used = state.used.filter((id) => !id.includes(`:${kind}:`))
    pool = all.filter((c) => !avoid.includes(c.id))
  }
  return shuffle(pool, ctx).slice(0, OFFER)
}

const idx = (state: TruthDare, id: string | undefined) => state.players.findIndex((p) => p.id === id)

export const truthDare: GameDef<TruthDare, Options> = {
  id: 'truthdare',
  label: 'Truth or dare',
  minPlayers: 2,
  maxPlayers: 12,

  options(raw) {
    const body = (raw ?? {}) as { decks?: unknown; adults?: unknown }
    const decks = Array.isArray(body.decks)
      ? [...new Set(body.decks.filter((d): d is Deck => (DECKS as readonly string[]).includes(d as string)))]
      : []
    if (decks.length === 0) return { error: 'Pick at least one deck' }
    /* Spicy is for adults, and the room has to say so out loud first. */
    if (decks.includes('spicy') && body.adults !== true) return { error: 'Spicy is 18+ — confirm everyone here is an adult' }
    return { decks }
  },

  start(players, { decks }, ctx) {
    return {
      decks,
      players,
      phase: 'spin',
      asker: ctx.random(players.length),
      answerer: null,
      spin: null,
      choice: null,
      offered: [],
      card: null,
      used: [],
      tally: Object.fromEntries(players.map((p) => [p.id, { truths: 0, dares: 0, chickens: 0 }])),
      round: 1,
      log: [],
    }
  },

  act(prev, by, action, payload, ctx) {
    const state: TruthDare = structuredClone(prev)
    const me = idx(state, by?.id)
    const isAsker = me === state.asker
    const isAnswerer = state.answerer !== null && me === state.answerer

    if (action === 'end') {
      if (me < 0) return { error: 'Only players can end the game' }
      state.phase = 'over'
      return state
    }

    if (action === 'skip') {
      /* Someone wandered off mid-turn. Anyone may move it along. */
      if (me < 0 || state.phase === 'over') return { error: 'Nothing to skip' }
      state.asker = state.answerer ?? (state.asker + 1) % state.players.length
      state.answerer = null
      state.choice = null
      state.offered = []
      state.card = null
      state.spin = null
      state.phase = 'spin'
      return state
    }

    switch (state.phase) {
      case 'spin': {
        if (action !== 'spin') return { error: 'Spin the bottle first' }
        if (!isAsker) return { error: `It is ${state.players[state.asker]!.name}'s turn to spin` }
        const others = state.players.map((_, i) => i).filter((i) => i !== state.asker)
        state.answerer = others[ctx.random(others.length)]!
        state.spin = { n: (state.spin?.n ?? 0) + 1, turns: 3 + ctx.random(3) }
        state.phase = 'choose'
        return state
      }

      case 'choose': {
        if (action !== 'choose') return { error: 'Truth or dare?' }
        if (!isAnswerer) return { error: `${state.players[state.answerer!]!.name} chooses` }
        const kind = payload.kind
        if (kind !== 'truth' && kind !== 'dare') return { error: 'Truth or dare?' }
        state.choice = kind
        state.offered = draw(state, kind, ctx)
        state.phase = 'pick'
        return state
      }

      case 'pick': {
        if (!isAsker) return { error: `${state.players[state.asker]!.name} is picking` }
        if (action === 'shuffle') {
          state.offered = draw(state, state.choice!, ctx, state.offered.map((c) => c.id))
          return state
        }
        if (action === 'pick') {
          const card = state.offered[Number(payload.index)]
          if (!card) return { error: 'Pick one of the cards' }
          state.card = card
          state.used.push(card.id)
        } else if (action === 'custom') {
          const t = text(payload.text, 200)
          if (t.length < 3) return { error: 'Write a little more than that' }
          state.card = { id: `custom:${state.round}`, deck: state.decks[0]!, kind: state.choice!, text: t, custom: true }
        } else {
          return { error: 'Pick a card, shuffle, or write your own' }
        }
        state.offered = []
        state.phase = 'perform'
        return state
      }

      case 'perform': {
        if (action !== 'done' && action !== 'chicken') return { error: 'Done, or chicken out?' }
        if (!isAnswerer && !isAsker) return { error: 'Only the two of them can call it' }
        const answerer = state.players[state.answerer!]!
        const tally = state.tally[answerer.id] ?? (state.tally[answerer.id] = { truths: 0, dares: 0, chickens: 0 })
        if (action === 'chicken') tally.chickens += 1
        else if (state.choice === 'truth') tally.truths += 1
        else tally.dares += 1
        state.log.push({
          asker: state.players[state.asker]!.name,
          answerer: answerer.name,
          kind: state.choice!,
          text: state.card!.text,
          outcome: action === 'chicken' ? 'chicken' : 'done',
        })
        if (state.log.length > 60) state.log.shift()
        /* Whoever just answered asks next. */
        state.asker = state.answerer!
        state.answerer = null
        state.choice = null
        state.card = null
        state.round += 1
        state.phase = 'spin'
        return state
      }

      default:
        return { error: 'The game is over' }
    }
  },

  view(state, viewer) {
    const asker = state.players[state.asker]
    const { offered, used: _used, ...rest } = state
    return {
      ...rest,
      /* The cards on offer are the asker's alone. The person answering finds
         out what they got when everyone else does. */
      offered: asker?.id === viewer ? offered : [],
      offeredCount: offered.length,
    }
  },

  join(state, player) {
    if (state.players.some((p) => p.id === player.id) || state.players.length >= 12) return null
    return {
      ...state,
      players: [...state.players, player],
      tally: { ...state.tally, [player.id]: { truths: 0, dares: 0, chickens: 0 } },
    }
  },

  over(state) {
    if (state.phase !== 'over' || state.log.length === 0) return null
    const zero = { truths: 0, dares: 0, chickens: 0 }
    const players = state.players.map((p) => ({ id: p.id, name: p.name, ...zero, ...state.tally[p.id] }))
    const bravest = [...players].sort((a, b) => b.dares - a.dares || a.chickens - b.chickens)[0]
    return {
      summary: {
        decks: state.decks,
        rounds: state.log.length,
        players,
        bravest: bravest && bravest.dares > 0 ? bravest.name : null,
        highlight: state.log.filter((l) => l.outcome === 'done').at(-1) ?? null,
      },
    }
  },
}
