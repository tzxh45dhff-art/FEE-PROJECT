# FightKaro inside Huddle Play — local integration

This is a local port of Sansad Showdown / FightKaro, updated from its public browser build on 2026-11-06. The game runtime, art, recordings and music originate from https://fightkaro.com, credited in the original UI to @shivmbuilds. This is not a newly authored combat engine or a claim of ownership of that material. Original satire notices and embedded media metadata remain. The Instagram badge was removed from the game UI at the user’s request; source attribution is retained here. `provenance.json` records source URLs and SHA-256 hashes for the current external media files and patched runtime. Additional short audio clips remain embedded in the runtime.

All 9 characters (including the unlockable MBapu), 3 stages, desktop/mobile models, original procedural animation, combat rules, AI difficulties, supers, sound, music and round/rematch logic are included locally. The code and media are served by Huddle. No FightKaro server is required, and clicking the game never navigates away from Huddle.

## Huddle integration

- Play → FightKaro launches a local document inside GamesStage. The iframe is a same-origin isolation boundary for the original global CSS, WebGL loop and keyboard input; it does not embed the remote website.
- “Play with your room” atomically hosts or joins the waiting match in the current Huddle room. Both people use their own signed-in Huddle accounts. The server checks room membership; a third player cannot replace either fighter.
- The React bridge adds Huddle authentication to a narrow allowlist of signalling requests. Authentication credentials are not sent through postMessage. The API owns expiring room discovery, recovery signalling, membership checks and cancellation. The existing peer-to-peer deterministic combat transport remains unchanged.
- Leaving the game releases the room and destroys the frame, which stops the renderer, audio and connections. Huddle chat/call controls remain available. Listen pauses only on this client while fighting and resumes on leaving.
- Original analytics initialization is disabled. Asset URLs and saved settings are namespaced. Fullscreen is controlled by Huddle rather than triggered automatically inside the frame.
- Phone play retains landscape controls, lower-cost models and adaptive rendering. Portrait prompts the player to rotate.

## Local setup

Branch: `night/fun`. No new npm dependencies or database migrations.

Run the API with a disposable database and separate port (the development preview uses 4101). Run Vite with `VITE_API_TARGET=http://localhost:4101 npm run dev -- --port 5181 --strictPort`. Sign in, open a Huddle room, then Play → FightKaro. CPU play runs locally. For two-player testing, sign in as a different member on another browser/device, open the same Huddle room, and select “Play with your room” on both screens; select characters and press Ready.

The existing TURN configuration is reused. Local two-account WebRTC matches were verified during the initial Huddle integration. Cross-network/mobile-carrier reliability depends on a reachable TURN relay and has not been verified on this machine. No paid relay was provisioned. Room discovery is in memory and resets on an API restart; it assumes one API process.

## Verification

For this refresh: frontend/server TypeScript, lint, production build and server tests; authenticated HTTP pairing and long polling; membership denial; conflicting joins; cancellation/expiry/recovery; asset integrity and local paths; new-roster lobby exchange and rejection of incompatible cached builds. Browser checks covered CPU combat with the new fighters at desktop 1440×900, portrait rotation guidance at 375×812, and the embedded landscape layout and controls at 812×375.

The initial integration also verified two-account room matching, character/stage/ready synchronization, health synchronization after attacks, and leaving a match. A fresh two-browser WebRTC match with this build, a physical phone and a remote network have not been tested.

## 6 November 2026 upstream refresh

Entry: `main-CfQ2THv5.js` (previously `main-B8x0sGzM.js`). Includes Sutti Babu and Rail Raja with their models, voices and supers; the Diwali theme; the budget mechanic; portal cinematic; updated rendering and character loading; WebP portraits/textures and both desktop/mobile models. Imported the matching HTML, CSS and Three.js runtime together. Decoder paths, models, portraits, artwork and videos are served below `/fightkaro/`.

Huddle matchmaking was reapplied to the new runtime’s host/join/session functions; the unchanged upstream signalling-module version retains our authenticated API adapter. Peers exchange a build identifier before accepting lobby state; incompatible cached clients get a refresh message instead of entering a match with different combat rules. Analytics stays disabled, settings stay namespaced, and embedded fullscreen stays controlled by Huddle. The original creator attribution remains above; donation prompts are not mounted inside Huddle.

This update changes bundled frontend assets only. No server restart, new packages, environment variables or database migration is needed for these changes. Existing TURN requirements still apply.
