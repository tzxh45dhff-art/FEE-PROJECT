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
  const base = palette?.base ?? 'color-mix(in oklab, var(--color-signal) 26%, black)'
  const accent = palette?.accent ?? 'color-mix(in oklab, var(--color-glow-cool) 20%, black)'

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
      {/*
        The blooms are soft because the gradients are, not because of a blur
        filter. A blurred layer half again the size of the screen, animated,
        is the single most expensive thing a phone can be asked to draw — on
        a foldable it ran the GPU out of tile memory and parts of the player
        (half the record, the title, the play button) simply never painted.
        A wide radial falloff looks the same and costs nothing.
      */}
      <div
        className={cn('absolute -inset-[30%] will-change-transform', translucent ? 'opacity-45' : 'opacity-90')}
        style={{
          background: `radial-gradient(46% 50% at 32% 34%, ${base}, color-mix(in oklab, ${base} 45%, transparent) 38%, transparent 78%)`,
          animation: 'music-drift 26s ease-in-out infinite',
        }}
      />
      <div
        className={cn('absolute -inset-[30%] will-change-transform', translucent ? 'opacity-40' : 'opacity-80')}
        style={{
          background: `radial-gradient(50% 46% at 68% 66%, ${accent}, color-mix(in oklab, ${accent} 45%, transparent) 40%, transparent 80%)`,
          /* Offset and reversed so the two never travel as one shape. */
          animation: 'music-drift 34s ease-in-out infinite reverse',
        }}
      />

      {/* Grain and a vignette, the same finish the rest of the app uses — they
          are what stop a large soft gradient from banding on a dark screen. */}
      {/* Not on touch screens: a full-screen blend layer is another whole
          composite pass, and on a phone's display the banding it hides is
          invisible anyway. */}
      <div className="grain absolute inset-0 opacity-[0.14] mix-blend-overlay [@media(pointer:coarse)]:hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_45%,rgba(0,0,0,0.72))]" />
    </div>
  )
}
