import { createHash, randomInt } from 'node:crypto'

import { prisma } from '../models/prisma.js'
import * as azure from '../services/azure.service.js'
import { cardTextKey, CARDS, DECKS, DECK_LABELS, type Deck, type Kind } from './truthdare.cards.js'

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

type Editorial = { voice: string; topics: string[] }
const EDITORIAL: Record<Deck, Editorial> = {
  funny: {
    voice: 'Messy, blunt, self-aware group-chat humour. Petty confessions, cringe flirting, vanity, gross-but-ordinary habits and bad decisions. The player should laugh because they recognise themselves. Occasional mild swearing fits; do not make swearing the whole joke.',
    topics: ['trying too hard to look cool', 'petty grudges', 'fake confidence', 'flirting that went badly', 'gross everyday shortcuts', 'being caught bluffing', 'online image versus reality', 'dramatic overreactions', 'excuses nobody believes', 'childhood lies that got out of hand', 'unearned confidence', 'money spent on a delusion'],
  },
  friends: {
    voice: 'Close friends with history, not strangers at an icebreaker. Friendly call-outs, specific impressions, jealousy, loyalty, inside jokes and the affectionate truth behind the roast. Mix exposing moments with actual warmth. Nobody ranks bodies, exposes private messages or attacks an identity.',
    topics: ['the friend who cannot take their own jokes', 'who really keeps the group together', 'feeling left out but acting busy', 'a first impression that was wrong', 'unspoken competition', 'dodgy advice', 'the group trying to organise anything', 'an apology hidden behind a joke', 'being taken for granted', 'a compliment nobody says seriously', 'the friend who sees through excuses', 'who knows the real you'],
  },
  couples: {
    voice: 'Two people who are into each other, with chemistry and shared history. Make it intimate, teasing and specific: wanting attention, pride, reassurance, jealousy and moments of feeling wanted. Mix attraction and laughter with a little vulnerability. Do not turn the deck into a relationship assessment or make every card about conflict.',
    topics: ['wanting attention while pretending otherwise', 'small details that are unexpectedly attractive', 'playing it cool at the beginning', 'what affection you wish they initiated', 'a compliment you still replay', 'pride getting in the way', 'jealousy you tried to hide', 'the moment chemistry became obvious', 'things you miss from early dates', 'what you say as a joke but mean', 'a tiny gesture that made you feel wanted', 'a very specific romantic weakness'],
  },
  deep: {
    voice: 'Personal, uncomfortable-in-a-useful-way honesty. Ego, envy, approval, belonging, avoidance and the gap between the person you perform and the person you are. Use plain language and a specific hook. No therapy jargon, diagnosis, motivational affirmations or pressure to disclose trauma. Include questions about pride, trust and being understood, not only pain.',
    topics: ['whose approval still matters', 'performing independence', 'envy disguised as criticism', 'being useful versus being loved', 'an excuse hiding the real reason', 'a dream you stopped admitting', 'family expectations', 'being funny instead of honest', 'an apology you have rehearsed', 'being seen without being impressive', 'the support you do not ask for', 'a part of yourself you underestimate'],
  },
  spicy: {
    voice: 'Adults only; the room has confirmed 18+. Bold, cheeky, direct, sometimes a little crude, with real attraction and sexual confidence rather than cute fictional romance. Turn-ons, crushes, kissing, desire, mixed signals, flirty voice notes and romantic ego are fair game. Keep it non-graphic: no descriptions of sex acts, nudity or sexual performances. Tension comes from admitting something real and taking a social risk.',
    topics: ['a turn-on you normally keep to yourself', 'pretending a kiss meant nothing', 'being horny and making an embarrassing decision', 'enjoying the attention more than the person', 'chemistry overriding your usual type', 'being caught looking', 'the risky message you never sent', 'a confident invitation you wish you received', 'flirting versus being desperate', 'a dating experience you exaggerated', 'wanting to kiss someone but playing it cool', 'the compliment that ruins your composure'],
  },
}

export function cardPrompt(deck: Deck, avoid: string[], random: (max: number) => number = randomInt): string {
  const brief = EDITORIAL[deck]
  const topics = [...brief.topics]
  for (let i = topics.length - 1; i > 0; i--) {
    const j = random(i + 1)
    ;[topics[i], topics[j]] = [topics[j]!, topics[i]!]
  }
  return [
    'Write truth-or-dare cards for a room of friends, couples or a group in India, often on a video call.',
    'Write exactly ' + PER_KIND + ' truths and ' + PER_KIND + ' dares for ' + deck + ' (' + DECK_LABELS[deck] + ').',
    'DECK VOICE: ' + brief.voice,
    'Explore these angles this time: ' + topics.slice(0, 4).join('; ') + '. Give each card a different situation.',
    'Style examples only; do not copy or lightly reword their situations:',
    'Truth: ' + CARDS[deck].truth[0],
    'Truth: ' + CARDS[deck].truth[12],
    'Dare: ' + CARDS[deck].dare[0],
    'Dare: ' + CARDS[deck].dare[8],
    'Rules:',
    '- A card should make someone laugh, hesitate, admit something specific, or feel properly noticed. Write as someone at this table would speak.',
    '- One clear ask, usually 8–28 words and never more than 170 characters. A real moment, actual wording, a contradiction or a room dynamic makes a better hook than a vague preference.',
    '- Truths ask something personal. Dares ask for a performance or a small social risk the player can complete on camera or microphone now, usually in 20–45 seconds.',
    '- Do not fill slots with favourite colours, generic dream dates, motivational speeches, imaginary appliances, cartoon voices or harmless-object pickup lines.',
    '- No outside people, messaging, posting, purchases, drinking tasks, injury, private photos or reading private messages. Nobody is forced to answer, touch someone or join a dare; any interaction with another player is opt-in.',
    '- No graphic sexual content, hateful humiliation, self-harm or demands for traumatic details. Keep non-Spicy decks free of sexual content.',
    '- Do not repeat or lightly reword these recent cards: ' + (avoid.slice(0, 30).join(' | ') || 'none'),
    'Return JSON only: {"cards":[{"deck":"' + deck + '","kind":"truth"|"dare","text":"..."}]}',
  ].join('\n')
}

const idFor = (deck: Deck, kind: Kind, text: string) => 'ai:' + deck + ':' + kind + ':' + createHash('sha1').update(cardTextKey(text)).digest('hex').slice(0, 10)

/** Each selected deck gets its own brief and request. Never holds up the game. */
async function askFor(deck: Deck, avoid: string[]): Promise<FreshCard[]> {
  if (!azure.configured()) return []
  const known = new Set([...CARDS[deck].truth, ...CARDS[deck].dare, ...avoid].map(cardTextKey))
  try {
    const reply = await azure.chatJson<{ cards?: { deck?: unknown; kind?: unknown; text?: unknown }[] }>(
      [
        { role: 'system', content: 'You write sharp, personal party-game cards with a different voice for each deck. Follow the deck brief. Answer with JSON only.' },
        { role: 'user', content: cardPrompt(deck, avoid) },
      ],
      { temperature: 1, maxTokens: 2200, signal: AbortSignal.timeout(DEADLINE_MS) },
    )
    const out: FreshCard[] = []
    for (const raw of Array.isArray(reply?.cards) ? reply.cards : []) {
      if (!raw || typeof raw !== 'object') continue
      const deckName = typeof raw.deck === 'string' ? raw.deck.trim().toLowerCase() : ''
      const kind = (typeof raw.kind === 'string' ? raw.kind.trim().toLowerCase() : '') as Kind
      const text = typeof raw.text === 'string' ? raw.text.replace(/\s+/g, ' ').trim() : ''
      if (deckName !== deck && deckName !== DECK_LABELS[deck].toLowerCase()) continue
      if (kind !== 'truth' && kind !== 'dare') continue
      if (text.length < 12 || text.length > 170 || out.filter((card) => card.kind === kind).length >= PER_KIND) continue
      const key = cardTextKey(text)
      if (!key || known.has(key)) continue
      known.add(key)
      out.push({ id: idFor(deck, kind, text), deck, kind, text, custom: false, fresh: true })
    }
    return out
  } catch { return [] }
}

export async function freshCards(decks: Deck[], avoid: string[], generate = askFor): Promise<FreshCard[]> {
  const wanted = [...new Set(decks)].filter((deck) => DECKS.includes(deck))
  const batches = await Promise.all(wanted.map((deck) => generate(deck, avoid)))
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
