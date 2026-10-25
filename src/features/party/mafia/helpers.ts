import type { SeatView } from './types'

/** What the deal will be for this many people — so nobody is surprised by the cards. */
export function dealLine(n: number, godfather: boolean, jester: boolean) {
  if (n < 4) return 'Mafia needs at least four at the table.'
  if (n > 12) return 'Twelve is the most the table seats.'
  const family = n <= 6 ? 1 : n <= 8 ? 2 : 3
  const parts = [`${family} of the Family${godfather && n >= 7 ? ' (one is the Godfather)' : ''}`, 'a Doctor']
  if (n >= 5) parts.push('an Inspector')
  if (jester && n >= 6) parts.push('a Jester')
  const citizens = n - family - 1 - (n >= 5 ? 1 : 0) - (jester && n >= 6 ? 1 : 0)
  parts.push(`${citizens} ${citizens === 1 ? 'Citizen' : 'Citizens'}`)
  return `${n} at the table: ${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}.`
}

/** A seat's display name, first name only. */
export const firstName = (seat: SeatView | undefined) => seat?.name.split(' ')[0] ?? 'Someone'
