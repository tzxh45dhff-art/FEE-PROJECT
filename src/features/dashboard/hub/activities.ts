import { Clapperboard, Code2, Gamepad2, Music4, type LucideIcon } from 'lucide-react'

export type ActivityId = 'watch' | 'music' | 'games' | 'code'

export type Activity = {
  id: ActivityId
  label: string
  hint: string
  icon: LucideIcon
  /** What lands in this slot when the feature is built. */
  blurb: string
}

/**
 * The four things a room can be doing. Everyone in the room gets the same set —
 * there are no per-room-type activity lists and no host-only controls, which is
 * what keeps the hub one screen with one meaning rather than five variants.
 */
export const ACTIVITIES: Activity[] = [
  {
    id: 'watch',
    label: 'Watch',
    hint: 'Together, in sync',
    icon: Clapperboard,
    blurb:
      'A shared player: search, queue, and synchronised play, pause, seek and speed, with drift correction holding everyone to the same frame.',
  },
  {
    id: 'music',
    label: 'Listen',
    hint: 'Shared queue',
    icon: Music4,
    blurb:
      "The room's playlist and its live queue — add, reorder, skip, and vote, with playback synchronised the same way the player is.",
  },
  {
    id: 'games',
    label: 'Play',
    hint: 'Quick matches',
    icon: Gamepad2,
    blurb:
      'Short games anyone can drop into — tic tac toe, a typing race, memory — with results feeding the room leaderboard.',
  },
  {
    id: 'code',
    label: 'Code',
    hint: 'Shared editor',
    icon: Code2,
    blurb:
      'A shared editor with syntax highlighting and a challenge timer, for study sessions and coding races alike.',
  },
]

export function findActivity(id: ActivityId) {
  return ACTIVITIES.find((activity) => activity.id === id)!
}
