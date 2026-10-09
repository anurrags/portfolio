import { HocuspocusProvider } from '@hocuspocus/provider'
import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { COLLAB_URL } from '../../shared/config'

export type RoomPhase = 'connecting' | 'ready' | 'denied' | 'offline'

export type Credentials = {
  password?: string
}

export type RoomSession = {
  doc: Y.Doc
  provider: HocuspocusProvider
}

export type RoomState = {
  session: RoomSession | null
  phase: RoomPhase
  error: string | null
}

function websocketUrl(): string {
  // The backend is a separate service (see config.ts), not this page's host.
  return COLLAB_URL
}

/**
 * Owns the Y.Doc and provider for one room.
 *
 * Access is all-or-nothing — anyone who gets past the server's auth hook has
 * full read-write — so there is no role to track here.
 *
 * The document and provider are created inside the effect and destroyed in its
 * cleanup, so React StrictMode's double-mount tears down the first pair
 * properly. Skipping `provider.destroy()` is what leaves ghost cursors of users
 * who are no longer there.
 */
export function useRoom(roomId: string, credentials: Credentials, enabled: boolean): RoomState {
  const [session, setSession] = useState<RoomSession | null>(null)
  const [phase, setPhase] = useState<RoomPhase>('connecting')
  const [error, setError] = useState<string | null>(null)

  // Serialised so a re-render with an equivalent object doesn't reconnect.
  const credentialKey = JSON.stringify({ p: credentials.password ?? null })

  useEffect(() => {
    // Held back until we know the room exists and any password has been
    // supplied — connecting early just produces a rejected socket.
    if (!enabled || !roomId) return

    const parsed = JSON.parse(credentialKey) as { p: string | null }
    const token = JSON.stringify({ password: parsed.p ?? undefined })

    setPhase('connecting')
    setError(null)

    const doc = new Y.Doc()
    const provider = new HocuspocusProvider({
      url: websocketUrl(),
      name: roomId,
      document: doc,
      token,
      onAuthenticated() {
        setError(null)
      },
      onAuthenticationFailed({ reason }) {
        setPhase('denied')
        setError(reason || 'Access denied')
        // Otherwise the provider retries a credential it already knows is bad.
        provider.disconnect()
      },
      onSynced({ state }) {
        if (state) setPhase('ready')
      },
      onDisconnect() {
        setPhase((current) => (current === 'denied' ? current : 'offline'))
      },
    })

    setSession({ doc, provider })

    return () => {
      provider.destroy()
      doc.destroy()
      setSession(null)
    }
  }, [roomId, credentialKey, enabled])

  return { session, phase, error }
}
