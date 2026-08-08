import { useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * How fast the page is moving, not just where it is.
 *
 * Position-linked parallax alone reads as mechanical — flicking the wheel and
 * easing it look identical. Feeding velocity into a small skew makes the two
 * feel physically different, which is most of what "smooth" actually means.
 *
 * Spring-damped so it decays instead of snapping back the instant scrolling
 * stops, and clamped tight: past about 3° this stops looking like momentum and
 * starts looking like a rendering bug.
 */
export function useScrollVelocity(maxSkew = 2.4) {
  const reduced = usePrefersReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)

  const smooth = useSpring(velocity, { stiffness: 240, damping: 46, mass: 0.35 })
  const skewY = useTransform(smooth, [-2600, 0, 2600], [maxSkew, 0, -maxSkew], { clamp: true })

  return reduced ? undefined : skewY
}
