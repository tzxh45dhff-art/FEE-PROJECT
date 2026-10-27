import type { SeatView } from './types'

/*
 * The deal — the same rules as the server’s `dealCounts` in
 * server/src/games/mafia.roles.ts, so what the host sees is exactly what
 * gets dealt. Change one, change both.
 */
export const recommendedDeal = (n: number) => ({ family: n <= 6 ? 1 : n <= 8 ? 2 : 3, doctors: 1, detectives: n >= 5 ? 1 : 0 })
/** The most Family that still leaves them outnumbered after the first night's kill. */
export const maxFamily = (n: number) => Math.max(1, Math.floor((n - 2) / 2))
export const MAX_SPECIALISTS = 2
const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(value)))

export function dealCounts(n: number, o: { godfather: boolean; jester: boolean; family?: number | null; doctors?: number | null; detectives?: number | null }) {
  const recommended = recommendedDeal(n)
  const family = clamp(o.family ?? recommended.family, 1, maxFamily(n))
  const jester = o.jester && n >= 6 ? 1 : 0
  const room = Math.max(0, n - family - jester)
  const doctors = Math.min(clamp(o.doctors ?? recommended.doctors, 0, MAX_SPECIALISTS), room)
  const detectives = Math.min(clamp(o.detectives ?? recommended.detectives, 0, MAX_SPECIALISTS), room - doctors)
  return { family, godfather: o.godfather && n >= 7, doctors, detectives, jester, citizens: n - family - jester - doctors - detectives }
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

/** What the deal will be for this many people — so nobody is surprised by the cards. */
export function dealLine(n: number, o: Parameters<typeof dealCounts>[1]) {
  if (n < 4) return 'Mafia needs at least four at the table.'
  if (n > 12) return 'Twelve is the most the table seats.'
  const d = dealCounts(n, o)
  const parts = [`${d.family} of the Family${d.godfather ? ' (one is the Godfather)' : ''}`]
  if (d.doctors) parts.push(d.doctors === 1 ? 'a Doctor' : plural(d.doctors, 'Doctor', 'Doctors'))
  if (d.detectives) parts.push(d.detectives === 1 ? 'an Inspector' : plural(d.detectives, 'Inspector', 'Inspectors'))
  if (d.jester) parts.push('a Jester')
  parts.push(plural(d.citizens, 'Citizen', 'Citizens'))
  return `${n} at the table: ${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}.`
}

const TITLES = new Set(['mr', 'mrs', 'ms', 'miss', 'dr', 'father', 'uncle', 'aunty', 'auntie', 'colonel', 'begum', 'madame', 'dj', 'thakur', 'pandit', 'ustad', 'hakim', 'seth'])

/** What the table calls someone: the first name — or "Mrs Lobo", never just "Mrs". */
export function callName(name: string) {
  const [head, next] = name.trim().split(/\s+/)
  if (!head) return name
  return next && TITLES.has(head.toLowerCase().replace(/\.$/, '')) ? `${head} ${next}` : head
}

/** A seat's display name, first name only. */
export const firstName = (seat: SeatView | undefined) => (seat ? callName(seat.name) : 'Someone')
