import { useState } from 'react'
import { AlertDialog } from 'radix-ui'
import { Loader2, Square } from 'lucide-react'

/** Shared across every table, with keyboard/focus handling from Radix. */
export function EndGameButton({ label, allowed, connected, onEnd }: {
  label: string
  allowed: boolean
  connected: boolean
  onEnd: () => Promise<{ error?: string }>
}) {
  const [open, setOpen] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function finish() {
    if (ending || !allowed || !connected) return
    setEnding(true)
    setError(null)
    try {
      const reply = await onEnd()
      if (reply.error) setError(reply.error)
      else setOpen(false)
    } catch {
      setError('Couldn’t end the game. Check your connection and try again.')
    } finally {
      setEnding(false)
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => { if (!ending) { setOpen(next); setError(null) } }}>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          disabled={!allowed || !connected}
          title={!allowed ? 'Only players can end the game' : !connected ? 'Waiting for connection' : 'End the game for everyone'}
          className="flex h-11 items-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/[0.08] px-3 text-[0.75rem] font-semibold text-rose-200 outline-none transition-colors hover:border-rose-400/50 hover:bg-rose-400/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:px-3.5"
        >
          <Square aria-hidden className="size-3.5 fill-current" /> End game
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[200] bg-black/75" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[201] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-[#101014] p-6 text-chalk shadow-2xl outline-none">
          <AlertDialog.Title className="font-display text-xl font-semibold">End {label}?</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-mist">
            This ends the game for everyone in the room.
          </AlertDialog.Description>
          {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button type="button" disabled={ending} className="min-h-11 rounded-full border border-white/15 px-4 text-sm font-medium outline-none hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50">Keep playing</button>
            </AlertDialog.Cancel>
            <button type="button" disabled={ending || !allowed || !connected} onClick={() => void finish()} className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose-400 px-5 text-sm font-semibold text-[#21090d] outline-none hover:bg-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 disabled:opacity-50">
              {ending && <Loader2 aria-hidden className="size-4 animate-spin" />}
              {ending ? 'Ending…' : 'End game'}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
