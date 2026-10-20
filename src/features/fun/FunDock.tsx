import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { EMOTES, QUICK_EMOTES, THROWABLES, TOYS, throwById } from '@/features/fun/catalog'
import { describe } from '@/features/fun/describe'
import { ThrowArt } from '@/features/fun/ThrowArt'
import type { FunEvent } from '@/features/fun/useFun'
import { cn } from '@/lib/utils'

type Person = { id: string; name: string }
type Tab = 'emotes' | 'throw' | 'toys'

/**
 * The way into the fun: one button beside Voice, opening a small panel.
 *
 * One button rather than three because of where it lives. The bottom-left
 * cluster is held to a single line so it can never grow up into the
 * nameplates, and the room chip already truncates to make room for Voice —
 * three more buttons there would squeeze the room's own name to nothing.
 *
 * The everyday emotes are also on the number keys, so the panel is for
 * browsing; once you know them, 1–9 is faster than any button.
 */
export function FunDock({
  others,
  events,
  youId,
  enabled,
  onEmote,
  onThrow,
  onToy,
}: {
  /** Everyone in the room except you — the people you can throw things at. */
  others: Person[]
  events: FunEvent[]
  youId: string | null
  /** False while an activity covers the hub, so the keys stay with it. */
  enabled: boolean
  onEmote: (id: string) => void
  onThrow: (to: string, item: string) => void
  onToy: (toy: string, extra?: Record<string, unknown>) => void
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('emotes')
  const [item, setItem] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const panel = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  /* 1–9 send the quick emotes, whenever the hub is on top and you are not
     typing. Modifier keys pass through, so browser shortcuts keep working. */
  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      const n = Number(event.key)
      if (Number.isInteger(n) && n >= 1 && n <= QUICK_EMOTES.length) {
        event.preventDefault()
        onEmote(QUICK_EMOTES[n - 1]!.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, onEmote])

  /* Escape or a click outside closes the panel and hands focus back. */
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    const onDown = (event: PointerEvent) => {
      const t = event.target as Node
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) setItem(null)
  }, [open])

  const throwItem = (id: string) => {
    if (others.length === 0) return
    /* With one other person there is only one place it can go. */
    if (others.length === 1) onThrow(others[0]!.id, id)
    else setItem(id)
  }

  /* What a screen reader hears: the latest thing that happened, politely. */
  const latest = events.at(-1)

  return (
    <div className="pointer-events-auto relative">
      <span className="sr-only" role="status" aria-live="polite">
        {latest ? describe(latest, youId) : ''}
      </span>

      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'glass-pill-ink group flex items-center gap-3 rounded-full py-2 pl-2 pr-5 outline-none',
          'transition-[border-color,box-shadow] duration-500 ease-glass',
          'hover:border-white/25 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal',
          open && 'border-white/30',
        )}
      >
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-mist ring-1 ring-inset ring-white/15 transition-colors group-hover:text-chalk">
          <Sparkles aria-hidden className="size-4" />
        </span>
        <span className="min-w-0 text-left">
          <span className="block font-display text-[0.85rem] font-semibold tracking-[-0.01em] text-chalk">Fun</span>
          <span className="hidden truncate whitespace-nowrap text-[0.68rem] text-mist xl:block">Emotes · throw · toys</span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            role="dialog"
            aria-label="Fun"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="glass-pill-ink absolute bottom-[calc(100%+0.75rem)] left-0 w-[min(23rem,calc(100vw-3rem))] origin-bottom-left rounded-[1.4rem] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,.85)]"
          >
            <div role="tablist" aria-label="Kind" className="mb-3 grid grid-cols-3 gap-1 rounded-full bg-white/5 p-1">
              {(['emotes', 'throw', 'toys'] as const).map((key) => (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={tab === key}
                  onClick={() => {
                    setTab(key)
                    setItem(null)
                  }}
                  className={cn(
                    'rounded-full py-1.5 text-[0.78rem] font-semibold capitalize outline-none transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-signal',
                    tab === key ? 'bg-white/15 text-chalk' : 'text-mist hover:text-chalk',
                  )}
                >
                  {key}
                </button>
              ))}
            </div>

            {tab === 'emotes' && (
              <>
                <div className="grid grid-cols-4 gap-1.5">
                  {EMOTES.map((emote, i) => (
                    <button
                      key={emote.id}
                      type="button"
                      onClick={() => onEmote(emote.id)}
                      title={emote.label}
                      aria-label={`${emote.label}${i < 9 ? ` (key ${i + 1})` : ''}`}
                      className="group/e relative grid aspect-square place-items-center rounded-2xl bg-white/[0.04] text-[1.9rem] outline-none transition-[transform,background-color] duration-200 hover:scale-[1.06] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal active:scale-95"
                    >
                      <span aria-hidden>{emote.glyph}</span>
                      {i < 9 && (
                        <span aria-hidden className="absolute right-1.5 top-1 text-[0.6rem] font-semibold tabular-nums text-dusk">
                          {i + 1}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 px-1 text-[0.7rem] text-dusk">Tip: press 1–9 anywhere in the room.</p>
              </>
            )}

            {tab === 'throw' &&
              (others.length === 0 ? (
                <p className="px-2 py-6 text-center text-[0.82rem] leading-relaxed text-mist">
                  Nobody here to throw things at yet.
                  <br />
                  Share the room code and wait for someone to walk in.
                </p>
              ) : item ? (
                <div>
                  <p className="mb-2 px-1 text-[0.78rem] text-mist">
                    Throw the {throwById(item)?.label.toLowerCase()} at…
                  </p>
                  <div className="flex flex-col gap-1">
                    {others.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => {
                          onThrow(person.id, item)
                          setItem(null)
                        }}
                        className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-left text-[0.9rem] font-semibold text-chalk outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal"
                      >
                        <span className="grid size-8 place-items-center rounded-full bg-white/10 text-[0.8rem]">
                          {person.name.slice(0, 1).toUpperCase()}
                        </span>
                        {person.name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setItem(null)}
                    className="mt-2 px-1 text-[0.75rem] text-dusk underline-offset-2 hover:text-mist hover:underline"
                  >
                    ← Pick something else
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-1.5">
                    {THROWABLES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => throwItem(t.id)}
                        title={t.label}
                        aria-label={`Throw ${t.label.toLowerCase()}${others.length === 1 ? ` at ${others[0]!.name}` : ''}`}
                        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl bg-white/[0.04] outline-none transition-[transform,background-color] duration-200 hover:scale-[1.06] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal active:scale-95"
                      >
                        <span className="grid h-8 place-items-center">
                          <ThrowArt def={t} size={27} />
                        </span>
                        <span aria-hidden className="text-[0.6rem] font-medium text-dusk">
                          {t.label.split(' ').at(-1)}
                        </span>
                      </button>
                    ))}
                  </div>
                  {others.length === 1 && (
                    <p className="mt-2.5 px-1 text-[0.7rem] text-dusk">Lands on {others[0]!.name}.</p>
                  )}
                </>
              ))}

            {tab === 'toys' && (
              <div className="flex flex-col gap-1">
                {TOYS.map((toy) =>
                  toy.id === 'eightball' ? (
                    <form
                      key={toy.id}
                      onSubmit={(event) => {
                        event.preventDefault()
                        onToy('eightball', { question })
                        setQuestion('')
                      }}
                      className="flex items-center gap-2 rounded-2xl bg-white/[0.04] p-2 pl-3"
                    >
                      <span aria-hidden className="text-[1.5rem]">
                        {toy.glyph}
                      </span>
                      <label className="sr-only" htmlFor="eightball-q">
                        Ask the magic 8-ball a yes or no question
                      </label>
                      <input
                        id="eightball-q"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        maxLength={140}
                        placeholder="Ask the 8-ball…"
                        className="min-w-0 flex-1 bg-transparent text-[0.88rem] text-chalk placeholder:text-dusk focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-white/12 px-3 py-1.5 text-[0.75rem] font-semibold text-chalk outline-none transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-signal"
                      >
                        Shake
                      </button>
                    </form>
                  ) : (
                    <button
                      key={toy.id}
                      type="button"
                      onClick={() => onToy(toy.id, toy.id === 'dice' ? { count: 2 } : {})}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-left outline-none transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal"
                    >
                      <span aria-hidden className="text-[1.5rem] leading-none">
                        {toy.glyph}
                      </span>
                      <span>
                        <span className="block text-[0.88rem] font-semibold text-chalk">{toy.label}</span>
                        <span className="block text-[0.7rem] text-dusk">{toy.hint}</span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
