import { useEffect, useRef, type RefObject } from 'react'
import { useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion'

/**
 * Scroll progress through a section, 0 at the moment its top reaches the top of
 * the viewport and 1 when its bottom reaches the bottom.
 *
 * This exists instead of `useScroll({ target })` because that caches the
 * element's position when it first measures and only refreshes on window
 * resize. Anything above the section that grows *after* mount — lazily loaded
 * images, video embeds, a webfont swap — leaves the cache wrong, and the
 * symptom is brutal: progress sticks at a constant and nothing driven by it
 * ever moves again.
 *
 * Here the measurement is cached too (reading layout on every scroll event is
 * a forced reflow) but it is refreshed on resize *and* whenever the document
 * itself changes size, which is what actually catches late layout shifts.
 */
export function useSectionProgress(ref: RefObject<HTMLElement | null>) {
  const { scrollY } = useScroll()
  const progress = useMotionValue(0)
  const metrics = useRef({ top: 0, range: 1 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      const top = element.getBoundingClientRect().top + window.scrollY
      const range = Math.max(1, element.offsetHeight - window.innerHeight)
      metrics.current = { top, range }

      // Re-derive immediately so a resize doesn't wait for the next scroll.
      const raw = (window.scrollY - top) / range
      progress.set(Math.min(1, Math.max(0, raw)))
    }

    measure()

    window.addEventListener('resize', measure)
    const observer = new ResizeObserver(measure)
    observer.observe(document.documentElement)

    return () => {
      window.removeEventListener('resize', measure)
      observer.disconnect()
    }
  }, [ref, progress])

  useMotionValueEvent(scrollY, 'change', (y) => {
    const { top, range } = metrics.current
    const raw = (y - top) / range
    progress.set(Math.min(1, Math.max(0, raw)))
  })

  return progress
}
