export type Point = { lat: number; lng: number }
export type GeoOptions = {
  map: 'world' | 'india'
  movement: 'moving' | 'no-move' | 'fixed'
  mode: 'classic' | 'duel'
  rounds: number
  seconds: number
  opponent?: string
}
export type GeoRound = {
  round: number
  location: Point & { label: string }
  guesses: Record<string, { point: Point | null; distance: number | null; points: number; missed: boolean }>
  multiplier: number
  damage: number
}
export type GeoView = {
  token: string
  round: number
  attempt: number
  phase: 'loading' | 'countdown' | 'playing' | 'reveal' | 'blocked' | 'over'
  options: GeoOptions
  players: { id: string; name: string }[]
  host: string
  deadline: number | null
  ready: string[]
  eligible: string[]
  answered: string[]
  mine: Point | null
  revision: number
  scores: Record<string, number>
  health: Record<string, number>
  history: GeoRound[]
  nextReady: string[]
  error: string | null
  endedEarly: boolean
  scene: { pano: string; heading: number; pitch: number; zoom: number }
}
export type GeoAct = (action: string, payload?: Record<string, unknown>) => Promise<{ error?: string; ok?: boolean }>
export const MOVEMENT = { moving: 'Explore freely', 'no-move': 'Look around', fixed: 'One view' }
export const COLORS = [
  '#ef795c',
  '#5cd5c0',
  '#f4c96a',
  '#9bb5f6',
  '#e6a4c5',
  '#c0d982',
  '#eab397',
  '#85cedd',
  '#d3b0ef',
  '#dad6c1',
  '#96b889',
  '#b8a7a0',
]
export const formatDistance = (km: number | null | undefined) =>
  km == null ? 'No pin' : km < 1 ? `${Math.round(km * 1000)} m` : `${Math.round(km).toLocaleString()} km`
