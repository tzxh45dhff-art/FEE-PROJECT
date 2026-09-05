/**
 * Put the extension where the app can hand it to somebody.
 *
 * Installing this on a second device used to mean the person who built it
 * finding the zip, sending it over some chat app, and the other person
 * trusting a file that arrived from a human. The app already knows about the
 * extension — it tells you whether one is installed — so the honest place for
 * the download is next to that, served from the same origin as the page
 * making the offer.
 *
 * Run as part of `npm run build`, which is what makes the download impossible
 * to leave stale: it is rebuilt from `extension/` on every deploy rather than
 * being a binary somebody remembered to commit. Nothing here is checked in —
 * `public/huddle-extension.zip` is gitignored and generated.
 *
 * The filename is deliberately stable, with no version in it. A versioned name
 * would mean the page and the file agreeing on a string, which is one more
 * thing that can drift; the version is reported separately, from the manifest.
 *
 *   node scripts/pack-extension.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildZip, manifest } from '../extension/scripts/package.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'huddle-extension.zip')

mkdirSync(dirname(out), { recursive: true })
const zip = buildZip()
writeFileSync(out, zip)

console.log(`extension v${manifest.version} → public/huddle-extension.zip (${zip.length} bytes)`)
