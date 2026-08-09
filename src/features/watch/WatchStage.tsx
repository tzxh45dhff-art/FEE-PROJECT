import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Clapperboard, Loader2, MessagesSquare, Play, WifiOff, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import * as watchApi from '@/features/watch/api'
import { ExternalBeacon } from '@/features/watch/players/ExternalBeacon'
import { FilePlayer } from '@/features/watch/players/FilePlayer'
import { YouTubePlayer } from '@/features/watch/players/YouTubePlayer'
import { QueuePanel } from '@/features/watch/QueuePanel'
import type { PlayerHandle, QueueItem } from '@/features/watch/types'
import { useDriftCorrection } from '@/features/watch/useDriftCorrection'
import { useWatchSession } from '@/features/watch/useWatchSession'
import { WatchControls } from '@/features/watch/WatchControls'
import { WatchToasts } from '@/features/watch/WatchToasts'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The watch stage.
 *
 * Takes the whole screen rather than sitting in a card: this is the flagship
 * activity, and a synced player in a modal reads as a preview of one.
 *
 * Portalled to the body for the same reason the hub's drawer is — the hub's
 * fade leaves a `will-change` that would trap this under the fixed header.
 */
export function WatchStage({
  roomId,
  selfId,
  onClose,
  insetRight = 0,
  panelOpen = false,
  onTogglePanel,
  unread = 0,
}: {
  roomId: string
  selfId: string | undefined
  onClose: () => void
  /** Rem the room panel occupies, so the player is never hidden behind it. */
  insetRight?: number
  panelOpen?: boolean
  /** The stage covers the hub's rails, so chat needs a door in from here. */
  onTogglePanel?: () => void
  unread?: number
}) {
  const { snapshot, queue, setQueue, connected, targetPosition, send } = useWatchSession(
    roomId,
    true,
  )

  const [handle, setHandle] = useState<PlayerHandle | null>(null)
  const [queueOpen, setQueueOpen] = useState(false)
  const [canSearch, setCanSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** Set when the browser refuses to autoplay — the viewer has to ask for it. */
  const [needsGesture, setNeedsGesture] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  const item = snapshot?.item ?? null
  const embeddable = item?.source === 'youtube' || item?.source === 'file'

  useEffect(() => {
    watchApi
      .fetchCapabilities(roomId)
      .then((caps) => setCanSearch(caps.search))
      .catch(() => setCanSearch(false))
  }, [roomId])

  useEffect(() => {
    watchApi.fetchQueue(roomId).then(setQueue).catch(() => undefined)
  }, [roomId, setQueue])

  /* A new item clears the last item's failure, so one unembeddable video does
     not leave an error sitting over the next one. */
  useEffect(() => {
    setError(null)
    setNeedsGesture(false)
  }, [item?.id])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /*
   * Reconcile play/pause with the room.
   *
   * Keyed on the room's intent, not on player events — the player is a
   * follower here. `needsGesture` covers the case browsers force on us: a late
   * joiner has not interacted with the page yet, so `play()` is refused and the
   * only honest response is to ask.
   */
  useEffect(() => {
    if (!handle || !snapshot || !embeddable) return

    if (!snapshot.playing) {
      handle.pause()
      setNeedsGesture(false)
      return
    }

    handle.seek(targetPosition())
    handle.setRate(snapshot.rate)
    handle.play()

    const before = handle.getPosition()
    const check = setTimeout(() => {
      /* Still parked a second later means the play was blocked, not slow. */
      if (handle.getPosition() <= before + 0.05 && !handle.isBuffering()) setNeedsGesture(true)
    }, 1400)

    return () => clearTimeout(check)
    /* Keyed on `seq`, not on the snapshot object. A viewer joining rebuilds the
       snapshot without changing playback, and re-running this would re-seek and
       re-play the video every time somebody walked in. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, embeddable, snapshot?.seq, snapshot?.playing, snapshot?.rate])

  useDriftCorrection({
    handle,
    snapshot,
    targetPosition,
    enabled: embeddable && !needsGesture,
  })

  /* Local read-out for the scrubber. Deliberately not the drift loop's clock —
     this only paints, and it runs faster so the bar moves smoothly. */
  useEffect(() => {
    const tick = () => {
      if (handle && embeddable) {
        setPosition(handle.getPosition())
        setDuration(handle.getDuration() || item?.duration || 0)
      } else if (snapshot) {
        setPosition(targetPosition())
        setDuration(item?.duration ?? 0)
      }
    }
    tick()
    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [handle, embeddable, snapshot, targetPosition, item?.duration])

  const playNow = useCallback((next: QueueItem) => send('watch:load', { itemId: next.id }), [send])

  const skip = useCallback(() => {
    if (!snapshot) return
    send('watch:ended', { seq: snapshot.seq })
  }, [send, snapshot])

  const onEnded = useCallback(() => {
    if (!snapshot) return
    /* The seq stamps which item ended, so five clients firing at once still
       only advance the queue by one. */
    send('watch:ended', { seq: snapshot.seq })
  }, [send, snapshot])

  const first = queue[0]

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[135] flex flex-col bg-void transition-[padding] duration-500 ease-glass"
      style={{ paddingRight: `${insetRight}rem` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <div className="absolute inset-0 bg-black">
            {item && embeddable && item.source === 'youtube' && (
              <YouTubePlayer
                key={item.id}
                videoId={item.ref}
                startAt={targetPosition()}
                onHandle={setHandle}
                onEnded={onEnded}
                onError={setError}
              />
            )}

            {item && embeddable && item.source === 'file' && (
              <FilePlayer
                key={item.id}
                src={item.ref}
                startAt={targetPosition()}
                onHandle={setHandle}
                onEnded={onEnded}
                onError={setError}
              />
            )}

            {item && item.source === 'external' && (
              <ExternalBeacon
                item={item}
                position={snapshot?.position ?? 0}
                playing={snapshot?.playing ?? false}
              />
            )}

            {!item && (
              <div className="grid size-full place-items-center p-8">
                <div className="flex max-w-md flex-col items-center text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-signal/15 text-signal-bright ring-1 ring-inset ring-signal/30">
                    <Clapperboard aria-hidden className="size-6" />
                  </span>
                  <h2 className="mt-5 font-display text-[clamp(1.5rem,3.5vw,2.2rem)] font-semibold tracking-[-0.03em] text-chalk">
                    Nothing playing
                  </h2>
                  <p className="mt-2.5 text-[0.92rem] leading-relaxed text-mist">
                    {queue.length > 0
                      ? 'There is something queued — put it on and everyone sees it at the same moment.'
                      : 'Search or paste a link, and it plays for everyone in the room at once.'}
                  </p>
                  <div className="mt-6 flex gap-2">
                    {first && <Button onClick={() => playNow(first)}>Play “{first.title}”</Button>}
                    <Button variant={first ? 'outline' : 'primary'} onClick={() => setQueueOpen(true)}>
                      {first ? 'Open queue' : 'Add something'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {needsGesture && (
            <button
              type="button"
              onClick={() => {
                handle?.seek(targetPosition())
                handle?.play()
                setNeedsGesture(false)
              }}
              className="absolute inset-0 z-10 grid place-items-center bg-void/70 backdrop-blur-sm"
            >
              <span className="flex flex-col items-center gap-3">
                <span className="grid size-16 place-items-center rounded-full bg-chalk text-void">
                  <Play aria-hidden className="size-7 translate-x-0.5 fill-current" />
                </span>
                <span className="font-display text-[1.05rem] font-semibold text-chalk">
                  Tap to join playback
                </span>
                <span className="max-w-xs text-center text-[0.8rem] leading-relaxed text-mist">
                  Your browser blocks video that starts on its own. This drops you straight in at
                  the room's timestamp.
                </span>
              </span>
            </button>
          )}

          {error && (
            <div className="absolute inset-x-0 top-0 z-10 flex justify-center p-4">
              <p
                role="alert"
                className="glass-pill-ink max-w-lg rounded-card px-4 py-3 text-center text-[0.82rem] leading-relaxed text-signal-bright"
              >
                {error}
              </p>
            </div>
          )}

          <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-void/90 to-transparent p-4 md:p-5">
            <span className="pointer-events-auto flex items-center gap-2.5">
              {snapshot && snapshot.viewers.length > 0 && (
                <span className="glass-pill-ink flex items-center gap-2 rounded-full px-3 py-1.5">
                  <span className="size-1.5 animate-signal-pulse rounded-full bg-emerald-400" />
                  <span className="text-[0.72rem] text-chalk">
                    {snapshot.viewers.length} watching
                  </span>
                </span>
              )}
              {!connected && (
                <span className="glass-pill-ink flex items-center gap-2 rounded-full px-3 py-1.5 text-signal-bright">
                  <WifiOff aria-hidden className="size-3.5" />
                  <span className="text-[0.72rem]">Reconnecting…</span>
                </span>
              )}
              {!snapshot && (
                <span className="glass-pill-ink flex items-center gap-2 rounded-full px-3 py-1.5">
                  <Loader2 aria-hidden className="size-3.5 animate-spin text-mist" />
                  <span className="text-[0.72rem] text-mist">Syncing…</span>
                </span>
              )}
            </span>

            <span className="pointer-events-auto flex items-center gap-2">
              {onTogglePanel && (
                <button
                  type="button"
                  onClick={onTogglePanel}
                  aria-label="Chat and call"
                  aria-pressed={panelOpen}
                  className={cn(
                    'relative flex h-10 items-center gap-2 rounded-full border px-3.5 outline-none transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                    panelOpen
                      ? 'border-signal/50 bg-signal/15 text-chalk'
                      : 'border-white/15 bg-white/[0.05] text-chalk backdrop-blur-md hover:border-white/30 hover:bg-white/[0.1]',
                  )}
                >
                  <MessagesSquare aria-hidden className="size-4" />
                  {unread > 0 && !panelOpen && (
                    <span className="min-w-4 rounded-full bg-signal px-1 text-[0.62rem] font-semibold leading-4 text-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
              )}
              <Button variant="outline" size="icon" onClick={onClose} aria-label="Leave the stage" plain>
                <X aria-hidden />
              </Button>
            </span>
          </header>

          <WatchToasts snapshot={snapshot} selfId={selfId} />

          <div className="absolute inset-x-0 bottom-0">
            {snapshot && (
              <WatchControls
                snapshot={snapshot}
                position={position}
                duration={duration}
                queueCount={queue.length}
                queueOpen={queueOpen}
                onToggleQueue={() => setQueueOpen((open) => !open)}
                onPlayPause={() =>
                  send('watch:control', {
                    action: snapshot.playing ? 'pause' : 'play',
                    position: embeddable && handle ? handle.getPosition() : undefined,
                  })
                }
                onSeek={(seconds) => send('watch:control', { action: 'seek', position: seconds })}
                onRate={(rate) => send('watch:control', { action: 'rate', rate })}
                onSkip={skip}
                disabled={!item}
              />
            )}
          </div>
        </div>

        {queueOpen && (
          <QueuePanel
            roomId={roomId}
            items={queue}
            nowPlayingId={item?.id ?? null}
            canSearch={canSearch}
            onQueueChange={setQueue}
            onPlayNow={(next) => playNow(next)}
            onClose={() => setQueueOpen(false)}
          />
        )}
      </div>
    </motion.div>,
    document.body,
  )
}
