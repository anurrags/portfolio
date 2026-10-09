import { useState } from 'react'

import { Icon } from '../../shared/Icon'

type Props = {
  error: string | null
  onSubmit: (password: string) => void
}

/**
 * The provider surfaces the transport's own reason code (`permission-denied`)
 * rather than the message the server threw, so translate it here — in the one
 * place that knows the rejection was about a password.
 */
function humanize(error: string | null): string | null {
  if (!error) return null
  if (/permission-denied|unauthor|forbidden/i.test(error)) {
    return 'That password is not right. Try again.'
  }
  return error
}

export function JoinGate({ error, onSubmit }: Props) {
  const [password, setPassword] = useState('')
  const message = humanize(error)

  return (
    <div className="centered">
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(password)
        }}
      >
        <div className="card-title">
          <h1>
            <Icon name="lock" size={18} /> Password required
          </h1>
          <p className="muted">
            This document is protected. Ask whoever shared it for the password.
          </p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="doc-password">
            Password
          </label>
          <input
            id="doc-password"
            className="control control-block"
            type="password"
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? 'doc-password-error' : undefined}
          />
          {/* Error sits with its field, and is announced. */}
          {message && (
            <p className="error" id="doc-password-error" role="alert">
              <Icon name="alert" size={14} />
              <span>{message}</span>
            </p>
          )}
        </div>

        <button className="control control-primary control-block" type="submit" disabled={!password}>
          Open document
        </button>
      </form>
    </div>
  )
}
