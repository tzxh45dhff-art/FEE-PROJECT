/**
 * Python, on this device: CPython compiled to WebAssembly (Pyodide), in a
 * worker so a long run never freezes the page. Loaded once from the CDN —
 * about 12 MB the first time, cached after — then each case runs in
 * milliseconds.
 */

const PYODIDE = 'https://cdn.jsdelivr.net/npm/pyodide@314.0.7/'

const RUNNER = `
import sys, io, builtins

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
        import traceback
        lines = traceback.format_exception(type(exc), exc, exc.__traceback__)
        # Only the part about the solution, not this runner.
        error = ''.join(line for line in lines if '<exec>' not in line).strip()
    finally:
        sys.stdout = sys.__stdout__
        sys.stdin = sys.__stdin__
    return [out.getvalue(), error]
`

type Pyodide = {
  runPython: (code: string) => unknown
  globals: { get: (name: string) => (source: string, stdin: string) => { toJs: () => [string, string | null]; destroy: () => void } }
}

let ready: Promise<Pyodide> | null = null

async function boot() {
  const { loadPyodide } = (await import(/* @vite-ignore */ `${PYODIDE}pyodide.mjs`)) as {
    loadPyodide: (options: { indexURL: string }) => Promise<Pyodide>
  }
  const py = await loadPyodide({ indexURL: PYODIDE })
  py.runPython(RUNNER)
  return py
}

self.onmessage = async (event: MessageEvent<{ id: number; code: string; input: string }>) => {
  const { id, code, input } = event.data
  try {
    ready ??= boot()
    const py = await ready
    const pair = py.globals.get('__run_case')(code, input)
    const [stdout, error] = pair.toJs()
    pair.destroy()
    self.postMessage({ id, stdout, error: error ?? null })
  } catch (cause) {
    ready = null
    self.postMessage({ id, stdout: '', error: null, failed: cause instanceof Error ? cause.message : String(cause) })
  }
}
