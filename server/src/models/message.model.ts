import { prisma } from './prisma.js'

const messageSelect = {
  id: true,
  body: true,
  createdAt: true,
  author: { select: { id: true, name: true } },
} as const

/**
 * The tail of the conversation.
 *
 * Fetched newest-first so the limit takes the *recent* messages rather than the
 * oldest ones, then flipped back into reading order.
 */
export async function recentMessages(roomId: string, limit = 60) {
  const rows = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: messageSelect,
  })
  return rows.reverse()
}

export function createMessage(input: { roomId: string; authorId: string; body: string }) {
  return prisma.message.create({ data: input, select: messageSelect })
}

/** One message, only if it is in this room. */
export function findMessage(id: string, roomId: string) {
  return prisma.message.findFirst({ where: { id, roomId }, select: { id: true, authorId: true } })
}

export function deleteMessage(id: string) {
  return prisma.message.delete({ where: { id } })
}

/** The whole conversation, gone — for everyone in the room. */
export function clearMessages(roomId: string) {
  return prisma.message.deleteMany({ where: { roomId } })
}

export async function isRoomOwner(roomId: string, userId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId }, select: { ownerId: true } })
  return room?.ownerId === userId
}
