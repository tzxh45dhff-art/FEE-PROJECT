import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DoorOpen, LogOut, MessagesSquare, Plus, Settings2, Users } from 'lucide-react'

import { useAuth } from '@/features/auth/AuthContext'
import { ActivityStage } from '@/features/dashboard/hub/ActivityStage'
import { ACTIVITIES, type ActivityId } from '@/features/dashboard/hub/activities'
import { CharacterParty, type HubMember } from '@/features/dashboard/hub/CharacterParty'
import { Fireflies } from '@/features/dashboard/hub/Fireflies'
import { HubDrawer } from '@/features/dashboard/hub/HubDrawer'
import { HubRail, type RailItem } from '@/features/dashboard/hub/HubRail'
import { HubSettings } from '@/features/dashboard/hub/HubSettings'
import { RoomChip } from '@/features/dashboard/hub/RoomChip'
import { RoomList } from '@/features/dashboard/hub/RoomList'
import { SceneBackdrop } from '@/features/dashboard/hub/SceneBackdrop'
import { groundFor, usePreferences } from '@/features/dashboard/hub/usePreferences'
import { VoiceButton } from '@/features/dashboard/hub/VoiceButton'
import { CallInvite } from '@/features/room-panel/CallInvite'
import { RoomPanel, PANEL_WIDTH_REM } from '@/features/room-panel/RoomPanel'
import { useChat } from '@/features/room-panel/useChat'
import { useMeshCall } from '@/features/room-panel/useMeshCall'
import { useWatchPulse } from '@/features/watch/useWatchPulse'
import { WatchInvite } from '@/features/watch/WatchInvite'
import { WatchStage } from '@/features/watch/WatchStage'
import { CreateRoomForm } from '@/features/dashboard/components/CreateRoomForm'
import { usePresence, type Present } from '@/features/rooms/usePresence'
import { useRooms } from '@/features/rooms/useRooms'
import { useEntrance } from '@/features/transition/EntranceContext'
import { usePointerTilt } from '@/hooks/usePointerTilt'
import { characterFor, hasRoster } from '@/lib/characters'
import { findScene, hasScenes } from '@/lib/scenes'

const EASE = [0.16, 1, 0.3, 1] as const

/** How many people stand in the scene before the rest are only a count. */
const MAX_ON_STAGE = 5

type Panel = 'rooms' | 'create' | 'settings'

/**
 * The hub.
 *
 * One screen, fixed, no scroll. Everything the room can do is reachable from
 * where you stand, which is the whole premise — the moment this page scrolls it
 * stops reading as a place and starts reading as a document.
 *
 * Depth that genuinely needs a list (rooms, settings) goes into a drawer, so
 * scrolling always happens inside something that is visibly a panel.
 */
export function DashboardPage() {
  const { user } = useAuth()
  const { phase } = useEntrance()
  const { rooms, loading, error, create, join, setOnline } = useRooms()
  const { preferences, update } = usePreferences()
  const tilt = usePointerTilt()

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [activity, setActivity] = useState<ActivityId | null>(null)
  const [sideOpen, setSideOpen] = useState(false)

  /*
   * Chat and the call are mounted for as long as you are in the room, not for
   * as long as the panel is open — closing the panel must not drop the call or
   * stop messages arriving, it just hides them.
   */
  const chat = useChat(activeRoomId)
  const call = useMeshCall(activeRoomId)

  /* Nothing to talk to once you have left. */
  useEffect(() => {
    if (!activeRoomId) setSideOpen(false)
  }, [activeRoomId])

  const inset = sideOpen ? PANEL_WIDTH_REM : 0

  /*
   * Presence follows the room you are *standing in*, not every room you belong
   * to.
   *
   * The socket join is what puts you in the presence map, so subscribing to all
   * of them would mean anyone with the dashboard open counts as being in every
   * shared room at once — and the party around you would fill with people who
   * only had a tab open. Walking in is the signal.
   */
  const presenceRooms = useMemo(() => (activeRoomId ? [activeRoomId] : []), [activeRoomId])

  /**
   * Who is in the room right now, straight from presence.
   *
   * Kept separately from `room.members` on purpose. That list is fetched once
   * when the page loads, so anyone who joins the room afterwards is present but
   * missing from it — and filtering presence through a stale cache is what made
   * two people in the same room see different parties depending on who loaded
   * first. Presence carries names, so it can stand on its own.
   */
  const [roster, setRoster] = useState<Record<string, Present[]>>({})

  const handlePresence = useCallback(
    (roomId: string, present: Present[]) => {
      setRoster((current) => ({ ...current, [roomId]: present }))
      setOnline(
        roomId,
        present.map((person) => person.userId),
      )
    },
    [setOnline],
  )

  /* Resolved, not the raw preference — with nothing chosen the hub derives a
     character from your user id, and that is what others must be told. */
  const myCharacter = user ? characterFor(user.id, preferences.characterId)?.id : undefined

  usePresence(presenceRooms, handlePresence, myCharacter)

  /* Leaving stops the updates, so the last-known list would otherwise stick
     around and keep showing a live count for a room you walked out of. */
  const lastPresenced = useRef<string | null>(null)
  useEffect(() => {
    const previous = lastPresenced.current
    if (previous && previous !== activeRoomId) {
      setOnline(previous, [])
      setRoster((current) => ({ ...current, [previous]: [] }))
    }
    lastPresenced.current = activeRoomId
  }, [activeRoomId, setOnline])

  /* A fixed single screen. Locking the document is what stops a stray wheel
     event from revealing a strip of page under the hub. */
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const activeRoom = activeRoomId ? rooms.find((room) => room.id === activeRoomId) : undefined

  /* The room vanishing under you — deleted, or membership revoked — should put
     you back in the solo hub rather than leave a dangling id. */
  useEffect(() => {
    if (activeRoomId && !loading && !activeRoom) setActiveRoomId(null)
  }, [activeRoomId, activeRoom, loading])

  const scene = findScene(preferences.sceneId)

  const party = useMemo<HubMember[]>(() => {
    if (!user) return []

    const you: HubMember = {
      id: user.id,
      name: user.name,
      status: 'here',
      owner: activeRoom?.ownerId === user.id,
      you: true,
      character: characterFor(user.id, preferences.characterId),
    }

    if (!activeRoom) return [you]

    /* Ownership still comes from the room — presence knows who is here, not
       what they are to the room. */
    const others = (roster[activeRoom.id] ?? [])
      .filter((person) => person.userId !== user.id)
      .slice(0, MAX_ON_STAGE - 1)
      .map<HubMember>((person) => ({
        id: person.userId,
        name: person.name,
        status: 'here',
        owner: activeRoom.ownerId === person.userId,
        you: false,
        /* Their choice, carried on presence. Falls back to the id-derived one
           for anyone on an older client that isn't announcing it. */
        character: characterFor(person.userId, person.characterId),
      }))

    /* You stand in the middle of your own party rather than at one end. */
    const line = [...others]
    line.splice(Math.floor(line.length / 2), 0, you)
    return line
  }, [user, activeRoom, roster, preferences.characterId])

  /* Watching is a room event, not a private toggle — the hub has to know a
     session is live so it can badge the button and offer the way in. */
  const watch = useWatchPulse(activeRoomId)

  const leftItems: RailItem[] = activeRoom
    ? ACTIVITIES.map((entry) => ({
        key: entry.id,
        label: entry.label,
        hint:
          entry.id === 'watch' && watch.viewers.length > 0
            ? `${watch.viewers.length} watching`
            : entry.hint,
        icon: entry.icon,
        active: activity === entry.id,
        live: entry.id === 'watch' && watch.viewers.length > 0,
        onClick: () => setActivity(entry.id),
      }))
    : [
        {
          key: 'create',
          label: 'Create Room',
          hint: 'Start your own space',
          icon: Plus,
          onClick: () => setPanel('create'),
        },
        {
          key: 'join',
          label: 'Join Room',
          hint: rooms.length > 0 ? `${rooms.length} waiting` : 'Walk into one',
          icon: DoorOpen,
          onClick: () => setPanel('rooms'),
        },
      ]

  const rightItems: RailItem[] = [
    ...(activeRoom
      ? [
          {
            key: 'talk',
            label: 'Chat & call',
            hint:
              call.othersOnCall > 0
                ? `${call.othersOnCall} on the call`
                : chat.unread > 0
                  ? `${chat.unread} new`
                  : 'Talk to the room',
            icon: MessagesSquare,
            active: sideOpen,
            live: call.othersOnCall > 0 || chat.unread > 0,
            onClick: () => setSideOpen((open) => !open),
          } satisfies RailItem,
        ]
      : []),
    {
      key: 'rooms',
      label: activeRoom ? 'Switch room' : 'Your rooms',
      hint: activeRoom ? 'Somewhere else' : 'Everywhere you belong',
      icon: Users,
      onClick: () => setPanel('rooms'),
    },
    {
      key: 'settings',
      label: 'Settings',
      hint: 'Backdrop and character',
      icon: Settings2,
      onClick: () => setPanel('settings'),
    },
    ...(activeRoom
      ? [
          {
            key: 'leave',
            label: 'Leave',
            hint: 'Back to the hub',
            icon: LogOut,
            danger: true,
            onClick: () => {
              setActiveRoomId(null)
              setActivity(null)
            },
          } satisfies RailItem,
        ]
      : []),
  ]

  /* While the corridor plays the hub stays mounted but invisible, so the room
     fetch is already in flight by the time it hands off. */
  const revealed = phase !== 'tunnel'
  const needsAssets = !hasScenes || !hasRoster

  return (
    <motion.main
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: revealed ? 1 : 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <SceneBackdrop scene={scene} tilt={tilt} />
      <Fireflies className="pointer-events-none absolute inset-0 size-full" />

      {revealed && (
        <>
          <CharacterParty
            members={party}
            tilt={tilt}
            ground={groundFor(preferences, scene?.id)}
            insetRight={inset}
          />

          <HubRail side="left" items={leftItems} />
          <HubRail side="right" items={rightItems} insetRight={inset} />

          <div
            className="pointer-events-none absolute bottom-6 left-0 z-20 flex flex-wrap items-center justify-center gap-3 px-6 transition-[right] duration-500 ease-glass"
            style={{ right: `${inset}rem` }}
          >
            {activeRoom && (
              <>
                <RoomChip room={activeRoom} />
                <VoiceButton roomId={activeRoomId} />
              </>
            )}
          </div>

          {(error || needsAssets) && (
            <div className="pointer-events-none absolute bottom-6 left-6 z-20 hidden max-w-xs md:block">
              {error ? (
                <p
                  role="alert"
                  className="glass-pill-ink rounded-card px-4 py-3 text-[0.78rem] leading-relaxed text-signal-bright"
                >
                  {error}
                </p>
              ) : (
                <p className="glass-pill-ink rounded-card px-4 py-3 text-[0.78rem] leading-relaxed text-mist">
                  {!hasScenes && !hasRoster
                    ? 'No backdrops or characters yet — Settings shows where to drop them.'
                    : !hasScenes
                      ? 'No backdrops yet — Settings shows where to drop them.'
                      : 'No characters yet — Settings shows where to drop them.'}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {revealed && call.invite && !sideOpen && (
          <CallInvite
            key="call-invite"
            name={call.invite.name}
            onJoin={() => {
              setSideOpen(true)
              call.dismissInvite()
              void call.join()
            }}
            onDismiss={call.dismissInvite}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && watch.invite && activity !== 'watch' && (
          <WatchInvite
            key="watch-invite"
            name={watch.invite.name}
            onJoin={() => {
              setActivity('watch')
              watch.dismiss()
            }}
            onDismiss={watch.dismiss}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activity === 'watch' && activeRoom && (
          <WatchStage
            key="watch"
            roomId={activeRoom.id}
            selfId={user?.id}
            onClose={() => setActivity(null)}
            insetRight={inset}
            panelOpen={sideOpen}
            unread={chat.unread}
            onTogglePanel={() => setSideOpen((open) => !open)}
          />
        )}

        {/* The other three are still stubs, and say so rather than miming. */}
        {activity && activity !== 'watch' && (
          <ActivityStage id={activity} onClose={() => setActivity(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sideOpen && activeRoom && (
          <RoomPanel
            key="room-panel"
            chat={chat}
            call={call}
            selfId={user?.id}
            selfName={user?.name ?? 'You'}
            onClose={() => setSideOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {panel === 'rooms' && (
          <HubDrawer
            key="rooms"
            title="Your rooms"
            subtitle="Walk into one and everyone who's there stands with you."
            onClose={() => setPanel(null)}
          >
            {loading ? (
              <div className="h-40 animate-pulse rounded-card bg-white/[0.04]" />
            ) : (
              <RoomList
                rooms={rooms}
                activeRoomId={activeRoom?.id}
                onWalkIn={(room) => {
                  setActiveRoomId(room.id)
                  setActivity(null)
                  setPanel(null)
                }}
                onJoin={async (code) => {
                  const room = await join(code)
                  /* Straight in — you typed a code to be somewhere, not to add
                     a row to a list. */
                  setActiveRoomId(room.id)
                  setActivity(null)
                  setPanel(null)
                  return room
                }}
              />
            )}
          </HubDrawer>
        )}

        {panel === 'create' && (
          <HubDrawer
            key="create"
            title="Start something new"
            subtitle="It stays open after you close the tab."
            onClose={() => setPanel(null)}
          >
            <CreateRoomForm
              onCreate={async (input) => {
                const room = await create(input)
                /* Straight into it — creating a room and then having to find it
                   in a list is a step nobody wants. */
                setActiveRoomId(room.id)
                setPanel(null)
                return room
              }}
            />
          </HubDrawer>
        )}

        {panel === 'settings' && (
          <HubDrawer
            key="settings"
            title="Settings"
            subtitle="Yours, not the room's — everyone dresses their own hub."
            onClose={() => setPanel(null)}
          >
            <HubSettings
              preferences={preferences}
              onChange={update}
              activeCharacterId={
                user ? characterFor(user.id, preferences.characterId)?.id : undefined
              }
            />
          </HubDrawer>
        )}
      </AnimatePresence>
    </motion.main>
  )
}
