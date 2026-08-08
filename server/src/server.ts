import { createServer } from 'node:http'

import { createApp } from './app.js'
import { env } from './config/env.js'
import { attachPresenceGateway } from './sockets/presence.gateway.js'

const httpServer = createServer(createApp())
attachPresenceGateway(httpServer)

httpServer.listen(env.port, () => {
  console.log(`  SyncRoom API on http://localhost:${env.port}`)
})
