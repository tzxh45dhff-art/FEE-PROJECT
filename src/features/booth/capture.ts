/**
 * Taking the picture: the room as it looks right now, flattened into one image.
 *
 * The room is several layers that no single browser API can photograph at
 * once — a backdrop that is an image stack or a video, a WebGL canvas with
 * the characters in it, the pet drawn in SVG, and nameplates in the DOM. So
 * each is drawn into one canvas here, in the same order and at the same place
 * it sits on screen. Screenshot libraries that re-render the DOM get WebGL and
 * video wrong, which are exactly the parts that matter.
 */

const MAX_WIDTH = 1600

type Box = { x: number; y: number; w: number; h: number }

function rectOf(el: Element): Box {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, w: r.width, h: r.height }
}

/** Draw an image or video into a box the way `object-fit: cover` would. */
function drawCover(ctx: CanvasRenderingContext2D, media: CanvasImageSource, natural: { w: number; h: number }, box: Box) {
  if (!natural.w || !natural.h || !box.w || !box.h) return
  const scale = Math.max(box.w / natural.w, box.h / natural.h)
  const w = natural.w * scale
  const h = natural.h * scale
  ctx.drawImage(media, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h)
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function svgImage(svg: SVGSVGElement): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    try {
      const copy = svg.cloneNode(true) as SVGSVGElement
      copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const r = svg.getBoundingClientRect()
      copy.setAttribute('width', String(r.width))
      copy.setAttribute('height', String(r.height))
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }))
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(null)
      }
      img.src = url
    } catch {
      resolve(null)
    }
  })
}

function pill(ctx: CanvasRenderingContext2D, text: string, cx: number, top: number, scale: number) {
  ctx.font = `600 ${15 * scale}px Inter, system-ui, sans-serif`
  const w = ctx.measureText(text).width + 26 * scale
  const h = 30 * scale
  ctx.fillStyle = 'rgba(14,12,18,0.72)'
  ctx.beginPath()
  ctx.roundRect(cx - w / 2, top, w, h, h / 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = '#f5f2f7'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, top + h / 2 + 0.5)
}

/** The room, right now, as a canvas the size of the screen (capped). */
export async function captureRoom(): Promise<HTMLCanvasElement> {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const scale = Math.min(MAX_WIDTH / vw, Math.max(1, Math.min(2, window.devicePixelRatio || 1)))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(vw * scale)
  canvas.height = Math.round(vh * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  /* 1. The backdrop: a dusk wash first, so a missing layer is never a hole. */
  const sky = ctx.createLinearGradient(0, 0, 0, vh)
  sky.addColorStop(0, '#2a1e3a')
  sky.addColorStop(1, '#0d0a12')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, vw, vh)
  const backdrop = document.querySelector('[data-hub-backdrop]')
  for (const el of backdrop?.querySelectorAll('*') ?? []) {
    if (el instanceof HTMLVideoElement) {
      if (el.readyState >= 2) drawCover(ctx, el, { w: el.videoWidth, h: el.videoHeight }, rectOf(el))
      continue
    }
    if (el instanceof HTMLImageElement) {
      if (el.complete) drawCover(ctx, el, { w: el.naturalWidth, h: el.naturalHeight }, rectOf(el))
      continue
    }
    /* The parallax planes are backgrounds, drawn where they sit right now — tilt and all. */
    const bg = getComputedStyle(el).backgroundImage.match(/url\(["']?(.+?)["']?\)/)?.[1]
    if (!bg) continue
    const img = await loadImage(bg)
    if (img) drawCover(ctx, img, { w: img.naturalWidth, h: img.naturalHeight }, rectOf(el))
  }

  /* 2. The characters: the 3D canvas, and any flat cutouts. */
  const stage = document.querySelector('[data-hub-stage]')
  stage?.querySelectorAll('canvas').forEach((c) => {
    const box = rectOf(c)
    if (box.w && box.h) ctx.drawImage(c, box.x, box.y, box.w, box.h)
  })
  stage?.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth) ctx.drawImage(img, ...Object.values(rectOf(img)) as [number, number, number, number])
  })

  /* 3. The pet, if the room has one. */
  const pet = document.querySelector('[data-pet-corner] svg') as SVGSVGElement | null
  if (pet) {
    const img = await svgImage(pet)
    if (img) {
      const box = rectOf(pet)
      ctx.drawImage(img, box.x, box.y, box.w, box.h)
    }
  }

  /* 4. Names under everyone, so the picture says who was there. */
  document.querySelectorAll('[data-hub-member]').forEach((el) => {
    const name = el.getAttribute('data-hub-name') || ''
    const plate = el.firstElementChild
    if (!name || !plate) return
    const box = rectOf(plate)
    pill(ctx, name, box.x + box.w / 2, box.y + box.h / 2 - 15, 1)
  })

  return canvas
}
