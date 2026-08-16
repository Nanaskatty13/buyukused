import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentDate = new Date();
  const fullDate = currentDate.toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
          {/* About Us */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>BuyUk Used</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/about">About Us</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/how-it-works">How It Works</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>For Sellers</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/for-sellers">Overview</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/post-ad">Post Free Ad</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/for-sellers/pricing">Pricing</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/for-sellers/tips">Tips</Link></li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>For Buyers</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/for-buyers">Overview</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/products">Browse Ads</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/for-buyers/safety-tips">Safety Tips</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/for-buyers/report-ad">Report Ad</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/support">Help Center</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/support#call-us">Call Us</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/support#email">Email</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/support#whatsapp">WhatsApp</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/terms">Terms</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/privacy">Privacy</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/cookies">Cookies</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/cookies">Version 0.09</Link></li>
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
          <span>
            &copy; {currentDate.getFullYear()} BuyUk Used. All rights reserved. | {fullDate}
          </span>

          <div className="social" style={{ display: 'flex', gap: '12px' }}>
            <a
              href="https://www.facebook.com/profile.php?id=61589482561470"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'var(--gray-800)',
                borderRadius: '50%',
                transition: 'var(--transition)',
                color: 'var(--gray-400)',
              }}
            >
              <i className="fab fa-facebook-f"></i>
            </a>

            <a
              href="https://www.instagram.com/nana_skatty/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'var(--gray-800)',
                borderRadius: '50%',
                transition: 'var(--transition)',
                color: 'var(--gray-400)',
              }}
            >
              <i className="fab fa-instagram"></i>
            </a>

            <a
              href="https://x.com/knsmartgadgets"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'var(--gray-800)',
                borderRadius: '50%',
                transition: 'var(--transition)',
                color: 'var(--gray-400)',
              }}
            >
              <i className="fab fa-twitter"></i>
            </a>

            <a
              href="https://www.youtube.com/@KnsmartGadgetshub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'var(--gray-800)',
                borderRadius: '50%',
                transition: 'var(--transition)',
                color: 'var(--gray-400)',
              }}
            >
              <i className="fab fa-youtube"></i>
            </a>

            <a
              href="https://www.tiktok.com/@kn.smart.gadgets"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'var(--gray-800)',
                borderRadius: '50%',
                transition: 'var(--transition)',
                color: 'var(--gray-400)',
              }}
            >
              <i className="fab fa-tiktok"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;