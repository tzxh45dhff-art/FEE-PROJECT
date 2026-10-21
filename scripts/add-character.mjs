#!/usr/bin/env node
/**
 * Add a 3D character to the hub, compressed the way the existing ones are.
 *
 *   npm run character -- ~/Downloads/maya.glb
 *   npm run character -- ~/Downloads/maya.glb --name maya
 *
 * Takes a .glb straight out of Blender (or Mixamo → Blender), and writes a
 * smaller copy into src/assets/characters/, where the hub picks it up on its
 * own. The settings match the characters already there: textures re-encoded
 * as WebP and capped at 1024px — almost all of a character's weight is its
 * textures — and the geometry left as it is, so skinning and animation are
 * untouched. It then prints the before and after sizes and the animation
 * clips it found, so you can see at a glance whether it has an idle.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const input = args.find((a) => !a.startsWith('--'))
const nameFlag = args.indexOf('--name')
if (!input || !existsSync(input)) {
  console.error('Usage: npm run character -- path/to/character.glb [--name shortname]')
  process.exit(1)
}

const base =
  (nameFlag >= 0 ? args[nameFlag + 1] : path.basename(input, path.extname(input)))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'character'
const out = path.resolve(import.meta.dirname, '../src/assets/characters', `${base}.glb`)
const mb = (file) => (statSync(file).size / 1024 / 1024).toFixed(2)

console.log(`\n  Compressing ${path.basename(input)} → src/assets/characters/${base}.glb …`)
execFileSync(
  'npx',
  ['-y', '@gltf-transform/cli@4', 'optimize', input, out, '--compress', 'false', '--simplify', 'false', '--texture-compress', 'webp', '--texture-size', '1024'],
  { stdio: ['ignore', 'ignore', 'inherit'] },
)

/* The clip names, read from the file's own JSON header — no tool needed. */
function clipsIn(file) {
  const bytes = readFileSync(file)
  const length = bytes.readUInt32LE(12)
  const json = JSON.parse(bytes.subarray(20, 20 + length).toString('utf8'))
  return (json.animations ?? []).map((clip, i) => clip.name || `clip ${i + 1}`)
}
const clips = clipsIn(out)

console.log(`  ${mb(input)} MB → ${mb(out)} MB`)
if (Number(mb(out)) > 4) console.log('  ⚠  Still over 4 MB — try fewer or smaller textures in Blender, or one animation clip.')
console.log(clips.length ? `  Animation clips: ${clips.join(', ')}` : '  No animation clips found — it will stand still with a gentle procedural breath.')
console.log(`  Done. Open the hub → Settings → Your character to pick it.\n`)
