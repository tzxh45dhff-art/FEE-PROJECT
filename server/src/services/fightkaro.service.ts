import { randomBytes, randomInt } from 'node:crypto'

export type Description = { type: 'offer' | 'answer'; sdp: string }
type Session = { huddleRoom?: string; code: string; secret: string; owner: string; guest?: string; offer: Description; answer?: Description; expires: number; closed: boolean; signals: Map<string, Description> }
export class FightError extends Error { constructor(public status: number, message: string) { super(message) } }
export function description(value: unknown, kind: 'offer' | 'answer'): Description {
  const v = value as Description | undefined
  if (!v || v.type !== kind || typeof v.sdp !== 'string' || !v.sdp.startsWith('v=0') || v.sdp.length > 65000) throw new FightError(400, 'Invalid connection description')
  return { type: kind, sdp: v.sdp }
}
/**
 * How long a room's match holds the arena without word from a fighter. Open
 * game screens renew it (`touch`), so a closed laptop or a crashed tab frees
 * the room in minutes rather than blocking everyone else for two hours.
 */
export const LOBBY_LEASE = 120000
/** Ephemeral signalling only. Combat remains peer-to-peer; no database writes. */
export class FightRooms {
  private sessions = new Map<string, Session>()
  private lobbies = new Map<string, { owner: string; code?: string; expires: number }>()
  constructor(private now = Date.now) {}
  claim(huddleRoom: string, user: string): { role: 'host' | 'guest' | 'waiting'; code?: string } {
    this.prune()
    let lobby = this.lobbies.get(huddleRoom)
    if (lobby && lobby.expires <= this.now()) { this.lobbies.delete(huddleRoom); lobby = undefined }
    if (!lobby) {
      if (this.lobbies.size >= 500) throw new FightError(429, 'The arena is busy. Try again shortly.')
      this.lobbies.set(huddleRoom, { owner: user, expires: this.now() + 30000 })
      return { role: 'host' }
    }
    if (lobby.owner === user) throw new FightError(409, 'Your match is already open. Return to that tab, or leave it first.')
    if (!lobby.code) return { role: 'waiting' }
    const match = [...this.sessions.values()].find(s => s.code === lobby.code && s.huddleRoom === huddleRoom)
    if (!match || match.expires <= this.now()) { this.lobbies.delete(huddleRoom); return this.claim(huddleRoom, user) }
    if (match.answer || match.closed) throw new FightError(409, 'Two friends are already fighting. Join after their match ends.')
    return { role: 'guest', code: lobby.code }
  }
  release(huddleRoom: string, user: string) {
    const lobby = this.lobbies.get(huddleRoom)
    if (!lobby) return
    const match = [...this.sessions.values()].find(s => s.code === lobby.code && s.huddleRoom === huddleRoom)
    if (lobby.owner !== user && match?.guest !== user) return
    this.lobbies.delete(huddleRoom)
    if (match) match.closed = true
  }
  touch(huddleRoom: string, user: string) {
    const lobby = this.lobbies.get(huddleRoom)
    if (!lobby?.code || lobby.expires <= this.now()) return
    const match = [...this.sessions.values()].find(s => s.code === lobby.code && s.huddleRoom === huddleRoom)
    if (lobby.owner === user || match?.guest === user) lobby.expires = this.now() + LOBBY_LEASE
  }
  requireRoom(code: string, huddleRoom?: string) {
    const match = this.room(code)
    if (match.huddleRoom && match.huddleRoom !== huddleRoom) throw new FightError(403, 'Join from the same Huddle room')
  }
  private prune() {
    for (const [id, s] of this.sessions) if (s.expires <= this.now()) this.sessions.delete(id)
    for (const [id, lobby] of this.lobbies) if (lobby.expires <= this.now()) this.lobbies.delete(id)
  }
  create(owner: string, offer: Description, huddleRoom?: string) {
    this.prune()
    if (this.sessions.size >= 500 || [...this.sessions.values()].filter(s => s.owner === owner && !s.closed).length >= 5) throw new FightError(429, 'Too many rooms. Close an old room first.')
    if (huddleRoom && this.lobbies.get(huddleRoom)?.owner !== owner) throw new FightError(409, 'Start the match from Play first')
    const occupied = new Set([...this.sessions.values()].filter(s => !s.closed).map(s => s.code))
    let code: string
    do { code = Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[randomInt(31)]).join('') } while (occupied.has(code))
    const secret = randomBytes(24).toString('hex')
    this.sessions.set(secret, { huddleRoom, code, secret, owner, offer, expires: this.now() + 600000, closed: false, signals: new Map() })
    if (huddleRoom) this.lobbies.set(huddleRoom, { owner, code, expires: this.now() + LOBBY_LEASE })
    return { code, secret }
  }
  private room(code: string) {
    this.prune()
    const room = [...this.sessions.values()].find(s => s.code === code && !s.closed)
    if (!room) throw new FightError(404, 'Room expired or not found')
    return room
  }
  join(code: string) {
    const room = this.room(code)
    if (room.answer) throw new FightError(409, 'This room already has two players')
    return { offer: room.offer }
  }
  answer(code: string, guest: string, answer: Description) {
    const room = this.room(code)
    // Identical retry is safe after a lost HTTP response; another answer cannot replace it.
    if (room.answer && (room.guest !== guest || room.answer.sdp !== answer.sdp)) throw new FightError(409, 'This room already has two players')
    room.guest = guest; room.answer = answer; room.expires = this.now() + 7200000
    return { ok: true }
  }
  poll(code: string, secret: string, owner: string) {
    const room = this.room(code)
    if (room.secret !== secret || room.owner !== owner) throw new FightError(403, 'This room belongs to another host')
    return { answer: room.answer ?? null }
  }
  close(code: string, secret: string, owner: string) {
    this.prune()
    const room = this.sessions.get(secret)
    if (!room) return { ok: true }
    if (room.code !== code || room.owner !== owner) throw new FightError(403, 'This room belongs to another host')
    // Original client closes room discovery after connecting; retain its recovery session.
    if (room.answer) room.closed = true
    else { this.sessions.delete(secret); if (room.huddleRoom) this.release(room.huddleRoom, owner) }
    return { ok: true }
  }
  signal(sid: string, user: string, kind: string, n: number, value?: Description) {
    this.prune()
    const room = this.sessions.get(sid)
    if (!room) throw new FightError(404, 'Connection session expired')
    if (room.owner !== user && room.guest !== user) throw new FightError(403, 'Not a participant')
    if (!['offer', 'answer'].includes(kind) || !Number.isInteger(n) || n < 1 || n > 10000) throw new FightError(400, 'Invalid recovery request')
    if (value) {
      if ((kind === 'offer' && user !== room.owner) || (kind === 'answer' && user !== room.guest)) throw new FightError(403, 'Wrong connection role')
      room.signals.set(`${kind}:${n}`, value)
      while (room.signals.size > 16) room.signals.delete(room.signals.keys().next().value!)
      room.expires = this.now() + 7200000
    }
    return { desc: room.signals.get(`${kind}:${n}`) ?? null }
  }
}
