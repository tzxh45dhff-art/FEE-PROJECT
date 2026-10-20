# Overnight build — 20 Oct 2026, 01:30 → 10:00 IST

The owner is asleep. Nobody will answer questions. Read this file first in every
session, continue from the first unchecked task, and never redo finished work.

## Rules (hard)

- **Branch `night/fun` only. Never push. Never merge to `main`.** A push to `main`
  deploys to production on Vercel. The owner reviews and pushes in the morning.
- **Never touch the owner's running API (port 4000) or his ngrok process.** Test
  on your own server: `PORT=4100` (see "Test server" below).
- **Azure cap for the night: ₹200.** Tests use fakes. Real Azure only if a
  feature is genuinely unverifiable without it — and log every rupee here.
- **Commit after every green task** with a clear message. Commits are authored
  as the owner (jais) only — **no Co-Authored-By trailer**, the owner's standing
  rule. A crash must never lose more than one task.
- **Every feature:** server + client, synced across the room, tests (unit + two
  socket clients), `tsc` clean both stacks, `npm run lint`, `npm run build`, and
  look at it in the browser pane. No body animations (owner does those) — use
  the existing idle/wave/sit clips plus effects only.
- Don't ask anything. Decide, note the decision below, move on.
- Stop starting new work at 09:30 IST. Write the morning report (bottom of this
  file) and stop.
- Keep the Mac awake: `pgrep -f caffeinate >/dev/null || (nohup caffeinate -dimsu -t 36000 >/dev/null 2>&1 &)`
- Lock against overlapping sessions: `/private/tmp/huddle-night.lock`. If it was
  modified < 25 min ago, another session is working — stop. Otherwise `touch` it,
  and touch again every ~15 min.

## Test server

```bash
cd server && PORT=4100 DATABASE_URL="file:./night.db" npx prisma db push --skip-generate >/dev/null && \
  PORT=4100 DATABASE_URL="file:./night.db" npx tsx src/server.ts   # in the background
```

## Tasks (in order)

- [x] **0. Linux server kit** — `server/` must run on a Linux laptop 24/7 from
      one command: `./start-server.sh` installs deps, prepares the DB, starts the
      API, starts ngrok, restarts either if it dies, runs until Ctrl+C. Owner adds
      the ngrok token in the morning. HIGHEST PRIORITY.
- [x] **1. Emotes** — 1–9 keys + wheel; synced; existing clips + effects.
- [x] **2. Throw things** — rose, confetti, pillow, water balloon, snowball; arc + reaction.
- [x] **3. Quick toys** — dice, coin, spin the bottle, fortune cookie, magic 8-ball.
- [x] **4. Reactions and moments** — emoji over the video; moments pinned to timestamps.
- [x] **5. Party-game engine + Truth or dare** — one server engine for turn-based
      room games (per-player views so secrets stay secret, timers, results saved
      to GameResult). Truth or dare: decks funny / friends / couples / deep /
      spicy (18+, confirmed), the SYSTEM suggests 3 cards to the asker who picks
      one or writes their own, done / chicken-out, rotation, results. Play stage
      gets a game picker.
- [x] **6. Draw and guess** — on the engine: word choice, live strokes, hints, scores.
- [x] **7. How well do you know me** — on the engine.
- [ ] **8. Room pet** — Talking Tom-like: poke/pet/feed, repeats your voice pitched
      up, grows with time spent together, sad when neglected. Lives on the dashboard.
- [ ] **9. Photo booth** — pose, frame, caption, snap → memories.
- [ ] **10. Live trivia** — built-in bank (Bollywood, cricket, films, GK), timer, leaderboard.
- [ ] **11. Guess the song** — clips from the room's music library.
- [ ] **12. Shared wall** — sticky notes and doodles, persisted per room.
- [ ] **13. Memory wall** — photos, moments, game wins, in one timeline.
- [x] **14. Morning report** — below.

Excluded by the owner: Ludo, new body animations.

## Decisions
- 02:55 · Reordered tasks 5–13 so the most fun lands first (the owner warned the
  usage limit may cut the night): party games and the pet before the wall.
- 02:20 · The Mac's own API (4000) and ngrok were found not running at 02:20 —
  not touched tonight; left as found. The owner moves to Linux in the morning.
- 02:40 · Effects anchor to each character's projected 3D head (published by the
  canvas each frame), falling back to the nameplate column for flat characters.
- 02:55 · Toy result cards are a single compact row placed above the highest head;
  a tall card had nowhere to go but over someone's face on a 900px-tall screen.
- 01:35 · A JARVIS overnight task (2:35/4:35/6:35) shares the usage limit; expect gaps.
- 01:40 · Linux kit tested in a real Ubuntu 24.04 VM (Colima, arm64): bare system,
  Mac node_modules copied in, Node and ngrok downloaded to .runtime, DB backed up,
  served from the copied DB, crash restart (4s), frozen-process watchdog (~55s),
  clean Ctrl+C, no-token guard, and the exact ngrok command line validated with a
  fake token (auth fails before any domain is claimed — the Mac's tunnel was never
  touched). x86_64 download URLs checked. Colima VM left running for later tests.

## Log
- 02:05 · Tasks 1–3 done together (they share one gateway): emotes (16, keys 1–9,
  wave plays the model's own clip), throwing (8 items, real arcs between heads,
  impacts, nameplate flinch, reaction face), toys (dice, coin, bottle, fortune,
  8-ball — all decided server-side). Server got its first test harness (real
  server + temp DB + real sockets): 15 tests. Verified by eye in the browser
  with a scripted second person. ₹0.
- 01:55 · Task 0 done: server/start-server.sh + server/LINUX.md. ₹0.

- 02:50 · Task 4 done: reactions over the film (8, floating up the right with
  the sender's name), moments pinned with a face and a note (saved, live for
  everyone, "Jump there" toast, faces on the seek bar, a moments list). Schema
  for the whole night added in one additive change. Bug found by eye and fixed:
  the pin sheet showed the frozen time but saved the live one. 22 server tests.
  ₹0.

- 02:55–05:10 · Usage limit hit mid-task; resumed 05:12 with nothing lost.
- 05:20 · Task 5 done: party-game engine (pure state machines, per-player views,
  timers, results saved to GameResult) + truth or dare (5 decks, ~200 cards,
  spicy gated 18+, system suggests 3 cards, shuffle, write-your-own, bottle
  ring, done/chicken, scoreboard, summary) + Play stage game picker. 34 server
  tests. Played a full round by eye. ₹0.

- 05:27 · Task 6 done: draw and guess (230 drawable words, India-flavoured; word
  choice with auto-pick, hints, edit-distance near-miss whispered privately,
  speed scoring, drawer scoring, reveal, rotation, final scores). Strokes on a
  validated drawer-only side channel; late joiners get the canvas. Countdowns
  use server time. 47 server tests. Played by eye. ₹0.

- 05:30–11:05 · Usage limit hit again mid-task; resumed 11:09 with nothing lost.
- 11:15 · Task 7 done: how well do you know me (48 questions; the hot seat
  answers in secret while everyone guesses at once; answers changeable until
  the reveal; reveal shows the truth, who picked what and a verdict line;
  +100 per right guess, +50 to the subject per right reader; the end screen
  names who knows whom best). 53 server tests. Played by eye. ₹0.
  Past the 09:30 cutoff, so no new tasks started after this.

## Morning report

Written 11:15 IST, 20 Oct. The night was cut twice by the usage limit
(02:55–05:10 and 05:30–11:05), so 8 of 15 tasks got done. Everything done is
committed on **`night/fun`**: not pushed, not merged. Pushing to `main` deploys,
so look first.

**Done**
- Linux server kit (`server/start-server.sh`, `server/LINUX.md`), tested in a real
  Ubuntu VM.
- Emotes (keys 1–9 and a wheel), throwing things between characters, and quick
  toys (dice, coin, bottle, fortune cookie, 8-ball).
- Reactions over the film, and moments pinned to timestamps.
- A party-game engine with a game picker on the Play stage.
- Truth or dare: 5 decks, with spicy behind an 18+ confirmation. The system offers
  3 cards and you can also write your own.
- Draw and guess.
- How well do you know me.

**Not started** (in this order next): room pet, photo booth, live trivia, guess the
song, shared wall, memory wall. The database tables for all of them already
exist (additive). The trivia and song cards on the picker say "soon".

**Checks:** 53 server tests pass, `tsc` is clean on both stacks, lint is at its
old baseline (2 warnings, not new), and the build works. ₹0 of Azure spent.

**Things to do yourself**
1. Moving to Linux: follow `server/LINUX.md`. Stop the Mac's API and ngrok,
   copy `server/` (including the hidden `.env`, `prisma/dev.db` and `uploads/`),
   then run `./start-server.sh`. It asks for the ngrok authtoken once.
2. The Mac's API (port 4000) and ngrok were already down at 02:20 and I left
   them alone. If you're staying on the Mac for now, start them yourself.
3. Review `night/fun` (`git log main..night/fun`), then merge or push when
   you're happy.
4. Optional: the Colima VM from the Linux test is still running
   (`colima stop` frees the memory). Dev servers on 4100 and 5180 are tonight's
   test copies, using `server/night.db`, which is gitignored.

