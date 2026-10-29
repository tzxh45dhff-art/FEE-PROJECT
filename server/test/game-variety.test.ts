import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import path from 'node:path'
import { describe, it } from 'node:test'
import { byFreshness, type Ctx } from '../src/games/engine.js'
import { trivia } from '../src/games/trivia.js'
import { BANK, CATEGORIES, type Category } from '../src/games/trivia.questions.js'
import { PUBLIC_BANK } from '../src/games/trivia.public.js'
import { knowMe, type KnowMe } from '../src/games/knowme.js'
import { QUESTIONS } from '../src/games/knowme.questions.js'
import { truthDare, type TruthDare } from '../src/games/truthdare.js'
import { CARDS, DECKS } from '../src/games/truthdare.cards.js'
import { songItems, songQuiz, type Song } from '../src/games/songquiz.js'
import { freshSongPool } from '../src/services/songQuizCatalog.service.js'
import { SONG_CATEGORIES, songIdentityKey, type SongIdentity } from '../src/services/songQuizPacks.js'
import { seedSongs } from '../src/services/songQuizSeeds.js'
import { parsePublicQuestion, questionKey, refreshTrivia, TRIVIA_SOURCE, uniqueQuestions } from '../src/services/triviaCatalog.service.js'
import { createSeenStore } from '../src/services/seen.service.js'

const a = { id: 'a', name: 'Aditi' }, b = { id: 'b', name: 'Rohan' }
const ctx = (seen = new Set<string>()): Ctx => ({ now: () => 0, random: () => 0, schedule() {}, clearSchedule() {}, seen })
const publicBank = PUBLIC_BANK.map((entry) => ({ entry, attribution: TRIVIA_SOURCE }))
const bank = [...BANK.map((entry) => ({ entry })), ...publicBank.filter(({ entry }) => !BANK.some((own) => questionKey(own[1]) === questionKey(entry[1])))]

describe('large game catalogues and repeat protection', () => {
  it('ships broad, valid question and card banks without needing a provider', () => {
    assert.ok(bank.length >= 1000)
    assert.ok(QUESTIONS.length >= 160)
    assert.equal(new Set(QUESTIONS.map(({ q }) => questionKey(q))).size, QUESTIONS.length)
    for (const question of QUESTIONS) assert.equal(new Set(question.options).size, 4)
    for (const category of Object.keys(CATEGORIES) as Category[]) assert.ok(bank.filter(({ entry }) => entry[0] === category).length >= 80, category)
    for (const { entry: [, prompt, ...answers] } of bank) {
      assert.ok(prompt.length >= 10)
      assert.equal(new Set(answers.map(questionKey)).size, 4, prompt)
    }
    for (const deck of DECKS) for (const kind of ['truth', 'dare'] as const) {
      assert.ok(CARDS[deck][kind].length >= 40)
      assert.equal(new Set(CARDS[deck][kind].map(questionKey)).size, CARDS[deck][kind].length)
    }
    for (const category of Object.keys(SONG_CATEGORIES) as (keyof typeof SONG_CATEGORIES)[]) {
      assert.ok(SONG_CATEGORIES[category].artists.length >= 36)
      assert.ok(seedSongs(category).length >= 40)
    }
  })

  it('plays four full trivia rematches per category without a repeated question', () => {
    for (const category of Object.keys(CATEGORIES) as Category[]) {
      const seen = new Set<string>()
      for (let game = 0; game < 4; game++) {
        const options = trivia.options({ rounds: 20, categories: [category] })
        assert.ok(!('error' in options))
        let state = trivia.start([a], { ...options, bank }, ctx(seen))
        assert.equal(state.items.length, 20)
        for (const item of state.items) assert.ok(!seen.has(item.prompt), `${category}: ${item.prompt}`)
        for (let round = 0; round < 20; round++) {
          for (const action of ['open', 'timeup', 'next']) {
            const next = trivia.act(state, null, action, { round }, ctx(seen))
            assert.ok(!('error' in next)); state = next
          }
        }
        assert.equal(state.phase, 'over')
        trivia.used!(state).forEach((key) => seen.add(key))
      }
      assert.equal(seen.size, 80)
    }
  })

  it('uses fresh questions from other categories before revisiting an exhausted category', () => {
    const seen = new Set(bank.filter(({ entry }) => entry[0] === 'cricket').map(({ entry }) => entry[1]))
    const options = trivia.options({ rounds: 20, categories: ['cricket', 'gk'] })
    assert.ok(!('error' in options))
    const state = trivia.start([a], { ...options, bank }, ctx(seen))
    assert.ok(state.items.every((item) => item.category === 'gk'))
  })

  it('remembers a question when the first round is ended early, without remembering unshown rounds', () => {
    const options = trivia.options({ rounds: 10 })
    assert.ok(!('error' in options))
    let state = trivia.start([a], options, ctx())
    const ended = trivia.act(state, a, 'end', {}, ctx())
    assert.ok(!('error' in ended)); state = ended
    assert.deepEqual(trivia.used!(state), [state.items[0]!.prompt])
    const injected = trivia.options({ bank: publicBank })
    assert.ok(!('error' in injected))
    assert.equal(injected.bank, undefined, 'clients cannot inject answers into the catalogue')
  })

  it('finishes two maximum-length Know Me games without repeating any of the 160 questions', () => {
    const players = Array.from({ length: 10 }, (_, i) => ({ id: `player-${i}`, name: `Player ${i + 1}` }))
    const seen = new Set<string>()
    for (let game = 0; game < 2; game++) {
      let state: KnowMe = knowMe.start(players, { perPerson: 8, answerSeconds: 20 }, ctx(seen))
      for (let turn = 0; turn < 80; turn++) {
        assert.ok(!seen.has(state.question.q), state.question.q)
        seen.add(state.question.q)
        for (const action of ['timeup', 'next']) {
          const next = knowMe.act(state, null, action, { turn }, ctx(seen))
          assert.ok(!('error' in next)); state = next
        }
      }
      assert.equal(state.phase, 'over')
      assert.equal(knowMe.used!(state).length, 80)
    }
    assert.equal(seen.size, 160)
  })

  it('remembers every Truth or Dare offer even when the asker keeps shuffling', () => {
    let state: TruthDare = truthDare.start([a, b], { decks: ['funny'], recent: [], fresh: [] }, ctx())
    for (const [by, action, payload] of [[a, 'spin', {}], [b, 'choose', { kind: 'truth' }]] as const) {
      const next = truthDare.act(state, by, action, payload, ctx())
      assert.ok(!('error' in next)); state = next
    }
    const shown = new Set<string>()
    for (let shuffle = 0; shuffle < 10; shuffle++) {
      for (const card of state.offered) { assert.ok(!shown.has(card.id)); shown.add(card.id) }
      const next = truthDare.act(state, a, 'shuffle', {}, ctx())
      assert.ok(!('error' in next)); state = next
    }
    assert.ok([...shown].every((key) => truthDare.used!(state).includes(key)))
  })

  it('keeps thousands of recent identities and moves a replayed item to the newest end', async () => {
    const directory = await mkdtemp(path.resolve(import.meta.dirname, '../.cache/variety-history-'))
    const { markSeen, seenFor } = createSeenStore(directory)
    const room = `catalogue-test-${Date.now()}`
    const keys = Array.from({ length: 1200 }, (_, i) => `question-${i}`)
    await markSeen(room, 'trivia', keys)
    await markSeen(room, 'trivia', [keys[0]!])
    const seen = await seenFor(room, 'trivia')
    assert.equal(seen.size, 1200)
    assert.equal([...seen].at(-1), keys[0])
    assert.deepEqual(await createSeenStore(directory).seenFor(room, 'trivia'), seen, 'history survives a restart')
    assert.deepEqual(byFreshness(['question-0', 'new-question', 'question-1'], (key) => key, ctx(seen)), ['new-question', 'question-1', 'question-0'])
  })
  it('offers the final unseen Truth or Dare cards before recycling the oldest ones', () => {
    const cards = CARDS.funny.truth.map((_, i) => `funny:truth:${i}`)
    let state = truthDare.start([a, b], { decks: ['funny'], recent: cards.slice(0, -2), fresh: [] }, ctx())
    for (const [by, action, payload] of [[a, 'spin', {}], [b, 'choose', { kind: 'truth' }]] as const) {
      const next = truthDare.act(state, by, action, payload, ctx())
      assert.ok(!('error' in next)); state = next
    }
    assert.deepEqual(new Set(state.offered.map((card) => card.id)), new Set([cards.at(-1), cards.at(-2), cards[0]]))
  })
})

describe('song identity and catalogue variety', () => {
  const song = (i: number): Song => ({ title: `Track ${i}`, artist: 'Test Artist', category: 'global', source: 'youtube', ref: `upload-${i}`, artwork: null, duration: 200, year: 2000 })
  it('does not shuffle heard filler songs ahead of unheard songs after preparing the pool', () => {
    const pool = Array.from({ length: 20 }, (_, i) => song(i))
    const seen = new Set(pool.slice(0, 15).flatMap((song) => [song.ref, songIdentityKey(song)]))
    const items = songItems(pool, 5, 'hard', ctx(seen))
    assert.equal(items.length, 5)
    assert.ok(items.every((item) => !seen.has(String(item.media!.ref))))
  })
  it('searches unheard identities first and reaches beyond the old top-twelve cutoff', async () => {
    const songs: SongIdentity[] = Array.from({ length: 40 }, (_, i) => ({ ...song(i), artist: 'Test Artist', rank: i + 1 }))
    const heard = new Set(songs.slice(0, 36).map(songIdentityKey))
    const pool = await freshSongPool(['global'], {
      discover: async () => songs, avoid: heard, limit: 4, random: () => 0,
      search: async (query) => [{ id: `replacement-${query.match(/Track (\d+)/)![1]}`, title: query, channel: 'Test Artist - Topic', thumbnail: '' }],
      inspect: async (results) => new Map(results.map((result) => [result.id, { duration: 200, embeddable: true }])),
    })
    assert.equal(pool.length, 4)
    assert.ok(pool.every((song) => !heard.has(songIdentityKey(song))))
  })
  it('remembers the recording identity and upload, while keeping identities out of the client view', () => {
    const pool = Array.from({ length: 8 }, (_, i) => song(i))
    const options = songQuiz.options({ rounds: 5, categories: ['global'] })
    assert.ok(!('error' in options))
    const state = songQuiz.start([a], { ...options, pool }, ctx())
    const item = state.items[0]!
    assert.deepEqual(songQuiz.used!(state), [String(item.media!.ref), ...item.repeatKeys!])
    const view = songQuiz.view(state, a.id) as { item: { repeatKeys?: string[]; reveal: unknown } }
    assert.equal(view.item.repeatKeys, undefined)
    assert.equal(view.item.reveal, null)
  })
})

describe('public trivia validation', () => {
  const encoded = (prompt = 'Which instrument has eighty-eight keys?', answers = ['Piano', 'Guitar', 'Violin', 'Trumpet']) => ({
    type: Buffer.from('multiple').toString('base64'), question: Buffer.from(prompt).toString('base64'),
    correct_answer: Buffer.from(answers[0]!).toString('base64'), incorrect_answers: answers.slice(1).map((answer) => Buffer.from(answer).toString('base64')),
  })
  it('decodes plain text and refuses duplicate options, unstable questions and reordered-answer traps', () => {
    assert.deepEqual(parsePublicQuestion(encoded(), 'music')?.slice(1), ['Which instrument has eighty-eight keys?', 'Piano', 'Guitar', 'Violin', 'Trumpet'])
    assert.equal(parsePublicQuestion(encoded('Who is the current president of this country?'), 'gk'), null)
    assert.equal(parsePublicQuestion(encoded('What is the most popular electric car?'), 'gk'), null)
    assert.equal(parsePublicQuestion(encoded(undefined, ['Piano', 'PIANO', 'Violin', 'Trumpet']), 'music'), null)
    assert.equal(parsePublicQuestion(encoded(undefined, ['Piano', 'All of the above', 'Violin', 'Trumpet']), 'music'), null)
    assert.equal(parsePublicQuestion(encoded('<script>alert(1)</script>'), 'gk'), null)
    assert.equal(uniqueQuestions([['gk', 'A question?', 'A', 'B', 'C', 'D'], ['gk', 'A QUESTION!', 'A', 'B', 'C', 'D']]).length, 1)
  })
  it('shares a public request across concurrent starts and falls back on a provider outage', async () => {
    let calls = 0
    const request = (async () => { calls++; throw new Error('provider offline') }) as typeof fetch
    const first = refreshTrivia(['movies'], request)
    const second = refreshTrivia(['music'], request)
    assert.equal(first, second)
    assert.deepEqual(await first, [])
    assert.deepEqual(await refreshTrivia(['movies'], request), [], 'respect the shared cooldown after a failure')
    assert.equal(calls, 1)
  })
})
