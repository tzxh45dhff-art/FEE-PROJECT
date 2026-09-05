/**
 * What the on-page panel claims about the connection.
 *
 * Written after it lied. The panel decided it was connected by asking whether
 * it held a room snapshot, which conflates two unrelated facts: whether the
 * extension is working, and whether anything is playing. Open Prime with
 * nothing on and it announced "Not connected — set up the extension from its
 * toolbar icon" on a tab whose socket was fine, and — because the same flag
 * gates the button — disabled the one control that would have put something
 * on. The tab could not talk its way out of it.
 *
 * So these hold the three states apart: not heard from yet, heard and
 * connected, heard and genuinely not set up. A panel that cannot tell an empty
 * room from a broken extension will send somebody to fix the wrong thing.
 *
 *   node extension/test/overlay.test.mjs
 */

import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const src = readFileSync(new URL('../src/overlay.js', import.meta.url), 'utf8')

const IDS = [
  'pill', 'panel', 'dot', 'pillText', 'status', 'idleRow', 'followingRow',
  'onTitle', 'offTitleHint', 'detectedTitle', 'followingTitle', 'announce',
  'resync', 'err', 'statsToggle', 'stats',
]

function mount(options = {}) {
  const els = Object.fromEntries(
    IDS.map((id) => [id, {
      id, textContent: '', innerHTML: '', className: '', disabled: false,
      style: {}, classList: { toggle() {} },
      addEventListener(type, fn) { this._click = fn },
    }]),
  )

  let onRoom = null
  let repaint = null
  const shadow = { innerHTML: '', getElementById: (id) => els[id] ?? null }

  const sandbox = {
    Math, console, JSON,
    /* The panel repaints on a timer rather than on each message, so the
       harness has to drive that tick or nothing it is told ever shows. */
    setInterval: (fn) => {
      repaint = fn
      return 0
    },
    document: {
      readyState: 'complete',
      title: 'Some Film - Prime Video',
      createElement: () => ({ style: {}, attachShadow: () => shadow }),
      documentElement: { appendChild() {} },
      addEventListener() {},
      activeElement: null,
    },
    location: { href: 'https://www.primevideo.com/detail/B0X/ref=dv', pathname: '/detail/B0X/ref=dv' },
    chrome: {
      runtime: {
        sendMessage: async () => ({ ok: true }),
        onMessage: { addListener: (fn) => (onRoom = fn) },
      },
    },
  }
  sandbox.window = {
    addEventListener() {},
    __huddleResync() {},
    __huddleStats: options.stats ? () => options.stats : undefined,
  }
  sandbox.window.window = sandbox.window

  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)

  return {
    els,
    tell: (m) => {
      onRoom?.(m)
      repaint?.()
    },
    /* The person clicking "Show sync detail". */
    openStats: () => {
      els.statsToggle._click?.()
    },
  }
}

const R = []
const check = (n, p, d = '') => R.push({ n, p, d })

{
  const o = mount()
  check(
    'before the worker answers, it does not accuse anyone',
    o.els.status.textContent === 'Checking…',
    o.els.status.textContent,
  )
}

{
  /* The exact failure: connected, room empty, nothing playing. */
  const o = mount()
  o.tell({ kind: 'room', snapshot: null, offset: 12, status: 'connected' })
  check(
    'connected with an empty room reads as connected',
    /Connected/.test(o.els.status.textContent),
    o.els.status.textContent,
  )
  check('  and the pill agrees', o.els.pillText.textContent === 'Huddle · in sync', o.els.pillText.textContent)
}

{
  const o = mount()
  o.tell({ kind: 'room', snapshot: null, offset: 0, status: 'not configured' })
  check(
    'genuinely unconfigured says so, and says what to do',
    /Not set up yet\. Open your Huddle room/.test(o.els.status.textContent),
    o.els.status.textContent,
  )
}

{
  const o = mount()
  o.tell({ kind: 'room', snapshot: null, offset: 0, status: 'refused: xhr poll error' })
  check(
    "a refused socket blames the server, not the person's setup",
    /not answering/.test(o.els.status.textContent),
    o.els.status.textContent,
  )
}

{
  /* And with something actually on, the following row takes over. */
  const o = mount()
  o.tell({
    kind: 'room',
    snapshot: { item: { id: 'i', title: 'The Bear' }, playing: true },
    offset: 8,
    status: 'connected',
  })
  check('a room with an item shows what is on', o.els.followingTitle.textContent === 'The Bear', o.els.followingTitle.textContent)
  check('  and hides the start row', o.els.idleRow.style.display === 'none', o.els.idleRow.style.display)
}

// ── the numbers behind the panel ────────────────────────────────────────────
{
  /*
   * The two readings this exists to tell apart. They feel identical from the
   * sofa — "it is out of sync" — and they need opposite fixes, so the panel
   * must not blur them.
   */
  const delivering = mount({
    stats: {
      gap: 2.4, rate: 1, rateHonoured: true, offsetMs: 40,
      roomAgeMs: 300, playerAgeMs: 120, ready: true, buffering: false,
      paused: false, playing: true, seeks: 3, nudgeWrites: 0, settlingMs: 0,
    },
  })
  delivering.tell({ kind: 'room', snapshot: { item: { id: 'i', title: 'T' }, playing: true }, offset: 40, status: 'connected' })
  delivering.openStats()
  check('a big gap with a fresh update is shown as such', /\+2\.40s/.test(delivering.els.stats.innerHTML), delivering.els.stats.innerHTML)
  check('  and the room age is not flagged', !/warn">300ms/.test(delivering.els.stats.innerHTML), delivering.els.stats.innerHTML)

  const stalled = mount({
    stats: {
      gap: 0.1, rate: 1, rateHonoured: true, offsetMs: 40,
      roomAgeMs: 9000, playerAgeMs: 120, ready: true, buffering: false,
      paused: false, playing: true, seeks: 0, nudgeWrites: 0, settlingMs: 0,
    },
  })
  stalled.tell({ kind: 'room', snapshot: { item: { id: 'i', title: 'T' }, playing: true }, offset: 40, status: 'connected' })
  stalled.openStats()
  check('a stale room update is flagged even with a small gap', /warn/.test(stalled.els.stats.innerHTML), stalled.els.stats.innerHTML)

  const refused = mount({
    stats: {
      gap: 0.5, rate: 1, rateHonoured: false, offsetMs: 40,
      roomAgeMs: 200, playerAgeMs: 120, ready: true, buffering: false,
      paused: false, playing: true, seeks: 1, nudgeWrites: 3, settlingMs: 0,
    },
  })
  refused.tell({ kind: 'room', snapshot: { item: { id: 'i', title: 'T' }, playing: true }, offset: 40, status: 'connected' })
  refused.openStats()
  check('a player refusing the rate says so', /refused/.test(refused.els.stats.innerHTML), refused.els.stats.innerHTML)
}

let bad = 0
for (const r of R) { console.log((r.p ? '  PASS  ' : '  FAIL  ') + r.n + (r.p ? '' : '   ' + r.d)); if (!r.p) bad++ }
console.log(bad === 0 ? `\nall ${R.length} passed` : `\n${bad} FAILED`)
process.exit(bad ? 1 : 0)
