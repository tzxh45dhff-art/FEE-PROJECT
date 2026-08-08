import { Router } from 'express'

import { authRoutes } from './auth.routes.js'
import { roomRoutes } from './room.routes.js'

export const apiRoutes = Router()

apiRoutes.get('/health', (_req, res) => {
  res.json({ ok: true })
})

apiRoutes.use('/auth', authRoutes)
apiRoutes.use('/rooms', roomRoutes)
