import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '../../public/fightkaro')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const manifest = JSON.parse(read('provenance.json')) as {
  assets: { path: string; sha256: string }[]
  localPatched: Record<string, string>
}
test('FightKaro update includes every recorded asset with the expected bytes', () => {
  for (const [path, expected] of Object.entries(manifest.localPatched)) {
    assert.equal(
      createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex'),
      expected,
      path,
    )
  }
  for (const asset of manifest.assets) {
    const bytes = readFileSync(resolve(root, asset.path))
    const expected = manifest.localPatched[asset.path] ?? asset.sha256
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      expected,
      asset.path,
    )
    assert.ok(
      !bytes
        .subarray(0, 100)
        .toString()
        .toLowerCase()
        .includes('<!doctype html'),
      `${asset.path}: HTML fallback instead of an asset`,
    )
  }
})
test('active game document, runtime and renderer resolve local assets', () => {
  const html = read('index.html')
  assert.ok(html.includes("localStorage.getItem('huddle-fightkaro:legal-v1')"))
  assert.ok(!html.includes('location.replace('))
  const entry = html.match(/src="\/fightkaro\/(assets\/main-[^"]+\.js)"/)![1]!
  const runtime = read(entry)
  const renderer = runtime.match(/from "\.\/(three-[^"]+\.js)"/)![1]!
  for (const source of [html, runtime, read(`assets/${renderer}`)]) {
    for (const match of source.matchAll(
      /["'`]\/fightkaro\/([^"'`\s<>]+)["'`]/g,
    )) {
      const path = match[1]!.split('?')[0]!
      if (path.includes('${') || !path || path.endsWith('/')) continue
      assert.ok(existsSync(resolve(root, path)), path)
    }
  }
  for (const id of ['ravi', 'lalu']) {
    assert.match(html, new RegExp(`data-tile="${id}"`))
    for (const device of ['', 'mobile/'])
      assert.ok(existsSync(resolve(root, `models/${device}${id}.glb`)))
    assert.ok(existsSync(resolve(root, `faces/${id}.webp`)))
  }
  assert.ok(runtime.includes("fetch('/api/fightkaro/lobby'"))
  assert.ok(runtime.includes('huddle-fightkaro:muted'))
  assert.ok(runtime.includes('if (parent !== window) return;'))
  assert.match(
    runtime,
    /function We\(\) \{\}/,
    'upstream analytics remains disabled',
  )
  assert.match(read('assets/rooms-CRfnBsqC.js'), /\/api\/fightkaro\/room/)
})

test('updated peers exchange the new roster and reject incompatible cached builds', async () => {
  const { runInNewContext } = await import('node:vm')
  const entry = read('index.html').match(
    /src="\/fightkaro\/(assets\/main-[^"]+\.js)"/,
  )![1]!
  const runtime = read(entry)
  const callbacks = runtime.slice(
    runtime.indexOf('var tm = {'),
    runtime.indexOf('function rm(e)'),
  )
  const send = runtime.slice(
    runtime.indexOf('function im()'),
    runtime.indexOf('function am()'),
  )
  const received: Record<string, unknown>[] = []
  const errors: string[] = []
  const scope = {
    $: { ready: true, friendPick: null as string | null, friendReady: false },
    Q: {
      role: 'guest',
      send: (value: Record<string, unknown>) => received.push(value),
    },
    X: 'ravi',
    Kf: 'sansad',
    Uf: 'select',
    fm: (message: string) => errors.push(message),
    lp: () => {},
    kp: () => {},
    am: () => {},
  }
  runInNewContext(
    `${callbacks}\n${send}\nim();tm.onLobby({build:'huddle-20261106',pick:'lalu',ready:true,stage:'road'});`,
    scope,
  )
  assert.equal(received[0]?.build, 'huddle-20261106')
  assert.equal(received[0]?.pick, 'ravi')
  assert.equal(scope.$.friendPick, 'lalu')
  assert.equal(scope.$.friendReady, true)
  assert.equal(scope.Kf, 'road')
  assert.equal(errors.length, 0)
  runInNewContext(`${callbacks}\ntm.onLobby({pick:'modi',ready:true});`, scope)
  assert.match(errors[0] ?? '', /older arena/)
  assert.equal(
    scope.$.friendPick,
    'lalu',
    'incompatible peer must not change the match',
  )
})
