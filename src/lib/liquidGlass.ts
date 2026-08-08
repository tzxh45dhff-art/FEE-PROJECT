/*
 * html2canvas-pro, not html2canvas. The original is unmaintained since 2022 and
 * throws on `oklab()` — and this design system is built on
 * `color-mix(in oklab, ...)`, so every snapshot failed outright. The fork adds
 * oklab / oklch / lab / color-mix parsing and is otherwise API-identical.
 */
import html2canvas from 'html2canvas-pro'

/**
 * Bootstrap for the vendored liquidGL.
 *
 * The library is a vanilla IIFE that expects two globals and a page that has
 * already painted. This module supplies both, and adds the teardown it doesn't
 * ship — liquidGL keeps a single renderer on `window` and has no way to remove
 * a lens, which leaks on every route change in an SPA.
 */

type LiquidLens = {
  el: HTMLElement
  _shadowEl?: HTMLElement | null
  _sizeObs?: ResizeObserver
  updateMetrics: () => void
}

type LiquidRenderer = {
  lenses: LiquidLens[]
  texture: unknown
  captureSnapshot: () => Promise<boolean | undefined>
  render: () => void
  addDynamicElement: (el: Element | NodeList | string) => void
}

type LiquidOptions = {
  target: string
  snapshot?: string
  resolution?: number
  refraction?: number
  aberration?: number
  bevelDepth?: number
  bevelWidth?: number
  frost?: number
  shadow?: boolean
  specular?: boolean
  reveal?: 'fade' | 'none'
  tilt?: boolean
  tiltFactor?: number
  magnify?: number
}

declare global {
  interface Window {
    html2canvas?: typeof html2canvas
    liquidGL?: (options: LiquidOptions) => LiquidLens | LiquidLens[] | undefined
    __liquidGLRenderer__?: LiquidRenderer
  }
}

let loaded: Promise<void> | null = null

/** Loads the vendored library exactly once, after wiring up its globals. */
function load() {
  if (!loaded) {
    window.html2canvas = html2canvas
    loaded = import('@/vendor/liquidGL.js').then(() => undefined)
  }
  return loaded
}

export function getRenderer() {
  return window.__liquidGLRenderer__
}

/**
 * Attaches a lens to one element and returns a disposer.
 *
 * Note what liquidGL does to the element: it strips the background and sets
 * `pointer-events: none`. So a lens is always a *decorative* layer — anything
 * interactive has to be a sibling sitting on top of it, never a child.
 */
export async function attachLens(
  element: HTMLElement,
  options: Omit<LiquidOptions, 'target'> = {},
): Promise<() => void> {
  await load()
  if (!window.liquidGL) return () => {}

  /* liquidGL only selects by CSS selector, so the element is tagged with a
     unique attribute and targeted through that. */
  const id = `lg-${Math.random().toString(36).slice(2, 9)}`
  element.setAttribute('data-lg-id', id)

  const result = window.liquidGL({ target: `[data-lg-id="${id}"]`, ...options })
  const lens = Array.isArray(result) ? result[0] : result
  if (!lens) return () => {}

  return () => {
    const renderer = window.__liquidGLRenderer__
    if (renderer) {
      renderer.lenses = renderer.lenses.filter((entry) => entry !== lens)
    }
    lens._shadowEl?.remove()
    lens._sizeObs?.disconnect()
    element.removeAttribute('data-lg-id')
  }
}

/**
 * Re-photographs the page. Needed after anything that changes layout below the
 * glass — a route change, or content finishing its entrance animation.
 */
export function recapture() {
  window.__liquidGLRenderer__?.captureSnapshot()
}
