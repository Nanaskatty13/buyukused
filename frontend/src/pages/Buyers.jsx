import React from "react";
import { Link } from "react-router-dom";
import InfoPage from "./InfoPage";

const Buyers = () => {
  return (
    <InfoPage
      title="For Buyers"
      subtitle="Find products and connect with sellers."
      icon="fa-shopping-bag"
    >
      <section>
        <h2>Find What You Need</h2>

        <p>
          Browse marketplace listings and use search and categories
          to find products that match what you are looking for.
        </p>
      </section>

      <section>
        <h2>Before You Buy</h2>

        <ul className="info-list">
          <li>Review the product description carefully.</li>
          <li>Check seller information.</li>
          <li>Ask questions about the product.</li>
          <li>Confirm the final price.</li>
          <li>Inspect products where possible.</li>
        </ul>
      </section>

      <Link to="/products" className="info-cta">
        Browse Ads
      </Link>
    </InfoPage>
  );
};

export default Buyers;