import { cn } from '@/lib/utils'

const VIEWERS = ['#ff0000', '#3b46ff', '#00b3a4', '#f0a020']

function Viewers({ className }: { className?: string }) {
  return (
    <div className={cn('flex -space-x-1.5', className)}>
      {VIEWERS.map((color) => (
        <span
          key={color}
          className="size-4 rounded-full ring-2 ring-void"
          style={{ backgroundImage: `linear-gradient(150deg, ${color}, ${color}44)` }}
        />
      ))}
    </div>
  )
}

/* ── Movies Together ─────────────────────────────────────────── */

const POSTER_TINTS = [
  ['#0a1240', '#2b3fa0'],
  ['#33040c', '#8a1424'],
  ['#0a2a1c', '#12603c'],
  ['#2a1206', '#7a3d10'],
  ['#160830', '#40206e'],
]

export function MoviesPanel() {
  return (
    <div className="flex h-full flex-col p-3 sm:p-4">
      <div className="relative flex-1 overflow-hidden rounded-lg bg-[linear-gradient(150deg,#080d33,#2c0510)]">
        <div className="grain absolute inset-0 opacity-[0.1] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(65%_60%_at_50%_45%,color-mix(in_oklab,var(--color-red)_16%,transparent),transparent_72%)]" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
            <span className="size-1 animate-signal-pulse rounded-full bg-signal" />
            <span className="text-[0.55rem] font-medium tracking-wide text-chalk">IN SYNC</span>
          </span>
          <Viewers />
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <div className="grid size-9 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md">
            <svg viewBox="0 0 24 24" className="size-3 translate-x-[6%] fill-white/90">
              <path d="M8 5.2v13.6L19 12z" />
            </svg>
          </div>
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5">
          <div className="relative h-[3px] rounded-full bg-white/15">
            <div className="absolute inset-y-0 left-0 w-[52%] rounded-full bg-signal" />
            <span className="absolute left-[52%] top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_8px_2px_color-mix(in_oklab,var(--color-red)_60%,transparent)]" />
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex gap-1.5 sm:gap-2">
        {POSTER_TINTS.map(([from, to], index) => (
          <div
            key={from}
            className={cn(
              'aspect-[2/3] flex-1 rounded-[3px] transition-opacity',
              index === 1 ? 'ring-1 ring-signal/70' : 'opacity-55',
            )}
            style={{ backgroundImage: `linear-gradient(155deg, ${from}, ${to})` }}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Music ───────────────────────────────────────────────────── */

const BARS = [8, 15, 22, 12, 28, 18, 9, 24, 14, 30, 11, 20, 26, 13, 17, 23, 10, 27, 16, 21]
const QUEUE = [
  { width: '62%', by: '#3b46ff' },
  { width: '48%', by: '#00b3a4' },
  { width: '71%', by: '#f0a020' },
  { width: '55%', by: '#ff0000' },
]

export function MusicPanel() {
  return (
    <div className="flex h-full flex-col p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <div className="size-14 shrink-0 rounded-md bg-[linear-gradient(145deg,#2b0d55,#8a1424)] ring-1 ring-white/10 sm:size-16" />
        <div className="min-w-0 flex-1">
          <div className="h-2 w-2/3 rounded-full bg-white/25" />
          <div className="mt-1.5 h-1.5 w-2/5 rounded-full bg-white/12" />
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="size-1 animate-signal-pulse rounded-full bg-signal" />
            <span className="text-[0.55rem] text-mist">playing for everyone</span>
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="mt-3 flex h-10 items-end gap-[2px] sm:h-12">
        {BARS.map((height, index) => (
          <span
            key={index}
            className={cn('flex-1 rounded-full', index < 9 ? 'bg-signal/80' : 'bg-white/15')}
            style={{ height: `${height * 3}%` }}
          />
        ))}
      </div>

      <p className="mt-3 text-[0.55rem] uppercase tracking-[0.18em] text-dusk">Up next</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {QUEUE.map((track, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="font-mono text-[0.55rem] text-dusk">{index + 1}</span>
            <div className="h-1.5 rounded-full bg-white/12" style={{ width: track.width }} />
            <span
              className="ml-auto size-3 shrink-0 rounded-full"
              style={{ backgroundImage: `linear-gradient(150deg, ${track.by}, ${track.by}44)` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Games ───────────────────────────────────────────────────── */

const BOARD: ('x' | 'o' | null)[] = ['x', 'o', 'x', null, 'o', null, 'x', null, 'o']

export function GamesPanel() {
  return (
    <div className="flex h-full items-center gap-4 p-3 sm:p-4">
      <div className="grid aspect-square h-full max-h-full shrink-0 grid-cols-3 gap-1.5 rounded-lg bg-black/30 p-2 ring-1 ring-white/[0.06]">
        {BOARD.map((cell, index) => (
          <div
            key={index}
            className={cn(
              'grid place-items-center rounded-[4px] bg-white/[0.04]',
              cell === 'x' && 'ring-1 ring-signal/50',
            )}
          >
            {cell === 'x' && (
              <svg viewBox="0 0 24 24" className="size-1/2 stroke-signal stroke-[3]">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            )}
            {cell === 'o' && (
              <svg viewBox="0 0 24 24" className="size-1/2 fill-none stroke-[#3b46ff] stroke-[3]">
                <circle cx="12" cy="12" r="7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[0.55rem] uppercase tracking-[0.18em] text-dusk">Leaderboard</p>
        <div className="mt-2.5 flex flex-col gap-2">
          {VIEWERS.map((color, index) => (
            <div key={color} className="flex items-center gap-2">
              <span className="w-3 font-mono text-[0.55rem] text-dusk">{index + 1}</span>
              <span
                className="size-4 shrink-0 rounded-full"
                style={{ backgroundImage: `linear-gradient(150deg, ${color}, ${color}44)` }}
              />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn('h-full rounded-full', index === 0 ? 'bg-signal' : 'bg-white/25')}
                  style={{ width: `${92 - index * 21}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3.5 flex items-center gap-1.5">
          <span className="size-1 animate-signal-pulse rounded-full bg-signal" />
          <span className="text-[0.55rem] text-mist">your turn</span>
        </div>
      </div>
    </div>
  )
}

/* ── Coding Arena ────────────────────────────────────────────── */

type Token = { w: string; c: string }
const CODE: Token[][] = [
  [
    { w: '14%', c: 'bg-[#ff5a5a]/70' },
    { w: '22%', c: 'bg-white/30' },
    { w: '10%', c: 'bg-[#6b8cff]/70' },
  ],
  [
    { w: '8%', c: 'bg-white/15' },
    { w: '30%', c: 'bg-[#6b8cff]/60' },
    { w: '16%', c: 'bg-white/25' },
  ],
  [
    { w: '12%', c: 'bg-white/15' },
    { w: '18%', c: 'bg-[#ff5a5a]/60' },
    { w: '26%', c: 'bg-white/25' },
  ],
  [{ w: '9%', c: 'bg-white/15' }],
  [
    { w: '20%', c: 'bg-[#6b8cff]/60' },
    { w: '14%', c: 'bg-white/30' },
  ],
  [
    { w: '11%', c: 'bg-white/15' },
    { w: '24%', c: 'bg-white/25' },
    { w: '13%', c: 'bg-[#ff5a5a]/60' },
  ],
  [{ w: '17%', c: 'bg-white/20' }],
]

export function CodingPanel() {
  return (
    <div className="relative flex h-full flex-col p-3 font-mono sm:p-4">
      <div className="flex flex-col gap-2">
        {CODE.map((line, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="w-3 shrink-0 text-right text-[0.5rem] text-dusk/60">{index + 1}</span>
            <div
              className="flex flex-1 items-center gap-1.5"
              style={{ paddingLeft: index > 0 && index < 6 ? '0.75rem' : 0 }}
            >
              {line.map((token, tokenIndex) => (
                <span
                  key={tokenIndex}
                  className={cn('h-1.5 rounded-full', token.c)}
                  style={{ width: token.w }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Two people typing at once */}
      <span className="absolute left-[38%] top-[15%] h-3 w-[1.5px] bg-signal">
        <span className="absolute -top-4 left-0 whitespace-nowrap rounded-[3px] bg-signal px-1 py-[1px] text-[0.5rem] leading-tight text-white">
          Ana
        </span>
      </span>
      <span className="absolute left-[26%] top-[52%] h-3 w-[1.5px] bg-[#3b46ff]">
        <span className="absolute -top-4 left-0 whitespace-nowrap rounded-[3px] bg-[#3b46ff] px-1 py-[1px] text-[0.5rem] leading-tight text-white">
          Ravi
        </span>
      </span>

      <div className="mt-auto flex items-center gap-1.5 border-t border-white/[0.06] pt-2.5">
        <span className="size-1 animate-signal-pulse rounded-full bg-signal" />
        <span className="text-[0.55rem] text-mist">2 editing · saved</span>
      </div>
    </div>
  )
}
