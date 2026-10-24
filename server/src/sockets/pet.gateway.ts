import { randomUUID } from 'node:crypto'
import type { Server, Socket } from 'socket.io'

import * as pets from '../models/pet.model.js'
import { care, drift, FAVOURITE, feel, GRUMPY_AT, isAction, isFood, isSpecies, petName, type Food, type PetAction, type Reaction } from '../services/pet.rules.js'
import { presenceFor } from '../services/presence.service.js'
import { claim, readContext, suggest } from '../services/petSuggest.service.js'
import { socketUser } from './presence.gateway.js'
import { roomGuard } from './roomAuth.js'

/**
 * The room's pet, live.
 *
 * Everyone in the room shares one pet and sees it react to everyone else: a
 * poke from one screen makes it flinch on all of them, a meal fills one
 * stomach. The talking-back trick is relayed too — what you said, played back
 * squeaky on everyone's screen — as a short audio clip passed straight
 * through, never stored.
 */

type Person = { id: string; name: string }
type Ack = (reply: unknown) => void
const ackFrom = (maybe: unknown): Ack => (typeof maybe === 'function' ? (maybe as Ack) : () => undefined)

export type PetEvent = { id: string; roomId: string; by: Person; action: PetAction; reaction: Reaction; food: Food | null; at: number }

/** A clip of someone talking: a few seconds of Opus is well under this. */
export const MAX_VOICE_BYTES = 240_000

/** Eight interactions per four seconds — enough to mash, not enough to flood. */
function limiter(burst: number, windowMs: number) {
  let tokens = burst
  let refilled = Date.now()
  return () => {
    const now = Date.now()
    tokens = Math.min(burst, tokens + ((now - refilled) / windowMs) * burst)
    refilled = now
    if (tokens < 1) return false
    tokens -= 1
    return true
  }
}

/**
 * One write at a time per room. Two people feeding at the same moment would
 * otherwise both read "hungry", both write "fed", and one meal would vanish.
 */
const queues = new Map<string, Promise<unknown>>()
function serial<T>(roomId: string, job: () => Promise<T>): Promise<T> {
  const run = (queues.get(roomId) ?? Promise.resolve()).then(job, job)
  const tail = run.catch(() => undefined)
  queues.set(roomId, tail)
  void tail.then(() => {
    if (queues.get(roomId) === tail) queues.delete(roomId)
  })
  return run
}

/** One interaction, start to finish: feelings first, then the care they allow. */
function interact(io: Server, roomId: string, by: Person, action: PetAction, food: Food | null) {
  return serial(roomId, async () => {
    const row = await pets.findPet(roomId)
    if (!row) return { error: 'No pet yet' }
    const now = Date.now()
    const species = row.species as keyof typeof FAVOURITE
    const felt = feel(pets.feelingsOf(row, now), by, action, now, food === FAVOURITE[species])
    let vitals = drift(pets.vitalsOf(row), now)
    let reaction: Reaction = felt.reaction ?? 'listen'
    if (felt.allowed) {
      const cared = care(vitals, action, { food: food ?? undefined, species })
      vitals = cared.vitals
      reaction = felt.reaction ?? cared.reaction
    }
    await pets.savePet(roomId, vitals, undefined, felt.feelings)
    const event: PetEvent = { id: randomUUID(), roomId, by, action, reaction, food, at: now }
    io.to(roomId).emit('pet:state', { roomId, pet: pets.snapshot(row, vitals, felt.feelings) })
    io.to(roomId).emit('pet:event', event)
    return { ok: true, reaction }
  })
}

/**
 * "sorry" typed in the room's chat counts as saying it to the pet — but only
 * from someone it is actually upset with, so ordinary apologies between
 * people don't make it perk up for no reason.
 */
export async function petHearsSorry(io: Server, roomId: string, by: Person, text: string) {
  if (!/\b(sorry|sry|soz|sowwy|maaf|maafi)\b/i.test(text)) return
  const row = await pets.findPet(roomId)
  if (!row) return
  const f = pets.feelingsOf(row, Date.now())
  const mine = f.grudges[by.id]
  if (!mine || mine.sorry || (mine.hurt < GRUMPY_AT && f.away?.because !== by.id)) return
  await interact(io, roomId, by, 'sorry', null)
}

export function attachPetGateway(io: Server) {
  io.on('connection', (socket: Socket) => {
    const state = socketUser(socket)
    if (!state) return
    const self: Person = { id: state.userId, name: state.name }
    const may = roomGuard(socket, self.id)
    const allow = limiter(8, 4000)
    const allowVoice = limiter(3, 6000)

    socket.on('pet:get', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const roomId = await may((raw as { roomId?: unknown } | null)?.roomId)
      if (!roomId) return ack({ error: 'Not in this room' })
      ack({ pet: await pets.currentPet(roomId) })
    })

    socket.on('pet:adopt', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId) return ack({ error: 'Not in this room' })
      if (!isSpecies(body.species)) return ack({ error: 'Pick who to adopt' })
      const name = petName(body.name)
      if (!name) return ack({ error: 'Give them a name' })
      await serial(roomId, async () => {
        const { created } = await pets.adoptPet(roomId, body.species as never, name)
        const pet = await pets.currentPet(roomId)
        io.to(roomId).emit('pet:state', { roomId, pet, adoptedBy: created ? self : null })
        ack(created ? { ok: true, pet } : { error: 'This room already has a pet', pet })
      })
    })

    socket.on('pet:act', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId || !isAction(body.action)) return ack({ error: 'Not in this room' })
      if (!allow()) return ack({ error: 'Easy — give them a second' })
      const action = body.action
      const food = action === 'feed' ? (isFood(body.food) ? body.food : 'cookie') : null

      const result = await interact(io, roomId, self, action, food)
      ack(result)
    })

    /*
     * A suggestion, in the pet's words, for this person only. The room's
     * budget is claimed before the model is asked, so two screens asking at
     * once never pay twice; a skipped turn just means the pet stays quiet.
     */
    socket.on('pet:suggest', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId) return ack({ error: 'Not in this room' })
      const context = readContext(body)
      if (!context) return ack({ skip: 'unknown moment' })
      const pet = await pets.currentPet(roomId)
      if (!pet || pet.pose !== 'normal') return ack({ skip: 'not now' })
      if (!claim(roomId, Date.now())) return ack({ skip: 'too soon' })
      const present = presenceFor(roomId).map((p) => p.name)
      const suggestion = await suggest(roomId, pet, self, present, context)
      ack(suggestion ? { suggestion: { id: randomUUID(), ...suggestion } } : { skip: 'quiet' })
    })

    socket.on('pet:rename', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      const name = petName(body.name)
      if (!roomId || !name) return ack({ error: 'Give them a name' })
      await serial(roomId, async () => {
        const row = await pets.findPet(roomId)
        if (!row) return ack({ error: 'No pet yet' })
        const now = Date.now()
        const v = drift(pets.vitalsOf(row), now)
        const saved = await pets.savePet(roomId, v, name)
        io.to(roomId).emit('pet:state', { roomId, pet: pets.snapshot(saved, v, pets.feelingsOf(row, now)) })
        ack({ ok: true })
      })
    })

    /*
     * The pet repeating you. The clip goes to everyone else in the room as-is;
     * each screen plays it back pitched up itself. The sender already heard it
     * locally, so it is not echoed back to them.
     */
    socket.on('pet:voice', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId) return ack({ error: 'Not in this room' })
      const audio = body.audio
      const bytes = Buffer.isBuffer(audio) ? audio.length : audio instanceof ArrayBuffer ? audio.byteLength : -1
      const mime = typeof body.mime === 'string' ? body.mime : ''
      if (bytes <= 0 || bytes > MAX_VOICE_BYTES || !/^audio\/[a-z0-9.+-]+(;.*)?$/i.test(mime)) return ack({ error: 'That clip won’t play' })
      if (!allowVoice()) return ack({ error: 'Easy — give them a second' })
      if (!(await pets.findPet(roomId))) return ack({ error: 'No pet yet' })
      socket.to(roomId).emit('pet:voice', { id: randomUUID(), roomId, by: self, audio, mime: mime.slice(0, 80) })
      ack({ ok: true })
    })
  })
}
