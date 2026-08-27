import { api } from '@/lib/api'
import { API_BASE, API_HEADERS, getToken } from '@/lib/config'

/**
 * The study page's REST surface.
 *
 * Nearly all of Study is requests rather than live events: a set of questions
 * is written once and read for weeks, a document is uploaded once and searched
 * forever. Only the shared timer rides the socket.
 */

export type Capabilities = {
  /** False when the server has no model key — the UI disables rather than fails. */
  ai: boolean
  /** Independent of `ai` — a chat deployment implies nothing about an embedding one. */
  search: boolean
  judge: boolean
  judgeLanguages: string[]
  chatModel: string | null
}

export type Subject = {
  id: string
  name: string
  code: string | null
  blurb: string | null
  hasSyllabus: boolean
  counts: { resources: number; mcqSets: number; notes: number; problems: number }
}

export type ResourceStatus = 'pending' | 'processing' | 'ready' | 'failed'

export type StudyResource = {
  id: string
  title: string
  mimeType: string
  bytes: number
  status: ResourceStatus
  error: string | null
  chunkCount: number
  createdAt: string
  addedBy: { id: string; name: string }
}

export type SyllabusUnit = {
  name: string
  weightage: number | null
  lectures: number | null
  topics: string[]
}

export type Syllabus = {
  id: string
  title: string
  resourceId: string | null
  units: SyllabusUnit[]
  outcomes: string[]
  createdAt: string
}

export type McqSetSummary = {
  id: string
  title: string
  topic: string
  difficulty: string
  grounded: boolean
  sources: string[]
  questionCount: number
  createdAt: string
  createdBy: { id: string; name: string }
  lastAttempt: { score: number | null; total: number; completedAt: string | null } | null
}

export type McqQuestion = { id: string; prompt: string; options: string[] }

export type McqSet = {
  id: string
  title: string
  topic: string
  difficulty: string
  grounded: boolean
  sources: string[]
  questions: McqQuestion[]
}

export type McqReview = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  chosenIndex: number | null
}

export type NoteSummary = {
  id: string
  title: string
  topic: string
  grounded: boolean
  sources: string[]
  createdAt: string
  createdBy: { id: string; name: string }
}

export type Note = NoteSummary & { content: string }

export type ProblemSummary = {
  id: string
  title: string
  difficulty: string
  createdAt: string
  createdBy: { id: string; name: string }
  lastSubmission: { status: string; passedCount: number; totalCount: number } | null
}

export type Problem = {
  id: string
  title: string
  description: string
  difficulty: string
  languages: string[]
  starters: Record<string, string>
  samples: { input: string; expected: string }[]
  /** How many cases are held back — shown, but never their contents. */
  hiddenCount: number
}

export type Verdict = {
  status: 'passed' | 'failed' | 'error'
  passedCount: number
  totalCount: number
  detail: string | null
}

export type Suggestion = { unit: string; topic: string; weightage: number | null }

export type Progress = {
  quiz: {
    attempts: number
    answered: number
    correct: number
    accuracy: number | null
    weakest: { topic: string; accuracy: number; asked: number }[]
  }
  notes: number
  coding: { problems: number; solved: number; submissions: number }
  resources: Partial<Record<ResourceStatus, number>>
  suggestions: Suggestion[]
}

const base = (roomId: string) => `/rooms/${roomId}/study`

export const capabilities = (roomId: string) => api.get<Capabilities>(base(roomId))

export const subjects = (roomId: string) =>
  api.get<{ subjects: Subject[] }>(`${base(roomId)}/subjects`)

export const createSubject = (roomId: string, input: { name: string; code?: string; blurb?: string }) =>
  api.post<{ subject: Subject }>(`${base(roomId)}/subjects`, input)

export const deleteSubject = (roomId: string, subjectId: string) =>
  api.del<{ ok: true }>(`${base(roomId)}/subjects/${subjectId}`)

export const resources = (roomId: string, subjectId: string) =>
  api.get<{ resources: StudyResource[] }>(`${base(roomId)}/resources?subjectId=${subjectId}`)

/**
 * Upload a document.
 *
 * Outside `api.ts` because that helper sets a JSON content type, and a
 * multipart body must be left alone for the browser to set its own boundary.
 * The auth headers are rebuilt here for the same reason they are there —
 * cookie same-origin, bearer token across one.
 */
export async function uploadResource(
  roomId: string,
  subjectId: string,
  file: File,
  title?: string,
) {
  const body = new FormData()
  body.append('document', file)
  body.append('subjectId', subjectId)
  if (title) body.append('title', title)

  const headers: Record<string, string> = { ...API_HEADERS }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  /* `/api` by hand, because this is the one call that does not go through
     `api.ts` — that helper adds the prefix along with the JSON content type,
     and a multipart body must be left alone for the browser to set its own
     boundary. Without it this posts to a path the SPA answers with its own
     HTML, and the failure reads as "that upload did not work" with nothing
     in the server log, because the server never saw it. */
  const response = await fetch(`${API_BASE}/api${base(roomId)}/resources`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body,
  })

  const payload = (await response.json().catch(() => ({}))) as {
    resource?: StudyResource
    error?: string
  }
  if (!response.ok) throw new Error(payload.error ?? 'That upload did not work.')
  return payload.resource!
}

export const retryResource = (roomId: string, resourceId: string) =>
  api.post<{ ok: true }>(`${base(roomId)}/resources/${resourceId}/retry`)

export const deleteResource = (roomId: string, resourceId: string) =>
  api.del<{ ok: true }>(`${base(roomId)}/resources/${resourceId}`)

export const syllabus = (roomId: string, subjectId: string) =>
  api.get<{ syllabus: Syllabus | null }>(`${base(roomId)}/syllabus?subjectId=${subjectId}`)

export const readSyllabus = (roomId: string, resourceId: string) =>
  api.post<{ syllabus: Syllabus }>(`${base(roomId)}/syllabus`, { resourceId })

export const nextUp = (roomId: string, subjectId: string) =>
  api.get<{ suggestions: Suggestion[] }>(`${base(roomId)}/next?subjectId=${subjectId}`)

export const mcqSets = (roomId: string, subjectId: string) =>
  api.get<{ sets: McqSetSummary[] }>(`${base(roomId)}/mcq?subjectId=${subjectId}`)

export const createMcq = (
  roomId: string,
  input: { subjectId: string; topic: string; count: number; difficulty: string },
) => api.post<{ set: McqSetSummary }>(`${base(roomId)}/mcq`, input)

export const mcqSet = (roomId: string, setId: string) =>
  api.get<{ set: McqSet }>(`${base(roomId)}/mcq/${setId}`)

export const submitMcq = (
  roomId: string,
  setId: string,
  answers: { questionId: string; chosenIndex: number }[],
) =>
  api.post<{ attempt: { id: string; score: number; total: number }; review: McqReview[] }>(
    `${base(roomId)}/mcq/${setId}/attempts`,
    { answers },
  )

export const deleteMcq = (roomId: string, setId: string) =>
  api.del<{ ok: true }>(`${base(roomId)}/mcq/${setId}`)

export const notes = (roomId: string, subjectId: string) =>
  api.get<{ notes: NoteSummary[] }>(`${base(roomId)}/notes?subjectId=${subjectId}`)

export const note = (roomId: string, noteId: string) =>
  api.get<{ note: Note }>(`${base(roomId)}/notes/${noteId}`)

export const createNote = (
  roomId: string,
  input: { subjectId: string; topic: string; depth: string },
) => api.post<{ note: Note }>(`${base(roomId)}/notes`, input)

export const deleteNote = (roomId: string, noteId: string) =>
  api.del<{ ok: true }>(`${base(roomId)}/notes/${noteId}`)

export const problems = (roomId: string, subjectId: string) =>
  api.get<{ problems: ProblemSummary[] }>(`${base(roomId)}/coding?subjectId=${subjectId}`)

export const createProblem = (
  roomId: string,
  input: { subjectId: string; topic: string; difficulty: string },
) => api.post<{ problem: { id: string; title: string; difficulty: string } }>(`${base(roomId)}/coding`, input)

export const problem = (roomId: string, problemId: string) =>
  api.get<{ problem: Problem }>(`${base(roomId)}/coding/${problemId}`)

export const submitCode = (
  roomId: string,
  problemId: string,
  input: { language: string; code: string; samplesOnly: boolean },
) => api.post<{ verdict: Verdict }>(`${base(roomId)}/coding/${problemId}/submissions`, input)

export const deleteProblem = (roomId: string, problemId: string) =>
  api.del<{ ok: true }>(`${base(roomId)}/coding/${problemId}`)

export const progress = (roomId: string, subjectId: string) =>
  api.get<{ progress: Progress }>(`${base(roomId)}/progress?subjectId=${subjectId}`)

export type AssistantMode = 'explain' | 'hint' | 'coding' | 'ask'

/**
 * The thing being asked about, sent verbatim rather than by id.
 *
 * The server could look most of these up, but not all of them — a selected
 * paragraph is not a row anywhere — and sending the text keeps one shape for
 * all four cases.
 */
export type Focus = { kind: 'note' | 'question' | 'problem'; title: string; body: string }

export type AssistantMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  grounded: boolean
  sources: string[]
  createdAt: string
}

export const assistantHistory = (roomId: string, subjectId: string) =>
  api.get<{ messages: AssistantMessage[] }>(`${base(roomId)}/assistant?subjectId=${subjectId}`)

export const assistantAsk = (
  roomId: string,
  input: { subjectId: string; mode: AssistantMode; message: string; focus?: Focus | null },
) =>
  api.post<{ reply: { content: string; grounded: boolean; sources: string[] } }>(
    `${base(roomId)}/assistant`,
    input,
  )

export const assistantClear = (roomId: string, subjectId: string) =>
  api.del<{ ok: true }>(`${base(roomId)}/assistant?subjectId=${subjectId}`)
