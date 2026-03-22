import { useState } from "react";
import "./headers.css";

const Headers = () => {
  const [activeSection, setActiveSection] = useState("heroContainer");

  const sections = [
    { id: "heroContainer", name: "Home", icon: "home" },
    { id: "overviewContainer", name: "Expertise", icon: "layers" },
    { id: "experience", name: "Experience", icon: "work" },
    { id: "contact", name: "Contact", icon: "mail" },
  ];

  return (
    <>
      <nav className="top-nav">
        <div className="top-nav-content">
          <div className="logo-container">
            <span className="material-symbols-outlined logo-icon">terminal</span>
            <span className="logo-text">ANURAG.DEV</span>
          </div>
          
          <div className="desktop-nav">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`desktop-link ${activeSection === section.id ? "active" : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="mobile-nav-container">
        <div className="mobile-nav">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`mobile-link ${activeSection === section.id ? "active" : ""}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="material-symbols-outlined">{section.icon}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Headers;
