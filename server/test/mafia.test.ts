/**
 * Mafia: the deal, the night, the morning, the vote, the verdict — and above
 * all that no screen ever learns a role it shouldn't. Nothing here calls the
 * model or the voice; narration is fed in as the server would feed it.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { Ctx, Player } from '../src/games/engine.js'
import { familyChoice, mafia, services, sightFor, tally, winnerOf, type Mafia, type Options } from '../src/games/mafia.js'
import { judgeByRules, lineByRules, voteByRules } from '../src/games/mafia.bots.js'
import { roleSet, type Role } from '../src/games/mafia.roles.js'

let clock = 0
let timers: { at: number; action: string; payload: Record<string, unknown> }[] = []
const ctx = (random: (n: number) => number = () => 0): Ctx => ({
  now: () => clock,
  random,
  schedule: (ms, action, payload = {}) => timers.push({ at: clock + ms, action, payload }),
  clearSchedule: () => (timers = []),
})

const names = ['Aditi', 'Rohan', 'Khushi', 'Kabir', 'Meera', 'Arjun', 'Zoya', 'Dev', 'Ira', 'Vikram', 'Sana', 'Neel']
const people = (n: number): Player[] => names.slice(0, n).map((name) => ({ id: name.toLowerCase(), name }))

const options = (over: Partial<Options> = {}) => {
  const o = mafia.options({ nightSeconds: 45, daySeconds: 120, voteSeconds: 30, ...over })
  if ('error' in o) throw new Error(o.error)
  return o
}

/** A table with chosen roles, rather than shuffled ones. */
function table(roles: Role[], over: Partial<Options> = {}): Mafia {
  clock = 0
  timers = []
  const state = mafia.start(people(roles.length), options(over), ctx())
  state.players.forEach((p, i) => (p.role = roles[i]!))
  return state
}

const act = (state: Mafia, by: string | null, action: string, payload: Record<string, unknown> = {}, random?: (n: number) => number) => {
  const player = by ? state.players.find((p) => p.id === by)! : null
  const next = mafia.act(state, player ? { id: player.id, name: player.name } : null, action, payload, ctx(random))
  if ('error' in next) throw new Error(next.error)
  return next
}
const tick = (state: Mafia) => act(state, null, 'tick', { step: state.step })
const view = (state: Mafia, viewer: string) => mafia.view(state, viewer) as ReturnType<typeof viewOf>
const viewOf = (s: Mafia, v: string) => mafia.view(s, v) as {
  phase: string
  players: { id: string; alive: boolean; role: Role | null }[]
  me: { role: Role; files: { target: string; family: boolean }[] } | null
  night: { family: { id: string; pick: string | null }[] | null } | null
  whispers: unknown[]
  ghosts: unknown[]
  verdict: { role: Role | null; target: string | null } | null
  narration: { text: string } | null
  history: unknown[] | null
}

/** Straight to the first night. */
const toNight = (state: Mafia) => tick(state)
/** Through the hush and morning to the day. */
const toDay = (state: Mafia) => tick(tick(state))

describe('mafia — the deal', () => {
  it('balances the table at every size, and the extras only where they still leave it winnable', () => {
    for (let n = 4; n <= 12; n++) {
      const plain = roleSet(n, { godfather: false, jester: false })
      const family = plain.filter((r) => r === 'mafia').length
      assert.equal(plain.length, n)
      assert.equal(family, n <= 6 ? 1 : n <= 8 ? 2 : 3, `${n} players`)
      assert.equal(plain.filter((r) => r === 'doctor').length, 1)
      assert.equal(plain.includes('detective'), n >= 5)
      const spicy = roleSet(n, { godfather: true, jester: true })
      assert.equal(spicy.includes('godfather'), n >= 7)
      assert.equal(spicy.includes('jester'), n >= 6)
      assert.equal(spicy.filter((r) => r === 'mafia' || r === 'godfather').length, family)
    }
  })

  it('deals every role and lets each screen see only its own card — and the Family each other', () => {
    const state = table(['mafia', 'mafia', 'doctor', 'detective', 'villager', 'villager', 'villager'])
    const villager = view(state, 'meera')
    assert.equal(villager.me!.role, 'villager')
    assert.ok(villager.players.filter((p) => p.id !== 'meera').every((p) => p.role === null), 'a citizen sees no one')
    const family = view(state, 'aditi')
    assert.deepEqual(
      family.players.filter((p) => p.role).map((p) => p.id).sort(),
      ['aditi', 'rohan'],
      'the Family know each other and nobody else',
    )
    const outsider = view(state, 'stranger')
    assert.equal(outsider.me, null)
    assert.ok(outsider.players.every((p) => p.role === null), 'a spectator sees nothing')
  })

  it('goes to night as soon as everyone has looked at their card', () => {
    let state = table(['mafia', 'doctor', 'detective', 'villager', 'villager'])
    for (const p of state.players) state = act(state, p.id, 'seen')
    assert.equal(state.phase, 'deal', 'a moment to read the card first')
    assert.ok(timers.at(-1)!.at - clock <= 4_000)
    state = tick(state)
    assert.equal(state.phase, 'night')
    assert.equal(state.round, 1)
  })
})

describe('mafia — the night', () => {
  const five = (): Mafia => toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))

  it('refuses moves that break the rules', () => {
    const state = toNight(table(['mafia', 'mafia', 'doctor', 'detective', 'villager', 'villager', 'villager']))
    assert.throws(() => act(state, 'aditi', 'pick', { target: 'rohan' }), /our own/)
    assert.throws(() => act(state, 'meera', 'pick', { target: 'meera' }), /someone else/)
    assert.throws(() => act(state, 'meera', 'vote', { target: 'aditi' }), /closed/)
  })

  it('the Doctor saves the target, and the paper says a miracle — not who', () => {
    let state = five()
    state = act(state, 'aditi', 'pick', { target: 'kabir' })
    state = act(state, 'rohan', 'pick', { target: 'kabir' })
    state = tick(state)
    assert.equal(state.phase, 'hush')
    assert.ok(state.players.every((p) => p.alive))
    assert.deepEqual(state.dawn, { victim: null, saved: true })
    assert.match(state.narration!.headline!, /MIRACLE/)
  })

  it('the Doctor cannot keep the same patient two nights running, and saves themselves only once', () => {
    let state = five()
    state = act(state, 'rohan', 'pick', { target: 'rohan' })
    state = tick(state) // hush
    state = toDay(state)
    state = tick(state) // vote
    state = tick(state) // nobody voted — spared
    state = tick(tick(state)) // verdict, then night 2
    assert.equal(state.phase, 'night')
    assert.throws(() => act(state, 'rohan', 'pick', { target: 'rohan' }), /same patient/)
    state = act(state, 'rohan', 'pick', { target: 'kabir' })
    state = tick(state)
    state = toDay(state)
    state = tick(tick(state))
    state = tick(tick(state))
    assert.equal(state.phase, 'night')
    assert.throws(() => act(state, 'rohan', 'pick', { target: 'rohan' }), /already saved yourself/)
  })

  it('the Family go with the Godfather, else the most picked, and a coin decides a tie', () => {
    const state = toNight(table(['godfather', 'mafia', 'mafia', 'doctor', 'detective', 'villager', 'villager', 'villager', 'villager']))
    state.picks = { aditi: 'zoya', rohan: 'dev', khushi: 'dev' }
    assert.equal(familyChoice(state, { random: () => 0 }), 'zoya', "the Godfather's word")
    state.picks = { rohan: 'dev', khushi: 'zoya' }
    assert.equal(familyChoice(state, { random: () => 1 }), 'zoya', 'a tie goes to the coin')
    state.picks = {}
    assert.equal(familyChoice(state, { random: () => 0 }), null, 'no picks, no killing')
  })

  it('the Inspector learns the truth privately — except about the Godfather', () => {
    let state = toNight(table(['godfather', 'mafia', 'doctor', 'detective', 'villager', 'villager', 'villager']))
    state = act(state, 'kabir', 'pick', { target: 'aditi' })
    state = tick(state)
    assert.equal(view(state, 'kabir').me!.files.at(-1)!.family, false, 'the Godfather reads clean')
    assert.deepEqual(view(state, 'meera').me!.files, [], 'nobody else sees the file')
    state = toDay(state)
    state = tick(tick(state))
    state = tick(tick(state))
    state = act(state, 'kabir', 'pick', { target: 'rohan' })
    state = tick(state)
    assert.equal(view(state, 'kabir').me!.files.at(-1)!.family, true)
  })

  it("only the Family see the Family's picks; everyone sees just how many have chosen", () => {
    let state = five()
    state = act(state, 'aditi', 'pick', { target: 'meera' })
    assert.deepEqual(view(state, 'aditi').night!.family, [{ id: 'aditi', pick: 'meera' }])
    assert.equal(view(state, 'meera').night!.family, null)
    assert.equal(act(state, 'meera', 'whisper', { text: 'hi' }), state, 'a citizen cannot whisper to the Family')
  })

  it('a night where everyone has chosen and the Family agree ends early', () => {
    let state = five()
    for (const [by, target] of [['aditi', 'meera'], ['rohan', 'kabir'], ['khushi', 'aditi'], ['kabir', 'aditi'], ['meera', 'aditi']]) {
      state = act(state, by!, 'pick', { target })
    }
    assert.ok(timers.at(-1)!.at - clock <= 3_000, 'closes within a few seconds')
    const closing = state.step
    state = act(state, 'meera', 'pick', { target: 'kabir' })
    assert.equal(state.step, closing, 'a change of mind in the last seconds does not push the close back')
  })
})

describe('mafia — the morning, the vote, the verdict', () => {
  it('kills the victim at dawn and lets the narration end the hush', () => {
    let state = toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))
    state = act(state, 'aditi', 'pick', { target: 'meera' })
    state = tick(state)
    assert.equal(state.players.find((p) => p.id === 'meera')!.alive, false)
    clock += 3_000
    state = act(state, null, 'narrate', { id: state.narration!.id, text: 'Meera was found at the docks.', headline: 'MURDER AT DOCK 9', audio: '/uploads/narration/x.mp3' })
    assert.equal(state.phase, 'dawn')
    assert.equal(view(state, 'kabir').narration!.text, 'Meera was found at the docks.')
    assert.equal(act(state, null, 'narrate', { id: 'old', text: 'stale' }), state, 'a stale line is ignored')
  })

  it('counts votes: most wins only if it beats "no one", and a tie spares everyone', () => {
    const base = table(['mafia', 'doctor', 'detective', 'villager', 'villager'])
    assert.deepEqual(tally({ ...base, votes: { aditi: 'meera', rohan: 'meera', khushi: 'aditi', kabir: null } }), { target: 'meera', votes: 2 })
    assert.equal(tally({ ...base, votes: { aditi: 'meera', rohan: 'aditi' } }).target, null, 'a tie')
    assert.equal(tally({ ...base, votes: { aditi: 'meera', rohan: null, khushi: null } }).target, null, '"no one" wins')
  })

  it('the day ends when most are ready; the accused defends themselves, then the town judges', () => {
    let state = toDay(tick(toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))))
    assert.equal(state.phase, 'day')
    for (const id of ['rohan', 'khushi', 'kabir']) state = act(state, id, 'ready')
    assert.equal(state.phase, 'vote')
    for (const [by, target] of [['rohan', 'aditi'], ['khushi', 'aditi'], ['kabir', 'aditi'], ['meera', 'rohan'], ['aditi', 'rohan']]) {
      state = act(state, by!, 'vote', { target })
    }
    state = tick(state)
    assert.equal(state.phase, 'defence')
    assert.equal(state.accused, 'aditi')
    assert.ok(state.players.find((p) => p.id === 'aditi')!.alive, 'alive to make their case')
    assert.equal(view(state, 'meera').verdict, null, 'the role waits for the verdict')
    assert.equal(act(state, 'rohan', 'done'), state, 'only the accused can rest their case')
    state = act(state, 'aditi', 'done')
    assert.equal(state.phase, 'judgement')
    assert.throws(() => act(state, 'aditi', 'judge', { guilty: false }), /yourself/)
    for (const by of ['rohan', 'khushi', 'kabir']) state = act(state, by, 'judge', { guilty: true })
    state = act(state, 'meera', 'judge', { guilty: false })
    assert.deepEqual((view(state, 'meera') as unknown as { judgement: unknown }).judgement, { done: 4, of: 4 }, 'a count, not names, while it runs')
    state = tick(state) // hush
    state = tick(state) // verdict
    assert.equal(state.phase, 'verdict')
    assert.equal(view(state, 'meera').verdict!.role, 'mafia')
    assert.deepEqual(state.ledger.at(-1)!.judgement, { rohan: true, khushi: true, kabir: true, meera: false })
    assert.equal(state.ledger.at(-1)!.outcome, 'hanged')
    state = tick(state)
    assert.equal(state.phase, 'over')
    assert.equal(state.winner, 'town')
  })

  it('a tied judgement lets the accused walk free, and the notebook remembers it', () => {
    let state = toDay(tick(toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))))
    state = tick(state)
    for (const by of ['aditi', 'rohan', 'khushi']) state = act(state, by, 'vote', { target: 'meera' })
    state = tick(tick(state)) // defence, judgement
    state = act(state, 'aditi', 'judge', { guilty: true })
    state = act(state, 'rohan', 'judge', { guilty: false })
    state = tick(tick(state))
    assert.equal(state.phase, 'verdict')
    assert.ok(state.players.find((p) => p.id === 'meera')!.alive)
    assert.equal(state.narration!.kind, 'acquitted')
    assert.equal(state.ledger.at(-1)!.outcome, 'acquitted')
    assert.equal(view(state, 'kabir').verdict!.hanged, false)
    state = tick(state)
    assert.equal(state.phase, 'night', 'and the night comes again')
    assert.equal((view(state, 'kabir') as unknown as { ledger: unknown[] }).ledger.length, 1, 'the notebook is public')
  })

  it('with roles kept secret, a hanged citizen stays a mystery until the end', () => {
    let state = toDay(tick(toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager'], { reveal: false }))))
    state = tick(state)
    for (const by of ['aditi', 'rohan', 'khushi']) state = act(state, by, 'vote', { target: 'meera' })
    state = tick(tick(state))
    for (const by of ['aditi', 'rohan', 'khushi']) state = act(state, by, 'judge', { guilty: true })
    state = tick(tick(state))
    assert.equal(state.phase, 'verdict')
    assert.equal(view(state, 'kabir').verdict!.role, null)
    assert.equal(view(state, 'kabir').players.find((p) => p.id === 'meera')!.role, null)
    assert.equal(view(state, 'meera').players.find((p) => p.id === 'aditi')!.role, 'mafia', 'but the dead see everything')
  })
})

describe('mafia — endings, ghosts and the host', () => {
  it('the Family win when they can no longer be outvoted', () => {
    const state = table(['mafia', 'mafia', 'doctor', 'villager', 'villager'])
    state.players[3]!.alive = false
    assert.equal(winnerOf(state), 'family')
    state.players[3]!.alive = true
    assert.equal(winnerOf(state), null)
  })

  it('the Jester wins by being hanged', () => {
    let state = toDay(tick(toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager', 'jester'], { jester: true }))))
    state = tick(state)
    for (const by of ['aditi', 'rohan', 'khushi', 'kabir']) state = act(state, by, 'vote', { target: 'arjun' })
    state = tick(tick(state))
    for (const by of ['aditi', 'rohan', 'khushi', 'kabir']) state = act(state, by, 'judge', { guilty: true })
    state = tick(tick(state))
    state = tick(state)
    assert.equal(state.phase, 'over')
    assert.equal(state.winner, 'jester')
  })

  it('the dead see every role and talk only among themselves; the Family whisper only to each other', () => {
    let state = toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))
    state = act(state, 'aditi', 'pick', { target: 'meera' })
    state = act(state, 'aditi', 'whisper', { text: 'Meera tonight.' })
    state = tick(state)
    assert.ok(view(state, 'meera').players.every((p) => p.role !== null), 'the dead see all')
    assert.equal(view(state, 'kabir').whispers.length, 0)
    assert.equal(view(state, 'aditi').whispers.length, 1)
    state = act(state, 'meera', 'ghost', { text: 'It was Aditi!' })
    assert.equal(view(state, 'kabir').ghosts.length, 0, "the living can't hear ghosts")
    assert.equal(view(state, 'meera').ghosts.length, 1)
    assert.throws(() => act(state, 'meera', 'vote', { target: 'aditi' }))
  })

  it('stale timers do nothing, and the host can pause and resume the clock', () => {
    let state = toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))
    assert.equal(act(state, null, 'tick', { step: state.step - 1 }), state)
    clock = 10_000
    state = act(state, 'aditi', 'pause')
    assert.notEqual(state.paused, null)
    assert.equal(act(state, null, 'tick', { step: state.step }), state, 'paused clocks do not run')
    assert.throws(() => act(state, 'rohan', 'resume'), /host/)
    state = act(state, 'aditi', 'resume')
    assert.equal(state.paused, null)
    assert.ok(state.deadline! > clock)
  })

  it('a whole game, start to finish, without a role leaking to a citizen at any point', () => {
    let state = table(['mafia', 'mafia', 'doctor', 'detective', 'villager', 'villager', 'villager'])
    const villager = 'zoya'
    const leaks = (s: Mafia) => {
      const v = view(s, villager)
      if (v.phase === 'over' || !v.players.find((p) => p.id === villager)!.alive) return
      for (const p of v.players) if (p.id !== villager && p.alive) assert.equal(p.role, null, `${p.id} leaked during ${v.phase}`)
    }
    for (const p of state.players) state = act(state, p.id, 'seen')
    state = tick(state)
    let guard = 0
    while (state.phase !== 'over' && guard++ < 60) {
      leaks(state)
      if (state.phase === 'night') {
        const target = state.players.find((p) => p.alive && p.role === 'villager' && p.id !== villager) ?? state.players.find((p) => p.alive && p.id === villager)
        for (const m of state.players.filter((p) => p.alive && p.role === 'mafia')) state = act(state, m.id, 'pick', { target: target!.id })
      }
      if (state.phase === 'vote') {
        const suspect = state.players.find((p) => p.alive && p.role === 'mafia')!
        for (const p of state.players.filter((p) => p.alive && p.id !== suspect.id)) state = act(state, p.id, 'vote', { target: suspect.id })
      }
      if (state.phase === 'judgement') {
        for (const p of state.players.filter((p) => p.alive && p.id !== state.accused)) state = act(state, p.id, 'judge', { guilty: true })
      }
      state = tick(state)
    }
    assert.equal(state.phase, 'over')
    const final = view(state, villager)
    assert.ok(final.players.every((p) => p.role !== null), 'the case file opens every card')
    assert.ok(Array.isArray(final.history) && final.history.length > 0)
    assert.ok(mafia.over(state))
  })

  it('a pause freezes the game itself, not just the clock', () => {
    let state = toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))
    state = act(state, 'aditi', 'pause')
    assert.throws(() => act(state, 'aditi', 'pick', { target: 'meera' }), /paused/)
    assert.equal(act(state, 'meera', 'ghost', { text: 'x' }), state, 'chatter is fine; it just does nothing for the living')
    state = act(state, 'aditi', 'resume')
    state = act(state, 'aditi', 'pick', { target: 'meera' })
    assert.equal(state.picks.aditi, 'meera')
  })

  it('only the host ends the game outright; anyone else asks, and a majority ends it', () => {
    let state = toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))
    state = act(state, 'rohan', 'end')
    assert.equal(state.phase, 'night')
    assert.equal((view(state, 'kabir') as unknown as { endVotes: number }).endVotes, 1)
    state = act(state, 'rohan', 'end')
    assert.equal(state.endVotes.length, 1, 'asking twice counts once')
    state = act(state, 'khushi', 'end')
    assert.equal(state.phase, 'night')
    state = act(state, 'kabir', 'end')
    assert.equal(state.phase, 'over', 'three of five')
    const hosted = act(toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager'])), 'aditi', 'end')
    assert.equal(hosted.phase, 'over')
  })

  it('when the host leaves the room, whoever is still here can run the clock', () => {
    const state = toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))
    const here = (ids: string[]): Ctx => ({ ...ctx(), present: () => ids })
    const refused = mafia.act(state, { id: 'rohan', name: 'Rohan' }, 'pause', {}, here(['aditi', 'rohan']))
    assert.ok('error' in refused, 'the host is still here')
    const paused = mafia.act(state, { id: 'rohan', name: 'Rohan' }, 'pause', {}, here(['rohan', 'khushi']))
    assert.ok(!('error' in paused))
    assert.equal(paused.host, 'rohan')
    assert.notEqual(paused.paused, null)
  })

  it('a rematch gets its own narration — never mistaken for the last game\'s', () => {
    clock = 1_000
    const one = mafia.start(people(5), options(), ctx(() => 1))
    clock = 900_000
    const two = mafia.start(people(5), options({ rematch: true }), ctx(() => 2))
    assert.notEqual(one.narration!.id, two.narration!.id)
    assert.ok(two.narration!.text.length < one.narration!.text.length, 'a shorter opening')
    assert.ok(two.deadline! < 900_000 + 16_000)
  })

  it('the dead predict the ending; once it is over, the table votes the best bluff', () => {
    let state = toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))
    state = act(state, 'aditi', 'pick', { target: 'meera' })
    state = tick(state)
    assert.equal(act(state, 'kabir', 'predict', { winner: 'town' }), state, 'only the dead predict')
    state = act(state, 'meera', 'predict', { winner: 'family' })
    assert.equal(view(state, 'kabir').phase, 'hush')
    assert.equal((view(state, 'kabir') as unknown as { predictions: unknown }).predictions, null, 'secret until the end')
    state = act(state, 'aditi', 'end')
    assert.throws(() => act(state, 'rohan', 'bluff', { target: 'rohan' }), /someone else/)
    state = act(state, 'rohan', 'bluff', { target: 'aditi' })
    const final = view(state, 'kabir') as unknown as { predictions: Record<string, string>; bluff: Record<string, string> }
    assert.deepEqual(final.predictions, { meera: 'family' })
    assert.deepEqual(final.bluff, { rohan: 'aditi' })
  })

  it('a narration only shows in the phase it belongs to', () => {
    let state = toNight(table(['mafia', 'doctor', 'detective', 'villager', 'villager']))
    state = act(state, 'aditi', 'pick', { target: 'meera' })
    state = tick(state)
    assert.equal(view(state, 'kabir').narration, null, 'the dawn story waits for dawn')
    state = tick(state)
    assert.ok(view(state, 'kabir').narration)
  })
})

describe('mafia — AI players', () => {
  /* No model, no voice: the narrator keeps its own line and the AIs think by rules. */
  services.narrate = async (_kind, _facts, text, headline) => ({ text, headline, audio: null })
  services.think = async (job, sight, random) =>
    job === 'vote'
      ? { target: voteByRules(sight, random), say: 'My money is on them.' }
      : job === 'judge'
        ? { guilty: judgeByRules(sight, random), say: 'Guilty.' }
        : { say: lineByRules(job, sight, random) }

  /** Run the game's own timers and the AIs' thinking until it ends, or `limit` steps. */
  async function play(state: Mafia, limit = 400, human?: (s: Mafia) => Mafia) {
    for (let i = 0; i < limit && state.phase !== 'over'; i++) {
      if (human) state = human(state)
      const work = mafia.after!('room', state)
      for (const later of Array.isArray(work) ? work : work ? [work] : []) {
        const result = await later
        if (result) state = act(state, null, result.action, result.payload)
      }
      timers.sort((a, b) => a.at - b.at)
      const next = timers.shift()
      if (!next) break
      clock = Math.max(clock, next.at)
      state = act(state, null, next.action, next.payload)
    }
    return state
  }

  it('one person and the AIs make a table; the AIs never need to look at a card', () => {
    assert.equal(mafia.minPeople!(options({ bots: 3 })), 1)
    assert.equal(mafia.minPeople!(options()), 4)
    assert.equal(options({ bots: 99 }).bots, 11)
    clock = 0
    timers = []
    const state = mafia.start(people(1), options({ bots: 4 }), ctx())
    assert.equal(state.players.length, 5)
    assert.equal(state.players.filter((p) => p.bot !== undefined).length, 4)
    assert.deepEqual(state.seen.sort(), ['ai-1', 'ai-2', 'ai-3', 'ai-4'])
    const seen = view(state, 'aditi') as unknown as { players: { id: string; bot: string | null }[] }
    assert.ok(seen.players.filter((p) => p.id.startsWith('ai-')).every((p) => typeof p.bot === 'string'), 'everyone knows who is an AI')
  })

  it('an AI sees only what its own seat could see', () => {
    clock = 0
    timers = []
    const state = mafia.start(people(1), options({ bots: 5 }), ctx())
    const roles: Role[] = ['villager', 'mafia', 'doctor', 'detective', 'villager', 'mafia']
    state.players.forEach((p, i) => (p.role = roles[i]!))
    const citizen = sightFor(state, 'ai-4', null)
    assert.ok(citizen.players.filter((p) => p.id !== 'ai-4').every((p) => p.role === null), 'a citizen AI knows nobody')
    const family = sightFor(state, 'ai-1', null)
    assert.deepEqual(family.players.filter((p) => p.role).map((p) => p.id).sort(), ['ai-1', 'ai-5'])
  })

  it('a whole game with four AIs plays itself out — picks, talk, votes, verdicts', async () => {
    clock = 0
    timers = []
    let state = mafia.start(people(1), options({ bots: 4, nightSeconds: 30, daySeconds: 120, voteSeconds: 30 }), ctx((n) => Math.floor(Math.random() * n)))
    let talked = 0
    state = await play(state, 600, (s) => {
      talked = Math.max(talked, s.talk.filter((t) => t.kind === 'bot').length)
      if (s.phase === 'deal' && !s.seen.includes('aditi')) return act(s, 'aditi', 'seen')
      return s
    })
    assert.equal(state.phase, 'over', 'the game reaches an end')
    assert.ok(talked > 0, 'the AIs spoke at the table')
    assert.ok(state.ledger.length > 0, 'at least one day was voted on')
    assert.ok(Object.keys(state.ledger[0]!.nominations).some((id) => id.startsWith('ai-')), 'the AIs voted')
  })

  it('the AIs in the Family follow a person’s call at night', () => {
    clock = 0
    timers = []
    let state = mafia.start(people(1), options({ bots: 6 }), ctx())
    const roles: Role[] = ['mafia', 'mafia', 'doctor', 'detective', 'villager', 'villager', 'villager']
    state.players.forEach((p, i) => (p.role = roles[i]!))
    state = tick(state)
    state = act(state, 'aditi', 'pick', { target: 'ai-3' })
    assert.equal(state.picks['ai-1'], 'ai-3')
  })

  it('table talk: by day only, the living only — and a named AI answers', () => {
    clock = 0
    timers = []
    let state = mafia.start(people(1), options({ bots: 4 }), ctx())
    state.players.forEach((p, i) => (p.role = (['villager', 'mafia', 'doctor', 'detective', 'villager'] as Role[])[i]!))
    state = tick(state)
    assert.throws(() => act(state, 'aditi', 'say', { text: 'hello' }), /quiet/)
    state = tick(tick(tick(state)))
    assert.equal(state.phase, 'day')
    clock += 20_000
    const name = state.players.find((p) => p.id === 'ai-2')!.name.split(' ')[0]!
    state = act(state, 'aditi', 'say', { text: `${name}, where were you last night?`, heard: true })
    assert.equal(state.talk.at(-1)!.kind, 'heard')
    assert.ok(timers.some((t) => t.action === 'bot' && t.payload.id === 'ai-2' && t.payload.replyTo === 'aditi'))
  })

  it('only people count towards asking to end', () => {
    clock = 0
    timers = []
    let state = mafia.start(people(3), options({ bots: 3 }), ctx())
    state = tick(state)
    state = act(state, 'rohan', 'end')
    assert.equal(state.phase, 'night', 'one of three people is not enough')
    state = act(state, 'khushi', 'end')
    assert.equal(state.phase, 'over', 'two of three people is — the AIs are not counted')
  })
})
