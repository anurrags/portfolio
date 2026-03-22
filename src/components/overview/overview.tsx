import React from "react";
import "./overview.css";

const desc: string[] = [
  "Ingenious problem solver, adept at unraveling complex challenges efficiently",
  "Creative frontend developer, passionate about crafting immersive user experiences",
  "Proficient backend architect, ensuring robust, scalable server-side solutions",
  "Advocate for clean code, prioritizing readability and maintainability always",
];

const Overview = () => {
  return (
    <section id="overviewContainer" className="overview-section">
      <div className="overview-container">
        <div className="overview-header">
          <span className="overview-label">Expertise</span>
          <h2 className="overview-title">Technical Core</h2>
        </div>
        
        <div className="overview-grid">
          {/* Card 1 */}
          <div className="glass-card overview-card card-span-2">
            <span className="material-symbols-outlined card-icon icon-primary">psychology</span>
            <h3 className="card-title">Problem Solving</h3>
            <p className="card-desc">
              {desc[0]}
            </p>
            <div className="card-tags">
              <span className="card-tag">ALGORITHMS</span>
              <span className="card-tag">DATA STRUCTURES</span>
              <span className="card-tag">OPTIMIZATION</span>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="glass-card overview-card">
            <span className="material-symbols-outlined card-icon icon-secondary">layers</span>
            <h3 className="card-title">Frontend</h3>
            <p className="card-desc">
              {desc[1]}
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="glass-card overview-card">
            <span className="material-symbols-outlined card-icon icon-tertiary">terminal</span>
            <h3 className="card-title">Backend</h3>
            <p className="card-desc">
              {desc[2]}
            </p>
          </div>
          
          {/* Card 4 */}
          <div className="glass-card overview-card card-span-2 card-flex-row group">
            <div className="card-left-content">
              <h3 className="card-title">Clean Code</h3>
              <p className="card-desc">
                {desc[3]}
              </p>
              <a href="https://github.com/anurrags" target="_blank" rel="noopener noreferrer" className="card-link">
                VIEW GITHUB <span className="material-symbols-outlined">north_east</span>
              </a>
            </div>
            <div className="card-visualizer">
              <span className="material-symbols-outlined visualizer-icon">code</span>
              <span className="material-symbols-outlined visualizer-icon">code_blocks</span>
              <span className="material-symbols-outlined visualizer-icon">integration_instructions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Overview;
