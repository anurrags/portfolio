import { highlightCode } from '@lezer/highlight'

import { parserOf, type LanguageEntry } from '../codemirror/languages'
import { codeFontStack, exportHighlighter, inlineStyleByToken, palette } from '../codemirror/theme'

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }
const escapeHtml = (value: string) => value.replace(/[&<>]/g, (char) => ESCAPES[char]!)

const PRE_STYLE = [
  `background:${palette.bg}`,
  `color:${palette.fg}`,
  `font-family:${codeFontStack}`,
  'font-size:13px',
  'line-height:1.5',
  'padding:14px 16px',
  'border-radius:8px',
  `border:1px solid ${palette.border}`,
  'white-space:pre',
  'overflow-x:auto',
  'tab-size:2',
  '-moz-tab-size:2',
  'margin:0',
].join(';')

/** Inherit explicitly — some mail clients reset `<code>` independently. */
const CODE_STYLE = `font-family:${codeFontStack};color:${palette.fg};background:transparent;padding:0;border:none`

/**
 * Render code as HTML with **inline** styles.
 *
 * Two decisions worth keeping:
 *
 * 1. The document is re-parsed here rather than read from the live editor's
 *    `syntaxTree`, which only covers the parsed viewport — exporting a long
 *    file from the live tree yields a snippet that stops being highlighted
 *    partway down.
 * 2. Styles are inline, not classes. Gmail, Google Docs and Confluence strip
 *    `<style>` blocks, so a class-based export arrives as colorless text.
 */
export async function codeToInlineStyledHtml(
  code: string,
  language: LanguageEntry,
): Promise<string> {
  const parser = parserOf(await language.load())
  const parts: string[] = []

  if (!parser) {
    parts.push(escapeHtml(code))
  } else {
    const tree = parser.parse(code)
    highlightCode(
      code,
      tree,
      exportHighlighter,
      (text, classes) => {
        const style = styleForClasses(classes)
        parts.push(style ? `<span style="${style}">${escapeHtml(text)}</span>` : escapeHtml(text))
      },
      () => {
        parts.push('\n')
      },
    )
  }

  return `<pre style="${PRE_STYLE}"><code style="${CODE_STYLE}">${parts.join('')}</code></pre>`
}

function styleForClasses(classes: string): string | null {
  if (!classes) return null
  for (const key of classes.split(' ')) {
    const style = inlineStyleByToken[key]
    if (style) return style
  }
  return null
}

/**
 * Wrap in a fenced block. The fence grows past any run of backticks already in
 * the code, so snippets that themselves contain fences don't break out.
 */
export function toMarkdownFence(code: string, fence: string): string {
  const existing = [...code.matchAll(/^\s*(`{3,})/gm)].map((match) => match[1].length)
  const ticks = '`'.repeat(Math.max(3, ...existing.map((n) => n + 1)))
  return `${ticks}${fence}\n${code}\n${ticks}`
}
