import { useEffect, useRef, useState } from 'react'
import { ListVideo, Pause, Play, SkipForward } from 'lucide-react'

import { formatTime, RATES, type WatchSnapshot } from '@/features/watch/types'
import { cn } from '@/lib/utils'

/**
 * The control bar.
 *
 * Everyone in the room gets the same controls — there is no host — so every
 * press here is a request to the server, never a local state change. The bar
 * reflects what the room decided, not what this person clicked.
 */
export function WatchControls({
  snapshot,
  position,
  duration,
  queueCount,
  queueOpen,
  onToggleQueue,
  onPlayPause,
  onSeek,
  onRate,
  onSkip,
  disabled,
}: {
  snapshot: WatchSnapshot
  position: number
  duration: number
  queueCount: number
  queueOpen: boolean
  onToggleQueue: () => void
  onPlayPause: () => void
  onSeek: (seconds: number) => void
  onRate: (rate: number) => void
  onSkip: () => void
  disabled: boolean
}) {
  /* While a scrub is in progress the bar shows the finger, not the room —
     otherwise incoming snapshots would drag the thumb out from under it. */
  const [scrubbing, setScrubbing] = useState<number | null>(null)
  const [rateOpen, setRateOpen] = useState(false)
  const rateMenu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rateOpen) return
    const onAway = (event: MouseEvent) => {
      if (!rateMenu.current?.contains(event.target as Node)) setRateOpen(false)
    }
    window.addEventListener('mousedown', onAway)
    return () => window.removeEventListener('mousedown', onAway)
  }, [rateOpen])

  const shown = scrubbing ?? position
  const known = duration > 0
  const progress = known ? Math.min(100, (shown / duration) * 100) : 0

  return (
    <div className="pointer-events-auto flex flex-col gap-2 bg-gradient-to-t from-void via-void/85 to-transparent px-4 pb-4 pt-10 md:px-6 md:pb-5">
      <div className="flex items-center gap-3">
        <span className="w-14 shrink-0 text-right font-mono text-[0.72rem] tabular-nums text-mist">
          {formatTime(shown)}
        </span>

        <div className="relative flex h-6 flex-1 items-center">
          <div className="absolute inset-x-0 h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-signal transition-[width] duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={known ? duration : 100}
            step={0.1}
            value={shown}
            disabled={disabled || !known}
            aria-label="Seek"
            onChange={(event) => setScrubbing(Number(event.target.value))}
            onPointerUp={() => {
              if (scrubbing !== null) onSeek(scrubbing)
              setScrubbing(null)
            }}
            onKeyUp={(event) => {
              if (scrubbing !== null && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                onSeek(scrubbing)
                setScrubbing(null)
              }
            }}
            className="absolute inset-x-0 h-6 w-full cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-default [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-chalk [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-signal)_40%,transparent)]"
          />
        </div>

        <span className="w-14 shrink-0 font-mono text-[0.72rem] tabular-nums text-dusk">
          {known ? formatTime(duration) : '--:--'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPlayPause}
          disabled={disabled}
          aria-label={snapshot.playing ? 'Pause for everyone' : 'Play for everyone'}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-chalk text-void outline-none transition-transform duration-300 ease-glass hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:scale-95 disabled:opacity-40"
        >
          {snapshot.playing ? (
            <Pause aria-hidden className="size-5 fill-current" />
          ) : (
            <Play aria-hidden className="size-5 translate-x-px fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={disabled || queueCount === 0}
          aria-label="Skip to next"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-chalk outline-none transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-35"
        >
          <SkipForward aria-hidden className="size-4" />
        </button>

        <div className="min-w-0 flex-1 px-2">
          <p className="truncate text-[0.85rem] font-medium text-chalk">
            {snapshot.item?.title ?? 'Nothing playing'}
          </p>
        </div>

        <div ref={rateMenu} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setRateOpen((open) => !open)}
            disabled={disabled}
            aria-label="Playback speed"
            className="h-10 rounded-full border border-white/12 bg-white/[0.05] px-3.5 font-mono text-[0.78rem] text-chalk outline-none transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-35"
          >
            {snapshot.rate}×
          </button>

          {rateOpen && (
            <div className="glass-pill-ink absolute bottom-12 right-0 flex flex-col gap-0.5 rounded-card p-1.5">
              {RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    onRate(rate)
                    setRateOpen(false)
                  }}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-left font-mono text-[0.78rem] transition-colors duration-200',
                    rate === snapshot.rate
                      ? 'bg-signal/20 text-chalk'
                      : 'text-mist hover:bg-white/[0.08] hover:text-chalk',
                  )}
                >
                  {rate}×
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleQueue}
          aria-label="Queue"
          aria-pressed={queueOpen}
          className={cn(
            'flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 outline-none transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
            queueOpen
              ? 'border-signal/50 bg-signal/15 text-chalk'
              : 'border-white/12 bg-white/[0.05] text-chalk hover:border-white/30 hover:bg-white/[0.1]',
          )}
        >
          <ListVideo aria-hidden className="size-4" />
          <span className="text-[0.78rem] tabular-nums">{queueCount}</span>
        </button>
      </div>
    </div>
  )
}
