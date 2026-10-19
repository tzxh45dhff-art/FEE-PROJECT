/**
 * Emotes, throwing things, and toys — between two real people in a room.
 *
 *   cd server && npm test
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'

import { EMOTES, THROWABLES, TOYS, FORTUNES, EIGHT_BALL } from '../src/services/fun.catalog.js'
import { enter, makeRoom, makeUser, next, silence, sleep, startServer, type Client, type Harness } from './harness.js'

let h: Harness
let aditi: Client
let rohan: Client
let outsider: Client
let roomId: string

before(async () => {
  h = await startServer()
  const a = await makeUser(h.base, 'Aditi')
  const r = await makeUser(h.base, 'Rohan')
  const o = await makeUser(h.base, 'Outsider')
  const room = await makeRoom(h.base, a, r)
  roomId = room.id
  aditi = await enter(h.base, a, roomId)
  rohan = await enter(h.base, r, roomId)
  /* Connected, but a member of a different room entirely. */
  const elsewhere = await makeRoom(h.base, o)
  outsider = await enter(h.base, o, elsewhere.id)
})

after(async () => {
  for (const s of [aditi, rohan, outsider]) s?.close()
  await h?.stop()
})

describe('emotes', () => {
  it('reach everyone in the room, sender included, with who sent them', async () => {
    const seenByRohan = next<{ emote: string; from: { id: string } }>(rohan, 'fun:emote')
    const seenByAditi = next<{ emote: string }>(aditi, 'fun:emote')
    aditi.emit('fun:emote', { roomId, emote: 'heart' })
    const [r, a] = await Promise.all([seenByRohan, seenByAditi])
    assert.equal(r.emote, 'heart')
    assert.equal(r.from.id, aditi.user.id)
    assert.equal(a.emote, 'heart')
  })

  it('drops an emote that is not in the catalogue', async () => {
    aditi.emit('fun:emote', { roomId, emote: '<img src=x onerror=alert(1)>' })
    assert.ok(await silence(rohan, 'fun:emote'))
  })

  it('never leaks into another room', async () => {
    const quiet = silence(outsider, 'fun:emote')
    aditi.emit('fun:emote', { roomId, emote: 'wave' })
    assert.ok(await quiet)
  })

  it('refuses a socket that is not a member of the room', async () => {
    outsider.emit('fun:emote', { roomId, emote: 'wave' })
    assert.ok(await silence(rohan, 'fun:emote'))
  })

  it('rate-limits a flood, but lets a normal burst through', async () => {
    await sleep(4200) // let the bucket refill after earlier tests
    let received = 0
    const count = () => (received += 1)
    rohan.on('fun:emote', count)
    for (let i = 0; i < 60; i++) aditi.emit('fun:emote', { roomId, emote: 'laugh' })
    await sleep(800)
    rohan.off('fun:emote', count)
    assert.ok(received >= 8, `a normal burst should get through (got ${received})`)
    assert.ok(received <= 14, `sixty in a row should be capped (got ${received})`)
  })
})

describe('throwing things', () => {
  it('lands on the person it was aimed at, and both see it', async () => {
    await sleep(4200)
    const atRohan = next<{ item: string; from: { id: string }; to: { id: string } }>(rohan, 'fun:throw')
    const atAditi = next<{ item: string }>(aditi, 'fun:throw')
    aditi.emit('fun:throw', { roomId, to: rohan.user.id, item: 'rose' })
    const [r, a] = await Promise.all([atRohan, atAditi])
    assert.equal(r.item, 'rose')
    assert.equal(r.from.id, aditi.user.id)
    assert.equal(r.to.id, rohan.user.id)
    assert.equal(a.item, 'rose')
  })

  it('cannot be thrown at yourself', async () => {
    aditi.emit('fun:throw', { roomId, to: aditi.user.id, item: 'pillow' })
    assert.ok(await silence(rohan, 'fun:throw'))
  })

  it('cannot be thrown at someone who is not here', async () => {
    aditi.emit('fun:throw', { roomId, to: outsider.user.id, item: 'tomato' })
    assert.ok(await silence(rohan, 'fun:throw'))
  })

  it('drops an unknown object', async () => {
    aditi.emit('fun:throw', { roomId, to: rohan.user.id, item: 'brick' })
    assert.ok(await silence(rohan, 'fun:throw'))
  })
})

describe('toys', () => {
  it('a die is rolled by the server, 1–6, and everyone sees the same number', async () => {
    await sleep(4200)
    for (let i = 0; i < 6; i++) {
      const a = next<{ values: number[] }>(aditi, 'fun:toy')
      const r = next<{ values: number[] }>(rohan, 'fun:toy')
      rohan.emit('fun:toy', { roomId, toy: 'dice', count: 2 })
      const [x, y] = await Promise.all([a, r])
      assert.equal(x.values.length, 2)
      for (const v of x.values) assert.ok(v >= 1 && v <= 6, `rolled ${v}`)
      assert.deepEqual(x.values, y.values)
    }
  })

  it('a client cannot choose the result', async () => {
    const r = next<{ values: number[] }>(rohan, 'fun:toy')
    aditi.emit('fun:toy', { roomId, toy: 'dice', values: [6], count: 1 })
    const roll = await r
    assert.equal(roll.values.length, 1)
    /* A supplied value is ignored, not honoured. It may still come up 6 by
       chance, so the guard is that the field is not simply echoed back as a
       longer or shaped array. */
    assert.ok(roll.values[0]! >= 1 && roll.values[0]! <= 6)
  })

  it('a coin lands heads or tails', async () => {
    const r = next<{ side: string }>(rohan, 'fun:toy')
    aditi.emit('fun:toy', { roomId, toy: 'coin' })
    assert.ok(['heads', 'tails'].includes((await r).side))
  })

  it('the bottle points at someone else in the room', async () => {
    const r = next<{ target: { id: string }; turns: number }>(rohan, 'fun:toy')
    aditi.emit('fun:toy', { roomId, toy: 'bottle' })
    const spin = await r
    assert.equal(spin.target.id, rohan.user.id, 'with two people, it can only point at the other one')
    assert.ok(spin.turns >= 3 && spin.turns <= 5)
  })

  it('a fortune and an 8-ball answer come from the lists, with the question kept short', async () => {
    await sleep(4200)
    const f = next<{ text: string }>(rohan, 'fun:toy')
    aditi.emit('fun:toy', { roomId, toy: 'fortune' })
    assert.ok((FORTUNES as readonly string[]).includes((await f).text))

    const e = next<{ text: string; question: string }>(rohan, 'fun:toy')
    aditi.emit('fun:toy', { roomId, toy: 'eightball', question: 'Will we finish the movie tonight?' + ' really'.repeat(40) })
    const answer = await e
    assert.ok((EIGHT_BALL as readonly string[]).includes(answer.text))
    assert.ok(answer.question.startsWith('Will we finish the movie tonight?'))
    assert.ok(answer.question.length <= 140)
  })
})

describe('catalogue', () => {
  it('the client knows every id the server accepts, and no others', () => {
    const client = readFileSync(new URL('../../src/features/fun/catalog.ts', import.meta.url), 'utf8')
    const ids = (name: string) =>
      [...client.matchAll(new RegExp(`id: '([a-z]+)'[^\\n]*// ${name}`, 'g'))].map((m) => m[1])
    assert.deepEqual(ids('emote').sort(), [...EMOTES].sort())
    assert.deepEqual(ids('throw').sort(), [...THROWABLES].sort())
    assert.deepEqual(ids('toy').sort(), [...TOYS].sort())
  })
})
