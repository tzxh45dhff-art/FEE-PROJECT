import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import type { Room } from '@/features/rooms/api'
import { roomStyle } from '@/features/rooms/roomStyle'

/**
 * Join by code.
 *
 * The code is the room's slug — the same string the room chip copies — so
 * pasting what someone sent you is the whole flow. Holding the code is the
 * permission; there is no separate invite record to look up.
 */
function JoinByCode({ onJoin }: { onJoin: (code: string) => Promise<Room> }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy || code.trim().length === 0) return

    setBusy(true)
    setError(null)
    try {
      await onJoin(code.trim())
      setCode('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not join that room')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <label className="block">
        <span className="text-[0.85rem] font-medium text-chalk">Have a code?</span>
        <span className="mt-1 block text-[0.78rem] leading-relaxed text-mist">
          Paste what someone sent you and you'll be standing with them.
        </span>
        <span className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="lake-house-1taf"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 font-mono text-[0.85rem] text-chalk outline-none transition-colors placeholder:text-dusk focus:border-signal/50"
          />
          <Button type="submit" size="sm" disabled={busy || code.trim().length === 0}>
            {busy ? 'Joining…' : 'Join'}
          </Button>
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-2.5 text-[0.8rem] text-signal-bright">
          {error}
        </p>
      )}
    </form>
  )
}

/** The rooms you belong to, as a way in — plus the door for rooms you don't. */
export function RoomList({
  rooms,
  activeRoomId,
  onWalkIn,
  onJoin,
}: {
  rooms: Room[]
  activeRoomId?: string
  onWalkIn: (room: Room) => void
  onJoin: (code: string) => Promise<Room>
}) {
  if (rooms.length === 0) {
    return (
      <>
        <JoinByCode onJoin={onJoin} />
        <div className="rounded-card border border-white/[0.08] bg-white/[0.02] px-5 py-10 text-center">
          <p className="font-display text-[1.05rem] font-semibold text-chalk">No rooms yet</p>
          <p className="mx-auto mt-2 max-w-xs text-[0.85rem] leading-relaxed text-mist">
            Create one and it stays open after you close the tab — that's the whole idea.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <JoinByCode onJoin={onJoin} />
      <ul className="flex flex-col gap-2.5">
      {rooms.map((room) => {
        const art = roomStyle(room.type)
        const online = room.online.length
        const active = room.id === activeRoomId

        return (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => onWalkIn(room)}
              className={[
                'group/room flex w-full items-center gap-4 rounded-card border px-4 py-3.5 text-left outline-none',
                'transition-[border-color,background-color] duration-400 ease-glass',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                active
                  ? 'border-signal/45 bg-signal/[0.07]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]',
              ].join(' ')}
            >
              <span
                aria-hidden
                className="size-10 shrink-0 rounded-full ring-1 ring-inset ring-white/15"
                style={{ backgroundImage: `linear-gradient(150deg, ${art.glow}, ${art.from})` }}
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[0.95rem] font-semibold tracking-[-0.015em] text-chalk">
                  {room.name}
                </span>
                <span className="block truncate text-[0.75rem] text-mist">
                  {art.name} · {room.members.length}{' '}
                  {room.members.length === 1 ? 'member' : 'members'}
                </span>
              </span>

              {online > 0 && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1">
                  <span className="size-1.5 animate-signal-pulse rounded-full bg-emerald-400" />
                  <span className="text-[0.66rem] font-medium text-chalk">{online}</span>
                </span>
              )}

              {active && (
                <span className="shrink-0 text-[0.66rem] uppercase tracking-[0.16em] text-signal-bright">
                  here
                </span>
              )}
            </button>
          </li>
          )
        })}
      </ul>
    </>
  )
}
