import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="rvb-top-header">
      <div className="rvb-header-inner">
        <a href="/" className="rvb-brand">
          <span className="rvb-brand-icon">⚡</span>
          <span className="rvb-brand-text">ANURAG.DEV</span>
        </a>

        <div className="rvb-header-nav">
          <a href="/" className="rvb-nav-link">
            Portfolio
          </a>
          <span className="rvb-nav-divider">/</span>
          <span className="rvb-nav-current">Rent vs Buy Calculator</span>
        </div>
      </div>
    </header>
  );
};
