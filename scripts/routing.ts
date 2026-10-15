import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Routing read straight from vercel.json, shared by the dev server and the
 * local preview, so neither can drift from what Vercel does in production.
 */

const here = path.dirname(fileURLToPath(import.meta.url))
export const PORTFOLIO_ROOT = path.resolve(here, '..')

export type Rule = {
  source: string
  destination?: string
  headers?: { key: string; value: string }[]
  permanent?: boolean
}
export type CompiledRule = Rule & { re: RegExp }

/** vercel.json `source` → RegExp, for the forms used: literals, `:param`, `:param*`, `(.*)`. */
export function toRegExp(source: string): RegExp {
  const pattern = source
    .split(/(\(\.\*\)|:[A-Za-z_]\w*\*?)/)
    .map((part) => {
      if (part === '(.*)' || /^:[A-Za-z_]\w*\*$/.test(part)) return '(.*)'
      if (/^:[A-Za-z_]\w*$/.test(part)) return '([^/]+)'
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('')
  return new RegExp(`^${pattern}$`)
}

export function loadVercelRules(): {
  rewrites: CompiledRule[]
  headers: CompiledRule[]
  redirects: CompiledRule[]
} {
  const config = JSON.parse(readFileSync(path.join(PORTFOLIO_ROOT, 'vercel.json'), 'utf8')) as {
    rewrites?: Rule[]
    headers?: Rule[]
    redirects?: Rule[]
  }
  const compile = (rules: Rule[] = []) => rules.map((rule) => ({ ...rule, re: toRegExp(rule.source) }))
  return {
    rewrites: compile(config.rewrites),
    headers: compile(config.headers),
    redirects: compile(config.redirects),
  }
}
