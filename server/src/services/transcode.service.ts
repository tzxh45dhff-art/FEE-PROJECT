import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

/**
 * Turning a film into something that starts playing immediately.
 *
 * A plain MP4 is one enormous file with a single index at one end of it. The
 * browser cannot show a frame until it has read that index, and on a long film
 * the index alone runs to tens of megabytes — so "press play" means "download
 * 21MB first, then we'll talk". HLS inverts that: a playlist of a couple of
 * kilobytes names a few hundred short segments, and the player fetches the
 * first one and starts.
 *
 * Deliberately a remux, not a re-encode. The source is already H.264 and AAC,
 * which is exactly what HLS wants, so the streams are copied through untouched:
 * a two-hour film is minutes of I/O rather than hours of CPU, and the picture
 * is bit-for-bit what was uploaded. The cost is that there is one quality
 * rather than a ladder — worth paying, because re-encoding to get that ladder
 * is the difference between this being usable today and being a weekend.
 */

/** Six seconds is the HLS convention: quick to start, few enough requests. */
const SEGMENT_SECONDS = 6

export type AudioTrack = { index: number; language: string; label: string }

export type ProbeResult = {
  durationSeconds: number
  width: number | null
  height: number | null
  videoCodec: string | null
  audio: AudioTrack[]
}

/* ISO 639-2 for the languages that actually turn up on a film print. Anything
   unlisted keeps its raw tag, which is still more use than "Track 3". */
const LANGUAGE_NAMES: Record<string, string> = {
  eng: 'English',
  hin: 'Hindi',
  tam: 'Tamil',
  tel: 'Telugu',
  mal: 'Malayalam',
  kan: 'Kannada',
  ben: 'Bengali',
  mar: 'Marathi',
  pan: 'Punjabi',
  guj: 'Gujarati',
  urd: 'Urdu',
  jpn: 'Japanese',
  kor: 'Korean',
  spa: 'Spanish',
  fra: 'French',
  deu: 'German',
  ita: 'Italian',
  por: 'Portuguese',
  rus: 'Russian',
  zho: 'Chinese',
  ara: 'Arabic',
}

function run(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args)
    let out = ''
    let err = ''

    child.stdout.on('data', (chunk) => (out += chunk))
    child.stderr.on('data', (chunk) => (err += chunk))
    child.on('error', (cause) =>
      reject(
        new Error(
          `${command} could not be started — is it installed and on PATH? (${cause.message})`,
        ),
      ),
    )
    child.on('close', (code) =>
      code === 0 ? resolve(out) : reject(new Error(`${command} exited ${code}: ${err.slice(-800)}`)),
    )
  })
}

/** What the file actually contains, so the HLS layout can match it. */
export async function probe(input: string): Promise<ProbeResult> {
  const raw = await run('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration:stream=index,codec_type,codec_name,width,height:stream_tags=language',
    '-of',
    'json',
    input,
  ])

  const parsed = JSON.parse(raw) as {
    format?: { duration?: string }
    streams?: {
      index: number
      codec_type: string
      codec_name?: string
      width?: number
      height?: number
      tags?: { language?: string }
    }[]
  }

  const streams = parsed.streams ?? []
  const video = streams.find((stream) => stream.codec_type === 'video')

  /*
   * Audio is numbered by its position among audio streams, not by its index in
   * the file. ffmpeg's `-map 0:a:N` counts the former, and the two only agree
   * when the video happens to come first with nothing interleaved.
   */
  const audio = streams
    .filter((stream) => stream.codec_type === 'audio')
    .map((stream, position) => {
      const language = stream.tags?.language ?? 'und'
      return {
        index: position,
        language,
        label: LANGUAGE_NAMES[language] ?? (language === 'und' ? `Track ${position + 1}` : language),
      } satisfies AudioTrack
    })

  return {
    durationSeconds: Number(parsed.format?.duration ?? 0),
    width: video?.width ?? null,
    height: video?.height ?? null,
    videoCodec: video?.codec_name ?? null,
    audio,
  }
}

/**
 * Codecs a browser can play once they are inside an HLS segment.
 *
 * The remux only works because the source already holds these. Anything else
 * — HEVC, AC-3, DTS, which ordinary film rips are full of — has to be encoded,
 * and the caller is told rather than left with segments no one can play.
 */
const COPYABLE_VIDEO = new Set(['h264'])

export function canRemux(probed: ProbeResult) {
  return probed.videoCodec !== null && COPYABLE_VIDEO.has(probed.videoCodec)
}

/**
 * Write an HLS ladder for `input` into `outDir`.
 *
 * Produces one video rendition and every audio track the source carries, as a
 * master playlist plus a directory of fragmented-MP4 segments. Audio is a
 * separate group rather than being muxed into the video, which is what lets a
 * viewer switch from English to Hindi without re-fetching the picture.
 */
export async function toHls(
  input: string,
  outDir: string,
  onProgress?: (fraction: number) => void,
) {
  const probed = await probe(input)

  if (!canRemux(probed)) {
    throw new Error(
      `This file is ${probed.videoCodec ?? 'an unknown codec'}, which can't be repackaged without re-encoding. Convert it to H.264 first.`,
    )
  }
  if (probed.audio.length === 0) throw new Error('That file has no audio track')

  /*
   * Each variant's directory name.
   *
   * `name:` is what ffmpeg substitutes for `%v`, so it becomes a path segment
   * and ends up in the master playlist as a URL. It must therefore be free of
   * spaces — `var_stream_map` is a space-delimited string, so a track labelled
   * "Track 1" silently splits the map into nonsense — and free of anything
   * that would need escaping in a URL. The position is enough to be unique;
   * the human-readable name is carried by `language`, which is the attribute
   * players actually build their audio menu from.
   */
  const audioDir = (position: number) => `a${position}`

  /*
   * ffmpeg writes into these directories but will not create them, and the
   * failure when they are missing is a bare "No such file or directory" from
   * deep inside the muxer.
   */
  /* The segment template is `v%v`, so the directory is a literal "v" followed
     by the variant name — `v0` for the picture, `va0`, `va1`… for the audio. */
  await Promise.all([
    mkdir(path.join(outDir, 'v0'), { recursive: true }),
    ...probed.audio.map((_, position) =>
      mkdir(path.join(outDir, `v${audioDir(position)}`), { recursive: true }),
    ),
  ])

  /* Video is variant 0; each audio track follows, all pointing at one group so
     the player treats them as alternatives to each other. */
  const streamMap = [
    'v:0,agroup:aud',
    ...probed.audio.map(
      (track, position) =>
        `a:${track.index},agroup:aud,language:${track.language},name:${audioDir(position)}` +
        (position === 0 ? ',default:yes' : ''),
    ),
  ].join(' ')

  const args = [
    '-hide_banner',
    '-nostdin',
    '-i',
    input,
    '-map',
    '0:v:0',
    ...probed.audio.flatMap((track) => ['-map', `0:a:${track.index}`]),
    /* The whole point: copy the streams, encode nothing. */
    '-c',
    'copy',
    '-f',
    'hls',
    '-hls_time',
    String(SEGMENT_SECONDS),
    '-hls_playlist_type',
    'vod',
    '-hls_segment_type',
    'fmp4',
    /* Every segment decodable on its own, so a player joining mid-film — or
       seeking — never has to walk back to the start. */
    '-hls_flags',
    'independent_segments',
    '-hls_fmp4_init_filename',
    'init.mp4',
    '-master_pl_name',
    'master.m3u8',
    '-var_stream_map',
    streamMap,
    '-hls_segment_filename',
    path.join(outDir, 'v%v', 'seg_%05d.m4s'),
    '-progress',
    'pipe:1',
    path.join(outDir, 'v%v', 'index.m3u8'),
  ]

  await new Promise<void>((resolve, reject) => {
    const child = spawn('ffmpeg', args)
    let tail = ''

    /* `-progress` reports microseconds against a duration we already know. */
    child.stdout.on('data', (chunk: Buffer) => {
      const match = /out_time_ms=(\d+)/.exec(chunk.toString())
      if (match && probed.durationSeconds > 0 && onProgress) {
        const seconds = Number(match[1]) / 1_000_000
        onProgress(Math.min(1, seconds / probed.durationSeconds))
      }
    })

    child.stderr.on('data', (chunk: Buffer) => {
      tail = `${tail}${chunk}`.slice(-2000)
    })

    child.on('error', (cause) =>
      reject(new Error(`ffmpeg could not be started — is it installed? (${cause.message})`)),
    )
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${tail.slice(-800)}`)),
    )
  })

  return { masterPlaylist: path.join(outDir, 'master.m3u8'), probed }
}
