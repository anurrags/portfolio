import React from 'react';
import { formatINR } from '../calculations';
import { CalculationResult } from '../types';

interface VerdictBannerProps {
  result: CalculationResult;
  tenureYears: number;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ result, tenureYears }) => {
  const isRentWinner = result.recommendation === 'RENT';
  const winnerNetWealth = isRentWinner ? result.rent.netWealth : result.buy.netWealth;
  const loserNetWealth = isRentWinner ? result.buy.netWealth : result.rent.netWealth;
  const diff = result.wealthDifference;

  return (
    <div className={`rvb-verdict-banner ${isRentWinner ? 'rent-winner' : 'buy-winner'}`}>
      <div className="rvb-verdict-top">
        <span className="rvb-verdict-pill">
          {isRentWinner ? '🏠 Strategic Verdict: RENTING IS BETTER' : '🔑 Strategic Verdict: BUYING IS BETTER'}
        </span>
        {result.crossoverYear && (
          <span className="rvb-crossover-pill">
            Crossover in Year {result.crossoverYear}
          </span>
        )}
      </div>

      <h2 className="rvb-verdict-headline">
        {isRentWinner ? (
          <>
            Renting builds <span className="highlight-text">{formatINR(diff, true)}</span> more net
            wealth over {tenureYears} years.
          </>
        ) : (
          <>
            Buying builds <span className="highlight-text">{formatINR(diff, true)}</span> more net
            wealth over {tenureYears} years.
          </>
        )}
      </h2>

      <p className="rvb-verdict-explanation">
        {isRentWinner ? (
          <>
            By investing the upfront down payment, stamp duty, and the early monthly EMI savings
            into assets, your net wealth reaches{' '}
            <strong>{formatINR(winnerNetWealth, true)}</strong>, compared to{' '}
            <strong>{formatINR(loserNetWealth, true)}</strong> by buying.
          </>
        ) : (
          <>
            Because of strong real estate appreciation and long-term rental inflation, owning the
            property yields a net wealth of{' '}
            <strong>{formatINR(winnerNetWealth, true)}</strong>, outperforming renting (
            <strong>{formatINR(loserNetWealth, true)}</strong>).
          </>
        )}
      </p>

      <div className="rvb-verdict-stat-strip">
        <div className="rvb-stat-chip">
          <span className="rvb-stat-label">Renting Net Wealth:</span>
          <span className="rvb-stat-val text-cyan">{formatINR(result.rent.netWealth, true)}</span>
        </div>
        <div className="rvb-stat-chip">
          <span className="rvb-stat-label">Buying Net Wealth:</span>
          <span className="rvb-stat-val text-emerald">{formatINR(result.buy.netWealth, true)}</span>
        </div>
        <div className="rvb-stat-chip">
          <span className="rvb-stat-label">Monthly Loan EMI:</span>
          <span className="rvb-stat-val">{formatINR(result.buy.monthlyEMI)}</span>
        </div>
      </div>
    </div>
  );
};
