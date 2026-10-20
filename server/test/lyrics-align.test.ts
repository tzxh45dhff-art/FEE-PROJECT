/**
 * Lining lyrics up with the upload that is playing, from its captions — no
 * network: the captions here are built by hand to behave like YouTube's.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseCaptionXml } from '../src/services/captions.service.js'
import { estimateOffset, shiftLines, wordStream, words } from '../src/services/lyricsAlign.js'

const LYRICS = [
  { at: 3.4, text: 'I need to iron out' },
  { at: 7.1, text: 'These creases in the hotel floor' },
  { at: 12.0, text: "Can't help but move around" },
  { at: 14.9, text: "The lights look brighter than they're supposed to" },
  { at: 19.5, text: "We'd never leave this town" },
  { at: 23.0, text: 'If it was up to me' },
  { at: 27.4, text: "Been searchin' for the sound" },
  { at: 31.0, text: 'Eyes wide open all night' },
  { at: 40.0, text: 'Eyes wide open all night' },
  { at: 49.0, text: 'Eyes wide open all night' },
]

/** Captions for an upload that starts `shift` seconds later, auto-caption style: lower case, a mishearing, split cues. */
function captionsFor(shift: number) {
  return [
    { start: 0.5, duration: 2, text: '[Music]' },
    { start: 3.4 + shift, duration: 3.5, text: 'i need to iron out these' },
    { start: 7.3 + shift, duration: 4, text: 'creases in the hotel floor' },
    { start: 12.1 + shift, duration: 2.6, text: 'can help but move around the' },
    { start: 14.8 + shift, duration: 4.5, text: 'lights look brighter than they supposed to' },
    { start: 19.6 + shift, duration: 3.2, text: "we'd never leave this town" },
    { start: 23.1 + shift, duration: 4, text: 'if it was up to me' },
    { start: 27.5 + shift, duration: 3, text: 'been searching for the sound' },
    { start: 31.1 + shift, duration: 8, text: 'eyes wide open all night' },
    { start: 40.0 + shift, duration: 8, text: 'eyes wide open all night' },
    { start: 49.1 + shift, duration: 8, text: 'eyes wide open all night' },
  ]
}

describe('lyrics alignment', () => {
  it('finds how far the upload is from the lyric file, despite mishearings and a repeated chorus', () => {
    for (const shift of [5.2, -2.5, 21, 0]) {
      const fit = estimateOffset(LYRICS, wordStream(captionsFor(shift)))
      assert.ok(fit, `found a fit for ${shift}`)
      assert.ok(Math.abs(fit.offset - shift) < 0.6, `offset ${fit.offset} for a shift of ${shift}`)
      assert.ok(fit.support >= 6)
    }
  })

  it('says nothing when the captions are not the song', () => {
    const talk = [
      { start: 1, duration: 4, text: 'hey guys welcome back to the channel' },
      { start: 5, duration: 4, text: 'today we are reacting to a new song' },
      { start: 9, duration: 4, text: 'make sure you like and subscribe' },
      { start: 13, duration: 4, text: 'lets get into it right now' },
    ]
    assert.equal(estimateOffset(LYRICS, wordStream(talk)), null)
    assert.equal(estimateOffset(LYRICS, wordStream([{ start: 0, duration: 200, text: '[Music]' }])), null)
  })

  it('moves every line and never before the start', () => {
    const shifted = shiftLines(LYRICS, -5)
    assert.equal(shifted[0]!.at, 0)
    assert.equal(shifted[1]!.at, 2.1)
    assert.equal(shiftLines(LYRICS, 2.5)[9]!.at, 51.5)
  })

  it('reads both of YouTube’s caption formats', () => {
    const srv1 = '<transcript><text start="16.01" dur="2.4">The club isn&amp;#39;t the best</text><text start="18.4" dur="3">place to find a lover</text></transcript>'
    assert.deepEqual(
      parseCaptionXml(srv1).map((c) => c.start),
      [16.01, 18.4],
    )
    const srv3 = '<timedtext><body><p t="49200" d="2900"><s>I&#39;ve</s><s> been tryna call</s></p></body></timedtext>'
    const cue = parseCaptionXml(srv3)[0]!
    assert.equal(cue.start, 49.2)
    assert.deepEqual(words(cue.text), ['ive', 'been', 'tryna', 'call'])
  })

  it('agrees on words however they are written', () => {
    assert.deepEqual(words("♪ I'VE BEEN TRYNA CALL ♪"), ['ive', 'been', 'tryna', 'call'])
    assert.deepEqual(words('[Music] Can’t (oh) stop'), ['cant', 'stop'])
  })
})
