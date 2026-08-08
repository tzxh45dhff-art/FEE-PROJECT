import type { NextFunction, Request, Response } from 'express'

import { HttpError } from '../utils/HttpError.js'

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Unknown endpoint' })
}

/**
 * Expected failures are thrown as HttpError by the services and become their
 * own status. Anything else is a bug: it gets logged in full server-side and
 * the client only ever sees a generic message.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message })
    return
  }

  console.error('[syncroom]', error)
  res.status(500).json({ error: 'Something went wrong' })
}
