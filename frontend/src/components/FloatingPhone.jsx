// frontend/src/components/FloatingPhone.jsx

import React, { useEffect, useRef, useState } from 'react';

const FloatingPhone = () => {
  const phoneRef = useRef(null);
  // Store absolute top and left positions
  const [position, setPosition] = useState({ left: 20, top: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
  });

  // Set initial position: bottom:80px, left:20px
  useEffect(() => {
    const initialTop = window.innerHeight - 160 - 80; // height=160, bottom=80
    setPosition({ left: 20, top: initialTop });
  }, []);

  // Clamp position to viewport on resize
  useEffect(() => {
    const clampPosition = () => {
      const el = phoneRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      setPosition((prev) => ({
        left: Math.max(0, Math.min(prev.left, maxX)),
        top: Math.max(0, Math.min(prev.top, maxY)),
      }));
    };
    window.addEventListener('resize', clampPosition);
    return () => window.removeEventListener('resize', clampPosition);
  }, []);

  // Start drag
  const handleStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    const el = phoneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Store offset from the touch point to the element's top-left corner
    dragRef.current = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
      isDragging: true,
    };
    setIsDragging(true);
    e.preventDefault();
  };

  // Move drag
  const handleMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const { offsetX, offsetY } = dragRef.current;

    let newLeft = touch.clientX - offsetX;
    let newTop = touch.clientY - offsetY;

    // Clamp to viewport
    const el = phoneRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      newLeft = Math.max(0, Math.min(newLeft, maxX));
      newTop = Math.max(0, Math.min(newTop, maxY));
    }

    setPosition({ left: newLeft, top: newTop });
    e.preventDefault();
  };

  // End drag
  const handleEnd = () => {
    dragRef.current.isDragging = false;
    setIsDragging(false);
  };

  // Global listeners
  useEffect(() => {
    if (isDragging) {
      const onMove = (e) => handleMove(e);
      const onEnd = () => handleEnd();
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
      return () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
      };
    }
  }, [isDragging]);

  // Click only if not dragging
  const handleClick = (e) => {
    if (dragRef.current.isDragging) return;
    window.open('https://wa.me/233542928081', '_blank');
  };

  // If position.top is 0 (not initialised yet), don't render until set
  if (position.top === 0 && position.left === 20) {
    // still allow render but may flash; better to wait for initialisation.
    // We'll render with a default top that will be overwritten.
  }

  const { left, top } = position;

  return (
    <div
      ref={phoneRef}
      className="floating-phone"
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 999,
        width: '80px',
        height: '160px',
        transformOrigin: 'bottom center',
        animation: isDragging ? 'none' : 'phoneDance 1s ease-in-out infinite',
        transition: 'transform 0.1s ease-in-out',
        cursor: isDragging ? 'grabbing' : 'grab',
        filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.3))',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onClick={handleClick}
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
          pointerEvents: 'none',
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

          {/* Bottom bar */}
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