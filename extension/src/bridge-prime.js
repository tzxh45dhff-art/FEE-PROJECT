/**
 * The half that stands inside Prime Video's own page.
 *
 * Same job as the Netflix bridge and the same reason for existing: this runs
 * in the MAIN world, where the page's own JavaScript lives, because the
 * isolated world can read the DOM but not a single one of the page's objects.
 * `world: "MAIN"` in the manifest is what makes that legal without injecting a
 * script tag past their CSP.
 *
 * What differs from Netflix is what can be trusted. Netflix's player owns a
 * state machine that quietly reverts a `currentTime` it did not authorise, so
 * that bridge has to drive their internal API or nothing holds. Prime exposes
 * `ATVWebPlayerSDK` and `WebPlayerSDK` as globals, but both are empty
 * namespaces until a title plays, and neither their method names nor their
 * units are things to bet a feature on sight-unseen. The element, meanwhile,
 * is a real HTML5 `<video>` that answers the ordinary properties.
 *
 * So the element is the interface here, and the SDK is a fallback that has to
 * earn its place — see `seek` for how that is decided rather than assumed.
 * Both paths are safe for the same reason: DRM encrypts the picture, never the
 * clock. `currentTime`, `paused` and `duration` are ordinary properties of an
 * ordinary element whatever is decoding into it.
 *
 * Nothing here touches the stream. Position, play and pause is the whole
 * surface — the same three things the person's own keyboard does.
 */

/*
 * Wrapped in its own scope, and for a sharper reason than usual.
 *
 * The MAIN world is not a private world — it is Amazon's own global scope,
 * shared with Amazon's own scripts. At top level, `function element()` does
 * not make a local helper, it assigns `window.element`; `function player()`
 * assigns `window.player`. On a video site those are entirely plausible names
 * for the page to be using itself, and a top-level `const` colliding with one
 * of theirs is a SyntaxError that takes out whichever script parses second —
 * possibly theirs. An IIFE makes that impossible rather than merely unlikely.
 */
;(() => {
  const CHANNEL = 'huddle'

  /** How often the isolated side is told where the film is. */
  const REPORT_MS = 250

  /**
   * Below this, what is playing is not the feature.
   *
   * Prime plays adverts through the same element as the content, and during
   * one `currentTime` counts the advert rather than the film. Holding the room
   * to that would drag everybody to a position that means nothing, then drag
   * them back when it ended. Prime also autoplays trailers on browse pages.
   *
   * Two minutes is the line. Adverts and trailers sit well under it, features
   * and episodes well over. The failure it can cause is the safe one: content
   * genuinely shorter than this never syncs, rather than syncing to the wrong
   * thing.
   */
  const FEATURE_SECONDS = 120

  /** How close counts as having arrived, when checking a seek landed. */
  const LANDED_SECONDS = 1.5
  /** How long to give a seek before deciding the element ignored it. */
  const SEEK_GRACE_MS = 1500

  /**
   * The element actually showing the film.
   *
   * A Prime page can hold more than one `<video>` — a background loop on the
   * browse rail, a trailer, the feature. The longest one that has actually
   * loaded is the feature; the rest are short by definition.
   */
  function element() {
    const all = document.querySelectorAll('video')
    if (all.length === 0) return null

    let best = null
    for (const video of all) {
      if (!Number.isFinite(video.duration) || video.duration <= 0) continue
      if (!best || video.duration > best.duration) best = video
    }
    /* Nothing has a duration yet — hand back the first so a read can still
       return "not ready" rather than the whole tick throwing. */
    return best ?? all[0]
  }

  /**
   * Prime's own player, if this page has one and it is recognisable.
   *
   * Deliberately defensive. The SDK is known to exist as a global and known to
   * be empty until playback starts; what it exposes then has not been verified
   * against a live title, so nothing here assumes a shape. Every access is
   * guarded, and a candidate only counts if it can both report a position and
   * act on one — an object with a `play` and no clock is no use.
   */
  function sdkPlayer() {
    try {
      const sdk = window.ATVWebPlayerSDK ?? window.WebPlayerSDK
      if (!sdk) return null

      const candidates = [
        sdk.getActivePlayer?.(),
        sdk.activePlayer,
        sdk.player,
        typeof sdk.getPlayers === 'function' ? sdk.getPlayers()?.[0] : null,
      ]

      for (const candidate of candidates) {
        if (!candidate) continue
        const readsClock =
          typeof candidate.getCurrentTime === 'function' ||
          typeof candidate.currentTime === 'number'
        const acts = typeof candidate.seek === 'function' || typeof candidate.seekTo === 'function'
        if (readsClock && acts) return candidate
      }
    } catch {
      /* Amazon reorganising their internals is a thing that happens, and it is
         not a reason to take the tab down. The element carries it. */
    }
    return null
  }

  /** Whatever number the SDK calls the current position, unit unknown. */
  function sdkClock(sdk) {
    try {
      const raw = typeof sdk.getCurrentTime === 'function' ? sdk.getCurrentTime() : sdk.currentTime
      return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
    } catch {
      return null
    }
  }

  /**
   * Whether the SDK counts in seconds or milliseconds — measured, not guessed.
   *
   * This is the one place where being wrong would be actively destructive
   * rather than merely useless. Passing seconds to a method that wants
   * milliseconds seeks a two-hour film to somewhere in its first eight
   * seconds; passing milliseconds to one that wants seconds throws it past the
   * end. Amazon's units are not documented and not verifiable from here.
   *
   * They do not have to be. The element's `currentTime` is unambiguously
   * seconds, and both clocks describe the same playhead, so whichever reading
   * of the SDK's number lands closer to the element's is the right one. If
   * neither is close — no element, a stopped player, the two disagreeing — the
   * answer is null and the SDK simply does not get used for seeking. Not
   * syncing is a bad outcome; seeking everybody to the wrong place is a worse
   * one.
   */
  function sdkScale(sdk, el) {
    if (!el) return null
    const raw = sdkClock(sdk)
    if (raw === null) return null
    const seconds = el.currentTime
    /* Too near zero to tell the two apart — ask again next time. */
    if (!Number.isFinite(seconds) || seconds < 5) return null

    const asSeconds = Math.abs(raw - seconds)
    const asMillis = Math.abs(raw / 1000 - seconds)
    const best = Math.min(asSeconds, asMillis)
    /* Neither reading describes this playhead. Something else is being
       measured; do not act on it. */
    if (best > Math.max(2, seconds * 0.05)) return null
    return asMillis < asSeconds ? 1000 : 1
  }

  /**
   * Has the element been seen to *ignore* a seek?
   *
   * One-way, and phrased as the failure rather than the success on purpose.
   * Netflix's player reverts a position it did not authorise, which is exactly
   * the failure that would be invisible here — the seek appears to work and
   * then quietly does not. So rather than assume Prime is different, every
   * seek is watched, and the SDK gets its turn only once the element has
   * actually been caught not taking one.
   *
   * This was a tri-state, with a `true` for "confirmed working". Nothing ever
   * read the difference between confirmed and untried, which made it a
   * variable that looked like it carried a decision and did not. Watching
   * continues after the first success either way — a player can change its
   * mind across a title or an advert, and there is nothing to gain by
   * stopping.
   */
  let elementIgnoresSeek = false
  /** The seek currently being watched, if any. */
  let pending = null

  function seek(seconds) {
    const target = Math.max(0, seconds)
    const el = element()

    /* Once the element has been shown not to take, stop asking it. */
    if (el && !elementIgnoresSeek) {
      pending = { target, from: el.currentTime, at: performance.now() }
      el.currentTime = target
      return
    }
    seekViaSdk(target, el)
  }

  function seekViaSdk(target, el) {
    const sdk = sdkPlayer()
    if (!sdk) return
    const scale = sdkScale(sdk, el)
    /* Units unknown. Refusing is the whole point — see `sdkScale`. */
    if (scale === null) return
    try {
      if (typeof sdk.seek === 'function') sdk.seek(target * scale)
      else if (typeof sdk.seekTo === 'function') sdk.seekTo(target * scale)
    } catch {
      /* Nothing left to try. The loop will notice the gap and come back. */
    }
  }

  /**
   * Decide whether the last seek landed.
   *
   * Called once per tick with the position already read, so this costs a
   * comparison rather than another DOM query.
   */
  function judgePendingSeek(position, el) {
    if (!pending) return
    if (Math.abs(position - pending.target) <= LANDED_SECONDS) {
      pending = null
      return
    }
    if (performance.now() - pending.at < SEEK_GRACE_MS) return

    /* Grace is up and the playhead is still where it started — the element
       took the assignment and the player put it back. */
    if (Math.abs(position - pending.from) <= LANDED_SECONDS) {
      elementIgnoresSeek = true
      seekViaSdk(pending.target, el)
    }
    /* Or it moved somewhere else entirely, which means the person did
       something of their own mid-seek. Either way this one is finished. */
    pending = null
  }

  /**
   * Play a little off normal speed, to close a gap without seeking.
   *
   * Set on the element rather than through the SDK. `playbackRate` is an
   * ordinary media property that DRM does not touch, and the element is the
   * one thing here known to answer. A player that overrides it is handled by
   * the other side noticing the rate it reports, not by anything here.
   */
  function setRate(rate) {
    const el = element()
    if (!el) return
    /* Clamped: whatever arrives, this must never become a speed somebody
       would notice, let alone a stall or a fast-forward. */
    const safe = Math.min(1.25, Math.max(0.75, Number(rate) || 1))
    try {
      el.playbackRate = safe
    } catch {
      /* Some players refuse. The seek threshold still covers the gap. */
    }
  }

  function play() {
    const el = element()
    if (el) {
      void el.play?.()?.catch?.(() => undefined)
      return
    }
    try {
      sdkPlayer()?.play?.()
    } catch {
      /* Nothing to start. */
    }
  }

  function pause() {
    const el = element()
    if (el) {
      el.pause?.()
      return
    }
    try {
      sdkPlayer()?.pause?.()
    } catch {
      /* Nothing to stop. */
    }
  }

  /**
   * Is what is loaded the feature, rather than an advert or a trailer?
   *
   * One function rather than the same comparison in two places. It was in two,
   * and the second was dead: `titleKey` already returns null below the
   * threshold, so the duplicate test in `ready` could never be the one that
   * fired. Harmless, but exactly the kind of guard a later reader trusts and
   * a later change quietly removes the real half of. A mutation test found it.
   */
  function isFeature(el) {
    return Boolean(el) && Number.isFinite(el.duration) && el.duration >= FEATURE_SECONDS
  }

  /**
   * Which title this is, if it is one.
   *
   * Prime does not put a stable id in the path the way Netflix does —
   * playback happens over the detail page — so the detail id is preferred and
   * the source the element is decoding is the honest fallback. It changes when
   * the title changes, which is the only thing the other side needs it for.
   *
   * Null when what is loaded is not a feature. The other side reads that as
   * "nothing to sync", which is the correct answer during an advert, on a
   * browse rail, and before anything has loaded.
   */
  function titleKey(el) {
    if (!isFeature(el)) return null
    const detail = /\/(?:detail|gp\/video\/detail)\/([A-Z0-9]+)/i.exec(location.pathname)
    return detail ? detail[1] : el.currentSrc || el.src || null
  }

  /*
   * State is pushed, not asked for.
   *
   * A request/response over `postMessage` would make every reading async, and
   * the correction loop on the other side wants the position the way a loop
   * wants a variable — now, cheaply, four times a second.
   *
   * Everything is read from one element handle per tick. Looking it up per
   * property meant eight `querySelectorAll` calls a tick, thirty-two a second,
   * on a page that is already doing plenty.
   */
  setInterval(() => {
    const el = element()
    const position = el ? el.currentTime || 0 : 0
    const duration = el && Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0

    judgePendingSeek(position, el)

    const feature = isFeature(el)
    const key = feature ? titleKey(el) : null
    window.postMessage(
      {
        channel: CHANNEL,
        kind: 'state',
        /* Stamped here so the other side can tell a fresh reading from a stale
           one after a tab has been throttled in the background. */
        at: performance.now(),
        titleKey: key,
        /* Loaded, long enough not to be an advert, and identifiable. */
        ready: feature && Boolean(key),
        position,
        duration,
        paused: el ? el.paused : true,
        /* Reported so the other side can tell its request took, rather than
           assuming it did — a player is free to reset this whenever it likes. */
        rate: el && Number.isFinite(el.playbackRate) ? el.playbackRate : 1,
        /* Stalled, as opposed to paused. A player that is buffering is not
           paused, and correction has to stand down during one or it seeks a
           player that is already struggling and turns a slow moment into a
           loop of them. */
        buffering: el ? el.readyState < 3 && !el.paused : false,
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
