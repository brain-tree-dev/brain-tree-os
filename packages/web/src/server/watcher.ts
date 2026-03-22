import chokidar from 'chokidar'
import { WebSocket } from 'ws'
import {
  getBrain,
  scanBrainFiles,
  parseBrainLinks,
  getExecutionSteps,
  getHandoffs,
  DEMO_BRAIN,
  getDemoBrainPath,
} from '../lib/local-data'
import { isExecutionPlanFile } from '../lib/execution-plan-parser'

export interface WatcherHandle {
  close: () => void
}

export function startWatcher(brainId: string, ws: WebSocket): WatcherHandle {
  const brain =
    brainId === 'demo'
      ? { ...DEMO_BRAIN, path: getDemoBrainPath() }
      : getBrain(brainId)

  if (!brain) {
    ws.send(JSON.stringify({ type: 'error', message: 'Brain not found' }))
    return { close: () => {} }
  }

  const brainPath = brain.path
  let debounceTimer: NodeJS.Timeout | null = null

  const watcher = chokidar.watch(brainPath, {
    ignored: [
      /(^|[/\\])\../, // hidden files (except we want .claude)
      /node_modules/,
      '!**/.claude/**',
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
  })

  function sendUpdate(changedPath?: string) {
    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(() => {
      try {
        if (ws.readyState !== WebSocket.OPEN) return

        const files = scanBrainFiles(brainPath)

        // Always send files update
        ws.send(JSON.stringify({ type: 'files', data: files }))

        // Always re-compute links (cheap enough with debounce)
        const links = parseBrainLinks(brainPath, files)
        ws.send(JSON.stringify({ type: 'links', data: links }))

        // Re-parse execution plan if the changed file is an execution plan
        if (!changedPath || isExecutionPlanFile(changedPath)) {
          const steps = getExecutionSteps(brainPath, files)
          ws.send(JSON.stringify({ type: 'execution_steps', data: steps }))
        }

        // Re-parse handoffs if the change is in Handoffs/
        if (
          !changedPath ||
          changedPath.includes('Handoffs/') ||
          changedPath.includes('Handoffs\\')
        ) {
          const handoffs = getHandoffs(brainPath, files)
          ws.send(JSON.stringify({ type: 'handoffs', data: handoffs }))
        }
      } catch (err) {
        console.error('Watcher update error:', err)
      }
    }, 300)
  }

  watcher
    .on('add', (filePath) => {
      if (filePath.endsWith('.md')) sendUpdate(filePath)
    })
    .on('change', (filePath) => {
      if (filePath.endsWith('.md')) sendUpdate(filePath)
    })
    .on('unlink', (filePath) => {
      if (filePath.endsWith('.md')) sendUpdate(filePath)
    })

  // Send initial data
  sendUpdate()

  return {
    close: () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      watcher.close()
    },
  }
}
