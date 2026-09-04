/**
 * The two halves, wired to each other rather than to fakes.
 *
 * `intent.test.mjs` drives `sync.js` with a hand-written bridge, and
 * `prime-bridge.test.mjs` drives `bridge-prime.js` with a hand-written sync.
 * Both pass while agreeing on nothing: rename a field on one side and each
 * suite stays green, because each is checking against its own idea of the
 * other. The bug that ships is the one in the gap between them.
 *
 * So this loads both real files into one page and lets them talk over the real
 * channel — `window.postMessage`, which is genuinely how they communicate,
 * MAIN world to ISOLATED. Nothing is stubbed except the page itself: a
 * `<video>` element that behaves like one, and a room that says where it is.
 *
 * What it proves is the round trip that matters: the room says a position, and
 * the actual element's `currentTime` ends up there — through the correction
 * loop, the command message, the bridge, and back up as state.
 *
 *   node extension/test/integration.test.mjs
 */

import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const bridgeSrc = readFileSync(new URL('../src/bridge-prime.js', import.meta.url), 'utf8')
const syncSrc = readFileSync(new URL('../src/sync.js', import.meta.url), 'utf8')
const primeSrc = readFileSync(new URL('../src/prime.js', import.meta.url), 'utf8')

/**
 * One Prime page, with both halves of the extension actually on it.
 *
 * The two worlds are modelled as what they really are from each other's point
 * of view: a shared `window` they can post messages through and nothing else.
 * Delivery is synchronous here rather than queued, which is the one place this
 * differs from a browser — and it differs in the strict direction, since it
 * gives the code less slack rather than more.
 */
function boot({ duration = 7200, startAt = 0, seekLatencyMs = 0 } = {}) {
  let clock = 10_000
  const sent = [] // what the room was told
  const listeners = []
  const timers = [] // { fn, ms }

  /*
   * A `<video>` that behaves like one: playing advances it in real time, and
   * — when a case asks for it — a seek takes a while to land.
   *
   * That latency is not decoration. Seeking a DRM stream costs a rebuffer, so
   * the correction aims *past* where the room is by what a seek here has been
   * measured to cost; seeking to where the room is right now guarantees
   * landing behind it. With an instant-seek fake, that lead is invisible and
   * removing it breaks nothing — which is precisely what a mutation test
   * found. A seek that takes time is what makes the lead observable.
   */
  let position = startAt
  let landing = null

  const video = {
    duration,
    paused: false,
    readyState: 4,
    currentSrc: 'blob:https://www.primevideo.com/feature',
    get currentTime() {
      return position
    },
    set currentTime(value) {
      if (seekLatencyMs <= 0) {
        position = value
        return
      }
      /* Buffering while it fetches, exactly as a real one does. */
      landing = { to: value, at: clock + seekLatencyMs }
      video.readyState = 1
    },
    play() {
      this.paused = false
      return { catch: () => undefined }
    },
    pause() {
      this.paused = true
    },
  }

  const window_ = {
    postMessage: (data) => {
      /* Both worlds hear everything posted on the page; each filters for what
         is addressed to it. That is exactly the real arrangement. */
      for (const fn of [...listeners]) fn({ source: window_, data })
    },
    addEventListener: (type, fn) => {
      if (type === 'message') listeners.push(fn)
    },
  }
  window_.window = window_

  const sandbox = {
    window: window_,
    performance: { now: () => clock },
    Date: { now: () => 1_700_000_000_000 + clock },
    Math,
    Number,
    JSON,
    console,
    location: { pathname: '/detail/B0FEATURE/ref=dv' },
    document: { querySelectorAll: () => [video] },
    setInterval: (fn, ms) => timers.push({ fn, ms }),
    setTimeout: () => 0,
    chrome: {
      runtime: {
        sendMessage: async (m) => {
          sent.push(m)
        },
        onMessage: { addListener: (fn) => (sandbox.__room = fn) },
      },
    },
  }

  vm.createContext(sandbox)
  /* Loaded in the manifest's own order: the bridge in MAIN, then the engine
     and its adapter in ISOLATED. */
  vm.runInContext(bridgeSrc, sandbox)
  vm.runInContext(syncSrc, sandbox)
  vm.runInContext(primeSrc, sandbox)

  const api = {
    video,
    sent,
    /**
     * Let time pass, with both timers firing at their real rates and playback
     * actually advancing — the bridge reports four times a second, the
     * correction loop looks once a second.
     */
    run(ms) {
      const step = 250
      for (let elapsed = 0; elapsed < ms; elapsed += step) {
        clock += step
        /* Playback moves the playhead directly — going through the setter
           would model ordinary playing as a seek. */
        if (!video.paused && !landing) position += step / 1000
        if (landing && clock >= landing.at) {
          position = landing.to
          video.readyState = 4
          landing = null
        }
        for (const t of timers) {
          if (clock % t.ms === 0) t.fn()
        }
      }
    },
    /** Where the room says the film should be, at this instant. */
    roomTarget(snapshot) {
      return snapshot.position + (clock - (snapshot.serverTime - 1_700_000_000_000)) / 1000
    },
    /** What the worker would push down after the server said something. */
    room(snapshot) {
      sandbox.__room?.({ kind: 'room', snapshot, offset: 0 })
    },
    snap: (o = {}) => ({
      roomId: 'r',
      item: { id: 'i', title: 'A Feature' },
      playing: true,
      seq: 1,
      serverTime: 1_700_000_000_000 + clock,
      position: 0,
      ...o,
    }),
  }
  return api
}

const R = []
const check = (name, pass, detail = '') => R.push({ name, pass, detail })

// ── the round trip that everything else exists to serve ─────────────────────
{
  const p = boot({ startAt: 100 })
  /* Settle: the bridge reports, the engine notices a title, the cooldown runs
     out. Nothing should have moved the film yet. */
  p.run(6000)
  const beforeRoom = p.video.currentTime
  check(
    'a tab with no room is left entirely alone',
    Math.abs(beforeRoom - 106) < 0.5,
    'currentTime=' + beforeRoom,
  )

  /* The room is a long way ahead. */
  p.room(p.snap({ position: 900 }))
  p.run(8000)
  check(
    'the room reaches the actual <video> element',
    p.video.currentTime > 890,
    'currentTime=' + p.video.currentTime,
  )
  check(
    '  and lands near the room, not past it',
    p.video.currentTime < 930,
    'currentTime=' + p.video.currentTime,
  )
}

// ── and it settles rather than oscillating ──────────────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 900 }))
  p.run(8000)

  /* Once corrected, a further half-minute of ordinary playback must not
     produce another correction — a loop here is the failure that walks a whole
     room backwards, and it is invisible in a unit test of either half. */
  const settled = p.video.currentTime
  p.run(30_000)
  const drifted = Math.abs(p.video.currentTime - (settled + 30))
  check('after correcting, it plays on untouched', drifted < 2, 'drift=' + drifted.toFixed(2))

  const seeks = p.sent.filter((m) => m.kind === 'control' && m.control?.action === 'seek')
  check('and reports no phantom scrubs of its own', seeks.length === 0, JSON.stringify(seeks))
}

// ── a seek that costs time is aimed past the room, not at it ────────────────
{
  /*
   * The correction has to lead its target.
   *
   * Seeking a DRM stream is not free — the player rebuffers, and by the time
   * the picture is back the room has moved on by however long that took. A
   * correction aimed at where the room is *now* therefore lands behind it
   * every single time, by exactly the seek's own cost. Small, but it never
   * converges: each correction leaves a fresh gap of the same size.
   */
  const p = boot({ startAt: 100, seekLatencyMs: 800 })
  p.run(6000)
  const snapshot = p.snap({ position: 900 })
  p.room(snapshot)
  p.run(6000)

  const want = p.roomTarget(snapshot)
  const behind = want - p.video.currentTime
  check(
    'a seek that costs 800ms still lands on the room',
    Math.abs(behind) < 0.35,
    'behind by ' + behind.toFixed(2) + 's (currentTime=' + p.video.currentTime.toFixed(1) + ')',
  )
}

// ── the person's own actions travel the other way ───────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 106 }))
  p.run(4000)
  p.sent.length = 0

  /* They press pause on Prime's own controls. */
  p.video.paused = true
  p.run(1000)
  const pauses = p.sent.filter((m) => m.kind === 'control' && m.control?.action === 'pause')
  check('pausing the real element reaches the room', pauses.length >= 1, JSON.stringify(p.sent))
}

{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 106 }))
  p.run(4000)
  p.sent.length = 0

  /* They drag the bar. */
  p.video.currentTime = 4000
  p.run(1000)
  const seeks = p.sent.filter((m) => m.kind === 'control' && m.control?.action === 'seek')
  check('scrubbing the real element reaches the room', seeks.length === 1, JSON.stringify(p.sent))
  check(
    '  with the position they actually scrubbed to',
    Math.round(seeks[0]?.control?.position ?? 0) === 4000,
    JSON.stringify(seeks),
  )
}

// ── a paused room stops the real element ────────────────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ playing: false, position: 106 }))
  p.run(3000)
  check('a paused room pauses the element', p.video.paused === true, 'paused=' + p.video.paused)

  p.room(p.snap({ playing: true, position: 106, seq: 2 }))
  p.run(8000)
  check('and resuming starts it again', p.video.paused === false, 'paused=' + p.video.paused)
}

// ── an advert is not a title, all the way through ───────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 900 }))

  /* Prime swaps the element to a 30-second advert. The bridge withholds
     `ready`, so nothing downstream should touch it — even with the room 800
     seconds away, which would otherwise be a certain correction. */
  p.video.duration = 30
  p.video.currentTime = 4
  p.run(8000)
  check(
    'an advert is never seeked, however far the room is',
    p.video.currentTime < 40,
    'currentTime=' + p.video.currentTime,
  )

  /* The film comes back. */
  p.video.duration = 7200
  p.video.currentTime = 106
  p.sent.length = 0
  p.run(8000)
  check(
    'and the film is picked up again after it',
    p.video.currentTime > 890,
    'currentTime=' + p.video.currentTime,
  )
  const seeks = p.sent.filter((m) => m.kind === 'control' && m.control?.action === 'seek')
  check('  without reporting the advert as a scrub', seeks.length === 0, JSON.stringify(seeks))
}

// ── buffering stands down instead of piling on ──────────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 900 }))
  /* Struggling: not paused, but not fetching either. */
  p.video.readyState = 1
  p.run(8000)
  check(
    'a buffering player is not seeked while it struggles',
    Math.abs(p.video.currentTime - 106) < 10,
    'currentTime=' + p.video.currentTime,
  )

  p.video.readyState = 4
  p.run(8000)
  check(
    'and is corrected once it recovers',
    p.video.currentTime > 890,
    'currentTime=' + p.video.currentTime,
  )
}

let bad = 0
for (const r of R) {
  console.log((r.pass ? '  PASS  ' : '  FAIL  ') + r.name + (r.pass ? '' : '   ' + r.detail))
  if (!r.pass) bad += 1
}
console.log(bad === 0 ? `\nall ${R.length} passed` : `\n${bad} FAILED`)
process.exit(bad ? 1 : 0)
