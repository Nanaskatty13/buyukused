import React from "react";
import InfoPage from "./InfoPage";

const Contact = () => {
  return (
    <InfoPage
      title="Contact Us"
      subtitle="We're here to help."
      icon="fa-envelope"
    >
      <section>
        <h2>Get in Touch</h2>

        <p>
          Have a question, suggestion or problem? Contact our support
          team using any of the options below.
        </p>
      </section>

      <section className="contact-options">

        <div className="contact-card">
          <i className="fas fa-phone"></i>
          <h3>Call Us</h3>
          <p>Speak with our support team.</p>
          <a href="tel:+233542928081">
            +233 542 928 081
          </a>
        </div>

        <div className="contact-card">
          <i className="fas fa-envelope"></i>
          <h3>Email</h3>
          <p>Send us an email.</p>
          <a href="mailto:knsmartgadgetshub@gmail.com">
            knsmartgadgetshub@gmail.com
          </a>
        </div>

        <div className="contact-card">
          <i className="fab fa-whatsapp"></i>
          <h3>WhatsApp</h3>
          <p>Chat with our support team.</p>
          <a
            href="https://wa.me/233542928081"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>
        </div>

      </section>
    </InfoPage>
  );
};

export default Contact;