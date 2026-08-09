import { prisma } from './prisma.js'

/** Every query that returns a room pulls its members in this shape. */
export const memberSelect = {
  select: {
    role: true,
    joinedAt: true,
    lastSeen: true,
    user: { select: { id: true, name: true, email: true } },
  },
} as const

export type RoomWithMembers = {
  id: string
  slug: string
  name: string
  type: string
  createdAt: Date
  ownerId: string
  members: {
    role: string
    joinedAt: Date
    lastSeen: Date
    user: { id: string; name: string; email: string }
  }[]
}

export function createRoom(data: {
  name: string
  type: string
  slug: string
  ownerId: string
}): Promise<RoomWithMembers> {
  return prisma.room.create({
    data: {
      ...data,
      // The creator is a member from the moment the room exists.
      members: { create: { userId: data.ownerId, role: 'owner' } },
    },
    include: { members: memberSelect },
  })
}

export function findRoomById(id: string): Promise<RoomWithMembers | null> {
  return prisma.room.findUnique({ where: { id }, include: { members: memberSelect } })
}

/** The slug is the room code people share, so joining resolves through it. */
export function findRoomBySlug(slug: string): Promise<RoomWithMembers | null> {
  return prisma.room.findUnique({ where: { slug }, include: { members: memberSelect } })
}

/** Rooms the user belongs to, most recently active first. */
export async function findRoomsForUser(userId: string): Promise<RoomWithMembers[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    orderBy: { lastSeen: 'desc' },
    select: { room: { include: { members: memberSelect } } },
  })
  return memberships.map((membership) => membership.room)
}

/**
 * Every room, for the public directory.
 *
 * Newest first and capped, because this is a browse list rather than a search —
 * an unbounded query here would grow into the slowest request in the app.
 */
export function findAllRooms(limit = 60): Promise<RoomWithMembers[]> {
  return prisma.room.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { members: memberSelect },
  })
}

export function findMembership(userId: string, roomId: string) {
  return prisma.membership.findUnique({ where: { userId_roomId: { userId, roomId } } })
}

export function joinRoom(userId: string, roomId: string) {
  return prisma.membership.upsert({
    where: { userId_roomId: { userId, roomId } },
    create: { userId, roomId },
    update: { lastSeen: new Date() },
  })
}

export function touchMembership(id: string) {
  return prisma.membership.update({ where: { id }, data: { lastSeen: new Date() } })
}
