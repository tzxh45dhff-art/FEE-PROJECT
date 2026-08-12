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

/**
 * Containers a `<video>` element will actually accept.
 *
 * `.mkv` and `.avi` are deliberately absent. They are perfectly good
 * containers and browsers largely refuse them anyway — Safari flatly, the
 * others unreliably — so treating them as playable would produce a file that
 * appears in the list and then silently fails for one person in the room.
 */
const PLAYABLE_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v)$/i
/** Recognised as video, so a dropped-in file can be listed and explained. */
const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v|mkv|avi|wmv|flv|ts|m2ts)$/i

export type LibraryEntry = {
  /** Filename on disk, which is also the id — the directory is the source of truth. */
  file: string
  title: string
  /** Server-relative path, ready for the queue. */
  ref: string
  bytes: number
  /** False for containers no browser will play; the client says why. */
  playable: boolean
  modifiedAt: number
}

function prettyTitle(file: string) {
  return (
    path
      .parse(file)
      .name.replace(/[._]+/g, ' ')
      /* Upload-generated names look like `mslqfvrt-98vy5ew8` — leave those
         alone rather than mangling them into fake words. */
      .trim() || file
  )
}

/**
 * Everything sitting in the uploads folder.
 *
 * Read from disk on request rather than tracked in the database, because the
 * folder *is* the interface: dropping a file in with Finder or `scp` should
 * make it appear, and deleting it should make it vanish, with nothing to keep
 * in sync and no rows left pointing at files that no longer exist.
 */
export async function listLibrary(): Promise<LibraryEntry[]> {
  const { readdir, stat } = await import('node:fs/promises')

  let names: string[]
  try {
    names = await readdir(UPLOAD_DIR)
  } catch {
    return []
  }

  const entries = await Promise.all(
    names
      .filter((name) => !name.startsWith('.') && VIDEO_EXT.test(name))
      .map(async (name) => {
        try {
          const info = await stat(path.join(UPLOAD_DIR, name))
          if (!info.isFile()) return null

          return {
            file: name,
            title: prettyTitle(name),
            /* `encodeURIComponent` on the name only — a movie called
               "Blade Runner (1982).mp4" is a perfectly ordinary thing to drop
               in, and spaces and brackets have to survive the URL. */
            ref: `${UPLOAD_ROUTE}/${encodeURIComponent(name)}`,
            bytes: info.size,
            playable: PLAYABLE_EXT.test(name),
            modifiedAt: info.mtimeMs,
          } satisfies LibraryEntry
        } catch {
          return null
        }
      }),
  )

  /* Newest first: the thing you just dropped in is the thing you want. */
  return entries
    .filter((entry): entry is LibraryEntry => entry !== null)
    .sort((a, b) => b.modifiedAt - a.modifiedAt)
}
