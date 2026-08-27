import { prisma } from '../models/prisma.js'
import * as azure from './azure.service.js'
import * as retrieval from './retrieval.service.js'
import * as syllabus from './syllabus.service.js'
import { HttpError } from '../utils/HttpError.js'

/**
 * Everything the study page writes for you.
 *
 * Three generators — questions, notes, coding problems — that differ in what
 * they produce and agree on everything else, so the parts they agree on live
 * here once: find what the course says about this topic, find what the shelf
 * says about it, and tell the model plainly which of the two it is working
 * from.
 *
 * That last part is the one worth being careful about. A set of questions
 * written from a model's general knowledge is a perfectly good set of
 * questions — but it is not the same thing as one drawn from the room's own
 * documents, and a page that quietly implies otherwise is teaching somebody
 * the wrong syllabus with total confidence. So `grounded` is recorded from
 * what actually happened, never assumed.
 */

export type Grounding = {
  hits: retrieval.Hit[]
  /** The syllabus outline as prompt text, when the subject has one. */
  outline: string | null
  grounded: boolean
  sources: string[]
}

/**
 * Gather what is known about a topic before writing anything about it.
 *
 * Both halves are optional and independent: a subject can have a syllabus and
 * no documents (the handout is uploaded first, which is the normal order), or
 * documents and no syllabus.
 */
export async function gather(subjectId: string, topic: string): Promise<Grounding> {
  const [outline, hits] = await Promise.all([
    syllabus.asPromptContext(subjectId).catch(() => null),
    retrieval.search(subjectId, topic, { limit: 8 }).catch(() => []),
  ])

  return {
    hits,
    outline,
    grounded: hits.length > 0,
    sources: retrieval.sourceTitles(hits),
  }
}

/** The shared preamble: what course this is, and what the shelf says. */
function context(grounding: Grounding) {
  const parts: string[] = []

  if (grounding.outline) {
    parts.push(
      `This is the course being studied. Use its own words for topic names, and respect what it says each unit covers.\n\n${grounding.outline}`,
    )
  }

  if (grounding.hits.length > 0) {
    parts.push(
      `These passages are from the student's own uploaded material. Prefer them over your general knowledge wherever they say anything relevant, and cite them by their bracketed number when you use them.\n\n${retrieval.asContext(grounding.hits)}`,
    )
  } else {
    parts.push(
      'The student has uploaded nothing relevant to this topic, so write from your own knowledge. Do not claim or imply that anything came from their material.',
    )
  }

  return parts.join('\n\n---\n\n')
}

// ─── Questions ────────────────────────────────────────────────────────────────

export type GeneratedMcq = {
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

const MCQ_SYSTEM = `You write multiple-choice questions for a university student revising a course.

Return JSON of exactly this shape:
{ "title": "a short name for this set",
  "questions": [ { "prompt": "...", "options": ["...","...","...","..."],
                   "correctIndex": 0, "explanation": "why that answer is right" } ] }

Rules:
- Exactly four options per question, exactly one correct.
- Wrong options must be plausible to somebody who half-knows the material.
  "None of the above" and obviously silly options teach nothing.
- Test understanding, not recall of a sentence's wording.
- The explanation says why the right answer is right, and where useful why a
  tempting wrong one is wrong. Two or three sentences.
- Vary what you ask about across the set rather than circling one idea.
- Return only the JSON object.`

export async function mcq(input: {
  subjectId: string
  topic: string
  count: number
  difficulty: string
}): Promise<{ title: string; questions: GeneratedMcq[]; grounding: Grounding }> {
  const grounding = await gather(input.subjectId, input.topic)

  const parsed = await azure.chatJson<{ title?: string; questions?: unknown[] }>(
    [
      { role: 'system', content: MCQ_SYSTEM },
      {
        role: 'user',
        content: `${context(grounding)}\n\n---\n\nWrite ${input.count} ${input.difficulty} questions on: ${input.topic}`,
      },
    ],
    { temperature: 0.6, maxTokens: 6000 },
  )

  const questions: GeneratedMcq[] = []
  for (const raw of parsed.questions ?? []) {
    const q = raw as Partial<GeneratedMcq>
    const options = Array.isArray(q.options)
      ? q.options.filter((entry): entry is string => typeof entry === 'string')
      : []
    /*
     * Dropped rather than repaired.
     *
     * A question with three options, or an answer index pointing past the end,
     * cannot be shown or marked — and guessing at what was meant would mean
     * marking somebody wrong on a question this made up. One short set beats a
     * set with a broken question in it.
     */
    if (typeof q.prompt !== 'string' || !q.prompt.trim()) continue
    if (options.length !== 4) continue
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) continue

    questions.push({
      prompt: q.prompt.trim(),
      options,
      correctIndex: q.correctIndex,
      explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
    })
  }

  if (questions.length === 0) {
    throw HttpError.badGateway('The model did not return any usable questions. Try again.')
  }

  return {
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : input.topic,
    questions,
    grounding,
  }
}

// ─── Notes ────────────────────────────────────────────────────────────────────

const NOTES_SYSTEM = `You write study notes a student will actually revise from.

Return JSON of exactly this shape:
{ "title": "a short name for these notes", "content": "the notes, as Markdown" }

The notes must be genuinely visual, not a wall of prose:
- Structure with headings, and keep paragraphs short.
- Use a Markdown table wherever you are comparing things, listing properties,
  or setting out anything with more than one dimension.
- Use a fenced \`\`\`mermaid block wherever a picture helps — a flowchart for a
  process, a graph for how ideas relate, a sequence diagram for an exchange
  over time, a mindmap for a topic's shape. Mermaid syntax must be valid and
  simple; prefer \`flowchart TD\` and short node labels without punctuation
  that would need escaping.
- Do not draw a diagram for its own sake. A diagram of three bullet points is
  worse than three bullet points.
- Bold the terms a student is expected to know.
- Where something is easy to get wrong, say so under a "Common mistakes"
  heading.
- End with a short "In one line" summary of the whole topic.

Return only the JSON object.`

export async function notes(input: {
  subjectId: string
  topic: string
  depth: string
}): Promise<{ title: string; content: string; grounding: Grounding }> {
  const grounding = await gather(input.subjectId, input.topic)

  const parsed = await azure.chatJson<{ title?: string; content?: string }>(
    [
      { role: 'system', content: NOTES_SYSTEM },
      {
        role: 'user',
        content: `${context(grounding)}\n\n---\n\nWrite ${input.depth} notes on: ${input.topic}`,
      },
    ],
    { temperature: 0.5, maxTokens: 8000 },
  )

  const content = typeof parsed.content === 'string' ? parsed.content.trim() : ''
  if (!content) throw HttpError.badGateway('The model returned empty notes. Try again.')

  return {
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : input.topic,
    content,
    grounding,
  }
}

// ─── Coding problems ──────────────────────────────────────────────────────────

export type GeneratedCase = { input: string; expected: string; hidden: boolean }

const CODING_SYSTEM = `You write programming problems in the style of a competitive-programming site.

Return JSON of exactly this shape:
{ "title": "...",
  "description": "the problem, as Markdown",
  "difficulty": "easy" | "medium" | "hard",
  "starters": { "python": "...", "javascript": "...", "java": "...", "cpp": "..." },
  "cases": [ { "input": "...", "expected": "...", "hidden": false } ] }

Rules:
- The description states the problem, the input format, the output format, the
  constraints, and two worked examples with their explanations. Markdown.
- Solutions read from standard input and write to standard output. Say exactly
  what the input looks like and exactly what should be printed, because the
  answer is checked by comparing output text.
- \`input\` is what goes on stdin; \`expected\` is the exact stdout, no trailing
  blank line.
- Give 3 visible cases (hidden: false) and 6 hidden ones (hidden: true). The
  hidden ones must include the edges — smallest input, largest, and whatever
  the obvious wrong solution gets wrong.
- Starter code declares nothing but the reading and writing scaffold, with a
  clearly marked place to write the solution. Never include the solution.
- Return only the JSON object.`

export async function coding(input: {
  subjectId: string
  topic: string
  difficulty: string
}): Promise<{
  title: string
  description: string
  difficulty: string
  starters: Record<string, string>
  cases: GeneratedCase[]
  grounding: Grounding
}> {
  const grounding = await gather(input.subjectId, input.topic)

  const parsed = await azure.chatJson<{
    title?: string
    description?: string
    difficulty?: string
    starters?: Record<string, string>
    cases?: unknown[]
  }>(
    [
      { role: 'system', content: CODING_SYSTEM },
      {
        role: 'user',
        content: `${context(grounding)}\n\n---\n\nWrite one ${input.difficulty} problem on: ${input.topic}`,
      },
    ],
    { temperature: 0.7, maxTokens: 8000 },
  )

  const cases: GeneratedCase[] = []
  for (const raw of parsed.cases ?? []) {
    const c = raw as Partial<GeneratedCase>
    if (typeof c.input !== 'string' || typeof c.expected !== 'string') continue
    cases.push({ input: c.input, expected: c.expected, hidden: c.hidden === true })
  }

  const visible = cases.filter((entry) => !entry.hidden).length
  /*
   * A problem with nothing to show is not usable.
   *
   * Hidden cases alone would mean submitting blind — no way to check your
   * understanding of the format before spending an attempt on it.
   */
  if (visible === 0) throw HttpError.badGateway('The model returned no example cases. Try again.')

  const description = typeof parsed.description === 'string' ? parsed.description.trim() : ''
  if (!description) throw HttpError.badGateway('The model returned an empty problem. Try again.')

  const starters: Record<string, string> = {}
  for (const [language, code] of Object.entries(parsed.starters ?? {})) {
    if (typeof code === 'string' && code.trim()) starters[language] = code
  }

  return {
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : input.topic,
    description,
    difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty ?? '')
      ? (parsed.difficulty as string)
      : input.difficulty,
    starters,
    cases,
    grounding,
  }
}

/**
 * What a subject's syllabus suggests studying next.
 *
 * Not a generator — it reads the outline that is already stored and the
 * attempts already recorded, and says which topics have had least attention.
 * No model call, because none is needed: the syllabus lists the topics and the
 * database knows which have been asked about.
 */
export async function suggestions(subjectId: string) {
  const row = await prisma.syllabus.findUnique({ where: { subjectId } })
  if (!row) return []

  const outline = syllabus.parseOutline(row)
  const [sets, notes_] = await Promise.all([
    prisma.mcqSet.findMany({ where: { subjectId }, select: { topic: true } }),
    prisma.note.findMany({ where: { subjectId }, select: { topic: true } }),
  ])

  const touched = new Set(
    [...sets, ...notes_].map((entry) => entry.topic.toLowerCase().trim()),
  )

  const untouched: { unit: string; topic: string; weightage: number | null }[] = []
  for (const unit of outline.units) {
    for (const topic of unit.topics) {
      if (touched.has(topic.toLowerCase().trim())) continue
      untouched.push({ unit: unit.name, topic, weightage: unit.weightage })
    }
  }

  /* Heaviest units first — the syllabus already says what the course thinks
     matters most, and that is a better order than the one they happen to be
     listed in. */
  untouched.sort((a, b) => (b.weightage ?? 0) - (a.weightage ?? 0))
  return untouched.slice(0, 12)
}
