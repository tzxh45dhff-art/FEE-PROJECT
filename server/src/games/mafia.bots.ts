import * as azure from '../services/azure.service.js'
import { ROLE_INFO, first, teamOf, type Role } from './mafia.roles.js'

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
  /** Time left on the current phase's clock. */
  msLeft?: number | null
  /** Everyone at the table — with nothing to say which of them are AIs. */
  players: { id: string; name: string; alive: boolean; role: Role | null; died: { round: number; how: 'killed' | 'voted' } | null; cover?: string }[]
  ledger: { round: number; nominations: Record<string, string | null>; accused: string | null; judgement: Record<string, boolean>; outcome: string }[]
  /** The morning papers: who died each night, or that somebody was saved — and, if this AI would know, who was targeted. */
  nights?: { round: number; victim: string | null; saved: boolean; target: string | null }[]
  /** This AI's own night choices. */
  mine?: { round: number; target: string }[]
  votes: Record<string, string | null>
  accused: string | null
  /** The accused's defence, in their words. */
  plea?: string | null
  familyPicks: Record<string, string>
  /** The Family's private chat — only a Family AI sees any. */
  whispers?: { by: string; text: string }[]
  /** Everything said at the table, oldest first; `round` is the day it was said. */
  talk: { by: string; text: string; round?: number }[]
  /** Who just spoke to the table, when this is a reply. */
  replyTo?: string | null
}

export type Thought = { say: string | null; target?: string | null; guilty?: boolean }

const family = (role: Role | null) => !!role && teamOf(role) === 'family'
const pickOne = <T>(list: T[], random: (n: number) => number): T | undefined => list[random(list.length)]

/* ── rules: free, instant, and the fallback for everything ─────────────── */

/** How suspicious each living person looks to this AI, from what it can see. */
function suspicion(s: Sight, random: (n: number) => number) {
  const scores = new Map<string, number>()
  const others = s.players.filter((p) => p.alive && p.id !== s.me.id)
  /* A hunch, with a fine-grained tie-break — never "whoever sits first", which was always the person who opened the table. */
  for (const p of others) scores.set(p.id, random(300) / 100)
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
    /* Anyone outside the Family, with an equal chance — an AI can't tell a person from another AI. */
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
  /* Even without Luna, the morning's news is on everyone's lips. */
  const dead = s.nights?.find((n) => n.round === s.round)?.victim
  const deadName = dead ? first(s.players.find((p) => p.id === dead)?.name ?? '') : ''
  const news =
    job === 'talk' && deadName
      ? [`${deadName} is dead, and somebody at this table knows exactly why.`, `They got ${deadName} last night. I want to know who wanted ${deadName} quiet.`]
      : job === 'talk' && s.nights?.find((n) => n.round === s.round)?.saved
        ? ['Nobody died last night — the Doctor got there first. The Family will try again.']
        : []
  const lines = [...news, ...LINES[job]].map((line) => line.replace('{x}', name))
  return pickOne(lines.filter((line) => !said.has(line)), random) ?? pickOne(lines, random)!
}

/* ── Luna: the same choices, in character ─────────────────────────────── */

/* Talk can take its time; a vote has a clock running. */
const THINK_MS: Record<Job, number> = { talk: 7_000, defence: 6_000, vote: 5_000, judge: 5_000 }

/**
 * How long a person would take to come out with this: a moment to think, then
 * the time to say it. Rules answer instantly and Luna sometimes in a blink —
 * either way the line waits until it would feel natural, so the AIs never fire
 * back faster than anyone could read the last thing said.
 */
export function composeMs(job: Job, say: string | null) {
  const words = say ? say.length : 0
  const cap = job === 'vote' || job === 'judge' ? 3_000 : 5_500
  return Math.min(cap, 1_800 + words * 28)
}

async function inTime<T extends Thought>(job: Job, started: number, thought: T): Promise<T> {
  const wait = started + composeMs(job, thought.say) - Date.now()
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  return thought
}

const NIGHT_VERB: Partial<Record<Role, string>> = { mafia: 'marked', godfather: 'marked', doctor: 'protected', detective: 'investigated', villager: 'suspected', jester: 'suspected' }

const PHASE_NOW: Record<string, (s: Sight, name: (id: string | null | undefined) => string) => string> = {
  day: (s) => `It is DAY ${s.round}: open discussion at the table. When it ends, the town nominates someone to stand trial.`,
  vote: (s) => `It is DAY ${s.round}, NOMINATIONS: everyone names who should stand trial (or no one). The most-named — if they beat "no one" — gets a 25-second defence, then a guilty/innocent vote.`,
  defence: (s, name) => `It is DAY ${s.round}, THE TRIAL: ${name(s.accused)} was nominated and is making their defence. Next the town votes guilty or innocent.`,
  judgement: (s, name) => `It is DAY ${s.round}, THE JUDGEMENT: the town is voting whether ${name(s.accused)} is guilty (hanged) or innocent (walks free). A tie means innocent.`,
}

const clockLine = (ms: number | null | undefined) =>
  ms === null || ms === undefined ? '' : ms >= 90_000 ? ` About ${Math.round(ms / 60_000)} minute${Math.round(ms / 60_000) === 1 ? '' : 's'} left on the clock.` : ` About ${Math.max(5, Math.round(ms / 5_000) * 5)} seconds left on the clock.`

/** Everything a person in this seat would have in their head right now, written out for Luna. */
export function briefing(s: Sight): string {
  const nameOf = (id: string | null | undefined) => (id === s.me.id ? 'you' : id ? first(s.players.find((p) => p.id === id)?.name ?? 'someone') : 'no one')
  const me = s.me
  const lines = [
    `You are ${me.persona.name}, ${me.persona.blurb}, at a game of Mafia set in Bombay, 1956. Your manner: ${me.persona.manner}.`,
    `Your secret card: ${ROLE_INFO[me.role].title}. ${ROLE_INFO[me.role].line}`,
  ]
  if (family(me.role)) {
    const friends = s.players.filter((p) => family(p.role) && p.id !== me.id).map((p) => `${first(p.name)}${p.alive ? '' : ' (dead)'}`)
    lines.push(`You are in the Family${friends.length ? ` with ${friends.join(', ')}` : ', alone'}. Never admit it. Protect your own, steer suspicion onto the town, lie when it helps.`)
  } else if (me.role === 'jester') {
    lines.push('You win only if the town hangs you. Be subtly suspicious, contradict yourself a little, but never say you are the Jester.')
  } else {
    lines.push('You are on the town’s side: find the Family and hang them. The Family win once they can no longer be outvoted.')
  }

  /* The table as it stands. */
  const cast = s.players.filter((p) => p.id !== me.id && p.cover).map((p) => `${first(p.name)} — ${p.cover}`)
  if (cast.length) lines.push('', `WHO'S WHO at the Irani café tonight: ${cast.join('; ')}.`)
  const alive = s.players.filter((p) => p.alive && p.id !== me.id).map((p) => first(p.name))
  lines.push('', `THE TABLE: ${s.players.length} players began. Alive besides you (${alive.length}): ${alive.join(', ') || 'nobody'}.`)
  const dead = s.players.filter((p) => !p.alive)
  if (dead.length) lines.push(`Dead — they cannot speak or vote, never address them: ${dead.map((p) => `${first(p.name)} (${p.died?.how === 'voted' ? `hanged on day ${p.died.round}` : `murdered on night ${p.died?.round}`}${p.role ? `, was ${ROLE_INFO[p.role].title}` : ', card not revealed'})`).join('; ')}.`)

  /* The public record, night and day, in order. */
  lines.push('', 'WHAT HAS HAPPENED, IN ORDER (public knowledge):')
  for (let round = 1; round <= s.round; round++) {
    const night = s.nights?.find((n) => n.round === round)
    if (night) {
      const victim = s.players.find((p) => p.id === night.victim)
      lines.push(
        night.victim
          ? `Night ${round}: ${nameOf(night.victim)} was murdered by the Family${victim?.role ? ` — they were ${ROLE_INFO[victim.role].title}` : ''}.`
          : night.saved
            ? `Night ${round}: nobody died — the Family struck but the Doctor saved their target${night.target ? ` (it was ${nameOf(night.target)})` : ' (nobody knows who)'}.`
            : `Night ${round}: a quiet night, nobody died.`,
      )
    }
    const day = s.ledger.find((d) => d.round === round)
    if (day) {
      const named = Object.entries(day.nominations).map(([v, t]) => `${nameOf(v)}→${nameOf(t)}`).join(', ')
      const guilty = Object.entries(day.judgement).filter(([, g]) => g).map(([v]) => nameOf(v))
      const innocent = Object.entries(day.judgement).filter(([, g]) => !g).map(([v]) => nameOf(v))
      lines.push(
        `Day ${round}: nominations ${named || 'none'}. ${
          day.accused
            ? `${nameOf(day.accused)} stood trial — guilty: ${guilty.join(', ') || 'nobody'}; innocent: ${innocent.join(', ') || 'nobody'} — and was ${day.outcome === 'hanged' ? 'HANGED' : 'acquitted'}.`
            : 'Nobody stood trial.'
        }`,
      )
    }
  }

  /* What only this seat knows. */
  const secrets: string[] = []
  const verb = NIGHT_VERB[me.role] ?? 'chose'
  for (const n of s.mine ?? []) {
    const night = s.nights?.find((x) => x.round === n.round)
    const outcome = me.role === 'doctor' && night?.saved && night.target === n.target ? ' — and the Family DID come for them; you saved their life' : ''
    secrets.push(`Night ${n.round} you ${verb} ${n.target === me.id ? 'yourself' : nameOf(n.target)}${outcome}.`)
  }
  for (const f of me.files) secrets.push(`Your file on ${nameOf(f.target)} (night ${f.round}): ${f.family ? 'WORKS FOR THE FAMILY' : 'no Family connection (though the Godfather reads clean)'}.`)
  if (me.role === 'doctor' && me.lastProtected) secrets.push(`You cannot protect ${nameOf(me.lastProtected)} again tonight.${me.selfSaveUsed ? ' You have used your one self-save.' : ''}`)
  if (secrets.length) lines.push('', `ONLY YOU KNOW (revealing it can make you a target — choose wisely): ${secrets.join(' ')}`)
  if (s.whispers?.length) {
    lines.push('', 'The Family’s private whispers (the town cannot see these):')
    for (const w of s.whispers.slice(-10)) lines.push(`${nameOf(w.by)}: "${w.text}"`)
  }

  /* Where we are now. */
  lines.push('', `RIGHT NOW: ${(PHASE_NOW[s.phase] ?? ((x: Sight) => `Round ${x.round}.`))(s, nameOf)}${clockLine(s.msLeft)}`)
  const today = Object.entries(s.votes).map(([v, t]) => `${nameOf(v)}→${nameOf(t)}`).join(', ')
  if (today) lines.push(`Nominations so far today: ${today}.`)
  if (s.plea && s.accused) lines.push(`${nameOf(s.accused)}'s defence: "${s.plea}"`)

  /* Who said what. */
  const earlier = s.talk.filter((t) => t.round !== undefined && t.round < s.round).slice(-16)
  const now = s.talk.filter((t) => t.round === undefined || t.round === s.round).slice(-30)
  if (earlier.length) {
    lines.push('', 'Said at the table on earlier days (most recent shown):')
    for (const t of earlier) lines.push(`[day ${t.round}] ${t.by === me.id ? 'You' : nameOf(t.by)}: "${t.text}"`)
  }
  lines.push('', now.length ? `Said at the table today, oldest first ("You" is you):` : 'Nobody has said anything at the table yet today.')
  for (const t of now) lines.push(`${t.by === me.id ? 'You' : nameOf(t.by)}: "${t.text}"`)
  return lines.join('\n')
}

const ASK: Record<Job, (s: Sight) => string> = {
  talk: (s) => {
    const who = first(s.players.find((p) => p.id === s.replyTo)?.name ?? 'Someone')
    const said = s.replyTo ? [...s.talk].reverse().find((t) => t.by === s.replyTo)?.text : undefined
    return `${s.replyTo ? `${who} just said to the table: "${said ?? '…'}" — answer them directly. ` : ''}Say one thing to the table now: accuse, defend, question, or react to what was actually said. Build on the conversation — don't repeat yourself or others. Spread your attention around the table; don't keep coming back to the same person without a new reason. Under 150 characters, spoken, in character, first names only.
Answer as JSON: {"say": "..."}`
  },
  vote: (s) =>
    `Nominations are open. Choose who should stand trial, or nobody. Decide from the record and what was actually said — a contradiction, a strange vote, a defence of someone suspicious. Do not pick someone just because they talked the most or are new to the table; ${s.round <= 1 ? 'on day 1 there is very little to go on, so a light hunch or "nobody" is fine' : 'follow the evidence'}. Pick from these ids: ${s.players
      .filter((p) => p.alive && p.id !== s.me.id)
      .map((p) => `${p.id} (${first(p.name)})`)
      .join(', ')}.
Answer as JSON: {"target": "<id or null>", "say": "<your reason, under 110 characters>"}`,
  judge: (s) =>
    `${first(s.players.find((p) => p.id === s.accused)?.name ?? 'Someone')} is on trial and has made their defence (above). Weigh it against everything that has happened. Guilty or innocent?
Answer as JSON: {"guilty": true or false, "say": "<one line, under 100 characters>"}`,
  defence: (s) =>
    `The town has put YOU on trial — named by ${Object.entries(s.votes).filter(([, t]) => t === s.me.id).map(([v]) => first(s.players.find((p) => p.id === v)?.name ?? 'someone')).join(', ') || 'the town'}. Make your defence, answering what was actually said against you: two sentences, under 220 characters, spoken, in character.
Answer as JSON: {"say": "..."}`,
}

/** What this AI does now: Luna if it answers in time, rules if not. */
export async function think(job: Job, s: Sight, random: (n: number) => number): Promise<Thought> {
  const started = Date.now()
  return inTime(job, started, await decide(job, s, random))
}

async function decide(job: Job, s: Sight, random: (n: number) => number): Promise<Thought> {
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
              'You play one character at a party game of Mafia, Bombay 1956 noir, as a real player would. Everyone else at the table is a player like you, each with their own secret card — judge them all by the same standard: what they said, how they voted, what happened. Follow the game closely, remember who said and did what, and reason from it. Talk to the others by name, answer questions put to you, and ask your own. You speak like a real person at the table — short, natural, a little colourful, never gory, no emojis, no stage directions. Never assume anyone\'s gender: use their name or "they". Stick to the facts you are given: never invent a death, a vote, or something someone said, and never talk to the dead. You only answer with JSON.',
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
