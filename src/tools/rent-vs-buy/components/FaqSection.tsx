import React, { useState } from 'react';
import { FAQ_ITEMS } from '../calculations';

export const FaqSection: React.FC = () => {
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="rvb-faq-section" aria-labelledby="faq-heading">
      <div className="rvb-faq-header">
        <h2 id="faq-heading" className="rvb-faq-title">
          Frequently Asked Questions
        </h2>
        <p className="rvb-faq-sub">
          Learn how the mathematical model evaluates loan deductions, rental inflation, and
          investment trade-offs.
        </p>
      </div>

      <div className="rvb-faq-list">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = !!openIndices[idx];
          return (
            <article key={item.question} className={`rvb-faq-item ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="rvb-faq-question-btn"
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <span className="rvb-faq-icon">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="rvb-faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
