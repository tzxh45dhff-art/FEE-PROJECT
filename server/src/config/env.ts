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

export const env = {
  jwtSecret: required('JWT_SECRET'),
  port: Number(process.env.PORT ?? 4000),
  isProd: process.env.NODE_ENV === 'production',
  /**
   * Optional. Only YouTube *search* needs it — adding by link goes through the
   * public oEmbed endpoint, so the watch feature works without a key at all.
   */
  youtubeApiKey: process.env.YOUTUBE_API_KEY ?? '',
}

/** Name of the httpOnly cookie carrying the session token. */
export const SESSION_COOKIE = 'syncroom_session'
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30
export const SESSION_TTL = '30d'

export const ROOM_TYPES = ['friends', 'couple', 'study', 'family', 'team'] as const
export type RoomType = (typeof ROOM_TYPES)[number]
