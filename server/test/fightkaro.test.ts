import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FightRooms, description } from '../src/services/fightkaro.service.js'
const offer = description({ type: 'offer', sdp: 'v=0\r\nhost' }, 'offer')
const answer = description({ type: 'answer', sdp: 'v=0\r\nguest' }, 'answer')
test('room lifecycle, retries, ownership and third-player rejection', () => {
  const rooms = new FightRooms()
  const { code, secret } = rooms.create('host', offer)
  assert.match(code, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/)
  assert.deepEqual(rooms.join(code), { offer })
  assert.throws(() => rooms.poll(code, secret, 'intruder'), /another host/)
  assert.equal(rooms.poll(code, secret, 'host').answer, null)
  rooms.answer(code, 'guest', answer)
  rooms.answer(code, 'guest', answer)
  assert.throws(() => rooms.answer(code, 'other', answer), /two players/)
  assert.throws(() => rooms.join(code), /two players/)
  assert.deepEqual(rooms.poll(code, secret, 'host'), { answer })
  rooms.close(code, secret, 'host')
  assert.throws(() => rooms.join(code), /expired/)
  assert.deepEqual(rooms.signal(secret, 'host', 'offer', 1, offer), { desc: offer })
  assert.deepEqual(rooms.signal(secret, 'guest', 'offer', 1), { desc: offer })
  assert.throws(() => rooms.signal(secret, 'guest', 'offer', 2, offer), /role/)
  assert.throws(() => rooms.signal(secret, 'other', 'answer', 1), /participant/)
})
test('expiry, room quota and malformed SDP are bounded', () => {
  let now = 0
  const rooms = new FightRooms(() => now)
  const { code } = rooms.create('host', offer)
  for (let i = 0; i < 4; i++) rooms.create('host', offer)
  assert.throws(() => rooms.create('host', offer), /Too many/)
  now = 600001
  assert.throws(() => rooms.join(code), /expired/)
  rooms.create('host', offer)
  assert.throws(() => description({ type: 'answer', sdp: 'v=0' }, 'offer'), /Invalid/)
  assert.throws(() => description({ type: 'offer', sdp: 'x'.repeat(70000) }, 'offer'), /Invalid/)
})

test('Huddle room matching is atomic, scoped and freed when a player leaves', () => {
  let now = 0
  const rooms = new FightRooms(() => now)
  assert.deepEqual(rooms.claim('room', 'host'), { role: 'host' })
  assert.deepEqual(rooms.claim('room', 'guest'), { role: 'waiting' })
  assert.throws(() => rooms.claim('room', 'host'), /already open/)
  const { code, secret } = rooms.create('host', offer, 'room')
  assert.deepEqual(rooms.claim('room', 'guest'), { role: 'guest', code })
  assert.throws(() => rooms.requireRoom(code, 'other-room'), /same Huddle/)
  rooms.requireRoom(code, 'room')
  rooms.answer(code, 'guest', answer)
  rooms.close(code, secret, 'host')
  assert.throws(() => rooms.claim('room', 'third'), /already fighting/)
  rooms.release('room', 'third')
  assert.throws(() => rooms.claim('room', 'third'), /already fighting/)
  rooms.release('room', 'guest')
  assert.deepEqual(rooms.claim('room', 'third'), { role: 'host' })
  now += 30001
  assert.deepEqual(rooms.claim('room', 'fourth'), { role: 'host' })
})
