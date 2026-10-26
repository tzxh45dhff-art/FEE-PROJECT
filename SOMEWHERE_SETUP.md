# Somewhere — setup and handover

## What is built

Somewhere is a lazy-loaded game in Huddle Play. Classic supports solo or up to 12 friends, World and India routes, 3/5/10 rounds and 30/60/90/120/180-second clocks. One-on-one Duels use 6,000 health, score-gap damage, an increasing multiplier from round four, a 15-second finish after the first guess, and a maximum of ten rounds. The starter chooses their opponent; everyone else can watch.

Both modes offer movement, pan/zoom without movement, or a fixed view. Pins are private, revision-ordered and saved on the server. Confirming locks a pin; the saved draft submits at timeout. Loading has a bounded readiness check, with retries and two prepared replacement locations. Reconnects resume the existing round. Late arrivals join the next round. Results include distances, points, standings, selectable player lines and a round-by-round final recap.

Scoring is Huddle's own: 5,000 points within 25m, otherwise `min(4999, round(5000 × exp(-distanceKm / scale)))`; scale is 2,000km for World and 400km for India. There is no speed bonus. No pin scores zero. Duels compare round scores and multiply the difference by 1× in rounds 1–3, 2× in round 4, then 3×, 4×, and so on. Health cannot fall below zero. At ten rounds, health then cumulative points settle the result; equal values are a draw.

## Google setup — pending

No cloud resources, billing settings or real credentials were changed. There are no new runtime packages or database migrations.

Create two restricted credentials in the owner's approved Google Cloud project:

1. **Browser:** enable Maps JavaScript API. Restrict the key to that API and the exact local/production website referrers. Keep development and production restrictions deliberate. Add its value to the root untracked `.env`:

   ```dotenv
   VITE_GOOGLE_MAPS_API_KEY=
   ```

2. **Server:** enable Street View Static API for metadata lookup. Restrict this different key to that API, with a server IP restriction where the server has a stable outbound address. Add its value to `server/.env`:

   ```dotenv
   GOOGLE_MAPS_SERVER_KEY=
   ```

The server key is never sent to the client. A browser key is necessarily visible in the browser's SDK requests; API/referrer restrictions protect it. Do not use the server credential as the browser credential, or paste either into chat or source files.

Restart Vite after changing the root environment. On Vercel, set the browser variable in the relevant environment before an owner-approved rebuild/deployment. The Acer needs the server variable and a server restart after the owner approves shipping this branch. Its existing `server/start-server.sh` handles the build; no extra package install or schema update is required for this game.

After approved changes have reached `main`, run these from the Acer repository root:

```sh
git pull --ff-only origin main
```

```sh
bash server/start-server.sh
```

Success: Play → Somewhere enables Start once both sides are configured, and the first view becomes ready before its clock starts. Do not run a second start script while an existing supervised instance is still running; restart through the Acer's existing launcher/session.

Google billing activation, quota changes and paid cloud configuration still need the owner's explicit approval. Set usage monitoring and appropriate quotas before opening the feature publicly. Map and Street View object loads are separate billing events. The implementation reuses one map and panorama per mounted game, and only looks up upcoming metadata; it does not bulk-cache imagery. See [Google's billing triggers](https://developers.google.com/maps/billing-and-pricing/sku-details#dynamic-street-view) and [India pricing](https://developers.google.com/maps/billing-and-pricing/pricing-india).

Before public release, provide publicly accessible application terms/privacy links incorporating the required Google references. Keep the provider's native attribution unobscured. See [Maps JavaScript policies](https://developers.google.com/maps/documentation/javascript/policies).

## Verification and limits

The game uses its own rate-limited clock ping, calibrating a monotonic countdown with the fastest round trip. It does not subscribe to Watch or Music state. Other games retain their existing action timeouts; Somewhere uses a shorter acknowledgement timeout and idempotent guess retries.

- The rules/provider tests cover distance, scoring, date-line/polar map bounds, option validation, chosen opponent, private views, ordered drafts, duplicate/late/stale guesses, auto-submit, readiness, replacement, host handover, late joining, route completion and bounded provider lookup.
- The real socket integration verifies that missing map configuration is reported clearly and does not block an existing game.
- The full server regression suite uses fresh synthetic databases and disables paid providers. Its harness now creates an empty disposable SQLite file explicitly because Prisma's schema engine failed to create missing files on this machine. Existing databases are not used.
- Desktop and 375px phone setup were inspected in the real app on scratch ports 4100/5180. Gameplay, map expansion, pin confirmation, loading, errors, reveals and recap can be checked with an isolated SDK fixture in the ignored `server/.cache` directory. Fixture graphics are explicitly labelled and never shipped as game imagery.
- **Real Google imagery, restrictions, road navigation, coverage quality, on-device GPU performance and observed billing remain unverified until keys are available.** A metadata match confirms availability, not photographic quality; the seed pool needs a real-image review during that final pass. Region labels are approximate search-region labels, not reverse-geocoded addresses.
- Current SDK panoramas disclose location data to the browser. Scoring and other players' private guesses are protected by the server; this is a friends game, not a cheat-proof ranked system. Sessions persist through a client reconnect, but an API restart ends in-memory games, like the other party games.
- Team Duels, daily challenges and themed routes remain follow-up features from the plan.

Use the frontend TypeScript compiler and the server's installed TypeScript compiler for their respective projects. The root TypeScript 6 command against the server also exposes a pre-existing `explainer.service.ts` spread-narrowing error; the server's pinned TypeScript 5.7 compiler is the one used by its build script. No study implementation was changed for this game.
