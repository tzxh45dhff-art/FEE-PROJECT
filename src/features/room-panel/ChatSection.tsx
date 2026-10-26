import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SendHorizonal, Trash2 } from 'lucide-react'

import type { ChatMessage } from '@/features/room-panel/useChat'
import { cn } from '@/lib/utils'

function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/** Consecutive messages from one person read as one turn, not five cards. */
function startsGroup(message: ChatMessage, previous: ChatMessage | undefined) {
  if (!previous || previous.author.id !== message.author.id) return true
  const gap = new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime()
  return gap > 4 * 60 * 1000
}

export function ChatSection({
  messages,
  typing,
  selfId,
  onSend,
  onType,
  onDelete,
  onClear,
  owner = false,
}: {
  messages: ChatMessage[]
  typing: string[]
  selfId: string | undefined
  onSend: (body: string) => void
  onType: () => void
  /** Resolves to an error to show, or null. */
  onDelete?: (id: string) => Promise<string | null>
  onClear?: () => Promise<string | null>
  /** The room's owner can delete any message and clear the chat. */
  owner?: boolean
}) {
  const [draft, setDraft] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  /* Clearing everyone's chat takes two taps: the first arms it for a few seconds. */
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), 4_000)
    return () => window.clearTimeout(timer)
  }, [armed])
  useEffect(() => {
    if (!problem) return
    const timer = window.setTimeout(() => setProblem(null), 4_000)
    return () => window.clearTimeout(timer)
  }, [problem])
  const scroller = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)

  /*
   * Follow new messages only when already at the bottom. Yanking someone back
   * down while they are reading history is the classic chat annoyance.
   */
  useEffect(() => {
    if (pinned.current && scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight
    }
  }, [messages, typing])

  function submit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
    pinned.current = true
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {owner && onClear && messages.length > 0 && (
        <div className="flex items-center justify-end gap-2 border-b border-white/[0.07] px-4 py-1.5">
          <button
            type="button"
            onClick={async () => {
              if (!armed) return setArmed(true)
              setArmed(false)
              setProblem(await onClear())
            }}
            className={cn(
              'flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[0.74rem] font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-signal',
              armed ? 'bg-signal text-white' : 'text-mist hover:bg-white/[0.06] hover:text-chalk',
            )}
          >
            <Trash2 aria-hidden className="size-3.5" />
            {armed ? 'Tap again to clear it for everyone' : 'Clear chat'}
          </button>
        </div>
      )}
      <div
        ref={scroller}
        data-lenis-prevent
        onScroll={(event) => {
          const el = event.currentTarget
          pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
        }}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
      >
        {messages.length === 0 ? (
          <p className="px-1 py-8 text-center text-[0.8rem] leading-relaxed text-mist">
            No messages yet. Say something — everyone in the room sees it.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {messages.map((message, index) => {
              const mine = message.author.id === selfId
              const fresh = startsGroup(message, messages[index - 1])
              const deletable = !!onDelete && (mine || owner)

              return (
                <li
                  key={message.id}
                  className={cn('flex flex-col', mine ? 'items-end' : 'items-start', fresh && 'mt-2.5')}
                >
                  {fresh && (
                    <span className="mb-1 flex items-baseline gap-2 px-1">
                      <span className="text-[0.72rem] font-semibold text-chalk">
                        {mine ? 'You' : message.author.name}
                      </span>
                      <span className="text-[0.62rem] text-dusk">{clockTime(message.createdAt)}</span>
                    </span>
                  )}
                  <span className={cn('group/msg flex max-w-[85%] items-center gap-1', mine && 'flex-row-reverse')}>
                    <span
                      className={cn(
                        'min-w-0 whitespace-pre-wrap break-words rounded-2xl px-3 py-1.5 text-[0.82rem] leading-relaxed',
                        mine
                          ? 'bg-signal/20 text-chalk ring-1 ring-inset ring-signal/25'
                          : 'bg-white/[0.06] text-chalk ring-1 ring-inset ring-white/[0.07]',
                      )}
                    >
                      {message.body}
                    </span>
                    {deletable && (
                      /* Shown on hover or focus with a mouse; always there (faintly) on touch screens. */
                      <button
                        type="button"
                        aria-label={mine ? 'Delete your message' : `Delete ${message.author.name}'s message`}
                        title="Delete message"
                        onClick={async () => setProblem(await onDelete!(message.id))}
                        className="grid size-8 shrink-0 place-items-center rounded-full text-dusk opacity-40 outline-none transition hover:bg-white/[0.08] hover:text-signal-bright focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-signal [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/msg:opacity-100"
                      >
                        <Trash2 aria-hidden className="size-3.5" />
                      </button>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {typing.length > 0 && (
          <p className="mt-2 px-1 text-[0.72rem] italic text-dusk">
            {typing.length === 1 ? `${typing[0]} is typing…` : `${typing.length} people are typing…`}
          </p>
        )}
      </div>

      {problem && (
        <p role="alert" className="border-t border-white/[0.07] px-4 py-2 text-[0.74rem] text-signal-bright">
          {problem}
        </p>
      )}
      <form onSubmit={submit} className="flex gap-2 border-t border-white/[0.07] p-3">
        <input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            onType()
          }}
          placeholder="Message the room"
          maxLength={2000}
          className="min-w-0 flex-1 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-[0.82rem] text-chalk outline-none transition-colors placeholder:text-dusk focus:border-signal/50"
        />
        <button
          type="submit"
          disabled={draft.trim().length === 0}
          aria-label="Send"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-chalk text-void outline-none transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:scale-95 disabled:opacity-35"
        >
          <SendHorizonal aria-hidden className="size-4" />
        </button>
      </form>
    </div>
  )
}
