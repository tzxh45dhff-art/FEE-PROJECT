import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildZip } from '../scripts/package.mjs'

// Inspect the central directory, which contains the authoritative entry names.
function entryNames(zip) {
  const names = []
  for (let offset = 0; offset <= zip.length - 22; offset++) {
    if (zip.readUInt32LE(offset) !== 0x06054b50) continue
    const count = zip.readUInt16LE(offset + 10)
    let cursor = zip.readUInt32LE(offset + 16)
    for (let index = 0; index < count; index++) {
      assert.equal(zip.readUInt32LE(cursor), 0x02014b50)
      const nameLength = zip.readUInt16LE(cursor + 28)
      const extraLength = zip.readUInt16LE(cursor + 30)
      const commentLength = zip.readUInt16LE(cursor + 32)
      names.push(zip.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8'))
      cursor += 46 + nameLength + extraLength + commentLength
    }
    return names
  }
  throw new Error('ZIP central directory not found')
}

test('the extension download includes install instructions and needs no local Markdown notes', () => {
  const first = buildZip()
  assert.deepEqual(buildZip(), first, 'packaging should remain deterministic')
  const names = entryNames(first)
  assert.ok(names.includes('manifest.json'))
  assert.ok(names.includes('INSTALL.txt'))
  assert.ok(names.some(name => name.startsWith('src/')))
  assert.ok(!names.some(name => name.toLowerCase().endsWith('.md')))
})
