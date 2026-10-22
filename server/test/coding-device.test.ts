/**
 * Coding problems run on people's own devices: the server hands out inputs,
 * marks the outputs that come back, and checks new problems' cases with
 * Python run on this machine instead of a remote judge.
 */
import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import express from 'express'
import { z } from 'zod'

import { errorHandler } from '../src/middleware/errorHandler.js'
import { splitCases } from '../src/services/generate.service.js'
import { grade } from '../src/services/judge.service.js'
import { checkPython, runPython } from '../src/services/pyRunner.service.js'

const cases = [
  { id: 'a', input: 'hello', expected: 'olleh', hidden: false },
  { id: 'b', input: 'ab', expected: 'ba', hidden: false },
  { id: 'c', input: 'xyz', expected: 'zyx', hidden: true },
]

describe('marking output from a device', () => {
  it('passes when every case matches, forgiving a trailing newline', () => {
    const verdict = grade(cases, [
      { id: 'a', stdout: 'olleh\n', error: null },
      { id: 'b', stdout: 'ba', error: null },
      { id: 'c', stdout: 'zyx  \n', error: null },
    ])
    assert.equal(verdict.status, 'passed')
    assert.equal(verdict.passedCount, 3)
    assert.equal(verdict.shown?.input, 'hello')
  })

  it('a wrong hidden case says so without giving the case away', () => {
    const verdict = grade(cases, [
      { id: 'a', stdout: 'olleh', error: null },
      { id: 'b', stdout: 'ba', error: null },
      { id: 'c', stdout: 'nope', error: null },
    ])
    assert.equal(verdict.status, 'failed')
    assert.equal(verdict.passedCount, 2)
    assert.match(verdict.detail ?? '', /hidden case \(3 of 3\)/)
    assert.ok(!JSON.stringify(verdict).includes('zyx'), 'the expected output of a hidden case never leaves')
  })

  it('an error or a missing case is an error, not a pass', () => {
    assert.equal(grade(cases, [{ id: 'a', stdout: '', error: 'ZeroDivisionError: division by zero' }]).status, 'error')
    const missing = grade(cases, [{ id: 'a', stdout: 'olleh', error: null }])
    assert.equal(missing.status, 'error')
    assert.equal(missing.passedCount, 1)
  })

  it('the first three cases are examples and the rest are hidden', () => {
    const split = splitCases(Array.from({ length: 6 }, (_, i) => ({ input: `${i}`, expected: `${i}` })))
    assert.deepEqual(
      split.map((c) => c.hidden),
      [false, false, false, true, true, true],
    )
    assert.deepEqual(splitCases([{ input: '1', expected: '1' }]).map((c) => c.hidden), [false])
  })
})

describe('python on this machine', () => {
  it('runs a program against several inputs, including sys.stdin.buffer', async () => {
    const results = await runPython('import sys\nprint(sum(map(int, sys.stdin.buffer.read().split())))', ['1 2 3', '10 -4'])
    assert.deepEqual(
      results?.map((r) => r.stdout.trim()),
      ['6', '6'],
    )
  })

  it('says which cases a reference gets right', async () => {
    assert.deepEqual(
      await checkPython('print(input()[::-1])', [
        { input: 'abc', expected: 'cba' },
        { input: 'abc', expected: 'abc' },
      ]),
      [true, false],
    )
  })

  it('cannot reach JavaScript, and so cannot reach the machine', async () => {
    const [js] = (await runPython('import js\nprint(js.process.pid)', [''])) ?? []
    assert.match(js?.error ?? '', /not available/)
    const [ffi] = (await runPython('from pyodide.ffi import to_js', [''])) ?? []
    assert.match(ffi?.error ?? '', /not available/)
  })

  it('a loop that never ends is stopped, and the next run still works', async () => {
    assert.equal(await runPython('while True:\n    pass', [''], 1500), null)
    assert.deepEqual(await checkPython('print(1 + 1)', [{ input: '', expected: '2' }]), [true])
  })
})

describe('a request that fails validation', () => {
  const app = express()
  app.get('/', () => {
    z.object({ difficulty: z.enum(['easy', 'hard']) }).parse({ difficulty: 'mixed' })
  })
  app.use(errorHandler)
  const server = app.listen(0)
  after(() => server.close())

  it('is a 400 that names the field, not a 500', async () => {
    const { port } = server.address() as { port: number }
    const response = await fetch(`http://127.0.0.1:${port}/`)
    assert.equal(response.status, 400)
    assert.match(((await response.json()) as { error: string }).error, /^difficulty: /)
  })
})
