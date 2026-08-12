import React from "react";
import InfoPage from "./InfoPage";

const Cookies = () => {
  return (
    <InfoPage
      title="Cookie Policy"
      subtitle="Information about cookies and similar technologies."
      icon="fa-cookie-bite"
    >
      <section>
        <h2>What Are Cookies?</h2>

        <p>
          Cookies are small pieces of information stored on your device
          that can help websites remember preferences and provide
          certain functionality.
        </p>
      </section>

      <section>
        <h2>How We May Use Cookies</h2>

        <ul className="info-list">
          <li>Remembering user preferences.</li>
          <li>Keeping users signed in.</li>
          <li>Improving website functionality.</li>
          <li>Understanding how users interact with the platform.</li>
          <li>Helping maintain security.</li>
        </ul>
      </section>

      <section>
        <h2>Managing Cookies</h2>

        <p>
          Most browsers allow you to control or delete cookies through
          your browser settings.
        </p>
      </section>
    </InfoPage>
  );
};

export default Cookies;