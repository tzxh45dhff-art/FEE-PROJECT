import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { api, makeRoom, makeUser, startServer, type Harness, type User } from './harness.js'
let server: Harness, host: User, guest: User, outsider: User, room: { id: string; slug: string }
before(async () => {
  server = await startServer()
  host = await makeUser(server.base, 'FighterOne')
  guest = await makeUser(server.base, 'FighterTwo')
  outsider = await makeUser(server.base, 'Spectator')
  room = await makeRoom(server.base, host, guest)
})
after(async () => { await server?.stop() })
test('authenticated Huddle members pair, exchange descriptions and release the room', async () => {
  const lobby = `/fightkaro/lobby?huddleRoom=${room.id}`
  const unauth = await fetch(`${server.base}/api${lobby}`, { method: 'POST' })
  assert.equal(unauth.status, 401)
  await assert.rejects(api(server.base, outsider, lobby, { method: 'POST' }), /403/)
  assert.deepEqual(await api(server.base, host, lobby, { method: 'POST' }), { role: 'host' })
  assert.deepEqual(await api(server.base, guest, lobby, { method: 'POST' }), { role: 'waiting' })
  const offer = { type: 'offer', sdp: 'v=0\r\nhost' }
  const answer = { type: 'answer', sdp: 'v=0\r\nguest' }
  const match = await api<{ code: string; secret: string }>(server.base, host, `/fightkaro/room?huddleRoom=${room.id}`, { body: { offer } })
  assert.deepEqual(await api(server.base, guest, lobby, { method: 'POST' }), { role: 'guest', code: match.code })
  await assert.rejects(api(server.base, outsider, `/fightkaro/room?code=${match.code}&huddleRoom=${room.id}`), /403/)
  await assert.rejects(api(server.base, guest, `/fightkaro/room?code=${match.code}`), /400/)
  const path = `/fightkaro/room?code=${match.code}&huddleRoom=${room.id}`
  assert.deepEqual(await api(server.base, guest, path), { offer })
  const pending = api(server.base, host, `${path}&secret=${match.secret}&wait=3`)
  await api(server.base, guest, `${path}&action=answer`, { body: { answer } })
  assert.deepEqual(await pending, { answer })
  await api(server.base, host, `${path}&secret=${match.secret}`, { method: 'DELETE' })
  await assert.rejects(api(server.base, guest, lobby, { method: 'POST' }), /409/)
  await api(server.base, guest, lobby, { method: 'DELETE' })
  assert.deepEqual(await api(server.base, guest, lobby, { method: 'POST' }), { role: 'host' })
})
