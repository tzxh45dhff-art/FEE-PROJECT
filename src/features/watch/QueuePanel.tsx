import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChevronDown, ChevronUp, Loader2, Play, Search, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import * as watchApi from '@/features/watch/api'
import { formatTime, type QueueItem, type ResolvedSource, type SearchResult } from '@/features/watch/types'
import { cn } from '@/lib/utils'

const SOURCE_LABEL: Record<string, string> = {
  youtube: 'YouTube',
  file: 'Video file',
  external: 'Synced clock',
}

/**
 * Search, paste, and the running order.
 *
 * Search is the optional half — it needs a YouTube Data API key. Pasting a link
 * is the half that always works, because it resolves through public oEmbed, so
 * a fresh checkout can queue something without any configuration at all.
 */
export function QueuePanel({
  roomId,
  items,
  nowPlayingId,
  canSearch,
  onQueueChange,
  onPlayNow,
  onClose,
}: {
  roomId: string
  items: QueueItem[]
  nowPlayingId: string | null
  canSearch: boolean
  onQueueChange: (items: QueueItem[]) => void
  onPlayNow: (item: QueueItem) => void
  onClose: () => void
}) {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [pending, setPending] = useState<ResolvedSource | null>(null)
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => {
    field.current?.focus()
  }, [])

  /* A pasted link resolves straight away; free text only searches when there is
     a key, and otherwise falls through to the external clock mode. */
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = input.trim()
    if (!value || busy) return

    setBusy(true)
    setError(null)
    setResults(null)
    setPending(null)

    try {
      const looksLikeLink = /^https?:\/\//i.test(value) || /^[\w-]{11}$/.test(value)

      if (!looksLikeLink && canSearch) {
        setResults(await watchApi.searchVideos(roomId, value))
      } else {
        const resolved = await watchApi.resolveInput(roomId, value)
        /* An unembeddable platform gets confirmed rather than silently queued —
           the mode change is worth one deliberate click. */
        if (resolved.note) setPending(resolved)
        else await queue(resolved)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add that')
    } finally {
      setBusy(false)
    }
  }

  async function queue(resolved: Omit<ResolvedSource, 'note'>) {
    setBusy(true)
    setError(null)
    try {
      onQueueChange(await watchApi.addToQueue(roomId, resolved))
      setInput('')
      setResults(null)
      setPending(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add that')
    } finally {
      setBusy(false)
    }
  }

  async function move(index: number, delta: number) {
    const next = [...items]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    onQueueChange(next)
    onQueueChange(await watchApi.reorderQueue(roomId, next.map((item) => item.id)))
  }

  return (
    <aside className="pointer-events-auto flex h-full w-full flex-col border-l border-white/[0.08] bg-void/85 backdrop-blur-xl md:w-[24rem]">
      <header className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
        <div>
          <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-chalk">
            Up next
          </h3>
          <p className="mt-0.5 text-[0.76rem] text-mist">
            {items.length === 0
              ? 'Nothing queued yet'
              : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={onClose} aria-label="Close queue" plain>
          <X aria-hidden />
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="border-b border-white/[0.07] px-5 py-4">
        <div className="flex gap-2">
          <span className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-dusk"
            />
            <input
              ref={field}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={canSearch ? 'Search or paste a link' : 'Paste a link'}
              spellCheck={false}
              className="w-full rounded-full border border-white/[0.1] bg-white/[0.04] py-2.5 pl-10 pr-4 text-[0.85rem] text-chalk outline-none transition-colors placeholder:text-dusk focus:border-signal/50"
            />
          </span>
          <Button type="submit" size="sm" disabled={busy || input.trim().length === 0}>
            {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : 'Add'}
          </Button>
        </div>

        {!canSearch && (
          <p className="mt-2.5 text-[0.72rem] leading-relaxed text-dusk">
            Search needs a YouTube API key on the server. Pasting a YouTube link, a direct video
            URL, or a title works without one.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-2.5 text-[0.78rem] leading-relaxed text-signal-bright">
            {error}
          </p>
        )}
      </form>

      <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto">
        {pending && (
          <div className="m-4 rounded-card border border-signal/30 bg-signal/[0.06] p-4">
            <p className="font-display text-[0.9rem] font-semibold text-chalk">{pending.title}</p>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-mist">{pending.note}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => void queue(pending)} disabled={busy}>
                Add anyway
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {results && (
          <div className="border-b border-white/[0.07] p-3">
            <p className="px-2 pb-2 text-[0.68rem] uppercase tracking-[0.16em] text-dusk">
              Results
            </p>
            {results.length === 0 ? (
              <p className="px-2 pb-2 text-[0.8rem] text-mist">Nothing found.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void queue({
                          source: 'youtube',
                          ref: result.id,
                          title: result.title,
                          duration: null,
                          thumbnail: result.thumbnail,
                        })
                      }
                      className="flex w-full gap-3 rounded-card p-2 text-left outline-none transition-colors duration-200 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      <img
                        src={result.thumbnail}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-[0.8rem] leading-snug text-chalk">
                          {result.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.7rem] text-dusk">
                          {result.channel}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {items.length === 0 && !results && !pending ? (
          <p className="px-6 py-10 text-center text-[0.84rem] leading-relaxed text-mist">
            Add something and it plays for everyone in the room at once.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 p-3">
            {items.map((item, index) => {
              const current = item.id === nowPlayingId
              return (
                <li
                  key={item.id}
                  className={cn(
                    'group/item flex gap-3 rounded-card p-2 transition-colors duration-200',
                    current ? 'bg-signal/[0.1] ring-1 ring-inset ring-signal/30' : 'hover:bg-white/[0.05]',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onPlayNow(item)}
                    className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-deep outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    aria-label={`Play ${item.title} now`}
                  >
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-[0.6rem] uppercase tracking-wider text-dusk">
                        {SOURCE_LABEL[item.source]?.split(' ')[0]}
                      </span>
                    )}
                    <span className="absolute inset-0 grid place-items-center bg-void/55 opacity-0 transition-opacity duration-200 group-hover/item:opacity-100">
                      <Play aria-hidden className="size-4 fill-chalk text-chalk" />
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[0.8rem] leading-snug text-chalk">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-[0.7rem] text-dusk">
                      {current ? 'Playing now' : SOURCE_LABEL[item.source]} · {item.addedBy.name}
                      {item.duration ? ` · ${formatTime(item.duration)}` : ''}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition-opacity duration-200 group-hover/item:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => void move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="grid size-6 place-items-center rounded text-mist transition-colors hover:bg-white/10 hover:text-chalk disabled:opacity-25"
                    >
                      <ChevronUp aria-hidden className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void move(index, 1)}
                      disabled={index === items.length - 1}
                      aria-label="Move down"
                      className="grid size-6 place-items-center rounded text-mist transition-colors hover:bg-white/10 hover:text-chalk disabled:opacity-25"
                    >
                      <ChevronDown aria-hidden className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () =>
                        onQueueChange(await watchApi.removeFromQueue(roomId, item.id))
                      }
                      aria-label={`Remove ${item.title}`}
                      className="grid size-6 place-items-center rounded text-mist transition-colors hover:bg-signal/20 hover:text-signal-bright"
                    >
                      <Trash2 aria-hidden className="size-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
