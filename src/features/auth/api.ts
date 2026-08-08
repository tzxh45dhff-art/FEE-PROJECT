import { api } from '@/lib/api'

export type User = {
  id: string
  email: string
  name: string
  createdAt: string
}

type UserResponse = { user: User }

export function register(input: { name: string; email: string; password: string }) {
  return api.post<UserResponse>('/auth/register', input).then((r) => r.user)
}

export function login(input: { email: string; password: string }) {
  return api.post<UserResponse>('/auth/login', input).then((r) => r.user)
}

export function logout() {
  return api.post<{ ok: true }>('/auth/logout')
}

export function fetchMe() {
  return api.get<UserResponse>('/auth/me').then((r) => r.user)
}
