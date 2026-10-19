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
- [ ] **1. Emotes** — 1–9 keys + wheel; synced; existing clips + effects.
- [ ] **2. Throw things** — rose, confetti, pillow, water balloon, snowball; arc + reaction.
- [ ] **3. Quick toys** — dice, coin, spin the bottle, fortune cookie, magic 8-ball.
- [ ] **4. Reactions and moments** — emoji over the video; moments pinned to timestamps.
- [ ] **5. Shared wall** — sticky notes and doodles, persisted per room.
- [ ] **6. Truth or dare** — system suggests questions; decks: spicy, funny,
      friends, couples, deep; asker gets options + can write their own.
- [ ] **7. Draw and guess** — rounds, word choice, hints, scores.
- [ ] **8. How well do you know me** — answer about yourself, others guess, running score.
- [ ] **9. Guess the song** — clips from the room's music library, fastest correct guess.
- [ ] **10. Live trivia** — built-in question bank (Bollywood, cricket, films, GK), timer, leaderboard.
- [ ] **11. Photo booth** — pose, frame, caption, snap → memory wall.
- [ ] **12. Room pet** — Talking Tom-like: poke/pet/feed, repeats your voice pitched
      up, grows with time spent together, sad when neglected.
- [ ] **13. Memory wall** — photos, moments, game wins, songs, in one timeline.
- [ ] **14. Morning report** — below.

Excluded by the owner: Ludo, new body animations.

## Decisions
- 01:35 · A JARVIS overnight task (2:35/4:35/6:35) shares the usage limit; expect gaps.
- 01:40 · Linux kit tested in a real Ubuntu 24.04 VM (Colima, arm64): bare system,
  Mac node_modules copied in, Node and ngrok downloaded to .runtime, DB backed up,
  served from the copied DB, crash restart (4s), frozen-process watchdog (~55s),
  clean Ctrl+C, no-token guard, and the exact ngrok command line validated with a
  fake token (auth fails before any domain is claimed — the Mac's tunnel was never
  touched). x86_64 download URLs checked. Colima VM left running for later tests.

## Log
- 01:55 · Task 0 done: server/start-server.sh + server/LINUX.md. ₹0.

## Morning report
