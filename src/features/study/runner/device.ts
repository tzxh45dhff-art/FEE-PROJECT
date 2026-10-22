/**
 * Running code on this device.
 *
 * Python and JavaScript run here, in the browser, on this machine's own
 * processor — no round trip, no shared judge with a queue. Other languages
 * still go to the server's judge.
 *
 * Each language has one worker, kept warm between runs. A case that runs past
 * its time limit is stopped the only way a stuck loop can be stopped — the
 * worker is thrown away — and the next run starts a fresh one.
 */

export type DeviceLanguage = 'python' | 'javascript'
export type CaseOutput = { stdout: string; error: string | null }

const CASE_LIMIT_MS = 5_000
/* The first Python run downloads and starts the interpreter. */
const FIRST_RUN_LIMIT_MS = 90_000

export function runsOnDevice(language: string): language is DeviceLanguage {
  return language === 'python' || language === 'javascript'
}

const workers = new Map<DeviceLanguage, { worker: Worker; warm: boolean }>()
let nextId = 0

function workerFor(language: DeviceLanguage) {
  let entry = workers.get(language)
  if (!entry) {
    const worker =
      language === 'python'
        ? new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' })
        : new Worker(new URL('./javascript.worker.ts', import.meta.url), { type: 'module' })
    entry = { worker, warm: language === 'javascript' }
    workers.set(language, entry)
  }
  return entry
}

function runOne(language: DeviceLanguage, code: string, input: string): Promise<CaseOutput> {
  const entry = workerFor(language)
  const id = nextId++
  return new Promise((resolve) => {
    const limit = entry.warm ? CASE_LIMIT_MS : FIRST_RUN_LIMIT_MS
    const timer = setTimeout(() => {
      entry.worker.terminate()
      workers.delete(language)
      resolve({
        stdout: '',
        error: entry.warm
          ? `Stopped after ${CASE_LIMIT_MS / 1000} seconds — is there a loop that never ends?`
          : 'Python took too long to start on this device. Check the connection and try again.',
      })
    }, limit)
    const onMessage = (event: MessageEvent<{ id: number; stdout: string; error: string | null; failed?: string }>) => {
      if (event.data.id !== id) return
      clearTimeout(timer)
      entry.worker.removeEventListener('message', onMessage)
      if (event.data.failed) {
        workers.delete(language)
        entry.worker.terminate()
        resolve({ stdout: '', error: `Could not start ${language} on this device: ${event.data.failed}` })
        return
      }
      entry.warm = true
      resolve({ stdout: event.data.stdout, error: event.data.error })
    }
    entry.worker.addEventListener('message', onMessage)
    entry.worker.postMessage({ id, code, input })
  })
}

/** Run a program against each input in turn, stopping at the first one that errors. */
export async function runCases(language: DeviceLanguage, code: string, inputs: string[]) {
  const outputs: CaseOutput[] = []
  for (const input of inputs) {
    const output = await runOne(language, code, input)
    outputs.push(output)
    if (output.error) break
  }
  return outputs
}

/** Start the interpreter early, so the first Run does not wait for the download. */
export function warmUp(language: string) {
  if (language !== 'python') return
  const entry = workerFor('python')
  if (!entry.warm) void runOne('python', 'pass', '')
}

/** The judge's comparison: trailing spaces and a final newline are forgiven. */
export function sameOutput(got: string, expected: string) {
  const tidy = (text: string) =>
    text
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n')
      .replace(/\n+$/, '')
  return tidy(got) === tidy(expected)
}
