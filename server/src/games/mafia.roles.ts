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

export type Extras = { godfather: boolean; jester: boolean }

/** The roles for a table of `count`, before shuffling. */
export function roleSet(count: number, extras: Extras): Role[] {
  const family = count <= 6 ? 1 : count <= 8 ? 2 : 3
  const roles: Role[] = []
  for (let i = 0; i < family; i++) roles.push(extras.godfather && count >= 7 && i === 0 ? 'godfather' : 'mafia')
  roles.push('doctor')
  if (count >= 5) roles.push('detective')
  if (extras.jester && count >= 6) roles.push('jester')
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
