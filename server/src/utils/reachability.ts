/**
 * Telling "the network hiccuped" apart from "there is no path to this host".
 *
 * Both arrive as a thrown `fetch`, and treating them the same is what makes a
 * misconfigured machine look like a flaky provider. A dropped connection is
 * worth another go a second later. A missing route is not — it will fail
 * identically on every attempt, so retrying only spends the person's time
 * before telling them something that points at the wrong thing.
 *
 * The distinction matters most when it is least obvious. A laptop whose
 * primary network service carries IPv6 but no working IPv4 reaches every
 * dual-stack host normally and fails on every IPv4-only one — which reads as
 * "that one provider is down" until somebody checks the routing table.
 */

/** Errors that mean the host cannot be reached at all, not that a try failed. */
const NO_ROUTE = new Set([
  /* No route to the network the address is on — the case above. */
  'ENETUNREACH',
  /* A route exists but the host itself is unreachable across it. */
  'EHOSTUNREACH',
  /* The name did not resolve. A wrong endpoint, or no DNS at all. */
  'ENOTFOUND',
])

/** The OS error code buried under a failed `fetch`, if there is one. */
function code(cause: unknown): string | null {
  if (!(cause instanceof Error)) return null
  const nested = (cause as { cause?: unknown }).cause
  const found = (nested as { code?: unknown })?.code ?? (cause as { code?: unknown }).code
  return typeof found === 'string' ? found : null
}

export function unreachable(cause: unknown) {
  const found = code(cause)
  return found !== null && NO_ROUTE.has(found)
}

/**
 * What to say about it.
 *
 * Names the host, because the useful next step is checking whether *this
 * machine* can reach *that address* — and says so, rather than leaving the
 * reader to conclude the service is down.
 */
export function unreachableMessage(what: string, target: string) {
  let host = target
  try {
    host = new URL(target).host
  } catch {
    /* Not a URL worth parsing — the caller's string will do. */
  }
  return `Could not reach ${what}: this machine has no route to ${host}. Check the network connection.`
}
