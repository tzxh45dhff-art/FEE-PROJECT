export type DrawStroke = {
  id: string
  color: string
  size: number
  tool: 'pen' | 'eraser' | 'fill' | 'clear'
  points: [number, number][]
}
export const PAPER_COLOR = '#fbfaf7'
// One shared raster keeps bucket boundaries identical on a phone and a laptop.
// CSS scales the page; resizing/orientation never clears the backing store.
export const INK_WIDTH = 1600
export const INK_HEIGHT = 1200

/** Non-recursive flood fill: a bounded queue avoids call-stack overflow. */
export function fillPixels(data: Uint8ClampedArray, width: number, height: number, x: number, y: number, color: string) {
  x = Math.max(0, Math.min(width - 1, Math.floor(x)))
  y = Math.max(0, Math.min(height - 1, Math.floor(y)))
  const start = (y * width + x) * 4
  const target = [data[start]!, data[start + 1]!, data[start + 2]!]
  const replacement = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)]
  if (replacement.every((v, i) => Math.abs(v - target[i]!) <= 12)) return false
  const matches = (pixel: number) => {
    const i = pixel * 4
    return Math.abs(data[i]! - target[0]!) <= 12 && Math.abs(data[i + 1]! - target[1]!) <= 12 && Math.abs(data[i + 2]! - target[2]!) <= 12
  }
  const queue = new Uint32Array(width * height)
  let head = 0,
    tail = 0
  const add = (pixel: number) => {
    if (!matches(pixel)) return
    const i = pixel * 4
    data[i] = replacement[0]!
    data[i + 1] = replacement[1]!
    data[i + 2] = replacement[2]!
    data[i + 3] = 255
    queue[tail++] = pixel
  }
  add(y * width + x)
  while (head < tail) {
    const pixel = queue[head++]!
    const px = pixel % width
    if (px > 0) add(pixel - 1)
    if (px < width - 1) add(pixel + 1)
    if (pixel >= width) add(pixel - width)
    if (pixel < width * (height - 1)) add(pixel + width)
  }
  return true
}

export function paintInk(ctx: CanvasRenderingContext2D, stroke: DrawStroke, from = 0) {
  const width = ctx.canvas.width,
    height = ctx.canvas.height
  if (stroke.tool === 'clear') {
    ctx.fillStyle = PAPER_COLOR
    ctx.fillRect(0, 0, width, height)
    return
  }
  if (!stroke.points.length) return
  if (stroke.tool === 'fill') {
    const pixels = ctx.getImageData(0, 0, width, height)
    const changed = fillPixels(pixels.data, width, height, stroke.points[0]![0] * width, stroke.points[0]![1] * height, stroke.color)
    if (changed) ctx.putImageData(pixels, 0, 0)
    return changed
  }
  const radius = (stroke.size * width) / 800
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = stroke.color
  ctx.fillStyle = stroke.color
  ctx.lineWidth = radius
  if (stroke.points.length === 1) {
    ctx.beginPath()
    ctx.arc(stroke.points[0]![0] * width, stroke.points[0]![1] * height, radius / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.beginPath()
  ctx.moveTo(stroke.points[from]![0] * width, stroke.points[from]![1] * height)
  for (let i = from + 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i]![0] * width, stroke.points[i]![1] * height)
  ctx.stroke()
}
