import { api } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import type { QueueItem, ResolvedSource, SearchResult } from '@/features/watch/types'

/**
 * Tell the room the queue moved.
 *
 * Queue mutations are REST — they are durable state with an obvious HTTP shape
 * — but the *other* people in the room only ever learn about them over the
 * socket. Without this ping the person who added something is the only one who
 * can see it.
 */
function announce(roomId: string) {
  getSocket().emit('watch:queue-sync', { roomId })
}

/** Whether this deployment can search, and which sources it accepts. */
export function fetchCapabilities(roomId: string) {
  return api.get<{ search: boolean; sources: string[] }>(`/rooms/${roomId}/watch`)
}

export function searchVideos(roomId: string, query: string) {
  return api
    .get<{ results: SearchResult[] }>(
      `/rooms/${roomId}/watch/search?q=${encodeURIComponent(query)}`,
    )
    .then((response) => response.results)
}

/** Turn a pasted link, id, or plain title into something queueable. */
export function resolveInput(roomId: string, input: string) {
  return api
    .post<{ resolved: ResolvedSource }>(`/rooms/${roomId}/watch/resolve`, { input })
    .then((response) => response.resolved)
}

export function fetchQueue(roomId: string) {
  return api.get<{ items: QueueItem[] }>(`/rooms/${roomId}/watch/queue`).then((r) => r.items)
}

export function addToQueue(roomId: string, item: Omit<ResolvedSource, 'note'>) {
  return api
    .post<{ item: QueueItem; items: QueueItem[] }>(`/rooms/${roomId}/watch/queue`, item)
    .then((response) => {
      announce(roomId)
      return response.items
    })
}

export function reorderQueue(roomId: string, ids: string[]) {
  return api
    .post<{ items: QueueItem[] }>(`/rooms/${roomId}/watch/queue/reorder`, { ids })
    .then((response) => {
      announce(roomId)
      return response.items
    })
}

export function removeFromQueue(roomId: string, itemId: string) {
  return api
    .del<{ items: QueueItem[] }>(`/rooms/${roomId}/watch/queue/${itemId}`)
    .then((response) => {
      announce(roomId)
      return response.items
    })
}

export function clearQueue(roomId: string) {
  return api.del<{ items: QueueItem[] }>(`/rooms/${roomId}/watch/queue`).then((response) => {
    announce(roomId)
    return response.items
  })
}
