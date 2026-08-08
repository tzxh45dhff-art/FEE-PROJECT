import { useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Long-exposure streaks drifting across near-black — the landing page's surface
 * below the hero.
 *
 * Canvas 2D on purpose. A few hundred hairline strokes cost a fraction of a
 * millisecond a frame, where the same thing in SVG means the DOM re-parsing
 * path data sixty times a second.
 *
 * Everything here is deliberately quiet: nothing brighter than 45% white,
 * nothing moving faster than a few pixels a second. It should read as texture
 * you notice on the second look, never as an animation competing with copy.
 */

type Streak = {
  x: number
  y: number
  length: number
  width: number
  alpha: number
  /** Fraction of the base drift speed, so the field has depth. */
  speed: number
  /** How far the stroke bows off a straight line. */
  bow: number
}

/** Down-and-right, matching the reference. Radians. */
const ANGLE = 0.42
const DENSITY = 1 / 9000

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

export function StreakField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const random = makeRandom(0x9c21)
    let width = 0
    let height = 0
    let streaks: Streak[] = []
    let frame = 0
    let last = 0

    /* Streaks are seeded across a box larger than the viewport in both
       directions, so wrapping never exposes an edge. */
    const build = () => {
      const count = Math.round(width * height * DENSITY)
      streaks = Array.from({ length: count }, () => {
        const depth = random()
        return {
          x: random() * width * 1.6 - width * 0.3,
          y: random() * height * 1.6 - height * 0.3,
          length: 60 + depth * 320,
          width: 0.35 + depth * 1.1,
          // Nearer streaks are brighter and faster — cheap parallax.
          alpha: 0.05 + depth * 0.4,
          speed: 4 + depth * 22,
          bow: (random() - 0.5) * 46,
        }
      })
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }

    const dx = Math.cos(ANGLE)
    const dy = Math.sin(ANGLE)

    const draw = (dt: number) => {
      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      context.strokeStyle = '#ffffff'

      for (const streak of streaks) {
        if (dt > 0) {
          streak.x += dx * streak.speed * dt
          streak.y += dy * streak.speed * dt

          // Wrap generously so a streak is never cut mid-stroke on screen.
          if (streak.x > width * 1.3) {
            streak.x = -width * 0.3
            streak.y = random() * height * 1.6 - height * 0.3
          }
          if (streak.y > height * 1.3) {
            streak.y = -height * 0.3
            streak.x = random() * width * 1.6 - width * 0.3
          }
        }

        const endX = streak.x + dx * streak.length
        const endY = streak.y + dy * streak.length
        // Perpendicular offset on the control point gives the gentle bow.
        const midX = (streak.x + endX) / 2 - dy * streak.bow
        const midY = (streak.y + endY) / 2 + dx * streak.bow

        context.globalAlpha = streak.alpha
        context.lineWidth = streak.width
        context.beginPath()
        context.moveTo(streak.x, streak.y)
        context.quadraticCurveTo(midX, midY, endX, endY)
        context.stroke()
      }

      context.globalAlpha = 1
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduced) {
      draw(0)
      return () => window.removeEventListener('resize', resize)
    }

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0
      last = now
      draw(dt)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return (
    <div aria-hidden data-liquid-ignore className={className}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}
