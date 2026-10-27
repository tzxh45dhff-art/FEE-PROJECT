import { randomUUID } from 'node:crypto'
import type { Ctx, GameDef, Player } from './engine.js'
import { prepareGeoLocations, type GeoLocation } from '../services/geoLocations.service.js'

export type Point = { lat: number; lng: number }
export type GeoOptions = {
  map: 'world' | 'india'
  movement: 'moving' | 'no-move' | 'fixed'
  mode: 'classic' | 'duel'
  rounds: number
  seconds: number
  opponent?: string
  locations?: GeoLocation[]
}
type Pick = { point: Point; revision: number }
export type GeoRound = {
  round: number
  location: Point & { label: string }
  guesses: Record<string, { point: Point | null; distance: number | null; points: number; missed: boolean }>
  multiplier: number
  damage: number
}
export type GeoState = {
  token: string
  options: GeoOptions
  players: Player[]
  host: string
  locations: GeoLocation[]
  round: number
  attempt: number
  phase: 'loading' | 'countdown' | 'playing' | 'reveal' | 'blocked' | 'over'
  deadline: number | null
  ready: string[]
  eligible: string[]
  drafts: Record<string, Pick>
  locked: Record<string, Point>
  scores: Record<string, number>
  health: Record<string, number>
  history: GeoRound[]
  nextReady: string[]
  loadError: string | null
  endedEarly: boolean
}

export const validPoint = (raw: unknown): raw is Point => {
  const p = raw as Point | null
  return (
    !!p &&
    typeof p.lat === 'number' &&
    Number.isFinite(p.lat) &&
    p.lat >= -90 &&
    p.lat <= 90 &&
    typeof p.lng === 'number' &&
    Number.isFinite(p.lng) &&
    p.lng >= -180 &&
    p.lng <= 180
  )
}

/** Great-circle kilometres; clamping also keeps antipodal rounding finite. */
export function distanceKm(a: Point, b: Point): number {
  const rad = Math.PI / 180
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lng - a.lng) * rad) / 2) ** 2
  return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, h))))
}

/** Huddle's own distance curve: 25m perfect radius; India is a tighter map. */
export function geoPoints(distance: number, map: GeoOptions['map']): number {
  if (!Number.isFinite(distance) || distance < 0) return 0
  if (distance <= 0.025) return 5000
  return Math.min(4999, Math.round(5000 * Math.exp(-distance / (map === 'india' ? 400 : 2000))))
}

const identity = (s: GeoState) => ({ token: s.token, round: s.round, attempt: s.attempt })
const schedule = (s: GeoState, ctx: Ctx, ms: number, action: string) => ctx.schedule(ms, action, identity(s))
const isCurrent = (s: GeoState, p: Record<string, unknown>) =>
  p.token === s.token && p.round === s.round && p.attempt === s.attempt

function loading(s: GeoState, ctx: Ctx): GeoState {
  ctx.clearSchedule()
  const next: GeoState = {
    ...s,
    phase: 'loading',
    ready: [],
    eligible: [],
    drafts: {},
    locked: {},
    nextReady: [],
    loadError: null,
    deadline: ctx.now() + 20_000,
  }
  schedule(next, ctx, 20_000, 'load-timeout')
  return next
}

function countdown(s: GeoState, ctx: Ctx): GeoState {
  ctx.clearSchedule()
  const next: GeoState = { ...s, phase: 'countdown', deadline: ctx.now() + 3000 }
  schedule(next, ctx, 3000, 'open')
  return next
}

function reveal(s: GeoState, ctx: Ctx): GeoState {
  ctx.clearSchedule()
  const location = s.locations[s.round]!
  const scores = { ...s.scores }
  const guesses: GeoRound['guesses'] = {}
  for (const player of s.players) {
    const point = s.eligible.includes(player.id) ? (s.locked[player.id] ?? s.drafts[player.id]?.point ?? null) : null
    const distance = point ? distanceKm(point, location) : null
    const points = distance === null ? 0 : geoPoints(distance, s.options.map)
    scores[player.id] = (scores[player.id] ?? 0) + points
    guesses[player.id] = { point, distance, points, missed: !s.eligible.includes(player.id) }
  }
  const health = { ...s.health }
  const multiplier = s.options.mode === 'duel' ? Math.max(1, s.round - 1) : 1
  let damage = 0
  if (s.options.mode === 'duel') {
    const [a, b] = s.players
    const gap = guesses[a!.id]!.points - guesses[b!.id]!.points
    damage = Math.abs(gap) * multiplier
    if (gap) {
      const loser = gap > 0 ? b!.id : a!.id
      health[loser] = Math.max(0, health[loser]! - damage)
    }
  }
  const result: GeoRound = {
    round: s.round,
    location: { lat: location.lat, lng: location.lng, label: location.label },
    guesses,
    multiplier,
    damage,
  }
  const next: GeoState = {
    ...s,
    scores,
    health,
    phase: 'reveal',
    history: [...s.history, result],
    deadline: ctx.now() + 18_000,
    nextReady: [],
  }
  schedule(next, ctx, 18_000, 'advance')
  return next
}

function advance(s: GeoState, ctx: Ctx): GeoState {
  ctx.clearSchedule()
  if (s.round + 1 >= s.options.rounds || (s.options.mode === 'duel' && Object.values(s.health).some((h) => h === 0))) {
    return { ...s, phase: 'over', deadline: null }
  }
  return loading({ ...s, round: s.round + 1, attempt: 0 }, ctx)
}

export const geoGame: GameDef<GeoState, GeoOptions> = {
  id: 'geo',
  label: 'Somewhere',
  minPlayers: 1,
  maxPlayers: 12,
  minPeople: (o) => (o.mode === 'duel' ? 2 : 1),
  options(raw) {
    const p = (raw ?? {}) as Record<string, unknown>
    if (p.map !== undefined && !['world', 'india'].includes(p.map as string)) return { error: 'Choose World or India' }
    if (p.movement !== undefined && !['moving', 'no-move', 'fixed'].includes(p.movement as string))
      return { error: 'Choose a valid exploration setting' }
    if (p.mode !== undefined && !['classic', 'duel'].includes(p.mode as string))
      return { error: 'Choose Classic or Duel' }
    if (p.rounds !== undefined && ![3, 5, 10].includes(p.rounds as number)) return { error: 'Choose 3, 5 or 10 rounds' }
    if (p.seconds !== undefined && ![30, 60, 90, 120, 180].includes(p.seconds as number))
      return { error: 'Choose a valid round timer' }
    const mode = p.mode === 'duel' ? 'duel' : 'classic'
    if (p.opponent !== undefined && (typeof p.opponent !== 'string' || !p.opponent || p.opponent.length > 128))
      return { error: 'Choose a friend for the duel' }
    return {
      map: p.map === 'india' ? 'india' : 'world',
      movement: (p.movement as GeoOptions['movement']) ?? 'moving',
      mode,
      rounds: mode === 'duel' ? 10 : ((p.rounds as number) ?? 5),
      seconds: (p.seconds as number) ?? 90,
      opponent: mode === 'duel' ? (p.opponent as string | undefined) : undefined,
    }
  },
  async prepare(roomId, options) {
    return prepareGeoLocations(roomId, options)
  },
  start(players, options, ctx) {
    // Only prepare() can supply locations; options() deliberately discards client pools.
    if (!options.locations || options.locations.length < options.rounds)
      throw new Error('Somewhere needs prepared locations')
    const seated =
      options.mode === 'duel'
        ? [players[0]!, players.find((p) => p.id === options.opponent && p.id !== players[0]!.id) ?? players[1]!]
        : players
    const initial: GeoState = {
      token: randomUUID(),
      options: { ...options, locations: undefined },
      locations: options.locations,
      players: seated,
      host: seated[0]!.id,
      round: 0,
      attempt: 0,
      phase: 'loading',
      deadline: null,
      ready: [],
      eligible: [],
      drafts: {},
      locked: {},
      scores: Object.fromEntries(seated.map((p) => [p.id, 0])),
      health: Object.fromEntries(seated.map((p) => [p.id, 6000])),
      history: [],
      nextReady: [],
      loadError: null,
      endedEarly: false,
    }
    return loading(initial, ctx)
  },
  act(s, by, action, p, ctx) {
    if (s.phase === 'over') return s
    const member = by && s.players.some((x) => x.id === by.id)
    if (by && !member) return { error: 'Join the next round to play' }
    // A returning host keeps control; if they left, the first present player inherits it.
    const present = ctx.present?.()
    if (present && !present.includes(s.host)) {
      const heir = s.players.find((x) => present.includes(x.id))
      if (heir) s = { ...s, host: heir.id }
    }
    if (action === 'end') {
      if (!isCurrent(s, p)) return { error: 'That game has changed' }
      if (!by || !s.players.some((x) => x.id === by.id)) return { error: 'Only the players can end this game' }
      ctx.clearSchedule()
      return { ...s, phase: 'over', deadline: null, endedEarly: true }
    }
    if (!isCurrent(s, p)) return by ? { error: 'That round has changed — use the current one' } : s
    if (action === 'take-host') return s
    if (action === 'ready' && by && (s.phase === 'loading' || s.phase === 'countdown')) {
      const next = { ...s, ready: [...new Set([...s.ready, by.id])] }
      return s.phase === 'loading' && next.players.every((x) => next.ready.includes(x.id)) ? countdown(next, ctx) : next
    }
    if (action === 'load-timeout' && !by && s.phase === 'loading') {
      if (s.ready.length && (s.options.mode !== 'duel' || s.ready.length === 2)) return countdown(s, ctx)
      return {
        ...s,
        phase: 'blocked',
        deadline: null,
        loadError:
          s.options.mode === 'duel'
            ? 'Both players need to load the view before a duel can start.'
            : 'The view could not load. Check the connection and map access, then try again.',
      }
    }
    if (action === 'retry' && by && by.id === s.host && s.phase === 'blocked') {
      return loading({ ...s, attempt: s.attempt + 1 }, ctx)
    }
    if (action === 'replace' && by && by.id === s.host && s.phase === 'blocked') {
      const spare = s.locations[s.options.rounds]
      if (!spare) return { error: 'No replacement locations left. End this game and start a fresh route.' }
      const locations = [...s.locations]
      locations[s.round] = spare
      locations.splice(s.options.rounds, 1)
      return loading({ ...s, locations, attempt: s.attempt + 1 }, ctx)
    }
    if (action === 'open' && !by && s.phase === 'countdown' && ctx.now() >= s.deadline!) {
      const next: GeoState = {
        ...s,
        phase: 'playing',
        eligible: s.ready,
        deadline: ctx.now() + s.options.seconds * 1000,
      }
      ctx.clearSchedule()
      schedule(next, ctx, s.options.seconds * 1000, 'timeup')
      return next
    }
    if ((action === 'draft' || action === 'guess') && by) {
      if (s.locked[by.id]) return s // Lost acknowledgement retries never move a locked pin.
      if (s.phase !== 'playing' || ctx.now() >= s.deadline!) return { error: 'This round is closed' }
      if (!s.eligible.includes(by.id)) return { error: 'Your view missed the start. You can play next round.' }
      if (!validPoint(p.point)) return { error: 'Place a valid pin on the map' }
      if (action === 'draft') {
        if (!Number.isSafeInteger(p.revision) || (p.revision as number) < 1) return { error: 'Invalid pin revision' }
        if ((p.revision as number) <= (s.drafts[by.id]?.revision ?? 0)) return s
        return {
          ...s,
          drafts: {
            ...s.drafts,
            [by.id]: { point: { lat: p.point.lat, lng: p.point.lng }, revision: p.revision as number },
          },
        }
      }
      const next = { ...s, locked: { ...s.locked, [by.id]: { lat: p.point.lat, lng: p.point.lng } } }
      if (s.eligible.every((id) => !!next.locked[id])) return reveal(next, ctx)
      if (s.options.mode === 'duel' && Object.keys(s.locked).length === 0) {
        next.deadline = Math.min(s.deadline!, ctx.now() + 15_000)
        schedule(next, ctx, next.deadline - ctx.now(), 'timeup')
      }
      return next
    }
    if (action === 'timeup' && !by && s.phase === 'playing' && ctx.now() >= s.deadline!) return reveal(s, ctx)
    if (action === 'next' && by && s.phase === 'reveal') {
      const next = { ...s, nextReady: [...new Set([...s.nextReady, by.id])] }
      const here = s.players.filter((x) => !present || present.includes(x.id))
      return here.length && here.every((x) => next.nextReady.includes(x.id)) ? advance(next, ctx) : next
    }
    if (action === 'advance' && !by && s.phase === 'reveal' && ctx.now() >= s.deadline!) return advance(s, ctx)
    return by ? { error: 'That action is not available right now' } : s
  },
  view(s, viewer) {
    const location = s.locations[s.round]!
    return {
      ...identity(s),
      phase: s.phase,
      options: s.options,
      players: s.players,
      host: s.host,
      deadline: s.deadline,
      ready: s.ready,
      eligible: s.eligible,
      answered: Object.keys(s.locked),
      mine: s.locked[viewer] ?? s.drafts[viewer]?.point ?? null,
      revision: s.drafts[viewer]?.revision ?? 0,
      scores: s.scores,
      health: s.health,
      history: s.history,
      nextReady: s.nextReady,
      error: s.loadError,
      endedEarly: s.endedEarly,
      // The SDK receives only this round's panorama, never future answers or other pins.
      scene: { pano: location.pano, heading: location.heading, pitch: 0, zoom: 1 },
    }
  },
  join(s, player) {
    if (
      s.phase === 'over' ||
      s.options.mode === 'duel' ||
      s.players.length >= 12 ||
      s.players.some((x) => x.id === player.id)
    )
      return null
    return {
      ...s,
      players: [...s.players, player],
      scores: { ...s.scores, [player.id]: 0 },
      health: { ...s.health, [player.id]: 6000 },
    }
  },
  over(s) {
    return s.phase === 'over'
      ? {
          summary: {
            players: s.players,
            scores: s.scores,
            health: s.health,
            mode: s.options.mode,
            rounds: s.history.length,
            endedEarly: s.endedEarly,
          },
        }
      : null
  },
  used(s) {
    return s.locations.slice(0, s.round + 1).map((x) => x.seed)
  },
}
