import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Mermaid } from '@/features/study/Mermaid'
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

/** Notes on the subject, written from its documents where there are any. */
export default function NotesPane({ roomId, subject, caps, announce }: PaneProps) {
  const [rows, setRows] = useState<studyApi.NoteSummary[] | null>(null)
  const [open, setOpen] = useState<studyApi.Note | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subjectId = subject?.id ?? null

  const load = useCallback(async () => {
    if (!subjectId) return
    try {
      const { notes } = await studyApi.notes(roomId, subjectId)
      setRows(notes)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the notes.')
      setRows([])
    }
  }, [roomId, subjectId])

  useEffect(() => {
    setRows(null)
    setOpen(null)
    void load()
  }, [load])

  const generate = async (topic: string, depth: string) => {
    if (!subjectId) return
    setBusy(true)
    setError(null)
    try {
      const { note } = await studyApi.createNote(roomId, { subjectId, topic, depth })
      await load()
      announce('notes', subjectId)
      setOpen(note)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That did not work.')
    } finally {
      setBusy(false)
    }
  }

  if (!subject) return <Blank title="No subject" body="Pick or add a subject first." />

  if (open) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 pb-4">
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="flex items-center gap-2 text-[0.82rem] text-mist outline-none transition-colors hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <ArrowLeft aria-hidden className="size-4" />
            All notes
          </button>
          <GroundedBadge grounded={open.grounded} sources={open.sources} />
        </div>

        <article data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto pb-6 pr-1">
          <h3 className="font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-chalk">
            {open.title}
          </h3>
          <div className="study-prose mt-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const text = String(children).replace(/\n$/, '')
                  /* A fenced mermaid block is a diagram, not source to read. */
                  if (className?.includes('language-mermaid')) return <Mermaid chart={text} />
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {open.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    )
  }

  return (
    <PaneShell
      title="Notes"
      description="Written notes with tables and diagrams, on any topic from this subject. Where the library has something on it, the notes follow that."
    >
      <TopicPicker
        roomId={roomId}
        subjectId={subjectId}
        disabled={!caps?.ai}
        reason="This server has no AI key configured."
        busy={busy}
        label="Write notes"
        showDepth
        onSubmit={(topic, options) => void generate(topic, options.depth)}
      />

      {error && (
        <div className="py-4">
          <Problem message={error} />
        </div>
      )}

      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Blank
          title="No notes yet"
          body="Pick a topic above. If a syllabus has been read for this subject, the suggestions come from the units it lists."
        />
      ) : (
        <ul className="space-y-2 pb-4">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="group flex items-center gap-3 rounded-card border border-white/[0.07] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { note } = await studyApi.note(roomId, row.id)
                      setOpen(note)
                    } catch (cause) {
                      setError(cause instanceof Error ? cause.message : 'Could not open that.')
                    }
                  }}
                  className="min-w-0 flex-1 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <p className="truncate text-[0.88rem] text-chalk">{row.title}</p>
                  <p className="mt-1 truncate text-[0.72rem] text-dusk">{row.topic}</p>
                </button>

                <GroundedBadge grounded={row.grounded} sources={row.sources} />

                <button
                  type="button"
                  onClick={async () => {
                    await studyApi.deleteNote(roomId, row.id).catch(() => undefined)
                    await load()
                  }}
                  aria-label="Delete these notes"
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
