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
  'resync', 'err',
]

function mount() {
  const els = Object.fromEntries(
    IDS.map((id) => [id, {
      id, textContent: '', className: '', disabled: false,
      style: {}, classList: { toggle() {} }, addEventListener() {},
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
  sandbox.window = { addEventListener() {}, __huddleResync() {} }
  sandbox.window.window = sandbox.window

  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)

  return {
    els,
    tell: (m) => {
      onRoom?.(m)
      repaint?.()
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

let bad = 0
for (const r of R) { console.log((r.p ? '  PASS  ' : '  FAIL  ') + r.n + (r.p ? '' : '   ' + r.d)); if (!r.p) bad++ }
console.log(bad === 0 ? `\nall ${R.length} passed` : `\n${bad} FAILED`)
process.exit(bad ? 1 : 0)
