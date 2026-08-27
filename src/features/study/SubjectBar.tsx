import { useState } from 'react'
import { Check, Loader2, Plus, X } from 'lucide-react'

import * as studyApi from '@/features/study/api'
import { cn } from '@/lib/utils'

/**
 * Which subject the page is about.
 *
 * Above the tabs rather than inside one of them, because it governs all of
 * them — every list below is scoped to whatever is selected here, and a
 * control that changes six panes at once should not be buried in one.
 */
export function SubjectBar({
  roomId,
  subjects,
  activeId,
  onPick,
  onChanged,
}: {
  roomId: string
  subjects: studyApi.Subject[] | null
  activeId: string | null
  onPick: (id: string) => void
  onChanged: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || busy) return

    setBusy(true)
    setError(null)
    try {
      await studyApi.createSubject(roomId, { name: name.trim(), code: code.trim() || undefined })
      setName('')
      setCode('')
      setAdding(false)
      onChanged()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That did not work.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative z-10 shrink-0 px-5 pb-3">
      {adding ? (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Subject name"
            maxLength={120}
            className="h-9 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[0.82rem] text-chalk outline-none placeholder:text-dusk focus-visible:border-signal/50"
          />
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Code (optional)"
            maxLength={40}
            className="h-9 w-36 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[0.82rem] text-chalk outline-none placeholder:text-dusk focus-visible:border-signal/50"
          />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            aria-label="Add subject"
            className="grid size-9 place-items-center rounded-full bg-chalk text-void transition-opacity disabled:opacity-40"
          >
            {busy ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Check aria-hidden className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false)
              setError(null)
            }}
            aria-label="Cancel"
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-mist transition-colors hover:text-chalk"
          >
            <X aria-hidden className="size-4" />
          </button>
          {error && (
            <p role="alert" className="w-full text-[0.76rem] text-signal-bright">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto">
          {subjects === null ? (
            <span className="text-[0.78rem] text-dusk">Loading…</span>
          ) : (
            subjects.map((subject) => {
              const active = subject.id === activeId
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => onPick(subject.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 outline-none transition-colors duration-300',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                    active
                      ? 'border-white/20 bg-white/[0.1] text-chalk'
                      : 'border-white/10 bg-white/[0.03] text-mist hover:text-chalk',
                  )}
                >
                  <span className="whitespace-nowrap text-[0.8rem]">{subject.name}</span>
                  {subject.code && (
                    <span className="whitespace-nowrap text-[0.7rem] text-dusk">{subject.code}</span>
                  )}
                  {/* A subject that has read its syllabus knows what it covers,
                      which changes what every generator below will produce —
                      worth showing rather than leaving to be discovered. */}
                  {subject.hasSyllabus && (
                    <span
                      aria-label="Syllabus read"
                      title="Syllabus read"
                      className="size-1.5 shrink-0 rounded-full bg-signal"
                    />
                  )}
                </button>
              )
            })
          )}

          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label="Add a subject"
            className="grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-white/15 text-mist outline-none transition-colors hover:border-white/30 hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
