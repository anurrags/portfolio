import "./contactform.css";
const Contactform = () => {
  return (
    <div className="contact-form-container">
      <form
        name="contact"
        className="contact-form"
        data-netlify="true"
        method="POST"
      >
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
        <input
          className="contact-form-input"
          type="subject"
          placeholder="Write a Subject"
        />
        <textarea
          className="contact-form-input"
          name="Message"
          id=""
          cols={30}
          rows={10}
          placeholder="Your Message"
        />
        <button className="contact-form-btn" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Contactform;
