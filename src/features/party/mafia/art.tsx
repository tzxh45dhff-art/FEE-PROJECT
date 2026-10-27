import type { ArcId } from './arcs'
import type { Role } from './types'

/**
 * Engraved emblems for the role cards and each story's skyline for the night —
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

/** Lit windows, in the story's own light. */
function Windows({ rects }: { rects: [number, number, number, number][] }) {
  return (
    <g style={{ fill: 'var(--noir-window)' }} opacity="0.6">
      {rects.map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />
      ))}
    </g>
  )
}

/** A pine: two tiers and a trunk. */
const pine = (x: number, base: number, h: number) =>
  `M${x} ${base - h} L${x + h * 0.32} ${base - h * 0.45} L${x + h * 0.14} ${base - h * 0.45} L${x + h * 0.4} ${base - 6} L${x - h * 0.4} ${base - 6} L${x - h * 0.14} ${base - h * 0.45} L${x - h * 0.32} ${base - h * 0.45} Z M${x - 3} ${base - 6} L${x + 3} ${base - 6} L${x + 3} ${base} L${x - 3} ${base} Z`

/** A palm: a leaning trunk and a crown of fronds. */
const palm = (x: number, h: number) =>
  `M${x - 3} 220 L${x + 1} ${220 - h} L${x + 5} ${220 - h} L${x + 3} 220 Z M${x + 3} ${222 - h} Q${x - 22} ${208 - h} ${x - 34} ${222 - h} Q${x - 18} ${212 - h} ${x + 3} ${220 - h} Q${x + 26} ${206 - h} ${x + 40} ${220 - h} Q${x + 22} ${212 - h} ${x + 3} ${222 - h} Z`

/**
 * Each story's roofline at night: Bombay's clock tower and domes, the hotel
 * among the pines, the carnival church and the big wheel, the towers of the
 * neon city, the golden fort above the dunes.
 */
export function Skyline({ arc = 'bombay', className }: { arc?: ArcId; className?: string }) {
  return (
    <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      {arc === 'shimla' && (
        <>
          <path fill="currentColor" opacity="0.45" d="M0 220 L0 120 L120 60 L210 110 L330 40 L450 105 L560 70 L680 120 L800 50 L930 110 L1040 75 L1200 130 L1200 220 Z" />
          <path fill="currentColor" d="M430 220 L430 140 L470 110 L510 140 L510 125 L560 90 L610 125 L610 105 L650 70 L690 105 L690 125 L730 110 L770 140 L770 220 Z M478 96 L490 96 L490 122 L478 122 Z M640 52 L652 52 L652 82 L640 82 Z" />
          <path fill="currentColor" d={[60, 120, 175, 250, 320, 380, 820, 880, 950, 1020, 1090, 1160].map((x, i) => pine(x, 220, 70 + ((i * 37) % 50))).join(' ')} />
          <Windows rects={[[452, 150, 8, 10], [492, 150, 8, 10], [540, 120, 8, 10], [575, 120, 8, 10], [540, 160, 8, 10], [630, 150, 8, 10], [660, 110, 8, 10], [700, 150, 8, 10], [740, 160, 8, 10], [600, 175, 10, 14]]} />
        </>
      )}
      {arc === 'goa' && (
        <>
          <path fill="currentColor" d="M0 220 L0 170 L40 150 L80 170 L80 160 L130 140 L180 160 L180 175 L240 155 L300 175 L300 220 Z M880 220 L880 172 L930 150 L980 172 L980 220 Z M1100 220 L1100 170 L1150 148 L1200 170 L1200 220 Z" />
          <path fill="currentColor" d="M500 220 L500 130 L520 130 L520 75 Q540 52 560 75 L560 110 L600 80 L640 110 L640 75 Q660 52 680 75 L680 130 L700 130 L700 220 Z M597 48 L603 48 L603 80 L597 80 Z M588 56 L612 56 L612 62 L588 62 Z" />
          <g fill="none" stroke="currentColor" strokeWidth="4">
            <circle cx="1040" cy="110" r="62" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2
              return <line key={i} x1="1040" y1="110" x2={1040 + Math.cos(a) * 62} y2={110 + Math.sin(a) * 62} strokeWidth="2" />
            })}
            <path d="M1040 110 L1005 220 M1040 110 L1075 220" strokeWidth="6" />
          </g>
          <path fill="currentColor" d={[palm(340, 90), palm(420, 70), palm(780, 85), palm(850, 64)].join(' ')} />
          <path style={{ fill: 'var(--noir-brass)' }} opacity="0.55" d="M300 120 Q400 140 500 118 L500 121 Q400 143 300 123 Z M320 124 L330 138 L340 126 Z M360 131 L370 145 L380 132 Z M400 134 L410 148 L420 134 Z M440 131 L450 145 L460 129 Z M475 124 L485 137 L494 121 Z" />
          <Windows rects={[[586, 150, 28, 40], [530, 95, 10, 14], [660, 95, 10, 14], [50, 180, 8, 10], [140, 165, 8, 10], [920, 180, 8, 10], [1140, 178, 8, 10]]} />
        </>
      )}
      {arc === 'neo' && (
        <>
          <path fill="currentColor" d="M0 220 L0 120 L50 120 L50 60 L90 60 L90 140 L140 140 L140 30 L150 10 L160 30 L200 30 L200 150 L260 150 L260 80 L320 80 L320 160 L380 160 L380 40 L400 40 L400 0 L404 0 L404 40 L440 40 L440 130 L500 130 L500 90 L560 90 L560 170 L620 170 L620 50 L700 50 L700 140 L760 140 L760 20 L790 20 L790 140 L840 140 L840 100 L900 100 L900 60 L960 60 L960 150 L1020 150 L1020 70 L1060 70 L1060 30 L1066 30 L1066 70 L1100 70 L1100 160 L1150 160 L1150 110 L1200 110 L1200 220 Z M0 176 L1200 176 L1200 184 L0 184 Z" />
          <path fill="currentColor" d="M300 160 L470 160 Q480 160 480 168 L480 176 L300 176 Z" />
          <rect x="636" y="66" width="48" height="26" style={{ fill: 'var(--noir-blood-bright)' }} opacity="0.55" />
          <Windows rects={[[60, 75, 6, 4], [72, 95, 6, 4], [150, 50, 6, 4], [170, 80, 6, 4], [150, 110, 6, 4], [275, 100, 6, 4], [295, 125, 6, 4], [390, 60, 6, 4], [415, 90, 6, 4], [515, 110, 6, 4], [640, 110, 6, 4], [665, 120, 6, 4], [770, 40, 6, 4], [772, 70, 6, 4], [772, 100, 6, 4], [915, 80, 6, 4], [935, 120, 6, 4], [1035, 95, 6, 4], [1080, 120, 6, 4], [310, 165, 14, 5], [334, 165, 14, 5], [358, 165, 14, 5], [382, 165, 14, 5], [406, 165, 14, 5], [430, 165, 14, 5]]} />
        </>
      )}
      {arc === 'jaisalmer' && (
        <>
          <path fill="currentColor" opacity="0.55" d="M0 220 Q300 150 600 165 Q900 150 1200 195 L1200 220 Z" />
          <path fill="currentColor" d="M230 175 L230 120 Q245 104 260 120 L330 120 Q345 104 360 120 L420 120 L420 95 L440 95 L440 80 Q460 58 480 80 L480 95 L520 95 L520 70 L540 70 L540 55 Q560 32 580 55 L580 70 L620 70 L620 100 L680 100 Q695 84 710 100 L760 100 L760 85 Q780 63 800 85 L800 120 L870 120 Q885 104 900 120 L970 120 L970 175 Q600 160 230 175 Z M556 30 L564 30 L564 40 L556 40 Z" />
          <path fill="currentColor" d="M1040 205 Q1046 186 1060 186 Q1070 176 1078 186 Q1092 186 1096 196 L1104 182 Q1108 172 1116 174 L1118 180 L1110 184 L1104 202 L1100 220 L1095 220 L1094 206 L1062 206 L1060 220 L1055 220 L1054 206 L1046 220 L1041 220 Z" />
          <path fill="currentColor" d="M120 220 Q110 170 126 140 Q132 168 128 220 Z M106 152 Q126 132 150 150 Q128 144 106 152 Z" />
          <Windows rects={[[455, 100, 8, 12], [553, 78, 8, 12], [640, 112, 8, 12], [690, 112, 8, 12], [775, 104, 8, 12], [300, 135, 8, 12], [380, 135, 8, 12], [880, 135, 8, 12]]} />
        </>
      )}
      {arc === 'bombay' && (
        <>
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
          <Windows rects={[[248, 70, 6, 8], [455, 108, 4, 5], [612, 124, 5, 6], [868, 128, 4, 5], [1000, 150, 5, 5]]} />
        </>
      )}
    </svg>
  )
}
