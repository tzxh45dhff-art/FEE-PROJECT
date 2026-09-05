/**
 * Configuring the extension from the page that already knows everything.
 *
 * The popup can still be filled in by hand, and for a while that was the only
 * way: paste an API URL, a room code and a session token into three boxes.
 * Every one of those is something the Huddle tab is already holding — it is
 * signed in, it is standing in a room, and it knows its own API — so asking a
 * person to copy them across was a setup step that existed only because
 * nothing had been written to carry them.
 *
 * This carries them. The app renders an element with the API and the room on
 * it (see `ExtensionBridge.tsx` for why the DOM is the only surface the two
 * sides share), this reads it, asks the server for a token of its own, and
 * hands the lot to the worker. Opening the app is the entire setup.
 *
 * The token is fetched rather than read off the page on purpose. The request
 * proves the page's own session — by cookie same-origin, by the bearer token
 * the app already carries when it is not — so the server will only ever mint
 * one for a session the page had already proven. Nothing is granted here that
 * the person was not already holding, and nothing sensitive has to sit in the
 * DOM to be passed along.
 */

const BRIDGE_ID = 'huddle-extension-bridge'

/** What this writes back, so the app can say whether it is installed. */
const INSTALLED_ATTR = 'data-extension'

const VERSION = chrome.runtime.getManifest().version

/** The last thing successfully configured, so a re-read is not a re-connect. */
let applied = ''

/** Where the app keeps its own session token. Same origin, so this can read it. */
const APP_TOKEN_KEY = 'syncroom.token'

/**
 * Prove the page's session, the same way the page itself does.
 *
 * This asked with `credentials: 'include'` and nothing else, which works
 * exactly where the API is same-origin — development, behind Vite's proxy —
 * and fails everywhere that matters. Deployed, the app is on one origin and
 * the API on another, so that cookie is third-party: Chrome blocks it by
 * default and Safari discards it outright. The request arrived unauthenticated,
 * the server correctly answered 401, and the extension sat at `idle` forever
 * with nothing anywhere saying why.
 *
 * It looked like it worked because the machine it was written on runs the app
 * on localhost, where the cookie is first-party. The second device is where
 * that assumption showed.
 *
 * The app hit this before and solved it — see `getToken` in `src/lib/config.ts`
 * — by carrying a bearer token cross-origin. This does the same thing, reading
 * the same key from the same origin's storage.
 *
 * The app's token is used only to *prove* the session here, never handed on.
 * What comes back is minted fresh for the extension to hold — but be accurate
 * about what that buys: `extension-token` issues an ordinary session token,
 * not a scoped one, so it carries the same authority the page already has. The
 * gain is that the worker holds its own copy with its own lifetime rather than
 * borrowing the page's, not that it is any less privileged. Narrowing it to
 * just the watch stage would be a real improvement and is not what this is.
 */
function appToken() {
  try {
    return window.localStorage.getItem(APP_TOKEN_KEY)
  } catch {
    /* Storage can be denied outright, in a private window or by policy. The
       cookie below is then the only route, and same-origin it is enough. */
    return null
  }
}

async function mintToken(api) {
  const token = appToken()
  const response = await fetch(`${api}/api/auth/extension-token`, {
    /* Kept for the same-origin case, where an httpOnly cookie is strictly
       better than a token script can read. */
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      /* Without this a free ngrok tunnel can answer with its interstitial page
         instead of the API, which parses as neither JSON nor an error. */
      'ngrok-skip-browser-warning': 'true',
    },
  }).catch(() => null)

  if (!response || !response.ok) return null
  const body = await response.json().catch(() => null)
  return typeof body?.token === 'string' ? body.token : null
}

async function sync() {
  const node = document.getElementById(BRIDGE_ID)
  if (!node) return

  /* Say we are here first, and unconditionally. The app shows the person
     whether the extension is installed, and that answer must not depend on
     whether a room happens to be open or the token round trip succeeded. */
  if (node.getAttribute(INSTALLED_ATTR) !== VERSION) {
    node.setAttribute(INSTALLED_ATTR, VERSION)
  }

  const api = (node.dataset.api || location.origin).replace(/\/$/, '')
  const roomId = node.dataset.roomId || ''
  const roomName = node.dataset.roomName || ''
  if (!roomId) return

  /* Nothing has changed since the last successful configure. Re-sending it
     would tear down a working socket to build the identical one. */
  const key = `${api}|${roomId}`
  if (key === applied) return

  const token = await mintToken(api)
  if (!token) return

  const result = await chrome.runtime
    .sendMessage({ kind: 'configure', server: api, roomId, roomName, token })
    .catch(() => null)

  if (result?.ok) applied = key
}

/*
 * Watched rather than read once.
 *
 * Three things can happen in any order: this script runs, the app renders the
 * element, and the person walks into a different room. An observer covers all
 * three the same way, where a single read on load would only ever catch the
 * first one — and only if it won the race.
 */
const observer = new MutationObserver(() => void sync())
observer.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['data-room-id', 'data-api'],
})

void sync()
