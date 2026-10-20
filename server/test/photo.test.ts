/**
 * Photo booth: only real images are kept, only the room sees them, only their
 * taker or the room's owner can delete them, and the countdown reaches
 * everyone so the whole room can pose.
 */
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import { sniffImage } from '../src/controllers/photo.controller.js'
import { api, enter, makeRoom, makeUser, next, startServer, type Client, type Harness, type User } from './harness.js'

/* The smallest thing that starts like a JPEG — the server checks the bytes, not the label. */
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9])

describe('photo bytes', () => {
  it('knows a JPEG, PNG and WebP by their bytes, and nothing else', () => {
    assert.equal(sniffImage(JPEG), 'jpg')
    assert.equal(sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])), 'png')
    assert.equal(sniffImage(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'binary')), 'webp')
    assert.equal(sniffImage(Buffer.from('<html><script>')), null)
  })
})

describe('photo booth', () => {
  let h: Harness
  let owner: User
  let guest: User
  let roomId: string
  let a: Client
  let r: Client

  const upload = async (user: User, bytes: Buffer, caption = 'us', type = 'image/jpeg') => {
    const form = new FormData()
    form.append('caption', caption)
    form.append('frame', 'polaroid')
    form.append('photo', new Blob([new Uint8Array(bytes)], { type }), 'photo.jpg')
    const res = await fetch(`${h.base}/api/rooms/${roomId}/photos`, { method: 'POST', headers: { Authorization: `Bearer ${user.token}` }, body: form })
    return { status: res.status, body: (await res.json()) as { item?: { id: string; url: string; caption: string; frame: string } } }
  }

  before(async () => {
    h = await startServer()
    owner = await makeUser(h.base, 'Aditi')
    guest = await makeUser(h.base, 'Rohan')
    roomId = (await makeRoom(h.base, owner, guest)).id
    a = await enter(h.base, owner, roomId)
    r = await enter(h.base, guest, roomId)
  })
  after(async () => {
    a?.close()
    r?.close()
    await h?.stop()
  })

  it('keeps a photo with its caption, lists it, and serves the file', async () => {
    const saved = await upload(guest, JPEG, '  our first   photo ')
    assert.equal(saved.status, 201)
    assert.equal(saved.body.item!.caption, 'our first photo')
    assert.equal(saved.body.item!.frame, 'polaroid')
    const listed = await api<{ items: { id: string }[] }>(h.base, owner, `/rooms/${roomId}/photos`)
    assert.ok(listed.items.some((p) => p.id === saved.body.item!.id))
    const file = await fetch(`${h.base}${saved.body.item!.url}`)
    assert.equal(file.status, 200)
    assert.deepEqual(Buffer.from(await file.arrayBuffer()), JPEG)
  })

  it('refuses anything that is not an image, whatever it claims', async () => {
    const fake = await upload(owner, Buffer.from('<html>hi</html>'), 'x', 'image/jpeg')
    assert.equal(fake.status, 400)
  })

  it('is the room’s alone: strangers can neither list nor add', async () => {
    const stranger = await makeUser(h.base, 'Stranger')
    await assert.rejects(api(h.base, stranger, `/rooms/${roomId}/photos`))
    assert.notEqual((await upload(stranger, JPEG)).status, 201)
  })

  it('only its taker or the room’s owner can delete it, and the file goes too', async () => {
    const mine = await upload(owner, JPEG, 'owner’s')
    await assert.rejects(api(h.base, guest, `/rooms/${roomId}/photos/${mine.body.item!.id}`, { method: 'DELETE' }))
    const theirs = await upload(guest, JPEG, 'guest’s')
    await api(h.base, owner, `/rooms/${roomId}/photos/${theirs.body.item!.id}`, { method: 'DELETE' })
    assert.equal((await fetch(`${h.base}${theirs.body.item!.url}`)).status, 404)
  })

  const ask = <T>(socket: Client, event: string, payload: unknown) => new Promise<T>((resolve) => socket.emit(event, payload, resolve))

  it('the countdown reaches everyone, and only one person shoots at a time', async () => {
    const seen = next<{ by: { name: string }; firesAt: number; serverTime: number }>(r, 'booth:countdown')
    const started = await ask<{ ok?: boolean; firesAt?: number }>(a, 'booth:countdown', { roomId })
    assert.ok(started.ok)
    const countdown = await seen
    assert.equal(countdown.by.name, 'Aditi')
    assert.ok(countdown.firesAt - countdown.serverTime >= 3000)
    const clash = await ask<{ error?: string }>(r, 'booth:countdown', { roomId })
    assert.match(clash.error ?? '', /Aditi is taking a photo/)
  })

  it('a saved photo is announced to the room', async () => {
    const saved = await upload(owner, JPEG, 'announced')
    const seen = next<{ photo: { id: string; caption: string; url: string } }>(r, 'photo:new')
    a.emit('photo:shared', { roomId, id: saved.body.item!.id })
    const got = await seen
    assert.equal(got.photo.caption, 'announced')
    assert.match(got.photo.url, /^\/uploads\/photos\//)
  })
})
