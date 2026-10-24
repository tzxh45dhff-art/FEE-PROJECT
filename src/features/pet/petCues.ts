import { useEffect, useRef, useSyncExternalStore } from 'react'

/**
 * How the rest of the app tells the pet what is going on.
 *
 * The pet should feel like it is in the room with you — laughing when the room
 * laughs at a film, cheering when you get a question right, keeping quiet while
 * you focus — without every feature having to know how the pet works. So a
 * feature says what happened ("the room laughed", "you won"), and the pet
 * decides what to make of it.
 *
 * Two kinds of signal:
 *   - a **cue** is a moment: a reaction plays once and wears off;
 *   - the **scene** is a state: dozing while a film sits paused, quiet while a
 *     focus timer runs. Whoever set it clears it when it stops being true.
 *
 * Local to this screen only. Everything that triggers a cue is already shared
 * with the room (reactions, results, chat), so each screen's pet reacts to the
 * same things anyway — without a server round trip per giggle.
 */

export type PetCueKind =
  | 'laugh' // the room laughed
  | 'aww' // something sad or sweet
  | 'gasp' // a shock
  | 'cheer' // applause, fire, a great moment
  | 'love' // hearts
  | 'snack' // popcorn: it wants some
  | 'right' // you got it right
  | 'wrong' // you got it wrong
  | 'win' // you won the game
  | 'lose' // someone else won
  | 'break' // focus over: stretch
  | 'hello' // someone said its name

export type PetCue = { id: string; kind: PetCueKind; who?: string }

/** The pet's background state, from whichever activity is on screen. */
export type PetScene = 'none' | 'watching' | 'dozing' | 'focus'

const bus = new EventTarget()
let scene: PetScene = 'none'
const sceneListeners = new Set<() => void>()

let counter = 0
/** Something just happened that the pet would notice. */
export function petCue(kind: PetCueKind, who?: string) {
  bus.dispatchEvent(new CustomEvent<PetCue>('cue', { detail: { id: `${Date.now()}-${counter++}`, kind, who } }))
}

/** What the pet should be doing in the background right now. */
export function setPetScene(next: PetScene) {
  if (next === scene) return
  scene = next
  sceneListeners.forEach((listener) => listener())
}

export function usePetScene(): PetScene {
  return useSyncExternalStore(
    (listener) => {
      sceneListeners.add(listener)
      return () => sceneListeners.delete(listener)
    },
    () => scene,
  )
}

/** What the room is watching, for the pet to mention. Read when it speaks; nothing needs to re-render. */
let watching: string | null = null
export function setPetWatching(title: string | null) {
  watching = title
}
export const petWatching = () => watching

export function usePetCues(handler: (cue: PetCue) => void) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const listener = (event: Event) => ref.current((event as CustomEvent<PetCue>).detail)
    bus.addEventListener('cue', listener)
    return () => bus.removeEventListener('cue', listener)
  }, [])
}

/**
 * Hold a scene while a component says so, and let go when it unmounts — so
 * closing the watch stage can never leave the pet dozing over the hub.
 */
export function useHoldPetScene(next: PetScene, when: boolean) {
  useEffect(() => {
    if (!when) return
    setPetScene(next)
    return () => setPetScene('none')
  }, [next, when])
}
