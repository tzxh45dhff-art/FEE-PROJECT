import { randomInt } from 'node:crypto'

/**
 * Room party games, as plain state machines.
 *
 * Every game here — truth or dare, draw and guess, how well do you know me,
 * trivia, guess the song — has the same skeleton: a handful of people take
 * turns, some of what is on the table is secret from some of them, things time
 * out, and at the end there is a result worth keeping. So the skeleton lives
 * here once and each game is only its rules.
 *
 * A game never touches a socket. It receives an action and returns the next
 * state; it says what each player may see; it asks for timers through the
 * context. That is what makes the rules testable without a server, and what
 * keeps secrets on the server: a player's screen is drawn from `view(state,
 * them)`, never from the state itself.
 */

export type Player = { id: string; name: string }

export type Ctx = {
  /** Wall clock, injectable for tests. */
  now: () => number
  /** 0 ≤ n < max, from a CSPRNG — nobody gets to load the dice. */
  random: (max: number) => number
  /** Run `action` against this game after `ms`, as if the server sent it. */
  schedule: (ms: number, action: string, payload?: Record<string, unknown>) => void
  /** Cancel every pending timer for this game. */
  clearSchedule: () => void
  /** Content this room has had in earlier games, for `byFreshness`. */
  seen?: ReadonlySet<string>
  /** Who is in the room right now, by user id — for games that hand over when someone leaves. */
  present?: () => string[]
}

export type Result<S> = S | { error: string }

/** Slow work whose answer comes back as a server action. */
export type Later = Promise<{ action: string; payload: Record<string, unknown> } | null>

export interface GameDef<S, O = unknown> {
  id: string
  label: string
  minPlayers: number
  maxPlayers: number
  /** People needed with these options — fewer when the game fills seats itself. */
  minPeople?: (options: O) => number
  /** Validate and normalise the options from the client. */
  options: (raw: unknown) => O | { error: string }
  /** Anything that needs the database before the game can start — the room's songs. */
  prepare?: (roomId: string, options: O) => Promise<O | { error: string }>
  /**
   * Slow work that must not hold the start up — new cards from a model, say.
   * Runs once the game is under way; what it returns is applied as an action
   * from the server, if the same game is still running.
   */
  background?: (roomId: string, options: O, state: S) => Promise<{ action: string; payload: Record<string, unknown> } | null>
  /**
   * Slow work prompted by a state, checked after every change — narration for
   * a moment that just began, say. Return null when there is nothing to do;
   * the game is responsible for not asking twice. What the promise resolves
   * to is applied as a server action, if the same game is still running.
   */
  after?: (roomId: string, state: S) => Later | Later[] | null
  start: (players: Player[], options: O, ctx: Ctx) => S
  /**
   * Apply an action. `by` is null for the server's own timers. Return the next
   * state, or an error string the player sees ("It's not your turn").
   */
  act: (state: S, by: Player | null, action: string, payload: Record<string, unknown>, ctx: Ctx) => Result<S>
  /** What this person sees. Anything not returned here never leaves the server. */
  view: (state: S, viewer: string) => unknown
  /** Somebody walked in mid-game. Return null to keep them watching. */
  join?: (state: S, player: Player) => S | null
  /** The game is over; what is worth keeping, or null for nothing. */
  over: (state: S) => { summary: Record<string, unknown> } | null
  /** The content this game has shown so far, remembered so the room's next game leads with new things. */
  used?: (state: S) => string[]
}

export const isError = (value: unknown): value is { error: string } =>
  typeof value === 'object' && value !== null && 'error' in value && typeof (value as { error: unknown }).error === 'string'

/** The real context: crypto randomness and real timers. */
export function liveCtx(
  dispatch: (action: string, payload: Record<string, unknown>) => void,
  seen?: ReadonlySet<string>,
  present?: () => string[],
): Ctx & { dispose: () => void } {
  const timers = new Set<NodeJS.Timeout>()
  return {
    seen,
    present,
    now: () => Date.now(),
    random: (max) => (max <= 1 ? 0 : randomInt(max)),
    schedule: (ms, action, payload = {}) => {
      const timer = setTimeout(() => {
        timers.delete(timer)
        dispatch(action, payload)
      }, ms)
      timers.add(timer)
    },
    clearSchedule: () => {
      timers.forEach(clearTimeout)
      timers.clear()
    },
    dispose: () => {
      timers.forEach(clearTimeout)
      timers.clear()
    },
  }
}

/** Fisher–Yates with the context's randomness. */
export function shuffle<T>(list: readonly T[], ctx: Pick<Ctx, 'random'>): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = ctx.random(i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

export const text = (raw: unknown, max: number) => (typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ').slice(0, max) : '')

/**
 * Shuffled, with what this room has not had yet in front and what it has
 * seen behind — so repeats only start once everything has been used.
 */
export function byFreshness<T>(list: readonly T[], key: (item: T) => string, ctx: Pick<Ctx, 'random' | 'seen'>): T[] {
  const mixed = shuffle(list, ctx)
  const seen = ctx.seen
  if (!seen?.size) return mixed
  return [...mixed.filter((item) => !seen.has(key(item))), ...mixed.filter((item) => seen.has(key(item)))]
}
