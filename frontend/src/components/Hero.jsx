import React from 'react';
import SearchBar from './SearchBar';

const Hero = ({ onSearch }) => {
  return (
    <section
      className="hero-apple"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div className="hero-apple-content">
        <h1
          className="hero-apple-title"
          style={{
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          Buy, sell, and discover<br />amazing deals.
        </h1>

        <p
          className="hero-apple-subtitle"
          style={{
            color: '#f1f5f9',
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        >
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

        <div
          className="hero-apple-stats"
          style={{
            color: '#e2e8f0',
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        >
          <span>👥 200+ Users</span>
          <span>🏷️ 100+ Ads</span>
          <span>✅ Verified Sellers</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;