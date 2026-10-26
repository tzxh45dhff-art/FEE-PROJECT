import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { PICKER_ART } from './pickerArt'
import './gamePicker.css'

/**
 * "What are we playing?" — the Play screen.
 *
 * A mosaic of games, each with its own little animated scene that wakes on
 * hover; a filter for how many are in the room that greys out what won't
 * work; "Surprise me" to shuffle through and land on one; and a bar at the
 * bottom to start the chosen game. A game that's already running is pinned
 * at the top so anyone walking in can jump straight in.
 */

export type GameId = 'mafia' | 'truthdare' | 'draw' | 'knowme' | 'trivia' | 'songquiz' | 'penfight' | 'geo'

type Entry = {
  id: GameId
  title: string
  line: string
  lo: number
  hi: number
  label: string
  accent: string
  rgb: string
  bg: string
  cls: string
}

const GAMES: Entry[] = [
  { id: 'mafia', title: 'Mafia', line: 'Bombay, 1956. Someone here works for the Family. Find them before morning.', lo: 1, hi: 12, label: '1–12 players', accent: '#FF4D5E', rgb: '255,77,94', bg: 'linear-gradient(165deg,#5e1022 0%,#2c0a14 52%,#12050b 100%)', cls: 'gp-c7 gp-r2 big' },
  { id: 'geo', title: 'Somewhere', line: 'A street, a sign, a feeling. Find your place in the world.', lo: 1, hi: 12, label: '1–12 players', accent: '#6FE3D0', rgb: '111,227,208', bg: 'linear-gradient(150deg,#45301f 0%,#2a1a15 55%,#170e12 100%)', cls: 'gp-c5' },
  { id: 'truthdare', title: 'Truth or dare', line: 'The game picks the questions. You pick how spicy.', lo: 2, hi: 99, label: '2+ players', accent: '#FF6F91', rgb: '255,111,145', bg: 'linear-gradient(155deg,#661a3f 0%,#34102a 55%,#190a1d 100%)', cls: 'gp-c5' },
  { id: 'draw', title: 'Draw and guess', line: 'One draws, everyone races to guess.', lo: 2, hi: 99, label: '2+ players', accent: '#FFC247', rgb: '255,194,71', bg: 'linear-gradient(150deg,#80500f 0%,#45260a 55%,#1f1107 100%)', cls: 'gp-c4' },
  { id: 'knowme', title: 'How well do you know me?', line: 'Answer about yourself. They guess. Truth comes out.', lo: 2, hi: 99, label: '2+ players', accent: '#D88BFF', rgb: '216,139,255', bg: 'linear-gradient(155deg,#521c78 0%,#2a1050 55%,#150a2e 100%)', cls: 'gp-c4' },
  { id: 'trivia', title: 'Live trivia', line: 'Bollywood, cricket, films, everything. Fastest wins.', lo: 1, hi: 99, label: '1+ players', accent: '#5CC8FF', rgb: '92,200,255', bg: 'linear-gradient(155deg,#14437f 0%,#0c2757 55%,#07142f 100%)', cls: 'gp-c4' },
  { id: 'songquiz', title: 'Guess the song', line: 'A few seconds of a track. Name it first.', lo: 1, hi: 99, label: '1+ players', accent: '#4FE3A3', rgb: '79,227,163', bg: 'linear-gradient(150deg,#0f5240 0%,#0a2e27 55%,#06161a 100%)', cls: 'gp-c7 wide' },
  { id: 'penfight', title: 'Pen fight', line: 'Flick your pen, knock theirs off the desk.', lo: 2, hi: 2, label: '2 players', accent: '#9B8CFF', rgb: '155,140,255', bg: 'linear-gradient(155deg,#41309a 0%,#221a5a 55%,#100b2e 100%)', cls: 'gp-c5' },
]

const RANGES: Record<string, [number, number]> = { any: [0, 99], '1': [1, 1], '2': [2, 2], '3-5': [3, 5], '6+': [6, 99] }
const CHIPS: [string, string][] = [
  ['any', 'Any'],
  ['1', 'Just me'],
  ['2', '2'],
  ['3-5', '3–5'],
  ['6+', '6+'],
]
const fits = (g: Entry, [lo, hi]: [number, number]) => g.lo <= hi && g.hi >= lo
const AVATAR_COLORS = ['#ff9fd0', '#9b7bff', '#6fe3d0', '#ffc247', '#5cc8ff', '#ff7a6b']

/* The design's display and body faces, loaded once when Play first opens. */
function usePickerFonts() {
  useEffect(() => {
    if (document.getElementById('gp-fonts')) return
    const link = document.createElement('link')
    link.id = 'gp-fonts'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])
}

export function GamePicker({
  live,
  liveLabel,
  liveBy,
  members,
  onPick,
}: {
  live: string | null
  liveLabel: string | null
  liveBy: string | null
  members: { id: string; name: string; you?: boolean }[]
  onPick: (id: GameId) => void
}) {
  usePickerFonts()
  const [filter, setFilter] = useState('any')
  const [hover, setHover] = useState<GameId | null>(null)
  const [selected, setSelected] = useState<GameId | null>(null)
  const [shuffling, setShuffling] = useState<GameId | null>(null)
  const [burst, setBurst] = useState(0)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const range = RANGES[filter] ?? RANGES.any!
  const people = members.length
  const chosen = GAMES.find((g) => g.id === selected) ?? null
  const glow = hover ?? shuffling ?? selected

  const choose = (g: Entry) => {
    if (!fits(g, range) || shuffling) return
    setSelected((s) => (s === g.id ? null : g.id))
  }

  const pickFilter = (id: string) => {
    setFilter(id)
    const next = RANGES[id] ?? RANGES.any!
    if (chosen && !fits(chosen, next)) setSelected(null)
  }

  /* Flick through the games that fit, slowing down, and land on one. */
  const surprise = () => {
    if (shuffling) return
    const pool = GAMES.filter((g) => fits(g, range)).map((g) => g.id)
    if (!pool.length) return
    const steps: GameId[] = []
    let previous: GameId | null = null
    for (let i = 0; i < 15; i++) {
      let next = pool[Math.floor(Math.random() * pool.length)]!
      for (let guard = 0; next === previous && pool.length > 1 && guard < 8; guard++) next = pool[Math.floor(Math.random() * pool.length)]!
      steps.push(next)
      previous = next
    }
    setSelected(null)
    setHover(null)
    let at = 0
    steps.forEach((id, k) => {
      later(() => setShuffling(id), at)
      at += 70 + k * k * 2.6
    })
    later(() => {
      setShuffling(null)
      setSelected(steps.at(-1)!)
    }, at)
  }

  const start = () => {
    if (!chosen || burst) return
    setBurst(1)
    later(() => setBurst(2), 420)
    later(() => {
      setBurst(0)
      onPick(chosen.id)
    }, 650)
  }

  /* The 3D tilt and spotlight follow the pointer through CSS variables — no re-render per move. */
  const tilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - box.left) / (box.width || 1)
    const py = (e.clientY - box.top) / (box.height || 1)
    const el = e.currentTarget.style
    el.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`)
    el.setProperty('--rx', `${(-(py - 0.5) * 9).toFixed(2)}deg`)
    el.setProperty('--mx', `${Math.round(e.clientX - box.left)}px`)
    el.setProperty('--my', `${Math.round(e.clientY - box.top)}px`)
  }

  const parts = useMemo(() => {
    const palette = [chosen?.accent ?? '#fff', '#fff4ee', '#ffe066', '#ff6f91']
    return Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2
      const dist = 70 + (i % 3) * 26
      return { bg: palette[i % palette.length]!, dx: Math.round(Math.cos(a) * dist), dy: Math.round(Math.sin(a) * dist - 34), rot: i * 47 }
    })
  }, [chosen])

  const liveGame = GAMES.find((g) => g.id === live)

  return (
    <div className="gp">
      <div className="gp-atmos" aria-hidden>
        <span className="gp-blob gp-b1" />
        <span className="gp-blob gp-b2" />
        <span className="gp-blob gp-b3" />
        {GAMES.map((g) => (
          <span key={g.id} className={cn('gp-amb', glow === g.id && 'on')} style={{ ['--rgb' as string]: g.rgb }} />
        ))}
      </div>

      <main className="gp-main">
        <header className="gp-header">
          <div className="gp-head">
            <span className="gp-eyebrow">
              <span className="gp-live" />
              Play
            </span>
            <h1 className="gp-h1">
              <span className="gp-w gp-w1">What</span> <span className="gp-w gp-w2">are</span> <span className="gp-w gp-w3">we</span>{' '}
              <span className="gp-w gp-w4 gp-em">
                playing<span className="gp-q">?</span>
                <svg className="gp-squig" viewBox="0 0 364 18" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 10 Q 22 0 42 10 T 82 10 T 122 10 T 162 10 T 202 10 T 242 10 T 282 10 T 322 10 T 362 10" fill="none" stroke="#ff6f61" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </span>
            </h1>
            <p className="gp-sub">{people <= 1 ? 'Most of these need someone else in the room. Pick one to play alone, or wait for friends.' : `${people} of you in the room. Pick something everyone can play.`}</p>
          </div>

          <div className="gp-ticket">
            <span className="gp-tk-label">In the room</span>
            <span className="gp-tk-row">
              {members.slice(0, 6).map((m, i) => (
                <span key={m.id} className="gp-av" title={m.you ? `${m.name} (you)` : m.name} style={{ background: m.you ? 'linear-gradient(145deg,#ff9fd0,#9b7bff)' : AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {m.name.trim()[0]?.toUpperCase() ?? '?'}
                </span>
              ))}
              {members.length > 6 && <span className="gp-av empty">+{members.length - 6}</span>}
              {people <= 1 && (
                <>
                  <span className="gp-av empty" aria-hidden>
                    +
                  </span>
                  <span className="gp-tk-wait">
                    Waiting for friends
                    <i className="gp-d" />
                    <i className="gp-d gp-d2" />
                    <i className="gp-d gp-d3" />
                  </span>
                </>
              )}
              {people > 1 && <span className="gp-tk-wait">{members.map((m) => (m.you ? 'you' : m.name.split(' ')[0])).slice(0, 3).join(', ')}{people > 3 ? ` and ${people - 3} more` : ''}</span>}
            </span>
          </div>
        </header>

        <section className="gp-controls">
          <div className="gp-chips" role="group" aria-label="How many are in the room">
            <span className="gp-ctl-label">How many in the room?</span>
            {CHIPS.map(([id, label]) => (
              <button key={id} type="button" className={cn('gp-chip', filter === id && 'on')} aria-pressed={filter === id} onClick={() => pickFilter(id)}>
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="gp-surprise" onClick={surprise}>
            <svg className="gp-dice" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" />
              <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" />
              <circle cx="12" cy="12" r="1.1" fill="currentColor" />
              <circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" />
            </svg>
            <span>Surprise me</span>
          </button>
        </section>

        {liveGame && liveLabel && (
          <button type="button" className="gp-livebar" onClick={() => onPick(liveGame.id)} style={{ ['--accent' as string]: liveGame.accent }}>
            <span className="gp-live" />
            <strong>{liveLabel} is on</strong>
            <span>{liveBy ? `${liveBy} started it` : 'Started in this room'}</span>
            <em>Jump in →</em>
          </button>
        )}

        <div className="gp-grid">
          {GAMES.map((g) => {
            const ok = fits(g, range)
            const reason = ok ? g.label : range[1] < g.lo ? (range[1] === 1 ? 'Needs a friend' : `Needs ${g.lo}+ players`) : `Max ${g.hi} players`
            return (
              <button
                key={g.id}
                type="button"
                className={cn('gp-card', g.cls, hover === g.id && ok && 'hot', shuffling === g.id && 'shuf', selected === g.id && 'sel', !ok && 'dim')}
                aria-pressed={selected === g.id}
                aria-disabled={!ok}
                onClick={() => choose(g)}
                onDoubleClick={() => ok && onPick(g.id)}
                onPointerEnter={() => ok && setHover(g.id)}
                onPointerMove={ok ? tilt : undefined}
                onPointerLeave={() => setHover((h) => (h === g.id ? null : h))}
                onFocus={() => ok && setHover(g.id)}
                onBlur={() => setHover((h) => (h === g.id ? null : h))}
                style={{ background: g.bg, ['--rgb' as string]: g.rgb, ['--accent' as string]: g.accent }}
              >
                <span className="gp-spot" />
                <span className="gp-art" aria-hidden dangerouslySetInnerHTML={{ __html: PICKER_ART[g.id] ?? '' }} />
                <span className="gp-top">
                  <span className="gp-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>{reason}</span>
                  </span>
                  {live === g.id && <span className="gp-pill live">Live now</span>}
                </span>
                <span className="gp-bot">
                  <span className="gp-ttl">{g.title}</span>
                  <span className="gp-dsc">{g.line}</span>
                </span>
                <span className="gp-go">
                  {selected === g.id ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {chosen && (
          <div className="gp-dock" role="region" aria-label="Selected game" style={{ ['--accent' as string]: chosen.accent }}>
            <span className="gp-dock-dot" />
            <span className="gp-dock-text">
              <span className="gp-dock-title">{chosen.title}</span>
              <span className="gp-dock-hint">
                {chosen.label}. {chosen.lo >= 2 ? (people >= chosen.lo ? 'Everyone here can join in.' : 'Get a friend in the room first.') : 'Solo works, friends are better.'}
              </span>
            </span>
            <button type="button" className="gp-ghost" onClick={() => setSelected(null)}>
              Not this one
            </button>
            <span className="gp-startwrap">
              {parts.map((p, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="gp-part"
                  style={{ background: p.bg, transform: burst ? `translate(${p.dx}px,${p.dy}px) rotate(${p.rot}deg)` : 'none', opacity: burst === 1 ? 1 : 0 }}
                />
              ))}
              <button type="button" className="gp-start" onClick={start}>
                <span>{burst ? 'Starting…' : `Start ${chosen.title}`}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
