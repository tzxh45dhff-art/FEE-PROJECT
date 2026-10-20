/**
 * The room's pet: how it lives with time, how care changes it, and how one
 * person's poke or voice reaches everyone else in the room.
 */
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import { MAX_VOICE_BYTES } from '../src/sockets/pet.gateway.js'
import { care, drift, growth, mood, type Vitals } from '../src/services/pet.rules.js'
import { enter, makeRoom, makeUser, next, silence, startServer, type Client, type Harness } from './harness.js'

const HOUR = 3_600_000
const fresh = (over: Partial<Vitals> = {}): Vitals => ({ hunger: 20, happiness: 80, xp: 0, updatedAt: 0, ...over })

describe('pet rules', () => {
  it('gets hungrier and sadder with time, faster once hungry, and never past the ends', () => {
    const day = drift(fresh(), 24 * HOUR)
    assert.ok(day.hunger > 90, `a day without food is hungry (${day.hunger})`)
    assert.ok(day.happiness < 50, `and it shows (${day.happiness})`)
    const week = drift(fresh(), 7 * 24 * HOUR)
    assert.equal(week.hunger, 100)
    assert.equal(week.happiness, 0)
    /* The second half of a day hungry costs more than the first half fed. */
    const half = drift(fresh(), 12 * HOUR)
    const rest = drift(half, 24 * HOUR)
    assert.ok(half.happiness - rest.happiness > fresh().happiness - half.happiness)
  })

  it('a favourite food does more than any food, and a full pet refuses', () => {
    const hungry = fresh({ hunger: 70 })
    const fish = care(hungry, 'feed', { food: 'fish', species: 'cat', random: () => 0 })
    const cookie = care(hungry, 'feed', { food: 'cookie', species: 'cat', random: () => 0 })
    assert.equal(fish.reaction, 'love')
    assert.equal(cookie.reaction, 'yum')
    assert.ok(fish.vitals.hunger < cookie.vitals.hunger)
    assert.equal(care(fresh({ hunger: 3 }), 'feed', { species: 'cat', random: () => 0 }).reaction, 'full')
  })

  it('a poke is usually funny and sometimes not', () => {
    const at = (roll: number) => care(fresh(), 'poke', { species: 'pup', random: () => roll }).reaction
    assert.equal(at(0), 'ouch')
    assert.equal(at(6), 'giggle')
    assert.equal(at(9), 'grumpy')
  })

  it('grows with care, not with age', () => {
    assert.equal(growth(0).stage, 'baby')
    assert.equal(growth(60).stage, 'kid')
    assert.equal(growth(599).stage, 'teen')
    assert.equal(growth(5000).stage, 'grown')
    assert.equal(growth(5000).progress, 1)
    assert.equal(mood({ hunger: 90, happiness: 90 }), 'hungry')
    assert.equal(mood({ hunger: 10, happiness: 10 }), 'sad')
  })
})

describe('pet over sockets', () => {
  let h: Harness
  let a: Client
  let r: Client
  let roomId: string
  const ask = <T>(socket: Client, event: string, payload: unknown) => new Promise<T>((resolve) => socket.emit(event, payload, resolve))

  before(async () => {
    h = await startServer()
    const ua = await makeUser(h.base, 'Aditi')
    const ur = await makeUser(h.base, 'Rohan')
    roomId = (await makeRoom(h.base, ua, ur)).id
    a = await enter(h.base, ua, roomId)
    r = await enter(h.base, ur, roomId)
  })
  after(async () => {
    a?.close()
    r?.close()
    await h?.stop()
  })

  it('a room starts with no pet and adopts exactly one', async () => {
    assert.deepEqual(await ask(a, 'pet:get', { roomId }), { pet: null })
    const seen = next<{ pet: { name: string; species: string; stage: string } }>(r, 'pet:state')
    const adopted = await ask<{ ok?: boolean }>(a, 'pet:adopt', { roomId, species: 'cat', name: '  Mochi  ' })
    assert.ok(adopted.ok)
    const state = await seen
    assert.equal(state.pet.name, 'Mochi')
    assert.equal(state.pet.stage, 'baby')
    const again = await ask<{ error?: string }>(r, 'pet:adopt', { roomId, species: 'pup', name: 'Bruno' })
    assert.match(again.error ?? '', /already has a pet/)
  })

  it('one person’s care reaches everyone, with the same reaction', async () => {
    const seen = next<{ action: string; reaction: string; by: { name: string }; food: string }>(r, 'pet:event')
    const reply = await ask<{ reaction?: string }>(a, 'pet:act', { roomId, action: 'feed', food: 'fish' })
    const event = await seen
    assert.equal(event.by.name, 'Aditi')
    assert.equal(event.food, 'fish')
    assert.equal(event.reaction, reply.reaction)
  })

  it('a voice clip goes to everyone else, not back to the speaker, and big ones are refused', async () => {
    const theirs = next<{ by: { name: string }; audio: Buffer; mime: string }>(r, 'pet:voice')
    const echo = silence(a, 'pet:voice', 500)
    const clip = Buffer.from(new Uint8Array(2000).fill(7))
    const sent = await ask<{ ok?: boolean }>(a, 'pet:voice', { roomId, audio: clip, mime: 'audio/webm;codecs=opus' })
    assert.ok(sent.ok)
    const got = await theirs
    assert.equal(got.by.name, 'Aditi')
    assert.equal(Buffer.from(got.audio).length, 2000)
    assert.ok(await echo, 'the speaker already heard it')

    const huge = await ask<{ error?: string }>(a, 'pet:voice', { roomId, audio: Buffer.alloc(MAX_VOICE_BYTES + 1), mime: 'audio/webm' })
    assert.ok(huge.error)
    const notAudio = await ask<{ error?: string }>(a, 'pet:voice', { roomId, audio: clip, mime: 'text/html' })
    assert.ok(notAudio.error)
  })

  it('someone outside the room can do nothing to it', async () => {
    const stranger = await makeUser(h.base, 'Stranger')
    const other = (await makeRoom(h.base, stranger)).id
    const s = await enter(h.base, stranger, other)
    try {
      assert.ok((await ask<{ error?: string }>(s, 'pet:act', { roomId, action: 'poke' })).error)
      assert.ok((await ask<{ error?: string }>(s, 'pet:get', { roomId })).error)
    } finally {
      s.close()
    }
  })
})
