import { prisma } from './prisma.js'
import { drift, grudgeList, growth, mood, pose, readFeelings, settle, type Feelings, type Species, type Vitals } from '../services/pet.rules.js'

/**
 * The room's pet in the database, and as the screen receives it.
 *
 * Reads always return the vitals drifted to now, so whoever opens the room
 * first after a long gap sees the pet as hungry as it actually is.
 */

export type PetSnapshot = {
  name: string
  species: Species
  bornAt: number
  hunger: number
  happiness: number
  xp: number
  stage: ReturnType<typeof growth>['stage']
  progress: number
  mood: ReturnType<typeof mood>
  /** Where it is: out and about, sulking in the corner, or gone for a while. */
  pose: ReturnType<typeof pose>
  /** While it is away: when it comes back by itself, and who it left because of. */
  away: { until: number; because: { id: string; name: string } } | null
  /** Who it is upset with, worst first; each screen treats its own viewer accordingly. */
  grudges: ReturnType<typeof grudgeList>
}

type Row = { name: string; species: string; bornAt: Date; hunger: number; happiness: number; xp: number; updatedAt: Date; feelings?: string }

export function vitalsOf(row: Row): Vitals {
  return { hunger: row.hunger, happiness: row.happiness, xp: row.xp, updatedAt: row.updatedAt.getTime() }
}

export const feelingsOf = (row: Pick<Row, 'feelings'>, now: number) => settle(readFeelings(row.feelings), now)

export function snapshot(row: Pick<Row, 'name' | 'species' | 'bornAt'>, v: Vitals, f: Feelings): PetSnapshot {
  const grown = growth(v.xp)
  const because = f.away ? f.grudges[f.away.because] : undefined
  return {
    name: row.name,
    species: row.species as Species,
    bornAt: row.bornAt.getTime(),
    hunger: Math.round(v.hunger),
    happiness: Math.round(v.happiness),
    xp: v.xp,
    stage: grown.stage,
    progress: grown.progress,
    mood: mood(v),
    pose: pose(f),
    away: f.away ? { until: f.away.until, because: { id: f.away.because, name: because?.name ?? 'someone' } } : null,
    grudges: grudgeList(f),
  }
}

export async function findPet(roomId: string) {
  return prisma.roomPet.findUnique({ where: { roomId } })
}

export async function currentPet(roomId: string): Promise<PetSnapshot | null> {
  const row = await findPet(roomId)
  if (!row) return null
  const now = Date.now()
  return snapshot(row, drift(vitalsOf(row), now), feelingsOf(row, now))
}

/** First come, first served: a room has one pet, and adopting again does nothing. */
export async function adoptPet(roomId: string, species: Species, name: string) {
  const existing = await findPet(roomId)
  if (existing) return { row: existing, created: false }
  const row = await prisma.roomPet.create({ data: { roomId, species, name } })
  return { row, created: true }
}

export async function savePet(roomId: string, v: Vitals, name?: string, feelings?: Feelings) {
  return prisma.roomPet.update({
    where: { roomId },
    data: {
      hunger: v.hunger,
      happiness: v.happiness,
      xp: v.xp,
      updatedAt: new Date(v.updatedAt),
      ...(name ? { name } : {}),
      ...(feelings ? { feelings: JSON.stringify(feelings) } : {}),
    },
  })
}
