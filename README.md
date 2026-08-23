# Huddle

One room where you watch, listen, play and talk together — actually together,
holding the same frame at the same moment rather than counting down and hoping.

A full-stack app: a React front end, an Express + Socket.io back end, and a
shared clock in the middle that everything else is keyed to.

---

## What is in it

| | |
| --- | --- |
| **Watch** | One player shared by the room. Play, pause, scrub or change speed and everyone moves with you. YouTube, a direct link, or a film you have uploaded. |
| **Listen** | A shared queue with a record view, a live visualiser, and time-synced lyrics that follow the song. |
| **Play** | Turn-based games in the room. Pen Fight first — a 2D rigid-body solver, no engine. |
| **Chat & call** | Text alongside whatever is on, plus voice and video over WebRTC. Any face can be floated out into a draggable window that sits above every other screen. |
| **The room** | A 3D hub where everyone stands as a character of their own, against a backdrop the room picks. |

Rooms are **private by default** and joined by their code. An open room is a
deliberate choice, and is the only kind that appears in Discover.

---

## Running it

Two processes: a Vite dev server for the front end, and the API. One command
starts both.

```bash
npm install
npm run server:install
npm --prefix server run generate   # Prisma client
npm --prefix server run db:push    # create the SQLite database
npm run dev:all
```

Front end on `http://localhost:5173`, API on `http://localhost:4000`. In
development Vite proxies `/api`, `/socket.io` and `/uploads` to the API, so
everything is same-origin and the session cookie works with no configuration.

Copy `server/.env.example` to `server/.env` first — `JWT_SECRET` is the only
value the server refuses to start without.

### Showing it to someone else

`npm run sync` starts the API and opens an ngrok tunnel to it, so a deployed
front end can reach a back end running on your machine.

It takes the port and the tunnel back by force before starting, then refuses to
report success until it has actually fetched something through the public URL —
because both of the failures worth naming are invisible from inside the script
unless it goes and checks. A previous run still holding the port makes the new
server exit while the script prints a working banner; and ngrok's agent can lose
its session while the process stays alive, so nothing looks wrong locally and
the public URL answers nothing.

---

## Configuration

Everything below is optional. The app runs without any of it — each one
switches on a feature rather than being required for the rest to work.

| Variable | Enables | Without it |
| --- | --- | --- |
| `YOUTUBE_API_KEY` | Searching YouTube from inside the app | Pasting a link still works |
| `METERED_API_KEY` + `METERED_DOMAIN` | A TURN relay for calls | Calls connect only where a direct path exists — in practice, the same wifi |
| `TURN_URL` / `TURN_USERNAME` / `TURN_CREDENTIAL` | The same, with any static TURN provider | As above |
| `R2_*` | Publishing uploaded film to Cloudflare R2 as HLS | Uploads are served straight from the server instead |
| `CLIENT_ORIGIN` | Which origins may call the API | Defaults to `localhost:5173`; a deployed front end **must** be listed or CORS blocks every request |
| `CROSS_SITE` | Front end on a different origin to the API | Leave `false` when they share one |

`VITE_API_URL` belongs in the **front end's** `.env`, and only for a split
deployment. Setting it switches the client from cookie auth to bearer tokens,
because a third-party cookie is discarded by Safari outright.

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev:all` | Front end and API together |
| `npm run dev` | Front end only |
| `npm run sync` | API + ngrok tunnel, verified end to end |
| `npm run build` | Typecheck and build the front end |
| `npm run lint` | Oxlint |
| `npm run db:push` | Apply the Prisma schema |
| `npm run db:studio` | Browse the database |
| `npm --prefix server run publish -- "<file>"` | Transcode an upload to HLS and put it on R2 |

---

## How the sync actually holds

Four things have to be true at once, and most of the work is in the fourth.

**Nobody trusts their own watch.** Browser clocks are routinely seconds out, so
each client measures its offset from the server across several round trips and
keeps the median. "Where the film is" then means the same thing on every device.

**Drift is corrected by speed, not by jumping.** A player that slips behind is
run imperceptibly fast until it catches up. You only ever see a jump when the
gap is already big enough that you would have noticed it anyway — and on a
source that cannot be nudged, like YouTube, the threshold is wider still,
because every correction there costs a rebuffer.

**A stall is not treated as drift.** While a player is buffering — and for a
while after — it is left alone. The room's clock ran on while it was stuck, so
a player that has just recovered is behind by definition, and reading that as
fresh drift is what turns one stall into a loop of stall, jump, stall.

**The player and the room can disagree, and the room is not always right.**
Fullscreen on a phone hands the video to the operating system's own player,
whose pause button never reaches this app. So the player reports back anything
it did that we did not ask for, and drift correction stands down whenever the
player is genuinely stopped — seeking a paused video does not catch it up, it
just paints the frame at the new position.

---

## Uploaded film

An upload is repackaged to HLS and published to R2 rather than served whole. A
plain MP4 is one enormous file with its index at one end, so "press play" means
"download the index first" — on a feature film that is tens of megabytes before
a single frame.

The published ladder is the source rendition, **copied not re-encoded**, plus
lighter renditions beneath it. The top rung is bit-for-bit what was uploaded, so
nobody on a good connection loses anything; the rungs below exist because a
player with only one stream to choose from has nothing to drop to when the line
gets slow — it stalls, refills, and stalls again. Every rendition is cut on the
same grid, so switching between them is seamless.

---

## Drop-in assets

Several folders are globbed at build time — put a file in and it appears, with
nothing to import or register. Each has its own README with naming and export
notes.

```
src/assets/characters/   .glb characters for the hub
src/assets/scenes/       backdrops the room can stand in
src/assets/landing/      stone.png (page texture), listen.png
src/assets/videos/       local footage
src/assets/models/       props
```

---

## Structure

```
src/
  features/
    auth/          sign in, sign up, session
    dashboard/     the hub — rails, 3D stage, settings, room list
    games/         Play, and the Pen Fight solver
    landing/       the marketing page
    music/         Listen — queue, record view, lyrics, visualiser
    room-panel/    chat, the call, the floating window
    rooms/         room list, presence, presence-watch
    watch/         Watch — players, controls, drift correction
  components/      shared UI, layout, backgrounds
  hooks/           reduced motion, page visibility, pointer tilt
  lib/             api client, socket, asset discovery, utils
  pages/           routed screens
  vendor/          third-party sources kept in-tree

server/src/
  controllers/     HTTP handlers
  services/        the real work — transcode, publish, rooms, music, lyrics
  sockets/         one gateway per live feature, all on one connection
  models/          Prisma access
  config/          environment
```

Everything live rides **one** socket connection — presence, chat, the call's
signalling, watch, music, games. One connection, one handshake, and membership
checked the same way for all of them.

---

## Design notes

**Tokens live in one place.** Palette, type, radii and easing are defined once
in the `@theme` block in `src/index.css`.

**Surfaces carry no colour.** The surface scale is pure neutral dark, `#000000`
up through `#2a2a2e`, with no cast.

**The accent is load-bearing.** `--color-signal` is red and reserved for live
state — presence dots, the shared playhead, a live cursor. Use
`--color-signal-bright` for red *text*; pure `#ff0000` fails contrast at small
sizes. Primary buttons stay white, the way a streaming app's play button is.

**Reduced motion is honoured throughout.** `prefers-reduced-motion: reduce`
gates the Framer transitions, stops the 3D scenes rendering new frames, and
removes the hero's simulation outright — there is no still version of a pit of
falling spheres worth showing.

**The 3D scenes stop when nobody is looking.** A backgrounded tab, a covered
stage, or a reduced-motion preference drops the canvas to render-on-demand, so
it holds its last frame instead of spending a GPU on something nobody can see.

---

## Notes for anyone picking this up

- `src/vendor/` holds third-party sources kept in-tree rather than installed.
  Where one has been changed, the change is marked `DEVIATION FROM UPSTREAM`
  with the reason — those comments are load-bearing, and `Ballpit.jsx` will not
  render at all if one of them is reverted.
- `server/prisma/dev.db` is deliberately untracked. It was committed once, and
  the copies in history still hold real password hashes.
- Presence is in memory, so it means nothing across a restart and does not
  survive more than one server process. That is the point at which it moves to
  Redis.
