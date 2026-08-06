import React from 'react';

const FloatingWhatsApp = () => {
  const phoneNumber = '233542928081';
  const message = encodeURIComponent(
    'Hello KN Classifieds, I have a question. Can you help me?'
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 1000,
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const container = e.currentTarget;
        container.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        const container = e.currentTarget;
        container.style.transform = 'scale(1)';
      }}
    >
      {/* Text label */}
      <span
        style={{
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 500,
          backdropFilter: 'blur(4px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.3px',
        }}
      >
        <i className="fas fa-comment-dots" style={{ marginRight: '6px' }}></i>
        Message Admin
      </span>

      {/* WhatsApp Icon */}
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25D366',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '34px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      >
        <i className="fab fa-whatsapp"></i>
      </div>
    </a>
  );
};

export default FloatingWhatsApp;