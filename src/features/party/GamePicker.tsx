import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

/**
 * What to play. One card per game, the live one badged so a person walking in
 * can see at a glance that something is already going and join it.
 */

export type GameId = 'truthdare' | 'draw' | 'knowme' | 'trivia' | 'songquiz' | 'penfight'

type Entry = {
  id: GameId
  title: string
  line: string
  players: string
  art: string
  tone: string
  ready: boolean
}

const GAMES: Entry[] = [
  { id: 'truthdare', title: 'Truth or dare', line: 'The game picks the questions. You pick how spicy.', players: '2+', art: '🍾', tone: 'from-red-500/35 via-rose-600/20 to-transparent', ready: true },
  { id: 'draw', title: 'Draw and guess', line: 'One draws, everyone races to guess.', players: '2+', art: '🎨', tone: 'from-amber-400/50 via-orange-500/20 to-transparent', ready: true },
  { id: 'knowme', title: 'How well do you know me?', line: 'Answer about yourself. They guess. Truth comes out.', players: '2+', art: '💞', tone: 'from-pink-400/50 via-fuchsia-500/20 to-transparent', ready: true },
  { id: 'trivia', title: 'Live trivia', line: 'Bollywood, cricket, films, everything. Fastest wins.', players: '1+', art: '🧠', tone: 'from-sky-400/50 via-indigo-500/20 to-transparent', ready: true },
  { id: 'songquiz', title: 'Guess the song', line: 'A few seconds of a track. Name it first.', players: '1+', art: '🎵', tone: 'from-emerald-400/50 via-teal-500/20 to-transparent', ready: true },
  { id: 'penfight', title: 'Pen fight', line: 'Flick your pen, knock theirs off the desk.', players: '2', art: '🖊️', tone: 'from-violet-400/50 via-purple-500/20 to-transparent', ready: true },
]

export function GamePicker({
  live,
  liveLabel,
  liveBy,
  people,
  onPick,
}: {
  live: string | null
  liveLabel: string | null
  liveBy: string | null
  people: number
  onPick: (id: GameId) => void
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-12 pt-2">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-signal-bright">Play</p>
      <h2 className="mt-1 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.03em] text-chalk">
        What are we playing?
      </h2>
      <p className="mt-1 text-[0.9rem] text-mist">
        {people <= 1 ? 'Most of these need someone else in the room — send them the code.' : `${people} in the room.`}
      </p>

      {live && liveLabel && (
        <button
          type="button"
          onClick={() => onPick(live as GameId)}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-left outline-none transition-colors hover:bg-emerald-400/15 focus-visible:outline-2 focus-visible:outline-signal"
        >
          <span className="size-2 animate-signal-pulse rounded-full bg-emerald-400" />
          <span className="text-[0.88rem] text-chalk">
            <span className="font-semibold">{liveLabel}</span> is on{liveBy ? ` — ${liveBy} started it` : ''}. Tap to join.
          </span>
        </button>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            type="button"
            disabled={!game.ready}
            onClick={() => onPick(game.id)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'group relative flex min-h-44 flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5 text-left outline-none transition-[transform,border-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
              game.ready ? 'hover:-translate-y-1 hover:border-white/25' : 'cursor-default opacity-55',
            )}
          >
            <span className={cn('absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity group-hover:opacity-100', game.tone)} />
            <span
              aria-hidden
              className="relative text-[2.4rem] leading-none transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
              style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}
            >
              {game.art}
            </span>
            <span className="relative mt-auto pt-6 font-display text-[1.2rem] font-semibold tracking-[-0.015em] text-chalk">
              {game.title}
            </span>
            <span className="relative mt-1 text-[0.82rem] leading-snug text-mist">{game.line}</span>
            <span className="relative mt-3 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-dusk">
              {game.players} players
              {live === game.id && <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-emerald-300">live</span>}
              {!game.ready && <span className="rounded-full bg-white/10 px-2 py-0.5 text-mist">soon</span>}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
