import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser, PaintBucket, Redo2, Trash2, Undo2 } from 'lucide-react'
import { INK_HEIGHT, INK_WIDTH, PAPER_COLOR as PAPER, paintInk, type DrawStroke as Stroke } from './drawInk'

import { getSocket } from '@/lib/socket'
import { cn } from '@/lib/utils'

type ActiveStroke = {
  stroke: Stroke
  pending: [number, number][]
  pointerId: number
}
const COLORS = [
  ['#18181b', 'Black'],
  ['#ffffff', 'White'],
  ['#e63946', 'Red'],
  ['#f4a261', 'Orange'],
  ['#ffd166', 'Yellow'],
  ['#2a9d8f', 'Green'],
  ['#4361ee', 'Blue'],
  ['#9b5de5', 'Violet'],
  ['#8d5524', 'Brown'],
  ['#f15bb5', 'Pink'],
] as const
const SIZES = [4, 9, 18]
const SEND_MS = 50

/** A single 4:3 page, shared in normalised coordinates on every screen. */
export function DrawBoard({
  roomId,
  canvasKey,
  canDraw,
  children,
}: {
  roomId: string
  canvasKey: string
  canDraw: boolean
  children?: React.ReactNode
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>([])
  const current = useRef<ActiveStroke | null>(null)
  const lastFill = useRef(-Infinity)
  const [ready, setReady] = useState(false)
  const [inkCount, setInkCount] = useState(0)
  const [canRedo, setCanRedo] = useState(false)
  const [hasInk, setHasInk] = useState(false)
  const [color, setColor] = useState<string>(COLORS[0][0])
  const [size, setSize] = useState(SIZES[1]!)
  const [tool, setTool] = useState<'pen' | 'eraser' | 'fill'>('pen')

  const repaint = useCallback(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, el.width, el.height)
    for (const s of strokes.current) paintInk(ctx, s)
  }, [])

  useEffect(() => {
    const socket = getSocket()
    const sync = () => {
      current.current = null
      setReady(false)
      if (socket.connected) socket.emit('party:canvas:request', { roomId, key: canvasKey })
    }
    const onStroke = (raw: Stroke & { roomId: string; key: string }) => {
      if (raw.roomId !== roomId || raw.key !== canvasKey) return
      let stroke = strokes.current.find((s) => s.id === raw.id)
      const from = stroke ? stroke.points.length : 0
      if (!stroke) {
        stroke = {
          id: raw.id,
          color: raw.color,
          size: raw.size,
          tool: raw.tool,
          points: [],
        }
        strokes.current.push(stroke)
      }
      stroke.points.push(...raw.points)
      const el = canvas.current
      const ctx = el?.getContext('2d')
      if (el && ctx) {
        if (stroke.tool === 'fill') repaint()
        else paintInk(ctx, stroke, Math.max(0, from - 1))
      }
      setInkCount(strokes.current.length)
      setHasInk(strokes.current.at(-1)?.tool !== 'clear')
      setCanRedo(false)
    }
    const onCanvas = (raw: { roomId: string; key: string; strokes: Stroke[]; canRedo?: boolean }) => {
      if (raw.roomId !== roomId || raw.key !== canvasKey) return
      current.current = null
      strokes.current = raw.strokes.map((s) => ({
        ...s,
        points: [...s.points],
      }))
      setInkCount(strokes.current.length)
      setHasInk(strokes.current.length > 0 && strokes.current.at(-1)?.tool !== 'clear')
      setCanRedo(!!raw.canRedo)
      setReady(true)
      repaint()
    }
    strokes.current = []
    setInkCount(0)
    setHasInk(false)
    setCanRedo(false)
    repaint()
    socket.on('party:stroke', onStroke)
    socket.on('party:canvas', onCanvas)
    socket.on('connect', sync)
    socket.on('disconnect', sync)
    // Subscribe before requesting: the initial party:open can arrive before
    // this board mounts, especially when returning from the game picker.
    sync()
    return () => {
      current.current = null
      socket.off('party:stroke', onStroke)
      socket.off('party:canvas', onCanvas)
      socket.off('connect', sync)
      socket.off('disconnect', sync)
    }
  }, [roomId, canvasKey, repaint])

  const flush = useCallback(() => {
    const c = current.current
    const socket = getSocket()
    if (!c || !c.pending.length || !socket.connected) return
    // Never buffer ink through a disconnect: the server snapshot is authority.
    const s = c.stroke
    while (c.pending.length) {
      socket.emit('party:stroke', {
        roomId,
        key: canvasKey,
        id: s.id,
        color: s.color,
        size: s.size,
        tool: s.tool,
        points: c.pending.splice(0, 200),
      })
    }
  }, [roomId, canvasKey])

  useEffect(() => {
    if (!canDraw || !ready) {
      current.current = null
      return
    }
    const timer = window.setInterval(flush, SEND_MS)
    const finish = () => {
      flush()
      current.current = null
    }
    window.addEventListener('blur', finish)
    document.addEventListener('visibilitychange', finish)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('blur', finish)
      document.removeEventListener('visibilitychange', finish)
      current.current = null
    }
  }, [canDraw, ready, flush])

  const pointAt = (event: { clientX: number; clientY: number }): [number, number] => {
    const rect = canvas.current!.getBoundingClientRect()
    const clamp = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 1000) / 1000
    return [clamp((event.clientX - rect.left) / rect.width), clamp((event.clientY - rect.top) / rect.height)]
  }
  const down = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw || !ready || !event.isPrimary || event.button !== 0 || current.current) return
    if (tool === 'fill' && performance.now() - lastFill.current < 250) return
    event.preventDefault()
    if (tool !== 'fill') event.currentTarget.setPointerCapture(event.pointerId)
    const p = pointAt(event)
    const stroke: Stroke = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`,
      color: tool === 'eraser' ? PAPER : color,
      size: tool === 'eraser' ? size * 2.2 : size,
      tool,
      points: [p],
    }
    if (tool === 'fill') {
      repaint()
      const ctx = event.currentTarget.getContext('2d')
      if (!ctx || paintInk(ctx, stroke) === false) return
      lastFill.current = performance.now()
    }
    strokes.current.push(stroke)
    setInkCount(strokes.current.length)
    setHasInk(true)
    setCanRedo(false)
    current.current = { stroke, pending: [p], pointerId: event.pointerId }
    const ctx = event.currentTarget.getContext('2d')
    if (ctx && tool !== 'fill') paintInk(ctx, stroke)
    flush()
    if (tool === 'fill') current.current = null
  }
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const c = current.current
    if (!canDraw || !ready || !c || c.pointerId !== event.pointerId) return
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? []
    for (const sample of samples.length ? samples : [event]) {
      const p = pointAt(sample)
      const prev = c.stroke.points.at(-1)!
      if (Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 0.001) continue
      c.stroke.points.push(p)
      c.pending.push(p)
      const ctx = event.currentTarget.getContext('2d')
      if (ctx) paintInk(ctx, c.stroke, c.stroke.points.length - 2)
    }
  }
  const up = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (current.current?.pointerId !== event.pointerId) return
    if (event.type === 'pointerup') move(event)
    flush()
    current.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const edit = (action: 'undo' | 'redo' | 'clear') => {
    if (!ready || !getSocket().connected) return
    flush()
    current.current = null
    getSocket().emit(`party:${action}`, { roomId, key: canvasKey })
  }

  const editRef = useRef(edit)
  editRef.current = edit
  useEffect(() => {
    if (!canDraw || !ready) return
    const shortcut = (event: KeyboardEvent) => {
      if ((event.target as Element | null)?.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'z' || event.key.toLowerCase() === 'y') {
          event.preventDefault()
          editRef.current(event.shiftKey || event.key.toLowerCase() === 'y' ? 'redo' : 'undo')
        }
        return
      }
      if (event.altKey) return
      if (event.key.toLowerCase() === 'b') setTool('pen')
      if (event.key.toLowerCase() === 'e') setTool('eraser')
      if (event.key.toLowerCase() === 'f') setTool('fill')
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [canDraw, ready])

  return (
    <div className="draw-board">
      <div className="draw-paper-slot">
        <div className="draw-paper">
          <canvas
            ref={canvas}
            width={INK_WIDTH}
            height={INK_HEIGHT}
            role="img"
            aria-label={canDraw ? 'Drawing board — draw your word' : 'The drawing so far'}
            className={cn('draw-canvas', canDraw && ready && 'draw-canvas--active')}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onLostPointerCapture={up}
          />
          {children}
          {!ready && (
            <div className="draw-sync" role="status">
              Syncing drawing…
            </div>
          )}
        </div>
      </div>
      {canDraw && (
        <div className="draw-tools" data-lenis-prevent aria-label="Drawing tools" role="group">
          <div className="draw-colors" data-lenis-prevent role="group" aria-label="Ink colour">
            {COLORS.map(([c, label]) => (
              <button
                key={c}
                type="button"
                aria-label={`${label} ink`}
                title={label}
                disabled={!ready}
                aria-pressed={tool !== 'eraser' && color === c}
                onClick={() => {
                  setColor(c)
                  setTool((t) => (t === 'eraser' ? 'pen' : t))
                }}
              >
                <span style={{ background: c }} />
              </button>
            ))}
          </div>
          <div className="draw-tool-actions">
            <select
              className="draw-brush-size"
              aria-label="Brush size"
              value={size}
              disabled={!ready}
              onChange={(event) => setSize(Number(event.target.value))}
            >
              {SIZES.map((s, i) => (
                <option key={s} value={s}>
                  {['Fine', 'Med', 'Bold'][i]}
                </option>
              ))}
            </select>
            <div className="draw-edits">
              <ToolButton
                label="Fill colour"
                disabled={!ready}
                pressed={tool === 'fill'}
                onClick={() => setTool((t) => (t === 'fill' ? 'pen' : 'fill'))}
              >
                <PaintBucket aria-hidden />
              </ToolButton>
              <ToolButton
                label="Eraser"
                disabled={!ready}
                pressed={tool === 'eraser'}
                onClick={() => setTool((t) => (t === 'eraser' ? 'pen' : 'eraser'))}
              >
                <Eraser aria-hidden />
              </ToolButton>
              <ToolButton label="Undo last stroke" disabled={!ready || !inkCount} onClick={() => edit('undo')}>
                <Undo2 aria-hidden />
              </ToolButton>
              <ToolButton label="Redo last stroke" disabled={!ready || !canRedo} onClick={() => edit('redo')}>
                <Redo2 aria-hidden />
              </ToolButton>
              <ToolButton label="Clear the board" disabled={!ready || !hasInk} onClick={() => edit('clear')}>
                <Trash2 aria-hidden />
              </ToolButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
function ToolButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={`${label}${label === 'Fill colour' ? ' · F' : label === 'Eraser' ? ' · E' : label === 'Undo last stroke' ? ' · Ctrl/⌘ Z' : label === 'Redo last stroke' ? ' · Ctrl/⌘ Shift Z' : ''}`}
      aria-pressed={pressed}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
