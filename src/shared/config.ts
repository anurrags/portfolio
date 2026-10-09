/**
 * Where the backend (the separate `portfolio-backend` project) lives.
 *
 * Deployed: `VITE_API_URL` is set at build time to the Render URL, e.g.
 * `https://portfolio-backend.onrender.com`.
 *
 * Unset (local): this page's own origin. The local server forwards `/api` and
 * `/collab` to the backend, so the whole site is one address — the laptop at
 * `localhost:3000`, a phone at `192.168.x.x:3000` — with no configuration.
 */

function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (configured) return configured.replace(/\/+$/, '')
  return window.location.origin
}

export const API_BASE = resolveApiBase()

/** `https:` → `wss:`, `http:` → `ws:` — the editor's sync socket. */
export const COLLAB_URL = `${API_BASE.replace(/^http/, 'ws')}/collab`

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}
