import React from "react";
import experienceData from "../../DB/work-experience";
import "./experience.css";

const Experience = () => {
  return (
    <section id="experience" className="experience-section">
      <div className="experience-container">
        <div className="experience-header">
          <span className="experience-label">The Journey</span>
          <h2 className="experience-title">Professional Timeline</h2>
        </div>
        
        <div className="timeline-wrapper">
          <div className="timeline-line"></div>
          
          {experienceData.map((job, index) => (
            <div key={index} className={`timeline-item ${index % 2 !== 0 ? 'reverse' : ''}`}>
              <div className="timeline-meta">
                <span className="timeline-date">{job.date}</span>
                <h3 className="timeline-role">{job.position}</h3>
                <p className={`timeline-company ${index % 2 === 0 ? 'company-primary' : 'company-secondary'}`}>{job.company}</p>
              </div>
              
              <div className={`timeline-node ${index % 2 === 0 ? 'node-primary' : 'node-secondary'}`}></div>
              
              <div className="timeline-content">
                <div className="mobile-meta">
                  <span className="timeline-date">{job.date}</span>
                  <h3 className="timeline-role" style={{ fontSize: "1.25rem" }}>{job.position}</h3>
                  <p className={`timeline-company ${index % 2 === 0 ? 'company-primary' : 'company-secondary'}`}>{job.company}</p>
                </div>
                <div className="glass-card timeline-desc">
                  {job.description.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                  <div style={{ marginTop: "1rem", color: "var(--primary)", fontSize: "0.75rem", fontFamily: "var(--font-label)" }}>
                    TECH STACK: {job.techStack}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </section>
  );
};

export default Experience;
