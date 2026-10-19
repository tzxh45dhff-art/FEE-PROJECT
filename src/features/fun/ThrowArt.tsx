import type { CSSProperties } from 'react'

import type { ThrowDef } from '@/features/fun/catalog'

/**
 * The picture of a thrown thing.
 *
 * Mostly an emoji, which every platform draws well. Two exceptions, drawn
 * here instead: there is no pillow emoji at all (the closest is a bed, which
 * reads as a bed), and the plain white circle that stands in for a snowball
 * looks like a UI dot rather than a handful of snow.
 */
export function ThrowArt({ def, size, style }: { def: ThrowDef; size: number; style?: CSSProperties }) {
  if (def.id === 'pillow') {
    return (
      <svg viewBox="0 0 100 70" width={size * 1.15} height={size * 0.8} style={style} aria-hidden>
        <defs>
          <radialGradient id="pillowShade" cx="45%" cy="35%" r="70%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#e8e4f4" />
            <stop offset="1" stopColor="#c9c2e0" />
          </radialGradient>
        </defs>
        <path
          d="M8 14 C 30 4, 70 4, 92 14 C 98 30, 98 42, 92 56 C 70 66, 30 66, 8 56 C 2 42, 2 30, 8 14 Z"
          fill="url(#pillowShade)"
          stroke="#b7aed6"
          strokeWidth="1.5"
        />
        <path d="M20 22 C 40 30, 60 30, 80 22" stroke="#cfc7e6" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M20 48 C 40 40, 60 40, 80 48" stroke="#cfc7e6" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    )
  }
  if (def.id === 'snowball') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={style} aria-hidden>
        <defs>
          <radialGradient id="snowShade" cx="38%" cy="32%" r="70%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.65" stopColor="#eaf3ff" />
            <stop offset="1" stopColor="#b9cfe8" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="38" fill="url(#snowShade)" />
        <circle cx="36" cy="40" r="4" fill="#fff" opacity="0.9" />
        <circle cx="60" cy="62" r="3" fill="#d6e6f7" />
        <circle cx="48" cy="70" r="2.5" fill="#d6e6f7" />
        <circle cx="66" cy="38" r="2.5" fill="#fff" opacity="0.8" />
      </svg>
    )
  }
  return (
    <span
      aria-hidden
      style={{
        fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
        lineHeight: 1,
        fontSize: size,
        ...style,
      }}
    >
      {def.glyph}
    </span>
  )
}
