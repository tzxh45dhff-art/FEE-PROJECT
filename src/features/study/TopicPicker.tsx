import { useEffect, useState } from 'react'

import * as studyApi from '@/features/study/api'
import { GenerateButton } from '@/features/study/panes/shared'
import { cn } from '@/lib/utils'

/**
 * What to write about, with the syllabus offering answers.
 *
 * The suggestions are the point. Left to a blank box, a person types the topic
 * they already know they are weak on — which is useful, but it is not the same
 * as working through a course. Once a handout has been read, this can offer
 * the topics the syllabus lists that nothing has been generated about yet,
 * heaviest units first, so the gap between "what I have revised" and "what the
 * course examines" is visible rather than guessed at.
 */
export function TopicPicker({
  roomId,
  subjectId,
  disabled,
  reason,
  busy,
  onSubmit,
  showCount = false,
  showDifficulty = false,
  showDepth = false,
  label = 'Write questions',
}: {
  roomId: string
  subjectId: string | null
  disabled: boolean
  reason?: string
  busy: boolean
  onSubmit: (topic: string, options: { count: number; difficulty: string; depth: string }) => void
  showCount?: boolean
  showDifficulty?: boolean
  showDepth?: boolean
  label?: string
}) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(8)
  const [difficulty, setDifficulty] = useState('mixed')
  const [depth, setDepth] = useState('standard')
  const [suggestions, setSuggestions] = useState<studyApi.Suggestion[]>([])

  useEffect(() => {
    if (!subjectId) return
    let cancelled = false
    void studyApi
      .nextUp(roomId, subjectId)
      .then(({ suggestions: rows }) => {
        if (!cancelled) setSuggestions(rows)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [roomId, subjectId])

  const go = () => {
    const trimmed = topic.trim()
    if (!trimmed) return
    onSubmit(trimmed, { count, difficulty, depth })
  }

  return (
    <div className="rounded-card border border-white/[0.07] bg-white/[0.02] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !disabled) go()
          }}
          placeholder="A topic — or pick one below"
          maxLength={300}
          /* Its own line on a phone. Sharing a row with two selects leaves it
             about eight characters wide, which is not a field anybody can
             read what they typed in. */
          className="h-10 w-full min-w-0 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[0.82rem] text-chalk outline-none placeholder:text-dusk focus-visible:border-signal/50 sm:w-auto sm:flex-1"
        />

        {showCount && (
          <Select
            value={String(count)}
            onChange={(value) => setCount(Number(value))}
            options={[
              ['5', '5'],
              ['8', '8'],
              ['12', '12'],
              ['20', '20'],
            ]}
            label="How many"
          />
        )}

        {showDifficulty && (
          <Select
            value={difficulty}
            onChange={setDifficulty}
            options={[
              ['easy', 'Easy'],
              ['medium', 'Medium'],
              ['hard', 'Hard'],
              ['mixed', 'Mixed'],
            ]}
            label="Difficulty"
          />
        )}

        {showDepth && (
          <Select
            value={depth}
            onChange={setDepth}
            options={[
              ['brief', 'Brief'],
              ['standard', 'Standard'],
              ['thorough', 'Thorough'],
            ]}
            label="Depth"
          />
        )}

        <GenerateButton
          busy={busy}
          disabled={disabled || !topic.trim()}
          reason={reason}
          label={label}
          onClick={go}
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="text-[0.72rem] text-dusk">
            From the syllabus, not covered yet — heaviest units first
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.slice(0, 8).map((suggestion) => (
              <button
                key={`${suggestion.unit}-${suggestion.topic}`}
                type="button"
                onClick={() => setTopic(suggestion.topic)}
                title={suggestion.unit}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.74rem] text-mist outline-none transition-colors hover:border-white/20 hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                {suggestion.topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: [string, string][]
  label: string
}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-10 shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[0.8rem] text-chalk outline-none',
        'focus-visible:border-signal/50',
      )}
    >
      {options.map(([id, text]) => (
        <option key={id} value={id} className="bg-deep text-chalk">
          {text}
        </option>
      ))}
    </select>
  )
}
