import { motion } from 'framer-motion'

import type { RailItem } from '@/features/dashboard/hub/HubRail'
import { cn } from '@/lib/utils'

/**
 * The room's controls, as one slim column of icons on the right edge.
 *
 * Talking to the room comes first and is the only one that lights up — a
 * count for unread messages, a green dot while a call is live. Everything
 * else (who's here, switching room, settings) is something you do once a
 * visit, so it stays quiet; leaving sits apart at the bottom, in red, where
 * it is hard to hit by accident. Labels appear beside each icon on hover or
 * keyboard focus, on the side facing the room.
 */
export function HubDock({ items }: { items: RailItem[] }) {
  const main = items.filter((item) => !item.danger)
  const danger = items.filter((item) => item.danger)
  return (
    <motion.nav
      aria-label="Room"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-btn is-scrim pointer-events-auto flex flex-col items-center gap-1 rounded-full p-1.5"
    >
      {main.map((item, i) => (
        <div key={item.key} className="contents">
          <DockButton item={item} primary={i === 0} />
          {i === 0 && main.length > 1 && <span aria-hidden className="my-0.5 h-px w-6 bg-white/15" />}
        </div>
      ))}
      {danger.length > 0 && <span aria-hidden className="my-0.5 h-px w-6 bg-white/15" />}
      {danger.map((item) => (
        <DockButton key={item.key} item={item} />
      ))}
    </motion.nav>
  )
}

function DockButton({ item, primary = false }: { item: RailItem; primary?: boolean }) {
  const Icon = item.icon
  const count = item.badge ?? 0
  return (
    <button
      type="button"
      onClick={(event) => item.onClick(event.currentTarget.getBoundingClientRect())}
      aria-label={item.hint ? `${item.label} — ${item.hint}` : item.label}
      aria-pressed={item.active}
      className={cn(
        'group/dock relative grid size-11 place-items-center rounded-full outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal sm:size-10 [@media(max-height:520px)]:size-9',
        item.active
          ? 'bg-white/[0.16] text-chalk'
          : item.danger
            ? 'text-rose-300 hover:bg-rose-400/15 hover:text-rose-200'
            : primary
              ? 'bg-white/[0.08] text-chalk hover:bg-white/[0.14]'
              : 'text-mist hover:bg-white/[0.1] hover:text-chalk',
      )}
    >
      <Icon aria-hidden className={primary ? 'size-[1.15rem]' : 'size-[1.05rem]'} />
      {count > 0 ? (
        <span aria-hidden className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-signal px-1 text-[0.62rem] font-bold leading-none text-white ring-2 ring-black/40">
          {count > 9 ? '9+' : count}
        </span>
      ) : (
        item.live && <span aria-hidden className="absolute right-1 top-1 size-2 animate-signal-pulse rounded-full bg-emerald-400 ring-2 ring-black/50" />
      )}
      {/* The label, facing the room. Hover and focus only — touch gets it from the screen it opens. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[calc(100%+0.6rem)] top-1/2 hidden -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-full bg-black/80 px-3 py-1.5 text-left text-[0.72rem] font-medium text-chalk opacity-0 transition-[opacity,transform] duration-200 group-hover/dock:translate-x-0 group-hover/dock:opacity-100 group-focus-visible/dock:translate-x-0 group-focus-visible/dock:opacity-100 sm:block"
      >
        {item.label}
        {item.hint && <span className="ml-1.5 text-mist">· {item.hint}</span>}
      </span>
    </button>
  )
}
