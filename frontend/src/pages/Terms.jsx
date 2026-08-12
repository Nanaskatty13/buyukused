import React from "react";
import InfoPage from "./InfoPage";

const Terms = () => {
  return (
    <InfoPage
      title="Terms & Conditions"
      subtitle="Please read these terms before using our marketplace."
      icon="fa-file-contract"
    >
      <section>
        <h2>1. Using the Marketplace</h2>

        <p>
          By using BuyUk Used, you agree to use the platform
          responsibly and in accordance with applicable laws.
        </p>
      </section>

      <section>
        <h2>2. User Accounts</h2>

        <p>
          You are responsible for maintaining the security of your
          account and the information associated with it.
        </p>
      </section>

      <section>
        <h2>3. Advertisements</h2>

        <p>
          Sellers are responsible for ensuring that their listings
          are accurate and do not contain prohibited or misleading
          information.
        </p>
      </section>

      <section>
        <h2>4. Transactions</h2>

        <p>
          Buyers and sellers are responsible for agreeing to and
          completing transactions responsibly.
        </p>
      </section>

      <section>
        <h2>5. Prohibited Activities</h2>

        <p>
          Users must not use the marketplace for illegal activities,
          fraud, harassment or other prohibited activities.
        </p>
      </section>

      <section>
        <h2>6. Changes</h2>

        <p>
          We may update these terms when necessary. Continued use of
          the platform after changes means you accept the updated
          terms.
        </p>
      </section>
    </InfoPage>
  );
};

export default Terms;