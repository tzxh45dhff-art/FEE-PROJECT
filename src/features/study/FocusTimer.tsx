import { useEffect, useState } from 'react'
import { Coffee, Pause, Play, RotateCcw, SkipForward } from 'lucide-react'

import type { TimerPhase, useStudyTimer } from '@/features/study/useStudyTimer'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/**
 * The room's focus timer.
 *
 * The one part of Study that is genuinely live, and the one place the signal
 * accent belongs: a running countdown is exactly the shared state the palette
 * reserves red for, the same as a playhead or a presence dot.
 */

const PHASE_LABEL: Record<TimerPhase, string> = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
}

const PRESETS: { label: string; durations: Partial<Record<TimerPhase, number>> }[] = [
  { label: '25 / 5', durations: { focus: 25 * 60, short: 5 * 60 } },
  { label: '50 / 10', durations: { focus: 50 * 60, short: 10 * 60 } },
  { label: '90 / 20', durations: { focus: 90 * 60, short: 20 * 60 } },
]

function clock(seconds: number) {
  const whole = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(whole / 60)
  return `${String(minutes).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`
}

export function FocusTimer({ timer }: { timer: ReturnType<typeof useStudyTimer> }) {
  const { snapshot, remaining, send } = timer
  const reduced = usePrefersReducedMotion()

  /*
   * Ticked here rather than driven by the server.
   *
   * The server only sends on a change — start, pause, skip — because a message
   * a second for every room would be traffic for something the client can work
   * out from a number it already has. This re-renders once a second and asks
   * the hook where the count actually is.
   */
  const [, tick] = useState(0)
  useEffect(() => {
    if (!snapshot?.running) return
    const id = window.setInterval(() => tick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [snapshot?.running])

  if (!snapshot) {
    return (
      <div className="grid h-full place-items-center">
        <p className="text-[0.82rem] text-dusk">Syncing the timer…</p>
      </div>
    )
  }

  const left = remaining()
  const total = snapshot.durations[snapshot.phase]
  const done = total > 0 ? 1 - left / total : 0
  const finished = left <= 0
  const resting = snapshot.phase !== 'focus'

  return (
    <div className="grid h-full place-items-center overflow-y-auto px-4 py-6">
      <div className="w-full max-w-md text-center">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.75rem]',
            resting
              ? 'border-white/10 bg-white/[0.04] text-mist'
              : 'border-signal/30 bg-signal/10 text-signal-bright',
          )}
        >
          {resting && <Coffee aria-hidden className="size-3.5" />}
          {PHASE_LABEL[snapshot.phase]}
          {snapshot.running && !reduced && (
            <span className="size-1.5 animate-signal-pulse rounded-full bg-signal" />
          )}
        </span>

        <p
          className={cn(
            'mt-6 font-display text-[4.5rem] font-semibold leading-none tracking-[-0.03em] tabular-nums sm:text-[6rem]',
            finished ? 'text-signal-bright' : 'text-chalk',
          )}
          /* Announced only when it changes phase or finishes — a live region
             reading every second would be unusable with a screen reader. */
          aria-live="off"
        >
          {clock(left)}
        </p>

        <p className="mt-2 text-[0.8rem] text-dusk">
          {finished
            ? `${PHASE_LABEL[snapshot.phase]} done — next up, ${PHASE_LABEL[snapshot.next].toLowerCase()}`
            : `${snapshot.completed} ${snapshot.completed === 1 ? 'sitting' : 'sittings'} done`}
        </p>

        <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-1000 ease-linear',
              resting ? 'bg-white/40' : 'bg-signal',
            )}
            style={{ width: `${Math.min(100, Math.max(0, done * 100))}%` }}
          />
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <Control
            label="Reset"
            onClick={() => send({ action: 'reset' })}
            icon={<RotateCcw aria-hidden className="size-4" />}
          />

          <button
            type="button"
            onClick={() => send({ action: snapshot.running ? 'pause' : 'start' })}
            aria-label={snapshot.running ? 'Pause' : 'Start'}
            className="grid size-16 place-items-center rounded-full bg-chalk text-void outline-none transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {snapshot.running ? (
              <Pause aria-hidden className="size-6 fill-current" />
            ) : (
              <Play aria-hidden className="size-6 translate-x-0.5 fill-current" />
            )}
          </button>

          <Control
            label={`Skip to ${PHASE_LABEL[snapshot.next].toLowerCase()}`}
            onClick={() => send({ action: 'skip' })}
            icon={<SkipForward aria-hidden className="size-4" />}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {PRESETS.map((preset) => {
            const active = snapshot.durations.focus === preset.durations.focus
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => send({ action: 'configure', durations: preset.durations })}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-[0.76rem] outline-none transition-colors duration-300',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                  active
                    ? 'border-white/20 bg-white/[0.1] text-chalk'
                    : 'border-white/10 bg-white/[0.03] text-mist hover:text-chalk',
                )}
              >
                {preset.label}
              </button>
            )
          })}
        </div>

        {snapshot.by && (
          <p className="mt-5 text-[0.74rem] text-dusk">
            {snapshot.by.name} {verb(snapshot.by.action)}
          </p>
        )}
      </div>
    </div>
  )
}

function verb(action: string) {
  switch (action) {
    case 'start':
      return 'started it'
    case 'pause':
      return 'paused it'
    case 'reset':
      return 'reset it'
    case 'skip':
      return 'skipped ahead'
    case 'configure':
      return 'changed the length'
    default:
      return 'opened it'
  }
}

function Control({
  label,
  onClick,
  icon,
}: {
  label: string
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-mist outline-none transition-colors hover:bg-white/[0.1] hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      {icon}
    </button>
  )
}
