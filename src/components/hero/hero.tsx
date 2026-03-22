import React from "react";
import "./hero.css";

const Hero = () => {
  return (
    <header id="heroContainer" className="hero-container">
      <div className="bg-light-leak-purple"></div>
      <div className="bg-light-leak-blue"></div>
      
      <div className="hero-content-wrapper">
        <div className="hero-text-content">
          <div className="hero-badge">
            <span className="hero-badge-text">Fullstack Developer</span>
          </div>
          
          <h1 className="hero-headline text-glow">
            ANURAG <span className="gradient-text">SHARMA</span>
          </h1>
          
          <p className="hero-description">
            I build blazing-fast web apps that look good and scale even better. From crafting pixel-perfect UIs with React to architecting heavy-duty backends in Node.js and Spring Boot—I write code that wows.
          </p>
          
          <div className="hero-buttons">
            <a href="./docs/Anurag_resume.pdf" target="_blank" rel="noopener noreferrer">
              <button className="btn-primary">
                DOWNLOAD RESUME
              </button>
            </a>
            <a href="#contact">
              <button className="btn-secondary">
                <span>GET IN TOUCH</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </a>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
            <a href="https://github.com/anurrags" target="_blank" rel="noopener noreferrer" style={{ color: "var(--on-surface-variant)" }}>
              <img src="./svg/github.svg" alt="github" style={{ width: "24px", height: "24px", opacity: 0.8 }} />
            </a>
            <a href="https://www.linkedin.com/in/anurrags/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--on-surface-variant)" }}>
              <img src="./svg/linkedin.svg" alt="linkedin" style={{ width: "24px", height: "24px", opacity: 0.8 }} />
            </a>
            <a href="https://twitter.com/anurrag_s" target="_blank" rel="noopener noreferrer" style={{ color: "var(--on-surface-variant)" }}>
              <img src="./svg/twitter.svg" alt="twitter" style={{ width: "24px", height: "24px", opacity: 0.8 }} />
            </a>
            <a href="https://www.instagram.com/anuragity/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--on-surface-variant)" }}>
              <img src="./svg/instagram.svg" alt="instagram" style={{ width: "24px", height: "24px", opacity: 0.8 }} />
            </a>
          </div>
        </div>
        
        <div className="hero-image-wrapper">
          <div className="hero-image-container group">
            <div className="ambient-glow"></div>
            <img 
              src="./user-photo.png" 
              alt="Anurag Sharma" 
              className="hero-image-floating" 
            />
            <div className="hero-stats-floating">
              <div className="stats-number">&gt;_</div>
              <div className="stats-label">A Fullstack Developer</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
