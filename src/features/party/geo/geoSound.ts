/**
 * Somewhere's sound: every effect and the music are synthesised here with Web
 * Audio — nothing to download, nothing licensed, and it starts instantly.
 *
 * The music is "Night Drive": an 80s synthwave groove — pulsing bass, a gated
 * chord pad, a glittering arpeggio and a big echoing snare — that stays easy
 * while you explore. The last fifteen seconds open it up: the sound brightens, the
 * hats double, the tempo climbs from 100 to 140, a riser sweeps and a snare
 * roll runs to zero, where it stops on one deep hit.
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
let hall: ConvolverNode | null = null

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
    musicBus.gain.value = 0.6
    musicBus.connect(master)
    fxBus = ctx.createGain()
    fxBus.gain.value = 0.7
    fxBus.connect(master)
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    /* A hall for the music's snare and arpeggio: decaying, low-passed noise as the impulse. */
    hall = ctx.createConvolver()
    const length = ctx.sampleRate * 2.8
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let channel = 0; channel < 2; channel++) {
      const d = impulse.getChannelData(channel)
      let smooth = 0
      for (let i = 0; i < length; i++) {
        smooth += (Math.random() * 2 - 1 - smooth) * 0.18
        d[i] = smooth * Math.pow(1 - i / length, 2.6)
      }
    }
    hall.buffer = impulse
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    hall.connect(wet).connect(musicBus)
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

function hiss({ at = 0, dur, gain, from = 2000, to, type = 'bandpass', bus = 'fx', q = 1, wet = 0 }: { at?: number; dur: number; gain: number; from?: number; to?: number; type?: BiquadFilterType; bus?: 'fx' | 'music'; q?: number; wet?: number }) {
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
  if (wet > 0 && hall) {
    const send = c.createGain()
    send.gain.value = wet
    amp.connect(send).connect(hall)
  }
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

/* ── the music: "Night Drive" ─────────────────────────────────────────── */

const hz = (root: number, semitones: number) => root * 2 ** (semitones / 12)

/** A synth note through its own low-pass, with some of it sent into the hall. Times are relative to now. */
function synth({ freq, at, dur, gain, type = 'sawtooth', cutoff = 2000, q = 1, slide, detune = 0, wet = 0 }: { freq: number; at: number; dur: number; gain: number; type?: OscillatorType; cutoff?: number; q?: number; slide?: number; detune?: number; wet?: number }) {
  const c = ctx
  if (!c || !musicBus) return
  const t = c.currentTime + at
  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  osc.detune.value = detune
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur)
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoff
  filter.Q.value = q
  const amp = c.createGain()
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.005)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(filter).connect(amp).connect(musicBus)
  if (wet > 0 && hall) {
    const send = c.createGain()
    send.gain.value = wet
    amp.connect(send).connect(hall)
  }
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/* A minor loop: Am – F – C – G. Chords are semitones from A4; roots are the bass notes. */
const CHORDS = [
  [-12, -9, -5],
  [-16, -12, -9],
  [-9, -5, -2],
  [-14, -10, -7],
]
const ROOTS = [55, 43.65, 65.41, 49]

class Music {
  private timer: number | null = null
  private nextAt = 0
  private step = 0
  private level = 0

  /** 0 while exploring; rises from 0 to 1 across the last fifteen seconds. */
  setIntensity(level: number) {
    this.level = Math.max(0, Math.min(1, level))
  }

  get running() {
    return this.timer !== null
  }

  start() {
    if (this.running || !settings.music) return
    const c = audio()
    if (!c) return
    this.step = 0
    this.nextAt = c.currentTime + 0.1
    /* A look-ahead scheduler: notes are booked a little ahead, so a busy page never makes the beat stutter. */
    this.timer = window.setInterval(() => this.schedule(), 25)
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
  }

  private schedule() {
    const c = ctx
    if (!c || !settings.music) return this.stop()
    const beat = 60 / (100 + this.level * 40)
    /*
     * A hidden tab (a locked phone, another app) wakes this timer only about
     * once a second. Never play the backlog in one burst: skip what was
     * missed and stay silent until the game is on screen again, in time.
     */
    if (document.hidden || this.nextAt < c.currentTime - 0.05) {
      while (this.nextAt < c.currentTime + 0.02) {
        this.nextAt += beat / 4
        this.step += 1
      }
      if (document.hidden) return
    }
    while (this.nextAt < c.currentTime + 0.12) {
      this.play(this.step, this.nextAt - c.currentTime, beat)
      this.nextAt += beat / 4
      this.step += 1
    }
  }

  private play(step: number, at: number, beat: number) {
    const u = this.level
    const barN = Math.floor(step / 16) % 4
    const inBar = step % 16
    const chord = CHORDS[barN]!

    /* Kick on every beat. */
    if (inBar % 4 === 0) {
      synth({ freq: 110, slide: 36, at, dur: 0.45, gain: 0.6 + u * 0.2, type: 'sine', cutoff: 600 })
      hiss({ at, dur: 0.03, gain: 0.12, from: 3000, bus: 'music' })
    }
    /* The big echoing snare on 2 and 4. */
    if (inBar === 4 || inBar === 12) hiss({ at, dur: 0.35, gain: 0.13, from: 1600, q: 0.6, bus: 'music', wet: 0.7 })
    /* Hats on the off-sixteenths — every sixteenth once the clock is low. */
    if (step % 2 === 1 || u > 0.2) hiss({ at, dur: 0.03, gain: 0.025 + u * 0.03, from: 8000, type: 'highpass', bus: 'music' })
    /* Pulsing eighth-note bass and a gated chord pad, both brightening at the end. */
    if (step % 2 === 0) {
      synth({ freq: ROOTS[barN]!, at, dur: 0.18, gain: 0.12, cutoff: 500 + u * 1500, q: 4 })
      chord.forEach((c, k) => synth({ freq: hz(440, c), at, dur: beat * 0.45, gain: 0.022, cutoff: 1400 + u * 3500, detune: (k - 1) * 8, wet: 0.4 }))
    }
    /* The glittering arpeggio. */
    synth({ freq: hz(880, chord[step % 3]! + (step % 6 >= 3 ? 12 : 0)), at, dur: 0.1, gain: 0.018 + u * 0.02, type: 'square', cutoff: 4000, wet: 0.5 })
    /* The final stretch: a riser each bar, then a snare roll to the end. */
    if (u > 0.5 && inBar === 0) hiss({ at, dur: 2.2, gain: 0.06, from: 300, to: 8000, q: 3, bus: 'music', wet: 0.4 })
    if (u > 0.7) {
      hiss({ at, dur: 0.12, gain: 0.03 + u * 0.06, from: 1800, q: 0.7, bus: 'music', wet: 0.2 })
      synth({ freq: 190, slide: 140, at, dur: 0.08, gain: (0.03 + u * 0.06) * 0.6, type: 'triangle', cutoff: 2000 })
    }
  }
}

export const music = new Music()
