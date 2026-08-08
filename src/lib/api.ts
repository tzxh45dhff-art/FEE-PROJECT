/**
 * Thin wrapper over fetch for the SyncRoom API.
 *
 * Every call sends cookies, because the session is an httpOnly cookie the
 * client can't read — there is no token to attach by hand, which is the point.
 * Requests go to a same-origin `/api` path and Vite proxies them to the server
 * in dev, so there is no CORS and no base URL to configure.
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
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'include',
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
      ...init,
    })
  } catch {
    throw new ApiError(0, 'Can’t reach the server. Is it running?')
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
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }),
}
