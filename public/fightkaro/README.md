# FightKaro inside Huddle Play — testing branch

This is a local port of the public Sansad Showdown / FightKaro browser build inspected on 2026-11-04. The game runtime, art, recordings and music originate from https://fightkaro.com, credited in the original UI to @shivmbuilds. This is not a newly authored combat engine or a claim of ownership of that material. Original satire notices and embedded media metadata remain. The Instagram badge was removed from the game UI at the user’s request; source attribution is retained here. `provenance.json` records source URLs and SHA-256 hashes for the 80 external media files. Thirteen additional short audio clips remain embedded in the runtime.

All 7 characters (including the unlockable MBapu), 3 stages, desktop/mobile models, original procedural animation, combat rules, AI difficulties, supers, sound, music and round/rematch logic are included locally. The code and media are served by Huddle. No FightKaro server is required, and clicking the game never navigates away from Huddle.

## Huddle integration

- Play → FightKaro launches a local document inside GamesStage. The iframe is a same-origin isolation boundary for the original global CSS, WebGL loop and keyboard input; it does not embed the remote website.
- “Play with your room” atomically hosts or joins the waiting match in the current Huddle room. Both people use their own signed-in Huddle accounts. The server checks room membership; a third player cannot replace either fighter.
- The React bridge adds Huddle authentication to a narrow allowlist of signalling requests. Authentication credentials are not sent through postMessage. The API owns expiring room discovery, recovery signalling, membership checks and cancellation. The existing peer-to-peer deterministic combat transport remains unchanged.
- Leaving the game releases the room and destroys the frame, which stops the renderer, audio and connections. Huddle chat/call controls remain available. Listen pauses only on this client while fighting and resumes on leaving.
- Original analytics initialization is disabled. Asset URLs and saved settings are namespaced. Fullscreen is controlled by Huddle rather than triggered automatically inside the frame.
- Phone play retains landscape controls, lower-cost models and adaptive rendering. Portrait prompts the player to rotate.

## Local setup

Branch: `test/fightkaro-tab`. No new npm dependencies or database migrations.

Run the API with a disposable database and separate port (the development preview uses 4101). Run Vite with `VITE_API_TARGET=http://localhost:4101 npm run dev -- --port 5181 --strictPort`. Sign in, open a Huddle room, then Play → FightKaro. CPU play runs locally. For two-player testing, sign in as a different member on another browser/device, open the same Huddle room, and select “Play with your room” on both screens; select characters and press Ready.

The existing TURN configuration is reused. Local two-account WebRTC matches have been verified. Cross-network/mobile-carrier reliability depends on a reachable TURN relay and has not been verified on this machine. No paid relay was provisioned. Room discovery is in memory and resets on an API restart; it assumes one API process.

## Verification

Frontend/server TypeScript, lint, production build and server tests; authenticated HTTP pairing and long polling; membership denial; conflicting joins; cancellation/expiry/recovery. Browser checks: desktop 1440×900, portrait 375×812 and landscape phone 812×375; CPU combat; two-account room matching; character/stage/ready synchronization; health synchronization after attacks; leaving a match. A physical phone and remote network have not been tested.
