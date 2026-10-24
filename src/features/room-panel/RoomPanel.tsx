import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { PanelRightClose } from 'lucide-react'

import { CallSection } from '@/features/room-panel/CallSection'
import { ChatSection } from '@/features/room-panel/ChatSection'
import type { useChat } from '@/features/room-panel/useChat'
import type { useMeshCall } from '@/features/room-panel/useMeshCall'

/** Kept in one place — the hub and the watch stage both inset by exactly this. */
export const PANEL_WIDTH_REM = 21
/** How narrow it can be dragged: call controls and a chat bubble still fit. */
export const PANEL_MIN_REM = 16

const clampPanel = (rem: number) => Math.min(PANEL_WIDTH_REM, Math.max(PANEL_MIN_REM, rem))

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Call and chat, in one column down the right edge.
 *
 * One panel rather than two, because they are the same activity: you talk while
 * you watch. Call on top because faces are glanceable and chat below because it
 * is the part you actually read — and the whole thing insets the rest of the
 * app rather than floating over it, so nothing important ends up underneath.
 */
export function RoomPanel({
  chat,
  call,
  poppedOut,
  onPopOut,
  selfId,
  selfName,
  onClose,
  width = PANEL_WIDTH_REM,
  onWidthChange,
}: {
  chat: ReturnType<typeof useChat>
  call: ReturnType<typeof useMeshCall>
  poppedOut: string | null
  onPopOut: (who: string | null) => void
  selfId: string | undefined
  selfName: string
  onClose: () => void
  /** Current width in rem; it can only be made narrower than the default. */
  width?: number
  /** Present where the panel sits beside the room and resizing makes sense. */
  onWidthChange?: (rem: number) => void
}) {
  const { setWatching } = chat
  const [dragging, setDragging] = useState(false)
  const remPx = useRef(16)

  /*
   * Everything that insets for this panel eases its padding over half a
   * second, which is lovely on open and a rubber band while dragging. Off for
   * the length of a drag, so the room follows the edge exactly.
   */
  useEffect(() => {
    if (!dragging) return
    document.body.dataset.panelResizing = ''
    return () => {
      delete document.body.dataset.panelResizing
    }
  }, [dragging])

  const fromPointer = (clientX: number) => clampPanel((window.innerWidth - clientX) / remPx.current)

  /* Open means read. Anything arriving now is on screen, so it should never
     land in the unread count. */
  useEffect(() => {
    setWatching(true)
    return () => setWatching(false)
  }, [setWatching])

  return createPortal(
    <motion.aside
      /* Above the watch stage (135) so it stays usable while watching, below
         the hub's modal drawers (140), which are meant to take over. */
      className="fixed inset-y-0 right-0 z-[138] flex flex-col border-l border-white/[0.08] bg-void/90 backdrop-blur-xl"
      /* Full width where it has to cover the room, its own column where there
         is space to sit beside it. Matches the breakpoint the hub uses to
         decide whether to inset at all, so the two can never disagree. */
      style={{ width: `min(100vw, ${width}rem)` }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {onWidthChange && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize the room panel"
          aria-valuemin={PANEL_MIN_REM}
          aria-valuemax={PANEL_WIDTH_REM}
          aria-valuenow={Math.round(width)}
          tabIndex={0}
          title="Drag to make narrower · double-click to reset"
          /* Captured, so the drag keeps following the pointer even across the
             video's iframe, which would otherwise swallow the movement. */
          onPointerDown={(event) => {
            if (event.button !== 0) return
            event.preventDefault()
            remPx.current = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
            event.currentTarget.setPointerCapture(event.pointerId)
            setDragging(true)
          }}
          onPointerMove={(event) => {
            if (dragging) onWidthChange(fromPointer(event.clientX))
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onDoubleClick={() => onWidthChange(PANEL_WIDTH_REM)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 2 : 1
            const next =
              event.key === 'ArrowLeft' ? width + step
              : event.key === 'ArrowRight' ? width - step
              : event.key === 'Home' ? PANEL_WIDTH_REM
              : event.key === 'End' ? PANEL_MIN_REM
              : null
            if (next === null) return
            event.preventDefault()
            onWidthChange(clampPanel(next))
          }}
          className="group absolute inset-y-0 -left-1.5 z-10 w-3 cursor-col-resize touch-none outline-none"
        >
          <span
            aria-hidden
            className={
              'absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 transition-colors duration-200 ' +
              (dragging ? 'bg-signal' : 'bg-transparent group-hover:bg-white/25 group-focus-visible:bg-signal')
            }
          />
        </div>
      )}
      <header className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
        <h2 className="font-display text-[0.95rem] font-semibold tracking-[-0.015em] text-chalk">
          Room
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="grid size-8 place-items-center rounded-full text-mist outline-none transition-colors hover:bg-white/10 hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <PanelRightClose aria-hidden className="size-4" />
        </button>
      </header>

      <CallSection
        call={call}
        selfName={selfName}
        poppedOut={poppedOut}
        onPopOut={onPopOut}
      />

      <ChatSection
        messages={chat.messages}
        typing={chat.typing}
        selfId={selfId}
        onSend={chat.send}
        onType={chat.noteTyping}
      />
    </motion.aside>,
    document.body,
  )
}
