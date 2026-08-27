import { useEffect, useState } from 'react'

import * as studyApi from '@/features/study/api'
import { Blank, PaneShell, Problem, Spinner, type PaneProps } from '@/features/study/panes/shared'

/**
 * What has actually been done on this subject.
 *
 * Yours, not the room's. What the room has generated is shared — the questions
 * and notes sit on the shelf for everybody — but how you did on them is not
 * something anybody else needs on their screen.
 */
export default function ProgressPane({ roomId, subject }: PaneProps) {
  const [progress, setProgress] = useState<studyApi.Progress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const subjectId = subject?.id ?? null

  useEffect(() => {
    if (!subjectId) return
    let cancelled = false
    setProgress(null)

    void studyApi
      .progress(roomId, subjectId)
      .then(({ progress: rows }) => {
        if (!cancelled) setProgress(rows)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not work that out.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [roomId, subjectId])

  if (!subject) return <Blank title="No subject" body="Pick or add a subject first." />

  return (
    <PaneShell title="Progress" description={`How you are getting on with ${subject.name}.`}>
      {error && <Problem message={error} />}

      {!progress ? (
        <Spinner />
      ) : (
        <div className="space-y-5 pb-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Tile
              label="Accuracy"
              value={
                progress.quiz.accuracy == null
                  ? '—'
                  : `${Math.round(progress.quiz.accuracy * 100)}%`
              }
              hint={
                progress.quiz.answered > 0
                  ? `${progress.quiz.correct} of ${progress.quiz.answered}`
                  : 'no questions yet'
              }
            />
            <Tile
              label="Attempts"
              value={String(progress.quiz.attempts)}
              hint={progress.quiz.attempts === 1 ? 'quiz taken' : 'quizzes taken'}
            />
            <Tile
              label="Solved"
              value={`${progress.coding.solved}`}
              hint={`of ${progress.coding.problems} problems`}
            />
            <Tile
              label="Documents"
              value={String(progress.resources.ready ?? 0)}
              hint={
                progress.resources.failed
                  ? `${progress.resources.failed} could not be read`
                  : 'searchable'
              }
            />
          </div>

          {progress.quiz.weakest.length > 0 && (
            <Section title="Weakest topics" hint="By accuracy, not by how often they came up.">
              <ul className="space-y-2">
                {progress.quiz.weakest.map((entry) => (
                  <li key={entry.topic} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-[0.84rem] text-chalk">
                      {entry.topic}
                    </span>
                    <span className="shrink-0 text-[0.76rem] tabular-nums text-dusk">
                      {entry.asked} asked
                    </span>
                    <span className="w-24 shrink-0">
                      <span className="block h-1 overflow-hidden rounded-full bg-white/[0.08]">
                        <span
                          className="block h-full rounded-full bg-signal"
                          style={{ width: `${Math.round(entry.accuracy * 100)}%` }}
                        />
                      </span>
                    </span>
                    <span className="w-10 shrink-0 text-right text-[0.76rem] tabular-nums text-mist">
                      {Math.round(entry.accuracy * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {progress.suggestions.length > 0 && (
            <Section
              title="Not covered yet"
              hint="Topics the syllabus lists that nothing has been written about — heaviest units first."
            >
              <div className="flex flex-wrap gap-1.5">
                {progress.suggestions.map((entry) => (
                  <span
                    key={`${entry.unit}-${entry.topic}`}
                    title={entry.unit}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.76rem] text-mist"
                  >
                    {entry.topic}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {progress.quiz.attempts === 0 &&
            progress.coding.submissions === 0 &&
            progress.notes === 0 && (
              <Blank
                title="Nothing recorded yet"
                body="Take a quiz or submit a solution and this fills in."
              />
            )}
        </div>
      )}
    </PaneShell>
  )
}

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-card border border-white/[0.07] bg-white/[0.02] p-3">
      <p className="text-[0.72rem] text-dusk">{label}</p>
      <p className="mt-1 font-display text-[1.5rem] font-semibold tabular-nums leading-none text-chalk">
        {value}
      </p>
      <p className="mt-1.5 text-[0.7rem] text-dusk">{hint}</p>
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-card border border-white/[0.07] bg-white/[0.02] p-4">
      <p className="text-[0.88rem] text-chalk">{title}</p>
      <p className="mb-3 mt-0.5 text-[0.72rem] text-dusk">{hint}</p>
      {children}
    </div>
  )
}
