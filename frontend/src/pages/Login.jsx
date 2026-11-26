// ============================================================
// frontend/src/pages/Login.jsx
// BuyUKUsed Login Page — with cinematic video background
// ============================================================

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaPlaneDeparture } from "react-icons/fa";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineLock,
  AiOutlineUnlock,
  AiOutlineClose,
} from "react-icons/ai";
import {
  MdVolumeUp,
  MdVolumeOff,
} from "react-icons/md";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔗 Login API_URL:", API_URL);

// ============================================================
// VIDEO SOURCE
// ============================================================
// File lives at:  frontend/public/assets/videos/knherovideo.mp4
// Vite serves /public at root → browser URL is /assets/videos/knherovideo.mp4
const LOGIN_VIDEO_SRC = "/assets/videos/knherovideo.mp4";
const LOGIN_VIDEO_POSTER = "/assets/logo/hero.png"; // fallback frame

// ============================================================
// PASSWORD UTILITIES
// ============================================================

const getPasswordStrength = (pwd) => {
  if (!pwd) {
    return { score: 0, label: "", color: "" };
  }

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  if (score <= 2) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 4) return { score, label: "Fair", color: "#f59e0b" };
  if (score <= 6) return { score, label: "Good", color: "#3b82f6" };
  return { score, label: "Strong", color: "#22c55e" };
};

// ============================================================
// LOGIN
// ============================================================

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [privacyMode, setPrivacyMode] = useState(false);
  const [peekHidden, setPeekHidden] = useState(false);

  const [capsLockOn, setCapsLockOn] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const audioCtxRef = useRef(null);
  const videoRef = useRef(null);

  // ------------------------------------------------------------
  // Ensure muted autoplay works across browsers
  // ------------------------------------------------------------
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // React sometimes fails to apply muted attribute on first render.
    v.muted = true;
    v.defaultMuted = true;

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          /* autoplay blocked – poster/fallback will show */
        });
      }
    };

    tryPlay();

    // Retry once the file can actually play (iOS low-power mode, etc.)
    const onCanPlay = () => tryPlay();
    v.addEventListener("canplay", onCanPlay);

    return () => {
      v.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    if (typeof window === "undefined") return;

    try {
      const Ctx =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!Ctx) return;

      audioCtxRef.current = new Ctx();
    } catch {
      /* ignore */
    }
  };

  const playTone = (freq, duration = 0.05, type = "sine", volume = 0.1) => {
    if (!soundEnabled) return;
    initAudio();

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
      );

      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      /* ignore */
    }
  };

  const sounds = {
    key: () => playTone(700 + Math.random() * 250, 0.03, "square", 0.04),
    toggle: () => playTone(440, 0.05, "sine", 0.08),
    sliderTick: () => playTone(600, 0.02, "sine", 0.04),
    privacy: () => {
      playTone(300, 0.08, "sine", 0.1);
      setTimeout(() => playTone(400, 0.1, "sine", 0.1), 80);
    },
    success: () => {
      playTone(523.25, 0.1, "sine", 0.15);
      setTimeout(() => playTone(659.25, 0.1, "sine", 0.15), 100);
      setTimeout(() => playTone(783.99, 0.18, "sine", 0.15), 200);
    },
    error: () => {
      playTone(220, 0.15, "sawtooth", 0.12);
      setTimeout(() => playTone(164.81, 0.25, "sawtooth", 0.12), 120);
    },
    exit: () => {
      playTone(600, 0.06, "sine", 0.1);
      setTimeout(() => playTone(400, 0.1, "sine", 0.1), 60);
    },
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBlur = () => {
      if (password) setPeekHidden(true);
    };

    const handleFocus = () => {
      setPeekHidden(false);
    };

    const handleVisibility = () => {
      if (document.hidden && password) {
        setPeekHidden(true);
      } else {
        setPeekHidden(false);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [password]);

  // ============================================================
  // EXIT (close login window)
  // ============================================================

  const handleExit = () => {
    if (loading) return;

    sounds.exit();

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 150);
  };

  // ============================================================
  // ESCAPE KEY → exit
  // ============================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        handleExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (loading) {
      return;
    }

    sounds.toggle();

    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = await login(
        normalizedEmail,
        password
      );

      if (result?.success) {
        sounds.success();

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 250);

        return;
      }

      sounds.error();

      setError(
        result?.error ||
          result?.message ||
          "Login failed. Please check your email and password."
      );
    } catch (err) {
      console.error("❌ Login error:", err);
      sounds.error();

      setError(
        err?.response?.data?.message ||
          err?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    sounds.toggle();
    setError("");

    window.location.href =
      `${API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    sounds.toggle();
    setError("");

    window.location.href =
      `${API_URL}/auth/facebook`;
  };

  const toggleShowPassword = () => {
    sounds.toggle();
    setShowPassword((prev) => !prev);
  };

  const togglePrivacyMode = () => {
    sounds.privacy();
    setPrivacyMode((prev) => !prev);

    if (!privacyMode) {
      setShowPassword(false);
    }
  };

  const toggleSound = () => {
    initAudio();
    setSoundEnabled((prev) => !prev);
    if (!soundEnabled) {
      setTimeout(() => {
        playTone(880, 0.06, "sine", 0.1);
      }, 20);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    sounds.key();
    if (peekHidden) setPeekHidden(false);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    sounds.key();
  };

  const handlePasswordKeyEvent = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const passwordBlurred =
    privacyMode || peekHidden;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <style>{`

        /* ======================================================
           STICKY FULL-VIEWPORT — NO PAGE SCROLLBAR
        ====================================================== */

        html,
        body {
          overflow: hidden !important;
          height: 100% !important;
        }

        /* ======================================================
           LOGIN WRAPPER — cinematic video background
        ====================================================== */

        .login-wrapper,
        .login-wrapper * {
          box-sizing: border-box;
        }

        .login-wrapper {
          position: fixed;
          inset: 0;

          width: 100%;
          height: 100vh;
          height: 100dvh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 16px;

          overflow: hidden;

          /* Fallback background (visible until video paints) */
          background:
            radial-gradient(
              circle at center,
              #0b1220 0%,
              #020617 100%
            );

          overscroll-behavior: none;

          touch-action: manipulation;

          isolation: isolate;
        }

        /* ======================================================
           CINEMATIC VIDEO BACKGROUND
        ====================================================== */

        .login-video-bg {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;
          object-position: center;

          z-index: 0;

          pointer-events: none;

          /* Slow cinematic drift */
          animation: login-video-drift 32s ease-in-out infinite;

          will-change: transform;
        }

        @keyframes login-video-drift {
          0% {
            transform: scale(1.06) translate3d(0, 0, 0);
          }
          50% {
            transform: scale(1.12) translate3d(-1.2%, -1.2%, 0);
          }
          100% {
            transform: scale(1.06) translate3d(0, 0, 0);
          }
        }

        /* Dark vignette so the login card always reads clearly */

        .login-video-overlay {
          position: absolute;
          inset: 0;

          z-index: 1;

          pointer-events: none;

          background:
            radial-gradient(
              ellipse at center,
              rgba(0, 0, 0, 0.25) 0%,
              rgba(0, 0, 0, 0.7) 60%,
              rgba(0, 0, 0, 0.9) 100%
            );
        }

        /* White grid overlay — sits above video, below card */

        .login-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);

          background-size: 44px 44px;

          pointer-events: none;

          mask-image:
            radial-gradient(ellipse at center, black 25%, transparent 75%);
          -webkit-mask-image:
            radial-gradient(ellipse at center, black 25%, transparent 75%);

          z-index: 1;
        }

        /* ======================================================
           FLYING TAKEOVER PLANE — flies across repeatedly
        ====================================================== */

        .flying-plane {
          position: absolute;
          z-index: 2;
          pointer-events: none;

          font-size: 56px;
          line-height: 1;

          color: rgba(255, 255, 255, 0.72);

          filter:
            drop-shadow(0 0 18px rgba(255, 255, 255, 0.55))
            drop-shadow(0 0 42px rgba(255, 255, 255, 0.25));

          animation:
            fly-across 14s linear infinite;

          will-change: transform, opacity;
        }

        @keyframes fly-across {
          0% {
            transform: translate(-180px, calc(100vh + 120px));
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(100vw + 180px), -120px);
            opacity: 0;
          }
        }

        /* ======================================================
           LOGIN CARD — no green accent
        ====================================================== */

        .login-card {
          position: relative;
          z-index: 3;

          width: 100%;
          max-width: 400px;

          max-height: calc(100dvh - 32px);

          padding: 22px 22px;

          overflow-y: auto;
          overflow-x: hidden;

          background: linear-gradient(
            155deg,
            rgba(15, 23, 42, 0.55) 0%,
            rgba(2, 6, 23, 0.75) 100%
          );

          backdrop-filter: blur(32px) saturate(140%);
          -webkit-backdrop-filter: blur(32px) saturate(140%);

          border: 1px solid rgba(255, 255, 255, 0.1);

          border-radius: 20px;

          box-shadow:
            inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02),
            0 24px 80px rgba(0, 0, 0, 0.55);

          color: #f8fafc;

          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .login-card::-webkit-scrollbar {
          display: none;
        }

        /* ======================================================
           EXIT BUTTON
        ====================================================== */

        .exit-button {
          position: absolute;

          top: 12px;
          left: 12px;

          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.12);

          border-radius: 50%;

          color: rgba(255, 255, 255, 0.75);

          cursor: pointer;

          font-size: 17px;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.15s ease,
            border-color 0.2s ease;

          z-index: 10;

          -webkit-tap-highlight-color: transparent;

          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .exit-button:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.45);
          color: #f87171;
          transform: scale(1.06);
        }

        .exit-button:active:not(:disabled) {
          transform: scale(0.94);
        }

        .exit-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ======================================================
           SOUND TOGGLE
        ====================================================== */

        .sound-toggle {
          position: absolute;

          top: 12px;
          right: 12px;

          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.12);

          border-radius: 50%;

          color: rgba(255, 255, 255, 0.75);

          cursor: pointer;

          font-size: 15px;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.15s ease,
            border-color 0.2s ease;

          z-index: 10;

          -webkit-tap-highlight-color: transparent;

          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .sound-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
          transform: scale(1.06);
        }

        .sound-toggle:active {
          transform: scale(0.94);
        }

        /* ======================================================
           TITLE — frosted pill
        ====================================================== */

        .login-card h2 {
          display: table;
          margin: 10px auto 12px;

          padding: 8px 22px;

          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;

          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);

          color: rgba(255, 255, 255, 0.9);

          font-size: 16px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-align: center;

          box-shadow:
            inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
            0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .login-card .subtitle {
          margin: 0 0 16px;

          font-size: 12.5px;

          line-height: 1.4;

          text-align: center;

          color: rgba(255, 255, 255, 0.5);

          font-weight: 700;

          letter-spacing: 0.02em;
        }

        /* ======================================================
           FORM
        ====================================================== */

        .form-group {
          width: 100%;
          margin-bottom: 10px;
        }

        .form-group label {
          display: block;

          margin-bottom: 4px;

          font-size: 11px;

          line-height: 1.2;

          font-weight: 700;

          text-transform: uppercase;

          letter-spacing: 0.08em;

          color: rgba(255, 255, 255, 0.6);
        }

        .form-group input {
          display: block;

          width: 100%;

          min-width: 0;

          padding: 9px 13px;

          border:
            1px solid
            rgba(255, 255, 255, 0.1);

          border-radius: 10px;

          background:
            rgba(255, 255, 255, 0.04);

          color: #f8fafc;

          font-family: inherit;

          font-size: 16px;

          line-height: 1.35;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            filter 0.2s ease;

          -webkit-appearance: none;
          appearance: none;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-group input:focus {
          border-color:
            rgba(255, 255, 255, 0.4);

          background:
            rgba(255, 255, 255, 0.06);

          box-shadow:
            0 0 0 3px rgba(255, 255, 255, 0.08),
            0 0 24px rgba(255, 255, 255, 0.08);
        }

        .form-group input:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .form-group small {
          display: block;

          margin-top: 1px;

          font-size: 10px;

          color: rgba(255, 255, 255, 0.4);

          font-weight: 900;
        }

        .form-group input.peek-hidden {
          filter: blur(6px);

          -webkit-user-select: none;
          user-select: none;
        }

        /* ======================================================
           PASSWORD WRAPPER
        ====================================================== */

        .password-wrapper {
          position: relative;

          width: 100%;
        }

        .password-wrapper input {
          padding-right: 44px;
        }

        .password-toggle {
          position: absolute;

          right: 8px;
          top: 50%;

          width: 32px;
          height: 32px;

          transform:
            translateY(-50%);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          background: transparent;

          border: none;

          color: rgba(255, 255, 255, 0.5);

          cursor: pointer;

          font-size: 18px;

          touch-action: manipulation;

          -webkit-tap-highlight-color:
            transparent;

          transition:
            color 0.2s ease;
        }

        .password-toggle:hover:not(:disabled) {
          color: rgba(255, 255, 255, 0.9);
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ======================================================
           PASSWORD TOOLS
        ====================================================== */

        .password-tools {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 8px;

          margin-top: 8px;

          flex-wrap: wrap;
        }

        .password-tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          padding: 5px 11px;

          font-size: 11px;
          font-weight: 700;

          letter-spacing: 0.01em;

          color: rgba(255, 255, 255, 0.7);

          background: rgba(255, 255, 255, 0.03);

          border: 1px solid rgba(255, 255, 255, 0.08);

          border-radius: 9999px;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;

          -webkit-tap-highlight-color: transparent;
        }

        .password-tool-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .password-tool-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .password-tool-btn.active {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          color: #ffffff;
        }

        .password-tool-btn svg {
          font-size: 13px;
        }

        /* ======================================================
           PASSWORD STRENGTH
        ====================================================== */

        .password-strength {
          margin-top: 8px;
        }

        .password-strength-bar {
          display: flex;
          gap: 3px;
          height: 3px;
        }

        .password-strength-segment {
          flex: 1;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.06);
          transition: background 0.25s ease;
        }

        .password-strength-label {
          display: flex;
          justify-content: space-between;
          align-items: center;

          margin-top: 4px;

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 0.03em;
          text-transform: uppercase;

          color: rgba(255, 255, 255, 0.5);
        }

        .password-strength-label strong {
          font-weight: 800;
        }

        /* ======================================================
           CAPS LOCK WARNING
        ====================================================== */

        .caps-lock-warning {
          display: flex;
          align-items: center;
          gap: 5px;

          margin-top: 6px;

          padding: 4px 8px;

          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 6px;

          color: #fbbf24;

          font-size: 11px;
          font-weight: 700;
        }

        /* ======================================================
           SOCIAL BUTTONS
        ====================================================== */

        .social-btn {
          width: 100%;

          min-height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          padding: 9px 12px;

          border:
            1px solid
            rgba(255, 255, 255, 0.1);

          border-radius: 10px;

          background:
            rgba(255, 255, 255, 0.04);

          color: #f8fafc;

          cursor: pointer;

          font-family: inherit;

          font-weight: 600;

          font-size: 13px;

          margin-bottom: 8px;

          touch-action: manipulation;

          -webkit-tap-highlight-color:
            transparent;

          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .social-btn:hover:not(:disabled) {
          background:
            rgba(255, 255, 255, 0.08);

          border-color:
            rgba(255, 255, 255, 0.2);
        }

        .social-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        .social-btn.fb {
          border: none;

          background: #1877F2;

          color: #fff;
        }

        .social-btn.fb:hover:not(:disabled) {
          background: #166fe5;

          border-color: transparent;
        }

        /* ======================================================
           DIVIDER
        ====================================================== */

        .divider {
          width: 100%;

          display: flex;
          align-items: center;

          margin: 10px 0 12px;
        }

        .divider hr {
          flex: 1;

          min-width: 0;

          border: none;

          border-top:
            1px solid rgba(255, 255, 255, 0.08);
        }

        .divider span {
          flex: 0 0 auto;

          margin: 0 10px;

          color: rgba(255, 255, 255, 0.4);

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.1em;
        }

        /* ======================================================
           FORGOT PASSWORD — frosted pill
        ====================================================== */

        .forgot-password-row {
          display: flex;
          justify-content: flex-end;

          width: 100%;

          margin-top: 10px;
          margin-bottom: 14px;
        }

        .forgot-password-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          padding: 6px 14px;

          background: rgba(255, 255, 255, 0.03);

          border: 1px solid rgba(255, 255, 255, 0.08);

          border-radius: 9999px;

          color: rgba(255, 255, 255, 0.65);

          font-size: 12px;
          font-weight: 600;

          letter-spacing: 0.02em;

          text-decoration: none;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            box-shadow 0.2s ease;

          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);

          -webkit-tap-highlight-color: transparent;
        }

        .forgot-password-link:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.28);
          color: #ffffff;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }

        /* ======================================================
           LOGIN BUTTON — fully transparent, no green
        ====================================================== */

        .login-button {
          width: 100%;

          min-height: 52px;

          padding: 14px 24px;

          margin: 4px 0 0;

          background: transparent;

          color: #ffffff;

          border: 1px solid rgba(255, 255, 255, 0.28);

          border-radius: 12px;

          font-family: inherit;

          font-size: 15px;

          font-weight: 800;

          letter-spacing: 0.1em;

          text-transform: uppercase;

          cursor: pointer;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          transition:
            transform 0.15s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;

          box-shadow:
            inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
            0 2px 12px rgba(0, 0, 0, 0.25);

          touch-action: manipulation;

          -webkit-tap-highlight-color: transparent;

          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .login-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);

          border-color: rgba(255, 255, 255, 0.55);

          box-shadow:
            inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
            0 0 24px rgba(255, 255, 255, 0.12),
            0 4px 16px rgba(0, 0, 0, 0.3);

          transform: translateY(-1px);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0) scale(0.99);

          background: rgba(255, 255, 255, 0.09);

          box-shadow:
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
            0 1px 6px rgba(0, 0, 0, 0.3);
        }

        .login-button:disabled {
          opacity: 0.55;

          cursor: not-allowed;

          background: transparent;

          border-color: rgba(255, 255, 255, 0.15);
        }

        .login-button i,
        .login-button svg {
          font-size: 14px;
        }

        /* ======================================================
           FOOTER — Create free account as frosted pill
        ====================================================== */

        .auth-footer {
          width: 100%;

          text-align: center;

          margin-top: 12px;

          font-size: 12px;

          line-height: 1.4;

          color: rgba(255, 255, 255, 0.5);
        }

        .auth-footer a {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          padding: 6px 14px;

          margin-left: 8px;

          background: rgba(255, 255, 255, 0.03);

          border: 1px solid rgba(255, 255, 255, 0.08);

          border-radius: 9999px;

          color: rgba(255, 255, 255, 0.65);

          font-size: 12px;
          font-weight: 600;

          letter-spacing: 0.02em;

          text-decoration: none;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            box-shadow 0.2s ease;

          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);

          -webkit-tap-highlight-color: transparent;
        }

        .auth-footer a:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.28);
          color: #ffffff;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }

        /* ======================================================
           BACK LINK
        ====================================================== */

        .back-link {
          width: 100%;

          text-align: center;

          margin-top: 6px;

          font-size: 11px;

          line-height: 1.4;

          color: rgba(255, 255, 255, 0.35);
        }

        .back-link a {
          color:
            rgba(255, 255, 255, 0.5);

          transition: color 0.2s ease;
        }

        .back-link a:hover {
          color:
            rgba(255, 255, 255, 0.8);
        }

        /* ======================================================
           ERROR
        ====================================================== */

        .login-error {
          width: 100%;

          overflow-wrap: anywhere;

          background:
            rgba(220, 38, 38, 0.12);

          color: #fca5a5;

          border:
            1px solid
            rgba(220, 38, 38, 0.3);

          padding: 7px 11px;

          border-radius: 8px;

          margin-bottom: 12px;

          font-size: 12px;

          line-height: 1.4;
        }

        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 768px) {
          .login-wrapper {
            padding: 12px;
          }

          .login-card {
            max-width: 420px;
            max-height: calc(100dvh - 24px);
          }

          .flying-plane {
            font-size: 44px;
          }
        }

        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 480px) {
          .login-wrapper {
            padding: 8px;
            align-items: center;
          }

          .login-card {
            width: 100%;
            max-width: 400px;
            max-height: calc(100dvh - 16px);
            padding: 16px 14px;
            border-radius: 16px;
          }

          .login-card h2 {
            font-size: 14px;
            padding: 6px 16px;
            margin: 10px auto 10px;
          }

          .login-card .subtitle {
            font-size: 11.5px;
            margin-bottom: 12px;
          }

          .flying-plane {
            font-size: 36px;
          }

          .exit-button,
          .sound-toggle {
            top: 10px;
            width: 26px;
            height: 26px;
          }

          .exit-button {
            left: 10px;
            font-size: 15px;
          }

          .sound-toggle {
            right: 10px;
            font-size: 13px;
          }

          .form-group {
            margin-bottom: 8px;
          }

          .form-group label {
            font-size: 10.5px;
            margin-bottom: 3px;
          }

          .form-group input {
            font-size: 16px !important;
            min-height: 42px;
            padding: 8px 11px;
            border-radius: 8px;
          }

          .password-wrapper input {
            padding-right: 44px;
          }

          .password-toggle {
            right: 6px;
            width: 34px;
            height: 34px;
            font-size: 18px;
          }

          .password-tool-btn {
            font-size: 10px;
            padding: 4px 9px;
          }

          .password-strength {
            margin-top: 6px;
          }

          .password-strength-label {
            font-size: 9px;
          }

          .caps-lock-warning {
            font-size: 10px;
            padding: 3px 7px;
          }

          .social-btn {
            width: 100%;
            min-height: 38px;
            padding: 8px 10px;
            margin-bottom: 6px;
            font-size: 12px;
          }

          .divider {
            margin: 8px 0 10px;
          }

          .divider span {
            margin: 0 8px;
            font-size: 10px;
          }

          .forgot-password-row {
            margin-top: 8px;
            margin-bottom: 12px;
          }

          .forgot-password-link {
            font-size: 11px;
            padding: 5px 12px;
          }

          .login-button {
            min-height: 48px;
            padding: 12px 20px;
            font-size: 14px;
            border-radius: 10px;
            letter-spacing: 0.08em;
          }

          .auth-footer {
            margin-top: 10px;
            font-size: 11px;
          }

          .auth-footer a {
            font-size: 11px;
            padding: 5px 12px;
            margin-left: 6px;
          }

          .back-link {
            margin-top: 4px;
            font-size: 10.5px;
          }

          .login-error {
            margin-bottom: 10px;
            padding: 7px 10px;
            font-size: 11px;
          }
        }

        /* ======================================================
           VERY SMALL PHONES
        ====================================================== */

        @media (max-width: 360px) {
          .login-wrapper {
            padding: 6px;
          }

          .login-card {
            padding: 14px 11px;
            border-radius: 14px;
            max-height: calc(100dvh - 12px);
          }

          .login-card h2 {
            font-size: 13px;
            padding: 5px 14px;
            margin: 8px auto 8px;
          }

          .login-card .subtitle {
            font-size: 11px;
            margin-bottom: 10px;
          }

          .flying-plane {
            font-size: 28px;
          }

          .exit-button,
          .sound-toggle {
            top: 8px;
            width: 24px;
            height: 24px;
          }

          .exit-button {
            left: 8px;
            font-size: 14px;
          }

          .sound-toggle {
            right: 8px;
            font-size: 12px;
          }

          .form-group {
            margin-bottom: 6px;
          }

          .form-group label {
            font-size: 10px;
          }

          .form-group input {
            min-height: 40px;
            font-size: 16px !important;
            padding: 7px 10px;
          }

          .password-tool-btn {
            font-size: 9.5px;
            padding: 3px 8px;
          }

          .social-btn {
            min-height: 36px;
            font-size: 11px;
            padding: 7px 8px;
          }

          .login-button {
            min-height: 44px;
            padding: 10px 16px;
            font-size: 13px;
            border-radius: 9px;
          }

          .auth-footer,
          .back-link {
            font-size: 10px;
          }

          .auth-footer a {
            font-size: 10.5px;
            padding: 4px 10px;
            margin-left: 5px;
          }
        }

        /* ======================================================
           LANDSCAPE MOBILE
        ====================================================== */

        @media (max-height: 500px)
          and (orientation: landscape) {

          .login-wrapper {
            align-items: center;
            padding: 8px;
          }

          .login-card {
            max-width: 500px;
            max-height: calc(100dvh - 16px);
            padding: 12px 16px;
            border-radius: 14px;
          }

          .login-card h2 {
            font-size: 13px;
            padding: 5px 14px;
            margin: 6px auto 8px;
          }

          .login-card .subtitle {
            margin-bottom: 6px;
            font-size: 11px;
          }

          .form-group {
            margin-bottom: 5px;
          }

          .form-group input {
            min-height: 36px;
            padding: 6px 10px;
          }

          .social-btn {
            min-height: 34px;
            padding: 6px 10px;
            margin-bottom: 5px;
            font-size: 12px;
          }

          .divider {
            margin: 6px 0 8px;
          }

          .login-button {
            min-height: 40px;
            padding: 9px 16px;
            font-size: 13px;
            margin-top: 4px;
          }

          .flying-plane {
            font-size: 32px;
          }
        }

        /* ======================================================
           REDUCE MOTION — hide video & plane, freeze animations
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          .exit-button,
          .sound-toggle,
          .password-tool-btn,
          .password-toggle,
          .form-group input,
          .forgot-password-link,
          .social-btn,
          .auth-footer a,
          .login-button {
            transition: none;
          }

          .flying-plane {
            animation: none;
            display: none;
          }

          .login-video-bg {
            animation: none;
            display: none;
          }
        }

      `}</style>

      <div className="login-wrapper">

        {/* ====================================================
            CINEMATIC VIDEO BACKGROUND
        ==================================================== */}

        <video
          ref={videoRef}
          className="login-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={LOGIN_VIDEO_POSTER}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
        >
          <source src={LOGIN_VIDEO_SRC} type="video/mp4" />
        </video>

        {/* Dark vignette overlay for readability */}
        <div className="login-video-overlay" aria-hidden="true" />

        {/* ====================================================
            FLYING TAKEOVER PLANE — flies across repeatedly
        ==================================================== */}

        <div
          className="flying-plane"
          aria-hidden="true"
          title=""
        >
          <FaPlaneDeparture />
        </div>

        <div className="login-card">

          <button
            type="button"
            className="exit-button"
            onClick={handleExit}
            disabled={loading}
            aria-label="Close login and return to home"
            title="Close — back to home (Esc)"
          >
            <AiOutlineClose />
          </button>

          <button
            type="button"
            className="sound-toggle"
            onClick={toggleSound}
            aria-label={
              soundEnabled
                ? "Disable sound effects"
                : "Enable sound effects"
            }
            title={
              soundEnabled
                ? "Sound on — click to mute"
                : "Sound off — click to unmute"
            }
          >
            {soundEnabled ? <MdVolumeUp /> : <MdVolumeOff />}
          </button>

          <h2>
            Welcome Back
          </h2>

          <p className="subtitle">
            {from !== "/"
              ? "Login to continue posting your ad"
              : "Login to your account"}
          </p>

          {error && (
            <div
              role="alert"
              className="login-error"
            >
              {error}
            </div>
          )}

          <div>
            <button
              type="button"
              className="social-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FcGoogle size={18} />

              Continue with Google
            </button>

            <button
              type="button"
              className="social-btn fb"
              onClick={handleFacebookLogin}
              disabled={loading}
            >
              <FaFacebookF size={16} />

              Continue with Facebook
            </button>
          </div>

          <div className="divider">
            <hr />

            <span>OR</span>

            <hr />
          </div>

          <form
            onSubmit={handleSubmit}
            id="login-form"
          >

            <div className="form-group">
              <label htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="login-password"
                  type={
                    showPassword && !passwordBlurred
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className={
                    passwordBlurred
                      ? "peek-hidden"
                      : ""
                  }
                  aria-describedby="password-strength"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleShowPassword}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword && !passwordBlurred ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </button>

              </div>

              {capsLockOn && (
                <div className="caps-lock-warning" role="status">
                  <span aria-hidden="true">⚠️</span>
                  <span>Caps Lock is on</span>
                </div>
              )}

              <div className="password-tools">

                <button
                  type="button"
                  className={`password-tool-btn ${
                    privacyMode ? "active" : ""
                  }`}
                  onClick={togglePrivacyMode}
                  disabled={loading}
                  aria-pressed={privacyMode}
                  title={
                    privacyMode
                      ? "Privacy mode is ON — password is hidden"
                      : "Turn on privacy mode to hide your password"
                  }
                >
                  {privacyMode ? <AiOutlineLock /> : <AiOutlineUnlock />}
                  {privacyMode ? "Privacy ON" : "Privacy OFF"}
                </button>

              </div>

              {password && (
                <div
                  className="password-strength"
                  id="password-strength"
                  aria-live="polite"
                >
                  <div className="password-strength-bar">
                    {[1, 2, 3, 4].map((segment) => {
                      const filled =
                        passwordStrength.score >= segment * 1.75;

                      return (
                        <span
                          key={segment}
                          className="password-strength-segment"
                          style={
                            filled
                              ? {
                                  background:
                                    passwordStrength.color,
                                }
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>

                  <div
                    className="password-strength-label"
                    style={{
                      color: passwordStrength.color,
                    }}
                  >
                    <span>Password strength</span>
                    <strong>{passwordStrength.label}</strong>
                  </div>
                </div>
              )}

              {peekHidden && !privacyMode && (
                <small
                  style={{
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: "10px",
                    marginTop: "5px",
                    display: "block",
                    fontStyle: "italic",
                  }}
                >
                  🔒 Password hidden — click the field to reveal
                </small>
              )}

            </div>

            <div className="forgot-password-row">
              <Link
                to="/forgot-password"
                onClick={() => sounds.toggle()}
                className="forgot-password-link"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
              aria-label={loading ? "Logging in" : "Login"}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt" aria-hidden="true" />
                  <span>LOGIN</span>
                </>
              )}
            </button>

          </form>

          <div className="auth-footer">
            No account?{" "}

            <Link
              to="/register"
              state={{ from }}
              onClick={() => sounds.toggle()}
            >
              Create free account
            </Link>
          </div>

          {from !== "/" && (
            <div className="back-link">
              <Link
                to="/"
                onClick={() => sounds.toggle()}
                style={{
                  color:
                    "rgba(255, 255, 255, 0.5)",
                  textDecoration:
                    "none",
                }}
              >
                ← Back to home
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Login;