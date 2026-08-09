import { createServer } from 'node:http'

import { createApp } from './app.js'
import { env } from './config/env.js'
import { attachCallGateway } from './sockets/call.gateway.js'
import { attachChatGateway } from './sockets/chat.gateway.js'
import { attachPresenceGateway } from './sockets/presence.gateway.js'
import { attachWatchGateway } from './sockets/watch.gateway.js'

const httpServer = createServer(createApp())

/* Everything rides the presence socket — one connection, one handshake, and
   membership checked the same way for all of them. */
const io = attachPresenceGateway(httpServer)
attachWatchGateway(io)
attachChatGateway(io)
attachCallGateway(io)

httpServer.listen(env.port, () => {
  console.log(`  SyncRoom API on http://localhost:${env.port}`)
})
