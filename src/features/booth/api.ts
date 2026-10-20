import { api } from '@/lib/api'
import { API_BASE, API_HEADERS, getToken } from '@/lib/config'

/** A photo booth picture, as the server lists it. */
export type Photo = {
  id: string
  url: string
  caption: string
  frame: string
  createdAt: string
  createdBy: { id: string; name: string }
}

/** Keep a finished picture with the room. Multipart, so not through the JSON helper. */
export async function savePhoto(roomId: string, image: Blob, caption: string, frame: string): Promise<Photo> {
  const body = new FormData()
  body.append('caption', caption)
  body.append('frame', frame)
  body.append('photo', image, 'photo.jpg')
  const token = getToken()
  const response = await fetch(`${API_BASE}/api/rooms/${roomId}/photos`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...API_HEADERS, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body,
  }).catch(() => null)
  if (!response) throw new Error('Can’t reach the server')
  const data = (await response.json().catch(() => null)) as { item?: Photo; error?: string } | null
  if (!response.ok || !data?.item) throw new Error(data?.error ?? 'Could not save the photo')
  return data.item
}

export const listPhotos = (roomId: string) => api.get<{ items: Photo[] }>(`/rooms/${roomId}/photos`).then((r) => r.items)
export const deletePhoto = (roomId: string, id: string) => api.del(`/rooms/${roomId}/photos/${id}`)
