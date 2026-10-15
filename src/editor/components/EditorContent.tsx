import { useState } from 'react'

import site from '../content.json'
import { Icon } from '../../shared/Icon'
import { DROP_HOME, RENT_VS_BUY_HOME } from '../../shared/paths'

/**
 * Explanatory SEO content below the editor creation card.
 *
 * Shares `content.json` with the build system (scripts/seo.ts) so that visible copy,
 * headings, and FAQPage JSON-LD schemas remain perfectly synchronized.
 */
export function EditorContent() {
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
        <h2 className="prose-h2">Why developers choose this editor</h2>
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
                    aria-controls={`editor-faq-a-${index}`}
                    onClick={() => setOpenFaq(open ? null : index)}
                  >
                    <span>{entry.q}</span>
                    <Icon name="chevronRight" size={16} className="faq-chevron" />
                  </button>
                </h3>
                <div className="faq-a" id={`editor-faq-a-${index}`} hidden={!open}>
                  <p className="note">{entry.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="prose-footer">
        <p className="note">
          Looking for other developer tools? Try <a href={DROP_HOME}>Share via WiFi</a> or calculate real estate math with the{' '}
          <a href={RENT_VS_BUY_HOME}>Rent vs Buy Calculator</a> on this site.
        </p>
      </footer>
    </div>
  )
}
