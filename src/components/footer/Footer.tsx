import React from 'react';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer-section">
      <p className="footer-text">
        &copy; {currentYear} <span>Anurag Sharma</span>. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
