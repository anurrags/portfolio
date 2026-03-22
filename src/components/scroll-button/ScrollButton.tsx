import React, { useState, useEffect } from 'react';
import './scroll-button.css';

const ScrollButton = () => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsAtTop(false);
      } else {
        setIsAtTop(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (isAtTop) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="scroll-btn-container">
      <button 
        onClick={handleClick}
        className="scroll-btn"
        aria-label={isAtTop ? "Scroll to bottom" : "Scroll to top"}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>
          {isAtTop ? 'arrow_downward' : 'arrow_upward'}
        </span>
      </button>
    </div>
  );
};

export default ScrollButton;
