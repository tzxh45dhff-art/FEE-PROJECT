import assert from 'node:assert/strict'
import { boundsForPoints } from '../../src/features/party/geo/mapsSdk.ts'
import { after, before, describe, it } from 'node:test'
import { geoGame, distanceKm, geoPoints, validPoint, type GeoOptions, type GeoState } from '../src/games/geo.js'
import type { Ctx, Player } from '../src/games/engine.js'
import { buildGeoRoute, lookupGeo, type GeoLocation } from '../src/services/geoLocations.service.js'
import { api, enter, makeRoom, makeUser, next, startServer, type Client, type Harness } from './harness.js'

const a = { id: 'a', name: 'Aditi' },
  b = { id: 'b', name: 'Rohan' },
  c = { id: 'c', name: 'Meera' }
const locations: GeoLocation[] = Array.from({ length: 12 }, (_, i) => ({
  lat: i * 5,
  lng: i * 12,
  pano: `test-pano-${i}`,
  seed: `test-seed-${i}`,
  label: `Test region ${i}`,
  heading: 120,
}))
function game(extra: Partial<GeoOptions> = {}, players = [a, b]) {
  let now = 1000
  let present = players.map((p) => p.id)
  const timers: { ms: number; action: string; payload?: Record<string, unknown> }[] = []
  const ctx: Ctx = {
    now: () => now,
    random: () => 0,
    schedule: (ms, action, payload) => timers.push({ ms, action, payload }),
    clearSchedule: () => {
      timers.length = 0
    },
    present: () => present,
  }
  const parsed = geoGame.options({ rounds: 3, seconds: 30, ...extra })
  if ('error' in parsed) throw new Error(parsed.error)
  let state = geoGame.start(players, { ...parsed, locations }, ctx)
  const act = (by: Player | null, action: string, payload: Record<string, unknown> = {}) => {
    const result = geoGame.act(
      state,
      by,
      action,
      { token: state.token, round: state.round, attempt: state.attempt, ...payload },
      ctx,
    )
    if ('error' in result) throw new Error(result.error)
    state = result
    return state
  }
  const open = () => {
    for (const p of players) act(p, 'ready')
    now += 3000
    act(null, 'open')
  }
  return {
    get s() {
      return state
    },
    ctx,
    act,
    open,
    timers,
    setTime: (t: number) => {
      now = t
    },
    setPresent: (ids: string[]) => {
      present = ids
    },
    setState: (s: GeoState) => {
      state = s
    },
  }
}

describe('Somewhere geography rules', () => {
  it('keeps result bounds readable across the date line and at the poles', () => {
    const dateLine = boundsForPoints([
      { lat: 10, lng: 179 },
      { lat: 11, lng: -179 },
    ])
    assert.ok(dateLine.west > dateLine.east, 'cross the date line instead of fitting almost the whole world')
    for (const lat of [-90, 90]) {
      const bounds = boundsForPoints([{ lat, lng: 0 }])
      assert.ok(bounds.north > bounds.south)
      assert.ok(bounds.north <= 85 && bounds.south >= -85)
    }
  })
  it('seats the chosen duel opponent and leaves other friends watching', () => {
    const g = game({ mode: 'duel', opponent: c.id }, [a, b, c])
    assert.deepEqual(
      g.s.players.map((p) => p.id),
      [a.id, c.id],
    )
    assert.throws(() => g.act(b, 'ready'), /Join/)
  })
  it('calculates finite spherical distances, including date line, poles and antipodes', () => {
    assert.equal(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }), 0)
    assert.ok(Math.abs(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 180 }) - 20015.114) < 0.01)
    assert.ok(distanceKm({ lat: 0, lng: 179.9 }, { lat: 0, lng: -179.9 }) < 23)
    assert.ok(distanceKm({ lat: 90, lng: -150 }, { lat: 90, lng: 150 }) < 0.001)
    for (const p of [
      { lat: NaN, lng: 0 },
      { lat: 91, lng: 0 },
      { lat: 0, lng: Infinity },
      { lat: 0, lng: 181 },
      { lat: '0', lng: 0 },
      null,
    ])
      assert.equal(validPoint(p), false)
  })
  it('scores monotonically with a tighter India curve and a 25m perfect radius', () => {
    assert.equal(geoPoints(0.025, 'world'), 5000)
    assert.ok(geoPoints(0.026, 'world') < 5000)
    assert.ok(geoPoints(1000, 'india') < geoPoints(1000, 'world'))
    assert.equal(geoPoints(NaN, 'india'), 0)
    assert.equal(geoPoints(-1, 'india'), 0)
    let previous = 5000
    for (let d = 0; d < 21000; d += 1) {
      const p = geoPoints(d, 'world')
      assert.ok(p >= 0 && p <= previous)
      previous = p
    }
  })
  it('validates every setting and discards injected answers', () => {
    for (const options of [
      { map: 'mars' },
      { movement: 'teleport' },
      { mode: 'ranked' },
      { rounds: 4 },
      { seconds: 0 },
    ])
      assert.ok('error' in geoGame.options(options))
    const parsed = geoGame.options({ locations, token: 'injected' })
    assert.ok(!('error' in parsed))
    assert.equal(parsed.movement, 'moving')
    for (const movement of ['no-move', 'fixed'] as const) {
      const explicit = geoGame.options({ movement })
      assert.ok(!('error' in explicit))
      assert.equal(explicit.movement, movement)
    }
    assert.ok(!('locations' in parsed))
    assert.ok(!('token' in parsed))
  })
  it('waits for loading and a synchronized countdown before starting the clock', () => {
    const g = game()
    assert.equal(g.s.phase, 'loading')
    g.act(a, 'ready')
    assert.equal(g.s.phase, 'loading')
    g.act(b, 'ready')
    assert.equal(g.s.phase, 'countdown')
    g.act(null, 'open')
    assert.equal(g.s.phase, 'countdown')
    g.setTime(4000)
    g.act(null, 'open')
    assert.equal(g.s.deadline, 34000)
  })
  it('only exposes the current panorama, own pin and completed reveals', () => {
    const g = game()
    g.open()
    g.act(a, 'draft', { point: { lat: 5, lng: 8 }, revision: 1 })
    const other = geoGame.view(g.s, b.id) as { mine: unknown; scene: { pano: string }; history: unknown[] }
    assert.equal(other.mine, null)
    assert.deepEqual(other.history, [])
    const json = JSON.stringify(other)
    assert.ok(!json.includes('test-pano-1'))
    assert.ok(!json.includes('Test region 0'))
    assert.ok(!json.includes('"locations"'))
    assert.ok(!json.includes('"drafts"'))
    assert.deepEqual((geoGame.view(g.s, a.id) as { mine: unknown }).mine, { lat: 5, lng: 8 })
  })
  it('orders drafts, locks a confirmed guess once, and reveals early when everyone guesses', () => {
    const g = game()
    g.open()
    g.act(a, 'draft', { point: { lat: 1, lng: 1 }, revision: 2 })
    g.act(a, 'draft', { point: { lat: 20, lng: 20 }, revision: 1 })
    assert.equal(g.s.drafts.a!.point.lat, 1)
    g.act(a, 'guess', { point: { lat: 0, lng: 0 } })
    g.act(a, 'guess', { point: { lat: 40, lng: 40 } })
    assert.equal(g.s.locked.a!.lat, 0)
    assert.throws(() => g.act(c, 'guess', { point: { lat: 0, lng: 0 } }), /Join/)
    g.act(b, 'guess', { point: { lat: 1, lng: 1 } })
    assert.equal(g.s.phase, 'reveal')
    assert.equal(g.s.scores.a, 5000)
    assert.equal(g.s.history.length, 1)
    g.act(null, 'timeup')
    assert.equal(g.s.history.length, 1)
  })
  it('submits saved drafts at the deadline, refuses late guesses and cannot accept client timer actions', () => {
    const g = game()
    g.open()
    g.act(a, 'draft', { point: { lat: 0, lng: 0 }, revision: 1 })
    assert.throws(() => g.act(a, 'timeup'), /not available/)
    g.setTime(34000)
    assert.throws(() => g.act(b, 'guess', { point: { lat: 0, lng: 0 } }), /closed/)
    g.act(null, 'timeup')
    assert.equal(g.s.scores.a, 5000)
    assert.equal(g.s.scores.b, 0)
    assert.equal(g.s.history[0]!.guesses.b!.point, null)
  })
  it('excludes an unloaded player in Classic and pauses a Duel rather than awarding a free win', () => {
    const g = game()
    g.act(a, 'ready')
    g.setTime(21000)
    g.act(null, 'load-timeout')
    g.setTime(24000)
    g.act(null, 'open')
    assert.deepEqual(g.s.eligible, ['a'])
    assert.throws(() => g.act(b, 'guess', { point: { lat: 0, lng: 0 } }), /missed/)
    const d = game({ mode: 'duel' })
    d.act(a, 'ready')
    d.setTime(21000)
    d.act(null, 'load-timeout')
    assert.equal(d.s.phase, 'blocked')
    assert.deepEqual(d.s.scores, { a: 0, b: 0 })
  })
  it('keeps retries bounded by reserves and invalidates callbacks from previous attempts and games', () => {
    const g = game()
    g.setTime(21000)
    g.act(null, 'load-timeout')
    const old = { token: g.s.token, round: g.s.round, attempt: g.s.attempt }
    const pano = g.s.locations[0]!.pano
    assert.throws(() => g.act(b, 'replace'), /not available/)
    g.act(a, 'replace')
    assert.notEqual(g.s.locations[0]!.pano, pano)
    g.act(null, 'load-timeout', old)
    assert.equal(g.s.phase, 'loading')
    assert.throws(() => g.act(a, 'ready', old), /changed/)
    assert.throws(() => g.act(a, 'end', { token: 'old-game' }), /changed/)
  })
  it('joins at the next round and hands control to a present player if the host left', () => {
    const g = game()
    g.open()
    const joined = geoGame.join!(g.s, c)
    assert.ok(joined)
    g.setState(joined!)
    assert.throws(() => g.act(c, 'guess', { point: { lat: 0, lng: 0 } }), /missed/)
    g.setPresent(['b', 'c'])
    g.act(b, 'take-host')
    assert.equal(g.s.host, b.id)
    g.act(b, 'end')
    assert.equal(g.s.phase, 'over')
    assert.equal(g.s.endedEarly, true)
  })
  it('shortens Duels to 15 seconds after the first guess and applies score-gap damage', () => {
    const g = game({ mode: 'duel', seconds: 90 })
    g.open()
    g.setTime(5000)
    g.act(a, 'guess', { point: { lat: 0, lng: 0 } })
    assert.equal(g.s.deadline, 20000)
    g.setTime(20000)
    g.act(null, 'timeup')
    assert.equal(g.s.health.b, 1000)
    assert.equal(g.s.history[0]!.damage, 5000)
    assert.equal(geoGame.join!(g.s, c), null)
  })
  it('finishes a route once, preserves the recap and ignores late loading callbacks', () => {
    const g = game({}, [a])
    for (let i = 0; i < 3; i++) {
      g.setTime(i * 10000 + 1000)
      g.act(a, 'ready')
      g.setTime(i * 10000 + 4000)
      g.act(null, 'open')
      g.act(a, 'guess', { point: locations[i]! })
      g.act(a, 'next')
    }
    assert.equal(g.s.phase, 'over')
    assert.equal(g.s.scores.a, 15000)
    assert.ok(geoGame.over(g.s))
    g.act(a, 'ready')
    assert.equal(g.s.phase, 'over')
    assert.deepEqual(
      geoGame.used!(g.s),
      locations.slice(0, 3).map((l) => l.seed),
    )
  })
})

describe('Somewhere provider boundary', () => {
  it('balances continents and countries rather than weighting the largest seed lists', async () => {
    let calls = 0
    const route = await buildGeoRoute(
      'world',
      12,
      new Set(),
      async (p) => ({ status: 'OK', pano_id: `balanced-${calls++}`, location: p }),
      () => 0,
    )
    assert.equal(new Set(route.map((r) => r.seed.split(':')[1])).size, 12)
  })
  it('moves on from a timed-out candidate and prefers seeds the room has not seen', async () => {
    let calls = 0
    const lookup = async (p: { lat: number; lng: number }) => {
      calls += 1
      if (calls === 1) throw new Error('temporary network timeout')
      return { status: 'OK', pano_id: `test-${calls}`, location: p }
    }
    const first = await buildGeoRoute('world', 6, new Set(), lookup, () => 0)
    assert.equal(first.length, 6)
    const second = await buildGeoRoute('world', 6, new Set(first.map((x) => x.seed)), lookup, () => 0)
    assert.ok(second.every((x) => !first.some((y) => y.seed === x.seed)))
  })
  it('builds distinct, balanced real-panorama references with bounded lookups', async () => {
    let calls = 0
    const route = await buildGeoRoute(
      'world',
      7,
      new Set(),
      async (p) => ({ status: 'OK', pano_id: `test-${calls++}`, location: p }),
      () => 0,
    )
    assert.equal(route.length, 7)
    /* The first wave assumes about one usable spot in three, so it may check a few more than it needs — never more than ten. */
    assert.ok(calls >= 7 && calls <= 10, `${calls} lookups`)
    assert.equal(new Set(route.map((r) => r.pano)).size, 7)
    assert.ok(route.every((r) => validPoint(r) && r.label.startsWith('Near ')))
    calls = 0
    const unavailable = await buildGeoRoute(
      'world',
      5,
      new Set(),
      async () => {
        calls++
        return { status: 'ZERO_RESULTS' }
      },
      () => 0,
    )
    assert.equal(unavailable.length, 0)
    assert.ok(calls <= 96)
  })
  it('does not accept duplicate panoramas or invalid provider coordinates', async () => {
    const duplicate = await buildGeoRoute(
      'india',
      5,
      new Set(),
      async (p) => ({ status: 'OK', pano_id: 'one', location: p }),
      () => 0,
    )
    assert.equal(duplicate.length, 1)
    const invalid = await buildGeoRoute(
      'india',
      3,
      new Set(),
      async () => ({ status: 'OK', pano_id: 'bad', location: { lat: NaN, lng: 0 } }),
      () => 0,
    )
    assert.equal(invalid.length, 0)
  })
  it('sanitizes provider errors rather than returning URLs or credentials', async () => {
    const request = (async () =>
      new Response(JSON.stringify({ status: 'REQUEST_DENIED', error_message: 'provider private details' }), {
        status: 200,
      })) as typeof fetch
    await assert.rejects(
      lookupGeo({ lat: 0, lng: 0 }, 'test-only-key', undefined, request),
      (e) =>
        e instanceof Error &&
        /access was denied/.test(e.message) &&
        !e.message.includes('test-only-key') &&
        !e.message.includes('private details'),
    )
  })
  it('rejects contributed imagery before it can become an unrenderable round', async () => {
    let calls = 0
    const request = (async () => {
      calls++
      return new Response(
        JSON.stringify({
          status: 'OK',
          pano_id: 'contributed',
          location: { lat: 1, lng: 2 },
          copyright: 'Test contributor',
        }),
      )
    }) as typeof fetch
    const result = await lookupGeo({ lat: 1, lng: 2 }, 'test-only-key', undefined, request)
    assert.equal(result.status, 'ZERO_RESULTS')
    assert.equal(calls, 1)
  })
  it('revalidates a Google panorama ID and rejects an expired ID', async () => {
    let calls = 0
    const request = (async () => {
      calls++
      return new Response(
        JSON.stringify(
          calls === 1 ? { status: 'OK', pano_id: 'retired', copyright: '© 2026 Google' } : { status: 'ZERO_RESULTS' },
        ),
      )
    }) as typeof fetch
    assert.equal((await lookupGeo({ lat: 1, lng: 2 }, 'test-only-key', undefined, request)).status, 'ZERO_RESULTS')
    assert.equal(calls, 2)
  })
  it('scores the confirmed camera position and resamples failed regions without repeating successful ones', async () => {
    let calls = 0
    const request = (async () => {
      calls++
      return new Response(
        JSON.stringify({
          status: 'OK',
          pano_id: 'verified',
          location: { lat: calls === 1 ? 1 : 1.1, lng: 2 },
          copyright: '© 2026 Google',
        }),
      )
    }) as typeof fetch
    assert.equal((await lookupGeo({ lat: 1, lng: 2 }, 'test-only-key', undefined, request)).location!.lat, 1.1)
    let count = 0
    const route = await buildGeoRoute(
      'india',
      5,
      new Set(),
      async (p) => {
        count++
        return count <= 33 ? { status: 'ZERO_RESULTS' } : { status: 'OK', pano_id: `retry-${count}`, location: p }
      },
      () => 0,
    )
    assert.equal(route.length, 5)
    assert.equal(new Set(route.map((x) => x.seed)).size, 5)
  })
})

describe('Somewhere setup over real sockets', () => {
  let h: Harness, x: Client, roomId: string
  before(async () => {
    h = await startServer()
    const user = await makeUser(h.base, 'Aditi')
    roomId = (await makeRoom(h.base, user)).id
    x = await enter(h.base, user, roomId)
    const state = next(x, 'party:state')
    x.emit('party:open', { roomId })
    await state
  })
  after(async () => {
    x?.close()
    await h?.stop()
  })
  const ask = (event: string, payload: unknown) =>
    new Promise<{ error?: string; ok?: boolean }>((resolve) => x.emit(event, payload, resolve))
  it('calibrates the game clock without subscribing to Watch or changing party state', async () => {
    const sent = performance.timeOrigin + performance.now()
    const reply = next<{ sent: number; serverTime: number }>(x, 'geo:pong')
    x.emit('geo:ping', { sent })
    const pong = await reply
    assert.equal(pong.sent, sent)
    assert.ok(Math.abs(pong.serverTime - Date.now()) < 5000)
  })
  it('reports missing setup without blocking an existing game', async () => {
    const status = await api<{ configured: boolean }>(h.base, x.user, '/geo/status')
    assert.equal(status.configured, false)
    const reply = await ask('party:start', { roomId, game: 'geo', options: {} })
    assert.match(reply.error!, /server key/)
    const trivia = await ask('party:start', { roomId, game: 'trivia', options: { rounds: 5 } })
    assert.equal(trivia.ok, true)
  })
})
