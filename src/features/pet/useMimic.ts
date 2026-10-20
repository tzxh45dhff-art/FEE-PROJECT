import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The talking-back trick.
 *
 * With the microphone on, the pet listens. When you start talking it notices
 * (its ears go up), records until you stop, and then says it back to you in a
 * squeaky voice — your recording played faster with its pitch left to rise,
 * which is the whole trick and always has been.
 *
 * Detection is a level gate against the room's own noise floor, re-measured
 * continuously, so a fan or a laptop's hum doesn't count as talking. While the
 * pet is speaking the gate is closed, or it would hear itself and repeat that
 * forever.
 */

export type MimicMode = 'off' | 'starting' | 'listening' | 'hearing' | 'speaking' | 'denied'

const STEP_MS = 50
const SILENCE_MS = 750
const MAX_MS = 6000
const MIN_MS = 400
const PITCH = 1.6

let sharedContext: AudioContext | null = null
function audioContext() {
  if (!sharedContext || sharedContext.state === 'closed') sharedContext = new AudioContext()
  if (sharedContext.state === 'suspended') void sharedContext.resume()
  return sharedContext
}

function rms(analyser: AnalyserNode, buffer: Float32Array<ArrayBuffer>) {
  analyser.getFloatTimeDomainData(buffer)
  let sum = 0
  for (const v of buffer) sum += v * v
  return Math.sqrt(sum / buffer.length)
}

/**
 * Play a clip pitched up, reporting how loud it is moment to moment so the
 * mouth can move with it. Used for your own voice and for everyone else's.
 */
export function playSqueaky(blob: Blob, onLevel: (level: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.preservesPitch = false
    audio.playbackRate = PITCH
    let raf = 0
    const done = () => {
      cancelAnimationFrame(raf)
      onLevel(0)
      URL.revokeObjectURL(url)
      resolve()
    }
    try {
      const ctx = audioContext()
      const source = ctx.createMediaElementSource(audio)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      analyser.connect(ctx.destination)
      const buffer = new Float32Array(analyser.fftSize)
      const tick = () => {
        onLevel(Math.min(1, rms(analyser, buffer) * 7))
        raf = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      /* No Web Audio — it still plays, the mouth just doesn't follow. */
    }
    audio.onended = done
    audio.onerror = done
    audio.play().catch(done)
  })
}

export function useMimic({ onClip, onLevel }: { onClip: (blob: Blob) => void; onLevel: (level: number) => void }) {
  const [mode, setMode] = useState<MimicMode>('off')
  const modeRef = useRef<MimicMode>('off')
  const set = (m: MimicMode) => {
    modeRef.current = m
    setMode(m)
  }
  const clipRef = useRef(onClip)
  clipRef.current = onClip
  const levelRef = useRef(onLevel)
  levelRef.current = onLevel
  const rig = useRef<{ stream: MediaStream; timer: number; recorder: MediaRecorder | null } | null>(null)

  const stop = useCallback(() => {
    const r = rig.current
    rig.current = null
    if (r) {
      window.clearInterval(r.timer)
      if (r.recorder?.state === 'recording') r.recorder.stop()
      r.stream.getTracks().forEach((t) => t.stop())
    }
    set('off')
  }, [])

  const start = useCallback(async () => {
    if (rig.current) return
    set('starting')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
    } catch {
      set('denied')
      return
    }
    const ctx = audioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    ctx.createMediaStreamSource(stream).connect(analyser)
    const buffer = new Float32Array(analyser.fftSize)

    let floor = 0.01
    let began = 0
    let lastLoud = 0
    let quietUntil = 0
    let chunks: Blob[] = []
    const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((m) => MediaRecorder.isTypeSupported(m)) ?? ''

    const finish = (recorder: MediaRecorder) => {
      const length = Date.now() - began
      const blob = new Blob(chunks, { type: recorder.mimeType || mime || 'audio/webm' })
      chunks = []
      if (length < MIN_MS || !rig.current) {
        if (rig.current) set('listening')
        return
      }
      set('speaking')
      clipRef.current(blob)
      void playSqueaky(blob, (l) => levelRef.current(l)).then(() => {
        quietUntil = Date.now() + 450
        if (rig.current) set('listening')
      })
    }

    const timer = window.setInterval(() => {
      const r = rig.current
      if (!r) return
      const level = rms(analyser, buffer)
      const now = Date.now()
      const gate = Math.max(0.022, floor * 3.2)
      if (modeRef.current === 'listening') {
        /* Track the room's noise while nobody is talking. */
        if (level < gate) floor = floor * 0.95 + level * 0.05
        if (level > gate && now > quietUntil) {
          const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
          recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
          recorder.onstop = () => finish(recorder)
          recorder.start()
          r.recorder = recorder
          began = now
          lastLoud = now
          set('hearing')
        }
      } else if (modeRef.current === 'hearing') {
        if (level > gate * 0.7) lastLoud = now
        if (now - lastLoud > SILENCE_MS || now - began > MAX_MS) {
          if (r.recorder?.state === 'recording') r.recorder.stop()
          r.recorder = null
        }
      }
    }, STEP_MS)

    rig.current = { stream, timer, recorder: null }
    set('listening')
  }, [])

  useEffect(() => stop, [stop])

  return { mode, start, stop }
}
