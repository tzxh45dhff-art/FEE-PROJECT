import * as azure from './azure.service.js'
import type { PetSnapshot } from '../models/pet.model.js'

/**
 * The pet's own suggestions, in its own words.
 *
 * The screen says what kind of moment it is ("we just got back to the hub",
 * "the film has been paused a while"); the server adds what it knows — the
 * pet, who is in the room — and asks gpt-6-luna for one short line, plus at
 * most one thing to do about it. Written fresh each time so it never sounds
 * like a notification, but held on a short leash: one line per room every few
 * minutes and a daily cap, so a busy room costs pennies, not rupees.
 */

export const SUGGEST_ACTIONS = ['none', 'games', 'watch', 'study', 'call', 'feed', 'play'] as const
export type SuggestAction = (typeof SUGGEST_ACTIONS)[number]

export const MOMENTS = ['arrived', 'back', 'idle', 'gameover', 'paused', 'break'] as const
export type Moment = (typeof MOMENTS)[number]

export const ACTIVITIES = ['hub', 'watch', 'games', 'study', 'music'] as const
export type Activity = (typeof ACTIVITIES)[number]

export type SuggestContext = {
  moment: Moment
  activity: Activity
  /** The viewer's own clock, 0–23, so "it's late" means late for them. */
  hour: number
  onCall: boolean
  /** What the room is watching, if it is. */
  watching: string | null
  /** win / lose, after a game. */
  result: 'win' | 'lose' | null
}

export type Suggestion = { line: string; action: SuggestAction }

/** One line per room this often, whoever asks. */
export const ROOM_GAP_MS = 3 * 60_000
/** And never more than this many a day per room. */
export const DAILY_CAP = 100
const DEADLINE_MS = 6000

const MOMENT_TEXT: Record<Moment, string> = {
  arrived: 'just walked into the room',
  back: 'just came back to the main room from an activity',
  idle: 'has been hanging around the main room without doing anything for a few minutes',
  gameover: 'just finished a party game',
  paused: 'has had the film paused for a while',
  break: 'just started a break after a study focus session',
}

/** Things it would be silly to suggest from where they already are. */
const ALREADY: Partial<Record<Activity, SuggestAction>> = { watch: 'watch', games: 'games', study: 'study' }

type Budget = { last: number; day: string; count: number; recent: string[] }
const budgets = new Map<string, Budget>()

/**
 * Whether this room may have another line now. Claimed up front — two people
 * asking at the same moment must not both be paid for.
 */
export function claim(roomId: string, now: number): boolean {
  const day = new Date(now).toISOString().slice(0, 10)
  const b = budgets.get(roomId) ?? { last: 0, day, count: 0, recent: [] }
  if (b.day !== day) {
    b.day = day
    b.count = 0
  }
  if (now - b.last < ROOM_GAP_MS || b.count >= DAILY_CAP) return false
  b.last = now
  b.count += 1
  budgets.set(roomId, b)
  return true
}

/** For tests: forget every room's budget. */
export function resetBudgets() {
  budgets.clear()
}

export function buildPrompt(pet: PetSnapshot, viewer: { id: string; name: string }, present: string[], context: SuggestContext, recent: string[]) {
  const first = (name: string) => name.split(' ')[0] ?? name
  const others = present.filter((name) => first(name) !== first(viewer.name)).map(first)
  const grudge = pet.grudges.find((g) => g.id === viewer.id)
  const facts = [
    `You are ${pet.name}, a ${pet.stage} ${pet.species} who lives in a shared online hangout room called Huddle, where friends watch films together, play party games, study and call.`,
    `You are talking to ${first(viewer.name)}, who ${MOMENT_TEXT[context.moment]}.`,
    others.length ? `Also in the room right now: ${others.join(', ')}.` : `Nobody else is in the room right now.`,
    `Your state: ${pet.mood}, tummy ${100 - pet.hunger}% full, happiness ${pet.happiness}%.`,
    grudge ? `You are a bit upset with ${first(viewer.name)} — they hit you earlier${grudge.sorry ? ', but they said sorry' : ' and have not said sorry'}.` : '',
    `It is ${context.hour}:00 for them.`,
    context.onCall ? 'They are on a voice call with the room.' : '',
    context.watching ? `The room is watching "${context.watching}".` : '',
    context.result === 'win' ? 'They just won the game.' : context.result === 'lose' ? 'They just lost the game.' : '',
  ].filter(Boolean)

  const actions = SUGGEST_ACTIONS.filter((a) => a !== ALREADY[context.activity] && !(a === 'call' && context.onCall) && !(a === 'call' && !others.length))
  return [
    facts.join(' '),
    '',
    'Say ONE short thing to them, like a cute pet would: under 90 characters, warm, playful, in casual Indian-English (a little Hinglish is fine). Use their first name at most once. No hashtags, no quotes, at most one emoji.',
    'If it fits, nudge them toward one thing to do, from this list only:',
    `${actions.join(', ')} — where games = open the party games, watch = watch something together, study = study together, call = start a voice call with the others, feed = feed you (the pet), play = play fetch with you (the pet, not a game), none = just chat.`,
    'The action must match exactly what your line asks for; if the line is just a feeling or a joke, use none. Only suggest call if others are in the room. Do not nag. Late at night, be cosy, not productive. Vary how you start — not always with their name.',
    recent.length ? `Do not repeat these recent lines: ${recent.map((l) => `"${l}"`).join(' ')}` : '',
    '',
    'Answer as JSON: {"line": "...", "action": "one of the list"}',
  ]
    .filter((part) => part !== '')
    .join('\n')
}

/** What came back, made safe to show and act on. */
export function readSuggestion(raw: unknown, context: SuggestContext): Suggestion | null {
  const value = (raw ?? {}) as { line?: unknown; action?: unknown }
  if (typeof value.line !== 'string') return null
  const line = value.line.replace(/\s+/g, ' ').replace(/^["“]|["”]$/g, '').trim().slice(0, 120)
  if (!line) return null
  let action = (typeof value.action === 'string' ? value.action.trim().toLowerCase() : 'none') as SuggestAction
  if (!SUGGEST_ACTIONS.includes(action) || action === ALREADY[context.activity]) action = 'none'
  if (action === 'call' && context.onCall) action = 'none'
  return { line, action }
}

export async function suggest(
  roomId: string,
  pet: PetSnapshot,
  viewer: { id: string; name: string },
  present: string[],
  context: SuggestContext,
): Promise<Suggestion | null> {
  if (!azure.configured()) return null
  const recent = budgets.get(roomId)?.recent ?? []
  const prompt = buildPrompt(pet, viewer, present, context, recent)
  try {
    const reply = await Promise.race([
      azure.chatJson<unknown>(
        [
          { role: 'system', content: 'You are a small, sweet virtual pet. You speak in one short line. You only answer with JSON.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 1, maxTokens: 120 },
      ),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), DEADLINE_MS)),
    ])
    const suggestion = readSuggestion(reply, context)
    const budget = budgets.get(roomId)
    if (suggestion && budget) budget.recent = [...budget.recent, suggestion.line].slice(-6)
    return suggestion
  } catch {
    return null
  }
}

/** The screen's description of the moment, checked. */
export function readContext(raw: unknown): SuggestContext | null {
  const body = (raw ?? {}) as Record<string, unknown>
  if (!MOMENTS.includes(body.moment as Moment)) return null
  const activity = ACTIVITIES.includes(body.activity as Activity) ? (body.activity as Activity) : 'hub'
  const hour = Number.isInteger(body.hour) && (body.hour as number) >= 0 && (body.hour as number) < 24 ? (body.hour as number) : 12
  const watching = typeof body.watching === 'string' && body.watching.trim() ? body.watching.trim().slice(0, 80) : null
  const result = body.result === 'win' || body.result === 'lose' ? body.result : null
  return { moment: body.moment as Moment, activity, hour, onCall: body.onCall === true, watching, result }
}
