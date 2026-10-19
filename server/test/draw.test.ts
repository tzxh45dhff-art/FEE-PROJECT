/**
 * Draw and guess: the rules, then two real sockets sharing a canvas.
 */

import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import type { Ctx } from '../src/games/engine.js'
import { drawGame, normalise, type Draw } from '../src/games/draw.js'
import { enter, makeRoom, makeUser, next, silence, startServer, type Client, type Harness } from './harness.js'

function fakeCtx(at = 0) {
  const timers: { ms: number; action: string; payload: Record<string, unknown> }[] = []
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
    const forGuesser = drawGame.view(s, 'r') as { word: string | null; mask: string; used?: unknown }
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
    const started = next<{ view: Draw }>(x, 'party:state')
    await new Promise((res) => x.emit('party:start', { roomId, game: 'draw', options: { rounds: 1 } }, res))
    const view = (await started).view
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
    drawerSock.emit('party:stroke', { roomId, id: 's1', color: '#ff0000', size: 6, tool: 'pen', points: [[0.1, 0.1], [0.2, 0.25]] })
    const stroke = await got
    assert.equal(stroke.id, 's1')
    assert.equal(stroke.points.length, 2)
  })

  it('the guesser cannot draw', async () => {
    guesserSock.emit('party:stroke', { roomId, id: 'x', color: '#00ff00', size: 6, tool: 'pen', points: [[0.5, 0.5]] })
    assert.ok(await silence(drawerSock, 'party:stroke'))
  })

  it('malformed ink is dropped', async () => {
    drawerSock.emit('party:stroke', { roomId, id: 's2', color: 'red; background:url(x)', size: 6, points: [[0.5, 0.5]] })
    drawerSock.emit('party:stroke', { roomId, id: 's3', color: '#ff0000', size: 999, points: [[0.5, 0.5]] })
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

  it('undo removes the drawer’s last stroke for everyone', async () => {
    const after = next<{ strokes: unknown[] }>(guesserSock, 'party:canvas')
    drawerSock.emit('party:undo', { roomId })
    assert.equal((await after).strokes.length, 0)
  })
})
