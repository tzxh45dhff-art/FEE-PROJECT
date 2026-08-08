import type { Variants } from 'framer-motion'

/** Long, soft deceleration — things arrive rather than stop. */
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The grow-in used when the corridor hands off. Children are staggered so the
 * page assembles itself in a readable order instead of popping as one sheet.
 */
export const revealContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.085, delayChildren: 0.12 },
  },
}

/** Bubble out of nothing: small, soft-focus and low, settling into place. */
export const revealItem: Variants = {
  hidden: { opacity: 0, scale: 0.86, y: 26, filter: 'blur(16px)' },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
}
