import type { Request, Response } from 'express'
import { z } from 'zod'

import { env } from '../config/env.js'
import { prisma } from '../models/prisma.js'
import * as azure from '../services/azure.service.js'
import * as embeddings from '../services/embeddings.service.js'
import * as generate from '../services/generate.service.js'
import * as judge from '../services/judge.service.js'
import * as resources from '../services/resource.service.js'
import { assertMembership } from '../services/room.service.js'
import * as syllabus from '../services/syllabus.service.js'
import { discardUpload, finishUpload } from '../services/upload.service.js'
import { HttpError } from '../utils/HttpError.js'

/**
 * Everything on the study page that is a request rather than a live event.
 *
 * Which is nearly all of it. A generated set of questions takes seconds to
 * write and is then read for weeks; a document is uploaded once and searched
 * forever. Only the shared timer belongs on the socket, and it lives in
 * `study.gateway.ts` with the rest of the live state.
 */

async function gate(req: Request) {
  const roomId = req.params.id!
  await assertMembership(req.userId!, roomId)
  return roomId
}

/**
 * A subject, confirmed to belong to the room being asked about.
 *
 * Every route below takes a subject id from the client, and membership of the
 * room is not membership of whatever subject id somebody typed. Without this
 * check, a member of any room could read any other room's shelf by guessing an
 * id — the room gate alone would let them through.
 */
async function subjectIn(roomId: string, subjectId: unknown) {
  if (typeof subjectId !== 'string' || !subjectId) {
    throw HttpError.badRequest('Which subject?')
  }
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, roomId } })
  if (!subject) throw HttpError.notFound('That subject is not in this room.')
  return subject
}

/** What this server can actually do, so the UI can disable rather than fail. */
export async function capabilities(req: Request, res: Response) {
  await gate(req)
  res.json({
    ai: azure.configured(),
    /* Independent of `ai`. Chat and embeddings are separate deployments on a
       resource, or separate providers entirely — Azure can write questions
       with no embedding deployment behind it, and a room can search its
       shelf through Gemini with no Azure key at all. */
    search: await embeddings.available(),
    judge: judge.configured(),
    judgeLanguages: judge.configured() ? judge.JUDGE_LANGUAGES : [],
    chatModel: azure.configured() ? env.azure.chatDeployment : null,
  })
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

const subjectInput = z.object({
  name: z.string().trim().min(1, 'Give the subject a name').max(120),
  code: z.string().trim().max(40).optional().nullable(),
  blurb: z.string().trim().max(300).optional().nullable(),
})

export async function subjects(req: Request, res: Response) {
  const roomId = await gate(req)

  const rows = await prisma.subject.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
    include: {
      syllabus: { select: { id: true, title: true } },
      _count: { select: { resources: true, mcqSets: true, notes: true, problems: true } },
    },
  })

  res.json({
    subjects: rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      blurb: row.blurb,
      hasSyllabus: row.syllabus !== null,
      counts: row._count,
    })),
  })
}

export async function createSubject(req: Request, res: Response) {
  const roomId = await gate(req)
  const input = subjectInput.parse(req.body)

  const subject = await prisma.subject.create({
    data: {
      roomId,
      createdById: req.userId!,
      name: input.name,
      code: input.code || null,
      blurb: input.blurb || null,
    },
  })

  res.status(201).json({ subject })
}

export async function deleteSubject(req: Request, res: Response) {
  const roomId = await gate(req)
  const subject = await subjectIn(roomId, req.params.subjectId)

  /* Files first. The rows cascade, but a deleted subject whose PDFs are still
     on disk is a directory that grows forever with nothing pointing at it. */
  const files = await prisma.resource.findMany({
    where: { subjectId: subject.id },
    select: { id: true },
  })
  for (const file of files) await resources.remove(file.id)

  await prisma.subject.delete({ where: { id: subject.id } })
  res.json({ ok: true })
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function listResources(req: Request, res: Response) {
  const roomId = await gate(req)
  const subject = await subjectIn(roomId, req.query.subjectId)

  const rows = await prisma.resource.findMany({
    where: { subjectId: subject.id },
    orderBy: { createdAt: 'desc' },
    include: { addedBy: { select: { id: true, name: true } } },
  })

  res.json({
    resources: rows.map((row) => ({
      id: row.id,
      title: row.title,
      mimeType: row.mimeType,
      bytes: row.bytes,
      status: row.status,
      error: row.error,
      chunkCount: row.chunkCount,
      createdAt: row.createdAt,
      addedBy: row.addedBy,
    })),
  })
}

export async function uploadResource(req: Request, res: Response) {
  const file = req.file
  if (!file) throw HttpError.badRequest('No document arrived.')

  /*
   * The bytes have already landed by the time this runs — multer streams the
   * body before the handler is reached — so every rejection from here on has
   * to take the file with it. Left behind, it is an orphan on disk that
   * nothing references and nothing will ever clean up.
   */
  let roomId: string
  let subject: { id: string }
  try {
    roomId = await gate(req)
    subject = await subjectIn(roomId, req.body?.subjectId)
  } catch (cause) {
    await discardUpload(req, file)
    throw cause
  }

  const stored = await finishUpload(req, file)
  const title = (req.body?.title as string | undefined)?.trim() || file.originalname || stored
  const canEmbed = await embeddings.available()

  const resource = await prisma.resource.create({
    data: {
      roomId,
      subjectId: subject.id,
      addedById: req.userId!,
      title: title.slice(0, 200),
      file: stored,
      mimeType: file.mimetype,
      bytes: file.size,
      status: canEmbed ? 'pending' : 'failed',
      /* Without a provider there is nothing to embed with, and a document
         stuck at "pending" forever would look like a bug rather than a
         missing key. */
      error: canEmbed
        ? null
        : 'No embedding provider is configured on this server, so documents cannot be made searchable.',
    },
  })

  if (canEmbed) resources.ingestInBackground(resource.id)

  res.status(201).json({ resource })
}

export async function deleteResource(req: Request, res: Response) {
  const roomId = await gate(req)
  const resource = await prisma.resource.findFirst({
    where: { id: req.params.resourceId!, roomId },
  })
  if (!resource) throw HttpError.notFound('That document is not here.')

  await resources.remove(resource.id)
  res.json({ ok: true })
}

/** Try again on a document that failed — a rate limit is worth one retry. */
export async function retryResource(req: Request, res: Response) {
  const roomId = await gate(req)
  const resource = await prisma.resource.findFirst({
    where: { id: req.params.resourceId!, roomId },
  })
  if (!resource) throw HttpError.notFound('That document is not here.')
  if (!(await embeddings.available())) {
    throw HttpError.unavailable('No embedding provider is configured on this server.')
  }

  await prisma.resource.update({
    where: { id: resource.id },
    data: { status: 'pending', error: null },
  })
  resources.ingestInBackground(resource.id)
  res.json({ ok: true })
}

// ─── Syllabus ─────────────────────────────────────────────────────────────────

export async function getSyllabus(req: Request, res: Response) {
  const roomId = await gate(req)
  const subject = await subjectIn(roomId, req.query.subjectId)

  const row = await prisma.syllabus.findUnique({ where: { subjectId: subject.id } })
  if (!row) {
    res.json({ syllabus: null })
    return
  }

  res.json({
    syllabus: {
      ...syllabus.parseOutline(row),
      id: row.id,
      resourceId: row.resourceId,
      createdAt: row.createdAt,
    },
  })
}

/**
 * Read an uploaded handout into an outline.
 *
 * Takes a resource that is already on the shelf rather than its own upload —
 * a syllabus is a document like any other and should be searchable too, so it
 * goes through the normal shelf and is then read a second time for structure.
 */
export async function readSyllabus(req: Request, res: Response) {
  const roomId = await gate(req)
  const resourceId = req.body?.resourceId
  if (typeof resourceId !== 'string') throw HttpError.badRequest('Which document?')

  const resource = await prisma.resource.findFirst({ where: { id: resourceId, roomId } })
  if (!resource) throw HttpError.notFound('That document is not here.')

  const saved = await syllabus.readResource(resource.id)
  res.status(201).json({
    syllabus: {
      ...saved.outline,
      id: saved.id,
      resourceId: saved.resourceId,
      createdAt: saved.createdAt,
    },
  })
}

/** Topics the syllabus lists that nothing has been generated about yet. */
export async function nextUp(req: Request, res: Response) {
  const roomId = await gate(req)
  const subject = await subjectIn(roomId, req.query.subjectId)
  res.json({ suggestions: await generate.suggestions(subject.id) })
}

// ─── Questions ────────────────────────────────────────────────────────────────

const mcqInput = z.object({
  subjectId: z.string(),
  topic: z.string().trim().min(1, 'What should the questions be about?').max(300),
  count: z.number().int().min(1).max(20).default(8),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
})

export async function listMcq(req: Request, res: Response) {
  const roomId = await gate(req)
  const subject = await subjectIn(roomId, req.query.subjectId)

  const rows = await prisma.mcqSet.findMany({
    where: { subjectId: subject.id },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { userId: req.userId!, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take: 1,
        select: { score: true, total: true, completedAt: true },
      },
    },
  })

  res.json({
    sets: rows.map((row) => ({
      id: row.id,
      title: row.title,
      topic: row.topic,
      difficulty: row.difficulty,
      grounded: row.grounded,
      sources: JSON.parse(row.sources) as string[],
      questionCount: row._count.questions,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      lastAttempt: row.attempts[0] ?? null,
    })),
  })
}

export async function createMcq(req: Request, res: Response) {
  const roomId = await gate(req)
  const input = mcqInput.parse(req.body)
  const subject = await subjectIn(roomId, input.subjectId)

  const written = await generate.mcq({
    subjectId: subject.id,
    topic: input.topic,
    count: input.count,
    difficulty: input.difficulty,
  })

  const set = await prisma.mcqSet.create({
    data: {
      roomId,
      subjectId: subject.id,
      createdById: req.userId!,
      title: written.title,
      topic: input.topic,
      difficulty: input.difficulty,
      grounded: written.grounding.grounded,
      sources: JSON.stringify(written.grounding.sources),
      questions: {
        create: written.questions.map((question, index) => ({
          prompt: question.prompt,
          options: JSON.stringify(question.options),
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          position: index,
        })),
      },
    },
    include: { _count: { select: { questions: true } } },
  })

  res.status(201).json({
    set: {
      id: set.id,
      title: set.title,
      topic: set.topic,
      difficulty: set.difficulty,
      grounded: set.grounded,
      sources: written.grounding.sources,
      questionCount: set._count.questions,
      createdAt: set.createdAt,
    },
  })
}

/**
 * A set to attempt.
 *
 * The correct answer and the explanation are withheld until the attempt is
 * marked. They are in the same row as the question, so a client that received
 * the row would have the answers sitting in its network tab — filtering here
 * is the only place it can be done.
 */
export async function getMcq(req: Request, res: Response) {
  const roomId = await gate(req)
  const set = await prisma.mcqSet.findFirst({
    where: { id: req.params.setId!, roomId },
    include: { questions: { orderBy: { position: 'asc' } } },
  })
  if (!set) throw HttpError.notFound('That set is not here.')

  res.json({
    set: {
      id: set.id,
      title: set.title,
      topic: set.topic,
      difficulty: set.difficulty,
      grounded: set.grounded,
      sources: JSON.parse(set.sources) as string[],
      questions: set.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: JSON.parse(question.options) as string[],
      })),
    },
  })
}

const attemptInput = z.object({
  answers: z.array(z.object({ questionId: z.string(), chosenIndex: z.number().int().min(0).max(3) })),
})

/**
 * Mark an attempt.
 *
 * Marked here rather than in the browser, and not because anybody would cheat
 * on their own revision — because the score is what the progress page counts,
 * and a number the client computed and posted is a number the client can be
 * wrong about.
 */
export async function submitMcq(req: Request, res: Response) {
  const roomId = await gate(req)
  const input = attemptInput.parse(req.body)

  const set = await prisma.mcqSet.findFirst({
    where: { id: req.params.setId!, roomId },
    include: { questions: { orderBy: { position: 'asc' } } },
  })
  if (!set) throw HttpError.notFound('That set is not here.')

  const byId = new Map(set.questions.map((question) => [question.id, question]))
  const marked = input.answers
    .map((answer) => {
      const question = byId.get(answer.questionId)
      if (!question) return null
      return {
        questionId: question.id,
        chosenIndex: answer.chosenIndex,
        correct: answer.chosenIndex === question.correctIndex,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  const score = marked.filter((entry) => entry.correct).length

  const attempt = await prisma.mcqAttempt.create({
    data: {
      setId: set.id,
      userId: req.userId!,
      completedAt: new Date(),
      score,
      total: set.questions.length,
      answers: { create: marked },
    },
  })

  res.json({
    attempt: { id: attempt.id, score, total: set.questions.length },
    /* Returned only now — this is the review screen, and until an attempt is
       submitted there is nothing to review. */
    review: set.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: JSON.parse(question.options) as string[],
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      chosenIndex: marked.find((entry) => entry.questionId === question.id)?.chosenIndex ?? null,
    })),
  })
}

export async function deleteMcq(req: Request, res: Response) {
  const roomId = await gate(req)
  const set = await prisma.mcqSet.findFirst({ where: { id: req.params.setId!, roomId } })
  if (!set) throw HttpError.notFound('That set is not here.')
  await prisma.mcqSet.delete({ where: { id: set.id } })
  res.json({ ok: true })
}

// ─── Notes ────────────────────────────────────────────────────────────────────

const notesInput = z.object({
  subjectId: z.string(),
  topic: z.string().trim().min(1, 'What should the notes cover?').max(300),
  depth: z.enum(['brief', 'standard', 'thorough']).default('standard'),
})

export async function listNotes(req: Request, res: Response) {
  const roomId = await gate(req)
  const subject = await subjectIn(roomId, req.query.subjectId)

  const rows = await prisma.note.findMany({
    where: { subjectId: subject.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      topic: true,
      grounded: true,
      sources: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true } },
    },
  })

  res.json({
    notes: rows.map((row) => ({ ...row, sources: JSON.parse(row.sources) as string[] })),
  })
}

export async function getNote(req: Request, res: Response) {
  const roomId = await gate(req)
  const note = await prisma.note.findFirst({
    where: { id: req.params.noteId!, roomId },
    include: { createdBy: { select: { id: true, name: true } } },
  })
  if (!note) throw HttpError.notFound('Those notes are not here.')
  res.json({ note: { ...note, sources: JSON.parse(note.sources) as string[] } })
}

export async function createNote(req: Request, res: Response) {
  const roomId = await gate(req)
  const input = notesInput.parse(req.body)
  const subject = await subjectIn(roomId, input.subjectId)

  const written = await generate.notes({
    subjectId: subject.id,
    topic: input.topic,
    depth: input.depth,
  })

  const note = await prisma.note.create({
    data: {
      roomId,
      subjectId: subject.id,
      createdById: req.userId!,
      title: written.title,
      topic: input.topic,
      content: written.content,
      grounded: written.grounding.grounded,
      sources: JSON.stringify(written.grounding.sources),
    },
  })

  res.status(201).json({ note: { ...note, sources: written.grounding.sources } })
}

export async function deleteNote(req: Request, res: Response) {
  const roomId = await gate(req)
  const note = await prisma.note.findFirst({ where: { id: req.params.noteId!, roomId } })
  if (!note) throw HttpError.notFound('Those notes are not here.')
  await prisma.note.delete({ where: { id: note.id } })
  res.json({ ok: true })
}

// ─── Coding ───────────────────────────────────────────────────────────────────

const codingInput = z.object({
  subjectId: z.string(),
  topic: z.string().trim().min(1, 'What should the problem be about?').max(300),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
})

export async function listProblems(req: Request, res: Response) {
  const roomId = await gate(req)
  const subject = await subjectIn(roomId, req.query.subjectId)

  const rows = await prisma.codingProblem.findMany({
    where: { subjectId: subject.id },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true } },
      submissions: {
        where: { userId: req.userId! },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true, passedCount: true, totalCount: true },
      },
    },
  })

  res.json({
    problems: rows.map((row) => ({
      id: row.id,
      title: row.title,
      difficulty: row.difficulty,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      lastSubmission: row.submissions[0] ?? null,
    })),
  })
}

export async function createProblem(req: Request, res: Response) {
  const roomId = await gate(req)
  const input = codingInput.parse(req.body)
  const subject = await subjectIn(roomId, input.subjectId)

  const written = await generate.coding({
    subjectId: subject.id,
    topic: input.topic,
    difficulty: input.difficulty,
  })

  const problem = await prisma.codingProblem.create({
    data: {
      roomId,
      subjectId: subject.id,
      createdById: req.userId!,
      title: written.title,
      description: written.description,
      difficulty: written.difficulty,
      languages: JSON.stringify(Object.keys(written.starters)),
      starters: JSON.stringify(written.starters),
      testCases: {
        create: written.cases.map((testCase, index) => ({
          input: testCase.input,
          expected: testCase.expected,
          hidden: testCase.hidden,
          position: index,
        })),
      },
    },
  })

  res.status(201).json({
    problem: { id: problem.id, title: problem.title, difficulty: problem.difficulty },
  })
}

/**
 * One problem, with the hidden cases stripped.
 *
 * The filter is here and nowhere else. A hidden case that reaches the browser
 * is not hidden — it is one devtools panel away from being the answer key,
 * and no amount of client-side care changes that.
 */
export async function getProblem(req: Request, res: Response) {
  const roomId = await gate(req)
  const problem = await prisma.codingProblem.findFirst({
    where: { id: req.params.problemId!, roomId },
    include: { testCases: { orderBy: { position: 'asc' } } },
  })
  if (!problem) throw HttpError.notFound('That problem is not here.')

  res.json({
    problem: {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      languages: JSON.parse(problem.languages) as string[],
      starters: JSON.parse(problem.starters) as Record<string, string>,
      samples: problem.testCases
        .filter((testCase) => !testCase.hidden)
        .map((testCase) => ({ input: testCase.input, expected: testCase.expected })),
      hiddenCount: problem.testCases.filter((testCase) => testCase.hidden).length,
    },
  })
}

const submitInput = z.object({
  language: z.string().min(1),
  code: z.string().min(1, 'There is nothing to run.'),
  /** Sample cases only — the "Run" button, as distinct from "Submit". */
  samplesOnly: z.boolean().default(false),
})

export async function submitProblem(req: Request, res: Response) {
  const roomId = await gate(req)
  const input = submitInput.parse(req.body)

  const problem = await prisma.codingProblem.findFirst({
    where: { id: req.params.problemId!, roomId },
    include: { testCases: { orderBy: { position: 'asc' } } },
  })
  if (!problem) throw HttpError.notFound('That problem is not here.')

  const cases = input.samplesOnly
    ? problem.testCases.filter((testCase) => !testCase.hidden)
    : problem.testCases

  const verdict = await judge.run({
    language: input.language,
    code: input.code,
    cases: cases.map((testCase) => ({
      input: testCase.input,
      expected: testCase.expected,
      hidden: testCase.hidden,
    })),
  })

  /* A sample run is a check, not an attempt — recording it would make the
     progress page count every experiment as a failed submission. */
  if (!input.samplesOnly) {
    await prisma.codingSubmission.create({
      data: {
        problemId: problem.id,
        userId: req.userId!,
        language: input.language,
        code: input.code,
        status: verdict.status,
        passedCount: verdict.passedCount,
        totalCount: verdict.totalCount,
        detail: verdict.detail,
      },
    })
  }

  res.json({ verdict })
}

export async function deleteProblem(req: Request, res: Response) {
  const roomId = await gate(req)
  const problem = await prisma.codingProblem.findFirst({
    where: { id: req.params.problemId!, roomId },
  })
  if (!problem) throw HttpError.notFound('That problem is not here.')
  await prisma.codingProblem.delete({ where: { id: problem.id } })
  res.json({ ok: true })
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/**
 * What has actually been done, per subject.
 *
 * Counted on request rather than kept in a summary table. These are a handful
 * of grouped queries over a few hundred rows; a cached total would be a second
 * source of truth to keep correct in exchange for nothing measurable.
 */
export async function progress(req: Request, res: Response) {
  const roomId = await gate(req)
  const subject = await subjectIn(roomId, req.query.subjectId)
  const userId = req.userId!

  const [attempts, notes, problems, submissions, resourceRows] = await Promise.all([
    prisma.mcqAttempt.findMany({
      where: { userId, completedAt: { not: null }, set: { subjectId: subject.id } },
      select: { score: true, total: true, completedAt: true, set: { select: { topic: true } } },
      orderBy: { completedAt: 'desc' },
      take: 50,
    }),
    prisma.note.count({ where: { subjectId: subject.id } }),
    prisma.codingProblem.count({ where: { subjectId: subject.id } }),
    prisma.codingSubmission.findMany({
      where: { userId, problem: { subjectId: subject.id } },
      select: { status: true, problemId: true },
    }),
    prisma.resource.groupBy({
      by: ['status'],
      where: { subjectId: subject.id },
      _count: true,
    }),
  ])

  const answered = attempts.reduce((sum, attempt) => sum + (attempt.total ?? 0), 0)
  const correct = attempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0)

  /* Weakest topics by accuracy, not by count — three wrong out of four is a
     worse signal than ten wrong out of forty, and a list ordered by volume
     would put the topic being revised most at the top. */
  const byTopic = new Map<string, { correct: number; total: number }>()
  for (const attempt of attempts) {
    const topic = attempt.set.topic
    const entry = byTopic.get(topic) ?? { correct: 0, total: 0 }
    entry.correct += attempt.score ?? 0
    entry.total += attempt.total ?? 0
    byTopic.set(topic, entry)
  }

  const weakest = [...byTopic]
    .filter(([, entry]) => entry.total >= 3)
    .map(([topic, entry]) => ({ topic, accuracy: entry.correct / entry.total, asked: entry.total }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5)

  const solved = new Set(
    submissions.filter((entry) => entry.status === 'passed').map((entry) => entry.problemId),
  ).size

  res.json({
    progress: {
      quiz: {
        attempts: attempts.length,
        answered,
        correct,
        accuracy: answered > 0 ? correct / answered : null,
        weakest,
      },
      notes,
      coding: { problems, solved, submissions: submissions.length },
      resources: Object.fromEntries(resourceRows.map((row) => [row.status, row._count])),
      suggestions: await generate.suggestions(subject.id),
    },
  })
}
