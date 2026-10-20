import { prisma } from './prisma.js'

/**
 * Photo booth pictures, kept per room.
 *
 * The image itself is a file under uploads/photos/<roomId>/; the row is what
 * the memory wall lists. Deleting a row deletes the file with it, so nothing
 * lingers that the room can no longer see.
 */

const photoSelect = {
  id: true,
  file: true,
  caption: true,
  frame: true,
  createdAt: true,
  createdBy: { select: { id: true, name: true } },
} as const

export type PhotoRow = Awaited<ReturnType<typeof findPhoto>>

export function createPhoto(input: { id: string; roomId: string; createdById: string; file: string; caption: string; frame: string }) {
  return prisma.photo.create({ data: input, select: photoSelect })
}

export function findPhoto(roomId: string, id: string) {
  return prisma.photo.findFirst({ where: { id, roomId }, select: photoSelect })
}

export function listPhotos(roomId: string, take = 200) {
  return prisma.photo.findMany({ where: { roomId }, orderBy: { createdAt: 'desc' }, take, select: photoSelect })
}

/** By whoever took it, or the room's owner. Returns the file to delete, or null. */
export async function removePhoto(roomId: string, id: string, userId: string) {
  const photo = await prisma.photo.findFirst({
    where: { id, roomId },
    select: { file: true, createdById: true, room: { select: { ownerId: true } } },
  })
  if (!photo || (photo.createdById !== userId && photo.room.ownerId !== userId)) return null
  await prisma.photo.delete({ where: { id } })
  return photo.file
}
