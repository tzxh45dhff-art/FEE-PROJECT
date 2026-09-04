/**
 * Netflix, as a member of the room.
 *
 * Everything that used to be here is in `sync.js` now, shared with Prime
 * Video. What is left is the part that is genuinely Netflix: nothing, as it
 * turns out — the site's differences all live in its MAIN-world bridge, which
 * is where they belong. This file exists to name the site and start the loop.
 */

;(() => {
  window.__huddleStartSync({ name: 'Netflix' })
})()
