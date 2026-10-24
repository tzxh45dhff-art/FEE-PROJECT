/**
 * How the room's pet lives.
 *
 * Nothing ticks. Hunger and happiness are stored with the time they were last
 * written and drift forward from there whenever anyone looks, so a pet left
 * alone for a weekend is hungry and sulking on Monday without a single timer
 * having run while nobody was there.
 *
 * The numbers are tuned for a couple who drop in once or twice a day: a meal
 * lasts most of a day, a day without anyone saying hello shows, and a few
 * days of neglect leave it properly miserable — but never dead. This is a pet
 * you come back to, not one that punishes you for having a life.
 */

export const SPECIES = ['cat', 'pup', 'bunny', 'panda'] as const
export type Species = (typeof SPECIES)[number]

export const FOODS = ['cookie', 'fish', 'carrot', 'bamboo', 'icecream', 'pizza'] as const
export type Food = (typeof FOODS)[number]

export const FAVOURITE: Record<Species, Food> = { cat: 'fish', pup: 'pizza', bunny: 'carrot', panda: 'bamboo' }

export const ACTIONS = ['feed', 'pet', 'poke', 'tickle', 'play', 'talk', 'sorry'] as const
export type PetAction = (typeof ACTIONS)[number]

export type Reaction =
  | 'yum' | 'love' | 'full' | 'purr' | 'ouch' | 'giggle' | 'grumpy' | 'play' | 'listen' | 'sulk'
  /* Feelings: it walks off, won't take it from you, hears you out, makes up, isn't here, takes comfort. */
  | 'leave' | 'turnaway' | 'sniff' | 'forgive' | 'away' | 'comfort'

export type Vitals = { hunger: number; happiness: number; xp: number; updatedAt: number }

/** Per hour. */
const HUNGER_RATE = 4
const SADNESS_RATE = 2.5
/** Happiness falls twice as fast on an empty stomach. */
const HUNGRY_AT = 70

export const isSpecies = (v: unknown): v is Species => SPECIES.includes(v as Species)
export const isFood = (v: unknown): v is Food => FOODS.includes(v as Food)
export const isAction = (v: unknown): v is PetAction => ACTIONS.includes(v as PetAction)

const clamp = (n: number) => Math.max(0, Math.min(100, n))

/** The vitals as of `now`, from what was last stored. */
export function drift(v: Vitals, now: number): Vitals {
  const hours = Math.max(0, now - v.updatedAt) / 3_600_000
  const hunger = clamp(v.hunger + HUNGER_RATE * hours)
  /* Split the stretch at the moment it got hungry, so the faster sadness only
     applies to the hours actually spent hungry. */
  const toHungry = v.hunger >= HUNGRY_AT ? 0 : Math.min(hours, (HUNGRY_AT - v.hunger) / HUNGER_RATE)
  const happiness = clamp(v.happiness - SADNESS_RATE * toHungry - SADNESS_RATE * 2 * (hours - toHungry))
  return { hunger, happiness, xp: v.xp, updatedAt: now }
}

export type Stage = 'baby' | 'kid' | 'teen' | 'grown'
const STAGES: [Stage, number][] = [
  ['baby', 0],
  ['kid', 60],
  ['teen', 220],
  ['grown', 600],
]

/** Growth is care, not age: a pet nobody plays with stays small. */
export function growth(xp: number) {
  let i = 0
  while (i + 1 < STAGES.length && xp >= STAGES[i + 1]![1]) i++
  const [stage, from] = STAGES[i]!
  const next = STAGES[i + 1]?.[1] ?? null
  return { stage, progress: next === null ? 1 : (xp - from) / (next - from), next }
}

export type Mood = 'hungry' | 'sad' | 'happy' | 'okay'
export function mood(v: Pick<Vitals, 'hunger' | 'happiness'>): Mood {
  if (v.hunger >= 80) return 'hungry'
  if (v.happiness < 30) return 'sad'
  if (v.happiness >= 70) return 'happy'
  return 'okay'
}

/**
 * One interaction. The reaction is decided here, not on the screen that sent
 * it, so a poke makes everyone's pet flinch the same way.
 */
export function care(
  v: Vitals,
  action: PetAction,
  options: { food?: Food; species: Species },
): { vitals: Vitals; reaction: Reaction } {
  const next = { ...v }
  let reaction: Reaction
  switch (action) {
    case 'feed': {
      if (v.hunger < 8) {
        reaction = 'full'
        break
      }
      const favourite = options.food === FAVOURITE[options.species]
      next.hunger = clamp(v.hunger - (favourite ? 40 : 28))
      next.happiness = clamp(v.happiness + (favourite ? 10 : 4))
      next.xp += favourite ? 6 : 4
      reaction = favourite ? 'love' : 'yum'
      break
    }
    case 'pet':
      next.happiness = clamp(v.happiness + 5)
      next.xp += 2
      reaction = 'purr'
      break
    case 'tickle':
      next.happiness = clamp(v.happiness + 4)
      next.xp += 2
      reaction = 'giggle'
      break
    case 'poke':
      /* A hit is a hit — every time, on every screen. What it builds up to is
         decided by `feel`, per person. */
      next.happiness = clamp(v.happiness - 4)
      reaction = 'ouch'
      break
    case 'play':
      if (v.hunger >= 85) {
        reaction = 'sulk'
        break
      }
      next.happiness = clamp(v.happiness + 10)
      next.hunger = clamp(v.hunger + 4)
      next.xp += 5
      reaction = 'play'
      break
    case 'talk':
      next.happiness = clamp(v.happiness + 2)
      next.xp += 1
      reaction = 'listen'
      break
    case 'sorry':
      reaction = 'listen'
      break
  }
  return { vitals: next, reaction }
}

/** A name somebody typed, made safe to show. */
export function petName(raw: unknown) {
  if (typeof raw !== 'string') return ''
  return raw.replace(/\s+/g, ' ').trim().slice(0, 20)
}

/*
 * Feelings: who it is upset with, and why.
 *
 * Grudges are per person. Hitting it builds one up against *you*; it fades on
 * its own with time, but the quick way back is yours to take — say sorry, then
 * show it with strokes and food. Someone else being nice to it is a comfort,
 * not an apology on your behalf.
 */

export type Grudge = {
  name: string
  /** How hurt, in whole points. One fades every few minutes after `at`. */
  hurt: number
  at: number
  /** Said sorry since the last hit — it will now take your strokes and food. */
  sorry: boolean
  /** Making up, after sorry: strokes and meals, counted towards forgiveness. */
  amends: number
}
export type Feelings = { grudges: Record<string, Grudge>; away: { until: number; because: string } | null }

export const GRUMPY_AT = 3
export const SULK_AT = 5
export const LEAVE_AT = 8
export const AWAY_MS = 20 * 60_000
/** One point of hurt fades every this long. */
const FADE_MS = 4 * 60_000
/** A stroke is one, a meal two, their favourite three. */
export const AMENDS_NEEDED = 4

export const noFeelings = (): Feelings => ({ grudges: {}, away: null })

/** Stored as JSON; anything unreadable is a pet with nothing on its mind. */
export function readFeelings(raw: string | null | undefined): Feelings {
  try {
    const parsed = JSON.parse(raw ?? '{}') as Partial<Feelings>
    return { grudges: parsed.grudges && typeof parsed.grudges === 'object' ? parsed.grudges : {}, away: parsed.away ?? null }
  } catch {
    return noFeelings()
  }
}

/** Feelings as of `now`: hurt faded, a walk-out over once its time is up. */
export function settle(f: Feelings, now: number): Feelings {
  const grudges: Record<string, Grudge> = {}
  for (const [id, g] of Object.entries(f.grudges)) {
    /* Whole points, each after a full fade period. Keeping the remainder in
       `at` means reading it often never slows the healing down, and a third
       hit a moment ago is still exactly three. */
    const steps = Math.floor(Math.max(0, now - g.at) / FADE_MS)
    const hurt = Math.max(0, g.hurt - steps)
    if (hurt > 0) grudges[id] = { ...g, hurt, at: g.at + steps * FADE_MS }
  }
  const away = f.away && f.away.until > now ? f.away : null
  return { grudges, away }
}

export type Pose = 'normal' | 'corner' | 'away'
export function pose(f: Feelings): Pose {
  if (f.away) return 'away'
  return Object.values(f.grudges).some((g) => g.hurt >= SULK_AT) ? 'corner' : 'normal'
}

const level = (hurt: number) => (hurt >= SULK_AT ? 'sulk' : hurt >= GRUMPY_AT ? 'grumpy' : 'wary')

/** Everyone it is upset with, worst first — for the screen to show, and to treat each viewer differently. */
export function grudgeList(f: Feelings) {
  return Object.entries(f.grudges)
    .filter(([, g]) => g.hurt >= 1)
    .sort(([, a], [, b]) => b.hurt - a.hurt)
    .map(([id, g]) => ({ id, name: g.name, level: level(g.hurt), sorry: g.sorry, amends: g.amends, need: AMENDS_NEEDED }))
}

/**
 * One interaction, through its feelings. Returns whether the care itself goes
 * ahead (it won't eat from someone it is not talking to), and the reaction
 * that wins over the plain one.
 */
export function feel(
  before: Feelings,
  by: { id: string; name: string },
  action: PetAction,
  now: number,
  favourite: boolean,
): { feelings: Feelings; allowed: boolean; reaction: Reaction | null } {
  const f = settle(before, now)
  const mine = f.grudges[by.id]
  const holding = mine && mine.hurt >= GRUMPY_AT

  /* Walked out. Only the person it walked out on can call it back. */
  if (f.away) {
    if (action === 'sorry' && f.away.because === by.id && mine) {
      mine.sorry = true
      mine.amends = 0
      return { feelings: { ...f, away: null }, allowed: false, reaction: 'sniff' }
    }
    return { feelings: f, allowed: false, reaction: 'away' }
  }

  if (action === 'poke') {
    const g: Grudge = mine ?? { name: by.name, hurt: 0, at: now, sorry: false, amends: 0 }
    g.hurt += 1
    g.at = now
    g.name = by.name
    /* Hitting it again takes back the apology. */
    g.sorry = false
    g.amends = 0
    f.grudges[by.id] = g
    if (g.hurt >= LEAVE_AT) return { feelings: { ...f, away: { until: now + AWAY_MS, because: by.id } }, allowed: true, reaction: 'leave' }
    if (g.hurt >= SULK_AT) return { feelings: f, allowed: true, reaction: 'sulk' }
    if (g.hurt >= GRUMPY_AT) return { feelings: f, allowed: true, reaction: 'grumpy' }
    return { feelings: f, allowed: true, reaction: 'ouch' }
  }

  if (action === 'sorry') {
    if (!mine || mine.hurt < 1) return { feelings: f, allowed: false, reaction: 'listen' }
    mine.sorry = true
    return { feelings: f, allowed: false, reaction: 'sniff' }
  }

  if (holding && !mine.sorry && action !== 'talk') {
    /* Not until you've said sorry. */
    return { feelings: f, allowed: false, reaction: 'turnaway' }
  }

  if (holding && (action === 'pet' || action === 'feed' || action === 'tickle' || action === 'play')) {
    mine.amends += action === 'feed' ? (favourite ? 3 : 2) : 1
    if (mine.amends >= AMENDS_NEEDED) {
      delete f.grudges[by.id]
      return { feelings: f, allowed: true, reaction: 'forgive' }
    }
    return { feelings: f, allowed: true, reaction: 'sniff' }
  }

  /* Upset with somebody else and sulking in the corner: kindness is a comfort. */
  if (pose(f) === 'corner' && action === 'pet') return { feelings: f, allowed: true, reaction: 'comfort' }
  return { feelings: f, allowed: true, reaction: null }
}
