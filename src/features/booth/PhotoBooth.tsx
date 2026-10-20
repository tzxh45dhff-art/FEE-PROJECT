import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Check, Download, RotateCcw } from 'lucide-react'

import { savePhoto } from '@/features/booth/api'
import { captureRoom } from '@/features/booth/capture'
import { FRAMES, framePhoto, toJpeg, type Frame } from '@/features/booth/frames'
import { useBooth } from '@/features/booth/useBooth'
import { apiUrl } from '@/lib/config'
import { cn } from '@/lib/utils'

/**
 * The photo booth.
 *
 * Open it, pick a frame and write a caption, strike a pose, press the shutter.
 * Everyone in the room gets the same three-second countdown — so they can
 * pose too — and the same flash. The picture is taken on the photographer's
 * screen, comes out like a print, and goes into the room's memories with one
 * tap; everyone else hears about it.
 */

const POSES = [
  { id: 'wave', glyph: '👋', label: 'Wave' },
  { id: 'heart', glyph: '❤️', label: 'Love' },
  { id: 'kiss', glyph: '😘', label: 'Kiss' },
  { id: 'party', glyph: '🎉', label: 'Party' },
  { id: 'cool', glyph: '😎', label: 'Cool' },
  { id: 'laugh', glyph: '😂', label: 'Laugh' },
]

type Shot = { url: string; blob: Blob; frame: Frame; caption: string }

export function PhotoBooth({
  roomId,
  roomName,
  selfId,
  enabled,
  onPose,
}: {
  roomId: string
  roomName: string
  selfId: string | undefined
  enabled: boolean
  onPose: (emote: string) => void
}) {
  const booth = useBooth(roomId)
  const [open, setOpen] = useState(false)
  const [frame, setFrame] = useState<Frame>('polaroid')
  const [caption, setCaption] = useState('')
  const [shot, setShot] = useState<Shot | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const settings = useRef({ frame, caption, roomName })
  settings.current = { frame, caption, roomName }

  useEffect(() => {
    if (!enabled) setOpen(false)
  }, [enabled])

  /* When my own countdown runs out, take the picture. */
  const mine = booth.countdown && booth.countdown.by.id === selfId ? booth.countdown : null
  useEffect(() => {
    if (!mine) return
    const timer = window.setTimeout(
      async () => {
        try {
          const { frame: f, caption: c, roomName: r } = settings.current
          const framed = framePhoto(await captureRoom(), f, { caption: c, room: r, date: new Date() })
          const blob = await toJpeg(framed)
          setShot({ url: URL.createObjectURL(blob), blob, frame: f, caption: c })
        } catch {
          setFailed('Couldn’t take that one — try again')
        }
      },
      Math.max(0, mine.firesAt - Date.now()),
    )
    return () => window.clearTimeout(timer)
  }, [mine])

  useEffect(() => {
    if (!failed) return
    const timer = window.setTimeout(() => setFailed(null), 3500)
    return () => window.clearTimeout(timer)
  }, [failed])

  return (
    <>
      {/* The bottom row is click-through between its pills; this one takes clicks. */}
      <div className="pointer-events-auto relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={!enabled}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            'glass-pill-ink group flex items-center gap-3 rounded-full py-2 pl-2 pr-2 outline-none sm:pr-5',
            'transition-[border-color,box-shadow,opacity] duration-500 ease-glass disabled:opacity-40',
            'hover:border-white/25 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal',
            open && 'border-white/30',
          )}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-mist ring-1 ring-inset ring-white/15 transition-colors group-hover:text-chalk">
            <Camera className="size-[1.1rem]" aria-hidden />
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-[0.86rem] font-semibold text-chalk">Photo</span>
            <span className="text-[0.7rem] text-mist">Strike a pose</span>
          </span>
        </button>

      </div>

      {createPortal(
        <>
          <AnimatePresence>{open && enabled && <Viewfinder key="finder" />}</AnimatePresence>
          <AnimatePresence>
            {open && enabled && (
              <motion.div
                key="strip"
                role="dialog"
                aria-label="Photo booth"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                /* A strip under everyone's feet, so the people being photographed stay in view. */
                className="glass-pill-ink fixed bottom-[5.6rem] left-1/2 z-[124] flex w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-4 gap-y-3 rounded-[1.6rem] p-2.5 pl-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,.85)]"
              >
                <div className="flex gap-1" role="radiogroup" aria-label="Frame">
                  {FRAMES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="radio"
                      aria-checked={frame === f.id}
                      onClick={() => setFrame(f.id)}
                      title={f.label}
                      aria-label={`${f.label} frame`}
                      className={cn(
                        'grid place-items-center rounded-xl p-1.5 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-signal',
                        frame === f.id ? 'bg-white/15 ring-1 ring-white/30' : 'hover:bg-white/[0.07]',
                      )}
                    >
                      <FrameSwatch frame={f.id} />
                    </button>
                  ))}
                </div>
                <span className="hidden h-8 w-px bg-white/12 md:block" aria-hidden />
                <input
                  value={caption}
                  maxLength={60}
                  onChange={(e) => setCaption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !booth.countdown && void booth.start()}
                  placeholder="Add a caption…"
                  aria-label="Caption"
                  className="w-52 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2.5 text-[0.86rem] text-chalk outline-none placeholder:text-dusk focus:border-white/35"
                />
                <span className="hidden h-8 w-px bg-white/12 md:block" aria-hidden />
                <div className="flex gap-1">
                  {POSES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPose(p.id)}
                      title={`Pose: ${p.label}`}
                      aria-label={`Pose: ${p.label}`}
                      className="grid size-10 place-items-center rounded-xl text-[1.25rem] outline-none transition-transform hover:scale-110 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-signal active:scale-95"
                    >
                      {p.glyph}
                    </button>
                  ))}
                </div>
                {/* The shutter. */}
                <button
                  type="button"
                  disabled={!!booth.countdown}
                  onClick={() => void booth.start()}
                  aria-label="Take the photo — everyone gets a three-second countdown"
                  title="Take the photo"
                  className="group grid size-14 place-items-center rounded-full border-[3px] border-white/85 outline-none transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:scale-95 disabled:opacity-50"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-white text-void transition-colors group-hover:bg-signal-bright group-hover:text-white">
                    <Camera className="size-[1.1rem]" aria-hidden />
                  </span>
                </button>
                {(booth.error || failed) && (
                  <p role="alert" className="w-full pb-1 text-center text-[0.78rem] text-signal-bright">
                    {booth.error ?? failed}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>{booth.countdown && <CountdownOverlay key={booth.countdown.id} countdown={booth.countdown} mine={booth.countdown.by.id === selfId} />}</AnimatePresence>
          <AnimatePresence>
            {shot && (
              <Print
                key={shot.url}
                shot={shot}
                onRetake={() => {
                  URL.revokeObjectURL(shot.url)
                  setShot(null)
                }}
                onSave={async () => {
                  const photo = await savePhoto(roomId, shot.blob, shot.caption, shot.frame)
                  booth.announce(photo.id)
                }}
                onDone={() => {
                  URL.revokeObjectURL(shot.url)
                  setShot(null)
                  setOpen(false)
                  setCaption('')
                }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {booth.latest && booth.latest.createdBy.id !== selfId && <PhotoToast key={booth.latest.id} url={apiUrl(booth.latest.url)} name={booth.latest.createdBy.name} />}
          </AnimatePresence>
        </>,
        document.body,
      )}
    </>
  )
}

function FrameSwatch({ frame }: { frame: Frame }) {
  const photo = 'bg-[linear-gradient(160deg,#f6a35c,#7a4a8f_60%,#2b2140)]'
  if (frame === 'polaroid')
    return (
      <span className="block h-11 w-10 rounded-[3px] bg-[#fbf8f2] p-[3px] pb-[9px] shadow-sm">
        <span className={cn('block size-full', photo)} />
      </span>
    )
  if (frame === 'film')
    return (
      <span className="block h-11 w-10 rounded-[3px] bg-[#0c0b0d] px-[2px] py-[6px] [background-image:radial-gradient(circle,#eee_1px,transparent_1.5px)] [background-size:6px_6px] [background-position:0_1px]">
        <span className={cn('block size-full', photo)} />
      </span>
    )
  if (frame === 'hearts')
    return (
      <span className="block h-11 w-10 rounded-[4px] bg-gradient-to-br from-[#ff8fb1] to-[#ffd29d] p-[4px] pb-[8px]">
        <span className={cn('block size-full rounded-[2px]', photo)} />
      </span>
    )
  return <span className={cn('block h-11 w-10 rounded-[3px]', photo)} />
}

/** Corner brackets round the screen while the booth is open — you're in frame. */
function Viewfinder() {
  const corner = 'absolute size-10 border-white/70'
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-4 z-[125] sm:inset-8"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <span className={cn(corner, 'left-0 top-0 rounded-tl-xl border-l-2 border-t-2')} />
      <span className={cn(corner, 'right-0 top-0 rounded-tr-xl border-r-2 border-t-2')} />
      <span className={cn(corner, 'bottom-0 left-0 rounded-bl-xl border-b-2 border-l-2')} />
      <span className={cn(corner, 'bottom-0 right-0 rounded-br-xl border-b-2 border-r-2')} />
      <span className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
        <span className="size-1.5 animate-pulse rounded-full bg-red-500" /> Photo booth
      </span>
    </motion.div>
  )
}

function CountdownOverlay({ countdown, mine }: { countdown: { by: { name: string }; firesAt: number }; mine: boolean }) {
  const [left, setLeft] = useState(() => countdown.firesAt - Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setLeft(countdown.firesAt - Date.now()), 50)
    return () => window.clearInterval(timer)
  }, [countdown.firesAt])
  const n = Math.ceil(left / 1000)
  const fired = left <= 0
  return (
    <motion.div className="pointer-events-none fixed inset-0 z-[126]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {!fired && (
        <div className="absolute left-1/2 top-[14%] flex -translate-x-1/2 flex-col items-center">
          <div className="relative grid size-28 place-items-center rounded-full bg-black/45 backdrop-blur-md">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={n}
                initial={{ scale: 1.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                className="absolute font-display text-[3.6rem] font-semibold tabular-nums text-white"
              >
                {Math.max(1, n)}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="mt-3 rounded-full bg-black/45 px-4 py-1.5 text-[0.85rem] font-semibold text-white backdrop-blur-md">
            {mine ? 'Everyone, pose!' : `${countdown.by.name} is taking a photo — pose!`}
          </p>
        </div>
      )}
      {/* The flash. */}
      {fired && <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} />}
    </motion.div>
  )
}

function Print({ shot, onRetake, onSave, onDone }: { shot: Shot; onRetake: () => void; onSave: () => Promise<void>; onDone: () => void }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (state !== 'saved') return
    const timer = window.setTimeout(onDone, 1300)
    return () => window.clearTimeout(timer)
  }, [state, onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex w-full max-w-3xl flex-col items-center">
        {/* Out of the slot, like a print. */}
        <motion.img
          src={shot.url}
          alt={shot.caption || 'Your photo'}
          className="max-h-[68vh] w-auto max-w-full rounded-md shadow-[0_40px_100px_-30px_rgba(0,0,0,.95)]"
          initial={{ y: -60, rotate: -4, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, rotate: -1.2, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.1 }}
        />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onRetake}
            disabled={state === 'saving' || state === 'saved'}
            className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[0.85rem] font-semibold text-chalk hover:bg-white/10 disabled:opacity-40"
          >
            <RotateCcw className="size-4" aria-hidden /> Retake
          </button>
          <a
            href={shot.url}
            download={`huddle-${new Date().toISOString().slice(0, 10)}.jpg`}
            className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[0.85rem] font-semibold text-chalk hover:bg-white/10"
          >
            <Download className="size-4" aria-hidden /> Download
          </a>
          <button
            type="button"
            disabled={state === 'saving' || state === 'saved'}
            onClick={async () => {
              setState('saving')
              try {
                await onSave()
                setState('saved')
              } catch (e) {
                setMessage(e instanceof Error ? e.message : 'Could not save it')
                setState('error')
              }
            }}
            className="flex min-w-48 items-center justify-center gap-2 rounded-full bg-chalk px-6 py-2.5 text-[0.88rem] font-semibold text-void transition-transform hover:scale-[1.03] disabled:hover:scale-100"
          >
            {state === 'saved' ? (
              <>
                <Check className="size-4" aria-hidden /> Saved to memories
              </>
            ) : state === 'saving' ? (
              'Saving…'
            ) : (
              'Save to memories'
            )}
          </button>
        </div>
        {state === 'error' && (
          <p role="alert" className="mt-3 text-[0.8rem] text-signal-bright">
            {message}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function PhotoToast({ url, name }: { url: string; name: string }) {
  const [shown, setShown] = useState(true)
  useEffect(() => {
    const timer = window.setTimeout(() => setShown(false), 4500)
    return () => window.clearTimeout(timer)
  }, [])
  if (!shown) return null
  return (
    <motion.div
      role="status"
      className="glass-pill-ink fixed bottom-24 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 rounded-2xl p-2 pr-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <img src={url} alt="" className="h-11 w-14 rounded-lg object-cover" />
      <span className="text-[0.82rem] text-chalk">
        <span className="font-semibold">{name}</span> saved a photo 📸
      </span>
    </motion.div>
  )
}
