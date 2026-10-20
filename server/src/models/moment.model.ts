import { prisma } from './prisma.js'

const momentSelect = {
  id: true,
  itemId: true,
  title: true,
  position: true,
  emoji: true,
  note: true,
  createdAt: true,
  createdBy: { select: { id: true, name: true } },
} as const

export type MomentRow = Awaited<ReturnType<typeof createMoment>>

export function createMoment(input: {
  roomId: string
  createdById: string
  itemId: string | null
  title: string
  position: number
  emoji: string
  note: string
}) {
  return prisma.moment.create({ data: input, select: momentSelect })
}

/** A film's moments in the order they happen, or the room's latest if no film. */
export function listMoments(roomId: string, itemId: string | null) {
  return itemId
    ? prisma.moment.findMany({ where: { roomId, itemId }, orderBy: { position: 'asc' }, select: momentSelect })
    : prisma.moment.findMany({ where: { roomId }, orderBy: { createdAt: 'desc' }, take: 100, select: momentSelect })
}

/**
 * Remove a moment — by the person who pinned it, or by the room's owner.
 * Returns whether anything was removed, so a stranger's request is a no-op.
 */
export async function removeMoment(roomId: string, momentId: string, userId: string) {
  const moment = await prisma.moment.findFirst({
    where: { id: momentId, roomId },
    select: { createdById: true, room: { select: { ownerId: true } } },
  })
  if (!moment) return false
  if (moment.createdById !== userId && moment.room.ownerId !== userId) return false
  await prisma.moment.delete({ where: { id: momentId } })
  return true
}
