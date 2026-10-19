/**
 * Render intro.html to video, one exact frame at a time.
 *
 * Screen-recording a browser playing an animation gives you whatever frames
 * the machine managed to paint, at whatever moments it painted them — which
 * is where judder comes from. This does the opposite: for every frame it sets
 * the time, waits for the paint, and captures it. Frame 1803 is t = 30.05s
 * exactly, however long it took to draw.
 *
 * No dependencies beyond Chrome and ffmpeg. It speaks the DevTools protocol
 * over Node's built-in WebSocket rather than pulling in Puppeteer for the
 * four commands it needs.
 *
 *   node marketing/intro-video/render.mjs                    → huddle-intro.mp4
 *   node marketing/intro-video/render.mjs --stills 2,7,12     → stills/*.png
 *   node marketing/intro-video/render.mjs --from 9 --to 15    → a section only
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const stills = flag('stills')
const fps = Number(flag('fps', 60))
const out = flag('out', join(here, 'huddle-intro.mp4'))

const CHROME = [
  join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync)
if (!CHROME) throw new Error('No Chrome found')

const PORT = 9300 + Math.floor(Math.random() * 500)
const profile = join(tmpdir(), `huddle-render-${process.pid}`)
const chrome = spawn(CHROME, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--window-size=1920,1080',
  '--force-device-scale-factor=1',
  '--force-color-profile=srgb',
  '--hide-scrollbars',
  '--font-render-hinting=none',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  'about:blank',
], { stdio: 'ignore' })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function target() {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      const page = list.find((t) => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await wait(150)
  }
  throw new Error('Chrome never came up')
}

const ws = new WebSocket(await target())
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let nextId = 1
const pending = new Map()
const listeners = new Map()
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(msg.error.message))
    else resolve(msg.result)
  } else if (msg.method && listeners.has(msg.method)) {
    listeners.get(msg.method)(msg.params)
  }
})
const cdp = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
const once = (method) => new Promise((r) => listeners.set(method, r))

await cdp('Page.enable')
await cdp('Runtime.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false })
const loaded = once('Page.loadEventFired')
await cdp('Page.navigate', { url: pathToFileURL(join(here, 'intro.html')).href })
await loaded
await cdp('Runtime.evaluate', { expression: 'window.ready', awaitPromise: true })
/* Fonts are "ready" before every weight has been rasterised; one throwaway
   pass over a few moments makes sure the first real frame is not the one
   that pays for it. */
for (const t of [3.5, 6, 11, 17, 22, 27, 33, 40]) {
  await cdp('Runtime.evaluate', { expression: `render(${t})` })
}

const { result } = await cdp('Runtime.evaluate', { expression: 'window.DURATION', returnByValue: true })
const duration = result.value
const from = Number(flag('from', 0))
const to = Number(flag('to', duration))

/** Set the time, let it paint, take the frame. */
async function frameAt(t) {
  await cdp('Runtime.evaluate', {
    expression: `render(${t}); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(1))))`,
    awaitPromise: true,
  })
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, captureBeyondViewport: false })
  return Buffer.from(data, 'base64')
}

try {
  if (stills) {
    const dir = join(here, 'stills')
    mkdirSync(dir, { recursive: true })
    for (const s of stills.split(',').map(Number)) {
      const file = join(dir, `t${s.toFixed(2).padStart(6, '0')}.png`)
      writeFileSync(file, await frameAt(s))
      console.log(file)
    }
  } else {
    const total = Math.round((to - from) * fps)
    const ff = spawn('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-tune', 'film',
      '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
      out,
    ], { stdio: ['pipe', 'inherit', 'inherit'] })
    const done = new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error(`ffmpeg exited ${c}`)))))

    const started = Date.now()
    for (let f = 0; f < total; f++) {
      const t = from + f / fps
      const png = await frameAt(t)
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r))
      if (f % 120 === 0) {
        const rate = (f + 1) / ((Date.now() - started) / 1000)
        process.stdout.write(`frame ${f}/${total}  t=${t.toFixed(2)}s  ${rate.toFixed(1)} fps  eta ${Math.round((total - f) / rate)}s\n`)
      }
    }
    ff.stdin.end()
    await done
    console.log(`wrote ${out}`)
  }
} finally {
  ws.close()
  chrome.kill('SIGKILL')
  rmSync(profile, { recursive: true, force: true })
}
