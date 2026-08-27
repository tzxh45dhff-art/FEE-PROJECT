import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  FileQuestion,
  FolderOpen,
  Loader2,
  MessagesSquare,
  NotebookPen,
  Terminal,
  Timer,
  TrendingUp,
  WifiOff,
  X,
} from 'lucide-react'

import { CoverAmbience } from '@/features/music/CoverAmbience'
import * as studyApi from '@/features/study/api'
import { SubjectBar } from '@/features/study/SubjectBar'
import { FocusTimer } from '@/features/study/FocusTimer'
import { useStudySync, useStudyTimer } from '@/features/study/useStudyTimer'
import { cn } from '@/lib/utils'

/* Each pane is its own chunk. The library pane pulls a PDF-shaped list, the
   notes pane pulls a markdown renderer and a diagram engine, and the coding
   pane pulls an entire editor — loading all of that to show a countdown would
   make the cheapest thing here the slowest. */
const ResourcesPane = lazy(() => import('@/features/study/panes/ResourcesPane'))
const McqPane = lazy(() => import('@/features/study/panes/McqPane'))
const NotesPane = lazy(() => import('@/features/study/panes/NotesPane'))
const CodingPane = lazy(() => import('@/features/study/panes/CodingPane'))
const ProgressPane = lazy(() => import('@/features/study/panes/ProgressPane'))

const EASE = [0.16, 1, 0.3, 1] as const

export type StudyTab = 'timer' | 'resources' | 'mcq' | 'notes' | 'coding' | 'progress'

const TABS: { id: StudyTab; label: string; icon: typeof Timer }[] = [
  { id: 'timer', label: 'Focus', icon: Timer },
  { id: 'resources', label: 'Library', icon: FolderOpen },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'mcq', label: 'Questions', icon: FileQuestion },
  { id: 'coding', label: 'Problems', icon: Terminal },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
]

/**
 * The Study stage.
 *
 * Same shape as Watch, Listen and Play — full screen, portalled, opening out
 * of the control that summoned it — because it is the same kind of thing: an
 * activity the whole room is in.
 *
 * Everything inside is scoped to a subject rather than to the room. A room
 * studying three courses is the normal case, and a shelf that mixes them is
 * worse than useless: the search that grounds every generated question would
 * pull the wrong document and answer confidently from it.
 */
export function StudyStage({
  roomId,
  selfId,
  onClose,
  insetRight = 0,
  panelOpen = false,
  onTogglePanel,
  unread = 0,
  origin,
}: {
  roomId: string
  selfId: string | undefined
  onClose: () => void
  insetRight?: number
  panelOpen?: boolean
  onTogglePanel?: () => void
  unread?: number
  origin?: DOMRect | null
}) {
  const [tab, setTab] = useState<StudyTab>('timer')
  const [subjects, setSubjects] = useState<studyApi.Subject[] | null>(null)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [caps, setCaps] = useState<studyApi.Capabilities | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timer = useStudyTimer(roomId, true)

  const loadSubjects = useCallback(async () => {
    try {
      const { subjects: rows } = await studyApi.subjects(roomId)
      setSubjects(rows)
      /* Keep whatever was open if it still exists, so a refresh triggered by
         somebody else's upload does not move the page underneath you. */
      setSubjectId((current) =>
        current && rows.some((row) => row.id === current) ? current : (rows[0]?.id ?? null),
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load subjects.')
      setSubjects([])
    }
  }, [roomId])

  useEffect(() => {
    void loadSubjects()
    void studyApi
      .capabilities(roomId)
      .then(setCaps)
      .catch(() => setCaps({ ai: false, search: false, judge: false, judgeLanguages: [], chatModel: null }))
  }, [roomId, loadSubjects])

  /* Somebody else added a subject; the list is the one thing every pane shares
     so it is refreshed here rather than in each of them. */
  const announce = useStudySync(roomId, (kind) => {
    if (kind === 'subjects') void loadSubjects()
  })

  const subject = useMemo(
    () => subjects?.find((row) => row.id === subjectId) ?? null,
    [subjects, subjectId],
  )

  const revealX = origin ? `${Math.round(origin.left + origin.width / 2)}px` : '50%'
  const revealY = origin ? `${Math.round(origin.top + origin.height / 2)}px` : '50%'

  const paneProps = { roomId, subject, caps, announce, selfId }

  return createPortal(
    <motion.div
      className="fixed left-0 top-0 z-[135] flex flex-col overflow-hidden bg-void transition-[padding] duration-500 ease-glass"
      style={{
        width: '100vw',
        height: '100dvh',
        paddingRight: `${insetRight}rem`,
        ['--reveal-x' as string]: revealX,
        ['--reveal-y' as string]: revealY,
        animation: 'stage-reveal 0.62s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <CoverAmbience palette={null} />

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 py-4">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 backdrop-blur-md">
            <BookOpen aria-hidden className="size-3.5 text-mist" />
            <span className="truncate text-[0.72rem] text-chalk">
              {subject ? subject.name : 'Study'}
            </span>
          </span>

          {!timer.connected && (
            <span className="flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1.5 text-signal-bright">
              <WifiOff aria-hidden className="size-3.5" />
              <span className="text-[0.72rem]">Reconnecting…</span>
            </span>
          )}

          {/* Said once, at the top, rather than on every disabled button —
              and said honestly: the two capabilities are independent, so a
              server can write questions with no way to search documents, or
              search documents through a different provider than the one
              writing them. */}
          {caps && !caps.ai && (
            <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-dusk sm:flex">
              <span className="text-[0.72rem]">No AI key on this server — generating is off</span>
            </span>
          )}
          {caps && caps.ai && !caps.search && (
            <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-dusk sm:flex">
              <span className="text-[0.72rem]">No embedding provider — documents won't be searchable</span>
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {onTogglePanel && (
            <button
              type="button"
              onClick={onTogglePanel}
              aria-label="Chat and call"
              aria-pressed={panelOpen}
              className={cn(
                'relative flex h-11 items-center gap-2 rounded-full border px-3.5 outline-none backdrop-blur-md sm:h-9 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                panelOpen
                  ? 'border-signal/50 bg-signal/15 text-chalk'
                  : 'border-white/10 bg-white/[0.04] text-chalk hover:bg-white/[0.1]',
              )}
            >
              <MessagesSquare aria-hidden className="size-4" />
              {unread > 0 && !panelOpen && (
                <span className="min-w-4 rounded-full bg-signal px-1 text-[0.62rem] font-semibold leading-4 text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Leave study"
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-chalk outline-none backdrop-blur-md sm:size-9 transition-colors hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <X aria-hidden className="size-4" />
          </button>
        </span>
      </header>

      <SubjectBar
        roomId={roomId}
        subjects={subjects}
        activeId={subjectId}
        onPick={setSubjectId}
        onChanged={() => {
          void loadSubjects()
          announce('subjects')
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col md:flex-row">
        {/* A rail on a wide screen, a scrolling strip on a narrow one — the
            same shape the Listen browser uses for its own sections. */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto px-4 pb-2 pt-1 md:w-48 md:flex-col md:overflow-visible md:px-4 md:pb-6 md:pt-2">
          {TABS.map((entry) => {
            const active = tab === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2 text-left outline-none transition-colors duration-300',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                  active ? 'text-chalk' : 'text-mist hover:text-chalk',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="study-nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/10"
                    transition={{ duration: 0.32, ease: EASE }}
                  />
                )}
                <entry.icon aria-hidden className="size-4 shrink-0" />
                <span className="whitespace-nowrap text-[0.82rem]">{entry.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 md:pl-0 md:pr-6">
          {error && (
            <p role="alert" className="px-2 pb-3 text-[0.8rem] text-signal-bright">
              {error}
            </p>
          )}

          {/* A subject is the unit everything else hangs off, so the panes are
              not shown until there is one — an empty Library for a subject
              that does not exist would just be a dead end. */}
          {subjects !== null && subjects.length === 0 ? (
            <Empty />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="h-full min-h-0"
              >
                <Suspense fallback={<Waiting />}>
                  {tab === 'timer' && <FocusTimer timer={timer} />}
                  {tab === 'resources' && <ResourcesPane {...paneProps} />}
                  {tab === 'mcq' && <McqPane {...paneProps} />}
                  {tab === 'notes' && <NotesPane {...paneProps} />}
                  {tab === 'coding' && <CodingPane {...paneProps} />}
                  {tab === 'progress' && <ProgressPane {...paneProps} />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>,
    document.body,
  )
}

function Waiting() {
  return (
    <div className="grid h-full place-items-center">
      <Loader2 aria-hidden className="size-5 animate-spin text-mist" />
    </div>
  )
}

function Empty() {
  return (
    <div className="grid h-full place-items-center px-6">
      <div className="max-w-sm text-center">
        <BookOpen aria-hidden className="mx-auto size-7 text-dusk" />
        <p className="mt-4 font-display text-[1.05rem] font-semibold text-chalk">
          Add a subject to begin
        </p>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-mist">
          Everything here belongs to one subject — its documents, its questions, its notes. Upload
          a course handout to one and the rest is written from what that course actually covers.
        </p>
      </div>
    </div>
  )
}
