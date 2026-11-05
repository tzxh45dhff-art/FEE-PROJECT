import { Router } from 'express'
import { findMembership } from '../models/room.model.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { iceConfig } from '../services/turn.service.js'
import { description, FightError, FightRooms } from '../services/fightkaro.service.js'

export const fightKaroRoutes = Router()
const rooms = new FightRooms()
fightKaroRoutes.use(requireAuth)
fightKaroRoutes.use(async (req, res, next) => {
  /* Every match belongs to a Huddle room, so a code can't be guessed from outside one. */
  const room = req.query.huddleRoom
  if (!room) { res.status(400).json({ error: 'Choose a Huddle room first' }); return }
  if (typeof room !== 'string' || room.length > 100) { res.status(400).json({ error: 'Invalid Huddle room' }); return }
  try {
    if (!await findMembership(req.userId!, room)) { res.status(403).json({ error: 'Join this Huddle room first' }); return }
    next()
  } catch (error) { next(error) }
})
fightKaroRoutes.all('/lobby', (req, res) => {
  const room = req.query.huddleRoom as string
  try {
    if (req.method === 'POST') res.json(rooms.claim(room, req.userId!))
    else if (req.method === 'PUT') { rooms.touch(room, req.userId!); res.json({ ok: true }) }
    else if (req.method === 'DELETE') { rooms.release(room, req.userId!); res.json({ ok: true }) }
    else res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    if (error instanceof FightError) res.status(error.status).json({ error: error.message })
    else throw error
  }
})
fightKaroRoutes.get('/ice', async (_req, res, next) => {
  try { res.json(await iceConfig()) } catch (error) { next(error) }
})
fightKaroRoutes.all('/room', async (req, res, next) => {
  const user = req.userId!
  const huddleRoom = req.query.huddleRoom as string
  const code = String(req.query.code ?? '').toUpperCase()
  const secret = String(req.query.secret ?? '')
  try {
    if (code && req.method !== 'DELETE') rooms.requireRoom(code, huddleRoom)
    if (!['GET', 'POST', 'DELETE'].includes(req.method)) { res.status(405).json({ error: 'Method not allowed' }); return }
    if (req.query.action === 'signal') {
      if (req.method === 'DELETE') throw new FightError(405, 'Method not allowed')
      const kind = String(req.query.kind), n = Number(req.query.n), sid = String(req.query.sid)
      if (!['offer', 'answer'].includes(kind)) throw new FightError(400, 'Invalid signal type')
      const value = req.method === 'POST' ? description(req.body?.desc, kind as 'offer' | 'answer') : undefined
      const result = await waitFor(() => rooms.signal(sid, user, kind, n, value), r => !!r.desc, req.method === 'GET' ? Number(req.query.wait) : 0, () => res.destroyed)
      if (!res.destroyed) res.json(result)
    } else if (req.method === 'POST' && !req.query.action) {
      res.json(rooms.create(user, description(req.body?.offer, 'offer'), huddleRoom))
    } else if (req.method === 'POST' && req.query.action === 'answer') {
      res.json(rooms.answer(code, user, description(req.body?.answer, 'answer')))
    } else if (req.method === 'DELETE') {
      res.json(rooms.close(code, secret, user))
    } else if (req.method === 'GET' && secret) {
      const result = await waitFor(() => rooms.poll(code, secret, user), r => !!r.answer, Number(req.query.wait), () => res.destroyed)
      if (!res.destroyed) res.json(result)
    } else if (req.method === 'GET') res.json(rooms.join(code))
    else throw new FightError(400, 'Unknown room operation')
  } catch (error) {
    if (error instanceof FightError) { if (!res.destroyed) res.status(error.status).json({ error: error.message }) }
    else next(error)
  }
})
async function waitFor<T>(read: () => T, done: (value: T) => boolean, wait: number, cancelled: () => boolean): Promise<T> {
  const end = Date.now() + (Number.isFinite(wait) ? Math.max(0, Math.min(25, wait)) * 1000 : 0)
  let value = read()
  while (!done(value) && !cancelled() && Date.now() < end) {
    await new Promise(resolve => setTimeout(resolve, 150))
    value = read()
  }
  return value
}
