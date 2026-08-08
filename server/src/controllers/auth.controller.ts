import type { Request, Response } from 'express'
import { z } from 'zod'

import * as authService from '../services/auth.service.js'
import { signSession } from '../services/token.service.js'
import { HttpError } from '../utils/HttpError.js'
import { clearSessionCookie, setSessionCookie } from '../utils/cookies.js'

const credentials = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const registration = credentials.extend({
  name: z.string().trim().min(1, 'Tell us what to call you').max(40),
})

function parse<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw HttpError.badRequest(result.error.issues[0]?.message ?? 'Invalid details')
  }
  return result.data
}

export async function register(req: Request, res: Response) {
  const input = parse(registration, req.body)
  const user = await authService.register(input)

  setSessionCookie(res, signSession(user.id))
  res.status(201).json({ user })
}

export async function login(req: Request, res: Response) {
  const input = parse(credentials, req.body)
  const user = await authService.login(input)

  setSessionCookie(res, signSession(user.id))
  res.json({ user })
}

export function logout(_req: Request, res: Response) {
  clearSessionCookie(res)
  res.json({ ok: true })
}

export async function me(req: Request, res: Response) {
  try {
    const user = await authService.getUser(req.userId!)
    res.json({ user })
  } catch (error) {
    // The token is valid but the account is gone — drop the stale cookie.
    clearSessionCookie(res)
    throw error
  }
}
