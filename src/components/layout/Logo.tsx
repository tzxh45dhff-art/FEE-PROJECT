import { cn } from '@/lib/utils'

/** Orb + orbiting dot — the same idea as the hero's glass orb, at 28px. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('relative grid size-7 shrink-0 place-items-center', className)}>
      <span className="absolute inset-0 rounded-full border border-white/15" />
      <span className="absolute inset-[26%] rounded-full bg-chalk/85" />
      <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/4 animate-signal-pulse rounded-full bg-signal" />
    </span>
  )
}
