# Huddle — Netflix

Holds a Netflix tab to the same moment as everyone else in a Huddle room.

Netflix cannot be embedded (`X-Frame-Options: DENY`) and exposes no public
playback API, which is why the app itself can only offer a synced countdown for
it. An extension can do better, because a content script runs *inside*
netflix.com with permission to read its page.

The thing that makes this legal and possible: **the decoded picture is walled
off behind DRM, but the playback clock is not.** `currentTime`, `paused` and
`duration` are ordinary properties. This reads a clock and nudges play, pause
and seek — the same three things your own keyboard does. It never touches the
stream, your login, or the content.

## What talks to what

| Piece | World | Job |
|---|---|---|
| `src/worker.js` | extension | The socket, the clock offset, and asking the API to start the room on a title |
| `src/netflix.js` | isolated | Drift correction, and who moved the film |
| `src/overlay.js` | isolated | The on-page panel — no second tab needed |
| `src/bridge.js` | **main** | Netflix's own player API |
| `src/handoff.js` | app origin | Gets a session token onto the popup, asking the server for one if nothing is already sitting there to read |
| `src/popup.js` | popup | Server, room code, token |

The socket lives in the worker on purpose. Opened from the content script it
would carry `Origin: https://www.netflix.com`, so making it work would mean
putting netflix.com on the API's CORS allowlist — a wide door for one tab's
convenience. From the worker the origin is this extension's own id.

`bridge.js` is the only file that touches Netflix's internals, so when they
change there is exactly one place to fix. It falls back to the raw `<video>`
element if the internal API is not where it used to be.

## Setup

1. **Load it.** `chrome://extensions` → Developer mode → *Load unpacked* →
   pick this `extension/` folder.
2. **Copy the extension's origin.** Open the popup; it is printed at the
   bottom (`chrome-extension://<id>`).
3. **Allowlist it on the API.** Add that origin to `CLIENT_ORIGIN` in the
   server's `.env`, comma-separated, then restart the server:

   ```
   CLIENT_ORIGIN=http://localhost:5173,https://your-app.vercel.app,chrome-extension://<id>
   ```

4. **Sign in to Huddle** in a normal tab. The popup asks that tab for a
   session token and offers it — you can see it and clear it before use.
5. **Fill the popup**: the API's URL, and the room code shown in the room
   (e.g. `live-spsu`). Press Connect. Chrome will ask permission for that one
   server origin.
6. **Open the title on Netflix.** Everyone in the room does this themselves,
   on their own account. A small panel appears over the page — press
   **Start the room on this** and everyone's Watch tab picks it up, no need
   to visit the app at all. Once anyone has started it, later tabs just show
   **Following: \<title\>**, with a manual **Resync now** if a tab wants to
   check in sooner than the loop's own second-by-second pass.

## What it does and does not do

- Everyone keeps their own Netflix subscription and login. Nothing is shared
  or proxied — this only agrees on a timestamp.
- Play, pause and seek propagate both ways: the room drives the tab, and
  anything you do in the tab drives the room.
- Corrections are **seek-only**, with a 2s threshold. Netflix has no fine
  playback-rate control to absorb small drift into the way an `<video>` or an
  uploaded file does, and every seek costs a rebuffer — so the bar for moving
  anybody is deliberately higher than the app's own player uses.
- It will break when Netflix reorganises their player internals. That is the
  standing cost of this approach, not a bug that gets fixed once.
- The content scripts match all of netflix.com, not only `/watch/*`. Netflix
  is a single-page app — clicking Play routes there with `history.pushState`,
  not a real navigation, and Chrome only injects a manifest-declared script on
  an actual page load. Matching everything and watching the path from inside
  the one script that's already running is what lets the panel actually show
  up on the title you open, rather than staying behind on Browse forever.

## Tests

```
node extension/test/intent.test.mjs
```

Covers the part that cannot be checked by reading it: whether a change in the
player was the person's doing or our own. Two of these failed when first
written — see the note at the top of the file.
