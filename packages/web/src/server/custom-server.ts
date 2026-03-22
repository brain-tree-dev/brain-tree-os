import path from 'path'
import next from 'next'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { parse } from 'url'
import { startWatcher } from './watcher'
import { addGlobalListener } from './global-watcher'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || '3000', 10)

// __dirname is packages/web/src/server, project root is two levels up
const projectRoot = path.resolve(__dirname, '..', '..')
const app = next({ dev, dir: projectRoot })
const handle = app.getRequestHandler()

// Track watchers per WebSocket connection
const clientWatchers = new Map<WebSocket, { brainId: string; close: () => void }>()
// Track global subscribers (for brains list auto-refresh)
const globalSubscribers = new Set<WebSocket>()
const globalCleanups = new Map<WebSocket, () => void>()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? '/', true)
    handle(req, res, parsedUrl)
  })

  const wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString())

        if (msg.type === 'subscribe' && msg.brainId) {
          // Clean up existing watcher for this client
          const existing = clientWatchers.get(ws)
          if (existing) existing.close()

          const watcher = startWatcher(msg.brainId, ws)
          clientWatchers.set(ws, { brainId: msg.brainId, close: watcher.close })
        }

        if (msg.type === 'subscribe-global') {
          // Subscribe to global brains.json changes
          const cleanup = addGlobalListener(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'brains-updated' }))
            }
          })
          globalSubscribers.add(ws)
          globalCleanups.set(ws, cleanup)
        }
      } catch {
        // Ignore malformed messages
      }
    })

    ws.on('close', () => {
      // Clean up brain watcher
      const existing = clientWatchers.get(ws)
      if (existing) {
        existing.close()
        clientWatchers.delete(ws)
      }

      // Clean up global subscription
      const globalCleanup = globalCleanups.get(ws)
      if (globalCleanup) {
        globalCleanup()
        globalCleanups.delete(ws)
      }
      globalSubscribers.delete(ws)
    })
  })

  server.listen(port, () => {
    console.log(`> BrainTree OS running at http://localhost:${port}`)
  })

  const shutdown = () => {
    console.log('\n> Shutting down...')
    wss.clients.forEach((client) => client.close())
    clientWatchers.forEach(({ close }) => close())
    globalCleanups.forEach((cleanup) => cleanup())
    server.close(() => process.exit(0))
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
})
