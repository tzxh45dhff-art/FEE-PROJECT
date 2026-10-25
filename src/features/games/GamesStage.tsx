import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Gamepad2, Loader2, MessagesSquare, Trophy, WifiOff, X } from 'lucide-react'

import { CoverAmbience } from '@/features/music/CoverAmbience'
import { useGameSession } from '@/features/games/useGameSession'
import type { GamePlayer, WirePen } from '@/features/games/types'
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
import { usePageVisible } from '@/hooks/usePageVisible'
import { cn } from '@/lib/utils'
import { lazyChunk } from '@/lib/lazyChunk'
import { petCue } from '@/features/pet/petCues'

const PenFightTable = lazyChunk(() => import('@/features/games/penfight/PenFightTable'))

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
  const { snapshot, motion: live, connected, send } = useGameSession(roomId, true)
  const visible = usePageVisible()
  const party = useParty(roomId)
  const [screen, setScreen] = useState<GameId | 'picker'>('picker')
  const [songQuizStarting, setSongQuizStarting] = useState(false)

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

  const seat = useMemo<0 | 1 | null>(() => {
    if (!snapshot || !selfId) return null
    const index = snapshot.players.findIndex((player) => player.id === selfId)
    return index === 0 || index === 1 ? index : null
  }, [snapshot, selfId])

  /* Watching rather than playing is a first-class way to be here: the room is
     already together, and two people playing is three people watching. */
  const spectating = snapshot !== null && seat === null
  const myTurn = seat !== null && snapshot?.turn === seat && snapshot.winner === null
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

  const onMotion = useCallback(
    (pens: [WirePen, WirePen]) => send('game:motion', { pens }),
    [send],
  )
  const onSettled = useCallback(
    (pens: [WirePen, WirePen]) => send('game:settled', { pens }),
    [send],
  )

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
      <CoverAmbience palette={null} />

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 py-4">
        <span className="flex min-w-0 items-center gap-2">
          {screen !== 'picker' && (
            <button
              type="button"
              onClick={() => setScreen('picker')}
              aria-label="All games"
              className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-chalk outline-none backdrop-blur-md transition-colors hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:size-9"
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>
          )}
          {screen === 'penfight' && snapshot && (
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 backdrop-blur-md">
              <span className="size-1.5 animate-signal-pulse rounded-full bg-emerald-400" />
              <span className="text-[0.72rem] text-chalk">
                {spectating ? 'Watching' : 'Playing'}
              </span>
            </span>
          )}
          {!connected && (
            <span className="flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1.5 text-signal-bright">
              <WifiOff aria-hidden className="size-3.5" />
              <span className="text-[0.72rem]">Reconnecting…</span>
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {penRunning ? (
            <EndGameButton
              key={`pen-${snapshot.epoch}`}
              label="Pen fight"
              connected={connected}
              allowed={seat !== null}
              onEnd={async () => {
                send('game:end')
                return {}
              }}
            />
          ) : partyRunning ? (
            <EndGameButton
              key={`party-${party.party!.session ?? party.party!.game}`}
              label={party.party!.label}
              connected={connected}
              allowed={
                !!selfId &&
                !!partyView?.players?.some((player) => player.id === selfId) &&
                /* Mafia: the host ends it; anyone else asks the table, from the game's own menu. */
                (party.party!.game !== 'mafia' || (partyView as { host?: string } | null)?.host === selfId)
              }
              onEnd={() => party.act('end')}
            />
          ) : null}
          {onTogglePanel && (
            <button
              type="button"
              onClick={onTogglePanel}
              aria-label="Chat and call"
              aria-pressed={panelOpen}
              className={cn(
                'relative flex h-11 items-center gap-2 rounded-full border px-3.5 outline-none backdrop-blur-md sm:h-9 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                panelOpen
                  ? 'border-signal/50 bg-signal/15 text-chalk'
                  : 'border-white/10 bg-white/[0.04] text-chalk hover:bg-white/[0.1]',
              )}
            >
              <MessagesSquare aria-hidden className="size-4" />
              {unread > 0 && !panelOpen && (
                <span className="min-w-4 rounded-full bg-signal px-1 text-[0.62rem] font-semibold leading-4 text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Leave the game"
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-chalk outline-none backdrop-blur-md sm:size-9 transition-colors hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <X aria-hidden className="size-4" />
          </button>
        </span>
      </header>

      {/* Marked so the page's smooth scrolling hands the wheel to this panel. */}
      <div data-lenis-prevent className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        {screen === 'picker' && (
          <GamePicker
            live={party.party?.game ?? null}
            liveLabel={party.party?.label ?? null}
            liveBy={party.party?.startedBy.name ?? null}
            people={members.length}
            onPick={setScreen}
          />
        )}

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
              act={(action, payload) => void party.act(action, payload)}
              onLeaveTable={() => {
                void party.dismiss()
                setScreen('picker')
              }}
            />
          ) : party.party ? (
            <Busy label={party.party.label} onOpen={() => setScreen(party.party!.game as GameId)} />
          ) : (
            <DrawSetup people={members.length} error={party.error} onStart={(options) => void party.start('draw', options)} />
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

        {screen === 'penfight' && (
          <div className="flex h-full flex-col">
      {snapshot === null ? (
            <Lobby opponents={opponents} onStart={(opponent) => send('game:start', { opponent })} />
          ) : (
            <Match
              players={snapshot.players}
              scores={snapshot.scores}
              turn={snapshot.turn}
              winner={snapshot.winner}
              seat={seat}
              myTurn={myTurn}
              spectating={spectating}
            >
              <Suspense
                fallback={
                  <span className="grid h-full place-items-center text-[0.8rem] text-mist">
                    <Loader2 aria-hidden className="size-5 animate-spin" />
                  </span>
                }
              >
                <PenFightTable
                  pens={snapshot.pens}
                  seat={seat ?? 0}
                  myTurn={myTurn}
                  canPlay={seat !== null && snapshot.winner === null}
                  live={live}
                  onFlick={() => undefined}
                  onMotion={onMotion}
                  onSettled={onSettled}
                  paused={!visible}
                />
              </Suspense>
            </Match>
          )}
    
          {snapshot?.winner !== null && snapshot !== undefined && snapshot !== null && (
            <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center">
              <button
                type="button"
                onClick={() => send('game:end')}
                className="pointer-events-auto rounded-full bg-chalk px-5 py-2.5 text-[0.82rem] font-medium text-void outline-none transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                Clear the desk
              </button>
            </div>
          )}
          </div>
        )}
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

/** Nothing on the desk yet — pick who you are playing. */
function Lobby({
  opponents,
  onStart,
}: {
  opponents: GameCandidate[]
  onStart: (opponent: GamePlayer) => void
}) {
  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6">
      <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-chalk backdrop-blur-md">
        <Gamepad2 aria-hidden className="size-6" />
      </span>
      <h2 className="mt-5 font-display text-[1.6rem] font-semibold tracking-[-0.02em] text-chalk">
        Pen Fight
      </h2>
      <p className="mt-2 max-w-sm text-center text-[0.86rem] leading-relaxed text-mist">
        Pull your pen back and let go. Knock theirs off the desk to take the round — but flick
        too hard and yours goes over the edge instead. First to three.
      </p>

      {opponents.length === 0 ? (
        <p className="mt-7 rounded-card border border-dashed border-white/15 bg-white/[0.02] px-5 py-4 text-center text-[0.82rem] text-mist">
          Nobody else is in the room yet. Pen fight takes two.
        </p>
      ) : (
        <div className="mt-7 w-full max-w-sm">
          <span className="block text-center text-[0.68rem] uppercase tracking-[0.16em] text-dusk">
            Who are you playing?
          </span>
          <div className="mt-3 flex flex-col gap-2">
            {opponents.map((opponent) => (
              <button
                key={opponent.id}
                type="button"
                onClick={() => onStart({ id: opponent.id, name: opponent.name })}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left outline-none backdrop-blur-md transition-colors hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-[0.8rem] font-semibold text-chalk">
                  {opponent.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.9rem] text-chalk">
                  {opponent.name}
                </span>
                <span className="text-[0.72rem] text-dusk">Challenge</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** The desk, with the score above it and whose turn it is underneath. */
function Match({
  players,
  scores,
  turn,
  winner,
  seat,
  myTurn,
  spectating,
  children,
}: {
  players: [GamePlayer, GamePlayer]
  scores: [number, number]
  turn: 0 | 1
  winner: 0 | 1 | null
  seat: 0 | 1 | null
  myTurn: boolean
  spectating: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-center gap-5 px-6 pb-2">
        {players.map((player, index) => (
          <span key={player.id} className="flex items-center gap-2.5">
            <span
              className={cn(
                'size-2 rounded-full',
                index === 0 ? 'bg-[#2f6fd0]' : 'bg-[#d0452f]',
                turn === index && winner === null && 'animate-signal-pulse',
              )}
            />
            <span
              className={cn(
                'text-[0.82rem]',
                index === seat ? 'font-medium text-chalk' : 'text-mist',
              )}
            >
              {index === seat ? 'You' : player.name}
            </span>
            <span className="font-mono text-[1rem] tabular-nums text-chalk">
              {scores[index]}
            </span>
          </span>
        ))}
      </div>

      <div className="relative min-h-0 flex-1">{children}</div>

      <div className="flex h-14 shrink-0 items-center justify-center px-6">
        {winner !== null ? (
          <span className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 backdrop-blur-md">
            <Trophy aria-hidden className="size-4 text-amber-300" />
            <span className="text-[0.84rem] text-chalk">
              {winner === seat ? 'You win the desk' : `${players[winner].name} takes it`}
            </span>
          </span>
        ) : (
          <span className="text-[0.84rem] text-mist">
            {spectating
              ? `${players[turn].name} to flick`
              : myTurn
                ? 'Your turn — pull your pen back and let go'
                : `Waiting on ${players[turn].name}`}
          </span>
        )}
      </div>
    </div>
  )
}
