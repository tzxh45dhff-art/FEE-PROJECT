/**
 * The page's resting background below the hero: a slow mesh of red and blue
 * light flowing up-and-right at about 52°.
 *
 * Fixed rather than absolute so the field is present the whole way down. Each
 * layer is a repeating gradient tile on an oversized element, translated by
 * exactly one tile, which makes the loop seamless — see the `mesh-drift-*`
 * keyframes in index.css.
 */

type Layer = {
  animation: string
  /** Tile size. All tiles are 1 : 1.3 so every layer travels the same heading. */
  size: string
  image: string
  opacity: string
}

const LAYERS: Layer[] = [
  {
    animation: 'animate-mesh-a',
    size: '50vw 65vw',
    image:
      'radial-gradient(circle at 30% 62%, color-mix(in oklab, var(--color-red) 62%, transparent), transparent 52%)',
    opacity: 'opacity-[0.75]',
  },
  {
    animation: 'animate-mesh-b',
    size: '76vw 98.8vw',
    image:
      'radial-gradient(circle at 68% 34%, color-mix(in oklab, var(--color-glow-cool) 72%, transparent), transparent 54%)',
    opacity: 'opacity-[0.8]',
  },
  {
    animation: 'animate-mesh-c',
    size: '112vw 145.6vw',
    image:
      'radial-gradient(circle at 45% 55%, color-mix(in oklab, var(--color-glow-violet) 50%, transparent), transparent 50%)',
    opacity: 'opacity-[0.6]',
  },
]

export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      {LAYERS.map((layer) => (
        <div
          key={layer.animation}
          /* -inset-[100%] makes the element 3× the viewport, so it always
             covers even at the far end of its travel. */
          className={`absolute -inset-[100%] blur-[70px] ${layer.animation} ${layer.opacity}`}
          style={{
            backgroundImage: layer.image,
            backgroundSize: layer.size,
            backgroundRepeat: 'repeat',
          }}
        />
      ))}

      {/* Holds the centre column dark enough for body copy, while the corners
          keep their colour. Kept light — any flat overlay on top of this kills
          the whole effect. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_50%,color-mix(in_oklab,var(--color-void)_78%,transparent),transparent_72%)]" />
    </div>
  )
}
