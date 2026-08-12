import React from "react";
import { Link } from "react-router-dom";
import InfoPage from "./InfoPage";

const Sellers = () => {
  return (
    <InfoPage
      title="For Sellers"
      subtitle="Reach more buyers and sell with confidence."
      icon="fa-store"
    >
      <section>
        <h2>Sell on BuyUk Used</h2>

        <p>
          List your products and connect directly with potential buyers.
          Creating an advertisement is simple and designed to help your
          products get noticed.
        </p>
      </section>

      <section>
        <h2>Why Sell With Us?</h2>

        <ul className="info-list">
          <li>Reach buyers searching for products.</li>
          <li>Create product listings easily.</li>
          <li>Add photos and product information.</li>
          <li>Communicate directly with interested buyers.</li>
          <li>Manage your advertisements from your account.</li>
        </ul>
      </section>

      <Link to="/post-ad" className="info-cta">
        Post Free Ad
      </Link>
    </InfoPage>
  );
};

export default Sellers;