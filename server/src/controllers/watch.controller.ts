import type { Request, Response } from 'express'
import { z } from 'zod'

import * as queueModel from '../models/queue.model.js'
import { resolveSource, searchAvailable, searchYouTube } from '../services/sources.service.js'
import { assertMembership } from '../services/room.service.js'
import { WATCH_SOURCES } from '../services/watch.service.js'
import { HttpError } from '../utils/HttpError.js'

/**
 * Everything about the watch feature that isn't playback.
 *
 * Playback lives on the socket because it is a stream of small events; the
 * queue lives here because it is durable state with an obvious REST shape.
 */

async function gate(req: Request) {
  const roomId = req.params.id!
  await assertMembership(req.userId!, roomId)
  return roomId
}

export async function search(req: Request, res: Response) {
  await gate(req)

  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (!query) throw HttpError.badRequest('Type something to search for')

  res.json({ results: await searchYouTube(query) })
}

export async function capabilities(req: Request, res: Response) {
  await gate(req)
  /* The client needs to know whether to show a search box or go straight to
     the paste field, and saying so beats letting search fail on first use. */
  res.json({ search: searchAvailable(), sources: WATCH_SOURCES })
}

const resolveBody = z.object({
  input: z.string().trim().min(1, 'Paste a link or a title').max(600),
})

export async function resolve(req: Request, res: Response) {
  await gate(req)

  const parsed = resolveBody.safeParse(req.body)
  if (!parsed.success) {
    throw HttpError.badRequest(parsed.error.issues[0]?.message ?? 'Paste a link or a title')
  }

  res.json({ resolved: await resolveSource(parsed.data.input) })
}

export async function queue(req: Request, res: Response) {
  const roomId = await gate(req)
  res.json({ items: await queueModel.listQueue(roomId) })
}

const addBody = z.object({
  source: z.enum(WATCH_SOURCES),
  ref: z.string().trim().min(1).max(600),
  title: z.string().trim().min(1).max(300),
  duration: z.number().int().positive().nullable().optional(),
  thumbnail: z.string().trim().max(600).nullable().optional(),
})

export async function add(req: Request, res: Response) {
  const roomId = await gate(req)

  const parsed = addBody.safeParse(req.body)
  if (!parsed.success) {
    throw HttpError.badRequest(parsed.error.issues[0]?.message ?? 'Could not add that')
  }

  const item = await queueModel.addToQueue({
    roomId,
    addedById: req.userId!,
    source: parsed.data.source,
    ref: parsed.data.ref,
    title: parsed.data.title,
    duration: parsed.data.duration ?? null,
    thumbnail: parsed.data.thumbnail ?? null,
  })

  res.status(201).json({ item, items: await queueModel.listQueue(roomId) })
}

export async function remove(req: Request, res: Response) {
  const roomId = await gate(req)
  await queueModel.removeFromQueue(roomId, req.params.itemId!)
  res.json({ items: await queueModel.listQueue(roomId) })
}

export async function clear(req: Request, res: Response) {
  const roomId = await gate(req)
  await queueModel.clearQueue(roomId)
  res.json({ items: [] })
}

const reorderBody = z.object({ ids: z.array(z.string()).max(200) })

export async function reorder(req: Request, res: Response) {
  const roomId = await gate(req)

  const parsed = reorderBody.safeParse(req.body)
  if (!parsed.success) throw HttpError.badRequest('Could not reorder the queue')

  res.json({ items: await queueModel.reorderQueue(roomId, parsed.data.ids) })
}
