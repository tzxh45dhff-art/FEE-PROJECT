# Huddle geography game — research and implementation plan

Prepared 26 October 2026. Planning only; no application code or cloud configuration changed.

This is the original design record. For the implemented scope, verification and remaining Google setup, see [SOMEWHERE_SETUP.md](SOMEWHERE_SETUP.md).

## Recommendation

Build **Somewhere** (working name) as one game in Huddle Play. Use real Google Street View panoramas and an independent Google guessing map. Keep Huddle's room, friends and call running throughout. The scene should occupy almost the entire game area; the interface should appear only when it helps someone explore, guess or understand the result.

Ship a complete Classic game first, then Duels and shared challenges. Support Moving, No Move, and a fixed-view challenge without creating separate navigation destinations for each setting.

## What the research establishes

- GeoGuessr's central loop is exploration using real Street View clues, a guess on a map, and a score that rewards proximity. Its official description specifically identifies signs, landscape, architecture and language as clues. [Official explanation](https://geoguessr.freshdesk.com/support/solutions/articles/206000056750-what-is-geoguessr-)
- Live Challenges use five locations and show standings as the game progresses. The Daily Challenge also has five locations, with three minutes to locate each. These are useful references for short, repeatable sessions. [Live Challenges](https://geoguessr.freshdesk.com/support/solutions/articles/206000056757-what-are-live-challenges-) · [Daily Challenge](https://geoguessr.freshdesk.com/support/solutions/articles/206000056710-what-is-the-daily-challenge-)
- Official ranked guidance distinguishes Moving, No Move, and No Move/Pan/Zoom. Team Duels introduce escalating damage. These support having exploration rules and competitive rules as separate settings. [Ranked guide](https://geoguessr.freshdesk.com/support/solutions/articles/206000056733-a-guide-to-geoguessr-s-ranked-play) · [Team Duels](https://geoguessr.freshdesk.com/support/solutions/articles/206000056765-what-is-team-duels-)
- Its support documentation identifies clock mismatch, missing imagery and graphics performance as practical failure cases. Huddle needs explicit handling for these from the beginning. [Troubleshooting](https://geoguessr.freshdesk.com/support/solutions/articles/206000056716-troubleshooting-for-common-issues)

Access limit: the live GeoGuessr website failed to open in this environment. Current authenticated screens, animations and every interaction have **not** been personally verified. This plan uses official public material and Huddle's source. It does not claim to reproduce GeoGuessr's proprietary scoring, location database or matchmaking.

Everything below is a proposed Huddle design, rather than a claim about GeoGuessr's exact implementation.

## Player experience

| Screen | What the player sees and does |
| --- | --- |
| Setup | One attractive landscape-led card. World or India, exploration setting, and Start. Round count and timer live in a small advanced section. |
| Loading | Stable scene frame and a clear loading state. Prepare locations before starting the clock. |
| Explore | Full panorama, compact round/timer strip, compass, and map button. Moving mode adds navigation and Return to start. |
| Guess | Expand the map, place or move a pin, then press a clear Guess button. Show acknowledgement when the server locks it. |
| Waiting | Keep exploring the current view; show how many players have locked, without exposing their pins or the answer. |
| Reveal | Map with the actual start, player guesses and distance lines. Show distance, points and changed standings. Selecting one player highlights their route. |
| Finish | A five-stop journey recap, final ranking, closest guess and a one-action rematch. |

Desktop: expandable map in the lower-right corner; no hover-only essential controls. Phone: a map sheet with a large confirmation button and an explicit close control. Landscape and foldable layouts should use available width without covering the scene or provider attribution.

Use Huddle's dark surfaces and restrained red accent, clear type and subtle movement. Let real photography supply the colour. Keep the scoreboard collapsed during exploration. Reuse the room call controls; do not add a second social toolbar. Respect reduced motion, safe areas, focus rings, keyboard operation and touch targets. Add `data-lenis-prevent` to interactive panorama/map containers and nested result lists.

## Rules for the first release

- **Classic:** solo practice or 2–12 friends; five rounds by default, 90 seconds each. Everyone receives the same starting panorama, heading, pitch and zoom.
- **Exploration:** Moving allows road navigation, pan and zoom; No Move allows pan and zoom; Fixed View disables all three. These are settings on the same game.
- **World / India:** select a coverage-aware location pool. India must be a deliberate map rather than a few famous cities.
- **Scoring:** 0–5,000 points per round, using server-calculated great-circle distance. No speed bonus in Classic. A documented map-relative distance curve and perfect-guess radius will be calibrated against representative near/far guesses before release. Five rounds means a maximum of 25,000.
- **Guessing:** a pin is editable until confirmed. The first accepted confirmation locks it. At the deadline, a placed but unconfirmed pin is submitted automatically; no pin means zero points. The server needs a private draft-pin update for this to work across disconnections.
- **Transitions:** end early when all eligible players lock. Otherwise use the server deadline. A short reveal countdown and readiness control keep the room moving.
- **Joining:** late arrivals watch until the next round. Reconnection restores the same round and accepted pin without resetting the timer. Define host handover so the room cannot become stuck.

## Real randomness with good locations

Do not sample arbitrary latitude/longitude and keep retrying: that heavily favours unsuitable or unavailable places and creates inconsistent waits.

1. Start from independently maintained geographic seed regions, balanced across countries/regions and urban/rural settings where coverage exists.
2. Resolve nearby real panoramas through provider metadata, with bounded requests and timeouts. Use the resolved camera position as the answer, rather than the seed coordinate.
3. Review the initial pool for useful imagery, available movement links where needed, duplicate scenes and excessive concentration in one area. Expand it through the same checks.
4. Choose randomly within the balanced pool and use Huddle's room freshness tracking to avoid repeats across rematches.
5. Revalidate provider IDs, replace unavailable candidates before a round, and keep future selections off clients. Resolve upcoming candidates without bulk downloading imagery.

Google exposes panorama lookup, navigation data and camera controls through its SDK; IDs can stop resolving when imagery changes. [Street View service](https://developers.google.com/maps/documentation/javascript/streetview)

## Engineering approach

Use the existing `GameDef` state machine, party gateway and `useParty` subscription. Add a dedicated geography definition; the multiple-choice quiz data model is not the right fit.

Proposed state flow:

`prepare → loading/ready → playing → reveal → next round → finished`

New modules should have clear responsibilities:

- `server/src/games/geo.ts`: options, phases, eligibility, draft/locked guesses, deadlines, distance and scoring, per-viewer snapshots and results.
- `server/src/services/geoLocations.service.ts`: provider lookup, validation, bounded candidate selection and freshness.
- `src/features/party/geo/`: setup, stable panorama/map wrappers, HUD, guessing, reveal and recap.
- Register through `server/src/sockets/party.gateway.ts`; connect through `src/features/party/GamePicker.tsx` and `src/features/games/GamesStage.tsx`.

Every action carries session and round identity. Reject stale, duplicate, invalid-coordinate and late actions on the server. Draft and locked guesses remain private until reveal. Do not broadcast future panoramas or location lists. Never couple the guessing map's centre or marker to the panorama's real coordinates.

The browser SDK necessarily has access to information about the displayed panorama. Server-side scoring prevents forged scores, but does not make this a cheat-proof ranked game. Build for friends first.

## Speed and reliability

- Lazy-load the Google SDK when this game opens. Reuse a panorama instance and map instance rather than reconstructing them on timer updates, map expansion or round reveals.
- Keep camera motion out of React's render loop. Render HUD updates separately. Suspend unnecessary hub graphics while the game is active.
- Begin each countdown after a bounded readiness phase. Do not let one absent device block a room indefinitely. Show that player's loading problem and let them rejoin fairly.
- Handle a missing panorama before timing begins. For a confirmed provider-wide failure, cancel that round for everyone and replace it; a client error alone must not let someone repeatedly reroll a round.
- Use server deadlines with measured clock offset and monotonic elapsed time. Treat acknowledgement loss separately from a rejected guess; retry with an idempotent action ID.
- Preserve draft/locked state during reconnect and tab suspension. Handle map resize, WebGL/context loss and slow networks explicitly.
- Set measurable targets during the first real-device prototype: smooth panning on the owner's phone, prompt pin feedback, and no unnecessary imagery reload when an overlay changes. Provider/network loading cannot be guaranteed to be instantaneous.

## Cost and provider boundaries

Recommend Google Maps JavaScript API with Dynamic Street View for the first version. Maps and panoramas have separate billable events; panorama-object recreation is a relevant cost risk. Measure real usage rather than treating a round or image tile as the billing unit. Eligible India pricing currently lists 35,000 free monthly Dynamic Street View events and 70,000 Dynamic Maps events. [Billing triggers](https://developers.google.com/maps/billing-and-pricing/sku-details#dynamic-street-view) · [India pricing](https://developers.google.com/maps/billing-and-pricing/pricing-india)

Keep provider attribution visible. Do not download, rehost or bulk-cache Google imagery. Retain only data allowed by the applicable API terms, using permitted panorama IDs and independently maintained seeds; other provider response data should remain session-scoped unless expressly permitted. Include required public terms/privacy links. [Maps JavaScript policies](https://developers.google.com/maps/documentation/javascript/policies) · [Street View Static/metadata policies](https://developers.google.com/maps/documentation/streetview/policies)

Use a browser key restricted to the required API and allowed website origins, plus a separate restricted server credential if server lookup requires it. Keep credential configuration in untracked environment files. Billing activation, quotas and any paid resource changes require the owner's approval. This research has changed none of them.

## Delivery order and acceptance

1. **Playable foundation:** approved provider configuration; one real-location round; all three exploration settings; guessing, server scoring and reveal; desktop and phone layouts. Validate imagery coverage, attribution, SDK lifecycle and observed billing before expanding.
2. **Complete room game:** World/India pools, five-round Classic, loading/readiness, private drafts, reconnect, late join, host handover, freshness, recap and rematch.
3. **Competitive and replay features:** Duels with score-gap damage and an explicit escalating multiplier; a shortened countdown after the first locked guess; then Team Duels, shared daily routes and optional themed routes. Keep these inside the same setup/results flow.

Check distance at poles, the date line and antipodes; scoring monotonicity and boundaries; invalid coordinates; duplicate/late/stale submissions; private snapshot contents; reconnects and loading failures. Exercise simultaneous guesses from a full room. Visually inspect approximately 1440px desktop, 375px phone, landscape and foldable widths, including long names and loading/error states. Use a scratch API/database on 4100/5180, leaving production untouched.

Before implementation is called done: frontend/server TypeScript checks, lint, production build and server tests, plus actual browser checks. No implementation tests were run for this planning-only document.
