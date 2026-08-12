import React from "react";
import InfoPage from "./InfoPage";

const SafetyTips = () => {
  return (
    <InfoPage
      title="Safety Tips"
      subtitle="Stay safe when buying and selling."
      icon="fa-shield-alt"
    >
      <section>
        <h2>Meet Safely</h2>

        <p>
          When meeting someone from an online marketplace, choose a
          public and well-known location whenever possible.
        </p>
      </section>

      <section>
        <h2>Inspect Before Paying</h2>

        <p>
          Check the item carefully and make sure it matches the
          advertisement before completing a transaction.
        </p>
      </section>

      <section>
        <h2>Protect Your Information</h2>

        <p>
          Never share passwords, verification codes, banking PINs or
          other sensitive account information with another user.
        </p>
      </section>

      <section>
        <h2>Be Careful With Unusual Deals</h2>

        <p>
          If a deal seems unusually good, take extra time to verify
          the seller and product before proceeding.
        </p>
      </section>

      <section>
        <h2>Report Suspicious Activity</h2>

        <p>
          If you believe an advertisement or user may be fraudulent,
          report it to us.
        </p>
      </section>
    </InfoPage>
  );
};

export default SafetyTips;