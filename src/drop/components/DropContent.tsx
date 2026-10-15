import { useState } from 'react'

import site from '../content.json'
import { Icon } from '../../shared/Icon'
import { EDITOR_HOME, RENT_VS_BUY_HOME } from '../../shared/paths'

/**
 * Explanatory page content below the tool.
 *
 * Shares `content/site.json` with the server, which renders the same FAQ as
 * JSON-LD — so the visible answers and the structured data cannot drift apart.
 *
 * Headings step down h1 → h2 → h3 without skipping, both for screen readers
 * and because a sane outline is what a crawler reads the page structure from.
 */
export function DropContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="prose">
      <section className="prose-section">
        <h2 className="prose-h2">How it works</h2>
        <ol className="steps">
          {site.steps.map((step, index) => (
            <li key={step.title} className="step">
              <span className="step-num" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className="step-title">{step.title}</h3>
                <p className="note">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="prose-section">
        <h2 className="prose-h2">Why send files this way</h2>
        <div className="feature-grid">
          {site.features.map((feature) => (
            <div key={feature.title} className="feature">
              <span className="feature-icon">
                <Icon name="check" size={14} />
              </span>
              <div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="note">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="prose-section">
        <h2 className="prose-h2">Frequently asked questions</h2>
        <div className="faq">
          {site.faq.map((entry, index) => {
            const open = openFaq === index
            return (
              <div key={entry.q} className={open ? 'faq-item faq-item-open' : 'faq-item'}>
                <h3>
                  <button
                    className="faq-q"
                    aria-expanded={open}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpenFaq(open ? null : index)}
                  >
                    <span>{entry.q}</span>
                    <Icon name="chevronRight" size={16} className="faq-chevron" />
                  </button>
                </h3>
                {/* Kept in the DOM when collapsed so the answers are always
                    present in the page, not conditionally rendered away. */}
                <div className="faq-a" id={`faq-a-${index}`} hidden={!open}>
                  <p className="note">{entry.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="prose-footer">
        <p className="note">
          {site.name} runs entirely in your browser. Looking for other tools? Try the{' '}
          <a href={EDITOR_HOME}>collaborative code editor</a> or the{' '}
          <a href={RENT_VS_BUY_HOME}>rent vs buy calculator</a> on this site.
        </p>
      </footer>
    </div>
  )
}
