import { randomInt, randomUUID } from 'node:crypto'
import type { Server, Socket } from 'socket.io'

import {
  EIGHT_BALL,
  FORTUNES,
  isEmote,
  isMomentFace,
  isReaction,
  isThrowable,
  isToy,
  type Emote,
  type Throwable,
  type Toy,
} from '../services/fun.catalog.js'
import * as moments from '../models/moment.model.js'
import { presenceFor } from '../services/presence.service.js'
import { socketUser } from './presence.gateway.js'
import { roomGuard } from './roomAuth.js'

/**
 * The small, silly things people do while standing around in a room together:
 * emotes, throwing things at each other, and a handful of toys.
 *
 * All of it is ephemeral. Nothing here is written to the database — an emote is
 * worth something for the two seconds it is on screen and nothing afterwards —
 * so it is relayed over the room's existing socket channel (the one presence
 * joins every member to) and forgotten.
 *
 * Two things the server owns rather than trusts:
 *
 * - **Randomness.** A die rolled on one machine and reported to the others is a
 *   die anyone can load. Rolls, flips, spins and fortunes are decided here and
 *   broadcast, so everyone sees the same number and nobody gets to choose it.
 * - **The target of a throw.** It has to be somebody actually present, so a
 *   client cannot aim at a user who isn't there, or at an id that isn't one.
 */

/** Most events any one socket may send per window. Generous for real use. */
const BURST = 12
const WINDOW_MS = 4000

/**
 * A token bucket per socket.
 *
 * Mashing an emote key is a normal thing to do and should mostly work; holding
 * one down with a script should not paint fifty hearts a second onto everyone
 * else's screen. Excess events are dropped silently — there is nothing useful
 * to tell someone who is spamming.
 */
function limiter() {
  let tokens = BURST
  let refilled = Date.now()
  return () => {
    const now = Date.now()
    tokens = Math.min(BURST, tokens + ((now - refilled) / WINDOW_MS) * BURST)
    refilled = now
    if (tokens < 1) return false
    tokens -= 1
    return true
  }
}

type Person = { id: string; name: string }

type Ack = (reply: unknown) => void

/** Socket.IO acks are optional on the client; never assume one was passed. */
const ackFrom = (maybe: unknown): Ack => (typeof maybe === 'function' ? (maybe as Ack) : () => undefined)

export type EmoteEvent = { id: string; roomId: string; from: Person; emote: Emote; at: number }
export type ThrowEvent = { id: string; roomId: string; from: Person; to: Person; item: Throwable; at: number }
export type ToyResult =
  | { toy: 'dice'; values: number[] }
  | { toy: 'coin'; side: 'heads' | 'tails' }
  | { toy: 'bottle'; target: Person; turns: number }
  | { toy: 'fortune'; text: string }
  | { toy: 'eightball'; question: string; text: string }
export type ToyEvent = { id: string; roomId: string; from: Person; at: number } & ToyResult

const pick = <T>(list: readonly T[]): T => list[randomInt(list.length)]!

/** Who is in the room right now, one entry per person however many tabs. */
function present(roomId: string): Person[] {
  return presenceFor(roomId).map((p) => ({ id: p.userId, name: p.name }))
}

/** Decide a toy's outcome. Exported for the tests, which pin its ranges. */
export function playToy(toy: Toy, raw: Record<string, unknown>, roomId: string, self: Person): ToyResult {
  switch (toy) {
    case 'dice': {
      const count = raw.count === 2 ? 2 : 1
      return { toy, values: Array.from({ length: count }, () => randomInt(1, 7)) }
    }
    case 'coin':
      return { toy, side: randomInt(2) === 0 ? 'heads' : 'tails' }
    case 'bottle': {
      /* Points at anyone but the spinner when there is anyone else; alone in
         a room it can only point back at you, which is its own small joke. */
      const others = present(roomId).filter((p) => p.id !== self.id)
      return { toy, target: others.length ? pick(others) : self, turns: 3 + randomInt(3) }
    }
    case 'fortune':
      return { toy, text: pick(FORTUNES) }
    case 'eightball': {
      const question = typeof raw.question === 'string' ? raw.question.trim().slice(0, 140) : ''
      return { toy, question, text: pick(EIGHT_BALL) }
    }
  }
}

export function attachFunGateway(io: Server) {
  io.on('connection', (socket: Socket) => {
    const state = socketUser(socket)
    if (!state) return

    const self: Person = { id: state.userId, name: state.name }
    const may = roomGuard(socket, self.id)
    const allow = limiter()

    socket.on('fun:emote', async (raw: unknown) => {
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId || !isEmote(body.emote) || !allow()) return

      const event: EmoteEvent = { id: randomUUID(), roomId, from: self, emote: body.emote, at: Date.now() }
      io.to(roomId).emit('fun:emote', event)
    })

    socket.on('fun:throw', async (raw: unknown) => {
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId || !isThrowable(body.item) || !allow()) return

      const target = present(roomId).find((p) => p.id === body.to)
      /* Only at somebody who is actually here, and never at yourself — a rose
         thrown at your own head is not a feature. */
      if (!target || target.id === self.id) return

      const event: ThrowEvent = {
        id: randomUUID(),
        roomId,
        from: self,
        to: target,
        item: body.item,
        at: Date.now(),
      }
      io.to(roomId).emit('fun:throw', event)
    })

    socket.on('fun:toy', async (raw: unknown) => {
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId || !isToy(body.toy) || !allow()) return

      const event: ToyEvent = {
        id: randomUUID(),
        roomId,
        from: self,
        at: Date.now(),
        ...playToy(body.toy, body, roomId, self),
      }
      io.to(roomId).emit('fun:toy', event)
    })

    /*
     * Reactions over a film. Same shape as an emote, but a separate event: they
     * are drawn over the video rather than over someone's head, and they keep
     * coming while the hub is covered by the stage.
     */
    socket.on('fun:react', async (raw: unknown) => {
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId || !isReaction(body.reaction) || !allow()) return
      io.to(roomId).emit('fun:react', { id: randomUUID(), roomId, from: self, reaction: body.reaction, at: Date.now() })
    })

    /*
     * Moments: a timestamp somebody pinned, with a face and a line.
     *
     * Over the socket with an acknowledgement rather than REST, because the
     * thing that matters is everybody else seeing the pin appear at once —
     * and the socket is already the room's broadcast channel.
     */
    socket.on('moment:add', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId) return ack({ ok: false, error: 'Not in this room' })
      if (!allow()) return ack({ ok: false, error: 'Slow down a little' })

      const title = typeof body.title === 'string' ? body.title.trim().slice(0, 200) : ''
      const position = typeof body.position === 'number' ? body.position : NaN
      const note = typeof body.note === 'string' ? body.note.trim().slice(0, 120) : ''
      const itemId = typeof body.itemId === 'string' && body.itemId.length <= 64 ? body.itemId : null
      if (!title || !Number.isFinite(position) || position < 0 || position > 86_400 || !isMomentFace(body.emoji)) {
        return ack({ ok: false, error: 'That moment could not be pinned' })
      }

      const moment = await moments.createMoment({
        roomId,
        createdById: self.id,
        itemId,
        title,
        position,
        emoji: body.emoji,
        note,
      })
      io.to(roomId).emit('moment:added', { roomId, moment })
      ack({ ok: true, moment })
    })

    socket.on('moment:list', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId) return ack({ ok: false, moments: [] })
      const itemId = typeof body.itemId === 'string' ? body.itemId : null
      ack({ ok: true, moments: await moments.listMoments(roomId, itemId) })
    })

    socket.on('moment:remove', async (raw: unknown, maybeAck: unknown) => {
      const ack = ackFrom(maybeAck)
      const body = (raw ?? {}) as Record<string, unknown>
      const roomId = await may(body.roomId)
      if (!roomId || typeof body.momentId !== 'string') return ack({ ok: false })
      const removed = await moments.removeMoment(roomId, body.momentId, self.id)
      if (removed) io.to(roomId).emit('moment:removed', { roomId, momentId: body.momentId })
      ack({ ok: removed })
    })
  })
}
