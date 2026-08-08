# SyncRoom — landing page

Static marketing page for SyncRoom, a real-time collaborative "Room OS".

React + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui conventions + Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

## Poster wall artwork

The hero background is a wall of poster tiles. It runs in one of two modes:

| Mode | When | Source |
| --- | --- | --- |
| Real artwork | `src/data/posters.json` is populated | TMDB, fetched at build time |
| Procedural | that file is empty, or an image fails to load | CSS gradients + grain |

To turn on real posters:

1. Get a TMDB key at <https://www.themoviedb.org/settings/api> (a v3 key or a v4 read token both work).
2. Put it in `.env`:

   ```
   TMDB_API_KEY=your_key_here
   ```

3. Pull the artwork:

   ```bash
   npm run posters
   ```

That writes ~140 poster URLs into `src/data/posters.json`, ranked by vote count so
you get well-known titles, then shuffled so blockbusters don't clump in row one.

The key is only ever read by `scripts/fetch-posters.mjs` on your machine — it is
never imported by the app and never reaches the browser bundle. `.env` is
gitignored; `.env.example` is the committed template.

Re-run `npm run posters` whenever you want to refresh the selection. Commit the
generated `posters.json` so builds work without a key.

## Device screen videos

The landing page shows a phone, tablet, laptop and desktop all playing real
footage. Each screen resolves its source in this order:

1. **A video file** in `src/assets/videos/` named after the slot —
   `phone`, `tablet`, `laptop`, `imac` (`.mp4` / `.webm` / `.mov`). Fully
   offline, no third party, full control.
2. **An official YouTube trailer.** `npm run posters` pulls trailer ids from
   TMDB for the most-voted titles; pin a specific one per slot in
   `src/data/screens.ts`. Publisher-uploaded and embeddable, which is how the
   mockups show actual film footage without hosting anyone's content.
3. **A TMDB backdrop still** with a slow drift, then a plain gradient.

Embeds are muted, looping, chrome-free and non-interactive. They cover-fit with
a slight overscan, because most trailers are cinemascope letterboxed inside a
16:9 upload — the black bars are baked into the video, so cropping is the only
way to remove them.

See [`src/assets/videos/README.md`](src/assets/videos/README.md) for encoding tips.

## Hero 3D objects

> **Currently dormant.** The floating objects are not rendered in the hero right
> now. Everything below still works — re-add `<FloatingObjects />` to
> `src/components/sections/Hero.tsx` to switch them back on.

Six glass objects float around the hero copy. Each ships as a hand-built CSS
object and can be replaced by a real 3D model.

Drop a `.glb` into **`src/assets/models/`** named after its slot — `orb`,
`vinyl`, `play`, `code`, `dice`, `chat` — and it takes over automatically. The
folder is globbed at build time, so there's nothing to import or register.
Anything you don't provide keeps its CSS version, so you can migrate one object
at a time.

Models are auto-centred and auto-scaled to fit a unit cube, so export scale and
origin don't matter. A corrupt file falls back to the CSS object rather than
breaking the page.

three.js lives in a lazily-imported chunk (~255 kB gzipped) that is **only
fetched once a model actually exists** — an empty folder costs nothing.

See [`src/assets/models/README.md`](src/assets/models/README.md) for export tips.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | Oxlint |
| `npm run posters` | Refresh poster artwork from TMDB |

## Structure

```
src/
  components/
    background/     PosterWall, GradientGlow, AmbientBackdrop,
                    FloatingObjects (dormant)
    devices/        Phone / Tablet / Laptop / IMac frames + DeviceScreen
    features/       DemoWindow (self-driving cursor) + the four panels
    layout/         Header (glass pill), Footer, Logo
    sections/       Hero, DeviceShowcase, FeatureShowcase, InfoSection,
                    ClosingCTA, ScrollRow
    ui/             shadcn-style Button, Card
  data/             Room types, screen pins, generated posters.json
  hooks/            usePrefersReducedMotion, useMediaQuery, useSmoothScroll
  lib/              cn(), poster generation, model + video discovery, Lenis
```

Page order: **Hero → Devices → Inside the room → Room types → Closing CTA → Footer.**

Below the hero there is no per-section background. One fixed `AmbientBackdrop`
sits behind the whole page: three repeating gradient tiles flowing up-and-right
at ~52°. Each tile translates by exactly its own size, which is what makes the
loop seamless; all three share a 1 : 1.3 aspect so they hold the same heading
while their different sizes give them different speeds.

The background layers are content-free and prop-driven so the room shell can
reuse them later — `ClosingCTA` already re-mounts `PosterWall` and `GradientGlow`
at lower intensity.

## Design notes

**Tokens.** Palette, type, radii, easing and the idle-animation keyframes are all
defined once in the `@theme` block in `src/index.css`.

**Surfaces carry no colour.** The surface scale is pure neutral dark — `#000000`
up through `#2a2a2e`, no cast. All colour comes from two places: the ambient
gradients (`--color-red` `#ff0000` low-left, `--color-glow-cool` high-right) and
the accent.

**The accent is load-bearing.** `--color-signal` is red, reserved for live/synced
state only: presence dots, the shared playhead, live cursors, the demo cursor's
click ring, hover and focus glow. Use `--color-signal-bright` for red *text* —
pure `#ff0000` fails contrast at small sizes. Primary CTAs stay white on purpose,
the way a streaming app's play button is.

**Scrolling.** Lenis drives the real window scroll each frame, so Framer Motion's
`useScroll` and every parallax transform stay in sync with it for free. The hero
moves three layers at three speeds; the device row moves its four devices at
four speeds. The header contracts from a bare wordmark into a glass capsule past
40px of scroll.

**The demo windows drive themselves.** Each `DemoWindow` parks its cursor out in
the content area until it becomes the screen being read, then walks it to its own
sidebar item over 760ms and clicks. Device screens size their mock UI in `cqw`
against a container query, so the chrome scales with the frame instead of being
fixed px.

**The feature section is a sticky stack.** The left column holds all four
screens pinned in a `100vh` sticky box; the right column is four full-height
copy blocks that scroll normally past it. Each screen rises from below into
place as its copy arrives, then scales back and dims as the next one covers it.

Three things there are easy to get wrong:

- **The cards must be opaque.** They sit directly on top of each other, so any
  translucency lets the one underneath read through — two URL bars, two
  sidebars. `screen-panel` fakes the glass with an edge highlight and a sheen
  instead, and carries no `backdrop-filter`; four stacked full-size blur layers
  is what made the scroll chug.
- **Progress is measured live**, via `useSectionProgress`, not
  `useScroll({ target })`. That caches the element's position on mount and only
  refreshes on window resize, so the device section above growing after mount
  (lazy images, video embeds) leaves the cache wrong and progress sticks at a
  constant forever. The hook re-measures on resize *and* on any document size
  change.
- Four full-height blocks means the first is centred at progress `0` and the
  last at progress `1`, so steps land on `TOTAL - 1` divisions, not `TOTAL`.

An incoming card is held at `opacity: 0` until it starts climbing — otherwise it
sits parked just below the stack in plain view. The receding card is dimmed with
a black overlay rather than a `filter`, which would repaint the whole subtree
every frame.

Below `lg` — and under reduced motion — it drops the pinning entirely and stacks
the four screens down the page, because a sticky viewport can't fit a window and
its copy at once.

**Reduced motion.** `prefers-reduced-motion: reduce` disables the CSS loops,
gates the Framer ones, skips Lenis entirely (native scrolling is the accessible
default), and unstacks the feature section. Layers that animate `filter` and
`opacity` carry those values as inline base styles, so the fallback is a composed
still frame rather than a half-finished animation.
