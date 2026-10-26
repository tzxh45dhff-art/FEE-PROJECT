/**
 * Who gets what in Mafia.
 *
 * Balanced by headcount so neither side starts out ahead: roughly one in
 * four is in the Family, there is always a Doctor, and a Detective from five
 * players up — at four the town has too few lives to spend on a role that
 * only learns things. The Godfather and the Jester are spice the host opts
 * into, and only from the size where they still leave the game winnable.
 */

export const ROLES = ['mafia', 'godfather', 'doctor', 'detective', 'villager', 'jester'] as const
export type Role = (typeof ROLES)[number]

export type Team = 'family' | 'town' | 'jester'

export const teamOf = (role: Role): Team => (role === 'mafia' || role === 'godfather' ? 'family' : role === 'jester' ? 'jester' : 'town')

export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 12

export type Extras = {
  godfather: boolean
  jester: boolean
  /* The host's own counts, or null for the recommended deal. */
  family?: number | null
  doctors?: number | null
  detectives?: number | null
}

/** The balanced deal for a table of `count`: roughly one in four Family, a Doctor, an Inspector from five. */
export const recommendedDeal = (count: number) => ({ family: count <= 6 ? 1 : count <= 8 ? 2 : 3, doctors: 1, detectives: count >= 5 ? 1 : 0 })

/**
 * The most Family a table can hold and still be a game.
 *
 * The Family win the moment they are no fewer than everyone else, and the
 * first night costs the town a life before anyone has voted. So the Family
 * must still be outnumbered after that first kill — any more and the game is
 * decided at the first sunrise.
 */
export const maxFamily = (count: number) => Math.max(1, Math.floor((count - 2) / 2))

/** At most two of each town role: more is a different game, and a duller one. */
export const MAX_SPECIALISTS = 2

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(value)))

/**
 * How many of each card, for this table: the host's counts where they set
 * them, the recommended ones where they didn't — and always held to what
 * still makes a winnable game at this size, since the table can change
 * between choosing and dealing.
 */
export function dealCounts(count: number, extras: Extras) {
  const recommended = recommendedDeal(count)
  const family = clamp(extras.family ?? recommended.family, 1, maxFamily(count))
  const jester = extras.jester && count >= 6 ? 1 : 0
  const room = Math.max(0, count - family - jester)
  const doctors = Math.min(clamp(extras.doctors ?? recommended.doctors, 0, MAX_SPECIALISTS), room)
  const detectives = Math.min(clamp(extras.detectives ?? recommended.detectives, 0, MAX_SPECIALISTS), room - doctors)
  return { family, godfather: extras.godfather && count >= 7, doctors, detectives, jester, citizens: count - family - jester - doctors - detectives }
}

/** The roles for a table of `count`, before shuffling. */
export function roleSet(count: number, extras: Extras): Role[] {
  const deal = dealCounts(count, extras)
  const roles: Role[] = []
  for (let i = 0; i < deal.family; i++) roles.push(deal.godfather && i === 0 ? 'godfather' : 'mafia')
  for (let i = 0; i < deal.doctors; i++) roles.push('doctor')
  for (let i = 0; i < deal.detectives; i++) roles.push('detective')
  if (deal.jester) roles.push('jester')
  while (roles.length < count) roles.push('villager')
  return roles
}

/** What each role is for, in the voice of the game. Shown on the card. */
export const ROLE_INFO: Record<Role, { title: string; line: string }> = {
  mafia: { title: 'The Family', line: 'Each night, choose who sleeps with the fishes. By day, blend in.' },
  godfather: { title: 'The Godfather', line: 'You run the Family. Your word decides the kill, and the Detective reads you as clean.' },
  doctor: { title: 'The Doctor', line: 'Each night, keep one soul alive. Never the same one twice in a row; yourself, only once.' },
  detective: { title: 'The Inspector', line: 'Each night, open a file on one name. You will learn if they work for the Family.' },
  villager: { title: 'Citizen of Bombay', line: 'No tricks up your sleeve — only your eyes, your ears, and your vote.' },
  jester: { title: 'The Jester', line: 'You win only if the town hangs you. Make them believe it.' },
}

const TITLES = new Set(['mr', 'mrs', 'ms', 'miss', 'dr', 'father', 'uncle', 'aunty', 'auntie'])
/** What the table calls someone: the first name — or "Mrs Lobo", never just "Mrs". */
export const first = (name: string) => {
  const [head, next] = name.trim().split(/\s+/)
  if (!head) return name
  return next && TITLES.has(head.toLowerCase().replace(/\.$/, '')) ? `${head} ${next}` : head
}
