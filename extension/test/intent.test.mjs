/**
 * Telling the person's actions apart from our own.
 *
 * This is the one piece of the extension that cannot be checked by looking at
 * it. Every correction moves the player, and a correction reported back to the
 * room as a fresh intent is a loop that walks everybody's film backwards — so
 * the interesting cases are all the ones where something moved and nothing
 * should be said about it.
 *
 * Two of these failed when they were first written, both for the same reason:
 * a stalled player reports the same timestamp twice, which read as somebody
 * dragging the bar backwards. That is the worst possible false positive here,
 * because the room would then seek everybody to a stalled player's position.
 *
 * Now covering `sync.js`, which both Netflix and Prime Video run — the logic
 * moved there so a second site is an adapter rather than a second copy of the
 * part that was hard to get right.
 *
 *   node extension/test/intent.test.mjs
 */

import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const src = readFileSync(new URL('../src/sync.js', import.meta.url), 'utf8')

/** A fresh, fully isolated sync instance with everything stubbed around it. */
function bootSync(siteOptions = {}) {
  let clock = 10_000
  const sent = [] // control intents reported to the room
  const commands = [] // commands issued to the player
  const hellos = [] // "entered a title" announcements
  const msgListeners = []
  const roomListeners = []
  const timers = []

  const sandbox = {
    performance: { now: () => clock },
    Date: { now: () => 1_700_000_000_000 + clock },
    Math,
    console,
    JSON,
    setInterval: (fn) => {
      timers.push(fn)
      return timers.length
    },
    setTimeout: () => 0,
    chrome: {
      runtime: {
        sendMessage: async (m) => {
          if (m.kind === 'control') sent.push(m.control)
          if (m.kind === 'hello') hellos.push(m.titleId)
        },
        onMessage: { addListener: (fn) => roomListeners.push(fn) },
      },
    },
  }
  sandbox.window = {
    addEventListener: (type, fn) => {
      if (type === 'message') msgListeners.push(fn)
    },
    postMessage: (m) => commands.push(m),
  }
  sandbox.window.window = sandbox.window

  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)
  sandbox.window.__huddleStartSync(siteOptions)

  const api = {
    get clock() {
      return clock
    },
    advance: (ms) => {
      clock += ms
    },
    sent,
    commands,
    hellos,
    /** A state push from the bridge. */
    push: (state) =>
      msgListeners.forEach((fn) =>
        fn({
          source: sandbox.window,
          data: {
            channel: 'huddle',
            kind: 'state',
            at: clock,
            ready: true,
            titleKey: 'title-1',
            buffering: false,
            ...state,
          },
        }),
      ),
    /** A room snapshot from the worker. */
    room: (snapshot) => roomListeners.forEach((fn) => fn({ kind: 'room', snapshot, offset: 0 })),
    tick: () => timers.forEach((fn) => fn()),
    resync: () => sandbox.window.__huddleResync(),
  }
  api.snap = (o) => ({
    roomId: 'r',
    item: { id: 'i', title: 'T' },
    playing: true,
    seq: 1,
    serverTime: 1_700_000_000_000 + clock,
    position: 0,
    ...o,
  })
  return api
}

const R = []
const check = (name, pass, detail = '') => R.push({ name, pass, detail })

// ── 1. steady playback reports nothing ──────────────────────────────────────
{
  const s = bootSync()
  s.push({ position: 100, paused: false })
  s.advance(1000)
  s.push({ position: 101, paused: false })
  s.advance(1000)
  s.push({ position: 102, paused: false })
  check('steady playback stays silent', s.sent.length === 0, JSON.stringify(s.sent))
}

// ── 2. the person pauses ────────────────────────────────────────────────────
{
  const s = bootSync()
  s.push({ position: 100, paused: false })
  s.advance(1000)
  s.push({ position: 101, paused: false })
  s.advance(1000)
  s.push({ position: 102, paused: true })
  check(
    'user pause is reported',
    s.sent.length === 1 && s.sent[0].action === 'pause',
    JSON.stringify(s.sent),
  )
}

// ── 3. the person scrubs ────────────────────────────────────────────────────
{
  const s = bootSync()
  s.push({ position: 100, paused: false })
  s.advance(1000)
  s.push({ position: 101, paused: false })
  s.advance(1000)
  s.push({ position: 400, paused: false })
  check(
    'user scrub is reported as a seek',
    s.sent.length === 1 && s.sent[0].action === 'seek' && Math.round(s.sent[0].position) === 400,
    JSON.stringify(s.sent),
  )
}

// ── 4. a stall must never look like a scrub ─────────────────────────────────
{
  const s = bootSync()
  s.push({ position: 500, paused: false })
  s.advance(1000)
  s.push({ position: 501, paused: false })
  s.sent.length = 0
  for (let i = 0; i < 6; i += 1) {
    s.advance(1000)
    s.push({ position: 501, paused: false })
  }
  check('six seconds of stall reports nothing', s.sent.length === 0, JSON.stringify(s.sent))

  s.sent.length = 0
  for (let i = 1; i <= 4; i += 1) {
    s.advance(1000)
    s.push({ position: 501 + i, paused: false })
  }
  check('recovery after a stall reports nothing', s.sent.length === 0, JSON.stringify(s.sent))
}

// ── 4b. a backgrounded tab is the same stall, much further apart ────────────
{
  /*
   * The case the one-second stall test above does not actually reach.
   *
   * Chrome throttles timers in a hidden tab hard — a background tab can go a
   * full minute between readings. So "the position did not move" arrives here
   * not as a 1s gap but as a 60s one, and any rule phrased as "the position is
   * far from where playback should have got to" fires enormously: it reports a
   * sixty-second backwards scrub, and every other tab in the room seeks to it.
   *
   * A mutation test found this gap. The stall case above passed against a
   * broken predicate purely because its steps were smaller than the scrub
   * threshold, which is a property of the test, not of the code.
   */
  const s = bootSync()
  s.push({ position: 500, paused: false })
  s.advance(1000)
  s.push({ position: 501, paused: false })
  s.sent.length = 0

  /* Tab hidden for a minute; the player made no progress at all. */
  s.advance(60_000)
  s.push({ position: 501, paused: false })
  check('a minute of throttled stall reports nothing', s.sent.length === 0, JSON.stringify(s.sent))
}

// ── 4c. ...and one that kept playing while hidden is also silent ────────────
{
  /* The other half: a backgrounded tab whose video kept going. Sixty seconds
     of position for sixty seconds of clock is ordinary playback seen through a
     throttled timer, not somebody jumping forwards. */
  const s = bootSync()
  s.push({ position: 500, paused: false })
  s.advance(1000)
  s.push({ position: 501, paused: false })
  s.sent.length = 0

  s.advance(60_000)
  s.push({ position: 561, paused: false })
  check('a minute of throttled playback reports nothing', s.sent.length === 0, JSON.stringify(s.sent))

  /* But a real jump inside that same long gap is still a scrub. */
  s.sent.length = 0
  s.advance(60_000)
  s.push({ position: 2000, paused: false })
  check(
    'while a real jump across a long gap still is one',
    s.sent.length === 1 && s.sent[0].action === 'seek',
    JSON.stringify(s.sent),
  )
}

// ── 5. buffering is never mistaken for intent ───────────────────────────────
{
  const s = bootSync()
  s.push({ position: 100, paused: false })
  s.advance(1000)
  s.push({ position: 101, paused: false })
  s.sent.length = 0
  s.advance(1000)
  s.push({ position: 101, paused: true, buffering: true })
  check('a buffer stall is not read as a pause', s.sent.length === 0, JSON.stringify(s.sent))
}

// ── 6. our own correction must not come back as an intent ───────────────────
{
  const s = bootSync()
  s.push({ position: 400, paused: false })
  s.advance(6000)
  s.push({ position: 406, paused: false })

  s.room(s.snap({ position: 500 }))
  s.advance(6000)
  s.push({ position: 406, paused: false })
  s.commands.length = 0
  s.tick()
  const seeks = s.commands.filter((c) => c.command === 'seek')
  check('a real gap triggers one seek', seeks.length === 1, JSON.stringify(s.commands))

  s.sent.length = 0
  s.advance(300)
  s.push({ position: 501, paused: false })
  check('OUR OWN seek is not reported back (no loop)', s.sent.length === 0, JSON.stringify(s.sent))
}

// ── 7. the room pausing pauses the player ───────────────────────────────────
{
  const s = bootSync()
  s.push({ position: 100, paused: false })
  s.room(s.snap({ playing: false, position: 100, seq: 2 }))
  s.advance(6000)
  s.push({ position: 100, paused: false })
  s.commands.length = 0
  s.tick()
  check(
    'room paused -> player told to pause',
    s.commands.some((c) => c.command === 'pause'),
    JSON.stringify(s.commands),
  )
}

// ── 8. a title change must not read as a giant scrub ────────────────────────
{
  const s = bootSync()
  s.push({ position: 3000, paused: false, titleKey: 'title-1' })
  s.advance(1000)
  s.push({ position: 3001, paused: false, titleKey: 'title-1' })
  s.sent.length = 0
  s.advance(1000)
  /* A different film, starting from the beginning. Against the old readings
     that is a scrub of nearly an hour. */
  s.push({ position: 5, paused: false, titleKey: 'title-2' })
  check(
    'switching titles reports no scrub',
    s.sent.length === 0,
    JSON.stringify(s.sent),
  )
  check('switching titles announces the new one', s.hellos.includes('title-2'), JSON.stringify(s.hellos))
}

// ── 9. an advert (ready:false) must stand down entirely ─────────────────────
{
  const s = bootSync()
  s.push({ position: 100, paused: false })
  s.advance(1000)
  s.push({ position: 101, paused: false })
  s.sent.length = 0
  s.commands.length = 0

  s.room(s.snap({ position: 900 }))
  s.advance(8000)
  /* Prime swaps the element to an advert: short, so the bridge withholds
     `ready`. Nothing should be reported and nothing should be corrected. */
  s.push({ ready: false, titleKey: null, position: 12, paused: false })
  s.tick()
  check('an advert reports no intent', s.sent.length === 0, JSON.stringify(s.sent))
  check('an advert is never corrected', s.commands.length === 0, JSON.stringify(s.commands))
}

// ── 10. returning from an advert does not report the jump ───────────────────
{
  const s = bootSync()
  s.push({ position: 100, paused: false })
  s.advance(1000)
  s.push({ position: 101, paused: false })
  s.advance(1000)
  s.push({ ready: false, titleKey: null, position: 8, paused: false })
  s.sent.length = 0
  s.advance(30_000)
  /* The film resumes where it left off. Against the advert's clock that is a
     jump; against the film's it is barely a step. */
  s.push({ position: 103, paused: false, titleKey: 'title-1' })
  check('resuming after an advert reports nothing', s.sent.length === 0, JSON.stringify(s.sent))
}

// ── 11. the manual resync button forces a correction now ────────────────────
{
  const s = bootSync()
  s.push({ position: 100, paused: false })
  s.room(s.snap({ position: 900 }))
  s.commands.length = 0
  /* Still inside the cooldown the room change just set — a normal tick would
     stand down here, which is exactly what the button is for. */
  s.resync()
  check(
    'resync corrects despite the cooldown',
    s.commands.some((c) => c.command === 'seek'),
    JSON.stringify(s.commands),
  )
}

// ── 12. per-site tuning is honoured ─────────────────────────────────────────
{
  /**
   * A gap of exactly 1.8s at the moment the loop looks.
   *
   * Worth spelling out, because the obvious way to write this is wrong: the
   * room's position is not a fixed number, it projects forward with the clock.
   * Setting the room to 101.8 and then advancing six seconds does not leave a
   * 1.8s gap, it leaves a 7.8s one, and every site "corrects" it. So the clock
   * moves first and the player is placed relative to where the room will have
   * got to — which is also the only way to get past the cooldown that entering
   * a title and changing the room each set.
   */
  const correctsAnEighteenTenthsGap = (site) => {
    const s = bootSync(site)
    s.push({ position: 100, paused: false })
    s.room(s.snap({ position: 100 }))
    s.advance(6000) // the room is now at 106
    s.push({ position: 104.2, paused: false }) // ...and this player at 104.2
    s.commands.length = 0
    s.tick()
    return { seeks: s.commands.some((c) => c.command === 'seek'), all: s.commands }
  }

  const tight = correctsAnEighteenTenthsGap({ name: 'Prime Video', tuning: { hardSeconds: 1.6 } })
  check(
    "Prime's tighter threshold corrects a gap Netflix would tolerate",
    tight.seeks,
    JSON.stringify(tight.all),
  )

  const loose = correctsAnEighteenTenthsGap({ name: 'Netflix' })
  check('  and Netflix leaves that same gap alone', !loose.seeks, JSON.stringify(loose.all))
}

// ── 13. a first reading must not gag the person watching ────────────────────
{
  /* The regression that split `settleUntil` from `quietUntil`. Entering a title
     sets a five-second window; when reporting shared it, pausing two seconds
     into a film told the room nothing at all. */
  const s = bootSync()
  s.push({ position: 4, paused: false })
  s.advance(1200)
  s.push({ position: 5.2, paused: true })
  check(
    'pausing seconds into a title is still reported',
    s.sent.length === 1 && s.sent[0].action === 'pause',
    JSON.stringify(s.sent),
  )
}

// ── 14. ...but a first reading is still not corrected immediately ───────────
{
  /* The other half of that split: the loop must still leave a player alone
     while it is starting up, or it seeks a film that has not loaded yet. */
  const s = bootSync()
  s.push({ position: 0, paused: false })
  s.room(s.snap({ position: 900 }))
  s.advance(1000)
  s.push({ position: 1, paused: false })
  s.commands.length = 0
  s.tick()
  check(
    'a title still settling is not corrected',
    s.commands.length === 0,
    JSON.stringify(s.commands),
  )
}

let bad = 0
for (const r of R) {
  console.log((r.pass ? '  PASS  ' : '  FAIL  ') + r.name + (r.pass ? '' : '   ' + r.detail))
  if (!r.pass) bad += 1
}
console.log(bad === 0 ? `\nall ${R.length} passed` : `\n${bad} FAILED`)
process.exit(bad ? 1 : 0)
