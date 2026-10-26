import { useCallback, useEffect, useRef, useState } from 'react'

import type { Correctable } from '@/features/sync/useDriftCorrection'
import { onEveryGesture } from '@/features/sync/unlock'

/**
 * Keeping this player doing what the room is doing — by itself.
 *
 * Shared by Watch and Listen. The room decides play, pause, where and how
 * fast; this makes the player follow, and keeps it following, without ever
 * asking anybody to press anything.
 *
 * - **Placed, not shoved.** A control moves the player only as far as it is
 *   actually out. Every seek on YouTube is a rebuffer, and seeking everyone to
 *   where they already were on every play, pause and rate change is what made
 *   some screens stall while others ran smooth.
 * - **Lined up while paused.** A pause parks every player on the room's exact
 *   frame, which costs nothing while nobody is watching — so the next play
 *   starts everyone together with nothing to correct.
 * - **Sound the browser refuses is not a reason to stop.** A browser will not
 *   start sound before the person has touched the page. Rather than freeze on
 *   a "tap to join" screen — out of step until somebody notices — the player
 *   carries on muted, exactly in time, and the sound comes on at the first
 *   touch anywhere on the page.
 * - **A watchdog.** A play can be dropped: a video still loading when it
 *   arrives, a skip that leaves YouTube parked on its first frame, a headphone
 *   click. If the room is playing and this player has quietly stopped, it is
 *   put back in place and started again; if the room is paused and the player
 *   is running, it is stopped.
 */

/** What the keeper needs of a player, beyond what drift correction does. */
export type Keepable = Correctable & {
  /** Resolves false only when the browser refused to start with sound. */
  play: () => Promise<boolean>
  pause: () => void
  setMuted: (muted: boolean) => void
  /** Actually advancing — not loading, not cued, not paused. */
  isPlaying: () => boolean
}

/** How often the watchdog looks. */
const WATCH_MS = 1000
/** Looks in a row a player may sit stopped while the room plays, before it is restarted. */
const STUCK_LOOKS = 2
/** Restarts without it ever starting before assuming the browser is holding back sound. */
const RESTARTS_BEFORE_MUTE = 2

export function usePlaybackKeeper({
  handle,
  playing,
  position,
  rate,
  seq,
  clockReady,
  targetPosition,
  enabled,
  tolerance,
}: {
  handle: Keepable | null
  /** Whether the room says it is running. */
  playing: boolean
  /** Where the room is paused, to line everyone up on it — null when the room is not actually paused. */
  position: number | null
  /** The room's rate, for sources that have one. */
  rate?: number
  /** Bumped by every control the room takes. */
  seq: number
  /** Whether the clock behind `targetPosition` has been measured. */
  clockReady: boolean
  targetPosition: () => number
  enabled: boolean
  /** How far out a player may be before a control seeks it, in seconds. */
  tolerance: number
}) {
  /** True while the browser is holding sound back and the player runs muted. */
  const [soundHeld, setSoundHeld] = useState(false)
  const held = useRef(false)
  /*
   * The browser would not start it even muted. Video can always play muted;
   * a song routed through the visualiser's audio graph cannot, on Chrome,
   * until the page is touched. Then there is nothing to play yet — the player
   * is kept parked on the room's moment instead, so the first touch starts it
   * exactly in step.
   */
  const refused = useRef(false)
  /** When this hook last moved the player itself — so its own doing is not mistaken for anyone's intent. */
  const touchedAt = useRef(0)

  const handleRef = useRef(handle)
  handleRef.current = handle
  const positionOf = useRef(targetPosition)
  positionOf.current = targetPosition
  const playingRef = useRef(playing)
  playingRef.current = playing

  const hold = useCallback((on: boolean) => {
    held.current = on
    setSoundHeld(on)
  }, [])

  /** Start the player; if the browser refuses sound, start it muted instead. */
  const start = useCallback(
    async (target: Keepable) => {
      touchedAt.current = performance.now()
      if (held.current) target.setMuted(true)
      const ok = await target.play()
      if (ok || handleRef.current !== target || !playingRef.current) return
      touchedAt.current = performance.now()
      hold(true)
      target.setMuted(true)
      refused.current = !(await target.play())
    },
    [hold],
  )

  /* The room changed its mind: follow it, moving only as far as needed. */
  useEffect(() => {
    if (!handle || !enabled) return
    touchedAt.current = performance.now()

    if (!playing) {
      /* Seek first, then pause: YouTube starts a video that is merely cued
         when it is seeked, and a pause after puts it back down. */
      if (position !== null && Math.abs(handle.getPosition() - position) > 0.3) handle.seek(position)
      handle.pause()
      return
    }

    /* Nothing is placed on an unmeasured clock — it is a different wrong
       place on every device. Pausing, above, needs no clock. */
    if (!clockReady) return

    const target = positionOf.current()
    if (Math.abs(handle.getPosition() - target) > tolerance) handle.seek(target)
    if (rate !== undefined) handle.setRate(rate)
    void start(handle)
    /* Keyed on `seq`, not on the snapshot: a listener walking in rebuilds the
       snapshot without changing playback, and must not move anybody. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, enabled, clockReady, seq, playing, rate])

  /* The watchdog. */
  useEffect(() => {
    if (!handle || !enabled) return
    let stuck = 0
    let restarts = 0
    const timer = setInterval(() => {
      if (!playingRef.current) {
        stuck = 0
        restarts = 0
        if (handle.isPlaying()) {
          touchedAt.current = performance.now()
          handle.pause()
        }
        return
      }
      if (!clockReady) return
      if (handle.isPlaying() || handle.isBuffering()) {
        stuck = 0
        restarts = 0
        return
      }
      /* Parked until the first touch: keep it on the room's moment, and wait. */
      if (refused.current) {
        const target = positionOf.current()
        if (Math.abs(handle.getPosition() - target) > tolerance) handle.seek(target)
        return
      }
      stuck += 1
      if (stuck < STUCK_LOOKS) return
      stuck = 0
      restarts += 1
      const target = positionOf.current()
      if (Math.abs(handle.getPosition() - target) > tolerance) handle.seek(target)
      /* Restarted and restarted and never moving, with no word from the
         player why: that is a browser holding sound back without saying so.
         Muted, it is allowed to run. */
      if (restarts > RESTARTS_BEFORE_MUTE && !held.current) hold(true)
      void start(handle)
    }, WATCH_MS)
    return () => clearInterval(timer)
  }, [handle, enabled, clockReady, tolerance, start, hold])

  /* The first touch anywhere brings the sound back — inside the gesture, which is what the browser asks for. */
  useEffect(
    () =>
      onEveryGesture(() => {
        if (!held.current) return
        /* Released even between tracks, so the next one simply starts with sound. */
        hold(false)
        refused.current = false
        const current = handleRef.current
        if (!current) return
        touchedAt.current = performance.now()
        current.setMuted(false)
        if (!playingRef.current) return
        const target = positionOf.current()
        if (Math.abs(current.getPosition() - target) > tolerance) current.seek(target)
        void current.play()
      }),
    [hold, tolerance],
  )

  return { soundHeld, touchedAt }
}
