import { useForm, ValidationError } from "@formspree/react";
import "./contactform.css";

const Contactform = () => {
  const [state, handleSubmit] = useForm("xldrdyjr");
  
  if (state.succeeded) {
    return (
      <div className="success-message-container">
        <h3 className="success-message">
          Transmission Received!
        </h3>
        <p style={{ color: "var(--on-surface-variant)" }}>
          Thanks for reaching out. I'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form name="contact" className="contact-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label className="form-label">Your Identity</label>
        <input
          className="form-input"
          type="text"
          name="name"
          placeholder="NAME / ORGANIZATION"
          required
        />
      </div>
      
      <div className="input-group">
        <label className="form-label">Digital Link</label>
        <input
          className="form-input"
          type="email"
          name="email"
          placeholder="EMAIL ADDRESS"
          required
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
      </div>
      
      <div className="input-group input-group-full">
        <label className="form-label">The Objective</label>
        <textarea
          className="form-input form-textarea"
          name="message"
          rows={4}
          placeholder="BRIEF MISSION DESCRIPTION"
          required
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} />
      </div>
      
      <div className="input-group-full" style={{ paddingTop: "1.5rem" }}>
        <button
          className="submit-btn"
          type="submit"
          disabled={state.submitting}
        >
          SEND SIGNAL
        </button>
      </div>
    </form>
  );
};

export default Contactform;
