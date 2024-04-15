import React from "react";
import "./hero.css";

const Hero = () => {
  return (
    <>
      <div id="heroContainer" className="hero-container">
        <div className="hero-main-content">
          <div className="main-content-intro">
            <h1>
              <span className="intro-span">Hi! </span>
              <span className="intro-span">I'm </span>
              <br />
              <span className="intro-span intro-name">Anurag </span>
              <span className="intro-span intro-name">Sharma</span>
            </h1>
            <h2 className="intro-h2">
              <span className="intro-h2-gt intro-h2">{"> "}</span>
              <span className="intro-h2">A fullstack developer</span>
            </h2>
            <div className="resume-btn">
              <a href="./docs/Anurag_resume.pdf" target="_blank">
                Download Resume
              </a>
            </div>
          </div>
          <div className="main-content-icons">
            <img src="./user-photo.png" className="user-photo" alt="" />
            <div className="social icon-1">
              <a
                className="social__link  icono__dark"
                href="https://github.com/anurrags"
                target="_blank"
                rel="nofollow noreferrer noopener"
              >
                <img
                  className="social_icon"
                  src="./svg/github.svg"
                  alt="github icon"
                />
              </a>
            </div>
            <div className="social icon-2">
              <a
                className="social__link  icono__dark"
                href="https://www.instagram.com/anurrag.s/"
                target="_blank"
                rel="nofollow noreferrer noopener"
              >
                <img
                  className="social_icon"
                  src="./svg/instagram.svg"
                  alt="github icon"
                />
              </a>
            </div>
            <div className="social icon-3">
              <a
                className="social__link  icono__dark"
                href="https://twitter.com/anurrag_s"
                target="_blank"
                rel="nofollow noreferrer noopener"
              >
                <img
                  className="social_icon"
                  src="./svg/twitter.svg"
                  alt="github icon"
                />
              </a>
            </div>
            <div className="social icon-4">
              <a
                className="social__link  icono__dark"
                href="https://www.linkedin.com/in/anurrags/"
                target="_blank"
                rel="nofollow noreferrer noopener"
              >
                <img
                  className="social_icon"
                  src="./svg/linkedin.svg"
                  alt="github icon"
                />
              </a>
            </div>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="curve-svg curve-svg-hero"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#fff"
            fill-opacity="1"
            d="M0,96L80,122.7C160,149,320,203,480,197.3C640,192,800,128,960,112C1120,96,1280,128,1360,144L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </>
  );
};

export default Hero;
