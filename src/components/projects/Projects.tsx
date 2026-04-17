import React from "react";
import { projectsData } from "../../DB/projectsData";
import "./projects.css";

const Projects = () => {
  return (
    <section id="projects" className="projects-section">
      <div className="projects-container">
        <div className="projects-header">
          <span className="projects-label">My Portfolio</span>
          <h2 className="projects-title">Featured Web Projects</h2>
        </div>
        
        <div className="projects-grid">
          {projectsData.map((project, index) => (
            <div key={index} className="glass-card project-card">
              <div className="project-image-wrapper">
                <img 
                  src={project.thumbnail} 
                  alt={`${project.title} Preview`} 
                  className="project-image"
                  loading="lazy"
                />
                <div className="project-overlay">
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link-btn primary-btn">
                    <span className="material-symbols-outlined">launch</span> Live Demo
                  </a>
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link-btn secondary-btn">
                    <span className="material-symbols-outlined">code</span> Source
                  </a>
                </div>
              </div>
              
              <div className="project-content">
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
