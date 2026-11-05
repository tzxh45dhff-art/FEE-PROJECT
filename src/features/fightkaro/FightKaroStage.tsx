import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Maximize, RotateCcw } from 'lucide-react'
import { API_BASE, API_HEADERS, getToken } from '@/lib/config'

/** A document boundary keeps the original game's input, styles and render loop isolated. */
export function FightKaroStage({ onClose, roomId }: { onClose: () => void; roomId: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const shell = useRef<HTMLElement>(null)
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [fullscreenError, setFullscreenError] = useState(false)
  useEffect(() => {
    const requests = new Map<number, AbortController>()
    const timeout = window.setTimeout(() => setFailed(true), 45000)
    const lobby = (method: 'PUT' | 'DELETE', keepalive = false) => {
      const token = getToken()
      return fetch(`${API_BASE}/api/fightkaro/lobby?huddleRoom=${encodeURIComponent(roomId)}`, {
        method, credentials: 'include', keepalive,
        headers: { ...API_HEADERS, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      }).catch(() => {})
    }
    /* Keeps this room's match held while the screen is open; a closed tab lets it go within two minutes. */
    const heartbeat = window.setInterval(() => void lobby('PUT'), 30000)
    let ready = false
    const receive = async (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return
      const message = event.data
      if (message?.type === 'fight:loaded') { ready = true; clearTimeout(timeout); setLoaded(true); return }
      /* Only a failure to start is fatal; a stray error mid-fight (a blocked sound, say) must not cover the match. */
      if (message?.type === 'fight:error') { if (!ready) setFailed(true); return }
      if (message?.type === 'fight:abort') { requests.get(message.id)?.abort(); return }
      if (message?.type !== 'fight:request' || !Number.isSafeInteger(message.id)) return
      if (typeof message.path !== 'string' || !/^\/api\/fightkaro\/(ice|room|lobby)(\?[^#]*)?$/.test(message.path)) return
      if (!['GET', 'POST', 'DELETE'].includes(message.method) || requests.size >= 16) return
      const controller = new AbortController()
      requests.set(message.id, controller)
      const deadline = window.setTimeout(() => controller.abort(), 35000)
      const target = frame.current?.contentWindow
      try {
        const token = getToken()
        const response = await fetch(`${API_BASE}${message.path}${message.path.includes('?') ? '&' : '?'}huddleRoom=${encodeURIComponent(roomId)}`, {
          method: message.method, body: message.body, credentials: 'include', signal: controller.signal,
          headers: { ...API_HEADERS, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        const body = await response.json()
        target?.postMessage({ type: 'fight:response', id: message.id, status: response.status, body }, location.origin)
      } catch {
        target?.postMessage({ type: 'fight:response', id: message.id, error: 'Could not reach the game server. Check your connection.' }, location.origin)
      } finally { clearTimeout(deadline); requests.delete(message.id) }
    }
    window.addEventListener('message', receive)
    return () => {
      clearTimeout(timeout); clearInterval(heartbeat); window.removeEventListener('message', receive); requests.forEach(r => r.abort())
      void lobby('DELETE', true)
    }
  }, [attempt, roomId])
  const [src] = useState(() => `/fightkaro/index.html${window.matchMedia('(max-width: 639px)').matches ? '?mobile=1' : ''}`)
  return (
    <section ref={shell} aria-label="FightKaro" className="relative h-full flex flex-col bg-[#160d08] text-[#fff3d0]" data-lenis-prevent>
      <header className="flex min-h-12 shrink-0 items-center justify-between gap-2 border-b border-amber-200/15 bg-[#160d08] px-3 pt-[env(safe-area-inset-top)] sm:px-5">
        <button onClick={onClose} className="flex min-h-10 items-center gap-2 rounded px-2 text-sm hover:bg-white/10 focus-visible:outline-2" aria-label="Back to all games"><ArrowLeft size={18} /><span>All games</span></button>
        <span className="truncate font-display text-sm font-bold tracking-widest">FIGHTKARO</span>
        <button className="grid size-10 place-items-center rounded hover:bg-white/10 focus-visible:outline-2" aria-label="Fullscreen game" onClick={() => { setFullscreenError(false); if (!shell.current?.requestFullscreen) setFullscreenError(true); else void shell.current.requestFullscreen().catch(() => setFullscreenError(true)) }}><Maximize size={18} /></button>
      </header>
      {fullscreenError && <p role="status" className="px-4 text-xs">Fullscreen is unavailable in this browser. You can keep playing here.</p>}
      <div className="relative min-h-0 flex-1">
        {!loaded && !failed && <div role="status" className="absolute inset-0 grid place-items-center">Opening Sansad Showdown…</div>}
        <iframe key={attempt} ref={frame} title="Sansad Showdown fighting game" src={src} className="h-full w-full border-0" allow="autoplay; fullscreen; clipboard-write" onLoad={() => frame.current?.contentWindow?.focus()} />
        {failed && <div role="alert" className="absolute inset-0 grid place-items-center bg-[#160d08]/95 p-6 text-center"><div><p className="text-xl font-semibold">The arena couldn’t load.</p><p className="mt-2 text-sm opacity-70">Check your connection and try again.</p><button className="mx-auto mt-5 flex items-center gap-2 rounded bg-amber-300 px-5 py-3 font-semibold text-black" onClick={() => { setFailed(false); setLoaded(false); setAttempt(a => a + 1) }}><RotateCcw size={16} />Reload arena</button></div></div>}
      </div>
    </section>
  )
}
