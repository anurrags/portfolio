import React from 'react';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer-section">
      <div className="footer-tools-links">
        <a href="/tools/rent-vs-buy-calculator" className="footer-link">Rent vs Buy Calculator</a>
        <span className="footer-dot">•</span>
        <a href="/editor" className="footer-link">Live Code Editor</a>
        <span className="footer-dot">•</span>
        <a href="/drop" className="footer-link">Local WiFi Drop</a>
      </div>
      <p className="footer-text">
        &copy; {currentYear} <span>Anurag Sharma</span>. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
