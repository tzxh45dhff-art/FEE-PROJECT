import { useEffect, useRef } from 'react'

import { useLiquidLens } from '@/hooks/useLiquidLens'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * A droplet of real glass in place of the pointer.
 *
 * The droplet is a liquidGL lens, so it refracts an actual photograph of the
 * page rather than blending with it — text bends and splits into colour as it
 * passes underneath. That's something neither a canvas overlay nor
 * `backdrop-filter` can do, because both only see the composited result.
 *
 * A lens is `pointer-events: none` by definition, which is exactly right here.
 * Everything moves by transform inside one rAF loop, so React never re-renders
 * while the cursor is in motion.
 */

const TRAIL = 5
/** How hard each bead chases the one ahead. Lower = longer tail. */
const CHASE = 0.28

export function LiquidCursor() {
  const dropRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement[]>([])
  const reduced = usePrefersReducedMotion()

  /* High refraction and aberration: this is a ball lens, not a flat pane, so
     it should bend hard and split colour at the rim. */
  useLiquidLens(dropRef, {
    refraction: 0.09,
    aberration: 3.2,
    bevelDepth: 0.16,
    bevelWidth: 0.35,
    specular: true,
    shadow: false,
    magnify: 1.12,
    reveal: 'none',
  } as never)

  useEffect(() => {
    // Touch has no hover state, so a follower would be a permanent stray dot.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const drop = dropRef.current
    if (!drop) return

    const target = { x: -300, y: -300 }
    const points = Array.from({ length: TRAIL + 1 }, () => ({ x: -300, y: -300 }))

    let frame = 0
    let scale = 1
    let wanted = 1
    let visible = false

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      target.x = event.clientX
      target.y = event.clientY

      if (!visible) {
        visible = true
        drop.style.opacity = '1'
      }

      /* Intent is read off the DOM, so any element opts in with an attribute
         instead of every card wiring up its own listeners. */
      const element = document.elementFromPoint(event.clientX, event.clientY)
      const flag = element?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor
      const interactive = element?.closest('a, button, [role="button"]')

      wanted = flag === 'card' || interactive ? 2.4 : flag === 'text' ? 1.5 : 1
    }

    const onLeave = () => {
      visible = false
      drop.style.opacity = '0'
    }

    const tick = () => {
      points[0]!.x += (target.x - points[0]!.x) * 0.42
      points[0]!.y += (target.y - points[0]!.y) * 0.42
      for (let i = 1; i < points.length; i += 1) {
        points[i]!.x += (points[i - 1]!.x - points[i]!.x) * CHASE
        points[i]!.y += (points[i - 1]!.y - points[i]!.y) * CHASE
      }

      scale += (wanted - scale) * 0.14

      const head = points[0]!
      drop.style.transform = `translate3d(${head.x}px, ${head.y}px, 0) translate(-50%, -50%) scale(${scale})`

      /* Beads are plain translucent dots. Making each one a lens would mean six
         more full-screen shader passes every frame for a detail nobody reads. */
      for (let i = 0; i < TRAIL; i += 1) {
        const bead = trailRef.current[i]
        const point = points[i + 1]
        if (!bead || !point) continue
        const fade = 1 - i / TRAIL
        bead.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) scale(${fade * scale * 0.7})`
        bead.style.opacity = visible ? `${fade * 0.22}` : '0'
      }

      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.documentElement.classList.add('liquid-cursor')
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.documentElement.classList.remove('liquid-cursor')
    }
  }, [reduced])

  // Reduced motion keeps the system cursor and renders nothing.
  if (reduced) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[120]">
      {Array.from({ length: TRAIL }, (_, index) => (
        <div
          key={index}
          ref={(node) => {
            if (node) trailRef.current[index] = node
          }}
          className="absolute left-0 top-0 size-6 rounded-full bg-white/70 opacity-0 blur-[3px] will-change-transform"
        />
      ))}

      {/*
        liquidGL strips this element's background and paints the glass beneath
        it, so it carries no styling of its own beyond size and shape.
      */}
      <div
        ref={dropRef}
        className="absolute left-0 top-0 size-10 rounded-full opacity-0 will-change-transform"
      />
    </div>
  )
}
