/**
 * Somewhere's sound: every effect and the music are synthesised here with Web
 * Audio — nothing to download, nothing licensed, and it starts instantly.
 *
 * The music is a dark A-minor pulse that builds with the clock. At low
 * intensity it is a drone and a slow heartbeat; as time runs out the bass
 * starts to drive, hi-hats and an arpeggio join, the tempo climbs from 92 to
 * 150, and the last ten seconds get a rising sweep. When the round ends it
 * stops on a single hit, so the reveal lands in silence.
 */

type Settings = { music: boolean; effects: boolean }
const KEY = 'huddle.geoSound'

function readSettings(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Settings>
    return { music: raw.music !== false, effects: raw.effects !== false }
  } catch {
    return { music: true, effects: true }
  }
}

let settings = readSettings()
const listeners = new Set<() => void>()
export const soundSettings = () => settings
export function setSoundSettings(next: Partial<Settings>) {
  settings = { ...settings, ...next }
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    /* Remembered for this visit only. */
  }
  if (!settings.music) music.stop()
  listeners.forEach((fn) => fn())
}
export function onSoundSettings(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/* ── the audio graph ──────────────────────────────────────────────────── */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicBus: GainNode | null = null
let fxBus: GainNode | null = null
let noise: AudioBuffer | null = null

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.9
    /* A gentle limiter so stacked layers never clip. */
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -10
    limiter.ratio.value = 8
    master.connect(limiter).connect(ctx.destination)
    musicBus = ctx.createGain()
    musicBus.gain.value = 0.42
    musicBus.connect(master)
    fxBus = ctx.createGain()
    fxBus.gain.value = 0.7
    fxBus.connect(master)
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
  return ctx
}

/** Browsers start audio only after a tap; the first one anywhere wakes it. */
export function unlockAudio() {
  audio()
}

type Voice = { freq: number; type?: OscillatorType; at?: number; dur: number; gain: number; slide?: number; bus?: 'fx' | 'music'; attack?: number }

function tone({ freq, type = 'sine', at = 0, dur, gain, slide, bus = 'fx', attack = 0.005 }: Voice) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + at
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur)
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(gain, t + attack)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(amp).connect(bus === 'fx' ? fxBus! : musicBus!)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function hiss({ at = 0, dur, gain, from = 2000, to, type = 'bandpass', bus = 'fx', q = 1 }: { at?: number; dur: number; gain: number; from?: number; to?: number; type?: BiquadFilterType; bus?: 'fx' | 'music'; q?: number }) {
  const c = audio()
  if (!c || !noise) return
  const t = c.currentTime + at
  const src = c.createBufferSource()
  src.buffer = noise
  src.loop = true
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.Q.value = q
  filter.frequency.setValueAtTime(from, t)
  if (to) filter.frequency.exponentialRampToValueAtTime(to, t + dur)
  const amp = c.createGain()
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.02, dur / 3))
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(amp).connect(bus === 'fx' ? fxBus! : musicBus!)
  src.start(t)
  src.stop(t + dur + 0.05)
}

/* ── effects ──────────────────────────────────────────────────────────── */

const fx = (play: () => void) => () => {
  if (settings.effects) play()
}

export const sfx = {
  /** A clock tick; sharper as the last seconds go. */
  tick: (urgent = false) => {
    if (!settings.effects) return
    tone({ freq: urgent ? 1760 : 1320, type: 'square', dur: 0.05, gain: urgent ? 0.09 : 0.05 })
    tone({ freq: urgent ? 880 : 660, type: 'triangle', dur: 0.08, gain: 0.05 })
  },
  /** The countdown beats: 3, 2, 1 — and a bright "go". */
  count: (n: number) => {
    if (!settings.effects) return
    tone({ freq: 392 + (3 - n) * 98, type: 'triangle', dur: 0.22, gain: 0.18 })
    tone({ freq: 784 + (3 - n) * 196, type: 'sine', dur: 0.16, gain: 0.06 })
  },
  go: fx(() => {
    tone({ freq: 523, type: 'sawtooth', dur: 0.35, gain: 0.08, slide: 1046 })
    tone({ freq: 784, type: 'triangle', dur: 0.4, gain: 0.12 })
    hiss({ dur: 0.45, gain: 0.08, from: 600, to: 6000 })
  }),
  /** A pin pressed into the map. */
  pin: fx(() => {
    tone({ freq: 900, type: 'sine', dur: 0.09, gain: 0.14, slide: 260 })
    hiss({ dur: 0.05, gain: 0.05, from: 3000, type: 'highpass' })
  }),
  /** Locking the guess in: a solid, satisfying click. */
  lock: fx(() => {
    tone({ freq: 220, type: 'square', dur: 0.06, gain: 0.08 })
    tone({ freq: 660, type: 'triangle', at: 0.05, dur: 0.18, gain: 0.12 })
    tone({ freq: 990, type: 'sine', at: 0.09, dur: 0.2, gain: 0.07 })
  }),
  /** One step of the points counting up — each a little higher. */
  tally: (progress: number) => {
    if (!settings.effects) return
    tone({ freq: 440 * 2 ** (progress * 1.6), type: 'triangle', dur: 0.05, gain: 0.05 })
  },
  /** A great guess. */
  ding: fx(() => {
    for (const [i, f] of [1046, 1318, 1568, 2093].entries()) tone({ freq: f, type: 'sine', at: i * 0.07, dur: 0.9, gain: 0.1 })
  }),
  /** A middling one. */
  chime: fx(() => {
    tone({ freq: 784, type: 'sine', dur: 0.5, gain: 0.1 })
    tone({ freq: 988, type: 'sine', at: 0.08, dur: 0.5, gain: 0.07 })
  }),
  /** A long way off. */
  thud: fx(() => {
    tone({ freq: 150, type: 'sine', dur: 0.5, gain: 0.3, slide: 55 })
    tone({ freq: 233, type: 'triangle', at: 0.04, dur: 0.45, gain: 0.06, slide: 196 })
  }),
  /** The round ends: one big hit as the music stops. */
  hit: fx(() => {
    tone({ freq: 110, type: 'sawtooth', dur: 1.4, gain: 0.12, slide: 55 })
    tone({ freq: 55, type: 'sine', dur: 1.6, gain: 0.35 })
    hiss({ dur: 1.2, gain: 0.12, from: 8000, to: 300, type: 'lowpass' })
  }),
  /** The trip is over. */
  fanfare: fx(() => {
    const notes = [523, 659, 784, 1046, 784, 1046]
    const times = [0, 0.13, 0.26, 0.39, 0.62, 0.75]
    notes.forEach((f, i) => {
      tone({ freq: f, type: 'triangle', at: times[i]!, dur: i === notes.length - 1 ? 1.2 : 0.22, gain: 0.13 })
      tone({ freq: f / 2, type: 'sawtooth', at: times[i]!, dur: i === notes.length - 1 ? 1.2 : 0.2, gain: 0.03 })
    })
  }),
}

/* ── the music ────────────────────────────────────────────────────────── */

/* A minor: Am – F – C – G, one chord a bar. */
const CHORDS = [
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [261.63, 329.63, 392],
  [196, 246.94, 293.66],
]
const BASS = [110, 87.31, 130.81, 98]

class Music {
  private timer: number | null = null
  private nextAt = 0
  private step = 0
  private level = 0
  private pad: { stop: () => void; set: (level: number) => void; chord: (notes: number[], at: number) => void } | null = null
  private sweptFinal = false

  /** 0 = the round just began, 1 = the final second. */
  setIntensity(level: number) {
    this.level = Math.max(0, Math.min(1, level))
    this.pad?.set(this.level)
    if (this.level > 0.93 && !this.sweptFinal && this.running) {
      this.sweptFinal = true
      hiss({ dur: 6, gain: 0.07, from: 300, to: 9000, bus: 'music', q: 4 })
    }
  }

  get running() {
    return this.timer !== null
  }

  start() {
    if (this.running || !settings.music) return
    const c = audio()
    if (!c) return
    this.sweptFinal = false
    this.step = 0
    this.nextAt = c.currentTime + 0.1
    this.pad = this.startPad(c)
    /* A look-ahead scheduler: notes are booked a little ahead, so a busy page never makes the beat stutter. */
    this.timer = window.setInterval(() => this.schedule(), 25)
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
    this.pad?.stop()
    this.pad = null
  }

  private startPad(c: AudioContext) {
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 500
    filter.Q.value = 3
    const amp = c.createGain()
    amp.gain.setValueAtTime(0.0001, c.currentTime)
    amp.gain.exponentialRampToValueAtTime(0.16, c.currentTime + 1.5)
    filter.connect(amp).connect(musicBus!)
    const oscs = [110, 110 * 1.004, 164.81, 220.5].map((f, i) => {
      const o = c.createOscillator()
      o.type = i % 2 ? 'sawtooth' : 'triangle'
      o.frequency.value = f
      o.connect(filter)
      o.start()
      return o
    })
    return {
      set: (level: number) => {
        const t = c.currentTime
        filter.frequency.setTargetAtTime(400 + level * 2600, t, 0.4)
      },
      stop: () => {
        const t = c.currentTime
        amp.gain.cancelScheduledValues(t)
        amp.gain.setTargetAtTime(0.0001, t, 0.08)
        for (const o of oscs) o.stop(t + 0.6)
      },
      chord: (notes: number[], at: number) => {
        oscs.forEach((o, i) => o.frequency.setTargetAtTime(notes[i % notes.length]! / (i < 2 ? 2 : 1), at, 0.05))
      },
    }
  }

  private schedule() {
    const c = ctx
    if (!c || !settings.music) return this.stop()
    const bpm = 92 + this.level * 58
    const sixteenth = 60 / bpm / 4
    while (this.nextAt < c.currentTime + 0.12) {
      this.play(this.step, this.nextAt - c.currentTime)
      this.nextAt += sixteenth
      this.step += 1
    }
  }

  private play(step: number, at: number) {
    const level = this.level
    const bar = Math.floor(step / 16) % 4
    const inBar = step % 16
    const chord = CHORDS[bar]!
    if (inBar === 0) this.pad?.chord(chord, (ctx?.currentTime ?? 0) + at)

    /* Heartbeat kick: on the beat from the start, doubled when it gets tense. */
    const kick = inBar % 4 === 0 || (level > 0.7 && inBar % 4 === 2)
    if (kick && (level > 0.05 || inBar === 0)) {
      tone({ freq: 120, type: 'sine', at, dur: 0.28, gain: 0.32 + level * 0.15, slide: 42, bus: 'music' })
    }
    /* Driving bass on the eighths. */
    if (level > 0.2 && inBar % 2 === 0) {
      tone({ freq: BASS[bar]!, type: 'sawtooth', at, dur: 0.16, gain: 0.05 + level * 0.05, bus: 'music', attack: 0.01 })
    }
    /* Hats: eighths, then sixteenths near the end. */
    if (level > 0.45 && (inBar % 2 === 1 || level > 0.8)) {
      hiss({ at, dur: 0.04, gain: 0.025 + level * 0.025, from: 9000, type: 'highpass', bus: 'music' })
    }
    /* A snare-like crack on 2 and 4 once it's tense. */
    if (level > 0.6 && (inBar === 4 || inBar === 12)) {
      hiss({ at, dur: 0.14, gain: 0.07, from: 1800, bus: 'music', q: 0.8 })
    }
    /* The climbing arpeggio. */
    if (level > 0.55) {
      const note = chord[step % 3]! * (inBar >= 8 ? 4 : 2)
      tone({ freq: note, type: 'triangle', at, dur: 0.1, gain: 0.025 + (level - 0.55) * 0.06, bus: 'music' })
    }
  }
}

export const music = new Music()
