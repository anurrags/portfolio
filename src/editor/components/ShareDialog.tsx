import { useEffect, useState } from 'react'

import type { LanguageEntry } from '../codemirror/languages'
import { Icon } from '../../shared/Icon'
import { copyPlain, copyRich, downloadFile } from '../export/clipboard'
import { codeToInlineStyledHtml, toMarkdownFence } from '../export/highlightToHtml'
import { editorDocument } from '../../shared/paths'

type Props = {
  roomId: string
  language: LanguageEntry
  getCode: () => string
  onClose: () => void
}

export function ShareDialog({ roomId, language, getCode, onClose }: Props) {
  const [flash, setFlash] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // One link, one level of access: whoever opens it can edit.
  const link = `${window.location.origin}${editorDocument(roomId)}`

  // Rendering the exact markup that goes on the clipboard doubles as a way to
  // see what a recipient will actually get.
  useEffect(() => {
    let cancelled = false
    codeToInlineStyledHtml(getCode(), language).then((html) => {
      if (!cancelled) setPreview(html)
    })
    return () => {
      cancelled = true
    }
  }, [getCode, language])

  const announce = (message: string) => {
    setFlash(message)
    setTimeout(() => setFlash((current) => (current === message ? null : current)), 1800)
  }

  const copyLink = async () => {
    announce((await copyPlain(link)) ? 'Link copied' : 'Copy failed')
  }

  const copyAsHtml = async () => {
    const code = getCode()
    const html = await codeToInlineStyledHtml(code, language)
    const result = await copyRich(code, html)
    announce(
      result === 'rich'
        ? 'Copied with formatting'
        : result === 'plain'
          ? 'Copied as plain text (rich copy unavailable)'
          : 'Copy failed',
    )
  }

  const copyAsMarkdown = async () => {
    const fenced = toMarkdownFence(getCode(), language.fence)
    announce((await copyPlain(fenced)) ? 'Copied as Markdown' : 'Copy failed')
  }

  const download = () => {
    downloadFile(`${roomId}.${language.ext}`, getCode())
    announce('Downloaded')
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card card-wide" onClick={(event) => event.stopPropagation()}>
        <div className="card-head">
          <h2>Share</h2>
          {/* Always an explicit escape route out of the dialog. */}
          <button className="control control-quiet control-icon" onClick={onClose} title="Close">
            <Icon name="close" size={17} label="Close" />
          </button>
        </div>

        <section className="share-section">
          <label className="field-label">Document link</label>
          <div className="row">
            <input
              className="control control-grow mono"
              readOnly
              aria-label="Document link"
              value={link}
              onFocus={(event) => event.target.select()}
            />
            <button className="control" onClick={copyLink}>
              <Icon name="copy" size={15} />
              Copy
            </button>
          </div>
          <p className="note">
            Anyone with this link can edit, delete and modify the document. There is no view-only
            mode — treat the link itself as the permission.
          </p>
        </section>

        <section className="share-section">
          <label className="field-label">Export the code</label>
          <div className="row row-wrap">
            <button className="control" onClick={copyAsHtml}>
              <Icon name="copy" size={15} />
              Copy with formatting
            </button>
            <button className="control" onClick={copyAsMarkdown}>
              <Icon name="copy" size={15} />
              Copy as Markdown
            </button>
            <button className="control" onClick={download}>
              <Icon name="download" size={15} />
              .{language.ext}
            </button>
          </div>
          <p className="note">
            “Copy with formatting” keeps colors and indentation when pasted into Gmail, Docs,
            Confluence or Notion. Pasting into a terminal or editor still gives plain source.
          </p>
        </section>

        {preview && (
          <section className="share-section">
            <label className="field-label">Preview of the formatted copy</label>
            <div className="preview" dangerouslySetInnerHTML={{ __html: preview }} />
          </section>
        )}

        {/* Announced politely, and never steals focus. */}
        {flash && (
          <div className="flash" role="status" aria-live="polite">
            <Icon name="check" size={14} />
            {flash}
          </div>
        )}
      </div>
    </div>
  )
}
