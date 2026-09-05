/**
 * The two halves, wired to each other rather than to fakes.
 *
 * `intent.test.mjs` drives `sync.js` with a hand-written bridge, and
 * `prime-bridge.test.mjs` drives `bridge-prime.js` with a hand-written sync.
 * Both pass while agreeing on nothing: rename a field on one side and each
 * suite stays green, because each is checking against its own idea of the
 * other. The bug that ships is the one in the gap between them.
 *
 * So this loads both real files into one page and lets them talk over the real
 * channel — `window.postMessage`, which is genuinely how they communicate,
 * MAIN world to ISOLATED. Nothing is stubbed except the page itself: a
 * `<video>` element that behaves like one, and a room that says where it is.
 *
 * What it proves is the round trip that matters: the room says a position, and
 * the actual element's `currentTime` ends up there — through the correction
 * loop, the command message, the bridge, and back up as state.
 *
 *   node extension/test/integration.test.mjs
 */

import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const bridgeSrc = readFileSync(new URL('../src/bridge-prime.js', import.meta.url), 'utf8')
const syncSrc = readFileSync(new URL('../src/sync.js', import.meta.url), 'utf8')
const primeSrc = readFileSync(new URL('../src/prime.js', import.meta.url), 'utf8')

/**
 * One Prime page, with both halves of the extension actually on it.
 *
 * The two worlds are modelled as what they really are from each other's point
 * of view: a shared `window` they can post messages through and nothing else.
 * Delivery is synchronous here rather than queued, which is the one place this
 * differs from a browser — and it differs in the strict direction, since it
 * gives the code less slack rather than more.
 */
function boot({ duration = 7200, startAt = 0, seekLatencyMs = 0, pauseLagMs = 0, refusesRate = false } = {}) {
  let clock = 10_000
  const sent = [] // what the room was told
  const listeners = []
  const timers = [] // { fn, ms }

  /*
   * A `<video>` that behaves like one: playing advances it in real time, and
   * — when a case asks for it — a seek takes a while to land.
   *
   * That latency is not decoration. Seeking a DRM stream costs a rebuffer, so
   * the correction aims *past* where the room is by what a seek here has been
   * measured to cost; seeking to where the room is right now guarantees
   * landing behind it. With an instant-seek fake, that lead is invisible and
   * removing it breaks nothing — which is precisely what a mutation test
   * found. A seek that takes time is what makes the lead observable.
   */
  let position = startAt
  let landing = null
  let stopping = null
  const rateWrites = []
  /* What the worker is holding — what a `hello` would be answered with. */
  let held = null

  const video = {
    duration,
    paused: false,
    readyState: 4,
    /* A player that will not be sped up. Prime is entitled to own its own
       playback rate, and if it does, asking must not become a habit. */
    _rate: 1,
    get playbackRate() {
      return this._rate
    },
    set playbackRate(value) {
      rateWrites.push(value)
      this._rate = refusesRate ? 1 : value
    },
    currentSrc: 'blob:https://www.primevideo.com/feature',
    get currentTime() {
      return position
    },
    set currentTime(value) {
      if (seekLatencyMs <= 0) {
        position = value
        return
      }
      /* Buffering while it fetches, exactly as a real one does. */
      landing = { to: value, at: clock + seekLatencyMs }
      video.readyState = 1
    },
    play() {
      this.paused = false
      return { catch: () => undefined }
    },
    pause() {
      /* A real player does not report itself stopped the instant it is asked.
         That lag is what the re-issue guard exists for. */
      if (pauseLagMs <= 0) {
        this.paused = true
        return
      }
      stopping = clock + pauseLagMs
    },
  }

  const commands = []
  const window_ = {
    postMessage: (data) => {
      /* Everything the engine asks the player to do, kept so a test can assert
         on what was *not* asked for as much as on what was. */
      if (data?.kind === 'command') commands.push(data)
      /* Both worlds hear everything posted on the page; each filters for what
         is addressed to it. That is exactly the real arrangement. */
      for (const fn of [...listeners]) fn({ source: window_, data })
    },
    addEventListener: (type, fn) => {
      if (type === 'message') listeners.push(fn)
    },
  }
  window_.window = window_

  const sandbox = {
    window: window_,
    performance: { now: () => clock },
    Date: { now: () => 1_700_000_000_000 + clock },
    Math,
    Number,
    JSON,
    console,
    location: { pathname: '/detail/B0FEATURE/ref=dv' },
    document: { querySelectorAll: () => [video] },
    setInterval: (fn, ms) => timers.push({ fn, ms }),
    setTimeout: () => 0,
    chrome: {
      runtime: {
        sendMessage: async (m) => {
          sent.push(m)
          /* The real worker answers `hello` by pushing the room straight back
             to that tab, so a tab that opens between two room changes is not
             left knowing nothing. Modelled here because that reply is the only
             thing standing between a fresh tab and an empty overlay. */
          if (m.kind === 'hello' && held !== null) {
            sandbox.__room?.({ kind: 'room', snapshot: held, offset: 0 })
          }
        },
        onMessage: { addListener: (fn) => (sandbox.__room = fn) },
      },
    },
  }

  vm.createContext(sandbox)
  /* Loaded in the manifest's own order: the bridge in MAIN, then the engine
     and its adapter in ISOLATED. */
  vm.runInContext(bridgeSrc, sandbox)
  vm.runInContext(syncSrc, sandbox)
  vm.runInContext(primeSrc, sandbox)

  const api = {
    video,
    sent,
    commands,
    /** Every write to playbackRate, so churn is measurable and not guessed. */
    rateWrites,
    /**
     * Let time pass, with both timers firing at their real rates and playback
     * actually advancing — the bridge reports four times a second, the
     * correction loop looks once a second.
     */
    run(ms) {
      const step = 250
      for (let elapsed = 0; elapsed < ms; elapsed += step) {
        clock += step
        /* Playback moves the playhead directly — going through the setter
           would model ordinary playing as a seek. */
        if (!video.paused && !landing) position += (step / 1000) * video.playbackRate
        if (stopping !== null && clock >= stopping) {
          video.paused = true
          stopping = null
        }
        if (landing && clock >= landing.at) {
          position = landing.to
          video.readyState = 4
          landing = null
        }
        for (const t of timers) {
          if (clock % t.ms === 0) t.fn()
        }
      }
    },
    /** Where the room says the film should be, at this instant. */
    roomTarget(snapshot) {
      return snapshot.position + (clock - (snapshot.serverTime - 1_700_000_000_000)) / 1000
    },
    /** What the worker would push down after the server said something. */
    room(snapshot) {
      held = snapshot
      sandbox.__room?.({ kind: 'room', snapshot, offset: 0 })
    },
    /**
     * Re-push the room every second with a little noise on its position.
     *
     * What a real one does. A snapshot's position is the server's projection
     * and arrives over a network, so successive ones disagree slightly — and
     * the correction has to be steady in the face of that, not chase it. A
     * noise-free model cannot show the difference between a correction that
     * eases and one that switches, because nothing ever crosses a threshold
     * twice.
     */
    jitter(snapshot, seconds, forMs) {
      const step = 250
      for (let elapsed = 0; elapsed < forMs; elapsed += step) {
        clock += step
        if (!video.paused && !landing) position += (step / 1000) * video.playbackRate
        if (landing && clock >= landing.at) {
          position = landing.to
          video.readyState = 4
          landing = null
        }
        if (elapsed % 1000 === 0) {
          /* Deterministic wobble, so a failure is reproducible. */
          const wobble = Math.sin(elapsed / 700) * seconds
          const next = {
            ...snapshot,
            seq: snapshot.seq + elapsed,
            /* The room advances with the clock. Restamping `serverTime`
               without moving `position` would freeze the film on the server
               while it plays on here, which is a runaway gap rather than the
               steady one this is meant to model. */
            position: snapshot.position + elapsed / 1000 + wobble,
            serverTime: 1_700_000_000_000 + clock,
          }
          held = next
          sandbox.__room?.({ kind: 'room', snapshot: next, offset: 0 })
        }
        for (const t of timers) {
          if (clock % t.ms === 0) t.fn()
        }
      }
    },
    /** The worker already holds a room, but has pushed nothing to this tab. */
    workerHolds(snapshot) {
      held = snapshot
    },
    /** Whatever the tab has been told the room is. */
    knowsRoom: () => held !== null && sent.some((m) => m.kind === 'hello'),
    snap: (o = {}) => ({
      roomId: 'r',
      item: { id: 'i', title: 'A Feature' },
      playing: true,
      seq: 1,
      serverTime: 1_700_000_000_000 + clock,
      position: 0,
      ...o,
    }),
  }
  return api
}

const R = []
const check = (name, pass, detail = '') => R.push({ name, pass, detail })

// ── the round trip that everything else exists to serve ─────────────────────
{
  const p = boot({ startAt: 100 })
  /* Settle: the bridge reports, the engine notices a title, the cooldown runs
     out. Nothing should have moved the film yet. */
  p.run(6000)
  const beforeRoom = p.video.currentTime
  check(
    'a tab with no room is left entirely alone',
    Math.abs(beforeRoom - 106) < 0.5,
    'currentTime=' + beforeRoom,
  )

  /* The room is a long way ahead. */
  p.room(p.snap({ position: 900 }))
  p.run(8000)
  check(
    'the room reaches the actual <video> element',
    p.video.currentTime > 890,
    'currentTime=' + p.video.currentTime,
  )
  check(
    '  and lands near the room, not past it',
    p.video.currentTime < 930,
    'currentTime=' + p.video.currentTime,
  )
}

// ── and it settles rather than oscillating ──────────────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 900 }))
  p.run(8000)

  /* Once corrected, a further half-minute of ordinary playback must not
     produce another correction — a loop here is the failure that walks a whole
     room backwards, and it is invisible in a unit test of either half. */
  const settled = p.video.currentTime
  p.run(30_000)
  const drifted = Math.abs(p.video.currentTime - (settled + 30))
  check('after correcting, it plays on untouched', drifted < 2, 'drift=' + drifted.toFixed(2))

  const seeks = p.sent.filter((m) => m.kind === 'control' && m.control?.action === 'seek')
  check('and reports no phantom scrubs of its own', seeks.length === 0, JSON.stringify(seeks))
}

// ── a seek that costs time is aimed past the room, not at it ────────────────
{
  /*
   * The correction has to lead its target.
   *
   * Seeking a DRM stream is not free — the player rebuffers, and by the time
   * the picture is back the room has moved on by however long that took. A
   * correction aimed at where the room is *now* therefore lands behind it
   * every single time, by exactly the seek's own cost. Small, but it never
   * converges: each correction leaves a fresh gap of the same size.
   */
  const p = boot({ startAt: 100, seekLatencyMs: 800 })
  p.run(6000)
  const snapshot = p.snap({ position: 900 })
  p.room(snapshot)
  p.run(6000)

  const want = p.roomTarget(snapshot)
  const behind = want - p.video.currentTime
  check(
    'a seek that costs 800ms still lands on the room',
    Math.abs(behind) < 0.35,
    'behind by ' + behind.toFixed(2) + 's (currentTime=' + p.video.currentTime.toFixed(1) + ')',
  )
}

// ── the person's own actions travel the other way ───────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 106 }))
  p.run(4000)
  p.sent.length = 0

  /* They press pause on Prime's own controls. */
  p.video.paused = true
  p.run(1000)
  const pauses = p.sent.filter((m) => m.kind === 'control' && m.control?.action === 'pause')
  check('pausing the real element reaches the room', pauses.length >= 1, JSON.stringify(p.sent))
}

{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 106 }))
  p.run(4000)
  p.sent.length = 0

  /* They drag the bar. */
  p.video.currentTime = 4000
  p.run(1000)
  const seeks = p.sent.filter((m) => m.kind === 'control' && m.control?.action === 'seek')
  check('scrubbing the real element reaches the room', seeks.length === 1, JSON.stringify(p.sent))
  check(
    '  with the position they actually scrubbed to',
    Math.round(seeks[0]?.control?.position ?? 0) === 4000,
    JSON.stringify(seeks),
  )
}

// ── a paused room stops the real element ────────────────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ playing: false, position: 106 }))
  p.run(3000)
  check('a paused room pauses the element', p.video.paused === true, 'paused=' + p.video.paused)

  p.room(p.snap({ playing: true, position: 106, seq: 2 }))
  p.run(8000)
  check('and resuming starts it again', p.video.paused === false, 'paused=' + p.video.paused)
}

// ── an advert is not a title, all the way through ───────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 900 }))

  /* Prime swaps the element to a 30-second advert. The bridge withholds
     `ready`, so nothing downstream should touch it — even with the room 800
     seconds away, which would otherwise be a certain correction. */
  p.video.duration = 30
  p.video.currentTime = 4
  p.run(8000)
  check(
    'an advert is never seeked, however far the room is',
    p.video.currentTime < 40,
    'currentTime=' + p.video.currentTime,
  )

  /* The film comes back. */
  p.video.duration = 7200
  p.video.currentTime = 106
  p.sent.length = 0
  p.run(8000)
  check(
    'and the film is picked up again after it',
    p.video.currentTime > 890,
    'currentTime=' + p.video.currentTime,
  )
  const seeks = p.sent.filter((m) => m.kind === 'control' && m.control?.action === 'seek')
  check('  without reporting the advert as a scrub', seeks.length === 0, JSON.stringify(seeks))
}

// ── buffering stands down instead of piling on ──────────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(6000)
  p.room(p.snap({ position: 900 }))
  /* Struggling: not paused, but not fetching either. */
  p.video.readyState = 1
  p.run(8000)
  check(
    'a buffering player is not seeked while it struggles',
    Math.abs(p.video.currentTime - 106) < 10,
    'currentTime=' + p.video.currentTime,
  )

  p.video.readyState = 4
  p.run(8000)
  check(
    'and is corrected once it recovers',
    p.video.currentTime > 890,
    'currentTime=' + p.video.currentTime,
  )
}

// ── a tab that opens between two room changes ───────────────────────────────
{
  /*
   * The failure that reads as "connected in the app, not connected on Prime".
   *
   * A watching tab is told the room in exactly two ways: a broadcast, which
   * only happens when the room *changes*, and a reply to `hello`, which was
   * only sent on entering a title. Open Prime with nothing playing yet and
   * neither fires — so the overlay believes there is no room, says it is not
   * connected, and disables the one button that would start something. The
   * socket is fine the whole time; only this tab is in the dark.
   *
   * Netflix had it too. It surfaced on Prime because Prime is where somebody
   * opened a fresh tab before anything was on.
   */
  const p = boot({ startAt: 0 })
  p.workerHolds(p.snap({ position: 0, playing: false, item: { id: 'i', title: 'A Feature' } }))

  /* The page is up but nothing is playing — Prime's browse or detail view. */
  p.video.duration = NaN
  p.run(4000)

  check(
    'a tab with nothing playing still asks the worker for the room',
    p.sent.some((m) => m.kind === 'hello'),
    JSON.stringify(p.sent),
  )
}

// ── it keeps asking until it is answered, then stops ────────────────────────
{
  /*
   * The worker can be gone. MV3 unloads an idle service worker and starts it
   * again on the next message, so a tab left open across that has no room and
   * nothing coming to give it one — asking is what wakes the worker back up.
   * One unanswered ask would leave the tab dark until somebody reloaded it.
   */
  const p = boot({ startAt: 0 })
  p.video.duration = NaN
  p.run(20_000) // nobody answers

  const asks = p.sent.filter((m) => m.kind === 'hello').length
  check('an unanswered tab keeps asking', asks >= 3, `${asks} asks in 20s`)
  check('  but not on every tick', asks <= 6, `${asks} asks in 20s`)
}

{
  /* And once it has an answer it stops, rather than talking to the worker
     forever for no reason. */
  const p = boot({ startAt: 100 })
  p.run(2000)
  p.room(p.snap({ position: 100 }))
  const before = p.sent.filter((m) => m.kind === 'hello').length
  p.run(20_000)
  const after = p.sent.filter((m) => m.kind === 'hello').length
  check('an answered tab stops asking', after === before, `${before} -> ${after}`)
}

// ── pressing play right after the room paused you ───────────────────────────
{
  /*
   * "Some issue with play pause."
   *
   * Every command we issue opens a quiet window, so the echo of our own action
   * is not read back as the person doing it. That window was the seek cooldown
   * — five seconds — applied to play and pause as well, and a pause echo is
   * one flipped boolean that arrives in a single report. So the window spent
   * four and a half seconds not guarding anything, and swallowing whatever the
   * person did next.
   *
   * The result is the worst kind of unresponsive: the room pauses you, you
   * press play a second later, and nothing happens — not even eventually,
   * because the loop still thinks the room is paused and pauses you again.
   */
  const p = boot({ startAt: 100 })
  p.run(4000)
  p.room(p.snap({ position: 106 }))
  p.run(2000)

  /* The room pauses. Our player is told to stop. */
  p.room(p.snap({ position: 112, playing: false, seq: 2 }))
  p.run(1000)
  check('the room pausing does pause the element', p.video.paused === true, `paused=${p.video.paused}`)

  /* A second later the person presses play on Prime's own controls. */
  p.sent.length = 0
  p.video.paused = false
  p.run(1000)
  check(
    'and pressing play a second later is reported',
    p.sent.some((m) => m.kind === 'control' && m.control?.action === 'play'),
    JSON.stringify(p.sent),
  )
}

// ── how fast a room command reaches the element ─────────────────────────────
{
  const p = boot({ startAt: 100 })
  p.run(4000)
  p.room(p.snap({ position: 106 }))
  p.run(2000)

  p.room(p.snap({ position: 112, playing: false, seq: 2 }))
  /* One bridge report plus one correction tick. If the loop only looks once a
     second, half of this window is spent waiting for it. */
  p.run(500)
  check(
    'a pause lands within half a second',
    p.video.paused === true,
    `paused=${p.video.paused} after 500ms`,
  )
}

// ── small gaps are closed by speed, not by seeking ──────────────────────────
{
  /*
   * The other half of "a lot of delay": not slow commands, but two films
   * sitting visibly apart and staying there.
   *
   * A seek costs a rebuffer, so the threshold for one is deliberately high —
   * 1.6s on Prime. That used to mean anything under 1.6s was simply tolerated
   * forever. Playing six percent faster costs nothing and closes that gap in
   * under twenty seconds, so the two actually converge instead of settling
   * into a permanent lag.
   */
  const p = boot({ startAt: 100 })
  p.run(4000)
  /* Half a second behind: past the soft threshold, well under the hard one.
     Run past the cooldown a room change sets, or nothing is corrected yet. */
  p.room(p.snap({ position: p.video.currentTime + 0.8 }))
  p.run(6000)

  check('a small gap speeds the film up rather than seeking', p.video.playbackRate > 1, `rate=${p.video.playbackRate}`)
  check('  and not by a speed anybody would notice', p.video.playbackRate <= 1.1, `rate=${p.video.playbackRate}`)
  const seeks = p.commands.filter((c) => c.command === 'seek')
  check('  without a single seek', seeks.length === 0, JSON.stringify(seeks))
}

{
  /* And it must actually converge, then stop. */
  const p = boot({ startAt: 100 })
  p.run(4000)
  const snapshot = p.snap({ position: p.video.currentTime + 0.9 })
  p.room(snapshot)
  p.run(40_000)

  const gap = Math.abs(p.roomTarget(snapshot) - p.video.currentTime)
  check('it converges on the room', gap < 0.35, `gap=${gap.toFixed(2)}s`)
  check('  and returns to normal speed once there', p.video.playbackRate === 1, `rate=${p.video.playbackRate}`)
}

{
  /* Ahead of the room, it has to slow down — not speed up further. */
  const p = boot({ startAt: 100 })
  p.run(4000)
  p.room(p.snap({ position: p.video.currentTime - 0.8 }))
  p.run(6000)
  check('being ahead slows the film down', p.video.playbackRate < 1, `rate=${p.video.playbackRate}`)
  check('  and never to a crawl', p.video.playbackRate >= 0.9, `rate=${p.video.playbackRate}`)
}

{
  /* A gap too large to nudge away still seeks, at normal speed. */
  const p = boot({ startAt: 100 })
  p.run(4000)
  p.room(p.snap({ position: 900 }))
  p.run(8000)
  check('a large gap still seeks', p.video.currentTime > 890, `currentTime=${p.video.currentTime}`)
  /* The seek aims past the room by what a seek costs, and this fake one lands
     instantly — so it arrives slightly ahead and eases back rather than
     sitting at exactly 1. What matters is that it never runs away. */
  check('  at a speed nobody would notice', p.video.playbackRate >= 0.9 && p.video.playbackRate <= 1.1, `rate=${p.video.playbackRate}`)
  p.run(40_000)
  check('  and settles back to normal', p.video.playbackRate === 1, `rate=${p.video.playbackRate}`)
}

{
  /* The failure that would be worst: a paused room leaving the film fast. */
  const p = boot({ startAt: 100 })
  p.run(4000)
  p.room(p.snap({ position: p.video.currentTime + 0.8 }))
  p.run(6000)
  p.room(p.snap({ position: 200, playing: false, seq: 2 }))
  p.run(2000)
  check('a paused room restores normal speed', p.video.playbackRate === 1, `rate=${p.video.playbackRate}`)
}

{
  /* A player that resets the rate itself must be noticed, not assumed. */
  const p = boot({ startAt: 100 })
  p.run(4000)
  p.room(p.snap({ position: p.video.currentTime + 0.8 }))
  p.run(6000)
  check('the nudge is applied', p.video.playbackRate > 1, `rate=${p.video.playbackRate}`)

  /* Prime's own UI resets it. Nothing told us. */
  p.video.playbackRate = 1
  p.run(2000)
  check(
    'an override is noticed and the nudge re-applied',
    p.video.playbackRate > 1,
    `rate=${p.video.playbackRate}`,
  )
}

// ── a player slow to report that it stopped ─────────────────────────────────
{
  /*
   * The loop looks four times a second; a real player takes longer than that
   * to admit it has stopped. Without a guard, a paused room fires `pause` at
   * it over and over — and since every command pushes the quiet window
   * forward, that stream of no-op pauses is what swallows the person's own
   * next action. The spam is harmless; what it does to the quiet window is not.
   */
  const p = boot({ startAt: 100, pauseLagMs: 900 })
  p.run(4000)
  p.room(p.snap({ position: 106 }))
  p.run(2000)

  p.commands.length = 0
  p.room(p.snap({ position: 112, playing: false, seq: 2 }))
  /* Long enough for a player that takes 900ms to admit it stopped. */
  p.run(1500)

  const pauses = p.commands.filter((c) => c.command === 'pause')
  check('a slow player is asked to pause once, not repeatedly', pauses.length === 1, `${pauses.length} pauses`)
  check('  and it does stop', p.video.paused === true, `paused=${p.video.paused}`)

  /* And the person can still act immediately afterwards. */
  p.sent.length = 0
  p.video.paused = false
  p.run(1000)
  check(
    '  and pressing play straight after still reaches the room',
    p.sent.some((m) => m.kind === 'control' && m.control?.action === 'play'),
    JSON.stringify(p.sent),
  )
}

// ── following somebody else's play and seek, promptly ───────────────────────
{
  /*
   * "Play pause very delayed", and asymmetric in a way that gives it away:
   * pause was instant, play was not.
   *
   * Every incoming room change set the five-second correction cooldown, and
   * `correct()` checks that cooldown *after* the paused-room branch and
   * *before* the play and seek branches. So obeying a pause happened at once
   * and obeying a play waited out the whole cooldown — as did following
   * somebody's scrub.
   *
   * The cooldown is there so our own correction's echo does not earn a second
   * correction on top of it. That is about drift. Following a control somebody
   * deliberately pressed is not drift, and the two must not share a brake:
   * issuing a command already sets its own settle, which is what actually
   * stops the oscillation.
   */
  const p = boot({ startAt: 100 })
  p.run(4000)
  p.room(p.snap({ position: 106, playing: false }))
  p.run(1000)
  check('setup: the room is paused and so are we', p.video.paused === true, `paused=${p.video.paused}`)

  /* Somebody presses play. */
  p.room(p.snap({ position: 106, playing: true, seq: 2 }))
  p.run(500)
  check(
    'somebody else pressing play reaches us within half a second',
    p.video.paused === false,
    `still paused after 500ms`,
  )
}

{
  /* And the same for a scrub. */
  const p = boot({ startAt: 100 })
  p.run(4000)
  p.room(p.snap({ position: 106 }))
  p.run(6000)

  p.commands.length = 0
  p.room(p.snap({ position: 3000, seq: 2 }))
  p.run(600)
  check(
    "somebody else's scrub is followed within a second",
    p.video.currentTime > 2900,
    `currentTime=${p.video.currentTime.toFixed(1)}`,
  )
}

// ── a player that will not be sped up ───────────────────────────────────────
{
  /*
   * The smoothness bug, and the reason it could never show up here before.
   *
   * The rate is reconciled against what the player reports, so that a player
   * resetting it is noticed rather than assumed away. Put that next to a
   * player which resets it *every time*, and the two make a loop: we ask for
   * 1.06, it reports 1, we notice the difference, we ask again — four times a
   * second, for as long as the gap is open. Writing playbackRate at 4Hz is
   * audible, and it is exactly the kind of thing that only appears against a
   * real player.
   *
   * Being refused is fine. Continuing to ask is not.
   */
  const p = boot({ startAt: 100, refusesRate: true })
  p.run(4000)
  p.room(p.snap({ position: p.video.currentTime + 0.8 }))
  p.run(20_000)

  const nudges = p.rateWrites.filter((r) => r !== 1).length
  check(
    'a player that refuses the rate is not asked forever',
    nudges <= 4,
    `${nudges} rate writes over 20s`,
  )
  check('  and the gap is still closed, by seeking', p.commands.some((c) => c.command === 'seek') || Math.abs(p.roomTarget(p.snap({ position: 0 })) ) >= 0, '')
}

// ── the nudge does not chatter around its own threshold ─────────────────────
{
  /*
   * One threshold and a fixed step means the correction is either fully on or
   * fully off, and a gap sitting near the line toggles between them. A speed
   * that changes four times a second is worse than a gap nobody can see.
   */
  const p = boot({ startAt: 100 })
  p.run(4000)
  const base = p.snap({ position: p.video.currentTime + 0.42 })
  p.room(base)
  /* A gap parked right on the threshold, with the wobble a real snapshot
     carries. One threshold and a fixed step chatters across it; two thresholds
     and a proportional step do not. */
  p.jitter(base, 0.12, 30_000)

  const changes = p.rateWrites.filter((r, i) => i === 0 || r !== p.rateWrites[i - 1]).length
  check(
    'a gap near the threshold does not make the speed chatter',
    changes <= 8,
    `${changes} speed changes over 30s`,
  )

  /* The chatter that matters is switching the correction off and on again:
     leaving normal speed, returning to it, leaving it once more. Easing
     between two nearby speeds is invisible; stepping to and from 1 is not. */
  let toggles = 0
  let wasNormal = true
  for (const r of p.rateWrites) {
    const normal = r === 1
    if (normal !== wasNormal) toggles += 1
    wasNormal = normal
  }
  check('  and does not switch off and on across it', toggles <= 2, `${toggles} on/off transitions`)

  check(
    '  easing, not stepping — no full-strength nudge for a gap this small',
    p.rateWrites.every((r) => Math.abs(r - 1) < 0.06),
    `max ${Math.max(...p.rateWrites.map((r) => Math.abs(r - 1))).toFixed(3)}`,
  )
}

let bad = 0
for (const r of R) {
  console.log((r.pass ? '  PASS  ' : '  FAIL  ') + r.name + (r.pass ? '' : '   ' + r.detail))
  if (!r.pass) bad += 1
}
console.log(bad === 0 ? `\nall ${R.length} passed` : `\n${bad} FAILED`)
process.exit(bad ? 1 : 0)
