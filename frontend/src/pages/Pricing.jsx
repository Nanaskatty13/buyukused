import React from "react";
import InfoPage from "./InfoPage";

const Pricing = () => {
  return (
    <InfoPage
      title="Pricing"
      subtitle="Simple and transparent marketplace pricing."
      icon="fa-tag"
    >
      <section>
        <h2>Post Your Ad</h2>

        <p>
          Our marketplace is designed to make selling accessible.
          Check your account and posting options for the latest
          available pricing.
        </p>
      </section>

      <section>
        <h2>Promoted Listings</h2>

        <p>
          Promotional options may be available to sellers who want
          additional visibility for their listings.
        </p>
      </section>

      <section>
        <h2>Important</h2>

        <p>
          Prices and promotional options may change from time to time.
          Always review the current price before confirming a paid
          service.
        </p>
      </section>
    </InfoPage>
  );
};

export default Pricing;