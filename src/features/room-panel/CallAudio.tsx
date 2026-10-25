import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'

import type { RemotePeer } from '@/features/room-panel/useMeshCall'

/**
 * The call's sound, always on while you are on the call.
 *
 * It used to come out of the video tiles, which only exist while the room
 * panel is open — close the panel (to watch something, or because on a phone
 * it covers the screen) and you stopped hearing and seeing everyone, while
 * they still heard you and assumed you could hear them. Sound now lives here,
 * mounted for as long as the call is, and the tiles are picture only.
 *
 * If the browser won't start sound without a tap, a small button says so
 * rather than leaving a silent call that looks connected.
 */
export function CallAudio({ peers }: { peers: RemotePeer[] }) {
  const [blocked, setBlocked] = useState(false)
  const [retry, setRetry] = useState(0)
  const live = peers.filter((peer) => peer.stream)

  return (
    <>
      {live.map((peer) => (
        <PeerAudio key={peer.socketId} stream={peer.stream!} retry={retry} onBlocked={() => setBlocked(true)} onPlaying={() => setBlocked(false)} />
      ))}
      {blocked && live.length > 0 && (
        <button
          type="button"
          onClick={() => setRetry((n) => n + 1)}
          className="glass-pill-ink fixed bottom-24 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2.5 text-[0.82rem] font-semibold text-chalk outline-none focus-visible:outline-2 focus-visible:outline-signal"
        >
          <Volume2 aria-hidden className="size-4" /> Tap to hear the call
        </button>
      )}
    </>
  )
}

function PeerAudio({ stream, retry, onBlocked, onPlaying }: { stream: MediaStream; retry: number; onBlocked: () => void; onPlaying: () => void }) {
  const audio = useRef<HTMLAudioElement>(null)
  const report = useRef({ onBlocked, onPlaying })
  report.current = { onBlocked, onPlaying }

  useEffect(() => {
    const element = audio.current
    if (!element) return
    if (element.srcObject !== stream) element.srcObject = stream
    element
      .play()
      .then(() => report.current.onPlaying())
      .catch(() => report.current.onBlocked())
  }, [stream, retry])

  return <audio ref={audio} autoPlay className="hidden" />
}
