import React from "react";
import skillDatas from "../../DB/skillData";
import "./skill.css";

const Skill = () => {
  // Split skills into two rows for the dual marquee effect
  const midpoint = Math.ceil(skillDatas.length / 2);
  const row1 = skillDatas.slice(0, midpoint);
  const row2 = skillDatas.slice(midpoint);

  return (
    <section id="skill" className="skills-section">
      <div className="skills-container wrapper-container">
        <div className="skills-header">
          <span className="skills-label">The Stack</span>
          <h2 className="skills-title">Technologies I Command</h2>
        </div>
      </div>
        
      <div className="marquee-wrapper">
        <div className="marquee">
          <div className="marquee-content scroll-left">
            {[...row1, ...row1, ...row1].map((skill, index) => (
              <div 
                key={`r1-${index}`} 
                className="skill-card primary-hover"
              >
                <img 
                  src={skill.imgSrc} 
                  alt={skill.imgAlt} 
                  className="skill-icon-img" 
                  style={{ width: "40px", height: "40px", objectFit: "contain" }} 
                />
                <span className="skill-name">{skill.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="marquee" style={{ marginTop: "2rem" }}>
          <div className="marquee-content scroll-right">
            {[...row2, ...row2, ...row2].map((skill, index) => (
              <div 
                key={`r2-${index}`} 
                className="skill-card secondary-hover"
              >
                <img 
                  src={skill.imgSrc} 
                  alt={skill.imgAlt} 
                  className="skill-icon-img" 
                  style={{ width: "40px", height: "40px", objectFit: "contain" }} 
                />
                <span className="skill-name">{skill.title}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Gradient Overlays for smooth edges */}
        <div className="marquee-gradient-left"></div>
        <div className="marquee-gradient-right"></div>
      </div>
    </section>
  );
};

export default Skill;
