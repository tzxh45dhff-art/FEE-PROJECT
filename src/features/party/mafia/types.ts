/** Mafia, as one screen receives it — mirrors `view()` in server/src/games/mafia.ts. */

import type { ArcChoice, ArcId } from './arcs'

export type Role = 'mafia' | 'godfather' | 'doctor' | 'detective' | 'villager' | 'jester'
export type Phase = 'prologue' | 'deal' | 'night' | 'hush' | 'dawn' | 'day' | 'vote' | 'defence' | 'judgement' | 'verdict' | 'over'
export type Presence = 'online' | 'table'
export type Winner = 'town' | 'family' | 'jester'
export type StoryKey = 'city' | 'cast' | 'family' | 'town' | 'days'

export type MafiaOptions = {
  nightSeconds: number
  daySeconds: number
  voteSeconds: number
  reveal: boolean
  godfather: boolean
  jester: boolean
  together: boolean
  rematch?: boolean
  bots?: number
  /** Open with the story before the cards. */
  story?: boolean
  /** The story: chosen by the host, or a surprise the room hasn't played lately. */
  arc?: ArcChoice
  /** Roll 1 or 2 Doctors and Inspectors by table size, where the host didn't set a count. */
  randomPowers?: boolean
  /** The host's own deal; null or absent keeps the recommended count. */
  family?: number | null
  doctors?: number | null
  detectives?: number | null
}

export type SeatView = {
  id: string
  name: string
  alive: boolean
  presence: Presence
  /** Who they are in the story: "jazz singer at a Colaba club". */
  cover: string
  died: { round: number; how: 'killed' | 'voted' } | null
  role: Role | null
  /** An AI player: who they are, in a few words. */
  bot: string | null
}

export type CaseEvent =
  | { round: number; kind: 'kill'; victim: string }
  | { round: number; kind: 'saved'; target: string; by: string }
  | { round: number; kind: 'quiet' }
  | { round: number; kind: 'file'; by: string; target: string; family: boolean }
  | { round: number; kind: 'hanged'; target: string; guilty: number; innocent: number }
  | { round: number; kind: 'acquitted'; target: string; guilty: number; innocent: number }
  | { round: number; kind: 'spared' }

export type Ledger = {
  round: number
  nominations: Record<string, string | null>
  accused: string | null
  judgement: Record<string, boolean>
  outcome: 'hanged' | 'acquitted' | 'nobody'
}

export type MafiaView = {
  game: string
  /** The story this game is told in. */
  arc: ArcId
  phase: Phase
  step: number
  round: number
  host: string
  deadline: number | null
  paused: number | null
  options: MafiaOptions
  players: SeatView[]
  me: {
    id: string
    role: Role
    alive: boolean
    title: string
    line: string
    seen: boolean
    pick: string | null
    lastProtected: string | null
    selfSaveUsed: boolean
    files: { round: number; target: string; family: boolean }[]
    judged: boolean | null
    prediction: Winner | null
    bluff: string | null
  } | null
  night: { chosen: number; of: number; family: { id: string; pick: string | null }[] | null } | null
  dawn: { victim: string | null; saved: boolean } | null
  ready: string[]
  /** Who has read the morning paper or the verdict and wants to move on. */
  next: string[]
  /** For someone watching: whether a seat is still open to them (before the first night). */
  joinable?: boolean
  /** The opening story: which page is showing. */
  story: { key: StoryKey; at: number; of: number } | null
  votes: Record<string, string | null>
  accused: string | null
  /** The accused's defence, in their own words — shown while the town decides. */
  plea: string | null
  judgement: { done: number; of: number } | null
  verdict: { target: string | null; guilty: number; innocent: number; role: Role | null; jester: boolean; hanged: boolean } | null
  after: 'dawn' | 'verdict' | null
  whispers: { by: string; text: string; at: number }[]
  ghosts: { by: string; text: string; at: number }[]
  narration: { id: string; kind: string; text: string; headline: string | null; audio: string | null; ready: boolean } | null
  winner: Winner | null
  ledger: Ledger[]
  talk: { by: string; text: string; at: number; kind: 'say' | 'heard' | 'bot'; round?: number }[]
  thinking: string[]
  history: CaseEvent[] | null
  suspicions: { round: number; by: string; target: string }[] | null
  predictions: Record<string, Winner> | null
  bluff: Record<string, string> | null
}

export const isFamily = (role: Role | null) => role === 'mafia' || role === 'godfather'

export const ROLE_TITLE: Record<Role, string> = {
  mafia: 'The Family',
  godfather: 'The Godfather',
  doctor: 'The Doctor',
  detective: 'The Inspector',
  villager: 'Citizen',
  jester: 'The Jester',
}
