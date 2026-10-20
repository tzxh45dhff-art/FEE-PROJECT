/**
 * Frames for photo booth pictures, drawn around a captured room.
 *
 * Each one is a small piece of print design rather than a border: the
 * Polaroid's deep bottom edge with a written caption, the film strip's
 * sprockets and orange date stamp, the hearts card for the two of you, and a
 * clean full-bleed shot with the caption laid over it.
 */

export type Frame = 'polaroid' | 'film' | 'hearts' | 'clean'

export const FRAMES: { id: Frame; label: string }[] = [
  { id: 'polaroid', label: 'Polaroid' },
  { id: 'film', label: 'Film' },
  { id: 'hearts', label: 'Hearts' },
  { id: 'clean', label: 'Clean' },
]

type Meta = { caption: string; room: string; date: Date }

const DISPLAY = 'Archivo, "Helvetica Neue", system-ui, sans-serif'
const SANS = 'Inter, system-ui, sans-serif'
const SERIF = 'Georgia, "Times New Roman", serif'

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 2
  ctx.beginPath()
  ctx.moveTo(x, y + s * 0.6)
  ctx.bezierCurveTo(x - s * 1.2, y - s * 0.2, x - s * 0.6, y - s * 1.2, x, y - s * 0.45)
  ctx.bezierCurveTo(x + s * 0.6, y - s * 1.2, x + s * 1.2, y - s * 0.2, x, y + s * 0.6)
  ctx.fill()
}

/** Shrink text until it fits. */
function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, max: number) {
  let px = start
  ctx.font = font(px)
  while (px > 10 && ctx.measureText(text).width > max) {
    px -= 1
    ctx.font = font(px)
  }
  return px
}

const shortDate = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
const stamp = (d: Date) => `'${String(d.getFullYear()).slice(2)} ${String(d.getMonth() + 1).padStart(2, ' ')} ${String(d.getDate()).padStart(2, ' ')}`

export function framePhoto(room: HTMLCanvasElement, frame: Frame, meta: Meta): HTMLCanvasElement {
  const W = room.width
  const H = room.height
  const out = document.createElement('canvas')
  const ctx = out.getContext('2d')!
  const caption = meta.caption.trim()

  if (frame === 'polaroid') {
    const pad = Math.round(W * 0.04)
    const bottom = Math.round(W * 0.15)
    out.width = W + pad * 2
    out.height = H + pad + bottom
    ctx.fillStyle = '#fbf8f2'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.drawImage(room, pad, pad)
    /* A hairline of shadow where the print meets the card. */
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'
    ctx.lineWidth = Math.max(1, W * 0.001)
    ctx.strokeRect(pad, pad, W, H)
    const baseline = H + pad + bottom * 0.52
    if (caption) {
      fit(ctx, caption, (px) => `italic ${px}px ${SERIF}`, Math.round(W * 0.034), W * 0.72)
      ctx.fillStyle = '#2b2530'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(caption, pad * 1.2, baseline)
    }
    ctx.font = `500 ${Math.round(W * 0.014)}px ${SANS}`
    ctx.fillStyle = '#8b8290'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${meta.room} · ${shortDate(meta.date)}`, out.width - pad * 1.2, caption ? baseline : H + pad + bottom * 0.5)
    return out
  }

  if (frame === 'film') {
    const side = Math.round(W * 0.025)
    const band = Math.round(W * 0.07)
    out.width = W + side * 2
    out.height = H + band * 2
    ctx.fillStyle = '#0c0b0d'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.drawImage(room, side, band)
    /* Sprockets. */
    const hole = { w: W * 0.022, h: band * 0.32 }
    ctx.fillStyle = 'rgba(240,236,228,0.9)'
    for (let x = side; x < out.width - hole.w; x += hole.w * 2.1) {
      for (const y of [band * 0.22, out.height - band * 0.22 - hole.h]) {
        ctx.beginPath()
        ctx.roundRect(x, y, hole.w, hole.h, hole.h * 0.25)
        ctx.fill()
      }
    }
    ctx.fillStyle = '#f2a33a'
    ctx.font = `600 ${Math.round(band * 0.2)}px ui-monospace, "SF Mono", monospace`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText('HUDDLE 400', side, band * 0.78)
    ctx.textAlign = 'right'
    ctx.fillText('24A ▸', out.width - side, band * 0.78)
    /* The date burnt into the corner, disposable-camera style. */
    ctx.font = `700 ${Math.round(W * 0.026)}px ui-monospace, "SF Mono", monospace`
    ctx.shadowColor = 'rgba(255,120,30,0.8)'
    ctx.shadowBlur = W * 0.006
    ctx.fillText(stamp(meta.date), side + W - W * 0.03, band + H - W * 0.03)
    ctx.shadowBlur = 0
    if (caption) {
      fit(ctx, caption.toUpperCase(), (px) => `600 ${px}px ui-monospace, "SF Mono", monospace`, Math.round(band * 0.24), W * 0.8)
      ctx.textAlign = 'left'
      ctx.fillText(caption.toUpperCase(), side, out.height - band * 0.72)
    }
    return out
  }

  if (frame === 'hearts') {
    const pad = Math.round(W * 0.05)
    out.width = W + pad * 2
    out.height = H + pad * 2.6
    const g = ctx.createLinearGradient(0, 0, out.width, out.height)
    g.addColorStop(0, '#ff8fb1')
    g.addColorStop(0.5, '#ffb3a7')
    g.addColorStop(1, '#ffd29d')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, out.width, out.height)
    /* Hearts scattered round the edge, never over the picture. */
    let seed = 7
    const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    for (let i = 0; i < 46; i++) {
      const edge = i % 4
      const along = rand()
      const into = rand() * pad * 0.8 + pad * 0.1
      const x = edge < 2 ? along * out.width : edge === 2 ? into : out.width - into
      const y = edge === 0 ? into : edge === 1 ? out.height - into : along * out.height
      heart(ctx, x, y, pad * (0.18 + rand() * 0.3))
    }
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(pad, pad, W, H, W * 0.02)
    ctx.clip()
    ctx.drawImage(room, pad, pad)
    ctx.restore()
    const label = caption || meta.room
    const px = fit(ctx, label, (p) => `700 ${p}px ${DISPLAY}`, Math.round(W * 0.03), W * 0.7)
    const w = ctx.measureText(label).width + px * 2
    const h = px * 2.1
    const y = pad + H + pad * 0.8 - h / 2
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(out.width / 2 - w / 2, y, w, h, h / 2)
    ctx.fill()
    ctx.fillStyle = '#d6336c'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, out.width / 2, y + h / 2 + px * 0.05)
    ctx.font = `600 ${Math.round(W * 0.013)}px ${SANS}`
    ctx.fillStyle = 'rgba(120,30,60,0.75)'
    ctx.fillText(shortDate(meta.date), out.width / 2, y + h + pad * 0.32)
    return out
  }

  /* Clean: full bleed, caption over a soft shadow. */
  out.width = W
  out.height = H
  ctx.drawImage(room, 0, 0)
  const shade = ctx.createLinearGradient(0, H * 0.62, 0, H)
  shade.addColorStop(0, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(0,0,0,0.62)')
  ctx.fillStyle = shade
  ctx.fillRect(0, H * 0.62, W, H * 0.38)
  /* Right-aligned: the pet sits in the bottom-left corner of the room. */
  const x = W * 0.96
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  if (caption) {
    fit(ctx, caption, (px) => `700 ${px}px ${DISPLAY}`, Math.round(W * 0.042), W * 0.8)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(caption, x, H - W * 0.055)
  }
  ctx.font = `500 ${Math.round(W * 0.014)}px ${SANS}`
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  ctx.fillText(`${meta.room} · ${shortDate(meta.date)}`, x, H - W * 0.028)
  return out
}

export function toJpeg(canvas: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not save the picture'))), 'image/jpeg', quality))
}
