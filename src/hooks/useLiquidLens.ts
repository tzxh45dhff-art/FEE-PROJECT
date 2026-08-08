import { useEffect, type RefObject } from 'react'

import { attachLens } from '@/lib/liquidGlass'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type LensOptions = {
  refraction?: number
  aberration?: number
  bevelDepth?: number
  bevelWidth?: number
  frost?: number
  shadow?: boolean
  specular?: boolean
  magnify?: number
  /** Skip entirely — used to keep glass off pages it can't photograph. */
  enabled?: boolean
}

/**
 * Turns a decorative element into a liquidGL lens for as long as it's mounted.
 *
 * Deliberately delayed to the next idle callback: liquidGL photographs the page
 * the first time a lens is added, and a snapshot taken mid-mount catches the
 * app half-painted. Everything below the glass has to be on screen first.
 */
export function useLiquidLens(
  ref: RefObject<HTMLElement | null>,
  { enabled = true, ...options }: LensOptions = {},
) {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled || reduced) return

    let dispose: (() => void) | null = null
    let cancelled = false

    const idle =
      window.requestIdleCallback?.(() => start(), { timeout: 1200 }) ??
      window.setTimeout(() => start(), 600)

    function start() {
      if (cancelled || !element) return
      attachLens(element, options).then((off) => {
        if (cancelled) off()
        else dispose = off
      })
    }

    return () => {
      cancelled = true
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number)
      else window.clearTimeout(idle as number)
      dispose?.()
    }
    // Options are a static config per call site; re-running on identity would
    // tear the lens down every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, enabled, reduced])
}
