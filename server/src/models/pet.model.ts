import { prisma } from './prisma.js'
import { drift, growth, mood, type Species, type Vitals } from '../services/pet.rules.js'

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
}

type Row = { name: string; species: string; bornAt: Date; hunger: number; happiness: number; xp: number; updatedAt: Date }

export function vitalsOf(row: Row): Vitals {
  return { hunger: row.hunger, happiness: row.happiness, xp: row.xp, updatedAt: row.updatedAt.getTime() }
}

export function snapshot(row: Pick<Row, 'name' | 'species' | 'bornAt'>, v: Vitals): PetSnapshot {
  const grown = growth(v.xp)
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
  }
}

export async function findPet(roomId: string) {
  return prisma.roomPet.findUnique({ where: { roomId } })
}

export async function currentPet(roomId: string): Promise<PetSnapshot | null> {
  const row = await findPet(roomId)
  if (!row) return null
  return snapshot(row, drift(vitalsOf(row), Date.now()))
}

/** First come, first served: a room has one pet, and adopting again does nothing. */
export async function adoptPet(roomId: string, species: Species, name: string) {
  const existing = await findPet(roomId)
  if (existing) return { row: existing, created: false }
  const row = await prisma.roomPet.create({ data: { roomId, species, name } })
  return { row, created: true }
}

export async function savePet(roomId: string, v: Vitals, name?: string) {
  return prisma.roomPet.update({
    where: { roomId },
    data: { hunger: v.hunger, happiness: v.happiness, xp: v.xp, updatedAt: new Date(v.updatedAt), ...(name ? { name } : {}) },
  })
}
