import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, Check, ChevronDown, Pencil, Trophy, Users } from 'lucide-react'

import { getSocket } from '@/lib/socket'
import './draw.css'

import { DrawBoard } from '@/features/party/DrawBoard'
import { remaining, type PartyState } from '@/features/party/useParty'
import { cn } from '@/lib/utils'

/**
 * Draw and guess, on screen: the board on the left, the guesses on the right,
 * the word (or its blanks) and the clock across the top.
 */

type Person = { id: string; name: string }

export type DrawView = {
  players: Person[]
  scores: Record<string, number>
  turn: number
  turns: number
  drawer: number
  phase: 'choose' | 'draw' | 'reveal' | 'over'
  choices: string[]
  word: string | null
  mask: string | null
  deadline: number | null
  drawSeconds: number
  guessed: string[]
  turnScores?: Record<string, number>
  feed: {
    id: number
    by: Person | null
    text: string
    kind: 'guess' | 'correct' | 'close' | 'system'
  }[]
}

export function DrawSetup({
  people,
  error,
  onStart,
}: {
  people: number
  error: string | null
  onStart: (options: { rounds: number; drawSeconds: number; hints: number; customWords: string[] }) => Promise<{ error?: string }>
}) {
  const [starting, setStarting] = useState(false)
  const [rounds, setRounds] = useState(2)
  const [seconds, setSeconds] = useState(80)
  const [hints, setHints] = useState(2)
  const [custom, setCustom] = useState('')
  const customWords = custom
    .split(/[,\n]/)
    .map((w) => w.trim())
    .filter(Boolean)
  return (
    <div className="draw-setup-shell">
      <div className="draw-setup mx-auto flex w-full max-w-xl flex-col items-center px-5 pb-10 pt-8 text-center">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#ffd166]">Draw and guess</p>
        <h2 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.03em] text-chalk">
          Can’t draw? Perfect.
        </h2>
        <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-mist">
          Everyone takes turns drawing a word. The faster you guess, the more you score — and the drawer scores for every person who gets
          it.
        </p>
        <Choice label="Turns each" values={[1, 2, 3]} value={rounds} onChange={setRounds} />
        <Choice label="Seconds to draw" values={[60, 80, 100]} value={seconds} onChange={setSeconds} />
        <details className="draw-setup-options">
          <summary>
            Make it yours <ChevronDown aria-hidden />
          </summary>
          <Choice label="Letter hints" values={[0, 1, 2]} value={hints} onChange={setHints} />
          <label htmlFor="draw-custom-words">Your own words</label>
          <textarea
            id="draw-custom-words"
            value={custom}
            maxLength={2600}
            onChange={(event) => setCustom(event.target.value)}
            spellCheck={false}
            placeholder="e.g. samosa, spaceship, sleepy cat"
            aria-describedby="draw-custom-help"
          />
          <p id="draw-custom-help">3–80 words, separated by commas or new lines. Leave blank for Huddle’s word bank.</p>
          {customWords.length > 0 && <span>{customWords.length} words added</span>}
        </details>
        {error && (
          <p role="alert" className="mt-4 text-[0.8rem] text-signal-bright">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={people < 2 || starting}
          onClick={async () => {
            if (starting) return
            setStarting(true)
            try {
              await onStart({ rounds, drawSeconds: seconds, hints, customWords })
            } finally {
              setStarting(false)
            }
          }}
          className="mt-7 rounded-full bg-chalk px-8 py-3 text-[0.9rem] font-semibold text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-40 disabled:hover:scale-100"
        >
          {starting ? 'Starting…' : people < 2 ? 'Needs one more person in the room' : `Start with ${Math.min(people, 10)} players`}
        </button>
      </div>
    </div>
  )
}

function Choice({ label, values, value, onChange }: { label: string; values: number[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist">{label}</span>
      <div className="flex gap-1 rounded-full bg-white/[0.06] p-1" role="radiogroup" aria-label={label}>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            tabIndex={value === v ? 0 : -1}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const index = values.indexOf(v)
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? values.length - 1
                    : (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + values.length) % values.length
              onChange(values[next]!)
              event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus()
            }}
            onClick={() => onChange(v)}
            className={cn(
              'min-h-11 min-w-14 rounded-full px-4 py-1.5 text-[0.85rem] font-semibold tabular-nums outline-none transition-colors focus-visible:outline-2 focus-visible:outline-signal',
              value === v ? 'bg-chalk text-void' : 'text-mist hover:text-chalk',
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

function useCountdown(party: PartyState<DrawView>) {
  const [left, setLeft] = useState(() => remaining(party, party.view.deadline))
  useEffect(() => {
    const tick = () => setLeft(remaining(party, party.view.deadline))
    tick()
    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [party])
  return left
}

type DrawAction = (action: string, payload?: Record<string, unknown>) => Promise<{ error?: string }>

export function DrawTable({
  roomId,
  party,
  selfId,
  error,
  act,
  onLeaveTable,
}: {
  roomId: string
  party: PartyState<DrawView>
  selfId: string | undefined
  error: string | null
  act: DrawAction
  onLeaveTable: () => void
}) {
  const view = party.view
  const turnAct: DrawAction = (action, payload) => act(action, { ...payload, turn: view.turn })
  const drawer = view.players[view.drawer]
  const drawing = drawer?.id === selfId
  const playing = view.players.some((p) => p.id === selfId)
  const left = useCountdown(party)
  const total = (view.phase === 'choose' ? 15 : view.phase === 'reveal' ? 5 : view.drawSeconds) * 1000
  const name = (p: Person | null | undefined) => (p?.id === selfId ? 'You' : (p?.name ?? 'Someone'))
  const [scoresOpen, setScoresOpen] = useState(false)
  const [picking, setPicking] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [connected, setConnected] = useState(() => getSocket().connected)
  const surface = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const ranked = [...view.players].sort((a, b) => (view.scores[b.id] ?? 0) - (view.scores[a.id] ?? 0))
  useEffect(() => {
    const socket = getSocket()
    const update = () => setConnected(socket.connected)
    socket.on('connect', update)
    socket.on('disconnect', update)
    return () => {
      socket.off('connect', update)
      socket.off('disconnect', update)
    }
  }, [])
  useEffect(() => {
    // iOS keeps 100dvh behind the keyboard. Fit the game to the visible area
    // instead, retaining the board and the composer together.
    const viewport = window.visualViewport
    const fit = () => {
      const height = viewport?.height ?? window.innerHeight
      surface.current?.style.setProperty('--draw-visible-height', `${height}px`)
      if (surface.current) surface.current.dataset.short = String(height < 540)
      if (height < 540) setScoresOpen(false)
    }
    fit()
    viewport?.addEventListener('resize', fit)
    window.addEventListener('resize', fit)
    return () => {
      viewport?.removeEventListener('resize', fit)
      window.removeEventListener('resize', fit)
    }
  }, [])
  useEffect(() => {
    if (!scoresOpen) return
    const away = (event: PointerEvent) => {
      if (!(event.target as Element | null)?.closest('.draw-scores, .draw-sidebar-header button')) setScoresOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setScoresOpen(false)
    }
    window.addEventListener('pointerdown', away)
    window.addEventListener('keydown', escape)
    return () => {
      window.removeEventListener('pointerdown', away)
      window.removeEventListener('keydown', escape)
    }
  }, [scoresOpen])
  useEffect(() => {
    setPicking(false)
    setSkipping(false)
  }, [view.turn, view.phase])

  const scoreList = (
    <ol className="draw-score-list" data-lenis-prevent aria-label="Scores">
      {ranked.map((p, i) => (
        <li key={p.id} className={cn(p.id === selfId && 'draw-score--self', view.guessed.includes(p.id) && 'draw-score--correct')}>
          <span className="draw-rank">{i + 1}</span>
          <span className="draw-player-name" title={p.name}>
            {name(p)}
          </span>
          {p.id === drawer?.id && view.phase !== 'over' && <Pencil aria-label="Drawing" />}
          {view.guessed.includes(p.id) && <Check aria-label="Guessed it" />}
          <strong>{view.scores[p.id] ?? 0}</strong>
        </li>
      ))}
    </ol>
  )

  return (
    <div ref={surface} className="draw-surface">
      {view.phase === 'over' ? (
        <div className="draw-finish" data-lenis-prevent>
          <div className="draw-finish-card">
            <Trophy className="draw-trophy" aria-hidden />
            <p className="draw-eyebrow">That’s a wrap</p>
            <h2>
              {ranked.length && ranked.every((p) => (view.scores[p.id] ?? 0) === (view.scores[ranked[0]!.id] ?? 0))
                ? 'A shared finish.'
                : ranked.filter((p) => view.scores[p.id] === view.scores[ranked[0]!.id]).length > 1
                  ? 'Tied at the top.'
                  : `${name(ranked[0])} ${ranked[0]?.id === selfId ? 'win' : 'wins'}!`}
            </h2>
            <p className="draw-muted">The masterpieces were questionable. The company wasn’t.</p>
            {scoreList}
            <button type="button" className="draw-primary" onClick={onLeaveTable}>
              Back to games
            </button>
          </div>
        </div>
      ) : (
        <div className={cn('draw-table', drawing && 'draw-table--artist')}>
          <main className="draw-main">
            <header className="draw-header">
              <div className="draw-heading">
                <p className="draw-eyebrow">
                  Draw & guess{' '}
                  <span>
                    · {Math.min(view.turn + 1, view.turns)} / {view.turns}
                  </span>
                </p>
                <p className="draw-turn-name">
                  {drawing ? 'Your turn to draw' : `${drawer?.name ?? 'Someone'} is drawing`}
                  {view.phase === 'draw' && !drawing && view.mask && (
                    <span className="draw-letter-count">
                      {' '}
                      ·{' '}
                      {view.mask
                        .split(' ')
                        .map((w) => w.length)
                        .join(' + ')}{' '}
                      letters
                    </span>
                  )}
                </p>
                <p
                  className={cn('draw-word', view.phase === 'choose' && 'draw-word--choosing')}
                  aria-label={view.word ? `The word is ${view.word}` : view.mask ? `Word hint: ${view.mask}` : 'Choosing a word'}
                >
                  {view.phase === 'choose' ? (drawing ? 'Pick your word' : 'A word is on its way…') : (view.word ?? view.mask)}
                </p>
              </div>
              {drawing && (view.phase === 'choose' || view.phase === 'draw') && (
                <button
                  type="button"
                  className="draw-skip"
                  disabled={!connected || skipping}
                  onClick={async () => {
                    setSkipping(true)
                    try {
                      await turnAct('skip')
                    } finally {
                      setSkipping(false)
                    }
                  }}
                >
                  {skipping ? 'Skipping…' : 'Skip turn'}
                </button>
              )}
              <Clock left={left} total={total} />
            </header>
            <DrawBoard roomId={roomId} canvasKey={`${party.session}:${view.turn}`} canDraw={drawing && view.phase === 'draw' && connected}>
              <AnimatePresence>
                {view.phase === 'choose' && (
                  <Overlay key="choose" reducedMotion={!!reducedMotion}>
                    {drawing ? (
                      <>
                        <Pencil aria-hidden className="draw-overlay-icon" />
                        <h2>What’s your masterpiece?</h2>
                        <p>Pick one. Keep the word to yourself.</p>
                        <div className="draw-word-choices">
                          {view.choices.map((word, i) => (
                            <button
                              key={word}
                              type="button"
                              disabled={picking || !connected}
                              onClick={async () => {
                                if (picking) return
                                setPicking(true)
                                try {
                                  await turnAct('pick', { index: i })
                                } finally {
                                  setPicking(false)
                                }
                              }}
                            >
                              {word}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <Pencil aria-hidden className="draw-overlay-icon" />
                        <h2>{drawer?.name ?? 'The artist'} is choosing</h2>
                        <p>Get ready to guess.</p>
                      </>
                    )}
                  </Overlay>
                )}
                {view.phase === 'reveal' && (
                  <Overlay key="reveal" reducedMotion={!!reducedMotion}>
                    <p>The word was</p>
                    <h2 className="draw-answer">{view.word}</h2>
                    <p>
                      {view.guessed.length === 0
                        ? 'A tough one. On to the next.'
                        : `${view.guessed.length} ${view.guessed.length === 1 ? 'person' : 'people'} guessed it.`}
                    </p>
                    <div className="draw-reveal-scores">
                      {ranked
                        .filter((p) => (view.turnScores?.[p.id] ?? 0) > 0)
                        .slice(0, 3)
                        .map((p) => (
                          <span key={p.id}>
                            <span>{name(p)}</span>
                            <strong>+{view.turnScores?.[p.id]}</strong>
                          </span>
                        ))}
                    </div>
                    <small>Next turn in {Math.ceil(left / 1000)}s</small>
                  </Overlay>
                )}
              </AnimatePresence>
            </DrawBoard>
          </main>
          <aside className="draw-sidebar">
            <header className="draw-sidebar-header">
              <span>
                At the table <span className="draw-player-count">{view.players.length}</span>
              </span>
              <button
                type="button"
                aria-label={scoresOpen ? 'Hide scores' : 'Show scores'}
                aria-expanded={scoresOpen}
                aria-controls="draw-scores"
                onClick={() => setScoresOpen((o) => !o)}
              >
                <Users aria-hidden />
                <span>Scores</span>
                <ChevronDown aria-hidden />
              </button>
            </header>
            <div id="draw-scores" className={cn('draw-scores', scoresOpen && 'draw-scores--open')}>
              {scoreList}
            </div>
            <Feed
              key={`${party.session}:${view.turn}`}
              view={view}
              selfId={selfId}
              drawing={drawing}
              playing={playing}
              connected={connected}
              act={turnAct}
              error={error}
            />
          </aside>
        </div>
      )}
    </div>
  )
}
function Overlay({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  return (
    <motion.div
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.16 }}
      className="draw-overlay"
      data-lenis-prevent
    >
      <div>{children}</div>
    </motion.div>
  )
}
function Clock({ left, total }: { left: number; total: number }) {
  const seconds = Math.ceil(left / 1000)
  const fraction = total > 0 ? Math.min(1, Math.max(0, left / total)) : 0
  return (
    <div className={cn('draw-clock', seconds <= 10 && 'draw-clock--urgent')} aria-label={`${seconds} seconds left`} role="timer">
      <svg viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r="16" className="draw-clock-track" />
        <circle cx="18" cy="18" r="16" className="draw-clock-progress" strokeDasharray={100.5} strokeDashoffset={100.5 * (1 - fraction)} />
      </svg>
      <strong>{seconds}</strong>
    </div>
  )
}
function Feed({
  view,
  selfId,
  drawing,
  playing,
  connected,
  act,
  error,
}: {
  view: DrawView
  selfId: string | undefined
  drawing: boolean
  playing: boolean
  connected: boolean
  act: DrawAction
  error: string | null
}) {
  const [guess, setGuess] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const list = useRef<HTMLUListElement>(null)
  const follow = useRef(true)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const lastFeedId = view.feed.at(-1)?.id
  useEffect(() => {
    const el = list.current
    if (el && follow.current) el.scrollTop = el.scrollHeight
  }, [lastFeedId])
  const done = selfId ? view.guessed.includes(selfId) : false
  const canGuess = view.phase === 'draw' && !drawing && !done && playing
  const status = !connected
    ? 'Reconnecting…'
    : !playing
      ? 'Watching · join the next game'
      : drawing
        ? 'Your friends are guessing'
        : done
          ? 'You got it. Keep it secret!'
          : view.phase === 'choose'
            ? 'The artist is choosing a word'
            : view.phase === 'reveal'
              ? 'Next drawing coming up'
              : 'Guess the sketch. Be quick.'
  return (
    <div className="draw-feed">
      <ul
        ref={list}
        data-lenis-prevent
        className="draw-feed-list"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Guesses"
        onScroll={() => {
          const el = list.current!
          follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
        }}
      >
        {!view.feed.length && (
          <li className="draw-feed-empty">
            <Pencil aria-hidden />
            <span>
              The first sketch is a blank page.
              <br />
              The best guess could be yours.
            </span>
          </li>
        )}
        {view.feed.map((f) => (
          <li key={f.id} className={`draw-entry draw-entry--${f.kind}`}>
            {f.kind === 'guess' && <strong>{f.by?.id === selfId ? 'You' : f.by?.name} </strong>}
            {f.text}
          </li>
        ))}
      </ul>
      <p className="draw-feed-status" role="status">
        {done && <Check aria-hidden />}
        {status}
      </p>
      <form
        className={cn('draw-composer', drawing && 'draw-composer--artist')}
        onSubmit={async (e) => {
          e.preventDefault()
          const text = guess.trim()
          if (!text || !canGuess || !connected || sending || (e.nativeEvent as SubmitEvent & { isComposing?: boolean }).isComposing) return
          setSending(true)
          setSendError(null)
          try {
            const reply = await act('guess', { text })
            if (!mounted.current) return
            if (reply.error) setSendError(reply.error)
            else {
              setGuess((current) => (current.trim() === text ? '' : current))
              follow.current = true
            }
          } catch {
            if (mounted.current) setSendError('Couldn’t send. Your guess is still here.')
          } finally {
            if (mounted.current) setSending(false)
          }
        }}
      >
        <label htmlFor="draw-guess" className="sr-only">
          Your guess
        </label>
        <input
          id="draw-guess"
          value={guess}
          onChange={(e) => {
            setGuess(e.target.value)
            setSendError(null)
          }}
          disabled={!canGuess || !connected}
          maxLength={60}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="send"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault()
          }}
          placeholder={
            drawing
              ? 'You’re the artist'
              : done
                ? 'Guessed it!'
                : !playing
                  ? 'Watching this game'
                  : view.phase === 'draw'
                    ? 'Type your guess…'
                    : 'Wait for the sketch…'
          }
        />
        <button
          type="submit"
          onPointerDown={(event) => event.preventDefault()}
          aria-label={sending ? 'Sending guess' : 'Send guess'}
          disabled={!canGuess || !connected || !guess.trim() || sending}
        >
          <ArrowUp aria-hidden />
        </button>
      </form>
      {(sendError || error) && (
        <p role="alert" className="draw-error">
          {sendError || error}
        </p>
      )}
    </div>
  )
}
