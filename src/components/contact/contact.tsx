import Contactform from "../contact-form";
import "./contact.css";

const contact = () => {
  return (
    <div className="contact-main-div">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="curve-svg curve-svg-contact rotated-curve"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#fff"
          fillOpacity="1"
          d="M0,96L80,122.7C160,149,320,203,480,197.3C640,192,800,128,960,112C1120,96,1280,128,1360,144L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        ></path>
      </svg>
      <h1 className="contact-h1">Contact Me</h1>
      <div className="contact-container">
        <div className="form-container">
          {" "}
          <Contactform />
        </div>

        <img src="./svg/telegram.svg" alt="" className="contact-img" />
      </div>
    </div>
  );
};

export default contact;
