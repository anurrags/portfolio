/**
 * Where the services are mounted.
 *
 * These live under the portfolio site, which owns `/`. Every link and
 * navigation inside the services goes through here, so moving a service to a
 * different path is a one-line change — and nothing can accidentally send a
 * user to `/`, which is the portfolio, not the editor.
 *
 * Keep in sync with the rewrites in vercel.json.
 */

export const EDITOR_HOME = '/tools/editor'

export function editorDocument(roomId: string): string {
  return `${EDITOR_HOME}/${encodeURIComponent(roomId)}`
}

export const DROP_HOME = '/tools/drop'

export const RENT_VS_BUY_HOME = '/tools/rent-vs-buy-calculator'
