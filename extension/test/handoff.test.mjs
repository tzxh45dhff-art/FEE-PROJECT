/**
 * How the extension proves the page's session.
 *
 * This is the bug that made a second device look broken while the first one
 * was fine. The handoff authenticated the token request with nothing but
 * `credentials: 'include'`, which works exactly where the API is same-origin —
 * a laptop running the app on localhost behind Vite's proxy — and fails
 * everywhere it is actually deployed, because the app is then on one origin
 * and the API on another and that cookie is third-party. Chrome blocks it,
 * Safari discards it. The server answered 401, correctly; `mintToken` returned
 * null, quietly; and the extension sat at `idle` with the popup, the overlay
 * and the app all saying different things and none of them saying that.
 *
 * The app already carries a bearer token cross-origin for this exact reason.
 * These hold the handoff to doing the same.
 *
 *   node extension/test/handoff.test.mjs
 */

import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const src = readFileSync(new URL('../src/handoff.js', import.meta.url), 'utf8')

function boot({ storage = {}, storageThrows = false, api = 'https://api.example', mint = { token: 'ext-token' }, status = 200 } = {}) {
  const calls = []
  const configured = []

  const node = {
    dataset: { api, roomId: 'room-1', roomName: 'A Room' },
    attributes: {},
    getAttribute: (k) => node.attributes[k] ?? null,
    setAttribute: (k, v) => (node.attributes[k] = v),
  }

  const sandbox = {
    console, JSON,
    document: {
      getElementById: (id) => (id === 'huddle-extension-bridge' ? node : null),
      documentElement: {},
    },
    location: { origin: 'https://huddle-sync.vercel.app' },
    MutationObserver: class {
      observe() {}
    },
    fetch: async (url, init) => {
      calls.push({ url, init })
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => mint,
      }
    },
    chrome: {
      runtime: {
        getManifest: () => ({ version: '9.9.9' }),
        sendMessage: async (m) => {
          configured.push(m)
          return { ok: true }
        },
      },
    },
  }
  sandbox.window = {
    localStorage: {
      getItem: (k) => {
        if (storageThrows) throw new Error('storage denied')
        return storage[k] ?? null
      },
    },
  }
  sandbox.window.window = sandbox.window

  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)

  return new Promise((r) =>
    setImmediate(() => setImmediate(() => setImmediate(() => r({ calls, configured, node })))),
  )
}

const R = []
const check = (n, p, d = '') => R.push({ n, p, d })

{
  /* The deployed case: app on Vercel, API elsewhere, token in localStorage. */
  const o = await boot({ storage: { 'syncroom.token': 'app-session-token' } })
  const headers = o.calls[0]?.init?.headers ?? {}
  check('the mint carries the app’s bearer token', headers.Authorization === 'Bearer app-session-token', JSON.stringify(headers))
  check('  and still sends the cookie for same-origin', o.calls[0]?.init?.credentials === 'include', JSON.stringify(o.calls[0]?.init))
  check('  and skips ngrok’s interstitial', headers['ngrok-skip-browser-warning'] === 'true', JSON.stringify(headers))
  check('  then configures the worker', o.configured.some((m) => m.kind === 'configure' && m.token === 'ext-token'), JSON.stringify(o.configured))
}

{
  /* No token stored — the same-origin dev case. Must still try by cookie. */
  const o = await boot({ storage: {} })
  const headers = o.calls[0]?.init?.headers ?? {}
  check('with no stored token it sends no Authorization', headers.Authorization === undefined, JSON.stringify(headers))
  check('  but still asks, by cookie', o.calls[0]?.init?.credentials === 'include')
}

{
  /* Private window, or storage denied by policy. Must not throw. */
  const o = await boot({ storageThrows: true })
  check('denied storage does not break the handoff', o.calls.length === 1, JSON.stringify(o.calls.length))
}

{
  /* The failure as it actually presented: 401, and nothing configured. */
  const o = await boot({ status: 401, mint: { error: 'Not signed in' } })
  check('a 401 configures nothing rather than half-configuring', o.configured.length === 0, JSON.stringify(o.configured))
  check('  but still reports the extension as installed', o.node.getAttribute('data-extension') === '9.9.9', String(o.node.getAttribute('data-extension')))
}

let bad = 0
for (const r of R) { console.log((r.p ? '  PASS  ' : '  FAIL  ') + r.n + (r.p ? '' : '   ' + r.d)); if (!r.p) bad++ }
console.log(bad === 0 ? `\nall ${R.length} passed` : `\n${bad} FAILED`)
process.exit(bad ? 1 : 0)
