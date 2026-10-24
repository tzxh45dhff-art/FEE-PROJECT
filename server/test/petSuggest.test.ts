/**
 * The pet's suggestions: the budget that keeps them cheap, the checks on what
 * the screen sends, and the shape of what the model is asked. Nothing here
 * calls the model.
 */
import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import type { PetSnapshot } from '../src/models/pet.model.js'
import { buildPrompt, claim, DAILY_CAP, readContext, readSuggestion, resetBudgets, ROOM_GAP_MS, type SuggestContext } from '../src/services/petSuggest.service.js'

const pet: PetSnapshot = {
  name: 'Mochi', species: 'cat', bornAt: 0, hunger: 30, happiness: 70, xp: 10, stage: 'baby', progress: 0.1, mood: 'happy',
  pose: 'normal', away: null, grudges: [],
}
const viewer = { id: 'r', name: 'Rohan Mehta' }
const hub: SuggestContext = { moment: 'idle', activity: 'hub', hour: 21, onCall: false, watching: null, listening: null, result: null }

describe('pet suggestions', () => {
  beforeEach(() => resetBudgets())

  it('one line per room every few minutes, and a daily cap', () => {
    assert.equal(claim('room', 0 + ROOM_GAP_MS), true)
    assert.equal(claim('room', ROOM_GAP_MS + 1000), false, 'too soon after the last')
    assert.equal(claim('other', ROOM_GAP_MS + 1000), true, 'another room has its own budget')
    let t = ROOM_GAP_MS
    let granted = 1
    for (let i = 0; i < DAILY_CAP + 10; i++) {
      t += ROOM_GAP_MS
      if (claim('room', t)) granted++
      if (new Date(t).toISOString().slice(0, 10) !== new Date(ROOM_GAP_MS).toISOString().slice(0, 10)) break
    }
    assert.ok(granted <= DAILY_CAP)
  })

  it('only accepts known moments, and cleans everything else', () => {
    assert.equal(readContext({ moment: 'hack' }), null)
    const read = readContext({ moment: 'paused', activity: 'watch', hour: 99, onCall: 'yes', watching: `  ${'x'.repeat(200)}  `, result: 'draw' })!
    assert.equal(read.hour, 12)
    assert.equal(read.onCall, false)
    assert.equal(read.watching!.length, 80)
    assert.equal(read.result, null)
  })

  it('never acts on an action it was not offered, or one that makes no sense where you are', () => {
    assert.deepEqual(readSuggestion({ line: '"Let’s watch something!"', action: 'watch' }, { ...hub, activity: 'watch' }), { line: 'Let’s watch something!', action: 'none' })
    assert.equal(readSuggestion({ line: 'hi', action: 'delete-room' }, hub)!.action, 'none')
    assert.equal(readSuggestion({ line: 'x'.repeat(500), action: 'games' }, hub)!.line.length, 120)
    assert.equal(readSuggestion({ action: 'games' }, hub), null)
    // Music already on: "put some music on" makes no sense, and the model is told what is playing.
    const playing = { ...hub, listening: 'Kesariya by Arijit Singh' }
    assert.equal(readSuggestion({ line: 'Music?', action: 'music' }, playing)!.action, 'none')
    assert.equal(readSuggestion({ line: 'Music?', action: 'music' }, hub)!.action, 'music')
    assert.match(buildPrompt(pet, viewer, ['Rohan Mehta'], playing, []), /Music is playing in the room: "Kesariya by Arijit Singh"/)
  })

  it('tells the model who is here, how it feels about them, and not to offer a call to nobody', () => {
    const alone = buildPrompt(pet, viewer, ['Rohan Mehta'], hub, [])
    assert.match(alone, /talking to Rohan/)
    assert.match(alone, /Nobody else is in the room/)
    assert.doesNotMatch(alone.split('from this list only:')[1]!.split('\n')[1]!, /\bcall\b,/)

    const upset = { ...pet, grudges: [{ id: 'r', name: 'Rohan Mehta', level: 'grumpy' as const, sorry: false, amends: 0, need: 4 }] }
    const crowd = buildPrompt(upset, viewer, ['Rohan Mehta', 'Khushi Sharma'], hub, ['Old line'])
    assert.match(crowd, /Also in the room right now: Khushi/)
    assert.match(crowd, /upset with Rohan/)
    assert.match(crowd, /Do not repeat these recent lines: "Old line"/)
  })
})
