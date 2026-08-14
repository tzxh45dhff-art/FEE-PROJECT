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
export function CoverAmbience({ palette }: { palette: CoverPalette | null }) {
  /* The app's signal red, in the same shape as a sampled palette, so both
     paths render through identical markup. */
  const base = palette?.base ?? 'color-mix(in oklab, var(--color-signal) 26%, black)'
  const accent = palette?.accent ?? 'color-mix(in oklab, var(--color-glow-cool) 20%, black)'

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-void">
      <div
        className="absolute -inset-[30%] opacity-90 blur-[80px]"
        style={{
          background: `radial-gradient(38% 42% at 32% 34%, ${base}, transparent 70%)`,
          animation: 'music-drift 26s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -inset-[30%] opacity-80 blur-[90px]"
        style={{
          background: `radial-gradient(42% 38% at 68% 66%, ${accent}, transparent 72%)`,
          /* Offset and reversed so the two never travel as one shape. */
          animation: 'music-drift 34s ease-in-out infinite reverse',
        }}
      />

      {/* Grain and a vignette, the same finish the rest of the app uses — they
          are what stop a large soft gradient from banding on a dark screen. */}
      <div className="grain absolute inset-0 opacity-[0.14] mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_45%,rgba(0,0,0,0.72))]" />
    </div>
  )
}
