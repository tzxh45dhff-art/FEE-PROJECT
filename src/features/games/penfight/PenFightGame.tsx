import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, CircleHelp, Crosshair, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { advance, createMatch, shoot, type PenMatch } from '../../../../server/src/games/penfight'
import { chooseBotShot, openingPens, type Flick } from './physics'
import type { GamePlayer, GameSnapshot, PenStyle } from '../types'
import PenFightTable, { type Aim } from './PenFightTable'
import './penfight.css'

const STYLES: { id: PenStyle; name: string; note: string }[] = [
  { id: 'classic', name: 'The Classic', note: 'White barrel · blue cap' },
  { id: 'gel', name: 'Gel Writer', note: 'Colour barrel · soft grip' },
  { id: 'fine', name: 'Fine Point', note: 'Dark barrel · steel clip' },
]
function PenPreview({ style, color = '#2855a3' }: { style: PenStyle; color?: string }) {
  return <svg viewBox="0 0 220 44" aria-hidden="true" className="pf-pen-preview">
    <defs><linearGradient id={`barrel-${style}`} x2="0" y2="1"><stop stopColor={style === 'classic' ? '#fffdf2' : style === 'fine' ? '#52606d' : color} /><stop offset=".5" stopColor={style === 'classic' ? '#d9d6cc' : '#202e45'} /><stop offset="1" stopColor={style === 'classic' ? '#f5f1e9' : color} /></linearGradient></defs>
    <ellipse cx="110" cy="33" rx="89" ry="3" fill="#292115" opacity=".15" />
    <path d="M14 22 28 17V27Z" fill="#7e8587" /><rect x="27" y="17" width="132" height="10" rx="3" fill={`url(#barrel-${style})`} stroke="#777" strokeWidth=".4" />
    <rect x="154" y="15" width="47" height="14" rx="5" fill={color} /><path d="M162 15h33v3h-33Z" fill="#fff" opacity=".45" /><rect x="154" y="26" width="38" height="3" rx="1" fill={style === 'fine' ? '#a6b0b8' : color} />
    {[142, 146].map(x => <rect key={x} x={x} y="17" width="2" height="10" fill="#243040" />)}
  </svg>
}
function localSnapshot(match: PenMatch): GameSnapshot { return { ...match, roomId: 'practice', serverNow: Date.now(), receivedAt: Date.now() } }
const PREVIEW = localSnapshot(createMatch([{ id: 'one', name: 'You' }, { id: 'two', name: 'Your friend' }], 0, Date.now()))
const noop = () => {}

export default function PenFightGame({ snapshot, selfId, opponents, connected, error, send, onBack }: {
  snapshot: GameSnapshot | null; selfId?: string; opponents: GamePlayer[]; connected: boolean; error: string | null
  send: (event: string, payload?: Record<string, unknown>) => Promise<{ error?: string }>; onBack: () => void
}) {
  const [local, setLocal] = useState<GameSnapshot | null>(null)
  const [mode, setMode] = useState<'bot' | 'local'>('bot')
  const [style, setStyle] = useState<PenStyle>('classic')
  const [aim, setAim] = useState<Aim | null>(null)
  const [pending, setPending] = useState(false)
  const pendingRef = useRef(false)
  const [help, setHelp] = useState(false)
  const [precise, setPrecise] = useState(false)
  const [angle, setAngle] = useState(-90)
  const [power, setPower] = useState(60)
  const [sound, setSound] = useState(false)
  const audio = useRef<AudioContext | null>(null)
  const helpRef = useRef<HTMLDivElement>(null)
  const helpButton = useRef<HTMLButtonElement>(null)
  const [now, setNow] = useState(Date.now())
  // A room match always takes precedence over solo practice.
  const game = snapshot ?? local
  const isLocal = !snapshot && !!local
  const seatIndex = game?.players.findIndex(p => p.id === (isLocal ? 'you' : selfId)) ?? -1
  const seat: 0 | 1 | null = isLocal && mode === 'local' ? game!.turn : seatIndex === 0 || seatIndex === 1 ? seatIndex : null
  const canAim = !!game && game.phase === 'aim' && seat === game.turn && (isLocal || connected) && !pending && !help
  const displaySeat = seat ?? 0
  const clockNow = game ? now - game.receivedAt + game.serverNow : now
  const seconds = game ? Math.max(0, Math.ceil((game.deadline - clockNow) / 1000)) : 0
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(timer) }, [])
  useEffect(() => {
    if (snapshot) setLocal(null)
  }, [snapshot])
  useEffect(() => {
    setAim(null); setAngle(game?.turn === 1 ? 90 : -90)
  }, [game?.epoch, game?.seq, game?.turn])
  useEffect(() => {
    if (!local || snapshot || local.phase === 'over') return
    const timer = setTimeout(() => setLocal(current => current?.seq === local.seq ? localSnapshot(advance(current, Math.max(Date.now(), current.deadline))) : current), Math.max(0, local.deadline - Date.now()))
    return () => clearTimeout(timer)
  }, [local, snapshot])
  useEffect(() => {
    if (!local || snapshot || mode !== 'bot' || local.turn !== 1 || local.phase !== 'aim') return
    const timer = setTimeout(() => {
      const shot = chooseBotShot(local.pens, 1)
      setLocal(current => current?.seq === local.seq ? localSnapshot(shoot(current, shot, Date.now())) : current)
    }, 1000)
    return () => clearTimeout(timer)
  }, [local, mode, snapshot])
  useEffect(() => () => { void audio.current?.close() }, [])
  useEffect(() => {
    if (!help) return
    const opener = helpButton.current
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setHelp(false); return }
      if (event.key !== 'Tab') return
      const nodes = helpRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
      if (!nodes?.length) return
      const first = nodes[0]!, last = nodes[nodes.length - 1]!
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); opener?.focus() }
  }, [help])
  const clickSound = useCallback(() => {
    if (!sound) return
    try {
      const ctx = audio.current ??= new AudioContext()
      void ctx.resume()
      const osc = ctx.createOscillator(), gain = ctx.createGain()
      osc.type = 'triangle'; osc.frequency.setValueAtTime(700, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.07, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.07)
    } catch { /* Sound is optional; the shot is not. */ }
  }, [sound])
  const flick = useCallback(async (shot: Flick) => {
    if (!canAim || !game || pendingRef.current) return
    setAim(null); clickSound()
    if (isLocal) { setLocal(localSnapshot(shoot(game, shot, Date.now()))); return }
    pendingRef.current = true; setPending(true)
    try { await send('game:flick', { shot }) } finally { pendingRef.current = false; setPending(false) }
  }, [canAim, game, isLocal, send, clickSound])
  const start = async (opponent?: GamePlayer, localMode: 'bot' | 'local' = 'bot') => {
    if (pendingRef.current) return
    if (!opponent) {
      setMode(localMode)
      setLocal(localSnapshot(createMatch([{ id: 'you', name: localMode === 'local' ? 'Player 1' : 'You' }, { id: 'rival', name: localMode === 'bot' ? 'The backbencher' : 'Player 2' }], Date.now(), Date.now(), [style, 'gel'])))
      return
    }
    pendingRef.current = true; setPending(true)
    try { await send('game:start', { opponent, styles: [style, 'gel'] }) } finally { pendingRef.current = false; setPending(false) }
  }
  const exit = async () => {
    if (isLocal) setLocal(null)
    else if (game) await send('game:end')
  }
  const precisionShot = { dx: Math.cos(angle * Math.PI / 180), dz: Math.sin(angle * Math.PI / 180), power: power / 100, contact: 0 }
  const shownAim = canAim && precise ? precisionShot : aim
  const activeName = game?.players[game.turn].name ?? ''
  const status = !game ? 'A classroom classic. One more round.'
    : !isLocal && !connected ? 'Reconnecting to your desk…'
    : game.phase === 'over' ? game.winner === seat ? 'You win the desk.' : `${game.players[game.winner!].name} wins the desk.`
    : game.phase === 'round' ? game.result?.winner === null ? 'Both pens fell. Call it even.' : `${game.players[game.result!.winner!].name} takes the round.`
    : game.phase === 'moving' ? 'Let the pens do the talking.'
    : pending ? 'Sending your flick…'
    : seat === game.turn ? mode === 'local' && isLocal ? `${activeName} · your turn` : 'Your turn. Make it count.' : `${activeName} is lining up a shot.`
  return <section className="pf-world" aria-label="Pen Fight classroom">
    <div className="pf-scene"><PenFightTable snapshot={game ?? { ...PREVIEW, pens: openingPens(), styles: [style, 'gel'] }} seat={displaySeat} viewSeat={isLocal && mode === 'local' ? 0 : displaySeat} enabled={canAim} dragEnabled={!precise} aim={shownAim} onAim={game ? setAim : noop} onFlick={shot => void flick(shot)} /></div>
    <header className="pf-chalkboard">
      <div className="pf-board-title"><span>HUDDLE HIGH · LAST BENCH</span><h1>PEN FIGHT</h1><span>{game ? `ROUND ${game.round} · FIRST TO 3` : 'CLASS IS OVERRATED.'}</span></div>
      {game && <div className="pf-scoreboard" aria-label="Match score">{game.players.map((p, i) => <div key={p.id} className={game.turn === i && game.phase === 'aim' ? 'is-turn' : ''}>
        <span className={`pf-ink pf-ink-${i}`} /><span className="pf-player-name" title={p.name}>{p.name}{i === seat && !isLocal ? ' (you)' : ''}</span><strong>{game.scores[i]}</strong><span className="pf-score-dots" aria-hidden>{[0, 1, 2].map(n => <i key={n} className={n < game.scores[i]! ? 'won' : ''} />)}</span>
      </div>)}</div>}
    </header>
    <nav className="pf-tools" aria-label="Pen Fight controls">
      <button onClick={onBack} aria-label="Back to games" title="Back to games"><ArrowLeft size={18} /></button>
      <button ref={helpButton} onClick={() => setHelp(v => !v)} aria-label="How to play" aria-expanded={help}><CircleHelp size={18} /></button>
      <button onClick={() => setSound(v => !v)} aria-label={sound ? 'Mute pen sounds' : 'Enable pen sounds'} aria-pressed={sound}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
    </nav>
    {!game ? <div className="pf-lobby-wrap" data-lenis-prevent><div className="pf-paper pf-lobby">
      <p className="pf-eyebrow">THE UNOFFICIAL LUNCH BREAK</p><h2>Pick your pen.<br />Settle it at the desk.</h2>
      <p>Touch your pen. Pull back. Let go.</p>
      <div className="pf-pen-picker" role="group" aria-label="Choose your pen">{STYLES.map(p => <button key={p.id} aria-pressed={style === p.id} onClick={() => setStyle(p.id)}><PenPreview style={p.id} /><strong>{p.name}</strong><small>{p.note}</small></button>)}</div>
      <p className="pf-fair-note">Same weight. Same reach. All style.</p>
      <div className="pf-play-options"><button className="pf-primary" onClick={() => void start()}>Play the backbencher<small>Solo practice · a proper opponent</small></button><button className="pf-secondary" onClick={() => void start(undefined, 'local')}>Pass & play<small>Two players · one screen</small></button></div>
      <div className="pf-friends"><h3>Or challenge someone in your room</h3>{opponents.length ? opponents.map(p => <button key={p.id} disabled={!connected || pending} onClick={() => void start(p)}><span>{p.name}</span><strong>{pending ? 'Opening…' : 'Challenge →'}</strong></button>) : <p>Your friends will appear here when they join the room.</p>}</div>
      {error && <p role="alert" className="pf-error">{error}</p>}
    </div></div> : <>
      <div className="pf-turn-strip"><p role="status">{status}</p>{game.phase === 'aim' && <span className={seconds <= 8 ? 'pf-clock urgent' : 'pf-clock'} aria-label={`${seconds} seconds left`}>{seconds}s</span>}</div>
      <footer className="pf-footer">
        {canAim && <><div className="pf-power"><span>{shownAim ? `${Math.round(shownAim.power * 100)}% power` : 'Touch your pen & pull back'}</span><div><i style={{ width: `${(shownAim?.power ?? 0) * 100}%` }} /></div></div><button className="pf-precision-toggle" onClick={() => setPrecise(v => !v)} aria-expanded={precise}><Crosshair size={16} />{precise ? 'Drag controls' : 'Aim controls'}</button></>}
        {game.phase === 'aim' && !canAim && <span>{seat === null ? 'Spectating · enjoy the match' : 'Tip: flick near a tip to add spin.'}</span>}
        {game.phase === 'moving' && <span>Sliding, spinning, settling…</span>}
        {isLocal && <button className="pf-exit-practice" onClick={() => void exit()} aria-label="Leave practice"><X size={16} /></button>}
      </footer>
      {precise && canAim && <div className="pf-precision pf-paper">
        <label>Direction <input aria-label="Shot direction" type="range" min="-180" max="180" value={angle} onChange={e => setAngle(+e.target.value)} /><output>{angle}°</output></label>
        <label>Power <input aria-label="Shot power" type="range" min="10" max="100" value={power} onChange={e => setPower(+e.target.value)} /><output>{power}%</output></label>
        <button className="pf-primary" onClick={() => void flick(precisionShot)}>Flick pen</button>
      </div>}
      {(game.phase === 'round' || game.phase === 'over') && <div className="pf-result-wrap"><div className="pf-paper pf-result" role="status">
        <p className="pf-eyebrow">{game.phase === 'over' ? 'THE DESK HAS A CHAMPION' : `ROUND ${game.round}`}</p><h2>{status}</h2>
        <p>{game.result?.reason === 'timeout' ? 'Three missed turns. The desk goes to the other player.' : game.result?.winner === null ? 'No point. Reset the pens and go again.' : game.phase === 'over' ? 'Bragging rights until the next lunch break.' : 'The player who lost opens the next round.'}</p>
        {game.phase === 'over' ? <div className="pf-result-actions"><button className="pf-primary" disabled={pending || (!isLocal && !connected)} onClick={() => {
          if (isLocal) void start(undefined, mode)
          else if (seat !== null) void start(game.players[seat === 0 ? 1 : 0])
          else void exit()
        }}><RotateCcw size={16} />{seat === null ? 'Back to the desk' : 'Play again'}</button><button className="pf-secondary" onClick={() => void exit()}>Leave desk</button></div> : <span className="pf-next-round">Next round in {seconds}…</span>}
      </div></div>}
      {error && !isLocal && <p role="alert" className="pf-error pf-live-error">{error}</p>}
    </>}
    {help && <div className="pf-help-wrap" data-lenis-prevent><div className="pf-paper pf-help" ref={helpRef} role="dialog" aria-modal="true" aria-labelledby="pf-rules">
      <button className="pf-close" onClick={() => setHelp(false)} aria-label="Close instructions" autoFocus><X size={20} /></button><p className="pf-eyebrow">NO TEACHERS. JUST RULES.</p><h2 id="pf-rules">The last-bench handbook</h2>
      <ol><li><strong>Touch your own pen.</strong> Pull backwards, away from where you want it to go. The arrow shows the shot.</li><li><strong>Pick your power.</strong> A little tug nudges. A big pull can send you off the desk too.</li><li><strong>Use the whole pen.</strong> Flick the middle to slide straight. Flick near an end to spin.</li><li><strong>Stay on the desk.</strong> Knock theirs off and keep yours on. Both fall? No point. First to three wins.</li></ol>
      <p>Aim controls also work with a keyboard. Use the arrow keys on each slider, then activate Flick pen. The clock keeps running while this guide is open. Turns last 35 seconds; three missed turns end the match.</p>
      <button className="pf-primary" onClick={() => setHelp(false)}>Got it. Let’s play.</button>
    </div></div>}
  </section>
}
