/**
 * Truth or dare that stays new — the room's recent cards sit out, freshly
 * written ones are offered first — and that works for people who are apart:
 * a typed answer, a photo of the dare, reactions, and doubting it.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { Ctx } from '../src/games/engine.js'
import { bankCardId, cardTextKey, CARDS, DECKS } from '../src/games/truthdare.cards.js'
import { truthDare, type TruthDare } from '../src/games/truthdare.js'
import { freshCards, type FreshCard } from '../src/games/truthdare.fresh.js'

const ctx: Ctx = { now: () => 0, random: () => 0, schedule: () => undefined, clearSchedule: () => undefined }
const a = { id: 'a', name: 'Aditi' }
const r = { id: 'r', name: 'Rohan' }
const m = { id: 'm', name: 'Meera' }
const play = (s: TruthDare, by: { id: string; name: string } | null, action: string, payload: Record<string, unknown> = {}) => {
  const next = truthDare.act(s, by, action, payload, ctx)
  if ('error' in next) throw new Error(next.error)
  return next as TruthDare
}
const fresh = (n: number, kind: 'truth' | 'dare'): FreshCard[] =>
  Array.from({ length: n }, (_, i) => ({ id: `ai:funny:${kind}:${i}`, deck: 'funny', kind, text: `A brand new ${kind} number ${i}`, custom: false, fresh: true }))

/** Spin and choose, with whoever spins landing on the next person. */
function toPick(s: TruthDare, kind: 'truth' | 'dare') {
  const asker = s.players[s.asker]!
  s = play(s, asker, 'spin')
  return play(s, s.players[s.answerer!]!, 'choose', { kind })
}

describe('truth or dare stays new', () => {
  it('rewritten cards get fresh identities while punctuation and deck ordering do not reset history', () => {
    const text = 'What did you actually want to say?'
    const id = bankCardId('deep', 'truth', text)
    assert.equal(bankCardId('deep', 'truth', 'WHAT did you actually want to say!'), id)
    assert.notEqual(bankCardId('deep', 'truth', 'What did you pretend you wanted to say?'), id)
    const cards = CARDS.deep.truth.slice(0, 5)
    const before = new Set(cards.map((card) => bankCardId('deep', 'truth', card)))
    assert.deepEqual(new Set(cards.reverse().map((card) => bankCardId('deep', 'truth', card))), before)
  })

  it('keeps all 400 cards distinct and short enough to read on a call', () => {
    const cards = DECKS.flatMap((deck) => [...CARDS[deck].truth, ...CARDS[deck].dare])
    assert.equal(cards.length, 400)
    assert.equal(new Set(cards.map(cardTextKey)).size, 400)
    for (const card of cards) assert.ok(card.length <= 170, card)
  })

  it('writes for all five selected decks, including Spicy, instead of dropping the fifth', async () => {
    const called: string[] = []
    const result = await freshCards([...DECKS, 'spicy'], ['Already played'], async (deck, avoid) => {
      called.push(deck)
      assert.deepEqual(avoid, ['Already played'])
      return [{ id: `test:${deck}`, deck, kind: 'truth', text: `A new card for ${deck}`, custom: false, fresh: true }]
    })
    assert.deepEqual(called, [...DECKS])
    assert.equal(result.length, 5)
    assert.equal(result.at(-1)!.deck, 'spicy')
  })

  it('cards the room saw in recent games are not offered again while others remain', () => {
    const recent = CARDS.funny.truth.slice(0, CARDS.funny.truth.length - 3).map((text) => bankCardId('funny', 'truth', text))
    let s = truthDare.start([a, r], { decks: ['funny'], recent, fresh: [] }, ctx)
    s = toPick(s, 'truth')
    for (const card of s.offered) assert.ok(!recent.includes(card.id), `${card.id} was used recently`)
  })

  it('freshly written cards are offered first, two of the three while they last', () => {
    let s = truthDare.start([a, r], { decks: ['funny'], recent: [], fresh: [...fresh(4, 'truth'), ...fresh(4, 'dare')] }, ctx)
    s = toPick(s, 'dare')
    assert.equal(s.offered.filter((c) => c.fresh).length, 2)
    assert.ok(s.offered.every((c) => c.kind === 'dare'))
    const forOthers = truthDare.view(s, s.players[s.answerer!]!.id) as { fresh?: unknown }
    assert.equal(forOthers.fresh, undefined, 'the unused new cards stay on the server')
  })

  it('new cards written after the start join the game, but only from the server', () => {
    let s = truthDare.start([a, r], { decks: ['funny'], recent: [], fresh: [] }, ctx)
    const cards = fresh(3, 'truth')
    assert.equal(truthDare.act(s, a, 'fresh', { cards }, ctx).hasOwnProperty('error'), true, 'a player cannot slip cards in')
    s = play(s, null, 'fresh', { cards: [...cards, { id: 'x', deck: 'spicy', kind: 'truth', text: 'not this deck' }] })
    assert.equal(s.fresh.length, 3)
    s = toPick(s, 'truth')
    assert.equal(s.offered.filter((c) => c.fresh).length, 2)
  })

  it('the game remembers what it used, for next time', () => {
    let s = truthDare.start([a, r], { decks: ['funny'], recent: [], fresh: [] }, ctx)
    s = toPick(s, 'truth')
    s = play(s, s.players[s.asker]!, 'pick', { index: 0 })
    const picked = s.card!
    s = play(s, s.players[s.answerer!]!, 'done')
    s = play(s, a, 'end')
    const summary = truthDare.over(s)!.summary as { used: string[]; seen: string[] }
    assert.ok(summary.used.includes(picked.id))
    assert.ok(summary.seen.includes(picked.text))
  })
})

describe('truth or dare, played apart', () => {
  const performing = (kind: 'truth' | 'dare') => {
    let s = truthDare.start([a, r, m], { decks: ['funny'], recent: [], fresh: [] }, ctx)
    s = toPick(s, kind)
    return play(s, s.players[s.asker]!, 'pick', { index: 0 })
  }

  it('the person answering can type the truth for everyone to read — nobody else can', () => {
    const s = performing('truth')
    const answerer = s.players[s.answerer!]!
    const other = s.players.find((p) => p.id !== answerer.id && p.id !== s.players[s.asker]!.id)!
    assert.throws(() => play(s, other, 'answer', { text: 'not mine' }))
    const answered = play(s, answerer, 'answer', { text: '  I once  sang to my plants  ' })
    assert.equal(answered.answer, 'I once sang to my plants')
    assert.throws(() => play(answered, answerer, 'proof', { image: 'data:image/jpeg;base64,AAAA' }), /proof/)
  })

  it('a dare can carry a photo — a real image, not too big', () => {
    const s = performing('dare')
    const answerer = s.players[s.answerer!]!
    assert.equal(play(s, answerer, 'proof', { image: 'data:image/jpeg;base64,/9j/4AAQ' }).proof, 'data:image/jpeg;base64,/9j/4AAQ')
    assert.throws(() => play(s, answerer, 'proof', { image: 'javascript:alert(1)' }))
    assert.throws(() => play(s, answerer, 'proof', { image: `data:image/jpeg;base64,${'A'.repeat(300_000)}` }))
  })

  it('everyone can react, the others can doubt it, and it all clears for the next turn', () => {
    let s = performing('dare')
    const answerer = s.players[s.answerer!]!
    const others = s.players.filter((p) => p.id !== answerer.id)
    s = play(s, others[0]!, 'react', { emoji: '🔥' })
    s = play(s, answerer, 'react', { emoji: '😂' })
    assert.deepEqual(
      s.reactions.map((x) => x.emoji),
      ['🔥', '😂'],
    )
    assert.throws(() => play(s, others[0]!, 'react', { emoji: '<script>' }))
    s = play(s, others[1]!, 'doubt')
    assert.deepEqual(s.doubts, [others[1]!.id])
    assert.throws(() => play(s, answerer, 'doubt'), /others/)
    s = play(s, others[1]!, 'doubt')
    assert.deepEqual(s.doubts, [], 'doubting again takes it back')
    s = play(s, others[1]!, 'doubt')
    s = play(s, answerer, 'done')
    assert.equal(s.phase, 'spin')
    assert.deepEqual([s.reactions, s.doubts, s.proof, s.answer], [[], [], null, null])
  })
})
