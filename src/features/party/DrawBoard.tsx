import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser, Trash2, Undo2 } from 'lucide-react'

import { getSocket } from '@/lib/socket'
import { cn } from '@/lib/utils'

/**
 * The shared canvas.
 *
 * Coordinates are fractions of the board (0–1), never pixels, so a drawing made
 * on a laptop lands in the same place on a phone. The drawer's points are sent
 * in small batches about twenty times a second — often enough to look live,
 * rarely enough not to flood a mobile connection — and everyone else redraws
 * them as they arrive.
 */

type Stroke = { id: string; color: string; size: number; tool: 'pen' | 'eraser'; points: [number, number][] }

const COLORS = ['#18181b', '#ffffff', '#e63946', '#f4a261', '#ffd166', '#2a9d8f', '#4361ee', '#9b5de5', '#8d5524', '#f15bb5']
const SIZES = [4, 9, 18]
const ASPECT = 4 / 3
const SEND_MS = 50

export function DrawBoard({ roomId, canDraw }: { roomId: string; canDraw: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>([])
  const [color, setColor] = useState(COLORS[0]!)
  const [size, setSize] = useState(SIZES[1]!)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')

  /** Redraw everything — on resize, on undo, on a fresh canvas. */
  const repaint = useCallback(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    ctx.fillStyle = '#fbfaf7'
    ctx.fillRect(0, 0, el.width, el.height)
    for (const s of strokes.current) paint(ctx, el, s, 0)
  }, [])

  /* Keep the backing store at device resolution so lines stay crisp. */
  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const fit = () => {
      const rect = el.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      el.width = Math.round(rect.width * dpr)
      el.height = Math.round(rect.height * dpr)
      repaint()
    }
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    fit()
    return () => observer.disconnect()
  }, [repaint])

  /* Ink from the drawer, and whole-canvas replacements (undo, new turn). */
  useEffect(() => {
    const socket = getSocket()
    const onStroke = (raw: Stroke & { roomId: string }) => {
      if (raw.roomId !== roomId) return
      let stroke = strokes.current.find((s) => s.id === raw.id)
      const from = stroke ? stroke.points.length : 0
      if (!stroke) {
        stroke = { id: raw.id, color: raw.color, size: raw.size, tool: raw.tool, points: [] }
        strokes.current.push(stroke)
      }
      stroke.points.push(...raw.points)
      const el = canvas.current
      const ctx = el?.getContext('2d')
      if (el && ctx) paint(ctx, el, stroke, Math.max(0, from - 1))
    }
    const onCanvas = (raw: { roomId: string; strokes: Stroke[] }) => {
      if (raw.roomId !== roomId) return
      strokes.current = raw.strokes.map((s) => ({ ...s, points: [...s.points] }))
      repaint()
    }
    socket.on('party:stroke', onStroke)
    socket.on('party:canvas', onCanvas)
    return () => {
      socket.off('party:stroke', onStroke)
      socket.off('party:canvas', onCanvas)
    }
  }, [roomId, repaint])

  /* Drawing. Points collect locally and go out in batches. */
  const current = useRef<{ stroke: Stroke; pending: [number, number][]; last: number } | null>(null)
  const flush = useCallback(() => {
    const c = current.current
    if (!c || c.pending.length === 0) return
    const s = c.stroke
    getSocket().emit('party:stroke', { roomId, id: s.id, color: s.color, size: s.size, tool: s.tool, points: c.pending })
    c.pending = []
    c.last = performance.now()
  }, [roomId])

  const pointAt = (event: React.PointerEvent): [number, number] => {
    const rect = canvas.current!.getBoundingClientRect()
    return [
      Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 1000,
      Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 1000,
    ]
  }

  const down = (event: React.PointerEvent) => {
    if (!canDraw) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const p = pointAt(event)
    const stroke: Stroke = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      color: tool === 'eraser' ? '#fbfaf7' : color,
      size: tool === 'eraser' ? size * 2.2 : size,
      tool,
      points: [p],
    }
    strokes.current.push(stroke)
    current.current = { stroke, pending: [p], last: performance.now() }
    const el = canvas.current!
    paint(el.getContext('2d')!, el, stroke, 0)
  }

  const move = (event: React.PointerEvent) => {
    const c = current.current
    if (!c) return
    const p = pointAt(event)
    const prev = c.stroke.points.at(-1)!
    /* Skip points too close to bother sending. */
    if (Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 0.003) return
    c.stroke.points.push(p)
    c.pending.push(p)
    const el = canvas.current!
    paint(el.getContext('2d')!, el, c.stroke, c.stroke.points.length - 2)
    if (performance.now() - c.last > SEND_MS) flush()
  }

  const up = () => {
    flush()
    current.current = null
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative w-full overflow-hidden rounded-[1.1rem] shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)] ring-1 ring-white/10" style={{ aspectRatio: ASPECT }}>
        <canvas
          ref={canvas}
          aria-label={canDraw ? 'Drawing board — draw your word' : 'The drawing so far'}
          role="img"
          className={cn('absolute inset-0 size-full touch-none', canDraw ? 'cursor-crosshair' : 'cursor-default')}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
        />
      </div>

      {canDraw && (
        <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Drawing tools">
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c)
                  setTool('pen')
                }}
                aria-label={`Colour ${c}`}
                aria-pressed={tool === 'pen' && color === c}
                className={cn(
                  'size-7 rounded-full ring-2 outline-none transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                  tool === 'pen' && color === c ? 'scale-110 ring-chalk' : 'ring-white/15',
                )}
                style={{ background: c }}
              />
            ))}
          </div>
          <span className="mx-1 h-6 w-px bg-white/15" aria-hidden />
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-label={`Brush size ${s}`}
              aria-pressed={size === s}
              className={cn(
                'grid size-8 place-items-center rounded-full outline-none transition-colors focus-visible:outline-2 focus-visible:outline-signal',
                size === s ? 'bg-white/20' : 'hover:bg-white/10',
              )}
            >
              <span className="rounded-full bg-chalk" style={{ width: Math.max(4, s * 0.8), height: Math.max(4, s * 0.8) }} />
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-white/15" aria-hidden />
          <ToolButton label="Eraser" pressed={tool === 'eraser'} onClick={() => setTool((t) => (t === 'eraser' ? 'pen' : 'eraser'))}>
            <Eraser className="size-4" aria-hidden />
          </ToolButton>
          <ToolButton label="Undo" onClick={() => getSocket().emit('party:undo', { roomId })}>
            <Undo2 className="size-4" aria-hidden />
          </ToolButton>
          <ToolButton label="Clear the board" onClick={() => getSocket().emit('party:clear', { roomId })}>
            <Trash2 className="size-4" aria-hidden />
          </ToolButton>
        </div>
      )}
    </div>
  )
}

function ToolButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        'grid size-8 place-items-center rounded-full text-chalk outline-none transition-colors focus-visible:outline-2 focus-visible:outline-signal',
        pressed ? 'bg-white/20' : 'hover:bg-white/10',
      )}
    >
      {children}
    </button>
  )
}

/** Paint a stroke from point `from` onward — the whole thing, or just the newest bit. */
function paint(ctx: CanvasRenderingContext2D, el: HTMLCanvasElement, s: Stroke, from: number) {
  const w = el.width
  const h = el.height
  const scale = w / 800
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = s.color
  ctx.fillStyle = s.color
  ctx.lineWidth = s.size * scale
  const pts = s.points
  if (pts.length === 1 || (from === 0 && pts.length === 1)) {
    ctx.beginPath()
    ctx.arc(pts[0]![0] * w, pts[0]![1] * h, (s.size * scale) / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.beginPath()
  ctx.moveTo(pts[from]![0] * w, pts[from]![1] * h)
  for (let i = from + 1; i < pts.length; i++) ctx.lineTo(pts[i]![0] * w, pts[i]![1] * h)
  ctx.stroke()
}
