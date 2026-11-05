/**
 * The HTTP doors that guessing and uploads get through: sign-in, room codes,
 * and the uploads folder.
 */
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import express from 'express'

import { rateLimit } from '../src/middleware/rateLimit.js'
import { slugify } from '../src/utils/slug.js'

async function serve(app: express.Express) {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  return { base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, close: () => server.close() }
}

describe('rate limits', () => {
  let base = ''
  let close = () => {}
  before(async () => {
    const app = express()
    app.use(express.json())
    app.post('/try', rateLimit({ max: 3, windowMs: 60_000, key: (req) => String(req.body.who), message: 'slow down' }), (_req, res) => {
      res.json({ ok: true })
    })
    ;({ base, close } = await serve(app))
  })
  after(() => close())

  const attempt = (who: string) => fetch(`${base}/try`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ who }) })

  it('lets a few tries through, then says to wait — and how long', async () => {
    for (let i = 0; i < 3; i++) assert.equal((await attempt('a')).status, 200)
    const refused = await attempt('a')
    assert.equal(refused.status, 429)
    assert.deepEqual(await refused.json(), { error: 'slow down' })
    assert.ok(Number(refused.headers.get('retry-after')) > 0)
  })

  it('counts each key on its own', async () => {
    assert.equal((await attempt('b')).status, 200)
  })
})

describe('room codes', () => {
  it('end in six characters that read aloud cleanly, and do not repeat', () => {
    const codes = new Set(Array.from({ length: 2000 }, () => slugify('Movie Night')))
    for (const code of codes) assert.match(code, /^movie-night-[a-hj-km-np-z2-9]{6}$/)
    assert.equal(codes.size, 2000)
  })
})

describe('the uploads folder', () => {
  let base = ''
  let close = () => {}
  before(async () => {
    /* A folder of its own, so the real uploads are never touched. Set before the app loads, which reads it once. */
    const dir = mkdtempSync(path.join(os.tmpdir(), 'huddle-uploads-'))
    process.env.UPLOAD_DIR = dir
    writeFileSync(path.join(dir, 'page.html'), '<script>alert(1)</script>')
    writeFileSync(path.join(dir, 'song.mp3'), 'ID3')
    const { createApp } = await import('../src/app.js')
    ;({ base, close } = await serve(createApp()))
  })
  after(() => close())

  it('serves the media the app plays, never sniffed into anything else', async () => {
    const song = await fetch(`${base}/uploads/song.mp3`)
    assert.equal(song.status, 200)
    assert.equal(song.headers.get('x-content-type-options'), 'nosniff')
  })

  it('refuses everything else — an uploaded page never runs on the API’s address', async () => {
    assert.equal((await fetch(`${base}/uploads/page.html`)).status, 404)
    assert.equal((await fetch(`${base}/uploads/..%2Fpackage.json`)).status, 404)
  })
})
