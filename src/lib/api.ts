import { API_BASE, API_HEADERS, getToken } from '@/lib/config'

/**
 * Thin wrapper over fetch for the SyncRoom API.
 *
 * Same-origin, the session is an httpOnly cookie and there is nothing to attach
 * by hand — Vite proxies `/api` to the server, so no CORS and no base URL.
 *
 * Cross-origin (a deployed frontend talking to a tunnelled API) that cookie is
 * third-party and may never be sent, so the bearer token is added as well.
 * Both are always offered; the server takes whichever it gets.
 */

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...API_HEADERS }
  if (init?.body) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      credentials: 'include',
      ...init,
      headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
    })
  } catch {
    throw new ApiError(
      0,
      API_BASE
        ? 'Can’t reach the server. Is the backend running and the tunnel up?'
        : 'Can’t reach the server. Is it running?',
    )
  }

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : 'Something went wrong'
    throw new ApiError(response.status, message)
  }

  return body as T
}

export const api = {
  /* The signal is for reads that a fast-changing UI can outrun — lyrics for a
     track that has already been skipped past, and the like. */
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
