import { useEffect, useRef } from 'react'
import { MicOff, VideoOff, WifiOff } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * One face in the call.
 *
 * The stream is attached through a ref rather than a `src` — `srcObject` takes
 * a MediaStream object, which has no URL to put in an attribute.
 */
export function CallTile({
  stream,
  name,
  muted,
  cameraOff,
  failed = false,
  isSelf = false,
}: {
  stream: MediaStream | null
  name: string
  muted: boolean
  cameraOff: boolean
  failed?: boolean
  isSelf?: boolean
}) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (video.current && video.current.srcObject !== stream) {
      video.current.srcObject = stream
    }
  }, [stream])

  const live = stream && !cameraOff && !failed

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-deep ring-1 ring-inset ring-white/[0.08]">
      <video
        ref={video}
        autoPlay
        playsInline
        /* Never play your own audio back — that is what causes the howl. */
        muted={isSelf}
        className={cn(
          'size-full object-cover',
          /* Mirrored, because a self-view that moves the wrong way is
             disorienting. Remote faces are left as they are. */
          isSelf && '-scale-x-100',
          !live && 'invisible',
        )}
      />

      {!live && (
        <div className="absolute inset-0 grid place-items-center">
          {failed ? (
            <span className="flex flex-col items-center gap-1.5 px-2 text-center">
              <WifiOff aria-hidden className="size-4 text-signal-bright" />
              <span className="text-[0.62rem] leading-tight text-signal-bright">
                Couldn't connect
              </span>
            </span>
          ) : (
            <span className="grid size-10 place-items-center rounded-full bg-white/[0.08] font-display text-[0.85rem] font-semibold text-chalk ring-1 ring-inset ring-white/15">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4">
        <span className="min-w-0 flex-1 truncate text-[0.68rem] font-medium text-chalk">
          {isSelf ? 'You' : name}
        </span>
        {muted && <MicOff aria-label="Muted" className="size-3 shrink-0 text-signal-bright" />}
        {cameraOff && !failed && (
          <VideoOff aria-label="Camera off" className="size-3 shrink-0 text-mist" />
        )}
      </div>
    </div>
  )
}
