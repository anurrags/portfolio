import { useEffect, useState } from 'react'
import type { Awareness } from 'y-protocols/awareness'

type Peer = {
  clientId: number
  name: string
  color: string
  isSelf: boolean
}

function usePeers(awareness: Awareness): Peer[] {
  const [peers, setPeers] = useState<Peer[]>([])

  useEffect(() => {
    const update = () => {
      const next: Peer[] = []
      awareness.getStates().forEach((state, clientId) => {
        const user = (state as { user?: { name?: string; color?: string } }).user
        if (!user?.name) return
        next.push({
          clientId,
          name: user.name,
          color: user.color ?? '#888',
          isSelf: clientId === awareness.clientID,
        })
      })
      next.sort((a, b) => Number(b.isSelf) - Number(a.isSelf) || a.name.localeCompare(b.name))
      setPeers(next)
    }

    update()
    awareness.on('change', update)
    return () => awareness.off('change', update)
  }, [awareness])

  return peers
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?'
}

type Props = {
  awareness: Awareness
  onRenameSelf: (name: string) => void
}

export function PresenceBar({ awareness, onRenameSelf }: Props) {
  const peers = usePeers(awareness)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const self = peers.find((peer) => peer.isSelf)

  const commit = () => {
    const trimmed = draft.trim().slice(0, 32)
    if (trimmed) onRenameSelf(trimmed)
    setEditing(false)
  }

  return (
    <div className="presence" title={`${peers.length} connected`}>
      {peers.map((peer) =>
        peer.isSelf && editing ? (
          <input
            key={peer.clientId}
            className="presence-rename"
            aria-label="Your display name"
            autoFocus
            value={draft}
            maxLength={32}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit()
              if (event.key === 'Escape') setEditing(false)
            }}
          />
        ) : (
          <span
            key={peer.clientId}
            className={peer.isSelf ? 'avatar avatar-self' : 'avatar'}
            style={{ backgroundColor: peer.color }}
            title={peer.isSelf ? `${peer.name} (you) — click to rename` : peer.name}
            role={peer.isSelf ? 'button' : 'img'}
            tabIndex={peer.isSelf ? 0 : undefined}
            aria-label={peer.isSelf ? `You, ${peer.name}. Click to rename.` : peer.name}
            onKeyDown={
              peer.isSelf
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setDraft(peer.name)
                      setEditing(true)
                    }
                  }
                : undefined
            }
            onClick={
              peer.isSelf
                ? () => {
                    setDraft(peer.name)
                    setEditing(true)
                  }
                : undefined
            }
          >
            {initials(peer.name)}
          </span>
        ),
      )}
      {!self && <span className="presence-empty">connecting…</span>}
    </div>
  )
}
