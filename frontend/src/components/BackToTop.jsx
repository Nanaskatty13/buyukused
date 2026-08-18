import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * BackToTop - A floating button that appears after scrolling past a threshold.
 * Clicking it smoothly scrolls the window to the top.
 */
const BackToTop = ({
  threshold = 300,
  className = '',
  style = {},
  children = '↑',
  smooth = true,
  showOnMount = false,
  ariaLabel = 'Back to top',
}) => {
  const [visible, setVisible] = useState(showOnMount);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > threshold;
      if (visible !== shouldShow) {
        setVisible(shouldShow);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, visible]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`back-to-top ${className}`}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '3.5rem',
        height: '3.5rem',
        padding: 0,
        fontSize: '1.8rem',
        fontWeight: 'bold',
        lineHeight: 1,
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
        ...style,
      }}
      aria-label={ariaLabel}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.backgroundColor = '#0056b3';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = style.backgroundColor || '#007bff';
      }}
    >
      {children}
    </button>
  );
};

BackToTop.propTypes = {
  threshold: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  smooth: PropTypes.bool,
  showOnMount: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

BackToTop.defaultProps = {
  threshold: 300,
  className: '',
  style: {},
  children: '↑',
  smooth: true,
  showOnMount: false,
  ariaLabel: 'Back to top',
};

export default BackToTop;