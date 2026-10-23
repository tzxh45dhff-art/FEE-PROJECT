import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Generated public metadata and video IDs only; no accounts, keys or audio.
const directory = path.resolve(import.meta.dirname, '../../.cache')
const file = path.join(directory, 'song-quiz-v4.json')
type Entry = { until: number; value: unknown }
let entries: Record<string, Entry> = {}
const loaded = readFile(file, 'utf8').then((raw) => {
  const parsed: unknown = JSON.parse(raw)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) entries = parsed as Record<string, Entry>
}).catch(() => undefined)
let writing = Promise.resolve()

export async function catalogueCacheGet<T>(key: string): Promise<T | undefined> {
  await loaded
  const entry = entries[key]
  return entry && entry.until > Date.now() ? entry.value as T : undefined
}

export async function catalogueCacheSet(key: string, value: unknown, lifetime: number) {
  await loaded
  entries[key] = { until: Date.now() + lifetime, value }
  writing = writing.then(async () => {
    await mkdir(directory, { recursive: true })
    const current = Object.fromEntries(Object.entries(entries).filter(([, entry]) => entry.until > Date.now()))
    await writeFile(`${file}.tmp`, JSON.stringify(current))
    await rename(`${file}.tmp`, file)
  }).catch(() => undefined)
  await writing
}
