import type { Room } from '@/features/rooms/api'
import { roomStyle } from '@/features/rooms/roomStyle'

type Entry = { id: string; at: number; text: string; room: string; glow: string }

/**
 * Activity is derived from what the API actually stores — rooms and their
 * memberships. There is no events table yet, so this is a real feed of real
 * data rather than an invented one; it grows as more of the room features land.
 */
function buildFeed(rooms: Room[], currentUserId: string): Entry[] {
  const entries: Entry[] = []

  for (const room of rooms) {
    const art = roomStyle(room.type)

    entries.push({
      id: `${room.id}-created`,
      at: new Date(room.createdAt).getTime(),
      text: `${room.ownerId === currentUserId ? 'You' : 'Someone'} opened the room`,
      room: room.name,
      glow: art.glow,
    })

    for (const member of room.members) {
      if (member.role === 'owner') continue
      entries.push({
        id: `${room.id}-${member.id}`,
        at: new Date(member.joinedAt).getTime(),
        text: `${member.id === currentUserId ? 'You' : member.name} joined`,
        room: room.name,
        glow: art.glow,
      })
    }
  }

  return entries.sort((a, b) => b.at - a.at).slice(0, 8)
}

function when(at: number) {
  const minutes = Math.round((Date.now() - at) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function ActivityPanel({
  rooms,
  currentUserId,
}: {
  rooms: Room[]
  currentUserId: string
}) {
  const feed = buildFeed(rooms, currentUserId)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel rounded-card p-6 md:p-7">
        <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-chalk">
          Recent activity
        </h3>

        {feed.length === 0 ? (
          <p className="mt-4 text-[0.88rem] leading-relaxed text-mist">
            Nothing yet. Create a room and it shows up here.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {feed.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3">
                <span
                  className="mt-[0.4rem] size-2 shrink-0 rounded-full"
                  style={{ background: entry.glow }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.88rem] text-chalk">{entry.text}</p>
                  <p className="mt-0.5 truncate text-[0.75rem] text-dusk">
                    {entry.room} · {when(entry.at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel rounded-card p-6 md:p-7">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-chalk">
            Leaderboard
          </h3>
          <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-dusk">
            Coming next
          </span>
        </div>

        {/*
          Deliberately empty rather than filled with invented scores — games
          aren't built yet, so there are no results to rank.
        */}
        <p className="mt-4 text-[0.88rem] leading-relaxed text-mist">
          Once games are in, every result across every session lands here — one running
          scoreboard per room.
        </p>

        <ul className="mt-6 flex flex-col gap-3" aria-hidden>
          {[0, 1, 2].map((row) => (
            <li key={row} className="flex items-center gap-3 opacity-35">
              <span className="w-3 font-mono text-[0.7rem] text-dusk">{row + 1}</span>
              <span className="size-7 rounded-full bg-white/[0.06]" />
              <span className="h-2 flex-1 rounded-full bg-white/[0.06]" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
