import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'

import * as photos from '../models/photo.model.js'
import { assertMembership } from '../services/room.service.js'
import { UPLOAD_DIR, UPLOAD_ROUTE } from '../services/upload.service.js'
import { HttpError } from '../utils/HttpError.js'

/**
 * The photo booth's darkroom: takes a finished picture from the browser and
 * keeps it with the room.
 *
 * The browser does all the composing — the scene, the characters, the frame,
 * the caption — and sends one JPEG. Nothing here trusts what the upload says
 * it is: the bytes have to start like a JPEG, PNG or WebP, the name on disk is
 * ours, and the folder is the room's.
 */

export const MAX_PHOTO_BYTES = 6 * 1024 * 1024
export const FRAMES = ['polaroid', 'film', 'hearts', 'clean'] as const

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PHOTO_BYTES, files: 1, fields: 4 } })

export function receivePhoto(req: Request, res: Response, next: NextFunction) {
  upload.single('photo')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') return next(HttpError.badRequest('That photo is too big'))
    next(err)
  })
}

/** What the bytes actually are, whatever the request claimed. */
export function sniffImage(bytes: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return null
}

const folderFor = (roomId: string) => path.join(UPLOAD_DIR, 'photos', roomId.replace(/[^a-zA-Z0-9_-]/g, ''))
const urlFor = (roomId: string, file: string) => `${UPLOAD_ROUTE}/photos/${roomId.replace(/[^a-zA-Z0-9_-]/g, '')}/${file}`

export function present(roomId: string, row: NonNullable<photos.PhotoRow>) {
  return { ...row, url: urlFor(roomId, row.file) }
}

async function gate(req: Request) {
  const roomId = req.params.id!
  await assertMembership(req.userId!, roomId)
  return roomId
}

export async function list(req: Request, res: Response) {
  const roomId = await gate(req)
  const rows = await photos.listPhotos(roomId)
  res.json({ items: rows.map((r) => present(roomId, r)) })
}

export async function create(req: Request, res: Response) {
  const roomId = await gate(req)
  const file = req.file
  if (!file) throw HttpError.badRequest('No photo arrived')
  const kind = sniffImage(file.buffer)
  if (!kind) throw HttpError.badRequest('That isn’t a photo')

  const caption = typeof req.body?.caption === 'string' ? req.body.caption.replace(/\s+/g, ' ').trim().slice(0, 80) : ''
  const frame = FRAMES.includes(req.body?.frame) ? (req.body.frame as string) : 'clean'

  const id = randomUUID()
  const name = `${id}.${kind}`
  const folder = folderFor(roomId)
  await mkdir(folder, { recursive: true })
  await writeFile(path.join(folder, name), file.buffer)
  try {
    const row = await photos.createPhoto({ id, roomId, createdById: req.userId!, file: name, caption, frame })
    res.status(201).json({ item: present(roomId, row) })
  } catch (cause) {
    await rm(path.join(folder, name), { force: true })
    throw cause
  }
}

export async function remove(req: Request, res: Response) {
  const roomId = await gate(req)
  const file = await photos.removePhoto(roomId, req.params.photoId!, req.userId!)
  if (!file) throw HttpError.notFound('No such photo, or it isn’t yours to delete')
  await rm(path.join(folderFor(roomId), path.basename(file)), { force: true })
  res.json({ ok: true })
}
