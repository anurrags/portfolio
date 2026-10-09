import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRoom } from '../collab/useRoom'
import { CollabEditor, type EditorHandle } from '../codemirror/CollabEditor'
import { findLanguage } from '../codemirror/languages'
import { JoinGate } from '../components/JoinGate'
import { ShareDialog } from '../components/ShareDialog'
import { Toolbar } from '../components/Toolbar'
import { loadUser, saveUser, type LocalUser } from '../../shared/user'
import { EDITOR_HOME } from '../../shared/paths'
import { apiUrl } from '../../shared/config'

type Probe =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; message: string }
  | { status: 'found'; requiresPassword: boolean; language: string }

export function Room() {
  const { roomId = '' } = useParams()
  const [password, setPassword] = useState<string | undefined>(undefined)
  const [probe, setProbe] = useState<Probe>({ status: 'loading' })
  const [user, setUser] = useState<LocalUser>(loadUser)
  const [handle, setHandle] = useState<EditorHandle | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [languageId, setLanguageId] = useState('plaintext')

  // Ask whether the room exists (and whether it wants a password) before
  // opening a socket that would only be rejected.
  useEffect(() => {
    let cancelled = false
    setProbe({ status: 'loading' })

    fetch(apiUrl(`/api/rooms/${encodeURIComponent(roomId)}`))
      .then(async (response) => {
        if (cancelled) return
        if (response.status === 404) {
          setProbe({ status: 'missing' })
          return
        }
        const body = (await response.json()) as { requiresPassword: boolean; language: string }
        setProbe({
          status: 'found',
          requiresPassword: body.requiresPassword,
          language: body.language,
        })
        setLanguageId(body.language)
      })
      .catch(() => {
        if (!cancelled) setProbe({ status: 'error', message: 'Could not reach the server.' })
      })

    return () => {
      cancelled = true
    }
  }, [roomId])

  const needsPassword =
    probe.status === 'found' && probe.requiresPassword && password === undefined
  const connectionEnabled = probe.status === 'found' && !needsPassword

  const { session, phase, error } = useRoom(roomId, { password }, connectionEnabled)

  const ytext = useMemo(() => session?.doc.getText('codemirror') ?? null, [session])
  const meta = useMemo(() => session?.doc.getMap('meta') ?? null, [session])
  const awareness = session?.provider.awareness ?? null

  // The language is shared state, so a change by one person re-highlights for
  // everyone.
  useEffect(() => {
    if (!meta) return
    const sync = () => {
      const value = meta.get('language')
      if (typeof value === 'string') setLanguageId(value)
    }
    sync()
    meta.observe(sync)
    return () => meta.unobserve(sync)
  }, [meta])

  useEffect(() => {
    if (!awareness) return
    // Exactly the shape y-codemirror.next's selection layer reads.
    awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
      colorLight: `${user.color}33`,
    })
  }, [awareness, user])

  const language = findLanguage(languageId)
  // Everyone past the auth hook can write; we only wait for the initial sync
  // so nobody types into an empty buffer before the document arrives.
  const canEdit = phase === 'ready'

  const getCode = useCallback(() => ytext?.toString() ?? '', [ytext])

  const renameSelf = (name: string) => {
    const next = { ...user, name }
    setUser(next)
    saveUser(next)
  }

  const changeLanguage = (id: string) => {
    if (!meta || !canEdit) return
    meta.set('language', id)
  }

  if (probe.status === 'loading') {
    return <div className="centered muted">Opening document…</div>
  }

  if (probe.status === 'missing') {
    return (
      <div className="centered">
        <div className="card">
          <h1>Document not found</h1>
          <p className="muted">
            This document doesn’t exist, or it expired. Documents are held in memory only and are
            dropped once everyone has left.
          </p>
          <a className="control control-primary control-block" href={EDITOR_HOME}>
            Start a new one
          </a>
        </div>
      </div>
    )
  }

  if (probe.status === 'error') {
    return (
      <div className="centered">
        <div className="card">
          <h1>Can’t reach the server</h1>
          <p className="muted">{probe.message}</p>
        </div>
      </div>
    )
  }

  if (needsPassword || (phase === 'denied' && probe.requiresPassword)) {
    return <JoinGate error={phase === 'denied' ? error : null} onSubmit={setPassword} />
  }

  if (phase === 'denied') {
    return (
      <div className="centered">
        <div className="card">
          <h1>Access denied</h1>
          <p className="muted">{error ?? 'The server refused this connection.'}</p>
          <a className="control control-block" href={EDITOR_HOME}>
            Back
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="room">
      <Toolbar
        language={language}
        onLanguageChange={changeLanguage}
        awareness={awareness}
        onRenameSelf={renameSelf}
        phase={phase}
        canEdit={canEdit}
        onUndo={() => handle?.undoManager.undo()}
        onRedo={() => handle?.undoManager.redo()}
        onShare={() => setShareOpen(true)}
      />

      <main className="editor-wrap">
        {ytext && awareness ? (
          <CollabEditor
            ytext={ytext}
            awareness={awareness}
            language={language}
            editable={canEdit}
            onReady={setHandle}
          />
        ) : (
          <div className="centered muted">Connecting…</div>
        )}
      </main>

      {shareOpen && (
        <ShareDialog
          roomId={roomId}
          language={language}
          getCode={getCode}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
