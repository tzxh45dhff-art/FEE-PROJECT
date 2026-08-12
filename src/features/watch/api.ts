import { api } from '@/lib/api'
import { API_BASE, API_HEADERS, getToken } from '@/lib/config'
import { getSocket } from '@/lib/socket'
import type {
  LibraryEntry,
  QueueItem,
  ResolvedSource,
  SearchResult,
} from '@/features/watch/types'

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

/**
 * Send a local file to the server so the whole room can play it.
 *
 * Uses XHR rather than fetch purely for `upload.onprogress` — a video is big
 * enough that a spinner with no percentage feels broken.
 */
export function uploadVideo(
  roomId: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<ResolvedSource> {
  return new Promise((resolve, reject) => {
    const body = new FormData()
    body.append('video', file)

    const request = new XMLHttpRequest()
    request.open('POST', `${API_BASE}/api/rooms/${roomId}/watch/upload`)
    request.withCredentials = true
    /* Same dual-carrier auth as the fetch client — see lib/config. */
    const token = getToken()
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`)
    for (const [key, value] of Object.entries(API_HEADERS)) {
      request.setRequestHeader(key, value)
    }

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }

    request.onload = () => {
      let parsed: unknown = null
      try {
        parsed = JSON.parse(request.responseText)
      } catch {
        /* Falls through to the generic message below. */
      }

      if (request.status >= 200 && request.status < 300) {
        resolve((parsed as { resolved: ResolvedSource }).resolved)
      } else {
        const message =
          parsed && typeof parsed === 'object' && 'error' in parsed
            ? String((parsed as { error: unknown }).error)
            : 'Upload failed'
        reject(new Error(message))
      }
    }

    request.onerror = () => reject(new Error('Upload failed — is the server running?'))
    request.onabort = () => reject(new Error('Upload cancelled'))

    request.send(body)
  })
}

/** Videos already on the server, ready to play without uploading anything. */
export function fetchLibrary(roomId: string) {
  return api
    .get<{ items: LibraryEntry[] }>(`/rooms/${roomId}/watch/library`)
    .then((response) => response.items)
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
