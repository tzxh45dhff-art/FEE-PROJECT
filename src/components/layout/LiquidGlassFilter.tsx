/**
 * The displacement maps that make glass behave like glass.
 *
 * `backdrop-filter` can blur and tint, but it cannot *bend* — and bending is
 * the entire difference between frosted plastic and a lens. Feeding it a filter
 * built on `feDisplacementMap` is what actually warps the page underneath.
 *
 * The map matters more than the filter. Turbulence gives you random wobble,
 * which reads as a broken screen. What you want is an *edge ramp*: neutral
 * (128,128) through the middle so content stays legible, sloping hard toward
 * the rim so things bend as they pass under the border. That's built here as a
 * tiny inline SVG — two channel gradients with a blurred neutral plate laid
 * over the centre.
 */

const RECT_MAP = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120" preserveAspectRatio="none">
<defs>
<linearGradient id="x" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient>
<linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient>
</defs>
<rect width="600" height="120" fill="#000"/>
<rect width="600" height="120" fill="url(#x)" style="mix-blend-mode:screen"/>
<rect width="600" height="120" fill="url(#y)" style="mix-blend-mode:screen"/>
<rect x="16" y="16" width="568" height="88" rx="44" fill="#808080" style="filter:blur(14px)"/>
</svg>`

const LENS_MAP = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" preserveAspectRatio="none">
<defs>
<linearGradient id="x" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient>
<linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient>
</defs>
<rect width="120" height="120" fill="#000"/>
<rect width="120" height="120" fill="url(#x)" style="mix-blend-mode:screen"/>
<rect width="120" height="120" fill="url(#y)" style="mix-blend-mode:screen"/>
<circle cx="60" cy="60" r="34" fill="#808080" style="filter:blur(11px)"/>
</svg>`

const encode = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

export const LIQUID_BAR_ID = 'liquid-bar'
export const LIQUID_LENS_ID = 'liquid-lens'

export function LiquidGlassFilter() {
  return (
    <svg aria-hidden className="pointer-events-none absolute size-0" focusable="false">
      <defs>
        {/* Navbar: a wide slab, so the ramp runs along its rounded edges. */}
        <filter id={LIQUID_BAR_ID} x="-16%" y="-40%" width="132%" height="180%" colorInterpolationFilters="sRGB">
          <feImage
            href={encode(RECT_MAP)}
            preserveAspectRatio="none"
            x="0"
            y="0"
            width="100%"
            height="100%"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={58}
            xChannelSelector="R"
            yChannelSelector="G"
            result="bent"
          />
          {/* A whisper of blur after the bend hides the sampling stairstep. */}
          <feGaussianBlur in="bent" stdDeviation="0.4" />
        </filter>

        {/* Cursor: the same ramp, but circular — a droplet is a ball lens. */}
        <filter id={LIQUID_LENS_ID} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feImage
            href={encode(LENS_MAP)}
            preserveAspectRatio="none"
            x="0"
            y="0"
            width="100%"
            height="100%"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={42}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
