import { useEffect, useRef, type CSSProperties } from 'react'

import { BAND_COUNT } from '@/features/music/useAudioAnalyser'
import { cn } from '@/lib/utils'

/**
 * How far to zoom a cover so a circle shows only the art.
 *
 * YouTube's standard thumbnails are 4:3 with the picture letterboxed inside
 * them — and for a "Topic" upload the picture is itself a square cover
 * pillarboxed into 16:9. Cropped to a circle as-is, that leaves black bars
 * across the top and bottom of the record. Zooming by 4/3 cuts exactly to the
 * square in the middle, which is the album art.
 */
function coverCrop(artwork: string): CSSProperties | undefined {
  if (/ytimg\.com\/vi\/[^/]+\/(hq|mq|sd)?default\.jpg/.test(artwork)) {
    return { transform: 'scale(1.34)' }
  }
  return undefined
}

/**
 * The record, and the sound coming off it.
 *
 * One canvas for the bars and a DOM element for the disc, rather than drawing
 * everything into the canvas. The artwork is an image with a border radius and
 * a shadow — things the browser already composites on the GPU — and painting
 * it per frame would cost far more than letting CSS hold it still while only
 * the reactive part redraws.
 *
 * The disc is the album cover itself, cut round. The rotation is CSS too,
 * driven by an animation that is paused rather than
 * removed. A record that stops when the music stops and picks up from the same
 * groove is the entire charm of the thing; restarting at zero every time would
 * read as a glitch.
 */
export function Vinyl({
  artwork,
  playing,
  read,
  accent,
  className,
}: {
  artwork: string | null
  playing: boolean
  /** Frequency levels for this frame, 0–1 per band. */
  read: (time: number) => Float32Array
  /** Colour the bars take, sampled from the cover when there is one. */
  accent: string
  className?: string
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const readRef = useRef(read)
  readRef.current = read

  /*
   * Canvas cannot read CSS custom properties.
   *
   * Assigning `var(--color-signal)` to `strokeStyle` is not an error — the
   * value is simply rejected and the context keeps whatever it had, which is
   * black. On a black page that means bars that are drawn perfectly and are
   * completely invisible, so the variable is resolved here first.
   */
  const accentRef = useRef(accent)
  accentRef.current = accent.startsWith('var(')
    ? getComputedStyle(document.documentElement)
        .getPropertyValue(accent.slice(4, -1).trim())
        .trim() || '#ffffff'
    : accent

  useEffect(() => {
    const element = canvas.current
    if (!element) return

    const context = element.getContext('2d')
    if (!context) return

    let frame = 0
    let width = 0
    let height = 0

    /*
     * Measured every frame rather than cached against a ResizeObserver.
     *
     * The page arrives mid-animation — the whole stage is growing out of a
     * button — so the first measurement is of an element that is still the
     * wrong size, and a cached one taken then is wrong for as long as it
     * lives. Reading the rect each frame is a single layout query against one
     * element, which is far cheaper than being wrong.
     *
     * Backing store matched to the device, capped at 2: past that the
     * sharpness is invisible and the fill rate is not.
     */
    const measure = () => {
      const rect = element.getBoundingClientRect()
      if (rect.width === width && rect.height === height) return

      width = rect.width
      height = rect.height
      const ratio = Math.min(2, window.devicePixelRatio || 1)
      element.width = Math.max(1, Math.round(width * ratio))
      element.height = Math.max(1, Math.round(height * ratio))
      /* Resizing the backing store resets the context, so the scale has to be
         reapplied here rather than once at setup. */
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw)

      measure()
      if (width === 0 || height === 0) return
      context.clearRect(0, 0, width, height)

      const levels = readRef.current(time)
      const centreX = width / 2
      const centreY = height / 2
      /* The ring starts outside the disc — the disc is 72% of the box, so the
         bars begin just past its edge and grow outward into the margin. */
      const inner = Math.min(width, height) * 0.38
      const reach = Math.min(width, height) * 0.11

      context.save()
      context.translate(centreX, centreY)
      context.strokeStyle = accentRef.current
      context.lineCap = 'round'
      context.lineWidth = Math.max(1.5, (Math.min(width, height) / BAND_COUNT) * 0.5)

      for (let band = 0; band < BAND_COUNT; band += 1) {
        const level = levels[band] ?? 0
        /* Mirrored around the vertical axis so the ring is symmetrical —
           reading the same spectrum up both sides looks composed, where
           wrapping it once around the circle looks like a scatter. */
        const half = BAND_COUNT / 2
        const index = band < half ? band : BAND_COUNT - 1 - band
        const angle = (index / half) * Math.PI - Math.PI / 2
        const mirrored = band < half ? angle : -angle + Math.PI

        const length = reach * Math.max(0.04, level)
        const cos = Math.cos(mirrored)
        const sin = Math.sin(mirrored)

        context.globalAlpha = 0.35 + level * 0.65
        context.beginPath()
        context.moveTo(cos * inner, sin * inner)
        context.lineTo(cos * (inner + length), sin * (inner + length))
        context.stroke()
      }

      context.restore()
    }

    frame = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={cn('relative aspect-square w-full', className)}>
      <canvas ref={canvas} className="absolute inset-0 size-full" />

      {/* The shadow stays still under the record rather than spinning with
          it — a large soft shadow on a rotating layer is redrawn every frame,
          which on a phone was enough to leave half the disc unpainted. */}
      <div aria-hidden className="absolute inset-[14%] rounded-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]" />

      <div
        className="absolute inset-[14%] overflow-hidden rounded-full bg-[#0b0b0d] will-change-transform"
        style={{
          animation: 'music-spin 14s linear infinite',
          animationPlayState: playing ? 'running' : 'paused',
        }}
      >
        {/* The whole face is the cover — the record *is* the album. */}
        {artwork ? (
          <img
            src={artwork}
            alt=""
            draggable={false}
            className="size-full select-none object-cover"
            style={coverCrop(artwork)}
          />
        ) : (
          /* No cover: the face stays, in the app's own colours, rather than
             leaving a black hole where the album should be. */
          <span className="block size-full bg-gradient-to-br from-signal/80 via-signal-deep to-void" />
        )}

      </div>

      {/* The sheen stays put while the record turns under it — a highlight
          that rotated with the disc would read as a mark on the art, not light
          on a surface. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[14%] rounded-full bg-[linear-gradient(125deg,rgba(255,255,255,0.16)_0%,transparent_30%,transparent_62%,rgba(255,255,255,0.07)_78%,transparent_92%)] ring-1 ring-inset ring-white/15"
      />

    </div>
  )
}
