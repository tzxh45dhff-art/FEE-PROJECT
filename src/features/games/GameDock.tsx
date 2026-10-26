import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, LogOut, MessagesSquare, Settings2, WifiOff } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * The games' only chrome: a small frosted dock tucked against the left edge,
 * halfway down — the one place no game puts anything. Settings opens a little
 * panel (all games, end the game, leave); chat is its own button. Everything
 * else on the screen belongs to the game.
 */
export function GameDock({
  connected,
  status,
  onAllGames,
  endGame,
  onLeave,
  onChat,
  chatOpen,
  unread,
}: {
  connected: boolean
  /** A word about the game, e.g. "Watching". */
  status?: string | null
  onAllGames?: () => void
  /** The game's own end-game control, when there is a game to end. */
  endGame?: React.ReactNode
  onLeave: () => void
  onChat?: () => void
  chatOpen?: boolean
  unread?: number
}) {
  const [open, setOpen] = useState(false)
  const dock = useRef<HTMLDivElement>(null)
  /* On a phone the dock rests as a slim tab on the edge, so it never sits on the game's words. */
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches)
  const [out, setOut] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const change = () => setPhone(query.matches)
    query.addEventListener('change', change)
    return () => query.removeEventListener('change', change)
  }, [])
  /* Pulled out, it tucks itself away again after a few idle seconds. */
  useEffect(() => {
    if (!out || open) return
    const timer = window.setTimeout(() => setOut(false), 4_000)
    return () => window.clearTimeout(timer)
  }, [out, open])
  const tucked = phone && !out && !open

  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      /* The end-game dialog lives in a portal; a click inside it isn't "away". */
      const target = e.target as Element | null
      if (dock.current?.contains(target) || target?.closest('[role="alertdialog"]')) return
      setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', away)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('pointerdown', away)
      window.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <>
      <AnimatePresence>
        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
            className="pointer-events-none absolute left-1/2 top-3 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-signal/30 bg-[#1a0b0d]/85 px-3 py-1.5 text-signal-bright"
          >
            <WifiOff aria-hidden className="size-3.5" />
            <span className="text-[0.75rem]">Reconnecting…</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={dock} className="absolute left-0 top-1/2 z-40 -translate-y-1/2">
        {tucked ? (
          <button
            type="button"
            onClick={() => setOut(true)}
            aria-label={unread ? `Game menu and chat · ${unread} unread` : 'Game menu and chat'}
            className="relative flex h-16 w-5 items-center justify-center rounded-r-xl border border-l-0 border-white/15 bg-black/45 outline-none backdrop-blur-md focus-visible:outline-2 focus-visible:outline-signal"
          >
            <span className="h-7 w-[3px] rounded-full bg-white/55" />
            {(!!unread || !connected) && <span className="absolute -right-1 top-1 size-2.5 rounded-full border border-black/40 bg-signal" />}
          </button>
        ) : (
        <div className="flex flex-col gap-1 rounded-r-2xl border border-l-0 border-white/12 bg-black/35 p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,.8)] backdrop-blur-md transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100 sm:p-1.5 [&:not(:hover)]:opacity-80">
          <DockButton label={open ? 'Close game settings' : 'Game settings'} pressed={open} onClick={() => setOpen((o) => !o)}>
            <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="grid">
              <Settings2 aria-hidden className="size-[1.05rem]" />
            </motion.span>
            {!connected && <span className="absolute right-1 top-1 size-2 rounded-full bg-signal" />}
          </DockButton>
          {onChat && (
            <DockButton label={chatOpen ? 'Close chat and call' : 'Chat and call'} pressed={chatOpen} onClick={onChat}>
              <MessagesSquare aria-hidden className="size-[1.05rem]" />
              {!!unread && !chatOpen && (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-signal px-1 text-center text-[0.6rem] font-semibold leading-4 text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </DockButton>
          )}
        </div>
        )}

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left center' }}
              className="absolute left-[calc(100%+0.5rem)] top-1/2 w-56 -translate-y-1/2 rounded-2xl border border-white/12 bg-[#0e0e12]/92 p-2 text-chalk shadow-[0_18px_50px_-14px_rgba(0,0,0,.9)] backdrop-blur-xl"
              role="menu"
              aria-label="Game settings"
            >
              {status && <p className="px-2.5 pb-1.5 pt-1 text-[0.7rem] uppercase tracking-[0.16em] text-mist">{status}</p>}
              {onAllGames && (
                <MenuRow
                  onClick={() => {
                    setOpen(false)
                    onAllGames()
                  }}
                >
                  <ArrowLeft aria-hidden className="size-4 text-mist" /> All games
                </MenuRow>
              )}
              {endGame && <div className="px-1 py-1 [&_button]:w-full [&_button]:justify-center">{endGame}</div>}
              <MenuRow
                onClick={() => {
                  setOpen(false)
                  onLeave()
                }}
              >
                <LogOut aria-hidden className="size-4 text-mist" /> Leave games
              </MenuRow>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

function DockButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'relative grid size-10 place-items-center rounded-xl outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal sm:size-9',
        pressed ? 'bg-white/15 text-chalk' : 'text-chalk/85 hover:bg-white/10 hover:text-chalk',
      )}
    >
      {children}
    </button>
  )
}

function MenuRow({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-[0.88rem] outline-none transition-colors hover:bg-white/[0.07] focus-visible:bg-white/10"
    >
      {children}
    </button>
  )
}
