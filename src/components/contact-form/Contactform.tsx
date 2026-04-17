import React, { useState } from "react";
import "./contactform.css";

const Contactform = () => {
  const [status, setStatus] = useState<"idle" | "submitting" | "succeeded" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(e.currentTarget);
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    
    if (!accessKey) {
      setStatus("error");
      setErrorMessage("Configuration error: Missing Web3Forms access key.");
      return;
    }
    
    formData.append("access_key", accessKey);
    // Optional: avoid ugly redirects if JS fails by using subjective headers
    formData.append("subject", "New Mission Signal from Portfolio");
    formData.append("from_name", "Anurag's Portfolio Bot");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus("succeeded");
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Failed to transmit message.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("A network error occurred. Please try again.");
    }
  };

  if (status === "succeeded") {
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
      </div>

      {status === "error" && (
        <div className="input-group-full" style={{ paddingTop: "1rem" }}>
          <p style={{ color: "#ef4444", fontSize: "0.875rem", margin: "0", fontFamily: "var(--font-label)" }}>
            [ERROR_CODE]: {errorMessage}
          </p>
        </div>
      )}
      
      <div className="input-group-full" style={{ paddingTop: "1.5rem" }}>
        <button
          className="submit-btn"
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "TRANSMITTING..." : "SEND SIGNAL"}
        </button>
      </div>
    </form>
  );
};

export default Contactform;
