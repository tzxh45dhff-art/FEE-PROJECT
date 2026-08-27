import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Check, Trash2, X } from 'lucide-react'

import * as studyApi from '@/features/study/api'
import {
  Blank,
  GroundedBadge,
  PaneShell,
  Problem,
  Spinner,
  type PaneProps,
} from '@/features/study/panes/shared'
import { TopicPicker } from '@/features/study/TopicPicker'
import { cn } from '@/lib/utils'

type Taking = {
  set: studyApi.McqSet
  answers: Record<string, number>
  review: studyApi.McqReview[] | null
  score: { score: number; total: number } | null
}

/** Questions on the subject, written from its documents where there are any. */
export default function McqPane({ roomId, subject, caps, announce }: PaneProps) {
  const [sets, setSets] = useState<studyApi.McqSetSummary[] | null>(null)
  const [taking, setTaking] = useState<Taking | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subjectId = subject?.id ?? null

  const load = useCallback(async () => {
    if (!subjectId) return
    try {
      const { sets: rows } = await studyApi.mcqSets(roomId, subjectId)
      setSets(rows)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the sets.')
      setSets([])
    }
  }, [roomId, subjectId])

  useEffect(() => {
    setSets(null)
    setTaking(null)
    void load()
  }, [load])

  const generate = async (topic: string, count: number, difficulty: string) => {
    if (!subjectId) return
    setBusy(true)
    setError(null)
    try {
      await studyApi.createMcq(roomId, { subjectId, topic, count, difficulty })
      await load()
      announce('mcq', subjectId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That did not work.')
    } finally {
      setBusy(false)
    }
  }

  const open = async (setId: string) => {
    setError(null)
    try {
      const { set } = await studyApi.mcqSet(roomId, setId)
      setTaking({ set, answers: {}, review: null, score: null })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open that set.')
    }
  }

  const submit = async () => {
    if (!taking) return
    setBusy(true)
    try {
      const { attempt, review } = await studyApi.submitMcq(
        roomId,
        taking.set.id,
        Object.entries(taking.answers).map(([questionId, chosenIndex]) => ({
          questionId,
          chosenIndex,
        })),
      )
      setTaking({ ...taking, review, score: { score: attempt.score, total: attempt.total } })
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not mark that.')
    } finally {
      setBusy(false)
    }
  }

  if (!subject) return <Blank title="No subject" body="Pick or add a subject first." />

  if (taking) {
    return (
      <Attempt
        taking={taking}
        busy={busy}
        onAnswer={(questionId, index) =>
          setTaking({ ...taking, answers: { ...taking.answers, [questionId]: index } })
        }
        onSubmit={submit}
        onBack={() => setTaking(null)}
      />
    )
  }

  return (
    <PaneShell
      title="Questions"
      description="Multiple choice, written on any topic from this subject. Where the library has something to say about it, the questions come from there."
    >
      <TopicPicker
        roomId={roomId}
        subjectId={subjectId}
        disabled={!caps?.ai}
        reason="This server has no AI key configured."
        busy={busy}
        onSubmit={(topic, options) => void generate(topic, options.count, options.difficulty)}
        showCount
        showDifficulty
      />

      {error && (
        <div className="py-4">
          <Problem message={error} />
        </div>
      )}

      {sets === null ? (
        <Spinner />
      ) : sets.length === 0 ? (
        <Blank
          title="No questions yet"
          body="Pick a topic above. If the library has a handout for this subject, the questions will follow what it actually covers."
        />
      ) : (
        <ul className="space-y-2 pb-4">
          {sets.map((set) => (
            <li key={set.id}>
              <div className="group flex items-center gap-3 rounded-card border border-white/[0.07] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]">
                <button
                  type="button"
                  onClick={() => void open(set.id)}
                  className="min-w-0 flex-1 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <p className="truncate text-[0.88rem] text-chalk">{set.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] text-dusk">
                    <span>{set.questionCount} questions</span>
                    <span aria-hidden>·</span>
                    <span className="capitalize">{set.difficulty}</span>
                    {set.lastAttempt?.score != null && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="text-mist">
                          last: {set.lastAttempt.score}/{set.lastAttempt.total}
                        </span>
                      </>
                    )}
                  </p>
                </button>

                <GroundedBadge grounded={set.grounded} sources={set.sources} />

                <button
                  type="button"
                  onClick={async () => {
                    await studyApi.deleteMcq(roomId, set.id).catch(() => undefined)
                    await load()
                  }}
                  aria-label="Delete this set"
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

function Attempt({
  taking,
  busy,
  onAnswer,
  onSubmit,
  onBack,
}: {
  taking: Taking
  busy: boolean
  onAnswer: (questionId: string, index: number) => void
  onSubmit: () => void
  onBack: () => void
}) {
  const { set, answers, review, score } = taking
  const marked = review !== null
  const answered = Object.keys(answers).length

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[0.82rem] text-mist outline-none transition-colors hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <ArrowLeft aria-hidden className="size-4" />
          All sets
        </button>

        {score && (
          <p className="text-[0.85rem] text-chalk">
            <span className="font-display text-[1.1rem] font-semibold">{score.score}</span>
            <span className="text-dusk"> / {score.total}</span>
          </p>
        )}
      </div>

      <div data-lenis-prevent className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        <div>
          <h3 className="font-display text-[1.05rem] font-semibold text-chalk">{set.title}</h3>
          <div className="mt-2">
            <GroundedBadge grounded={set.grounded} sources={set.sources} />
          </div>
        </div>

        {set.questions.map((question, index) => {
          const reviewed = review?.find((entry) => entry.id === question.id)
          return (
            <div
              key={question.id}
              className="rounded-card border border-white/[0.07] bg-white/[0.02] p-4"
            >
              <p className="text-[0.88rem] leading-relaxed text-chalk">
                <span className="text-dusk">{index + 1}. </span>
                {question.prompt}
              </p>

              <div className="mt-3 space-y-1.5">
                {question.options.map((option, optionIndex) => {
                  const chosen = answers[question.id] === optionIndex
                  const correct = reviewed?.correctIndex === optionIndex
                  const wrongPick = marked && chosen && !correct

                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      disabled={marked}
                      onClick={() => onAnswer(question.id, optionIndex)}
                      className={cn(
                        'flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left outline-none transition-colors',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                        marked && correct && 'border-emerald-400/40 bg-emerald-400/10',
                        wrongPick && 'border-signal/40 bg-signal/10',
                        !marked && chosen && 'border-white/25 bg-white/[0.08]',
                        !marked && !chosen && 'border-white/[0.07] hover:bg-white/[0.05]',
                        marked && !correct && !wrongPick && 'border-white/[0.05] opacity-60',
                      )}
                    >
                      <span className="mt-0.5 shrink-0">
                        {marked && correct ? (
                          <Check aria-hidden className="size-3.5 text-emerald-400" />
                        ) : wrongPick ? (
                          <X aria-hidden className="size-3.5 text-signal-bright" />
                        ) : (
                          <span
                            className={cn(
                              'block size-3.5 rounded-full border',
                              chosen ? 'border-chalk bg-chalk' : 'border-white/25',
                            )}
                          />
                        )}
                      </span>
                      <span className="text-[0.84rem] leading-relaxed text-chalk">{option}</span>
                    </button>
                  )
                })}
              </div>

              {reviewed?.explanation && (
                <p className="mt-3 border-t border-white/[0.06] pt-3 text-[0.8rem] leading-relaxed text-mist">
                  {reviewed.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {!marked && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <p className="text-[0.78rem] text-dusk">
            {answered} of {set.questions.length} answered
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy || answered === 0}
            className="h-10 rounded-full bg-chalk px-5 text-[0.82rem] font-medium text-void outline-none transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {busy ? 'Marking…' : 'Mark it'}
          </button>
        </div>
      )}
    </div>
  )
}
