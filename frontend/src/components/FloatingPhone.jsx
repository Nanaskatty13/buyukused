// frontend/src/components/FloatingPhone.jsx
// Converted from floating phone → floating advertising display

import React, { useEffect, useRef, useState } from 'react';

// ============================================================
// AD ROTATION CONTENT
// ============================================================

const AD_MESSAGES = [
  { line1: 'ADVERTISE', line2: 'HERE' },
  // { line1: 'BEST PRICES', line2: 'IN GHANA' },
  // { line1: 'NEW ARRIVALS', line2: 'EVERY DAY' },
  // { line1: 'CHAT US ON', line2: 'WHATSAPP' },
];

const FloatingPhone = () => {
  const phoneRef = useRef(null);

  // Store absolute top and left positions
  const [position, setPosition] = useState({ left: 20, top: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const dragRef = useRef({
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
  });

  // ============================================================
  // ROTATE AD MESSAGES
  // ============================================================

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % AD_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible]);

  // ============================================================
  // INITIAL POSITION: bottom:80px, left:20px
  // ============================================================

  useEffect(() => {
    const initialTop = window.innerHeight - 88 - 80;
    setPosition({ left: 20, top: initialTop });
  }, []);

  // ============================================================
  // CLAMP POSITION ON RESIZE
  // ============================================================

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

  // ============================================================
  // DRAG: START
  // ============================================================

  const handleStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    const el = phoneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    dragRef.current = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
      isDragging: true,
    };
    setIsDragging(true);
    e.preventDefault();
  };

  // ============================================================
  // DRAG: MOVE
  // ============================================================

  const handleMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const { offsetX, offsetY } = dragRef.current;

    let newLeft = touch.clientX - offsetX;
    let newTop = touch.clientY - offsetY;

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

  // ============================================================
  // DRAG: END
  // ============================================================

  const handleEnd = () => {
    dragRef.current.isDragging = false;
    setIsDragging(false);
  };

  // ============================================================
  // GLOBAL DRAG LISTENERS
  // ============================================================

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

  // ============================================================
  // CLICK (only if not dragging) → open WhatsApp
  // ============================================================

  const handleClick = () => {
    if (dragRef.current.isDragging) return;
    window.open('https://wa.me/233542928081', '_blank');
  };

  // ============================================================
  // CLOSE (dismiss ad)
  // ============================================================

  const handleClose = (e) => {
    // Prevent drag start + WhatsApp open + drag end on the widget
    e.stopPropagation();
    e.preventDefault();
    dragRef.current.isDragging = false;
    setIsDragging(false);
    setVisible(false);
  };

  if (!visible) return null;

  const { left, top } = position;
  const ad = AD_MESSAGES[msgIndex];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <style>{`
        @keyframes adGlow {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(46, 204, 113, 0.6),
              0 0 16px rgba(46, 204, 113, 0.35),
              0 8px 28px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(46, 204, 113, 0.9),
              0 0 26px rgba(46, 204, 113, 0.65),
              0 8px 28px rgba(0, 0, 0, 0.5);
          }
        }
        @keyframes adFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes adScan {
          0% { top: -2px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes adFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes adSlideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes adArrow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }

        .floating-ad-close {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(10, 10, 24, 0.95);
          border: 1px solid rgba(231, 76, 60, 0.7);
          color: #e74c3c;
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          padding: 0;
          box-shadow:
            0 0 8px rgba(231, 76, 60, 0.5),
            0 2px 6px rgba(0, 0, 0, 0.5);
          transition:
            background 0.15s ease,
            color 0.15s ease,
            transform 0.15s ease,
            border-color 0.15s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .floating-ad-close:hover {
          background: #e74c3c;
          border-color: #e74c3c;
          color: #ffffff;
          transform: scale(1.15);
        }
        .floating-ad-close:active {
          transform: scale(0.92);
        }
      `}</style>

      <div
        ref={phoneRef}
        className="floating-ad"
        style={{
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          zIndex: 999,
          width: '90px',
          height: '150px',
          transformOrigin: 'center center',
          animation: isDragging ? 'none' : 'adFloat 3s ease-in-out infinite',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onClick={handleClick}
        title="Chat with us on WhatsApp"
      >
        {/* ============================================
            CLOSE BUTTON — dismiss the ad
        ============================================ */}
        <button
          type="button"
          className="floating-ad-close"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={handleClose}
          aria-label="Close ad"
          title="Close this ad"
        >
          ×
        </button>

        {/* ============================================
            BILLBOARD FRAME (glowing green border)
        ============================================ */}
        <div
          style={{
            width: '90%',
            height: '100%',
            borderRadius: '12px',
            padding: '3px',
            background: 'linear-gradient(145deg, #0a0a18, #12122a)',
            animation: 'adGlow 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        >
          {/* ============================================
              SCREEN
          ============================================ */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '9px',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              padding: '6px 8px',
              background:
                'linear-gradient(135deg, #0f3460 0%, #16213e 60%, #0a0a18 100%)',
            }}
          >
            {/* Grid background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(46,204,113,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(46,204,113,0.07) 1px, transparent 1px)',
                backgroundSize: '10px 10px',
                pointerEvents: 'none',
              }}
            />

            {/* Moving scanline */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '1.5px',
                background:
                  'linear-gradient(90deg, transparent, rgba(46,204,113,0.8), transparent)',
                animation: 'adScan 3s linear infinite',
                pointerEvents: 'none',
              }}
            />

            {/* ==========================================
                TOP ROW — AD badge + LIVE indicator
            ========================================== */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  fontSize: '7px',
                  fontWeight: 900,
                  color: '#0a0a18',
                  background: '#2ecc71',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  letterSpacing: '0.6px',
                  boxShadow: '0 0 6px rgba(46,204,113,0.6)',
                }}
              >
                AD
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#e74c3c',
                    boxShadow: '0 0 6px #e74c3c',
                    animation: 'adFlash 1s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: '6.5px',
                    fontWeight: 800,
                    color: '#e74c3c',
                    letterSpacing: '0.5px',
                  }}
                >
                  LIVE
                </span>
              </div>
            </div>

            {/* ==========================================
                MESSAGE — rotates every 3s
            ========================================== */}
            <div
              key={msgIndex}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                zIndex: 1,
                animation: 'adSlideIn 0.4s ease-out',
                marginTop: '1px',
              }}
            >
              <div
                style={{
                  fontSize: '7px',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '1.2px',
                  marginBottom: '1px',
                }}
              >
                {ad.line1}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '0.5px',
                  lineHeight: 1,
                  textShadow:
                    '0 0 12px rgba(46,204,113,0.7), 0 0 4px rgba(46,204,113,0.5)',
                }}
              >
                {ad.line2}
              </div>
            </div>

            {/* ==========================================
                CTA BAR
            ========================================== */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 1,
                fontSize: '7px',
                fontWeight: 800,
                color: '#2ecc71',
                letterSpacing: '0.4px',
                borderTop: '1px solid rgba(46,204,113,0.2)',
                paddingTop: '3px',
              }}
            >
              <span>Chat on WhatsApp</span>
              <span
                style={{
                  animation: 'adArrow 1.2s ease-in-out infinite',
                }}
              >
                →
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingPhone;