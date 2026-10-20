import { useEffect, useState, type FormEvent } from 'react'
import { Check, Copy, Crown, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Room, RoomChanges, RoomVisibility } from '@/features/rooms/api'
import { ROOM_TYPE_OPTIONS, roomStyle } from '@/features/rooms/roomStyle'
import { VISIBILITY_OPTIONS } from '@/features/rooms/visibility'
import { cn } from '@/lib/utils'

/**
 * The room's own settings — its name, its kind, who can get in, and its code.
 *
 * Only the person who made the room can change them; everyone else sees the
 * same page read-only, with who to ask. Rendered inside the hub drawer, which
 * already carries the title and the glass, so this is just the content.
 */
export function RoomSettings({
  room,
  selfId,
  onSave,
}: {
  room: Room
  selfId: string | undefined
  onSave: (changes: RoomChanges) => Promise<Room>
}) {
  const owner = room.ownerId === selfId
  const ownerName = room.members.find((member) => member.id === room.ownerId)?.name ?? 'the owner'

  const [name, setName] = useState(room.name)
  const [type, setType] = useState(room.type)
  const [visibility, setVisibility] = useState<RoomVisibility>(room.visibility)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmCode, setConfirmCode] = useState(false)
  const [copied, setCopied] = useState(false)

  /* Someone else's save landed while this was open: show it. */
  useEffect(() => {
    setName(room.name)
    setType(room.type)
    setVisibility(room.visibility)
  }, [room.name, room.type, room.visibility])

  const dirty = name.trim() !== room.name || type !== room.type || visibility !== room.visibility

  async function save(changes: RoomChanges) {
    setBusy(true)
    setError(null)
    try {
      await onSave(changes)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 1800)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save that')
    } finally {
      setBusy(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!owner || busy || !dirty || !name.trim()) return
    void save({ name: name.trim(), type, visibility })
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${room.slug}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard blocked — the code is on screen to copy by hand. */
    }
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      {!owner && (
        <p className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[0.82rem] text-mist">
          <Crown aria-hidden className="size-4 shrink-0 text-amber-300" />
          Only {ownerName} can change these.
        </p>
      )}

      <label className="block">
        <span className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-mist">Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={48}
          disabled={!owner}
          className="mt-2 w-full rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-[0.92rem] text-chalk outline-none transition-colors placeholder:text-dusk focus:border-signal/50 disabled:opacity-70"
        />
      </label>

      <fieldset disabled={!owner}>
        <legend className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-mist">Kind of room</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROOM_TYPE_OPTIONS.map((option) => {
            const art = roomStyle(option.value)
            const selected = type === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                aria-pressed={selected}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.82rem] transition-all duration-300 disabled:cursor-default',
                  selected ? 'border-signal/60 bg-white/[0.07] text-chalk' : 'border-white/[0.08] bg-white/[0.02] text-mist enabled:hover:border-white/20 enabled:hover:text-chalk',
                  !owner && !selected && 'opacity-50',
                )}
              >
                <span className="size-3 rounded-full" style={{ backgroundImage: `linear-gradient(150deg, ${art.glow}, ${art.from})` }} />
                {option.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset disabled={!owner}>
        <legend className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-mist">Who can join</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {VISIBILITY_OPTIONS.map((option) => {
            const selected = visibility === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setVisibility(option.value)}
                aria-pressed={selected}
                className={cn(
                  'flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 disabled:cursor-default',
                  selected ? 'border-signal/60 bg-white/[0.07]' : 'border-white/[0.08] bg-white/[0.02] enabled:hover:border-white/20',
                  !owner && !selected && 'opacity-50',
                )}
              >
                <option.icon aria-hidden className={cn('mt-0.5 size-4 shrink-0', selected ? 'text-chalk' : 'text-mist')} />
                <span className="min-w-0">
                  <span className={cn('block text-[0.85rem] font-medium', selected ? 'text-chalk' : 'text-mist')}>{option.label}</span>
                  <span className="mt-0.5 block text-[0.74rem] leading-relaxed text-dusk">{option.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {owner && (
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" disabled={busy || !dirty || !name.trim()}>
            {busy ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
          </Button>
          {saved && <Check aria-hidden className="size-5 text-emerald-400" />}
        </div>
      )}

      {/* The way in. */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-mist">Room code</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate font-mono text-[1rem] text-chalk">{room.slug}</code>
          <button
            type="button"
            onClick={() => void copy()}
            className="flex items-center gap-1.5 rounded-full border border-white/12 px-3.5 py-2 text-[0.8rem] text-chalk transition-colors hover:bg-white/[0.07]"
          >
            {copied ? <Check aria-hidden className="size-4 text-emerald-400" /> : <Copy aria-hidden className="size-4" />}
            {copied ? 'Link copied' : 'Copy invite link'}
          </button>
        </div>
        {owner &&
          (confirmCode ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-signal/10 px-3 py-2.5 text-[0.8rem] text-chalk">
              <span className="flex-1">The current code and every link already sent will stop working.</span>
              <button type="button" onClick={() => setConfirmCode(false)} className="rounded-full px-3 py-1.5 text-mist hover:text-chalk">
                Keep it
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  await save({ newCode: true })
                  setConfirmCode(false)
                }}
                className="rounded-full bg-chalk px-3.5 py-1.5 font-semibold text-void disabled:opacity-50"
              >
                New code
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmCode(true)} className="mt-3 flex items-center gap-1.5 text-[0.78rem] text-mist hover:text-chalk">
              <RefreshCw aria-hidden className="size-3.5" /> Get a new code
            </button>
          ))}
      </section>

      {/* Who's in it. */}
      <section>
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-mist">
          People · {room.members.length}
        </p>
        <ul className="mt-3 space-y-1.5">
          {room.members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
              <span className="grid size-8 place-items-center rounded-full bg-white/10 text-[0.78rem] font-semibold text-chalk">{member.name.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1 truncate text-[0.88rem] text-chalk">
                {member.name}
                {member.id === selfId && <span className="text-dusk"> · you</span>}
              </span>
              {member.id === room.ownerId && <Crown aria-label="Owner" className="size-4 text-amber-300" />}
              <span
                aria-label={room.online.includes(member.id) ? 'Here now' : 'Away'}
                className={cn('size-2 rounded-full', room.online.includes(member.id) ? 'bg-emerald-400' : 'bg-white/15')}
              />
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <p role="alert" className="text-[0.85rem] text-signal-bright">
          {error}
        </p>
      )}
    </form>
  )
}
