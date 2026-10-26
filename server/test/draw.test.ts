/**
 * Draw and guess: the rules, then two real sockets sharing a canvas.
 */

import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import type { Ctx } from '../src/games/engine.js'
import { drawGame, normalise, type Draw } from '../src/games/draw.js'
import { enter, makeRoom, makeUser, next, silence, startServer, type Client, type Harness } from './harness.js'

function fakeCtx(at = 0) {
  const timers: {
    ms: number
    action: string
    payload: Record<string, unknown>
  }[] = []
  const ctx: Ctx & { timers: typeof timers; at: number } = {
    timers,
    at,
    now: () => ctx.at,
    random: () => 0,
    schedule: (ms, action, payload = {}) => timers.push({ ms, action, payload }),
    clearSchedule: () => (timers.length = 0),
  }
  return ctx
}

const a = { id: 'a', name: 'Aditi' }
const r = { id: 'r', name: 'Rohan' }
const m = { id: 'm', name: 'Meera' }

const act = (s: Draw, by: typeof a | null, action: string, payload = {}, ctx = fakeCtx()) => {
  const next = drawGame.act(s, by, action, payload, ctx)
  if ('error' in next) throw new Error(next.error)
  return next as Draw
}

describe('draw and guess — the rules', () => {
  it('only the drawer sees the word and the choices; guessers get blanks', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 1, drawSeconds: 80 }, ctx)
    assert.equal(s.choices.length, 3)
    assert.equal((drawGame.view(s, 'r') as { choices: string[] }).choices.length, 0)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    const word = s.word!
    const forDrawer = drawGame.view(s, 'a') as { word: string; mask: string }
    const forGuesser = drawGame.view(s, 'r') as {
      word: string | null
      mask: string
      used?: unknown
    }
    assert.equal(forDrawer.word, word)
    assert.equal(forGuesser.word, null)
    assert.equal(forGuesser.mask.replace(/ /g, ''), '_'.repeat(word.replace(/ /g, '').length))
    assert.equal(forGuesser.used, undefined)
  })

  it('a right guess scores both, ignoring case and punctuation, and ends the turn when everyone has it', () => {
    const ctx = fakeCtx(0)
    let s = drawGame.start([a, r], { rounds: 1, drawSeconds: 80 }, ctx)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    ctx.at = 20_000 // a quarter of the way in
    s = act(s, r, 'guess', { text: `  ${s.word!.toUpperCase()}!! ` }, ctx)
    assert.ok(s.scores.r! > 70, `fast guess should score well (${s.scores.r})`)
    assert.equal(s.scores.a, 20)
    assert.equal(s.phase, 'reveal', 'the only guesser got it, so the turn is over')
  })

  it('accepts punctuation and spacing variations in a multiword answer', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 1, drawSeconds: 60 }, ctx)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    s = { ...s, word: 'ice cream' }
    s = act(s, r, 'guess', { text: 'ICE-CREAM!!' }, ctx)
    assert.ok(s.guessed.includes('r'))
    assert.equal(s.phase, 'reveal')
  })

  it('a near miss is whispered to the guesser only', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r, m], { rounds: 1, drawSeconds: 80 }, ctx)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    s = { ...s, word: 'elephant' }
    s = act(s, r, 'guess', { text: 'elefant' }, ctx)
    const rohan = drawGame.view(s, 'r') as { feed: { kind: string }[] }
    const meera = drawGame.view(s, 'm') as { feed: { kind: string }[] }
    assert.ok(rohan.feed.some((f) => f.kind === 'close'))
    assert.ok(!meera.feed.some((f) => f.kind === 'close'))
  })

  it('a wrong guess is shown to everyone; the drawer cannot guess', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 1, drawSeconds: 80 }, ctx)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    s = act(s, r, 'guess', { text: 'definitely not it' }, ctx)
    assert.ok((drawGame.view(s, 'a') as { feed: { text: string }[] }).feed.some((f) => f.text === 'definitely not it'))
    assert.ok('error' in drawGame.act(s, a, 'guess', { text: s.word! }, ctx))
  })

  it('hints reveal letters but never the whole word', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 1, drawSeconds: 80 }, ctx)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    s = { ...s, word: 'cat', revealed: [] }
    for (let i = 0; i < 5; i++) s = act(s, null, 'hint', { turn: s.turn }, ctx)
    assert.ok(s.revealed.length <= 1, 'a three-letter word keeps two letters back')
  })

  it('a timer from a turn that already ended does nothing', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 2, drawSeconds: 80 }, ctx)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    s = act(s, null, 'timeup', { turn: 0 }, ctx)
    s = act(s, null, 'next', { turn: 0 }, ctx)
    assert.equal(s.turn, 1)
    const before = s.phase
    s = act(s, null, 'timeup', { turn: 0 }, ctx) // stale
    assert.equal(s.phase, before)
  })

  it('the drawer rotates, and the game ends after everyone has drawn', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 1, drawSeconds: 60 }, ctx)
    assert.equal(s.players[s.drawer]!.id, 'a')
    s = act(s, null, 'autopick', { turn: 0 }, ctx)
    s = act(s, null, 'timeup', { turn: 0 }, ctx)
    s = act(s, null, 'next', { turn: 0 }, ctx)
    assert.equal(s.players[s.drawer]!.id, 'r')
    s = act(s, null, 'autopick', { turn: 1 }, ctx)
    s = act(s, null, 'timeup', { turn: 1 }, ctx)
    s = act(s, null, 'next', { turn: 1 }, ctx)
    assert.equal(s.phase, 'over')
    assert.ok(drawGame.over(s))
  })

  it('rejects a guess received after the deadline even if the timer callback is delayed', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 1, drawSeconds: 60 }, ctx)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    ctx.at = s.deadline!
    assert.deepEqual(drawGame.act(s, r, 'guess', { text: s.word }, ctx), {
      error: 'That turn has ended',
    })
    assert.equal(s.scores.r, 0)
  })

  it('keeps the drawing order stable when a late arrival tries to join', () => {
    const ctx = fakeCtx()
    const s = drawGame.start([a, r], { rounds: 2, drawSeconds: 60 }, ctx)
    assert.equal(drawGame.join!(s, m, ctx), null)
    assert.equal(drawGame.join!(s, a, ctx), s)
    assert.equal(s.turns, 4)
  })

  it('custom words are validated and the whole word bank stays private', () => {
    assert.ok('error' in drawGame.options({ customWords: ['one', 'two'] }))
    assert.ok('error' in drawGame.options({ customWords: ['valid', 'also valid', '<script>'] }))
    const options = drawGame.options({ customWords: ['Sleepy Cat', 'spaceship', 'samosa'], hints: 0 })
    if ('error' in options) throw new Error(options.error)
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], options, ctx)
    assert.deepEqual([...s.choices].sort(), ['samosa', 'sleepy cat', 'spaceship'])
    assert.equal((drawGame.view(s, 'r') as Record<string, unknown>).wordBank, undefined)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    assert.equal(ctx.timers.filter((t) => t.action === 'hint').length, 0)
  })

  it('the turn recap reports only this turn’s score gains', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 2, drawSeconds: 60 }, ctx)
    s.scores = { a: 120, r: 80 }
    s.turnStartScores = { a: 120, r: 80 }
    s = act(s, a, 'pick', { index: 0 }, ctx)
    s = act(s, r, 'guess', { text: s.word }, ctx)
    assert.deepEqual((drawGame.view(s, 'r') as { turnScores: unknown }).turnScores, { a: 20, r: 120 })
  })

  it('a guess queued for an earlier turn is rejected', () => {
    const ctx = fakeCtx()
    let s = drawGame.start([a, r], { rounds: 2, drawSeconds: 60 }, ctx)
    s = act(s, a, 'pick', { index: 0 }, ctx)
    assert.deepEqual(drawGame.act(s, r, 'guess', { text: s.word, turn: -1 }, ctx), { error: 'That turn has ended' })
  })

  it('normalises the way people type', () => {
    assert.equal(normalise('  Auto-Rickshaw! '), 'autorickshaw')
    assert.equal(normalise('ICE   cream'), 'ice cream')
  })
})

describe('draw and guess — the canvas, between two sockets', () => {
  let h: Harness
  let drawerSock: Client
  let guesserSock: Client
  let roomId: string
  let canvasKey: string

  before(async () => {
    h = await startServer()
    const ua = await makeUser(h.base, 'Aditi')
    const ur = await makeUser(h.base, 'Rohan')
    roomId = (await makeRoom(h.base, ua, ur)).id
    const x = await enter(h.base, ua, roomId)
    const y = await enter(h.base, ur, roomId)
    await Promise.all(
      [x, y].map((s) => {
        const opened = next(s, 'party:state')
        s.emit('party:open', { roomId })
        return opened
      }),
    )
    const started = next<{ session: string; view: Draw }>(x, 'party:state')
    await new Promise((res) => x.emit('party:start', { roomId, game: 'draw', options: { rounds: 1 } }, res))
    const initial = await started
    const view = initial.view
    canvasKey = `${initial.session}:${view.turn}`
    drawerSock = view.players[view.drawer]!.id === ua.id ? x : y
    guesserSock = drawerSock === x ? y : x
    const picked = next(guesserSock, 'party:state')
    await new Promise((res) => drawerSock.emit('party:act', { roomId, action: 'pick', payload: { index: 0 } }, res))
    await picked
  })
  after(async () => {
    drawerSock?.close()
    guesserSock?.close()
    await h?.stop()
  })

  it('the drawer’s strokes reach the guesser', async () => {
    const got = next<{ id: string; points: number[][] }>(guesserSock, 'party:stroke')
    drawerSock.emit('party:stroke', {
      roomId,
      key: canvasKey,
      id: 's1',
      color: '#ff0000',
      size: 6,
      tool: 'pen',
      points: [
        [0.1, 0.1],
        [0.2, 0.25],
      ],
    })
    const stroke = await got
    assert.equal(stroke.id, 's1')
    assert.equal(stroke.points.length, 2)
  })

  it('the guesser cannot draw', async () => {
    guesserSock.emit('party:stroke', {
      roomId,
      key: canvasKey,
      id: 'x',
      color: '#00ff00',
      size: 6,
      tool: 'pen',
      points: [[0.5, 0.5]],
    })
    assert.ok(await silence(drawerSock, 'party:stroke'))
  })

  it('malformed ink is dropped', async () => {
    drawerSock.emit('party:stroke', {
      roomId,
      key: canvasKey,
      id: 's2',
      color: 'red; background:url(x)',
      size: 6,
      points: [[0.5, 0.5]],
    })
    drawerSock.emit('party:stroke', {
      roomId,
      key: canvasKey,
      id: 's3',
      color: '#ff0000',
      size: 999,
      points: [[0.5, 0.5]],
    })
    assert.ok(await silence(guesserSock, 'party:stroke'))
  })

  it('someone opening the game mid-turn gets the drawing so far', async () => {
    const late = next<{ strokes: { id: string }[] }>(guesserSock, 'party:canvas')
    guesserSock.emit('party:open', { roomId })
    const canvas = await late
    assert.deepEqual(
      canvas.strokes.map((st) => st.id),
      ['s1'],
    )
  })

  it('a mounted board can explicitly recover the complete drawing', async () => {
    const got = next<{ key: string; strokes: { id: string }[] }>(guesserSock, 'party:canvas')
    guesserSock.emit('party:canvas:request', { roomId, key: canvasKey })
    const snapshot = await got
    assert.equal(snapshot.key, canvasKey)
    assert.deepEqual(
      snapshot.strokes.map((st) => st.id),
      ['s1'],
    )
  })

  it('stale ink and edits cannot change a different turn or rematch', async () => {
    const stale = `${canvasKey}-old`
    drawerSock.emit('party:stroke', {
      roomId,
      key: stale,
      id: 'late',
      color: '#ff0000',
      size: 6,
      points: [[0.5, 0.5]],
    })
    drawerSock.emit('party:clear', { roomId, key: stale })
    drawerSock.emit('party:undo', { roomId, key: stale })
    assert.ok(await silence(guesserSock, 'party:stroke'))
    const got = next<{ strokes: { id: string }[] }>(guesserSock, 'party:canvas')
    guesserSock.emit('party:canvas:request', { roomId, key: canvasKey })
    assert.deepEqual(
      (await got).strokes.map((st) => st.id),
      ['s1'],
    )
  })

  it('undo removes the drawer’s last stroke for everyone', async () => {
    const after = next<{ strokes: unknown[] }>(guesserSock, 'party:canvas')
    drawerSock.emit('party:undo', { roomId, key: canvasKey })
    assert.equal((await after).strokes.length, 0)
  })
  it('redo restores an undone stroke for both devices', async () => {
    const got = next<{ strokes: { id: string }[]; canRedo: boolean }>(guesserSock, 'party:canvas')
    drawerSock.emit('party:redo', { roomId, key: canvasKey })
    const snapshot = await got
    assert.deepEqual(
      snapshot.strokes.map((s) => s.id),
      ['s1'],
    )
    assert.equal(snapshot.canRedo, false)
  })

  it('clearing is undoable, and a fresh mark invalidates redo', async () => {
    let got = next<{ strokes: { id: string; tool: string }[]; canRedo: boolean }>(guesserSock, 'party:canvas')
    drawerSock.emit('party:clear', { roomId, key: canvasKey })
    const cleared = await got
    assert.equal(cleared.strokes.at(-1)?.tool, 'clear')
    got = next(guesserSock, 'party:canvas')
    drawerSock.emit('party:undo', { roomId, key: canvasKey })
    const restored = await got
    assert.deepEqual(
      restored.strokes.map((s) => s.id),
      ['s1'],
    )
    assert.equal(restored.canRedo, true)
    const ink = next(guesserSock, 'party:stroke')
    drawerSock.emit('party:stroke', { roomId, key: canvasKey, id: 'fill1', color: '#ff0000', size: 6, tool: 'fill', points: [[0.5, 0.5]] })
    await ink
    got = next(guesserSock, 'party:canvas')
    guesserSock.emit('party:canvas:request', { roomId, key: canvasKey })
    const updated = await got
    assert.equal(updated.canRedo, false)
    assert.equal(updated.strokes.at(-1)?.tool, 'fill')
  })

  it('a rematch starts a fresh page even when both games are on turn zero', async () => {
    drawerSock.emit('party:stroke', {
      roomId,
      key: canvasKey,
      id: 'old-game',
      color: '#ff0000',
      size: 6,
      points: [[0.1, 0.1]],
    })
    await new Promise((res) => drawerSock.emit('party:act', { roomId, action: 'end', payload: {} }, res))
    const got = next<{ session: string; view: Draw }>(drawerSock, 'party:state')
    await new Promise((res) => drawerSock.emit('party:start', { roomId, game: 'draw', options: { rounds: 1 } }, res))
    const fresh = await got
    const freshKey = `${fresh.session}:${fresh.view.turn}`
    assert.notEqual(freshKey, canvasKey)
    const snapshot = next<{ key: string; strokes: unknown[] }>(drawerSock, 'party:canvas')
    drawerSock.emit('party:canvas:request', { roomId, key: freshKey })
    assert.deepEqual((await snapshot).strokes, [])
  })
})
