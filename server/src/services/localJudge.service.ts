import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import { env } from '../config/env.js'

/**
 * Running code on the server's own machine, in a throwaway container.
 *
 * The public judge is a queue shared with the internet: about thirty seconds
 * a run. This is the same job done here — every submission gets a fresh
 * container from the image in server/judge, which compiles once and runs each
 * case against a clock. Java compiles and runs ten cases in under a second.
 *
 * The container is where the safety is, so every limit is set on it rather
 * than trusted to the code inside: no network at all, a read-only filesystem
 * with a small scratch /tmp, capped memory (no swap), capped CPU, capped
 * processes (a fork bomb stops at the ceiling), every Linux capability
 * dropped, no privilege escalation, and a user that is nobody. It is thrown
 * away afterwards, so nothing one submission does is there for the next.
 */

export const LOCAL_LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'c']

export type LocalResult = { stdout: string; stderr: string; error: string | null; ms: number }
export type LocalRun = { compileError: string | null; results: LocalResult[] }

/** The docker binary or image is missing, or the daemon is not running. */
export class JudgeUnavailable extends Error {}

const RUN_TIMEOUT_MS = 90_000
const CASE_LIMIT_SECONDS = 5

export function available() {
  return Boolean(env.judge.dockerImage)
}

export function supports(language: string) {
  return available() && LOCAL_LANGUAGES.includes(language)
}

export function runLocally(language: string, code: string, inputs: string[]): Promise<LocalRun> {
  const name = `huddle-judge-${randomUUID().slice(0, 12)}`
  const args = [
    'run',
    '--rm',
    '-i',
    '--name',
    name,
    '--network',
    'none',
    '--memory',
    '512m',
    '--memory-swap',
    '512m',
    '--cpus',
    '2',
    '--pids-limit',
    '256',
    '--read-only',
    '--tmpfs',
    '/tmp:rw,exec,size=64m',
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
    env.judge.dockerImage || 'huddle-judge',
  ]

  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk: Buffer) => {
      if (stdout.length < 20_000_000) stdout += chunk.toString('utf8')
    })
    child.stderr.on('data', (chunk: Buffer) => {
      if (stderr.length < 20_000) stderr += chunk.toString('utf8')
    })

    const timer = setTimeout(() => {
      /* Killing the client does not stop the container; asking docker does. */
      spawn('docker', ['kill', name], { stdio: 'ignore' }).on('error', () => undefined)
      child.kill('SIGKILL')
      reject(new Error('The judge did not finish in time.'))
    }, RUN_TIMEOUT_MS)

    child.on('error', (cause) => {
      clearTimeout(timer)
      reject(new JudgeUnavailable(`docker could not be started: ${cause.message}`))
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      try {
        resolve(JSON.parse(stdout) as LocalRun)
      } catch {
        /* No JSON at all means the container never ran the job: no daemon,
           no image. That is the judge being unavailable, not the code failing. */
        reject(new JudgeUnavailable(`The local judge did not run (exit ${code}). ${stderr.trim().slice(0, 300)}`))
      }
    })

    child.stdin.on('error', () => undefined)
    child.stdin.end(JSON.stringify({ language, code, inputs, limit: CASE_LIMIT_SECONDS }))
  })
}
