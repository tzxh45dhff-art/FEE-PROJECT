import type { Response } from 'express'

import { SESSION_COOKIE, SESSION_MAX_AGE_MS, env } from '../config/env.js'

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true, // unreadable from JS, so XSS can't lift the session
    sameSite: 'lax', // survives normal navigation, blocks cross-site POSTs
    secure: env.isProd,
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  })
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
}
