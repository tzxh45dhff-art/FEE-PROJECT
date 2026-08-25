import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as musicApi from '@/features/music/api'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { MusicContext, type MusicContextValue } from '@/features/music/MusicContext'
import { TrackPlayer } from '@/features/music/players/TrackPlayer'
import { YouTubeTrackPlayer } from '@/features/music/players/YouTubeTrackPlayer'
import type { AudioHandle, QueuedTrack } from '@/features/music/types'
import { useMusicSession } from '@/features/music/useMusicSession'
import { useSingalong } from '@/features/music/useSingalong'

/** Personal, and remembered between sessions. */
const VOLUME_KEY = 'syncroom.musicVolume'

/**
 * Owns the room's music, above every screen that shows it.
 *
 * The player elements are mounted here, not in the page. That is the whole
 * point: leaving the record view has to leave the music playing, and the
 * floating dock is the same audio seen small rather than a second copy of it.
 *
 * Mounted for as long as you are in a room, in the same spirit as chat and the
 * call — a feature you can walk away from and come back to cannot be owned by
 * the thing you walked away from.
 */
export function MusicProvider({
  roomId,
  /** False while the watch stage is up — see `paused` below. */
  enabled,
  children,
}: {
  roomId: string | null
  enabled: boolean
  children: React.ReactNode
}) {
  const { snapshot, queue, setQueue, connected, clockReady, targetPosition, send } = useMusicSession(
    roomId,
    Boolean(roomId) && enabled,
  )

  /* Read by the drift interval below without being a dependency of it — see
     the note there on why its identity cannot be trusted. */
  const positionOf = useRef(targetPosition)
  positionOf.current = targetPosition

  const [handle, setHandle] = useState<AudioHandle | null>(null)
  const [analyserSource, setAnalyserSource] = useState<MediaElementAudioSourceNode | null>(null)
  const [needsGesture, setNeedsGesture] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [pendingPlayId, setPendingPlayId] = useState<string | null>(null)
  const [canSearch, setCanSearch] = useState(false)

  const [volume, setVolume] = useState(() => {
    try {
      const stored = Number(localStorage.getItem(VOLUME_KEY))
      return Number.isFinite(stored) && stored > 0 ? Math.min(1, stored) : 0.8
    } catch {
      return 0.8
    }
  })

  const track = snapshot?.track ?? null

  const singalong = useSingalong({
    roomId,
    enabled: Boolean(roomId) && enabled,
    musicSource: analyserSource,
  })

  useEffect(() => {
    if (!roomId) return
    musicApi
      .fetchCapabilities(roomId)
      .then((caps) => setCanSearch(caps.search))
      .catch(() => setCanSearch(false))
  }, [roomId])

  useEffect(() => {
    if (!roomId) return
    musicApi.fetchQueue(roomId).then(setQueue).catch(() => undefined)
  }, [roomId, setQueue])

  useEffect(() => {
    setError(null)
    setNeedsGesture(false)
  }, [track?.id])

  useEffect(() => {
    setAnalyserSource(handle?.getAnalyserSource() ?? null)
  }, [handle])

  /*
   * Reconcile playback with the room. Keyed on the room's intent rather than
   * on player events — the player follows here, it does not lead.
   */
  useEffect(() => {
    if (!handle || !snapshot) return

    if (!snapshot.playing) {
      handle.pause()
      setNeedsGesture(false)
      return
    }

    /*
     * Nothing is placed until the clock has been measured — see the matching
     * note in WatchStage. Before the first pong the offset is zero, which is
     * "not asked yet" rather than "no skew", and starting a track from it puts
     * every device at a different point in the song. The lyrics read their
     * position from this same clock, so a track started on an unmeasured one
     * highlights the wrong line for as long as it takes to converge.
     */
    if (!clockReady) return

    handle.seek(targetPosition())
    handle.play()

    const before = handle.getPosition()
    const check = setTimeout(() => {
      /* Still parked a moment later means the play was refused, not slow. */
      if (handle.getPosition() <= before + 0.05 && !handle.isBuffering()) setNeedsGesture(true)
    }, 1400)

    return () => clearTimeout(check)
    /* Keyed on `seq` — a listener walking in rebuilds the snapshot without
       changing playback, and re-running this would re-seek under everyone. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, clockReady, snapshot?.seq, snapshot?.playing])

  /*
   * Drift correction, by seeking only.
   *
   * The watch stage nudges playback rate to absorb small drift, which works
   * because a frame arriving fractionally early is invisible. It is not an
   * option here: a song played 3% fast is audibly a different song.
   */
  useEffect(() => {
    if (!handle || !snapshot?.playing || needsGesture) return

    /*
     * How far out of step is worth an audible correction.
     *
     * A seek on an uploaded file is a jump in a decoded buffer and costs
     * nothing. A seek on YouTube tears down and refetches a media segment,
     * which is heard as a stutter or a click — so on that source the bar for
     * interrupting is much higher, and a second of drift is left alone rather
     * than corrected into a glitch every few seconds.
     */
    const tolerance = track?.source === 'youtube' ? 4 : 1.5

    const timer = setInterval(() => {
      if (handle.isBuffering()) return
      const target = positionOf.current()
      const drift = Math.abs(handle.getPosition() - target)
      if (drift > tolerance) handle.seek(target)
    }, 5000)

    return () => clearInterval(timer)
    /*
     * `targetPosition` is deliberately not a dependency, and is read from a ref
     * instead.
     *
     * Its identity changes whenever the snapshot object does, and the snapshot
     * is rebuilt for things that are not playback at all — `music:listeners`
     * fires every time somebody joins, leaves, or picks up a microphone. Each
     * of those tore this interval down and started it again, and since the
     * interval is five seconds long, a room with any activity in it could reset
     * the timer indefinitely and never once run the check.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, snapshot?.playing, needsGesture, track?.source])

  useEffect(() => {
    const tick = () => {
      if (handle) {
        setPosition(handle.getPosition())
        setDuration(handle.getDuration() || track?.duration || 0)
      } else if (snapshot) {
        setPosition(targetPosition())
        setDuration(track?.duration ?? 0)
      }
    }
    tick()
    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [handle, snapshot, targetPosition, track?.duration])

  useEffect(() => {
    handle?.setVolume(volume)
    try {
      localStorage.setItem(VOLUME_KEY, String(volume))
    } catch {
      /* Private browsing can refuse storage; the volume still applies. */
    }
  }, [volume, handle])

  /*
   * Stop when the room starts watching something.
   *
   * Two soundtracks at once is never what anyone wants, and a film is the one
   * activity that brings its own. Paused rather than cleared, so the queue and
   * the position survive and the music picks up where it was afterwards.
   */
  useEffect(() => {
    if (enabled) return
    handle?.pause()
  }, [enabled, handle])

  const playNow = useCallback(
    (next: QueuedTrack) => send('music:load', { trackId: next.id }),
    [send],
  )

  const onQueued = useCallback(
    (
      { item: added, items }: { item: QueuedTrack; items: QueuedTrack[] },
      playImmediately: boolean,
    ) => {
      /* The REST reply is already the new queue, so seed it rather than wait on
         the socket — see the identical note on the watch stage. */
      setQueue(items)
      if (playImmediately) setPendingPlayId(added.id)
    },
    [setQueue],
  )

  useEffect(() => {
    if (!pendingPlayId) return
    const target = queue.find((entry) => entry.id === pendingPlayId)
    if (!target) return
    playNow(target)
    setPendingPlayId(null)
  }, [pendingPlayId, queue, playNow])

  const onEnded = useCallback(() => {
    if (!snapshot) return
    /* The seq stamps which track ended, so every client firing at the end of a
       song still only advances the queue once. */
    send('music:ended', { seq: snapshot.seq })
  }, [send, snapshot])

  /*
   * Keep the room playing when the queue runs dry.
   *
   * Searches for more from the artist that just finished and queues the first
   * result. This is a continuation, not a recommendation — it knows the name
   * of an artist and nothing about anyone's taste, which is exactly as much as
   * this app can honestly claim.
   *
   * Guarded by a ref rather than state so the check cannot re-enter while its
   * own request is still out; two of these racing would queue the same song
   * twice and skip past it.
   */
  const continuing = useRef(false)
  useEffect(() => {
    if (!roomId || !enabled) return
    /* Only when playback has genuinely stopped with nothing left to play. */
    if (!snapshot || snapshot.track || queue.length > 0) return
    if (continuing.current) return

    const artist = lastArtist.current
    if (!artist) return

    continuing.current = true
    void musicApi
      .fetchSuggestions(roomId, artist)
      .then(async (result) => {
        const next = result.more[0]
        if (!next) return
        const queued = await musicApi.addToQueue(roomId, {
          source: 'youtube',
          ref: next.id,
          title: next.title,
          artist: next.channel,
          album: null,
          artwork: next.thumbnail,
          duration: null,
        })
        setQueue(queued.items)
        setPendingPlayId(queued.item.id)
      })
      .catch(() => undefined)
      .finally(() => {
        continuing.current = false
      })
  }, [roomId, enabled, snapshot, queue.length, setQueue])

  /*
   * The last YouTube video this room played.
   *
   * Kept so the player below can outlive the track that introduced it — see
   * the note there. Cleared only when the room changes, because that is the
   * one moment the whole session is genuinely being torn down.
   */
  const [stickyYouTubeRef, setStickyYouTubeRef] = useState<string | null>(null)
  useEffect(() => {
    if (track?.source === 'youtube') setStickyYouTubeRef(track.ref)
  }, [track?.source, track?.ref])
  useEffect(() => {
    setStickyYouTubeRef(null)
  }, [roomId])

  /* Remembered past the end of the song, since the track is null by the time
     the continuation above needs to know what was playing. */
  const lastArtist = useRef<string | null>(null)
  useEffect(() => {
    if (track?.artist) lastArtist.current = track.artist
  }, [track?.artist])

  const onDuration = useCallback(
    (seconds: number) => {
      if (!track) return
      send('music:duration', { trackId: track.id, duration: Math.round(seconds) })
    },
    [send, track],
  )

  const acknowledgeGesture = useCallback(() => {
    handle?.seek(targetPosition())
    handle?.play()
    setNeedsGesture(false)
  }, [handle, targetPosition])

  const value = useMemo<MusicContextValue>(
    () => ({
      roomId,
      snapshot,
      queue,
      setQueue,
      connected,
      targetPosition,
      send,
      handle,
      position,
      duration,
      needsGesture,
      acknowledgeGesture,
      error,
      setError,
      volume,
      setVolume,
      analyserSource,
      singalong,
      playNow,
      onQueued,
      canSearch,
    }),
    [
      roomId,
      snapshot,
      queue,
      setQueue,
      connected,
      targetPosition,
      send,
      handle,
      position,
      duration,
      needsGesture,
      acknowledgeGesture,
      error,
      volume,
      analyserSource,
      singalong,
      playNow,
      onQueued,
      canSearch,
    ],
  )

  return (
    <MusicContext.Provider value={value}>
      {/*
        Mounted here, so the audio survives the page being closed — and bounded
        here, because a player is the one part of this tree that hands control
        to somebody else's code.

        The YouTube iframe API throws from inside its own cross-origin script,
        which surfaces as an un-stacked "Script error." raised out of our effect.
        React treats that as a failed mount and, with nothing to catch it above,
        unmounts the whole application to a black page. A failed player should
        cost the room its music, not its interface.
      */}
      <ErrorBoundary
        resetKey={track?.ref}
        fallback={() => null}
      >
        {/*
          Keyed on what is playing, not on which queue row it came from.

          `track.id` is the queue row's id, and pressing play always inserts a
          fresh row — so keying on it tore the player down and built a new one
          even when the same song was chosen again. For an `<audio>` element
          that is merely wasteful; for the YouTube API it is the thing that
          breaks it, because a `destroy()` immediately followed by a
          `new Player()` catches the SDK mid-teardown and it dereferences an
          iframe it has already dropped.

          Keyed on the ref, replaying the same song reuses the player and the
          sync engine simply seeks it, which is both correct and what the API
          is designed for.
        */}
        {roomId && track?.source === 'file' && (
          <TrackPlayer
            key={track.ref}
            src={track.ref}
            startAt={targetPosition()}
            volume={volume}
            onHandle={setHandle}
            onEnded={onEnded}
            onError={setError}
            onDuration={onDuration}
          />
        )}

        {/*
          Mounted from the first YouTube track until you leave the room.

          Not conditional on YouTube being what is playing *now*: taking it
          away calls `destroy()`, and the moment that most often happens is a
          queue running out — which is to say, during the SDK's own ENDED
          event. That was the crash left after the remount one. Idle, it is a
          paused off-screen iframe holding no attention and driving nothing.
        */}
        {roomId && stickyYouTubeRef && (
          <YouTubeTrackPlayer
            key="youtube"
            videoId={stickyYouTubeRef}
            active={track?.source === 'youtube'}
            startAt={targetPosition()}
            volume={volume}
            onHandle={setHandle}
            onEnded={onEnded}
            onError={setError}
            onDuration={onDuration}
          />
        )}
      </ErrorBoundary>

      {children}
    </MusicContext.Provider>
  )
}
