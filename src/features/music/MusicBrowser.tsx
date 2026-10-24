import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  Heart,
  Link2,
  ListMusic,
  Loader2,
  Music4,
  Play,
  Plus,
  Search,
  Shuffle,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as musicApi from '@/features/music/api'
import { useMusic } from '@/features/music/MusicContext'
import { TrackCard, TrackGrid } from '@/features/music/TrackCard'
import { TrackRow } from '@/features/music/TrackRow'
import {
  isExternalPlaylistLink,
  trackKey,
  type LibraryTrack,
  type Playlist,
  type TrackSearchResult,
} from '@/features/music/types'
import type { useLibrary } from '@/features/music/useLibrary'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

type View = 'search' | 'liked' | 'playlists' | 'suggested'

const NAV: { id: View; label: string; icon: typeof Search }[] = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'liked', label: 'Liked', icon: Heart },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'suggested', label: 'Suggested', icon: Sparkles },
]

/** A YouTube result, in the shape the rest of the app stores songs in. */
const fromSearch = (result: TrackSearchResult): LibraryTrack => ({
  source: 'youtube',
  ref: result.id,
  title: result.title,
  artist: result.channel,
  album: null,
  artwork: result.thumbnail,
  duration: null,
})

/** The fields the queue takes — a playlist row carries an id and position too. */
const toResolved = (track: LibraryTrack) => ({
  source: track.source,
  ref: track.ref,
  title: track.title,
  artist: track.artist,
  album: track.album,
  artwork: track.artwork,
  duration: track.duration,
})

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

/**
 * The library half of the music app.
 *
 * Everything that is not the record itself: finding songs, keeping them, and
 * choosing what plays next.
 *
 * Browsing is a grid of covers, because a cover is recognised long before a
 * title is read. A playlist stays a numbered list — there the running order is
 * the information, and a grid says nothing about what follows what.
 */
export function MusicBrowser({
  library,
  onSectionChange,
}: {
  library: ReturnType<typeof useLibrary>
  /** Lets the shell colour its header for whichever view is showing. */
  onSectionChange?: (view: View) => void
}) {
  const { roomId, snapshot, canSearch, onQueued, queue } = useMusic()

  const [view, setView] = useState<View>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TrackSearchResult[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /*
   * The open playlist by id, read from the library each render.
   *
   * Holding the playlist object itself froze it at the moment it was opened:
   * songs added to it, removed from it, or arriving from an import all changed
   * the library but never the page showing it.
   */
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null)
  const openPlaylist = library.playlists.find((one) => one.id === openPlaylistId) ?? null
  const [suggestions, setSuggestions] = useState<{
    history: LibraryTrack[]
    more: TrackSearchResult[]
  } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  /* The song waiting on a playlist that does not exist yet. */
  const [newListFor, setNewListFor] = useState<LibraryTrack | null>(null)
  const [newListName, setNewListName] = useState('')

  const filePicker = useRef<HTMLInputElement>(null)
  const searchField = useRef<HTMLInputElement>(null)

  const current = snapshot?.track ?? null
  const playing = snapshot?.playing ?? false

  useEffect(() => {
    onSectionChange?.(view)
  }, [view, onSectionChange])

  useEffect(() => {
    if (view === 'search') searchField.current?.focus()
  }, [view])

  /* Suggestions follow whatever is on — the seed is the current artist, so the
     list is a continuation of this song rather than a fixed shelf. */
  useEffect(() => {
    if (view !== 'suggested' || !roomId) return
    setBusy(true)
    musicApi
      .fetchSuggestions(roomId, current?.artist)
      .then(setSuggestions)
      .catch(() => setSuggestions({ history: [], more: [] }))
      .finally(() => setBusy(false))
  }, [view, roomId, current?.artist])

  /**
   * Put a song on now.
   *
   * Everything reachable from here is a `LibraryTrack`, not a queue row — so
   * playing means adding it to the room's queue first and letting the normal
   * pending-id path start it, exactly as the picker does.
   */
  /**
   * Put a song in the room's queue, and optionally on right now.
   *
   * Everything reachable from here is a `LibraryTrack`, not a queue row, so
   * both actions go through the same add — the only difference is whether the
   * room is asked to load it immediately or leave it for later.
   */
  const enqueue = useCallback(
    async (track: LibraryTrack, playNow: boolean) => {
      if (!roomId) return
      setError(null)
      try {
        const queued = await musicApi.addToQueue(roomId, toResolved(track))
        onQueued(queued, playNow)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not add that')
      }
    },
    [roomId, onQueued],
  )

  /** A whole playlist onto the queue, the first song on now. */
  const playAll = useCallback(
    async (tracks: LibraryTrack[], shuffled: boolean) => {
      if (!roomId || tracks.length === 0) return
      setError(null)
      const order = shuffled ? shuffle(tracks) : tracks
      try {
        const queued = await musicApi.addManyToQueue(roomId, order.slice(0, 200).map(toResolved))
        onQueued(queued, true)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not play that')
      }
    },
    [roomId, onQueued],
  )

  const importLink = useCallback(
    async (link: string) => {
      const created = await library.importPlaylist(link)
      if (created) {
        setView('playlists')
        setOpenPlaylistId(created.id)
      }
    },
    [library],
  )

  const play = useCallback(
    (track: LibraryTrack) => void enqueue(track, true),
    [enqueue],
  )

  const runSearch = useCallback(async () => {
    const value = query.trim()
    if (!value || !roomId) return

    setBusy(true)
    setError(null)
    setResults(null)

    try {
      /* A Spotify or Apple Music list cannot play here, but its songs can. */
      if (isExternalPlaylistLink(value)) {
        await importLink(value)
        setQuery('')
        return
      }

      const looksLikeLink = /^https?:\/\//i.test(value) || /^[\w-]{11}$/.test(value)

      /* A pasted link is an instruction, not a query — resolving it names the
         song properly and puts it straight on. */
      if (looksLikeLink) {
        const resolved = await musicApi.resolveInput(roomId, value)
        await enqueue(resolved, true)
        setQuery('')
        return
      }

      if (!canSearch) {
        setError('Search needs a YouTube API key on the server — paste a link instead.')
        return
      }

      setResults(await musicApi.searchTracks(roomId, value))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not search')
    } finally {
      setBusy(false)
    }
  }, [query, roomId, canSearch, enqueue, importLink])

  const upload = useCallback(
    async (file: File | undefined) => {
      if (!file || !roomId) return
      setError(null)
      setUploadProgress(0)
      try {
        const resolved = await musicApi.uploadTrack(roomId, file, setUploadProgress)
        await enqueue(resolved, true)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Upload failed')
      } finally {
        setUploadProgress(null)
      }
    },
    [roomId, enqueue],
  )

  const rowProps = useCallback(
    (track: LibraryTrack) => ({
      track,
      playing,
      current: current?.source === track.source && current.ref === track.ref,
      liked: library.isLiked(track),
      playlists: library.playlists,
      onPlay: () => play(track),
      onQueue: () => void enqueue(track, false),
      onLike: () => void library.toggleLike(track),
      onAddToPlaylist: (playlistId: string) => void library.addToPlaylist(playlistId, track),
      onNewPlaylist: () => {
        setNewListName('')
        setNewListFor(track)
      },
    }),
    [playing, current, library, play, enqueue],
  )

  const heading = useMemo(() => NAV.find((entry) => entry.id === view)!, [view])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <input
        ref={filePicker}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/opus,audio/wav,audio/flac"
        className="hidden"
        onChange={(event) => {
          void upload(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      {/*
        Naming a new playlist without losing the song that prompted it.
        The track is held while the name is typed, then both happen together —
        so "add this to a new playlist" is one action rather than three.
      */}
      <Dialog open={newListFor !== null} onOpenChange={(open) => !open && setNewListFor(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New playlist</DialogTitle>
            <DialogDescription>
              {newListFor
                ? `“${newListFor.title}” goes in first. Everyone in the room can see it.`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              const name = newListName.trim()
              const track = newListFor
              if (!name || !track) return
              setNewListFor(null)
              void library.createPlaylist(name).then((created) => {
                if (created) void library.addToPlaylist(created.id, track)
              })
            }}
          >
            <input
              autoFocus
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              placeholder="Name this playlist"
              className="h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[0.88rem] text-chalk outline-none placeholder:text-dusk focus:border-white/25"
            />
            <button
              type="submit"
              disabled={newListName.trim().length === 0}
              className="shrink-0 rounded-full bg-chalk px-4 text-[0.82rem] font-medium text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-40"
            >
              Create
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/*
        The rail. Horizontal on a phone and vertical from `md` up — the same
        four destinations either way, so the app does not change shape, only
        orientation.
      */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto px-4 pb-2 pt-1 md:w-52 md:flex-col md:overflow-visible md:px-4 md:pb-6 md:pt-2">
          {NAV.map((entry) => {
            const Icon = entry.icon
            const active = view === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setView(entry.id)
                  setOpenPlaylistId(null)
                }}
                className={cn(
                  'relative flex min-h-11 shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2 text-left outline-none transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:min-h-0 md:rounded-xl',
                  active ? 'text-chalk' : 'text-mist hover:text-chalk',
                )}
              >
                {/* The selection is a moving object, not a class that blinks
                    between items — Motion carries it between destinations. */}
                {active && (
                  <motion.span
                    layoutId="music-nav-active"
                    className="absolute inset-0 rounded-full bg-white/[0.09] ring-1 ring-inset ring-white/10 md:rounded-xl"
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                )}
                <Icon aria-hidden className="relative size-4 shrink-0" />
                <span className="relative text-[0.85rem] font-medium">{entry.label}</span>
              </button>
            )
          })}

          <div className="hidden md:mt-auto md:block md:px-1">
            <button
              type="button"
              onClick={() => filePicker.current?.click()}
              disabled={uploadProgress !== null}
              className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-white/12 px-3.5 py-2.5 text-left text-[0.8rem] text-mist outline-none transition-colors hover:border-white/25 hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-50"
            >
              {uploadProgress !== null ? (
                <>
                  <Loader2 aria-hidden className="size-4 shrink-0 animate-spin" />
                  <span>{Math.round(uploadProgress * 100)}%</span>
                </>
              ) : (
                <>
                  <Upload aria-hidden className="size-4 shrink-0" />
                  <span>Upload a track</span>
                </>
              )}
            </button>
          </div>
        </nav>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-2 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={openPlaylist ? `playlist-${openPlaylist.id}` : view}
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="shrink-0 pb-3">
                {openPlaylist && (
                  <button
                    type="button"
                    onClick={() => setOpenPlaylistId(null)}
                    className="-ml-1 mb-1.5 flex items-center gap-1.5 rounded-full px-1 py-0.5 text-[0.76rem] text-mist outline-none transition-colors hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
                  >
                    <ArrowLeft aria-hidden className="size-3.5" />
                    All playlists
                  </button>
                )}
                <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.03em] text-chalk">
                  {openPlaylist ? openPlaylist.name : heading.label}
                </h2>
                {openPlaylist && (
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="text-[0.78rem] text-dusk">
                      {openPlaylist.tracks.length}{' '}
                      {openPlaylist.tracks.length === 1 ? 'song' : 'songs'} · made by{' '}
                      {openPlaylist.createdBy.name}
                    </p>
                    {openPlaylist.tracks.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void playAll(openPlaylist.tracks, false)}
                          className="flex h-9 items-center gap-1.5 rounded-full bg-chalk px-4 text-[0.8rem] font-medium text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                        >
                          <Play aria-hidden className="size-3.5 fill-current" />
                          Play all
                        </button>
                        <button
                          type="button"
                          onClick={() => void playAll(openPlaylist.tracks, true)}
                          className="flex h-9 items-center gap-1.5 rounded-full border border-white/12 px-4 text-[0.8rem] text-chalk outline-none transition-colors hover:border-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                        >
                          <Shuffle aria-hidden className="size-3.5" />
                          Shuffle
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {view === 'search' && !openPlaylist && (
                <form
                  className="shrink-0 pb-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void runSearch()
                  }}
                >
                  <div className="relative">
                    <Search
                      aria-hidden
                      className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-dusk"
                    />
                    <input
                      ref={searchField}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={
                        canSearch
                          ? 'Search for a song, or paste a link'
                          : 'Paste a YouTube link, or a direct audio URL'
                      }
                      spellCheck={false}
                      className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-4 text-[0.9rem] text-chalk outline-none transition-colors placeholder:text-dusk focus:border-white/25 focus:bg-white/[0.06]"
                    />
                    {busy && (
                      <Loader2
                        aria-hidden
                        className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-mist"
                      />
                    )}
                  </div>
                </form>
              )}

              {error && (
                <p
                  role="alert"
                  className="mb-3 shrink-0 rounded-xl border border-signal/25 bg-signal/[0.08] px-4 py-2.5 text-[0.8rem] text-signal-bright"
                >
                  {error}
                </p>
              )}

              <ScrollArea className="min-h-0 flex-1" data-lenis-prevent>
                <div className="pb-6 pr-3">
                  {openPlaylist ? (
                    <PlaylistDetail
                      playlist={openPlaylist}
                      roomId={roomId}
                      rowProps={rowProps}
                      onAdd={(track) => library.addToPlaylist(openPlaylist.id, track)}
                      onRemove={(trackId) =>
                        void library.removeFromPlaylist(openPlaylist.id, trackId)
                      }
                    />
                  ) : view === 'search' ? (
                    <SearchView results={results} rowProps={rowProps} queued={queue.length} />
                  ) : view === 'liked' ? (
                    <LikedView tracks={library.liked} rowProps={rowProps} />
                  ) : view === 'playlists' ? (
                    <PlaylistsView
                      library={library}
                      onOpen={(playlist) => setOpenPlaylistId(playlist.id)}
                      onImport={importLink}
                    />
                  ) : (
                    <SuggestedView
                      suggestions={suggestions}
                      busy={busy}
                      seed={current?.artist ?? null}
                      rowProps={rowProps}
                    />
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ── Views ─────────────────────────────────────────────────────────────── */

function Empty({ icon: Icon, title, body }: { icon: typeof Music4; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.05] text-mist ring-1 ring-inset ring-white/10">
        <Icon aria-hidden className="size-5" />
      </span>
      <p className="mt-4 font-display text-[1.05rem] font-semibold text-chalk">{title}</p>
      <p className="mt-1.5 max-w-sm text-[0.84rem] leading-relaxed text-mist">{body}</p>
    </div>
  )
}

type RowProps = (track: LibraryTrack) => React.ComponentProps<typeof TrackRow>

function SearchView({
  results,
  rowProps,
  queued,
}: {
  results: TrackSearchResult[] | null
  rowProps: RowProps
  queued: number
}) {
  if (!results) {
    return (
      <Empty
        icon={Search}
        title="Find something to play"
        body={
          queued > 0
            ? 'Search for a song, paste a link, or open the queue to carry on where the room left off.'
            : 'Search for a song, or paste a YouTube link or a direct audio URL.'
        }
      />
    )
  }

  if (results.length === 0) {
    return <Empty icon={Search} title="Nothing found" body="Try a different set of words." />
  }

  return (
    <TrackGrid>
      {results.map((result) => (
        <TrackCard key={result.id} {...rowProps(fromSearch(result))} badge={result.kind ?? undefined} />
      ))}
    </TrackGrid>
  )
}

function LikedView({ tracks, rowProps }: { tracks: LibraryTrack[]; rowProps: RowProps }) {
  if (tracks.length === 0) {
    return (
      <Empty
        icon={Heart}
        title="Nothing saved yet"
        body="Hearts you press anywhere in here land in this list. It is yours — nobody else in the room sees it."
      />
    )
  }

  return (
    <TrackGrid>
      {tracks.map((track) => (
        <TrackCard key={`${track.source}:${track.ref}`} {...rowProps(track)} />
      ))}
    </TrackGrid>
  )
}

const FIELD =
  'h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[0.88rem] text-chalk outline-none placeholder:text-dusk focus:border-white/25'
const PRIMARY =
  'flex shrink-0 items-center gap-1.5 rounded-full bg-chalk px-4 text-[0.82rem] font-medium text-void outline-none transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-40 disabled:hover:scale-100'
const TILE =
  'flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-dashed border-white/12 px-4 py-3 text-left text-[0.85rem] text-mist outline-none transition-colors hover:border-white/25 hover:text-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal'

function PlaylistsView({
  library,
  onOpen,
  onImport,
}: {
  library: ReturnType<typeof useLibrary>
  onOpen: (playlist: Playlist) => void
  onImport: (link: string) => Promise<void>
}) {
  /* One of the two ways in is open at a time — they share the same row. */
  const [mode, setMode] = useState<'idle' | 'name' | 'import'>('idle')
  const [value, setValue] = useState('')
  const [working, setWorking] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const close = () => {
    setMode('idle')
    setValue('')
    setProblem(null)
  }

  const submit = async () => {
    const text = value.trim()
    if (!text || working) return
    setWorking(true)
    setProblem(null)
    try {
      if (mode === 'import' || isExternalPlaylistLink(text)) {
        await onImport(text)
      } else {
        /* Straight into the new playlist, where its songs get added. */
        const created = await library.createPlaylist(text)
        if (created) onOpen(created)
      }
      close()
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : 'That did not work')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="pb-3">
        {mode === 'idle' ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setMode('name')} className={TILE}>
              <Plus aria-hidden className="size-4 shrink-0" />
              New playlist
            </button>
            <button type="button" onClick={() => setMode('import')} className={TILE}>
              <Link2 aria-hidden className="size-4 shrink-0" />
              Import from Spotify or Apple Music
            </button>
          </div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
          >
            <input
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={
                mode === 'import'
                  ? 'Paste a Spotify or Apple Music playlist link'
                  : 'Name this playlist'
              }
              spellCheck={mode !== 'import'}
              disabled={working}
              className={FIELD}
            />
            <button type="submit" disabled={working || value.trim().length === 0} className={PRIMARY}>
              {working && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
              {mode === 'import' ? 'Import' : 'Create'}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Cancel"
              className="grid size-11 shrink-0 place-items-center rounded-full text-mist outline-none transition-colors hover:bg-white/10 hover:text-chalk"
            >
              <X aria-hidden className="size-4" />
            </button>
          </form>
        )}

        {mode === 'import' && !problem && (
          <p className="mt-2 px-1 text-[0.74rem] leading-relaxed text-dusk">
            The playlist has to be public. Each song is found on YouTube Music and plays from there
            — up to the first 100.
          </p>
        )}
        {problem && (
          <p role="alert" className="mt-2 px-1 text-[0.78rem] text-signal-bright">
            {problem}
          </p>
        )}
      </div>

      {library.playlists.length === 0 ? (
        <Empty
          icon={ListMusic}
          title="No playlists yet"
          body="Start one from scratch, or bring one over from Spotify or Apple Music. Playlists belong to the room, so anyone here can open them."
        />
      ) : (
        library.playlists.map((playlist) => {
          const importing = playlist.importing && !playlist.importing.finished ? playlist.importing : null
          return (
            <div
              key={playlist.id}
              className="group/list flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[0.05]"
            >
              <button
                type="button"
                onClick={() => onOpen(playlist)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.05] text-dusk ring-1 ring-inset ring-white/10">
                  {playlist.tracks[0]?.artwork ? (
                    <img src={playlist.tracks[0].artwork} alt="" className="size-full object-cover" />
                  ) : (
                    <ListMusic aria-hidden className="size-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.88rem] text-chalk">{playlist.name}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 truncate text-[0.74rem] text-dusk">
                    {importing ? (
                      <>
                        <Loader2 aria-hidden className="size-3 shrink-0 animate-spin" />
                        Finding songs · {importing.done} of {importing.total}
                      </>
                    ) : (
                      <>
                        {playlist.tracks.length} {playlist.tracks.length === 1 ? 'song' : 'songs'} ·{' '}
                        {playlist.createdBy.name}
                      </>
                    )}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => void library.removePlaylist(playlist.id)}
                aria-label={`Delete ${playlist.name}`}
                className="grid size-8 shrink-0 place-items-center rounded-full text-dusk opacity-0 outline-none transition-all hover:text-signal-bright focus-visible:opacity-100 group-hover/list:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}

/** How an import is going, and what it could not find once it is done. */
function ImportStatus({ progress }: { progress: NonNullable<Playlist['importing']> }) {
  const [showMissed, setShowMissed] = useState(false)
  const fraction = progress.total > 0 ? progress.done / progress.total : 0

  if (!progress.finished) {
    return (
      <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2 text-[0.8rem] text-chalk">
          <Loader2 aria-hidden className="size-3.5 animate-spin text-mist" />
          Finding songs on YouTube Music · {progress.done} of {progress.total}
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-chalk"
            animate={{ width: `${Math.round(fraction * 100)}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
      </div>
    )
  }

  if (progress.missed.length === 0) return null

  return (
    <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[0.8rem]">
      <button
        type="button"
        onClick={() => setShowMissed((open) => !open)}
        className="text-left text-mist outline-none hover:text-chalk focus-visible:outline-2 focus-visible:outline-signal"
      >
        Found {progress.found} of {progress.total}. {progress.missed.length}{' '}
        {progress.missed.length === 1 ? 'song was' : 'songs were'} not on YouTube Music —{' '}
        <span className="underline underline-offset-2">{showMissed ? 'hide' : 'see which'}</span>
      </button>
      {showMissed && (
        <ul className="mt-2 space-y-0.5 text-[0.76rem] text-dusk">
          {progress.missed.map((name) => (
            <li key={name} className="truncate">
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Searching from inside a playlist, straight into it.
 *
 * Before this the only way to fill a playlist was to leave it, search, and
 * use each result's menu — so a freshly made playlist sat empty with nothing
 * on the page that could change that.
 */
function AddSongs({
  roomId,
  playlist,
  onAdd,
}: {
  roomId: string | null
  playlist: Playlist
  onAdd: (track: LibraryTrack) => Promise<void>
}) {
  const [open, setOpen] = useState(playlist.tracks.length === 0 && !playlist.importing)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LibraryTrack[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [adding, setAdding] = useState<Set<string>>(new Set())

  const inPlaylist = useMemo(() => new Set(playlist.tracks.map(trackKey)), [playlist.tracks])

  const search = async () => {
    const value = query.trim()
    if (!value || !roomId) return
    setBusy(true)
    setProblem(null)
    try {
      if (/^https?:\/\//i.test(value) || /^[\w-]{11}$/.test(value)) {
        /* A pasted song link goes straight in. */
        const resolved = await musicApi.resolveInput(roomId, value)
        await onAdd(resolved)
        setQuery('')
        setResults(null)
      } else {
        setResults((await musicApi.searchTracks(roomId, value)).map(fromSearch))
      }
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : 'Could not search')
    } finally {
      setBusy(false)
    }
  }

  const add = async (track: LibraryTrack) => {
    const key = trackKey(track)
    setAdding((current) => new Set(current).add(key))
    try {
      await onAdd(track)
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : 'Could not add that')
    } finally {
      setAdding((current) => {
        const next = new Set(current)
        next.delete(key)
        return next
      })
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={cn(TILE, 'mb-3 w-full flex-none')}>
        <Plus aria-hidden className="size-4 shrink-0" />
        Add songs
      </button>
    )
  }

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void search()
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-dusk"
          />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a song to add, or paste a link"
            spellCheck={false}
            className={cn(FIELD, 'w-full pl-11')}
          />
          {busy && (
            <Loader2
              aria-hidden
              className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-mist"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setResults(null)
            setQuery('')
          }}
          aria-label="Close search"
          className="grid size-11 shrink-0 place-items-center rounded-full text-mist outline-none transition-colors hover:bg-white/10 hover:text-chalk"
        >
          <X aria-hidden className="size-4" />
        </button>
      </form>

      {problem && (
        <p role="alert" className="mt-2 px-1 text-[0.78rem] text-signal-bright">
          {problem}
        </p>
      )}

      {results && results.length === 0 && (
        <p className="mt-3 px-1 text-[0.8rem] text-mist">Nothing found — try different words.</p>
      )}

      {results && results.length > 0 && (
        <ul className="mt-2 flex flex-col gap-0.5">
          {results.map((track) => {
            const key = trackKey(track)
            const added = inPlaylist.has(key)
            const pending = adding.has(key)
            return (
              <li key={key} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/[0.04]">
                <span className="size-10 shrink-0 overflow-hidden rounded-md bg-white/[0.05] ring-1 ring-inset ring-white/10">
                  {track.artwork && <img src={track.artwork} alt="" className="size-full object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.85rem] text-chalk">{track.title}</span>
                  <span className="block truncate text-[0.74rem] text-dusk">{track.artist}</span>
                </span>
                <button
                  type="button"
                  disabled={added || pending}
                  onClick={() => void add(track)}
                  aria-label={added ? `${track.title} is in this playlist` : `Add ${track.title}`}
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full outline-none transition-colors focus-visible:outline-2 focus-visible:outline-signal',
                    added ? 'text-chalk' : 'text-mist hover:bg-white/10 hover:text-chalk',
                  )}
                >
                  {pending ? (
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                  ) : added ? (
                    <Check aria-hidden className="size-4" />
                  ) : (
                    <Plus aria-hidden className="size-4" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function PlaylistDetail({
  playlist,
  roomId,
  rowProps,
  onAdd,
  onRemove,
}: {
  playlist: Playlist
  roomId: string | null
  rowProps: RowProps
  onAdd: (track: LibraryTrack) => Promise<void>
  onRemove: (trackId: string) => void
}) {
  const importing = playlist.importing ?? null
  const stillImporting = importing !== null && !importing.finished

  return (
    <div className="flex flex-col gap-0.5">
      {importing && <ImportStatus progress={importing} />}
      {!stillImporting && <AddSongs key={playlist.id} roomId={roomId} playlist={playlist} onAdd={onAdd} />}

      {playlist.tracks.length === 0 && !stillImporting ? (
        <p className="px-1 py-6 text-center text-[0.84rem] text-mist">
          Nothing in here yet. Search above to add the first song.
        </p>
      ) : (
        playlist.tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            index={index}
            {...rowProps(track)}
            onRemove={() => onRemove(track.id)}
            removeLabel="Remove from this playlist"
          />
        ))
      )}
    </div>
  )
}

function SuggestedView({
  suggestions,
  busy,
  seed,
  rowProps,
}: {
  suggestions: { history: LibraryTrack[]; more: TrackSearchResult[] } | null
  busy: boolean
  seed: string | null
  rowProps: RowProps
}) {
  if (busy && !suggestions) {
    return (
      <div className="grid place-items-center py-14">
        <Loader2 aria-hidden className="size-5 animate-spin text-mist" />
      </div>
    )
  }

  const history = suggestions?.history ?? []
  const more = suggestions?.more ?? []

  if (history.length === 0 && more.length === 0) {
    return (
      <Empty
        icon={Sparkles}
        title="Nothing to suggest yet"
        body="This list is built from what the room has actually played. Put a few songs on and it fills up."
      />
    )
  }

  return (
    <>
      {more.length > 0 && (
        <>
          {/*
            Labelled for what it is. This is a search for more from the current
            artist, not a model of anyone's taste — calling it "more like this"
            would be claiming an understanding the app does not have.
          */}
          <p className="px-0.5 pb-2.5 pt-1 text-[0.7rem] uppercase tracking-[0.18em] text-dusk">
            More from {seed}
          </p>
          <TrackGrid>
            {more.map((result) => (
              <TrackCard key={result.id} {...rowProps(fromSearch(result))} />
            ))}
          </TrackGrid>
        </>
      )}

      {history.length > 0 && (
        <>
          <p className="px-0.5 pb-2.5 pt-4 text-[0.7rem] uppercase tracking-[0.18em] text-dusk">
            Played in this room
          </p>
          <TrackGrid>
            {history.map((track) => (
              <TrackCard key={`${track.source}:${track.ref}`} {...rowProps(track)} />
            ))}
          </TrackGrid>
        </>
      )}
    </>
  )
}
