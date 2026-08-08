import type { NextFunction, Request, Response } from 'express'

import { SESSION_COOKIE } from '../config/env.js'
import { readSession } from '../services/token.service.js'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

/** Rejects the request unless it carries a valid session cookie. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = readSession(req.cookies?.[SESSION_COOKIE])
  if (!userId) {
    res.status(401).json({ error: 'Not signed in' })
    return
  }

  req.userId = userId
  next()
}
