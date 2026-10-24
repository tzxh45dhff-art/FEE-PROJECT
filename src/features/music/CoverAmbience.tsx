import { cn } from '@/lib/utils'
import type { CoverPalette } from '@/features/music/useCoverPalette'

/**
 * The page's background, taken from the record on it.
 *
 * Two drifting blooms in the cover's own colours, over a dark ground. The
 * ground matters: the palette is pinned into a narrow dark band precisely so
 * that white text stays readable over it no matter what the artwork is — a
 * bright cover has to become a deep wash rather than a bright page.
 *
 * Falls back to the app's own glow when there is no cover, or when the
 * artwork's host would not let us read its pixels. The page is never left
 * flat, and it never invents a colour it did not actually sample.
 */
const WASH = 'absolute left-1/2 top-1/2 bg-cover bg-center will-change-transform'

/**
 * A square of the cover, centred, `vmax` across.
 *
 * Square so the whole sleeve is in it rather than a strip cropped to the
 * screen's shape; larger than the screen so its edges never drift into
 * view. Centred by margin, because `transform` belongs to
 * the animation.
 */
const square = (vmax: number) => ({
  width: `${vmax}vmax`,
  height: `${vmax}vmax`,
  marginLeft: `-${vmax / 2}vmax`,
  marginTop: `-${vmax / 2}vmax`,
})

export function CoverAmbience({
  palette,
  translucent = false,
}: {
  palette: CoverPalette | null
  /**
   * Let the room behind show through, blurred.
   *
   * Used while somebody is choosing what to put on, not while it is playing.
   * Browsing is a step on the way somewhere, and keeping the room dimly
   * visible underneath says the stage is sitting *over* it rather than having
   * replaced it — so closing this returns you somewhere you can still see.
   * Once something is actually playing the backdrop goes solid, because then
   * the picture is the point and anything behind it is a distraction.
   */
  translucent?: boolean
}) {
  /* The app's signal red, in the same shape as a sampled palette, so both
     paths render through identical markup. */
  const base = palette?.base ?? 'color-mix(in oklab, var(--color-signal) 55%, black)'
  const accent = palette?.accent ?? 'color-mix(in oklab, var(--color-glow-cool) 45%, black)'
  const glow = palette?.glow ?? 'color-mix(in oklab, var(--color-signal) 35%, var(--color-glow-cool))'

  const bloom = (colour: string, size: string, at: string) =>
    `radial-gradient(${size} at ${at}, ${colour}, color-mix(in oklab, ${colour} 50%, transparent) 36%, transparent 74%)`

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        translucent
          ? /* Dark enough to hold white text against whatever backdrop the
               room happens to be wearing, blurred enough that none of it
               competes for attention. */
            'bg-void/80 backdrop-blur-xl [@media(pointer:coarse)]:bg-void/88 [@media(pointer:coarse)]:backdrop-blur-md'
          : 'bg-void',
      )}
    >
      {palette?.wash ? (
        <>
          {/*
            The cover itself, as light. Two copies of the blurred art drifting
            slowly against each other, so its colours sit around the page the
            way they sit on the sleeve — the red stays where the red is.
            Moving a composited layer is free; the blur was paid for once,
            when the wash was made.
          */}
          <div
            className={cn(WASH, translucent ? 'opacity-35' : 'opacity-100')}
            style={{
              ...square(118),
              backgroundImage: `url(${palette.wash})`,
              animation: 'music-swirl 40s ease-in-out infinite',
            }}
          />
          <div
            className={cn(WASH, translucent ? 'opacity-20' : 'opacity-55')}
            style={{
              ...square(80),
              backgroundImage: `url(${palette.wash})`,
              /* Out of step with the first, so the two never move as one. */
              animation: 'music-swirl 29s ease-in-out -9s infinite reverse',
              maskImage: 'radial-gradient(closest-side, black 40%, transparent)',
              WebkitMaskImage: 'radial-gradient(closest-side, black 40%, transparent)',
            }}
          />
          {/* Held down a little so white text reads on any cover. */}
          <div className="absolute inset-0 bg-black/20" />
        </>
      ) : (
        <>
          {/*
            No readable cover: blooms in the app's own colours instead. Soft
            because the gradients are, not because of a blur filter — see the
            note on the wash above.
          */}
          <div
            className={cn('absolute -inset-[30%] will-change-transform', translucent ? 'opacity-50' : 'opacity-100')}
            style={{
              background: bloom(base, '48% 52%', '30% 32%'),
              animation: 'music-drift 26s ease-in-out infinite',
            }}
          />
          <div
            className={cn('absolute -inset-[30%] will-change-transform', translucent ? 'opacity-45' : 'opacity-95')}
            style={{
              background: bloom(accent, '52% 48%', '70% 68%'),
              /* Offset and reversed so the blooms never travel as one shape. */
              animation: 'music-drift 34s ease-in-out infinite reverse',
            }}
          />
          <div
            className={cn('absolute -inset-[30%] will-change-transform mix-blend-screen', translucent ? 'opacity-30' : 'opacity-70')}
            style={{
              background: bloom(glow, '34% 36%', '72% 26%'),
              animation: 'music-drift 41s ease-in-out -12s infinite',
            }}
          />
        </>
      )}

      {/* Grain, the same finish the rest of the app uses — it is what stops a
          large soft gradient from banding on a dark screen. Not on touch
          screens: a full-screen blend layer is another whole composite pass,
          and on a phone's display the banding it hides is invisible anyway. */}
      <div className="grain absolute inset-0 opacity-[0.12] mix-blend-overlay [@media(pointer:coarse)]:hidden" />
      {/* A light vignette, a deeper floor where the title and controls sit, and
          a shallower one under the top bar,
          so the colour can be bright without the words losing to it. */}
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_45%,transparent_55%,rgba(0,0,0,0.55))]" />
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-black/35 to-transparent" />
    </div>
  )
}
