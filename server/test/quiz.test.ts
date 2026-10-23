/**
 * Live trivia and guess the song: one quiz engine, two question sources.
 * Answers lock on the first tap, speed is worth points, nothing about the
 * answer leaves the server before the reveal, and Guess the Song builds a
 * fresh external catalogue rather than reading anyone's room music.
 */
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import type { Ctx } from '../src/games/engine.js'
import { points, type Quiz } from '../src/games/quiz.js'
import { songItems, songQuiz, distinctSongs, distractors, type Song } from '../src/games/songquiz.js'
import { trivia } from '../src/games/trivia.js'
import { BANK } from '../src/games/trivia.questions.js'
import { freshSongPool } from '../src/services/songQuizCatalog.service.js'
import { enter, makeRoom, makeUser, next, startServer, type Client, type Harness } from './harness.js'

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
  const song = (title: string, i: number, category: Song['category'] = 'bollywood'): Song => ({ source: 'youtube', ref: `ref${i}`, title, artist: 'Someone', artwork: null, duration: 200, category })

  it('one entry per song, even when it was saved twice under a noisy title', () => {
    const pool = distinctSongs([song('Kesariya', 1), song('kesariya | Brahmastra | Official Video', 2), song('Tum Hi Ho', 3)])
    assert.deepEqual(
      pool.map((s) => s.title),
      ['Kesariya', 'Tum Hi Ho'],
    )
  })

  it('plays a clip from the middle, offers four titles, and reveals the song only at the end', () => {
    const pool = Array.from({ length: 8 }, (_, i) => song(`Song ${i}`, i, i % 2 ? 'punjabi' : 'bollywood'))
    const items = songItems(pool, 5, 'ramp', ctx())
    assert.equal(items.length, 5)
    for (const item of items) {
      assert.equal(item.options.length, 4)
      assert.equal(new Set(item.options).size, 4)
      assert.equal(item.options[item.answer], (item.reveal as { title: string }).title)
      const start = (item.media as { start: number }).start
      assert.ok(start > 0 && start < 150, `clip starts inside the song, got ${start}`)
    }
    assert.deepEqual(items.map((item) => item.seconds), [15, 15, 10, 6, 6])
    assert.deepEqual(items.map((item) => item.difficulty), ['Easy', 'Easy', 'Medium', 'Hard', 'Hard'])
  })

  it('keeps catalogue names and resolves exact songs instead of broad category searches', async () => {
    const searched: string[] = []
    const pool = await freshSongPool(['bollywood', 'punjabi'], {
      discover: async (category) => Array.from({ length: 6 }, (_, i) => ({ title: `${category} Track ${i}`, artist: 'Real Artist', category, duration: 200, year: 2020 })),
      search: async (query) => {
        searched.push(query)
        return [{ id: query, title: `${query} | EXTRA UPLOAD CREDITS`, channel: 'Real Artist - Topic', thumbnail: '' }]
      },
      inspect: async (results) => new Map(results.map((result) => [result.id, { duration: 205, embeddable: true }])),
    })
    assert.equal(searched.length, 12)
    assert.equal(pool.length, 12)
    assert.deepEqual(new Set(pool.map((track) => track.category)), new Set(['bollywood', 'punjabi']))
    assert.ok(pool.every((track) => track.source === 'youtube'))
    assert.ok(pool.every((track) => !track.title.includes('UPLOAD')))
    assert.ok(searched.every((query) => query.includes('Real Artist')))
  })

  it('requires a music pack and accepts the new difficulty setting', () => {
    assert.ok('error' in (songQuiz.options({ categories: [] }) as object))
    const options = songQuiz.options({ categories: ['global'], difficulty: 'hard', rounds: 5 })
    assert.ok(!('error' in options))
    if (!('error' in options)) {
      assert.deepEqual(options.categories, ['global'])
      assert.equal(options.difficulty, 'hard')
      assert.equal(options.rounds, 5)
    }
  })

  it('starts from a prepared pool with the answer hidden and a hard six-second clock', () => {
    const parsed = songQuiz.options({ categories: ['bollywood'], difficulty: 'hard', rounds: 5 })
    if ('error' in parsed) throw new Error(parsed.error)
    const pool = ['A', 'B', 'C', 'D', 'E'].map((title, i) => song(title, i))
    let state = songQuiz.start([a, r], { ...parsed, pool }, ctx())
    const ready = songQuiz.view(state, a.id) as { seconds: number; item: { answer: number | null; options: string[] } }
    assert.equal(ready.seconds, 6)
    assert.equal(ready.item.answer, null)
    assert.equal(ready.item.options.length, 0, 'titles cannot give away a clip before it starts')

    assert.equal(state.deadline, null, 'the clock does not run before audio is ready')
    for (const player of [a, r]) {
      const loaded = songQuiz.act(state, player, 'clip-ready', { round: 0, ref: state.items[0]!.media!.ref }, ctx())
      if ('error' in loaded) throw new Error(loaded.error)
      state = loaded
    }

    const opened = songQuiz.act(state, null, 'open', { round: 0 }, ctx())
    if ('error' in opened) throw new Error(opened.error)
    state = opened
    assert.equal(state.deadline, null, 'a ready iframe is not proof of audible playback')
    for (const player of [a, r]) {
      const audible = songQuiz.act(state, player, 'clip-playing', { round: 0, ref: state.items[0]!.media!.ref }, ctx())
      if ('error' in audible) throw new Error(audible.error)
      state = audible
    }
    assert.equal(state.deadline, 6_000)
    assert.equal((songQuiz.view(state, a.id) as typeof ready).item.options.length, 4)
    assert.equal((songQuiz.view(state, a.id) as typeof ready).item.answer, null)
  })

  it('replaces a rejected upload for everyone without leaking reserve answers or accepting stale failures', () => {
    clock = 0
    const options = songQuiz.options({ rounds: 5, difficulty: 'hard' })
    if ('error' in options) throw new Error(options.error)
    let state = songQuiz.start([a, r], { ...options, pool: Array.from({ length: 12 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    const ref = state.items[0]!.media!.ref
    const change = songQuiz.act(state, a, 'clip-failed', { round: 0, ref, code: 150 }, ctx())
    if ('error' in change) throw new Error(change.error)
    state = change
    assert.notEqual(state.items[0]!.media!.ref, ref)
    assert.equal(state.phase, 'ready')
    assert.equal(state.items[0]!.seconds, 6)
    assert.deepEqual(state.scores, { a: 0, r: 0 })
    const view = songQuiz.view(state, 'a') as Record<string, unknown>
    assert.ok(!('spares' in view))
    assert.equal((view.item as { answer: unknown }).answer, null)
    assert.equal(songQuiz.act(state, r, 'clip-failed', { round: 0, ref, code: 150 }, ctx()), state)
  })

  it('waits for audio readiness and ignores stale readiness and old opening timers', () => {
    clock = 0
    const options = songQuiz.options({ rounds: 5 })
    if ('error' in options) throw new Error(options.error)
    let state = songQuiz.start([a, r], { ...options, pool: Array.from({ length: 8 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    const ref = state.items[0]!.media!.ref
    assert.equal(songQuiz.act(state, null, 'open', { round: 0 }, ctx()), state)
    assert.equal(songQuiz.act(state, a, 'clip-ready', { round: 0, ref: 'old-upload' }, ctx()), state)
    const ready = songQuiz.act(state, a, 'clip-ready', { round: 0, ref }, ctx())
    if ('error' in ready) throw new Error(ready.error)
    state = ready
    assert.equal(state.deadline, null, 'one person buffering keeps the clock parked')
    assert.equal(songQuiz.act(state, null, 'open', { round: 0 }, ctx()), state)
    const allReady = songQuiz.act(state, r, 'clip-ready', { round: 0, ref }, ctx())
    if ('error' in allReady) throw new Error(allReady.error)
    assert.equal(allReady.deadline, 1500)
  })

  it('does not start the clock until everyone confirms actual unmuted playback', () => {
    clock = 0
    const options = songQuiz.options({ rounds: 5 })
    if ('error' in options) throw new Error(options.error)
    let state = songQuiz.start([a, r], { ...options, pool: Array.from({ length: 8 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    const payload = { round: 0, ref: state.items[0]!.media!.ref }
    for (const [by, action] of [[a, 'clip-ready'], [r, 'clip-ready'], [null, 'open'], [a, 'clip-playing']] as const) {
      const next = songQuiz.act(state, by, action, payload, ctx())
      if ('error' in next) throw new Error(next.error)
      state = next
    }
    assert.equal(state.phase, 'ready')
    assert.equal(state.deadline, null)
    const audible = songQuiz.act(state, r, 'clip-playing', payload, ctx())
    if ('error' in audible) throw new Error(audible.error)
    assert.equal(audible.phase, 'question')
    assert.equal(audible.deadline, 10_000)
    assert.deepEqual((songQuiz.view(audible, a.id) as { powers: unknown[] }).powers, [])
    assert.ok('error' in songQuiz.act(audible, a, 'power', { kind: 'time' }, ctx()))
  })

  it('keeps permission prompts untimed and recovers when sound is enabled', () => {
    const options = songQuiz.options({ rounds: 5 })
    if ('error' in options) throw new Error(options.error)
    let state = songQuiz.start([a], { ...options, pool: Array.from({ length: 5 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    const payload = { round: 0, ref: state.items[0]!.media!.ref }
    const blocked = songQuiz.act(state, a, 'clip-blocked', payload, ctx())
    if ('error' in blocked) throw new Error(blocked.error)
    state = blocked
    assert.equal((songQuiz.view(state, a.id) as { soundBlocked: number }).soundBlocked, 1)
    // A person deciding on a permission prompt is not a failure: no pause.
    assert.equal(songQuiz.act(state, null, 'clip-load-timeout', payload, ctx()), state)
    const allowed = songQuiz.act(state, a, 'clip-ready', payload, ctx())
    if ('error' in allowed) throw new Error(allowed.error)
    assert.equal((songQuiz.view(allowed, a.id) as { soundBlocked: number }).soundBlocked, 0)
    assert.equal(allowed.phase, 'ready')
    assert.equal(allowed.deadline, 1500)
  })

  it('goes on without a player who closed the tab or never allowed sound', () => {
    clock = 0
    const options = songQuiz.options({ rounds: 5 })
    if ('error' in options) throw new Error(options.error)
    let state = songQuiz.start([a, r], { ...options, pool: Array.from({ length: 8 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    const payload = { round: 0, ref: state.items[0]!.media!.ref }
    // Rohan is stuck on a permission prompt; Aditi is ready.
    for (const [by, action] of [[r, 'clip-blocked'], [a, 'clip-ready']] as const) {
      const next = songQuiz.act(state, by, action, payload, ctx())
      if ('error' in next) throw new Error(next.error)
      state = next
    }
    assert.equal(state.deadline, null)
    const loading = songQuiz.act(state, null, 'clip-load-timeout', payload, ctx())
    if ('error' in loading) throw new Error(loading.error)
    assert.equal(loading.deadline, 1500, 'the room counts down with whoever is ready')
    let opened = songQuiz.act(loading, null, 'open', { round: 0 }, ctx())
    if ('error' in opened) throw new Error(opened.error)
    // Rohan already missed the load, so nobody waits on him a second time.
    const live = songQuiz.act(opened, a, 'clip-playing', payload, ctx()) as Quiz
    assert.equal(live.phase, 'question')
    assert.equal(live.deadline, 10_000)
    assert.equal((songQuiz.view(live, a.id) as { playbackError: string | null }).playbackError, null)
    assert.ok(!('quiet' in songQuiz.view(live, a.id)))

    // Next round: Rohan has gone quiet, so Aditi alone is enough — no 15-second wait every round.
    let round2 = songQuiz.act(live, a, 'answer', { option: 0 }, ctx()) as Quiz
    round2 = songQuiz.act(round2, null, 'timeup', { round: 0, final: true }, ctx()) as Quiz
    round2 = songQuiz.act(round2, null, 'next', { round: 0 }, ctx()) as Quiz
    assert.equal(round2.round, 1)
    const ref2 = { round: 1, ref: round2.items[1]!.media!.ref }
    const counting = songQuiz.act(round2, a, 'clip-ready', ref2, ctx()) as Quiz
    assert.equal(counting.deadline, clock + 1500, 'no waiting on a player who went quiet')
    // And when Rohan comes back, he counts again.
    const back = songQuiz.act(round2, r, 'clip-ready', ref2, ctx()) as Quiz
    assert.equal(back.deadline, null, 'Rohan reported; Aditi is still loading')
  })

  it('a paused game can be resumed by a player, with a fresh song when one is spare', () => {
    const options = songQuiz.options({ rounds: 5 })
    if ('error' in options) throw new Error(options.error)
    const state = songQuiz.start([a, r], { ...options, pool: Array.from({ length: 8 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    const ref = state.items[0]!.media!.ref
    const paused = songQuiz.act(state, null, 'clip-load-timeout', { round: 0, ref }, ctx())
    if ('error' in paused) throw new Error(paused.error)
    assert.ok('error' in songQuiz.act(paused, { id: 'x', name: 'Guest' }, 'clip-retry', { round: 0 }, ctx()))
    assert.equal(songQuiz.act(paused, a, 'clip-retry', { round: 3 }, ctx()), paused)
    const resumed = songQuiz.act(paused, a, 'clip-retry', { round: 0 }, ctx())
    if ('error' in resumed) throw new Error(resumed.error)
    const view = songQuiz.view(resumed, a.id) as { playbackError: string | null; playbackLoading: boolean; item: { media: { ref: string; attempt: number } } }
    assert.equal(view.playbackError, null)
    assert.equal(view.playbackLoading, true)
    assert.notEqual(view.item.media.ref, ref)
    assert.equal(view.item.media.attempt, 1)
    assert.equal(songQuiz.act(resumed, a, 'clip-retry', { round: 0 }, ctx()), resumed, 'nothing to retry while it is loading')
  })

  it('uses real catalogue decoys from the same pack, with same-artist choices on hard', () => {
    const target = { ...song('Lover', 0, 'punjabi'), artist: 'Diljit Dosanjh', year: 2021 }
    const library = [target, ...['Born to Shine', 'G.O.A.T.', 'Hass Hass'].map((title, i) => ({ ...song(title, i + 1, 'punjabi'), artist: 'Diljit Dosanjh', year: 2020 })),
      { ...song('Admirin You', 5, 'punjabi'), artist: 'Karan Aujla', year: 2023 },
      { ...song('Blinding Lights', 6, 'global'), artist: 'The Weeknd' }]
    assert.deepEqual(new Set(distractors(target, library, 'hard', ctx()).map((candidate) => candidate.title)), new Set(['Born to Shine', 'G.O.A.T.', 'Hass Hass']))
    for (const level of ['easy', 'medium', 'hard'] as const) {
      const choices = distractors(target, library, level, ctx())
      assert.equal(choices.length, 3)
      assert.ok(choices.every((candidate) => candidate.category === 'punjabi'))
      assert.ok(!choices.some((candidate) => candidate.title === target.title))
    }
    // Decoys need metadata, not an extra paid YouTube search per wrong answer.
    const [item] = songItems([target], 1, 'hard', ctx(), library)
    assert.equal(item!.options.length, 4)
  })

  it('does not pad a thin pack with unrelated songs or repeat the same artist back to back', () => {
    const thin = [song('A', 1, 'punjabi'), ...['B', 'C', 'D'].map((title, i) => song(title, i + 2, 'global'))]
    assert.equal(songItems(thin, 4, 'hard', ctx()).length, 0)
    const pool = Array.from({ length: 8 }, (_, i) => ({ ...song(`Song ${i}`, i), artist: i < 4 ? 'Singer A' : 'Singer B' }))
    const items = songItems(pool, 8, 'medium', ctx())
    assert.ok(items.every((item, i) => i === 0 || item.reveal?.artist !== items[i - 1]!.reveal?.artist))
  })

  it('pauses after two consecutive rejected uploads instead of cycling the song pool', () => {
    const options = songQuiz.options({ rounds: 5 })
    if ('error' in options) throw new Error(options.error)
    let state = songQuiz.start([a, r], { ...options, pool: Array.from({ length: 12 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    for (let i = 0; i < 2; i++) {
      const failed = songQuiz.act(state, a, 'clip-failed', { round: 0, ref: state.items[0]!.media!.ref, code: 150 }, ctx())
      if ('error' in failed) throw new Error(failed.error)
      state = failed
    }
    const view = songQuiz.view(state, a.id) as { playbackError: string; playbackLoading: boolean }
    assert.match(view.playbackError, /paused/)
    assert.equal(view.playbackLoading, false)
    assert.equal(state.deadline, null)
    assert.equal(state.round, 0)
    assert.equal(songQuiz.act(state, a, 'clip-failed', { round: 0, ref: state.items[0]!.media!.ref, code: 150 }, ctx()), state)
    assert.equal(songQuiz.act(state, null, 'open', { round: 0 }, ctx()), state)
  })

  it('pauses if the player never becomes ready rather than running a silent round', () => {
    const options = songQuiz.options({ rounds: 5 })
    if ('error' in options) throw new Error(options.error)
    const state = songQuiz.start([a], { ...options, pool: Array.from({ length: 6 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    const paused = songQuiz.act(state, null, 'clip-load-timeout', { round: 0, ref: state.items[0]!.media!.ref }, ctx())
    if ('error' in paused) throw new Error(paused.error)
    assert.equal(paused.phase, 'ready')
    assert.equal(paused.deadline, null)
    assert.equal(paused.scores.a, 0)
    assert.match((songQuiz.view(paused, a.id) as { playbackError: string }).playbackError, /paused/)
  })

  it('cannot reopen an ended game through late audio callbacks', () => {
    const options = songQuiz.options({ rounds: 5 })
    if ('error' in options) throw new Error(options.error)
    const initial = songQuiz.start([a], { ...options, pool: Array.from({ length: 6 }, (_, i) => song(`Song ${i}`, i)) }, ctx())
    const ended = songQuiz.act(initial, a, 'end', {}, ctx())
    if ('error' in ended) throw new Error(ended.error)
    const payload = { round: 0, ref: initial.items[0]!.media!.ref }
    assert.equal(ended.phase, 'over')
    assert.equal(songQuiz.act(ended, a, 'clip-ready', payload, ctx()), ended)
    assert.equal(songQuiz.act(ended, null, 'clip-load-timeout', payload, ctx()), ended)
  })
})

describe('quiz over sockets', () => {
  let h: Harness
  let x: Client
  let y: Client
  let roomId: string

  before(async () => {
    h = await startServer()
    const owner = await makeUser(h.base, 'Aditi')
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

  it('rejects an empty music-pack selection before any catalogue lookup', async () => {
    const refused = await ask<{ error?: string }>(x, 'party:start', { roomId, game: 'songquiz', options: { categories: [], rounds: 5 } })
    assert.match(refused.error ?? '', /at least one music pack/)
  })
})

describe('quiz power-ups, reactions and facts', () => {
  type PView = { hidden: number[]; powers: string[]; deadline: number | null; fact: string | null; item: { answer: number | null } }
  const open = (rounds = 5) => act(start(rounds), null, 'open', { round: 0 })

  it('a 50/50 hides two wrong answers, from that player only, once', () => {
    let s = open()
    s = act(s, a, 'power', { kind: 'fifty' })
    const mine = trivia.view(s, 'a') as PView
    const theirs = trivia.view(s, 'r') as PView
    assert.equal(mine.hidden.length, 2)
    assert.ok(!mine.hidden.includes(s.items[0]!.answer), 'never hides the right answer')
    assert.deepEqual(theirs.hidden, [])
    assert.deepEqual(mine.powers, ['skip', 'time'])
    assert.throws(() => act(s, a, 'power', { kind: 'fifty' }), /used/)
    assert.throws(() => act(s, a, 'answer', { option: mine.hidden[0] }), /ruled out/)
  })

  it('a skip passes the question without breaking a streak', () => {
    let s = open()
    for (let round = 0; round < 2; round++) {
      if (round) s = act(s, null, 'open', { round })
      s = act(s, a, 'answer', { option: s.items[round]!.answer })
      s = act(s, r, 'answer', { option: (s.items[round]!.answer + 1) % 4 })
      s = act(s, null, 'next', { round })
    }
    assert.equal(s.streaks.a, 2)
    s = act(s, null, 'open', { round: 2 })
    s = act(s, a, 'power', { kind: 'skip' })
    s = act(s, r, 'answer', { option: 0 })
    assert.equal(s.phase, 'reveal')
    assert.equal(s.gains.a, 0)
    assert.equal(s.streaks.a, 2, 'the streak survives a skip')
  })

  it('extra time lets only its owner answer after the clock', () => {
    let s = open()
    s = act(s, a, 'power', { kind: 'time' })
    const mine = trivia.view(s, 'a') as PView
    const theirs = trivia.view(s, 'r') as PView
    assert.equal(mine.deadline! - theirs.deadline!, 10_000)
    clock += 11_000
    s = act(s, null, 'timeup', { round: 0 })
    assert.equal(s.phase, 'question', 'the clock waits for whoever bought time')
    assert.throws(() => act(s, r, 'answer', { option: 0 }), /Too late/)
    s = act(s, a, 'answer', { option: s.items[0]!.answer })
    assert.equal(s.phase, 'reveal', 'and reveals as soon as they answer — nobody else can')
  })

  it('reactions from players, facts at the reveal, and late joiners only when allowed', () => {
    let s = open()
    s = act(s, r, 'react', { emoji: '🔥' })
    assert.deepEqual(s.reactions.map((x) => x.emoji), ['🔥'])
    assert.throws(() => act(s, r, 'react', { emoji: 'nope' }))
    s = act(s, null, 'facts', { facts: ['The first fact.', 'Second.'] })
    assert.equal((trivia.view(s, 'a') as PView).fact, null, 'not before the reveal')
    s = act(s, null, 'timeup', { round: 0 })
    assert.equal((trivia.view(s, 'a') as PView).fact, 'The first fact.')
    assert.ok(trivia.join!(s, { id: 'm', name: 'Meera' }))
    const closed = trivia.start([a, r], { ...(trivia.options({ lateJoin: false }) as never) }, ctx())
    assert.equal(trivia.join!(closed, { id: 'm', name: 'Meera' }), null)
  })
})
