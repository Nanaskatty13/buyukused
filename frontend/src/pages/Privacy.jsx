import React from "react";
import InfoPage from "./InfoPage";

const Privacy = () => {
  return (
    <InfoPage
      title="Privacy Policy"
      subtitle="Learn how we handle information on our marketplace."
      icon="fa-user-shield"
    >
      <section>
        <h2>Information We Collect</h2>

        <p>
          We may collect information you provide when creating an
          account, posting advertisements, contacting users or
          contacting support.
        </p>
      </section>

      <section>
        <h2>How We Use Information</h2>

        <p>
          Information may be used to provide marketplace services,
          maintain accounts, improve the platform and help protect
          users from abuse and fraud.
        </p>
      </section>

      <section>
        <h2>Account Information</h2>

        <p>
          Keep your account information accurate and do not share your
          password or authentication credentials with others.
        </p>
      </section>

      <section>
        <h2>Security</h2>

        <p>
          We take reasonable measures to protect information handled
          through the platform, but no online service can guarantee
          absolute security.
        </p>
      </section>

      <section>
        <h2>Contact</h2>

        <p>
          If you have questions about privacy, contact our support
          team.
        </p>
      </section>
    </InfoPage>
  );
};

export default Privacy;