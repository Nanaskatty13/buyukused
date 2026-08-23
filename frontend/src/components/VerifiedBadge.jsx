// frontend/src/components/VerifiedBadge.jsx
import React from 'react';

const VerifiedBadge = ({ size = 20, showLabel = false }) => {
  return (
    <span
      className="verified-badge"
      title="Verified Seller"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        marginLeft: '4px',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="10" fill="#1DA1F2" />
        <path
          d="M7.5 10.5L9.5 12.5L14 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel && (
        <span style={{ fontSize: '12px', color: '#1DA1F2', fontWeight: 500 }}>
          Verified
        </span>
      )}
    </span>
  );
};

export default VerifiedBadge;