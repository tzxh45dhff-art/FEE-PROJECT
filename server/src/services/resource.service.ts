import path from 'node:path'
import { rm } from 'node:fs/promises'

import { prisma } from '../models/prisma.js'
import { UPLOAD_DIR } from './upload.service.js'
import * as embeddings from './embeddings.service.js'
import { chunk, extract } from './extract.service.js'

/**
 * Turning an uploaded document into something the shelf can answer from.
 *
 * The work happens after the upload has already replied. Reading a textbook,
 * splitting it and embedding every piece is tens of seconds and a few dozen
 * calls to Azure — inside the request that would be a request that times out,
 * and the person watching would have no idea whether their file arrived.
 *
 * So the row is written first with `status: 'pending'`, the response goes
 * back, and this runs on afterwards, moving the row through `processing` to
 * `ready` or `failed`. The client polls the list it already has open. That is
 * the same shape `publish.service.ts` uses for transcoding a film, for the
 * same reason.
 */

export const RESOURCE_STATUS = ['pending', 'processing', 'ready', 'failed'] as const
export type ResourceStatus = (typeof RESOURCE_STATUS)[number]

export function filePath(file: string) {
  return path.join(UPLOAD_DIR, file)
}

async function fail(resourceId: string, message: string) {
  await prisma.resource
    .update({ where: { id: resourceId }, data: { status: 'failed', error: message } })
    .catch(() => undefined)
}

/**
 * Read, split, embed, store.
 *
 * Never throws to its caller — it is started with `void` and there is nobody
 * left to catch it by the time it runs. Everything that can go wrong is
 * recorded on the row instead, because the row is the only thing the person
 * who uploaded the file is still looking at.
 */
export async function ingest(resourceId: string): Promise<void> {
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } })
  if (!resource) return

  try {
    await prisma.resource.update({
      where: { id: resourceId },
      data: { status: 'processing', error: null },
    })

    const extracted = await extract(filePath(resource.file), resource.mimeType)
    const pieces = chunk(extracted)

    /*
     * A file that parsed but said nothing is a scan, almost always.
     *
     * Worth its own message rather than a generic failure: "this looks like a
     * scan" tells somebody to go and find a text version, where "could not
     * process" tells them to try the same file again.
     */
    if (pieces.length === 0) {
      await fail(
        resourceId,
        'No text could be read from this file. If it is a scan or photographs of pages, the words are pictures — a text version of the same document will work.',
      )
      return
    }

    const vectors = await embeddings.embed(pieces.map((piece) => piece.text))
    if (vectors.length !== pieces.length) {
      await fail(resourceId, 'The embedding model returned a different number of vectors.')
      return
    }

    /*
     * Replace rather than append.
     *
     * Ingest can run twice for one resource — a retry after a rate limit, or a
     * server restarted mid-run. Without clearing first, the second pass leaves
     * two copies of every passage, and retrieval then returns the same page
     * twice and spends half the model's context repeating itself.
     */
    await prisma.$transaction([
      prisma.resourceChunk.deleteMany({ where: { resourceId } }),
      prisma.resourceChunk.createMany({
        data: pieces.map((piece, index) => ({
          resourceId,
          roomId: resource.roomId,
          subjectId: resource.subjectId,
          index: piece.index,
          page: piece.page,
          text: piece.text,
          embedding: JSON.stringify(vectors[index]),
        })),
      }),
      prisma.resource.update({
        where: { id: resourceId },
        data: { status: 'ready', error: null, chunkCount: pieces.length },
      }),
    ])
  } catch (cause) {
    await fail(resourceId, cause instanceof Error ? cause.message : 'Could not read this file.')
  }
}

/** Start an ingest and return immediately. See the note at the top. */
export function ingestInBackground(resourceId: string) {
  void ingest(resourceId).catch(() => undefined)
}

/**
 * Delete a resource, its chunks, and the file behind it.
 *
 * The row goes through Prisma's cascade; the file on disk has nothing to
 * cascade from, so it is removed here. A missing file is not an error worth
 * surfacing — the row is going either way, and a resource that half-exists is
 * worse than one that is fully gone.
 */
export async function remove(resourceId: string) {
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } })
  if (!resource) return

  await prisma.resource.delete({ where: { id: resourceId } })
  await rm(filePath(resource.file), { force: true }).catch(() => undefined)
}
