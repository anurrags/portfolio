import Contactform from "../contact-form/Contactform";
import "./contact.css";

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-container glass-card">
        <div className="contact-header">
          <h2 className="contact-title">Initiate Transmission</h2>
          <p className="contact-desc">Ready to architect your next high-performance digital asset?</p>
        </div>
        
        <Contactform />
      </div>
    </section>
  );
};

export default Contact;
