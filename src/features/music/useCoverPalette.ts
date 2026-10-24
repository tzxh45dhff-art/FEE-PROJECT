import { useEffect, useState } from 'react'

/**
 * The colours of the current cover, for the page to dress itself in.
 *
 * Sampled from the artwork rather than stored with the track, because the
 * artwork is the only thing that reliably exists — a YouTube thumbnail, an
 * uploaded file's embedded art, a URL someone pasted. Anything the server
 * could have precomputed would be missing for exactly the sources people
 * actually use.
 *
 * Returns null until a cover has been read, and null forever for a track that
 * has none. The page falls back to its own palette in that case rather than
 * inventing a colour, which is the difference between "this album is red" and
 * "the app is randomly red today".
 */

export type CoverPalette = {
  /** The cover's dominant colour, already lifted to something legible on black. */
  base: string
  /** A second colour for the gradient to travel to — the cover's own, when it has one. */
  accent: string
  /** A third, for the smallest bloom. */
  glow: string
  /** The dominant colour at full brightness, for things drawn *on* the page. */
  vivid: string
  /**
   * The cover itself, shrunk, blurred and saturated, as a data URL — the
   * page's background is this, so it is the album's own colours in the
   * album's own places rather than a guess at them.
   */
  wash: string | null
  /** True when the artwork is dark enough that text needs its own ground. */
  dark: boolean
}

/**
 * A tiny, soft copy of the cover to stretch across the page.
 *
 * Blurred here, once, into a 64px image — not with a CSS blur on a
 * full-screen layer, which is the single most expensive thing to ask a phone
 * to draw and once left half the player unpainted on a foldable. Stretched to
 * fill the screen, a 64px image that is already soft just looks like light.
 * Where the canvas has no `filter` (older Safari) the image is drawn smaller
 * still, and the browser's own upscale does the softening.
 */
function makeWash(image: HTMLImageElement, sx: number, sy: number, side: number): string | null {
  const probe = document.createElement('canvas').getContext('2d')
  const canFilter = probe !== null && 'filter' in probe
  const size = canFilter ? 64 : 20

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null

  if (canFilter) context.filter = 'blur(5px) saturate(1.7) brightness(1.08)'
  /* Drawn past the edges so the blur has colour to pull in, rather than
     fading to transparent around the border. */
  const bleed = canFilter ? size * 0.2 : 0
  context.drawImage(image, sx, sy, side, side, -bleed, -bleed, size + bleed * 2, size + bleed * 2)

  try {
    return canvas.toDataURL('image/jpeg', 0.9)
  } catch {
    return null
  }
}

/** Bucketed to 32 levels per channel — exact colours cluster into one anyway. */
const BUCKET = 32

function toHsl(r: number, g: number, b: number) {
  const rd = r / 255
  const gd = g / 255
  const bd = b / 255
  const max = Math.max(rd, gd, bd)
  const min = Math.min(rd, gd, bd)
  const lightness = (max + min) / 2

  if (max === min) return { h: 0, s: 0, l: lightness }

  const delta = max - min
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  let hue: number
  if (max === rd) hue = ((gd - bd) / delta + (gd < bd ? 6 : 0)) / 6
  else if (max === gd) hue = ((bd - rd) / delta + 2) / 6
  else hue = ((rd - gd) / delta + 4) / 6

  return { h: hue * 360, s: saturation, l: lightness }
}

export function useCoverPalette(artwork: string | null | undefined): CoverPalette | null {
  const [palette, setPalette] = useState<CoverPalette | null>(null)

  useEffect(() => {
    if (!artwork) {
      setPalette(null)
      return
    }

    let cancelled = false
    const image = new Image()
    /*
     * Required, and the reason this can fail quietly. Reading pixels out of a
     * canvas that has drawn a cross-origin image without CORS permission
     * throws a security error — so covers from a host that doesn't allow it
     * simply produce no palette, and the page keeps its own colours.
     */
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      if (cancelled) return

      try {
        /* Tiny on purpose. The browser's own downscale is a cheap, decent
           average, and 32×32 is more than enough to find a dominant hue. */
        const size = 32
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size

        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) return

        /* The middle square only: YouTube thumbnails letterbox their picture,
           and the bars are not part of anybody's album. */
        const side = Math.min(image.naturalWidth, image.naturalHeight) * 0.74
        const sx = (image.naturalWidth - side) / 2
        const sy = (image.naturalHeight - side) / 2
        context.drawImage(image, sx, sy, side, side, 0, 0, size, size)
        const wash = makeWash(image, sx, sy, side)
        const { data } = context.getImageData(0, 0, size, size)

        const counts = new Map<string, { count: number; r: number; g: number; b: number }>()

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]!
          const g = data[i + 1]!
          const b = data[i + 2]!
          const alpha = data[i + 3]!
          if (alpha < 128) continue

          const { s, l } = toHsl(r, g, b)
          /* Skip the near-black and near-white that dominate most covers —
             letterboxing, borders, and blown-out sky are the majority of the
             pixels and none of them are what anyone would call the colour. */
          if (l < 0.12 || l > 0.93 || s < 0.12) continue

          const key = `${Math.round(r / BUCKET)}-${Math.round(g / BUCKET)}-${Math.round(b / BUCKET)}`
          const existing = counts.get(key)
          if (existing) {
            existing.count += 1
            existing.r += r
            existing.g += g
            existing.b += b
          } else {
            counts.set(key, { count: 1, r, g, b })
          }
        }

        /*
         * Weighted by how colourful a cluster is as well as how big. Ranking
         * on size alone picks the large dull region of a cover — the grey
         * wall behind the singer — over the red jacket that everyone would
         * actually call the colour of the album.
         */
        const clusters = [...counts.values()].map((cluster) => {
          const colour = toHsl(cluster.r / cluster.count, cluster.g / cluster.count, cluster.b / cluster.count)
          return { ...colour, weight: cluster.count * (0.35 + colour.s) }
        })
        clusters.sort((a, b) => b.weight - a.weight)

        if (clusters.length === 0) {
          /* A black-and-white cover: no colour to name, but its own picture
             is still the right background. */
          setPalette({
            base: 'hsl(0 0% 30%)',
            accent: 'hsl(0 0% 22%)',
            glow: 'hsl(0 0% 26%)',
            vivid: 'hsl(0 0% 82%)',
            dark: true,
            wash,
          })
          return
        }

        /* Up to three genuinely different colours from the cover itself. */
        const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b))
        const picked = [clusters[0]!]
        for (const cluster of clusters) {
          if (picked.length === 3) break
          if (picked.every((one) => hueGap(one.h, cluster.h) > 28)) picked.push(cluster)
        }

        const dominant = picked[0]!
        /*
         * Lifted into a band that glows on a dark page without washing it
         * out: saturation floored so a muted cover still has a colour, and
         * lightness held in the middle so white text stays readable over it.
         */
        const tone = (colour: { h: number; s: number }, lightness: number) => {
          const saturation = Math.min(0.92, Math.max(0.55, colour.s * 1.25))
          return `hsl(${colour.h.toFixed(0)} ${(saturation * 100).toFixed(0)}% ${lightness}%)`
        }
        /* A one-colour cover: neighbours of its own hue rather than nothing. */
        const second = picked[1] ?? { h: (dominant.h + 34) % 360, s: dominant.s }
        const third = picked[2] ?? { h: (dominant.h + 330) % 360, s: dominant.s }

        setPalette({
          base: tone(dominant, 40),
          accent: tone(second, 34),
          glow: tone(third, 38),
          vivid: tone(dominant, 64),
          dark: dominant.l < 0.45,
          wash,
        })
      } catch {
        /* A tainted canvas — see the note on `crossOrigin` above. */
        setPalette(null)
      }
    }

    image.onerror = () => {
      if (!cancelled) setPalette(null)
    }

    image.src = artwork

    return () => {
      cancelled = true
    }
  }, [artwork])

  return palette
}
