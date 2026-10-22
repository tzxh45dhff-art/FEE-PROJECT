import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { Worker } from 'node:worker_threads'

/**
 * Python, run on this machine — for checking generated test cases.
 *
 * A new problem's cases are checked by running a reference solution against
 * them. That used to go to the public Judge0 instance, which takes about
 * thirty seconds a run; here it is Python compiled to WebAssembly (Pyodide)
 * in a worker thread, which takes milliseconds once it has loaded.
 *
 * Only for the reference solutions the model writes — never for code a
 * person submits, which runs on their own device instead. The worker removes
 * Python's bridges back into JavaScript before running anything, and is
 * terminated if a run goes past its time, which is the only reliable way to
 * stop a loop that never ends.
 */

export type PyResult = { stdout: string; error: string | null }

const BATCH_TIMEOUT_MS = 15_000

/* The worker's own source, run with `eval` so it needs no separate file in
   either the TypeScript tree or the built one. */
const WORKER = `
const { parentPort, workerData } = require('node:worker_threads')
let ready = null
async function boot() {
  const { loadPyodide } = await import(workerData.pyodide)
  const py = await loadPyodide({ indexURL: workerData.index })
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
parentPort.on('message', async ({ id, code, inputs }) => {
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
    parentPort.postMessage({ id, results })
  } catch (cause) {
    parentPort.postMessage({ id, failed: String(cause && cause.message || cause) })
  }
})
`

let worker: Worker | null = null
let nextId = 0
/* Per worker, so a terminated one settles only its own runs. */
const pending = new WeakMap<Worker, Map<number, (value: PyResult[] | null) => void>>()

function spawn() {
  const entry = createRequire(import.meta.url).resolve('pyodide/pyodide.mjs')
  const created = new Worker(WORKER, {
    eval: true,
    workerData: { pyodide: pathToFileURL(entry).href, index: path.dirname(entry) + path.sep },
    resourceLimits: { maxOldGenerationSizeMb: 512 },
  })
  const waiting = new Map<number, (value: PyResult[] | null) => void>()
  pending.set(created, waiting)
  created.on('message', (message: { id: number; results?: PyResult[]; failed?: string }) => {
    waiting.get(message.id)?.(message.results ?? null)
    waiting.delete(message.id)
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
  created.on('exit', reset)
  created.unref()
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
      void current.terminate()
      resolve(null)
    }, timeoutMs)
    waiting.set(id, (value) => {
      clearTimeout(timer)
      resolve(value)
    })
    current.postMessage({ id, code, inputs })
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
