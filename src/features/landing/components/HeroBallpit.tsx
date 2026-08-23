import { Suspense, lazy, useEffect, useState } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/**
 * The pit of spheres behind the hero.
 *
 * Lazily imported, because it is the only thing on the landing page that wants
 * three.js. Loading it eagerly would put a 3D engine in front of the first
 * paint of a page whose whole job is to be read — so the words arrive first
 * and the spheres drop in behind them a moment later.
 */
const Ballpit = lazy(() => import('@/vendor/Ballpit'))

/**
 * How many spheres to simulate.
 *
 * Collisions are checked pair by pair, so the cost is the square of this
 * number rather than proportional to it — doubling the count is four times the
 * work per frame. A phone gets a third of what a desktop does, which is the
 * difference between a decoration and a hot device.
 */
/**
 * Whether this browser can actually give us a 3D context.
 *
 * Not a formality. WebGL is refused outright by some privacy settings, by
 * drivers on a blocklist, and by machines that have simply run out of
 * contexts — and three's renderer does not fail softly when it happens: it
 * reads properties off a context that is null and throws, which took the whole
 * landing page down to an error boundary. A page whose job is to explain the
 * product cannot be contingent on a decoration behind it.
 */
function canRender3D() {
  try {
    const probe = document.createElement('canvas')
    const gl =
      probe.getContext('webgl2') ??
      probe.getContext('webgl') ??
      probe.getContext('experimental-webgl')
    if (!gl) return false
    /* Hand the context straight back; holding it would spend one of the few
       the browser allows for the sake of a yes/no answer. */
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

function countFor(width: number) {
  if (width < 640) return 60
  if (width < 1024) return 110
  return 180
}

export function HeroBallpit({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion()

  /*
   * Mounted only after the first paint, and only where 3D is possible.
   *
   * Deferring it keeps a 3D engine off the critical path of a page whose job
   * is to be read; the check keeps a decoration from being able to take the
   * page down with it.
   */
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    if (canRender3D()) setSupported(true)
  }, [])

  const [count, setCount] = useState(() =>
    typeof window === 'undefined' ? 110 : countFor(window.innerWidth),
  )
  useEffect(() => {
    const onResize = () => setCount(countFor(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* Motion is the entire content here — there is no still version of a pit of
     falling spheres worth showing, so it simply does not run. */
  if (reduced || !supported) return null

  return (
    <div
      className={cn('pointer-events-none', className)}
      aria-hidden
      /* Faded out toward the bottom, so the pit dissolves into the page
         instead of ending on a line. A mask rather than a gradient laid over
         it: an overlay has to be painted some colour, and any colour that is
         not exactly what sits behind it draws the very edge being removed. */
      style={{
        maskImage: 'linear-gradient(to bottom, #000 0%, #000 52%, transparent 92%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 52%, transparent 92%)',
      }}
    >
      <Suspense fallback={null}>
        {/* Pointer events on the canvas itself, so the spheres answer the
            cursor while the layer as a whole stays out of the way of the
            links sitting on top of it. */}
        <div className="pointer-events-auto size-full">
          <Ballpit
            count={count}
            gravity={0.6}
            friction={0.9975}
            wallBounce={0.92}
            followCursor
            /* The app's own red, falling away to the near-black the rest of
               the page is printed on — so the pit reads as this product's
               rather than as the component's default. */
            colors={[0xff3b3b, 0x8f0000, 0x141418, 0x0a0a0d]}
            ambientColor={0xffffff}
            ambientIntensity={0.6}
            lightIntensity={160}
            minSize={0.4}
            maxSize={1}
            maxVelocity={0.14}
          />
        </div>
      </Suspense>
    </div>
  )
}
