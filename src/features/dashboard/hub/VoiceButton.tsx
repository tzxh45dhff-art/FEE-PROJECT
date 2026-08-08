import { useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

import { useMicLevel } from '@/hooks/useMicLevel'
import { cn } from '@/lib/utils'

/**
 * Push-to-talk's always-on cousin, and the one control that is live the moment
 * you walk into a room.
 *
 * The ring is your own captured level, so the button proves the mic works.
 * Nothing is transmitted to the room yet — that needs a WebRTC path the server
 * doesn't have — and the label says so rather than implying a call is up.
 */
export function VoiceButton() {
  const { state, level, toggle } = useMicLevel()
  const ring = useRef<HTMLSpanElement>(null)

  /*
   * The level is written to a CSS variable from inside the animation frame
   * rather than kept in state — a voice meter re-rendering React at 60fps would
   * drag the 3D canvas down with it.
   */
  useEffect(() => {
    if (state !== 'live') {
      ring.current?.style.setProperty('--level', '0')
      return
    }

    let frame = 0
    const tick = () => {
      ring.current?.style.setProperty('--level', level.current.toFixed(3))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [state, level])

  const live = state === 'live'
  const label =
    state === 'live'
      ? 'Mic live · local only'
      : state === 'requesting'
        ? 'Asking for the mic…'
        : state === 'denied'
          ? 'Mic blocked'
          : 'Mic off'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={live}
      className={cn(
        'glass-pill-ink pointer-events-auto group/mic flex items-center gap-3 rounded-full py-2 pl-2 pr-5 outline-none',
        'transition-[border-color,box-shadow] duration-500 ease-glass',
        'hover:border-white/25 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal',
        live && 'border-emerald-400/40',
      )}
    >
      <span className="relative grid size-10 shrink-0 place-items-center">
        {/* Scales with the measured level. Sits behind the icon so a loud
            moment blooms outward instead of shoving the glyph around. */}
        <span
          ref={ring}
          aria-hidden
          className={cn(
            'absolute inset-0 rounded-full transition-colors duration-500',
            live ? 'bg-emerald-400/25' : 'bg-white/10',
          )}
          style={{
            ['--level' as string]: 0,
            transform: 'scale(calc(1 + var(--level) * 0.55))',
          }}
        />
        <span
          className={cn(
            'relative grid size-10 place-items-center rounded-full ring-1 ring-inset transition-colors duration-500',
            live ? 'text-emerald-300 ring-emerald-400/40' : 'text-mist ring-white/15',
          )}
        >
          {live ? <Mic aria-hidden className="size-4" /> : <MicOff aria-hidden className="size-4" />}
        </span>
      </span>

      <span className="min-w-0 text-left">
        <span className="block font-display text-[0.85rem] font-semibold tracking-[-0.01em] text-chalk">
          Voice
        </span>
        <span className="block truncate text-[0.68rem] text-mist">{label}</span>
      </span>
    </button>
  )
}
