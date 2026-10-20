/**
 * Room settings: the owner can rename a room, change its kind and who can get
 * in, and swap its code; nobody else can; and everyone in the room hears.
 */
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import { api, enter, makeRoom, makeUser, next, startServer, type Client, type Harness, type User } from './harness.js'

type Room = { id: string; slug: string; name: string; type: string; visibility: string }

describe('room settings', () => {
  let h: Harness
  let owner: User
  let guest: User
  let room: Room

  before(async () => {
    h = await startServer()
    owner = await makeUser(h.base, 'Aditi')
    guest = await makeUser(h.base, 'Rohan')
    room = (await makeRoom(h.base, owner, guest)) as Room
  })
  after(async () => {
    await h?.stop()
  })

  it('the owner can rename it, change its kind and open it up', async () => {
    const { room: changed } = await api<{ room: Room }>(h.base, owner, `/rooms/${room.id}`, {
      method: 'PATCH',
      body: { name: '  Date night ', type: 'couple', visibility: 'open' },
    })
    assert.equal(changed.name, 'Date night')
    assert.equal(changed.type, 'couple')
    assert.equal(changed.visibility, 'open')
    assert.equal(changed.slug, room.slug, 'the code stays unless asked to change')
  })

  it('a new code replaces the old one, which stops working', async () => {
    const { room: changed } = await api<{ room: Room }>(h.base, owner, `/rooms/${room.id}`, { method: 'PATCH', body: { newCode: true } })
    assert.notEqual(changed.slug, room.slug)
    assert.match(changed.slug, /^date-night-/)
    const late = await makeUser(h.base, 'Late')
    await assert.rejects(api(h.base, late, '/rooms/join', { body: { code: room.slug } }))
    await api(h.base, late, '/rooms/join', { body: { code: changed.slug } })
    room = changed
  })

  it('nobody but the owner can change anything, and nonsense is refused', async () => {
    await assert.rejects(api(h.base, guest, `/rooms/${room.id}`, { method: 'PATCH', body: { name: 'Mine now' } }), /403|Only the person/)
    await assert.rejects(api(h.base, owner, `/rooms/${room.id}`, { method: 'PATCH', body: { visibility: 'public-ish' } }), /400/)
    await assert.rejects(api(h.base, owner, `/rooms/${room.id}`, { method: 'PATCH', body: { name: '   ' } }), /400/)
    await assert.rejects(api(h.base, owner, `/rooms/${room.id}`, { method: 'PATCH', body: { ownerId: guest.id } }), /400/)
  })

  it('everyone in the room is told, with what the database says', async () => {
    const a: Client = await enter(h.base, owner, room.id)
    const r: Client = await enter(h.base, guest, room.id)
    try {
      await api(h.base, owner, `/rooms/${room.id}`, { method: 'PATCH', body: { name: 'Game night' } })
      const heard = next<{ room: Room }>(r, 'room:updated')
      a.emit('room:changed', { roomId: room.id, name: 'a lie' })
      assert.equal((await heard).room.name, 'Game night')
    } finally {
      a.close()
      r.close()
    }
  })
})
