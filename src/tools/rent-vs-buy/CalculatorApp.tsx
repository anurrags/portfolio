import React, { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { StepRent } from './components/StepRent';
import { StepBuy } from './components/StepBuy';
import { StepStrategy } from './components/StepStrategy';
import { VerdictBanner } from './components/VerdictBanner';
import { BreakdownCards } from './components/BreakdownCards';
import { CrossoverVisual } from './components/CrossoverVisual';
import { FaqSection } from './components/FaqSection';
import { calculateYearlyProjection, evaluateRentVsBuy } from './calculations';
import { CalculatorInputs } from './types';
import './calculator.css';

export const CalculatorApp: React.FC = () => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [inputs, setInputs] = useState<CalculatorInputs>({
    // Rent
    monthlyRent: 30000,
    rentalGrowth: 5.0,
    securityDeposit: 100000,
    // Buy
    housePrice: 10000000,
    downPayment: 2000000,
    interestRate: 9.5,
    loanTenure: 20,
    houseAppreciationRate: 6.71,
    oneTimeCosts: 700000,
    annualMaintenanceCosts: 35000,
    // Strategy
    expectedReturnsOnInvestments: 12.0,
    incomeTaxBracket: 30,
  });

  const handleInputChange = <K extends keyof CalculatorInputs>(
    key: K,
    val: CalculatorInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  // Live evaluated results
  const result = useMemo(() => evaluateRentVsBuy(inputs), [inputs]);
  const projections = useMemo(() => calculateYearlyProjection(inputs), [inputs]);

  return (
    <div className="rvb-page-container">
      <Header />

      <main className="rvb-main">
        {/* SEO Header Section */}
        <section className="rvb-hero-section">
          <div className="rvb-page-badge">Interactive Financial Model</div>
          <h1 className="rvb-page-title">Rent vs Buy Calculator</h1>
          <p className="rvb-page-lead">
            Should you buy a home or rent and invest your money in the market? Compare 20-year net
            wealth, home loan EMIs, rent inflation, compounding market returns, and tax benefits
            under Section 24b and 80C.
          </p>
        </section>

        {/* 2-Column Responsive Workspace */}
        <div className="rvb-grid-layout">
          {/* Left Column: Input Steps */}
          <div className="rvb-inputs-container">
            <nav className="rvb-step-tabs" aria-label="Calculator steps">
              <button
                type="button"
                className={`rvb-tab-btn ${activeStep === 1 ? 'active' : ''}`}
                onClick={() => setActiveStep(1)}
              >
                <span className="rvb-tab-number">1</span>
                <span>Rent Scenario</span>
              </button>
              <button
                type="button"
                className={`rvb-tab-btn ${activeStep === 2 ? 'active' : ''}`}
                onClick={() => setActiveStep(2)}
              >
                <span className="rvb-tab-number">2</span>
                <span>Buy Scenario</span>
              </button>
              <button
                type="button"
                className={`rvb-tab-btn ${activeStep === 3 ? 'active' : ''}`}
                onClick={() => setActiveStep(3)}
              >
                <span className="rvb-tab-number">3</span>
                <span>Strategy & Tax</span>
              </button>
            </nav>

            {activeStep === 1 && (
              <StepRent
                values={{
                  monthlyRent: inputs.monthlyRent,
                  rentalGrowth: inputs.rentalGrowth,
                  securityDeposit: inputs.securityDeposit,
                }}
                onChange={handleInputChange}
              />
            )}

            {activeStep === 2 && (
              <StepBuy
                values={{
                  housePrice: inputs.housePrice,
                  downPayment: inputs.downPayment,
                  interestRate: inputs.interestRate,
                  loanTenure: inputs.loanTenure,
                  houseAppreciationRate: inputs.houseAppreciationRate,
                  oneTimeCosts: inputs.oneTimeCosts,
                  annualMaintenanceCosts: inputs.annualMaintenanceCosts,
                }}
                onChange={handleInputChange}
              />
            )}

            {activeStep === 3 && (
              <StepStrategy
                values={{
                  expectedReturnsOnInvestments: inputs.expectedReturnsOnInvestments,
                  incomeTaxBracket: inputs.incomeTaxBracket,
                }}
                onChange={handleInputChange}
              />
            )}

            {/* Step Wizard Prev/Next Controls */}
            <div className="rvb-wizard-nav">
              {activeStep > 1 ? (
                <button
                  type="button"
                  className="rvb-btn-secondary"
                  onClick={() => setActiveStep((prev) => (prev - 1) as 1 | 2 | 3)}
                >
                  ← Previous Step
                </button>
              ) : (
                <div />
              )}

              {activeStep < 3 ? (
                <button
                  type="button"
                  className="rvb-btn-primary"
                  onClick={() => setActiveStep((prev) => (prev + 1) as 1 | 2 | 3)}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  className="rvb-btn-primary"
                  onClick={() => setActiveStep(1)}
                >
                  Review from Step 1
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Live Results & Visualizations */}
          <div className="rvb-results-container">
            <VerdictBanner result={result} tenureYears={inputs.loanTenure} />

            <CrossoverVisual
              projections={projections}
              crossoverYear={result.crossoverYear}
            />

            <BreakdownCards result={result} tenureYears={inputs.loanTenure} />
          </div>
        </div>

        {/* SEO FAQ Section */}
        <FaqSection />
      </main>

      <footer className="rvb-footer" style={{ borderTop: '1px solid var(--border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: '0.8rem' }}>
        <p>© {new Date().getFullYear()} ANURAG.DEV — Free Financial Decision Tools. Built for educational and analytical purposes.</p>
      </footer>
    </div>
  );
};
