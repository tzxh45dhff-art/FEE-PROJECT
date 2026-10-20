import { cn } from '@/lib/utils'

/** A row of number choices — rounds, seconds — for a game's setup screen. */
export function Segmented({
  label,
  values,
  value,
  onChange,
  format = String,
}: {
  label: string
  values: number[]
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist">{label}</span>
      <div className="flex gap-1 rounded-full bg-white/[0.06] p-1" role="radiogroup" aria-label={label}>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={cn(
              'min-w-14 rounded-full px-4 py-1.5 text-[0.85rem] font-semibold tabular-nums outline-none transition-colors focus-visible:outline-2 focus-visible:outline-signal',
              value === v ? 'bg-chalk text-void' : 'text-mist hover:text-chalk',
            )}
          >
            {format(v)}
          </button>
        ))}
      </div>
    </div>
  )
}
