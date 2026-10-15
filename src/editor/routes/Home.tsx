import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Icon } from '../../shared/Icon'
import { LANGUAGES } from '../codemirror/languages'
import { editorDocument } from '../../shared/paths'
import { apiUrl } from '../../shared/config'
import { EditorContent } from '../components/EditorContent'

export function Home() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('plaintext')
  const [password, setPassword] = useState('')
  const [usePassword, setUsePassword] = useState(false)
  const [joinId, setJoinId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(apiUrl('/api/rooms'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          language,
          password: usePassword && password ? password : undefined,
        }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? `Server returned ${response.status}`)
      }
      const room = (await response.json()) as { roomId: string }
      navigate(editorDocument(room.roomId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the document')
      setBusy(false)
    }
  }

  return (
    <>
      <div className="drop-hero">
        <div className="card">
          <div className="card-title">
            <h1 className="drop-h1">
              <Icon name="code" size={20} /> Collaborative Code Editor
            </h1>
            <p className="drop-lede">
              A shared real-time code editor. Create a document, send the link, type together.
            </p>
          </div>

        <div className="field">
          <label className="field-label" htmlFor="language">
            Language
          </label>
          <select
            id="language"
            className="control control-block"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            {LANGUAGES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={usePassword}
            onChange={(event) => setUsePassword(event.target.checked)}
          />
          <Icon name="lock" size={15} />
          Protect with a password
        </label>

        {/* Revealed only when asked for, rather than shown to everyone upfront. */}
        {usePassword && (
          <div className="field">
            <label className="field-label" htmlFor="new-password">
              Password
            </label>
            <input
              id="new-password"
              className="control control-block"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        )}

        {error && (
          <p className="error" role="alert">
            <Icon name="alert" size={14} />
            <span>{error}</span>
          </p>
        )}

        <button
          className="control control-primary control-block"
          onClick={create}
          disabled={busy || (usePassword && !password)}
        >
          {busy ? 'Creating…' : 'New document'}
        </button>

        <hr className="rule" />

        <form
          className="field"
          onSubmit={(event) => {
            event.preventDefault()
            const id = joinId.trim()
            if (id) navigate(editorDocument(id))
          }}
        >
          <label className="field-label" htmlFor="join">
            Or open an existing one
          </label>
          <div className="row">
            <input
              id="join"
              className="control control-grow mono"
              placeholder="Document ID"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={joinId}
              onChange={(event) => setJoinId(event.target.value)}
            />
            <button className="control" type="submit" disabled={!joinId.trim()}>
              Open
            </button>
          </div>
        </form>

        <p className="note">
          Documents are kept in memory only. They disappear when everyone leaves, and are not
          stored on disk.
        </p>
      </div>
    </div>
    <EditorContent />
  </>
  )
}
