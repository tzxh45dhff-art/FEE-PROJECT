/**
 * The moment this page is allowed to make sound.
 *
 * Browsers refuse to start audio until the person has touched the page — a
 * tap, a click, a key. That is policy, not something any app can talk its way
 * past. What an app *can* do is not make a fuss about it: play muted and in
 * step until then, and turn the sound on at the very first touch, wherever on
 * the page it lands. This is that first touch.
 *
 * Listeners run inside the gesture itself — synchronously, in the capture
 * phase, before anything else handles it — because "inside a user gesture" is
 * exactly the condition the browser checks when something asks to unmute.
 */

type Listener = () => void

const listeners = new Set<Listener>()
let installed = false
let touched = false

const GESTURES = ['pointerdown', 'keydown', 'touchend', 'click'] as const

function onGesture() {
  touched = true
  for (const listener of [...listeners]) {
    try {
      listener()
    } catch {
      /* One player failing to unmute must not stop the next. */
    }
  }
}

function install() {
  if (installed || typeof document === 'undefined') return
  installed = true
  for (const type of GESTURES) document.addEventListener(type, onGesture, { capture: true, passive: true })
}

/** Whether the person has touched the page yet, so sound can start by itself. */
export function soundAllowed() {
  const activation = typeof navigator !== 'undefined' ? (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation : undefined
  return touched || activation?.hasBeenActive === true
}

/** Run `listener` on every touch of the page, inside the gesture. Returns the unsubscribe. */
export function onEveryGesture(listener: Listener) {
  install()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
