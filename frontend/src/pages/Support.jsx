import React from "react";
import InfoPage from "./InfoPage";

const Support = () => {
  return (
    <InfoPage
      title="Support"
      subtitle="Need help? We're here for you."
      icon="fa-headset"
    >
      <section>
        <h2>How Can We Help?</h2>

        <p>
          If you have a problem with your account, advertisement,
          transaction or marketplace experience, contact our support
          team.
        </p>
      </section>

      <section className="contact-options">

        <div className="contact-card">
          <i className="fas fa-phone"></i>
          <h3>Call Us</h3>
          <a href="tel:+2330542928081">
            +233 054 292 8081
          </a>
        </div>

        <div className="contact-card">
          <i className="fas fa-envelope"></i>
          <h3>Email</h3>
          <a href="mailto:knsmartgadgetshub@gmail.com">
            knsmartgadgetshub@gmail.com
          </a>
        </div>

        <div className="contact-card">
          <i className="fab fa-whatsapp"></i>
          <h3>WhatsApp</h3>
          <a
            href="https://wa.me/2330542928081"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat With Us
          </a>
        </div>

      </section>
    </InfoPage>
  );
};

export default Support;