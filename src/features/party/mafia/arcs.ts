import { createContext, useContext } from 'react'

/**
 * The stories a game of Mafia can be told in — mirrors `server/src/games/mafia.arcs.ts`.
 *
 * The server holds the words (narration, the AIs, the morning paper's lines);
 * this holds what the screens need to dress for it: names on the masthead and
 * the case file, the date, the lettering. Colours and weather live in
 * `noir.css` under `data-arc`, and the skyline in `art.tsx`.
 */

export const ARC_IDS = ['bombay', 'shimla', 'goa', 'neo', 'jaisalmer'] as const
export type ArcId = (typeof ARC_IDS)[number]
export type ArcChoice = ArcId | 'surprise'

export type ArcLook = {
  id: ArcId
  /** On the setup screen's story picker. */
  name: string
  blurb: string
  /** "Bombay · 1956" — the small caps over the screens. */
  label: string
  /** "Bombay, 1956" — the title on the first page of the story. */
  heading: string
  /** The line over that title. */
  season: string
  /** The clipping pinned to the first page. */
  clipping: string
  /** The back of every card: a place and a year. */
  card: [string, string]
  paper: string
  price: string
  /** The first morning's date; each night adds a day. */
  date: [year: number, month: number, day: number]
  caseFile: string
  /** The Family's win, in a line. */
  takeover: string
  /** Who the AI players are, on the setup screen. */
  regulars: string
  /** The story's own lettering (Google Fonts families), loaded only when it's played. */
  fonts: string | null
}

export const ARCS: Record<ArcId, ArcLook> = {
  bombay: {
    id: 'bombay',
    name: 'Monsoon Noir',
    blurb: 'Rain, jazz and bodies at the docks.',
    label: 'Bombay · 1956',
    heading: 'Bombay, 1956',
    season: 'Monsoon · July',
    clipping: 'Fourth body at the docks this month — police baffled',
    card: ['BOMBAY', '1956'],
    paper: 'The Bombay Herald',
    price: 'Extra · Two annas',
    date: [1956, 6, 11],
    caseFile: 'Case file · Bombay police',
    takeover: 'Bombay belongs to them now.',
    regulars: 'Bombay regulars',
    fonts: null,
  },
  shimla: {
    id: 'shimla',
    name: 'The Snowbound Hotel',
    blurb: 'A blizzard, a grand hotel, no way down the hill.',
    label: 'Simla · 1922',
    heading: 'Simla, 1922',
    season: 'Blizzard · January',
    clipping: 'Road to Kalka buried — guests stranded at the Grand Cedar',
    card: ['SIMLA', '1922'],
    paper: 'The Cedar Bulletin',
    price: 'Slipped under every door',
    date: [1922, 0, 14],
    caseFile: 'Case file · Grand Cedar Hotel',
    takeover: 'The hotel belongs to them now.',
    regulars: 'stranded guests',
    fonts: 'Cinzel:wght@600;800',
  },
  goa: {
    id: 'goa',
    name: 'Carnival Nights',
    blurb: 'Masks, brass bands and a killer on the dance floor.',
    label: 'Goa · 1984',
    heading: 'Goa, 1984',
    season: 'Carnival · February',
    clipping: 'Reveller missing after King Momo’s parade',
    card: ['GOA', '1984'],
    paper: 'The Panjim Tide',
    price: 'Carnival special · One rupee',
    date: [1984, 1, 25],
    caseFile: 'Case file · Panjim police',
    takeover: 'The carnival belongs to them now.',
    regulars: 'carnival regulars',
    fonts: 'Shrikhand',
  },
  neo: {
    id: 'neo',
    name: 'Neon City',
    blurb: 'Pink rain, sky-trains and signals going dark.',
    label: 'Neo-Bombay · 2089',
    heading: 'Neo-Bombay, 2089',
    season: 'Curfew · Level Nine',
    clipping: 'Signal lost on Level 3 — police AI reports “a glitch”',
    card: ['NEO-BOMBAY', '2089'],
    paper: 'The Neo-Bombay Feed',
    price: 'Live · 0.2 credits',
    date: [2089, 10, 3],
    caseFile: 'Case file · Precinct 9',
    takeover: 'The grid belongs to them now.',
    regulars: 'Level Nine regulars',
    fonts: 'Orbitron:wght@600;800&family=Share+Tech+Mono&family=Exo+2:ital,wght@0,600;0,800;0,900;1,500',
  },
  jaisalmer: {
    id: 'jaisalmer',
    name: 'The Desert Court',
    blurb: 'A sandstorm, a golden fort, a court full of secrets.',
    label: 'Jaisalmer · 1890',
    heading: 'Jaisalmer, 1890',
    season: 'Sandstorm · April',
    clipping: 'Courtier missing — found by the old step-well',
    card: ['JAISALMER', '1890'],
    paper: 'The Court Proclamation',
    price: 'By order of the throne',
    date: [1890, 3, 9],
    caseFile: 'Case file · The royal guard',
    takeover: 'The throne belongs to them now.',
    regulars: 'courtiers',
    fonts: 'Rozha+One',
  },
}

export const arcOf = (raw: unknown): ArcLook => ARCS[(ARC_IDS as readonly string[]).includes(raw as string) ? (raw as ArcId) : 'bombay']

/** The morning paper's date for a night of the story. */
export const storyDate = (arc: ArcLook, round: number) => {
  const [year, month, day] = arc.date
  return new Date(year, month, day + round).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export const ArcContext = createContext<ArcLook>(ARCS.bombay)
/** The story this screen is dressed for. */
export const useArc = () => useContext(ArcContext)
