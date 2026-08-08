import { screenSource } from '@/lib/media'
import { cn } from '@/lib/utils'

const CHATTERS = [
  { name: 'Ana', color: '#ff0000', line: 'wait go back 10 seconds' },
  { name: 'Ravi', color: '#3b6bff', line: 'nobody move i’m getting snacks' },
  { name: 'Mei', color: '#00b3a4', line: 'called it. CALLED IT.' },
  { name: 'Sam', color: '#f0a020', line: 'ok this is actually so good' },
]

/** Chrome-free, muted, looping. `playlist=<id>` is what makes loop work. */
function youtubeSrc(id: string) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id,
    controls: '0',
    modestbranding: '1',
    playsinline: '1',
    rel: '0',
    disablekb: '1',
    fs: '0',
    iv_load_policy: '3',
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}

type DeviceScreenProps = {
  /** Matches the video filename in src/assets/videos/ and the pin in data/screens.ts. */
  slot: string
  /** Picks which trailer / still this device gets. */
  sourceIndex: number
  /** Phones get a stacked chat; larger screens get the side rail. */
  compact?: boolean
  className?: string
}

/**
 * What plays inside a device frame. A dropped-in video file wins; otherwise an
 * official trailer embed; otherwise artwork with a slow drift. The room chrome
 * — live badge, chat, shared playhead — sits on top either way.
 */
export function DeviceScreen({ slot, sourceIndex, compact = false, className }: DeviceScreenProps) {
  const source = screenSource(slot, sourceIndex)

  return (
    <div className={cn('relative size-full overflow-hidden bg-black', className)}>
      {/*
       * Cover-fit layer. A 16:9 trailer has to fill a 9:19 phone, so the media
       * is sized against the frame with container units and centred — the
       * iframe equivalent of object-fit: cover, which iframes don't support.
       */}
      <div className="absolute inset-0 overflow-hidden" style={{ containerType: 'size' }}>
        {source.video ? (
          <video
            className="absolute inset-0 size-full object-cover"
            src={source.video}
            autoPlay
            muted
            loop
            playsInline
            poster={source.still}
          />
        ) : source.youtubeId ? (
          <iframe
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
            style={{
              /*
               * Cover, then overscan. Most trailers are cinemascope letterboxed
               * inside a 16:9 upload, so the black bars are part of the video —
               * no iframe size removes them. Scaling past cover crops them off.
               */
              width: 'calc(max(100cqw, 100cqh * 16 / 9) * 1.34)',
              height: 'calc(max(100cqh, 100cqw * 9 / 16) * 1.34)',
            }}
            src={youtubeSrc(source.youtubeId)}
            title={source.title ? `${source.title} trailer` : 'Trailer'}
            allow="autoplay; encrypted-media"
            loading="lazy"
            tabIndex={-1}
          />
        ) : source.still ? (
          <img
            src={source.still}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full animate-screen-drift object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(150deg,#151538,#3a0714)]" />
        )}
      </div>

      {/* Blocks the embed from taking clicks, and keeps the mock feeling like a mock */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent,rgb(0_0_0/0.5))]" />
      <div className="grain absolute inset-0 opacity-[0.12] mix-blend-overlay" />

      {/* Room chrome */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-[3.5%]">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-[0.45em] py-[0.2em] backdrop-blur-sm">
          <span className="size-[0.3em] animate-signal-pulse rounded-full bg-signal" />
          <span className="text-[0.5em] font-semibold tracking-wide text-chalk">LIVE</span>
        </span>
        <div className="flex -space-x-[0.2em]">
          {CHATTERS.map((person) => (
            <span
              key={person.name}
              className="size-[1em] rounded-full ring-1 ring-black/60"
              style={{
                backgroundImage: `linear-gradient(150deg, ${person.color}, ${person.color}55)`,
              }}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          'absolute flex flex-col gap-[0.45em]',
          compact
            ? 'inset-x-[3%] bottom-[8%] rounded-[0.6em] bg-black/45 p-[0.5em] backdrop-blur-[2px]'
            : 'bottom-[10%] right-[3%] w-[36%] rounded-[0.5em] bg-black/45 p-[0.6em] backdrop-blur-[2px]',
        )}
      >
        {CHATTERS.slice(0, compact ? 2 : 4).map((person) => (
          <div key={person.name} className="flex items-start gap-[0.35em]">
            <span
              className="mt-[0.15em] size-[0.7em] shrink-0 rounded-full"
              style={{
                backgroundImage: `linear-gradient(150deg, ${person.color}, ${person.color}55)`,
              }}
            />
            <p className="text-[0.5em] leading-snug text-white/85 [text-shadow:0_1px_3px_rgb(0_0_0/0.9)]">
              <span className="font-semibold" style={{ color: person.color }}>
                {person.name}
              </span>{' '}
              {person.line}
            </p>
          </div>
        ))}
      </div>

      {/* Shared playhead */}
      <div className="absolute inset-x-[3.5%] bottom-[4%]">
        <div className="relative h-[0.2em] rounded-full bg-white/25">
          <div className="absolute inset-y-0 left-0 w-[43%] rounded-full bg-signal" />
          <span className="absolute left-[43%] top-1/2 size-[0.45em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal" />
        </div>
      </div>
    </div>
  )
}
