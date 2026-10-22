import { env } from '../config/env.js'
import { HttpError } from '../utils/HttpError.js'
import * as local from './localJudge.service.js'

/**
 * Running somebody else's code.
 *
 * On this machine first, when it has the judge image (see localJudge): a
 * throwaway, locked-down container per submission, about a second for Java.
 * What follows is the fallback — a remote Judge0, and the reasoning for
 * having one at all.
 *
 * This is the one thing in the project deliberately handed to a third party.
 * Executing a stranger's program safely means a sandbox, a filesystem it
 * cannot escape, a CPU ceiling, a memory ceiling, a wall clock, and a network
 * it cannot reach — and getting any one of those wrong is not a bug, it is a
 * machine somebody else now controls. A judge service has already built all of
 * it. Building it again here, less carefully, for a feature that is not what
 * this app is for, would be the wrong trade.
 *
 * Which means the code does leave the machine. That is the honest cost of the
 * choice, and it is worth knowing rather than discovering.
 */

const LANGUAGE_IDS: Record<string, number> = {
  /* Judge0's stable ids. Pinned rather than looked up: the list endpoint is
     another round trip per submission to answer a question whose answer has
     not changed in years. */
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  c: 50,
  typescript: 74,
  go: 60,
  rust: 73,
}

export const JUDGE_LANGUAGES = [
  ...new Set([...(local.available() ? local.LOCAL_LANGUAGES : []), ...(env.judge.url ? Object.keys(LANGUAGE_IDS) : [])]),
]

/** Ceilings applied per case, on top of whatever the service enforces. */
const CPU_SECONDS = 5
const MEMORY_KB = 256 * 1024
/** A whole submission's worth of cases, end to end. */
const TOTAL_TIMEOUT_MS = 60_000
/** Nobody solves a homework problem in half a megabyte of source. */
const MAX_CODE_BYTES = 64 * 1024

const CHECK_PARALLEL = 4

export function configured() {
  return Boolean(env.judge.url) || local.available()
}

export type CaseResult = {
  passed: boolean
  /** Set only for a case that failed, and only for a visible one. */
  got?: string
  message?: string
}

/**
 * One case, in three pieces rather than one paragraph.
 *
 * It used to be assembled into a single block of text here, which read fine
 * in a terminal and badly in a panel: what you want to do with a wrong answer
 * is put yours next to the right one and look for the difference, and that is
 * hard when both are buried in the same scrolling <pre>.
 *
 * Only ever a visible case. A hidden case that reports its own input and
 * expected output is not hidden.
 */
export type CaseView = { input: string; expected: string; got: string; passed: boolean }

export type JudgeVerdict = {
  status: 'passed' | 'failed' | 'error'
  passedCount: number
  totalCount: number
  /** Compiler or runtime output — about the code, not about any one case. */
  detail: string | null
  /**
   * A case to look at, whatever the outcome.
   *
   * The failing one when something failed, and otherwise the first visible
   * one — because "it passed" is not the same as being able to see what the
   * program printed, and wanting to check that is not a strange thing to
   * want. Null only when nothing visible ran: a compile error, or a failure
   * that happened on a hidden case.
   */
  shown: CaseView | null
}

function headers() {
  const out: Record<string, string> = { 'content-type': 'application/json' }
  if (env.judge.apiKey) {
    /* Both shapes, because the same Judge0 API is deployed behind both a
       RapidAPI gateway and on its own, and they read different headers. */
    out['x-rapidapi-key'] = env.judge.apiKey
    out['x-auth-token'] = env.judge.apiKey
  }
  if (env.judge.apiHost) out['x-rapidapi-host'] = env.judge.apiHost
  return out
}

/**
 * Compare what came out against what should have.
 *
 * Trailing whitespace is forgiven per line, and so is a missing final newline.
 * Those are the difference between `print` and `write` rather than the
 * difference between right and wrong, and failing somebody for one is the
 * fastest way to make a judge feel broken.
 */
function matches(got: string, expected: string) {
  const tidy = (text: string) =>
    text
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n')
      .replace(/\n+$/, '')
  return tidy(got) === tidy(expected)
}

type Submission = {
  status?: { id: number; description?: string }
  stdout?: string | null
  stderr?: string | null
  compile_output?: string | null
  message?: string | null
}

/** Judge0 status ids: 3 is accepted, 1 and 2 are queued/running. */
const ACCEPTED = 3

async function runOne(
  languageId: number,
  code: string,
  stdin: string,
  signal: AbortSignal,
): Promise<Submission> {
  /* `wait=true` asks the service to hold the connection until the run is done,
     which turns submit-then-poll into one request. Not every deployment
     honours it, so the caller still treats a queued status as a failure to
     produce output rather than as something to retry forever. */
  const response = await fetch(`${env.judge.url}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      language_id: languageId,
      source_code: code,
      stdin,
      cpu_time_limit: CPU_SECONDS,
      memory_limit: MEMORY_KB,
    }),
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw HttpError.badGateway(`The judge refused the run (${response.status}). ${text.slice(0, 160)}`)
  }

  return (await response.json()) as Submission
}

/**
 * Run one submission against every case.
 *
 * Sequential on purpose. Firing ten cases at once is ten times the load on a
 * free tier for a result nobody sees until the last one lands anyway, and it
 * is the quickest way to be rate limited mid-submission — which would report
 * as a failed solution rather than as a busy judge.
 */
export async function run(input: {
  language: string
  code: string
  cases: { input: string; expected: string; hidden: boolean }[]
}): Promise<JudgeVerdict> {
  if (!configured()) {
    throw HttpError.unavailable('Running code is not configured on this server.')
  }

  const languageId = LANGUAGE_IDS[input.language]
  if (!languageId) throw HttpError.badRequest(`This judge cannot run ${input.language}.`)

  if (Buffer.byteLength(input.code, 'utf8') > MAX_CODE_BYTES) {
    throw HttpError.badRequest('That submission is too large to run.')
  }
  if (input.cases.length === 0) throw HttpError.badRequest('There is nothing to run against.')

  if (local.supports(input.language)) {
    try {
      const done = await local.runLocally(input.language, input.code, input.cases.map((c) => c.input))
      if (done.compileError) {
        return { status: 'error', passedCount: 0, totalCount: input.cases.length, detail: done.compileError.slice(0, 2000), shown: null }
      }
      const cases = input.cases.map((c, index) => ({ ...c, id: String(index) }))
      return grade(
        cases,
        done.results.map((result, index) => ({ id: String(index), stdout: result.stdout, error: result.error })),
      )
    } catch (cause) {
      /* No docker here after all: the remote judge, if there is one. */
      if (!(cause instanceof local.JudgeUnavailable) || !env.judge.url) {
        throw HttpError.unavailable(cause instanceof Error ? cause.message : 'The judge is not available.')
      }
    }
  }
  if (!env.judge.url) throw HttpError.badRequest(`This judge cannot run ${input.language}.`)

  const controller = new AbortController()
  const deadline = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS)

  let passed = 0
  /* Kept so a run that passes can still show its output. Overwritten by the
     failing case below when there is one, since that is the more useful of
     the two to be looking at. */
  let shown: CaseView | null = null

  try {
    for (const testCase of input.cases) {
      let result: Submission
      try {
        result = await runOne(languageId, input.code, testCase.input, controller.signal)
      } catch (cause) {
        if (cause instanceof HttpError) throw cause
        throw HttpError.unavailable('The judge stopped responding partway through.')
      }

      const compileError = (result.compile_output ?? '').trim()
      if (compileError) {
        return {
          status: 'error',
          passedCount: passed,
          totalCount: input.cases.length,
          /* Compile output is shown in full regardless of whether the case was
             hidden — it is about the submitted code, not about the case. */
          detail: compileError.slice(0, 2000),
          shown,
        }
      }

      const runtimeError = (result.stderr ?? '').trim()
      if (result.status?.id !== ACCEPTED || runtimeError) {
        const reason = runtimeError || result.status?.description || 'The program did not finish.'
        return {
          status: 'error',
          passedCount: passed,
          totalCount: input.cases.length,
          detail: reason.slice(0, 2000),
          shown,
        }
      }

      const got = result.stdout ?? ''
      const view: CaseView | null = testCase.hidden
        ? null
        : {
            input: testCase.input.slice(0, 2000),
            expected: testCase.expected.slice(0, 2000),
            got: got.slice(0, 2000),
            passed: matches(got, testCase.expected),
          }

      if (matches(got, testCase.expected)) {
        passed += 1
        /* First visible case only — later ones would keep replacing it, and
           the first is the one the examples on screen are showing. */
        if (view && !shown) shown = view
        continue
      }

      /*
       * The first failing case stops the run and is reported.
       *
       * What gets reported depends on whether it was hidden — a hidden case
       * that prints its own input and expected output is not hidden. The count
       * still tells you how far you got, which is the part that is safe to
       * know.
       */
      return {
        status: 'failed',
        passedCount: passed,
        totalCount: input.cases.length,
        detail: testCase.hidden
          ? `Failed on a hidden case (${passed + 1} of ${input.cases.length}).`
          : null,
        /* The failure replaces whatever passed before it. A case that went
           wrong is worth more of the panel than one that went right. */
        shown: view ?? shown,
      }
    }
  } finally {
    clearTimeout(deadline)
  }

  return {
    status: 'passed',
    passedCount: passed,
    totalCount: input.cases.length,
    detail: null,
    shown,
  }
}

/**
 * Run one program against every case and report each one separately.
 *
 * `run` above stops at the first failure, which is right for a submission —
 * the student wants the first thing that went wrong, not a list. This is for
 * checking a freshly generated problem against a reference solution, where
 * what matters is exactly which cases disagree.
 *
 * Returns null when there is no judge to ask, which the caller must treat as
 * "unknown" rather than "fine".
 */
export async function check(input: {
  language: string
  code: string
  cases: { input: string; expected: string }[]
}): Promise<boolean[] | null> {
  if (local.supports(input.language)) {
    try {
      const done = await local.runLocally(input.language, input.code, input.cases.map((c) => c.input))
      if (done.compileError) return input.cases.map(() => false)
      return input.cases.map((testCase, index) => {
        const result = done.results[index]
        return Boolean(result && !result.error && matches(result.stdout, testCase.expected))
      })
    } catch {
      if (!env.judge.url) return null
    }
  }
  if (!env.judge.url) return null

  const languageId = LANGUAGE_IDS[input.language]
  if (!languageId) return null

  const controller = new AbortController()
  const deadline = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS)

  /* A few at a time. Checking is a background job nobody is watching, and one
     case after another was most of a minute and a half per problem; four in
     flight is quick without leaning on a shared judge hard enough to be
     rate limited. */
  const results: boolean[] = new Array(input.cases.length)
  let nextIndex = 0
  const worker = async () => {
    while (nextIndex < input.cases.length) {
      const index = nextIndex++
      const testCase = input.cases[index]!
      try {
        const result = await runOne(languageId, input.code, testCase.input, controller.signal)
        /* A case the reference could not complete counts as a disagreement.
           A reference that crashes on an input is evidence about that input
           as much as about the reference. */
        const ok =
          result.status?.id === ACCEPTED &&
          !(result.compile_output ?? '').trim() &&
          !(result.stderr ?? '').trim() &&
          matches(result.stdout ?? '', testCase.expected)
        results[index] = ok
      } catch {
        /* The judge itself failed. Unknown, not wrong — reported as agreement
           so a flaky judge cannot delete a room's test cases. */
        results[index] = true
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: Math.min(CHECK_PARALLEL, input.cases.length) }, worker))
    return results
  } finally {
    clearTimeout(deadline)
  }
}

/**
 * Mark output that somebody's own device produced.
 *
 * Code is run where it was written, in the browser — instant, and nobody
 * else's machine. The device is given the hidden cases' inputs but never
 * their expected outputs; it sends back what the program printed, and the
 * comparison happens here, where the answers are. Reported exactly as `run`
 * reports, first failure first, hidden cases kept hidden.
 */
export function grade(
  cases: { id: string; input: string; expected: string; hidden: boolean }[],
  outputs: { id: string; stdout: string; error: string | null }[],
): JudgeVerdict {
  const byId = new Map(outputs.map((output) => [output.id, output]))
  let passed = 0
  let shown: CaseView | null = null

  for (const testCase of cases) {
    const output = byId.get(testCase.id)
    if (!output) {
      return { status: 'error', passedCount: passed, totalCount: cases.length, detail: 'The program did not finish every case.', shown }
    }
    if (output.error) {
      return { status: 'error', passedCount: passed, totalCount: cases.length, detail: output.error.slice(0, 2000), shown }
    }

    const ok = matches(output.stdout, testCase.expected)
    const view: CaseView | null = testCase.hidden
      ? null
      : {
          input: testCase.input.slice(0, 2000),
          expected: testCase.expected.slice(0, 2000),
          got: output.stdout.slice(0, 2000),
          passed: ok,
        }
    if (ok) {
      passed += 1
      if (view && !shown) shown = view
      continue
    }
    return {
      status: 'failed',
      passedCount: passed,
      totalCount: cases.length,
      detail: testCase.hidden ? `Failed on a hidden case (${passed + 1} of ${cases.length}).` : null,
      shown: view ?? shown,
    }
  }

  return { status: 'passed', passedCount: passed, totalCount: cases.length, detail: null, shown }
}
