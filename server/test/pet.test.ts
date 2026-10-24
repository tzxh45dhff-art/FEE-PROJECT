/**
 * The room's pet: how it lives with time, how care changes it, and how one
 * person's poke or voice reaches everyone else in the room.
 */
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import { MAX_VOICE_BYTES } from '../src/sockets/pet.gateway.js'
import { AMENDS_NEEDED, AWAY_MS, care, drift, feel, growth, LEAVE_AT, mood, noFeelings, pose, settle, type Feelings, type Vitals } from '../src/services/pet.rules.js'
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
    const fish = care(hungry, 'feed', { food: 'fish', species: 'cat' })
    const cookie = care(hungry, 'feed', { food: 'cookie', species: 'cat' })
    assert.equal(fish.reaction, 'love')
    assert.equal(cookie.reaction, 'yum')
    assert.ok(fish.vitals.hunger < cookie.vitals.hunger)
    assert.equal(care(fresh({ hunger: 3 }), 'feed', { species: 'cat' }).reaction, 'full')
  })

  it('a hit is always a hit and a stroke is always love — no dice', () => {
    for (let i = 0; i < 20; i++) {
      assert.equal(care(fresh(), 'poke', { species: 'pup' }).reaction, 'ouch')
      assert.equal(care(fresh({ happiness: 10 }), 'pet', { species: 'pup' }).reaction, 'purr')
    }
    assert.ok(care(fresh(), 'poke', { species: 'pup' }).vitals.happiness < 80)
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

describe('pet feelings, per person', () => {
  const rohan = { id: 'r', name: 'Rohan Mehta' }
  const aditi = { id: 'a', name: 'Aditi' }
  const hit = (f: Feelings, by = rohan, at = 0) => feel(f, by, 'poke', at, false)

  it('hits build up against the person: grumpy, then the corner, then it leaves for twenty minutes', () => {
    let f = noFeelings()
    const seen: (string | null)[] = []
    for (let i = 0; i < LEAVE_AT; i++) {
      const r = hit(f)
      f = r.feelings
      seen.push(r.reaction)
    }
    assert.deepEqual(seen, ['ouch', 'ouch', 'grumpy', 'grumpy', 'sulk', 'sulk', 'sulk', 'leave'])
    assert.equal(pose(f), 'away')
    assert.equal(f.away!.until, AWAY_MS)
    assert.equal(f.away!.because, 'r')
    // While it is gone, nobody can do anything with it — not even someone nice.
    assert.equal(feel(f, aditi, 'pet', 1000, false).reaction, 'away')
    // It comes back on its own once the time is up, still wary of Rohan.
    assert.equal(pose(settle(f, AWAY_MS + 1)), 'normal')
  })

  it('only the person it is upset with can win it back: sorry, then strokes and food', () => {
    let f = noFeelings()
    for (let i = 0; i < 4; i++) f = hit(f).feelings
    // Before sorry it turns away and won't take anything from Rohan.
    const cold = feel(f, rohan, 'feed', 0, true)
    assert.equal(cold.reaction, 'turnaway')
    assert.equal(cold.allowed, false)
    // Aditi is fine.
    assert.equal(feel(f, aditi, 'pet', 0, false).reaction, null)

    f = feel(f, rohan, 'sorry', 0, false).feelings
    assert.equal(f.grudges.r!.sorry, true)
    let r = feel(f, rohan, 'pet', 0, false)
    assert.equal(r.reaction, 'sniff')
    f = r.feelings
    r = feel(f, rohan, 'feed', 0, true) // favourite food: 3 more, 4 in all
    assert.equal(r.reaction, 'forgive')
    assert.equal(r.feelings.grudges.r, undefined)
    assert.equal(AMENDS_NEEDED, 4)
  })

  it('a walk-out can be ended early by the one it walked out on saying sorry', () => {
    let f = noFeelings()
    for (let i = 0; i < LEAVE_AT; i++) f = hit(f).feelings
    assert.equal(feel(f, aditi, 'sorry', 0, false).reaction, 'away', 'someone else cannot apologise for Rohan')
    const back = feel(f, rohan, 'sorry', 0, false)
    assert.equal(back.reaction, 'sniff')
    assert.equal(back.feelings.away, null)
    assert.equal(pose(back.feelings), 'corner', 'back, but still sulking until it is made up to')
  })

  it('hitting it again takes back the apology, and time heals on its own', () => {
    let f = noFeelings()
    for (let i = 0; i < 3; i++) f = hit(f).feelings
    f = feel(f, rohan, 'sorry', 0, false).feelings
    f = hit(f).feelings
    assert.equal(f.grudges.r!.sorry, false)
    assert.equal(Object.keys(settle(f, 60 * 60_000).grudges).length, 0, 'an hour later it has let it go')
  })

  it('kindness from someone else comforts a sulking pet but is not an apology', () => {
    let f = noFeelings()
    for (let i = 0; i < 5; i++) f = hit(f).feelings
    const r = feel(f, aditi, 'pet', 0, false)
    assert.equal(r.reaction, 'comfort')
    assert.equal(pose(r.feelings), 'corner')
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

  it('it holds a grudge against the one who hit it, seen by everyone, and hears "sorry" typed in chat', async () => {
    for (let i = 0; i < 3; i++) await ask(r, 'pet:act', { roomId, action: 'poke' })
    const { pet } = await ask<{ pet: { grudges: { id: string; name: string; level: string; sorry: boolean }[] } }>(a, 'pet:get', { roomId })
    assert.equal(pet.grudges[0]!.name, 'Rohan')
    assert.equal(pet.grudges[0]!.level, 'grumpy')
    // Rohan can't feed it until he apologises; Aditi still can.
    assert.equal((await ask<{ reaction: string }>(r, 'pet:act', { roomId, action: 'pet' })).reaction, 'turnaway')

    /* Wait for the sorry itself: the stroke's event above can still be on its way to Aditi. */
    const heard = new Promise<{ action: string; reaction: string; by: { name: string } }>((resolve) => {
      const onEvent = (event: { action: string; reaction: string; by: { name: string } }) => {
        if (event.action !== 'sorry') return
        a.off('pet:event', onEvent)
        resolve(event)
      }
      a.on('pet:event', onEvent)
    })
    r.emit('chat:send', { roomId, body: 'ok sorry mochi 🥺' })
    const event = await heard
    assert.equal(event.action, 'sorry')
    assert.equal(event.by.name, 'Rohan')
    assert.equal(event.reaction, 'sniff')
    assert.equal((await ask<{ reaction: string }>(r, 'pet:act', { roomId, action: 'pet' })).reaction, 'sniff')
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
