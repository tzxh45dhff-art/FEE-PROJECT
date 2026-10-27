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

/**
 * Doctors and Inspectors rolled at the deal: one each at a small table, one
 * or two at a middling one, two at a big one — so nobody at a mid-sized table
 * can be sure how many there are. No Inspector at four, as ever.
 */
export function rollPowers(count: number, random: (max: number) => number) {
  const roll = () => (count <= 6 ? 1 : count <= 9 ? 1 + random(2) : 2)
  return { doctors: roll(), detectives: count >= 5 ? roll() : 0 }
}

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

export const TITLES = new Set(['mr', 'mrs', 'ms', 'miss', 'dr', 'father', 'uncle', 'aunty', 'auntie', 'colonel', 'begum', 'madame', 'dj', 'thakur', 'pandit', 'ustad', 'hakim', 'seth'])
/** What the table calls someone: the first name — or "Mrs Lobo", never just "Mrs". */
export const first = (name: string) => {
  const [head, next] = name.trim().split(/\s+/)
  if (!head) return name
  return next && TITLES.has(head.toLowerCase().replace(/\.$/, '')) ? `${head} ${next}` : head
}

/* ── a fair deal ──────────────────────────────────────────────────────── */

/** What kind of card someone held, for spreading the cards around. */
const kindOf = (role: Role): 'family' | 'power' | 'citizen' => (teamOf(role) === 'family' ? 'family' : role === 'villager' ? 'citizen' : 'power')

/** One person's card in one game, as the room remembers it: `deal:<game>:<id>:<kind>`. */
export const dealKey = (game: string, id: string, role: Role) => `deal:${game}:${id}:${kindOf(role)}`

/** How many recent games are remembered when dealing, and how fast an old one fades. */
const MEMORY = 4

/**
 * Who has lately held which kind of card, from the room's memory: the last
 * game counts fully, the one before it half, and so on. Keys arrive oldest
 * first.
 */
export function recentHands(seen: Iterable<string> | undefined) {
  const games: string[] = []
  const hands = new Map<string, { game: string; id: string; kind: string }[]>()
  for (const key of seen ?? []) {
    const [tag, game, id, kind] = key.split(':')
    if (tag !== 'deal' || !game || !id || !kind) continue
    if (!hands.has(game)) {
      games.push(game)
      hands.set(game, [])
    }
    hands.get(game)!.push({ game, id, kind })
  }
  const score = new Map<string, { family: number; power: number }>()
  games.slice(-MEMORY).reverse().forEach((game, age) => {
    const weight = 1 / 2 ** age
    for (const hand of hands.get(game)!) {
      const s = score.get(hand.id) ?? { family: 0, power: 0 }
      if (hand.kind === 'family') s.family += weight
      if (hand.kind === 'power') s.power += weight
      score.set(hand.id, s)
    }
  })
  return score
}

/**
 * Deal the cards so they move around the room. Still a random deal — anyone
 * can get anything — but someone who just had the Family's card is about a
 * quarter as likely to get it again, and the same for the Doctor, Inspector
 * and Jester. People new to the room, and the AI players, deal as normal.
 */
export function dealFairly(ids: string[], roles: Role[], seen: Iterable<string> | undefined, random: (max: number) => number): Role[] {
  const recent = recentHands(seen)
  const open = new Set(ids.map((_, i) => i))
  const out: Role[] = new Array(ids.length)
  /* Rarest cards first, each to someone drawn with a weight that shrinks with how recently they held one like it. */
  const order = [...roles].sort((a, b) => rank(a) - rank(b))
  for (const role of order) {
    const kind = kindOf(role)
    const seats = [...open]
    if (kind === 'citizen') {
      const seat = seats[random(seats.length)]!
      out[seat] = role
      open.delete(seat)
      continue
    }
    const weights = seats.map((i) => {
      const s = recent.get(ids[i]!)
      const held = kind === 'family' ? (s?.family ?? 0) : (s?.power ?? 0)
      return Math.round(1000 / (1 + 3 * held))
    })
    let roll = random(weights.reduce((sum, w) => sum + w, 0))
    let pick = seats[seats.length - 1]!
    for (let k = 0; k < seats.length; k++) {
      roll -= weights[k]!
      if (roll < 0) {
        pick = seats[k]!
        break
      }
    }
    out[pick] = role
    open.delete(pick)
  }
  return out
}

const rank = (role: Role) => (teamOf(role) === 'family' ? 0 : role === 'villager' ? 2 : 1)
