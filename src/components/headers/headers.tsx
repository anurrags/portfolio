import React from "react";
import "./headers.css";

const Headers = () => {
  return (
    <div className="header-container">
      <span className="logo">Anurag</span>
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
