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

export const ACTIONS = ['feed', 'pet', 'poke', 'tickle', 'play', 'talk'] as const
export type PetAction = (typeof ACTIONS)[number]

export type Reaction = 'yum' | 'love' | 'full' | 'purr' | 'ouch' | 'giggle' | 'grumpy' | 'play' | 'listen' | 'sulk'

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
  options: { food?: Food; species: Species; random: (n: number) => number },
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
      reaction = v.happiness < 30 && options.random(3) === 0 ? 'sulk' : 'purr'
      break
    case 'tickle':
      next.happiness = clamp(v.happiness + 4)
      next.xp += 2
      reaction = 'giggle'
      break
    case 'poke': {
      /* Mostly it's funny. Sometimes it's had enough. */
      const roll = options.random(10)
      reaction = roll < 5 ? 'ouch' : roll < 8 ? 'giggle' : 'grumpy'
      next.happiness = clamp(v.happiness + (reaction === 'grumpy' ? -2 : 1))
      next.xp += 1
      break
    }
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
  }
  return { vitals: next, reaction }
}

/** A name somebody typed, made safe to show. */
export function petName(raw: unknown) {
  if (typeof raw !== 'string') return ''
  return raw.replace(/\s+/g, ' ').trim().slice(0, 20)
}
