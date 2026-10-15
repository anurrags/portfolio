import React, { useState } from 'react';
import { formatINR } from '../calculations';
import { YearlyDataPoint } from '../types';

interface CrossoverVisualProps {
  projections: YearlyDataPoint[];
  crossoverYear: number | null;
}

export const CrossoverVisual: React.FC<CrossoverVisualProps> = ({
  projections,
  crossoverYear,
}) => {
  const [viewMode, setViewMode] = useState<'cashflow' | 'wealth'>('cashflow');

  if (projections.length === 0) return null;

  const maxRentOrEMI = Math.max(
    ...projections.map((p) => Math.max(p.annualRent, p.annualEMI)),
  );
  const maxWealth = Math.max(
    ...projections.map((p) => Math.max(p.houseValue, p.renterPortfolioValue)),
  );

  return (
    <div className="rvb-visual-card">
      <div className="rvb-visual-header">
        <div>
          <h3 className="rvb-visual-title">Long-Term Trajectory & Crossover Analysis</h3>
          <p className="rvb-visual-subtitle">
            {crossoverYear
              ? `Crossover Point: In Year ${crossoverYear}, escalating rent surpasses the fixed loan EMI.`
              : 'Throughout the loan tenure, EMI remains higher than rent in this scenario.'}
          </p>
        </div>

        <div className="rvb-mode-toggle">
          <button
            type="button"
            className={`rvb-toggle-btn ${viewMode === 'cashflow' ? 'active' : ''}`}
            onClick={() => setViewMode('cashflow')}
          >
            Annual Outflow (Rent vs EMI)
          </button>
          <button
            type="button"
            className={`rvb-toggle-btn ${viewMode === 'wealth' ? 'active' : ''}`}
            onClick={() => setViewMode('wealth')}
          >
            Wealth Growth (House vs Portfolio)
          </button>
        </div>
      </div>

      {/* SVG CHART CONTAINER */}
      <div className="rvb-chart-container">
        <svg
          viewBox="0 0 800 280"
          className="rvb-svg-chart"
          preserveAspectRatio="none"
          aria-label="Trajectory chart"
        >
          <defs>
            <linearGradient id="rentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="emiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="50" y1="20" x2="780" y2="20" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="50" y1="80" x2="780" y2="80" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="50" y1="140" x2="780" y2="140" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="50" y1="200" x2="780" y2="200" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="50" y1="240" x2="780" y2="240" stroke="var(--border-strong)" />

          {/* Coordinates calculation */}
          {(() => {
            const chartLeft = 60;
            const chartRight = 770;
            const chartTop = 30;
            const chartBottom = 230;
            const width = chartRight - chartLeft;
            const height = chartBottom - chartTop;

            const n = projections.length;
            const stepX = width / (n - 1 || 1);

            const getPoints = (getValue: (p: YearlyDataPoint) => number, maxVal: number) => {
              return projections
                .map((p, idx) => {
                  const x = chartLeft + idx * stepX;
                  const ratio = Math.min(1, Math.max(0, getValue(p) / (maxVal || 1)));
                  const y = chartBottom - ratio * height;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ');
            };

            const line1 =
              viewMode === 'cashflow'
                ? getPoints((p) => p.annualRent, maxRentOrEMI)
                : getPoints((p) => p.renterPortfolioValue, maxWealth);

            const line2 =
              viewMode === 'cashflow'
                ? getPoints((p) => p.annualEMI, maxRentOrEMI)
                : getPoints((p) => p.houseValue, maxWealth);

            return (
              <>
                {/* Line 1 (Rent / Renter Portfolio: Cyan) */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={line1}
                />

                {/* Line 2 (EMI / House Value: Emerald) */}
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={line2}
                />

                {/* Crossover indicator if present */}
                {viewMode === 'cashflow' && crossoverYear && crossoverYear <= n && (
                  <>
                    <line
                      x1={chartLeft + (crossoverYear - 1) * stepX}
                      y1={chartTop}
                      x2={chartLeft + (crossoverYear - 1) * stepX}
                      y2={chartBottom}
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx={chartLeft + (crossoverYear - 1) * stepX}
                      cy={
                        chartBottom -
                        (projections[crossoverYear - 1].annualEMI / maxRentOrEMI) * height
                      }
                      r="6"
                      fill="#fbbf24"
                    />
                  </>
                )}
              </>
            );
          })()}
        </svg>

        {/* Chart Legend */}
        <div className="rvb-chart-legend">
          {viewMode === 'cashflow' ? (
            <>
              <div className="rvb-legend-item">
                <span className="rvb-legend-dot blue" />
                <span>Annual Rent (Escalating by growth rate)</span>
              </div>
              <div className="rvb-legend-item">
                <span className="rvb-legend-dot green" />
                <span>Annual EMI (Fixed monthly loan payment)</span>
              </div>
              {crossoverYear && (
                <div className="rvb-legend-item">
                  <span className="rvb-legend-dot yellow" />
                  <span>Crossover Year ({crossoverYear}y)</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="rvb-legend-item">
                <span className="rvb-legend-dot blue" />
                <span>Renter's Investment Portfolio</span>
              </div>
              <div className="rvb-legend-item">
                <span className="rvb-legend-dot green" />
                <span>Purchased Home Market Value</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Snapshot Milestones Table */}
      <div className="rvb-table-wrap">
        <table className="rvb-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Annual Rent</th>
              <th>Annual EMI</th>
              <th>Renter Portfolio</th>
              <th>House Value</th>
            </tr>
          </thead>
          <tbody>
            {projections
              .filter(
                (p) =>
                  p.year === 1 ||
                  p.year === 5 ||
                  p.year === 10 ||
                  p.year === 15 ||
                  p.year === projections.length ||
                  p.year === crossoverYear,
              )
              .sort((a, b) => a.year - b.year)
              // remove duplicate years if crossover matches milestone
              .filter((p, index, self) => index === self.findIndex((t) => t.year === p.year))
              .map((row) => (
                <tr key={row.year} className={row.year === crossoverYear ? 'crossover-row' : ''}>
                  <td>
                    <strong>Year {row.year}</strong>
                    {row.year === crossoverYear && (
                      <span className="rvb-table-tag">Crossover</span>
                    )}
                  </td>
                  <td>{formatINR(row.annualRent, true)}/yr</td>
                  <td>{formatINR(row.annualEMI, true)}/yr</td>
                  <td className="text-cyan">{formatINR(row.renterPortfolioValue, true)}</td>
                  <td className="text-emerald">{formatINR(row.houseValue, true)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
