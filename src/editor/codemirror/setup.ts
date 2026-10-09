import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from '@codemirror/language'
import { lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState, Prec, type Extension } from '@codemirror/state'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view'
import { yUndoManagerKeymap } from 'y-codemirror.next'

import { editorHighlightStyle, editorTheme } from './theme'

/**
 * A hand-rolled replacement for CodeMirror's `basicSetup`.
 *
 * `basicSetup` bundles `history()` and `historyKeymap`, and CodeMirror's local
 * history knows nothing about who authored an edit — with Yjs in play, Ctrl+Z
 * would happily revert a *collaborator's* typing. Undo is instead owned by the
 * Y.UndoManager, which tracks only this client's changes.
 *
 * The rest of this list mirrors `basicSetup` as of codemirror 6.0.2.
 */
export function baseExtensions(): Extension[] {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),

    // Two spaces, consistently, on every client — so the same keystroke doesn't
    // produce different whitespace for different people.
    indentUnit.of('  '),
    EditorState.tabSize.of(2),

    syntaxHighlighting(editorHighlightStyle, { fallback: true }),
    editorTheme,

    // Yjs undo must outrank the default keymap, which would otherwise swallow
    // Mod-z first.
    Prec.high(keymap.of(yUndoManagerKeymap)),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
      // Without this Tab moves focus instead of indenting.
      indentWithTab,
    ]),
  ]
}
