import jwt from 'jsonwebtoken'

import { SESSION_TTL, env } from '../config/env.js'

type TokenPayload = { sub: string }

export function signSession(userId: string) {
  return jwt.sign({ sub: userId } satisfies TokenPayload, env.jwtSecret, {
    expiresIn: SESSION_TTL,
  })
}

/** The user id inside a session token, or null if missing, invalid or expired. */
export function readSession(token: string | undefined): string | null {
  if (!token) return null
  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload
    return payload.sub ?? null
  } catch {
    return null
  }
}
