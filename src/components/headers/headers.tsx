import React from "react";
import "./headers.css";

const headers = () => {
  return (
    <div className="header-container">
      <span className="logo">Anurag</span>
      <ul className="nav-bar-list">
        <li className="navbar-list-item">
          <a className="navbar-link" href="">
            Overview
          </a>
        </li>
        <li className="navbar-list-item">
          <a className="navbar-link" href="">
            Skills
          </a>
        </li>
        <li className="navbar-list-item">
          <a className="navbar-link" href="">
            Projects
          </a>
        </li>
        <li className="navbar-list-item">
          <a className="navbar-link" href="">
            Contact
          </a>
        </li>
      </ul>
    </div>
  );
};

export default headers;
