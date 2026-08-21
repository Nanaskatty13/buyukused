// ============================================================
// frontend/src/components/RobotGreeter.jsx
// ============================================================

import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
} from "react";

// ============================================================
// LAZY LOAD ROBOT
// ============================================================

const RobotCanvas = lazy(() => import("./RobotCanvas"));

// ============================================================
// COMPONENT
// ============================================================

export default function RobotGreeter() {
  const [visible, setVisible] = useState(false);
  const [robotError, setRobotError] = useState(false);

  // ==========================================================
  // SHOW ONLY ONCE PER SESSION
  // ==========================================================

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem(
        "robotGreeterSeen"
      );

      if (!hasSeen) {
        setVisible(true);

        sessionStorage.setItem(
          "robotGreeterSeen",
          "true"
        );
      }
    } catch (error) {
      console.warn(
        "RobotGreeter sessionStorage unavailable:",
        error
      );

      // If sessionStorage is unavailable, still show it.
      setVisible(true);
    }
  }, []);

  // ==========================================================
  // HIDDEN
  // ==========================================================

  if (!visible) {
    return null;
  }

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    setVisible(false);
  };

  // ==========================================================
  // ROBOT ERROR FALLBACK
  // ==========================================================

  const handleRobotError = () => {
    console.error(
      "RobotCanvas failed to load."
    );

    setRobotError(true);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div style={styles.overlay}>

      {/* ======================================================
          SPEECH BUBBLE
      ====================================================== */}

      <div style={styles.bubble}>
        <span style={styles.text}>
          👋 WELCOME TO BUYUKUSED
        </span>

        <button
          type="button"
          style={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close welcome message"
        >
          ✕
        </button>
      </div>

      {/* ======================================================
          ROBOT
      ====================================================== */}

      {!robotError && (
        <div style={styles.canvasWrapper}>
          <ErrorBoundary
            onError={handleRobotError}
          >
            <Suspense
              fallback={
                <div style={styles.loading}>
                  Loading robot...
                </div>
              }
            >
              <RobotCanvas />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ERROR BOUNDARY
// ============================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "RobotCanvas error:",
      error
    );

    console.error(
      "RobotCanvas error info:",
      errorInfo
    );

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",

    pointerEvents: "none",

    zIndex: 9999,
  },

  // ==========================================================
  // ROBOT CANVAS
  // ==========================================================

  canvasWrapper: {
    width: "280px",
    height: "280px",

    position: "absolute",

    bottom: "30px",
    right: "30px",

    pointerEvents: "auto",

    background: "rgba(0, 0, 0, 0.05)",

    borderRadius: "50%",

    overflow: "hidden",

    boxShadow:
      "0 8px 32px rgba(0, 0, 0, 0.25)",
  },

  // ==========================================================
  // SPEECH BUBBLE
  // ==========================================================

  bubble: {
    position: "absolute",

    top: "20%",
    left: "50%",

    transform: "translateX(-50%)",

    background: "#ffffff",

    padding: "16px 32px",

    borderRadius: "40px",

    boxShadow:
      "0 8px 32px rgba(0, 0, 0, 0.2)",

    display: "flex",

    alignItems: "center",

    gap: "16px",

    pointerEvents: "auto",

    border:
      "2px solid #ff6b6b",

    maxWidth: "90vw",
  },

  // ==========================================================
  // TEXT
  // ==========================================================

  text: {
    fontSize: "1.5rem",

    fontWeight: "bold",

    color: "#333333",

    fontFamily:
      "Arial, sans-serif",

    whiteSpace: "nowrap",
  },

  // ==========================================================
  // CLOSE BUTTON
  // ==========================================================

  closeBtn: {
    background: "transparent",

    border: "none",

    fontSize: "1.2rem",

    cursor: "pointer",

    color: "#999999",

    padding: "4px 8px",

    borderRadius: "50%",
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loading: {
    color: "#555555",

    fontSize: "1rem",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    height: "100%",

    width: "100%",
  },
};