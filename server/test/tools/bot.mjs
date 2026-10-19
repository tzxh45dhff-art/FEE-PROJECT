/**
 * A second person in the room, controlled over HTTP, for looking at features
 * by eye. Joins the room as a real socket client and does what it is told:
 *
 *   node test/tools/bot.mjs <api> <token> <roomId> [port]
 *   curl 'localhost:4199/emit?event=fun:emote&emote=heart'
 *
 * Any query parameter other than `event` is sent as part of the payload, with
 * roomId filled in. Every event the bot receives is appended to /tmp-ish log
 * for inspection at /log.
 */
import http from 'node:http'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { io } = require('socket.io-client')

const [api, token, roomId, port = '4199'] = process.argv.slice(2)
const socket = io(api, { path: '/socket.io', transports: ['websocket'], auth: { token } })
const received = []
socket.onAny((event, payload) => {
  received.push({ event, payload, at: Date.now() })
  if (received.length > 200) received.shift()
})
socket.on('connect', () => {
  socket.emit('room:join', { roomId, characterId: process.env.BOT_CHARACTER })
  console.log('bot connected and joined', roomId)
})

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    if (url.pathname === '/log') {
      res.end(JSON.stringify(received.slice(-30), null, 1))
      return
    }
    if (url.pathname === '/emit') {
      const event = url.searchParams.get('event')
      const payload = { roomId }
      for (const [k, v] of url.searchParams) {
        if (k === 'event') continue
        payload[k] = /^\d+$/.test(v) ? Number(v) : v === 'true' ? true : v === 'false' ? false : v
      }
      socket.emit(event, payload)
      res.end(JSON.stringify({ sent: event, payload }))
      return
    }
    res.statusCode = 404
    res.end()
  })
  .listen(Number(port), '127.0.0.1')
