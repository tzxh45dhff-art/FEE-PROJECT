import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Compass,
  Globe2,
  Loader2,
  Map,
  Maximize2,
  Minimize2,
  Navigation,
  RotateCcw,
  Swords,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { api } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { cn } from '@/lib/utils'
import type { PartyState } from '../useParty'
import { GeoMapCanvas, GeoPanorama } from './GeoCanvas'
import { CountUp, DistancePill, RoundIntro, SoundToggles } from './GeoMoments'
import { useGeoSound } from './useGeoSound'
import { sfx } from './geoSound'
import { hasBrowserMapsKey } from './mapsSdk'
import { useGeoClock } from './useGeoClock'
import { COLORS, formatDistance, MOVEMENT, type GeoAct, type GeoOptions, type GeoView, type Point } from './types'
import './geo.css'

export function Cartography({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 600" fill="none" aria-hidden>
      <circle cx="300" cy="300" r="238" stroke="currentColor" strokeWidth="1" />
      {[70, 140, 205].map((r) => (
        <ellipse key={r} cx="300" cy="300" rx={r} ry="238" stroke="currentColor" strokeWidth="0.8" />
      ))}
      {[145, 215, 300, 385, 455].map((y) => (
        <path
          key={y}
          d={`M${y === 145 || y === 455 ? 120 : 68} ${y} Q300 ${y + (300 - y) * 0.3} ${y === 145 || y === 455 ? 480 : 532} ${y}`}
          stroke="currentColor"
          strokeWidth="0.8"
        />
      ))}
      <path
        d="M183 117l55 22 13 35-32 39 17 32-17 33-35-14-39-62-20-15m97 102 55 25 12 56-32 72-28-28-18-70m111-206 46 14 36-13 39 36 45 19-15 37-44 2-16 31-33-7-22-39-53 4-19-30zm15 139 49 17 26 42-32 71-30-11-21-75zm116 102 34-8 25 24-13 21-37-10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M123 388Q270 95 452 238" stroke="#ef795c" strokeWidth="2" strokeDasharray="4 7" />
      <circle cx="123" cy="388" r="6" fill="#ef795c" />
      <circle cx="452" cy="238" r="6" fill="#ef795c" />
      <circle cx="452" cy="238" r="17" stroke="#ef795c" strokeOpacity=".4" />
      <path d="M300 44v26m0 460v26M44 300h26m460 0h26" stroke="currentColor" />
    </svg>
  )
}

export function GeoSetup({
  people,
  selfId,
  onStart,
  starting,
  error,
}: {
  people: { id: string; name: string }[]
  selfId?: string
  onStart: (options: GeoOptions) => void
  starting: boolean
  error: string | null
}) {
  const [options, setOptions] = useState<GeoOptions>({
    map: 'world',
    movement: 'moving',
    mode: 'classic',
    rounds: 5,
    seconds: 90,
  })
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [statusError, setStatusError] = useState('')
  const [reload, setReload] = useState(0)
  useEffect(() => {
    const abort = new AbortController()
    setStatus('loading')
    void api
      .get<{ configured: boolean }>('/geo/status', abort.signal)
      .then((result) => {
        setStatus(result.configured && hasBrowserMapsKey() ? 'ready' : 'missing')
      })
      .catch((e) => {
        if (!abort.signal.aborted) {
          setStatus('error')
          setStatusError(e.message)
        }
      })
    return () => abort.abort()
  }, [reload])
  const patch = (p: Partial<GeoOptions>) => setOptions((o) => ({ ...o, ...p }))
  const opponents = people.filter((p) => p.id !== selfId)
  const opponent = opponents.some((p) => p.id === options.opponent) ? options.opponent : opponents[0]?.id
  const canStart = status === 'ready' && !starting && (options.mode !== 'duel' || people.length >= 2)
  return (
    <section className="geo-setup">
      <div className="geo-intro">
        <div className="geo-eyebrow">
          <Compass size={15} /> HUDDLE EXPEDITIONS <span>01</span>
        </div>
        <h1>
          Some<span>where.</span>
        </h1>
        <p className="geo-intro-line">
          A little lost.
          <br />A lot to discover.
        </p>
        <p className="geo-intro-copy">
          A street, a sign, a feeling. Find your place in the world before your friends do.
        </p>
        <div className="geo-orbit">
          <Cartography />
          <span className="geo-orbit-tag">
            <Navigation size={12} /> EVERY ROAD IS A CLUE
          </span>
        </div>
        <div className="geo-intro-foot">
          <span>REAL PLACES. SHARED ADVENTURES.</span>
          <span>360°</span>
        </div>
      </div>
      <div className="geo-flight-plan">
        <div className="geo-plan-heading">
          <div>
            <span className="geo-eyebrow">YOUR NEXT DEPARTURE</span>
            <h2>Pick a direction.</h2>
          </div>
          <span className="geo-people">
            <Users size={14} /> {people.length}
          </span>
        </div>
        <fieldset className="geo-field">
          <legend>
            01 <span>Where are we going?</span>
          </legend>
          <div className="geo-destinations">
            {(['world', 'india'] as const).map((map) => (
              <button
                key={map}
                className={cn('geo-destination', options.map === map && 'selected')}
                aria-pressed={options.map === map}
                onClick={() => patch({ map })}
              >
                {map === 'world' ? <Globe2 size={29} strokeWidth={1.1} /> : <Navigation size={29} strokeWidth={1.1} />}
                <strong>{map === 'world' ? 'The world' : 'Incredible India'}</strong>
                <span>{map === 'world' ? 'Different roads. Every direction.' : 'Familiar? Look a little closer.'}</span>
                <span className="geo-selected">
                  {options.map === map ? <Check size={13} /> : <ArrowRight size={13} />}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="geo-field">
          <legend>
            02 <span>How do we play?</span>
          </legend>
          <div className="geo-choice-row">
            <button
              aria-pressed={options.mode === 'classic'}
              className={cn('geo-choice', options.mode === 'classic' && 'selected')}
              onClick={() => patch({ mode: 'classic', rounds: 5 })}
            >
              <Globe2 size={17} />
              <span>
                <strong>Classic</strong>
                <small>Solo or the whole room</small>
              </span>
            </button>
            <button
              aria-pressed={options.mode === 'duel'}
              className={cn('geo-choice', options.mode === 'duel' && 'selected')}
              onClick={() => patch({ mode: 'duel', rounds: 10 })}
            >
              <Swords size={17} />
              <span>
                <strong>Duel</strong>
                <small>One on one · 6,000 health</small>
              </span>
            </button>
          </div>
          {options.mode === 'duel' && (
            <>
              <label className="geo-opponent">
                Your opponent
                <select value={opponent ?? ''} onChange={(e) => patch({ opponent: e.target.value })}>
                  {!opponents.length && <option value="">Invite a friend first</option>}
                  {opponents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="geo-field-note">
                Others can watch. Score differences deal damage; the first guess starts a 15-second finish. Damage
                doubles in round 4, then increases each round.
              </p>
            </>
          )}
        </fieldset>
        <fieldset className="geo-field">
          <legend>
            03 <span>Follow your instincts.</span>
          </legend>
          <div className="geo-movement">
            {(['moving', 'no-move', 'fixed'] as const).map((mode) => (
              <button
                key={mode}
                aria-pressed={options.movement === mode}
                onClick={() => patch({ movement: mode })}
                className={cn(options.movement === mode && 'selected')}
              >
                <span>{MOVEMENT[mode]}</span>
                <small>
                  {mode === 'moving'
                    ? 'Move, pan & zoom'
                    : mode === 'no-move'
                      ? 'Pan & zoom only'
                      : 'No moving, panning or zoom'}
                </small>
              </button>
            ))}
          </div>
        </fieldset>
        <details className="geo-advanced">
          <summary>
            Fine-tune the trip <ChevronDown size={14} />
          </summary>
          <div className="geo-settings-grid">
            <label>
              Round time
              <select value={options.seconds} onChange={(e) => patch({ seconds: Number(e.target.value) })}>
                {[30, 60, 90, 120, 180].map((n) => (
                  <option key={n} value={n}>
                    {n} seconds
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rounds
              <select
                disabled={options.mode === 'duel'}
                value={options.rounds}
                onChange={(e) => patch({ rounds: Number(e.target.value) })}
              >
                {[3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                    {options.mode === 'duel' && n === 10 ? ' maximum' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p>
            Classic: up to 5,000 points per round. A pin within 25 km is perfect. Unconfirmed pins submit when time
            runs out.
          </p>
        </details>
        <div className="geo-departure">
          <span>
            {options.mode === 'duel' ? 'UP TO 10 ROUNDS' : `${options.rounds} ROUNDS`}
            <i />
            {options.seconds}s EACH
            <i />
            {options.map.toUpperCase()}
          </span>
          <button
            className="geo-primary"
            disabled={!canStart}
            onClick={() => onStart({ ...options, opponent: options.mode === 'duel' ? opponent : undefined })}
          >
            {starting ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Finding your first road…
              </>
            ) : (
              <>
                Let’s get lost <ArrowRight size={18} />
              </>
            )}
          </button>
          <p role="status">
            {status === 'loading'
              ? 'Checking map access…'
              : status === 'missing'
                ? 'Maps aren’t connected yet. Your host is finishing setup.'
                : status === 'error'
                  ? statusError
                  : options.mode === 'duel' && people.length < 2
                    ? 'Invite a friend to start a duel.'
                    : 'Everyone in the room gets the same starting view.'}
          </p>
          {status === 'error' && (
            <button className="geo-text-button" onClick={() => setReload((n) => n + 1)}>
              Check connection again
            </button>
          )}
          {error && (
            <p className="geo-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
      <span className="sr-only">{selfId ? 'Ready for your room' : 'Sign in to play'}</span>
    </section>
  )
}

export function GeoTable({
  party,
  selfId,
  act,
  onJoin,
  onLeave,
  onRematch,
  error,
  presentIds,
  starting = false,
}: {
  party: PartyState<GeoView>
  selfId?: string
  act: GeoAct
  onJoin: () => void
  onLeave: () => void
  onRematch: () => void | Promise<void>
  starting?: boolean
  error: string | null
  presentIds: string[]
}) {
  const v = party.view
  const [point, setPoint] = useState<Point | null>(v.mine)
  const [expanded, setExpanded] = useState(false)
  const [heading, setHeading] = useState(v.scene.heading)
  const [focus, setFocus] = useState<string | null>(null)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [pinSaved, setPinSaved] = useState(true)
  const [sceneReady, setSceneReady] = useState(false)
  const clock = useGeoClock(party)
  useGeoSound(v, clock, v.players.some((p) => p.id === (selfId ?? '')))
  const revision = useRef(v.revision)
  const pendingPin = useRef<{ point: Point; revision: number } | null>(null)
  const mine = selfId ?? ''
  const player = v.players.some((p) => p.id === mine)
  const locked = v.answered.includes(mine)
  const reveal = v.phase === 'reveal' || v.phase === 'over'
  const eligible = v.eligible.includes(mine)
  const identity = { token: v.token, round: v.round, attempt: v.attempt }
  const current = useRef({ v, act, identity })
  current.current = { v, act, identity }
  useEffect(() => {
    setPoint(v.mine)
    setExpanded(false)
    setFocus(null)
    setMessage(null)
    setHistoryIndex(-1)
    revision.current = v.revision
    pendingPin.current = null
    setPinSaved(true)
    setSceneReady(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.token, v.round, v.attempt])
  useEffect(() => {
    if (v.revision >= revision.current || locked) {
      setPoint(v.mine)
      revision.current = Math.max(revision.current, v.revision)
      setPinSaved(true)
      if (locked) pendingPin.current = null
    }
  }, [v.mine, v.revision, locked])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,select,textarea,button,[contenteditable]')) return
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        setExpanded((x) => !x)
      }
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  const sendDraft = useCallback(async () => {
    const pin = pendingPin.current
    const state = current.current
    if (!pin || state.v.phase !== 'playing') return
    const reply = await state.act('draft', { ...state.identity, ...pin })
    if (
      current.current.identity.token !== state.identity.token ||
      current.current.identity.round !== state.identity.round ||
      current.current.identity.attempt !== state.identity.attempt
    )
      return
    if (!reply.error && pendingPin.current?.revision === pin.revision) {
      pendingPin.current = null
      setPinSaved(true)
    }
  }, [])
  useEffect(() => {
    const socket = getSocket()
    socket.on('connect', sendDraft)
    const retry = window.setInterval(() => {
      if (pendingPin.current) void sendDraft()
    }, 6000)
    return () => {
      socket.off('connect', sendDraft)
      clearInterval(retry)
    }
  }, [sendDraft])
  const onPin = (p: Point) => {
    if (!eligible || locked || v.phase !== 'playing') return
    sfx.pin()
    setPoint(p)
    setPinSaved(false)
    setMessage(null)
    revision.current += 1
    pendingPin.current = { point: p, revision: revision.current }
    void sendDraft()
  }
  const onReady = useCallback(() => {
    setSceneReady(true)
    const state = current.current
    if (!state.v.players.some((p) => p.id === mine) || !['loading', 'countdown'].includes(state.v.phase)) return
    void state.act('ready', state.identity)
  }, [mine])
  useEffect(() => {
    if (!sceneReady || !player || v.ready.includes(mine) || !['loading', 'countdown'].includes(v.phase)) return
    const retry = () => {
      const state = current.current
      void state.act('ready', state.identity)
    }
    retry()
    const timer = window.setInterval(retry, 5000)
    return () => window.clearInterval(timer)
  }, [sceneReady, player, mine, v.phase, v.ready])
  const guess = async () => {
    if (!point || busy) return
    setBusy(true)
    setMessage(null)
    const payload = { ...identity, point }
    let result = await act('guess', payload)
    if (result.error && /didn’t answer/.test(result.error)) result = await act('guess', payload)
    if (result.error) setMessage(result.error)
    else sfx.lock()
    setBusy(false)
  }
  const result = v.history[historyIndex >= 0 ? historyIndex : v.history.length - 1]
  const scores = [...v.players].sort((a, b) =>
    v.options.mode === 'duel'
      ? v.health[b.id] - v.health[a.id] || v.scores[b.id] - v.scores[a.id]
      : v.scores[b.id] - v.scores[a.id],
  )
  const tied =
    scores.length > 1 &&
    (v.options.mode === 'duel'
      ? v.health[scores[0].id] === v.health[scores[1].id] && v.scores[scores[0].id] === v.scores[scores[1].id]
      : v.scores[scores[0].id] === v.scores[scores[1].id])
  const takeover = player && v.host !== mine && !presentIds.includes(v.host)
  const seconds = Math.ceil(clock / 1000)
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  return (
    <section className={cn('geo-table', reveal && 'geo-revealing')} data-lenis-prevent>
      <GeoPanorama
        scene={v.scene}
        movement={v.options.movement}
        playing={v.phase === 'playing'}
        attempt={v.attempt}
        onReady={onReady}
        onHeading={setHeading}
      />
      <div className="geo-hud">
        <div className="geo-hud-brand">
          <Compass size={18} />
          <span>
            Somewhere<span>.</span>
          </span>
        </div>
        <div className="geo-round">
          <small>{v.options.mode === 'duel' ? 'DUEL' : v.options.map.toUpperCase()}</small>
          <strong>
            {reveal && v.phase === 'over'
              ? 'FINISH'
              : `${String(v.round + 1).padStart(2, '0')} / ${String(v.options.rounds).padStart(2, '0')}`}
          </strong>
        </div>
        <div
          className={cn('geo-timer', seconds <= 15 && v.phase === 'playing' && 'urgent')}
          aria-label={
            v.phase === 'over'
              ? `${v.history.length} locations discovered`
              : v.deadline
                ? `${seconds} seconds remaining`
                : 'Clock paused'
          }
        >
          <span>
            {v.phase === 'over'
              ? 'STOPS'
              : v.phase === 'loading'
                ? 'LOADING'
                : v.phase === 'blocked'
                  ? 'PAUSED'
                  : v.phase === 'countdown'
                    ? 'GET READY'
                    : reveal
                      ? 'NEXT UP'
                      : 'TIME LEFT'}
          </span>
          <strong>{v.phase === 'over' ? v.history.length : v.deadline ? timer : '—'}</strong>
        </div>
        <SoundToggles />
        {!reveal && (
          <div className="geo-compass" title="View heading">
            <Navigation size={18} style={{ transform: `rotate(${-heading}deg)` }} />
            <span>N</span>
          </div>
        )}
      </div>
      {v.options.mode === 'duel' && !reveal && (
        <div className="geo-health">
          {v.players.map((p, i) => (
            <div key={p.id}>
              <span>
                {p.name}
                {p.id === mine ? ' · you' : ''}
                <strong>{v.health[p.id].toLocaleString()}</strong>
              </span>
              <i>
                <b style={{ width: `${v.health[p.id] / 60}%`, background: COLORS[i] }} />
              </i>
            </div>
          ))}
        </div>
      )}
      {v.phase === 'countdown' && (
        <RoundIntro
          round={v.round + 1}
          of={v.options.rounds}
          seconds={seconds}
          label={v.options.mode === 'duel' ? 'Duel' : v.options.map === 'india' ? 'Incredible India' : 'The world'}
        />
      )}
      {(v.phase === 'loading' || v.phase === 'blocked') && (
        <div className="geo-loading-card" role="status">
          {v.phase === 'blocked' ? (
            <Compass size={30} />
          ) : (
            <Loader2 className="animate-spin" size={25} />
          )}
          <h2>
            {v.phase === 'blocked'
                ? 'Let’s find our bearings.'
                : 'A new road is waiting.'}
          </h2>
          <p>{v.error ?? `${v.ready.length} of ${v.players.length} views ready. The clock starts together.`}</p>
          {v.phase === 'blocked' && (v.host === mine || takeover) && (
            <div className="geo-inline-actions">
              <button className="geo-secondary" onClick={() => void act('retry', identity)}>
                Reload view
              </button>
              <button className="geo-primary" onClick={() => void act('replace', identity)}>
                Another location <ArrowRight size={15} />
              </button>
            </div>
          )}
          {takeover && (
            <button className="geo-text-button" onClick={() => void act('take-host', identity)}>
              Take over host controls
            </button>
          )}
        </div>
      )}
      {!player && !reveal && (
        <div className="geo-spectator">
          <span>You’re watching this trip.</span>
          {v.options.mode === 'classic' && (
            <button onClick={onJoin}>
              Join the next round <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
      {v.phase === 'playing' && player && !eligible && (
        <div className="geo-spectator">Your view missed the start. You’ll be back next round.</div>
      )}
      {!reveal && (
        <button className="geo-open-map" onClick={() => setExpanded(true)} aria-expanded={expanded}>
          <Map size={18} />
          <span>{locked ? 'Guess locked' : point ? 'Your pin is placed' : 'Where are you?'}</span>
          <Maximize2 size={14} />
        </button>
      )}
      <aside
        className={cn('geo-map-panel', expanded && 'expanded', reveal && 'results')}
        aria-label={reveal ? 'Trip results' : 'Your guessing map'}
      >
        <div className="geo-map-heading">
          <span>
            <Map size={15} />
            {reveal ? (v.phase === 'over' ? 'YOUR JOURNEY' : 'THE REVEAL') : 'PLACE YOUR PIN'}
          </span>
          {!reveal && (
            <button aria-label={expanded ? 'Collapse map' : 'Expand map'} onClick={() => setExpanded((x) => !x)}>
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
        </div>
        <div className="geo-map-surface">
          {v.phase === 'reveal' && result && player && (
            <DistancePill km={result.guesses[focus ?? mine]?.distance} round={result.round} />
          )}
          <GeoMapCanvas
            attempt={v.attempt}
            point={point}
            onPin={onPin}
            result={reveal ? result : undefined}
            players={v.players}
            focus={focus}
            map={v.options.map}
            disabled={locked || !eligible || v.phase !== 'playing'}
          />
        </div>
        {!reveal && (
          <div className="geo-map-footer">
            <span>
              {locked ? (
                <>
                  <Check size={14} /> Guess locked · waiting for friends
                </>
              ) : point ? (
                pinSaved ? (
                  'Pin saved · submits when time runs out'
                ) : (
                  'Saving your pin…'
                )
              ) : (
                'Tap the map. Trust your instincts.'
              )}
            </span>
            <button
              className="geo-primary"
              disabled={!point || locked || !eligible || v.phase !== 'playing' || busy}
              onClick={() => void guess()}
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : locked ? (
                <Check size={15} />
              ) : (
                <Navigation size={15} />
              )}
              {locked ? 'Locked in' : 'Guess'}
            </button>
          </div>
        )}
      </aside>
      {!reveal && v.phase === 'playing' && (
        <div className="geo-round-note">
          <span>{MOVEMENT[v.options.movement]}</span>
          <span>
            {v.answered.length} / {v.eligible.length} guesses locked
          </span>
        </div>
      )}
      {reveal && (
        <div className="geo-recap" data-lenis-prevent>
          <span className="geo-eyebrow">
            {v.phase === 'over'
              ? v.endedEarly
                ? 'TRIP ENDED EARLY'
                : 'A LITTLE LESS LOST'
              : `STOP ${v.round + 1} · REVEALED`}
          </span>
          <h2>{v.phase === 'over' ? 'What a trip.' : (result?.location.label ?? 'Round complete.')}</h2>
          <p>
            {v.phase === 'over'
              ? v.history.length
                ? `${tied ? 'A shared finish' : `${scores[0]?.name ?? 'Everyone'} ${v.options.mode === 'duel' ? 'takes the duel' : 'leads the way'}`}. ${v.history.length} ${v.history.length === 1 ? 'place' : 'places'} discovered together.`
                : 'No rounds were scored. Your next road is still out there.'
              : v.options.mode === 'duel'
                ? `${result?.damage.toLocaleString()} damage · ${result?.multiplier}× multiplier`
                : 'Every guess tells a different story.'}
          </p>
          <div className="geo-score-list">
            {scores.map((p, place) => {
              const index = v.players.findIndex((x) => x.id === p.id)
              const guessResult = result?.guesses[p.id]
              return (
                <button
                  key={p.id}
                  className={cn('geo-score', focus === p.id && 'selected')}
                  onClick={() => setFocus(focus === p.id ? null : p.id)}
                  aria-pressed={focus === p.id}
                >
                  <span className="geo-score-rank">
                    {v.phase === 'over' && place === 0 ? <Trophy size={17} /> : place + 1}
                  </span>
                  <span className="geo-player-dot" style={{ background: COLORS[index % COLORS.length] }}>
                    {index + 1}
                  </span>
                  <span className="geo-score-name">
                    <strong>
                      {p.name}
                      {p.id === mine && <small>you</small>}
                    </strong>
                    <span>{guessResult?.missed ? 'Missed the start' : formatDistance(guessResult?.distance)}</span>
                  </span>
                  <span className="geo-score-points">
                    <strong>
                      {v.phase === 'over'
                        ? (v.options.mode === 'duel' ? v.health[p.id] : v.scores[p.id]).toLocaleString()
                        : (
                          <CountUp value={guessResult?.points ?? 0} round={result?.round ?? v.round} mine={p.id === mine} km={guessResult?.distance} />
                        )}
                    </strong>
                    <small>
                      {v.phase === 'over'
                        ? v.options.mode === 'duel'
                          ? 'HEALTH'
                          : 'TOTAL PTS'
                        : `${v.scores[p.id].toLocaleString()} TOTAL`}
                    </small>
                  </span>
                </button>
              )
            })}
          </div>
          {v.phase === 'over' && v.history.length > 0 && (
            <div className="geo-stops" aria-label="Review each round">
              {v.history.map((r, i) => (
                <button
                  key={r.round}
                  aria-pressed={(historyIndex < 0 ? v.history.length - 1 : historyIndex) === i}
                  onClick={() => {
                    setHistoryIndex(i)
                    setFocus(null)
                  }}
                >
                  {i + 1}
                  <small>{formatDistance(r.guesses[mine]?.distance)}</small>
                </button>
              ))}
            </div>
          )}
          {v.phase === 'over' ? (
            <div className="geo-finish-actions">
              <button className="geo-primary" disabled={starting || !player} onClick={() => void onRematch()}>
                {starting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}{' '}
                {starting ? 'Finding a road…' : 'Another trip'}
              </button>
              <button className="geo-secondary" onClick={onLeave}>
                All games
              </button>
            </div>
          ) : (
            <button
              className="geo-primary"
              disabled={!player || v.nextReady.includes(mine)}
              onClick={() => void act('next', identity)}
            >
              {v.nextReady.includes(mine)
                ? 'Waiting for the room…'
                : v.round + 1 >= v.options.rounds || (v.options.mode === 'duel' && Object.values(v.health).includes(0))
                  ? 'See the finish'
                  : 'Next destination'}
              <ArrowRight size={16} />
            </button>
          )}
          {takeover && (
            <button className="geo-text-button" onClick={() => void act('take-host', identity)}>
              Take over host controls
            </button>
          )}
        </div>
      )}
      {(message || error) && (
        <div className="geo-toast" role="alert">
          <span>{message || error}</span>
          <button aria-label="Dismiss message" onClick={() => setMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </section>
  )
}
