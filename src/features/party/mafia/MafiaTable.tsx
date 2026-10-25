import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Armchair, BookOpen, Flag, FolderLock, Mic, MicOff, MonitorSpeaker, MoreHorizontal, Pause, Play, Send, Video, Volume2, VolumeX, Wifi } from 'lucide-react'

import { remaining, type PartyState } from '@/features/party/useParty'
import type { useMeshCall } from '@/features/room-panel/useMeshCall'
import { characterFor, type Character } from '@/lib/characters'
import { cn } from '@/lib/utils'
import { Skyline } from './art'
import { callName, firstName } from './helpers'
import { CaseFile, Clock, Newspaper, RoleCard, Subtitles } from './Pieces'
import { Portrait, Seat } from './Seat'
import { publicOnly, useNotes } from './notes'
import { DossierSheet, NotebookSheet, Predict } from './Sheets'
import { ROLE_TITLE, isFamily, type MafiaView, type SeatView } from './types'
import { canHear, useHearing } from './useHearing'
import { useNarrator } from './useNarrator'
import { useNoirFonts } from './useNoirFonts'
import { useNoirSound } from './useNoirSound'
import './noir.css'

type Call = ReturnType<typeof useMeshCall>
type Person = { id: string; name: string; character?: Character }

const PHASE_TITLE: Record<MafiaView['phase'], string> = {
  deal: 'The deal',
  night: 'Night',
  hush: 'Stop the presses',
  dawn: 'Morning',
  day: 'The day',
  vote: 'The vote',
  defence: 'Defence',
  judgement: 'Judgement',
  verdict: 'Verdict',
  over: 'Case closed',
}

/** What each role is asked to do at night. Everyone has something, so nobody gives themselves away. */
const NIGHT_ASK: Record<string, { title: string; hint: string; verb: string; doing: string }> = {
  mafia: { title: 'Who sleeps with the fishes?', hint: 'Agree with the Family. If you split, a coin decides.', verb: 'Mark', doing: 'Marking' },
  godfather: { title: 'Name the target', hint: 'Your word decides the kill.', verb: 'Mark', doing: 'Marking' },
  doctor: { title: 'Who do you keep alive tonight?', hint: 'Not the same patient twice in a row. Yourself, once.', verb: 'Protect', doing: 'Protecting' },
  detective: { title: 'Whose file do you open?', hint: 'By morning you will know if they work for the Family.', verb: 'Investigate', doing: 'Investigating' },
  villager: { title: 'Who do you suspect?', hint: 'Your hunch goes in the case file.', verb: 'Suspect', doing: 'Suspecting' },
  jester: { title: 'Who do you suspect?', hint: 'Play the part. Act suspicious tomorrow.', verb: 'Suspect', doing: 'Suspecting' },
}

const DEFENCE_MS = 25_000

function useStored(key: string, initial: boolean) {
  const [on, setOn] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : raw === 'on'
    } catch {
      return initial
    }
  })
  const flip = useCallback(() => {
    setOn((was) => {
      try {
        localStorage.setItem(key, was ? 'off' : 'on')
      } catch {
        /* Not remembered. */
      }
      return !was
    })
  }, [key])
  return [on, flip] as const
}

/**
 * The game, at the table.
 *
 * Three layouts from one game. Online, everyone sees a wall of photographs —
 * live video from the room's own call, a portrait for anyone off camera —
 * with their own move beside it. At a real table each phone is a private,
 * silent dossier. And any device can become the town square: public things
 * only, read aloud, safe to put in the middle where everyone can see it.
 */
export function MafiaTable({
  party,
  selfId,
  act,
  call,
  people,
  onLeave,
  onPlayAgain,
}: {
  party: PartyState<MafiaView>
  selfId: string | undefined
  act: (action: string, payload?: Record<string, unknown>) => void
  call: Call | null
  people: Person[]
  onLeave: () => void
  onPlayAgain: () => void
}) {
  useNoirFonts()
  const full = party.view
  const [squareHere, toggleSquare] = useStored('huddle.mafiaSquare', false)
  const square = !full.me || squareHere
  /* A shared screen never shows a private thing — not even its owner's. */
  const view = useMemo(() => (square ? publicOnly(full) : full), [square, full])
  const me = view.me
  const phase = view.phase
  const isHost = selfId === view.host
  const presence = full.players.find((p) => p.id === selfId)?.presence ?? 'online'
  const layout: 'seats' | 'pocket' | 'square' = square ? 'square' : presence === 'table' ? 'pocket' : 'seats'
  const mood: 'night' | 'day' = phase === 'night' || phase === 'deal' ? 'night' : 'day'
  /* AI players get a face from the same cast as everyone else, steady for the whole game. */
  const character = (id: string) => people.find((p) => p.id === id)?.character ?? (id.startsWith('ai-') ? characterFor(`${full.game}-${id}`) : undefined)
  const seatById = (id: string | null | undefined) => view.players.find((p) => p.id === id)
  const alive = view.players.filter((p) => p.alive)

  /* The clock. */
  const [left, setLeft] = useState(() => remaining(party, view.deadline))
  useEffect(() => {
    const update = () => setLeft(view.paused ?? remaining(party, view.deadline))
    update()
    const timer = window.setInterval(update, 250)
    return () => window.clearInterval(timer)
  }, [party, view.deadline, view.paused])
  const total = useMemo(() => {
    if (phase === 'night') return view.options.nightSeconds * 1000 + 5000
    if (phase === 'day') return view.options.daySeconds * 1000
    if (phase === 'vote' || phase === 'judgement') return view.options.voteSeconds * 1000
    if (phase === 'defence') return DEFENCE_MS
    return 0
  }, [phase, view.options])
  /* The reading phases have no fixed length: their clock empties from whatever time they began with. */
  const [began, setBegan] = useState({ key: '', ms: 0 })
  const phaseKey = `${view.game}-${phase}-${view.round}`
  if (began.key !== phaseKey || left > began.ms) setBegan({ key: phaseKey, ms: began.key !== phaseKey ? left : Math.max(began.ms, left) })
  const reading = phase === 'dawn' || phase === 'verdict' || phase === 'deal'
  const clockTotal = total || (reading ? began.ms : 0)

  /* Sound. Pocket phones at a table stay silent — the town square does the talking. */
  const [soundOn, toggleSound] = useStored('huddle.mafiaSound', true)
  const narrates = soundOn && layout !== 'pocket'
  const { sting } = useNoirSound(phase === 'over' ? 'quiet' : mood === 'night' ? 'night' : 'day', narrates)
  useNarrator(view.narration, { enabled: narrates, volume: 1 })
  const lastPhase = useRef(phase)
  useEffect(() => {
    if (phase === lastPhase.current) return
    lastPhase.current = phase
    if (phase === 'dawn') sting('dawn')
    if (phase === 'verdict') sting('verdict')
    if (phase === 'deal') sting('deal')
  }, [phase, sting])
  const tick = useCallback(() => sting('tick'), [sting])

  /*
   * Eyes closed means mics closed: on the call, your microphone mutes at
   * nightfall and comes back at dawn, so nobody hears the Family plotting.
   * The dead are muted for good — ghosts keep quiet.
   */
  const mutedByGame = useRef(false)
  const onCall = call?.status === 'live'
  const myself = full.me
  useEffect(() => {
    if (!call || call.status !== 'live' || !myself || presence !== 'online') return
    const shouldMute = (phase === 'night' && myself.alive) || !myself.alive
    if (shouldMute && !call.muted) {
      call.toggleMute()
      mutedByGame.current = true
    } else if (!shouldMute && mutedByGame.current && call.muted && myself.alive) {
      call.toggleMute()
      mutedByGame.current = false
    }
  }, [phase, myself?.alive, call?.status, presence]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Who is on the call, by player. */
  const media = (id: string) => {
    if (!call || call.status !== 'live') return { stream: null, cameraOff: true, muted: true, onCall: false }
    if (id === selfId) return { stream: call.localStream, cameraOff: call.cameraOff, muted: call.muted, onCall: true }
    const peer = call.peers.find((p) => p.userId === id)
    return peer ? { stream: peer.stream, cameraOff: peer.cameraOff, muted: peer.muted, onCall: true } : { stream: null, cameraOff: true, muted: true, onCall: false }
  }

  /* Sheets and notes. */
  const [sheet, setSheet] = useState<'dossier' | 'notebook' | null>(null)
  const [menu, setMenu] = useState(false)
  const { notes, cycle } = useNotes(view.game)
  const closeSheet = useCallback(() => setSheet(null), [])

  /* ── what can be chosen right now ───────────────────────────────────── */

  const acting = !!me && me.alive
  const nightTargets: SeatView[] =
    acting && phase === 'night'
      ? view.players.filter((p) => {
          if (!p.alive) return false
          if (isFamily(me.role)) return !isFamily(p.role)
          if (me.role === 'doctor') return !(p.id === me.lastProtected) && !(p.id === me.id && me.selfSaveUsed)
          return p.id !== me.id
        })
      : []
  const voteTargets: SeatView[] = acting && phase === 'vote' ? alive.filter((p) => p.id !== me.id) : []
  const myVote = selfId && phase === 'vote' ? view.votes[selfId] : undefined
  const familyPick = (id: string) => view.night?.family?.filter((f) => f.pick === id && f.id !== selfId).map((f) => firstName(seatById(f.id))) ?? []
  const pins = (id: string) => Object.entries(view.votes).filter(([, t]) => t === id).map(([v]) => v)
  const accused = seatById(view.accused)
  const iAmAccused = !!me && view.accused === me.id
  const trial = phase === 'defence' || phase === 'judgement'

  /* Table talk: who said what just now, and which AIs are mid-thought. */
  const hasBots = view.players.some((p) => p.bot)
  const talking = phase === 'day' || phase === 'vote' || phase === 'defence' || phase === 'judgement'
  const serverNow = party.serverTime + (Date.now() - party.receivedAt)
  const bubble = (id: string): { text: string | null } | null => {
    const last = [...view.talk].reverse().find((t) => t.by === id)
    /* Up long enough to read at an easy pace, however long the line. */
    if (last && serverNow - last.at < Math.max(7_000, last.text.length * 100 + 3_000)) return { text: last.text }
    return view.thinking.includes(id) && talking ? { text: null } : null
  }
  const [hearOn, toggleHear] = useStored('huddle.mafiaHear', false)
  const mutedNow = presence === 'online' && call?.status === 'live' && call.muted
  const hearing = useHearing(
    hearOn && hasBots && talking && !!me?.alive && !mutedNow && layout !== 'square',
    useCallback((text: string) => act('say', { text, heard: true }), [act]),
  )

  /* ── the seat wall and its strings ──────────────────────────────────── */

  const wall = useRef<HTMLDivElement>(null)
  const seatEls = useRef(new Map<string, HTMLElement>())
  const [strings, setStrings] = useState<{ from: { x: number; y: number }; to: { x: number; y: number }; key: string }[]>([])
  useLayoutEffect(() => {
    if (phase !== 'vote' && !trial) return setStrings([])
    const measure = () => {
      const box = wall.current?.getBoundingClientRect()
      if (!box || box.width === 0) return setStrings([])
      const out: typeof strings = []
      for (const [voter, target] of Object.entries(view.votes)) {
        if (!target) continue
        const a = seatEls.current.get(voter)?.getBoundingClientRect()
        const b = seatEls.current.get(target)?.getBoundingClientRect()
        if (!a || !b) continue
        out.push({ key: `${voter}-${target}`, from: { x: a.left + a.width / 2 - box.left, y: a.top + a.height * 0.4 - box.top }, to: { x: b.left + b.width / 2 - box.left, y: b.top + b.height * 0.4 - box.top } })
      }
      setStrings(out)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (wall.current) observer.observe(wall.current)
    return () => observer.disconnect()
  }, [view.votes, phase, layout, trial])

  /*
   * One place to choose, per screen: a phone picks from the dossier's grid,
   * so the wall steps aside while you act; a computer votes on the wall
   * itself, and the night's choice — secret — stays in the dossier.
   */
  const wallHiddenOnPhone = (phase === 'night' && acting) || (phase === 'vote' && acting)
  const wallVotes = phase === 'vote' && acting
  const seatWall = (
    <div
      ref={wall}
      className={cn(
        'relative mx-auto w-full max-w-4xl gap-2 sm:grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))] sm:gap-3.5',
        wallHiddenOnPhone ? 'hidden lg:grid' : 'grid',
        view.players.length > 4 ? 'grid-cols-3' : 'grid-cols-2',
      )}
    >
      {view.players.map((seat) => {
        const m = media(seat.id)
        const selectable = wallVotes && voteTargets.some((c) => c.id === seat.id)
        const badge =
          phase === 'day' && view.ready.includes(seat.id)
            ? 'ready'
            : phase === 'vote' && view.votes[seat.id] !== undefined
              ? 'voted'
              : phase === 'night' && view.night?.family && familyPick(seat.id).length
                ? `marked · ${familyPick(seat.id).join(', ')}`
                : trial && seat.id === view.accused
                  ? 'on trial'
                  : null
        return (
          <Seat
            key={seat.id}
            seatRef={(el) => {
              if (el) seatEls.current.set(seat.id, el)
              else seatEls.current.delete(seat.id)
            }}
            seat={seat}
            you={seat.id === selfId}
            character={character(seat.id)}
            stream={m.stream}
            cameraOff={m.cameraOff}
            onCall={m.onCall && seat.presence === 'online'}
            micMuted={m.muted}
            mood={phase === 'night' ? 'night' : 'day'}
            selectable={selectable}
            selected={phase === 'vote' && myVote === seat.id}
            badge={badge}
            pins={phase === 'vote' || trial ? pins(seat.id) : undefined}
            spotlight={(trial || phase === 'verdict') && view.accused === seat.id}
            dim={trial && view.accused !== seat.id}
            bubble={talking ? bubble(seat.id) : null}
            onPick={() => act('vote', { target: seat.id })}
          />
        )
      })}
      {/* Red string, voter to accused. */}
      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
        {strings.map((s) => (
          <g key={s.key}>
            <path
              d={`M${s.from.x},${s.from.y} Q${(s.from.x + s.to.x) / 2},${Math.max(s.from.y, s.to.y) + 40} ${s.to.x},${s.to.y}`}
              fill="none"
              stroke="#b3261e"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={trial ? 0.4 : 0.85}
            />
            <circle cx={s.to.x} cy={s.to.y} r="4.5" fill="#d43a2f" stroke="#2a0807" strokeWidth="1.5" />
            <circle cx={s.from.x} cy={s.from.y} r="3" fill="#b3261e" />
          </g>
        ))}
      </svg>
    </div>
  )

  /* ── the move panel: what you are choosing, and what it means ───────── */

  const ask = me ? NIGHT_ASK[me.role] : null
  const movePanel = acting && (phase === 'night' || phase === 'vote') && (
    <div className="noir-paper noir-paper-edge w-full rounded-sm px-4 py-4 sm:px-5">
      {phase === 'night' && ask && (
        <>
          <p className="font-type text-[0.74rem] uppercase tracking-[0.22em] text-[#6a5638]">
            {ROLE_TITLE[me.role]} · night {view.round}
          </p>
          <p className="font-deco text-[1.35rem] leading-tight text-[#1c140b]">{ask.title}</p>
          <p className="font-type mt-1 text-[0.86rem] text-[#5a4a35]">{ask.hint}</p>
          <TargetGrid
            targets={nightTargets}
            chosen={me.pick}
            verb={ask.verb}
            red={isFamily(me.role)}
            character={character}
            note={(id) => (familyPick(id).length ? `${familyPick(id).join(', ')} agree` : null)}
            onChoose={(id) => act('pick', { target: id })}
          />
        </>
      )}
      {phase === 'vote' && (
        <>
          <p className="font-type text-[0.74rem] uppercase tracking-[0.22em] text-[#6a5638]">Day {view.round} · nominations</p>
          <p className="font-deco text-[1.35rem] leading-tight text-[#1c140b]">Who stands trial?</p>
          <p className="font-type mt-1 text-[0.86rem] leading-snug text-[#5a4a35]">
            The most-named goes on trial, if they beat “no one”. They get 25 seconds to defend themselves, then the town says guilty or innocent.
          </p>
          <div className="lg:hidden">
            <TargetGrid
              targets={voteTargets}
              chosen={typeof myVote === 'string' ? myVote : null}
              verb="Accuse"
              red
              character={character}
              note={(id) => (pins(id).length ? `${pins(id).length} vote${pins(id).length === 1 ? '' : 's'}` : null)}
              onChoose={(id) => act('vote', { target: id })}
            />
          </div>
          <p className="font-type mt-3 hidden text-[0.86rem] text-[#3a2c1c] lg:block">
            {typeof myVote === 'string'
              ? `You named ${firstName(seatById(myVote))}${pins(myVote).length > 1 ? `, with ${pins(myVote).length - 1} other${pins(myVote).length === 2 ? '' : 's'}` : ''}. Tap another photograph to change.`
              : 'Tap a photograph to name them.'}
          </p>
        </>
      )}
    </div>
  )

  /* ── the decision bar: your current choice, always in view ──────────── */

  const neededReady = Math.floor(alive.length / 2) + 1
  const soloWithAIs = alive.filter((p) => !p.bot).length === 1 && alive.some((p) => p.bot)
  const decision = (() => {
    if (!me || phase === 'over' || phase === 'deal' || phase === 'hush') return null
    if (phase === 'dawn' || phase === 'verdict') {
      const done = view.next.includes(me.id)
      const coming = phase === 'dawn' ? 'the day' : 'nightfall'
      return {
        line: done ? 'Waiting for the others…' : phase === 'dawn' ? 'Read the morning paper' : 'The verdict is in',
        hint: done ? `On to ${coming} once everyone is ready, or when the clock runs out` : `Take your time — tap Continue when you’re ready for ${coming}`,
        action: (
          <BarButton on={done} onClick={() => act('next')}>
            {done ? 'Ready' : 'Continue'}
          </BarButton>
        ),
      }
    }
    if (!me.alive) return { line: 'You are a ghost', hint: 'You see every card. Make your prediction in the dossier.', action: null }
    if (phase === 'night' && ask) {
      const pick = seatById(me.pick)
      return {
        line: pick ? `${ask.doing} ${firstName(pick)}` : `Tap a name to ${ask.verb.toLowerCase()}`,
        hint: pick
          ? `You can change this until night ends · ${view.night?.chosen ?? 0} of ${view.night?.of ?? 0} have chosen`
          : 'Everyone chooses someone at night, so nobody gives themselves away',
        action: null,
      }
    }
    if (phase === 'day') {
      const ready = view.ready.includes(me.id)
      return {
        line: ready ? 'Ready to vote' : 'Talk it out',
        hint: soloWithAIs
          ? ready
            ? 'The AIs are wrapping up — the vote opens in a moment'
            : 'Question the AIs in table talk. Tap Ready when you want to vote — they follow your lead'
          : ready
            ? `Waiting for the others · ${view.ready.length} of ${neededReady} needed`
            : `Nominations start when ${neededReady} are ready, or when the clock runs out`,
        action: <BarButton on={ready} onClick={() => act('ready')}>{ready ? 'Not yet' : 'Ready to vote'}</BarButton>,
      }
    }
    if (phase === 'vote') {
      return {
        line: myVote === undefined ? 'Name someone, or no one' : myVote === null ? 'Voting for no one' : `Accusing ${firstName(seatById(myVote))}`,
        hint:
          myVote === undefined
            ? 'The vote closes when the clock runs out'
            : `You can change this until the vote closes · ${Object.keys(view.votes).length} of ${alive.length} have voted`,
        action: (
          <BarButton on={myVote === null} tone="ink" onClick={() => act('vote', { target: null })}>
            No one
          </BarButton>
        ),
      }
    }
    if (phase === 'defence') {
      return iAmAccused
        ? { line: 'Your defence', hint: 'Talk now — the town is listening. Then they decide.', action: <BarButton onClick={() => act('done')}>I rest my case</BarButton> }
        : { line: `Listen to ${firstName(accused)}`, hint: 'You will judge them next: guilty or innocent', action: null }
    }
    if (phase === 'judgement') {
      if (iAmAccused) return { line: 'The town is deciding', hint: `${view.judgement?.done ?? 0} of ${view.judgement?.of ?? 0} have decided`, action: null }
      return {
        line: me.judged === null ? `Is ${firstName(accused)} guilty?` : me.judged ? `You say ${firstName(accused)} is guilty` : `You say ${firstName(accused)} is innocent`,
        hint:
          me.judged === null
            ? 'A tie, and they walk free'
            : `You can change this until the clock runs out · ${view.judgement?.done ?? 0} of ${view.judgement?.of ?? 0} decided`,
        action: (
          <div className="flex gap-1.5">
            <BarButton on={me.judged === true} tone="blood" onClick={() => act('judge', { guilty: true })}>
              Guilty
            </BarButton>
            <BarButton on={me.judged === false} tone="green" onClick={() => act('judge', { guilty: false })}>
              Innocent
            </BarButton>
          </div>
        ),
      }
    }
    return null
  })()

  /* The Inspector's telegram at dawn — and again, any time, in the dossier. */
  const file = me?.role === 'detective' && phase === 'dawn' ? me.files.find((f) => f.round === view.round) : undefined
  const telegram = file && (
    <motion.div initial={{ y: 40, opacity: 0, rotate: 3 }} animate={{ y: 0, opacity: 1, rotate: 1.5 }} transition={{ delay: 1.2 }} className="noir-paper mx-auto mt-4 w-full max-w-[23rem] rounded-sm px-4 py-3">
      <p className="font-type text-[0.72rem] uppercase tracking-[0.22em] text-[#6a5638]">Telegram · for the Inspector only</p>
      <p className="font-type mt-1 text-[1rem] text-[#1c140b]">
        FILE ON {firstName(seatById(file.target)).toUpperCase()} STOP {file.family ? 'WORKS FOR THE FAMILY' : 'NO FAMILY CONNECTION FOUND'} STOP
      </p>
      {!file.family && view.options.godfather && view.players.length >= 7 && (
        <p className="font-type mt-1 text-[0.78rem] text-[#6a5638]">Remember: the Godfather can come back clean.</p>
      )}
      <p className="font-type mt-1 text-[0.74rem] text-[#6a5638]">Kept in your dossier.</p>
    </motion.div>
  )

  /* ── centre stage, by phase ─────────────────────────────────────────── */

  const victim = seatById(view.dawn?.victim)
  const verdictSeat = seatById(view.verdict?.target)

  const centre = (
    <AnimatePresence mode="wait">
      {phase === 'deal' && (
        <motion.div key="deal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-4 [@media(max-height:520px)]:gap-2 [@media(max-height:520px)]:py-1">
          {me ? (
            <>
              <p className="font-type text-[0.82rem] uppercase tracking-[0.3em] text-[var(--noir-brass)]">{presence === 'table' ? 'Hold your card to look. Tell no one.' : 'Your card. Tell no one.'}</p>
              <RoleCard role={me.role} title={me.title} line={me.line} hold={presence === 'table'} onSeen={() => act('seen')} />
              {/* Only once the card is turned — before that, the line would give the card away. */}
              {isFamily(me.role) && me.seen && (
                <p className="font-type max-w-xs text-center text-[0.88rem] text-[var(--noir-paper-dim)]">
                  The Family: {view.players.filter((p) => isFamily(p.role) && p.id !== me.id).map((p) => firstName(p)).join(', ') || 'just you — work alone'}
                </p>
              )}
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="font-deco text-[1.8rem] text-[var(--noir-paper)]">The cards are dealt</p>
              <p className="font-type mt-2 text-[0.9rem] text-[var(--noir-paper-dim)]">Everyone is looking at their own. Night falls soon.</p>
            </div>
          )}
        </motion.div>
      )}
      {phase === 'hush' && (
        <motion.div key="hush" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-12 text-center">
          {view.after === 'dawn' ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} className="size-24 rounded-full border-[6px] border-dashed border-[var(--noir-paper-dim)]/60" />
              <p className="font-deco text-[1.7rem] text-[var(--noir-paper)]">Stop the presses…</p>
              <p className="font-type text-[0.9rem] text-[var(--noir-paper-dim)]">The morning edition is being printed.</p>
            </>
          ) : (
            <>
              <p className="font-deco text-[1.7rem] text-[var(--noir-paper)]">The votes are counted…</p>
              <p className="font-type text-[0.9rem] text-[var(--noir-paper-dim)]">Nobody moves.</p>
            </>
          )}
        </motion.div>
      )}
      {phase === 'dawn' && (
        <motion.div key={`dawn-${view.round}`} className="py-4" exit={{ opacity: 0 }}>
          <Newspaper
            round={view.round}
            headline={view.narration?.headline ?? (victim ? `${firstName(victim).toUpperCase()} FOUND DEAD` : 'A NIGHT WITHOUT BLOOD')}
            fact={victim ? `${victim.name} is dead.` : view.dawn?.saved ? 'Nobody died — someone was saved.' : 'Nobody died.'}
            story={view.narration?.text ?? ''}
            photo={victim ? <Portrait name={victim.name} character={character(victim.id)} className="aspect-[3/4] w-full rounded-sm" /> : undefined}
          />
          {telegram}
        </motion.div>
      )}
      {phase === 'verdict' && (
        <motion.div key={`verdict-${view.round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6 [@media(max-height:520px)]:gap-2 [@media(max-height:520px)]:py-1">
          {view.verdict?.target && verdictSeat ? (
            view.verdict.hanged ? (
              <>
                <p className="font-type text-[0.82rem] uppercase tracking-[0.3em] text-[var(--noir-brass)]">
                  {firstName(verdictSeat)} is hanged · {view.verdict.guilty}–{view.verdict.innocent}
                </p>
                {view.verdict.role ? (
                  <div className="relative">
                    <RoleCard role={view.verdict.role} title={ROLE_TITLE[view.verdict.role]} line="" shown className="w-[clamp(4.5rem,calc((100dvh-17rem)*0.7),14rem)] sm:w-[clamp(4.5rem,calc((100dvh-17rem)*0.7),16rem)]" />
                    <motion.span
                      initial={{ scale: 2.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.9 }}
                      transition={{ delay: 0.7, type: 'spring', stiffness: 220, damping: 12 }}
                      className="noir-stamp absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-[#efe3c8]/80 px-3 py-1 text-[1.4rem] [@media(max-height:520px)]:px-2 [@media(max-height:520px)]:text-[0.95rem]"
                      style={{ color: view.verdict.jester ? '#6b3fa0' : isFamily(view.verdict.role) ? 'var(--noir-blood)' : '#1f5a3a' }}
                    >
                      {view.verdict.jester ? 'THE JESTER' : isFamily(view.verdict.role) ? 'FAMILY' : 'INNOCENT'}
                    </motion.span>
                  </div>
                ) : (
                  <p className="font-deco text-center text-[1.6rem] text-[var(--noir-paper)]">…and takes their secret with them.</p>
                )}
              </>
            ) : (
              <>
                <Portrait name={verdictSeat.name} character={character(verdictSeat.id)} className="aspect-[3/4] w-36 rounded-sm noir-frame [@media(max-height:520px)]:w-24" />
                <p className="font-deco text-center text-[1.8rem] text-[var(--noir-paper)]">{firstName(verdictSeat)} walks free</p>
                <p className="font-type text-[0.9rem] text-[var(--noir-paper-dim)]">
                  {view.verdict.innocent}–{view.verdict.guilty} {view.verdict.innocent === view.verdict.guilty ? '· a tie goes to the accused' : 'for innocent'}
                </p>
              </>
            )
          ) : (
            <>
              <p className="font-deco text-center text-[1.8rem] text-[var(--noir-paper)]">No one stands trial today.</p>
              <p className="font-type text-[0.9rem] text-[var(--noir-paper-dim)]">The town could not agree on a name.</p>
            </>
          )}
        </motion.div>
      )}
      {phase === 'over' && (
        <motion.div key="over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
          <CaseFile view={full} selfId={selfId} isHost={isHost} onPlayAgain={onPlayAgain} onLeave={onLeave} onBluff={(target) => act('bluff', { target })} />
        </motion.div>
      )}
    </AnimatePresence>
  )

  /* ── chat: the Family's whispers, or the ghosts' ────────────────────── */

  /* Not during the deal: a chat box appearing would tell the whole room what your card says. */
  const whispering = !!me && me.alive && isFamily(me.role) && phase !== 'over' && phase !== 'deal'
  const haunting = !!me && !me.alive && phase !== 'over'
  const chat = (whispering || haunting) && (
    <Whispers
      title={whispering ? 'The Family · only you can read this' : 'The afterlife · only the dead can read this'}
      lines={(whispering ? view.whispers : view.ghosts).map((w) => ({ ...w, who: firstName(seatById(w.by)) }))}
      onSend={(text) => act(whispering ? 'whisper' : 'ghost', { text })}
      ghost={haunting}
    />
  )
  const prediction = haunting && me && (
    <div className="noir-paper rounded-sm px-4 py-3">
      <p className="font-type text-[0.74rem] uppercase tracking-[0.22em] text-[#6a5638]">Call the ending</p>
      <p className="font-type text-[0.86rem] text-[#3a2c1c]">Who wins? Revealed in the case file.</p>
      <Predict value={me.prediction} onPredict={(winner) => act('predict', { winner })} jester={view.options.jester} />
    </div>
  )

  const talkFeed = hasBots && talking && layout !== 'square' && (
    <TableTalk
      lines={view.talk.map((t) => ({ ...t, who: firstName(seatById(t.by)), bot: !!seatById(t.by)?.bot }))}
      thinking={view.thinking.filter((id) => seatById(id)?.alive).map((id) => firstName(seatById(id)))}
      canSpeak={!!me?.alive}
      onSay={(text) => act('say', { text })}
      hear={{ on: hearOn, toggle: toggleHear, listening: hearing.listening, denied: hearing.denied, muted: !!mutedNow }}
    />
  )

  /* ── the frame ──────────────────────────────────────────────────────── */

  const showCentre = phase === 'deal' || phase === 'hush' || phase === 'dawn' || phase === 'verdict' || phase === 'over'
  const showWall = layout === 'seats' && !showCentre
  const aside = movePanel || chat || prediction || talkFeed
  const endsNeeded = Math.floor(view.players.length / 2) + 1

  return (
    <div className="noir noir-room relative isolate flex h-full min-h-0 w-full flex-col overflow-clip" data-mood={mood}>
      <div className="noir-grain" aria-hidden />
      <div className="noir-rain" data-on={phase === 'night' || phase === 'deal'} aria-hidden />
      {mood === 'night' && <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-[#03060c] opacity-90" />}

      {/* The top bar: where we are, the clock, the switches. */}
      <header className="relative z-20 flex shrink-0 items-center gap-2 px-3 pb-2 pt-2 sm:gap-3 sm:px-6 [@media(max-height:520px)]:py-1">
        <div className="min-w-0 flex-1">
          <p className="font-type truncate text-[0.74rem] uppercase tracking-[0.24em] text-[var(--noir-brass)] [@media(max-height:520px)]:text-[0.66rem]">
            {phase === 'over' || view.round === 0 ? 'Bombay · 1956' : `${mood === 'night' ? 'Night' : 'Day'} ${view.round}`}
            {layout === 'square' && ' · town square'}
            {me && !me.alive && phase !== 'over' && ' · you are a ghost'}
          </p>
          <h2 className="font-deco truncate text-[1.15rem] leading-tight text-[var(--noir-paper)] min-[400px]:text-[1.3rem] sm:text-[1.9rem] [@media(max-height:520px)]:text-[1.2rem]">
            {phase === 'hush' ? (view.after === 'dawn' ? 'Morning' : 'The count') : PHASE_TITLE[phase]}
          </h2>
        </div>
        {clockTotal > 0 && left > 0 && <Clock left={left} total={clockTotal} paused={view.paused !== null} onTick={total > 0 ? tick : undefined} />}
        <div className="flex items-center gap-1.5">
          {me && phase !== 'over' && (
            <button
              type="button"
              onClick={() => setSheet('dossier')}
              className="font-type flex h-10 items-center gap-1.5 rounded-full border border-[var(--noir-brass)]/50 bg-black/40 px-3 text-[0.86rem] text-[var(--noir-paper)] outline-none hover:border-[var(--noir-brass)] focus-visible:ring-2 focus-visible:ring-[var(--noir-brass)]"
            >
              <FolderLock aria-hidden className="size-4 text-[var(--noir-brass)]" />
              <span className="hidden sm:inline">My dossier</span>
              <span className="sr-only sm:hidden">My dossier</span>
            </button>
          )}
          <IconButton label="The town's notebook" onClick={() => setSheet('notebook')} dot={view.ledger.length > 0}>
            <BookOpen className="size-4" />
          </IconButton>
          <IconButton label={soundOn ? 'Mute the narrator' : 'Unmute the narrator'} onClick={toggleSound} className={phase !== 'over' ? 'hidden sm:grid' : undefined}>
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </IconButton>
          {phase !== 'over' && (
            <div className="relative">
              <IconButton label="More" onClick={() => setMenu((m) => !m)} pressed={menu}>
                <MoreHorizontal className="size-4" />
              </IconButton>
              <AnimatePresence>
                {menu && (
                  <>
                    <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-30 cursor-default" onClick={() => setMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 z-40 w-64 rounded-md border border-[var(--noir-brass)]/40 bg-[#14100c] p-1.5 shadow-[0_18px_40px_-10px_rgba(0,0,0,.9)]"
                      role="menu"
                      onClick={() => setMenu(false)}
                    >
                      <MenuItem icon={soundOn ? VolumeX : Volume2} onClick={toggleSound} className="sm:hidden">
                        {soundOn ? 'Mute the narrator' : 'Unmute the narrator'}
                      </MenuItem>
                      {isHost && (
                        <MenuItem icon={view.paused !== null ? Play : Pause} onClick={() => act(view.paused !== null ? 'resume' : 'pause')}>
                          {view.paused !== null ? 'Resume the game' : 'Pause the game'}
                        </MenuItem>
                      )}
                      {full.me && (
                        <MenuItem icon={presence === 'online' ? Armchair : Wifi} onClick={() => act('presence', { mode: presence === 'online' ? 'table' : 'online' })}>
                          {presence === 'online' ? 'I’m sitting at the table' : 'I’m playing online'}
                        </MenuItem>
                      )}
                      {full.me && (
                        <MenuItem icon={MonitorSpeaker} onClick={toggleSquare}>
                          {squareHere ? 'Back to my own screen' : 'Use this screen as the town square'}
                        </MenuItem>
                      )}
                      {layout === 'seats' && !onCall && call && (
                        <MenuItem icon={Video} onClick={() => void call.join()}>
                          Join the room call
                        </MenuItem>
                      )}
                      {full.me && !isHost && (
                        <MenuItem icon={Flag} onClick={() => act('end')} disabled={full.me.endVote}>
                          {full.me.endVote ? `Asked to end · ${view.endVotes} of ${endsNeeded}` : `Ask to end the game${view.endVotes ? ` · ${view.endVotes} of ${endsNeeded}` : ''}`}
                        </MenuItem>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      {(view.paused !== null || (view.endVotes > 0 && phase !== 'over')) && (
        <div className="font-type relative z-10 mx-auto mb-2 rounded-sm bg-black/70 px-4 py-1.5 text-center text-[0.86rem] text-[var(--noir-brass)]">
          {view.paused !== null ? 'The host has paused the game. Nothing can be chosen until it resumes.' : `${view.endVotes} of ${endsNeeded} want to end the game.`}
        </div>
      )}

      {/* The body. */}
      {/* Room inside the edges for the photographs' brass frames and their lift on hover — nothing gets sliced off. */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-2 sm:px-6" data-lenis-prevent>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {showCentre && centre}
            {trial && accused && layout !== 'square' && (
              <p className="font-deco text-center text-[1.2rem] leading-tight text-[var(--noir-paper)] sm:text-[1.6rem]">
                {phase === 'defence' ? `${firstName(accused)} makes their case` : `Guilty or innocent? ${view.judgement?.done ?? 0} of ${view.judgement?.of ?? 0} have decided`}
              </p>
            )}
            {trial && accused && view.plea && (
              <motion.blockquote
                key={view.plea}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="noir-paper noir-paper-edge mx-auto w-full max-w-2xl rounded-sm px-4 py-3 sm:px-5"
              >
                <p className="font-type text-[0.72rem] uppercase tracking-[0.22em] text-[#6a5638]">{firstName(accused)}’s defence</p>
                <p className="font-old mt-1 text-[1rem] italic leading-relaxed text-[#1c140b] sm:text-[1.1rem]">“{view.plea}”</p>
              </motion.blockquote>
            )}
            {showWall && seatWall}
            {layout === 'square' && !showCentre && <TownSquare view={view} />}
            {layout === 'pocket' && !showCentre && me && !aside && (
              <div className="flex flex-col items-center gap-3">
                <RoleCard role={me.role} title={me.title} line={me.line} hold className="w-40 sm:w-48" />
                <p className="font-type text-[0.86rem] text-[var(--noir-paper-dim)]">Hold your card to look. Keep your phone close.</p>
              </div>
            )}
          </div>
          {aside && layout !== 'square' && (
            /* On a phone your move comes first, and by day the conversation does; the rest waits below the story. */
            <aside className={cn('flex w-full flex-col gap-3 lg:sticky lg:top-0 lg:order-none lg:w-[22rem] lg:shrink-0', movePanel || (talkFeed && phase === 'day') ? 'order-first' : 'order-last')}>
              {movePanel}
              {talkFeed}
              {prediction}
              {chat}
            </aside>
          )}
        </div>
      </div>

      {/* The narrator, in subtitles. */}
      {phase !== 'over' && phase !== 'dawn' && view.narration && (
        <div className="relative z-10 shrink-0 bg-[linear-gradient(0deg,rgba(0,0,0,.85),transparent)] pb-2 pt-4 [@media(max-height:520px)]:pb-1 [@media(max-height:520px)]:pt-1.5">
          <Subtitles id={view.narration.id} text={view.narration.text} />
        </div>
      )}

      {/* Your current choice, always in reach of a thumb. */}
      {decision && layout !== 'square' && (
        <div className="relative z-10 shrink-0 border-t border-[var(--noir-brass)]/30 bg-[#0d0a07]/95 px-3 py-2.5 sm:px-6 [@media(max-height:520px)]:py-1.5">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="font-type truncate text-[1rem] text-[var(--noir-paper)]">{decision.line}</p>
              <p className="font-type text-[0.78rem] leading-snug text-[var(--noir-paper-dim)] [@media(max-height:520px)]:hidden">{decision.hint}</p>
            </div>
            {decision.action && <div className="shrink-0">{decision.action}</div>}
          </div>
        </div>
      )}


      {me && (
        <DossierSheet view={view} open={sheet === 'dossier'} onClose={closeSheet} onPredict={(winner) => act('predict', { winner })} notes={notes} onNote={cycle} />
      )}
      <NotebookSheet view={view} open={sheet === 'notebook'} onClose={closeSheet} />
    </div>
  )
}

/* ── pieces used only here ───────────────────────────────────────────── */

function IconButton({ label, onClick, children, dot, pressed, className }: { label: string; onClick: () => void; children: React.ReactNode; dot?: boolean; pressed?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn('relative grid size-10 shrink-0 place-items-center rounded-full border border-[var(--noir-brass)]/40 bg-black/40 text-[var(--noir-paper)] outline-none transition-colors hover:border-[var(--noir-brass)] hover:text-[var(--noir-brass)] focus-visible:ring-2 focus-visible:ring-[var(--noir-brass)]', className)}
    >
      {children}
      {dot && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--noir-blood-bright)]" />}
    </button>
  )
}

function MenuItem({ icon: Icon, onClick, children, disabled, className }: { icon: typeof Play; onClick: () => void; children: React.ReactNode; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn('font-type flex min-h-11 w-full items-center gap-2.5 rounded-sm px-3 text-left text-[0.88rem] text-[var(--noir-paper)] outline-none hover:bg-white/5 focus-visible:bg-white/10 disabled:opacity-60', className)}
    >
      <Icon aria-hidden className="size-4 shrink-0 text-[var(--noir-brass)]" />
      {children}
    </button>
  )
}

/** Brass is the one obvious next step; the others are choices that fill in when they're yours. */
function BarButton({ on, tone = 'brass', onClick, children }: { on?: boolean; tone?: 'brass' | 'blood' | 'green' | 'ink'; onClick: () => void; children: React.ReactNode }) {
  const fill =
    tone === 'blood'
      ? 'bg-[var(--noir-blood)] border-[var(--noir-blood)] text-[#f7ead0]'
      : tone === 'green'
        ? 'bg-[#1f5a3a] border-[#1f5a3a] text-[#eaf5ea]'
        : tone === 'ink'
          ? 'bg-[var(--noir-paper)] border-[var(--noir-paper)] text-[#1c140b]'
          : 'bg-[var(--noir-brass)] border-[var(--noir-brass)] text-[#1c140b]'
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'font-type min-h-11 rounded-sm border px-4 text-[0.92rem] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white',
        on ? cn(fill, 'ring-2 ring-[var(--noir-paper)]/70') : tone === 'brass' ? fill : 'border-[var(--noir-paper-dim)]/50 bg-transparent text-[var(--noir-paper)] hover:bg-white/5',
      )}
    >
      {children}
    </motion.button>
  )
}

/** Mugshots to choose from: a tap picks, a tap on another changes your mind. */
function TargetGrid({
  targets,
  chosen,
  verb,
  red,
  character,
  note,
  onChoose,
}: {
  targets: SeatView[]
  chosen: string | null
  verb: string
  red: boolean
  character: (id: string) => Character | undefined
  note: (id: string) => string | null
  onChoose: (id: string) => void
}) {
  if (!targets.length) return <p className="font-type mt-3 text-[0.86rem] text-[#5a4a35]">Nobody to choose from.</p>
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 [@media(max-height:520px)]:grid-cols-5 [@media(max-height:520px)]:lg:grid-cols-4">
      {targets.map((t) => {
        const on = chosen === t.id
        return (
          <motion.button
            key={t.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChoose(t.id)}
            aria-pressed={on}
            aria-label={`${verb} ${t.name}`}
            className={cn('relative flex flex-col overflow-hidden rounded-sm border text-left outline-none focus-visible:ring-2 focus-visible:ring-[#2a2015]', on ? (red ? 'border-[var(--noir-blood)] ring-2 ring-[var(--noir-blood)]' : 'border-[#2a2015] ring-2 ring-[#2a2015]') : 'border-[#2a2015]/30')}
          >
            <Portrait name={t.name} character={character(t.id)} className="aspect-square w-full [@media(max-height:520px)]:aspect-[4/3]" />
            <span className="font-type truncate bg-[#efe3c8] px-1.5 py-1.5 text-[0.84rem] text-[#1c140b]">{callName(t.name)}</span>
            {t.bot && <span className="font-type absolute right-1 top-1 rounded-sm bg-[var(--noir-brass)] px-1 text-[0.62rem] font-bold text-[#1c140b]">AI</span>}
            {note(t.id) && <span className="font-type absolute left-1 top-1 rounded-sm bg-black/75 px-1.5 py-0.5 text-[0.7rem] text-[#f0d9a8]">{note(t.id)}</span>}
            {on && (
              <span className="noir-stamp absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#efe3c8]/85 px-1.5 text-[0.8rem]" style={{ color: red ? 'var(--noir-blood)' : '#1c140b' }}>
                {verb.toUpperCase()}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/** The town square, for a shared screen: public things only, big enough to read across a table. */
function TownSquare({ view }: { view: MafiaView }) {
  const alive = view.players.filter((p) => p.alive)
  const tallies = alive
    .map((p) => ({ p, n: Object.values(view.votes).filter((t) => t === p.id).length }))
    .filter((t) => t.n > 0)
    .sort((a, b) => b.n - a.n)
  const accused = view.players.find((p) => p.id === view.accused)
  const status =
    view.phase === 'night'
      ? `Eyes closed. ${view.night?.chosen ?? 0} of ${view.night?.of ?? 0} have chosen.`
      : view.phase === 'day'
        ? `Talk it out. ${view.ready.length} of ${Math.floor(alive.length / 2) + 1} ready to vote.`
        : view.phase === 'vote'
          ? `Nominations. ${Object.keys(view.votes).length} of ${alive.length} have voted.`
          : view.phase === 'defence' && accused
            ? `${callName(accused.name)} makes their case.`
            : view.phase === 'judgement' && accused
              ? `Guilty or innocent? ${view.judgement?.done ?? 0} of ${view.judgement?.of ?? 0} have decided.`
              : ''
  return (
    <div className="noir-paper noir-paper-edge mx-auto w-full max-w-3xl rounded-sm px-5 py-5 sm:px-7">
      <p className="font-type text-[0.78rem] uppercase tracking-[0.22em] text-[#6a5638]">The town square · {alive.length} still standing</p>
      <p className="font-deco mt-1 text-[1.6rem] leading-tight text-[#1c140b] sm:text-[2rem]">{status}</p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {view.players.map((p) => (
          <li
            key={p.id}
            className={cn(
              'font-type flex items-center justify-between gap-2 rounded-sm border border-[#2a2015]/20 px-2.5 py-2 text-[0.95rem]',
              !p.alive && 'opacity-60',
              p.id === view.accused && 'border-[var(--noir-blood)] bg-[var(--noir-blood)]/10',
            )}
          >
            <span className={cn('truncate', !p.alive && 'line-through')}>{callName(p.name)}</span>
            <span className="shrink-0 text-[0.72rem] uppercase text-[#6a5638]">
              {view.phase === 'day' && view.ready.includes(p.id) ? 'ready' : p.role && !p.alive ? ROLE_TITLE[p.role] : ''}
            </span>
          </li>
        ))}
      </ul>
      {(view.phase === 'vote' || view.phase === 'defence' || view.phase === 'judgement') && tallies.length > 0 && (
        <div className="mt-4">
          <p className="font-type text-[0.78rem] uppercase tracking-[0.22em] text-[#6a5638]">Named</p>
          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
            {tallies.map(({ p, n }) => (
              <p key={p.id} className="font-deco text-[1.3rem] text-[var(--noir-blood)]">
                {callName(p.name)} · {n}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** What's being said at the table — typed, heard, or from the AIs — and a way to join in. */
function TableTalk({
  lines,
  thinking,
  canSpeak,
  onSay,
  hear,
}: {
  lines: { by: string; who: string; text: string; at: number; kind: 'say' | 'heard' | 'bot'; bot: boolean }[]
  thinking: string[]
  canSpeak: boolean
  onSay: (text: string) => void
  hear: { on: boolean; toggle: () => void; listening: boolean; denied: boolean; muted: boolean }
}) {
  const [draft, setDraft] = useState('')
  const list = useRef<HTMLDivElement>(null)
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [lines.length, thinking.length])
  const status = !hear.on
    ? 'The AIs read what you type here.'
    : hear.denied
      ? 'Microphone blocked — allow it in the browser to be heard.'
      : hear.muted
        ? 'You are muted, so the AIs can’t hear you.'
        : hear.listening
          ? 'Listening — what you say reaches the AIs as text.'
          : 'The AIs hear you by day.'
  return (
    <div className="rounded-sm border border-[var(--noir-brass)]/35 bg-[#14100c]/90 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-type text-[0.74rem] uppercase tracking-[0.2em] text-[var(--noir-brass)]">Table talk</p>
        {canHear && canSpeak && (
          <button
            type="button"
            onClick={hear.toggle}
            aria-pressed={hear.on}
            className={cn(
              'font-type flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 text-[0.78rem] outline-none focus-visible:ring-2 focus-visible:ring-[var(--noir-brass)]',
              hear.on ? 'border-[var(--noir-blood-bright)]/60 bg-[var(--noir-blood)]/25 text-[var(--noir-paper)]' : 'border-[var(--noir-brass)]/40 text-[var(--noir-paper-dim)] hover:text-[var(--noir-paper)]',
            )}
          >
            {hear.on ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
            {hear.on && hear.listening && <span className="size-1.5 animate-pulse rounded-full bg-[var(--noir-blood-bright)]" />}
            Let the AIs hear me
          </button>
        )}
      </div>
      <div ref={list} className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1" data-lenis-prevent>
        {lines.length === 0 && thinking.length === 0 && <p className="font-type text-[0.84rem] text-[var(--noir-paper-dim)]/80">Nobody has said anything yet. Say something — the AIs answer when named.</p>}
        {lines.map((l) => (
          <p key={`${l.by}-${l.at}`} className="font-type text-[0.88rem] leading-snug text-[var(--noir-paper)]">
            <span className={l.bot ? 'text-[var(--noir-brass)]' : 'text-[#9fb4d8]'}>{l.who}</span>
            {l.kind === 'heard' && <Mic aria-label="said aloud" className="mx-1 inline size-3 text-[var(--noir-paper-dim)]" />}
            <span className="text-[var(--noir-paper-dim)]">: </span>
            {l.text}
          </p>
        ))}
        {thinking.length > 0 && <p className="font-type text-[0.8rem] italic text-[var(--noir-paper-dim)]">{thinking.join(', ')} {thinking.length === 1 ? 'is' : 'are'} thinking…</p>}
      </div>
      {canSpeak && (
        <form
          className="mt-2 flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            onSay(draft.trim())
            setDraft('')
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={240}
            placeholder="Say something to the table…"
            aria-label="Say something to the table"
            className="font-type min-h-11 min-w-0 flex-1 rounded-sm border border-[var(--noir-brass)]/30 bg-black/40 px-2.5 text-[0.9rem] text-[var(--noir-paper)] outline-none placeholder:text-[var(--noir-paper-dim)]/50 focus:border-[var(--noir-brass)]"
          />
          <button type="submit" aria-label="Say it" className="grid size-11 place-items-center rounded-sm bg-[var(--noir-brass)] text-[#1c140b] outline-none focus-visible:ring-2 focus-visible:ring-white">
            <Send className="size-4" />
          </button>
        </form>
      )}
      <p className="font-type mt-1.5 text-[0.74rem] text-[var(--noir-paper-dim)]/80">{status}</p>
    </div>
  )
}

/** A private channel: the Family's whispers, or the ghosts'. */
function Whispers({ title, lines, onSend, ghost }: { title: string; lines: { by: string; who: string; text: string; at: number }[]; onSend: (text: string) => void; ghost: boolean }) {
  const [draft, setDraft] = useState('')
  const list = useRef<HTMLDivElement>(null)
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight })
  }, [lines.length])
  return (
    <div className={cn('rounded-sm border px-3 py-3', ghost ? 'border-[#9fb4d8]/30 bg-[#0b1424]/80' : 'border-[var(--noir-blood)]/40 bg-[#1a0806]/80')}>
      <p className={cn('font-type text-[0.74rem] uppercase tracking-[0.2em]', ghost ? 'text-[#9fb4d8]' : 'text-[var(--noir-blood-bright)]')}>{title}</p>
      <div ref={list} className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1" data-lenis-prevent>
        {lines.length === 0 && <p className="font-type text-[0.84rem] text-[var(--noir-paper-dim)]/80">{ghost ? 'Say what you saw. The living can’t hear you.' : 'Plan quietly. The town can’t see this.'}</p>}
        {lines.map((l) => (
          <p key={`${l.by}-${l.at}`} className="font-type text-[0.88rem] leading-snug text-[var(--noir-paper)]">
            <span className={ghost ? 'text-[#9fb4d8]' : 'text-[var(--noir-blood-bright)]'}>{l.who}:</span> {l.text}
          </p>
        ))}
      </div>
      <form
        className="mt-2 flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          onSend(draft.trim())
          setDraft('')
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={240}
          placeholder={ghost ? 'Whisper from beyond…' : 'Whisper to the Family…'}
          aria-label={ghost ? 'Message the other ghosts' : 'Message the Family'}
          className="font-type min-h-11 min-w-0 flex-1 rounded-sm border border-[var(--noir-brass)]/30 bg-black/40 px-2.5 text-[0.9rem] text-[var(--noir-paper)] outline-none placeholder:text-[var(--noir-paper-dim)]/50 focus:border-[var(--noir-brass)]"
        />
        <button type="submit" aria-label="Send" className="grid size-11 place-items-center rounded-sm bg-[var(--noir-brass)] text-[#1c140b] outline-none focus-visible:ring-2 focus-visible:ring-white">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}
