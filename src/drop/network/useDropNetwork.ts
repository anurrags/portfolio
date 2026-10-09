import { useCallback, useEffect, useRef, useState } from 'react'

import { PeerLink, type LinkDiagnostics, type LinkState, type Transfer } from './peer'
import {
  localDeviceId,
  localPeerId,
  openSignalChannel,
  type DropMode,
  type RosterPeer,
} from './signal'

export type DropPeer = RosterPeer & { state: LinkState; diagnostics: LinkDiagnostics | null }

export type DropNetwork = {
  selfId: string
  myDeviceId: string
  signalConnected: boolean
  mode: DropMode
  /** The private LAN address the server saw for us; null means it saw none. */
  myIp: string | null
  peers: DropPeer[]
  transfers: Transfer[]
  sendFiles: (peerId: string, files: File[]) => void
  cancel: (peerId: string, transferId: string) => void
  dismiss: (transferId: string) => void
}

/**
 * Keeps one `PeerLink` per other device on the roster.
 *
 * Links are established as soon as a device appears rather than when a file is
 * picked, so the UI can honestly say "ready" before you choose anything — and
 * so the ICE handshake isn't sitting in front of the first transfer.
 */
export function useDropNetwork(
  code: string | null,
  myName: string,
  enabled: boolean,
  iceServers: { urls: string }[],
): DropNetwork {
  const selfId = useRef(localPeerId()).current
  const myDeviceId = useRef(localDeviceId()).current
  const [signalConnected, setSignalConnected] = useState(false)
  const [mode, setMode] = useState<DropMode>('lan')
  const [myIp, setMyIp] = useState<string | null>(null)
  const [roster, setRoster] = useState<RosterPeer[]>([])
  const [states, setStates] = useState<Record<string, LinkState>>({})
  const [diagnostics, setDiagnostics] = useState<Record<string, LinkDiagnostics>>({})
  const [transfers, setTransfers] = useState<Transfer[]>([])

  const links = useRef(new Map<string, PeerLink>())
  const rosterRef = useRef<RosterPeer[]>([])

  const upsertTransfer = useCallback((transfer: Transfer) => {
    setTransfers((current) => {
      const index = current.findIndex((entry) => entry.id === transfer.id)
      if (index === -1) return [transfer, ...current]
      const next = [...current]
      next[index] = transfer
      return next
    })
  }, [])

  useEffect(() => {
    if (!enabled || !code) return

    const events = {
      onState: (peerId: string, state: LinkState) => {
        setStates((current) => ({ ...current, [peerId]: state }))
      },
      onTransfer: upsertTransfer,
    }

    const ensureLink = (peer: RosterPeer): PeerLink => {
      const existing = links.current.get(peer.id)
      if (existing) {
        existing.peerName = peer.name
        return existing
      }
      const link = new PeerLink({
        code,
        selfId,
        peerId: peer.id,
        peerName: peer.name,
        events,
        // Deterministic: the smaller id offers. Without this both sides offer
        // at once and the handshake collides.
        initiator: selfId < peer.id,
        iceServers,
      })
      links.current.set(peer.id, link)
      setStates((current) => ({ ...current, [peer.id]: 'connecting' }))
      return link
    }

    const close = openSignalChannel(code, selfId, myName, {
      onWelcome: (_self, welcomeMode, ip) => {
        setMode(welcomeMode)
        setMyIp(ip)
      },
      onConnectionChange: setSignalConnected,
      onRoster: (peers) => {
        const others = peers.filter((peer) => peer.id !== selfId)
        rosterRef.current = others
        setRoster(others)

        for (const peer of others) ensureLink(peer)

        // Drop links to devices that have left.
        for (const [peerId, link] of links.current) {
          if (!others.some((peer) => peer.id === peerId)) {
            link.close()
            links.current.delete(peerId)
            setStates((current) => {
              const next = { ...current }
              delete next[peerId]
              return next
            })
          }
        }
      },
      onSignal: ({ from, name, payload }) => {
        // A signal can arrive just before the roster naming its sender.
        const known = rosterRef.current.find((peer) => peer.id === from)
        const link = ensureLink(known ?? { id: from, deviceId: '', name, kind: '' })
        void link.accept(payload)
      },
    })

    const poll = setInterval(() => {
      const snapshot: Record<string, LinkDiagnostics> = {}
      for (const [peerId, link] of links.current) {
        void link.refreshSelectedPair()
        snapshot[peerId] = link.diagnostics()
      }
      setDiagnostics(snapshot)
    }, 1500)

    return () => {
      clearInterval(poll)
      close()
      for (const link of links.current.values()) link.close()
      links.current.clear()
      setStates({})
      setRoster([])
      setSignalConnected(false)
    }
  }, [code, myName, enabled, selfId, upsertTransfer, iceServers])

  const sendFiles = useCallback((peerId: string, files: File[]) => {
    const link = links.current.get(peerId)
    if (!link) return
    for (const file of files) link.sendFile(file)
  }, [])

  const cancel = useCallback((peerId: string, transferId: string) => {
    links.current.get(peerId)?.cancel(transferId)
  }, [])

  const dismiss = useCallback((transferId: string) => {
    setTransfers((current) => {
      const target = current.find((entry) => entry.id === transferId)
      // Release the Blob so a dismissed download stops holding disk/memory.
      if (target?.url) URL.revokeObjectURL(target.url)
      return current.filter((entry) => entry.id !== transferId)
    })
  }, [])

  return {
    selfId,
    myDeviceId,
    signalConnected,
    mode,
    myIp,
    peers: roster.map((peer) => ({
      ...peer,
      state: states[peer.id] ?? 'connecting',
      diagnostics: diagnostics[peer.id] ?? null,
    })),
    transfers,
    sendFiles,
    cancel,
    dismiss,
  }
}
