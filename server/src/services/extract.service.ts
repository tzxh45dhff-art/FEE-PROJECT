import { readFile } from 'node:fs/promises'
import { PDFParse } from 'pdf-parse'

/**
 * Turning an uploaded document into text worth embedding.
 *
 * The cleaning here is not tidiness for its own sake. Every chunk that comes
 * out of this becomes one vector, and a vector is only as good as the text it
 * was made from: a passage where a third of the words are the running header
 * and the page number is a passage whose embedding is mostly about the header.
 * Retrieval then quietly returns the wrong pages and the model answers
 * confidently from them, which is the worst failure this feature has — wrong,
 * and cited.
 */

export type Extracted = {
  text: string
  pages: number
  /** Page breaks as offsets into `text`, so a chunk can name where it came from. */
  pageOffsets: number[]
}

/**
 * Lines that appear on nearly every page are furniture, not content.
 *
 * Three pages is the threshold because two can coincide — a heading repeated
 * once is a heading, repeated on every page it is a header. Compared with
 * digits stripped, so "Page 4" and "Page 5" count as the same furniture rather
 * than as two unrelated lines.
 */
function furniture(pages: string[]): Set<string> {
  if (pages.length < 3) return new Set()

  const seen = new Map<string, number>()
  for (const page of pages) {
    const lines = page.split('\n').map((line) => line.trim()).filter(Boolean)
    /*
     * Only the edges of a page — a sentence recurring mid-page is a refrain in
     * the text, and deleting it would be deleting content.
     *
     * Three deep rather than two: a header is often a stack rather than a
     * line. This document opens every page with a title, then a page number,
     * then a footer line carrying the course code — and a two-line window
     * caught the first two and left the third on all seven pages.
     */
    const edges = [...lines.slice(0, 3), ...lines.slice(-3)]
    for (const line of new Set(edges)) {
      const key = line.replace(/\d+/g, '#').toLowerCase()
      if (key.length < 3) continue
      seen.set(key, (seen.get(key) ?? 0) + 1)
    }
  }

  const threshold = Math.max(3, Math.floor(pages.length * 0.6))
  return new Set([...seen].filter(([, count]) => count >= threshold).map(([key]) => key))
}

function cleanPage(page: string, drop: Set<string>) {
  const kept: string[] = []

  for (const raw of page.split('\n')) {
    const line = raw.trim()
    if (!line) {
      kept.push('')
      continue
    }

    /* A page number on its own line, in any of the shapes they come in. */
    if (/^\d{1,4}$/.test(line)) continue
    if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(line)) continue

    /* Table-of-contents leaders and rule lines carry no meaning at all once
       the layout they belonged to is gone. */
    if (/^[.\-_—–=*·•\s]{4,}$/.test(line)) continue

    if (drop.has(line.replace(/\d+/g, '#').toLowerCase())) continue

    kept.push(line)
  }

  return kept.join('\n')
}

/**
 * Put back words the PDF broke across a line.
 *
 * A hyphen with a newline directly after it and a lowercase letter following
 * is a typesetter's line wrap; a real hyphenated word never has one injected
 * mid-word. Keeping the check that tight is what stops "well-known" losing its
 * hyphen at the end of a line.
 */
function dehyphenate(text: string) {
  return text.replace(/(\w)-\n([a-z])/g, '$1$2')
}

function collapse(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Plain text and markdown need the whitespace pass and nothing else. */
function extractPlain(raw: string): Extracted {
  const text = collapse(dehyphenate(raw))
  return { text, pages: 1, pageOffsets: [0] }
}

async function extractPdf(buffer: Buffer): Promise<Extracted> {
  /* Released explicitly — the parser holds a worker, and a document that
     throws mid-parse would otherwise leave it running for the life of the
     process. Every ingest goes through here, so a leak per upload adds up. */
  const parser = new PDFParse({ data: buffer })
  let pages: string[]
  let total: number
  try {
    const parsed = await parser.getText()
    /* Per page, as the library reports it, rather than splitting the whole
       document on a separator — the page boundaries are what the header and
       footer detection below is looking across, and guessing at them from
       form feeds is how that detection quietly stops working. */
    pages = parsed.pages.map((page) => page.text ?? '')
    total = parsed.total || pages.length
  } finally {
    await parser.destroy().catch(() => undefined)
  }

  const drop = furniture(pages)

  const cleaned: string[] = []
  const pageOffsets: number[] = []
  let offset = 0

  for (const page of pages) {
    const body = collapse(dehyphenate(cleanPage(page, drop)))
    /* An empty page still needs its offset recorded, or every page after it
       is cited one number early. */
    pageOffsets.push(offset)
    if (body) {
      cleaned.push(body)
      offset += body.length + 2
    }
  }

  return { text: cleaned.join('\n\n'), pages: total, pageOffsets }
}

/**
 * Read a file into clean text.
 *
 * Returns empty text rather than throwing when a PDF has no text layer — a
 * scan is a normal thing for somebody to upload, and the caller needs to tell
 * that apart from a corrupt file so it can say which one happened.
 */
export async function extract(filePath: string, mimeType: string): Promise<Extracted> {
  const buffer = await readFile(filePath)

  if (mimeType === 'application/pdf') return extractPdf(buffer)
  return extractPlain(buffer.toString('utf8'))
}

/**
 * Split text into passages to embed.
 *
 * Paragraph-first, because a paragraph is already the author's own idea of one
 * idea, and a cut through the middle of one produces two passages that each
 * half-say something. Only when a single paragraph is longer than the ceiling
 * does this fall back to cutting it at sentence boundaries.
 *
 * Sizes are in characters, not tokens — roughly four characters to a token for
 * English prose, so the ~2000/200 here is about the 500/50 tokens the design
 * calls for. Counting real tokens would mean shipping a tokeniser to make a
 * decision that is this insensitive to being slightly off.
 */
const CHUNK_CHARS = 2000
const OVERLAP_CHARS = 200

export type Chunk = { index: number; text: string; page: number | null }

function pageFor(offset: number, pageOffsets: number[]) {
  if (pageOffsets.length <= 1) return null
  /* The last page whose start is at or before this offset. */
  let page = 1
  for (let i = 0; i < pageOffsets.length; i += 1) {
    if ((pageOffsets[i] ?? 0) <= offset) page = i + 1
    else break
  }
  return page
}

export function chunk(extracted: Extracted): Chunk[] {
  const { text, pageOffsets } = extracted
  if (!text.trim()) return []

  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chunks: Chunk[] = []

  let buffer = ''
  let bufferStart = 0
  let cursor = 0

  const flush = () => {
    const body = buffer.trim()
    if (!body) return
    chunks.push({ index: chunks.length, text: body, page: pageFor(bufferStart, pageOffsets) })
    /* Carry the tail forward, so an idea that straddles the join is present in
       both neighbours rather than invisible to each of them. */
    buffer = body.length > OVERLAP_CHARS ? body.slice(-OVERLAP_CHARS) : body
    bufferStart = cursor
  }

  for (const paragraph of paragraphs) {
    if (paragraph.length > CHUNK_CHARS) {
      /* One paragraph longer than a whole chunk — cut it at sentence ends. */
      const sentences = paragraph.match(/[^.!?]+[.!?]+|\S+$/g) ?? [paragraph]
      for (const sentence of sentences) {
        if (buffer.length + sentence.length > CHUNK_CHARS) flush()
        buffer += (buffer ? ' ' : '') + sentence.trim()
        cursor += sentence.length
      }
      continue
    }

    if (buffer.length + paragraph.length > CHUNK_CHARS) flush()
    buffer += (buffer ? '\n\n' : '') + paragraph
    cursor += paragraph.length + 2
  }

  const tail = buffer.trim()
  if (tail && !chunks.some((entry) => entry.text === tail)) {
    chunks.push({ index: chunks.length, text: tail, page: pageFor(bufferStart, pageOffsets) })
  }

  return chunks
}
