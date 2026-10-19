import { emoteById, throwById } from '@/features/fun/catalog'
import type { FunEvent } from '@/features/fun/useFun'

/** The words a screen reader hears for each event. Used by the dock's live region. */
export function describe(event: FunEvent, youId: string | null): string {
  const who = (p: { id: string; name: string }) => (p.id === youId ? 'You' : p.name)
  if (event.kind === 'emote') return `${who(event.from)}: ${emoteById(event.emote)?.label ?? event.emote}`
  if (event.kind === 'throw') {
    const target = event.to.id === youId ? 'you' : event.to.name
    return `${who(event.from)} threw ${(throwById(event.item)?.label ?? event.item).toLowerCase()} at ${target}`
  }
  switch (event.toy) {
    case 'dice':
      return `${who(event.from)} rolled ${event.values.join(' and ')}${event.values.length > 1 ? `, ${event.values.reduce((a, b) => a + b, 0)} in all` : ''}`
    case 'coin':
      return `${who(event.from)} flipped ${event.side}`
    case 'bottle':
      return `The bottle points at ${event.target.id === youId ? 'you' : event.target.name}`
    case 'fortune':
      return `${who(event.from)}'s fortune: ${event.text}`
    case 'eightball':
      return `${event.question ? `"${event.question}" ` : ''}The 8-ball says: ${event.text}`
  }
}

