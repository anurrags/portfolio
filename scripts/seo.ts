import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Per-page head metadata and structured data, baked into static HTML at build
 * time (see servicesPlugin.ts).
 *
 * The services' UI is a client-rendered SPA, so its visible copy lives in
 * JavaScript. Crawlers do execute JS, but `<title>`, the meta description and
 * JSON-LD are read straight from the response — so each page gets its own HTML
 * file with the right head already in it. Vercel's rewrites (vercel.json) then
 * serve the matching file for each route.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

type Faq = { q: string; a: string }
type Site = {
  name: string
  tagline: string
  shortDescription: string
  faq: Faq[]
}

/** Shared with the client, so the visible FAQ and the JSON-LD cannot drift. */
const site: Site = JSON.parse(
  readFileSync(path.resolve(here, '../src/drop/content.json'), 'utf8'),
) as Site

type PageMeta = {
  title: string
  description: string
  /** Robots directive. Document URLs are capability links and must stay out. */
  robots: string
  /** Emit FAQ structured data on this route. */
  faq?: boolean
  /** Emit SoftwareApplication structured data on this route. */
  app?: boolean
}

const EDITOR: PageMeta = {
  title: 'Collaborative code editor — share code in your browser | notepad',
  description:
    'A free real-time collaborative code editor in the browser. Create a document, send one link, and type together with live cursors and syntax highlighting for 20 languages. Copy code out with its formatting intact.',
  robots: 'index, follow',
  app: true,
}

const DROP: PageMeta = {
  title: `${site.name} — send files between phone and laptop over WiFi, no internet`,
  description: site.shortDescription,
  robots: 'index, follow',
  faq: true,
  app: true,
}

/** Documents are unguessable capability URLs — never index them. */
const DOCUMENT: PageMeta = {
  title: 'Shared document | notepad',
  description: 'A shared code document.',
  robots: 'noindex, nofollow',
}

const NOT_FOUND: PageMeta = {
  title: 'Not found | notepad',
  description: 'Nothing here.',
  robots: 'noindex, follow',
}

/**
 * Only ever called for the services' own paths — the portfolio at `/` is
 * served untouched and never passes through here.
 */
export function metaForPath(pathname: string): PageMeta {
  const path = pathname.replace(/\/+$/, '')
  if (path === '/editor') return EDITOR
  if (path === '/drop') return DROP
  // `/editor/<id>` is a document: an unguessable, editable capability URL.
  if (path.startsWith('/editor/')) return DOCUMENT
  return NOT_FOUND
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ESCAPES[char]!)

/** JSON-LD must not be able to break out of its script element. */
const escapeJsonLd = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c')

function faqJsonLd(): string {
  return `{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${site.faq
    .map(
      (entry) =>
        `{"@type":"Question","name":${escapeJsonLd(entry.q)},"acceptedAnswer":{"@type":"Answer","text":${escapeJsonLd(entry.a)}}}`,
    )
    .join(',')}]}`
}

function appJsonLd(origin: string, url: string, meta: PageMeta): string {
  return `{"@context":"https://schema.org","@type":"SoftwareApplication","name":${escapeJsonLd(
    meta === DROP ? site.name : 'notepad',
  )},"url":${escapeJsonLd(url)},"applicationCategory":"UtilitiesApplication","operatingSystem":"Any device with a web browser","browserRequirements":"Requires JavaScript and WebRTC","description":${escapeJsonLd(
    meta.description,
  )},"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"isAccessibleForFree":true,"publisher":{"@type":"Organization","name":"notepad","url":${escapeJsonLd(
    origin,
  )}}}`
}

/**
 * Build the replacement `<head>` contents for a route.
 *
 * Returns tags only — the caller splices them into `index.html` so the built
 * asset links Vite generated are left untouched.
 */
export function headTagsFor(origin: string | null, pathname: string): string {
  const meta = metaForPath(pathname)
  const url = origin ? `${origin}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}` : null

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${meta.robots}" />`,
    ...(url ? [`<link rel="canonical" href="${escapeHtml(url)}" />`] : []),

    // Open Graph / Twitter, so a pasted link renders usefully in chat and mail.
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="notepad" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    ...(url ? [`<meta property="og:url" content="${escapeHtml(url)}" />`] : []),
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ]

  if (meta.app) {
    tags.push(`<script type="application/ld+json">${appJsonLd(origin ?? '', url ?? pathname, meta)}</script>`)
  }
  if (meta.faq) {
    tags.push(`<script type="application/ld+json">${faqJsonLd()}</script>`)
  }

  return tags.join('\n    ')
}

export const siteContent = site
