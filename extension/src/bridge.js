/**
 * The half that stands inside Netflix's own page.
 *
 * Everything else in this extension runs in an isolated world, which can read
 * the DOM but cannot see a single one of the page's own JavaScript objects.
 * That matters here more than it usually would, because driving Netflix by
 * setting `video.currentTime` does not actually work: their player owns a
 * state machine that believes it knows where the stream is, and a position it
 * did not authorise gets quietly wound back a moment later. It looks like the
 * seek landed and then changed its mind.
 *
 * So this runs in the MAIN world and asks the player itself, through the API
 * their own UI is built on. `world: "MAIN"` in the manifest is what makes that
 * legal without injecting a <script> tag past their CSP.
 *
 * Nothing here touches the video stream. Position, play and pause are the
 * whole surface — the same three things the person's own keyboard does. The
 * picture stays where it is, decoded behind DRM, untouched and unreadable.
 */

/*
 * Wrapped in its own scope, and for a sharper reason than usual.
 *
 * This file runs in the MAIN world, which is not a private world at all — it
 * is Netflix's own global scope, shared with Netflix's own scripts. At top
 * level, `function player()` does not make a local helper, it assigns
 * `window.player`; `function element()` assigns `window.element`. On a video
 * site those are not far-fetched names for the page to be using itself, and a
 * top-level `const` colliding with one of theirs is a SyntaxError that takes
 * out whichever script parses second — possibly theirs.
 *
 * The same collision already cost this extension a working overlay once, when
 * two of its own files declared `CHANNEL`. That was ours to find. This one
 * would be Netflix's page breaking on a name we chose, which is worse. An IIFE
 * makes it impossible rather than merely unlikely; `postMessage` is the only
 * channel this needs, and that is deliberate.
 */
;(() => {
  const CHANNEL = 'huddle'

  /** How often the isolated side is told where the film is. */
  const REPORT_MS = 250

  /**
   * Netflix's player, if this page has one yet.
   *
   * Re-read every time rather than cached. A session id is per-title: finishing
   * one and starting another replaces the player object entirely, and a cached
   * handle would go on politely driving something nobody is watching.
   */
  function player() {
    try {
      const api = window.netflix?.appContext?.state?.playerApp?.getAPI?.()
      const videoPlayer = api?.videoPlayer
      if (!videoPlayer) return null
      const [sessionId] = videoPlayer.getAllPlayerSessionIds?.() ?? []
      if (!sessionId) return null
      return videoPlayer.getVideoPlayerBySessionId(sessionId) ?? null
    } catch {
      /* Netflix reorganising their internals is a thing that happens, and it is
         not a reason to take the tab down. The element fallback covers it. */
      return null
    }
  }

  /** The raw element, as a fallback and for the readings the API does not give. */
  function element() {
    return document.querySelector('video')
  }

  /*
   * Reading the position: the API first, the element second.
   *
   * The API answers in milliseconds and is the number their own scrubber shows.
   * The element is there for the window before the player has registered a
   * session, and for the day the internal shape changes — a slightly worse
   * reading beats no reading, because being approximately in step is the entire
   * feature.
   */
  function positionSeconds() {
    const p = player()
    if (p) {
      const ms = p.getCurrentTime?.()
      if (typeof ms === 'number' && Number.isFinite(ms)) return ms / 1000
    }
    const el = element()
    return el ? el.currentTime : 0
  }

  function durationSeconds() {
    const p = player()
    if (p) {
      const ms = p.getDuration?.()
      if (typeof ms === 'number' && Number.isFinite(ms) && ms > 0) return ms / 1000
    }
    const el = element()
    return el && Number.isFinite(el.duration) ? el.duration : 0
  }

  function paused() {
    const p = player()
    if (p && typeof p.isPaused === 'function') return Boolean(p.isPaused())
    const el = element()
    return el ? el.paused : true
  }

  /**
   * Stalled, as opposed to merely paused.
   *
   * `readyState` on the element is the honest signal here — Netflix's own
   * "isPlaying" stays true across a rebuffer. Drift correction has to stand
   * down during one, or it seeks a player that is already struggling and turns
   * a slow moment into a loop of them.
   */
  function buffering() {
    const p = player()
    if (p && typeof p.isReady === 'function' && !p.isReady()) return true
    const el = element()
    return el ? el.readyState < 3 && !el.paused : false
  }

  function seek(seconds) {
    const target = Math.max(0, seconds)
    const p = player()
    if (p && typeof p.seek === 'function') {
      p.seek(Math.round(target * 1000))
      return
    }
    const el = element()
    if (el) el.currentTime = target
  }

  /**
   * Play a little off normal speed, to close a gap without seeking.
   *
   * On the element, not through their player API. `playbackRate` is an
   * ordinary media property their state machine does not guard the way it
   * guards position, and if it ever does, the other side notices from the rate
   * this reports back rather than assuming the request landed.
   */
  function setRate(rate) {
    const el = element()
    if (!el) return
    const safe = Math.min(1.25, Math.max(0.75, Number(rate) || 1))
    try {
      el.playbackRate = safe
    } catch {
      /* Refused. The seek threshold still covers the gap. */
    }
  }

  function play() {
    const p = player()
    if (p && typeof p.play === 'function') {
      p.play()
      return
    }
    void element()?.play?.().catch(() => undefined)
  }

  function pause() {
    const p = player()
    if (p && typeof p.pause === 'function') {
      p.pause()
      return
    }
    element()?.pause?.()
  }

  /*
   * State is pushed, not asked for.
   *
   * A request/response over `postMessage` would make every reading async, and
   * the drift loop on the other side wants the position the way a loop wants a
   * variable — now, cheaply, four times a second. Pushing a snapshot lets that
   * side keep a local mirror and interpolate between them.
   */
  /**
   * Which title this is, if it is one.
   *
   * Netflix puts it in the path, and the path changing is how the other side
   * knows the readings it holds describe something that is no longer on screen.
   * Null anywhere that is not a title — Browse carries autoplaying previews, and
   * holding the room to a preview would be worse than holding it to nothing.
   */
  function titleKey() {
    const match = /^\/watch\/([^/?#]+)/.exec(location.pathname)
    return match ? match[1] : null
  }

  setInterval(() => {
    const key = titleKey()
    const el = element()
    window.postMessage(
      {
        channel: CHANNEL,
        kind: 'state',
        /* Stamped here so the other side can tell a fresh reading from a stale
           one after a tab has been throttled in the background. */
        at: performance.now(),
        titleKey: key,
        ready: Boolean(key) && (Boolean(el) || Boolean(player())),
        position: positionSeconds(),
        duration: durationSeconds(),
        paused: paused(),
        /* Reported so the other side can tell its request took. */
        rate: (() => {
          const el = element()
          return el && Number.isFinite(el.playbackRate) ? el.playbackRate : 1
        })(),
        buffering: buffering(),
      },
      '*',
    )
  }, REPORT_MS)

  window.addEventListener('message', (event) => {
    /* Same-window messages only. Anything from a frame or another origin is
       not ours, whatever it claims in its payload. */
    if (event.source !== window) return
    const data = event.data
    if (!data || data.channel !== CHANNEL || data.kind !== 'command') return

    if (data.command === 'seek') seek(Number(data.seconds) || 0)
    else if (data.command === 'play') play()
    else if (data.command === 'pause') pause()
    else if (data.command === 'rate') setRate(data.rate)
  })
})()
