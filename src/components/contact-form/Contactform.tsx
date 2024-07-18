import { useForm, ValidationError } from "@formspree/react";
import "./contactform.css";

const Contactform = () => {
  const [state, handleSubmit] = useForm("xldrdyjr");
  if (state.succeeded) {
    return (
      <div className="email-success-div">
        <h1 className="email-success-message">
          Your message has been successfully sent!
        </h1>
        <br />
        <h1 className="email-success-message">Thanks for contacting!</h1>
      </div>
    );
  }

  return (
    <div className="contact-form-container">
      <form name="contact" className="contact-form" onSubmit={handleSubmit}>
        <input
          className="contact-form-input"
          type="name"
          name="name"
          placeholder="Your Name"
        />
        <input
          className="contact-form-input"
          type="email"
          name="email"
          id=""
          placeholder="E-mail"
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
        <input
          className="contact-form-input"
          type="subject"
          name="subject"
          placeholder="Write a Subject"
        />
        <textarea
          className="contact-form-input"
          name="message"
          id=""
          cols={30}
          rows={10}
          placeholder="Your Message"
        />
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
        />
        <button
          className="contact-form-btn"
          type="submit"
          disabled={state.submitting}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Contactform;
