import React, { useEffect, useRef } from 'react';

const FloatingPhone = () => {
  const phoneRef = useRef(null);

  // Subtle parallax on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!phoneRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      phoneRef.current.style.transform = `translate(${x}px, ${y}px) scale(1)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={phoneRef}
      className="floating-phone"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        zIndex: 999,
        width: '80px',
        height: '160px',
        transformOrigin: 'bottom center',
        animation: 'phoneDance 1s ease-in-out infinite',
        transition: 'transform 0.1s ease-in-out',
        cursor: 'pointer',
        filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.3))',
      }}
      onClick={() => window.open('https://wa.me/233542928081', '_blank')}
      title="Chat with us on WhatsApp"
    >
      {/* Phone Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
          borderRadius: '20px',
          padding: '6px',
          boxShadow: 'inset 0 0 0 2px #2d2d44, 0 8px 24px rgba(0,0,0,0.4)',
          border: '1.5px solid #333366',
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Background glow effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'radial-gradient(circle at 30% 40%, rgba(46, 204, 113, 0.12), transparent 60%), radial-gradient(circle at 70% 60%, rgba(0, 85, 165, 0.12), transparent 60%)',
              animation: 'screenGlow 1s ease-in-out infinite',
            }}
          />

          {/* App Icon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 3px 10px rgba(46, 204, 113, 0.4)',
              zIndex: 1,
              animation: 'iconPulse 1s ease-in-out infinite',
            }}
          >
            K
          </div>

          {/* App Name */}
          <div
            style={{
              color: 'white',
              fontSize: '8px',
              fontWeight: 600,
              marginTop: '4px',
              opacity: 0.9,
              zIndex: 1,
              letterSpacing: '0.5px',
            }}
          >
            KN Ads
          </div>

          {/* Notification dot */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              width: '6px',
              height: '6px',
              background: '#e74c3c',
              borderRadius: '50%',
              animation: 'notifPulse 0.1s ease-in-out infinite',
              zIndex: 2,
            }}
          />

          {/* Bottom bar (like iOS home indicator) */}
          <div
            style={{
              position: 'absolute',
              bottom: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '2px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '2px',
            }}
          />

          {/* Floating bubbles */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '8px',
              width: '4px',
              height: '4px',
              background: 'rgba(46, 204, 113, 0.5)',
              borderRadius: '50%',
              animation: 'bubbleFloat 1s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: '8px',
              width: '3px',
              height: '3px',
              background: 'rgba(0, 85, 165, 0.5)',
              borderRadius: '50%',
              animation: 'bubbleFloat 1s ease-in-out infinite 1s',
            }}
          />
        </div>
      </div>

      {/* Outer glow ring */}
      <div
        style={{
          position: 'absolute',
          bottom: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '14px',
          background: 'radial-gradient(ellipse, rgba(46, 204, 113, 0.25), transparent 70%)',
          borderRadius: '50%',
          animation: 'glowPulse 1s ease-in-out infinite',
        }}
      />
    </div>
  );
};

export default FloatingPhone;