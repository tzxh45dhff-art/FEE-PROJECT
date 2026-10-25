import type { Role } from './types'

/**
 * Engraved emblems for the role cards and a Bombay skyline for the night —
 * drawn as line art so they print like an old playing card at any size.
 */
export function Emblem({ role, className }: { role: Role; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <circle cx="60" cy="60" r="54" {...common} strokeWidth={1.2} opacity={0.5} />
      <circle cx="60" cy="60" r="49" {...common} strokeWidth={0.8} opacity={0.35} strokeDasharray="2 4" />
      {role === 'mafia' && (
        <g {...common}>
          {/* A fedora, and a rose under its brim. */}
          <path d="M28 62 Q60 48 92 62 Q80 68 60 68 Q40 68 28 62 Z" />
          <path d="M40 60 Q42 38 60 36 Q78 38 80 60" />
          <path d="M41 54 Q60 50 79 54" strokeWidth={4} opacity={0.8} />
          <path d="M60 74 C55 74 52 78 54 82 C56 86 64 86 66 82 C68 78 65 74 60 74 Z" />
          <path d="M60 86 L60 100 M60 92 Q66 90 70 94 M60 95 Q54 93 50 97" />
        </g>
      )}
      {role === 'godfather' && (
        <g {...common}>
          {/* A signet ring with a crown. */}
          <circle cx="60" cy="70" r="20" />
          <circle cx="60" cy="70" r="13" />
          <path d="M46 52 L50 38 L57 46 L60 34 L63 46 L70 38 L74 52 Z" />
          <path d="M50 56 L70 56" />
        </g>
      )}
      {role === 'doctor' && (
        <g {...common}>
          {/* The doctor's bag. */}
          <rect x="32" y="46" width="56" height="40" rx="6" />
          <path d="M48 46 Q48 34 60 34 Q72 34 72 46" />
          <path d="M60 56 L60 76 M50 66 L70 66" strokeWidth={4} />
        </g>
      )}
      {role === 'detective' && (
        <g {...common}>
          {/* A magnifying glass over a fingerprint. */}
          <circle cx="54" cy="54" r="20" />
          <path d="M68 68 L88 88" strokeWidth={5} />
          <path d="M46 56 Q54 42 62 56 M49 60 Q54 50 59 60 M44 52 Q54 34 64 52" strokeWidth={1.4} />
        </g>
      )}
      {role === 'villager' && (
        <g {...common}>
          {/* A lantern. */}
          <path d="M50 36 L70 36 L74 44 L46 44 Z" />
          <rect x="46" y="44" width="28" height="38" rx="3" />
          <path d="M52 82 L68 82 L66 90 L54 90 Z" />
          <path d="M60 28 Q60 22 66 22" />
          <path d="M60 54 C56 60 56 66 60 70 C64 66 64 60 60 54 Z" />
        </g>
      )}
      {role === 'jester' && (
        <g {...common}>
          {/* A theatre mask, grinning. */}
          <path d="M34 42 Q60 30 86 42 Q86 76 60 90 Q34 76 34 42 Z" />
          <path d="M44 54 Q49 49 54 54 M66 54 Q71 49 76 54" />
          <path d="M46 68 Q60 82 74 68" />
        </g>
      )}
    </svg>
  )
}

/** Bombay's roofline at night: the clock tower, the domes, the palms by the sea. */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M0 220 L0 170 L40 170 L40 150 L70 150 L70 165 L110 165 L110 140 L130 140 L130 120 L150 120 L150 140 L170 140 L170 160 L220 160 L220 130 L240 130 L240 112 L246 112 L246 40 L252 26 L258 40 L258 112 L264 112 L264 130 L284 130 L284 155 L330 155 L330 128 Q360 92 390 128 L390 150 L430 150 L430 120 L452 120 L452 100 L470 100 L470 120 L492 120 L492 160 L540 160 L540 138 L600 138 L600 112 Q630 70 660 112 L660 138 L700 138 L700 158 L760 158 L760 126 L800 126 L800 150 L850 150 L850 118 Q872 96 894 118 L894 150 L940 150 L940 168 L990 168 L990 140 L1030 140 L1030 162 L1080 162 L1080 146 L1120 146 L1120 170 L1200 170 L1200 220 Z"
      />
      {/* Palms on the seafront. */}
      <g fill="currentColor">
        <path d="M1140 220 L1144 150 L1148 150 L1152 220 Z" />
        <path d="M1146 152 Q1120 140 1108 152 Q1124 142 1146 150 Q1170 138 1186 150 Q1166 142 1146 152 Z" />
        <path d="M70 220 L73 168 L76 168 L79 220 Z" />
        <path d="M74 170 Q54 160 46 170 Q58 162 74 168 Q92 158 104 168 Q90 162 74 170 Z" />
      </g>
      {/* Lit windows. */}
      <g fill="#e9c77a" opacity="0.55">
        <rect x="248" y="70" width="6" height="8" />
        <rect x="455" y="108" width="4" height="5" />
        <rect x="612" y="124" width="5" height="6" />
        <rect x="868" y="128" width="4" height="5" />
        <rect x="1000" y="150" width="5" height="5" />
      </g>
    </svg>
  )
}
