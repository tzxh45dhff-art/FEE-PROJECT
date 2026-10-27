import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { CoverAmbience } from '@/features/music/CoverAmbience'
import { useGameSession } from '@/features/games/useGameSession'
import type { GamePlayer } from '@/features/games/types'
import { DrawSetup, DrawTable, type DrawView } from '@/features/party/DrawGame'
import { KnowMeSetup, KnowMeTable, type KnowMeView } from '@/features/party/KnowMe'
import { QuizTable, SongQuizSetup, TriviaSetup, type QuizView } from '@/features/party/Quiz'
import { GamePicker, type GameId } from '@/features/party/GamePicker'
import { TruthDareSetup, TruthDareTable, type TruthDareView } from '@/features/party/TruthDare'
import { useParty, type PartyState } from '@/features/party/useParty'
import { MafiaSetup } from '@/features/party/mafia/MafiaSetup'
import { MafiaTable } from '@/features/party/mafia/MafiaTable'
import type { MafiaOptions, MafiaView } from '@/features/party/mafia/types'
import type { useMeshCall } from '@/features/room-panel/useMeshCall'
import type { Character } from '@/lib/characters'
import { EndGameButton } from '@/features/party/EndGameButton'
import { GameDock } from './GameDock'
import { cn } from '@/lib/utils'
import { lazyChunk } from '@/lib/lazyChunk'
import { petCue } from '@/features/pet/petCues'
import type { GeoOptions, GeoView } from '@/features/party/geo/types'

const PenFightGame = lazyChunk(() => import('@/features/games/penfight/PenFightGame'))
const GeoSetup = lazyChunk(() => import('@/features/party/geo/GeoGame').then(m => ({ default: m.GeoSetup })))
const GeoTable = lazyChunk(() => import('@/features/party/geo/GeoGame').then(m => ({ default: m.GeoTable })))

const EASE = [0.16, 1, 0.3, 1] as const

/** Everyone standing in the room, as the lobby needs them. */
export type GameCandidate = { id: string; name: string; you: boolean; character?: Character }

/**
 * The Play stage.
 *
 * Same shape as Watch and Listen — full screen, portalled, opening out of the
 * control that summoned it — because it is the same kind of thing: an activity
 * the whole room is in, not a panel inside the hub.
 */
export function GamesStage({
  roomId,
  selfId,
  members,
  onClose,
  insetRight = 0,
  panelOpen = false,
  onTogglePanel,
  unread = 0,
  origin,
  call = null,
}: {
  roomId: string
  selfId: string | undefined
  members: GameCandidate[]
  onClose: () => void
  insetRight?: number
  panelOpen?: boolean
  onTogglePanel?: () => void
  unread?: number
  /** The control this opened from, so the reveal starts there. */
  origin?: DOMRect | null
  /** The room's call, for games played face to face (Mafia's table of faces). Never a new call. */
  call?: ReturnType<typeof useMeshCall> | null
}) {
  const { snapshot, connected, error: penError, send } = useGameSession(roomId, true)
  const party = useParty(roomId)
  const [screen, setScreen] = useState<GameId | 'picker'>('picker')
  const [songQuizStarting, setSongQuizStarting] = useState(false)
  const [geoStarting, setGeoStarting] = useState(false)
  const startGeo = async (options: GeoOptions) => {
    setGeoStarting(true)
    try { await party.start('geo', options) } finally { setGeoStarting(false) }
  }

  /*
   * When somebody starts a party game, everyone in Play is taken to it — the
   * room is one table. Only on the moment it starts, though: someone who backs
   * out to the picker afterwards is allowed to stay there.
   */
  const lastGame = useRef<string | null>(null)
  useEffect(() => {
    const game = party.party?.game ?? null
    if (game && game !== lastGame.current) setScreen(game as GameId)
    lastGame.current = game
  }, [party.party?.game])

  const lastPen = useRef<number | null>(null)
  useEffect(() => {
    if (snapshot && snapshot.epoch !== lastPen.current) setScreen('penfight')
    lastPen.current = snapshot?.epoch ?? null
  }, [snapshot])

  const seat = useMemo<0 | 1 | null>(() => {
    if (!snapshot || !selfId) return null
    const index = snapshot.players.findIndex((player) => player.id === selfId)
    return index === 0 || index === 1 ? index : null
  }, [snapshot, selfId])

  /* Watching rather than playing is a first-class way to be here: the room is
     already together, and two people playing is three people watching. */
  const spectating = snapshot !== null && seat === null
  const partyView = party.party?.view as { phase?: string; players?: GamePlayer[] } | undefined
  const partyRunning = !!party.party && partyView?.phase !== 'over'
  const penRunning = screen === 'penfight' && !!snapshot && snapshot.winner === null

  /* A pen fight decided: the pet cheers for you or sulks with you. */
  const penWinner = snapshot?.winner ?? null
  useEffect(() => {
    if (penWinner === null || seat === null || !snapshot) return
    petCue(penWinner === seat ? 'win' : 'lose', snapshot.players[penWinner]?.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penWinner])

  const opponents = members.filter((member) => !member.you)
  /* What each quiz was last started with, so "Play again" is one tap. */
  const quizOptions = useRef<Partial<Record<'trivia' | 'songquiz', unknown>>>({})
  const mafiaOptions = useRef<MafiaOptions | null>(null)
  const [mafiaStarting, setMafiaStarting] = useState(false)

  const revealX = origin ? `${Math.round(origin.left + origin.width / 2)}px` : '50%'
  const revealY = origin ? `${Math.round(origin.top + origin.height / 2)}px` : '50%'

  return createPortal(
    <motion.div
      className="fixed left-0 top-0 z-[135] flex flex-col overflow-hidden bg-void transition-[padding] duration-500 ease-glass"
      style={{
        width: '100vw',
        height: '100dvh',
        paddingRight: `${insetRight}rem`,
        ['--reveal-x' as string]: revealX,
        ['--reveal-y' as string]: revealY,
        animation: 'stage-reveal 0.62s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {screen === 'geo' ? <div className="pointer-events-none absolute inset-0 bg-[#091b15]" /> : <CoverAmbience palette={null} />}

      {/* No bar across the top: the game has the whole screen, and its controls live in a small dock on the left edge. */}
      <GameDock
        connected={connected}
        status={screen === 'penfight' && snapshot ? (spectating ? 'Watching' : 'Playing') : null}
        onAllGames={screen !== 'picker' ? () => setScreen('picker') : undefined}
        endGame={penRunning ? (
            <EndGameButton
              key={`pen-${snapshot.epoch}`}
              label="Pen fight"
              connected={connected}
              allowed={seat !== null}
              onEnd={async () => {
                return send('game:end')
              }}
            />
          ) : partyRunning ? (
            <EndGameButton
              key={`party-${party.party!.session ?? party.party!.game}`}
              label={party.party!.label}
              connected={connected}
              allowed={
                !!selfId &&
                /* Anyone playing can end it. */
                !!partyView?.players?.some((player) => player.id === selfId)
              }
              onEnd={() => party.party?.game === 'geo'
                ? party.act('end', { token: (party.party.view as GeoView).token, round: (party.party.view as GeoView).round, attempt: (party.party.view as GeoView).attempt }, 5000)
                : party.act('end')}
            />
          ) : null}
        onLeave={onClose}
        onChat={onTogglePanel}
        chatOpen={panelOpen}
        unread={unread}
      />

      {/* Marked so the page's smooth scrolling hands the wheel to this panel. */}
      <div data-lenis-prevent className={cn('relative z-10 min-h-0 flex-1', screen === 'penfight' || (screen === 'geo' && party.party?.game === 'geo') || (screen === 'draw' && party.party?.game === 'draw') ? 'overflow-hidden' : 'overflow-y-auto')}>
        {screen === 'picker' && (
          <GamePicker
            live={party.party?.game ?? null}
            liveLabel={party.party?.label ?? null}
            liveBy={party.party?.startedBy.name ?? null}
            members={members}
            onPick={setScreen}
          />
        )}

        {screen === 'geo' && <Suspense fallback={<div className="grid h-full place-items-center text-mist"><Loader2 className="size-6 animate-spin" /></div>}>
          {party.party?.game === 'geo' ? <GeoTable
            key={party.party.session}
            party={party.party as PartyState<GeoView>}
            selfId={selfId}
            act={(action, payload) => party.act(action, payload, 5000)}
            onJoin={() => void party.join()}
            presentIds={members.map(m => m.id)}
            onLeave={() => { void party.dismiss(); setScreen('picker') }}
            starting={geoStarting}
            onRematch={() => {
              const view = party.party!.view as GeoView
              return startGeo({ ...view.options, opponent: view.options.mode === 'duel' ? view.players.find(p => p.id !== selfId)?.id : undefined })
            }}
            error={party.error}
          /> : party.party ? <Busy label={party.party.label} onOpen={() => setScreen(party.party!.game as GameId)} /> :
            <GeoSetup people={members} selfId={selfId} starting={geoStarting} onStart={options => void startGeo(options)} error={party.error} />}
        </Suspense>}

        {screen === 'mafia' &&
          (party.party?.game === 'mafia' ? (
            <MafiaTable
              party={party.party as PartyState<MafiaView>}
              selfId={selfId}
              act={(action, payload) => void party.act(action, payload)}
              call={call}
              people={members}
              onLeave={() => {
                void party.dismiss()
                setScreen('picker')
              }}
              onPlayAgain={() => {
                if (mafiaOptions.current) void party.start('mafia', { ...mafiaOptions.current, rematch: true })
              }}
              onJoin={() => void party.join()}
              error={party.error}
            />
          ) : party.party ? (
            <Busy label={party.party.label} onOpen={() => setScreen(party.party!.game as GameId)} />
          ) : (
            <MafiaSetup
              players={members}
              error={party.error}
              starting={mafiaStarting}
              onStart={async (options) => {
                mafiaOptions.current = options
                setMafiaStarting(true)
                try {
                  await party.start('mafia', options)
                } finally {
                  setMafiaStarting(false)
                }
              }}
            />
          ))}

        {screen === 'truthdare' &&
          (party.party?.game === 'truthdare' ? (
            <TruthDareTable
              view={party.party.view as TruthDareView}
              selfId={selfId}
              error={party.error}
              act={(action, payload) => void party.act(action, payload)}
              onLeaveTable={() => {
                void party.dismiss()
                setScreen('picker')
              }}
            />
          ) : party.party ? (
            <Busy label={party.party.label} onOpen={() => setScreen(party.party!.game as GameId)} />
          ) : (
            <TruthDareSetup
              people={members.length}
              error={party.error}
              onStart={(options) => void party.start('truthdare', options)}
            />
          ))}

        {screen === 'draw' &&
          (party.party?.game === 'draw' ? (
            <DrawTable
              roomId={roomId}
              party={party.party as PartyState<DrawView>}
              selfId={selfId}
              error={party.error}
              act={(action, payload) => party.act(action, payload, 5000)}
              onLeaveTable={() => {
                void party.dismiss()
                setScreen('picker')
              }}
            />
          ) : party.party ? (
            <Busy label={party.party.label} onOpen={() => setScreen(party.party!.game as GameId)} />
          ) : (
            <DrawSetup people={members.length} error={party.error} onStart={(options) => party.start('draw', options)} />
          ))}

        {screen === 'knowme' &&
          (party.party?.game === 'knowme' ? (
            <KnowMeTable
              party={party.party as PartyState<KnowMeView>}
              selfId={selfId}
              error={party.error}
              act={(action, payload) => void party.act(action, payload)}
              onLeaveTable={() => {
                void party.dismiss()
                setScreen('picker')
              }}
            />
          ) : party.party ? (
            <Busy label={party.party.label} onOpen={() => setScreen(party.party!.game as GameId)} />
          ) : (
            <KnowMeSetup people={members.length} error={party.error} onStart={(options) => void party.start('knowme', options)} />
          ))}

        {(screen === 'trivia' || screen === 'songquiz') &&
          (party.party?.game === screen ? (
            <QuizTable
              party={party.party as PartyState<QuizView>}
              selfId={selfId}
              error={party.error}
              act={(action, payload) => void party.act(action, payload)}
              onJoin={() => void party.join()}
              onLeaveTable={() => {
                void party.dismiss()
                setScreen('picker')
              }}
              onPlayAgain={quizOptions.current[screen] ? () => void party.start(screen, quizOptions.current[screen]) : undefined}
            />
          ) : party.party ? (
            <Busy label={party.party.label} onOpen={() => setScreen(party.party!.game as GameId)} />
          ) : screen === 'trivia' ? (
            <TriviaSetup
              people={members.length}
              players={members}
              error={party.error}
              onStart={(options) => {
                quizOptions.current.trivia = options
                void party.start('trivia', options)
              }}
            />
          ) : (
            <SongQuizSetup
              people={members.length}
              players={members}
              error={party.error}
              starting={songQuizStarting}
              onStart={async (options) => {
                quizOptions.current.songquiz = options
                setSongQuizStarting(true)
                try {
                  await party.start('songquiz', options)
                } finally {
                  setSongQuizStarting(false)
                }
              }}
            />
          ))}

        {screen === 'penfight' && <Suspense fallback={<div className="grid h-full place-items-center text-mist"><Loader2 className="size-6 animate-spin" /></div>}>
          <PenFightGame snapshot={snapshot} selfId={selfId} opponents={opponents} connected={connected} error={penError} send={send} onBack={() => setScreen('picker')} />
        </Suspense>}
      </div>
    </motion.div>,
    document.body,
  )
}

/** Another party game is already on — one table per room. */
function Busy({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-display text-[1.4rem] font-semibold text-chalk">{label} is on right now</p>
      <p className="max-w-sm text-[0.88rem] text-mist">One game at a time in a room. Join that one, or end it first.</p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-2 rounded-full bg-chalk px-6 py-2.5 text-[0.85rem] font-semibold text-void outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        Go to {label}
      </button>
    </div>
  )
}
