/**
 * Driving a player nobody can document.
 *
 * `bridge-prime.js` has one decision in it that cannot be checked by reading
 * it, and it is the dangerous one: whether Amazon's player counts in seconds
 * or milliseconds. Being wrong there is not a feature that quietly fails, it
 * is a two-hour film seeking to its eighth second — or past its end — in
 * everybody's tab at once.
 *
 * The bridge refuses to guess. It compares the SDK's number against the
 * element's `currentTime`, which is unambiguously seconds, and if neither
 * reading of it describes the same playhead it declines to use the SDK at all.
 * These tests are that refusal, held to.
 *
 * The other untestable-by-reading part is the fallback itself: the element is
 * tried first, and only demoted if a seek is *observed* not to take. Netflix's
 * player reverts an unauthorised position, and if Prime's does the same the
 * failure is invisible — the seek appears to work and then quietly does not.
 *
 *   node extension/test/prime-bridge.test.mjs
 */

import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const src = readFileSync(new URL('../src/bridge-prime.js', import.meta.url), 'utf8')

/**
 * A Prime page, stood up around the bridge.
 *
 * Everything the bridge reaches for is a stub: the videos on the page, the
 * SDK global if this case wants one, the clock, and the tick. The bridge is
 * loaded as-is with no test hooks in it — commands go in the way the real
 * extension sends them, through the `message` listener it registers itself.
 */
function boot(options = {}) {
  let clock = 1000
  const posted = []
  const sdkCalls = []
  let tickFn = null
  let onMessage = null

  const elements = (options.videos ?? [{}]).map((v) => ({
    currentTime: 0,
    duration: 7200,
    paused: false,
    readyState: 4,
    currentSrc: 'blob:https://www.primevideo.com/abc',
    play: () => ({ catch: () => undefined }),
    pause() {
      this.paused = true
    },
    ...v,
  }))

  const sandbox = {
    performance: { now: () => clock },
    Math,
    Number,
    console,
    location: { pathname: options.path ?? '/detail/B0ABC123/ref=x' },
    setInterval: (fn) => {
      tickFn = fn
      return 1
    },
    document: { querySelectorAll: () => elements },
  }
  sandbox.window = {
    postMessage: (m) => posted.push(m),
    addEventListener: (type, fn) => {
      if (type === 'message') onMessage = fn
    },
  }
  if (options.sdk) {
    sandbox.window.ATVWebPlayerSDK = {
      getActivePlayer: () => ({
        getCurrentTime: () => options.sdk.clock,
        seek: (value) => sdkCalls.push({ method: 'seek', value }),
      }),
    }
  }
  sandbox.window.window = sandbox.window

  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)

  const api = {
    elements,
    posted,
    sdkCalls,
    advance: (ms) => {
      clock += ms
    },
    tick: () => tickFn?.(),
    send: (data) => onMessage?.({ source: sandbox.window, data: { channel: 'huddle', ...data } }),
    last: () => posted[posted.length - 1],
  }
  api.seek = (seconds) => api.send({ kind: 'command', command: 'seek', seconds })
  return api
}

const R = []
const check = (name, pass, detail = '') => R.push({ name, pass, detail })

// ── the element is the interface, when it works ─────────────────────────────
{
  const b = boot({ videos: [{ currentTime: 100 }], sdk: { clock: 100_000 } })
  b.seek(500)
  check('a seek reaches the element', b.elements[0].currentTime === 500, String(b.elements[0].currentTime))
  check('and does not touch the SDK first', b.sdkCalls.length === 0, JSON.stringify(b.sdkCalls))

  /* The player honoured it. That settles the element as the interface. */
  b.advance(300)
  b.tick()
  b.seek(900)
  check('a second seek still uses the element', b.elements[0].currentTime === 900, String(b.elements[0].currentTime))
  check('the SDK is never reached at all', b.sdkCalls.length === 0, JSON.stringify(b.sdkCalls))
}

// ── a player that reverts the position gets found out ───────────────────────
{
  const b = boot({ videos: [{ currentTime: 100 }], sdk: { clock: 100_000 } })
  b.seek(500)
  /* Netflix's failure mode, transplanted: the assignment takes, and then the
     player quietly puts the playhead back. */
  b.elements[0].currentTime = 100
  b.advance(2000)
  b.tick()
  check(
    'a reverted seek falls back to the SDK',
    b.sdkCalls.some((c) => c.method === 'seek'),
    JSON.stringify(b.sdkCalls),
  )
  check(
    '  ...in milliseconds, because that is what its clock reads in',
    b.sdkCalls[0]?.value === 500_000,
    JSON.stringify(b.sdkCalls),
  )

  b.sdkCalls.length = 0
  b.seek(800)
  check(
    'and stops asking the element once it is known not to take',
    b.sdkCalls.some((c) => c.value === 800_000) && b.elements[0].currentTime === 100,
    JSON.stringify(b.sdkCalls) + ' pos=' + b.elements[0].currentTime,
  )
}

// ── units are measured, never assumed ───────────────────────────────────────
{
  /* Same scenario, but this SDK counts in seconds. Nothing about the code
     changes — only what its clock reads next to the element's. */
  const b = boot({ videos: [{ currentTime: 100 }], sdk: { clock: 100 } })
  b.seek(500)
  b.elements[0].currentTime = 100
  b.advance(2000)
  b.tick()
  check(
    'a seconds-based SDK is seeked in seconds',
    b.sdkCalls[0]?.value === 500,
    JSON.stringify(b.sdkCalls),
  )
}

{
  /* The clock describes something else entirely — a different stream, an
     advert, a counter that is not a playhead. The safe answer is to do
     nothing, and that is the single most important assertion in this file. */
  const b = boot({ videos: [{ currentTime: 100 }], sdk: { clock: 4321 } })
  b.seek(500)
  b.elements[0].currentTime = 100
  b.advance(2000)
  b.tick()
  check(
    'an SDK whose clock makes no sense is NOT seeked',
    b.sdkCalls.length === 0,
    JSON.stringify(b.sdkCalls),
  )
}

{
  /* Right at the start, 0.4 and 400 are both "close to zero" and the two
     readings cannot be told apart. Refusing beats a coin flip. */
  const b = boot({ videos: [{ currentTime: 0.4 }], sdk: { clock: 400 } })
  b.seek(500)
  b.elements[0].currentTime = 0.4
  b.advance(2000)
  b.tick()
  check(
    'units too near zero to distinguish are declined',
    b.sdkCalls.length === 0,
    JSON.stringify(b.sdkCalls),
  )
}

// ── the person moving the film mid-seek is not a reverted seek ──────────────
{
  const b = boot({ videos: [{ currentTime: 100 }], sdk: { clock: 100_000 } })
  b.seek(500)
  /* Neither the target nor where it started — somebody dragged the bar. */
  b.elements[0].currentTime = 2000
  b.advance(2000)
  b.tick()
  check(
    'a scrub during a seek does not condemn the element',
    b.sdkCalls.length === 0,
    JSON.stringify(b.sdkCalls),
  )
  b.seek(2500)
  check('  and the element is still used after', b.elements[0].currentTime === 2500, String(b.elements[0].currentTime))
}

// ── what counts as a title ──────────────────────────────────────────────────
{
  const b = boot({ videos: [{ duration: 45, currentTime: 12 }] })
  b.tick()
  check('a 45-second advert is not ready', b.last().ready === false, JSON.stringify(b.last()))
  check('  and carries no title', b.last().titleKey === null, JSON.stringify(b.last()))
}

{
  const b = boot({ videos: [{ duration: 7200, currentTime: 12 }] })
  b.tick()
  check('a two-hour feature is ready', b.last().ready === true, JSON.stringify(b.last()))
  check(
    '  and is keyed by its detail id',
    b.last().titleKey === 'B0ABC123',
    JSON.stringify(b.last()),
  )
}

{
  /* A browse rail: a background loop, a trailer, and the feature. */
  const b = boot({
    videos: [{ duration: 8, currentTime: 3 }, { duration: 95 }, { duration: 5400, currentTime: 640 }],
  })
  b.tick()
  check('the longest video is the feature', b.last().position === 640, JSON.stringify(b.last()))
  check('  and it reports ready', b.last().ready === true, JSON.stringify(b.last()))
}

{
  /* Nothing has loaded a duration yet. Must not throw, must not be ready. */
  const b = boot({ videos: [{ duration: NaN, currentTime: 0 }] })
  b.tick()
  check('a page with no loaded video is not ready', b.last().ready === false, JSON.stringify(b.last()))
}

{
  const b = boot({ videos: [] })
  b.tick()
  check(
    'a page with no video at all still reports cleanly',
    b.last().ready === false && b.last().paused === true,
    JSON.stringify(b.last()),
  )
}

// ── buffering is distinguished from paused ──────────────────────────────────
{
  const b = boot({ videos: [{ readyState: 1, paused: false, currentTime: 300 }] })
  b.tick()
  check('a stalled player reports buffering', b.last().buffering === true, JSON.stringify(b.last()))

  const p = boot({ videos: [{ readyState: 4, paused: true, currentTime: 300 }] })
  p.tick()
  check('a paused player does not', p.last().buffering === false, JSON.stringify(p.last()))
}

let bad = 0
for (const r of R) {
  console.log((r.pass ? '  PASS  ' : '  FAIL  ') + r.name + (r.pass ? '' : '   ' + r.detail))
  if (!r.pass) bad += 1
}
console.log(bad === 0 ? `\nall ${R.length} passed` : `\n${bad} FAILED`)
process.exit(bad ? 1 : 0)
