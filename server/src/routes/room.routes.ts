import { Router } from 'express'

import * as roomController from '../controllers/room.controller.js'
import * as watchController from '../controllers/watch.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { videoUpload } from '../services/upload.service.js'

export const roomRoutes = Router()

// Everything below the room API needs a session.
roomRoutes.use(requireAuth)

roomRoutes.get('/', asyncHandler(roomController.list))
roomRoutes.post('/', asyncHandler(roomController.create))
/* Before `/:id`, or Express reads "join" as a room id. */
roomRoutes.get('/discover', asyncHandler(roomController.discover))
roomRoutes.post('/join', asyncHandler(roomController.joinByCode))
roomRoutes.get('/:id', asyncHandler(roomController.show))
roomRoutes.post('/:id/join', asyncHandler(roomController.join))

/* Watch: the queue and its lookups. Playback itself is on the socket. */
roomRoutes.get('/:id/watch', asyncHandler(watchController.capabilities))
roomRoutes.get('/:id/watch/search', asyncHandler(watchController.search))
roomRoutes.post('/:id/watch/resolve', asyncHandler(watchController.resolve))
roomRoutes.post(
  '/:id/watch/upload',
  videoUpload.single('video'),
  asyncHandler(watchController.upload),
)
roomRoutes.get('/:id/watch/queue', asyncHandler(watchController.queue))
roomRoutes.post('/:id/watch/queue', asyncHandler(watchController.add))
roomRoutes.post('/:id/watch/queue/reorder', asyncHandler(watchController.reorder))
roomRoutes.delete('/:id/watch/queue', asyncHandler(watchController.clear))
roomRoutes.delete('/:id/watch/queue/:itemId', asyncHandler(watchController.remove))
