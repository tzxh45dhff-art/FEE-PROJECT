# Huddle — Watch Together

Holds a **Netflix** or **Prime Video** tab to the same moment as everyone else
in a Huddle room.

Neither site can be embedded (`X-Frame-Options: DENY`) and neither exposes a
public playback API, which is why the app itself can only offer a synced
countdown for them. An extension can do better, because a content script runs
*inside* the page with permission to read it.

The thing that makes this legal and possible: **the decoded picture is walled
off behind DRM, but the playback clock is not.** `currentTime`, `paused` and
`duration` are ordinary properties of an ordinary element, whatever is
decoding into it. This reads a clock and nudges play, pause and seek — the
same three things your own keyboard does. It never touches the stream, your
login, or the content.

## Everyone brings their own subscription

Worth stating plainly, because it is the first thing people ask.

This synchronises a **timestamp**, not a video. Each person opens the title on
their own Netflix or Prime account, in their own browser, and their own tab is
held in step with the room. Nothing is relayed, mirrored, proxied or
re-streamed, and one person's subscription cannot cover anybody else's playback
— what crosses the wire is a number of seconds and a play/pause flag.

That is not a limitation that was settled for; it is what makes the whole
approach work. Relaying a DRM-protected stream to people without a licence for
it is both technically walled off (that is what DRM is) and a straightforward
redistribution problem. Holding two licensed players to the same clock is
neither, which is why this is a few hundred lines of plain JavaScript rather
than an impossibility.

## Setup

There are two steps, and neither involves typing a token.

1. **Load the extension.** `chrome://extensions` → Developer mode → *Load
   unpacked* → pick this `extension/` folder. (To put it on someone else's
   machine, see **Other devices** below.)
2. **Allowlist it on the API.** Open the popup and copy the
   `chrome-extension://…` origin printed at the bottom, add it to
   `CLIENT_ORIGIN` in the server's `.env`, and restart the server:

   ```
   CLIENT_ORIGIN=https://your-app.vercel.app,chrome-extension://<id>
   ```

   The id is assigned by Chrome and differs per machine, so each person's has
   to be added. Without it the server correctly refuses the connection.

That's it. Open your Huddle room in a tab and the extension configures itself
from the page — the API, the room, and a session token it requests for itself.
Then start a title on Netflix or Prime Video: a panel appears over the player
with **Start the room on this**. Everyone else opens the same title on their
own account and their tab falls in step on its own.

## What talks to what

| Piece | World | Job |
|---|---|---|
| `src/worker.js` | extension | The socket, the clock offset, and telling the API what the room is watching |
| `src/sync.js` | isolated | Drift correction, and deciding who moved the film — **shared by both sites** |
| `src/netflix.js` | isolated | Netflix's adapter: a name and its tuning |
| `src/prime.js` | isolated | Prime's adapter: the same, tuned tighter |
| `src/overlay.js` | isolated | The on-page panel |
| `src/bridge.js` | **main** | Netflix's own player API |
| `src/bridge-prime.js` | **main** | Prime's player, or its `<video>` element |
| `src/handoff.js` | app origin | Reads the page's config and configures the extension |
| `src/popup.js` | popup | Status, and a manual fallback |

### Why a shared engine and per-site bridges

The hard part of this is not talking to a player, it is deciding whether the
film moved because a person moved it or because *we* did. Get that wrong and
every correction is reported back as a fresh intent, which is a feedback loop
that walks the entire room backwards. It has tests, and it was wrong twice
before it was right.

So that judgement lives once, in `sync.js`, and a second site is an adapter
rather than a second copy of the part that is difficult. What genuinely
differs between the two sites — which object to drive, how to read a clock out
of it, what counts as a real title rather than an advert — is all that lives in
a bridge.

Three details that are load-bearing rather than incidental:

**The socket lives in the worker.** Opened from a content script it would carry
`Origin: https://www.netflix.com`, so making it work would mean allowlisting
netflix.com — and now primevideo.com and five Amazon domains — on the API. A
wide door for one tab's convenience. From the worker the origin is the
extension's own id, which no page can forge.

**Each bridge is the only file that touches its site's internals.** On Netflix,
setting `video.currentTime` alone does not hold: their player owns a state
machine and winds an unauthorised position back a moment later, so that bridge
drives their own player API. Prime is the other way round — its SDK globals are
empty until playback starts and their method names are not worth betting a
feature on, so that bridge tries the SDK and expects the plain `<video>`
element to carry it. Both fall back to the element, which is safe for the same
reason the whole approach is: DRM encrypts the picture, never the clock.

**The content scripts match all of each site, not just its player path.** Both
are single-page apps — pressing Play routes with `history.pushState`, not a
real navigation, and Chrome only injects a manifest-declared script on an
actual page load. Matching broadly and detecting the title from inside the
already-running script is what makes the panel appear on what you opened.

### What Prime needed that Netflix did not

**Adverts play through the same element as the film**, and during one
`currentTime` counts the advert. Holding the room to that would drag everybody
to a position that means nothing and then drag them back when it ended. The
bridge withholds `ready` for anything under two minutes, so an advert or an
autoplaying browse-rail trailer reads as "nothing to sync" rather than as a
title that jumped. Genuinely short content therefore never syncs — the safe
failure, rather than syncing to the wrong thing.

**Playback happens over the detail page**, not a distinct `/watch/` path. The
overlay used to decide whether a title was on screen by testing the path, which
is true of Netflix and true of nothing else; it now asks the bridge, which
answers properly for its own site.

**A Prime page can hold several `<video>` elements** — a background loop, a
trailer, the feature. The longest one that has loaded is the feature.

## Other devices

```bash
node extension/scripts/package.mjs
```

Writes `extension/dist/huddle-watch-<version>.zip`. Send it over, unzip, and
*Load unpacked* on that machine. Each person then adds their own
`chrome-extension://` origin to `CLIENT_ORIGIN` (see Setup step 2), since
Chrome assigns a different id per install.

## Deployment

Two people on two devices need one server both can reach, which a laptop on a
desk cannot offer. `server/Dockerfile` builds the API for anywhere that runs a
container. The two things that matter:

- **Mount a volume at `/data`.** SQLite and uploaded video both live on disk;
  without one, every redeploy is a factory reset. `DATABASE_URL` and
  `UPLOAD_DIR` already point there.
- **Set `CLIENT_ORIGIN`** to your deployed frontend *and* each extension id,
  and set `CROSS_SITE=true` when the frontend is on another origin.

The extension needs no rebuild for a deployment — it reads whatever API the
Huddle page tells it, so pointing the frontend at the deployed server is
enough.

## What it does and does not do

- Play, pause and seek propagate both ways: the room drives the tab, and
  anything you do in the tab drives the room.
- Corrections are **seek-only** — 2s on Netflix, 1.6s on Prime. Neither site
  offers a fine playback-rate control to absorb small drift into the way an
  uploaded file does, and every seek costs a rebuffer, so the bar for moving
  anybody is deliberately higher than the app's own player uses. Prime's is
  tighter because its element responds directly rather than through a state
  machine that has to agree first.
- `host_permissions` is `*://*/*`. The server URL is whatever a deployment says
  it is, so it cannot be listed ahead of time, and a content script has no way
  to raise a permission prompt — the alternative was an auto-configure that
  breaks on every host nobody predicted. Content scripts still only run on the
  two streaming sites and the Huddle app.
- It will break when either site reorganises their player internals. That is
  the standing cost of this approach, not a bug that gets fixed once. The
  element fallbacks are what keep a reorganisation from being fatal.

## Tests

```bash
node extension/test/intent.test.mjs        # no server needed
node extension/test/prime-bridge.test.mjs  # no server needed
node extension/test/twoclient.test.mjs     # needs the API running
```

`intent` covers the part that cannot be checked by reading it: whether a change
in the player was the person's doing or one of our own corrections. It runs
against `sync.js`, so both sites are covered by the same 19 checks, including
the site-specific hazards — an advert, a title switch, and each site's own
threshold. Three of these failed when first written; see the notes in the file
and in `sync.js` for what each one caught.

`prime-bridge` covers the other thing that cannot be checked by reading it, and
the only one here where being wrong is worse than not working: whether Amazon's
player counts in seconds or milliseconds. The bridge does not guess — it
compares the SDK's clock against the element's, which is unambiguously seconds,
and declines to seek at all if neither reading describes the same playhead.
Twenty-two checks hold it to that, including the refusals.

`twoclient` is the real scenario: two people, one room. It drives two sockets
against a running server and checks that what one announces and does reaches
the other, and that the shared clock advances in real time. Point it at a
deployment with `HUDDLE_API=https://… node extension/test/twoclient.test.mjs`.
