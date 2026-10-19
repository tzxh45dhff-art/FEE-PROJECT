/**
 * Where each person's head is on screen, right now.
 *
 * Emotes rise from above someone's head and thrown things fly between heads,
 * so the effects layer needs real screen positions — and the people are drawn
 * two different ways. 3D characters are placed by a camera that fits the whole
 * party into frame, so their positions are only known inside the canvas; the
 * scene projects each head every frame and publishes it here. Flat characters
 * sit in an ordinary flex row with their nameplate underneath, so for them the
 * nameplate's column is the honest anchor and is measured from the DOM.
 *
 * A module-level map rather than React state on purpose: this is written up to
 * sixty times a second per person, and nothing should re-render because of it.
 */

export type Anchor = { x: number; y: number; /** Rough on-screen character height, for scaling effects. */ h: number }

const projected = new Map<string, Anchor & { at: number }>()

export function publishAnchor(id: string, x: number, y: number, h: number) {
  projected.set(id, { x, y, h, at: performance.now() })
}

export function forgetAnchor(id: string) {
  projected.delete(id)
}

/** The person's head, from the 3D scene if it is current, else from the DOM. */
export function anchorFor(id: string): Anchor | null {
  const fresh = projected.get(id)
  if (fresh && performance.now() - fresh.at < 1500) return fresh

  const plate = document.querySelector<HTMLElement>(`[data-hub-member="${CSS.escape(id)}"]`)
  const stage = document.querySelector<HTMLElement>('[data-hub-stage]')
  if (!plate || !stage) return fresh ?? null
  const p = plate.getBoundingClientRect()
  const s = stage.getBoundingClientRect()
  return { x: p.left + p.width / 2, y: s.top + s.height * 0.16, h: s.height * 0.8 }
}

/**
 * Ask a character to play its own wave.
 *
 * The rigged models ship with a greeting clip that already plays on hover; the
 * wave emote reuses it, so it gets a real animation without anyone authoring a
 * new one.
 */
const waves = new EventTarget()
export function requestWave(id: string) {
  waves.dispatchEvent(new CustomEvent('wave', { detail: id }))
}
export function onWave(handler: (id: string) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<string>).detail)
  waves.addEventListener('wave', listener)
  return () => waves.removeEventListener('wave', listener)
}
