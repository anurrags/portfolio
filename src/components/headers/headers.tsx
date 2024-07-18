import { useEffect, useRef, useState } from "react";
import "./headers.css";

const Headers = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hamburgerMenuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      hamburgerMenuRef.current &&
      !hamburgerMenuRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="header-container">
      <div className="logo-container">
        <span className="logo">Anurag</span>
      </div>
      <div className="hamburger-menu-div">
        <img
          src="./svg/hamburger-menu-light.svg"
          alt="hamburger-menu-icon"
          className={`hamburger-icon ${
            isOpen ? "hamburger-icon-off" : "hamburger-icon-on"
          }`}
          onClick={() => setIsOpen(true)}
        />
        {isOpen && (
          <div className="hamburder-menu-list" ref={hamburgerMenuRef}>
            <ul className="hamburder-menu-list">
              <li className="hamburder-menu-item">
                <div className="hamburger-close-icon-div">
                  <img
                    src="./svg/close-icon-light.svg"
                    className="hamburger-menu-close"
                    alt="hamburger-menu-close-btn"
                    onClick={() => setIsOpen(false)}
                  />
                </div>
              </li>
              <li className="hamburder-menu-item">
                <a
                  className="navbar-link"
                  href="#heroContainer"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </a>
              </li>
              <li className="hamburder-menu-item">
                <a
                  className="navbar-link"
                  href="#overviewContainer"
                  onClick={() => setIsOpen(false)}
                >
                  Overview
                </a>
              </li>
              <li className="hamburder-menu-item">
                <a
                  className="navbar-link"
                  href="#experience"
                  onClick={() => setIsOpen(false)}
                >
                  Experience
                </a>
              </li>
              <li className="hamburder-menu-item">
                <a
                  className="navbar-link"
                  href="#skill"
                  onClick={() => setIsOpen(false)}
                >
                  Skills
                </a>
              </li>
              <li className="hamburder-menu-item">
                <a
                  className="navbar-link"
                  href="#projects"
                  onClick={() => setIsOpen(false)}
                >
                  Projects
                </a>
              </li>
              <li className="hamburder-menu-item">
                <a
                  className="navbar-link"
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
      <ul className="nav-bar-list">
        <li className="navbar-list-item">
          <a className="navbar-link" href="#heroContainer">
            Home
          </a>
        </li>
        <li className="navbar-list-item">
          <a className="navbar-link" href="#overviewContainer">
            Overview
          </a>
        </li>
        <li className="navbar-list-item">
          <a className="navbar-link" href="#experience">
            Experience
          </a>
        </li>
        <li className="navbar-list-item">
          <a className="navbar-link" href="#skill">
            Skills
          </a>
        </li>
        <li className="navbar-list-item">
          <a className="navbar-link" href="#projects">
            Projects
          </a>
        </li>
        <li className="navbar-list-item">
          <a className="navbar-link" href="#contact">
            Contact
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Headers;
