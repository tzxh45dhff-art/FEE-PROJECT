import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { advance, createMatch, parseFlick, shoot } from '../src/games/penfight.js'
import { aimContact, chooseBotShot, flick, makePen, openingPens, sampleFlight, simulate, step, type Flick } from '../src/games/penfight.physics.js'
import { enter, makeRoom, makeUser, next, silence, startServer, type Client, type Harness } from './harness.js'

const players: [{ id: string; name: string }, { id: string; name: string }] = [{ id: 'a', name: 'Aditi' }, { id: 'b', name: 'Rohan' }]
const shot: Flick = { dx: 0, dz: -1, power: 0.65, contact: 0 }
describe('Pen Fight physics and rounds', () => {
  it('runs the same shot identically, independently of rendering frame rate', () => {
    assert.deepEqual(simulate(openingPens(), 0, shot), simulate(openingPens(), 0, shot))
    const result = simulate(openingPens(), 0, shot)
    assert.deepEqual(sampleFlight(result, 99999), result.frames.at(-1))
    assert.deepEqual(sampleFlight(result, -100), result.frames[0])
    assert.ok(result.duration > 0 && result.duration <= 5000)
  })
  it('center flicks translate; end flicks create real torque', () => {
    const a = makePen(0, 0, 0), b = makePen(0, 0, 0)
    flick(a, shot); flick(b, { ...shot, contact: 0.9 })
    assert.equal(Math.abs(a.omega), 0)
    assert.ok(Math.abs(b.omega) > 1)
    assert.ok(Math.abs(b.vz) < Math.abs(a.vz), 'tip contact spends some energy on spin')
  })
  it('collisions transfer momentum and do not tunnel at maximum power', () => {
    const result = simulate([{ ...openingPens()[0], x: 0, z: 0.17 }, { ...openingPens()[1], x: 0, z: -0.17 }], 0, { ...shot, power: 1 })
    assert.ok(result.frames.at(-1)![1].z < -0.17)
    assert.ok(result.frames.every(pair => pair.every(p => Number.isFinite(p.x + p.z + p.angle))))
  })
  it('a centered parallel impact does not invent a spin', () => {
    const flight = simulate([{ ...openingPens()[0], x: 0, z: 0.12 }, { ...openingPens()[1], x: 0, z: -0.12, angle: 0 }], 0, { ...shot, power: 0.8 })
    const end = flight.frames.at(-1)!
    assert.ok(Math.abs(end[0].angle) < 0.001 && Math.abs(end[1].angle) < 0.001)
  })
  it('a supported overhanging tip stays, but a lost centre of mass falls', () => {
    const p = makePen(0.22, 0, 0)
    step([p]); assert.equal(p.onDesk, true)
    p.x = 0.241; step([p]); assert.equal(p.onDesk, false)
  })
  it('rejects malformed, oversized, nonfinite and zero-length shots', () => {
    for (const s of [null, {}, { ...shot, dx: NaN }, { ...shot, power: Infinity }, { ...shot, power: 2 }, { ...shot, power: 0 }, { ...shot, contact: 2 }, { ...shot, dx: 0, dz: 0 }, { ...shot, dx: 100 }]) assert.equal(parseFlick(s), null)
    assert.ok(parseFlick(shot))
  })
  it('moves once, alternates when settled, and preserves a partial round', () => {
    const start = createMatch(players, 1, 0)
    const moving = shoot(start, { ...shot, power: 0.2 }, 100)
    assert.equal(moving.phase, 'moving'); assert.equal(moving.settling, true)
    assert.equal(advance(moving, moving.deadline - 1), moving)
    const next = advance(moving, moving.deadline)
    assert.equal(next.phase, 'aim'); assert.equal(next.turn, 1)
    assert.notDeepEqual(next.pens, start.pens)
    assert.deepEqual(next.scores, [0, 0])
  })
  it('awards the survivor, lets the loser open, and shows the fallen pens before reset', () => {
    const s = shoot(createMatch(players, 1, 0), shot, 0)
    s.shot!.frames[s.shot!.frames.length - 1] = [{ ...s.pens[0], onDesk: false }, s.pens[1]]
    const round = advance(s, s.deadline)
    assert.deepEqual(round.scores, [0, 1]); assert.equal(round.turn, 0)
    assert.equal(round.phase, 'round'); assert.equal(round.pens[0].onDesk, false)
    const next = advance(round, round.deadline)
    assert.equal(next.round, 2); assert.deepEqual(next.pens, openingPens(2)); assert.equal(next.turn, 0)
  })
  it('both falling is a draw, and three points end a match', () => {
    const s = shoot(createMatch(players, 1, 0), shot, 0)
    s.shot!.frames[s.shot!.frames.length - 1] = s.pens.map(p => ({ ...p, onDesk: false })) as typeof s.pens
    const draw = advance(s, s.deadline)
    assert.deepEqual(draw.scores, [0, 0]); assert.equal(draw.result?.reason, 'both')
    s.scores = [2, 0]; s.shot!.frames[s.shot!.frames.length - 1]![0].onDesk = true
    const won = advance(s, s.deadline)
    assert.equal(won.winner, 0); assert.equal(won.phase, 'over')
  })
  it('three missed turns forfeit without leaving a locked desk', () => {
    let s = createMatch(players, 1, 0)
    for (let i = 0; i < 5; i++) s = advance(s, s.deadline)
    assert.equal(s.phase, 'over'); assert.equal(s.winner, 1)
    assert.equal(s.result?.reason, 'timeout')
  })
  it('the practice rival chooses a legal shot with the same solver', () => {
    const move = chooseBotShot(openingPens(), 1)
    assert.ok(parseFlick(move))
    const flight = simulate(openingPens(), 1, move)
    assert.equal(flight.frames.at(-1)![1].onDesk, true)
  })
  it('keeps mirrored, varied openings free of an easy first-shot knockout', () => {
    const layouts = new Set<string>()
    for (let round = 1; round <= 4; round++) {
      const pens = openingPens(round)
      layouts.add(JSON.stringify(pens))
      assert.equal(pens[0].x, -pens[1].x)
      assert.equal(pens[0].z, -pens[1].z)
      for (const seat of [0, 1] as const) {
        const mine = pens[seat], other = pens[1 - seat]!
        const direct = Math.atan2(other.z - mine.z, other.x - mine.x)
        for (let offset = -0.4; offset <= 0.4; offset += 0.04) {
          for (const power of [0.8, 0.9, 1]) {
            for (const contact of [-0.5, 0, 0.5]) {
              const end = simulate(pens, seat, { dx: Math.cos(direct + offset), dz: Math.sin(direct + offset), power, contact }).frames.at(-1)!
              assert.ok(!(end[seat].onDesk && !end[1 - seat]!.onDesk), `opening ${round}, seat ${seat}: easy opening win`)
            }
          }
        }
      }
    }
    assert.equal(layouts.size, 4)
    assert.deepEqual(openingPens(5), openingPens(1))
  })
  it('makes a straight centre flick forgiving without removing deliberate tip shots', () => {
    assert.equal(aimContact(0), 0)
    assert.equal(aimContact(0.01), 0)
    assert.equal(aimContact(-0.01), 0)
    assert.ok(aimContact(0.04) > 0.5)
    assert.equal(aimContact(1), 1)
    assert.equal(aimContact(-1), -1)
  })
  it('offers varied legal relaxed shots and a repeatable sharp rival', () => {
    let seed = 19
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    const moves = new Set<string>()
    for (let n = 0; n < 30; n++) {
      const shot = chooseBotShot(openingPens(), 1, 'chill', random)
      assert.ok(parseFlick(shot))
      moves.add(JSON.stringify(shot))
    }
    assert.ok(moves.size > 20)
    assert.deepEqual(chooseBotShot(openingPens(), 1, 'sharp', random), chooseBotShot(openingPens(), 1, 'sharp', random))
  })
  it('fuzzed legal shots stay finite and terminate within the bounded replay', () => {
    let seed = 7
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    for (let i = 0; i < 300; i++) {
      const a = random() * Math.PI * 2
      const flight = simulate(openingPens(), i % 2 as 0 | 1, { dx: Math.cos(a), dz: Math.sin(a), power: random(), contact: random() * 2 - 1 })
      assert.ok(flight.frames.length <= 151)
      assert.ok(flight.frames.every(pair => pair.every(p => Number.isFinite(p.x + p.z + p.angle))))
    }
  })
})

describe('Pen Fight real sockets', () => {
  let h: Harness, a: Client, b: Client, c: Client, roomId: string, opponent: { id: string; name: string }
  const ask = (s: Client, event: string, data = {}) => new Promise<{ ok?: boolean; error?: string }>(resolve => s.emit(event, { roomId, ...data }, resolve))
  before(async () => {
    h = await startServer()
    const ua = await makeUser(h.base, 'Aditi'), ub = await makeUser(h.base, 'Rohan'), uc = await makeUser(h.base, 'Meera')
    const room = await makeRoom(h.base, ua, ub, uc)
    roomId = room.id; opponent = ub
    a = await enter(h.base, ua, roomId); b = await enter(h.base, ub, roomId); c = await enter(h.base, uc, roomId)
    for (const s of [a, b, c]) await ask(s, 'game:open')
  })
  after(async () => { a?.disconnect(); b?.disconnect(); c?.disconnect(); await h?.stop() })
  it('verifies opponent membership instead of trusting a supplied name', async () => {
    assert.ok((await ask(a, 'game:start', { opponent: { id: 'stranger', name: 'Nobody' } })).error)
    const state = next<any>(a, 'game:state')
    assert.ok((await ask(a, 'game:start', { opponent: { ...opponent, name: 'Forged' } })).ok)
    const s = await state
    assert.equal(s.players[1].name, 'Rohan')
  })
  it('rejects out-of-turn, duplicate and stale shots; settles without client reports', async () => {
    const state = next<any>(a, 'game:state'); await ask(a, 'game:open'); const s = await state
    const data = { epoch: s.epoch, seq: s.seq, shot: { ...shot, power: 0.2 } }
    assert.ok((await ask(b, 'game:flick', data)).error)
    assert.ok((await ask(c, 'game:flick', data)).error)
    assert.ok((await ask(a, 'game:flick', { ...data, epoch: s.epoch - 1 })).error)
    const moving = next<any>(b, 'game:state')
    assert.ok((await ask(a, 'game:flick', data)).ok)
    assert.equal((await moving).phase, 'moving')
    assert.ok((await ask(a, 'game:flick', data)).error)
    const settled = await next<any>(b, 'game:state')
    assert.equal(settled.phase, 'aim'); assert.equal(settled.turn, 1)
    assert.deepEqual(settled.scores, [0, 0])
    const late = next<any>(c, 'game:state'); await ask(c, 'game:open')
    assert.deepEqual((await late).pens, settled.pens)
  })
  it('ignores forged client positions and protects end/rematch epochs', async () => {
    const state = next<any>(a, 'game:state'); await ask(a, 'game:open'); const s = await state
    const quiet = silence(a, 'game:state')
    b.emit('game:settled', { roomId, pens: s.pens.map((p: object) => ({ ...p, onDesk: false })) })
    assert.ok(await quiet)
    assert.ok((await ask(c, 'game:end', { epoch: s.epoch })).error)
    assert.ok((await ask(a, 'game:end', { epoch: s.epoch - 1 })).error)
    assert.ok((await ask(a, 'game:end', { epoch: s.epoch })).ok)
    const state2 = next<any>(a, 'game:state'); await ask(a, 'game:start', { opponent }); const s2 = await state2
    assert.notEqual(s2.epoch, s.epoch)
    assert.ok((await ask(a, 'game:end', { epoch: s.epoch })).error)
  })
  it('finishes a shot after its player disconnects and restores it on rejoin', async () => {
    const current = next<any>(a, 'game:state'); await ask(a, 'game:open'); const s = await current
    const user = a.user
    assert.ok((await ask(a, 'game:flick', { epoch: s.epoch, seq: s.seq, shot: { ...shot, power: 0.9 } })).ok)
    a.disconnect()
    const mid = next<any>(c, 'game:state'); await ask(c, 'game:open'); const flight = await mid
    assert.equal(flight.phase, 'moving'); assert.ok(flight.shot.frames.length > 1)
    const settled = await next<any>(c, 'game:state')
    assert.notEqual(settled.phase, 'moving')
    a = await enter(h.base, user, roomId)
    const recovered = next<any>(a, 'game:state'); await ask(a, 'game:open')
    assert.deepEqual((await recovered).pens, settled.pens)
  })

})
