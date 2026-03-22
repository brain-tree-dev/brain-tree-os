import chokidar from 'chokidar'
import * as path from 'node:path'
import * as os from 'node:os'
import * as fs from 'node:fs'

const BRAINS_JSON = path.join(os.homedir(), '.braintree-os', 'brains.json')

export type GlobalListener = () => void

let watcher: ReturnType<typeof chokidar.watch> | null = null
const listeners = new Set<GlobalListener>()

export function addGlobalListener(listener: GlobalListener): () => void {
  // Start watching on first subscriber
  if (listeners.size === 0 && !watcher) {
    startGlobalWatcher()
  }

  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    // Stop watching when no subscribers
    if (listeners.size === 0 && watcher) {
      watcher.close()
      watcher = null
    }
  }
}

function startGlobalWatcher() {
  const dir = path.dirname(BRAINS_JSON)

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  watcher = chokidar.watch(BRAINS_JSON, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
  })

  watcher.on('change', () => {
    for (const listener of listeners) {
      try {
        listener()
      } catch (err) {
        console.error('Global watcher listener error:', err)
      }
    }
  })

  watcher.on('add', () => {
    for (const listener of listeners) {
      try {
        listener()
      } catch (err) {
        console.error('Global watcher listener error:', err)
      }
    }
  })
}
