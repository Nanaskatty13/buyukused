// ============================================================
// BUYUKUSED PANDA GREETER
// Automatic welcome image + automatic voice
// ============================================================

import React, { useEffect, useRef, useState } from "react";

// ============================================================
// COMPONENT
// ============================================================

export default function RobotGreeter() {
  const [visible, setVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const hideTimerRef = useRef(null);
  const speechStartedRef = useRef(false);

  // ==========================================================
  // WELCOME MESSAGE
  // ==========================================================

  const welcomeMessage =
    "Welcome to BuyUKUsed. Find great deals, buy with confidence, and enjoy your shopping experience.";

  // ==========================================================
  // CLEANUP
  // ==========================================================

  const cleanupSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
    speechStartedRef.current = false;
  };

  // ==========================================================
  // HIDE PANDA
  // ==========================================================

  const hidePanda = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    cleanupSpeech();

    setVisible(false);
  };

  // ==========================================================
  // SPEAK WELCOME
  // ==========================================================

  const speakWelcome = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      console.warn(
        "Speech synthesis is not supported by this browser."
      );

      // Still hide the panda after a few seconds
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return;
    }

    // Prevent duplicate speech
    if (speechStartedRef.current) {
      return;
    }

    speechStartedRef.current = true;

    // Cancel anything already speaking
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        welcomeMessage
      );

    // ========================================================
    // VOICE SETTINGS
    // ========================================================

    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Try to use an English voice
    const voices =
      window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang === "en-US"
      ) ||
      voices.find(
        (voice) =>
          voice.lang.startsWith("en-")
      );

    if (preferredVoice) {
      utterance.voice =
        preferredVoice;
    }

    // ========================================================
    // SPEECH START
    // ========================================================

    utterance.onstart = () => {
      setSpeaking(true);
    };

    // ========================================================
    // SPEECH FINISHED
    // ========================================================

    utterance.onend = () => {
      setSpeaking(false);
      speechStartedRef.current = false;

      // Give the user a small moment to see the panda
      hideTimerRef.current =
        setTimeout(() => {
          setVisible(false);
        }, 1200);
    };

    // ========================================================
    // SPEECH ERROR
    // ========================================================

    utterance.onerror = (event) => {
      console.warn(
        "Welcome speech error:",
        event
      );

      setSpeaking(false);
      speechStartedRef.current = false;

      // Don't leave the panda stuck on screen
      hideTimerRef.current =
        setTimeout(() => {
          setVisible(false);
        }, 3000);
    };

    // ========================================================
    // SPEAK
    // ========================================================

    window.speechSynthesis.speak(
      utterance
    );
  };

  // ==========================================================
  // SHOW GREETER ONCE PER SESSION
  // ==========================================================

  useEffect(() => {
    try {
      const hasSeen =
        sessionStorage.getItem(
          "buyukusedPandaGreeterSeen"
        );

      if (hasSeen) {
        return;
      }

      // Mark as seen immediately
      sessionStorage.setItem(
        "buyukusedPandaGreeterSeen",
        "true"
      );

      setVisible(true);
    } catch (error) {
      console.warn(
        "sessionStorage unavailable:",
        error
      );

      // If storage isn't available,
      // still show the panda.
      setVisible(true);
    }
  }, []);

  // ==========================================================
  // START AUTOMATIC VOICE
  // ==========================================================

  useEffect(() => {
    if (!visible) {
      return;
    }

    // Wait for panda animation to appear
    const timer = setTimeout(() => {
      speakWelcome();
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [visible]);

  // ==========================================================
  // LOAD VOICES
  // ==========================================================

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    // Some browsers load voices asynchronously.
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      handleVoicesChanged
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged
      );
    };
  }, []);

  // ==========================================================
  // CLEANUP WHEN COMPONENT UNMOUNTS
  // ==========================================================

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
    <>
      <div
        className={`buyukused-panda-greeter ${
          speaking
            ? "buyukused-panda-speaking"
            : ""
        }`}
      >

        {/* ==================================================
            SPEECH BUBBLE
        ================================================== */}

        <div className="buyukused-panda-bubble">

          <div className="buyukused-panda-brand">
            BUYUKUSED
          </div>

          <div className="buyukused-panda-message">
            {speaking
              ? "Welcome to BuyUKUsed 👋"
              : "Welcome! 👋"}
          </div>

        </div>

        {/* ==================================================
            PANDA
        ================================================== */}

        <div className="buyukused-panda-image-wrapper">

          <img
            src="/panda.png"
            alt="BuyUKUsed welcome panda"
            className="buyukused-panda-image"
          />

        </div>

      </div>

      {/* ====================================================
          STYLES
      ==================================================== */}

      <style>{`

        /* ==================================================
           MAIN CONTAINER
        ================================================== */

        .buyukused-panda-greeter {
          position: fixed;

          right: 28px;
          bottom: 24px;

          width: 320px;

          display: flex;
          flex-direction: column;
          align-items: center;

          z-index: 99999;

          pointer-events: none;

          animation:
            buyukusedPandaAppear
            0.65s
            cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }


        /* ==================================================
           SPEAKING ANIMATION
        ================================================== */

        .buyukused-panda-speaking
        .buyukused-panda-image {
          animation:
            buyukusedPandaFloat
            1.8s
            ease-in-out
            infinite;
        }


        /* ==================================================
           SPEECH BUBBLE
        ================================================== */

        .buyukused-panda-bubble {
          position: relative;

          width: 270px;

          padding: 16px 20px;

          margin-bottom: -5px;

          background:
            rgba(255, 255, 255, 0.97);

          border:
            1px solid
            rgba(37, 99, 235, 0.14);

          border-radius: 20px;

          box-shadow:
            0 18px 55px
            rgba(0, 0, 0, 0.16);

          backdrop-filter:
            blur(14px);

          -webkit-backdrop-filter:
            blur(14px);

          text-align: center;

          animation:
            buyukusedBubbleAppear
            0.55s
            0.15s
            ease-out
            both;
        }


        /* Bubble little tail */

        .buyukused-panda-bubble::after {
          content: "";

          position: absolute;

          left: 50%;

          bottom: -10px;

          transform:
            translateX(-50%)
            rotate(45deg);

          width: 20px;
          height: 20px;

          background:
            rgba(255, 255, 255, 0.97);

          border-right:
            1px solid
            rgba(37, 99, 235, 0.10);

          border-bottom:
            1px solid
            rgba(37, 99, 235, 0.10);
        }


        /* ==================================================
           BRAND
        ================================================== */

        .buyukused-panda-brand {
          font-size: 11px;

          font-weight: 900;

          letter-spacing: 1.5px;

          color: #2563eb;

          margin-bottom: 6px;
        }


        /* ==================================================
           MESSAGE
        ================================================== */

        .buyukused-panda-message {
          font-size: 17px;

          font-weight: 700;

          line-height: 1.4;

          color: #111827;
        }


        /* ==================================================
           IMAGE WRAPPER
        ================================================== */

        .buyukused-panda-image-wrapper {
          width: 260px;
          height: 260px;

          display: flex;

          align-items: flex-end;
          justify-content: center;

          overflow: visible;

          margin-top: 5px;

          filter:
            drop-shadow(
              0 20px 24px
              rgba(0, 0, 0, 0.18)
            );
        }


        /* ==================================================
           PANDA IMAGE
        ================================================== */

        .buyukused-panda-image {
          width: 100%;
          height: 100%;

          object-fit: contain;

          display: block;

          user-select: none;

          -webkit-user-drag: none;

          transition:
            transform 0.3s ease;
        }


        /* ==================================================
           APPEAR
        ================================================== */

        @keyframes buyukusedPandaAppear {

          from {
            opacity: 0;

            transform:
              translateY(35px)
              scale(0.85);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* ==================================================
           BUBBLE APPEAR
        ================================================== */

        @keyframes buyukusedBubbleAppear {

          from {
            opacity: 0;

            transform:
              translateY(15px)
              scale(0.92);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* ==================================================
           PANDA FLOAT
        ================================================== */

        @keyframes buyukusedPandaFloat {

          0% {
            transform:
              translateY(0)
              rotate(0deg);
          }

          50% {
            transform:
              translateY(-9px)
              rotate(-1deg);
          }

          100% {
            transform:
              translateY(0)
              rotate(0deg);
          }

        }


        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 640px) {

          .buyukused-panda-greeter {
            right: 10px;
            bottom: 12px;

            width: 240px;
          }

          .buyukused-panda-bubble {
            width: 215px;

            padding:
              13px 15px;

            border-radius: 17px;
          }

          .buyukused-panda-brand {
            font-size: 9px;
          }

          .buyukused-panda-message {
            font-size: 14px;
          }

          .buyukused-panda-image-wrapper {
            width: 200px;
            height: 200px;
          }

        }

      `}</style>
    </>
  );
}