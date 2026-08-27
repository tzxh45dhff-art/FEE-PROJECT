import { prisma } from '../models/prisma.js'
import * as azure from './azure.service.js'

/**
 * Finding the passages worth showing a model.
 *
 * Brute force, deliberately. A room's shelf is a course or two — thousands of
 * chunks at the very top end — and scoring that many vectors in JavaScript is
 * a millisecond of arithmetic. A native index would beat it, and would also be
 * a compiled SQLite extension to install and keep working on every machine
 * this runs on, in exchange for a saving nobody could feel. If a shelf ever
 * grows enough to change that, only the inside of `search` has to change.
 *
 * Scoped to one subject, never to the whole room. Mixing a chemistry syllabus
 * into a compiler-design question is not a small inaccuracy — retrieval pulls
 * the wrong document, and the model then answers from it with every
 * appearance of being grounded.
 */

export type Hit = {
  chunkId: string
  resourceId: string
  title: string
  page: number | null
  text: string
  score: number
}

/**
 * Cosine similarity.
 *
 * Both vectors come back from the same embedding deployment, which returns
 * unit vectors — so the magnitudes are 1 and the dot product alone would do.
 * The division is kept anyway: it costs nothing per comparison and it means
 * this stays correct if the deployment is ever changed for one that does not
 * normalise, which is the kind of change that would otherwise degrade search
 * quietly rather than break it.
 */
function cosine(a: number[], b: number[]) {
  let dot = 0
  let aa = 0
  let bb = 0
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i] ?? 0
    const y = b[i] ?? 0
    dot += x * y
    aa += x * x
    bb += y * y
  }
  if (aa === 0 || bb === 0) return 0
  return dot / Math.sqrt(aa * bb)
}

/**
 * Below this, a passage is not about the question.
 *
 * Cosine over these embeddings does not go to zero for unrelated text — two
 * random English paragraphs still sit around 0.7 — so "the best few" is not
 * the same as "any that are relevant". Without a floor, a question about
 * something the shelf says nothing about still returns the three least
 * irrelevant pages, and the model dutifully grounds an answer in them.
 */
const FLOOR = 0.78

export type SearchOptions = {
  /** How many passages to return at most. */
  limit?: number
  /** Override the relevance floor — the syllabus reader wants everything. */
  floor?: number
}

/**
 * Passages from one subject's shelf that bear on `query`.
 *
 * Returns an empty array when the subject has nothing embedded, or when
 * nothing clears the floor. Both are ordinary and the caller must handle them
 * by saying so rather than by pretending it found something.
 */
export async function search(
  subjectId: string,
  query: string,
  options: SearchOptions = {},
): Promise<Hit[]> {
  const limit = options.limit ?? 6
  const floor = options.floor ?? FLOOR

  const rows = await prisma.resourceChunk.findMany({
    where: { subjectId, resource: { status: 'ready' } },
    select: {
      id: true,
      text: true,
      page: true,
      embedding: true,
      resourceId: true,
      resource: { select: { title: true } },
    },
  })
  if (rows.length === 0) return []

  const wanted = await azure.embedOne(query)

  const scored: Hit[] = []
  for (const row of rows) {
    let vector: number[]
    try {
      vector = JSON.parse(row.embedding) as number[]
    } catch {
      /* A chunk whose vector will not parse is a chunk written by a version
         that stored it differently, or a truncated write. Skipping it loses
         one passage; throwing would lose the whole search. */
      continue
    }

    const score = cosine(wanted, vector)
    if (score < floor) continue

    scored.push({
      chunkId: row.id,
      resourceId: row.resourceId,
      title: row.resource.title,
      page: row.page,
      text: row.text,
      score,
    })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}

/**
 * Hits rendered for a prompt, with their source named on every passage.
 *
 * The titles are in the text itself rather than only in the metadata so the
 * model can cite them in what it writes — a note that says which document a
 * claim came from is checkable, and one that does not is a claim the reader
 * has to take on faith.
 */
export function asContext(hits: Hit[]) {
  return hits
    .map((hit, index) => {
      const where = hit.page ? `${hit.title}, p.${hit.page}` : hit.title
      return `[${index + 1}] (${where})\n${hit.text}`
    })
    .join('\n\n')
}

/** Distinct document titles behind a set of hits, for recording provenance. */
export function sourceTitles(hits: Hit[]) {
  return [...new Set(hits.map((hit) => hit.title))]
}
