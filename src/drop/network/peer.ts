import { sendSignal, type SignalPayload } from './signal'

export type LinkState = 'connecting' | 'ready' | 'failed' | 'closed'

export type Transfer = {
  id: string
  direction: 'send' | 'receive'
  name: string
  size: number
  transferred: number
  status: 'active' | 'done' | 'failed' | 'cancelled'
  error?: string
  /** Object URL for a completed inbound file. */
  url?: string
  bytesPerSecond: number
  peerName: string
}

export type LinkDiagnostics = {
  iceConnectionState: string
  iceGatheringState: string
  connectionState: string
  signalingState: string
  /** What we advertised, e.g. `host 192.168.68.104:54321`. */
  localCandidates: string[]
  /** What arrived from the peer, after the server's rewrite. */
  remoteCandidates: string[]
  /** True if any remote candidate still carried an unresolvable `.local` name. */
  remoteHasMdns: boolean
  selectedPair: string | null
}

type Events = {
  onState: (peerId: string, state: LinkState) => void
  onTransfer: (transfer: Transfer) => void
}

/** `candidate:… udp … 192.168.1.5 54321 typ host` → `host 192.168.1.5:54321` */
function summariseCandidate(candidate: string): string {
  const parts = candidate.split(' ')
  const typeIndex = parts.indexOf('typ')
  const type = typeIndex >= 0 ? parts[typeIndex + 1] : '?'
  return `${type} ${parts[4] ?? '?'}:${parts[5] ?? '?'}`
}

/**
 * ICE servers come from the server, which knows which mode it is in: an empty
 * list on a LAN (no internet, and host candidates suffice) and STUN when
 * hosted, where a second path is worth having.
 */

/** Fall back to a conservative frame if the channel doesn't report a limit. */
const DEFAULT_CHUNK = 16 * 1024
const MAX_CHUNK = 64 * 1024

/** Pause sending above this much queued, resume when it drains. */
const HIGH_WATER = 4 * 1024 * 1024
const LOW_WATER = 512 * 1024

/** Flush received chunks into a Blob this often, to keep them off the JS heap. */
const SPILL_EVERY = 8 * 1024 * 1024

type Inbound = {
  id: string
  name: string
  size: number
  mime: string
  received: number
  /** Already spilled to Blobs — the browser can page these out of memory. */
  spilled: Blob[]
  /** Not yet spilled. */
  pending: ArrayBuffer[]
  pendingBytes: number
  startedAt: number
}

/**
 * One peer-to-peer link, carrying files over a WebRTC data channel.
 *
 * Nothing here touches the server: it is used only to exchange the handshake
 * (see `signal.ts`), after which bytes travel device to device.
 */
export class PeerLink {
  readonly peerId: string
  peerName: string

  private readonly code: string
  private readonly selfId: string
  private readonly events: Events
  private readonly pc: RTCPeerConnection
  private channel: RTCDataChannel | null = null
  private chunkSize = DEFAULT_CHUNK

  /** Candidates that arrived before the remote description was set. */
  private queuedCandidates: RTCIceCandidateInit[] = []
  private remoteReady = false

  private readonly localCandidates: string[] = []
  private readonly remoteCandidates: string[] = []
  private remoteHasMdns = false
  private selectedPair: string | null = null

  private inbound: Inbound | null = null
  private sendQueue: Promise<void> = Promise.resolve()
  private cancelled = new Set<string>()
  private closed = false

  constructor(options: {
    code: string
    selfId: string
    peerId: string
    peerName: string
    events: Events
    /** The lexicographically smaller id offers, so both sides never offer. */
    initiator: boolean
    iceServers: { urls: string }[]
  }) {
    this.code = options.code
    this.selfId = options.selfId
    this.peerId = options.peerId
    this.peerName = options.peerName
    this.events = options.events

    this.pc = new RTCPeerConnection({ iceServers: options.iceServers })

    this.pc.onicecandidate = (event) => {
      if (!event.candidate) return
      this.localCandidates.push(summariseCandidate(event.candidate.candidate))
      void this.signal({
        kind: 'candidate',
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        usernameFragment: event.candidate.usernameFragment,
      })
    }

    this.pc.onconnectionstatechange = () => {
      const state = this.pc.connectionState
      if (state === 'failed' || state === 'disconnected') this.events.onState(this.peerId, 'failed')
      if (state === 'closed') this.events.onState(this.peerId, 'closed')
    }

    this.pc.ondatachannel = (event) => this.adoptChannel(event.channel)

    if (options.initiator) {
      this.adoptChannel(this.pc.createDataChannel('files', { ordered: true }))
      void this.negotiate()
    }
  }

  get ready(): boolean {
    return this.channel?.readyState === 'open'
  }

  // ------------------------------------------------------------ signalling

  private async signal(payload: SignalPayload): Promise<void> {
    if (this.closed) return
    try {
      await sendSignal(this.code, this.selfId, this.peerId, payload)
    } catch {
      // The peer may have just left; the roster update will clean us up.
    }
  }

  private async negotiate(): Promise<void> {
    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)
    await this.signal({ kind: 'offer', sdp: offer.sdp })
  }

  /** Feed in a handshake message that arrived from the signalling channel. */
  async accept(payload: SignalPayload): Promise<void> {
    if (this.closed) return

    if (payload.kind === 'offer' && payload.sdp) {
      await this.pc.setRemoteDescription({ type: 'offer', sdp: payload.sdp })
      this.remoteReady = true
      await this.drainCandidates()
      const answer = await this.pc.createAnswer()
      await this.pc.setLocalDescription(answer)
      await this.signal({ kind: 'answer', sdp: answer.sdp })
      return
    }

    if (payload.kind === 'answer' && payload.sdp) {
      await this.pc.setRemoteDescription({ type: 'answer', sdp: payload.sdp })
      this.remoteReady = true
      await this.drainCandidates()
      return
    }

    if (payload.kind === 'candidate' && payload.candidate) {
      const candidate: RTCIceCandidateInit = {
        candidate: payload.candidate,
        sdpMid: payload.sdpMid ?? undefined,
        sdpMLineIndex: payload.sdpMLineIndex ?? undefined,
        usernameFragment: payload.usernameFragment ?? undefined,
      }
      this.remoteCandidates.push(summariseCandidate(payload.candidate))
      if (/\.local\b/i.test(payload.candidate)) this.remoteHasMdns = true

      // Candidates routinely arrive before the description they belong to.
      if (!this.remoteReady) {
        this.queuedCandidates.push(candidate)
        return
      }
      await this.pc.addIceCandidate(candidate).catch(() => {})
    }
  }

  /** A snapshot for the connection-details panel. */
  diagnostics(): LinkDiagnostics {
    return {
      iceConnectionState: this.pc.iceConnectionState,
      iceGatheringState: this.pc.iceGatheringState,
      connectionState: this.pc.connectionState,
      signalingState: this.pc.signalingState,
      localCandidates: [...new Set(this.localCandidates)],
      remoteCandidates: [...new Set(this.remoteCandidates)],
      remoteHasMdns: this.remoteHasMdns,
      selectedPair: this.selectedPair,
    }
  }

  /** Ask the browser which candidate pair actually won, if any. */
  async refreshSelectedPair(): Promise<void> {
    try {
      const stats = await this.pc.getStats()
      const labels = new Map<string, string>()
      let winner: { local?: string; remote?: string } | null = null

      stats.forEach((report) => {
        const entry = report as unknown as {
          type: string
          id: string
          candidateType?: string
          address?: string
          port?: number
          state?: string
          localCandidateId?: string
          remoteCandidateId?: string
        }
        if (entry.type === 'local-candidate' || entry.type === 'remote-candidate') {
          labels.set(entry.id, `${entry.candidateType ?? '?'} ${entry.address ?? '?'}:${entry.port ?? '?'}`)
        }
        if (entry.type === 'candidate-pair' && entry.state === 'succeeded') {
          winner = { local: entry.localCandidateId, remote: entry.remoteCandidateId }
        }
      })

      const pair = winner as { local?: string; remote?: string } | null
      this.selectedPair = pair
        ? `${labels.get(pair.local ?? '') ?? '?'} \u21c4 ${labels.get(pair.remote ?? '') ?? '?'}`
        : null
    } catch {
      /* stats are best-effort */
    }
  }

  private async drainCandidates(): Promise<void> {
    const queued = this.queuedCandidates
    this.queuedCandidates = []
    for (const candidate of queued) {
      await this.pc.addIceCandidate(candidate).catch(() => {})
    }
  }

  // -------------------------------------------------------------- channel

  private adoptChannel(channel: RTCDataChannel): void {
    this.channel = channel
    channel.binaryType = 'arraybuffer'
    channel.bufferedAmountLowThreshold = LOW_WATER

    channel.onopen = () => {
      const limit = this.pc.sctp?.maxMessageSize
      // Leave headroom for SCTP framing rather than sending exactly the max.
      this.chunkSize = limit ? Math.max(4096, Math.min(MAX_CHUNK, limit - 2048)) : DEFAULT_CHUNK
      this.events.onState(this.peerId, 'ready')
    }
    channel.onclose = () => this.events.onState(this.peerId, 'closed')
    channel.onerror = () => this.events.onState(this.peerId, 'failed')
    channel.onmessage = (event) => this.receive(event.data)
  }

  // --------------------------------------------------------------- sending

  /** Queue a file. Sends are serialised so the receiver can stay stateless. */
  sendFile(file: File): string {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const transfer: Transfer = {
      id,
      direction: 'send',
      name: file.name,
      size: file.size,
      transferred: 0,
      status: 'active',
      bytesPerSecond: 0,
      peerName: this.peerName,
    }
    this.events.onTransfer(transfer)

    this.sendQueue = this.sendQueue.then(() => this.pump(file, transfer)).catch(() => {})
    return id
  }

  cancel(transferId: string): void {
    this.cancelled.add(transferId)
  }

  private async pump(file: File, transfer: Transfer): Promise<void> {
    const channel = this.channel
    if (!channel || channel.readyState !== 'open') {
      this.events.onTransfer({ ...transfer, status: 'failed', error: 'Not connected' })
      return
    }

    channel.send(
      JSON.stringify({
        t: 'begin',
        id: transfer.id,
        name: file.name,
        size: file.size,
        mime: file.type || 'application/octet-stream',
      }),
    )

    let offset = 0
    const startedAt = Date.now()

    try {
      while (offset < file.size) {
        if (this.cancelled.has(transfer.id) || this.closed) {
          channel.send(JSON.stringify({ t: 'cancel', id: transfer.id }))
          this.events.onTransfer({ ...transfer, transferred: offset, status: 'cancelled' })
          return
        }

        // Don't outrun the network: let the send buffer drain before queueing more.
        if (channel.bufferedAmount > HIGH_WATER) {
          await new Promise<void>((resolve) => {
            const onLow = () => {
              channel.removeEventListener('bufferedamountlow', onLow)
              resolve()
            }
            channel.addEventListener('bufferedamountlow', onLow)
          })
          continue
        }

        // Slice, so a huge file is never resident in memory all at once.
        const slice = file.slice(offset, Math.min(offset + this.chunkSize, file.size))
        channel.send(await slice.arrayBuffer())
        offset += slice.size

        const elapsed = (Date.now() - startedAt) / 1000
        this.events.onTransfer({
          ...transfer,
          transferred: offset,
          bytesPerSecond: elapsed > 0 ? offset / elapsed : 0,
        })
      }

      channel.send(JSON.stringify({ t: 'end', id: transfer.id }))
      this.events.onTransfer({ ...transfer, transferred: file.size, status: 'done' })
    } catch (cause) {
      this.events.onTransfer({
        ...transfer,
        transferred: offset,
        status: 'failed',
        error: cause instanceof Error ? cause.message : 'Transfer failed',
      })
    }
  }

  // ------------------------------------------------------------- receiving

  private receive(data: string | ArrayBuffer): void {
    if (typeof data === 'string') {
      this.handleControl(data)
      return
    }

    const inbound = this.inbound
    if (!inbound) return

    inbound.pending.push(data)
    inbound.pendingBytes += data.byteLength
    inbound.received += data.byteLength

    // Move accumulated chunks into a Blob so the JS heap stays bounded even for
    // a multi-gigabyte file.
    if (inbound.pendingBytes >= SPILL_EVERY) {
      inbound.spilled.push(new Blob(inbound.pending))
      inbound.pending = []
      inbound.pendingBytes = 0
    }

    const elapsed = (Date.now() - inbound.startedAt) / 1000
    this.events.onTransfer({
      id: inbound.id,
      direction: 'receive',
      name: inbound.name,
      size: inbound.size,
      transferred: inbound.received,
      status: 'active',
      bytesPerSecond: elapsed > 0 ? inbound.received / elapsed : 0,
      peerName: this.peerName,
    })
  }

  private handleControl(raw: string): void {
    let message: { t?: string; id?: string; name?: string; size?: number; mime?: string }
    try {
      message = JSON.parse(raw)
    } catch {
      return
    }

    if (message.t === 'begin' && message.id) {
      this.inbound = {
        id: message.id,
        name: message.name || 'file',
        size: Number(message.size ?? 0),
        mime: message.mime || 'application/octet-stream',
        received: 0,
        spilled: [],
        pending: [],
        pendingBytes: 0,
        startedAt: Date.now(),
      }
      this.events.onTransfer({
        id: this.inbound.id,
        direction: 'receive',
        name: this.inbound.name,
        size: this.inbound.size,
        transferred: 0,
        status: 'active',
        bytesPerSecond: 0,
        peerName: this.peerName,
      })
      return
    }

    if (message.t === 'end' && this.inbound) {
      const inbound = this.inbound
      this.inbound = null

      if (inbound.pending.length > 0) inbound.spilled.push(new Blob(inbound.pending))
      const blob = new Blob(inbound.spilled, { type: inbound.mime })

      this.events.onTransfer({
        id: inbound.id,
        direction: 'receive',
        name: inbound.name,
        size: inbound.size || blob.size,
        transferred: blob.size,
        status: 'done',
        url: URL.createObjectURL(blob),
        bytesPerSecond: 0,
        peerName: this.peerName,
      })
      return
    }

    if (message.t === 'cancel' && this.inbound) {
      const inbound = this.inbound
      this.inbound = null
      this.events.onTransfer({
        id: inbound.id,
        direction: 'receive',
        name: inbound.name,
        size: inbound.size,
        transferred: inbound.received,
        status: 'cancelled',
        bytesPerSecond: 0,
        peerName: this.peerName,
      })
    }
  }

  close(): void {
    this.closed = true
    try {
      this.channel?.close()
    } catch {
      /* already gone */
    }
    this.pc.close()
  }
}
