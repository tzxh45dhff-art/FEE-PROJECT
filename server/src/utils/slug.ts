import { randomInt } from 'node:crypto'

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

/**
 * `Movie Night` → `movie-night-x7f2ka`.
 *
 * Suffixed so room names can repeat — and the suffix is the lock on a private
 * room, since the code is how you get in. Six characters from an alphabet
 * that reads aloud cleanly (no 0/o or 1/l/i to mix up over a call) give about
 * 900 million codes per name, drawn from a cryptographic source rather than
 * Math.random.
 */
export function slugify(name: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'room'

  let suffix = ''
  for (let i = 0; i < 6; i++) suffix += ALPHABET[randomInt(ALPHABET.length)]
  return `${base}-${suffix}`
}
