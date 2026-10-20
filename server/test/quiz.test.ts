/**
 * Live trivia and guess the song: one quiz engine, two question sources.
 * Answers lock on the first tap, speed is worth points, nothing about the
 * answer leaves the server before the reveal, and guess the song only starts
 * when the room has enough of its own music to make a game of.
 */
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import type { Ctx } from '../src/games/engine.js'
import { points, type Quiz } from '../src/games/quiz.js'
import { songItems, distinctSongs, type Song } from '../src/games/songquiz.js'
import { trivia } from '../src/games/trivia.js'
import { BANK } from '../src/games/trivia.questions.js'
import { api, enter, makeRoom, makeUser, next, startServer, type Client, type Harness } from './harness.js'

let clock = 0
const ctx = (): Ctx => ({ now: () => clock, random: () => 0, schedule: () => undefined, clearSchedule: () => undefined })
const a = { id: 'a', name: 'Aditi' }
const r = { id: 'r', name: 'Rohan' }
const act = (s: Quiz, by: typeof a | null, action: string, payload: Record<string, unknown> = {}) => {
  const n = trivia.act(s, by, action, payload, ctx())
  if ('error' in n) throw new Error(n.error)
  return n as Quiz
}
const start = (rounds = 5, categories?: string[]) => {
  clock = 0
  const options = trivia.options({ rounds, seconds: 10, categories })
  if ('error' in options) throw new Error(options.error)
  return trivia.start([a, r], options, ctx())
}
type View = { phase: string; item: { options: string[]; answer: number | null; prompt: string }; picks: Record<string, unknown>; answered: string[] }

describe('quiz engine (live trivia)', () => {
  it('every question has its right answer among four options', () => {
    const s = start(20)
    assert.equal(s.items.length, 20)
    for (const item of s.items) {
      const entry = BANK.find((e) => e[1] === item.prompt)!
      assert.equal(item.options.length, 4)
      assert.equal(item.options[item.answer], entry[2])
    }
    assert.equal(new Set(s.items.map((i) => i.prompt)).size, 20, 'no repeats inside a game')
  })

  it('only draws from the chosen categories, and refuses none', () => {
    const s = start(10, ['cricket'])
    assert.ok(s.items.every((i) => i.tag.includes('Cricket')))
    assert.ok('error' in (trivia.options({ categories: [] }) as object))
  })

  it('options stay hidden while you get ready, and the answer until the reveal', () => {
    let s = start()
    assert.equal((trivia.view(s, 'a') as View).item.options.length, 0)
    assert.throws(() => act(s, a, 'answer', { option: 0 }), /get ready/)
    s = act(s, null, 'open', { round: 0 })
    const v = trivia.view(s, 'a') as View
    assert.equal(v.item.options.length, 4)
    assert.equal(v.item.answer, null)
  })

  it('answers lock, others’ picks stay secret, and everyone in reveals early', () => {
    let s = act(start(), null, 'open', { round: 0 })
    clock = 3000
    s = act(s, a, 'answer', { option: 1 })
    assert.throws(() => act(s, a, 'answer', { option: 2 }), /locked in/)
    const forRohan = trivia.view(s, 'r') as View
    assert.deepEqual(forRohan.picks, {})
    assert.deepEqual(forRohan.answered, ['a'])
    s = act(s, r, 'answer', { option: 0 })
    assert.equal(s.phase, 'reveal')
    const v = trivia.view(s, 'r') as View
    assert.equal(typeof v.item.answer, 'number')
    assert.ok('a' in v.picks)
  })

  it('a faster right answer scores more, and a streak of three earns a bonus', () => {
    assert.ok(points(1000, 10, 1) > points(8000, 10, 1))
    assert.equal(points(10_000, 10, 1), 500)
    assert.equal(points(0, 10, 1), 1000)
    assert.equal(points(0, 10, 3), 1100)

    let s = start()
    for (let round = 0; round < 3; round++) {
      s = act(s, null, 'open', { round })
      clock += 1000
      const right = s.items[round]!.answer
      s = act(s, a, 'answer', { option: right })
      s = act(s, r, 'answer', { option: (right + 1) % 4 })
      assert.equal(s.phase, 'reveal')
      assert.equal(s.gains.a, points(1000, 10, round + 1), round === 2 ? 'the third in a row carries the bonus' : 'speed points')
      s = act(s, null, 'next', { round })
    }
    assert.equal(s.streaks.a, 3)
    assert.equal(s.scores.r, 0)
  })

  it('the clock reveals, rounds advance, and stale timers do nothing', () => {
    let s = act(start(5), null, 'open', { round: 0 })
    s = act(s, null, 'timeup', { round: 0 })
    assert.equal(s.phase, 'reveal')
    assert.equal(s.gains.a, 0)
    s = act(s, null, 'next', { round: 0 })
    assert.equal(s.round, 1)
    assert.equal(act(s, null, 'timeup', { round: 0 }), s, 'a timer from the last round is ignored')
    for (let round = 1; round < 5; round++) {
      s = act(s, null, 'open', { round })
      s = act(s, null, 'timeup', { round })
      s = act(s, null, 'next', { round })
    }
    assert.equal(s.phase, 'over')
    assert.ok(trivia.over(s))
  })
})

describe('guess the song (rounds)', () => {
  const song = (title: string, i: number): Song => ({ source: 'youtube', ref: `ref${i}`, title, artist: 'Someone', artwork: null, duration: 200 })

  it('one entry per song, even when it was saved twice under a noisy title', () => {
    const pool = distinctSongs([song('Kesariya', 1), song('kesariya | Brahmastra | Official Video', 2), song('Tum Hi Ho', 3)])
    assert.deepEqual(
      pool.map((s) => s.title),
      ['Kesariya', 'Tum Hi Ho'],
    )
  })

  it('plays a clip from the middle, offers four titles, and reveals the song only at the end', () => {
    const pool = ['A', 'B', 'C', 'D', 'E'].map(song)
    const items = songItems(pool, 5, ctx())
    assert.equal(items.length, 5)
    for (const item of items) {
      assert.equal(item.options.length, 4)
      assert.equal(new Set(item.options).size, 4)
      assert.equal(item.options[item.answer], (item.reveal as { title: string }).title)
      const start = (item.media as { start: number }).start
      assert.ok(start >= 50 && start <= 120, `clip starts past the intro, got ${start}`)
    }
  })
})

describe('quiz over sockets', () => {
  let h: Harness
  let x: Client
  let y: Client
  let roomId: string
  let owner: Awaited<ReturnType<typeof makeUser>>

  before(async () => {
    h = await startServer()
    owner = await makeUser(h.base, 'Aditi')
    const other = await makeUser(h.base, 'Rohan')
    roomId = (await makeRoom(h.base, owner, other)).id
    x = await enter(h.base, owner, roomId)
    y = await enter(h.base, other, roomId)
    await Promise.all(
      [x, y].map((s) => {
        const opened = next(s, 'party:state')
        s.emit('party:open', { roomId })
        return opened
      }),
    )
  })
  after(async () => {
    x?.close()
    y?.close()
    await h?.stop()
  })

  const ask = <T>(socket: Client, event: string, payload: unknown) => new Promise<T>((resolve) => socket.emit(event, payload, resolve))

  it('guess the song asks for music first when the room has none', async () => {
    const refused = await ask<{ error?: string }>(x, 'party:start', { roomId, game: 'songquiz', options: { rounds: 5 } })
    assert.match(refused.error ?? '', /no songs yet/)
  })

  it('starts from the room’s playlist once there are enough songs, with the clip but not the title', async () => {
    const list = await api<{ item: { id: string } }>(h.base, owner, `/rooms/${roomId}/music/playlists`, { body: { name: 'Ours' } })
    for (const [i, title] of ['Kesariya', 'Tum Hi Ho', 'Raataan Lambiyan', 'Apna Bana Le', 'Heeriye'].entries()) {
      await api(h.base, owner, `/rooms/${roomId}/music/playlists/${list.item.id}/tracks`, {
        body: { source: 'youtube', ref: `abcdefghij${i}`, title, artist: 'Someone', duration: 240 },
      })
    }
    const seen = next<{ game: string; view: { phase: string; rounds: number; item: { media: { ref: string } | null; reveal: unknown; answer: unknown } } }>(y, 'party:state')
    const started = await ask<{ ok?: boolean; error?: string }>(x, 'party:start', { roomId, game: 'songquiz', options: { rounds: 10 } })
    assert.ok(started.ok, started.error)
    const state = await seen
    assert.equal(state.game, 'songquiz')
    assert.equal(state.view.rounds, 5, 'never more rounds than songs')
    assert.equal(state.view.phase, 'ready')
    assert.match(state.view.item.media?.ref ?? '', /^abcdefghij/)
    assert.equal(state.view.item.reveal, null)
    assert.equal(state.view.item.answer, null)
    await ask(x, 'party:act', { roomId, action: 'end' })
  })
})
