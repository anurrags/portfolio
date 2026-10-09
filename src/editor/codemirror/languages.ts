import { LanguageSupport, StreamLanguage } from '@codemirror/language'
import type { Parser } from '@lezer/common'

/**
 * Language support is dynamically imported so the initial bundle stays small —
 * loading twenty grammars up front to highlight one file is wasteful.
 */
export type LanguageEntry = {
  id: string
  label: string
  /** File extension used by the download export. */
  ext: string
  /** Fence tag used by the Markdown export. */
  fence: string
  load: () => Promise<LanguageSupport | StreamLanguage<unknown> | null>
}

export const LANGUAGES: readonly LanguageEntry[] = [
  { id: 'plaintext', label: 'Plain text', ext: 'txt', fence: '', load: async () => null },

  { id: 'javascript', label: 'JavaScript', ext: 'js', fence: 'javascript', load: () => import('@codemirror/lang-javascript').then((m) => m.javascript()) },
  { id: 'jsx', label: 'JavaScript (JSX)', ext: 'jsx', fence: 'jsx', load: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ jsx: true })) },
  { id: 'typescript', label: 'TypeScript', ext: 'ts', fence: 'typescript', load: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ typescript: true })) },
  { id: 'tsx', label: 'TypeScript (TSX)', ext: 'tsx', fence: 'tsx', load: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ typescript: true, jsx: true })) },

  { id: 'python', label: 'Python', ext: 'py', fence: 'python', load: () => import('@codemirror/lang-python').then((m) => m.python()) },
  { id: 'java', label: 'Java', ext: 'java', fence: 'java', load: () => import('@codemirror/lang-java').then((m) => m.java()) },
  { id: 'c', label: 'C', ext: 'c', fence: 'c', load: () => import('@codemirror/lang-cpp').then((m) => m.cpp()) },
  { id: 'cpp', label: 'C++', ext: 'cpp', fence: 'cpp', load: () => import('@codemirror/lang-cpp').then((m) => m.cpp()) },
  { id: 'go', label: 'Go', ext: 'go', fence: 'go', load: () => import('@codemirror/lang-go').then((m) => m.go()) },
  { id: 'rust', label: 'Rust', ext: 'rs', fence: 'rust', load: () => import('@codemirror/lang-rust').then((m) => m.rust()) },
  { id: 'php', label: 'PHP', ext: 'php', fence: 'php', load: () => import('@codemirror/lang-php').then((m) => m.php()) },
  { id: 'ruby', label: 'Ruby', ext: 'rb', fence: 'ruby', load: () => import('@codemirror/legacy-modes/mode/ruby').then((m) => StreamLanguage.define(m.ruby)) },
  { id: 'shell', label: 'Shell', ext: 'sh', fence: 'bash', load: () => import('@codemirror/legacy-modes/mode/shell').then((m) => StreamLanguage.define(m.shell)) },
  { id: 'sql', label: 'SQL', ext: 'sql', fence: 'sql', load: () => import('@codemirror/lang-sql').then((m) => m.sql()) },

  { id: 'json', label: 'JSON', ext: 'json', fence: 'json', load: () => import('@codemirror/lang-json').then((m) => m.json()) },
  { id: 'yaml', label: 'YAML', ext: 'yaml', fence: 'yaml', load: () => import('@codemirror/lang-yaml').then((m) => m.yaml()) },
  { id: 'xml', label: 'XML', ext: 'xml', fence: 'xml', load: () => import('@codemirror/lang-xml').then((m) => m.xml()) },
  { id: 'html', label: 'HTML', ext: 'html', fence: 'html', load: () => import('@codemirror/lang-html').then((m) => m.html()) },
  { id: 'css', label: 'CSS', ext: 'css', fence: 'css', load: () => import('@codemirror/lang-css').then((m) => m.css()) },
  { id: 'markdown', label: 'Markdown', ext: 'md', fence: 'markdown', load: () => import('@codemirror/lang-markdown').then((m) => m.markdown()) },
]

const BY_ID = new Map(LANGUAGES.map((entry) => [entry.id, entry]))

export const DEFAULT_LANGUAGE = LANGUAGES[0]

export function findLanguage(id: string | undefined | null): LanguageEntry {
  return (id && BY_ID.get(id)) || DEFAULT_LANGUAGE
}

/**
 * Both `LanguageSupport` and `StreamLanguage` expose a Lezer parser, but at
 * different depths. The export path needs it to re-parse independently of the
 * live editor.
 */
export function parserOf(support: LanguageSupport | StreamLanguage<unknown> | null): Parser | null {
  if (!support) return null
  return support instanceof LanguageSupport ? support.language.parser : support.parser
}
