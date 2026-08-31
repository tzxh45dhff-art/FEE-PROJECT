/**
 * Handing the session over from the app to the extension.
 *
 * The alternative is asking somebody to open devtools and copy a token out of
 * localStorage by hand, which is the kind of setup step that quietly decides a
 * feature is not worth using.
 *
 * `localStorage.syncroom.token` only exists there in the first place when the
 * app is talking to a different origin than the one it's running on — a
 * same-origin session relies on an httpOnly cookie instead, which is the
 * safer mechanism and exactly why the app doesn't duplicate it into somewhere
 * script can read. That is also, unhelpfully, everywhere this handoff has
 * nothing to find.
 *
 * The fallback below asks the server for one instead. `fetch` from a content
 * script carries the page's own cookies, so on a page where the person is
 * genuinely signed in, this mints exactly the token that page's session
 * already implies — nothing new is granted, and nothing is granted to a page
 * that isn't authenticated. It happens only when the passive read comes up
 * empty, so a cross-origin session never triggers a request it doesn't need.
 */

const KEY = 'syncroom.token'

async function passive() {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    /* Private browsing, or storage refused. */
    return null
  }
}

async function minted() {
  try {
    const response = await fetch('/api/auth/extension-token', { credentials: 'include' })
    if (!response.ok) return null
    const body = await response.json()
    return typeof body?.token === 'string' ? body.token : null
  } catch {
    /* Not signed in here, or the request could not go out. The manual field
       in the popup still works either way. */
    return null
  }
}

void (async () => {
  const token = (await passive()) || (await minted())
  if (token) void chrome.storage.local.set({ suggestedToken: token })
})()
