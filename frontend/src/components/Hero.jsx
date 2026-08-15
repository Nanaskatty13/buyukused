import React from 'react';
import SearchBar from './SearchBar';

const Hero = ({ onSearch }) => {
  return (
    <section className="hero-apple">
      <div className="hero-apple-content">
        <h1 className="hero-apple-title">
          Buy, sell, and discover<br />amazing deals.
        </h1>
        <p className="hero-apple-subtitle">
          Find Phones, Laptops, Tablets, TV &amp; Game Consoles,<br />
          and more near you in Ghana.
        </p>

        <div className="hero-apple-search">
          <SearchBar onSearch={onSearch} />
        </div>

        <div className="hero-apple-actions">
          <a href="/products" className="hero-apple-btn-primary">
            Browse Listings
          </a>
          <a href="/post-ad" className="hero-apple-btn-secondary">
            Sell Now
          </a>
        </div>

        <div className="hero-apple-stats">
          <span>👥 200+ Users</span>
          <span>🏷️ 100+ Ads</span>
          <span>✅ Verified Sellers</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;