import { spawn as spawnProcess, type ChildProcess } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Python, run on this machine — for checking generated test cases.
 *
 * A new problem's cases are checked by running a reference solution against
 * them. That used to go to the public Judge0 instance, which takes about
 * thirty seconds a run; here it is Python compiled to WebAssembly (Pyodide)
 * in a worker thread, which takes milliseconds once it has loaded.
 *
 * Only for the reference solutions the model writes — never for code a
 * person submits, which runs on their own device instead. But the model writes
 * them from a topic a person typed, so they are treated as hostile all the
 * same: Python's bridges back into JavaScript are removed, and — because those
 * bridges can be rebuilt by a determined enough program — the runner lives in
 * its own Node process under Node's permission model, with no environment (so
 * no API keys), read access to Pyodide's own files and nothing else, and no
 * way to write a file, start a program or load a native module. It is killed
 * if a run goes past its time, which is the only reliable way to stop a loop
 * that never ends.
 */

export type PyResult = { stdout: string; error: string | null }

const BATCH_TIMEOUT_MS = 15_000

/* The runner's own source, run with `-e` so it needs no separate file in
   either the TypeScript tree or the built one. */
const RUNNER = `
const where = JSON.parse(process.argv[1])
/* Pyodide asks Node's internals for one thing — the file-flag numbers — and the
   permission model refuses the whole door. Hand it that one answer, nothing else. */
const flags = require('node:fs').constants
process.binding = (name) => {
  if (name === 'constants') return { fs: flags }
  throw new Error('not available here')
}
let ready = null
async function boot() {
  const { loadPyodide } = await import(where.pyodide)
  /* An empty object for Python's \`js\` module, so even a program that gets it back finds nothing. */
  const py = await loadPyodide({ indexURL: where.index, jsglobals: {} })
  py.runPython(\`
import sys, io, builtins

class _Blocked:
    """Refuse the modules that reach back into JavaScript, and therefore Node."""
    BLOCKED = {'js', 'pyodide_js', 'pyodide', '_pyodide', 'pyodide.ffi', 'micropip'}
    def find_spec(self, name, path=None, target=None):
        if name.split('.')[0] in self.BLOCKED:
            raise ImportError(f"{name} is not available here")
        return None

for _name in list(sys.modules):
    if _name.split('.')[0] in _Blocked.BLOCKED:
        del sys.modules[_name]
sys.meta_path.insert(0, _Blocked())

def __run_case(source, stdin):
    out = io.StringIO()
    sys.stdin = io.TextIOWrapper(io.BytesIO(stdin.encode()), encoding='utf-8')
    sys.stdout = out
    error = None
    try:
        exec(compile(source, 'solution.py', 'exec'), {'__name__': '__main__', '__builtins__': builtins})
    except SystemExit:
        pass
    except BaseException as exc:
        error = f"{type(exc).__name__}: {exc}"
    finally:
        sys.stdout = sys.__stdout__
        sys.stdin = sys.__stdin__
    return [out.getvalue(), error]
\`)
  return py
}
process.on('message', async ({ id, code, inputs }) => {
  try {
    ready ??= boot()
    const py = await ready
    const run = py.globals.get('__run_case')
    const results = inputs.map((stdin) => {
      const pair = run(code, stdin)
      const [stdout, error] = pair.toJs()
      pair.destroy()
      return { stdout, error: error ?? null }
    })
    run.destroy()
    process.send({ id, results })
  } catch (cause) {
    process.send({ id, failed: String(cause && cause.message || cause) })
  }
})
/* Its only job is answering the server; when the server goes, so does it. */
process.on('disconnect', () => process.exit(0))
`

/* Node 22 before 22.13 named it experimentally; either way it is the same model. */
const PERMISSION_FLAG = process.allowedNodeEnvironmentFlags.has('--permission') ? '--permission' : '--experimental-permission'

let worker: ChildProcess | null = null
let nextId = 0
/* Per runner, so a killed one settles only its own runs. */
const pending = new WeakMap<ChildProcess, Map<number, (value: PyResult[] | null) => void>>()

function spawn() {
  const entry = createRequire(import.meta.url).resolve('pyodide/pyodide.mjs')
  const index = path.dirname(entry) + path.sep
  const created = spawnProcess(
    process.execPath,
    [
      PERMISSION_FLAG,
      `--allow-fs-read=${index}*`,
      '--max-old-space-size=512',
      '-e',
      RUNNER,
      JSON.stringify({ pyodide: pathToFileURL(entry).href, index }),
    ],
    /* No environment at all: nothing it runs can read a key, a password or a path. */
    { env: {}, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] },
  )
  const waiting = new Map<number, (value: PyResult[] | null) => void>()
  pending.set(created, waiting)
  created.on('message', (message: { id: number; results?: PyResult[]; failed?: string }) => {
    if (message.failed) console.error('[syncroom] python runner:', message.failed)
    waiting.get(message.id)?.(message.results ?? null)
    waiting.delete(message.id)
  })
  let errors = ''
  created.stderr?.on('data', (chunk: Buffer) => {
    errors = (errors + chunk.toString()).slice(-2000)
  })
  const reset = () => {
    if (worker === created) worker = null
    for (const resolve of waiting.values()) resolve(null)
    waiting.clear()
  }
  created.on('error', (cause) => {
    console.error('[syncroom] python runner', cause instanceof Error ? cause.message : cause)
    reset()
  })
  created.on('exit', (code) => {
    if (code && errors.trim()) console.error('[syncroom] python runner stopped:', errors.trim().split('\n').slice(-3).join(' | '))
    reset()
  })
  /* Never what keeps the server (or a test run) alive. Node re-holds the
     channel a tick after a message listener is added, so this waits for that. */
  const errorPipe = created.stderr as (typeof created.stderr & { unref?: () => void }) | null
  created.unref()
  errorPipe?.unref?.()
  setImmediate(() => created.channel?.unref())
  return created
}

/** Run one program against each input. Null when it could not be run at all. */
export function runPython(code: string, inputs: string[], timeoutMs = BATCH_TIMEOUT_MS): Promise<PyResult[] | null> {
  worker ??= spawn()
  const current = worker
  const waiting = pending.get(current)!
  const id = nextId++
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      /* Something did not finish. The worker is the only thing that can stop
         it, so it goes, and the next call starts a fresh one. */
      waiting.delete(id)
      if (worker === current) worker = null
      current.kill('SIGKILL')
      resolve(null)
    }, timeoutMs)
    waiting.set(id, (value) => {
      clearTimeout(timer)
      resolve(value)
    })
    current.send({ id, code, inputs })
  })
}

/** The same comparison the judge makes: trailing spaces and final newlines forgiven. */
function tidy(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '')
}

/** Which cases this Python program gets right, or null if it could not be run. */
export async function checkPython(code: string, cases: { input: string; expected: string }[]): Promise<boolean[] | null> {
  const results = await runPython(code, cases.map((c) => c.input))
  if (!results) return null
  return results.map((result, index) => !result.error && tidy(result.stdout) === tidy(cases[index]!.expected))
}
