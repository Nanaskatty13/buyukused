// frontend/src/components/TickerBar.jsx
// Scrolling ticker – "HOW TO SELL" with a gentle marquee

import React from "react";

const TickerBar = () => {
  const message = "🔥 HOW TO SELL – List your item in 3 easy steps: snap a photo, set a price, and publish!";

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        <span>{message}</span>
        <span>{message}</span>
      </div>
      <style>{`
        .ticker-bar {
          background: #0055a5 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 4px 0;
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          position: relative;
          z-index: 99;
          display: block !important;
        }
        .ticker-track {
          display: inline-block;
          animation: ticker-scroll 28s linear infinite;
          will-change: transform;
        }
        .ticker-track span {
          display: inline-block;
          padding-right: 60px;
          font-size: 13px;
          font-style: italic;
          color: #ffffff !important;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-bar:hover .ticker-track {
          animation-play-state: paused;
        }
        @media (max-width: 640px) {
          .ticker-bar { padding: 2px 0; }
          .ticker-track span { font-size: 11px; }
        }
      `}</style>
    </div>
  );
};

export default TickerBar;