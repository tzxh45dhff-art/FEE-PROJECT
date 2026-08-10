import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/* Prisma reads server/.env on its own; the app has to be told. */
const envPath = path.resolve(import.meta.dirname, '../../.env')
if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath)
  } catch {
    /* Malformed .env — the checks below report what's missing. */
  }
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in server/.env`)
  return value
}

/**
 * Origins allowed to call this API.
 *
 * Comma-separated, because a split deployment normally has at least two: the
 * production frontend and whatever preview URL is being tested against it.
 */
function origins(): string[] {
  const raw = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'
  return raw
    .split(',')
    .map((entry) => entry.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

export const env = {
  jwtSecret: required('JWT_SECRET'),
  port: Number(process.env.PORT ?? 4000),
  isProd: process.env.NODE_ENV === 'production',
  clientOrigins: origins(),
  /**
   * True when the frontend is served from a different origin than this API.
   *
   * Flips the session cookie to `SameSite=None; Secure`, which is the only
   * combination a browser will send cross-site — and which *requires* HTTPS on
   * both ends. Note this is still not sufficient on its own: Safari blocks
   * third-party cookies outright, which is why the bearer token exists.
   */
  crossSite: process.env.CROSS_SITE === 'true',
  /**
   * Optional. Only YouTube *search* needs it — adding by link goes through the
   * public oEmbed endpoint, so the watch feature works without a key at all.
   */
  youtubeApiKey: process.env.YOUTUBE_API_KEY ?? '',

  /**
   * TURN relay, for calls between people on different networks.
   *
   * Optional in the sense that the app runs without it — but calls will only
   * connect when both ends can reach each other directly, which in practice
   * means "on the same wifi". There is no working credential-free public relay
   * any more, so this genuinely needs an account somewhere.
   */
  turn: {
    urls: (process.env.TURN_URL ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
    username: process.env.TURN_USERNAME ?? '',
    credential: process.env.TURN_CREDENTIAL ?? '',
    /* Metered mints short-lived credentials from an API key — preferred, since
       what reaches the browser then expires on its own. */
    meteredApiKey: process.env.METERED_API_KEY ?? '',
    meteredDomain: process.env.METERED_DOMAIN ?? '',
  },
}

/** Name of the httpOnly cookie carrying the session token. */
export const SESSION_COOKIE = 'syncroom_session'
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30
export const SESSION_TTL = '30d'

export const ROOM_TYPES = ['friends', 'couple', 'study', 'family', 'team'] as const
export type RoomType = (typeof ROOM_TYPES)[number]
