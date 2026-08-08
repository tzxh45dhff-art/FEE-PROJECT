import type { RoomType } from '../config/env.js'
import * as roomModel from '../models/room.model.js'
import type { RoomWithMembers } from '../models/room.model.js'
import { HttpError } from '../utils/HttpError.js'
import { slugify } from '../utils/slug.js'
import { presenceFor } from './presence.service.js'

/** Database row → the shape the client consumes, with live presence folded in. */
export function serialiseRoom(room: RoomWithMembers) {
  return {
    id: room.id,
    slug: room.slug,
    name: room.name,
    type: room.type,
    createdAt: room.createdAt,
    ownerId: room.ownerId,
    members: room.members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      role: member.role,
      joinedAt: member.joinedAt,
      lastSeen: member.lastSeen,
    })),
    /** Ids of members with a socket open, from the presence map not the DB. */
    online: presenceFor(room.id).map((present) => present.userId),
  }
}

export async function listRooms(userId: string) {
  const rooms = await roomModel.findRoomsForUser(userId)
  return rooms.map(serialiseRoom)
}

export async function createRoom(userId: string, input: { name: string; type: RoomType }) {
  const room = await roomModel.createRoom({
    name: input.name,
    type: input.type,
    slug: slugify(input.name),
    ownerId: userId,
  })
  return serialiseRoom(room)
}

export async function getRoom(userId: string, roomId: string) {
  const room = await roomModel.findRoomById(roomId)
  if (!room) throw HttpError.notFound('Room not found')

  // Membership is the read permission — don't leak who else is in a room.
  const isMember = room.members.some((member) => member.user.id === userId)
  if (!isMember) throw HttpError.forbidden('You are not in this room')

  return serialiseRoom(room)
}

export async function joinRoom(userId: string, roomId: string) {
  const room = await roomModel.findRoomById(roomId)
  if (!room) throw HttpError.notFound('Room not found')

  await roomModel.joinRoom(userId, roomId)

  const updated = await roomModel.findRoomById(roomId)
  return serialiseRoom(updated!)
}

/**
 * Join by the code people actually pass around — the slug, not the internal id.
 *
 * Deliberately not membership-gated: this *is* how you become a member. Holding
 * the code is the permission, which is the same model as an invite link.
 */
export async function joinRoomByCode(userId: string, code: string) {
  const slug = code.trim().toLowerCase()
  const room = await roomModel.findRoomBySlug(slug)
  if (!room) throw HttpError.notFound('No room with that code')

  await roomModel.joinRoom(userId, room.id)

  const updated = await roomModel.findRoomById(room.id)
  return serialiseRoom(updated!)
}

/** Used by the socket gateway to gate presence on membership. */
export async function assertMembership(userId: string, roomId: string) {
  const membership = await roomModel.findMembership(userId, roomId)
  if (!membership) throw HttpError.forbidden('You are not in this room')
  await roomModel.touchMembership(membership.id)
  return membership
}
