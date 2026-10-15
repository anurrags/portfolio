import React from 'react';
import { SliderField } from './SliderField';
import { StrategyInputs } from '../types';

interface StepStrategyProps {
  values: StrategyInputs;
  onChange: <K extends keyof StrategyInputs>(key: K, val: StrategyInputs[K]) => void;
}

export const StepStrategy: React.FC<StepStrategyProps> = ({ values, onChange }) => {
  const assetProfiles = [
    {
      title: 'Conservative (Debt)',
      range: '6% – 8%',
      rate: 7.5,
      desc: 'Fixed deposits, corporate bonds, PPF & liquid debt funds',
    },
    {
      title: 'Balanced (Hybrid)',
      range: '8% – 12%',
      rate: 10.0,
      desc: 'Equal allocation across debt and equity index funds',
    },
    {
      title: 'Equity (Mutual Funds)',
      range: '12% – 14%',
      rate: 12.0,
      desc: 'Nifty 50, flexicap funds & diversified broad market equities',
    },
    {
      title: 'Aggressive Growth',
      range: '14% – 16%',
      rate: 15.0,
      desc: 'High allocation to mid-caps, small-caps & active stock picks',
    },
  ];

  const taxSlabs = [
    { label: '0%', value: 0, sub: 'No Tax' },
    { label: '10%', value: 10, sub: '₹5L - ₹10L' },
    { label: '20%', value: 20, sub: '₹10L - ₹15L' },
    { label: '30%', value: 30, sub: '₹15L+ Slab' },
  ];

  return (
    <div className="rvb-step-content">
      <div className="rvb-step-intro">
        <h2 className="rvb-step-title">Investment Returns & Tax Bracket</h2>
        <p className="rvb-step-desc">
          Compare the capital growth of money saved by renting against the tax deductions of home
          loans.
        </p>
      </div>

      <div className="rvb-fields-stack">
        <div className="rvb-asset-cards-label">
          <span>Choose Alternate Investment Profile</span>
          <span className="rvb-subtle-hint">Expected return on money not locked in real estate</span>
        </div>

        <div className="rvb-asset-grid">
          {assetProfiles.map((profile) => {
            const isSelected = Math.abs(values.expectedReturnsOnInvestments - profile.rate) < 0.1;
            return (
              <div
                key={profile.title}
                className={`rvb-asset-card ${isSelected ? 'active' : ''}`}
                onClick={() => onChange('expectedReturnsOnInvestments', profile.rate)}
              >
                <div className="rvb-asset-top">
                  <span className="rvb-asset-range">{profile.range}</span>
                  <span className="rvb-asset-tag">p.a.</span>
                </div>
                <div className="rvb-asset-title">{profile.title}</div>
                <div className="rvb-asset-desc">{profile.desc}</div>
              </div>
            );
          })}
        </div>

        <SliderField
          id="expectedReturnsOnInvestments"
          label="Custom Expected Return on Investment"
          value={values.expectedReturnsOnInvestments}
          min={4}
          max={25}
          step={0.5}
          suffix="% p.a."
          helperText="Expected compound annual growth rate (CAGR) for invested capital"
          onChange={(val) => onChange('expectedReturnsOnInvestments', val)}
        />

        <div className="rvb-tax-section">
          <div className="rvb-field-label">
            Your Income Tax Slab
            <span className="rvb-helper-text" style={{ display: 'block', marginTop: '4px' }}>
              Used to compute deductions under Section 24b (loan interest) and 80C (loan principal)
            </span>
          </div>

          <div className="rvb-tax-grid">
            {taxSlabs.map((slab) => {
              const isSelected = values.incomeTaxBracket === slab.value;
              return (
                <button
                  key={slab.label}
                  type="button"
                  className={`rvb-tax-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => onChange('incomeTaxBracket', slab.value)}
                >
                  <span className="rvb-tax-pct">{slab.label}</span>
                  <span className="rvb-tax-sub">{slab.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
