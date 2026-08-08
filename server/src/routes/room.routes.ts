import { Router } from 'express'

import * as roomController from '../controllers/room.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const roomRoutes = Router()

// Everything below the room API needs a session.
roomRoutes.use(requireAuth)

roomRoutes.get('/', asyncHandler(roomController.list))
roomRoutes.post('/', asyncHandler(roomController.create))
/* Before `/:id`, or Express reads "join" as a room id. */
roomRoutes.post('/join', asyncHandler(roomController.joinByCode))
roomRoutes.get('/:id', asyncHandler(roomController.show))
roomRoutes.post('/:id/join', asyncHandler(roomController.join))
