/**
 * Room chat: taking messages back. Your own, always; anyone's, only if the
 * room is yours — and only the owner can clear the whole conversation.
 */
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import { enter, makeRoom, makeUser, next, startServer, type Client, type Harness } from './harness.js'

type Message = { id: string; body: string; author: { id: string } }

describe('chat: deleting and clearing', () => {
  let h: Harness
  let owner: Client
  let guest: Client
  let roomId: string
  const ask = <T>(socket: Client, event: string, payload: unknown) => new Promise<T>((resolve) => socket.emit(event, payload, resolve))
  const say = async (socket: Client, body: string) => {
    const arrived = next<{ message: Message }>(socket, 'chat:message')
    socket.emit('chat:send', { roomId, body })
    return (await arrived).message
  }
  const history = async (socket: Client) => {
    const got = next<{ messages: Message[] }>(socket, 'chat:history')
    socket.emit('chat:history', { roomId })
    return (await got).messages.map((m) => m.body)
  }

  before(async () => {
    h = await startServer()
    const uo = await makeUser(h.base, 'Aditi')
    const ug = await makeUser(h.base, 'Rohan')
    roomId = (await makeRoom(h.base, uo, ug)).id
    owner = await enter(h.base, uo, roomId)
    guest = await enter(h.base, ug, roomId)
  })
  after(async () => {
    owner?.close()
    guest?.close()
    await h?.stop()
  })

  it('anyone can delete their own message, and everyone sees it go', async () => {
    const mine = await say(guest, 'oops, wrong room')
    const gone = next<{ id: string }>(owner, 'chat:deleted')
    assert.deepEqual(await ask(guest, 'chat:delete', { roomId, id: mine.id }), { ok: true })
    assert.equal((await gone).id, mine.id)
    assert.ok(!(await history(owner)).includes('oops, wrong room'))
  })

  it('a guest cannot delete someone else’s message, or clear the chat', async () => {
    const theirs = await say(owner, 'house rules: no spoilers')
    const refused = await ask<{ error?: string }>(guest, 'chat:delete', { roomId, id: theirs.id })
    assert.match(refused.error ?? '', /your own/)
    const cleared = await ask<{ error?: string }>(guest, 'chat:clear', { roomId })
    assert.match(cleared.error ?? '', /owner/)
    assert.ok((await history(guest)).includes('house rules: no spoilers'))
  })

  it('the owner can delete anyone’s message and clear the chat for everyone', async () => {
    const guests = await say(guest, 'spoiler: the butler')
    assert.deepEqual(await ask(owner, 'chat:delete', { roomId, id: guests.id }), { ok: true })
    const wiped = next<{ roomId: string }>(guest, 'chat:cleared')
    assert.deepEqual(await ask(owner, 'chat:clear', { roomId }), { ok: true })
    assert.equal((await wiped).roomId, roomId)
    assert.deepEqual(await history(guest), [])
  })
})
