/**
 * Everything a person can do for fun on the dashboard, by id.
 *
 * The server only ever relays an id from these lists, never free text or a
 * client-supplied picture — so an emote cannot become a way to push arbitrary
 * content onto somebody else's screen, and an unknown id is simply dropped.
 *
 * The client keeps its own copy with the artwork attached (src/features/fun/
 * catalog.ts). The ids must match; test/fun.test.ts checks that they do.
 */

export const EMOTES = [
  'wave',
  'heart',
  'laugh',
  'clap',
  'fire',
  'cry',
  'kiss',
  'mindblown',
  'party',
  'shock',
  'cool',
  'sleepy',
  'angry',
  'facepalm',
  'thinking',
  'lovestruck',
] as const

export const THROWABLES = [
  'rose',
  'confetti',
  'pillow',
  'balloon',
  'snowball',
  'tomato',
  'plane',
  'cupid',
] as const

export const TOYS = ['dice', 'coin', 'bottle', 'fortune', 'eightball'] as const

/** Reactions over a film — the faces people actually pull at a screen. */
export const REACTIONS = ['laugh', 'cry', 'shock', 'love', 'fire', 'clap', 'dead', 'popcorn'] as const

/** What a pinned moment can be labelled with. */
export const MOMENT_FACES = ['😭', '😂', '😱', '😍', '🔥', '🤯', '💀', '❤️', '🫣', '👏'] as const

export type Emote = (typeof EMOTES)[number]
export type Throwable = (typeof THROWABLES)[number]
export type Toy = (typeof TOYS)[number]
export type Reaction = (typeof REACTIONS)[number]

export const isEmote = (v: unknown): v is Emote => typeof v === 'string' && (EMOTES as readonly string[]).includes(v)
export const isThrowable = (v: unknown): v is Throwable =>
  typeof v === 'string' && (THROWABLES as readonly string[]).includes(v)
export const isToy = (v: unknown): v is Toy => typeof v === 'string' && (TOYS as readonly string[]).includes(v)
export const isReaction = (v: unknown): v is Reaction =>
  typeof v === 'string' && (REACTIONS as readonly string[]).includes(v)
export const isMomentFace = (v: unknown): v is string =>
  typeof v === 'string' && (MOMENT_FACES as readonly string[]).includes(v)

/**
 * Fortunes, written to be read out loud to someone sitting next to you.
 *
 * A fortune cookie in a room of two is a small social thing, not a horoscope —
 * so these lean playful and warm, a few of them aimed squarely at whoever is
 * listening, and none of them the kind of generic line that reads like it came
 * off a poster.
 */
export const FORTUNES = [
  'Someone in this room is thinking about snacks. It might be you.',
  'You will win the next game. Probably. Do not quote me.',
  'The person next to you laughs at your jokes more than they admit.',
  'A long trip is in your future. To the kitchen. Bring something back.',
  'Today is a good day to let someone else pick the movie.',
  'You owe someone in this room a chai.',
  'Your next text will be misread. Add an emoji.',
  'Good things are coming. Some of them are pizza.',
  'The answer you are looking for is "five more minutes".',
  'Someone here has a secret playlist. Ask them about it.',
  'You are about to say something iconic. Speak carefully.',
  'Fortune favours the one who presses play first.',
  'A small adventure will find you this week. Say yes to it.',
  'You will be right about something tonight and nobody will admit it.',
  'The best part of your day is happening right now.',
  'Lucky number: the number of hours you will spend here tonight.',
  'Someone is about to steal your blanket. Defend it.',
  'Your laugh is the room’s favourite sound.',
  'Do not trust the next person who says "one more episode".',
  'An old memory will come up tonight. Tell the story.',
  'You are somebody’s favourite notification.',
  'Great minds think alike. So do the two of you, worryingly.',
  'Tomorrow you will remember tonight and smile.',
  'Your next decision should be dessert.',
] as const

export const EIGHT_BALL = [
  'It is certain.',
  'Without a doubt.',
  'Yes — definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again after snacks.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  'Don’t count on it.',
  'My reply is no.',
  'My sources say no.',
  'Very doubtful.',
  'Absolutely not. Next question.',
  'Ask the person next to you.',
] as const
