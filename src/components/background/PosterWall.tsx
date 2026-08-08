import { useMemo } from 'react'

import { buildPosterRows, type Poster } from '@/lib/posters'
import { cn, type CSSVars } from '@/lib/utils'

const GAP = 14

/**
 * A single poster tile.
 *
 * The CSS grade sits underneath as the base layer; when TMDB art is available
 * it covers it. If an image 404s the alt-less `img` collapses and the grade
 * shows through, so the wall degrades quietly rather than punching holes.
 */
function PosterCard({ poster, height }: { poster: Poster; height: number }) {
  const { grade, angle, lightX, lightY, intensity, shape, shapeX, shapeY, shapeScale, imageSrc } =
    poster
  const width = Math.round((height * 2) / 3)
  const washAlpha = Math.round(intensity * 135)
    .toString(16)
    .padStart(2, '0')

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-poster ring-1 ring-inset ring-white/[0.06]"
      style={{
        width,
        height,
        marginRight: GAP,
        backgroundImage: [
          `radial-gradient(115% 85% at ${lightX}% ${lightY}%, ${grade.glow}${washAlpha}, transparent 62%)`,
          `linear-gradient(${angle}deg, ${grade.base}, ${grade.mid})`,
        ].join(', '),
      }}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          width={width}
          height={height}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {!imageSrc && shape === 'streak' && (
        <div
          className="absolute inset-x-0 h-[7%] blur-[7px]"
          style={{
            top: `${shapeY}%`,
            transform: `scaleY(${shapeScale})`,
            backgroundImage: `linear-gradient(90deg, transparent, ${grade.glow}80, transparent)`,
          }}
        />
      )}
      {!imageSrc && shape === 'halo' && (
        <div
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full blur-[12px]"
          style={{
            left: `${shapeX}%`,
            top: `${shapeY}%`,
            width: `${Math.round(46 * shapeScale)}%`,
            backgroundImage: `radial-gradient(circle, ${grade.glow}66, transparent 70%)`,
          }}
        />
      )}
      {!imageSrc && shape === 'arc' && (
        <div
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border blur-[2px]"
          style={{
            left: `${shapeX}%`,
            top: `${shapeY}%`,
            width: `${Math.round(70 * shapeScale)}%`,
            borderColor: `${grade.glow}40`,
          }}
        />
      )}

      {/* Scrim + grain sit above the artwork so real posters get the same
          filmic grade as the CSS ones and stay behind the foreground copy. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />
      <div className="grain absolute inset-0 opacity-[0.14] mix-blend-overlay" />
    </div>
  )
}

type PosterWallProps = {
  /** Number of marquee rows. 5 fills a hero; 3 is enough for a shorter band. */
  rows?: number
  postersPerRow?: number
  /** Where this wall starts dealing from the shared poster deck. */
  deckOffset?: number
  /** Opacity of the whole wall. Kept low — this layer is atmosphere, not content. */
  dim?: number
  /** Radial + vertical scrim that keeps foreground copy readable. */
  vignette?: boolean
  className?: string
}

/**
 * Background wall of poster-shaped cards in staggered rows, each row an
 * infinite marquee drifting the opposite way to its neighbours.
 *
 * Reused later by the room shell, so it takes no content of its own.
 */
export function PosterWall({
  rows = 5,
  postersPerRow = 18,
  deckOffset = 0,
  dim = 0.5,
  vignette = true,
  className,
}: PosterWallProps) {
  const posterRows = useMemo(
    () => buildPosterRows(rows, postersPerRow, deckOffset),
    [rows, postersPerRow, deckOffset],
  )

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div
        className="absolute inset-0 flex origin-center scale-[0.72] flex-col justify-center gap-3 blur-[1px] sm:scale-90 md:scale-110 md:gap-4"
        style={{ opacity: dim }}
      >
        {posterRows.map((row) => (
          <div key={row.index} className="flex w-max" style={{ marginLeft: row.offset }}>
            {/* Two identical copies; the track shifts by exactly one copy width. */}
            <div
              className="marquee-track flex w-max animate-marquee"
              style={
                {
                  '--marquee-duration': `${row.duration}s`,
                  animationDirection: row.reverse ? 'reverse' : 'normal',
                } as CSSVars
              }
            >
              <div className="flex">
                {row.posters.map((poster) => (
                  <PosterCard key={poster.id} poster={poster} height={row.height} />
                ))}
              </div>
              <div className="flex" aria-hidden>
                {row.posters.map((poster) => (
                  <PosterCard key={`${poster.id}-echo`} poster={poster} height={row.height} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {vignette && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(72%_58%_at_50%_46%,rgb(2_3_14/0.72),rgb(2_3_14/0.3)_60%,transparent_90%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void" />
        </>
      )}
    </div>
  )
}
