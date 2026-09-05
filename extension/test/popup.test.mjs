/**
 * What the popup says when things are wrong.
 *
 * This is here because of a real hour lost. The popup printed the worker's raw
 * status and, permanently underneath it, "add this origin to CLIENT_ORIGIN" —
 * advice that was correct when Chrome gave every install its own id, and
 * actively misleading once the id was pinned and pre-allowed. Someone read the
 * standing note as the thing to fix, and the actual cause — a server still
 * running the config it read at startup, hours before the file changed — went
 * unread underneath it.
 *
 * So the rule these hold to is: the origin note appears only when the server
 * genuinely refused this socket, and every other state explains itself. A
 * diagnostic that is always on screen is not a diagnostic.
 *
 *   node extension/test/popup.test.mjs
 */

import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const src = readFileSync(new URL('../src/popup.js', import.meta.url), 'utf8')

function render(state) {
  const els = {}
  const make = (id) => (els[id] ??= { id, textContent: '', innerHTML: '', hidden: false, style: {}, value: '', addEventListener() {} })
  for (const id of ['origin','status','why','auto','server','code','token','save']) make(id)

  const sandbox = {
    document: { getElementById: (id) => els[id] ?? null },
    location: { origin: 'chrome-extension://lnngdhodgenaecklihlgfncipilodmla' },
    Math, console, setInterval: () => 0, setTimeout: () => 0,
    chrome: {
      runtime: { sendMessage: async () => state },
      storage: { local: { get: async () => ({}) } },
    },
  }
  sandbox.window = sandbox
  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)
  return new Promise((r) => setImmediate(() => setImmediate(() => r(els))))
}

const R = []
const check = (n, p, d = '') => R.push({ n, p, d })

{
  const e = await render({ status: 'not configured', config: {}, offset: 0 })
  check('not-configured hides the origin box', e.origin.hidden === true)
  check('  and says to open the Huddle tab', /Open your Huddle room/.test(e.why.textContent), e.why.textContent)
}
{
  const e = await render({ status: 'connected', config: { server: 'https://x.dev', roomCode: 'live-a' }, offset: 37.4, snapshot: { item: { title: 'The Bear' } } })
  check('connected hides the origin box', e.origin.hidden === true)
  check('  and offers no explanation to fix', e.why.textContent === '', e.why.textContent)
  check('  and shows the clock offset', /37ms/.test(e.status.innerHTML), e.status.innerHTML)
  check('  and folds the setup note away', e.auto.style.display === 'none', e.auto.style.display)
}
{
  const e = await render({ status: 'refused: xhr poll error', config: { server: 'https://x.dev', roomCode: 'live-a' }, offset: 0 })
  check('refused SHOWS the origin box', e.origin.hidden === false)
  check('  names the server that refused', /https:\/\/x\.dev/.test(e.why.textContent), e.why.textContent)
  check('  leads with "is the API up"', /not running|tunnel address moved/.test(e.origin.innerHTML))
  check('  carries the actual origin', /lnngdhodgenaecklihlgfncipilodmla/.test(e.origin.innerHTML))
  check('  and warns about a stale running server', /needs a restart/.test(e.origin.innerHTML))
}
{
  const e = await render({ status: 'disconnected', config: { server: 'https://x.dev' }, offset: 0 })
  check('disconnected hides the origin box', e.origin.hidden === true)
  check('  and says it retries itself', /reconnects on its own/.test(e.why.textContent), e.why.textContent)
}

let bad = 0
for (const r of R) { console.log((r.p ? '  PASS  ' : '  FAIL  ') + r.n + (r.p ? '' : '   ' + r.d)); if (!r.p) bad++ }
console.log(bad === 0 ? `\nall ${R.length} passed` : `\n${bad} FAILED`)
process.exit(bad ? 1 : 0)
