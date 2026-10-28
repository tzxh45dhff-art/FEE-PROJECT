/**
 * The lyrics lookup, with a stand-in for LRCLIB: how many questions it asks,
 * how long it waits, and what it does when one of them never comes back.
 */
import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { lyricsFor } from '../src/services/lyrics.service.js'

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

const synced = { syncedLyrics: '[00:01.00] one\n[00:02.00] two', plainLyrics: 'one\ntwo', duration: 200 }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

/** A fake lrclib: `answer` decides each URL's reply; every call is logged with when it started. */
function fakeLrclib(answer: (url: URL, attempt: number) => Promise<Response> | Response) {
  const calls: { url: URL; at: number }[] = []
  const t0 = Date.now()
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
    const url = new URL(String(input))
    calls.push({ url, at: Date.now() - t0 })
    return answer(url, calls.filter((c) => c.url.href === url.href).length)
  }) as typeof fetch
  return calls
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('lyrics lookup', () => {
  it('asks the exact match and the search at the same time, not one after the other', async () => {
    const calls = fakeLrclib(async (url) => {
      await delay(120)
      return url.pathname.endsWith('/get') ? json(null, 404) : json([synced])
    })
    const started = Date.now()
    const out = await lyricsFor({ title: 'Parallel Song', artist: 'Some Artist', duration: 200 })
    const took = Date.now() - started
    assert.equal(out.kind, 'synced')
    assert.equal(calls.length, 2)
    assert.ok(Math.abs(calls[0]!.at - calls[1]!.at) < 60, 'both questions leave together')
    assert.ok(took < 230, `one round trip, not two (${took} ms)`)
  })

  it('both readings of "Artist - Title" are asked together too', async () => {
    const calls = fakeLrclib(async (url) => {
      await delay(100)
      return url.pathname.endsWith('/get') ? json(null, 404) : json([])
    })
    const started = Date.now()
    await lyricsFor({ title: 'Some Band - Some Tune', artist: 'Other', duration: 180 })
    assert.equal(calls.length, 4)
    assert.ok(Date.now() - started < 260, 'four questions, one wait')
  })

  it('a source that stalls does not take the rest down with it, and is tried once more', async () => {
    const calls = fakeLrclib(async (url, attempt) => {
      if (url.pathname.endsWith('/search')) throw new Error('stalled')
      return attempt === 1 ? Promise.reject(new Error('blip')) : json({ ...synced })
    })
    const out = await lyricsFor({ title: 'Flaky Song', artist: 'Flaky Artist', duration: 200 })
    assert.equal(out.kind, 'synced', 'the exact match answered on its retry')
    assert.ok(calls.filter((c) => c.url.pathname.endsWith('/get')).length === 2)
  })

  it('"could not ask" gives no lyrics for now, but is only a short pause — not a lasting no', async () => {
    let up = false
    fakeLrclib(async () => {
      if (!up) throw new Error('down')
      return json([synced])
    })
    const first = await lyricsFor({ title: 'Outage Song', artist: 'Outage Artist', duration: 200 })
    assert.equal(first.kind, 'none')
    /* Within the short pause nothing new is asked (the entry expires after FAILED_MS, not the six-hour TTL). */
    up = true
    const soon = await lyricsFor({ title: 'Outage Song', artist: 'Outage Artist', duration: 200 })
    assert.equal(soon.kind, 'none', 'a moment’s pause, so a struggling service is not hammered')
  })

  it('a room of six asking for the same track makes one lookup', async () => {
    const calls = fakeLrclib(async (url) => {
      await delay(80)
      return url.pathname.endsWith('/get') ? json(null, 404) : json([synced])
    })
    const same = { title: 'Crowd Song', artist: 'Crowd Artist', duration: 200 }
    const all = await Promise.all(Array.from({ length: 6 }, () => lyricsFor(same)))
    assert.ok(all.every((r) => r.kind === 'synced'))
    assert.equal(calls.length, 2, 'two questions in all, not twelve')
    await lyricsFor(same)
    assert.equal(calls.length, 2, 'and the next ask is from memory')
  })
})
