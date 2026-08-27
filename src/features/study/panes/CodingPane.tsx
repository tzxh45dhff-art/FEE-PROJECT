import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, Lock, Play, Trash2, XCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import * as studyApi from '@/features/study/api'
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
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-signal-bright',
}

/** Problems for the subject, and the judge that marks them. */
export default function CodingPane({ roomId, subject, caps, announce }: PaneProps) {
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
        label="Write a problem"
        showDifficulty
        onSubmit={(topic, options) => void generate(topic, options.difficulty)}
      />

      {caps && caps.ai && !caps.judge && (
        <p className="mt-3 text-[0.76rem] text-dusk">
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
              <div className="group flex items-center gap-3 rounded-card border border-white/[0.07] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]">
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
                  className="min-w-0 flex-1 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <p className="truncate text-[0.88rem] text-chalk">{row.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-[0.72rem]">
                    <span className={cn('capitalize', DIFFICULTY[row.difficulty] ?? 'text-dusk')}>
                      {row.difficulty}
                    </span>
                    {row.lastSubmission && (
                      <>
                        <span aria-hidden className="text-dusk">·</span>
                        <span
                          className={
                            row.lastSubmission.status === 'passed' ? 'text-emerald-400' : 'text-dusk'
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
                  className="grid size-8 shrink-0 place-items-center rounded-full text-dusk opacity-0 outline-none transition-all hover:bg-signal/15 hover:text-signal-bright focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal group-hover:opacity-100"
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
          className="flex items-center gap-2 text-[0.82rem] text-mist outline-none transition-colors hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <ArrowLeft aria-hidden className="size-4" />
          All problems
        </button>

        <span className="flex items-center gap-2">
          <select
            value={language}
            aria-label="Language"
            onChange={(event) => switchLanguage(event.target.value)}
            className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[0.78rem] text-chalk outline-none focus-visible:border-signal/50"
          >
            {(offered.length ? offered : problem.languages).map((entry) => (
              <option key={entry} value={entry} className="bg-deep text-chalk">
                {entry}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void run(true)}
            disabled={!canRun || running !== null}
            title={canRun ? undefined : 'No judge configured on this server'}
            className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 text-[0.78rem] text-chalk outline-none transition-colors hover:bg-white/[0.1] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
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
            className="h-9 rounded-full bg-chalk px-4 text-[0.78rem] font-medium text-void outline-none transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {running === 'submit' ? 'Running…' : 'Submit'}
          </button>
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <div data-lenis-prevent className="min-h-0 overflow-y-auto pr-1">
          <h3 className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-chalk">
            {problem.title}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-[0.74rem]">
            <span className={cn('capitalize', DIFFICULTY[problem.difficulty] ?? 'text-dusk')}>
              {problem.difficulty}
            </span>
            <span aria-hidden className="text-dusk">·</span>
            <span className="inline-flex items-center gap-1 text-dusk">
              <Lock aria-hidden className="size-3" />
              {problem.hiddenCount} hidden cases
            </span>
          </p>

          <div className="study-prose mt-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-[0.78rem] text-mist">Examples</p>
            {problem.samples.map((sample, index) => (
              <div
                key={index}
                className="rounded-card border border-white/[0.07] bg-white/[0.02] p-3 font-mono text-[0.74rem] leading-relaxed"
              >
                <p className="text-dusk">input</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-chalk">{sample.input}</pre>
                <p className="mt-2 text-dusk">expected</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-chalk">{sample.expected}</pre>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="min-h-[16rem] flex-1 overflow-hidden rounded-card border border-white/[0.07]">
            <Suspense
              fallback={
                <div className="grid h-full place-items-center">
                  <Loader2 aria-hidden className="size-4 animate-spin text-mist" />
                </div>
              }
            >
              <Editor
                height="100%"
                language={monacoLanguage(language)}
                theme="vs-dark"
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
        'shrink-0 rounded-card border p-3',
        passed ? 'border-emerald-400/30 bg-emerald-400/[0.07]' : 'border-signal/30 bg-signal/[0.07]',
      )}
    >
      <p className="flex items-center gap-2 text-[0.84rem]">
        {passed ? (
          <CheckCircle2 aria-hidden className="size-4 text-emerald-400" />
        ) : (
          <XCircle aria-hidden className="size-4 text-signal-bright" />
        )}
        <span className={passed ? 'text-emerald-400' : 'text-signal-bright'}>
          {passed
            ? `All ${verdict.totalCount} cases passed`
            : verdict.status === 'error'
              ? 'It did not run'
              : `${verdict.passedCount} of ${verdict.totalCount} passed`}
        </span>
      </p>
      {verdict.detail && (
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[0.72rem] leading-relaxed text-mist">
          {verdict.detail}
        </pre>
      )}
    </div>
  )
}
