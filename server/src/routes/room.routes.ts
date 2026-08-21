import { Router } from 'express'

import * as musicController from '../controllers/music.controller.js'
import * as roomController from '../controllers/room.controller.js'
import * as watchController from '../controllers/watch.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { receiveAudio, receiveVideo } from '../services/upload.service.js'

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
roomRoutes.post('/:id/watch/upload', receiveVideo, asyncHandler(watchController.upload))
roomRoutes.get('/:id/watch/library', asyncHandler(watchController.library))
/* Encoded, because a film's name is arbitrary — spaces, brackets, dots. */
roomRoutes.delete('/:id/watch/library/:file', asyncHandler(watchController.removeFromLibrary))
roomRoutes.get('/:id/watch/queue', asyncHandler(watchController.queue))
roomRoutes.post('/:id/watch/queue', asyncHandler(watchController.add))
roomRoutes.post('/:id/watch/queue/reorder', asyncHandler(watchController.reorder))
roomRoutes.delete('/:id/watch/queue', asyncHandler(watchController.clear))
roomRoutes.delete('/:id/watch/queue/:itemId', asyncHandler(watchController.remove))

/* Music: the listening queue and its lookups. Playback is on the socket. */
roomRoutes.get('/:id/music', asyncHandler(musicController.capabilities))
roomRoutes.get('/:id/music/search', asyncHandler(musicController.search))
roomRoutes.post('/:id/music/resolve', asyncHandler(musicController.resolve))
roomRoutes.post('/:id/music/upload', receiveAudio, asyncHandler(musicController.upload))
roomRoutes.get('/:id/music/library', asyncHandler(musicController.library))
roomRoutes.get('/:id/music/lyrics', asyncHandler(musicController.lyrics))
roomRoutes.get('/:id/music/queue', asyncHandler(musicController.queue))
roomRoutes.post('/:id/music/queue', asyncHandler(musicController.add))
roomRoutes.post('/:id/music/queue/reorder', asyncHandler(musicController.reorder))
roomRoutes.delete('/:id/music/queue', asyncHandler(musicController.clear))
roomRoutes.delete('/:id/music/queue/:trackId', asyncHandler(musicController.remove))

/* The kept library: playlists, saved songs, and what to play next. */
roomRoutes.get('/:id/music/playlists', asyncHandler(musicController.playlists))
roomRoutes.post('/:id/music/playlists', asyncHandler(musicController.createPlaylist))
roomRoutes.delete('/:id/music/playlists/:playlistId', asyncHandler(musicController.deletePlaylist))
roomRoutes.post('/:id/music/playlists/:playlistId/tracks', asyncHandler(musicController.addToPlaylist))
roomRoutes.delete(
  '/:id/music/playlists/:playlistId/tracks/:trackId',
  asyncHandler(musicController.removeFromPlaylist),
)
roomRoutes.get('/:id/music/liked', asyncHandler(musicController.liked))
roomRoutes.post('/:id/music/liked', asyncHandler(musicController.toggleLiked))
roomRoutes.get('/:id/music/suggestions', asyncHandler(musicController.suggestions))
