import { Globe, Lock } from 'lucide-react'

/**
 * Who can get into a room, said in terms of what happens rather than what the
 * words mean — shared by creating a room and changing one, so the two never
 * describe the same choice differently.
 */
export const VISIBILITY_OPTIONS = [
  {
    value: 'private' as const,
    label: 'Private',
    hint: 'Listed to nobody. The room code is the only way in.',
    icon: Lock,
  },
  {
    value: 'open' as const,
    label: 'Open',
    hint: 'Shows up in Discover. Anyone signed in can walk in.',
    icon: Globe,
  },
]
