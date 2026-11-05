/**
 * The Python runner runs code the model wrote from a topic a person typed, so
 * it is treated as hostile. Even a program that climbs out of Python into
 * JavaScript must find no keys, no files and no way to start anything.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { checkPython, runPython } from '../src/services/pyRunner.service.js'

const escape = (js: string) => `
import sys
sys.meta_path.pop(0)
import pyodide_js
print(pyodide_js.runPython.constructor(${JSON.stringify(js)})())
`
const tryIt = (label: string, body: string) => `try { ${body}; return '${label}:ALLOWED' } catch (e) { return '${label}:' + (e.code || 'refused') }`

describe('python runner — the sandbox', () => {
  it('still runs ordinary solutions, quickly and correctly', async () => {
    const results = await checkPython('import sys\nn = int(sys.stdin.buffer.readline())\nprint(n * 2)', [
      { input: '4\n', expected: '8' },
      { input: '5\n', expected: '11' },
    ])
    assert.deepEqual(results, [true, false])
  })

  it('a program that reaches JavaScript can read no secrets', async () => {
    const [out] = (await runPython(escape("return Object.keys(process.env).filter((k) => !k.startsWith('__CF')).length"), ['']))!
    assert.equal(out!.stdout.trim(), '0', 'no environment, so no API keys')
  })

  it('…and cannot run programs, read or write files, or start workers', async () => {
    for (const [label, body] of [
      ['exec', "require('node:child_process').execSync('id')"],
      ['read', "require('node:fs').readFileSync('/etc/hosts')"],
      ['write', "require('node:fs').writeFileSync('/tmp/huddle-sandbox-probe', 'x')"],
      ['worker', "new (require('node:worker_threads').Worker)('1', { eval: true })"],
    ] as const) {
      const [out] = (await runPython(escape(tryIt(label, body)), ['']))!
      assert.equal(out!.stdout.trim(), `${label}:ERR_ACCESS_DENIED`, out!.stdout || out!.error || '')
    }
  })

  it('a loop that never ends is stopped, and the next run still works', async () => {
    assert.equal(await runPython('while True: pass', [''], 2000), null)
    const [after] = (await runPython('print("ok")', ['']))!
    assert.equal(after!.stdout.trim(), 'ok')
  })
})
