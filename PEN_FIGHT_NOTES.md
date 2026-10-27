# Pen Fight — classroom rebuild

The visual reference was the public local two-player game at
https://www.penfight.xyz/. The implementation uses Huddle's own procedural
classroom, pen meshes, textures, UI, and physics; no downloaded game assets
or source are required.

## Playing

- Challenge an online room member, play the practice rival, or pass one screen
  between two people. Other room members can spectate.
- Three cosmetic pens have identical physical dimensions and weight.
- Touch your own pen and pull back. Release to flick in the opposite direction.
  A centre hit slides; an end hit divides the shot's energy between sliding
  and spinning. Tiny accidental drags do not consume a turn.
- Aim controls provide direction/power sliders and an explicit Flick button,
  including keyboard support. Escape cancels a drag.
- First to three. Both pens falling awards neither player a point. A pen falls
  when its centre loses support. The loser opens the next round after a short
  result display. Each turn lasts 35 seconds; three missed turns by one player
  forfeit the match. A valid shot resets that player's missed-turn count.
- Network players see their own pen from the near side. Pass-and-play keeps
  the camera fixed so the desk does not flip between turns.

## Implementation

- `server/src/games/penfight.physics.ts`: shared dependency-free capsule solver.
  Fixed 480 Hz substeps; parallel contacts use the midpoint of the overlap.
  Shots generate a bounded 30 Hz trajectory (at most five seconds).
- `server/src/games/penfight.ts`: pure shot validation, match/round transitions,
  scores, timeouts, and the types used by both server and browser.
- `server/src/sockets/game.gateway.ts`: the server accepts flick intentions,
  never client-supplied positions or scores. Epoch and sequence checks reject
  duplicates and stale turns. A timer settles each shot even if its player
  disconnects. Rejoining returns the current trajectory or settled desk.
- `src/features/games/penfight/`: the scene, responsive classroom UI, practice
  rival, and local play. The practice rival evaluates legal shots with the
  same solver. No model calls. WebGL is required for the 3D scene.
- Rendering interpolates the trajectory independently of display refresh rate.
  Pointer capture, primary-pointer filtering, cancellation, and padded pen hit
  areas support touch input. The scene stops continuous rendering when hidden.

## Verification

- Frontend typecheck and production build pass.
- Server's pinned TypeScript 5.7 compiler passes. Running the root TypeScript 6
  against the server still reports the pre-existing spread error in
  `server/src/services/explainer.service.ts:486`; unrelated Study code was not changed.
- Lint has only the two existing Fast Refresh warnings.
- Full server suite: 260 tests, 257 passed, 3 Docker-dependent skips, no failures.
- 16 Pen Fight tests cover physics, energy/spin, parallel collisions, scoring,
  timeouts, malformed shots, real multiplayer permissions, duplicate/stale
  packets, and disconnecting mid-shot then recovering on rejoin.
- Browser checks: 320×568, 375×812, 730×900, 768×1024, 1024×768, 1440×900,
  812×375, and 375×400. Verified controls, overflow, short-window framing,
  keyboard sliders, help focus, results, spectators, errors, and long names.
- Actual scratch-room multiplayer: desktop and phone-sized drag shots, remote
  opponent shots, and page-refresh recovery. Physical iOS/Android devices
  were not available for testing.

## Shipping

Frontend and backend must update together: the old client-authoritative
`game:motion` / `game:settled` protocol has been replaced by `game:flick`.
No packages, environment variables, database migrations, or paid services added.
After publishing the branch to main, stop the Acer server with Ctrl+C, then
from the repository root run:

```sh
git pull --ff-only origin main
bash server/start-server.sh
```

Refresh open browser tabs after the backend restarts. Existing in-memory Pen
Fight matches reset on a backend restart, as before.
