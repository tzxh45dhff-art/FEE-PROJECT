import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Apple TV-style horizontal card rail.
 *
 * Scroll-snapped and keyboard reachable; hovering or focusing one card dims
 * its neighbours so the active card carries the row. The generous vertical
 * padding is load-bearing — it's the room the cards lift and glow into.
 */
export function ScrollRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'scrollbar-none mask-edges-x flex snap-x snap-mandatory gap-4 overflow-x-auto',
        'scroll-px-6 px-6 pb-14 pt-8 md:scroll-px-10 md:gap-5 md:px-10 md:[--mask-edge:2.5rem]',
        '[&:hover>*:not(:hover)]:opacity-50 [&:focus-within>*:not(:focus-within)]:opacity-50',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Small caps label that opens each section. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'font-sans text-xs font-medium uppercase tracking-[0.22em] text-dusk',
        className,
      )}
    >
      {children}
    </p>
  )
}
