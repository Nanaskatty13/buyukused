import React from 'react';

const SoldBadge = ({ variant = 'card', className = '' }) => {
  // 'card' = small pill badge on product cards
  // 'ribbon' = dramatic diagonal ribbon on product details page

  if (variant === 'ribbon') {
    return (
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '-45px',
          transform: 'rotate(-45deg)',
          background: '#dc2626',
          color: 'white',
          padding: '10px 70px',
          fontSize: '28px',
          fontWeight: 800,
          letterSpacing: '3px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          zIndex: 20,
          textTransform: 'uppercase',
          textAlign: 'center',
          width: '300px',
          pointerEvents: 'none',
          userSelect: 'none',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
        className={className}
      >
        SOLD
      </div>
    );
  }

  // Default: 'card' variant (clean pill badge)
  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: '#dc2626',
        color: 'white',
        padding: '5px 16px',
        borderRadius: '4px',
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '1px',
        zIndex: 10,
        boxShadow: '0 2px 10px rgba(220, 38, 38, 0.4)',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      className={className}
    >
      SOLD
    </div>
  );
};

export default SoldBadge;