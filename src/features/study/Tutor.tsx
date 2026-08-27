import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser, Loader2, Send, Sparkles, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Mermaid } from '@/features/study/Mermaid'
import * as studyApi from '@/features/study/api'
import type { TutorAsk } from '@/features/study/tutorContext'
import { cn } from '@/lib/utils'

/**
 * The tutor panel.
 *
 * Sits beside the work rather than replacing it, because every question it
 * answers is about something still on screen — "explain this paragraph" is a
 * different question once the paragraph is gone.
 *
 * One conversation per subject, per person. Per subject because a thread that
 * mixes two courses starts answering the wrong one; per person because this is
 * help with your own confusion, not something the room reads together — the
 * room already has a chat for that.
 */

/** What each button means when it is pressed with nothing typed. */
const OPENING: Record<studyApi.AssistantMode, string> = {
  explain: 'Explain this.',
  hint: 'Give me a hint — do not tell me the answer.',
  coding: "I'm stuck. Help me think about how to approach this.",
  ask: '',
}

const MODE_LABEL: Record<studyApi.AssistantMode, string> = {
  explain: 'Explaining',
  hint: 'Hints only',
  coding: 'Walking through',
  ask: 'Asking',
}

export default function Tutor({
  roomId,
  subjectId,
  subjectName,
  request,
  onConsumed,
  onClose,
}: {
  roomId: string
  subjectId: string
  subjectName: string
  /** Set by a pane handing something over; cleared once it has been sent. */
  request: TutorAsk | null
  onConsumed: () => void
  onClose: () => void
}) {
  const [messages, setMessages] = useState<studyApi.AssistantMessage[] | null>(null)
  const [mode, setMode] = useState<studyApi.AssistantMode>('ask')
  const [focus, setFocus] = useState<studyApi.Focus | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    let live = true
    setMessages(null)
    setFocus(null)
    studyApi
      .assistantHistory(roomId, subjectId)
      .then(({ messages: rows }) => live && setMessages(rows))
      .catch(() => live && setMessages([]))
    return () => {
      live = false
    }
  }, [roomId, subjectId])

  /* Newest at the bottom, so the view follows it. Two frames of settling are
     enough — the list only ever grows by one at a time. */
  useEffect(() => {
    const node = listRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, sending])

  const send = useCallback(
    async (text: string, useMode: studyApi.AssistantMode, useFocus: studyApi.Focus | null) => {
      const trimmed = text.trim()
      if (!trimmed || sending) return

      setSending(true)
      setError(null)
      setDraft('')

      /* Shown immediately with a local id. The server stores its own copy of
         both turns; this one only has to survive until the reply lands. */
      const asked: studyApi.AssistantMessage = {
        id: `local-${Date.now()}`,
        role: 'user',
        content: trimmed,
        grounded: false,
        sources: [],
        createdAt: new Date().toISOString(),
      }
      setMessages((current) => [...(current ?? []), asked])

      try {
        const { reply } = await studyApi.assistantAsk(roomId, {
          subjectId,
          mode: useMode,
          message: trimmed,
          focus: useFocus,
        })
        setMessages((current) => [
          ...(current ?? []),
          {
            id: `local-reply-${Date.now()}`,
            role: 'assistant',
            content: reply.content,
            grounded: reply.grounded,
            sources: reply.sources,
            createdAt: new Date().toISOString(),
          },
        ])
      } catch (cause) {
        /* The question goes back in the box rather than vanishing with the
           error — a dropped connection should cost a click, not the typing. */
        setMessages((current) => (current ?? []).filter((row) => row.id !== asked.id))
        setDraft(trimmed)
        setError(cause instanceof Error ? cause.message : 'That did not go through.')
      } finally {
        setSending(false)
      }
    },
    [roomId, sending, subjectId],
  )

  /* A pane handed something over. Take its mode and focus, then either send
     its opening line or leave the box focused for a question of your own. */
  useEffect(() => {
    if (!request) return
    onConsumed()
    setMode(request.mode)
    setFocus(request.focus)
    setError(null)

    const opening = request.message ?? OPENING[request.mode]
    if (opening) void send(opening, request.mode, request.focus)
    else inputRef.current?.focus()
    // `send` is stable enough for this; re-running on every keystroke would
    // re-send the handover.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request])

  const clear = async () => {
    await studyApi.assistantClear(roomId, subjectId).catch(() => undefined)
    setMessages([])
    setFocus(null)
    setMode('ask')
    setError(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
        <span className="flex min-w-0 items-center gap-2">
          <Sparkles aria-hidden className="size-3.5 shrink-0 text-mist" />
          <span className="truncate text-[0.82rem] text-chalk">Tutor</span>
          <span className="truncate text-[0.72rem] text-dusk">{subjectName}</span>
        </span>

        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => void clear()}
            aria-label="Clear this conversation"
            title="Clear this conversation"
            className="grid size-8 place-items-center rounded-full text-dusk outline-none transition-colors hover:bg-white/[0.06] hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <Eraser aria-hidden className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the tutor"
            className="grid size-8 place-items-center rounded-full text-dusk outline-none transition-colors hover:bg-white/[0.06] hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        </span>
      </div>

      {focus && (
        <div className="shrink-0 border-b border-white/[0.06] px-4 py-2.5">
          <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.08em] text-dusk">
            {MODE_LABEL[mode]}
          </p>
          <p className="mt-1 truncate text-[0.78rem] text-mist" title={focus.title}>
            {focus.title}
          </p>
          <button
            type="button"
            onClick={() => {
              setFocus(null)
              setMode('ask')
            }}
            className="mt-1 text-[0.7rem] text-dusk underline-offset-2 outline-none transition-colors hover:text-mist hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Ask about something else
          </button>
        </div>
      )}

      <div
        ref={listRef}
        data-lenis-prevent
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {messages === null ? (
          <div className="grid place-items-center py-10">
            <Loader2 aria-hidden className="size-4 animate-spin text-mist" />
          </div>
        ) : messages.length === 0 ? (
          <p className="px-1 py-6 text-[0.8rem] leading-relaxed text-dusk">
            Ask anything about {subjectName}. Or press <span className="text-mist">Explain</span> on
            a passage of notes, <span className="text-mist">Hint</span> on a question you are stuck
            on, or <span className="text-mist">Help</span> on a problem — it will answer about that
            exact thing, using this subject's documents where they say anything about it.
          </p>
        ) : (
          messages.map((row) =>
            row.role === 'user' ? (
              <p
                key={row.id}
                className="ml-6 rounded-card rounded-br-sm bg-white/[0.07] px-3 py-2 text-[0.82rem] leading-relaxed text-chalk"
              >
                {row.content}
              </p>
            ) : (
              <div key={row.id}>
                <div className="study-prose study-prose-tight">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }) {
                        const text = String(children).replace(/\n$/, '')
                        if (className?.includes('language-mermaid')) return <Mermaid chart={text} />
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      },
                    }}
                  >
                    {row.content}
                  </ReactMarkdown>
                </div>
                {row.grounded && row.sources.length > 0 && (
                  <p className="mt-1.5 text-[0.68rem] text-dusk">
                    from {row.sources.join(', ')}
                  </p>
                )}
              </div>
            ),
          )
        )}

        {sending && (
          <p className="flex items-center gap-2 text-[0.76rem] text-dusk">
            <Loader2 aria-hidden className="size-3.5 animate-spin" />
            Thinking…
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-card bg-signal/10 px-3 py-2 text-[0.76rem] text-signal-bright">
            {error}
          </p>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void send(draft, mode, focus)
        }}
        className="shrink-0 border-t border-white/[0.07] p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              /* Enter sends, shift-enter breaks the line — the shape every
                 chat box in this app already uses. */
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send(draft, mode, focus)
              }
            }}
            rows={1}
            placeholder={focus ? 'Ask a follow-up…' : 'Ask about this subject…'}
            maxLength={4000}
            className="max-h-32 min-h-9 flex-1 resize-none rounded-card border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.82rem] leading-relaxed text-chalk outline-none placeholder:text-dusk focus-visible:border-signal/50"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send"
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-full bg-chalk text-void outline-none transition-opacity',
              'hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
            )}
          >
            <Send aria-hidden className="size-3.5" />
          </button>
        </div>
      </form>
    </div>
  )
}
