import { createHash, randomInt } from 'node:crypto'

import { prisma } from '../models/prisma.js'
import * as azure from '../services/azure.service.js'
import { CARDS, DECK_LABELS, type Deck, type Kind } from './truthdare.cards.js'

/**
 * Keeping truth or dare new.
 *
 * Two things make a deck feel stale: seeing the card you saw last night, and
 * there only being so many cards. The first is fixed by remembering, per room,
 * which cards recent games used — they sit out until the deck runs dry. The
 * second by having the model write a handful of new cards for each game, in
 * the same voice and under the same rules as the hand-written ones, which are
 * mixed in with them. If the model is slow, unavailable or says something
 * unusable, the game simply starts on the bank — it never waits on it.
 */

export type FreshCard = { id: string; deck: Deck; kind: Kind; text: string; custom: false; fresh: true }

const RECENT_GAMES = 12
const PER_KIND = 6
const DEADLINE_MS = 15000

/** Card ids the room's recent games already used. */
export async function recentlyUsed(roomId: string): Promise<{ ids: string[]; texts: string[] }> {
  const rows = await prisma.gameResult.findMany({
    where: { roomId, game: 'truthdare' },
    orderBy: { createdAt: 'desc' },
    take: RECENT_GAMES,
    select: { summary: true },
  })
  const ids = new Set<string>()
  const texts = new Set<string>()
  for (const row of rows) {
    try {
      const summary = JSON.parse(row.summary) as { used?: unknown; seen?: unknown }
      if (Array.isArray(summary.used)) for (const id of summary.used) if (typeof id === 'string') ids.add(id)
      if (Array.isArray(summary.seen)) for (const t of summary.seen) if (typeof t === 'string') texts.add(t)
    } catch {
      /* An old result without the list: nothing to remember from it. */
    }
  }
  return { ids: [...ids], texts: [...texts].slice(0, 60) }
}

const VOICE: Record<Deck, string> = {
  funny: 'silly, light, laugh-out-loud; embarrassing-but-harmless stories and goofy on-camera dares',
  friends: 'about the friendship itself — memories, opinions of each other, loyalty tests, inside jokes',
  couples: 'for two people who are together — sweet, curious, a little teasing, about each other and the relationship',
  deep: 'honest and reflective — values, fears, regrets, what someone has never said out loud; never cruel',
  spicy: 'flirty and bold for consenting adults — attraction, crushes, tension, cheeky dares; suggestive at most, never explicit or graphic',
}

const ANGLES = [
  'tiny daily rituals', 'unexpected skills', 'childhood logic', 'food opinions', 'travel mishaps',
  'friendship milestones', 'imaginary jobs', 'music memories', 'alternate timelines', 'unpopular harmless opinions',
  'a favourite ordinary moment', 'being a terrible detective', 'a household object with a secret life',
  'an absurd award ceremony', 'comfort versus adventure', 'a promise to your future self',
  'a fictional sporting event', 'an unusually specific compliment', 'a two-line scene with a plot twist',
  'a small thing you changed your mind about', 'the soundtrack of your day', 'a made-up local legend',
]

const idFor = (deck: Deck, kind: Kind, text: string) => `ai:${deck}:${kind}:${createHash('sha1').update(text.toLowerCase()).digest('hex').slice(0, 10)}`

/** New cards for these decks from one request, or none. Never throws. */
async function askFor(decks: Deck[], avoid: string[]): Promise<FreshCard[]> {
  if (!azure.configured() || decks.length === 0) return []
  const wanted = decks.slice(0, 4)
  const angles = [...ANGLES]
  for (let i = angles.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[angles[i], angles[j]] = [angles[j]!, angles[i]!]
  }
  const known = new Set(
    wanted
      .flatMap((d) => [...CARDS[d].truth, ...CARDS[d].dare])
      .concat(avoid)
      .map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()),
  )

  const prompt = [
    `Write new truth-or-dare cards for a game played by friends, couples and groups in India, often on a video call from different places.`,
    `For each deck below write exactly ${PER_KIND} truths and ${PER_KIND} dares.`,
    ...wanted.map((d) => `- ${d} (${DECK_LABELS[d]}): ${VOICE[d]}`),
    `Explore these starting points this time, in the deck's voice: ${angles.slice(0, 4).join('; ')}. Use a different situation for every card.`,
    ``,
    `Rules for every card:`,
    `- One sentence, 8 to 22 words, spoken to the player ("you"). Natural, specific, surprising — not generic filler.`,
    `- Every dare can be done on camera or microphone, alone, right now, with things found at home. Nothing involving people outside the game, posting online, messaging anyone, spending money, or anything risky or hurtful.`,
    `- Nothing hateful, nothing about self-harm, nothing that humiliates someone who is not playing.`,
    `- Do not repeat or lightly reword these recent cards: ${avoid.slice(0, 30).join(' | ') || 'none'}`,
    ``,
    `Answer as JSON: {"cards":[{"deck":"<deck id>","kind":"truth"|"dare","text":"..."}]}`,
  ].join('\n')

  try {
    const reply = await Promise.race([
      azure.chatJson<{ cards?: { deck?: unknown; kind?: unknown; text?: unknown }[] }>(
        [
          { role: 'system', content: 'You write party game cards. You are witty, warm and safe. You only answer with JSON.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 1, maxTokens: 2200 },
      ),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), DEADLINE_MS)),
    ])
    const out: FreshCard[] = []
    for (const raw of reply?.cards ?? []) {
      /* The model sometimes writes the deck's name ("Funny") for its id. */
      const deckName = typeof raw.deck === 'string' ? raw.deck.trim().toLowerCase() : ''
      const deck = wanted.find((d) => d === deckName || DECK_LABELS[d].toLowerCase() === deckName) as Deck
      const kind = (typeof raw.kind === 'string' ? raw.kind.trim().toLowerCase() : '') as Kind
      const text = typeof raw.text === 'string' ? raw.text.replace(/\s+/g, ' ').trim() : ''
      if (!wanted.includes(deck) || (kind !== 'truth' && kind !== 'dare')) continue
      if (text.length < 12 || text.length > 170) continue
      const key = text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      if (known.has(key)) continue
      known.add(key)
      out.push({ id: idFor(deck, kind, text), deck, kind, text, custom: false, fresh: true })
    }
    return out
  } catch {
    return []
  }
}

/**
 * New cards for each deck, asked for in parallel — one request per deck is
 * several times faster than one request for all of them.
 */
export async function freshCards(decks: Deck[], avoid: string[]): Promise<FreshCard[]> {
  const batches = await Promise.all(decks.slice(0, 4).map((deck) => askFor([deck], avoid)))
  return batches.flat()
}

/*
 * Cards written for a room but not yet played, kept for its next game so that
 * one can start on new cards immediately instead of waiting for the model.
 * In memory: losing them on a restart costs nothing but one game's novelty.
 */
const spares = new Map<string, FreshCard[]>()

/** New cards already written for this room and these decks, minus any it has used. */
export function takeSpares(roomId: string, decks: Deck[], used: string[]): FreshCard[] {
  const all = spares.get(roomId) ?? []
  const fits = all.filter((c) => decks.includes(c.deck) && !used.includes(c.id))
  spares.set(
    roomId,
    all.filter((c) => !fits.includes(c)),
  )
  return fits
}

export function keepSpares(roomId: string, cards: FreshCard[]) {
  if (spares.size > 500) spares.delete(spares.keys().next().value!)
  const known = new Set((spares.get(roomId) ?? []).map((c) => c.id))
  spares.set(roomId, [...(spares.get(roomId) ?? []), ...cards.filter((c) => !known.has(c.id))].slice(-120))
}
