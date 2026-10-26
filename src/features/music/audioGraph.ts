import { onEveryGesture } from '@/features/sync/unlock'

/**
 * One audio graph for the whole page.
 *
 * Every track used to build its own `AudioContext` the moment it loaded —
 * before anybody had touched the page, more often than not. A context made
 * then starts suspended, and since the music is routed through it to reach
 * the visualiser, a suspended context is silence: the song "plays", the
 * position moves, nothing comes out, and nothing on screen says why. A new
 * track meant a new context and the same silence again.
 *
 * One shared context, woken by the first touch of the page and kept for the
 * life of it, means the second song is never quieter than the first.
 */
let shared: AudioContext | null = null

export function audioContext(): AudioContext {
  if (!shared || shared.state === 'closed') {
    shared = new AudioContext()
    /* Any touch of the page is the browser's permission to wake it. */
    onEveryGesture(() => {
      if (shared?.state === 'suspended') void shared.resume().catch(() => undefined)
    })
  }
  return shared
}

/** Wake the graph, giving up after a moment — a resume the browser will not allow simply never settles. */
export async function wakeAudio(ctx: AudioContext): Promise<boolean> {
  if (ctx.state === 'running') return true
  await Promise.race([ctx.resume().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 400))])
  return (ctx.state as AudioContextState) === 'running'
}
