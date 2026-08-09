import cookieParser from 'cookie-parser'
import express from 'express'

import { errorHandler, notFound } from './middleware/errorHandler.js'
import { apiRoutes } from './routes/index.js'
import { UPLOAD_DIR, UPLOAD_ROUTE } from './services/upload.service.js'

/**
 * The Express application, with no server attached — so tests can import this
 * without opening a port. `server.ts` is what actually listens.
 */
export function createApp() {
  const app = express()

  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())

  /*
   * Uploaded room videos.
   *
   * Static serving gives range requests for free, which a `<video>` element
   * needs in order to seek — without them, scrubbing would re-download from
   * the top every time.
   */
  app.use(UPLOAD_ROUTE, express.static(UPLOAD_DIR, { maxAge: '1h' }))

  app.use('/api', apiRoutes)
  app.use('/api', notFound)
  app.use(errorHandler)

  return app
}
