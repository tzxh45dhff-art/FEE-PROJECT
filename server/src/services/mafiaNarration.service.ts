import { createHash } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import { env } from '../config/env.js'
import * as azure from './azure.service.js'
import * as speech from './speech.service.js'
import { UPLOAD_DIR, UPLOAD_ROUTE } from './upload.service.js'
import { first } from '../games/mafia.roles.js'

/**
 * The narrator of Mafia: Bombay, 1956.
 *
 * Fixed moments (the opening, nightfall, the vote) are written by hand and
 * voiced once — the audio is cached by its words, so they cost nothing after
 * the first game. The moments that depend on what happened (who died, who
 * hanged, who won) are written fresh by the model from the facts, in the
 * voice of a 1950s film narrator, and voiced on the spot.
 *
 * Nothing here can hold the game up: the model gets a few seconds, the voice
 * a few more, and the hand-written line the game already has is used if
 * either is late. The story never reveals more than the table already knows.
 */

export type NarrationKind = 'intro' | 'nightfall' | 'dawn' | 'vote' | 'defence' | 'judgement' | 'verdict' | 'acquitted' | 'spared' | 'epilogue'

export type NarrationFacts = {
  round?: number
  victim?: string | null
  /** Only when the table is allowed to know it. */
  victimRole?: string | null
  saved?: boolean
  alive?: number
  votes?: number
  jester?: boolean
  wasFamily?: boolean
  winner?: 'town' | 'family' | 'jester' | null
  familyNames?: string[]
  survivors?: string[]
}

/** A deep, unhurried film-noir storyteller. */
export const NARRATOR_VOICE = 'en-US-AndrewMultilingualNeural'
const DELIVERY: speech.Delivery = { rate: '-12%', pitch: '-6%', pause: 480 }

const WRITE_MS = 4_000
const VOICE_MS = 7_000
const FOLDER = path.join(UPLOAD_DIR, 'narration')

/* Routine beats are hand-written and cached; only the moments that change the story are written fresh. */
const STATIC: NarrationKind[] = ['intro', 'nightfall', 'vote', 'defence', 'judgement', 'acquitted', 'spared']

function within<T>(ms: number, work: Promise<T>): Promise<T | null> {
  return Promise.race([work, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]).catch(() => null)
}

/**
 * ElevenLabs, when there is a key: a storyteller rather than a newsreader.
 * Slightly slowed, a touch of style, stable enough not to wander between lines.
 */
async function elevenLabs(text: string): Promise<Buffer> {
  const { key, voice, model } = env.elevenlabs
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 0.92 },
    }),
    signal: AbortSignal.timeout(VOICE_MS),
  })
  /* Out of credits, a bad key, a moved voice: say so in the log, and let Azure read it instead. */
  if (!response.ok) throw new Error(`ElevenLabs answered ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

async function azure_(text: string): Promise<Buffer | null> {
  if (!speech.configured()) return null
  return within(VOICE_MS, speech.speak(text, NARRATOR_VOICE, DELIVERY))
}

/** The same words in the same voice are the same file: voiced once, served forever. */
async function voice(text: string): Promise<string | null> {
  const eleven = !!env.elevenlabs.key
  const signature = eleven ? `eleven|${env.elevenlabs.voice}|${env.elevenlabs.model}` : `azure|${NARRATOR_VOICE}|${DELIVERY.rate}|${DELIVERY.pitch}`
  const hash = createHash('sha1').update(`${signature}|${text}`).digest('hex')
  const file = path.join(FOLDER, `${hash}.mp3`)
  const url = `${UPLOAD_ROUTE}/narration/${hash}.mp3`
  if (existsSync(file)) return url
  let audio: Buffer | null = null
  if (eleven) {
    audio = await within(
      VOICE_MS,
      elevenLabs(text).catch((cause: unknown) => {
        console.warn(`[mafia] ${cause instanceof Error ? cause.message : 'ElevenLabs failed'}; using Azure speech`)
        return null
      }),
    )
  }
  /* The fallback is a different voice, so it gets its own file. */
  if (!audio) return azureVoice(text)
  if (!existsSync(FOLDER)) mkdirSync(FOLDER, { recursive: true })
  await writeFile(file, audio)
  return url
}

async function azureVoice(text: string): Promise<string | null> {
  const hash = createHash('sha1').update(`azure|${NARRATOR_VOICE}|${DELIVERY.rate}|${DELIVERY.pitch}|${text}`).digest('hex')
  const file = path.join(FOLDER, `${hash}.mp3`)
  const url = `${UPLOAD_ROUTE}/narration/${hash}.mp3`
  if (existsSync(file)) return url
  const audio = await azure_(text)
  if (!audio) return null
  if (!existsSync(FOLDER)) mkdirSync(FOLDER, { recursive: true })
  await writeFile(file, audio)
  return url
}

export function brief(kind: NarrationKind, facts: NarrationFacts): string {
  const f = facts
  switch (kind) {
    case 'dawn':
      return f.victim
        ? `Morning after night ${f.round}. ${first(f.victim)} was murdered by the Family overnight${f.victimRole ? ` — they were ${f.victimRole}` : ' (do not say who or what they were beyond their name)'}. ${f.alive} people are still alive.`
        : f.saved
          ? `Morning after night ${f.round}. The Family tried to kill someone, but that person was saved in the nick of time. Do NOT say who was targeted or who saved them, or that a doctor exists. ${f.alive} still alive.`
          : `Morning after night ${f.round}. Nobody died; the night was eerily quiet. ${f.alive} still alive.`
    case 'verdict':
      return f.jester
        ? `The town voted to hang ${first(f.victim ?? 'someone')} with ${f.votes} guilty votes — and it turns out they were the Jester, who wanted exactly this. They win.`
        : `The town voted to hang ${first(f.victim ?? 'someone')} with ${f.votes} guilty votes after hearing their defence.${f.victimRole ? ` They were ${f.victimRole}${f.wasFamily ? ' — the town got one of the Family' : ' — an innocent'}.` : ' Their true allegiance stays secret — do not hint at it.'}`
    case 'spared':
      return 'The vote failed: the town could not agree on anyone to hang today.'
    case 'epilogue':
      return f.winner === 'town'
        ? `The game is over. The town wins — every member of the Family (${(f.familyNames ?? []).map(first).join(', ')}) is gone. Survivors: ${(f.survivors ?? []).map(first).join(', ')}.`
        : f.winner === 'family'
          ? `The game is over. The Family (${(f.familyNames ?? []).map(first).join(', ')}) has taken the city; the town can no longer outvote them.`
          : f.winner === 'jester'
            ? 'The game is over. The Jester won by getting themselves hanged.'
            : 'The game was abandoned before the case was solved.'
    default:
      return ''
  }
}

const SYSTEM = `You narrate a party game of Mafia set in Bombay, 1956 — film noir, monsoon rain, jazz clubs in Colaba, the docks, Crawford Market, Marine Drive, Irani cafés, Malabar Hill. You are a deep-voiced 1950s film narrator: cinematic, wry, a little menacing, never gory. You only answer with JSON.`

/** Words for a moment, and the voice reading them. Falls back to the hand-written line at every step. */
export async function narrate(
  kind: NarrationKind,
  facts: NarrationFacts,
  fallback: string,
  headline: string | null,
): Promise<{ text: string; headline: string | null; audio: string | null }> {
  let text = fallback
  let head = headline
  if (!STATIC.includes(kind) && azure.configured()) {
    const written = await within(
      WRITE_MS,
      azure.chatJson<{ story?: unknown; headline?: unknown }>(
        [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: `${brief(kind, facts)}

Write what the narrator says aloud: 2 or 3 sentences, under 260 characters. The first sentence states plainly what happened (who died, or that nobody did; who was hanged) — the colour comes after, spoken English, no lists, no emojis, no stage directions. Use people's first names only. Never reveal anything not stated above.${kind === 'dawn' ? ' Also write a 1950s newspaper front-page headline for the Bombay Herald that names the main fact: ALL CAPS, under 42 characters.' : ''}
Answer as JSON: {"story": "..."${kind === 'dawn' ? ', "headline": "..."' : ''}}`,
          },
        ],
        { temperature: 1, maxTokens: 220 },
      ),
    )
    const story = typeof written?.story === 'string' ? written.story.replace(/\s+/g, ' ').trim() : ''
    if (story && story.length <= 360) text = story
    const line = typeof written?.headline === 'string' ? written.headline.replace(/\s+/g, ' ').trim().toUpperCase() : ''
    if (kind === 'dawn' && line && line.length <= 48) head = line
  }
  const audio = await voice(text)
  return { text, headline: head, audio }
}
