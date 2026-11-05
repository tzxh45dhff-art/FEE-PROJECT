import type { NextFunction, Request, Response } from 'express'

/**
 * A ceiling on how often something can be tried.
 *
 * For the doors that guessing gets through: a password, a sign-up, a room
 * code. Counted in memory — one server, and a restart forgiving everyone is
 * fine — in fixed windows per key, with the oldest keys swept out so a flood
 * of different keys can't grow it without end.
 *
 * Friends often share one address (a hostel, a house, a phone's hotspot), so
 * the limits are generous for people and only tight for scripts.
 */
type Rule = {
  /** How many in a window. */
  max: number
  windowMs: number
  /** What is being counted — an address, an address and an email, a person. */
  key: (req: Request) => string | null
  /** Said to someone who hit it. */
  message: string
}

const MAX_KEYS = 20_000

export function rateLimit(rule: Rule) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return (req: Request, res: Response, next: NextFunction) => {
    const key = rule.key(req)
    if (!key) return next()
    const now = Date.now()

    let entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      if (hits.size >= MAX_KEYS) sweep(hits, now)
      entry = { count: 0, resetAt: now + rule.windowMs }
      hits.set(key, entry)
    }
    entry.count += 1

    if (entry.count > rule.max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      res.status(429).json({ error: rule.message })
      return
    }
    next()
  }
}

function sweep(hits: Map<string, { resetAt: number }>, now: number) {
  for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key)
  /* Still full of live keys: drop the oldest quarter rather than refuse to count. */
  if (hits.size >= MAX_KEYS) {
    let drop = Math.floor(MAX_KEYS / 4)
    for (const key of hits.keys()) {
      if (drop-- <= 0) break
      hits.delete(key)
    }
  }
}

/** The caller's address — the real one, since Express trusts the tunnel in front of it. */
export const byAddress = (req: Request) => req.ip ?? req.socket.remoteAddress ?? null

/** The address and the account being tried, so one person's typos don't lock out their flatmates. */
export const byAddressAndEmail = (req: Request) => {
  const address = byAddress(req)
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 200) : ''
  return address ? `${address}|${email}` : null
}

export const byUser = (req: Request) => req.userId ?? null
