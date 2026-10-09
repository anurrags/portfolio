import { HighlightStyle } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tagHighlighter, tags as t, type Highlighter, type Tag } from '@lezer/highlight'

/**
 * One source of truth for syntax colors.
 *
 * The same specs below produce (a) the CodeMirror highlight style and (b) the
 * inline-style map used by the rich-HTML export. Deriving both from one list is
 * what makes a pasted snippet look identical to the editor it came from — if
 * these were maintained separately they would drift within a week.
 */

/**
 * Mirrors the app's design tokens in `styles.css` so the editor surface and the
 * surrounding chrome are one system rather than two themes that nearly match.
 * These are duplicated as literals because the HTML export needs them at
 * runtime, outside CSS.
 */
export const palette = {
  bg: '#0f172a',
  bgElevated: '#172033',
  fg: '#e2e8f0',
  cursor: '#22c55e',
  selection: '#2b3a55',
  gutterFg: '#64748b',
  activeLine: 'rgba(148, 163, 184, 0.07)',
  matchingBracket: '#334155',
  border: '#263248',
} as const

export const codeFontStack =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

type TokenSpec = {
  /** Short key used as a sentinel class during export. */
  key: string
  tags: Tag | readonly Tag[]
  color: string
  fontStyle?: 'italic'
  fontWeight?: 'bold'
  textDecoration?: string
}

// Ordered general → specific; later, more specific tags win.
const tokenSpecs: readonly TokenSpec[] = [
  { key: 'nm', tags: [t.name, t.variableName, t.propertyName, t.labelName], color: '#f087a0' },
  { key: 'df', tags: [t.definition(t.variableName), t.definition(t.propertyName)], color: '#f0c778' },
  { key: 'fn', tags: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: '#6cb6ff' },
  { key: 'ty', tags: [t.typeName, t.className, t.namespace, t.definition(t.typeName)], color: '#f0c778' },
  { key: 'kw', tags: [t.keyword, t.moduleKeyword, t.controlKeyword, t.definitionKeyword, t.operatorKeyword, t.self], color: '#d19bf0' },
  { key: 'st', tags: [t.string, t.special(t.string), t.docString], color: '#8ddb92' },
  { key: 'rx', tags: [t.regexp, t.escape, t.character], color: '#5fd7d7' },
  { key: 'nu', tags: [t.number, t.integer, t.float, t.bool, t.null, t.atom, t.constant(t.name), t.standard(t.name)], color: '#ffab70' },
  { key: 'op', tags: [t.operator, t.derefOperator, t.compareOperator, t.logicOperator, t.arithmeticOperator], color: '#5fd7d7' },
  { key: 'pu', tags: [t.punctuation, t.separator, t.bracket, t.paren, t.brace, t.squareBracket, t.angleBracket], color: '#9aa7bd' },
  { key: 'cm', tags: [t.comment, t.lineComment, t.blockComment, t.docComment], color: '#7d8ba3', fontStyle: 'italic' },
  { key: 'tg', tags: [t.tagName], color: '#f087a0' },
  { key: 'at', tags: [t.attributeName], color: '#ffab70' },
  { key: 'av', tags: [t.attributeValue], color: '#8ddb92' },
  { key: 'mt', tags: [t.meta, t.processingInstruction, t.annotation, t.documentMeta], color: '#7d8ba3' },
  { key: 'hd', tags: [t.heading, t.heading1, t.heading2, t.heading3, t.heading4], color: '#d19bf0', fontWeight: 'bold' },
  { key: 'em', tags: [t.emphasis], color: '#e2e8f0', fontStyle: 'italic' },
  { key: 'sg', tags: [t.strong], color: '#e2e8f0', fontWeight: 'bold' },
  { key: 'lk', tags: [t.link, t.url], color: '#5fd7d7', textDecoration: 'underline' },
  { key: 'qt', tags: [t.quote], color: '#8ddb92' },
  { key: 'st2', tags: [t.strikethrough], color: '#7d8ba3', textDecoration: 'line-through' },
  { key: 'iv', tags: [t.invalid], color: '#ffffff' },
]

export const editorHighlightStyle = HighlightStyle.define(
  tokenSpecs.map(({ tags, color, fontStyle, fontWeight, textDecoration }) => ({
    tag: tags,
    color,
    fontStyle,
    fontWeight,
    textDecoration,
  })),
)

/**
 * Emits our short sentinel keys as classes. The export walker then swaps each
 * key for a literal `style="…"` — Gmail, Google Docs and Confluence all strip
 * `<style>` blocks, so class-based highlighting arrives colorless.
 */
export const exportHighlighter: Highlighter = tagHighlighter(
  tokenSpecs.map(({ tags, key }) => ({ tag: tags, class: key })),
)

export const inlineStyleByToken: Record<string, string> = Object.fromEntries(
  tokenSpecs.map((spec) => {
    const declarations = [`color:${spec.color}`]
    if (spec.fontStyle) declarations.push(`font-style:${spec.fontStyle}`)
    if (spec.fontWeight) declarations.push(`font-weight:${spec.fontWeight}`)
    if (spec.textDecoration) declarations.push(`text-decoration:${spec.textDecoration}`)
    return [spec.key, declarations.join(';')]
  }),
)

export const editorTheme = EditorView.theme(
  {
    '&': {
      color: palette.fg,
      backgroundColor: palette.bg,
      height: '100%',
      fontSize: '13.5px',
      fontFeatureSettings: "'liga' 1, 'calt' 1",
    },
    '.cm-content': {
      caretColor: palette.cursor,
      fontFamily: codeFontStack,
      padding: '12px 0',
    },
    '.cm-scroller': { fontFamily: codeFontStack, lineHeight: '1.6' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: palette.cursor, borderLeftWidth: '2px' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: palette.selection },
    '.cm-panels': { backgroundColor: palette.bgElevated, color: palette.fg },
    '.cm-panels.cm-panels-top': { borderBottom: `1px solid ${palette.border}` },
    '.cm-searchMatch': { backgroundColor: 'rgba(97, 175, 239, 0.24)', outline: '1px solid rgba(97,175,239,0.5)' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: 'rgba(97, 175, 239, 0.45)' },
    '.cm-activeLine': { backgroundColor: palette.activeLine },
    '.cm-selectionMatch': { backgroundColor: 'rgba(153, 173, 206, 0.14)' },
    '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
      backgroundColor: palette.matchingBracket,
      outline: 'none',
    },
    '.cm-gutters': {
      backgroundColor: palette.bg,
      color: palette.gutterFg,
      border: 'none',
      borderRight: `1px solid ${palette.border}`,
    },
    '.cm-activeLineGutter': { backgroundColor: palette.activeLine, color: palette.fg },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ddd',
    },
    '.cm-tooltip': {
      border: `1px solid ${palette.border}`,
      backgroundColor: palette.bgElevated,
    },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: palette.selection,
      color: palette.fg,
    },
    // The remote-cursor name label ships at opacity 0 in a serif font and only
    // reveals on hover. Make it a permanent flag so you can see who is where.
    '.cm-ySelectionInfo': {
      opacity: '1',
      fontFamily: 'inherit',
      fontSize: '10px',
      fontWeight: '600',
      padding: '1px 4px',
      borderRadius: '3px 3px 3px 0',
      top: '-1.15em',
    },
  },
  { dark: true },
)
