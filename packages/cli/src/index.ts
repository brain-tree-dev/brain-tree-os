#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { spawn } from 'node:child_process'
import * as net from 'node:net'

const CONFIG_DIR = path.join(os.homedir(), '.braintree-os')
const COMMANDS_DIR = path.join(os.homedir(), '.claude', 'commands')
const UNIVERSAL_COMMANDS_DIR = path.join(os.homedir(), '.braintree-os', 'commands')
const SERVER_JSON = path.join(CONFIG_DIR, 'server.json')

const VERSION = '0.1.0'

function ensureConfigDir() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
  const configFile = path.join(CONFIG_DIR, 'brains.json')
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify({ brains: [] }, null, 2) + '\n')
  }
}

async function installCommands(): Promise<number> {
  fs.mkdirSync(COMMANDS_DIR, { recursive: true })
  fs.mkdirSync(UNIVERSAL_COMMANDS_DIR, { recursive: true })
  const commandsSource = path.join(__dirname, '..', 'commands')
  if (!fs.existsSync(commandsSource)) return 0

  const files = fs.readdirSync(commandsSource).filter(f => f.endsWith('.md'))
  for (const file of files) {
    const dest = path.join(COMMANDS_DIR, file)
    fs.copyFileSync(path.join(commandsSource, file), dest)
    
    const uniDest = path.join(UNIVERSAL_COMMANDS_DIR, file)
    fs.copyFileSync(path.join(commandsSource, file), uniDest)
  }
  return files.length
}

async function findFreePort(preferred: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(preferred, () => {
      server.close(() => resolve(preferred))
    })
    server.on('error', () => {
      // Port in use, find a random free one
      const server2 = net.createServer()
      server2.listen(0, () => {
        const port = (server2.address() as net.AddressInfo).port
        server2.close(() => resolve(port))
      })
    })
  })
}

async function openBrowser(url: string) {
  try {
    const open = (await import('open')).default
    await open(url)
  } catch {
    // Browser open failed silently, URL is shown in welcome message
  }
}

function saveServerConfig(port: number) {
  fs.writeFileSync(
    SERVER_JSON,
    JSON.stringify({ port, pid: process.pid, startedAt: new Date().toISOString() }, null, 2) + '\n'
  )
}

function cleanupServerConfig() {
  try {
    if (fs.existsSync(SERVER_JSON)) {
      fs.unlinkSync(SERVER_JSON)
    }
  } catch {
    // ignore cleanup errors
  }
}

function showWelcome(port: number, commandCount: number) {
  const url = `http://localhost:${port}/brains`
  console.log('')
  console.log(`  BrainTree OS v${VERSION}`)
  console.log('')
  console.log(`  > ${commandCount} commands installed to ~/.braintree-os/commands/ and ~/.claude/commands/`)
  console.log(`  > Server running at ${url}`)
  console.log('')
  console.log('  +-----------------------------------------------------+')
  console.log('  |                                                      |')
  console.log('  |  To create your first brain:                         |')
  console.log('  |                                                      |')
  console.log('  |  1. Open a new terminal                              |')
  console.log('  |  2. Create a project folder:                         |')
  console.log('  |     mkdir -p ~/brains/my-project                     |')
  console.log('  |  3. Start your AI Agent there (e.g. Claude Code):    |')
  console.log('  |     cd ~/brains/my-project && claude                 |')
  console.log('  |  4. Run the init command:                            |')
  console.log('  |     /init-braintree                                  |')
  console.log('  |     (For other agents: write prompt to read          |')
  console.log('  |      ~/.braintree-os/commands/init-braintree.md)     |')
  console.log('  |                                                      |')
  console.log('  |  Your brain will appear at the URL above.            |')
  console.log('  +-----------------------------------------------------+')
  console.log('')
  console.log('  Press Ctrl+C to stop the server.')
  console.log('')
}

function showHelp() {
  console.log(`
  brain-tree-os v${VERSION} - Open source brain viewer

  Usage:
    brain-tree-os              Start the server and open browser
    brain-tree-os status       Show registered brains
    brain-tree-os help         Show this help

  Options:
    --port <number>   Custom port (default: 3000)
    --no-open         Don't auto-open browser
`)
}

function showStatus() {
  const configFile = path.join(CONFIG_DIR, 'brains.json')
  if (!fs.existsSync(configFile)) {
    console.log('  No brains registered yet.')
    console.log('  Ask your AI Agent to run init-braintree to create your first brain.')
    return
  }
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'))
  const brains = config.brains || []
  if (brains.length === 0) {
    console.log('  No brains registered yet.')
    console.log('  Ask your AI Agent to run init-braintree to create your first brain.')
    return
  }
  console.log(`  Registered brains (${brains.length}):`)
  for (const brain of brains) {
    console.log(`    ${brain.name} -> ${brain.path}`)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
    showHelp()
    return
  }

  if (args.includes('status')) {
    showStatus()
    return
  }

  const noOpen = args.includes('--no-open')
  const portIdx = args.indexOf('--port')
  const preferredPort = portIdx >= 0 ? parseInt(args[portIdx + 1], 10) : 3000

  // Step 1: Ensure config
  ensureConfigDir()

  // Step 2: Install commands
  const commandCount = await installCommands()

  // Step 3: Find port
  const port = await findFreePort(preferredPort)

  // Step 4: Save server config (so init-braintree can discover the port)
  saveServerConfig(port)

  // Step 5: Start the web server
  const webDir = path.join(__dirname, '..', '..', 'web')
  const serverScript = path.join(webDir, 'src', 'server', 'custom-server.ts')

  const isBuilt = fs.existsSync(path.join(webDir, '.next'))

  let child: ReturnType<typeof spawn>

  if (isBuilt) {
    const serverDist = path.join(webDir, 'dist', 'server', 'custom-server.js')
    if (fs.existsSync(serverDist)) {
      child = spawn('node', [serverDist], {
        env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
        stdio: 'inherit',
        cwd: webDir,
      })
    } else {
      child = spawn('npx', ['next', 'start', '-p', String(port)], {
        env: { ...process.env, PORT: String(port) },
        stdio: 'inherit',
        cwd: webDir,
      })
    }
  } else {
    child = spawn('npx', ['tsx', serverScript], {
      env: { ...process.env, PORT: String(port), NODE_ENV: 'development' },
      stdio: 'inherit',
      cwd: webDir,
    })
  }

  child.on('error', (err) => {
    cleanupServerConfig()
    console.error('Failed to start server:', err.message)
    process.exit(1)
  })

  // Wait for server to start, then show welcome and open browser
  setTimeout(() => {
    showWelcome(port, commandCount)
    if (!noOpen) openBrowser(`http://localhost:${port}/brains`)
  }, 2000)

  // Forward signals to child and clean up
  const cleanup = () => {
    cleanupServerConfig()
    child.kill('SIGINT')
    setTimeout(() => process.exit(0), 1000)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  child.on('exit', (code) => {
    cleanupServerConfig()
    process.exit(code ?? 0)
  })
}

main().catch((err) => {
  cleanupServerConfig()
  console.error(err)
  process.exit(1)
})
