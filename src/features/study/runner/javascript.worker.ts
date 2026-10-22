/**
 * JavaScript, on this device, in a worker — the browser's own engine, so it
 * is as fast as code gets here.
 *
 * Solutions are written for Node and read standard input the Node ways:
 * `fs.readFileSync(0)`, `readline`, or `process.stdin` events. Each of those
 * is stood in for here with one that reads the case's input, and console and
 * `process.stdout.write` are collected as the output.
 */

class Exit extends Error {}

type Handler = (...args: unknown[]) => void

function emitter() {
  const handlers = new Map<string, Handler[]>()
  const self = {
    on(name: string, handler: Handler) {
      handlers.set(name, [...(handlers.get(name) ?? []), handler])
      return self
    },
    once(name: string, handler: Handler) {
      return self.on(name, handler)
    },
    addListener(name: string, handler: Handler) {
      return self.on(name, handler)
    },
    emit(name: string, ...args: unknown[]) {
      for (const handler of handlers.get(name) ?? []) handler(...args)
    },
    has(name: string) {
      return (handlers.get(name) ?? []).length > 0
    },
  }
  return self
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

async function run(code: string, input: string) {
  let stdout = ''
  const write = (text: unknown) => {
    stdout += String(text)
    return true
  }
  const format = (args: unknown[]) =>
    args.map((arg) => (typeof arg === 'string' ? arg : typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')

  const stdin = Object.assign(emitter(), {
    setEncoding() {},
    resume() {},
    pause() {},
    fd: 0,
  })
  const readers: { emit: (name: string, ...args: unknown[]) => void; has: (name: string) => boolean }[] = []

  const modules: Record<string, unknown> = {
    fs: {
      readFileSync(file: unknown, encoding?: unknown) {
        if (file === 0 || file === '/dev/stdin') {
          return encoding ? input : { toString: () => input }
        }
        throw new Error('Only standard input can be read here.')
      },
    },
    readline: {
      createInterface() {
        const reader = Object.assign(emitter(), {
          close() {},
          question(_prompt: string, answer: (line: string) => void) {
            answer(input.split('\n')[0] ?? '')
          },
          async *[Symbol.asyncIterator]() {
            const lines = input.split('\n')
            if (lines.at(-1) === '') lines.pop()
            for (const line of lines) yield line
          },
        })
        readers.push(reader)
        return reader
      },
    },
  }

  const process = {
    stdin,
    stdout: { write },
    stderr: { write: () => true },
    argv: ['node', 'solution.js'],
    env: {},
    exit() {
      throw new Exit()
    },
    nextTick: (callback: () => void) => queueMicrotask(callback),
    hrtime: { bigint: () => BigInt(Math.round(performance.now() * 1e6)) },
  }
  const console = {
    log: (...args: unknown[]) => write(`${format(args)}\n`),
    info: (...args: unknown[]) => write(`${format(args)}\n`),
    error: () => {},
    warn: () => {},
  }
  const require = (name: string) => {
    const found = modules[name.replace(/^node:/, '')]
    if (!found) throw new Error(`The module "${name}" is not available here.`)
    return found
  }

  try {
    const body = new Function('require', 'process', 'console', 'module', 'exports', code)
    const result = body(require, process, console, { exports: {} }, {})
    await tick()
    /* Event-driven input: hand over the lines, then the end. */
    for (const reader of readers) {
      const lines = input.split('\n')
      if (lines.at(-1) === '') lines.pop()
      for (const line of lines) reader.emit('line', line)
      reader.emit('close')
    }
    if (stdin.has('data') || stdin.has('end') || stdin.has('readable')) {
      stdin.emit('data', input)
      stdin.emit('end')
    }
    await result
    for (let i = 0; i < 3; i += 1) await tick()
    return { stdout, error: null }
  } catch (cause) {
    if (cause instanceof Exit) return { stdout, error: null }
    const error = cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause)
    return { stdout, error }
  }
}

self.onmessage = async (event: MessageEvent<{ id: number; code: string; input: string }>) => {
  const { id, code, input } = event.data
  const result = await run(code, input)
  self.postMessage({ id, ...result })
}
