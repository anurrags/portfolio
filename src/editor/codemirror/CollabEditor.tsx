import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import type { Awareness } from 'y-protocols/awareness'
import { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { yCollab } from 'y-codemirror.next'

import { baseExtensions } from './setup'
import type { LanguageEntry } from './languages'

export type EditorHandle = {
  view: EditorView
  undoManager: Y.UndoManager
}

type Props = {
  ytext: Y.Text
  awareness: Awareness
  language: LanguageEntry
  editable: boolean
  onReady: (handle: EditorHandle | null) => void
}

export function CollabEditor({ ytext, awareness, language, editable, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const languageCompartment = useRef(new Compartment()).current
  const editableCompartment = useRef(new Compartment()).current

  // Read inside the mount effect without making it a dependency — changing the
  // language must reconfigure the view, never rebuild it.
  const languageRef = useRef(language)
  languageRef.current = language
  const editableRef = useRef(editable)
  editableRef.current = editable

  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // Built once, here. Constructing this during render would silently reset
    // undo history on every re-render.
    //
    // `trackedOrigins: new Set()` rather than the default `new Set([null])`:
    // the yCollab plugin registers its own sync origin, and the default would
    // additionally make origin-less transactions (server-seeded metadata, for
    // instance) undoable by the user.
    const undoManager = new Y.UndoManager(ytext, {
      trackedOrigins: new Set(),
      captureTimeout: 500,
    })

    const state = EditorState.create({
      // Must equal the CRDT's current content exactly — the sync plugin does no
      // initial reconciliation, so any other starting value desyncs permanently.
      doc: ytext.toString(),
      extensions: [
        ...baseExtensions(),
        languageCompartment.of([]),
        editableCompartment.of(EditorView.editable.of(editableRef.current)),
        yCollab(ytext, awareness, { undoManager }),
      ],
    })

    const view = new EditorView({ state, parent: host })
    viewRef.current = view
    onReadyRef.current({ view, undoManager })

    // The view was just rebuilt with an empty language compartment, so re-apply
    // whatever language is currently selected.
    void applyLanguage(view, languageCompartment, languageRef.current)

    return () => {
      onReadyRef.current(null)
      view.destroy()
      undoManager.destroy()
      viewRef.current = null
    }
  }, [ytext, awareness, languageCompartment, editableCompartment])

  useEffect(() => {
    const view = viewRef.current
    if (view) void applyLanguage(view, languageCompartment, language)
  }, [language, languageCompartment])

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: editableCompartment.reconfigure(EditorView.editable.of(editable)),
    })
  }, [editable, editableCompartment])

  return <div className="editor-host" ref={hostRef} />
}

async function applyLanguage(
  view: EditorView,
  compartment: Compartment,
  entry: LanguageEntry,
): Promise<void> {
  const support = await entry.load()
  // The view may have been torn down while the grammar was loading.
  if (!view.dom.isConnected) return
  view.dispatch({ effects: compartment.reconfigure(support ? [support] : []) })
}
