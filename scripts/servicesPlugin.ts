import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Server as HttpServer } from 'node:http'
import os from 'node:os'
import type { Logger, Plugin } from 'vite'

import { COLLAB_PATH, ensureBackend, isBackendPath, proxyRequest, proxyUpgrade } from './backend.ts'
import { loadVercelRules } from './routing.ts'
import { headTagsFor } from './seo.ts'

/**
 * Wires the editor and drop pages into the portfolio's Vite app.
 *
 * - Routing: `/editor`, `/editor/<id>` and `/drop` are served the way
 *   vercel.json says, in `npm start` and `npm run serve` alike, so local
 *   routing cannot drift from production.
 * - Backend: `/api/*` and the `/collab` WebSocket are forwarded to
 *   portfolio-backend, started automatically (see backend.ts). One port.
 * - SEO: each page gets its own <title>, description, robots and JSON-LD in
 *   the HTML itself (see seo.ts). `/editor/<id>` documents get a `noindex`
 *   variant, emitted at build time as `document.html`.
 *
 * The portfolio's own `index.html` is never touched.
 */

const PLACEHOLDER = '<title>notepad</title>'
const SEO_START = '<!--seo-->'
const SEO_END = '<!--/seo-->'
const DOCUMENT_ROUTE = '/tools/editor/_'

/** Which route a service HTML file is being rendered for. */
function routeFor(filename: string, requestPath: string | undefined): string | null {
  if (filename.endsWith('/drop.html')) return '/tools/drop'
  if (filename.endsWith('/editor.html')) {
    return requestPath && (/^\/tools\/editor\/[^/]+/.test(requestPath) || /^\/editor\/[^/]+/.test(requestPath))
      ? DOCUMENT_ROUTE
      : '/tools/editor'
  }
  if (filename.endsWith('/rent-vs-buy-calculator.html')) {
    return '/tools/rent-vs-buy-calculator'
  }
  return null
}

/**
 * The public origin, for canonical and Open Graph URLs: PUBLIC_ORIGIN, else
 * Vercel's production domain. Unknown → those two tags are left out.
 */
function publicOrigin(): string | null {
  const configured = process.env.PUBLIC_ORIGIN?.trim().replace(/\/+$/, '')
  if (configured) return configured
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) {
    const origin = `https://${vercel}`
    return origin === 'https://anurags.in' ? 'https://www.anurags.in' : origin
  }
  return 'https://www.anurags.in'
}

function seoBlock(origin: string | null, route: string): string {
  return `${SEO_START}${headTagsFor(route === DOCUMENT_ROUTE ? null : origin, route)}${SEO_END}`
}

type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void

/**
 * Routing + backend forwarding, shared by the dev and preview servers.
 * `rename` maps a rewrite destination to a file that exists on that server.
 */
function servicesMiddleware(rename: (destination: string) => string, withHeaders: boolean): Middleware {
  const { rewrites, headers, redirects } = loadVercelRules()
  return (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost')

    if (isBackendPath(url.pathname)) {
      proxyRequest(req, res)
      return
    }

    const redirect = redirects.find((rule) => rule.re.test(url.pathname))
    if (redirect?.destination) {
      const target = url.pathname.replace(redirect.re, redirect.destination)
      res.writeHead(301, { Location: target + url.search })
      res.end()
      return
    }

    if (withHeaders) {
      for (const rule of headers) {
        if (rule.re.test(url.pathname)) for (const header of rule.headers ?? []) res.setHeader(header.key, header.value)
      }
    }
    const rewrite = rewrites.find((rule) => rule.re.test(url.pathname))
    if (rewrite?.destination) req.url = rename(rewrite.destination) + url.search
    next()
  }
}

/** Forward the editor's sync WebSocket; leave every other upgrade (Vite's HMR) alone. */
function forwardCollab(httpServer: HttpServer): void {
  httpServer.on('upgrade', (req, socket, head) => {
    if (new URL(req.url ?? '/', 'http://localhost').pathname === COLLAB_PATH) proxyUpgrade(req, socket, head)
  })
}

async function startBackend(logger: Logger): Promise<void> {
  await ensureBackend((line) => logger.info(line))
}

function printServiceUrls(httpServer: HttpServer, logger: Logger): void {
  httpServer.once('listening', () => {
    const address = httpServer.address()
    const port = typeof address === 'object' && address ? address.port : ''
    const lan = Object.values(os.networkInterfaces())
      .flat()
      .find((entry) => entry && entry.family === 'IPv4' && !entry.internal && /^(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))\./.test(entry.address))
    // After Vite's own banner.
    setTimeout(() => {
      logger.info(`  ➜  Editor:     http://localhost:${port}/tools/editor`)
      logger.info(`  ➜  File drop:  http://${lan ? lan.address : 'localhost'}:${port}/tools/drop`)
      logger.info(`  ➜  Calculator: http://localhost:${port}/tools/rent-vs-buy-calculator\n`)
    }, 0)
  })
}

export function servicesPlugin(): Plugin {
  return {
    name: 'portfolio-services',

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const requestPath = ctx.originalUrl ? new URL(ctx.originalUrl, 'http://localhost').pathname : undefined
        const route = routeFor(ctx.filename, requestPath)
        if (!route || !html.includes(PLACEHOLDER)) return html
        // In dev the origin is localhost, which is not worth a canonical tag.
        return html.replace(PLACEHOLDER, seoBlock(ctx.server ? null : publicOrigin(), route))
      },
    },

    // document.html: editor.html with the noindex head, for /editor/<id>.
    // `post`, so Vite has already emitted editor.html.
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const editor = bundle['editor.html']
        if (!editor || editor.type !== 'asset') {
          this.error('editor.html missing from the bundle — cannot write document.html')
        }
        const html = String(editor.source)
        const start = html.indexOf(SEO_START)
        const end = html.indexOf(SEO_END)
        if (start < 0 || end < 0) this.error('SEO markers missing from editor.html')
        this.emitFile({
          type: 'asset',
          fileName: 'document.html',
          source: html.slice(0, start) + seoBlock(null, DOCUMENT_ROUTE) + html.slice(end + SEO_END.length),
        })
      },
    },

    closeBundle() {
      // A deployed build without a backend URL calls /api on the portfolio's
      // own domain, where Vercel has no backend. Say so in the build log.
      if (process.env.VERCEL && !process.env.VITE_API_URL) {
        console.warn('\n  ⚠ VITE_API_URL is not set — /editor and /drop will not reach their backend.')
        console.warn('    Set it in Vercel → Project → Settings → Environment Variables,')
        console.warn('    e.g. https://portfolio-backend.onrender.com\n')
      }
    },

    async configureServer(server) {
      // document.html only exists after a build; in dev it is editor.html,
      // with its head chosen per request in transformIndexHtml.
      server.middlewares.use(
        servicesMiddleware((destination) => (destination === '/document.html' ? '/editor.html' : destination), false),
      )
      if (server.httpServer) {
        forwardCollab(server.httpServer as HttpServer)
        printServiceUrls(server.httpServer as HttpServer, server.config.logger)
      }
      await startBackend(server.config.logger)
    },

    async configurePreviewServer(server) {
      server.middlewares.use(servicesMiddleware((destination) => destination, true))
      forwardCollab(server.httpServer as HttpServer)
      printServiceUrls(server.httpServer as HttpServer, server.config.logger)
      await startBackend(server.config.logger)
    },
  }
}
