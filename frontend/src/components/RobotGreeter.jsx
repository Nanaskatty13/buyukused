// ============================================================
// frontend/src/components/RobotGreeter.jsx
// ============================================================
// BUYUKUSED PANDA GREETER
// Fast + Dynamic + Automatic Voice
// Panda speaks automatically
//
// IMPORTANT:
// Mobile browsers may block automatic speech before the user
// interacts with the page. This component tries multiple safe
// methods, but browser autoplay policy cannot be overridden.
// ============================================================

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

export default function RobotGreeter() {
  const [visible, setVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const hideTimerRef = useRef(null);
  const speakTimerRef = useRef(null);
  const retryTimerRef = useRef(null);

  const speechStartedRef = useRef(false);
  const speechFinishedRef = useRef(false);
  const mountedRef = useRef(false);

  // ==========================================================
  // WELCOME MESSAGE
  // ==========================================================

  const welcomeMessage =
    "Welcome to BuyUKUsed, your number one marketplace in Ghana, Accra. Sign up and start selling or buying today for free.";

  // ==========================================================
  // SAFE CLEAR TIMER
  // ==========================================================

  const clearAllTimers = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  // ==========================================================
  // HIDE PANDA
  // ==========================================================

  const hidePanda = () => {
    clearAllTimers();

    setSpeaking(false);

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.warn(
          "Could not cancel speech:",
          error
        );
      }
    }

    speechStartedRef.current = false;

    if (mountedRef.current) {
      setVisible(false);
    }
  };

  // ==========================================================
  // SHOW ONCE PER SESSION
  // ==========================================================

  useEffect(() => {
    mountedRef.current = true;

    let shouldShow = false;

    try {
      const alreadySeen =
        sessionStorage.getItem(
          "buyukusedPandaGreeterSeen"
        );

      if (!alreadySeen) {
        shouldShow = true;

        // IMPORTANT:
        // We don't immediately depend on this value
        // for speech. The component still attempts speech.
        sessionStorage.setItem(
          "buyukusedPandaGreeterSeen",
          "true"
        );
      }
    } catch (error) {
      console.warn(
        "sessionStorage unavailable:",
        error
      );

      shouldShow = true;
    }

    if (shouldShow && mountedRef.current) {
      // Show immediately.
      setVisible(true);
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ==========================================================
  // PRELOAD PANDA (KEPT AS PANDA.PNG)
  // ==========================================================

  useEffect(() => {
    const panda = new Image();

    panda.src = "/panda.png";

    panda.onload = () => {
      console.log(
        "🐼 BuyUKUsed panda loaded"
      );
    };

    panda.onerror = () => {
      console.warn(
        "⚠️ Could not load /panda.png"
      );
    };
  }, []);

  // ==========================================================
  // LOAD BROWSER VOICES (SIMPLIFIED)
  // ==========================================================

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const speech = window.speechSynthesis;

    // Simple voice loader without duplicate listeners
    const loadVoices = () => {
      try {
        speech.getVoices();
      } catch (error) {
        console.warn("Could not load voices:", error);
      }
    };

    // Use the legacy property to avoid duplicate events
    if (speech.onvoiceschanged !== undefined) {
      speech.onvoiceschanged = loadVoices;
    }

    // Also try immediately
    setTimeout(loadVoices, 100);

    return () => {
      speech.onvoiceschanged = null;
    };
  }, []);

  // ==========================================================
  // SELECT BEST VOICE
  // ==========================================================

  const getBestVoice = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return null;
    }

    const voices =
      window.speechSynthesis.getVoices();

    if (!voices || voices.length === 0) {
      return null;
    }

    // Prefer high-quality English voices.
    const premiumUS =
      voices.find(
        (voice) =>
          voice.lang === "en-US" &&
          /Google|Microsoft|Natural|Premium|Samantha|Daniel|Alex/i.test(
            voice.name
          )
      );

    if (premiumUS) {
      return premiumUS;
    }

    const usVoice =
      voices.find(
        (voice) =>
          voice.lang === "en-US"
      );

    if (usVoice) {
      return usVoice;
    }

    const gbVoice =
      voices.find(
        (voice) =>
          voice.lang === "en-GB"
      );

    if (gbVoice) {
      return gbVoice;
    }

    const englishVoice =
      voices.find(
        (voice) =>
          voice.lang &&
          voice.lang
            .toLowerCase()
            .startsWith("en")
      );

    return englishVoice || null;
  };

  // ==========================================================
  // SPEAK
  // ==========================================================

  const speakWelcome = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      console.warn(
        "Speech synthesis is not supported."
      );

      // Never leave panda stuck.
      hideTimerRef.current =
        setTimeout(() => {
          hidePanda();
        }, 3500);

      return false;
    }

    if (!visible) {
      return false;
    }

    if (speechStartedRef.current) {
      return true;
    }

    if (speechFinishedRef.current) {
      return true;
    }

    const speech =
      window.speechSynthesis;

    // ========================================================
    // WAKE UP SPEECH ENGINE
    // ========================================================

    try {
      speech.cancel();
    } catch (error) {
      console.warn(
        "Speech cancel failed:",
        error
      );
    }

    try {
      speech.resume();
    } catch (error) {
      console.warn(
        "Speech resume failed:",
        error
      );
    }

    // ========================================================
    // GET VOICE
    // ========================================================

    const voice = getBestVoice();

    // ========================================================
    // CREATE UTTERANCE
    // ========================================================

    const utterance =
      new SpeechSynthesisUtterance(
        welcomeMessage
      );

    // ========================================================
    // VOICE SETTINGS
    // ========================================================

    utterance.rate = 0.88;

    utterance.pitch = 1.04;

    // Browser maximum allowed volume.
    utterance.volume = 1;

    if (voice) {
      utterance.voice = voice;

      console.log(
        "🐼 Panda voice:",
        voice.name,
        voice.lang
      );
    } else {
      console.log(
        "🐼 Using browser default voice."
      );
    }

    // ========================================================
    // SPEECH START
    // ========================================================

    utterance.onstart = () => {
      if (!mountedRef.current) {
        return;
      }

      speechStartedRef.current = true;
      speechFinishedRef.current = false;

      setSpeaking(true);

      console.log(
        "🔊 BuyUKUsed panda started speaking"
      );
    };

    // ========================================================
    // SPEECH BOUNDARY
    // ========================================================

    utterance.onboundary = () => {
      if (!mountedRef.current) {
        return;
      }

      setSpeaking(true);
    };

    // ========================================================
    // SPEECH FINISHED
    // ========================================================

    utterance.onend = () => {
      if (!mountedRef.current) {
        return;
      }

      console.log(
        "🐼 BuyUKUsed panda finished speaking"
      );

      setSpeaking(false);

      speechStartedRef.current = false;
      speechFinishedRef.current = true;

      clearAllTimers();

      // Small pause after the greeting.
      hideTimerRef.current =
        setTimeout(() => {
          hidePanda();
        }, 700);
    };

    // ========================================================
    // SPEECH ERROR
    // ========================================================

    utterance.onerror = (event) => {
      console.warn(
        "🐼 Panda speech error:",
        event?.error || event
      );

      if (!mountedRef.current) {
        return;
      }

      setSpeaking(false);

      speechStartedRef.current = false;

      // Do not repeatedly retry if browser explicitly
      // blocked the speech.
      const blockedErrors = [
        "not-allowed",
        "service-not-allowed",
        "audio-busy",
        "canceled",
      ];

      if (
        event &&
        blockedErrors.includes(
          event.error
        )
      ) {
        console.warn(
          "🔇 Browser prevented automatic speech."
        );

        hideTimerRef.current =
          setTimeout(() => {
            hidePanda();
          }, 2200);

        return;
      }

      hideTimerRef.current =
        setTimeout(() => {
          hidePanda();
        }, 2200);
    };

    // ========================================================
    // SPEAK
    // ========================================================

    try {
      speech.speak(utterance);

      // Some mobile browsers pause the speech engine
      // immediately after speak().
      setTimeout(() => {
        try {
          if (
            speech.speaking &&
            speech.paused
          ) {
            speech.resume();
          }
        } catch (error) {
          console.warn(
            "Speech resume after speak failed:",
            error
          );
        }
      }, 80);

      return true;
    } catch (error) {
      console.warn(
        "Speech synthesis failed:",
        error
      );

      speechStartedRef.current = false;

      return false;
    }
  };

  // ==========================================================
  // AUTOMATIC SPEECH START
  // ==========================================================

  useEffect(() => {
    if (!visible) {
      return;
    }

    speechFinishedRef.current = false;
    speechStartedRef.current = false;

    clearAllTimers();

    // --------------------------------------------------------
    // First attempt
    // --------------------------------------------------------

    speakTimerRef.current =
      setTimeout(() => {
        speakWelcome();
      }, 80);

    // --------------------------------------------------------
    // SECOND ATTEMPT
    //
    // Useful when Chrome/Safari has not populated voices yet.
    // --------------------------------------------------------

    retryTimerRef.current =
      setTimeout(() => {
        if (
          !speechStartedRef.current &&
          !speechFinishedRef.current &&
          mountedRef.current
        ) {
          console.log(
            "🐼 Retrying panda voice..."
          );

          speakWelcome();
        }
      }, 700);

    // --------------------------------------------------------
    // FINAL SAFETY TIMER
    //
    // OPTIMIZED: Reduced from 7000ms to 4000ms
    // Prevents panda from remaining forever on phones
    // if speech is blocked.
    // --------------------------------------------------------

    hideTimerRef.current =
      setTimeout(() => {
        if (
          mountedRef.current &&
          !speechStartedRef.current
        ) {
          console.log(
            "🐼 Hiding panda because speech did not start."
          );

          hidePanda();
        }
      }, 4000);

    return () => {
      clearAllTimers();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ==========================================================
  // EXTRA VOICE RETRY WHEN BROWSER LOADS VOICES (SIMPLIFIED)
  // ==========================================================

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const speech = window.speechSynthesis;

    const handleVoicesChanged = () => {
      if (
        !visible ||
        speechStartedRef.current ||
        speechFinishedRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      console.log(
        "🐼 Voices loaded. Trying panda speech..."
      );

      clearTimeout(
        retryTimerRef.current
      );

      retryTimerRef.current =
        setTimeout(() => {
          if (
            !speechStartedRef.current &&
            !speechFinishedRef.current &&
            mountedRef.current
          ) {
            speakWelcome();
          }
        }, 100);
    };

    // Use the legacy property to avoid duplicates
    if (speech.onvoiceschanged !== undefined) {
      speech.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
      if (speech.onvoiceschanged === handleVoicesChanged) {
        speech.onvoiceschanged = null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ==========================================================
  // CLEANUP ANIMATIONS ON UNMOUNT
  // ==========================================================

  useEffect(() => {
    return () => {
      // Reset animations to prevent memory leaks
      if (typeof document !== "undefined") {
        const elements = document.querySelectorAll('.buyukused-panda-greeter *');
        elements.forEach(el => {
          el.style.animation = 'none';
        });
      }
    };
  }, []);

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      clearAllTimers();

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        try {
          window.speechSynthesis.cancel();
        } catch (error) {
          console.warn(
            "Speech cleanup failed:",
            error
          );
        }
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div
      className={`buyukused-panda-greeter ${
        speaking
          ? "is-speaking"
          : "is-entering"
      }`}
      aria-hidden="true"
    >

      {/* ====================================================
          FLOATING PARTICLES
      ==================================================== */}

      <span className="panda-particle particle-1">
        ✦
      </span>

      <span className="panda-particle particle-2">
        ✦
      </span>

      <span className="panda-particle particle-3">
        •
      </span>

      <span className="panda-particle particle-4">
        ✦
      </span>

      {/* ====================================================
          SPEECH BUBBLE
      ==================================================== */}

      <div className="panda-bubble">

        <div className="panda-bubble-top">

          <span className="panda-dot" />

          <span>
            BUYUKUSED
          </span>

        </div>

        <div className="panda-message">

          {speaking
            ? "Welcome to BuyUKUsed! 👋"
            : "Welcome! 👋"}

        </div>

        <div className="panda-submessage">

          {speaking
            ? "Your #1 marketplace in Ghana, Accra."
            : "Great deals. Trusted sellers."}

        </div>

      </div>

      {/* ====================================================
          PANDA
      ==================================================== */}

      <div className="panda-stage">

        {/* Glow */}

        <div className="panda-glow" />

        {/* ==================================================
            VOICE WAVES
        ================================================== */}

        {speaking && (
          <div className="panda-voice-waves">

            <span />
            <span />
            <span />

          </div>
        )}

        {/* Panda (KEPT AS PANDA.PNG) */}

        <img
          src="/panda.png"
          alt=""
          className="panda-image"
          draggable="false"
          fetchPriority="high"
          decoding="async"
        />

        {/* Talking indicator */}

        {speaking && (
          <div className="panda-talking-indicator">

            <span />
            <span />
            <span />

          </div>
        )}

        {/* Ground shadow */}

        <div className="panda-shadow" />

      </div>

      {/* ====================================================
          STYLES
      ==================================================== */}

      <style>{`

        /* ==================================================
           CONTAINER
        ================================================== */

        .buyukused-panda-greeter {

          position: fixed;

          right: 20px;
          bottom: 15px;

          width: 390px;
          height: 510px;

          z-index: 99999;

          pointer-events: none;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: flex-end;

          overflow: visible;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          animation:
            pandaContainerIn
            0.32s
            cubic-bezier(.16,1,.3,1)
            both;

          will-change:
            transform,
            opacity;

        }


        /* ==================================================
           CONTAINER ENTRY
        ================================================== */

        @keyframes pandaContainerIn {

          0% {

            opacity: 0;

            transform:
              translateY(30px)
              scale(.94);

          }

          100% {

            opacity: 1;

            transform:
              translateY(0)
              scale(1);

          }

        }


        /* ==================================================
           BUBBLE
        ================================================== */

        .panda-bubble {

          position: relative;

          z-index: 5;

          width: 330px;

          padding:
            18px
            22px
            17px;

          margin-bottom: -2px;

          background:
            rgba(255,255,255,0.98);

          border:
            1px solid
            rgba(37,99,235,0.12);

          border-radius: 22px;

          box-shadow:
            0 25px 70px
            rgba(0,0,0,0.18),

            0 5px 20px
            rgba(37,99,235,0.10);

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          transform-origin:
            bottom center;

          animation:
            pandaBubbleIn
            0.35s
            cubic-bezier(.16,1,.3,1)
            both;

          will-change:
            transform,
            opacity;

        }


        /* ==================================================
           SPEAKING BUBBLE
        ================================================== */

        .is-speaking .panda-bubble {

          animation:
            pandaBubbleTalk
            1.4s
            ease-in-out
            infinite;

        }


        /* ==================================================
           BUBBLE TAIL
        ================================================== */

        .panda-bubble::after {

          content: "";

          position: absolute;

          left: 50%;

          bottom: -8px;

          width: 16px;
          height: 16px;

          background:
            rgba(255,255,255,0.98);

          transform:
            translateX(-50%)
            rotate(45deg);

          border-right:
            1px solid
            rgba(37,99,235,0.10);

          border-bottom:
            1px solid
            rgba(37,99,235,0.10);

        }


        /* ==================================================
           BRAND ROW
        ================================================== */

        .panda-bubble-top {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          margin-bottom: 5px;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 1.8px;

          color: #2563eb;

        }


        .panda-dot {

          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 5px
            rgba(34,197,94,0.10),

            0 0 15px
            rgba(34,197,94,0.55);

          animation:
            pandaDotPulse
            0.75s
            ease-in-out
            infinite;

        }


        /* ==================================================
           MESSAGE
        ================================================== */

        .panda-message {

          text-align: center;

          font-size: 20px;

          line-height: 1.25;

          font-weight: 800;

          letter-spacing: -0.3px;

          color: #111827;

        }


        .panda-submessage {

          margin-top: 5px;

          text-align: center;

          font-size: 12px;

          font-weight: 600;

          color: #6b7280;

        }


        /* ==================================================
           PANDA STAGE
        ================================================== */

        .panda-stage {

          position: relative;

          width: 390px;
          height: 405px;

          display: flex;

          align-items: flex-end;

          justify-content: center;

        }


        /* ==================================================
           GLOW
        ================================================== */

        .panda-glow {

          position: absolute;

          left: 50%;
          bottom: 25px;

          width: 300px;
          height: 300px;

          transform:
            translateX(-50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(37,99,235,0.18)
              0%,

              rgba(37,99,235,0.08)
              35%,

              rgba(37,99,235,0)
              72%
            );

          filter:
            blur(4px);

          animation:
            pandaGlow
            1.5s
            ease-in-out
            infinite;

        }


        /* ==================================================
           PANDA IMAGE
        ================================================== */

        .panda-image {

          position: relative;

          z-index: 2;

          width: 390px;
          height: 390px;

          object-fit: contain;

          display: block;

          user-select: none;

          -webkit-user-drag: none;

          transform-origin:
            50% 90%;

          filter:
            drop-shadow(
              0 24px 22px
              rgba(0,0,0,0.20)
            );

          will-change:
            transform;

        }


        /* ==================================================
           ENTER
        ================================================== */

        .is-entering .panda-image {

          animation:
            pandaEnter
            0.48s
            cubic-bezier(.16,1,.3,1)
            both;

        }


        /* ==================================================
           PANDA SPEAKING
        ================================================== */

        .is-speaking .panda-image {

          animation:
            pandaTalk
            0.78s
            ease-in-out
            infinite;

        }


        /* ==================================================
           VOICE WAVES
        ================================================== */

        .panda-voice-waves {

          position: absolute;

          z-index: 4;

          top: 95px;
          right: 28px;

          display: flex;

          align-items: center;

          gap: 4px;

          height: 32px;

          padding:
            5px
            8px;

          border-radius: 20px;

          background:
            rgba(37,99,235,.95);

          box-shadow:
            0 8px 25px
            rgba(37,99,235,.30);

          animation:
            voiceWaveBubble
            .4s
            ease-out
            both;

        }


        .panda-voice-waves span {

          display: block;

          width: 3px;

          height: 10px;

          border-radius: 5px;

          background: white;

          animation:
            voiceWave
            .55s
            ease-in-out
            infinite;

        }


        .panda-voice-waves span:nth-child(2) {

          height: 17px;

          animation-delay:
            .1s;

        }


        .panda-voice-waves span:nth-child(3) {

          height: 12px;

          animation-delay:
            .2s;

        }


        /* ==================================================
           TALKING INDICATOR
        ================================================== */

        .panda-talking-indicator {

          position: absolute;

          z-index: 6;

          bottom: 92px;

          left: 50%;

          transform:
            translateX(-50%);

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 4px;

          padding:
            5px
            9px;

          border-radius: 20px;

          background:
            rgba(17,24,39,.78);

          backdrop-filter:
            blur(8px);

          box-shadow:
            0 8px 25px
            rgba(0,0,0,.20);

          animation:
            talkingIndicator
            .3s
            ease-out
            both;

        }


        .panda-talking-indicator span {

          width: 4px;
          height: 4px;

          border-radius: 50%;

          background: #ffffff;

          animation:
            talkingDot
            .6s
            ease-in-out
            infinite;

        }


        .panda-talking-indicator span:nth-child(2) {

          animation-delay:
            .12s;

        }


        .panda-talking-indicator span:nth-child(3) {

          animation-delay:
            .24s;

        }


        /* ==================================================
           SHADOW
        ================================================== */

        .panda-shadow {

          position: absolute;

          z-index: 1;

          bottom: 19px;

          left: 50%;

          width: 180px;
          height: 25px;

          transform:
            translateX(-50%);

          border-radius: 50%;

          background:
            rgba(0,0,0,0.16);

          filter:
            blur(12px);

          animation:
            pandaShadow
            .78s
            ease-in-out
            infinite;

        }


        /* ==================================================
           PARTICLES
        ================================================== */

        .panda-particle {

          position: absolute;

          z-index: 10;

          color: #2563eb;

          font-size: 22px;

          font-weight: 900;

          opacity: 0;

          pointer-events: none;

        }


        .particle-1 {

          top: 150px;
          left: 25px;

          animation:
            particleFloat1
            1.7s
            ease-out
            infinite;

        }


        .particle-2 {

          top: 220px;
          right: 18px;

          font-size: 15px;

          animation:
            particleFloat2
            1.9s
            .15s
            ease-out
            infinite;

        }


        .particle-3 {

          top: 105px;
          right: 75px;

          color: #22c55e;

          font-size: 30px;

          animation:
            particleFloat3
            1.8s
            .25s
            ease-out
            infinite;

        }


        .particle-4 {

          top: 285px;
          left: 55px;

          color: #f59e0b;

          font-size: 14px;

          animation:
            particleFloat4
            2s
            .35s
            ease-out
            infinite;

        }


        /* ==================================================
           PANDA ENTER
        ================================================== */

        @keyframes pandaEnter {

          0% {

            opacity: 0;

            transform:
              translateY(120px)
              scale(.78)
              rotate(5deg);

          }

          65% {

            opacity: 1;

            transform:
              translateY(-8px)
              scale(1.02)
              rotate(-1deg);

          }

          100% {

            opacity: 1;

            transform:
              translateY(0)
              scale(1)
              rotate(0);

          }

        }


        /* ==================================================
           PANDA TALK
        ================================================== */

        @keyframes pandaTalk {

          0% {

            transform:
              translateY(0)
              rotate(0deg)
              scale(1);

          }

          15% {

            transform:
              translateY(-7px)
              rotate(-1.2deg)
              scale(1.018);

          }

          30% {

            transform:
              translateY(1px)
              rotate(1deg)
              scale(.995);

          }

          45% {

            transform:
              translateY(-9px)
              rotate(-1deg)
              scale(1.02);

          }

          60% {

            transform:
              translateY(1px)
              rotate(1.2deg)
              scale(.997);

          }

          75% {

            transform:
              translateY(-6px)
              rotate(-.8deg)
              scale(1.012);

          }

          100% {

            transform:
              translateY(0)
              rotate(0)
              scale(1);

          }

        }


        /* ==================================================
           TALKING BUBBLE
        ================================================== */

        @keyframes pandaBubbleTalk {

          0%,
          100% {

            transform:
              translateY(0)
              scale(1);

          }

          50% {

            transform:
              translateY(-3px)
              scale(1.012);

          }

        }


        /* ==================================================
           VOICE WAVE
        ================================================== */

        @keyframes voiceWave {

          0%,
          100% {

            transform:
              scaleY(.45);

            opacity: .65;

          }

          50% {

            transform:
              scaleY(1.35);

            opacity: 1;

          }

        }


        @keyframes voiceWaveBubble {

          from {

            opacity: 0;

            transform:
              scale(.7)
              translateX(8px);

          }

          to {

            opacity: 1;

            transform:
              scale(1)
              translateX(0);

          }

        }


        /* ==================================================
           TALKING DOTS
        ================================================== */

        @keyframes talkingDot {

          0%,
          100% {

            transform:
              translateY(0)
              scale(.7);

            opacity: .45;

          }

          50% {

            transform:
              translateY(-4px)
              scale(1.25);

            opacity: 1;

          }

        }


        @keyframes talkingIndicator {

          from {

            opacity: 0;

            transform:
              translateX(-50%)
              scale(.75);

          }

          to {

            opacity: 1;

            transform:
              translateX(-50%)
              scale(1);

          }

        }


        /* ==================================================
           SHADOW
        ================================================== */

        @keyframes pandaShadow {

          0%,
          100% {

            transform:
              translateX(-50%)
              scaleX(1);

            opacity: .65;

          }

          50% {

            transform:
              translateX(-50%)
              scaleX(.75);

            opacity: .35;

          }

        }


        /* ==================================================
           GLOW
        ================================================== */

        @keyframes pandaGlow {

          0%,
          100% {

            transform:
              translateX(-50%)
              scale(.94);

            opacity: .55;

          }

          50% {

            transform:
              translateX(-50%)
              scale(1.08);

            opacity: .9;

          }

        }


        /* ==================================================
           BUBBLE ENTRY
        ================================================== */

        @keyframes pandaBubbleIn {

          0% {

            opacity: 0;

            transform:
              translateY(18px)
              scale(.82);

          }

          70% {

            opacity: 1;

            transform:
              translateY(-3px)
              scale(1.02);

          }

          100% {

            opacity: 1;

            transform:
              translateY(0)
              scale(1);

          }

        }


        /* ==================================================
           DOT
        ================================================== */

        @keyframes pandaDotPulse {

          0%,
          100% {

            transform:
              scale(1);

            opacity: 1;

          }

          50% {

            transform:
              scale(1.4);

            opacity: .65;

          }

        }


        /* ==================================================
           PARTICLE 1
        ================================================== */

        @keyframes particleFloat1 {

          0% {

            opacity: 0;

            transform:
              translate(20px,30px)
              scale(.5)
              rotate(0deg);

          }

          35% {

            opacity: 1;

          }

          100% {

            opacity: 0;

            transform:
              translate(-10px,-55px)
              scale(1.3)
              rotate(90deg);

          }

        }


        /* ==================================================
           PARTICLE 2
        ================================================== */

        @keyframes particleFloat2 {

          0% {

            opacity: 0;

            transform:
              translate(-10px,25px)
              scale(.5);

          }

          35% {

            opacity: .9;

          }

          100% {

            opacity: 0;

            transform:
              translate(20px,-60px)
              scale(1.2);

          }

        }


        /* ==================================================
           PARTICLE 3
        ================================================== */

        @keyframes particleFloat3 {

          0% {

            opacity: 0;

            transform:
              translateY(30px)
              scale(.5)
              rotate(0deg);

          }

          35% {

            opacity: 1;

          }

          100% {

            opacity: 0;

            transform:
              translateY(-70px)
              scale(1.4)
              rotate(100deg);

          }

        }


        /* ==================================================
           PARTICLE 4
        ================================================== */

        @keyframes particleFloat4 {

          0% {

            opacity: 0;

            transform:
              translate(15px,20px)
              scale(.5);

          }

          35% {

            opacity: 1;

          }

          100% {

            opacity: 0;

            transform:
              translate(-20px,-65px)
              scale(1.2);

          }

        }


        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 900px) {

          .buyukused-panda-greeter {

            right: 8px;
            bottom: 8px;

            width: 330px;
            height: 430px;

          }


          .panda-stage {

            width: 330px;
            height: 340px;

          }


          .panda-image {

            width: 330px;
            height: 330px;

          }


          .panda-bubble {

            width: 285px;

          }


          .panda-voice-waves {

            top: 78px;
            right: 18px;

          }

        }


        /* ==================================================
           PHONE
        ================================================== */

        @media (max-width: 600px) {

          .buyukused-panda-greeter {

            right: 4px;
            bottom: 4px;

            width: 235px;
            height: 320px;

          }


          .panda-stage {

            width: 235px;
            height: 250px;

          }


          .panda-image {

            width: 235px;
            height: 235px;

          }


          .panda-glow {

            width: 190px;
            height: 190px;

            bottom: 20px;

          }


          .panda-shadow {

            width: 110px;

            bottom: 13px;

          }


          .panda-bubble {

            width: 205px;

            padding:
              12px
              14px;

            border-radius: 16px;

          }


          .panda-bubble-top {

            font-size: 8px;

            letter-spacing: 1.2px;

            margin-bottom: 3px;

          }


          .panda-dot {

            width: 5px;
            height: 5px;

          }


          .panda-message {

            font-size: 14px;

          }


          .panda-submessage {

            font-size: 9px;

            margin-top: 3px;

          }


          .panda-particle {

            font-size: 14px;

          }


          .panda-voice-waves {

            top: 55px;
            right: 8px;

            height: 25px;

            padding:
              4px
              7px;

          }


          .panda-voice-waves span {

            width: 2px;

          }


          .panda-talking-indicator {

            bottom: 58px;

            padding:
              4px
              7px;

          }

        }


        /* ==================================================
           VERY SMALL PHONE
        ================================================== */

        @media (max-width: 380px) {

          .buyukused-panda-greeter {

            width: 200px;
            height: 280px;

            right: 0;
            bottom: 0;

          }


          .panda-stage {

            width: 200px;
            height: 215px;

          }


          .panda-image {

            width: 200px;
            height: 200px;

          }


          .panda-bubble {

            width: 180px;

            padding:
              10px
              12px;

          }


          .panda-message {

            font-size: 12px;

          }


          .panda-submessage {

            display: none;

          }


          .panda-voice-waves {

            top: 45px;
            right: 5px;

          }


          .panda-talking-indicator {

            bottom: 48px;

          }

        }


        /* ==================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {

          .buyukused-panda-greeter *,

          .buyukused-panda-greeter {

            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;

          }

        }

      `}</style>

    </div>
  );
}