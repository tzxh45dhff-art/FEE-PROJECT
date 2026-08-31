/**
 * Handing the session over from the app to the extension.
 *
 * The alternative is asking somebody to open devtools and copy a token out of
 * localStorage by hand, which is the kind of setup step that quietly decides a
 * feature is not worth using.
 *
 * This only reads, only on the app's own origin, and only the token the app
 * already put there for its own cross-origin calls. Nothing is sent anywhere —
 * it goes into the extension's storage, where the popup offers it as a
 * suggestion the person still has to accept.
 */

try {
  const token = window.localStorage.getItem('syncroom.token')
  if (token) {
    void chrome.storage.local.set({ suggestedToken: token })
  }
} catch {
  /* Private browsing, or storage refused. The manual field still works. */
}
