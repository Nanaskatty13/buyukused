// frontend/src/components/BackToTop.jsx

import React, { useEffect, useState } from "react";

/**
 * BackToTop
 *
 * Floating button that appears after the user scrolls
 * past the configured threshold.
 */
const BackToTop = ({
  threshold = 300,
  className = "",
  style = {},
  children = "↑",
  smooth = true,
  showOnMount = false,
  ariaLabel = "Back to top",
}) => {
  const [visible, setVisible] =
    useState(showOnMount);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(
        window.scrollY > threshold
      );
    };

    // Check current position immediately.
    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth
        ? "smooth"
        : "auto",
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`back-to-top ${className}`}
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        width: "3.5rem",
        height: "3.5rem",

        padding: 0,

        fontSize: "1.8rem",
        fontWeight: "bold",
        lineHeight: 1,

        backgroundColor: "#007bff",
        color: "#fff",

        border: "none",
        borderRadius: "50%",

        cursor: "pointer",

        boxShadow:
          "0 4px 12px rgba(0, 0, 0, 0.25)",

        transition:
          "transform 0.2s ease, background-color 0.2s ease",

        ...style,
      }}
      aria-label={ariaLabel}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          "scale(1.1)";

        event.currentTarget.style.backgroundColor =
          "#0056b3";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "scale(1)";

        event.currentTarget.style.backgroundColor =
          style.backgroundColor ||
          "#007bff";
      }}
    >
      {children}
    </button>
  );
};

export default BackToTop;