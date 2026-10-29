import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gameCacheDirectory } from '../config/gameCache.js'

/**
 * What each room has already been shown, per game, so the next game leads
 * with things nobody there has seen yet.
 *
 * Content keys only (a question's text, a word, a video id) — nothing about
 * who answered what. Kept in a small file so a server restart does not send a
 * room straight back to the same questions, and capped so a busy room's
 * history stays small: once a room has seen everything, the oldest come back
 * first.
 */
const KEEP = 10_000

export function createSeenStore(directory: string) {
  const file = path.join(directory, 'seen-v1.json')
  let rooms: Record<string, string[]> = {}
  const loaded = readFile(file, 'utf8')
    .then((raw) => {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) rooms = parsed as Record<string, string[]>
    })
    .catch(() => undefined)
  let writing = Promise.resolve()

  const slot = (roomId: string, game: string) => `${roomId}:${game}`

  async function seenFor(roomId: string, game: string): Promise<Set<string>> {
    await loaded
    return new Set(rooms[slot(roomId, game)] ?? [])
  }

  async function markSeen(roomId: string, game: string, keys: readonly string[]) {
    if (!keys.length) return
    await loaded
    const key = slot(roomId, game)
    const fresh = new Set(keys)
    /* Re-seen keys move to the newest end, so "oldest first" stays true. */
    rooms[key] = [...(rooms[key] ?? []).filter((k) => !fresh.has(k)), ...fresh].slice(-KEEP)
    writing = writing
      .then(async () => {
        await mkdir(directory, { recursive: true })
        await writeFile(`${file}.tmp`, JSON.stringify(rooms))
        await rename(`${file}.tmp`, file)
      })
      .catch(() => undefined)
    await writing
  }

  return { seenFor, markSeen }
}

export const { seenFor, markSeen } = createSeenStore(gameCacheDirectory())
