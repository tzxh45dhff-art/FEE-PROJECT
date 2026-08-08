import cookieParser from 'cookie-parser'
import express from 'express'

import { errorHandler, notFound } from './middleware/errorHandler.js'
import { apiRoutes } from './routes/index.js'

/**
 * The Express application, with no server attached — so tests can import this
 * without opening a port. `server.ts` is what actually listens.
 */
export function createApp() {
  const app = express()

  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())

  app.use('/api', apiRoutes)
  app.use('/api', notFound)
  app.use(errorHandler)

  return app
}
