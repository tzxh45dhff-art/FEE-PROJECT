# Draw & Guess

Huddle’s own take on the quick, social drawing-and-guessing loop. The visual design belongs to Huddle; Skribbl is a gameplay reference, not copied artwork or source code.

## What changed

- A dark ink-and-paper desk, amber controls, word selection, turn timer, a live guess log and per-turn score gains.
- The canvas preserves its 4:3 proportions at every layout. Artist and guesser layouts use the available space differently. Scores collapse on small screens; the guess composer remains visible.
- Phone keyboard support uses the visual viewport, 16px inputs/selects, an explicit Send button and IME-safe Enter submission. Failed submissions retain the typed guess; sending keeps focus in the input.
- Mouse, finger and pen use Pointer Events with one active pointer. Captured strokes continue to the edge and are clamped to the page. Coalesced pen input retains additional samples. Network batches are sent every 50ms.
- Pen, three brush sizes, eraser, bucket fill, undo, redo and undoable clear. The shared 1600×1200 backing store keeps fill boundaries and stroke widths consistent between devices, without erasing ink on rotation.
- Shortcuts: B for pen, E for eraser, F for fill, Ctrl/Command Z for undo, Ctrl/Command Shift Z or Ctrl Y for redo. Typing fields keep their normal shortcuts.
- Optional custom word banks (3–80 English words) and 0–2 automatic hints live inside “Make it yours.” Default options still use Huddle’s word bank and two hints. No external service or new paid feature.

## Multiplayer reliability

Every canvas operation includes the game session and turn identity. A rematch starts a new page; stale strokes, undo, redo and clear commands cannot affect it. The mounted board explicitly requests a snapshot after subscribing, including on reconnect. It never buffers ink through a disconnected socket. Whole word banks stay on the server. Near-miss feedback stays private. Correct answers accept case, punctuation and spacing variations. Late guesses are rejected by the server deadline, even if its timer callback runs late.

Drawing order is fixed for the game; people arriving mid-game can watch and join the next game. The existing shared game menu handles ending the game with confirmation.

## Verification

- Live two-player socket QA: drawing, bucket fills, undo/redo/clear recovery, refresh restoration, guesses by Send and Enter, private near misses, scoring, reveals and final results.
- Browser layout checks for both artist and guesser: 320×568, 375×812, 730×900, 768×1024, 1024×768, 1440×900, 812×375 and a 375×400 keyboard-sized viewport. Verified canvas proportions, viewport bounds, no page-level horizontal overflow and 44px action targets, including long names and a full 80-entry guess feed.
- Extra states use an ignored UI fixture in server/.cache: choosing, drawing, reveal, final scores, offline/recovery and failed-send draft preservation. This fixture is not shipped.
- Node regression tests cover private word banks, custom-word validation, hint settings, deadline rejection, turn scores, snapshot recovery, stale canvas operations, undo/redo, clear recovery, fresh rematches and connected-region flood fill.
- These are browser viewport tests, not physical certification of every iOS/Android/tablet model.

Frontend build, lint (two existing warnings) and the server’s pinned TypeScript compiler pass. Using the root TypeScript 6 compiler against the server still reports the existing Study explainer spread-type error at server/src/services/explainer.service.ts:486; that unrelated file was left unchanged.

## Shipping

No packages, environment variables or database migrations changed. Frontend and backend changes must ship together because the canvas protocol now requires a matching session/turn key. After an approved push, the Acer must pull and restart through its existing server/start-server.sh workflow. Nothing is deployed by this change alone.
