import React from 'react';
import { formatINR } from '../calculations';
import { CalculationResult } from '../types';

interface BreakdownCardsProps {
  result: CalculationResult;
  tenureYears: number;
}

export const BreakdownCards: React.FC<BreakdownCardsProps> = ({ result, tenureYears }) => {
  const { rent, buy } = result;

  return (
    <div className="rvb-breakdown-grid">
      {/* RENT CARD */}
      <div className={`rvb-breakdown-card ${result.recommendation === 'RENT' ? 'recommended-border' : ''}`}>
        <div className="rvb-card-badge-row">
          <div className="rvb-card-heading">
            <span className="rvb-card-icon">🏠</span>
            <div>
              <h3 className="rvb-card-title">Renting Strategy</h3>
              <p className="rvb-card-sub">Invest down payment & monthly cash savings in assets</p>
            </div>
          </div>
          {result.recommendation === 'RENT' && (
            <span className="rvb-winner-tag">★ Higher Net Wealth</span>
          )}
        </div>

        <div className="rvb-net-wealth-box rent-theme">
          <div className="rvb-net-label">Net Wealth After {tenureYears} Years</div>
          <div className="rvb-net-value">{formatINR(rent.netWealth, true)}</div>
          <div className="rvb-net-sub">Total Gains − Total Rent Outflow</div>
        </div>

        <div className="rvb-itemized-section">
          <div className="rvb-section-header gains-header">
            <span>Wealth Generated</span>
            <span className="rvb-header-val">+{formatINR(rent.totalWealth, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">Investment Gains on Down Payment</span>
              <span className="rvb-item-hint">Compounded returns on upfront capital not spent on buying</span>
            </div>
            <span className="rvb-item-val green">+{formatINR(rent.investmentGains, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">Cumulative Monthly EMI Savings</span>
              <span className="rvb-item-hint">Difference when EMI exceeds rent, invested monthly</span>
            </div>
            <span className="rvb-item-val green">+{formatINR(rent.emiSavings, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">HRA Tax Savings</span>
              <span className="rvb-item-hint">Tax exemption on rent paid (~20% annual benefit)</span>
            </div>
            <span className="rvb-item-val green">+{formatINR(rent.taxSavings, true)}</span>
          </div>
        </div>

        <div className="rvb-itemized-section costs-section">
          <div className="rvb-section-header costs-header">
            <span>Total Outflow (Costs)</span>
            <span className="rvb-header-val">−{formatINR(rent.totalCost, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">Total Rent Paid Over {tenureYears}y</span>
              <span className="rvb-item-hint">Monthly rent with annual inflation escalation</span>
            </div>
            <span className="rvb-item-val red">−{formatINR(rent.totalRent, true)}</span>
          </div>
        </div>
      </div>

      {/* BUY CARD */}
      <div className={`rvb-breakdown-card ${result.recommendation === 'BUY' ? 'recommended-border' : ''}`}>
        <div className="rvb-card-badge-row">
          <div className="rvb-card-heading">
            <span className="rvb-card-icon">🔑</span>
            <div>
              <h3 className="rvb-card-title">Buying Strategy</h3>
              <p className="rvb-card-sub">Build home equity & lock in monthly loan repayments</p>
            </div>
          </div>
          {result.recommendation === 'BUY' && (
            <span className="rvb-winner-tag">★ Higher Net Wealth</span>
          )}
        </div>

        <div className="rvb-net-wealth-box buy-theme">
          <div className="rvb-net-label">Net Wealth After {tenureYears} Years</div>
          <div className="rvb-net-value">{formatINR(buy.netWealth, true)}</div>
          <div className="rvb-net-sub">Property Value & Savings − Loan & Maintenance Costs</div>
        </div>

        <div className="rvb-itemized-section">
          <div className="rvb-section-header gains-header">
            <span>Wealth & Assets Created</span>
            <span className="rvb-header-val">+{formatINR(buy.totalWealth, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">Future Appreciated House Value</span>
              <span className="rvb-item-hint">Estimated market value of the home at year {tenureYears}</span>
            </div>
            <span className="rvb-item-val green">+{formatINR(buy.houseValue, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">Home Loan Tax Deductions</span>
              <span className="rvb-item-hint">Deductions under Section 24b (interest) & 80C (principal)</span>
            </div>
            <span className="rvb-item-val green">+{formatINR(buy.taxSavings, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">Post-Crossover Rent Savings</span>
              <span className="rvb-item-hint">Gains from years when market rent exceeds the fixed EMI</span>
            </div>
            <span className="rvb-item-val green">+{formatINR(buy.rentSavings, true)}</span>
          </div>
        </div>

        <div className="rvb-itemized-section costs-section">
          <div className="rvb-section-header costs-header">
            <span>Total Outflow (Costs)</span>
            <span className="rvb-header-val">−{formatINR(buy.totalCost, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">Total Loan EMIs Paid ({formatINR(buy.monthlyEMI)}/mo)</span>
              <span className="rvb-item-hint">Principal repayment plus bank interest over {tenureYears} years</span>
            </div>
            <span className="rvb-item-val red">−{formatINR(buy.totalEMI, true)}</span>
          </div>

          <div className="rvb-item-row">
            <div className="rvb-item-info">
              <span className="rvb-item-name">Cumulative Maintenance & Property Taxes</span>
              <span className="rvb-item-hint">Escalating at 5% annual inflation</span>
            </div>
            <span className="rvb-item-val red">−{formatINR(buy.maintenanceTotal, true)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
