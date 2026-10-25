import { useCallback, useState } from 'react'

import type { MafiaView } from './types'

/* ── private notes: what you make of each person, kept on this device ── */

export type Hunch = 'suspect' | 'trust' | 'unsure'
const HUNCHES: Hunch[] = ['suspect', 'trust', 'unsure']
export const HUNCH_LABEL: Record<Hunch, string> = { suspect: 'Suspect', trust: 'Trust', unsure: 'Unsure' }

/** Your own notes for this game — never sent anywhere, gone with the next deal. */
export function useNotes(game: string) {
  const key = `huddle.mafiaNotes.${game}`
  const [notes, setNotes] = useState<Record<string, Hunch>>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, Hunch>
    } catch {
      return {}
    }
  })
  const cycle = useCallback(
    (id: string) => {
      setNotes((all) => {
        const at = all[id] ? HUNCHES.indexOf(all[id]) : -1
        const next = { ...all }
        if (at === HUNCHES.length - 1) delete next[id]
        else next[id] = HUNCHES[at + 1]!
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          /* Kept for this visit only. */
        }
        return next
      })
    },
    [key],
  )
  return { notes, cycle }
}


/** The roles a shared screen may show: only what the whole table already knows. */
export function publicOnly(view: MafiaView): MafiaView {
  const over = view.phase === 'over'
  return {
    ...view,
    me: null,
    players: view.players.map((p) => ({
      ...p,
      role: over || (!p.alive && (view.options.reveal || (p.died?.how === 'voted' && p.role === 'jester'))) ? p.role : null,
    })),
    night: view.night && { ...view.night, family: null },
    verdict: view.verdict && { ...view.verdict, role: view.options.reveal || view.verdict.jester || over ? view.verdict.role : null },
    whispers: [],
    ghosts: [],
  }
}

