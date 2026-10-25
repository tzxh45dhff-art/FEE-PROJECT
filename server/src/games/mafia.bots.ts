import * as azure from '../services/azure.service.js'
import { ROLE_INFO, teamOf, type Role } from './mafia.roles.js'

/**
 * The AI players of Mafia: Bombay regulars who take a seat when the table is
 * short.
 *
 * An AI knows exactly what a person in its seat would know — it is handed the
 * same filtered view a screen gets, never the game itself — so a citizen AI
 * genuinely has no idea who the Family are. The night is plain rules (free and
 * instant). The day is where Luna comes in: what to say, who to name, guilty
 * or not, each in the AI's own voice. If Luna is slow or away, the same
 * choices come from rules and a few lines of its own.
 */

export type Persona = { name: string; blurb: string; manner: string }

export const PERSONAS: Persona[] = [
  { name: 'Rosie D’Souza', blurb: 'jazz singer at a Colaba club', manner: 'warm and teasing; watches who looks away' },
  { name: 'Farokh Irani', blurb: 'runs the Irani café on the corner', manner: 'chatty and fatherly; loves a good rumour' },
  { name: 'Shankar Patil', blurb: 'foreman at the docks', manner: 'blunt, few words; distrusts smooth talkers' },
  { name: 'Mrs Lobo', blurb: 'landlady who knows every tenant', manner: 'sharp and gossipy; remembers exactly who said what' },
  { name: 'Vicky Khanna', blurb: 'fixer for a film studio', manner: 'smooth and charming; always making a deal' },
  { name: 'Abdul Karim', blurb: 'taxi driver who hears everything', manner: 'street-smart and jokey; quick to point a finger' },
  { name: 'Meenakshi Rao', blurb: 'crime reporter at the Herald', manner: 'logical; asks pointed questions' },
  { name: 'Father Pereira', blurb: 'parish priest from Bandra', manner: 'gentle; pleads for mercy, hard to read' },
  { name: 'Gopal Mistry', blurb: 'tailor on Abdul Rehman Street', manner: 'nervous and precise; notices small details' },
  { name: 'Lily Fernandes', blurb: 'telephone operator at the exchange', manner: 'quick and nosy; claims to have overheard things' },
  { name: 'Bashir Khan', blurb: 'retired boxer', manner: 'loud and loyal; trusts his gut' },
]

export type Job = 'talk' | 'vote' | 'judge' | 'defence'

/** What one AI can see — drawn from its own screen's view, plus the table talk. */
export type Sight = {
  me: { id: string; role: Role; persona: Persona; files: { round: number; target: string; family: boolean }[]; lastProtected: string | null; selfSaveUsed: boolean }
  phase: string
  round: number
  players: { id: string; name: string; alive: boolean; role: Role | null; died: { round: number; how: 'killed' | 'voted' } | null; bot: boolean }[]
  ledger: { round: number; nominations: Record<string, string | null>; accused: string | null; judgement: Record<string, boolean>; outcome: string }[]
  votes: Record<string, string | null>
  accused: string | null
  familyPicks: Record<string, string>
  talk: { by: string; text: string }[]
  /** Who just spoke to the table, when this is a reply. */
  replyTo?: string | null
}

export type Thought = { say: string | null; target?: string | null; guilty?: boolean }

const first = (name: string) => name.split(' ')[0] ?? name
const family = (role: Role | null) => !!role && teamOf(role) === 'family'
const pickOne = <T>(list: T[], random: (n: number) => number): T | undefined => list[random(list.length)]

/* ── rules: free, instant, and the fallback for everything ─────────────── */

/** How suspicious each living person looks to this AI, from what it can see. */
function suspicion(s: Sight, random: (n: number) => number) {
  const scores = new Map<string, number>()
  const others = s.players.filter((p) => p.alive && p.id !== s.me.id)
  for (const p of others) scores.set(p.id, random(3))
  for (const day of s.ledger) {
    for (const [voter, target] of Object.entries(day.nominations)) {
      if (target === s.me.id && scores.has(voter)) scores.set(voter, scores.get(voter)! + 2)
      if (target && scores.has(target)) scores.set(target, scores.get(target)! + 1)
    }
  }
  for (const file of s.me.files) {
    if (!scores.has(file.target)) continue
    scores.set(file.target, file.family ? 100 : -100)
  }
  /* The Family know their own, and point away from them. */
  if (family(s.me.role)) for (const p of others) if (family(p.role)) scores.set(p.id, -1000)
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
}

export function nightPick(s: Sight, random: (n: number) => number): string | null {
  const alive = s.players.filter((p) => p.alive)
  if (family(s.me.role)) {
    /* Go with the Family's call if someone has made one. */
    const called = Object.values(s.familyPicks)[0]
    if (called) return called
    return pickOne(alive.filter((p) => !family(p.role)), random)?.id ?? null
  }
  if (s.me.role === 'doctor') {
    const allowed = alive.filter((p) => p.id !== s.me.lastProtected && !(p.id === s.me.id && s.me.selfSaveUsed))
    /* Keep the loudest accuser of the Family breathing — or yourself, once. */
    const self = allowed.find((p) => p.id === s.me.id)
    if (self && random(3) === 0) return self.id
    return pickOne(allowed.filter((p) => p.id !== s.me.id), random)?.id ?? self?.id ?? null
  }
  if (s.me.role === 'detective') {
    const opened = new Set(s.me.files.map((f) => f.target))
    return pickOne(alive.filter((p) => p.id !== s.me.id && !opened.has(p.id)), random)?.id ?? pickOne(alive.filter((p) => p.id !== s.me.id), random)?.id ?? null
  }
  return suspicion(s, random)[0] ?? null
}

export function voteByRules(s: Sight, random: (n: number) => number): string | null {
  const ranked = suspicion(s, random)
  /* Join a bandwagon that is already rolling, unless it's rolling at a friend. */
  const counts = new Map<string, number>()
  for (const target of Object.values(s.votes)) if (target) counts.set(target, (counts.get(target) ?? 0) + 1)
  const wagon = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (wagon && wagon[0] !== s.me.id && ranked.indexOf(wagon[0]) < Math.max(2, ranked.length / 2)) return wagon[0]
  return ranked[0] ?? null
}

export function judgeByRules(s: Sight, random: (n: number) => number): boolean {
  const accused = s.players.find((p) => p.id === s.accused)
  if (!accused) return false
  if (family(s.me.role)) return !family(accused.role) && random(4) !== 0
  const file = s.me.files.find((f) => f.target === accused.id)
  if (file) return file.family
  return random(10) < 6
}

const LINES: Record<Job, string[]> = {
  talk: [
    'Somebody here is lying, and they are doing it well.',
    'I keep watching {x}. Too calm for a night like that.',
    'Before we point fingers — where was everyone last night?',
    'I’m not saying it’s {x}. I’m saying I wouldn’t turn my back on them.',
    'The Family always hides in the quiet ones.',
  ],
  vote: ['{x}. Call it a feeling.', 'My money is on {x}.', 'I name {x}, and I’ll sleep fine.'],
  judge: ['Guilty. I’ve heard enough.', 'Innocent — the story holds, for now.'],
  defence: [
    'You have the wrong person. I’ve lived in this city all my life — ask anyone on my street.',
    'Hang me and the Family laughs tonight. Look at who pushed my name first.',
  ],
}

export function lineByRules(job: Job, s: Sight, random: (n: number) => number, about?: string | null): string {
  const target = about ?? suspicion(s, random)[0]
  const name = first(s.players.find((p) => p.id === target)?.name ?? 'someone')
  /* Never the same line twice in a day — the table notices. */
  const said = new Set(s.talk.map((t) => t.text))
  const lines = LINES[job].map((line) => line.replace('{x}', name))
  return pickOne(lines.filter((line) => !said.has(line)), random) ?? pickOne(lines, random)!
}

/* ── Luna: the same choices, in character ─────────────────────────────── */

/* Talk can take its time; a vote has a clock running. */
const THINK_MS: Record<Job, number> = { talk: 7_000, defence: 6_000, vote: 5_000, judge: 5_000 }

function briefing(s: Sight): string {
  const nameOf = (id: string | null | undefined) => (id ? first(s.players.find((p) => p.id === id)?.name ?? 'someone') : 'no one')
  const me = s.me
  const lines = [
    `You are ${me.persona.name}, ${me.persona.blurb}, at a game of Mafia set in Bombay, 1956. Your manner: ${me.persona.manner}.`,
    `Your secret card: ${ROLE_INFO[me.role].title}. ${ROLE_INFO[me.role].line}`,
  ]
  if (family(me.role)) {
    const friends = s.players.filter((p) => family(p.role) && p.id !== me.id).map((p) => first(p.name))
    lines.push(`You are in the Family${friends.length ? ` with ${friends.join(', ')}` : ', alone'}. Never admit it. Protect your own, steer suspicion onto the town, lie when it helps.`)
  } else if (me.role === 'jester') {
    lines.push('You win only if the town hangs you. Be subtly suspicious, contradict yourself a little, but never say you are the Jester.')
  } else {
    lines.push('You are on the town’s side: find the Family and hang them.')
  }
  if (me.files.length) {
    lines.push(`Your private findings: ${me.files.map((f) => `night ${f.round}, ${nameOf(f.target)} ${f.family ? 'WORKS FOR THE FAMILY' : 'had no Family connection (the Godfather can still read clean)'}`).join('; ')}. Revealing these makes you a target — choose wisely.`)
  }
  const alive = s.players.filter((p) => p.alive && p.id !== me.id).map((p) => first(p.name))
  const dead = s.players.filter((p) => !p.alive).map((p) => `${first(p.name)} (${p.died?.how === 'voted' ? 'hanged' : 'murdered'}${p.role ? `, was ${ROLE_INFO[p.role].title}` : ''})`)
  lines.push(`Still alive besides you: ${alive.join(', ') || 'nobody'}.${dead.length ? ` Dead: ${dead.join(', ')}.` : ''}`)
  for (const day of s.ledger) {
    const named = Object.entries(day.nominations).map(([v, t]) => `${nameOf(v)}→${nameOf(t)}`).join(', ')
    lines.push(`Day ${day.round}: nominations ${named || 'none'}; ${day.accused ? `${nameOf(day.accused)} was ${day.outcome}` : 'nobody stood trial'}.`)
  }
  const today = Object.entries(s.votes).map(([v, t]) => `${nameOf(v)}→${nameOf(t)}`).join(', ')
  if (today) lines.push(`Nominations so far today: ${today}.`)
  if (s.talk.length) {
    lines.push('What has been said at the table today, oldest first:')
    for (const t of s.talk.slice(-14)) lines.push(`${nameOf(t.by)}: "${t.text}"`)
  }
  return lines.join('\n')
}

const ASK: Record<Job, (s: Sight) => string> = {
  talk: (s) =>
    `${s.replyTo ? `${first(s.players.find((p) => p.id === s.replyTo)?.name ?? 'Someone')} just spoke — respond to them. ` : ''}It is day ${s.round}. Say one thing to the table now: accuse, defend, question, or react. Under 150 characters, spoken, in character, first names only.
Answer as JSON: {"say": "..."}`,
  vote: (s) =>
    `Nominations are open. Choose who should stand trial, or nobody. Pick from these ids: ${s.players
      .filter((p) => p.alive && p.id !== s.me.id)
      .map((p) => `${p.id} (${first(p.name)})`)
      .join(', ')}.
Answer as JSON: {"target": "<id or null>", "say": "<your reason, under 110 characters>"}`,
  judge: (s) =>
    `${first(s.players.find((p) => p.id === s.accused)?.name ?? 'Someone')} is on trial and has made their defence. Guilty or innocent?
Answer as JSON: {"guilty": true or false, "say": "<one line, under 100 characters>"}`,
  defence: () =>
    `The town has put YOU on trial. Make your defence: two sentences, under 220 characters, spoken, in character.
Answer as JSON: {"say": "..."}`,
}

/** What this AI does now: Luna if it answers in time, rules if not. */
export async function think(job: Job, s: Sight, random: (n: number) => number): Promise<Thought> {
  const byRules = (): Thought =>
    job === 'vote'
      ? (() => {
          const target = voteByRules(s, random)
          return { target, say: target ? lineByRules('vote', s, random, target) : 'Not today. Not on what we have.' }
        })()
      : job === 'judge'
        ? (() => {
            const guilty = judgeByRules(s, random)
            return { guilty, say: LINES.judge[guilty ? 0 : 1]! }
          })()
        : { say: lineByRules(job, s, random) }
  if (!azure.configured()) return byRules()
  let failure = 'took too long'
  const answer = await Promise.race([
    azure
      .chatJson<{ say?: unknown; target?: unknown; guilty?: unknown }>(
        [
          {
            role: 'system',
            content:
              'You play one character at a party game of Mafia, Bombay 1956 noir. You speak like a real person at the table — short, natural, a little colourful, never gory, no emojis, no stage directions. You only answer with JSON.',
          },
          { role: 'user', content: `${briefing(s)}\n\n${ASK[job](s)}` },
        ],
        { temperature: 1, maxTokens: 160 },
      )
      .catch((cause: unknown) => {
        failure = cause instanceof Error ? cause.message : 'failed'
        return null
      }),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), THINK_MS[job])),
  ])
  if (!answer) {
    console.warn(`[mafia] ${s.me.persona.name} (${job}): Luna ${failure}; using rules`)
    return byRules()
  }
  const say = typeof answer.say === 'string' ? answer.say.replace(/\s+/g, ' ').trim().slice(0, 240) || null : null
  if (job === 'vote') {
    const ids = new Set(s.players.filter((p) => p.alive && p.id !== s.me.id).map((p) => p.id))
    const target = typeof answer.target === 'string' && ids.has(answer.target) ? answer.target : answer.target === null || answer.target === 'null' ? null : voteByRules(s, random)
    return { target, say }
  }
  if (job === 'judge') return { guilty: typeof answer.guilty === 'boolean' ? answer.guilty : judgeByRules(s, random), say }
  return { say: say ?? lineByRules(job, s, random) }
}
