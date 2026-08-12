import React from "react";
import { Link } from "react-router-dom";
import InfoPage from "./InfoPage";

const About = () => {
  return (
    <InfoPage
      title="About Us"
      subtitle="A simple marketplace built to make buying and selling easier."
      icon="fa-info-circle"
    >
      <section>
        <h2>Welcome to BuyUk Used</h2>

        <p>
          BuyUk Used is an online marketplace that connects buyers and
          sellers in one convenient place. Our goal is to make it easier
          for people to discover products, connect with sellers and find
          great deals.
        </p>

        <p>
          Whether you are looking for electronics, vehicles, fashion,
          property, jobs or everyday items, you can browse available ads
          and contact sellers directly.
        </p>
      </section>

      <section>
        <h2>Our Mission</h2>

        <p>
          Our mission is to build a trusted and easy-to-use marketplace
          where people can buy and sell with confidence.
        </p>
      </section>

      <section>
        <h2>For Buyers</h2>

        <p>
          Buyers can browse listings, search for products, save favorites
          and contact sellers about items they are interested in.
        </p>

        <Link to="/products" className="info-cta">
          Browse Ads
        </Link>
      </section>

      <section>
        <h2>For Sellers</h2>

        <p>
          Sellers can create listings and reach people who are actively
          looking for products and services.
        </p>

        <Link to="/post-ad" className="info-cta">
          Post Free Ad
        </Link>
      </section>
    </InfoPage>
  );
};

export default About;