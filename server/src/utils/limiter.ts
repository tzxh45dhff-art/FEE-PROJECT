/**
 * A token bucket: `burst` moves at once, refilling smoothly over `windowMs`.
 *
 * For a socket that should keep up with a person and not with a script — a
 * quick run of messages or moves goes through, a flood does not.
 */
export function tokenBucket(burst: number, windowMs: number) {
  let tokens = burst
  let refilled = Date.now()
  return () => {
    const now = Date.now()
    tokens = Math.min(burst, tokens + ((now - refilled) / windowMs) * burst)
    refilled = now
    if (tokens < 1) return false
    tokens -= 1
    return true
  }
}
