/**
 * How well do you know me: answers stay secret until the reveal, and the
 * scoring rewards both reading someone right and being readable.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { Ctx } from '../src/games/engine.js'
import { knowMe, type KnowMe } from '../src/games/knowme.js'

const ctx = (): Ctx => ({ now: () => 0, random: () => 0, schedule: () => undefined, clearSchedule: () => undefined })
const a = { id: 'a', name: 'Aditi' }
const r = { id: 'r', name: 'Rohan' }
const m = { id: 'm', name: 'Meera' }
const act = (s: KnowMe, by: typeof a | null, action: string, payload = {}) => {
  const n = knowMe.act(s, by, action, payload, ctx())
  if ('error' in n) throw new Error(n.error)
  return n as KnowMe
}

describe('how well do you know me', () => {
  it('nobody sees the true answer or anyone else’s guess before the reveal', () => {
    let s = knowMe.start([a, r, m], { perPerson: 3, answerSeconds: 30 }, ctx())
    assert.equal(s.players[s.subject]!.id, 'a')
    s = act(s, a, 'answer', { option: 2 })
    s = act(s, r, 'answer', { option: 1 })
    const forMeera = knowMe.view(s, 'm') as { truth: number | null; guesses: Record<string, number>; answered: string[] }
    const forRohan = knowMe.view(s, 'r') as { truth: number | null; guesses: Record<string, number> }
    const forAditi = knowMe.view(s, 'a') as { truth: number | null }
    assert.equal(forMeera.truth, null)
    assert.deepEqual(forMeera.guesses, {})
    assert.deepEqual(forMeera.answered.sort(), ['a', 'r'], 'she can see who has answered, not what')
    assert.deepEqual(forRohan.guesses, { r: 1 }, 'your own guess is yours to see')
    assert.equal(forAditi.truth, 2, 'the subject sees their own answer')
  })

  it('reveals once everyone has answered, and scores right guesses and the subject', () => {
    let s = knowMe.start([a, r, m], { perPerson: 3, answerSeconds: 30 }, ctx())
    s = act(s, a, 'answer', { option: 2 })
    s = act(s, r, 'answer', { option: 2 })
    s = act(s, m, 'answer', { option: 0 })
    assert.equal(s.phase, 'reveal')
    assert.equal(s.scores.r, 100)
    assert.equal(s.scores.m, 0)
    assert.equal(s.scores.a, 50, 'the subject earns for each person who read them right')
    const view = knowMe.view(s, 'm') as { truth: number; guesses: Record<string, number> }
    assert.equal(view.truth, 2)
    assert.equal(view.guesses.r, 2)
  })

  it('answers can be changed until the reveal', () => {
    let s = knowMe.start([a, r, m], { perPerson: 3, answerSeconds: 30 }, ctx())
    s = act(s, r, 'answer', { option: 0 })
    s = act(s, r, 'answer', { option: 3 })
    assert.equal(s.guesses.r, 3)
  })

  it('the clock reveals whatever is in, and the hot seat rotates', () => {
    let s = knowMe.start([a, r], { perPerson: 3, answerSeconds: 30 }, ctx())
    s = act(s, r, 'answer', { option: 1 })
    s = act(s, null, 'timeup', { turn: 0 })
    assert.equal(s.phase, 'reveal')
    assert.equal(s.scores.r, 0, 'no truth given, so nobody can be right')
    s = act(s, null, 'next', { turn: 0 })
    assert.equal(s.players[s.subject]!.id, 'r')
    assert.equal(s.phase, 'answer')
  })

  it('ends after everyone has had their turns, and names the best read', () => {
    let s = knowMe.start([a, r], { perPerson: 3, answerSeconds: 30 }, ctx())
    for (let t = 0; t < s.turns; t++) {
      const subject = s.players[s.subject]!
      const other = subject.id === 'a' ? r : a
      s = act(s, subject, 'answer', { option: 1 })
      s = act(s, other, 'answer', { option: other.id === 'r' ? 1 : 0 })
      s = act(s, null, 'next', { turn: s.turn })
    }
    assert.equal(s.phase, 'over')
    const result = knowMe.over(s)!.summary as { winner: string; bestRead: { guesser: string; subject: string } }
    assert.equal(result.winner, 'Rohan')
    assert.deepEqual([result.bestRead.guesser, result.bestRead.subject], ['Rohan', 'Aditi'])
  })

  it('refuses nonsense', () => {
    const s = knowMe.start([a, r], { perPerson: 3, answerSeconds: 30 }, ctx())
    assert.ok('error' in knowMe.act(s, r, 'answer', { option: 7 }, ctx()))
    assert.ok('error' in knowMe.act(s, { id: 'x', name: 'X' }, 'answer', { option: 1 }, ctx()))
  })
})
