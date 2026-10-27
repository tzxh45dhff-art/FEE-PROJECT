import { openingPens, simulate, type Flick, type Flight, type Pair } from './penfight.physics.js'

export type Player = { id: string; name: string }
export type PenStyle = 'classic' | 'gel' | 'fine'
export type PenMatch = {
  epoch: number
  seq: number
  players: [Player, Player]
  styles: [PenStyle, PenStyle]
  turn: 0 | 1
  scores: [number, number]
  pens: Pair
  winner: 0 | 1 | null
  settling: boolean
  phase: 'aim' | 'moving' | 'round' | 'over'
  round: number
  deadline: number
  missed: [number, number]
  result: { winner: 0 | 1 | null; reason: 'knockout' | 'both' | 'timeout' } | null
  shot: (Flight & { startedAt: number }) | null
}
export const TURN_MS = 35_000
export const ROUND_MS = 2200
export const penStyle = (v: unknown): PenStyle => v === 'gel' || v === 'fine' ? v : 'classic'
export function createMatch(players: [Player, Player], epoch: number, now: number, styles: [PenStyle, PenStyle] = ['classic', 'gel']): PenMatch {
  return { epoch, seq: 1, players, styles, turn: 0, scores: [0, 0], pens: openingPens(), winner: null, settling: false, phase: 'aim', round: 1, deadline: now + TURN_MS, missed: [0, 0], result: null, shot: null }
}
export function parseFlick(raw: unknown): Flick | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Flick
  if (![s.dx, s.dz, s.power, s.contact].every(v => typeof v === 'number' && Number.isFinite(v))) return null
  const length = Math.hypot(s.dx, s.dz)
  if (length < 0.001 || length > 10 || s.power < 0.06 || s.power > 1 || Math.abs(s.contact) > 1) return null
  return { dx: s.dx / length, dz: s.dz / length, power: s.power, contact: s.contact }
}
export function shoot(match: PenMatch, shot: Flick, now: number): PenMatch {
  const flight = simulate(match.pens, match.turn, shot)
  const missed: [number, number] = [...match.missed]
  missed[match.turn] = 0
  return { ...match, missed, seq: match.seq + 1, phase: 'moving', settling: true, result: null,
    deadline: now + flight.duration, shot: { ...flight, startedAt: now } }
}
/** All timers are phase transitions. No client can submit positions or scores. */
export function advance(match: PenMatch, now: number): PenMatch {
  if (match.phase === 'over' || now < match.deadline) return match
  const next = { ...match, seq: match.seq + 1 }
  if (match.phase === 'moving') {
    next.pens = match.shot!.frames.at(-1)!
    next.shot = null
    next.settling = false
    const off = next.pens.map(p => !p.onDesk)
    if (off[0] || off[1]) {
      const winner = off[0] === off[1] ? null : off[0] ? 1 : 0
      next.result = { winner, reason: winner === null ? 'both' : 'knockout' }
      next.scores = [...match.scores]
      if (winner !== null) next.scores[winner]++
      next.winner = next.scores[0] >= 3 ? 0 : next.scores[1] >= 3 ? 1 : null
      next.phase = next.winner === null ? 'round' : 'over'
      next.turn = winner === null ? (match.turn === 0 ? 1 : 0) : winner === 0 ? 1 : 0
      next.deadline = now + ROUND_MS
      return next
    }
  }
  if (match.phase === 'aim') {
    next.missed = [...match.missed]
    next.missed[match.turn]++
    next.result = { winner: null, reason: 'timeout' }
    if (next.missed[match.turn] >= 3) {
      next.winner = match.turn === 0 ? 1 : 0
      next.result.winner = next.winner
      next.phase = 'over'
      return next
    }
  }
  if (match.phase === 'round') {
    next.round++
    next.pens = openingPens(next.round)
    next.result = null
  } else next.turn = match.turn === 0 ? 1 : 0
  next.phase = 'aim'
  next.deadline = now + TURN_MS
  return next
}
