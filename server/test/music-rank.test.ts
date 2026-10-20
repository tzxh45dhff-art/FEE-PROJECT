/**
 * Song search ranking: the song that was searched for, its most official
 * upload first, and the not-the-record kinds left out unless asked for.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { excluded, officialTier, rankSongs } from '../src/services/musicRank.js'
import type { SearchResult } from '../src/services/sources.service.js'

const r = (title: string, channel: string, verified = false): SearchResult => ({ id: title, title, channel, thumbnail: '', verified })

const RESULTS = [
  r('Eyes Wide REACTION!! first time hearing', 'Some Reactor'),
  r('Alfie Jukes - Eyes Wide (slowed + reverb)', 'Chill Edits'),
  r('Cigarette', 'Alfie Jukes - Topic'),
  r('Alfie Jukes - Eyes Wide', 'Alfie Jukes'),
  r('Alfie Jukes - Eyes Wide [Audio]', 'Alfie Jukes'),
  r('Eyes Wide (acoustic cover)', 'Bedroom Covers'),
  r('Alfie Jukes - Eyes Wide [Behind The Scenes]', 'Alfie Jukes'),
  r('Eyes Wide - Alfie Jukes (Lyrics)', 'Lyric Vibes'),
  r('Eyes Wide', 'Alfie Jukes - Topic'),
]

describe('song search ranking', () => {
  it('puts the studio track first, then official audio, then the official video, then the rest', () => {
    const ranked = rankSongs(RESULTS, 'eyes wide alfie jukes').map((x) => `${x.title} / ${x.channel}`)
    assert.deepEqual(ranked.slice(0, 4), [
      'Eyes Wide / Alfie Jukes - Topic',
      'Alfie Jukes - Eyes Wide [Audio] / Alfie Jukes',
      'Alfie Jukes - Eyes Wide / Alfie Jukes',
      'Eyes Wide - Alfie Jukes (Lyrics) / Lyric Vibes',
    ])
  })

  it('leaves out reactions, edits, covers and extras — and another song by the same artist goes last', () => {
    const titles = rankSongs(RESULTS, 'eyes wide alfie jukes').map((x) => x.title)
    for (const gone of ['REACTION', 'slowed', 'cover', 'Behind The Scenes']) assert.ok(!titles.some((t) => t.includes(gone)), gone)
    assert.equal(titles.at(-1), 'Cigarette')
  })

  it('gives you the kind you asked for', () => {
    assert.equal(excluded(r('Blinding Lights (Live)', 'The Weeknd - Topic'), 'blinding lights'), true)
    assert.equal(excluded(r('Blinding Lights (Live)', 'The Weeknd - Topic'), 'blinding lights live'), false)
    assert.equal(excluded(r('Eyes Wide (slowed + reverb)', 'x'), 'eyes wide slowed'), false)
    assert.equal(excluded(r('Eyes Wide (acoustic cover)', 'x'), 'eyes wide cover'), false)
  })

  it('knows an official upload when it sees one', () => {
    assert.equal(officialTier(r('Kesariya', 'Pritam - Topic')), 0)
    assert.equal(officialTier(r('Song (Official Audio)', 'Label')), 1)
    assert.equal(officialTier(r('Song', 'SonyMusicIndiaVEVO')), 2)
    assert.equal(officialTier(r('Song', 'Someone', true)), 2)
    assert.equal(officialTier(r('Song (Lyrics)', 'Lyric Vibes')), 3)
  })

  it('never leaves the page empty when only the excluded kinds exist', () => {
    const only = [r('Song reaction', 'a'), r('Song cover', 'b'), r('Song live', 'c')]
    assert.equal(rankSongs(only, 'song').length, 3)
  })
})
