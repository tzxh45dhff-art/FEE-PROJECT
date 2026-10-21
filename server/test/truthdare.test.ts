/**
 * Truth or dare: the rules on their own, then a real game between two sockets.
 */

import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import type { Ctx } from '../src/games/engine.js'
import { truthDare, type TruthDare } from '../src/games/truthdare.js'
import { CARDS } from '../src/games/truthdare.cards.js'
import { PrismaClient } from '@prisma/client'
import { enter, makeRoom, makeUser, next, startServer, type Client, type Harness } from './harness.js'

/** Deterministic randomness: a fixed sequence, cycled. */
function fakeCtx(seq = [0]): Ctx {
  let i = 0
  return {
    now: () => 0,
    random: (max) => (max <= 1 ? 0 : seq[i++ % seq.length]! % max),
    schedule: () => undefined,
    clearSchedule: () => undefined,
  }
}

const aditi = { id: 'a', name: 'Aditi' }
const rohan = { id: 'r', name: 'Rohan' }
const meera = { id: 'm', name: 'Meera' }

function play(state: TruthDare, by: typeof aditi | null, action: string, payload = {}, ctx = fakeCtx()) {
  const next = truthDare.act(state, by, action, payload, ctx)
  if ('error' in next) throw new Error(next.error)
  return next as TruthDare
}

describe('truth or dare — the rules', () => {
  it('spicy needs the room to confirm everyone is an adult', () => {
    assert.ok('error' in (truthDare.options({ decks: ['spicy'] }) as object))
    assert.deepEqual(truthDare.options({ decks: ['spicy', 'funny'], adults: true }), { decks: ['spicy', 'funny'], recent: [], fresh: [] })
    assert.ok('error' in (truthDare.options({ decks: [] }) as object))
    assert.ok('error' in (truthDare.options({ decks: ['made-up'] }) as object))
  })

  it('a full turn: spin, choose, three cards offered, pick, done — then the answerer asks', () => {
    let s = truthDare.start([aditi, rohan], { decks: ['funny'] }, fakeCtx([0]))
    assert.equal(s.players[s.asker]!.id, 'a')
    s = play(s, aditi, 'spin')
    assert.equal(s.phase, 'choose')
    assert.equal(s.players[s.answerer!]!.id, 'r', 'with two people the bottle can only find the other one')

    assert.throws(() => play(s, aditi, 'choose', { kind: 'truth' }), /Rohan chooses/)
    s = play(s, rohan, 'choose', { kind: 'dare' })
    assert.equal(s.phase, 'pick')
    assert.equal(s.offered.length, 3)
    for (const card of s.offered) assert.ok(CARDS.funny.dare.includes(card.text))
    assert.equal(new Set(s.offered.map((c) => c.id)).size, 3, 'three different cards')

    assert.throws(() => play(s, rohan, 'pick', { index: 0 }), /picking/)
    const chosen = s.offered[1]!
    s = play(s, aditi, 'pick', { index: 1 })
    assert.equal(s.phase, 'perform')
    assert.equal(s.card!.text, chosen.text)

    s = play(s, rohan, 'done')
    assert.equal(s.phase, 'spin')
    assert.equal(s.players[s.asker]!.id, 'r', 'whoever answered asks next')
    assert.equal(s.tally.r!.dares, 1)
    assert.equal(s.log.length, 1)
  })

  it('shuffling offers three fresh cards, never the same ones again', () => {
    let s = truthDare.start([aditi, rohan], { decks: ['deep'] }, fakeCtx([0]))
    s = play(s, aditi, 'spin')
    s = play(s, rohan, 'choose', { kind: 'truth' })
    const first = s.offered.map((c) => c.id)
    s = play(s, aditi, 'shuffle', {}, fakeCtx([5, 3, 1, 7, 2]))
    assert.equal(s.offered.length, 3)
    for (const c of s.offered) assert.ok(!first.includes(c.id), 'a shuffle should not hand back a card just shown')
  })

  it('the asker can write their own card', () => {
    let s = truthDare.start([aditi, rohan], { decks: ['couples'] }, fakeCtx([0]))
    s = play(s, aditi, 'spin')
    s = play(s, rohan, 'choose', { kind: 'truth' })
    s = play(s, aditi, 'custom', { text: '  What did you think   of my new haircut?  ' })
    assert.equal(s.card!.text, 'What did you think of my new haircut?')
    assert.equal(s.card!.custom, true)
    assert.throws(() => play({ ...s, phase: 'pick' } as TruthDare, aditi, 'custom', { text: 'x' }), /more than that/)
  })

  it('chickening out is counted, and a used card is not offered again soon', () => {
    let s = truthDare.start([aditi, rohan], { decks: ['friends'] }, fakeCtx([0]))
    s = play(s, aditi, 'spin')
    s = play(s, rohan, 'choose', { kind: 'truth' })
    const picked = s.offered[0]!.id
    s = play(s, aditi, 'pick', { index: 0 })
    s = play(s, aditi, 'chicken')
    assert.equal(s.tally.r!.chickens, 1)
    assert.ok(s.used.includes(picked))
  })

  it('with three people the bottle never lands on the spinner', () => {
    for (const r of [0, 1, 2, 3, 4, 5]) {
      let s = truthDare.start([aditi, rohan, meera], { decks: ['funny'] }, fakeCtx([0]))
      s = play(s, aditi, 'spin', {}, fakeCtx([r]))
      assert.notEqual(s.answerer, s.asker)
    }
  })

  it('the person answering cannot see the cards on offer; the asker can', () => {
    let s = truthDare.start([aditi, rohan], { decks: ['funny'] }, fakeCtx([0]))
    s = play(s, aditi, 'spin')
    s = play(s, rohan, 'choose', { kind: 'dare' })
    const forAsker = truthDare.view(s, 'a') as { offered: unknown[]; offeredCount: number }
    const forAnswerer = truthDare.view(s, 'r') as { offered: unknown[]; offeredCount: number; used?: unknown }
    assert.equal(forAsker.offered.length, 3)
    assert.equal(forAnswerer.offered.length, 0)
    assert.equal(forAnswerer.offeredCount, 3)
    assert.equal(forAnswerer.used, undefined, 'the used-card list never leaves the server')
  })

  it('a long game recycles a deck instead of running dry', () => {
    let s = truthDare.start([aditi, rohan], { decks: ['deep'] }, fakeCtx([0]))
    const total = CARDS.deep.dare.length
    for (let i = 0; i < total + 4; i++) {
      const asker = s.players[s.asker]!
      s = play(s, asker, 'spin')
      const answerer = s.players[s.answerer!]!
      s = play(s, answerer, 'choose', { kind: 'dare' })
      assert.equal(s.offered.length, 3, `round ${i + 1} still offers three`)
      s = play(s, asker, 'pick', { index: 0 })
      s = play(s, answerer, 'done')
    }
  })

  it('a finished game summarises who did what', () => {
    let s = truthDare.start([aditi, rohan], { decks: ['funny'] }, fakeCtx([0]))
    s = play(s, aditi, 'spin')
    s = play(s, rohan, 'choose', { kind: 'dare' })
    s = play(s, aditi, 'pick', { index: 0 })
    s = play(s, rohan, 'done')
    s = play(s, rohan, 'end')
    const result = truthDare.over(s)!
    assert.equal(result.summary.rounds, 1)
    assert.equal(result.summary.bravest, 'Rohan')
  })
})

describe('truth or dare — in a real room', () => {
  let h: Harness
  let a: Client
  let r: Client
  let roomId: string

  before(async () => {
    h = await startServer()
    const ua = await makeUser(h.base, 'Aditi')
    const ur = await makeUser(h.base, 'Rohan')
    roomId = (await makeRoom(h.base, ua, ur)).id
    a = await enter(h.base, ua, roomId)
    r = await enter(h.base, ur, roomId)
    /* Wait for the "nothing running" reply to opening, so it cannot be
       mistaken later for the start of a game. */
    await Promise.all(
      [a, r].map((s) => {
        const opened = next(s, 'party:state')
        s.emit('party:open', { roomId })
        return opened
      }),
    )
  })
  after(async () => {
    a?.close()
    r?.close()
    await h?.stop()
  })

  const ask = <T>(socket: Client, event: string, payload: unknown) =>
    new Promise<T>((resolve) => socket.emit(event, payload, resolve))

  type View = { roomId: string; game: string | null; view: TruthDare & { offeredCount: number } }

  it('starts for everyone in the room, and only the asker is handed cards', async () => {
    const seenByA = next<View>(a, 'party:state')
    const seenByR = next<View>(r, 'party:state')
    const started = await ask<{ ok?: boolean; error?: string }>(a, 'party:start', {
      roomId,
      game: 'truthdare',
      options: { decks: ['funny', 'friends'] },
    })
    assert.ok(started.ok, started.error)
    const [va, vr] = await Promise.all([seenByA, seenByR])
    assert.equal(va.game, 'truthdare')
    assert.equal(vr.view.players.length, 2)

    /* Whoever is asking spins; then the other one chooses. */
    const asker = va.view.players[va.view.asker]!.id === a.user.id ? a : r
    const answerer = asker === a ? r : a
    const afterSpin = next<View>(answerer, 'party:state')
    assert.ok(((await ask<{ ok?: boolean }>(asker, 'party:act', { roomId, action: 'spin' })) as { ok?: boolean }).ok)
    await afterSpin

    const askerSees = next<View>(asker, 'party:state')
    const answererSees = next<View>(answerer, 'party:state')
    await ask(answerer, 'party:act', { roomId, action: 'choose', payload: { kind: 'truth' } })
    const [mine, theirs] = await Promise.all([askerSees, answererSees])
    assert.equal(mine.view.offered.length, 3)
    assert.equal(theirs.view.offered.length, 0, 'the answerer must not see what is coming')
    assert.equal(theirs.view.offeredCount, 3)

    /* Out of turn is refused with a reason. */
    const refused = await ask<{ error?: string }>(answerer, 'party:act', { roomId, action: 'pick', payload: { index: 0 } })
    assert.match(refused.error ?? '', /picking/)

    await ask(asker, 'party:act', { roomId, action: 'pick', payload: { index: 2 } })
    await ask(answerer, 'party:act', { roomId, action: 'done' })
  })

  it('a second game cannot start over a running one', async () => {
    const refused = await ask<{ error?: string }>(r, 'party:start', { roomId, game: 'truthdare', options: { decks: ['deep'] } })
    assert.match(refused.error ?? '', /already going/)
  })

  it('ending it saves the result for the memory wall', async () => {
    await ask(a, 'party:act', { roomId, action: 'end' })
    /* The write is fire-and-forget; give it a moment. */
    await new Promise((res) => setTimeout(res, 300))
    const db = new PrismaClient({ datasources: { db: { url: h.dbUrl } } })
    const results = await db.gameResult.findMany({ where: { roomId } })
    await db.$disconnect()
    assert.equal(results.length, 1)
    assert.equal(results[0]!.game, 'truthdare')
    const summary = JSON.parse(results[0]!.summary) as { rounds: number }
    assert.equal(summary.rounds, 1)

    const cleared = await ask<{ ok?: boolean }>(a, 'party:dismiss', { roomId })
    assert.ok(cleared.ok)
  })
})

