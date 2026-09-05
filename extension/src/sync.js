/**
 * Holding one streaming tab to the room's clock.
 *
 * Site-agnostic on purpose. Everything that differs between Netflix and Prime
 * Video lives in that site's MAIN-world bridge — which player object to drive,
 * how to read a position out of it, what counts as a real title rather than an
 * advert. What is left over is this: the correction loop, and the judgement
 * about who moved the film, the room or the person watching it.
 *
 * That split is what makes a second site an adapter rather than a second copy
 * of the hard part. The hard part is the intent detection below, it has tests,
 * and it was wrong twice before it was right — duplicating it per site would
 * mean duplicating those bugs too.
 *
 * Loaded before each site's adapter, which calls `startSync` with a descriptor.
 * Nothing here touches a video stream: it reads a clock and nudges play, pause
 * and seek, which is exactly what the person's own keyboard does.
 */

;(() => {
  /** One channel for every site — two of them never share a page. */
  const CHANNEL = 'huddle'

  /** How often the room is compared against the player. Matches the bridge. */
  const TICK_MS = 250

  /**
   * Defaults, tuned for a source that can only be corrected by seeking.
   *
   * Neither Netflix nor Prime offers a fine playback-rate control to absorb
   * small drift into, and on both of them a seek costs a rebuffer. So the
   * threshold is deliberately wider than the app's own player uses: holding a
   * DRM stream to a fifth of a second would pay for a stall to fix a gap
   * nobody would have noticed, over and over.
   */
  const DEFAULTS = {
    /** Past this gap, seek. */
    hardSeconds: 2,
    /** After a *seek*, leave the player alone this long — a seek rebuffers. */
    cooldownMs: 5000,
    /**
     * After a play or pause, two much shorter windows.
     *
     * These used to borrow the seek cooldown, which was five seconds of
     * ignoring the person in front of the tab to guard against an echo that is
     * one flipped boolean arriving in a single report. The room would pause
     * you, you would press play a second later, and nothing happened — the
     * action was swallowed and the loop pushed you back to paused. Toggling a
     * boolean costs nothing to undo, so there is no rebuffer to wait out here.
     */
    echoMs: 700,
    toggleSettleMs: 1500,
    /**
     * Do not re-issue the same command while the last one is still landing.
     *
     * Longer than it looks like it needs to be, deliberately. A player can take
     * the better part of a second to report that it stopped, and asking again
     * inside that window does not make it stop sooner — on some players it
     * restarts the transition and makes it slower.
     */
    reissueMs: 1500,
    /** How long to keep waiting for a toggle we asked for before giving up. */
    expectMs: 3000,
    /** First guess at what a seek costs here; measured and refined after. */
    initialSeekCost: 1,
    maxSeekCost: 1.8,
    /** A position jump larger than this, unasked for, is somebody scrubbing. */
    scrubSeconds: 1.5,
    /**
     * Below this gap, do nothing at all.
     *
     * Above it but below `hardSeconds`, the gap is closed by playing very
     * slightly faster or slower instead of seeking. That is the difference
     * between "everyone is within a second and a half and that is as good as
     * it gets" and actually converging: a seek costs a rebuffer, so the
     * threshold for one has to stay high, but a six percent rate change costs
     * nothing, is inaudible, and closes a second of drift in under twenty.
     *
     * DRM does not prevent this any more than it prevents reading the clock —
     * `playbackRate` is an ordinary property. If a site overrides it we are no
     * worse off than before, because the seek threshold is still there behind
     * it; the rate is reconciled against what the player reports, so being
     * overridden means we simply try again rather than believing we succeeded.
     */
    softSeconds: 0.35,
    /** How much faster or slower, at most. Kept small enough to be unnoticed. */
    nudge: 0.06,
    /**
     * How hard to lean on the rate, per second of gap.
     *
     * Proportional rather than a switch. A fixed step is either fully on or
     * fully off, so a gap sitting near the threshold toggles between them and
     * the speed changes several times a second — worse to sit through than the
     * gap it is fixing. At this gain a three-quarter-second gap asks for the
     * full nudge and anything smaller asks for proportionally less, so the
     * speed eases in and out instead of stepping.
     */
    nudgeGain: 0.08,
    /**
     * Stop nudging below this fraction of `softSeconds`, having started above
     * it. Plain hysteresis: without it the two thresholds are the same line and
     * the correction chatters across it.
     */
    nudgeRelease: 0.4,
    /** Consecutive ignored rate requests before concluding it is not allowed. */
    rateRefusals: 3,
  }

  /**
   * Start syncing this tab.
   *
   * `site` carries only what genuinely differs: a name for the logs and the
   * overlay, and optional tuning. Everything else arrives from the bridge.
   */
  window.__huddleStartSync = function startSync(site = {}) {
    const tuning = { ...DEFAULTS, ...(site.tuning ?? {}) }

    /** Last state the bridge pushed up. */
    let player = null
    /** The room's last snapshot, and the clock offset to read it against. */
    let room = null
    let offset = 0
    /**
     * Two windows, not one, and the difference matters.
     *
     * `settleUntil` suppresses *corrections* — set whenever the player is about
     * to move on purpose, so the loop does not chase a position that is still
     * settling. Entering a title sets it, because a player that has just
     * started is not yet anywhere.
     *
     * `quietUntil` suppresses *reporting* — set only when we ourselves moved
     * the player, so the resulting jump is not read back as the person having
     * done it. That loop is the one that walks a room backwards.
     *
     * They were the same variable at first, which meant entering a title gagged
     * the viewer for five seconds: pause a film two seconds after starting it
     * and nobody else's tab heard about it. The tests caught it.
     */
    let settleUntil = 0
    let quietUntil = 0
    let seekCost = tuning.initialSeekCost
    let seekedAt = null
    /** What we last saw, so our own echo is not read as a new intent. */
    let reported = { paused: null, position: 0, at: 0 }
    /** Which title the readings above belong to. */
    let titleKey = null
    /** When we last asked the worker what the room is doing. */
    let askedAt = 0
    /* Counters, kept only so the overlay can show what is actually happening.
       Four rounds of this were diagnosed from a description of a symptom; a
       number on the screen where somebody is watching ends that. */
    let roomAt = 0
    let seeks = 0
    let nudgeWrites = 0
    /** The last thing we told the player to do, so it is not told twice. */
    let lastCommand = { name: null, at: 0 }
    /** The playback rate we have asked for, so it is not asked for repeatedly. */
    let wantedRate = 1
    /** Whether the correction is currently leaning on the rate at all. */
    let nudging = false
    /**
     * Whether this player lets its playback rate be set.
     *
     * A site is entitled to own its own rate, and Prime may well reset anything
     * we ask for. On its own that is fine. What is not fine is the loop it
     * makes with reconciliation: we ask for 1.06, the player reports 1, we
     * notice the difference and ask again — four times a second, for as long as
     * the gap is open. Writing playbackRate at 4Hz on a live video is audible,
     * and it is the one failure that could not appear until this ran against a
     * real player rather than a cooperative fake.
     *
     * So refusal is counted, and after a few the nudge is retired for this
     * title and the seek threshold carries the correction alone — which is
     * exactly the behaviour from before the nudge existed, and no worse.
     */
    let rateHonoured = true
    let refusals = 0
    /**
     * A paused-state we asked for and have not seen arrive yet.
     *
     * The precise form of what a time window was approximating. Our own pause
     * comes back as a state push a moment later, and if that is read as the
     * person pausing, the room hears an echo of itself. A window guessed at how
     * long that takes and guessed wrong in both directions at once: too long,
     * and it swallowed what the person actually did next; too short, and the
     * echo got through anyway. Matching the flag we asked for needs no guess —
     * it is right whether the player answers in fifty milliseconds or nine
     * hundred. The timeout is only so a player that never complies does not
     * silence the person forever.
     */
    let expecting = null

    /**
     * Move the player.
     *
     * Anything we do here comes back as a state push a moment later, so both
     * windows close together: the loop stops correcting while it lands, and
     * the detector stops treating the landing as the viewer's doing.
     */
    const command = (name, extra = {}) => {
      const now = performance.now()

      /*
       * Sending the same command again while the last one is still landing is
       * worse than useless. The loop looks four times a second and a player
       * takes longer than that to report that it stopped, so a paused room
       * would fire `pause` at it repeatedly — and because every command pushes
       * the quiet window forward, that stream of no-op pauses is exactly what
       * would swallow the person's own next action.
       */
      if (lastCommand.name === name && now - lastCommand.at < tuning.reissueMs) return
      lastCommand = { name, at: now }

      /* What this command should make the player report, so its arrival is
         recognised as ours rather than as the person's doing. */
      if (name === 'pause') expecting = { paused: true, at: now }
      else if (name === 'play') expecting = { paused: false, at: now }

      /* A seek has to be waited out; a toggle does not. */
      const seeking = name === 'seek'
      settleUntil = now + (seeking ? tuning.cooldownMs : tuning.toggleSettleMs)
      quietUntil = now + (seeking ? tuning.cooldownMs : tuning.echoMs)

      window.postMessage({ channel: CHANNEL, kind: 'command', command: name, ...extra }, '*')
    }

    /**
     * Play a little faster or slower, to close a gap without seeking.
     *
     * Deliberately not routed through `command`, because this is not something
     * the person did and must not open a quiet window — gagging intent
     * detection every time the film drifts a third of a second would swallow
     * real play and pause presses constantly.
     */
    function setRate(next) {
      const rounded = Math.round(next * 100) / 100
      /* Retired. Restoring normal speed is still allowed — and is the one
         thing that must always get through. */
      if (!rateHonoured && rounded !== 1) return
      if (rounded === wantedRate) return
      wantedRate = rounded
      if (rounded !== 1) nudgeWrites += 1
      window.postMessage({ channel: CHANNEL, kind: 'command', command: 'rate', rate: rounded }, '*')
    }

    /** Where the room says the film should be, right now. */
    function target() {
      if (!room || !room.item) return null
      if (!room.playing) return room.position
      const nowOnServer = Date.now() + offset
      return room.position + (nowOnServer - room.serverTime) / 1000
    }

    /**
     * A different title than the readings were taken against.
     *
     * `reported` still holds the last position of whatever was playing before.
     * Between two titles that resembles a scrub of several thousand seconds,
     * and without clearing it the first tick on the new one reports exactly
     * that to the room. Netflix reaches this by routing to a new `/watch/` id;
     * Prime by swapping the source under the same page. Both arrive here.
     */
    /**
     * Ask the worker what the room is on.
     *
     * The worker answers by pushing the room straight back to this tab, which
     * matters more than it sounds: its own broadcasts only go out when the
     * room *changes*, so a tab opened between two changes is told nothing at
     * all. That tab then believes there is no room, the overlay says it is not
     * connected — while the socket, the popup and the app are all fine — and
     * the button that would start something is disabled, so the tab cannot
     * even get itself out of it.
     *
     * Also the recovery from the service worker being unloaded. MV3 shuts an
     * idle worker down and starts it again on the next message; a tab left
     * open across that has a stale room and no event coming to correct it.
     * Sending this is what wakes the worker back up.
     */
    function askForRoom(titleId = null) {
      askedAt = performance.now()
      chrome.runtime.sendMessage({ kind: 'hello', titleId }).catch(() => undefined)
    }

    function enteredTitle(key) {
      titleKey = key
      reported = { paused: null, position: 0, at: 0 }
      /* Corrections wait for the new title to settle; the viewer does not.
         The first reading is ignored regardless, by `reported.paused === null`. */
      settleUntil = performance.now() + tuning.cooldownMs
      seekCost = tuning.initialSeekCost
      seekedAt = null
      /* A new title can be a new player, which may feel differently about
         having its rate set. Ask again rather than carrying a verdict over. */
      rateHonoured = true
      refusals = 0
      nudging = false
      askForRoom(key ?? null)
    }

    /**
     * Did the person in front of the tab just do something?
     *
     * The only genuinely hard judgement here. Our own corrections move the
     * player too, and a correction reported back as a fresh intent is a loop:
     * everyone seeks, everyone reports the seek, everyone seeks again. So a
     * change only counts as the person's when it happens outside the window in
     * which we were moving things ourselves.
     */
    function detectLocalIntent(next) {
      /* Waited for long enough. A player that never did as it was asked must
         not go on silencing the person sitting in front of it. */
      if (expecting && performance.now() - expecting.at > tuning.expectMs) expecting = null

      if (performance.now() < quietUntil) return null
      if (next.buffering) return null
      if (reported.paused === null) return null

      if (next.paused !== reported.paused) {
        /* Exactly the change we asked for, arriving. Ours, not theirs. */
        if (expecting && expecting.paused === next.paused) {
          expecting = null
          return null
        }
        return next.paused
          ? { action: 'pause', position: next.position }
          : { action: 'play', position: next.position }
      }

      if (!next.paused) {
        /*
         * A scrub is a position playback could not have reached — which is not
         * the same as a position merely behind where it ought to be.
         *
         * Comparing against the expected position alone gets this wrong in the
         * case that matters most: a stalled player reports the same timestamp
         * twice, so after a few seconds it looks exactly like somebody dragged
         * the bar backwards. Reporting that makes everybody seek to a stalled
         * player's position — which stalls them, which they report, and the
         * room walks itself backwards. A stall has to be indistinguishable
         * from nothing happening, because that is what it is.
         *
         * So: backwards is a scrub, and forwards faster than the wall clock is
         * a scrub. Forwards but slow is a player having a hard time.
         */
        const elapsed = (next.at - reported.at) / 1000
        const moved = next.position - reported.position
        if (moved < -tuning.scrubSeconds || moved > elapsed + tuning.scrubSeconds) {
          return { action: 'seek', position: next.position }
        }
      }

      return null
    }

    function onPlayerState(next) {
      const previous = player
      player = next

      /* A new title, or the first real reading after an advert. Either way the
         old readings describe something else. */
      if (next.ready && next.titleKey !== titleKey) {
        enteredTitle(next.titleKey)
        reported = { paused: next.paused, position: next.position, at: next.at }
        return
      }

      /* Not a title: an advert, a trailer on a browse page, nothing loaded.
         Stand down rather than hold the room to it. */
      if (!next.ready) return

      /* The player can reset the rate on its own — a new source, its own UI,
         an advert ending. Believing our last request would mean never asking
         again; trusting what it reports means noticing and re-asking. */
      if (typeof next.rate === 'number' && next.rate > 0) {
        const seen = Math.round(next.rate * 100) / 100
        if (seen !== wantedRate) {
          /* Asked for a speed and got a different one back. Once is a race;
             three times in a row is a player that owns its own rate. */
          if (wantedRate !== 1) {
            refusals += 1
            if (refusals >= tuning.rateRefusals) {
              rateHonoured = false
              nudging = false
            }
          }
          wantedRate = seen
        } else if (wantedRate !== 1) {
          refusals = 0
        }
      }

      const intent = previous && previous.ready ? detectLocalIntent(next) : null
      if (intent) {
        /* Ours now — do not read the room's echo of it back as another intent. */
        quietUntil = performance.now() + 600
        chrome.runtime.sendMessage({ kind: 'control', control: intent }).catch(() => undefined)
      }

      reported = { paused: next.paused, position: next.position, at: next.at }
    }

    /**
     * Hold the film to the room.
     *
     * Stand down while buffering, stand down while settling from the last
     * correction, and when correcting, aim past the target by what a seek here
     * has been measured to cost — seeking to where the room is *now* guarantees
     * landing behind it, because the seek itself takes time.
     */
    function correct() {
      /*
       * Still nothing from the worker. Ask again rather than wait for a change
       * that may never come — the room can sit paused on one title all
       * evening, and a tab that missed the last broadcast would sit blank
       * beside it for exactly as long.
       */
      if (room === null && performance.now() - askedAt > 5000) askForRoom(titleKey)

      if (!player || !player.ready || !room || !room.item) return

      /* The room is paused, or nothing is on. */
      if (!room.playing) {
        setRate(1)
        if (!player.paused) command('pause')
        return
      }

      if (player.buffering) return

      /*
       * The room is running and this player is not. Start it — and note where
       * this sits: above the settle check, alongside the pause branch, not
       * below it with the drift correction.
       *
       * Starting and stopping is obedience, not correction. It was below the
       * check, so our own pause a moment earlier — or any other recent command
       * — held the film stopped for the length of a cooldown while the rest of
       * the room played on. Nothing about a settle window makes pressing play
       * less correct; the thing that stops it being pressed repeatedly is the
       * re-issue guard in `command`, which is where that belongs.
       */
      if (player.paused) {
        command('play')
        return
      }

      /* Recovered from a correction — learn what it actually cost, so the next
         aims better. Eased, because one slow fetch is not the new normal. */
      if (seekedAt !== null) {
        const cost = (performance.now() - seekedAt) / 1000
        seekCost = Math.min(tuning.maxSeekCost, seekCost * 0.7 + Math.max(0, cost) * 0.3)
        seekedAt = null
      }

      /* Everything past here is drift correction, which is what the settle
         window is actually for. */
      if (performance.now() < settleUntil) return

      const want = target()
      if (want === null) return

      const gap = want - player.position
      const off = Math.abs(gap)

      if (off >= tuning.hardSeconds) {
        /* Too far to catch up by playing faster — it would take minutes. */
        setRate(1)
        seekedAt = performance.now()
        seeks += 1
        command('seek', { seconds: want + seekCost })
        return
      }

      /* Two thresholds, not one: start correcting above `softSeconds`, stop
         well below it. One line for both makes the speed chatter across it. */
      if (off > tuning.softSeconds) nudging = true
      else if (off < tuning.softSeconds * tuning.nudgeRelease) nudging = false

      if (nudging && rateHonoured) {
        const step = Math.max(-tuning.nudge, Math.min(tuning.nudge, gap * tuning.nudgeGain))
        setRate(1 + step)
        return
      }

      /* Close enough, or not allowed. Either way, normal speed. */
      setRate(1)
    }

    window.addEventListener('message', (event) => {
      if (event.source !== window) return
      const data = event.data
      if (!data || data.channel !== CHANNEL || data.kind !== 'state') return
      onPlayerState(data)
    })

    /*
     * Looked at as often as the bridge reports, rather than once a second.
     *
     * The tick used to be a second, which on its own put up to a second
     * between somebody pressing pause and the other tab hearing about it —
     * more than the network and the bridge put together, and the one part of
     * that chain entirely within reach. It is a handful of comparisons; there
     * was never a reason for it to be the slowest link.
     */
    setInterval(correct, TICK_MS)

    /* Before anything is playing, and regardless of whether anything ever
       does — this is how a browse or detail page knows the room at all. */
    askForRoom(null)

    /* The worker pushes the room down as it changes, with the clock offset —
       the offset is measured up there, where the socket is. */
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.kind === 'room') {
        room = message.snapshot
        offset = message.offset ?? 0
        roomAt = performance.now()
        /*
         * Deliberately does not start a cooldown.
         *
         * It used to: any change to the room set the full five-second
         * correction settle, on the reasoning that a control someone pressed
         * means the player is about to move on purpose and reading that as
         * drift would spend a second correction on top of it.
         *
         * That reasoning is about our *own* echo, and the brake for it belongs
         * where the command is issued — which is where it now is. Applied to
         * every incoming change it did something much worse, because
         * `correct()` tests the cooldown after the paused-room branch and
         * before the play and seek ones: obeying somebody's pause was instant,
         * and obeying their play or their scrub waited out the whole five
         * seconds. One person pressing play and the rest of the room sitting
         * still for five seconds is the entire "play pause very delayed"
         * complaint, and the asymmetry with pause is what gave it away.
         *
         * Following a control somebody deliberately pressed is not drift
         * correction and must not share its brake.
         */
      }
    })

    /*
     * A manual resync, for the overlay's button.
     *
     * `overlay.js` runs in this same isolated world — content scripts from one
     * extension on one frame share a single JS context — so this is a plain
     * function call rather than a message that could arrive late. Clearing the
     * settle window is the whole trick: the loop is already running every
     * second, so the next tick treats the gap as due rather than as something
     * still cooling down.
     */
    window.__huddleResync = () => {
      settleUntil = 0
      correct()
    }


    /**
     * What the loop can see, for the panel to show.
     *
     * Not logging — a number on screen, next to the film, on the machine where
     * the problem is. Every round of this so far was diagnosed from somebody
     * describing a symptom and me inferring a cause, which worked twice and
     * wasted two more. A gap in seconds and the age of the last update
     * separate "the socket is not delivering" from "the player is not obeying"
     * in one glance, and neither is guessable from the outside.
     */
    window.__huddleStats = () => {
      const now = performance.now()
      const want = target()
      return {
        gap: want !== null && player?.ready ? want - player.position : null,
        rate: wantedRate,
        rateHonoured,
        offsetMs: offset,
        roomAgeMs: roomAt ? now - roomAt : null,
        playerAgeMs: player ? now - (player.at ?? now) : null,
        ready: Boolean(player?.ready),
        buffering: Boolean(player?.buffering),
        paused: player?.paused ?? null,
        playing: room?.playing ?? null,
        seeks,
        nudgeWrites,
        settlingMs: Math.max(0, Math.round(settleUntil - now)),
      }
    }

    window.__huddleSite = site.name ?? 'this tab'
  }
})()
