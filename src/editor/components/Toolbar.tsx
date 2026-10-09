import type { Awareness } from 'y-protocols/awareness'

import { LANGUAGES, type LanguageEntry } from '../codemirror/languages'
import type { RoomPhase } from '../collab/useRoom'
import { Icon } from '../../shared/Icon'
import { PresenceBar } from './PresenceBar'
import { EDITOR_HOME } from '../../shared/paths'

type Props = {
  language: LanguageEntry
  onLanguageChange: (id: string) => void
  awareness: Awareness | null
  onRenameSelf: (name: string) => void
  phase: RoomPhase
  canEdit: boolean
  onUndo: () => void
  onRedo: () => void
  onShare: () => void
}

const PHASE_LABEL: Record<RoomPhase, string> = {
  connecting: 'Connecting',
  ready: 'Live',
  denied: 'Denied',
  offline: 'Reconnecting',
}

export function Toolbar({
  language,
  onLanguageChange,
  awareness,
  onRenameSelf,
  phase,
  canEdit,
  onUndo,
  onRedo,
  onShare,
}: Props) {
  return (
    <header className="appbar">
      <div className="appbar-left">
        <a className="brandmark" href={EDITOR_HOME} title="New document">
          <Icon name="code" size={17} />
          <span className="brand-word">notepad</span>
        </a>

        <select
          className="control control-sm lang-select"
          value={language.id}
          disabled={!canEdit}
          aria-label="Language"
          title={canEdit ? 'Language — shared with everyone' : 'Waiting for the document'}
          onChange={(event) => onLanguageChange(event.target.value)}
        >
          {LANGUAGES.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>

        <div className="button-group history-group">
          <button
            className="control control-quiet control-icon"
            onClick={onUndo}
            disabled={!canEdit}
            title="Undo your own edits"
          >
            <Icon name="undo" size={17} label="Undo" />
          </button>
          <button
            className="control control-quiet control-icon"
            onClick={onRedo}
            disabled={!canEdit}
            title="Redo"
          >
            <Icon name="redo" size={17} label="Redo" />
          </button>
        </div>
      </div>

      <div className="appbar-right">
        {/* Text label alongside the dot, so state never rests on colour alone. */}
        <span className={`status status-${phase}`}>
          <i className="dot" />
          <span className="status-label">{PHASE_LABEL[phase]}</span>
        </span>

        {awareness && <PresenceBar awareness={awareness} onRenameSelf={onRenameSelf} />}

        <button className="control control-primary control-sm" onClick={onShare}>
          <Icon name="share" size={15} />
          <span className="share-word">Share</span>
        </button>
      </div>
    </header>
  )
}
