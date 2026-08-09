import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import multer from 'multer'

import { HttpError } from '../utils/HttpError.js'

/**
 * Uploaded video, stored on disk.
 *
 * A file the user picks locally cannot simply be played by the room: an object
 * URL only exists in the browser that made it, so everyone else would see a
 * dead link. For "watch this together" to mean anything the bytes have to leave
 * the machine, which is what this is for.
 *
 * Disk, not the database. SQLite would happily take a 700MB blob and then make
 * every unrelated query slower for the privilege.
 */

export const UPLOAD_DIR = path.resolve(import.meta.dirname, '../../uploads')
export const UPLOAD_ROUTE = '/uploads'

if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true })

/** What a browser can actually play back in a `<video>` element. */
const PLAYABLE = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
])

const MAX_BYTES = 2 * 1024 * 1024 * 1024

const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, UPLOAD_DIR),
  filename: (_req, file, done) => {
    /*
     * Never trust the supplied name for the path. A crafted `originalname`
     * containing `../` would otherwise write wherever it liked; the extension
     * is the only part worth keeping, and it is whitelisted.
     */
    const ext = path.extname(file.originalname).toLowerCase()
    const safeExt = /^\.(mp4|webm|ogv|ogg|mov|m4v)$/.test(ext) ? ext : '.mp4'
    const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    done(null, `${unique}${safeExt}`)
  },
})

export const videoUpload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, done) => {
    if (PLAYABLE.has(file.mimetype)) return done(null, true)
    done(
      HttpError.badRequest(
        "That file type can't be played in a browser. Use MP4, WebM, or MOV.",
      ),
    )
  },
})

/** Human-readable size cap, so the client can say the limit rather than guess. */
export const MAX_UPLOAD_MB = Math.round(MAX_BYTES / (1024 * 1024))
