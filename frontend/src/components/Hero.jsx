import React from 'react';
import SearchBar from './SearchBar';

const Hero = ({ onSearch }) => {
  return (
    <section className="hero" style={{
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
      padding: '40px 0 50px',
      color: 'white',
      textAlign: 'center',
    }}>
      <div className="container">
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          Buy, sell, and discover amazing deals
        </h1>
        <p style={{ opacity: 0.85, fontSize: '16px', marginBottom: '24px' }}>
          Find Phones, Laptops, Tablets, TV & Game Consoles, and more near you in Ghana.
        </p>

        <SearchBar onSearch={onSearch} />

        <div className="hero-stats" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px 50px',
          flexWrap: 'wrap',
          marginTop: '24px',
          fontSize: '14px',
          opacity: 0.9,
        }}>
          <span><i className="fas fa-users"></i> 200+ Users</span>
          <span><i className="fas fa-tag"></i> 100+ Ads</span>
          <span><i className="fas fa-check-circle"></i> Verified Sellers</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;