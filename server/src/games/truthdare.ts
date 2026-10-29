import { CARDS, DECKS, type Deck, type Kind } from './truthdare.cards.js'
import { shuffle, text, type Ctx, type GameDef, type Player } from './engine.js'
import { freshCards, keepSpares, recentlyUsed, takeSpares, type FreshCard } from './truthdare.fresh.js'
import { seenFor } from '../services/seen.service.js'

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

export type Card = { id: string; deck: Deck; kind: Kind; text: string; custom: boolean; fresh?: boolean }

/** The reactions anyone watching can send. */
export const REACTIONS = ['😂', '🔥', '😳', '💀', '👏', '🥺', '😍', '🙈'] as const

/** A photo of a dare being done: a small JPEG, sent as a data URL. */
const MAX_PROOF = 240_000
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
  log: { asker: string; answerer: string; kind: Kind; text: string; outcome: 'done' | 'chicken'; answer?: string }[]
  /** Cards the model wrote for this game — mixed into what the asker is offered. */
  fresh: Card[]
  /*
   * Playing apart. The person answering can type the truth so everyone reads
   * it, or send a photo of the dare being done; everyone else can react, and
   * say if they are not convinced. All of it clears when the turn ends.
   */
  answer: string | null
  proof: string | null
  reactions: { id: number; by: string; emoji: string }[]
  doubts: string[]
  reactionId: number
}

type Options = { decks: Deck[]; recent: string[]; fresh: FreshCard[]; seen?: string[] }

const OFFER = 3

function draw(state: TruthDare, kind: Kind, ctx: Ctx, avoid: string[] = []): Card[] {
  const bank: Card[] = state.decks.flatMap((deck) =>
    CARDS[deck][kind].map((t, i) => ({ id: `${deck}:${kind}:${i}`, deck, kind, text: t, custom: false })),
  )
  const fresh = state.fresh.filter((c) => c.kind === kind)
  const available = [...bank, ...fresh].filter((c) => !avoid.includes(c.id))
  const pool = available.filter((c) => !state.used.includes(c.id))
  /* New cards first: up to two of the three on offer, while they last. */
  const newOnes = shuffle(pool.filter((c) => c.fresh), ctx).slice(0, 2)
  const rest = shuffle(pool.filter((c) => !newOnes.includes(c)), ctx).slice(0, OFFER - newOnes.length)
  const selected = [...newOnes, ...rest]
  // Keep the last unseen cards in the offer; only fill remaining slots with
  // the oldest seen cards instead of resetting the whole deck early.
  if (selected.length < OFFER) {
    const age = new Map(state.used.map((id, i) => [id, i]))
    const oldest = available.filter((c) => age.has(c.id)).sort((a, b) => age.get(a.id)! - age.get(b.id)!)
    selected.push(...oldest.slice(0, OFFER - selected.length))
  }
  const offered = shuffle(selected, ctx)
  // The asker has seen all three, even if they shuffle instead of choosing one.
  const shown = new Set(offered.map((card) => card.id))
  state.used = [...state.used.filter((id) => !shown.has(id)), ...shown]
  return offered
}

/** Back to the bottle, with nothing of the last turn left on the table. */
function clearTurn(state: TruthDare) {
  state.answerer = null
  state.choice = null
  state.offered = []
  state.card = null
  state.answer = null
  state.proof = null
  state.reactions = []
  state.doubts = []
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
    return { decks, recent: [], fresh: [] }
  },

  /*
   * What this room has already seen, and any new cards already written for it
   * — both instant. Writing new ones takes the model several seconds, which
   * the start never waits for: see `background`.
   */
  async prepare(roomId, options) {
    try {
      const [recent, seen] = await Promise.all([recentlyUsed(roomId), seenFor(roomId, 'truthdare')])
      recent.ids = [...new Set([...seen, ...recent.ids])]
      return { ...options, recent: recent.ids, seen: recent.texts, fresh: takeSpares(roomId, options.decks, recent.ids) }
    } catch {
      return options
    }
  },

  /* New cards, mixed into this game the moment they exist, and kept for the next one. */
  async background(roomId, options) {
    const cards = await freshCards(options.decks, [...(options.seen ?? []), ...options.fresh.map((c) => c.text)])
    if (cards.length === 0) return null
    keepSpares(roomId, cards)
    return { action: 'fresh', payload: { cards } }
  },

  start(players, { decks, recent, fresh }, ctx) {
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
      used: [...(recent ?? [])],
      tally: Object.fromEntries(players.map((p) => [p.id, { truths: 0, dares: 0, chickens: 0 }])),
      round: 1,
      log: [],
      fresh: fresh ?? [],
      answer: null,
      proof: null,
      reactions: [],
      doubts: [],
      reactionId: 0,
    }
  },

  act(prev, by, action, payload, ctx) {
    const state: TruthDare = structuredClone(prev)
    const me = idx(state, by?.id)
    const isAsker = me === state.asker
    const isAnswerer = state.answerer !== null && me === state.answerer

    /* New cards from the server, arriving after the start. */
    if (by === null && action === 'fresh') {
      if (state.phase === 'over' || !Array.isArray(payload.cards)) return prev
      const known = new Set(state.fresh.map((c) => c.id))
      for (const raw of payload.cards as Card[]) {
        if (!raw || typeof raw.text !== 'string' || known.has(raw.id) || !state.decks.includes(raw.deck)) continue
        if (raw.kind !== 'truth' && raw.kind !== 'dare') continue
        known.add(raw.id)
        state.fresh.push({ id: raw.id, deck: raw.deck, kind: raw.kind, text: raw.text.slice(0, 200), custom: false, fresh: true })
      }
      state.fresh = state.fresh.slice(-120)
      return state
    }

    if (action === 'end') {
      if (me < 0) return { error: 'Only players can end the game' }
      state.phase = 'over'
      return state
    }

    if (action === 'skip') {
      /* Someone wandered off mid-turn. Anyone may move it along. */
      if (me < 0 || state.phase === 'over') return { error: 'Nothing to skip' }
      state.asker = state.answerer ?? (state.asker + 1) % state.players.length
      clearTurn(state)
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
          if (!state.used.includes(card.id)) state.used.push(card.id)
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
        /* While it's being done: the answer, the proof, the room's reactions. */
        if (action === 'answer') {
          if (!isAnswerer || state.choice !== 'truth') return { error: 'Only they can answer this one' }
          const t = text(payload.text, 280)
          if (!t) return { error: 'Type your answer first' }
          state.answer = t
          return state
        }
        if (action === 'proof') {
          if (!isAnswerer || state.choice !== 'dare') return { error: 'Only they can send proof' }
          const image = typeof payload.image === 'string' ? payload.image : ''
          if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > MAX_PROOF) return { error: 'That photo didn’t come through — try a smaller one' }
          state.proof = image
          return state
        }
        if (action === 'react') {
          if (me < 0) return { error: 'Join the game to react' }
          const emoji = REACTIONS.find((e) => e === payload.emoji)
          if (!emoji) return { error: 'Pick a reaction' }
          state.reactionId += 1
          state.reactions = [...state.reactions, { id: state.reactionId, by: state.players[me]!.name, emoji }].slice(-14)
          return state
        }
        if (action === 'doubt') {
          if (me < 0 || isAnswerer) return { error: 'Only the others can doubt it' }
          const id = state.players[me]!.id
          state.doubts = state.doubts.includes(id) ? state.doubts.filter((d) => d !== id) : [...state.doubts, id]
          return state
        }
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
          ...(state.answer ? { answer: state.answer } : {}),
        })
        if (state.log.length > 60) state.log.shift()
        /* Whoever just answered asks next. */
        state.asker = state.answerer!
        clearTurn(state)
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
    const { offered, used: _used, fresh: _fresh, ...rest } = state
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

  used: (state) => state.used,

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
        /* So the room's next games deal different cards — see truthdare.fresh. */
        used: state.used.slice(-150),
        seen: state.log.map((l) => l.text).slice(-40),
      },
    }
  },
}
