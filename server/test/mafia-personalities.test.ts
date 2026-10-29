import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Ctx } from '../src/games/engine.js'
import { mafia, services, sightFor, type Mafia } from '../src/games/mafia.js'
import { briefing, deathMistake, decide, judgeByRules, lineByRules, modelSight, nightPick, privateFactMistake, voteByRules, type Sight } from '../src/games/mafia.bots.js'
import { ARCS, ARC_IDS } from '../src/games/mafia.arcs.js'
import { PERSONALITIES, type Personality } from '../src/games/mafia.personalities.js'
import type { Role } from '../src/games/mafia.roles.js'

function randomFor(seed: number) {
  let n = seed
  return (max: number) => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return max <= 1 ? 0 : Math.floor(n / 4294967296 * max) }
}
function table(bots = 4, random = (_max: number) => 0, fixedRoles = true) {
  let now = 0
  let timers: { at: number; action: string; payload: Record<string, unknown> }[] = []
  const ctx: Ctx = { now: () => now, random, schedule: (ms, action, payload = {}) => { timers.push({ at: now + ms, action, payload }) }, clearSchedule: () => { timers = [] } }
  const options = mafia.options({ bots, arc: 'bombay', story: false, daySeconds: 120, nightSeconds: 30, voteSeconds: 30 })
  assert.ok(!('error' in options))
  let state = mafia.start([{ id: 'human-account-17', name: 'Alex' }], options, ctx)
  const roles: Role[] = ['villager', 'mafia', 'doctor', 'detective', 'villager']
  if (fixedRoles) state.players.forEach((p, i) => { if (roles[i]) p.role = roles[i] })
  const act = (id: string | null, action: string, payload: Record<string, unknown> = {}) => {
    const by = id ? state.players.find((p) => p.id === id)! : null
    const next = mafia.act(state, by, action, payload, ctx)
    assert.ok(!('error' in next), 'error' in next ? next.error : '')
    state = next
    return state
  }
  return {
    get state() { return state }, ctx, act,
    tick: () => act(null, 'tick', { step: state.step }),
    nextTimer: () => {
      timers.sort((a, b) => a.at - b.at)
      const timer = timers.shift()
      assert.ok(timer, `No timer in ${state.phase}`)
      now = Math.max(now, timer.at)
      return act(null, timer.action, timer.payload)
    },
    get timers() { return timers },
  }
}
const as = (s: Mafia, personality: Personality, id = 'ai-4'): Sight => {
  const sight = sightFor(s, id, null, 0)
  return { ...sight, me: { ...sight.me, persona: { ...sight.me.persona, personality } } }
}

describe('Mafia individual players', () => {
  it('gives each story eleven distinct playing personalities that do not depend on the dealt role', () => {
    for (const arc of ARC_IDS) {
      assert.equal(new Set(ARCS[arc].personas.map((p) => p.personality)).size, 11, arc)
      for (const p of ARCS[arc].personas) assert.ok(p.personality && PERSONALITIES[p.personality])
    }
    const g = table()
    const personality = sightFor(g.state, 'ai-1', null).me.persona.personality
    for (const role of ['mafia', 'doctor', 'detective', 'villager'] as Role[]) {
      g.state.players[1]!.role = role
      assert.equal(sightFor(g.state, 'ai-1', null).me.persona.personality, personality)
    }
  })

  it('lets quiet reactions and short acknowledgements through instead of replacing them with identical accusations', async () => {
    const sight = as(table().state, 'quiet')
    for (const say of ['Fair point.', 'Wait. That doesn’t follow.', 'I’m not convinced yet.']) {
      const result = await decide('talk', sight, () => 0, { configured: () => true, request: async () => ({ say }) })
      assert.equal(result.say, say)
    }
    const variants = new Set(Object.keys(PERSONALITIES).map((p) => lineByRules('talk', as(table().state, p as Personality), () => 0)))
    assert.equal(variants.size, 11, 'fallback voices stay distinct too')
  })

  it('gives a quiet observer fewer scheduled remarks than a chatty player while still including both', () => {
    const g = table()
    for (let i = 0; i < 4; i++) g.tick()
    assert.equal(g.state.phase, 'day')
    const counts = new Map<string, number>()
    for (const timer of g.timers.filter((t) => t.payload.job === 'talk')) counts.set(String(timer.payload.id), (counts.get(String(timer.payload.id)) ?? 0) + 1)
    const quiet = g.state.players.find((p) => p.bot !== undefined && ARCS.bombay.personas[p.bot]!.personality === 'quiet')!
    const chatty = g.state.players.find((p) => p.bot !== undefined && ARCS.bombay.personas[p.bot]!.personality === 'gossip')!
    assert.equal(counts.get(quiet.id), 1)
    assert.equal(counts.get(chatty.id), 3)
  })

  it('remembers private reads separately per player without publishing them to players or spectators', () => {
    const g = table()
    for (let i = 0; i < 4; i++) g.tick()
    g.act(null, 'bot', { step: g.state.step, id: 'ai-4', job: 'talk' })
    const thought = g.state.thinking.find((t) => t.id === 'ai-4')!
    g.act(null, 'botDone', { key: thought.key, say: 'Wait. Let Alex answer.', reads: [
      { id: 'human-account-17', suspicion: -1.5, reason: 'PRIVATE_READ_MARKER: their answer held up' },
      { id: 'not-at-table', suspicion: 2, reason: 'invented person' },
    ] })
    assert.equal(sightFor(g.state, 'ai-4', null).reads!.length, 1)
    assert.match(sightFor(g.state, 'ai-4', null).reads![0]!.reason, /PRIVATE_READ_MARKER/)
    assert.equal(sightFor(g.state, 'ai-1', null).reads!.length, 0)
    for (const viewer of [...g.state.players.map((p) => p.id), 'spectator']) {
      const json = JSON.stringify(mafia.view(g.state, viewer))
      assert.ok(!json.includes('PRIVATE_READ_MARKER') && !json.includes('botTokens'))
    }
  })

  it('takes ordinary chat turns from the latest conversation while allowing votes to think concurrently', () => {
    const g = table()
    for (let i = 0; i < 4; i++) g.tick()
    g.act(null, 'bot', { step: g.state.step, id: 'ai-1', job: 'talk' })
    g.act(null, 'bot', { step: g.state.step, id: 'ai-4', job: 'talk' })
    assert.deepEqual(g.state.thinking.map((t) => t.id), ['ai-1'])
    assert.ok(g.timers.some((t) => t.payload.id === 'ai-4' && t.payload.job === 'talk'))
    g.act(null, 'botDone', { key: g.state.thinking[0]!.key, say: 'I am changing my read on Shankar.' })
    g.act(null, 'bot', { step: g.state.step, id: 'ai-4', job: 'talk' })
    assert.ok(sightFor(g.state, 'ai-4', null).talk.some((t) => t.text === 'I am changing my read on Shankar.'))
    g.tick()
    assert.equal(g.state.phase, 'vote')
    g.act(null, 'bot', { step: g.state.step, id: 'ai-1', job: 'vote' })
    g.act(null, 'bot', { step: g.state.step, id: 'ai-4', job: 'vote' })
    assert.equal(g.state.thinking.length, 2)
  })
})

describe('Mafia model boundaries', () => {
  it('never sends account IDs or AI-prefixed IDs to the model, and decodes choices back to the correct seat', async () => {
    const g = table(), sight = as(g.state, 'analyst')
    sight.phase = 'vote'
    sight.plan = 'Question ai-1 about human-account-17.'
    const target = sight.tokens!['human-account-17']!
    let prompt = ''
    const result = await decide('vote', sight, () => 0, {
      configured: () => true,
      request: async (messages) => {
        prompt = JSON.stringify(messages)
        return { target, say: `${target}, your explanation changed.`, plan: `Ask ${target} again.`, reads: [{ id: target, suspicion: 1.5, reason: `${target} changed the explanation` }] }
      },
    })
    assert.doesNotMatch(prompt, /human-account-17|\bai-\d+\b/)
    assert.match(prompt, /seat_\d+/)
    assert.ok(prompt.includes(`${target} = Alex`), 'reads have an explicit name-to-label mapping, including during ordinary chat')
    assert.equal(result.target, 'human-account-17')
    assert.match(result.say!, /Alex/)
    assert.ok(!result.say!.includes('seat_'))
    assert.equal(result.reads![0]!.id, 'human-account-17')
    assert.ok(!result.plan!.includes('seat_'))
    const model = modelSight(sight, () => 0).sight
    assert.ok(model.players.filter((p) => p.id !== model.me.id).every((p) => p.role === null))
    assert.notEqual(model.players[0]!.name, 'Alex', 'the human is not always the first listed candidate')
  })

  it('keeps identities opaque across a human taking an AI chair', () => {
    const g = table()
    const before = { ...g.state.botTokens }
    const joined = mafia.join!(g.state, { id: 'another-account-29', name: 'Sam' }, g.ctx)!
    assert.ok(joined)
    assert.ok(joined.botTokens['another-account-29'])
    assert.equal(new Set(Object.values(joined.botTokens)).size, joined.players.length)
    assert.equal(Object.keys(joined.botTokens).length, joined.players.length)
    assert.ok(Object.values(before).includes(joined.botTokens['another-account-29']!))
  })

  it('keeps a spoken verdict consistent with the actual judgement, including not guilty', async () => {
    const sight = as(table().state, 'quiet')
    sight.phase = 'judgement'; sight.accused = 'human-account-17'
    for (const say of ['Innocent. I am not convinced.', 'Alex: not guilty.', 'I’m voting innocent.']) {
      const answer = await decide('judge', sight, () => 0, { configured: () => true, request: async () => ({ guilty: true, say }) })
      assert.equal(answer.guilty, true)
      assert.match(answer.say!, /guilty/i)
      assert.doesNotMatch(answer.say!, /not guilty|innocent/i)
    }
    const say = 'Alex: not guilty. That is only a claim.'
    const answer = await decide('judge', sight, () => 0, { configured: () => true, request: async () => ({ guilty: false, say }) })
    assert.equal(answer.say, say)
    assert.equal(answer.guilty, false)
  })

  it('does not announce abstaining or a different nominee while casting a named vote', async () => {
    const sight = as(table().state, 'quiet')
    sight.phase = 'vote'
    const target = sight.tokens!['human-account-17']!
    for (const say of ['I’m abstaining.', 'I vote for Shankar. I want an answer.']) {
      const answer = await decide('vote', sight, () => 0, { configured: () => true, request: async () => ({ target, say }) })
      assert.equal(answer.target, 'human-account-17')
      assert.match(answer.say!, /Alex/)
      assert.doesNotMatch(answer.say!, /abstaining|Shankar/i)
    }
    const answer = await decide('vote', sight, () => 0, { configured: () => true, request: async () => ({ target: null, say: 'I vote for Alex.' }) })
    assert.equal(answer.target, null)
    assert.match(answer.say!, /abstaining/)
  })
})

describe('Mafia event reasoning', () => {
  const death = (how: 'killed' | 'voted'): Sight => {
    const sight = as(table().state, 'analyst')
    const victim = sight.players[0]!
    victim.alive = false; victim.role = null; victim.died = { round: 1, how }
    sight.round = 2
    sight.nights = how === 'killed' ? [{ round: 1, victim: victim.id, saved: false, target: null }] : []
    sight.ledger = how === 'voted' ? [{ round: 1, nominations: {}, accused: victim.id, judgement: {}, outcome: 'hanged' }] : []
    return sight
  }
  it('distinguishes night murder, execution and acquittal without inventing a revealed role', () => {
    const night = briefing(death('killed'))
    assert.match(night, /NIGHT MURDER, not a town execution/)
    assert.match(night, /exact card not revealed/)
    assert.match(night, /never punishment for a wrong accusation/)
    assert.match(briefing(death('voted')), /HANGED by the town \(TOWN EXECUTION\)/)
    const acquitted = death('voted')
    acquitted.ledger[0]!.outcome = 'acquitted'
    assert.match(briefing(acquitted), /acquitted \(not a verified innocent role\)/)
  })
  it('blocks clear false causes in both public chat and the next private plan', async () => {
    const night = death('killed')
    assert.ok(deathMistake(night, 'Alex died because the accusation was wrong.'))
    assert.ok(deathMistake(night, 'We voted out Alex.'))
    assert.ok(deathMistake(death('voted'), 'Alex was killed by the Family.'))
    assert.equal(deathMistake(night, 'Alex was not voted out. The Family killed Alex.'), null)
    assert.equal(deathMistake(night, 'The Family killed Alex. That does not make an accuser guilty.'), null)
    assert.equal(deathMistake(night, 'Alex was murdered, so the claim that Alex was Family was wrong.'), null)
    const mixed = death('voted')
    mixed.players[1]!.alive = false; mixed.players[1]!.died = { round: 2, how: 'killed' }
    assert.equal(deathMistake(mixed, 'Alex died because our accusation was wrong.'), null, 'a wrong town execution can be discussed honestly')
    const bad = await decide('talk', night, () => 0, { configured: () => true, request: async () => ({ say: 'Let’s hear the next claim.', plan: 'Alex died because the accusation was wrong.' }) })
    assert.match(bad.say!, /not a punishment/)
    assert.equal(bad.plan, undefined)
  })
  it('does not turn a prior nomination into evidence just because its target was murdered', () => {
    const alive = as(table().state, 'sceptic')
    alive.accused = 'ai-2'
    alive.ledger = [{ round: 1, nominations: { 'ai-2': 'human-account-17' }, accused: null, judgement: {}, outcome: 'nobody' }]
    const dead = structuredClone(alive)
    dead.players[0]!.alive = false; dead.players[0]!.died = { round: 2, how: 'killed' }
    assert.equal(judgeByRules(alive, () => 999), judgeByRules(dead, () => 999))
    assert.equal(judgeByRules(dead, () => 999), false, 'there is no actual case against this accuser')
  })
  it('does not give a clean Inspector check permanent immunity from other evidence', () => {
    const sight = as(table().state, 'analyst', 'ai-3')
    sight.accused = 'human-account-17'
    sight.me.files = [{ round: 1, target: 'human-account-17', family: false }]
    sight.reads = [{ id: 'human-account-17', suspicion: 2, reason: 'Changed their role claim twice' }]
    sight.talk = [{ by: 'human-account-17', text: "I'm the Doctor." }, { by: 'human-account-17', text: "I'm a Citizen." }]
    assert.equal(judgeByRules(sight, () => 0), true)
    sight.me.files = Array.from({ length: 6 }, (_, i) => ({ round: i + 1, target: 'human-account-17', family: false }))
    assert.equal(judgeByRules(sight, () => 0), true, 'rechecking the same clean card adds no independent evidence')
  })
  it('uses a public positive check as testimony rather than treating the night murder as evidence', () => {
    const sight = as(table().state, 'analyst')
    sight.accused = 'human-account-17'
    sight.talk = [{ by: 'ai-3', text: "I'm the Inspector. I checked Alex on night 1: Family." }]
    assert.equal(judgeByRules(sight, () => 999), true)
    sight.talk = [{ by: 'ai-3', text: 'Alex was killed last night.' }]
    assert.equal(judgeByRules(sight, () => 999), false)
  })
  it('does not let repeated identical testimony turn into additional independent evidence', () => {
    const sight = as(table().state, 'sceptic')
    sight.accused = 'human-account-17'
    const report = { by: 'ai-3', text: "I'm the Inspector. I checked Alex: Family." }
    sight.talk = [report]
    const once = judgeByRules(sight, () => 0)
    sight.talk = Array.from({ length: 8 }, () => report)
    assert.equal(judgeByRules(sight, () => 0), once)
  })
  it('keeps an actual investigation, a guess and a confirmed Doctor save separate while allowing Mafia bluffs', () => {
    const g = table(), citizen = as(g.state, 'quiet')
    assert.ok(privateFactMistake(citizen, 'I checked Alex: Family.'))
    assert.equal(privateFactMistake(citizen, 'I checked Alex’s voting record. It changed my read.'), null)
    const inspector = as(g.state, 'analyst', 'ai-3')
    inspector.me.files = [{ round: 1, target: 'human-account-17', family: false }]
    assert.ok(privateFactMistake(inspector, 'I checked Alex: Family.'))
    assert.equal(privateFactMistake(inspector, 'I checked Alex: clean.'), null)
    const doctor = as(g.state, 'mediator', 'ai-2')
    doctor.mine = [{ round: 1, target: 'human-account-17' }]
    doctor.nights = [{ round: 1, victim: null, saved: true, target: null }]
    assert.ok(privateFactMistake(doctor, 'I saved Alex.'))
    assert.equal(privateFactMistake(doctor, 'I protected Alex.'), null)
    doctor.nights[0]!.target = 'human-account-17'
    assert.equal(privateFactMistake(doctor, 'I saved Alex.'), null)
    assert.equal(privateFactMistake(as(g.state, 'gambler', 'ai-1'), 'I checked Alex: Family.'), null)
  })
})

describe('Mafia night strategy', () => {
  it('responds to a public Inspector claim without reading that player’s true card', () => {
    const g = table()
    const claim = { by: 'human-account-17', text: "I'm the Inspector. I checked someone last night.", round: 1 }
    const family = as(g.state, 'gambler', 'ai-1'), doctor = as(g.state, 'mediator', 'ai-2')
    family.talk = [claim]; doctor.talk = [claim]
    const random = randomFor(72)
    let targeted = 0, protectedCount = 0
    for (let i = 0; i < 500; i++) {
      if (nightPick(family, random) === 'human-account-17') targeted++
      if (nightPick(doctor, random) === 'human-account-17') protectedCount++
    }
    assert.ok(targeted > 330, String(targeted))
    assert.ok(protectedCount > 330, String(protectedCount))
    assert.equal(family.players[0]!.role, null, 'the claim is not secretly validated')
    doctor.me.lastProtected = 'human-account-17'
    for (let i = 0; i < 50; i++) assert.notEqual(nightPick(doctor, random), 'human-account-17')
    doctor.me.lastProtected = null; doctor.me.selfSaveUsed = true
    for (let i = 0; i < 50; i++) assert.notEqual(nightPick(doctor, random), doctor.me.id)
  })
  it('investigates personal suspects without rechecking an already opened file while others remain', () => {
    const sight = as(table().state, 'analyst', 'ai-3'), random = randomFor(101)
    sight.reads = [{ id: 'human-account-17', suspicion: 2, reason: 'Their claim changed' }]
    let checked = 0
    for (let i = 0; i < 250; i++) if (nightPick(sight, random) === 'human-account-17') checked++
    assert.ok(checked > 150, String(checked))
    sight.me.files = [{ round: 1, target: 'human-account-17', family: false }]
    for (let i = 0; i < 50; i++) assert.notEqual(nightPick(sight, random), 'human-account-17')
  })
})

describe('Mafia full-game regressions', () => {
  it('finishes 120 seeded games with mixed personalities, legal choices and private roles', async () => {
    services.narrate = async (_kind, _facts, text, headline) => ({ text, headline, audio: null })
    // after() uses crypto randomness in production. Both the asynchronous
    // decisions and timers must share the seeded source in this simulation.
    let random = randomFor(0)
    services.think = async (job, sight) => job === 'vote'
      ? { target: voteByRules(sight, random), say: lineByRules('vote', sight, random) }
      : job === 'judge' ? { guilty: judgeByRules(sight, random), say: lineByRules('judge', sight, random) }
      : { say: lineByRules(job, sight, random) }
    for (let game = 1; game <= 120; game++) {
      random = randomFor(game)
      const g = table(4 + game % 7, random, false)
      for (let step = 0; step < 900 && g.state.phase !== 'over'; step++) {
        const human = g.state.players[0]!
        if (human.alive) {
          const sight = sightFor(g.state, human.id, null, 0)
          if (g.state.phase === 'night' && !g.state.picks[human.id]) {
            const target = nightPick(sight, random)
            if (target) g.act(human.id, 'pick', { target })
          } else if (g.state.phase === 'vote' && g.state.votes[human.id] === undefined) {
            g.act(human.id, 'vote', { target: voteByRules(sight, random) })
          } else if (g.state.phase === 'judgement' && g.state.accused !== human.id && g.state.judgement[human.id] === undefined) {
            g.act(human.id, 'judge', { guilty: judgeByRules(sight, random) })
          }
        }
        const work = mafia.after!(`test-game-${game}`, g.state)
        for (const later of Array.isArray(work) ? work : work ? [work] : []) {
          const result = await later
          if (result) g.act(null, result.action, result.payload)
        }
        for (const player of g.state.players.filter((p) => p.alive && p.role === 'villager')) {
          const view = mafia.view(g.state, player.id) as { players: { id: string; alive: boolean; role: Role | null }[] }
          if (g.state.phase !== 'over') assert.ok(view.players.filter((p) => p.alive && p.id !== player.id).every((p) => p.role === null))
        }
        if (g.state.phase !== 'over') g.nextTimer()
      }
      assert.equal(g.state.phase, 'over', `game ${game} stalled in ${g.state.phase}; ${JSON.stringify({ round: g.state.round, players: g.state.players.map(({ id, role, alive }) => ({ id, role, alive })), ledger: g.state.ledger.slice(-3), nights: g.state.history.slice(-8) })}`)
      assert.ok(g.state.winner)
    }
  })
})
