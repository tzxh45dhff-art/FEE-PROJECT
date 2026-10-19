/**
 * A real server, on a throwaway database, for tests to talk to.
 *
 * Deliberately not an in-process app with mocked sockets. Everything in this
 * server that is worth testing happens between two people — one emits, the
 * other has to see it — and the only honest way to check that is two real
 * socket connections to a real server. Each test file gets its own server on
 * its own port and its own SQLite file, so files can run in parallel and
 * nothing leaks into the developer's dev.db.
 */

import { spawn, execFileSync, type ChildProcess } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

import type { Socket } from 'socket.io-client'

const require = createRequire(import.meta.url)
/* The client library lives in the app's node_modules, one level up. */
const { io } = require('socket.io-client') as typeof import('socket.io-client')

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..')

export type Harness = {
  base: string
  /** The throwaway database this server is using, for tests that check what was written. */
  dbUrl: string
  stop: () => Promise<void>
}

export async function startServer(): Promise<Harness> {
  const dir = mkdtempSync(join(tmpdir(), 'huddle-test-'))
  const port = 4300 + Math.floor(Math.random() * 600)
  const env = {
    ...process.env,
    PORT: String(port),
    DATABASE_URL: `file:${join(dir, 'test.db')}`,
    /* Tests never reach a model. Study features that need one report
       themselves unavailable instead of spending money. */
    AZURE_OPENAI_API_KEY: '',
    AZURE_OPENAI_ENDPOINT: '',
    GEMINI_API_KEY: '',
    NODE_ENV: 'test',
  }

  execFileSync('npx', ['--no-install', 'prisma', 'db', 'push', '--skip-generate'], {
    cwd: SERVER,
    env,
    stdio: 'ignore',
  })

  const child: ChildProcess = spawn('npx', ['--no-install', 'tsx', 'src/server.ts'], {
    cwd: SERVER,
    env,
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  let stderr = ''
  child.stderr?.on('data', (chunk) => (stderr += String(chunk)))

  const base = `http://127.0.0.1:${port}`
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(`${base}/api/health`)).ok) break
    } catch {}
    if (child.exitCode !== null) throw new Error(`server exited:\n${stderr}`)
    await new Promise((r) => setTimeout(r, 150))
  }

  return {
    base,
    dbUrl: env.DATABASE_URL,
    stop: async () => {
      child.kill('SIGTERM')
      await new Promise((r) => setTimeout(r, 100))
    },
  }
}

export type User = { token: string; id: string; name: string }

let counter = 0
export async function makeUser(base: string, name: string): Promise<User> {
  counter += 1
  const res = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `${name.toLowerCase()}-${process.pid}-${counter}-${Date.now()}@example.com`,
      password: 'test-password-123',
      name,
    }),
  })
  const body = (await res.json()) as { token?: string; user?: { id: string; name: string } }
  if (!body.token || !body.user) throw new Error(`register failed: ${JSON.stringify(body)}`)
  return { token: body.token, id: body.user.id, name: body.user.name }
}

export async function api<T = unknown>(
  base: string,
  user: User,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${base}/api${path}`, {
    method: init.method ?? (init.body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${text.slice(0, 200)}`)
  }
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${text.slice(0, 200)}`)
  return data as T
}

/** A room owned by `owner` with every other user joined to it. */
export async function makeRoom(base: string, owner: User, ...others: User[]) {
  const created = await api<{ room: { id: string; slug: string } }>(base, owner, '/rooms', {
    body: { name: 'Test room', type: 'friends' },
  })
  for (const other of others) {
    await api(base, other, '/rooms/join', { body: { code: created.room.slug } })
  }
  return created.room
}

export type Client = Socket & { user: User }

/** Connected, and standing in the room (so it receives the room's events). */
export async function enter(base: string, user: User, roomId: string): Promise<Client> {
  const socket = io(base, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token: user.token },
    forceNew: true,
  }) as Client
  socket.user = user
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', () => resolve())
    socket.once('connect_error', reject)
  })
  await new Promise<void>((resolve) => {
    const onPresence = (update: { roomId: string; present: { userId: string }[] }) => {
      if (update.roomId === roomId && update.present.some((p) => p.userId === user.id)) {
        socket.off('presence:update', onPresence)
        resolve()
      }
    }
    socket.on('presence:update', onPresence)
    socket.emit('room:join', { roomId })
  })
  return socket
}

/** The next `event` on `socket`, or a rejection after `ms`. */
export function next<T = unknown>(socket: Socket, event: string, ms = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler)
      reject(new Error(`no ${event} within ${ms}ms`))
    }, ms)
    const handler = (payload: T) => {
      clearTimeout(timer)
      resolve(payload)
    }
    socket.once(event, handler)
  })
}

/** Resolves true if `event` does NOT arrive within `ms`. */
export function silence(socket: Socket, event: string, ms = 600): Promise<boolean> {
  return next(socket, event, ms).then(
    () => false,
    () => true,
  )
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
