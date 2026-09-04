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
    /** After any correction, leave the player alone this long. */
    cooldownMs: 5000,
    /** First guess at what a seek costs here; measured and refined after. */
    initialSeekCost: 1,
    maxSeekCost: 1.8,
    /** A position jump larger than this, unasked for, is somebody scrubbing. */
    scrubSeconds: 1.5,
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

    /**
     * Move the player.
     *
     * Anything we do here comes back as a state push a moment later, so both
     * windows close together: the loop stops correcting while it lands, and
     * the detector stops treating the landing as the viewer's doing.
     */
    const command = (command, extra = {}) => {
      settleUntil = performance.now() + tuning.cooldownMs
      quietUntil = performance.now() + tuning.cooldownMs
      window.postMessage({ channel: CHANNEL, kind: 'command', command, ...extra }, '*')
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
    function enteredTitle(key) {
      titleKey = key
      reported = { paused: null, position: 0, at: 0 }
      /* Corrections wait for the new title to settle; the viewer does not.
         The first reading is ignored regardless, by `reported.paused === null`. */
      settleUntil = performance.now() + tuning.cooldownMs
      seekCost = tuning.initialSeekCost
      seekedAt = null
      chrome.runtime.sendMessage({ kind: 'hello', titleId: key ?? null }).catch(() => undefined)
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
      if (performance.now() < quietUntil) return null
      if (next.buffering) return null
      if (reported.paused === null) return null

      if (next.paused !== reported.paused) {
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
      if (!player || !player.ready || !room || !room.item) return

      /* The room is paused, or nothing is on. */
      if (!room.playing) {
        if (!player.paused) command('pause')
        return
      }

      if (player.buffering) return

      /* Recovered from a correction — learn what it actually cost, so the next
         aims better. Eased, because one slow fetch is not the new normal. */
      if (seekedAt !== null) {
        const cost = (performance.now() - seekedAt) / 1000
        seekCost = Math.min(tuning.maxSeekCost, seekCost * 0.7 + Math.max(0, cost) * 0.3)
        seekedAt = null
      }

      if (performance.now() < settleUntil) return

      const want = target()
      if (want === null) return

      /* The room is running and this player is not. Start it, without reading
         the resulting change as the person having pressed play. */
      if (player.paused) {
        command('play')
        return
      }

      if (Math.abs(want - player.position) >= tuning.hardSeconds) {
        seekedAt = performance.now()
        command('seek', { seconds: want + seekCost })
      }
    }

    window.addEventListener('message', (event) => {
      if (event.source !== window) return
      const data = event.data
      if (!data || data.channel !== CHANNEL || data.kind !== 'state') return
      onPlayerState(data)
    })

    setInterval(correct, 1000)

    /* The worker pushes the room down as it changes, with the clock offset —
       the offset is measured up there, where the socket is. */
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.kind === 'room') {
        const changed = message.snapshot?.seq !== room?.seq
        room = message.snapshot
        offset = message.offset ?? 0
        /* A deliberate control from anyone — including us — means the player is
           about to move on purpose. Reading that as drift spends a second
           correction on top of the one the room asked for. */
        if (changed) settleUntil = performance.now() + tuning.cooldownMs
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


    window.__huddleSite = site.name ?? 'this tab'
  }
})()
