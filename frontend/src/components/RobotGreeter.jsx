// frontend/src/components/RobotGreeter.jsx
// ============================================================
// BUYUKUSED ROBOT GREETER
// Floating robot + voice greeting
// ============================================================

import React, {
  useEffect,
  useState,
  Suspense,
  lazy,
} from "react";

const RobotCanvas = lazy(
  () => import("./RobotCanvas")
);

export default function RobotGreeter() {

  const [visible, setVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // ==========================================================
  // SHOW ONCE PER SESSION
  // ==========================================================

  useEffect(() => {

    try {

      const hasSeen =
        sessionStorage.getItem(
          "buyukusedRobotSeen"
        );

      if (!hasSeen) {

        setVisible(true);

        sessionStorage.setItem(
          "buyukusedRobotSeen",
          "true"
        );

      }

    } catch (error) {

      console.warn(
        "Robot sessionStorage unavailable:",
        error
      );

      setVisible(true);
    }

  }, []);

  // ==========================================================
  // SPEAK
  // ==========================================================

  useEffect(() => {

    if (!visible) return;

    // Give the robot a moment to appear
    const timer = setTimeout(() => {

      speakWelcome();

    }, 900);

    return () => {

      clearTimeout(timer);

      if (
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }

    };

  }, [visible]);

  // ==========================================================
  // WELCOME VOICE
  // ==========================================================

  const speakWelcome = () => {

    if (
      !("speechSynthesis" in window)
    ) {

      console.warn(
        "Speech synthesis is not supported."
      );

      return;
    }

    window.speechSynthesis.cancel();

    const message =
      new SpeechSynthesisUtterance(
        "Welcome to BuyUKUsed. Find great deals, buy with confidence, and enjoy your shopping experience."
      );

    message.rate = 0.88;
    message.pitch = 1.05;
    message.volume = 1;

    message.onstart = () => {
      setSpeaking(true);
    };

    message.onend = () => {
      setSpeaking(false);
    };

    message.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(
      message
    );
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const closeRobot = () => {

    setVisible(false);

    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

  };

  // ==========================================================
  // HIDDEN
  // ==========================================================

  if (!visible) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div style={styles.overlay}>

      {/* ====================================================
          SPEECH BUBBLE
      ==================================================== */}

      <div style={styles.bubble}>

        <div style={styles.bubbleContent}>

          <div style={styles.robotName}>
            🤖 BUYUKUSED
          </div>

          <div style={styles.message}>
            {speaking
              ? "🔊 Welcome to BuyUKUsed..."
              : "👋 Welcome to BuyUKUsed!"}
          </div>

        </div>

        <button
          type="button"
          onClick={closeRobot}
          style={styles.closeButton}
          aria-label="Close robot"
        >
          ×
        </button>

      </div>

      {/* ====================================================
          ROBOT
      ==================================================== */}

      <div style={styles.robotContainer}>

        <Suspense
          fallback={
            <div style={styles.loading}>
              <div style={styles.loadingRobot}>
                🤖
              </div>

              <span>
                Loading...
              </span>
            </div>
          }
        >

          <RobotCanvas />

        </Suspense>

      </div>

      {/* ====================================================
          REPLAY BUTTON
      ==================================================== */}

      <button
        type="button"
        onClick={speakWelcome}
        style={styles.speakButton}
        aria-label="Play welcome message"
      >
        🔊
      </button>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  overlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: 9999,
  },

  bubble: {
    position: "absolute",
    right: "35px",
    bottom: "330px",

    display: "flex",
    alignItems: "center",

    minWidth: "280px",
    maxWidth: "390px",

    padding: "18px 22px",

    background:
      "rgba(255, 255, 255, 0.97)",

    border:
      "1px solid rgba(37, 99, 235, 0.18)",

    borderRadius: "22px",

    boxShadow:
      "0 18px 60px rgba(0, 0, 0, 0.18)",

    pointerEvents: "auto",

    backdropFilter: "blur(14px)",

    animation:
      "buyukusedRobotBubble 0.5s ease-out",
  },

  bubbleContent: {
    flex: 1,
  },

  robotName: {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.2px",
    color: "#2563eb",
    marginBottom: "6px",
  },

  message: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827",
    lineHeight: 1.4,
  },

  closeButton: {
    width: "32px",
    height: "32px",

    marginLeft: "12px",

    border: "none",
    borderRadius: "50%",

    background: "#f3f4f6",
    color: "#6b7280",

    fontSize: "22px",
    lineHeight: "1",

    cursor: "pointer",

    pointerEvents: "auto",
  },

  robotContainer: {
    position: "absolute",

    right: "20px",
    bottom: "15px",

    width: "300px",
    height: "300px",

    pointerEvents: "auto",

    borderRadius: "50%",

    overflow: "hidden",

    background:
      "radial-gradient(circle at center, rgba(37,99,235,0.12), rgba(255,255,255,0) 70%)",

    filter:
      "drop-shadow(0 20px 25px rgba(0,0,0,0.15))",
  },

  loading: {
    width: "100%",
    height: "100%",

    display: "flex",
    flexDirection: "column",

    alignItems: "center",
    justifyContent: "center",

    color: "#374151",

    fontSize: "13px",
    fontWeight: "600",
  },

  loadingRobot: {
    fontSize: "50px",
    marginBottom: "8px",
  },

  speakButton: {
    position: "absolute",

    right: "255px",
    bottom: "35px",

    width: "46px",
    height: "46px",

    border: "none",
    borderRadius: "50%",

    background: "#2563eb",
    color: "#ffffff",

    fontSize: "20px",

    cursor: "pointer",

    pointerEvents: "auto",

    boxShadow:
      "0 8px 25px rgba(37,99,235,0.35)",
  },

};