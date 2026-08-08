import { useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * The page's canvas: warm off-white with neon linework drifting across it.
 *
 * Canvas 2D rather than SVG or WebGL. SVG means re-parsing path data every
 * frame through the DOM; WebGL means waiting on a 250 kB chunk before the
 * background exists. A handful of bezier strokes on a 2D context is a fraction
 * of a millisecond per frame and starts on the first paint.
 *
 * Each line is drawn three times — wide and faint, medium, then a bright thin
 * core. That's how you get neon on a *light* background: additive glow needs
 * darkness to bloom into, so on off-white the glow has to be pigment instead.
 */

type Line = {
  /** Control points drift independently, so the curve never repeats a shape. */
  points: { x: number; y: number; phaseX: number; phaseY: number; ampX: number; ampY: number }[]
  colour: string
  width: number
  /** Radians per second — slow enough that motion is felt, not watched. */
  speed: number
}

const PALETTE = ['--color-neon-red', '--color-neon-blue', '--color-neon-violet', '--color-neon-teal']

function readColour(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** Deterministic pseudo-random, so the composition is the same every load. */
function makeRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildLines(width: number, height: number): Line[] {
  const random = makeRandom(0x5f3a)
  const fallbacks = ['#ff1f3d', '#2b3bff', '#a01aff', '#00c2b8']

  return Array.from({ length: 7 }, (_, index) => {
    const colour = readColour(PALETTE[index % PALETTE.length]!, fallbacks[index % 4]!)
    const nodes = 5

    return {
      colour,
      width: 1.1 + random() * 1.9,
      speed: 0.05 + random() * 0.09,
      points: Array.from({ length: nodes }, (_, node) => ({
        // Spread across the viewport with a generous bleed past both edges.
        x: -0.2 * width + (node / (nodes - 1)) * 1.4 * width,
        y: height * (0.12 + random() * 0.76),
        phaseX: random() * Math.PI * 2,
        phaseY: random() * Math.PI * 2,
        ampX: width * (0.03 + random() * 0.06),
        ampY: height * (0.05 + random() * 0.12),
      })),
    }
  })
}

export function NeonFlowBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let width = 0
    let height = 0
    let lines: Line[] = []
    let frame = 0

    const resize = () => {
      // Cap DPR at 2 — beyond that the fill cost doubles for no visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      lines = buildLines(width, height)
    }

    /** One stroke of the curve at a given width and alpha. */
    const strokeCurve = (line: Line, time: number, lineWidth: number, alpha: number) => {
      context.beginPath()
      context.lineWidth = lineWidth
      context.strokeStyle = line.colour
      context.globalAlpha = alpha

      const at = (index: number) => {
        const point = line.points[index]!
        return {
          x: point.x + Math.sin(time * line.speed + point.phaseX) * point.ampX,
          y: point.y + Math.sin(time * line.speed * 0.83 + point.phaseY) * point.ampY,
        }
      }

      const first = at(0)
      context.moveTo(first.x, first.y)

      /* Catmull-Rom through the drifting points, converted to cubic beziers —
         keeps the curve smooth and passing *through* every control point. */
      for (let i = 0; i < line.points.length - 1; i += 1) {
        const p0 = at(Math.max(0, i - 1))
        const p1 = at(i)
        const p2 = at(i + 1)
        const p3 = at(Math.min(line.points.length - 1, i + 2))

        context.bezierCurveTo(
          p1.x + (p2.x - p0.x) / 6,
          p1.y + (p2.y - p0.y) / 6,
          p2.x - (p3.x - p1.x) / 6,
          p2.y - (p3.y - p1.y) / 6,
          p2.x,
          p2.y,
        )
      }

      context.stroke()
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      context.lineJoin = 'round'

      for (const line of lines) {
        // Wide + faint, medium, then the bright core. Three passes = neon.
        strokeCurve(line, time, line.width * 14, 0.05)
        strokeCurve(line, time, line.width * 5, 0.1)
        strokeCurve(line, time, line.width, 0.5)
      }

      context.globalAlpha = 1
    }

    resize()

    if (reduced) {
      // A single composed frame — the same picture, just not moving.
      draw(0)
      const onResize = () => {
        resize()
        draw(0)
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    const loop = (now: number) => {
      draw(now / 1000)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-canvas">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      {/* Softens the linework so it never competes with the dark panels. */}
      <div className="absolute inset-0 bg-canvas/35" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_65%_at_50%_45%,transparent,color-mix(in_oklab,var(--color-canvas-deep)_70%,transparent))]" />
    </div>
  )
}
