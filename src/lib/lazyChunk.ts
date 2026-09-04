import { lazy, type ComponentType } from 'react'

/**
 * A lazily-loaded component that survives a deploy.
 *
 * Code splitting means the page you are looking at holds the *names* of files
 * it has not fetched yet — `McqPane-CmT4v_wE.js` and so on, hashed by content.
 * A deploy changes those hashes. So a tab that was open across one is holding
 * a list of filenames that no longer exist, and the moment somebody opens a
 * pane they had not opened yet, the fetch is for a file that is gone.
 *
 * On a static host that is worse than a 404, because the SPA rewrite catches
 * it: the request for a missing `.js` is answered with `index.html`, at status
 * 200. The browser then refuses to run a module served as `text/html` and the
 * import rejects with nothing more useful than "error loading dynamically
 * imported module". `Suspense` has nothing to show and no error to report, so
 * the pane simply never appears — which reads as "this page doesn't load",
 * with no clue that the cause was a deploy that happened while the tab sat
 * open, and a hard refresh silently fixing it.
 *
 * The recovery is a reload, because that is genuinely the whole fix: fetching
 * the document again gets the new `index.html`, which names the files that do
 * exist. Guarded through `sessionStorage` so a chunk that is broken for any
 * other reason cannot put the tab in a reload loop — one attempt, then the
 * error is allowed through to the boundary above.
 *
 * The other half of this lives in `vercel.json`, whose rewrite excludes
 * `/assets/` and `/api/` from the catch-all. It is written there without any
 * explanation, so here is the one it needs:
 *
 * - **`/assets/`** is the case above. Excluded, a stale chunk 404s honestly,
 *   and the code below can recognise that and reload. Caught by the rewrite it
 *   comes back as HTML at 200 and there is nothing to recognise.
 * - **`/api/`** is the same failure one layer up. The Express server does not
 *   run on Vercel at all, so `/api/*` has no legitimate answer from this host —
 *   it is only ever reached when a visitor's own `API_BASE` has resolved to
 *   same-origin (a private window, cleared storage, a device that never opened
 *   the one-time `?api=` link). Rewritten to the SPA it returned `index.html`
 *   at 200, and every generator on the page failed at once with nothing to
 *   point at why. Excluded, it 404s, and `src/lib/api.ts` turns a non-JSON
 *   response into a clear "the API was not reached" instead of a null.
 *
 * That explanation used to sit inside `vercel.json` under a `"//"` key, the
 * convention `package.json` tolerates. Vercel validates its schema strictly and
 * rejects unknown properties, so the file was refused and **five consecutive
 * production deploys failed** while the site went on serving old code. `npm run
 * build` cannot catch it — nothing local reads `vercel.json`. Hence this,
 * somewhere a comment is actually allowed to live.
 */

/** Marks that a reload has already been spent on this. Per tab, not per site. */
const ATTEMPTED = 'syncroom.chunkReload'

/* Mirrors React's own `lazy` signature, which is where the `any` comes from:
   the constraint has to admit a component of any props for callers to keep
   theirs. Narrowing it here would reject every component that takes props. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyChunk<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>,
) {
  return lazy(() =>
    load().catch((cause: unknown) => {
      let spent = true
      try {
        spent = window.sessionStorage.getItem(ATTEMPTED) !== null
        if (!spent) window.sessionStorage.setItem(ATTEMPTED, String(Date.now()))
      } catch {
        /* Storage refused. Treat it as spent rather than risk a loop with no
           way of remembering that we are in one. */
      }

      if (spent) throw cause

      window.location.reload()
      /* Never settles on purpose. The reload is already underway, and either
         resolving or rejecting here would render something for the fraction
         of a second before the document goes away. */
      return new Promise<{ default: T }>(() => {})
    }),
  )
}

/**
 * Forget the reload guard.
 *
 * Called once the app has successfully started, so the single attempt is
 * available again next time rather than being spent for the life of the tab.
 * Without this, one recovered deploy would leave a session unable to recover
 * from the next one.
 */
export function clearChunkReloadGuard() {
  try {
    window.sessionStorage.removeItem(ATTEMPTED)
  } catch {
    /* Nothing stored, nothing to forget. */
  }
}
