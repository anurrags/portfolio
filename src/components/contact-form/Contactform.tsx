import React from "react";
import { useNavigate } from "react-router-dom";
import "./contactform.css";

const Contactform: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const myForm = event.currentTarget;
    const formData = new FormData(myForm);

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData.toString()).toString(),
    })
      .then(() => navigate("/thank-you/"))
      .catch((error) => alert(error));
  };

  return (
    <div className="contact-form-container">
      <form
        name="contact"
        className="contact-form"
        data-netlify="true"
        method="POST"
        onSubmit={handleSubmit}
      >
        {/* Hidden input for form name */}
        <input type="hidden" name="form-name" value="contact" />

        {/* Form fields */}
        <input
          className="contact-form-input"
          type="text"
          name="name"
          placeholder="Your Name"
          required
        />
        <input
          className="contact-form-input"
          type="email"
          name="email"
          placeholder="E-mail"
          required
        />
        <input
          className="contact-form-input"
          type="text"
          name="subject"
          placeholder="Write a Subject"
        />
        <textarea
          className="contact-form-input"
          name="message"
          cols={30}
          rows={10}
          placeholder="Your Message"
          required
        ></textarea>
        <button className="contact-form-btn" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Contactform;
