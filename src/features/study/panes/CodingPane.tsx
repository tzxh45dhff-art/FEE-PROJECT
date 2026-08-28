import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  LifeBuoy,
  Loader2,
  Lock,
  Play,
  Trash2,
  XCircle,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import * as studyApi from '@/features/study/api'
import { useStudyDark } from '@/features/study/useStudyDark'
import { useTutor } from '@/features/study/tutorContext'
import {
  Blank,
  PaneShell,
  Problem,
  Spinner,
  type PaneProps,
} from '@/features/study/panes/shared'
import { TopicPicker } from '@/features/study/TopicPicker'
import { cn } from '@/lib/utils'

/* The editor is the heaviest thing in the app after the 3D scenes. Loaded when
   a problem is actually opened, never when the list is merely browsed. */
const Editor = lazy(() =>
  import('@monaco-editor/react').then((module) => ({ default: module.default })),
)

const DIFFICULTY: Record<string, string> = {
  easy: 'text-[var(--study-good)]',
  medium: 'text-[var(--study-accent)]',
  hard: 'text-[var(--study-bad)]',
}

/** Problems for the subject, and the judge that marks them. */
export default function CodingPane({ roomId, subject, caps, announce, seed }: PaneProps) {
  const [rows, setRows] = useState<studyApi.ProblemSummary[] | null>(null)
  const [open, setOpen] = useState<studyApi.Problem | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subjectId = subject?.id ?? null

  const load = useCallback(async () => {
    if (!subjectId) return
    try {
      const { problems } = await studyApi.problems(roomId, subjectId)
      setRows(problems)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the problems.')
      setRows([])
    }
  }, [roomId, subjectId])

  useEffect(() => {
    setRows(null)
    setOpen(null)
    void load()
  }, [load])

  const generate = async (topic: string, difficulty: string) => {
    if (!subjectId) return
    setBusy(true)
    setError(null)
    try {
      const { problem } = await studyApi.createProblem(roomId, { subjectId, topic, difficulty })
      await load()
      announce('coding', subjectId)
      const { problem: full } = await studyApi.problem(roomId, problem.id)
      setOpen(full)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That did not work.')
    } finally {
      setBusy(false)
    }
  }

  if (!subject) return <Blank title="No subject" body="Pick or add a subject first." />

  if (open) {
    return (
      <Workspace
        roomId={roomId}
        problem={open}
        canRun={Boolean(caps?.judge)}
        languages={caps?.judgeLanguages ?? []}
        onBack={() => {
          setOpen(null)
          void load()
        }}
      />
    )
  }

  return (
    <PaneShell
      title="Problems"
      description="Coding questions on this subject, with visible examples and hidden cases behind them."
    >
      <TopicPicker
        roomId={roomId}
        subjectId={subjectId}
        disabled={!caps?.ai}
        reason="This server has no AI key configured."
        busy={busy}
        seed={seed}
        label="Write a problem"
        showDifficulty
        onSubmit={(topic, options) => void generate(topic, options.difficulty)}
      />

      {caps && caps.ai && !caps.judge && (
        <p className="mt-3 text-[0.76rem] text-[var(--study-faint)]">
          No judge configured on this server — problems can be written and read, but not run.
        </p>
      )}

      {error && (
        <div className="py-4">
          <Problem message={error} />
        </div>
      )}

      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Blank title="No problems yet" body="Pick a topic above and one will be written for it." />
      ) : (
        <ul className="space-y-2 pb-4">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="group flex items-center gap-3 rounded-[0.9rem] border border-[var(--study-line)] bg-[var(--study-card)] p-3 transition-colors hover:bg-[var(--study-card-strong)]">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { problem } = await studyApi.problem(roomId, row.id)
                      setOpen(problem)
                    } catch (cause) {
                      setError(cause instanceof Error ? cause.message : 'Could not open that.')
                    }
                  }}
                  className="min-w-0 flex-1 text-left outline-none"
                >
                  <p className="truncate text-[0.88rem] text-[var(--study-text)]">{row.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-[0.72rem]">
                    <span className={cn('capitalize', DIFFICULTY[row.difficulty] ?? 'text-[var(--study-faint)]')}>
                      {row.difficulty}
                    </span>
                    {row.lastSubmission && (
                      <>
                        <span aria-hidden className="text-[var(--study-faint)]">·</span>
                        <span
                          className={
                            row.lastSubmission.status === 'passed' ? 'text-[var(--study-good)]' : 'text-[var(--study-faint)]'
                          }
                        >
                          {row.lastSubmission.status === 'passed'
                            ? 'solved'
                            : `${row.lastSubmission.passedCount}/${row.lastSubmission.totalCount}`}
                        </span>
                      </>
                    )}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await studyApi.deleteProblem(roomId, row.id).catch(() => undefined)
                    await load()
                  }}
                  aria-label="Delete this problem"
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--study-faint)] opacity-0 outline-none transition-all hover:bg-[var(--study-bad-soft)] hover:text-[var(--study-bad)] focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PaneShell>
  )
}

/**
 * One problem, in the shape people already know.
 *
 * Statement on the left, editor on the right, cases underneath — the layout
 * every competitive-programming site converged on, because it is the one that
 * lets you read the constraints while typing the solution.
 */
function Workspace({
  roomId,
  problem,
  canRun,
  languages,
  onBack,
}: {
  roomId: string
  problem: studyApi.Problem
  canRun: boolean
  languages: string[]
  onBack: () => void
}) {
  const offered = problem.languages.filter((entry) => languages.includes(entry))
  const [language, setLanguage] = useState(offered[0] ?? problem.languages[0] ?? 'python')
  const [code, setCode] = useState(problem.starters[language] ?? '')
  const [verdict, setVerdict] = useState<studyApi.Verdict | null>(null)
  const [running, setRunning] = useState<'samples' | 'submit' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const tutor = useTutor()
  const dark = useStudyDark()

  /* Switching language swaps the starter, but only when nothing has been
     written — silently discarding somebody's half-finished solution because
     they wanted to see the Java scaffold would be unforgivable. */
  const switchLanguage = (next: string) => {
    const untouched = code.trim() === (problem.starters[language] ?? '').trim()
    setLanguage(next)
    if (untouched) setCode(problem.starters[next] ?? '')
  }

  const run = async (samplesOnly: boolean) => {
    setRunning(samplesOnly ? 'samples' : 'submit')
    setError(null)
    setVerdict(null)
    try {
      const { verdict: got } = await studyApi.submitCode(roomId, problem.id, {
        language,
        code,
        samplesOnly,
      })
      setVerdict(got)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That did not run.')
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[0.82rem] text-[var(--study-soft)] outline-none transition-colors hover:text-[var(--study-text)]"
        >
          <ArrowLeft aria-hidden className="size-4" />
          All problems
        </button>

        <span className="flex items-center gap-2">
          {/* Sends what has been typed so far along with the statement. Help
              with a half-written attempt is help with *that* attempt — where
              it went wrong, not a fresh lecture on the topic. The server's
              coding mode is written to refuse to finish it. */}
          {tutor && (
            <button
              type="button"
              onClick={() =>
                tutor.ask({
                  mode: 'coding',
                  focus: {
                    kind: 'problem',
                    title: problem.title,
                    body: `${problem.description}\n\n---\n\nWhat I have written so far (${language}):\n\n\`\`\`${monacoLanguage(language)}\n${code.slice(0, 8_000)}\n\`\`\`${
                      verdict && verdict.status !== 'passed'
                        ? `\n\n---\n\nThe judge said: ${verdict.passedCount} of ${verdict.totalCount} cases passed.${verdict.detail ? `\n${verdict.detail.slice(0, 1_500)}` : ''}`
                        : ''
                    }`,
                  },
                })
              }
              disabled={!tutor.available}
              title={tutor.available ? undefined : 'No AI key on this server'}
              className="flex h-9 items-center gap-2 rounded-full border border-[var(--study-line)] bg-[var(--study-card)] px-3.5 text-[0.78rem] text-[var(--study-text)] outline-none transition-colors hover:bg-[var(--study-card-strong)] disabled:opacity-40"
            >
              <LifeBuoy aria-hidden className="size-3.5" />
              Help
            </button>
          )}

          <select
            value={language}
            aria-label="Language"
            onChange={(event) => switchLanguage(event.target.value)}
            className="h-9 rounded-full border border-[var(--study-line)] bg-[var(--study-card)] px-3 text-[0.78rem] text-[var(--study-text)] outline-none focus-visible:border-[var(--study-accent)]"
          >
            {(offered.length ? offered : problem.languages).map((entry) => (
              <option key={entry} value={entry} className="bg-[var(--study-bg)] text-[var(--study-text)]">
                {entry}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void run(true)}
            disabled={!canRun || running !== null}
            title={canRun ? undefined : 'No judge configured on this server'}
            className="flex h-9 items-center gap-2 rounded-full border border-[var(--study-line)] bg-[var(--study-card)] px-3.5 text-[0.78rem] text-[var(--study-text)] outline-none transition-colors hover:bg-[var(--study-card-strong)] disabled:opacity-40"
          >
            {running === 'samples' ? (
              <Loader2 aria-hidden className="size-3.5 animate-spin" />
            ) : (
              <Play aria-hidden className="size-3.5" />
            )}
            Run examples
          </button>

          <button
            type="button"
            onClick={() => void run(false)}
            disabled={!canRun || running !== null}
            title={canRun ? undefined : 'No judge configured on this server'}
            className="h-9 rounded-full bg-[var(--study-accent)] px-4 text-[0.78rem] font-medium text-[var(--study-on-accent)] outline-none transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {running === 'submit' ? 'Running…' : 'Submit'}
          </button>
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <div data-lenis-prevent className="min-h-0 overflow-y-auto pr-1">
          <h3 className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-[var(--study-text)]">
            {problem.title}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-[0.74rem]">
            <span className={cn('capitalize', DIFFICULTY[problem.difficulty] ?? 'text-[var(--study-faint)]')}>
              {problem.difficulty}
            </span>
            <span aria-hidden className="text-[var(--study-faint)]">·</span>
            <span className="inline-flex items-center gap-1 text-[var(--study-faint)]">
              <Lock aria-hidden className="size-3" />
              {problem.hiddenCount} hidden cases
            </span>
          </p>

          <div className="study-prose mt-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-[0.78rem] text-[var(--study-soft)]">Examples</p>
            {problem.samples.map((sample, index) => (
              <div
                key={index}
                className="rounded-[0.9rem] border border-[var(--study-line)] bg-[var(--study-card)] p-3 font-mono text-[0.74rem] leading-relaxed"
              >
                <p className="text-[var(--study-faint)]">input</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-[var(--study-text)]">{sample.input}</pre>
                <p className="mt-2 text-[var(--study-faint)]">expected</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-[var(--study-text)]">{sample.expected}</pre>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="min-h-[16rem] flex-1 overflow-hidden rounded-[0.9rem] border border-[var(--study-line)]">
            <Suspense
              fallback={
                <div className="grid h-full place-items-center">
                  <Loader2 aria-hidden className="size-4 animate-spin text-[var(--study-soft)]" />
                </div>
              }
            >
              <Editor
                height="100%"
                language={monacoLanguage(language)}
                /* Follows the page. A black editor punched into a light page
                   is the single most jarring thing a themed tab can do. */
                theme={dark ? 'vs-dark' : 'light'}
                value={code}
                onChange={(next) => setCode(next ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </Suspense>
          </div>

          {/* Said here, not only as a tooltip on a greyed button. A disabled
              control with no visible reason reads as broken, and the reason
              is one a person can act on. */}
          {!canRun && (
            <p className="shrink-0 rounded-[0.9rem] border border-[var(--study-line)] px-3 py-2.5 text-[0.76rem] leading-relaxed text-[var(--study-soft)]">
              No judge is configured on this server, so this cannot be run. Set{' '}
              <code className="text-[var(--study-text)]">JUDGE_URL</code> to a Judge0-compatible
              API and the buttons above come alive.
            </p>
          )}

          {error && <Problem message={error} />}
          {verdict && <Result verdict={verdict} />}
        </div>
      </div>
    </div>
  )
}

/** Judge language ids and Monaco's grammar names are not quite the same set. */
function monacoLanguage(language: string) {
  if (language === 'cpp') return 'cpp'
  if (language === 'c') return 'c'
  if (language === 'javascript') return 'javascript'
  if (language === 'typescript') return 'typescript'
  return language
}

function Result({ verdict }: { verdict: studyApi.Verdict }) {
  const passed = verdict.status === 'passed'
  return (
    <div
      className={cn(
        'shrink-0 rounded-[0.9rem] border p-3',
        passed ? 'border-[var(--study-good)] bg-[var(--study-good-soft)]' : 'border-[var(--study-bad)] bg-[var(--study-bad-soft)]',
      )}
    >
      <p className="flex items-center gap-2 text-[0.84rem]">
        {passed ? (
          <CheckCircle2 aria-hidden className="size-4 text-[var(--study-good)]" />
        ) : (
          <XCircle aria-hidden className="size-4 text-[var(--study-bad)]" />
        )}
        <span className={passed ? 'text-[var(--study-good)]' : 'text-[var(--study-bad)]'}>
          {passed
            ? `All ${verdict.totalCount} cases passed`
            : verdict.status === 'error'
              ? 'It did not run'
              : `${verdict.passedCount} of ${verdict.totalCount} passed`}
        </span>
      </p>
      {verdict.detail && (
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[0.72rem] leading-relaxed text-[var(--study-soft)]">
          {verdict.detail}
        </pre>
      )}
    </div>
  )
}
