export type CopyResult = 'rich' | 'plain' | 'failed'

/**
 * Copy code in two flavors at once: a rich target (mail, docs, chat) takes the
 * styled HTML, while a terminal or editor takes clean source. Without the
 * `text/plain` flavor, pasting into a shell would paste markup.
 */
export async function copyRich(code: string, html: string): Promise<CopyResult> {
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([code], { type: 'text/plain' }),
        }),
      ])
      return 'rich'
    } catch {
      // Firefox historically gates ClipboardItem, and any browser will reject
      // this outside a user gesture. Fall back rather than fail.
    }
  }
  return (await copyPlain(code)) ? 'plain' : 'failed'
}

export async function copyPlain(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return legacyCopy(text)
  }
}

/** Last resort for non-secure contexts, where the async clipboard is absent. */
function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

export function downloadFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
