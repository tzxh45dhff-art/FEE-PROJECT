/**
 * Proxy service-worker for cross-origin media.
 *
 * The only job here is to slip the `ngrok-skip-browser-warning` header onto
 * requests that a plain `<video>` element can't add itself. Without it,
 * ngrok's free-tier interstitial replaces the video bytes with an HTML page
 * and the element errors out.
 *
 * `self.skipWaiting()` + `clients.claim()` make the worker take over the page
 * it was registered from without waiting for a reload.
 */

/* Activate immediately — the video may already be trying to load. */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  /* Same-origin requests don't need the header — leave them alone. */
  if (url.origin === self.location.origin) return

  /* Only touch requests heading for an ngrok tunnel. The header is harmless
     elsewhere, but there is no reason to modify traffic that will never see
     the interstitial. */
  if (
    !url.hostname.endsWith('.ngrok-free.app') &&
    !url.hostname.endsWith('.ngrok-free.dev') &&
    !url.hostname.endsWith('.ngrok.app') &&
    !url.hostname.endsWith('.ngrok.io')
  ) {
    return
  }

  const headers = new Headers(event.request.headers)
  headers.set('ngrok-skip-browser-warning', 'true')

  /*
   * The `<video>` element sends its requests with `mode: "no-cors"`. In that
   * mode, the browser silently strips any non-simple header — including ours.
   * Re-issuing as `mode: "cors"` lets the custom header through. The Express
   * CORS middleware on the backend already allows the Vercel origin, so the
   * response carries the right `Access-Control-Allow-Origin` and the browser
   * accepts it.
   */
  event.respondWith(
    fetch(event.request.url, {
      method: event.request.method,
      headers,
      mode: 'cors',
      credentials: 'omit',
    }),
  )
})
