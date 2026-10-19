/**
 * The fun catalogue: what each emote, throwable and toy looks like.
 *
 * Ids must match server/src/services/fun.catalog.ts exactly — the server drops
 * anything it does not know, so a typo here is a button that silently does
 * nothing. server/test/fun.test.ts reads this file and checks; keep one entry
 * per line, each tagged with its kind, so that check can find them.
 */

export type EmoteDef = {
  id: string
  glyph: string
  label: string
  /** How the emote moves: a single pop, a fountain of copies, or a wobble. */
  motion: 'pop' | 'fountain' | 'wobble' | 'bounce'
  /** Plays the character's own wave clip as well, where the model has one. */
  clip?: 'wave' | 'sit'
}

export const EMOTES: EmoteDef[] = [
  { id: 'wave', glyph: '👋', label: 'Wave', motion: 'wobble', clip: 'wave' }, // emote
  { id: 'heart', glyph: '❤️', label: 'Love', motion: 'fountain' }, // emote
  { id: 'laugh', glyph: '😂', label: 'Laugh', motion: 'bounce' }, // emote
  { id: 'clap', glyph: '👏', label: 'Clap', motion: 'bounce' }, // emote
  { id: 'fire', glyph: '🔥', label: 'Fire', motion: 'fountain' }, // emote
  { id: 'cry', glyph: '😭', label: 'Cry', motion: 'wobble' }, // emote
  { id: 'kiss', glyph: '😘', label: 'Kiss', motion: 'pop' }, // emote
  { id: 'mindblown', glyph: '🤯', label: 'Mind blown', motion: 'pop' }, // emote
  { id: 'party', glyph: '🎉', label: 'Party', motion: 'fountain' }, // emote
  { id: 'shock', glyph: '😱', label: 'Shock', motion: 'pop' }, // emote
  { id: 'cool', glyph: '😎', label: 'Cool', motion: 'pop' }, // emote
  { id: 'sleepy', glyph: '😴', label: 'Sleepy', motion: 'wobble' }, // emote
  { id: 'angry', glyph: '😤', label: 'Fuming', motion: 'bounce' }, // emote
  { id: 'facepalm', glyph: '🤦', label: 'Facepalm', motion: 'pop' }, // emote
  { id: 'thinking', glyph: '🤔', label: 'Hmm', motion: 'wobble' }, // emote
  { id: 'lovestruck', glyph: '😍', label: 'Lovestruck', motion: 'fountain' }, // emote
]

/** The first nine, in order, are bound to the number keys. */
export const QUICK_EMOTES = EMOTES.slice(0, 9)

export type ThrowDef = {
  id: string
  glyph: string
  label: string
  /** What happens where it lands. */
  impact: 'petals' | 'confetti' | 'feathers' | 'splash' | 'snow' | 'splat' | 'glide' | 'hearts'
  /** How the person it hit reacts. */
  reaction: string
  /** Seconds in the air. Heavier things are a little quicker. */
  flight: number
  /** How high the arc goes, as a fraction of the distance thrown. */
  loft: number
  /** Spins on the way, in turns. */
  spin: number
}

export const THROWABLES: ThrowDef[] = [
  { id: 'rose', glyph: '🌹', label: 'Rose', impact: 'petals', reaction: '🥰', flight: 0.95, loft: 0.42, spin: 0.6 }, // throw
  { id: 'confetti', glyph: '🎊', label: 'Confetti', impact: 'confetti', reaction: '🥳', flight: 0.8, loft: 0.38, spin: 1 }, // throw
  { id: 'pillow', glyph: '🛏️', label: 'Pillow', impact: 'feathers', reaction: '😵', flight: 0.85, loft: 0.3, spin: 1.4 }, // throw
  { id: 'balloon', glyph: '🎈', label: 'Water balloon', impact: 'splash', reaction: '😫', flight: 0.9, loft: 0.5, spin: 0.3 }, // throw
  { id: 'snowball', glyph: '⚪', label: 'Snowball', impact: 'snow', reaction: '🥶', flight: 0.7, loft: 0.32, spin: 2 }, // throw
  { id: 'tomato', glyph: '🍅', label: 'Tomato', impact: 'splat', reaction: '😑', flight: 0.75, loft: 0.36, spin: 1.2 }, // throw
  { id: 'plane', glyph: '✈️', label: 'Paper plane', impact: 'glide', reaction: '😏', flight: 1.4, loft: 0.18, spin: 0 }, // throw
  { id: 'cupid', glyph: '💘', label: 'Cupid’s arrow', impact: 'hearts', reaction: '😍', flight: 0.6, loft: 0.12, spin: 0 }, // throw
]

export type ToyDef = { id: string; glyph: string; label: string; hint: string }

export const TOYS: ToyDef[] = [
  { id: 'dice', glyph: '🎲', label: 'Roll dice', hint: 'Two dice, rolled for everyone' }, // toy
  { id: 'coin', glyph: '🪙', label: 'Flip a coin', hint: 'Heads or tails' }, // toy
  { id: 'bottle', glyph: '🍾', label: 'Spin the bottle', hint: 'Points at someone in the room' }, // toy
  { id: 'fortune', glyph: '🥠', label: 'Fortune cookie', hint: 'Crack one open' }, // toy
  { id: 'eightball', glyph: '🎱', label: 'Magic 8-ball', hint: 'Ask it anything' }, // toy
]

export const emoteById = (id: string) => EMOTES.find((e) => e.id === id)
export const throwById = (id: string) => THROWABLES.find((t) => t.id === id)
export const toyById = (id: string) => TOYS.find((t) => t.id === id)
