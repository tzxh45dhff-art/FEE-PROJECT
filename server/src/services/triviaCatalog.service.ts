import { BANK, type Category, type Entry } from '../games/trivia.questions.js'
import { PUBLIC_BANK } from '../games/trivia.public.js'
import { catalogueCacheGet, catalogueCacheSet } from './songQuizCache.js'

export const TRIVIA_SOURCE = {
  label: 'Open Trivia DB', url: 'https://opentdb.com/',
  license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
}
export type TriviaQuestion = { entry: Entry; attribution?: typeof TRIVIA_SOURCE }
export const PUBLIC_CATEGORIES: [number, Category][] = [
  [11, 'movies'], [12, 'music'], [9, 'gk'], [17, 'gk'], [18, 'gk'], [22, 'gk'],
  [23, 'gk'], [10, 'gk'], [25, 'gk'], [27, 'gk'], [28, 'gk'], [20, 'gk'], [19, 'gk'], [30, 'gk'],
]
export const questionKey = (text: string) => text.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const CACHE = 'trivia:catalog:v1'
const MONTH = 30 * 86_400_000

/** The provider uses base64 so quotes, accents and mathematical symbols remain plain text. */
export function parsePublicQuestion(raw: unknown, category: Category): Entry | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const decode = (value: unknown) => typeof value === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(value)
    ? Buffer.from(value, 'base64').toString('utf8').replace(/\s+/g, ' ').trim() : ''
  if (decode(row.type) !== 'multiple' || !Array.isArray(row.incorrect_answers) || row.incorrect_answers.length !== 3) return null
  const prompt = decode(row.question)
  const answers = [decode(row.correct_answer), ...row.incorrect_answers.map(decode)]
  if (prompt.length < 12 || prompt.length > 230 || /\b(current|currently|latest|this year|presently|as of|most recent|most popular|most populous|highest.grossing|richest)\b/i.test(prompt)) return null
  if (answers.some((answer) => !answer || answer.length > 85 || /\b(all|none) of (the )?(above|these)\b/i.test(answer))) return null
  const text = [prompt, ...answers].join('')
  if (new Set(answers.map(questionKey)).size !== 4 || /[\ufffd<>]/u.test(text) || [...text].some((char) => char.codePointAt(0)! < 32)) return null
  return [category, prompt, answers[0]!, answers[1]!, answers[2]!, answers[3]!]
}

export function uniqueQuestions(entries: readonly Entry[]): Entry[] {
  const unique = new Map<string, Entry>()
  for (const entry of entries) if (!unique.has(questionKey(entry[1]))) unique.set(questionKey(entry[1]), entry)
  return [...unique.values()]
}

/** Exactly one public request at a time, at least 5.5 seconds apart across all rooms. */
let fetching: Promise<Entry[]> | null = null
let nextRequest = 0
let cursor = 0
export function refreshTrivia(categories: Category[], request: typeof fetch = fetch): Promise<Entry[]> {
  if (process.env.NODE_ENV === 'test' && request === fetch) return Promise.resolve([])
  if (fetching) return fetching
  if (Date.now() < nextRequest) return Promise.resolve([])
  const sources = PUBLIC_CATEGORIES.filter(([, category]) => categories.includes(category))
  if (!sources.length) return Promise.resolve([])
  const [id, category] = sources[cursor++ % sources.length]!
  nextRequest = Date.now() + 5500
  fetching = (async () => {
    try {
      const response = await request(`https://opentdb.com/api.php?amount=50&category=${id}&type=multiple&encode=base64`, { signal: AbortSignal.timeout(6500) })
      if (!response.ok) return []
      const body = await response.json() as { response_code?: number; results?: unknown[] }
      if (body.response_code !== 0 || !Array.isArray(body.results)) return []
      const fresh = body.results.flatMap((raw) => { const entry = parsePublicQuestion(raw, category); return entry ? [entry] : [] })
      const cached = await catalogueCacheGet<Entry[]>(CACHE) ?? []
      await catalogueCacheSet(CACHE, uniqueQuestions([...cached, ...fresh]).slice(-6000), MONTH)
      return fresh
    } catch { return [] }
  })().finally(() => {
    nextRequest = Date.now() + 5500
    fetching = null
  })
  return fetching
}

/** A bundled bank starts instantly; public additions are shared, deduplicated and persistent. */
export async function triviaCatalog(categories: Category[], seen: ReadonlySet<string>, rounds: number): Promise<TriviaQuestion[]> {
  const cached = await catalogueCacheGet<Entry[]>(CACHE) ?? []
  let publicEntries = uniqueQuestions([...PUBLIC_BANK, ...cached])
  const unseen = new Set([...seen].map(questionKey))
  const freshCount = [...BANK, ...publicEntries].filter((entry) => categories.includes(entry[0]) && !unseen.has(questionKey(entry[1]))).length
  const refresh = refreshTrivia(categories)
  if (freshCount < rounds) publicEntries = uniqueQuestions([...publicEntries, ...await refresh])
  else void refresh
  const own = new Set(BANK.map((entry) => questionKey(entry[1])))
  return [
    ...BANK.map((entry) => ({ entry })),
    ...publicEntries.filter((entry) => !own.has(questionKey(entry[1]))).map((entry) => ({ entry, attribution: TRIVIA_SOURCE })),
  ].filter(({ entry }) => categories.includes(entry[0]))
}
