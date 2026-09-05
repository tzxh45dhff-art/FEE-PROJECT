/**
 * Zip the extension for somebody else's browser.
 *
 * Sideloading is the whole distribution story here — Chrome installs from the
 * Web Store or from a folder, and this is the folder — so this exists to make
 * "send it to the other person" one command rather than a folder-selection
 * ritual that quietly picks up `.DS_Store` and a stale build.
 *
 * Deliberately not a build step for the extension itself. There is nothing to
 * compile: it is plain JavaScript on purpose, so what ships is exactly what is
 * in the repo, and anyone can read the thing they are being asked to install.
 *
 * The zip is written by hand rather than by shelling out to `zip`, which is
 * the one non-obvious decision in here. The app's own build calls this to
 * produce the copy the web page offers for download, and that build runs on
 * Vercel, where no `zip` binary is promised. A dependency would have solved it
 * too; ninety lines of a format that has not changed since 1989 seemed the
 * smaller thing to own, and it makes the output byte-identical between runs.
 *
 *   node extension/scripts/package.mjs
 */

import { deflateRawSync } from 'node:zlib'
import { readFileSync, readdirSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/** What goes in. Everything else in `extension/` is tooling or secrets. */
const INCLUDE = ['manifest.json', 'src', 'README.md']

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let c = i
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  return table
})()

function crc32(buffer) {
  let c = -1
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

/** Every file under `path`, as repo-relative forward-slash names. */
function collect(path, prefix = '') {
  const full = join(root, path)
  if (statSync(full).isFile()) return [{ name: prefix + path.split('/').pop(), data: readFileSync(full) }]

  const out = []
  for (const entry of readdirSync(full).sort()) {
    if (entry === '.DS_Store') continue
    out.push(...collect(join(path, entry), prefix))
  }
  return out.map((f) => ({ ...f, name: f.name.includes('/') ? f.name : `${path}/${f.name}` }))
}

/**
 * A zip, in memory.
 *
 * Timestamps are pinned rather than taken from the clock, so two builds of the
 * same source produce the same bytes. That is what stops every deploy from
 * shipping a "new" download that is identical to the last one.
 */
export function buildZip() {
  const files = INCLUDE.flatMap((entry) => collect(entry))

  /* 1 Jan 2024, in the DOS date/time the format has always used. */
  const DOS_TIME = 0
  const DOS_DATE = ((2024 - 1980) << 9) | (1 << 5) | 1

  const locals = []
  const central = []
  let offset = 0

  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8')
    const compressed = deflateRawSync(file.data, { level: 9 })
    const sum = crc32(file.data)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(8, 8) // deflate
    local.writeUInt16LE(DOS_TIME, 10)
    local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(sum, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(file.data.length, 22)
    local.writeUInt16LE(name.length, 26)
    locals.push(local, name, compressed)

    const entry = Buffer.alloc(46)
    entry.writeUInt32LE(0x02014b50, 0)
    entry.writeUInt16LE(20, 4)
    entry.writeUInt16LE(20, 6)
    entry.writeUInt16LE(0, 8)
    entry.writeUInt16LE(8, 10)
    entry.writeUInt16LE(DOS_TIME, 12)
    entry.writeUInt16LE(DOS_DATE, 14)
    entry.writeUInt32LE(sum, 16)
    entry.writeUInt32LE(compressed.length, 20)
    entry.writeUInt32LE(file.data.length, 24)
    entry.writeUInt16LE(name.length, 28)
    entry.writeUInt32LE(0o644 << 16, 38) // external attributes
    entry.writeUInt32LE(offset, 42)
    central.push(entry, name)

    offset += local.length + name.length + compressed.length
  }

  const directory = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)

  return Buffer.concat([...locals, directory, end])
}

export const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'))

/* Only when run directly — the app's build imports `buildZip` instead. */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outDir = join(root, 'dist')
  const outFile = join(outDir, `huddle-watch-${manifest.version}.zip`)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, buildZip())
  console.log(`packaged ${manifest.name} v${manifest.version}`)
  console.log(outFile)
}
