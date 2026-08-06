import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" style={{
      background: 'var(--gray-900)',
      color: 'var(--gray-400)',
      padding: '40px 0 20px',
      borderTop: '3px solid var(--secondary)',
    }}>
      <div className="container">
        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '30px',
          marginBottom: '30px',
        }}>
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>KN Classifieds</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><Link to="/about">About Us</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/how-it-works">How it works</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>For Sellers</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><Link to="/post-ad">Post Free Ad</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/pricing">Pricing</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/tips">Tips</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>For Buyers</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><Link to="/products">Browse Ads</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/safety">Safety Tips</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/report">Report Ad</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>Support</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><a href="tel:+233542928081">Call Us</a></li>
              <li style={{ marginBottom: '8px' }}><a href="mailto:knsmartgadgetshub@gmail.com">Email</a></li>
              <li style={{ marginBottom: '8px' }}><a href="https://wa.me/233542928081" target="_blank">WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>Legal</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}><Link to="/terms">Terms</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/privacy">Privacy</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/cookies">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="bottom" style={{
          borderTop: '1px solid var(--gray-800)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px',
        }}>
          <span>&copy; 2026 KN Classifieds. All rights reserved.</span>
          <div className="social" style={{ display: 'flex', gap: '12px' }}>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: 'var(--gray-800)',
              borderRadius: '50%',
              transition: 'var(--transition)',
              color: 'var(--gray-400)',
            }}><i className="fab fa-facebook-f"></i></a>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: 'var(--gray-800)',
              borderRadius: '50%',
              transition: 'var(--transition)',
              color: 'var(--gray-400)',
            }}><i className="fab fa-instagram"></i></a>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: 'var(--gray-800)',
              borderRadius: '50%',
              transition: 'var(--transition)',
              color: 'var(--gray-400)',
            }}><i className="fab fa-twitter"></i></a>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: 'var(--gray-800)',
              borderRadius: '50%',
              transition: 'var(--transition)',
              color: 'var(--gray-400)',
            }}><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;