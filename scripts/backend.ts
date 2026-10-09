import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { request } from 'node:http'
import { connect } from 'node:net'
import path from 'node:path'
import type { Duplex } from 'node:stream'
import { fileURLToPath } from 'node:url'

/**
 * Run the backend (the separate `portfolio-backend` project) behind the
 * portfolio's own port, so locally everything is one address.
 *
 * The backend stays its own project because it deploys to Render on its own.
 * Locally it is started as a child process bound to 127.0.0.1 — unreachable
 * from outside — and the portfolio's server forwards `/api/*` and the `/collab`
 * WebSocket to it. Pages therefore call their own origin, on a laptop and on a
 * phone over the LAN alike.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

/** Where the backend project lives. Sibling of portfolio-main by default. */
export const BACKEND_DIR = path.resolve(process.env.BACKEND_DIR ?? path.join(here, '../../portfolio-backend'))
/** Internal only — nothing outside this machine connects to it. */
export const BACKEND_PORT = Number(process.env.BACKEND_PORT ?? 1234)
const BACKEND_HOST = '127.0.0.1'

/** Paths the backend owns. Everything else is the UI. */
export function isBackendPath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/')
}
export const COLLAB_PATH = '/collab'

async function isUp(): Promise<boolean> {
  try {
    const response = await fetch(`http://${BACKEND_HOST}:${BACKEND_PORT}/healthz`, {
      signal: AbortSignal.timeout(1000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * `npm ci` in `dir` if it has never been installed. A fresh clone only gets the
 * portfolio's own dependencies from `npm install`; this covers the projects
 * next to it, so `npm start` works without extra steps. Returns false on failure.
 */
export function installDependencies(dir: string, label: string, log: (line: string) => void = console.log): boolean {
  if (existsSync(path.join(dir, 'node_modules'))) return true
  log(`  ${label.padEnd(11)} installing dependencies (first run)…`)
  // The npm that ships with the Node running this, so versions match.
  const npm = path.join(path.dirname(process.execPath), 'npm')
  const result = spawnSync(existsSync(npm) ? npm : 'npm', ['ci', '--no-audit', '--no-fund'], {
    cwd: dir,
    stdio: 'inherit',
    // npm is a .cmd script on Windows, which only runs through a shell.
    shell: process.platform === 'win32',
  })
  if (result.status === 0) return true
  log(`  ${label.padEnd(11)} install failed — run \`npm ci\` in ${dir}`)
  return false
}

export type BackendHandle = { stop: () => void }

/**
 * One backend per process. Vite restarts its server in-process whenever a
 * config file changes, and re-runs the plugin — so the backend must outlive
 * any one server instance, or a restart would kill it from under the new one.
 * It is stopped only when the process exits.
 */
const shared = globalThis as { __portfolioBackend?: Promise<BackendHandle | null> }

/**
 * Make sure a backend is answering on BACKEND_PORT: reuse one that already is
 * (say, started by hand in its own folder), otherwise start it.
 */
export function ensureBackend(log: (line: string) => void = console.log): Promise<BackendHandle | null> {
  shared.__portfolioBackend ??= startOrReuseBackend(log)
  return shared.__portfolioBackend
}

async function startOrReuseBackend(log: (line: string) => void): Promise<BackendHandle | null> {
  if (await isUp()) {
    log(`  backend     already running on ${BACKEND_HOST}:${BACKEND_PORT} — using it`)
    return { stop: () => {} }
  }

  if (!existsSync(path.join(BACKEND_DIR, 'package.json'))) {
    log(`  backend     NOT FOUND at ${BACKEND_DIR}`)
    log('              /editor and /drop will load but cannot connect.')
    log('              Put portfolio-backend next to portfolio-main, or set BACKEND_DIR.')
    return null
  }

  if (!installDependencies(BACKEND_DIR, 'backend', log)) return null

  // The same Node that is running this server, so the version always matches.
  const child: ChildProcess = spawn(
    process.execPath,
    ['--experimental-strip-types', '--disable-warning=ExperimentalWarning', 'src/index.ts'],
    {
      cwd: BACKEND_DIR,
      env: { ...process.env, PORT: String(BACKEND_PORT), HOST: BACKEND_HOST },
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  )
  // Its startup banner lists its own port, which is not the one to open — keep
  // it quiet and surface only real problems (stderr is inherited).
  child.stdout?.resume()

  const stop = () => {
    if (child.exitCode === null) child.kill('SIGTERM')
  }
  process.once('exit', stop)

  for (let waited = 0; waited < 15_000; waited += 250) {
    if (child.exitCode !== null) {
      log(`  backend     exited during startup (code ${child.exitCode})`)
      return null
    }
    if (await isUp()) return { stop }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  log('  backend     did not answer within 15 s')
  stop()
  return null
}

/** `X-Forwarded-For` with this hop appended, so the backend sees the real client. */
function forwardedFor(req: IncomingMessage): string {
  const client = req.socket.remoteAddress ?? ''
  const prior = req.headers['x-forwarded-for']
  const chain = Array.isArray(prior) ? prior.join(', ') : prior
  return chain ? `${chain}, ${client}` : client
}

/** Forward an HTTP request — including long-lived SSE streams — to the backend. */
export function proxyRequest(req: IncomingMessage, res: ServerResponse): void {
  const upstream = request(
    {
      host: BACKEND_HOST,
      port: BACKEND_PORT,
      method: req.method,
      path: req.url,
      headers: { ...req.headers, 'x-forwarded-for': forwardedFor(req) },
    },
    (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers)
      response.pipe(res)
    },
  )
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Backend is not running' }))
  })
  // A closed tab must end the upstream request too, or the backend would keep
  // the device listed in its pairing room.
  res.on('close', () => upstream.destroy())
  req.pipe(upstream)
}

/** Forward a WebSocket upgrade to the backend by splicing the two sockets together. */
export function proxyUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): void {
  const upstream = connect(BACKEND_PORT, BACKEND_HOST, () => {
    const headers = { ...req.headers, 'x-forwarded-for': forwardedFor(req) }
    let raw = `${req.method} ${req.url} HTTP/1.1\r\n`
    for (const [key, value] of Object.entries(headers)) {
      if (value === undefined) continue
      for (const item of Array.isArray(value) ? value : [value]) raw += `${key}: ${item}\r\n`
    }
    upstream.write(`${raw}\r\n`)
    if (head.length) upstream.write(head)
    upstream.pipe(socket).pipe(upstream)
  })
  const close = () => {
    upstream.destroy()
    socket.destroy()
  }
  upstream.on('error', close)
  socket.on('error', close)
}
