import { randomInt } from 'node:crypto'

import { isError, shuffle, type Ctx, type GameDef, type Later, type Player } from './engine.js'
import { PERSONAS, nightPick, think, type Job, type Sight } from './mafia.bots.js'
import { MAX_PLAYERS, MIN_PLAYERS, ROLE_INFO, first, roleSet, teamOf, type Role } from './mafia.roles.js'
import { narrate, type NarrationFacts, type NarrationKind } from '../services/mafiaNarration.service.js'

/**
 * Mafia — Bombay, 1956.
 *
 * A night, a morning paper, a day of arguing, a nomination, a defence, a
 * verdict — round and round until one side is gone. The accused speaks
 * *before* the town decides, so a good talker can actually save their neck.
 *
 * Every rule lives here; screens only see `view(state, them)`, so a role is
 * never on a screen it shouldn't be — the Family see each other, the dead see
 * everyone, and nobody else sees anything but their own card. Nothing waits
 * on a person: every phase has a clock. And everyone has something to do at
 * night, so nobody can tell who matters by who is tapping their screen.
 */

export type Phase = 'prologue' | 'deal' | 'night' | 'hush' | 'dawn' | 'day' | 'vote' | 'defence' | 'judgement' | 'verdict' | 'over'
export type Presence = 'online' | 'table'
export type Winner = 'town' | 'family' | 'jester'

export type Options = {
  nightSeconds: number
  daySeconds: number
  voteSeconds: number
  /** Show a role when its owner dies. Off makes every death a mystery until the end. */
  reveal: boolean
  godfather: boolean
  jester: boolean
  /** Everyone is in the same room. */
  together: boolean
  /** Straight back in after a game: a short opening, not the full one. */
  rematch: boolean
  /** Open with the story — the city, the cast, the Family, how a day works — before the cards. */
  story: boolean
  /** AI players to fill the table. */
  bots: number
  /** How many of each card the host chose; null for the recommended deal. */
  family: number | null
  doctors: number | null
  detectives: number | null
}

export type Seat = Player & {
  role: Role
  alive: boolean
  presence: Presence
  died?: { round: number; how: 'killed' | 'voted' }
  /** An AI player: which Bombay regular is in the seat. */
  bot?: number
  /** Who they are in the story: "jazz singer at a Colaba club", "a young lawyer from the High Court". */
  cover: string
}

/** A line said at the table: typed, heard through someone's microphone, or an AI's. */
export type Talk = { by: string; text: string; at: number; kind: 'say' | 'heard' | 'bot'; round: number }
/** An AI working out what to do; answered by Luna, or by rules. */
export type Thinking = { key: string; id: string; job: Job; replyTo: string | null }

export type Narration = {
  id: string
  kind: NarrationKind
  /** The phase this belongs to; screens show and play it only then. */
  phase: Phase
  text: string
  headline: string | null
  audio: string | null
  ready: boolean
  facts: NarrationFacts
}

export type CaseEvent =
  | { round: number; kind: 'kill'; victim: string }
  | { round: number; kind: 'saved'; target: string; by: string }
  | { round: number; kind: 'quiet' }
  | { round: number; kind: 'file'; by: string; target: string; family: boolean }
  | { round: number; kind: 'hanged'; target: string; guilty: number; innocent: number }
  | { round: number; kind: 'acquitted'; target: string; guilty: number; innocent: number }
  | { round: number; kind: 'spared' }

/** The town's public record of a day: who pointed at whom, and how the judgement went. */
export type Ledger = {
  round: number
  nominations: Record<string, string | null>
  accused: string | null
  judgement: Record<string, boolean>
  outcome: 'hanged' | 'acquitted' | 'nobody'
}

export type Mafia = {
  /** This game, among all the room's games — so a rematch never inherits the last one's narration. */
  game: string
  phase: Phase
  /** Bumped on every phase change; timers carry it, so a stale timer does nothing. */
  step: number
  round: number
  /** Which page of the opening story is showing. */
  page: number
  host: string
  options: Options
  players: Seat[]
  deadline: number | null
  /** Time left on the clock while the host has the game paused. */
  paused: number | null
  seen: string[]
  /** Tonight's choices: a victim, a patient, a file, or a suspect. */
  picks: Record<string, string>
  /** Each Doctor's patient last night — not the same one two nights running. */
  patients: Record<string, string>
  /** Doctors who have used their one self-save. */
  selfSaved: string[]
  dawn: { victim: string | null; saved: boolean } | null
  files: { round: number; target: string; family: boolean }[]
  ready: string[]
  /** People who have read the morning paper or the verdict and want to move on. */
  next: string[]
  /** Today's nominations: who each person points at, or no one. */
  votes: Record<string, string | null>
  accused: string | null
  /** What the accused said in their defence — kept in view while the town decides. */
  plea: string | null
  /** Today's judgement of the accused: guilty (true) or innocent (false). */
  judgement: Record<string, boolean>
  verdict: { target: string | null; guilty: number; innocent: number; role: Role | null; jester: boolean } | null
  after: 'dawn' | 'verdict' | null
  winner: Winner | null
  history: CaseEvent[]
  ledger: Ledger[]
  /** Every night's suspicions, for the case file. */
  suspicions: { round: number; by: string; target: string }[]
  whispers: { by: string; text: string; at: number }[]
  ghosts: { by: string; text: string; at: number }[]
  /** The dead guess the ending; revealed in the case file. */
  predictions: Record<string, Winner>
  /** "Best bluff", voted by the table once the case is closed. */
  bluff: Record<string, string>
  /** Players asking to end the game, when the host isn't the one ending it. */
  endVotes: string[]
  speaker: string | null
  narration: Narration | null
  /** What has been said at the table, every day of the game — screens show today's; the AIs remember it all. */
  talk: Talk[]
  /** Every night's choice by every player — private: each AI recalls only its own, the Family its own team's. */
  nightLog: { round: number; by: string; target: string }[]
  thinking: Thinking[]
  lastReplyAt: number
  /** AIs answering AIs today — capped, so the table never talks itself in circles. */
  replies: number
}

/* ── timings ───────────────────────────────────────────────────────────── */

const DEAL_MS = 25_000
const REMATCH_DEAL_MS = 12_000
/** Everyone has turned their card: long enough to read it, and what it means — or tap Ready. */
const SEEN_GRACE_MS = 10_000
/** A page of the opening story: never shorter than this, however few its words. */
const PAGE_MIN_MS = 9_000
/** When everyone has acted, the phase closes this soon after, at a fixed time — time to see the last choice land. */
const CLOSING_MS = 4_000
/** Everyone has tapped "continue" on a story: a beat, then on. */
const CONTINUE_MS = 1_200
const NIGHTFALL_LEAD_MS = 5_000
const HUSH_MIN_MS = 2_400
const HUSH_MAX_MS = 6_500
const DAWN_MIN_MS = 12_000
const DEFENCE_MS = 25_000
const VERDICT_MIN_MS = 10_000
/** Characters a second — a relaxed reading pace, with the narrator speaking over it. */
const READ_RATE = 10
/** After the last word: a moment to take it in before the game moves. */
const READ_PAD_MS = 4_000

export const readMs = (text: string) => Math.round((text.length / READ_RATE) * 1000)

/* ── helpers ───────────────────────────────────────────────────────────── */

const seat = (state: Mafia, id: string) => state.players.find((p) => p.id === id)
const living = (state: Mafia) => state.players.filter((p) => p.alive)
const isFamily = (role: Role) => teamOf(role) === 'family'
const TITLE_WORDS = new Set(['mrs', 'miss', 'father'])

function schedule(state: Mafia, ctx: Ctx, ms: number) {
  ctx.clearSchedule()
  state.deadline = ctx.now() + ms
  ctx.schedule(ms, 'tick', { step: state.step })
}

function setNarration(state: Mafia, kind: NarrationKind, phase: Phase, facts: NarrationFacts, text: string, headline: string | null = null) {
  state.narration = { id: `${state.game}-${state.step}-${kind}`, kind, phase, text, headline, audio: null, ready: false, facts }
}

/** Close a phase soon — once. Changing your mind in the last seconds doesn't push the close back. */
function closeSoon(state: Mafia, ctx: Ctx, ms = CLOSING_MS) {
  if ((state.deadline ?? 0) - ctx.now() <= ms) return
  state.step += 1
  schedule(state, ctx, ms)
}

/* ── the AI players ────────────────────────────────────────────────────── */

const isBot = (p: Seat) => p.bot !== undefined
const TALKING = ['day', 'vote', 'defence', 'judgement']

/**
 * Give each AI its moments in this phase, at human-looking times: a pick in
 * the night, a couple of remarks in the day, a vote, a verdict. Called after
 * the phase's own clock is set (setting a clock clears every timer).
 */
function planBots(state: Mafia, ctx: Ctx) {
  if (state.paused !== null || state.deadline === null) return
  const bots = living(state).filter(isBot)
  if (!bots.length) return
  const span = Math.max(0, state.deadline - ctx.now())
  const between = (lo: number, hi: number) => Math.round(lo + ctx.random(Math.max(1, Math.round(Math.max(hi, lo + 1) - lo))))
  const plan = (ms: number, id: string, job: string) => ctx.schedule(Math.max(500, ms), 'bot', { step: state.step, id, job })
  /*
   * The day's remarks take turns: one voice at a time, evenly spread through
   * the first three quarters of the day with a little jitter — never two
   * lines landing together, never a burst and then silence.
   */
  if (state.phase === 'day') {
    const order = shuffle([...bots, ...bots], ctx)
    const from = 4_000
    const gap = Math.max(4_000, (span * 0.75 - from) / order.length)
    order.forEach((bot, i) => plan(from + i * gap + between(0, gap * 0.4), bot.id, 'talk'))
  }
  for (const bot of bots) {
    if (state.phase === 'night' && !state.picks[bot.id]) plan(between(2_500, Math.min(span - 7_000, 15_000)), bot.id, 'pick')
    if (state.phase === 'day' && !state.ready.includes(bot.id)) plan(between(span * 0.6, span * 0.9), bot.id, 'ready')
    /* Votes trickle in one by one, so each reason can be read. */
    if (state.phase === 'vote' && state.votes[bot.id] === undefined) plan(between(4_000, span - 8_000), bot.id, 'vote')
    if (state.phase === 'judgement' && bot.id !== state.accused && state.judgement[bot.id] === undefined) plan(between(4_000, span - 8_000), bot.id, 'judge')
    /* The accused speaks at once; they rest only once the town has had time to read it (see botDone). */
    if (state.phase === 'defence' && bot.id === state.accused) plan(1_200, bot.id, 'defence')
  }
}

/** The people at the table (not the AIs) — those still in the room, if we know who that is. */
function people(state: Mafia, ctx: Ctx) {
  const here = ctx.present?.()
  return state.players.filter((p) => !isBot(p) && (!here || here.includes(p.id)))
}

/**
 * What one AI knows — exactly what a person in its seat would: its own
 * screen's view, everything said at the table since the game began, the
 * public record of every night and day, the clock, and its own private
 * memory (its night choices, the Inspector's files, the Family's whispers).
 * Never the game itself.
 */
export function sightFor(state: Mafia, id: string, replyTo: string | null, now = Date.now()): Sight {
  const v = mafia.view(state, id) as {
    me: { role: Role; files: Sight['me']['files']; lastProtected: string | null; selfSaveUsed: boolean }
    players: { id: string; name: string; alive: boolean; role: Role | null; died: Sight['players'][number]['died']; bot: string | null }[]
    night: { family: { id: string; pick: string | null }[] | null } | null
    votes: Record<string, string | null>
    whispers: { by: string; text: string }[]
  }
  const me = seat(state, id)!
  const familyPicks: Record<string, string> = {}
  for (const f of v.night?.family ?? []) if (f.pick && f.id !== id) familyPicks[f.id] = f.pick
  /* The morning papers: who died, or that somebody was saved. The Family know who they went for; the Doctor who they kept alive. */
  const nights: Sight['nights'] = []
  for (const e of state.history) {
    if (e.kind === 'kill') nights.push({ round: e.round, victim: e.victim, saved: false, target: isFamily(me.role) ? e.victim : null })
    if (e.kind === 'saved') nights.push({ round: e.round, victim: null, saved: true, target: isFamily(me.role) || e.by === id ? e.target : null })
    if (e.kind === 'quiet') nights.push({ round: e.round, victim: null, saved: false, target: null })
  }
  const left = state.deadline !== null ? state.deadline - now : state.paused
  return {
    me: { id, role: v.me.role, persona: PERSONAS[me.bot ?? 0]!, files: v.me.files, lastProtected: v.me.lastProtected, selfSaveUsed: v.me.selfSaveUsed },
    phase: state.phase,
    round: state.round,
    msLeft: left !== null && left >= 0 && left < 3_600_000 ? left : null,
    /* Who is an AI is not on the list: to an AI, everyone at the table is simply a player. */
    players: v.players.map((p) => ({ id: p.id, name: p.name, alive: p.alive, role: p.role, died: p.died, cover: seat(state, p.id)?.cover })),
    ledger: state.ledger,
    nights,
    mine: state.nightLog.filter((n) => n.by === id).map((n) => ({ round: n.round, target: n.target })),
    votes: v.votes,
    accused: state.accused,
    plea: state.plea,
    familyPicks,
    whispers: v.whispers.map((w) => ({ by: w.by, text: w.text })),
    talk: state.talk.map((t) => ({ by: t.by, text: t.text, round: t.round })),
    replyTo,
  }
}

/** Which players a line speaks to, by any part of their name: "Rosie", "Lobo", "Father Pereira". */
function namedIn(text: string, among: Seat[]) {
  const words = new Set(text.toLowerCase().split(/[^\p{L}’']+/u))
  return among.filter((p) => p.name.toLowerCase().split(/\s+/).some((w) => w.length > 2 && !TITLE_WORDS.has(w) && words.has(w)))
}

/**
 * Somebody said something at the table; does an AI answer? Whoever was
 * named answers (if an AI — a person answers for themselves), and now and
 * then someone with an opinion chimes in when a person speaks. AIs answering
 * AIs is capped per day so the talk keeps room for everyone else.
 */
function invite(state: Mafia, speaker: string, text: string, ctx: Ctx) {
  if (state.phase !== 'day' && state.phase !== 'vote') return
  const fromAI = isBot(seat(state, speaker)!)
  if (fromAI && state.replies >= 10) return
  const bots = living(state).filter((p) => isBot(p) && p.id !== speaker && p.id !== state.accused)
  if (!bots.length) return
  const named = namedIn(text, bots)
  const who = named.length
    ? named[ctx.random(named.length)]
    : !fromAI && ctx.now() - state.lastReplyAt > 10_000 && ctx.random(2) === 0
      ? bots[ctx.random(bots.length)]
      : undefined
  if (!who || ctx.now() - state.lastReplyAt < 4_000) return
  state.lastReplyAt = ctx.now()
  if (fromAI) state.replies += 1
  ctx.schedule(1_500 + ctx.random(2_000), 'bot', { step: state.step, id: who.id, job: 'talk', replyTo: speaker })
}

function hear(state: Mafia, by: string, text: string, kind: Talk['kind'], ctx: Ctx) {
  state.talk = [...state.talk, { by, text, at: ctx.now(), kind, round: state.round }].slice(-200)
}

/** The Family win when they can no longer be outvoted; the town when the Family is gone. */
export function winnerOf(state: Pick<Mafia, 'players'>): Winner | null {
  const alive = state.players.filter((p) => p.alive)
  const family = alive.filter((p) => isFamily(p.role)).length
  if (family === 0) return 'town'
  if (family >= alive.length - family) return 'family'
  return null
}

/** The host, or — if the host has left the room — whoever is asking, so the game is never stranded. */
function hostFor(state: Mafia, by: string, ctx: Ctx) {
  const here = ctx.present?.()
  if (here && !here.includes(state.host) && state.players.some((p) => p.id === by)) return by
  return state.host
}

/* ── phases ────────────────────────────────────────────────────────────── */

export type StoryKey = 'city' | 'cast' | 'family' | 'town' | 'days'

const COUNT = ['No one', 'One', 'Two', 'Three', 'Four', 'Five']

/**
 * The opening: the city, the people at the table, the Family among them,
 * what the town can do about it, and how a day goes. The rules, told as the
 * story — so nobody reaches the first night wondering what is going on.
 */
export function storyPages(state: Pick<Mafia, 'players'>): { key: StoryKey; text: string }[] {
  const n = state.players.length
  const family = state.players.filter((p) => isFamily(p.role)).length
  const has = (role: Role) => state.players.some((p) => p.role === role)
  const doctors = state.players.filter((p) => p.role === 'doctor').length
  const detectives = state.players.filter((p) => p.role === 'detective').length
  return [
    {
      key: 'city',
      text: 'Bombay, nineteen fifty-six. The monsoon has not stopped for a week. Every night this month somebody in the neighbourhood has gone missing, and every morning another body turns up at the docks. The police shrug. Everyone whispers the same name — the Family.',
    },
    {
      key: 'cast',
      text: `Tonight, ${n} regulars have locked themselves inside the Irani café on the corner, with sweet chai and one flickering lamp. Look around the table. These are your neighbours — and your suspects.`,
    },
    {
      key: 'family',
      text:
        family === 1
          ? 'One of them secretly works for the Family. Every night, while the town sleeps, the Family choose one person at this table to kill. By morning, that person is gone.'
          : `${COUNT[family] ?? family} of them secretly work for the Family, and they know each other. Every night, while the town sleeps, they choose one person at this table to kill. By morning, that person is gone.`,
    },
    {
      key: 'town',
      text: [
        'Everyone else is the town — and the town is not helpless.',
        doctors === 1 ? 'The Doctor can save one life each night.' : doctors > 1 ? `${COUNT[doctors]} Doctors can each save a life each night.` : 'There is no Doctor tonight — nobody to save you.',
        detectives === 1 ? 'The Inspector can secretly check one person each night.' : detectives > 1 ? `${COUNT[detectives]} Inspectors share one case file, each checking somebody a night.` : '',
        'The rest have their eyes, their ears, and their vote.',
        has('godfather') ? 'Beware: the Godfather looks innocent to the Inspector.' : '',
        has('jester') ? 'And somewhere at this table sits a Jester, who wins only if the town hangs them.' : '',
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      key: 'days',
      text: 'Each morning the paper names the dead. Then the town argues, names a suspect, hears their defence, and votes: guilty or innocent. Hang every member of the Family and the town wins. If the Family ever equal the town, Bombay is theirs.',
    },
  ]
}

function showPage(state: Mafia, page: number, ctx: Ctx) {
  const text = storyPages(state)[page]!.text
  state.phase = 'prologue'
  state.step += 1
  state.page = page
  state.next = []
  setNarration(state, 'prologue', 'prologue', {}, text)
  schedule(state, ctx, Math.max(PAGE_MIN_MS, readMs(text) + READ_PAD_MS))
  return state
}

function enterDeal(state: Mafia, ctx: Ctx) {
  state.phase = 'deal'
  state.step += 1
  state.next = []
  setNarration(state, 'intro', 'deal', {}, state.options.rematch ? REMATCH_INTRO : state.options.story ? STORY_DEAL : INTRO)
  schedule(state, ctx, state.options.rematch ? REMATCH_DEAL_MS : DEAL_MS)
  return state
}

function enterNight(state: Mafia, ctx: Ctx) {
  state.phase = 'night'
  state.step += 1
  state.round += 1
  state.picks = {}
  state.dawn = null
  state.ready = []
  state.votes = {}
  state.accused = null
  state.plea = null
  state.replies = 0
  state.judgement = {}
  state.verdict = null
  state.thinking = []
  const line = NIGHTFALL[(state.round - 1) % NIGHTFALL.length]!
  setNarration(state, 'nightfall', 'night', { round: state.round }, line)
  schedule(state, ctx, state.options.nightSeconds * 1000 + NIGHTFALL_LEAD_MS)
  planBots(state, ctx)
  return state
}

/** The Family's choice: the Godfather's word if he gave one, else the most-picked, a coin for a tie. */
export function familyChoice(state: Mafia, ctx: Pick<Ctx, 'random'>): string | null {
  const family = living(state).filter((p) => isFamily(p.role))
  const boss = family.find((p) => p.role === 'godfather' && state.picks[p.id])
  if (boss) return state.picks[boss.id]!
  const counts = new Map<string, number>()
  for (const member of family) {
    const target = state.picks[member.id]
    if (target) counts.set(target, (counts.get(target) ?? 0) + 1)
  }
  if (!counts.size) return null
  const top = Math.max(...counts.values())
  const tied = [...counts.entries()].filter(([, n]) => n === top).map(([id]) => id)
  return tied.length === 1 ? tied[0]! : tied[ctx.random(tied.length)]!
}

function resolveNight(state: Mafia, ctx: Ctx) {
  const target = familyChoice(state, ctx)
  /* Every Doctor keeps their own patient alive. */
  const patients: Record<string, string> = {}
  for (const doctor of living(state).filter((p) => p.role === 'doctor')) {
    const patient = state.picks[doctor.id]
    if (!patient) continue
    patients[doctor.id] = patient
    if (patient === doctor.id && !state.selfSaved.includes(doctor.id)) state.selfSaved.push(doctor.id)
  }
  state.patients = patients

  /* Every Inspector opens a file; with two, they share the police file. */
  for (const detective of living(state).filter((p) => p.role === 'detective')) {
    const filed = state.picks[detective.id]
    if (!filed) continue
    /* The Godfather's papers are in order. */
    const family = seat(state, filed)!.role === 'mafia'
    state.files.push({ round: state.round, target: filed, family })
    state.history.push({ round: state.round, kind: 'file', by: detective.id, target: filed, family })
  }
  for (const player of living(state)) {
    const pick = state.picks[player.id]
    if (pick) state.nightLog.push({ round: state.round, by: player.id, target: pick })
  }
  for (const player of living(state)) {
    if (isFamily(player.role) || player.role === 'doctor' || player.role === 'detective') continue
    const suspect = state.picks[player.id]
    if (suspect) state.suspicions.push({ round: state.round, by: player.id, target: suspect })
  }

  const saver = target ? Object.keys(patients).find((doctor) => patients[doctor] === target) : undefined
  const saved = !!saver
  if (target && !saved) {
    const victim = seat(state, target)!
    victim.alive = false
    victim.died = { round: state.round, how: 'killed' }
    state.history.push({ round: state.round, kind: 'kill', victim: target })
  } else if (target && saved) {
    state.history.push({ round: state.round, kind: 'saved', target, by: saver! })
  } else {
    state.history.push({ round: state.round, kind: 'quiet' })
  }
  state.dawn = { victim: target && !saved ? target : null, saved }

  const victim = state.dawn.victim ? seat(state, state.dawn.victim)! : null
  const facts: NarrationFacts = {
    round: state.round,
    victim: victim?.name ?? null,
    victimRole: victim && state.options.reveal ? ROLE_INFO[victim.role].title : null,
    saved,
    alive: living(state).length,
  }
  const fallback = victim
    ? `${first(victim.name)} is dead. They found the body at Dock 9 before sunrise, and the Family left no fingerprints.`
    : saved
      ? 'Nobody died. Somebody came for a soul last night — and somebody else got there first.'
      : 'Nobody died. A strange, quiet night. The Family is patient.'
  const headline = victim ? `${first(victim.name).toUpperCase()} FOUND DEAD AT DOCK 9` : saved ? 'MIRACLE ON MALABAR HILL' : 'A NIGHT WITHOUT BLOOD'
  state.phase = 'hush'
  state.step += 1
  state.after = 'dawn'
  setNarration(state, 'dawn', 'dawn', facts, fallback, headline)
  schedule(state, ctx, HUSH_MAX_MS)
  state.deadline = ctx.now() + HUSH_MIN_MS
  return state
}

function enterDawn(state: Mafia, ctx: Ctx) {
  state.phase = 'dawn'
  state.step += 1
  state.after = null
  state.next = []
  schedule(state, ctx, Math.max(DAWN_MIN_MS, readMs(state.narration?.text ?? '') + READ_PAD_MS))
  return state
}

function enterDay(state: Mafia, ctx: Ctx) {
  const winner = winnerOf(state)
  if (winner) return enterOver(state, winner, ctx)
  state.phase = 'day'
  state.step += 1
  state.ready = []
  state.narration = null
  schedule(state, ctx, state.options.daySeconds * 1000)
  planBots(state, ctx)
  return state
}

function enterVote(state: Mafia, ctx: Ctx) {
  state.phase = 'vote'
  state.step += 1
  state.votes = {}
  setNarration(state, 'vote', 'vote', { round: state.round }, 'The town gathers under the clock tower. Name the one you suspect.')
  schedule(state, ctx, state.options.voteSeconds * 1000)
  planBots(state, ctx)
  return state
}

/** Most nominations takes it — if it beats "no one". A tie, and nobody stands accused. */
export function tally(state: Pick<Mafia, 'votes' | 'players'>): { target: string | null; votes: number } {
  const counts = new Map<string, number>()
  let none = 0
  for (const voter of state.players.filter((p) => p.alive)) {
    const vote = state.votes[voter.id]
    if (vote === undefined) continue
    if (vote === null) none += 1
    else counts.set(vote, (counts.get(vote) ?? 0) + 1)
  }
  if (!counts.size) return { target: null, votes: 0 }
  const top = Math.max(...counts.values())
  const leaders = [...counts.entries()].filter(([, n]) => n === top)
  if (leaders.length > 1 || top <= none) return { target: null, votes: top }
  return { target: leaders[0]![0], votes: top }
}

/** The nomination is in: the accused gets their defence — or nobody is named and the town goes home. */
function resolveNomination(state: Mafia, ctx: Ctx) {
  const { target } = tally(state)
  state.step += 1
  if (target) {
    const accused = seat(state, target)!
    state.accused = target
    state.phase = 'defence'
    setNarration(state, 'defence', 'defence', {}, `${first(accused.name)}, the town points at you. The floor is yours — make it count.`)
    schedule(state, ctx, DEFENCE_MS)
    planBots(state, ctx)
    return state
  }
  state.ledger.push({ round: state.round, nominations: { ...state.votes }, accused: null, judgement: {}, outcome: 'nobody' })
  state.verdict = { target: null, guilty: 0, innocent: 0, role: null, jester: false }
  state.history.push({ round: state.round, kind: 'spared' })
  state.phase = 'hush'
  state.after = 'verdict'
  setNarration(state, 'spared', 'verdict', { round: state.round }, SPARED[(state.round - 1) % SPARED.length]!)
  schedule(state, ctx, HUSH_MAX_MS)
  state.deadline = ctx.now() + HUSH_MIN_MS
  return state
}

function enterJudgement(state: Mafia, ctx: Ctx) {
  state.phase = 'judgement'
  state.step += 1
  state.judgement = {}
  setNarration(state, 'judgement', 'judgement', {}, 'You have heard the defence. Guilty, or innocent? Decide.')
  schedule(state, ctx, state.options.voteSeconds * 1000)
  planBots(state, ctx)
  return state
}

/** Hanged if more say guilty than innocent; a tie, and the accused walks free. */
export function judge(state: Pick<Mafia, 'judgement'>) {
  const values = Object.values(state.judgement)
  const guilty = values.filter(Boolean).length
  const innocent = values.length - guilty
  return { guilty, innocent, hanged: guilty > innocent }
}

function resolveJudgement(state: Mafia, ctx: Ctx) {
  const accused = seat(state, state.accused!)!
  const { guilty, innocent, hanged } = judge(state)
  state.step += 1
  state.ledger.push({ round: state.round, nominations: { ...state.votes }, accused: accused.id, judgement: { ...state.judgement }, outcome: hanged ? 'hanged' : 'acquitted' })
  const jester = hanged && accused.role === 'jester'
  state.verdict = { target: accused.id, guilty, innocent, role: hanged ? accused.role : null, jester }
  if (hanged) {
    setNarration(
      state,
      'verdict',
      'verdict',
      {
        round: state.round,
        victim: accused.name,
        victimRole: state.options.reveal || jester ? ROLE_INFO[accused.role].title : null,
        votes: guilty,
        jester,
        wasFamily: isFamily(accused.role),
      },
      jester
        ? `${first(accused.name)} hangs — and is laughing. The Jester got exactly what they wanted.`
        : `${first(accused.name)} is hanged, ${guilty} to ${innocent}. The crowd at Crawford Market goes quiet.`,
    )
  } else {
    state.history.push({ round: state.round, kind: 'acquitted', target: accused.id, guilty, innocent })
    setNarration(state, 'acquitted', 'verdict', { round: state.round, victim: accused.name, votes: innocent }, `${first(accused.name)} walks free, ${innocent} to ${guilty}. The defence held — this time.`)
  }
  state.phase = 'hush'
  state.after = 'verdict'
  schedule(state, ctx, HUSH_MAX_MS)
  state.deadline = ctx.now() + HUSH_MIN_MS
  return state
}

function enterVerdict(state: Mafia, ctx: Ctx) {
  if (state.verdict?.target && state.verdict.role) {
    const condemned = seat(state, state.verdict.target)!
    condemned.alive = false
    condemned.died = { round: state.round, how: 'voted' }
    state.history.push({ round: state.round, kind: 'hanged', target: condemned.id, guilty: state.verdict.guilty, innocent: state.verdict.innocent })
  }
  state.phase = 'verdict'
  state.step += 1
  state.after = null
  state.next = []
  schedule(state, ctx, Math.max(VERDICT_MIN_MS, readMs(state.narration?.text ?? '') + READ_PAD_MS))
  return state
}

function afterVerdict(state: Mafia, ctx: Ctx) {
  if (state.verdict?.jester) return enterOver(state, 'jester', ctx)
  const winner = winnerOf(state)
  if (winner) return enterOver(state, winner, ctx)
  return enterNight(state, ctx)
}

function enterOver(state: Mafia, winner: Winner | null, ctx: Ctx) {
  ctx.clearSchedule()
  state.phase = 'over'
  state.step += 1
  state.deadline = null
  state.paused = null
  state.winner = winner
  const family = state.players.filter((p) => isFamily(p.role)).map((p) => p.name)
  setNarration(
    state,
    'epilogue',
    'over',
    { round: state.round, winner, familyNames: family, survivors: living(state).map((p) => p.name) },
    winner === 'town'
      ? 'The Family is finished. The rain eases over Bombay, and for one night, the city sleeps without fear.'
      : winner === 'family'
        ? 'By morning the city belongs to the Family. Nobody saw anything. Nobody ever does.'
        : winner === 'jester'
          ? 'They hanged a fool, and the fool won. Bombay will be laughing about this one for years.'
          : 'The case is closed before it is solved. Some files stay open forever.',
  )
  return state
}

/* ── authored lines ────────────────────────────────────────────────────── */

const NIGHTFALL = [
  'Night falls on Bombay. The rain comes down on Marine Drive, the jazz dies in the clubs of Colaba — and somewhere in the dark, the Family wakes. Close your eyes, citizens.',
  'The street lamps flicker. The last tram rattles home. Lock your doors, Bombay — the Family is out tonight.',
  'Another night. Another storm off the Arabian Sea. Somebody in this town will not see the morning.',
  'Midnight. The docks are quiet, the Irani cafés are shut, and the Family is choosing. Sleep, if you can.',
]

const SPARED = [
  'No one stands accused. The town argues itself hoarse, and somewhere in the rain, a killer smiles.',
  'The town cannot agree on a name. Everyone goes home. Not everyone will wake up.',
]

const INTRO =
  'Bombay, nineteen fifty-six. The monsoon has not stopped for a week, and neither have the killings. Among you sits the Family. Look at your card. Tell no one.'
const REMATCH_INTRO = 'Another hand, another night in Bombay. New cards. Trust nobody.'
const STORY_DEAL = 'The cards come round the table, face down. Turn yours over — and tell no one what it says.'

/** Who the people at the table are in the story; the AIs bring their own. */
const COVERS = [
  'a young lawyer from the High Court',
  'a schoolteacher from Girgaum',
  'a stranger just off the Frontier Mail',
  'a clerk at the Port Trust',
  'a nurse at J.J. Hospital',
  'a sailor on shore leave',
  'a typist at the Times of India',
  'a college student mad about cricket',
  'a music teacher from Dadar',
  'a photographer for the film magazines',
  'a bank cashier from Fort',
  'a young doctor’s assistant from Byculla',
]

/* ── the game ──────────────────────────────────────────────────────────── */

/**
 * Until the first morning, a seat can still be taken: an AI's (its card and
 * all), or — during the story, before anyone has seen a card — a new one.
 * The first night is included because that is exactly when a phone that
 * dropped its connection at the deal comes back.
 */
function canJoin(state: Mafia) {
  const early = state.phase === 'prologue' || state.phase === 'deal' || (state.phase === 'night' && state.round === 1)
  if (!early) return false
  if (state.players.some(isBot)) return true
  return state.phase === 'prologue' && state.players.length < MAX_PLAYERS
}

const SECONDS = { night: [30, 45, 60], day: [120, 180, 300], vote: [30, 45, 60] }
const pickFrom = (allowed: number[], raw: unknown, fallback: number) => (allowed.includes(raw as number) ? (raw as number) : fallback)
const countFrom = (raw: unknown) => (Number.isInteger(raw) && (raw as number) >= 0 && (raw as number) <= MAX_PLAYERS ? (raw as number) : null)
const cleanText = (raw: unknown) => (typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim().slice(0, 240) : '')
const WINNERS: Winner[] = ['town', 'family', 'jester']
/** Moves that are part of play — frozen while the host has the game paused. */
const PLAY = new Set(['seen', 'pick', 'ready', 'vote', 'done', 'judge', 'say', 'next', 'skip'])

/** The slow, paid services this game leans on — swapped for stand-ins in tests. */
export const services = { narrate, think }

/** In-flight narration, so a state published twice is narrated once. */
const asked = new Set<string>()

export const mafia: GameDef<Mafia, Options> = {
  id: 'mafia',
  label: 'Mafia',
  minPlayers: MIN_PLAYERS,
  maxPlayers: MAX_PLAYERS,
  minPeople: (options) => Math.max(1, MIN_PLAYERS - options.bots),

  options(raw) {
    const body = (raw ?? {}) as Record<string, unknown>
    return {
      nightSeconds: pickFrom(SECONDS.night, body.nightSeconds, 45),
      daySeconds: pickFrom(SECONDS.day, body.daySeconds, 180),
      voteSeconds: pickFrom(SECONDS.vote, body.voteSeconds, 45),
      reveal: body.reveal !== false,
      godfather: body.godfather !== false,
      jester: body.jester === true,
      together: body.together === true,
      rematch: body.rematch === true,
      /* The host's own deal; null keeps the recommended count. Held to a winnable game at deal time. */
      family: countFrom(body.family),
      doctors: countFrom(body.doctors),
      detectives: countFrom(body.detectives),
      /* A first game opens with the story; a rematch goes straight to the cards. */
      story: body.story !== false && body.rematch !== true,
      bots: Number.isInteger(body.bots) ? Math.min(MAX_PLAYERS - 1, Math.max(0, body.bots as number)) : 0,
    }
  },

  start(people, options, ctx) {
    /* The AI regulars take the empty chairs. */
    const cast = shuffle(PERSONAS.map((_, i) => i), ctx).slice(0, Math.max(0, Math.min(options.bots, MAX_PLAYERS - people.length)))
    const covers = shuffle(COVERS, ctx)
    const players: (Player & { bot?: number; cover: string })[] = [
      ...people.map((p, i) => ({ ...p, cover: covers[i % covers.length]! })),
      ...cast.map((persona, i) => ({ id: `ai-${i + 1}`, name: PERSONAS[persona]!.name, bot: persona, cover: PERSONAS[persona]!.blurb })),
    ]
    const roles = shuffle(roleSet(players.length, options), ctx)
    const state: Mafia = {
      game: `${ctx.now().toString(36)}${ctx.random(1_000_000).toString(36)}`,
      phase: 'deal',
      step: 1,
      round: 0,
      page: 0,
      host: players[0]!.id,
      options,
      players: players.map((p, i) => ({ ...p, role: roles[i]!, alive: true, presence: options.together ? 'table' : 'online' })),
      deadline: null,
      paused: null,
      seen: players.filter((p) => p.bot !== undefined).map((p) => p.id),
      picks: {},
      patients: {},
      selfSaved: [],
      dawn: null,
      files: [],
      ready: [],
      next: [],
      votes: {},
      accused: null,
      plea: null,
      judgement: {},
      verdict: null,
      after: null,
      winner: null,
      history: [],
      ledger: [],
      suspicions: [],
      whispers: [],
      ghosts: [],
      predictions: {},
      bluff: {},
      endVotes: [],
      speaker: null,
      narration: null,
      talk: [],
      nightLog: [],
      thinking: [],
      lastReplyAt: 0,
      replies: 0,
    }
    return options.story ? showPage(state, 0, ctx) : enterDeal(state, ctx)
  },

  act(prev, by, action, payload, ctx) {
    /* Server actions: timers and narration. */
    if (by === null) {
      if (action === 'narrate') {
        const n = prev.narration
        if (!n || n.id !== payload.id) return prev
        const state: Mafia = structuredClone(prev)
        const narration = state.narration!
        if (typeof payload.text === 'string' && payload.text) narration.text = payload.text
        if (typeof payload.headline === 'string' && payload.headline) narration.headline = payload.headline
        if (typeof payload.audio === 'string') narration.audio = payload.audio
        narration.ready = true
        /* The hush ends as soon as the story is ready, but never before the beat it deserves. */
        if (state.phase === 'hush' && state.paused === null) {
          const holdFor = Math.max(0, (state.deadline ?? 0) - ctx.now())
          if (holdFor > 0) {
            state.step += 1
            ctx.clearSchedule()
            ctx.schedule(holdFor, 'tick', { step: state.step })
            return state
          }
          return state.after === 'verdict' ? enterVerdict(state, ctx) : enterDawn(state, ctx)
        }
        /* A late story still gets its full reading. */
        if ((state.phase === 'prologue' || state.phase === 'dawn' || state.phase === 'verdict') && state.deadline !== null && state.paused === null) {
          const need = ctx.now() + readMs(narration.text) + READ_PAD_MS
          if (need > state.deadline) schedule(state, ctx, need - ctx.now())
        }
        return state
      }

      /* An AI's moment has come: a rule-based move now, or a thought for Luna. */
      if (action === 'bot') {
        if (payload.step !== prev.step || prev.paused !== null) return prev
        const bot = typeof payload.id === 'string' ? seat(prev, payload.id) : undefined
        if (!bot || !bot.alive || !isBot(bot)) return prev
        const as = { id: bot.id, name: bot.name }
        const job = payload.job
        if (job === 'pick') {
          const target = nightPick(sightFor(prev, bot.id, null), ctx.random)
          if (!target) return prev
          const next = mafia.act(prev, as, 'pick', { target }, ctx)
          if (isError(next)) return prev
          if (isFamily(bot.role) && living(next).filter((p) => isFamily(p.role)).length > 1) {
            next.whispers = [...next.whispers, { by: bot.id, text: `I’m marking ${first(seat(next, target)!.name)}.`, at: ctx.now() }].slice(-40)
          }
          return next
        }
        if (job === 'ready') {
          if (prev.phase !== 'day' || prev.ready.includes(bot.id)) return prev
          const next = mafia.act(prev, as, 'ready', {}, ctx)
          return isError(next) ? prev : next
        }
        if (job === 'rest') {
          const next = mafia.act(prev, as, 'done', {}, ctx)
          return isError(next) ? prev : next
        }
        if (job !== 'talk' && job !== 'vote' && job !== 'judge' && job !== 'defence') return prev
        const state: Mafia = structuredClone(prev)
        state.thinking.push({ key: `${state.game}-${state.step}-${bot.id}-${job}-${ctx.now()}`, id: bot.id, job, replyTo: typeof payload.replyTo === 'string' ? payload.replyTo : null })
        return state
      }

      /* An AI has made up its mind. */
      if (action === 'botDone') {
        const thought = prev.thinking.find((t) => t.key === payload.key)
        if (!thought) return prev
        let state: Mafia = structuredClone(prev)
        state.thinking = state.thinking.filter((t) => t.key !== thought.key)
        const bot = seat(state, thought.id)
        const when: Record<Job, Phase[]> = { talk: ['day', 'vote', 'defence', 'judgement'], vote: ['vote'], judge: ['judgement'], defence: ['defence'] }
        if (!bot || !bot.alive || !when[thought.job].includes(state.phase)) return state
        const as = { id: bot.id, name: bot.name }
        if (thought.job === 'vote') {
          const next = mafia.act(state, as, 'vote', { target: typeof payload.target === 'string' ? payload.target : null }, ctx)
          if (!isError(next)) state = next
        }
        if (thought.job === 'judge' && typeof payload.guilty === 'boolean') {
          const next = mafia.act(state, as, 'judge', { guilty: payload.guilty }, ctx)
          if (!isError(next)) state = next
        }
        const said = cleanText(payload.say)
        if (said) hear(state, bot.id, said, 'bot', ctx)
        if (said && thought.job === 'defence') state.plea = said
        /* The AIs talk to each other as they talk to anyone: name someone, and they may answer. */
        if (said && thought.job === 'talk') invite(state, bot.id, said, ctx)
        /* An AI rests its case once the town has had time to read it — not on a fixed clock. */
        if (thought.job === 'defence' && state.paused === null && state.deadline !== null) {
          const rest = Math.max(8_000, readMs(said) + READ_PAD_MS)
          if (state.deadline - ctx.now() > rest + 2_000) ctx.schedule(rest, 'bot', { step: state.step, id: bot.id, job: 'rest' })
        }
        return state
      }

      if (action !== 'tick' || payload.step !== prev.step || prev.paused !== null) return prev
      const state: Mafia = structuredClone(prev)
      switch (state.phase) {
        case 'prologue':
          return state.page + 1 < storyPages(state).length ? showPage(state, state.page + 1, ctx) : enterDeal(state, ctx)
        case 'deal':
          return enterNight(state, ctx)
        case 'night':
          return resolveNight(state, ctx)
        case 'hush':
          return state.after === 'verdict' ? enterVerdict(state, ctx) : enterDawn(state, ctx)
        case 'dawn':
          return enterDay(state, ctx)
        case 'day':
          return enterVote(state, ctx)
        case 'vote':
          return resolveNomination(state, ctx)
        case 'defence':
          return enterJudgement(state, ctx)
        case 'judgement':
          return resolveJudgement(state, ctx)
        case 'verdict':
          return afterVerdict(state, ctx)
        default:
          return prev
      }
    }

    const me = seat(prev, by.id)
    if (!me) return { error: 'Join the next game to play' }

    /* After the case closes, only the honours are still open. */
    if (prev.phase === 'over') {
      if (action !== 'bluff') return prev
      const target = typeof payload.target === 'string' ? seat(prev, payload.target) : undefined
      if (!target || target.id === me.id) return { error: 'Pick someone else' }
      const state: Mafia = structuredClone(prev)
      state.bluff[me.id] = target.id
      return state
    }

    if (prev.paused !== null && PLAY.has(action)) return { error: 'The game is paused' }

    switch (action) {
      case 'end': {
        const state: Mafia = structuredClone(prev)
        state.host = hostFor(state, by.id, ctx)
        if (by.id === state.host) return enterOver(state, null, ctx)
        /* Anyone else is asking: when most of the people (not the AIs) agree, the case is dropped. */
        if (!state.endVotes.includes(by.id)) state.endVotes.push(by.id)
        if (state.endVotes.length > state.players.filter((p) => !isBot(p)).length / 2) return enterOver(state, null, ctx)
        return state
      }

      case 'pause': {
        const host = hostFor(prev, by.id, ctx)
        if (by.id !== host) return { error: 'Only the host can pause' }
        if (prev.paused !== null || prev.deadline === null) return prev
        const state: Mafia = structuredClone(prev)
        state.host = host
        ctx.clearSchedule()
        state.paused = Math.max(1000, prev.deadline - ctx.now())
        state.deadline = null
        return state
      }
      case 'resume': {
        const host = hostFor(prev, by.id, ctx)
        if (by.id !== host) return { error: 'Only the host can resume' }
        if (prev.paused === null) return prev
        const state: Mafia = structuredClone(prev)
        state.host = host
        const left = state.paused!
        state.paused = null
        schedule(state, ctx, left)
        planBots(state, ctx)
        return state
      }

      case 'presence': {
        const mode = payload.mode === 'table' ? 'table' : payload.mode === 'online' ? 'online' : null
        if (!mode || me.presence === mode) return prev
        const state: Mafia = structuredClone(prev)
        seat(state, by.id)!.presence = mode
        return state
      }

      case 'seen': {
        if (prev.phase !== 'deal' || prev.seen.includes(by.id)) return prev
        const state: Mafia = structuredClone(prev)
        state.seen.push(by.id)
        /* Everyone has looked: a few seconds to take it in, then nightfall. */
        if (state.players.every((p) => state.seen.includes(p.id)) && (state.deadline ?? 0) - ctx.now() > SEEN_GRACE_MS) {
          state.step += 1
          schedule(state, ctx, SEEN_GRACE_MS)
        }
        return state
      }

      case 'whisper': {
        const text = cleanText(payload.text)
        if (!text || !me.alive || !isFamily(me.role)) return prev
        const state: Mafia = structuredClone(prev)
        state.whispers = [...state.whispers, { by: by.id, text, at: ctx.now() }].slice(-40)
        return state
      }
      case 'ghost': {
        const text = cleanText(payload.text)
        if (!text || me.alive) return prev
        const state: Mafia = structuredClone(prev)
        state.ghosts = [...state.ghosts, { by: by.id, text, at: ctx.now() }].slice(-40)
        return state
      }
      case 'predict': {
        const winner = payload.winner as Winner
        if (me.alive || !WINNERS.includes(winner)) return prev
        const state: Mafia = structuredClone(prev)
        state.predictions[by.id] = winner
        return state
      }

      case 'say': {
        const text = cleanText(payload.text)
        if (!text || !me.alive || isBot(me)) return prev
        if (!TALKING.includes(prev.phase)) return { error: 'The table is quiet at night' }
        const state: Mafia = structuredClone(prev)
        hear(state, by.id, text, payload.heard === true ? 'heard' : 'say', ctx)
        if (state.phase === 'defence' && by.id === state.accused) state.plea = state.plea ? `${state.plea} ${text}`.slice(-480) : text
        invite(state, by.id, text, ctx)
        return state
      }

      case 'pick': {
        if (prev.phase !== 'night') return { error: 'The night is over' }
        if (!me.alive) return { error: 'The dead keep their own counsel' }
        const target = typeof payload.target === 'string' ? seat(prev, payload.target) : undefined
        if (!target || !target.alive) return { error: 'Pick someone still standing' }
        if (isFamily(me.role) && isFamily(target.role)) return { error: 'Not one of our own' }
        if (me.role === 'doctor') {
          if (target.id === prev.patients[me.id]) return { error: 'Not the same patient two nights running' }
          if (target.id === me.id && prev.selfSaved.includes(me.id)) return { error: 'You have already saved yourself once' }
        } else if (target.id === me.id) {
          return { error: 'Pick someone else' }
        }
        const state: Mafia = structuredClone(prev)
        state.picks[by.id] = target.id
        /* The AIs in the Family follow a person's call. */
        if (isFamily(me.role) && !isBot(me)) for (const p of living(state)) if (isBot(p) && isFamily(p.role)) state.picks[p.id] = target.id
        const everyone = living(state).every((p) => state.picks[p.id])
        const family = living(state).filter((p) => isFamily(p.role))
        const agreed = family.some((p) => p.role === 'godfather') || new Set(family.map((p) => state.picks[p.id])).size === 1
        if (everyone && agreed) closeSoon(state, ctx)
        return state
      }

      case 'ready': {
        if (prev.phase !== 'day' || !me.alive) return prev
        const state: Mafia = structuredClone(prev)
        state.ready = state.ready.includes(by.id) ? state.ready.filter((id) => id !== by.id) : [...state.ready, by.id]
        /*
         * The AIs never hurry the people: the vote opens early only once most
         * of the living people are ready too. When they are, the AIs follow
         * within a few seconds.
         */
        const folk = living(state).filter((p) => !isBot(p))
        const folkReady = folk.filter((p) => state.ready.includes(p.id)).length
        const peopleAgree = folk.length === 0 || folkReady > folk.length / 2
        if (peopleAgree && state.ready.length > living(state).length / 2) return enterVote(state, ctx)
        if (peopleAgree && !isBot(me)) {
          for (const bot of living(state).filter((p) => isBot(p) && !state.ready.includes(p.id))) {
            ctx.schedule(1_500 + ctx.random(2_500), 'bot', { step: state.step, id: bot.id, job: 'ready' })
          }
        }
        return state
      }

      /* "Continue": a page of the story, a card read, a paper, a verdict. */
      case 'next': {
        if (!['prologue', 'deal', 'dawn', 'verdict'].includes(prev.phase) || prev.next.includes(by.id)) return prev
        if (prev.phase === 'deal' && !prev.seen.includes(by.id)) return { error: 'Turn your card over first' }
        const state: Mafia = structuredClone(prev)
        state.next.push(by.id)
        /* Everyone has read it: on with the game. */
        const allSeen = state.phase !== 'deal' || state.players.every((p) => state.seen.includes(p.id))
        if (allSeen && people(state, ctx).every((p) => state.next.includes(p.id))) closeSoon(state, ctx, CONTINUE_MS)
        return state
      }
      case 'skip': {
        if (prev.phase !== 'prologue') return prev
        if (by.id !== hostFor(prev, by.id, ctx)) return { error: 'Only the host can skip the story' }
        return enterDeal(structuredClone(prev), ctx)
      }

      case 'vote': {
        if (prev.phase !== 'vote') return { error: 'Nominations are closed' }
        if (!me.alive) return { error: 'The dead do not vote' }
        const target = payload.target === null ? null : typeof payload.target === 'string' ? seat(prev, payload.target) : undefined
        if (target === undefined) return { error: 'Pick someone, or no one' }
        if (target && (!target.alive || target.id === me.id)) return { error: 'Pick someone else' }
        const state: Mafia = structuredClone(prev)
        state.votes[by.id] = target ? target.id : null
        if (living(state).every((p) => state.votes[p.id] !== undefined)) closeSoon(state, ctx)
        return state
      }

      case 'done': {
        if (prev.phase !== 'defence' || prev.accused !== by.id) return prev
        return enterJudgement(structuredClone(prev), ctx)
      }

      case 'judge': {
        if (prev.phase !== 'judgement') return { error: 'Judgement is closed' }
        if (!me.alive) return { error: 'The dead do not vote' }
        if (by.id === prev.accused) return { error: 'You cannot judge yourself' }
        if (typeof payload.guilty !== 'boolean') return { error: 'Guilty or innocent?' }
        const state: Mafia = structuredClone(prev)
        state.judgement[by.id] = payload.guilty
        if (living(state).every((p) => p.id === state.accused || state.judgement[p.id] !== undefined)) closeSoon(state, ctx)
        return state
      }

      default:
        return { error: 'Not a move in this game' }
    }
  },

  /* Narration, written and voiced off the game's own clock. */
  after(roomId, state) {
    const work: Later[] = []
    const once = (key: string) => {
      if (asked.has(`${roomId}:${key}`)) return false
      asked.add(`${roomId}:${key}`)
      if (asked.size > 2_000) asked.delete(asked.values().next().value!)
      return true
    }
    const n = state.narration
    if (n && !n.ready && once(n.id)) {
      work.push(services.narrate(n.kind, n.facts, n.text, n.headline).then((line) => ({ action: 'narrate', payload: { id: n.id, ...line } })))
    }
    /* Every AI thinks for itself, at the same time as the others. */
    for (const thought of state.thinking) {
      if (!once(thought.key)) continue
      const sight = sightFor(state, thought.id, thought.replyTo)
      work.push(
        services.think(thought.job, sight, (max) => (max <= 1 ? 0 : randomInt(max))).then((answer) => ({
          action: 'botDone',
          payload: { key: thought.key, say: answer.say, target: answer.target ?? null, guilty: answer.guilty },
        })),
      )
    }
    return work.length ? work : null
  },

  view(state, viewer) {
    const me = seat(state, viewer)
    const over = state.phase === 'over'
    const ghost = !!me && !me.alive
    const family = !!me && isFamily(me.role)
    const players = state.players.map((p) => {
      const known =
        over ||
        p.id === viewer ||
        ghost ||
        (family && isFamily(p.role)) ||
        (!p.alive && (state.options.reveal || (p.died?.how === 'voted' && p.role === 'jester')))
      return {
        id: p.id,
        name: p.name,
        alive: p.alive,
        presence: p.presence,
        cover: p.cover,
        died: p.died ?? null,
        role: known ? p.role : null,
        bot: isBot(p) ? PERSONAS[p.bot!]!.blurb : null,
      }
    })
    const n = state.narration
    const narration = n && n.phase === state.phase ? { id: n.id, kind: n.kind, text: n.text, headline: n.headline, audio: n.audio, ready: n.ready } : null
    /* Nominations are public; tonight's choices are not. */
    const publicVotes = state.phase === 'vote' || state.phase === 'defence' || state.phase === 'judgement' || state.phase === 'verdict' || state.phase === 'hush'
    return {
      game: state.game,
      phase: state.phase,
      step: state.step,
      round: state.round,
      host: state.host,
      deadline: state.deadline,
      paused: state.paused,
      options: state.options,
      players,
      me: me
        ? {
            id: me.id,
            role: me.role,
            alive: me.alive,
            title: ROLE_INFO[me.role].title,
            line: ROLE_INFO[me.role].line,
            seen: state.seen.includes(viewer),
            pick: state.picks[viewer] ?? null,
            lastProtected: me.role === 'doctor' ? (state.patients[me.id] ?? null) : null,
            selfSaveUsed: me.role === 'doctor' ? state.selfSaved.includes(me.id) : false,
            files: me.role === 'detective' || ghost || over ? state.files : [],
            judged: state.judgement[viewer] ?? null,
            prediction: state.predictions[viewer] ?? null,
            bluff: state.bluff[viewer] ?? null,
            endVote: state.endVotes.includes(viewer),
          }
        : null,
      night:
        state.phase === 'night'
          ? {
              chosen: living(state).filter((p) => state.picks[p.id]).length,
              of: living(state).length,
              family: family || ghost ? living(state).filter((p) => isFamily(p.role)).map((p) => ({ id: p.id, pick: state.picks[p.id] ?? null })) : null,
            }
          : null,
      dawn: state.phase === 'dawn' || state.phase === 'hush' ? state.dawn : null,
      ready: state.phase === 'day' ? state.ready : [],
      next: ['prologue', 'deal', 'dawn', 'verdict'].includes(state.phase) ? state.next : [],
      /* For someone watching: whether there is still a seat for them. */
      joinable: !me && canJoin(state),
      story: state.phase === 'prologue' ? { key: storyPages(state)[state.page]!.key, at: state.page, of: storyPages(state).length } : null,
      votes: publicVotes ? state.votes : {},
      accused: state.accused,
      plea: state.phase === 'defence' || state.phase === 'judgement' ? state.plea : null,
      /* How the judgement is going: a count while it runs; names go in the notebook once it's decided. */
      judgement:
        state.phase === 'judgement'
          ? { done: Object.keys(state.judgement).length, of: living(state).filter((p) => p.id !== state.accused).length }
          : null,
      verdict:
        state.phase === 'verdict' || over
          ? state.verdict && {
              ...state.verdict,
              role: state.verdict.role && (state.options.reveal || state.verdict.jester || over || ghost) ? state.verdict.role : null,
              hanged: !!state.verdict.role,
            }
          : null,
      after: state.phase === 'hush' ? state.after : null,
      /* The town's notebook: every day's nominations and judgements, for everyone to argue over. */
      ledger: state.ledger,
      whispers: family || ghost || over ? state.whispers : [],
      ghosts: ghost || over ? state.ghosts : [],
      endVotes: state.endVotes.length,
      /* What's said at the table is public; so is an AI pausing to think. */
      talk: state.talk.filter((t) => t.round === state.round),
      thinking: [...new Set(state.thinking.map((t) => t.id))],
      narration,
      winner: state.winner,
      history: over ? state.history : null,
      suspicions: over ? state.suspicions : null,
      predictions: over ? state.predictions : null,
      bluff: over ? state.bluff : null,
    }
  },

  /*
   * Somebody who should have been dealt in, arriving before the first night.
   *
   * They take an AI's chair — its card and all — so the table stays exactly
   * as balanced as it was dealt, and nobody's card changes but the AI's. With
   * no AI to stand up, they can still sit down during the story, before
   * anyone has seen a card, and the whole table is dealt again. After the
   * cards are read and the night begins, it is the next game.
   */
  join(prev, player, ctx) {
    if (!canJoin(prev) || prev.players.some((p) => p.id === player.id)) return null
    const state: Mafia = structuredClone(prev)
    const chairs = state.players.filter(isBot)
    const used = new Set(state.players.map((p) => p.cover))
    const cover = COVERS.find((c) => !used.has(c)) ?? COVERS[0]!
    if (chairs.length) {
      const chair = chairs[ctx.random(chairs.length)]!
      const from = chair.id
      chair.id = player.id
      chair.name = player.name
      chair.cover = cover
      chair.presence = state.options.together ? 'table' : 'online'
      delete chair.bot
      /* The AI never needed to look; the person does. */
      state.seen = state.seen.filter((id) => id !== from)
      /* Taking over mid-night: the AI's choice, if it made one, becomes theirs to keep or change. */
      if (state.picks[from]) {
        state.picks[player.id] = state.picks[from]!
        delete state.picks[from]
      }
      state.thinking = state.thinking.filter((t) => t.id !== from)
    } else {
      state.players.push({ ...player, role: 'villager', alive: true, presence: state.options.together ? 'table' : 'online', cover })
      const roles = shuffle(roleSet(state.players.length, state.options), ctx)
      state.players.forEach((p, i) => (p.role = roles[i]!))
    }
    /* Time to read the card they were just handed. */
    if (state.phase === 'deal' && (state.deadline ?? 0) - ctx.now() < SEEN_GRACE_MS * 2) {
      state.step += 1
      schedule(state, ctx, SEEN_GRACE_MS * 2)
    }
    return state
  },

  over(state) {
    if (state.phase !== 'over' || state.round === 0) return null
    return {
      summary: {
        winner: state.winner,
        rounds: state.round,
        players: state.players.map((p) => ({ name: p.name, role: p.role, alive: p.alive })),
      },
    }
  },
}
