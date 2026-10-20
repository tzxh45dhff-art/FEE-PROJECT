/**
 * Lining lyrics up with the recording that is actually playing.
 *
 * A lyric file is timed against one recording — usually the studio release —
 * and a YouTube upload of "the same song" is very often not that recording to
 * the second: an official video opens on a scene, a lyric video on a title
 * card, a re-upload trims or pads the start. The two can be the same length
 * to within a second and still be twenty seconds apart, so length alone can
 * never catch it.
 *
 * The upload's own captions can. They are timed against the upload, and for
 * a song they are the words being sung. Matching lyric lines to caption words
 * gives, for each line, how far the file is from the video; the distance
 * nearly every line agrees on is the correction. Lines that match in the
 * wrong place — a chorus sung four times matches four places — disagree with
 * each other and lose the vote.
 *
 * Pure functions, so they can be tested without YouTube.
 */

export type TimedWord = { t: number; w: string }
type Line = { at: number; text: string }

/** Words as both sides can agree on them: lower case, no accents, no punctuation. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\[[^\]]*\]|\([^)]*\)|♪|♫|&[a-z]+;|&#\d+;/g, ' ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9ऀ-ॿ]+/g, ' ')
    .split(' ')
    .filter(Boolean)
}

function editDistance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = row
  }
  return prev[b.length]!
}

/** Auto-captions mishear; "tripping" for "drinking" is not a match, "tryin" for "trying" is. */
function same(a: string, b: string) {
  if (a === b) return true
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true
  return a.length >= 5 && b.length >= 5 && editDistance(a, b) <= 1
}

/**
 * Caption cues to a stream of words with times. A cue only says when it
 * starts and how long it lasts, so the words inside it are spread across that
 * span — close enough to the sung word for a lyric line to light on time.
 */
export function wordStream(cues: { start: number; duration: number; text: string }[]): TimedWord[] {
  const out: TimedWord[] = []
  cues.forEach((cue, i) => {
    const ws = words(cue.text)
    if (ws.length === 0) return
    const next = cues[i + 1]?.start
    const span = Math.max(0.2, Math.min(cue.duration || 3, next !== undefined ? next - cue.start : cue.duration || 3))
    ws.forEach((w, k) => out.push({ t: cue.start + (span * k) / ws.length, w }))
  })
  return out
}

/**
 * How many seconds to add to every lyric time so the file matches the video,
 * or null when the captions don't say so with confidence.
 */
export function estimateOffset(lines: Line[], stream: TimedWord[]): { offset: number; support: number } | null {
  if (stream.length < 8) return null
  const deltas: { d: number; line: number }[] = []
  let usable = 0

  lines.forEach((line, index) => {
    const L = words(line.text)
    if (L.length < 3) return
    usable++
    const k = Math.min(5, L.length)
    for (let j = 0; j < stream.length; j++) {
      if (!same(stream[j]!.w, L[0]!) && !same(stream[j]!.w, L[1]!)) continue
      /* Walk the first few lyric words through the next few caption words, in order. */
      let matched = 0
      let at = j
      let anchor: number | null = null
      for (let m = 0; m < k && at < stream.length && at < j + k + 3; m++) {
        let found = -1
        for (let q = at; q < Math.min(stream.length, at + 3); q++) {
          if (same(stream[q]!.w, L[m]!)) {
            found = q
            break
          }
        }
        if (found >= 0) {
          matched++
          /* If the first word was misheard, the line started a word earlier. */
          if (anchor === null) anchor = stream[found]!.t - (m > 0 ? 0.35 * m : 0)
          at = found + 1
        }
      }
      if (anchor !== null && matched / k >= 0.6) deltas.push({ d: anchor - line.at, line: index })
    }
  })

  if (usable < 3 || deltas.length < 3) return null

  /* The vote: half-second bins, each counting its neighbours, one vote per line. */
  const bin = (d: number) => Math.round(d * 2)
  const votes = new Map<number, Set<number>>()
  for (const { d, line } of deltas) {
    for (const b of [bin(d) - 1, bin(d), bin(d) + 1]) {
      if (!votes.has(b)) votes.set(b, new Set())
      votes.get(b)!.add(line)
    }
  }
  let peak = 0
  let best = -1
  for (const [b, set] of votes) {
    if (set.size > best || (set.size === best && Math.abs(b) < Math.abs(peak))) {
      peak = b
      best = set.size
    }
  }

  /* Refine on the deltas that agree with the peak, taking each line's closest. */
  const centre = peak / 2
  const perLine = new Map<number, number>()
  for (const { d, line } of deltas) {
    if (Math.abs(d - centre) > 1.2) continue
    const current = perLine.get(line)
    if (current === undefined || Math.abs(d - centre) < Math.abs(current - centre)) perLine.set(line, d)
  }
  const agreeing = [...perLine.values()].sort((a, b) => a - b)
  const support = agreeing.length
  if (support < Math.max(3, Math.ceil(usable * 0.25))) return null

  const median = agreeing[Math.floor(agreeing.length / 2)]!
  return { offset: Math.round(median * 20) / 20, support }
}

/** Shift every line, never before the start of the song. */
export function shiftLines<T extends Line>(lines: T[], offset: number): T[] {
  return lines.map((line) => ({ ...line, at: Math.max(0, Math.round((line.at + offset) * 100) / 100) }))
}
