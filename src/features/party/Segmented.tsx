import { useId } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

/** A row of number choices — rounds, seconds — for a game's setup screen. */
export function Segmented({
  label,
  values,
  value,
  onChange,
  format = String,
  compact = false,
}: {
  label: string
  values: number[]
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  /** Inline in a settings row: no label above, smaller pills. */
  compact?: boolean
}) {
  /* Each row slides its own pill, so two rows on one screen don't swap pills. */
  const pill = useId()
  return (
    <div className={cn('flex flex-col items-center gap-2', !compact && 'mt-6')}>
      {!compact && <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist">{label}</span>}
      <div className="flex gap-1 rounded-full bg-white/[0.06] p-1 ring-1 ring-inset ring-white/[0.06]" role="radiogroup" aria-label={label}>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={cn(
              'relative rounded-full font-semibold tabular-nums outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-signal active:scale-95',
              compact ? 'min-w-10 px-3 py-1 text-[0.8rem]' : 'min-w-14 px-4 py-1.5 text-[0.85rem]',
              value === v ? 'text-void' : 'text-mist hover:text-chalk',
            )}
          >
            {value === v && (
              <motion.span
                layoutId={pill}
                aria-hidden
                className="absolute inset-0 rounded-full bg-chalk shadow-[0_4px_14px_-4px_rgba(255,255,255,.45)]"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <span className="relative">{format(v)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
