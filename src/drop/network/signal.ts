import { apiUrl } from '../../shared/config'

export type RosterPeer = {
  id: string
  /** Stable per browser profile — two tabs of one browser share it. */
  deviceId: string
  name: string
  /** Device hint, e.g. "iPhone". */
  kind: string
}

/**
 * A coarse device label from the user agent.
 *
 * Only used to help a person tell "my phone" from "a tab on my laptop" in the
 * roster — never for behaviour, so a wrong guess is cosmetic.
 */
export function deviceKind(): string {
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Android/i.test(ua)) return 'Android'
  if (/Macintosh/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'device'
}

export type SignalPayload = {
  kind: 'offer' | 'answer' | 'candidate'
  sdp?: string
  candidate?: string
  sdpMid?: string | null
  sdpMLineIndex?: number | null
  usernameFragment?: string | null
}

export type InboundSignal = { from: string; name: string; payload: SignalPayload }

const base = apiUrl('/api/drop')

/**
 * A stable id for this browser tab.
 *
 * Kept in `sessionStorage` so that when `EventSource` silently reconnects — a
 * phone locking its screen is enough — the server recognises the same peer
 * instead of leaving a ghost in the roster.
 */
function randomId(prefix: string): string {
  return `${prefix}${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 6)}`
}

export function localPeerId(): string {
  const KEY = 'notepad.drop.peer'
  try {
    const existing = sessionStorage.getItem(KEY)
    if (existing) return existing
  } catch {
    // Private mode: fall through to an id that lives only in memory.
  }
  const id = randomId('p')
  try {
    sessionStorage.setItem(KEY, id)
  } catch {
    /* ignore */
  }
  return id
}

/**
 * Identifies this *browser*, not this tab.
 *
 * In `localStorage`, so every tab of the same browser reports the same value
 * and the UI can label those peers "this browser". Hosted, everyone in a room
 * shares one public IP, so the address can no longer serve that purpose.
 */
export function localDeviceId(): string {
  const KEY = 'notepad.drop.device'
  try {
    const existing = localStorage.getItem(KEY)
    if (existing) return existing
  } catch {
    /* fall through */
  }
  const id = randomId('d')
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* ignore */
  }
  return id
}

export type DropMode = 'lan' | 'loopback' | 'internet'

export type DropRefusal = 'cellular' | 'unknown-network' | null

export type DropSession = {
  ok: true
  /** 'lan' when the server runs on your network; 'internet' when hosted. */
  mode: DropMode
  /** Set when this network is not eligible — currently carrier NAT. */
  refusal: DropRefusal
  /** Short label for the group of devices behind your router. */
  room: string | null
  iceServers: { urls: string }[]
  /**
   * Bare LAN addresses of the backend's machine. The backend runs on its own
   * port, so the page builds QR URLs from these plus its *own* port.
   */
  lanAddresses: string[]
  /** Null when the server saw no private LAN address for us. */
  yourIp: string | null
  yourRawIp: string | null
}

export async function fetchDropSession(): Promise<DropSession | { refusal: DropRefusal } | null> {
  const response = await fetch(`${base}/session`)
  if (response.status === 403) {
    const body = (await response.json().catch(() => ({}))) as { refusal?: DropRefusal }
    return { refusal: body.refusal ?? 'cellular' }
  }
  if (!response.ok) return null
  return (await response.json()) as DropSession
}

/** Ask the server for a fresh pairing code. */
export async function createPairingCode(): Promise<{ code: string; pretty: string }> {
  const response = await fetch(`${base}/rooms`, { method: 'POST' })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'Could not create a pairing code')
  }
  return (await response.json()) as { code: string; pretty: string }
}

export async function checkPairingCode(code: string): Promise<boolean> {
  const response = await fetch(`${base}/rooms/${encodeURIComponent(code)}`)
  return response.ok
}

/**
 * The code lives in the URL fragment, which browsers never send to the server.
 * That keeps it out of access logs and `Referer` headers while still letting a
 * scanned QR carry it, so the second device pairs without anyone typing.
 */
export function readCodeFromUrl(): string | null {
  const raw = window.location.hash.replace(/^#/, '').trim()
  return /^\d{6}$/.test(raw) ? raw : null
}

export function writeCodeToUrl(code: string): void {
  if (window.location.hash.replace(/^#/, '') !== code) {
    window.history.replaceState(null, '', `${window.location.pathname}#${code}`)
  }
}

export type SignalHandlers = {
  onWelcome: (self: string, mode: DropMode, yourIp: string | null) => void
  onRoster: (peers: RosterPeer[]) => void
  onSignal: (message: InboundSignal) => void
  onConnectionChange: (connected: boolean) => void
}

/** Open the signalling inbox. Returns a closer. */
export function openSignalChannel(
  code: string,
  peerId: string,
  name: string,
  handlers: SignalHandlers,
): () => void {
  const params = new URLSearchParams({
    code,
    peer: peerId,
    device: localDeviceId(),
    name,
    kind: deviceKind(),
  })
  const source = new EventSource(`${base}/signal?${params.toString()}`)

  source.addEventListener('open', () => handlers.onConnectionChange(true))
  source.addEventListener('error', () => handlers.onConnectionChange(false))

  source.addEventListener('message', (event) => {
    let message: Record<string, unknown>
    try {
      message = JSON.parse(event.data)
    } catch {
      return
    }

    if (message.type === 'welcome') {
      handlers.onWelcome(
        String(message.self),
        (message.mode as DropMode) ?? 'lan',
        typeof message.yourIp === 'string' ? message.yourIp : null,
      )
    } else if (message.type === 'roster') {
      handlers.onRoster((message.peers ?? []) as RosterPeer[])
    } else if (message.type === 'signal') {
      handlers.onSignal({
        from: String(message.from),
        name: String(message.name ?? 'device'),
        payload: message.payload as SignalPayload,
      })
    }
  })

  return () => source.close()
}

/** Post one handshake message toward a specific peer. */
export async function sendSignal(
  code: string,
  from: string,
  to: string,
  payload: SignalPayload,
): Promise<void> {
  await fetch(`${base}/signal`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, from, to, payload }),
  })
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

export function formatRate(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`
}
