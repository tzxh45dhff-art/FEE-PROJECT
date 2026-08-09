import { useEffect, useRef } from 'react'

import type { PlayerHandle, WatchSnapshot } from '@/features/watch/types'

/**
 * Holding everyone to the same frame.
 *
 * The naive version — "seek anyone more than 300ms out" — fights buffering. A
 * stalled client is behind by definition, gets yanked forward, stalls again on
 * the fresh buffer, and seek-loops until the network catches up. So:
 *
 * - While the player reports buffering, do nothing at all.
 * - Small drift has to *persist* before it earns a correction.
 * - Where the source allows any playback rate, absorb small drift by running
 *   fractionally fast or slow, which nobody can see. Seeking is the last
 *   resort, because a visible jump is worse than 400ms of being behind.
 */

/** Past this, jump. A gap this size is already obvious to everyone. */
const HARD_SECONDS = 1.2
/** Below this, we are as in sync as playback timing can meaningfully be. */
const SOFT_SECONDS = 0.3
/** Small drift must last this long before it is treated as real. */
const SUSTAIN_MS = 1500
/** How hard to lean on the rate when catching up on a fine-rate source. */
const NUDGE = 0.05

export function useDriftCorrection({
  handle,
  snapshot,
  targetPosition,
  enabled,
}: {
  handle: PlayerHandle | null
  snapshot: WatchSnapshot | null
  targetPosition: () => number
  enabled: boolean
}) {
  const driftingSince = useRef<number | null>(null)
  const nudged = useRef(false)

  const rate = snapshot?.rate ?? 1
  const playing = snapshot?.playing ?? false

  useEffect(() => {
    if (!handle || !enabled || !playing) {
      driftingSince.current = null
      return
    }

    const tick = () => {
      if (handle.isBuffering()) {
        /* Not drift — just slow. Reset the clock so a long buffer doesn't cash
           out into a correction the moment playback resumes. */
        driftingSince.current = null
        if (nudged.current) {
          handle.setRate(rate)
          nudged.current = false
        }
        return
      }

      const drift = targetPosition() - handle.getPosition()
      const size = Math.abs(drift)

      if (size >= HARD_SECONDS) {
        handle.seek(targetPosition())
        driftingSince.current = null
        if (nudged.current) {
          handle.setRate(rate)
          nudged.current = false
        }
        return
      }

      if (size >= SOFT_SECONDS) {
        if (handle.supportsFineRate) {
          /* Behind → speed up a touch; ahead → ease off. Imperceptible, and it
             converges without a single visible jump. */
          handle.setRate(rate * (drift > 0 ? 1 + NUDGE : 1 - NUDGE))
          nudged.current = true
          return
        }

        const since = driftingSince.current
        if (since === null) {
          driftingSince.current = performance.now()
        } else if (performance.now() - since > SUSTAIN_MS) {
          handle.seek(targetPosition())
          driftingSince.current = null
        }
        return
      }

      driftingSince.current = null
      if (nudged.current) {
        handle.setRate(rate)
        nudged.current = false
      }
    }

    const timer = setInterval(tick, 1000)
    return () => {
      clearInterval(timer)
      if (nudged.current) {
        handle.setRate(rate)
        nudged.current = false
      }
    }
  }, [handle, enabled, playing, rate, targetPosition])
}
