//import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentDate = new Date();
  const fullDate = currentDate.toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <footer className="footer liquid-footer" style={{
      padding: '40px 0 20px',
    }}>
      {/* ═══════════════════════════════════════════════════════
          LIQUID iOS27 — STYLES
          ═══════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes liquid-footer-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33%      { transform: translate3d(-30px, 24px, 0) scale(1.06); }
          66%      { transform: translate3d(24px, -20px, 0) scale(0.97); }
        }

        /* ─── Footer — liquid mirror surface ──────────── */
        .liquid-footer {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          color: #e5e7eb;
          border-top: 1px solid rgba(255,255,255,0.65);
          background: linear-gradient(
            135deg,
            rgba(30,41,59,0.85) 0%,
            rgba(51,65,85,0.78) 50%,
            rgba(30,41,59,0.82) 100%
          );
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.25),
            0 -8px 32px rgba(31,38,135,0.15);
        }

        .liquid-footer::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(circle at 8% 20%, rgba(0,102,204,0.35) 0%, rgba(0,102,204,0.12) 25%, transparent 55%),
            radial-gradient(circle at 92% 60%, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0.10) 25%, transparent 55%),
            radial-gradient(circle at 50% 115%, rgba(6,182,212,0.28) 0%, rgba(6,182,212,0.10) 25%, transparent 55%);
          animation: liquid-footer-float 24s ease-in-out infinite;
          will-change: transform;
        }

        /* ─── Link colors — brighter on liquid glass ─── */
        .liquid-footer a {
          color: #cbd5e1;
          transition: color 0.15s ease;
        }
        .liquid-footer a:hover {
          color: #ffffff;
        }

        /* ─── Column headings — crisp on glass ───────── */
        .liquid-footer h4 {
          color: #ffffff !important;
        }

        /* ─── Social icon buttons — liquid glass ─────── */
        .liquid-footer .liquid-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: #f3f4f6 !important;
          border: 1px solid rgba(255,255,255,0.35);
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.22) 0%,
            rgba(255,255,255,0.08) 100%
          );
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 2px 10px rgba(0,0,0,0.18);
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .liquid-footer .liquid-social-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.65);
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.32) 0%,
            rgba(255,255,255,0.14) 100%
          );
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.5),
            0 6px 20px rgba(0,0,0,0.28);
        }
        .liquid-footer .liquid-social-btn:active {
          transform: translateY(0) scale(0.96);
        }

        /* ─── Bottom divider ──────────────────────────── */
        .liquid-footer .liquid-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.18);
        }

        /* ─── Reduced motion ──────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .liquid-footer::before { animation: none !important; }
          .liquid-footer .liquid-social-btn {
            transition: none !important;
          }
          .liquid-footer .liquid-social-btn:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div className="container">
        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '30px',
          marginBottom: '30px',
        }}>
          {/* About Us */}
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>BuyUk Used</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/about">About Us</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/how-it-works">How It Works</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>For Sellers</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/for-sellers">Overview</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/post-ad">Post Free Ad</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/for-sellers/pricing">Pricing</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/for-sellers/tips">Tips</Link></li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>For Buyers</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/for-buyers">Overview</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/products">Browse Ads</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/for-buyers/safety-tips">Safety Tips</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/for-buyers/report-ad">Report Ad</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/support">Help Center</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/support#call-us">Call Us</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/support#email">Email</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/support#whatsapp">WhatsApp</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/terms">Terms</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/privacy">Privacy</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/cookies">Cookies</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/cookies">Version 0.09</Link></li>
            </ul>
          </div>
        </div>

        <div className="bottom liquid-footer-bottom" style={{
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
              className="liquid-social-btn"
            >
              <i className="fab fa-facebook-f"></i>
            </a>

            <a
              href="https://www.instagram.com/nana_skatty/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="liquid-social-btn"
            >
              <i className="fab fa-instagram"></i>
            </a>

            <a
              href="https://x.com/knsmartgadgets"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="liquid-social-btn"
            >
              <i className="fab fa-twitter"></i>
            </a>

            <a
              href="https://www.youtube.com/@KnsmartGadgetshub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="liquid-social-btn"
            >
              <i className="fab fa-youtube"></i>
            </a>

            <a
              href="https://www.tiktok.com/@kn.smart.gadgets"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="liquid-social-btn"
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