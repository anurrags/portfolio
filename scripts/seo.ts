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

const RENT_VS_BUY: PageMeta = {
  title: 'Rent vs Buy Calculator — Should You Rent or Buy a Home? | Financial Tools',
  description:
    'Free interactive Rent vs Buy Calculator. Compare 20-year net wealth, home loan EMIs, property appreciation, rental growth, equity returns, and tax benefits under Section 24b, 80C vs HRA.',
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
  if (path === '/tools/rent-vs-buy-calculator') return RENT_VS_BUY
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

const CALCULATOR_FAQS: Faq[] = [
  {
    q: 'How are the tax savings calculated for buying vs renting?',
    a: 'When buying a house, tax savings on a home loan are calculated under Section 24(b) (deduction up to ₹2,00,000/year for interest payments) and Section 80C (deduction for principal repayments up to ₹1,50,000/year) based on your income tax slab. When renting, HRA tax exemption is estimated at 20% of your annual rent, reflecting typical exemption rules.',
  },
  {
    q: 'What is the opportunity cost of the down payment and closing costs?',
    a: 'Buying a home requires an immediate cash outflow: a 20% down payment plus 4%–10% in registration, stamp duty, and interior setup. When you rent, you only pay a refundable security deposit. The remaining capital (Down Payment + One-Time Costs − Security Deposit) is free to be invested in equity mutual funds or diversified assets, generating compounding returns over 10–30 years.',
  },
  {
    q: 'What is the Rent vs EMI Crossover point?',
    a: 'Because home loan EMIs remain fixed while rental payments increase yearly by inflation (typically 5%–8% p.a.), monthly rent eventually overtakes the fixed EMI. The crossover point is the exact year this happens. After the crossover, the buyer enjoys a monthly cashflow surplus compared to renting, which can then be invested.',
  },
  {
    q: 'Why are maintenance costs and one-time buying costs included?',
    a: 'Buying a property involves substantial hidden expenses that renters avoid: registration and stamp duty (usually 5%–7%), interior furnishing (3%–5%), and annual society maintenance (0.2%–0.5% of property value per year, escalating at 5% inflation). Over a 20-year period, maintenance alone often adds ₹10 Lakh to ₹25 Lakh to the total cost of ownership.',
  },
  {
    q: 'How does the investment return rate (ROI) affect the outcome?',
    a: 'If you invest in equity index funds or diversified mutual funds yielding 12%–15% p.a. while real estate in your city grows at 5%–7% p.a., renting and disciplined investing will almost always create significantly more wealth. Conversely, in cities with 9%+ real estate appreciation and conservative 7% investment returns, buying often creates superior long-term net wealth.',
  },
]

function faqJsonLd(pathname: string): string {
  const faqs = pathname === '/tools/rent-vs-buy-calculator' ? CALCULATOR_FAQS : site.faq
  return `{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${faqs
    .map(
      (entry) =>
        `{"@type":"Question","name":${escapeJsonLd(entry.q)},"acceptedAnswer":{"@type":"Answer","text":${escapeJsonLd(entry.a)}}}`,
    )
    .join(',')}]}`
}

function appJsonLd(origin: string, url: string, meta: PageMeta): string {
  const isCalc = meta === RENT_VS_BUY
  const isDrop = meta === DROP
  const appName = isCalc ? 'Rent vs Buy Calculator' : isDrop ? site.name : 'notepad'
  const appCategory = isCalc ? 'FinanceApplication' : 'UtilitiesApplication'
  const publisherName = isCalc ? 'ANURAG.DEV' : 'notepad'
  return `{"@context":"https://schema.org","@type":"SoftwareApplication","name":${escapeJsonLd(
    appName,
  )},"url":${escapeJsonLd(url)},"applicationCategory":${escapeJsonLd(appCategory)},"operatingSystem":"Any device with a web browser","browserRequirements":"Requires JavaScript","description":${escapeJsonLd(
    meta.description,
  )},"offers":{"@type":"Offer","price":"0","priceCurrency":"INR"},"isAccessibleForFree":true,"publisher":{"@type":"Organization","name":${escapeJsonLd(publisherName)},"url":${escapeJsonLd(
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
  const siteName = meta === RENT_VS_BUY ? 'ANURAG.DEV' : 'notepad'

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${meta.robots}" />`,
    ...(url ? [`<link rel="canonical" href="${escapeHtml(url)}" />`] : []),

    // Open Graph / Twitter, so a pasted link renders usefully in chat and mail.
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    ...(url ? [`<meta property="og:url" content="${escapeHtml(url)}" />`] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ]

  if (meta.app) {
    tags.push(`<script type="application/ld+json">${appJsonLd(origin ?? '', url ?? pathname, meta)}</script>`)
  }
  if (meta.faq) {
    tags.push(`<script type="application/ld+json">${faqJsonLd(pathname)}</script>`)
  }

  return tags.join('\n    ')
}

export const siteContent = site
