import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { rename, rm } from 'node:fs/promises'
import path from 'node:path'
import type { NextFunction, Request, Response } from 'express'
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

/**
 * What a browser can play in an `<audio>` element.
 *
 * Kept apart from the video list because the two upload routes accept
 * different things: dropping an MP3 into the watch queue is a mistake worth
 * catching, and so is dropping a film into the listening queue.
 *
 * FLAC is in here and AAC-in-ADTS is not, for the same reason: what matters is
 * whether the browsers people actually use will decode it, not whether the
 * container is respectable.
 */
const PLAYABLE_AUDIO = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/opus',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
])

const MAX_BYTES = 2 * 1024 * 1024 * 1024

/**
 * Marks a file as still arriving.
 *
 * An upload is written under a dot-prefixed `.part` name and only renamed into
 * place once the whole request has come through. The two halves of that name
 * both earn their keep: `listLibrary` already skips dotfiles, so a transfer in
 * flight can never appear in the library — and the suffix makes a leftover
 * obviously junk rather than a video someone deliberately dropped in.
 */
const PART_SUFFIX = '.part'
const inProgressName = (final: string) => `.${final}${PART_SUFFIX}`
const finalName = (part: string) => part.replace(/^\./, '').replace(/\.part$/, '')

/** Absolute path each request is currently writing to, for cleanup on abort. */
const partials = new WeakMap<Request, string>()

const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, UPLOAD_DIR),
  filename: (req, file, done) => {
    /*
     * Never trust the supplied name for the path. A crafted `originalname`
     * containing `../` would otherwise write wherever it liked; the extension
     * is the only part worth keeping, and it is whitelisted.
     */
    const ext = path.extname(file.originalname).toLowerCase()
    const audio = file.mimetype.startsWith('audio/')
    const allowed = audio
      ? /^\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|weba)$/
      : /^\.(mp4|webm|ogv|ogg|mov|m4v)$/
    /* Falling back to the family's most universal container rather than
       refusing: the mimetype has already been checked by `fileFilter`, so an
       odd extension is a naming quirk, not a rejection. */
    const safeExt = allowed.test(ext) ? ext : audio ? '.mp3' : '.mp4'
    const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

    const name = inProgressName(`${unique}${safeExt}`)
    /* Recorded here because multer only hands back `req.file` on success, and
       the failure this protects against is precisely the one where it never
       does. */
    partials.set(req, path.join(UPLOAD_DIR, name))
    done(null, name)
  },
})

const videoUpload = multer({
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

/* A song is not a film, so the ceiling isn't a film's either — 2GB of "audio"
   is a mistake or an attack, not an album track. */
const MAX_AUDIO_BYTES = 200 * 1024 * 1024

const audioUpload = multer({
  storage,
  limits: { fileSize: MAX_AUDIO_BYTES, files: 1 },
  fileFilter: (_req, file, done) => {
    if (PLAYABLE_AUDIO.has(file.mimetype)) return done(null, true)
    done(
      HttpError.badRequest(
        "That file type can't be played in a browser. Use MP3, M4A, FLAC, WAV, or OGG.",
      ),
    )
  },
})

/**
 * Accept one video, and clean up after it if it never fully arrives.
 *
 * A cancelled upload — closed tab, dropped wifi, someone changing their mind
 * on a 2GB file — leaves multer holding a stream it will never finish. Nothing
 * in the library layer can tell those bytes apart from a real video: the file
 * has a plausible size and a playable extension, and it sits there offering
 * itself as something to watch and then failing halfway through.
 *
 * `close` without a finished response is exactly the abort case; a request
 * that made it to a reply — success, rejected type, too large — has either
 * been promoted by `finishUpload` or already cleaned up by multer.
 */
export function receiveVideo(req: Request, res: Response, next: NextFunction) {
  discardPartialOnAbort(req, res)
  videoUpload.single('video')(req, res, next)
}

/** The same contract for audio — see `receiveVideo`. */
export function receiveAudio(req: Request, res: Response, next: NextFunction) {
  discardPartialOnAbort(req, res)
  audioUpload.single('audio')(req, res, next)
}

function discardPartialOnAbort(req: Request, res: Response) {
  res.on('close', () => {
    if (res.writableFinished) return
    const partial = partials.get(req)
    if (!partial) return
    partials.delete(req)
    void rm(partial, { force: true }).catch(() => undefined)
  })
}

/**
 * Promote a completed upload to its real name.
 *
 * Until this runs the file is hidden and unservable, which is the point — the
 * rename is the moment it becomes a video, and it is atomic.
 */
export async function finishUpload(req: Request, file: Express.Multer.File) {
  const name = finalName(file.filename)
  await rename(path.join(UPLOAD_DIR, file.filename), path.join(UPLOAD_DIR, name))
  partials.delete(req)
  return name
}

/** Discard an upload that arrived but isn't going to be kept. */
export async function discardUpload(req: Request, file: Express.Multer.File) {
  partials.delete(req)
  await rm(path.join(UPLOAD_DIR, file.filename), { force: true }).catch(() => undefined)
}

/*
 * Leftovers from a crash.
 *
 * The abort handler covers a request that dies; it cannot cover the process
 * dying underneath it. Nothing can be in flight at startup, so anything still
 * marked in-progress here is unambiguously dead.
 */
try {
  for (const name of readdirSync(UPLOAD_DIR)) {
    if (name.endsWith(PART_SUFFIX)) rmSync(path.join(UPLOAD_DIR, name), { force: true })
  }
} catch {
  /* Unreadable uploads folder is the library's problem to report, not a
     reason to refuse to boot. */
}

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
  /**
   * False when an MP4 keeps its index at the end of the file.
   *
   * Nothing is wrong with the video — it simply cannot *start* until the
   * browser has the `moov` atom, and if that sits behind a multi-gigabyte
   * `mdat` the player stalls on a file that looks perfectly fine in the list.
   * Surfacing it is the difference between a one-line `ffmpeg` fix and an
   * afternoon of blaming the network.
   */
  fastStart: boolean
  modifiedAt: number
}

/** MP4-family containers, the only ones with a `moov` atom to be misplaced. */
const MP4_EXT = /\.(mp4|mov|m4v)$/i

/**
 * Whether an MP4's index sits at the front, where a streaming player needs it.
 *
 * Walks the top-level atoms — each is an 8-byte header naming itself and its
 * length, so this seeks rather than reads, and costs a handful of 16-byte
 * reads no matter how large the file is. Whichever of `moov`/`mdat` appears
 * first decides it.
 *
 * Anything unreadable or not MP4 answers `true`: a false alarm on a working
 * file is worse than staying quiet, because the warning is only useful if it
 * always means something.
 */
async function hasFastStart(fullPath: string): Promise<boolean> {
  if (!MP4_EXT.test(fullPath)) return true

  const { open } = await import('node:fs/promises')

  let handle
  try {
    handle = await open(fullPath, 'r')
    const { size } = await handle.stat()
    const header = Buffer.alloc(16)

    for (let offset = 0; offset + 8 <= size; ) {
      const { bytesRead } = await handle.read(header, 0, 16, offset)
      if (bytesRead < 8) return true

      const type = header.toString('ascii', 4, 8)
      if (type === 'moov') return true
      if (type === 'mdat') return false

      let length = header.readUInt32BE(0)
      /* 1 means the real 64-bit length follows the type; 0 means "to EOF",
         which can only be the last atom and so settles nothing. */
      if (length === 1) {
        if (bytesRead < 16) return true
        length = Number(header.readBigUInt64BE(8))
      } else if (length === 0) {
        return true
      }

      if (length < 8) return true
      offset += length
    }
  } catch {
    return true
  } finally {
    await handle?.close().catch(() => undefined)
  }

  return true
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
          const fullPath = path.join(UPLOAD_DIR, name)
          const info = await stat(fullPath)
          if (!info.isFile()) return null

          const playable = PLAYABLE_EXT.test(name)

          return {
            file: name,
            title: prettyTitle(name),
            /* `encodeURIComponent` on the name only — a movie called
               "Blade Runner (1982).mp4" is a perfectly ordinary thing to drop
               in, and spaces and brackets have to survive the URL. */
            ref: `${UPLOAD_ROUTE}/${encodeURIComponent(name)}`,
            bytes: info.size,
            playable,
            /* Only worth asking about a file that could otherwise play. */
            fastStart: playable ? await hasFastStart(fullPath) : true,
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

/** Audio containers a browser will decode in an `<audio>` element. */
const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|weba)$/i

export type AudioLibraryEntry = {
  file: string
  title: string
  ref: string
  bytes: number
  modifiedAt: number
}

/**
 * Audio sitting in the same uploads folder.
 *
 * Separate from `listLibrary` rather than a flag on it: the two are read by
 * different screens, and a single list would mean the music page filtering out
 * films and the watch page filtering out songs on every request. There is also
 * no `fastStart` question to ask here — audio files carry no `moov` atom worth
 * misplacing at these sizes.
 */
export async function listAudioLibrary(): Promise<AudioLibraryEntry[]> {
  const { readdir, stat } = await import('node:fs/promises')

  let names: string[]
  try {
    names = await readdir(UPLOAD_DIR)
  } catch {
    return []
  }

  const entries = await Promise.all(
    names
      .filter((name) => !name.startsWith('.') && AUDIO_EXT.test(name))
      .map(async (name) => {
        try {
          const info = await stat(path.join(UPLOAD_DIR, name))
          if (!info.isFile()) return null

          return {
            file: name,
            title: prettyTitle(name),
            ref: `${UPLOAD_ROUTE}/${encodeURIComponent(name)}`,
            bytes: info.size,
            modifiedAt: info.mtimeMs,
          } satisfies AudioLibraryEntry
        } catch {
          return null
        }
      }),
  )

  return entries
    .filter((entry): entry is AudioLibraryEntry => entry !== null)
    .sort((a, b) => b.modifiedAt - a.modifiedAt)
}
