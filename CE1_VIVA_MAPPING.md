# CE1 Syllabus → Huddle: Where Every Topic Actually Lives

**Course:** 25CSE0203 / Front End Engineering-II · **Scope:** Continuous Evaluation 1 only —
Syllabus Topic 1 (Lectures 1–42, 45% weightage), exactly as listed in the Course Handout.

This document does **not** cover Context API, Redux/Zustand, form validation strategies,
UI patterns (modal/tabs/toast), REST CRUD workflows, testing, performance optimization as a
topic, or deployment — those sit at Lecture 43 onward (Topic 2/3, CE2 and the Final
Evaluation) and are deliberately left out.

Every reference below is a real file in the working repository, checked against the source
before being written down — not recalled from memory. Paths are relative to the project root.

---

## 1. HTML5 — Structure, Semantic Tags, Accessibility Basics

**Semantic tags, not `<div>` soup.** The app uses `<nav>`, `<header>`, `<footer>`, `<main>`,
`<section>` throughout rather than generic containers everywhere.

- `src/components/layout/DockNav.tsx:56` — the floating dock navigation is a real `<nav>` element
- `src/features/watch/WatchBrowser.tsx:204` and `src/features/music/MusicBrowser.tsx:297` — the
  source-picker sidebar in Watch and Listen is a `<nav>`
- `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx` — literal `<header>`
  and `<footer>` landmarks, once each, shared across every route
- Every landing-page block (`RoomHero.tsx`, `HowItWorks.tsx`, `UnderTheHood.tsx`, `Questions.tsx`)
  is a `<section>` with its own `id`, which is also what the skip-link and in-page anchors target

**Accessibility basics.** Not decorative — genuinely load-bearing:

- `aria-label` on every icon-only control across the app — 8 in `WatchControls.tsx`, 8 in
  `MusicControls.tsx` alone, because a mute button that is just an icon says nothing to a screen
  reader without one
- `aria-hidden` on every purely decorative element (icons that sit *next to* a text label, so the
  label isn't announced twice) — over 60 uses across the Watch and Music screens
- `aria-pressed` on toggle buttons (mute, camera, chat panel) so assistive tech reports on/off
  state correctly — e.g. `src/features/room-panel/CallSection.tsx`
- A skip link on the landing page (`src/pages/LandingPage.tsx`) — `sr-only` until focused, then
  jumps keyboard users straight past the hero to the content
- `role="dialog"` on the floating call window (`src/features/room-panel/FloatingCall.tsx:206`)
  and `Escape`-to-close wired to a real `keydown` listener at line 149 — a floating window that
  traps focus with no way out is an accessibility failure, so this was built deliberately

---

## 2. CSS3 Fundamentals — Box Model, Flexbox, Grid

All three are Tailwind utility classes compiled to real CSS — the concepts are identical to
writing `padding`, `display: flex` or `display: grid` by hand; Tailwind is the authoring layer.

**Box model** — `src/features/dashboard/hub/RoomChip.tsx:40`:
```
className="... rounded-full py-2 pl-3 pr-2 sm:gap-4 sm:pl-4"
```
Asymmetric padding (`pl-3` vs `pr-2`) so an icon on the left sits closer to the edge than text on
the right — a real box-model decision, not a default.

**Flexbox** — used in 51 files. The entire dock navigation, every control row (`WatchControls`,
`MusicControls`), and the whole floating call window's layout are flex containers. Concrete
example: `src/features/room-panel/RoomPanel.tsx` — `flex flex-col` stacks the room name, the call
section and the chat log vertically inside a fixed-width side panel.

**CSS Grid** — used in 37 files. Cleanest examples:
- `src/features/landing/components/UnderTheHood.tsx:55` — `grid gap-px ... sm:grid-cols-2`, the
  four sync-mechanism cards
- `src/features/landing/components/UnderTheHood.tsx:100` — `grid gap-6 sm:grid-cols-2
  lg:grid-cols-4`, the "what else is in the room" card row — 2 columns on a small screen, 4 on
  a wide one, from the grid definition alone, no JavaScript involved

---

## 3. Responsive Design, Media Queries, Mobile-First Layouts

**Mobile-first, not desktop-shrunk.** Every Tailwind breakpoint prefix (`sm:`, `md:`, `lg:`)
means "at this width *and wider*, override what came before" — so the unprefixed class is always
the phone layout, and larger screens are the exception being written, which is mobile-first by
construction. 187 uses of these prefixes across the app; heaviest concentrations:
`WatchBrowser.tsx` (16), `MusicBrowser.tsx` (15), `NowPlaying.tsx` (8).

**A real, working example:** `src/features/dashboard/hub/HubRail.tsx` uses `sm:` ten times to
turn a bottom icon bar (phone) into a side rail with visible labels (tablet and up) — the same
component, two different arrangements, no separate mobile version to maintain.

**Actual `@media` queries**, not just Tailwind: `src/index.css` has five hand-written
`@media (prefers-reduced-motion: reduce)` blocks (lines 336, 382, 656, 669, 830) that strip
animation for anyone whose OS says they want less motion — a real accessibility-driven media
query, separate from the responsive-width ones.

---

## 4. JavaScript Fundamentals — Variables, Functions, Arrays, Objects, Loops

This is the substrate everything else sits on, so rather than one file, the clearest single
demonstration is `server/src/services/transcode.service.ts` (build script, not UI, but pure
JavaScript logic): array `.filter()` to pick which video-quality rungs are worth generating,
`.map()` and `.flatMap()` to build the ffmpeg argument list, template literals for the command
strings, and a plain `for` loop nowhere in sight because the array methods replace it — which is
itself the point being taught: modern JS prefers `.map`/`.filter`/`.reduce` over hand-rolled loops.

Object literals as configuration are everywhere — e.g. the drift-correction constants in
`src/features/watch/useDriftCorrection.ts` (`HARD_SECONDS`, `SOFT_SECONDS`, `SEEK_COOLDOWN_MS`
and five others), each a plain `const` binding with a comment explaining the number.

---

## 5. Dev Tools, VS Code Setup, Git/GitHub Basics

**This is a real git repository**, not a zip file with a `.git` folder bolted on: 58+ commits,
each with a real message describing *why* a change was made, not just *what* changed —
```
5cebdf1 rewrite the readme for the app this became
2033ead landing
496c27d centre the hero, and stop dimming the pit to make room for it
abec4b9 fix the shader that stopped the spheres being drawn at all
```
`.gitignore` (37 lines) deliberately excludes `node_modules`, `dist`, `.env`, and — notably —
`server/prisma/dev.db` is called out by name with a comment explaining *why*: a local database
file was committed once by mistake and it is never allowed back.

Dev tools usage shows up as evidence rather than a screenshot: every error boundary and every
`catch` block that matters logs to `console.error` (never silently swallowed), and `oxlint` +
`tsc --noEmit` are run as real gates before anything ships — `npm run lint` and `npm run build`
in `package.json`.

---

## 6. ES6+ Features

**`let` / `const`** — the codebase contains no `var` at all; every binding is `const` unless it's
reassigned, in which case `let`.

**Arrow functions** — the default function style throughout; `src/lib/api.ts` alone uses `=>`
repeatedly for every request helper (`get`, `post`, `del`).

**Destructuring** — `src/features/auth/components/AuthForm.tsx:52`:
```ts
await onSubmit({ name, email, password })
```
is shorthand-property construction (the ES6 partner to destructuring); the actual destructuring
happens one level up, where `AuthForm({ mode, onSubmit })` pulls both props straight off the
function's parameter object rather than reading `props.mode` and `props.onSubmit`.

**Spread / rest** — `src/features/dashboard/hub/usePreferences.ts:106` spreads the previous
preferences object before overwriting one key (`{ ...current.preferences, ...patch }`), the
standard immutable-update pattern React state relies on.

**Modules — `import`/`export`** — the entire codebase (166+ client files) is ES modules; there is
not a single `require()` anywhere in `src/`.

**Promises, `async`/`await`, Fetch API** — `src/lib/api.ts`, the whole file:
```ts
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  ...
  const response = await fetch(url, { ...init, headers, credentials: 'include' })
```
Every API call in the app — sign in, create a room, publish a film — is a `Promise` awaited
through this one function, which is itself built directly on the native `fetch` API with no
library in between.

---

## 7. DOM Manipulation and Event Handling

**React's synthetic events** cover `onClick`, `onChange`, `onSubmit` throughout — e.g.
`AuthForm.tsx:73–74`, a fully controlled input (`value={name}` / `onChange={(event) =>
setName(event.target.value)}`).

**Real, imperative DOM manipulation**, underneath the React layer where React's own model can't
reach:
- `src/features/dashboard/hub/thumbnail.ts:50` — `document.createElement('canvas')`, a genuine
  off-screen canvas built by hand to render a 3D character to a still image
- `src/features/watch/players/FilePlayer.tsx:124–125` — `addEventListener('addtrack', ...)` and
  `addEventListener('change', ...)` directly on the video element's native `audioTracks` list,
  because that particular browser API has no React wrapper at all
- `src/features/room-panel/FloatingCall.tsx:122–149` — four separate `window.addEventListener`
  calls (`resize`, `orientationchange`, `keydown`) driving the floating call window's position and
  its `Escape`-to-close behaviour, each one paired with the matching `removeEventListener` in
  cleanup

---

## 8. Browser Storage, JSON, Forms

**`localStorage`** — used in 5 files. Cleanest example: `src/features/dashboard/hub/usePreferences.ts`,
which saves which 3D character and which room backdrop you picked, scoped per signed-in account
(`keyFor(userId)`) so two people sharing a browser don't inherit each other's choices.

**JSON** — `JSON.stringify` writes the preferences object into `localStorage`
(`usePreferences.ts:106`); `JSON.parse` reads it back out (`usePreferences.ts:44`); and every
single API request/response body in the app is JSON, serialised and parsed inside `src/lib/api.ts`.

**Forms** — the sign-in/sign-up form (`AuthForm.tsx`) and the create-room form
(`src/features/dashboard/components/CreateRoomForm.tsx`) are both real `<form onSubmit={...}>`
elements with `event.preventDefault()`, not just a button wired to an `onClick`.

---

## 9. Handling Events, Forms, and Controlled Components

Every text input in the app is **controlled** — its value lives in React state, not in the DOM —
which is the specific pattern the syllabus names. `AuthForm.tsx` is the canonical example: three
`useState` calls (`name`, `email`, `password`), each wired to exactly one `<input>`'s `value` and
`onChange`, so React is the single source of truth for what's on screen at every keystroke, not
the browser's own input element.

---

## 10. React Project Setup (Vite)

The whole client is a Vite project — `vite.config.ts` configures the dev server to proxy `/api`,
`/socket.io` and `/uploads` to the backend so the browser sees one origin in development, and
`npm run dev` / `npm run build` (`package.json`) are Vite's own scripts, not a hand-rolled webpack
config.

---

## 11. React Introduction — Component Architecture, JSX, Props, State, Lists, Conditional Rendering

**Component-based architecture** is the entire `src/features/` folder: nine independent feature
folders (`auth`, `dashboard`, `games`, `landing`, `music`, `room-panel`, `rooms`, `transition`,
`watch`), each a self-contained set of components that only talk to the rest of the app through
a small, explicit interface — props in, callbacks out.

**JSX** is every `.tsx` file in the project — HTML-shaped syntax that compiles down to
`React.createElement` calls.

**Props** — `FloatingCall.tsx` alone takes eight distinct props (`stream`, `name`, `muted`,
`cameraOff`, `failed`, `isSelf`, `onClose`), each with its own TypeScript type, demonstrating
typed props rather than untyped `any`.

**State** — `useState` appears in 40 files; the simplest clean example is
`AuthForm.tsx`'s five independent pieces of local state.

**Rendering lists** — `src/features/watch/QueuePanel.tsx:90`: `{items.map((item, index) => {`
— every item in the room's queue rendered from one array, each needing a stable `key`.

**Conditional rendering** — `src/pages/DashboardPage.tsx:461`: `{revealed && (...)}`, the
`&&`-short-circuit pattern; and `:505`, a ternary (`error ? (...) : (...)`)  picking between an
error message and the normal content depending on whether something failed.

---

## 12. `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`

Real usage counts across the client codebase:

| Hook | Files using it |
| --- | --- |
| `useState` | 40 |
| `useEffect` | 59 |
| `useRef` | 24 |
| `useCallback` | 23 |
| `useMemo` | 7 |

- **`useState`** — `AuthForm.tsx`, above.
- **`useEffect`** — `src/features/room-panel/FloatingCall.tsx` uses it to attach and detach the
  four `window` listeners described in section 7, always paired with a cleanup function that
  removes exactly what was added.
- **`useRef`** — `src/features/room-panel/CallTile.tsx` holds the live `<video>` element in a ref
  so the WebRTC `MediaStream` can be attached to `video.current.srcObject` imperatively — this is
  the textbook reason `useRef` exists, since `srcObject` has no HTML attribute equivalent and
  cannot be set through JSX props at all.
- **`useMemo`** — `src/pages/DashboardPage.tsx:181` memoises `floating`, the "who is showing in
  the popped-out call window" object, so it is only recomputed when the call's peer list, mute
  state or camera state actually changes — not on every one of the page's other re-renders.
- **`useCallback`** — `src/features/watch/WatchStage.tsx:389`, `onPlayerIntent`. It's the handler
  that fires when the video element pauses or plays *on its own* — fullscreen on a phone hands
  playback to the OS's own player, and its pause button never goes through this app's controls.
  Wrapped in `useCallback` so it keeps a stable identity across renders, because it's handed down
  into the player component as a prop (`onIntentChanged={onPlayerIntent}`, line 528) and a fresh
  function reference there would look like a changed prop on every render, whether anything
  actually changed or not.

---

## 13. Component Composition and Reusable UI

`src/features/watch/players/FilePlayer.tsx` and `YouTubePlayer.tsx` both implement the *same*
shape — `play`, `pause`, `seek`, `getPosition`, `isPaused` (a shared TypeScript type called
`PlayerHandle`, `src/features/watch/types.ts:99`) — so `WatchStage.tsx` can hold either one behind
a single `handle` variable and drive it identically, without an `if (source === 'youtube')` branch
anywhere the controls actually live. That's composition: two different implementations of one
interface, used interchangeably by everything above them.

A third player, `ExternalBeacon.tsx`, is a deliberate *non*-example worth knowing: services like
Netflix or Prime expose no playback API and are DRM-sandboxed, so there is no honest way to drive
them from this app at all. Rather than force a fake `PlayerHandle` onto something that can't
actually seek or report position, it takes plain props (`item`, `position`, `playing`) and shows a
shared countdown clock instead — the room syncs the one thing it legitimately can.

---

## 14. Custom Hooks

23 custom hooks in the project (any file matching `use*.ts` outside React's own library). A few,
with what each one is actually solving:

- `src/hooks/usePageVisible.ts` — turns the browser's `visibilitychange` event into a plain
  boolean, used to pause 3D rendering in a backgrounded tab
- `src/hooks/usePrefersReducedMotion.ts` — wraps the `prefers-reduced-motion` media query as a
  hook so any component can read it without touching `window.matchMedia` directly
- `src/features/music/useLyrics.ts` — fetches and caches time-synced lyrics for whatever track is
  playing, hiding the network request and the loading state behind one hook
- `src/features/room-panel/useMeshCall.ts` — the entire WebRTC mesh-call state machine (601
  lines), reduced to one hook that `DashboardPage.tsx` calls once and gets back `{ peers, join,
  leave, toggleMute, ... }`

This is the point of a custom hook: none of `DashboardPage.tsx`'s own code deals with
`RTCPeerConnection` directly — that complexity is entirely inside the hook.

---

## 15. Lifting State Up and Prop Drilling Basics

The call's state is a direct, real example of **lifting state up**: `useMeshCall` is called once,
in `DashboardPage.tsx` — not inside `RoomPanel` or `CallSection` where the call UI actually lives
— specifically so the state survives the room panel being closed. If it lived inside the panel
component, closing the panel would unmount it and drop the call.

That state is then **prop-drilled** down through two layers to reach where it's rendered:
`DashboardPage` → `RoomPanel` (`call` prop) → `CallSection` (`call` prop again) → `CallTile` (the
individual fields). `src/features/room-panel/RoomPanel.tsx` and
`src/features/room-panel/CallSection.tsx` show exactly this passthrough — each layer forwards the
prop one level further without needing to understand what's inside it.

---

## 16. React Router — Basics, Nested/Dynamic Routes, Route Params, Protected Routes, 404

Full route table, `src/App.tsx`:

```tsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/signin" element={<SignInPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
  <Route path="*" element={<LandingPage />} />
</Routes>
```

**Protected routes — real.** `src/pages/RequireAuth.tsx` wraps `/dashboard`: it reads
`useAuth()`, renders nothing while the first session check is in flight (so a signed-in user
refreshing the page never flashes a sign-in screen), and redirects to `/signin` via `<Navigate
replace state={{ from: location.pathname }} />` if there's no user — the `state` is what would
let a future "return to where you came from" flow work, carried through `useLocation()`.

**Which room you're in — a deliberate, honest architecture choice, not `useParams`.** The app does
**not** use a URL path segment like `/room/:id`. Instead, `src/pages/DashboardPage.tsx` uses
`useSearchParams()` to hold which room and which activity (Watch, Listen, Play) are open, as query
parameters on `/dashboard`. This is a real, working alternative to path params for the same
underlying idea — state that lives in the URL rather than in a `useState` — and is worth being
able to explain *as a choice*: a query param can be added or removed without a full route
re-match, which suits a dashboard where "which panel is open" changes far more often than "which
page am I on."

**404 — also honest, not overstated.** The catch-all `path="*"` route exists and works — an
unknown URL doesn't crash or blank the page — but it currently renders `LandingPage`, not a
dedicated "page not found" component. If asked directly: *"there is a catch-all route, and it
currently redirects to the landing page rather than showing a distinct 404 view."*

---

## Quick-reference table for the actual viva

| Ask about... | Point at |
| --- | --- |
| Semantic HTML | `Header.tsx`, `Footer.tsx`, `DockNav.tsx` (`<nav>`) |
| Accessibility | `aria-label` in `WatchControls.tsx`, skip link in `LandingPage.tsx` |
| Flexbox | `RoomPanel.tsx` (`flex flex-col`) |
| Grid | `UnderTheHood.tsx:100` (`grid-cols-2` → `lg:grid-cols-4`) |
| Responsive / mobile-first | `HubRail.tsx` (`sm:` rearranges bar → rail) |
| Fetch / Promises / async-await | `src/lib/api.ts` |
| localStorage + JSON | `usePreferences.ts` |
| Controlled form | `AuthForm.tsx` |
| useState / useEffect | `AuthForm.tsx` / `FloatingCall.tsx` |
| useRef (real reason, not just habit) | `CallTile.tsx` — `video.current.srcObject` |
| useMemo / useCallback | `DashboardPage.tsx` (`floating`) / `WatchStage.tsx` (`onPlayerIntent`) |
| Custom hook | `useMeshCall.ts` — hides all of WebRTC |
| Lifting state up | `useMeshCall()` called in `DashboardPage`, not in the panel |
| Prop drilling | `call` passed `DashboardPage → RoomPanel → CallSection → CallTile` |
| Protected route | `RequireAuth.tsx` |
| Router state that isn't `useParams` | `useSearchParams()` in `DashboardPage.tsx` |
| 404 handling | catch-all `path="*"` in `App.tsx`, honestly not a dedicated page |
