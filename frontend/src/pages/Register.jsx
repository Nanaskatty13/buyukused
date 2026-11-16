// ============================================================
// frontend/src/pages/Register.jsx
// BuyUKUsed - Register Page
// ============================================================

import React, { useState, useRef, useEffect } from "react";
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
  AiOutlineClose,
} from "react-icons/ai";
import {
  MdVolumeUp,
  MdVolumeOff,
} from "react-icons/md";

// ============================================================
// API URL
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔗 Register API_URL:", API_URL);

// ============================================================
// REGISTER COMPONENT
// ============================================================

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    birthday: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const { register } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const audioCtxRef = useRef(null);

  // ============================================================
  // AUDIO
  // ============================================================

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

  const toggleSound = () => {
    initAudio();
    setSoundEnabled((prev) => !prev);
    if (!soundEnabled) {
      setTimeout(() => {
        playTone(880, 0.06, "sine", 0.1);
      }, 20);
    }
  };

  // ============================================================
  // EXIT
  // ============================================================

  const handleExit = () => {
    if (loading) return;

    sounds.exit();

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 150);
  };

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
  // PASSWORD STRENGTH
  // ============================================================

  const evaluatePassword = (password) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        label: "",
        color: "",
      });

      return;
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score++;
    }
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let label = "Weak";
    let color = "#ef4444";

    if (score >= 4) {
      label = "Strong";
      color = "#22c55e";
    } else if (score >= 3) {
      label = "Medium";
      color = "#f59e0b";
    } else if (score >= 2) {
      label = "Weak";
      color = "#ef4444";
    } else {
      label = "Very Weak";
      color = "#dc2626";
    }

    setPasswordStrength({
      score: Math.min(score / 5, 1),
      label,
      color,
    });
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    sounds.key();

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      evaluatePassword(value);
    }
  };

  const handlePasswordKeyEvent = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  // ============================================================
  // FORM SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (loading) return;

    sounds.toggle();

    setError("");

    // ----------------------------------------------------------
    // NAME VALIDATION
    // ----------------------------------------------------------

    if (formData.name.trim().length < 2) {
      sounds.error();
      setError(
        "Name must be at least 2 characters long"
      );
      return;
    }

    // ----------------------------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------------------------

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      sounds.error();
      setError("Passwords do not match");
      return;
    }

    // ----------------------------------------------------------
    // AGE VALIDATION
    // ----------------------------------------------------------

    if (formData.birthday) {
      const birthDate = new Date(
        formData.birthday
      );

      const today = new Date();

      let age =
        today.getFullYear() -
        birthDate.getFullYear();

      const monthDifference =
        today.getMonth() -
        birthDate.getMonth();

      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() <
            birthDate.getDate()
        )
      ) {
        age--;
      }

      if (age < 18) {
        sounds.error();
        setError(
          "You must be at least 18 years old to register."
        );
        return;
      }
    }

    // ----------------------------------------------------------
    // START LOADING
    // ----------------------------------------------------------

    setLoading(true);

    try {
      const {
        confirmPassword,
        ...registrationData
      } = formData;

      const payload = {
        ...registrationData,
        role: "user",
      };

      const result =
        await register(payload);

      if (result.success) {
        sounds.success();

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 250);
      } else {
        sounds.error();
        setError(
          result.error ||
            "Registration failed"
        );
      }
    } catch (err) {
      console.error(
        "❌ Registration error:",
        err
      );

      sounds.error();
      setError(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

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

        .register-wrapper,
        .register-wrapper * {
          box-sizing: border-box;
        }

        /* ======================================================
           REGISTER WRAPPER — padded below the navbar
        ======================================================
           The navbar is position:fixed with z-index 99999 and is
           roughly 48px tall on desktop (smaller on mobile).
           Padding-top reserves that height + a 24px breathing gap
           so the card NEVER tucks under the navbar on short screens.
        ====================================================== */

        .register-wrapper {
          position: fixed;
          inset: 0;

          width: 100%;
          height: 100vh;
          height: 100dvh;

          display: flex;
          align-items: center;
          justify-content: center;

          /* ✅ Reserve navbar height (48px) + 28px gap */
          padding:
            calc(76px + env(safe-area-inset-top, 0px))
            16px
            16px;

          overflow: hidden;

          background-image:
            radial-gradient(
              circle at center,
              rgba(0, 0, 0, 0.55) 0%,
              rgba(0, 0, 0, 0.88) 100%
            ),
            url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80");

          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;

          overscroll-behavior: none;

          touch-action: manipulation;
        }

        .register-wrapper::before {
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

          z-index: 0;
        }

        /* ======================================================
           FLYING TAKEOVER PLANE
        ====================================================== */

        .flying-plane {
          position: fixed;
          z-index: 0;
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
           REGISTER CARD — dark glass
        ======================================================
           max-height matches the wrapper's usable area so the
           card scrolls internally instead of touching the navbar.
        ====================================================== */

        .register-card {
          position: relative;
          z-index: 1;

          width: 100%;
          max-width: 400px;

          /* ✅ Matches wrapper: 100dvh − (76 + 16) */
          max-height:
            calc(100dvh - 92px - env(safe-area-inset-top, 0px));

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

        .register-card::-webkit-scrollbar {
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

        .register-card h2 {
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

        .register-card .subtitle {
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

        .form-group .form-input {
          display: block;

          width: 100%;
          min-width: 0;

          padding: 9px 13px;

          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;

          background: rgba(255, 255, 255, 0.04);

          color: #f8fafc;

          font-family: inherit;
          font-size: 16px;
          line-height: 1.35;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;

          -webkit-appearance: none;
          appearance: none;
        }

        .form-group .form-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-group .form-input:focus {
          border-color: rgba(255, 255, 255, 0.4);

          background: rgba(255, 255, 255, 0.06);

          box-shadow:
            0 0 0 3px rgba(255, 255, 255, 0.08),
            0 0 24px rgba(255, 255, 255, 0.08);
        }

        .form-group .form-input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .form-group small {
          display: block;

          margin-top: 3px;

          font-size: 10px;

          color: rgba(255, 255, 255, 0.4);

          font-weight: 700;
          letter-spacing: 0.02em;
        }

        /* ---------------------------------------------------
           SELECT — restyled for dark
        --------------------------------------------------- */

        .form-group select.form-input {
          padding-right: 36px;

          background-image: url("data:image/svg+xml;utf8,<svg fill='rgba(255,255,255,0.5)' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");

          background-repeat: no-repeat;
          background-position: right 10px center;

          cursor: pointer;
        }

        .form-group select.form-input option {
          background: #1e293b;
          color: #f8fafc;
        }

        /* ---------------------------------------------------
           DATE — dark native picker
        --------------------------------------------------- */

        .form-group input[type="date"].form-input {
          color-scheme: dark;
        }

        /* ---------------------------------------------------
           PASSWORD WRAPPER
        --------------------------------------------------- */

        .password-wrapper {
          position: relative;
          width: 100%;
        }

        .password-wrapper .form-input {
          padding-right: 44px;
        }

        .password-toggle {
          position: absolute;

          right: 8px;
          top: 50%;

          width: 32px;
          height: 32px;

          transform: translateY(-50%);

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
          -webkit-tap-highlight-color: transparent;

          transition: color 0.2s ease;

          z-index: 3;
        }

        .password-toggle:hover:not(:disabled) {
          color: rgba(255, 255, 255, 0.9);
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ---------------------------------------------------
           CAPS LOCK WARNING
        --------------------------------------------------- */

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

        /* ---------------------------------------------------
           PASSWORD STRENGTH
        --------------------------------------------------- */

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

        /* ---------------------------------------------------
           REQUIRED / OPTIONAL MARKERS
        --------------------------------------------------- */

        .required-mark {
          color: #f87171;
        }

        .optional-mark {
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
          color: rgba(255, 255, 255, 0.35);
        }

        /* ---------------------------------------------------
           MISMATCH WARNING
        --------------------------------------------------- */

        .mismatch-warning {
          display: block;

          margin-top: 4px;

          font-size: 10px;

          color: #fca5a5;

          font-weight: 700;
          letter-spacing: 0.02em;
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

          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;

          background: rgba(255, 255, 255, 0.04);

          color: #f8fafc;

          cursor: pointer;

          font-family: inherit;
          font-weight: 600;
          font-size: 13px;

          margin-bottom: 8px;

          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;

          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .social-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
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
          border-top: 1px solid rgba(255, 255, 255, 0.08);
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
           REGISTER BUTTON — transparent, no green
        ====================================================== */

        .register-button {
          width: 100%;

          min-height: 52px;

          padding: 14px 24px;

          margin: 8px 0 0;

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

        .register-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.55);

          box-shadow:
            inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
            0 0 24px rgba(255, 255, 255, 0.12),
            0 4px 16px rgba(0, 0, 0, 0.3);

          transform: translateY(-1px);
        }

        .register-button:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
          background: rgba(255, 255, 255, 0.09);

          box-shadow:
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
            0 1px 6px rgba(0, 0, 0, 0.3);
        }

        .register-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: transparent;
          border-color: rgba(255, 255, 255, 0.15);
        }

        .register-button i,
        .register-button svg {
          font-size: 14px;
        }

        /* ======================================================
           ERROR
        ====================================================== */

        .register-error {
          width: 100%;

          overflow-wrap: anywhere;

          background: rgba(220, 38, 38, 0.12);
          color: #fca5a5;
          border: 1px solid rgba(220, 38, 38, 0.3);

          padding: 7px 11px;
          border-radius: 8px;

          margin-bottom: 12px;

          font-size: 12px;
          line-height: 1.4;
        }

        /* ======================================================
           FOOTERS — frosted pills
        ====================================================== */

        .auth-footer {
          width: 100%;

          text-align: center;

          margin-top: 14px;

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

        .back-link {
          width: 100%;

          text-align: center;

          margin-top: 6px;

          font-size: 11px;
          line-height: 1.4;

          color: rgba(255, 255, 255, 0.35);
        }

        .back-link a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;

          transition: color 0.2s ease;
        }

        .back-link a:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        /* ======================================================
           TABLET — smaller navbar, tighter gap
        ====================================================== */

        @media (max-width: 768px) {
          .register-wrapper {
            /* navbar ~44px + 24px gap = 68px */
            padding:
              calc(68px + env(safe-area-inset-top, 0px))
              12px
              12px;
          }

          .register-card {
            max-width: 420px;
            max-height:
              calc(100dvh - 80px - env(safe-area-inset-top, 0px));
          }

          .flying-plane {
            font-size: 44px;
          }
        }

        /* ======================================================
           MOBILE — smallest navbar
        ====================================================== */

        @media (max-width: 480px) {
          .register-wrapper {
            align-items: center;

            /* navbar ~42px + 18px gap = 60px */
            padding:
              calc(60px + env(safe-area-inset-top, 0px))
              8px
              8px;
          }

          .register-card {
            width: 100%;
            max-width: 400px;
            max-height:
              calc(100dvh - 68px - env(safe-area-inset-top, 0px));
            padding: 16px 14px;
            border-radius: 16px;
          }

          .register-card h2 {
            font-size: 14px;
            padding: 6px 16px;
            margin: 10px auto 10px;
          }

          .register-card .subtitle {
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

          .form-group .form-input {
            font-size: 16px !important;
            min-height: 42px;
            padding: 8px 11px;
            border-radius: 8px;
          }

          .password-wrapper .form-input {
            padding-right: 44px;
          }

          .password-toggle {
            right: 6px;
            width: 34px;
            height: 34px;
            font-size: 18px;
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

          .register-button {
            min-height: 48px;
            padding: 12px 20px;
            font-size: 14px;
            border-radius: 10px;
            letter-spacing: 0.08em;
            margin-top: 6px;
          }

          .auth-footer {
            margin-top: 12px;
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

          .register-error {
            margin-bottom: 10px;
            padding: 7px 10px;
            font-size: 11px;
          }
        }

        /* ======================================================
           VERY SMALL PHONES
        ====================================================== */

        @media (max-width: 360px) {
          .register-wrapper {
            /* navbar ~38px + 16px gap = 54px */
            padding:
              calc(54px + env(safe-area-inset-top, 0px))
              6px
              6px;
          }

          .register-card {
            padding: 14px 11px;
            border-radius: 14px;
            max-height:
              calc(100dvh - 60px - env(safe-area-inset-top, 0px));
          }

          .register-card h2 {
            font-size: 13px;
            padding: 5px 14px;
            margin: 8px auto 8px;
          }

          .register-card .subtitle {
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

          .form-group .form-input {
            min-height: 40px;
            font-size: 16px !important;
            padding: 7px 10px;
          }

          .social-btn {
            min-height: 36px;
            font-size: 11px;
            padding: 7px 8px;
          }

          .register-button {
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
           LANDSCAPE — short viewport, still reserve navbar
        ====================================================== */

        @media (max-height: 500px)
          and (orientation: landscape) {

          .register-wrapper {
            align-items: center;

            /* navbar ~46px + 14px gap = 60px */
            padding:
              calc(60px + env(safe-area-inset-top, 0px))
              8px
              8px;
          }

          .register-card {
            max-width: 500px;
            max-height:
              calc(100dvh - 68px - env(safe-area-inset-top, 0px));
            padding: 12px 16px;
            border-radius: 14px;
          }

          .register-card h2 {
            font-size: 13px;
            padding: 5px 14px;
            margin: 6px auto 8px;
          }

          .register-card .subtitle {
            margin-bottom: 6px;
            font-size: 11px;
          }

          .form-group {
            margin-bottom: 5px;
          }

          .form-group .form-input {
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

          .register-button {
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
           REDUCE MOTION
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          .exit-button,
          .sound-toggle,
          .password-toggle,
          .form-group .form-input,
          .social-btn,
          .auth-footer a,
          .register-button {
            transition: none;
          }

          .flying-plane {
            animation: none;
            display: none;
          }
        }

      `}</style>

      {/* ====================================================
          FLYING TAKEOVER PLANE
      ==================================================== */}

      <div
        className="flying-plane"
        aria-hidden="true"
      >
        <FaPlaneDeparture />
      </div>

      <div className="register-wrapper">
        <div className="register-card">

          {/* ====================================================
              EXIT BUTTON
          ==================================================== */}

          <button
            type="button"
            className="exit-button"
            onClick={handleExit}
            disabled={loading}
            aria-label="Close registration and return to home"
            title="Close — back to home (Esc)"
          >
            <AiOutlineClose />
          </button>

          {/* ====================================================
              SOUND TOGGLE
          ==================================================== */}

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

          {/* ====================================================
              HEADER
          ==================================================== */}

          <h2>
            Join BuyUk Used
          </h2>

          <p className="subtitle">
            {from !== "/"
              ? "Create an account to post your ad"
              : "Start buying and selling today"}
          </p>

          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (
            <div
              role="alert"
              className="register-error"
            >
              {error}
            </div>
          )}

          {/* ====================================================
              SOCIAL LOGIN
          ==================================================== */}

          <div>
            <button
              type="button"
              className="social-btn"
              onClick={() => {
                sounds.toggle();
                window.location.href =
                  `${API_URL}/auth/google`;
              }}
              disabled={loading}
            >
              <FcGoogle size={18} />
              Continue with Google
            </button>

            <button
              type="button"
              className="social-btn fb"
              onClick={() => {
                sounds.toggle();
                window.location.href =
                  `${API_URL}/auth/facebook`;
              }}
              disabled={loading}
            >
              <FaFacebookF size={16} />
              Continue with Facebook
            </button>
          </div>

          {/* ====================================================
              DIVIDER
          ==================================================== */}

          <div className="divider">
            <hr />
            <span>OR</span>
            <hr />
          </div>

          {/* ====================================================
              REGISTER FORM
          ==================================================== */}

          <form
            onSubmit={handleSubmit}
            id="register-form"
          >

            {/* ==================================================
                FULL NAME
            ================================================== */}

            <div className="form-group">
              <label htmlFor="register-name">
                Full Name
              </label>

              <input
                id="register-name"
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                minLength="2"
                autoComplete="name"
                disabled={loading}
              />

              <small>
                Minimum 2 characters
              </small>
            </div>

            {/* ==================================================
                EMAIL
            ================================================== */}

            <div className="form-group">
              <label htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                autoComplete="email"
                inputMode="email"
                disabled={loading}
              />
            </div>

            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div className="form-group">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  placeholder="Min 6 characters"
                  required
                  minLength="6"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => {
                    sounds.toggle();
                    setShowPassword(!showPassword);
                  }}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? (
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

              {formData.password && (
                <div className="password-strength">
                  <div className="password-strength-bar">
                    {[1, 2, 3, 4].map((segment) => {
                      const filled =
                        passwordStrength.score * 4 >= segment - 0.5;

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
            </div>

            {/* ==================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div className="form-group">
              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>

              <div className="password-wrapper">

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  minLength="6"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => {
                    sounds.toggle();
                    setShowConfirmPassword(
                      !showConfirmPassword
                    );
                  }}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </button>

              </div>

              {formData.confirmPassword &&
                formData.password &&
                formData.password !==
                  formData.confirmPassword && (
                  <span className="mismatch-warning">
                    ⚠️ Passwords do not match
                  </span>
                )}
            </div>

            {/* ==================================================
                PHONE
            ================================================== */}

            <div className="form-group">
              <label htmlFor="register-phone">
                Phone
              </label>

              <input
                id="register-phone"
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number (optional)"
                autoComplete="tel"
                inputMode="tel"
                disabled={loading}
              />
            </div>

            {/* ==================================================
                COUNTRY
            ================================================== */}

            <div className="form-group">
              <label htmlFor="register-country">
                Country{" "}
                <span className="required-mark">*</span>
              </label>

              <select
                id="register-country"
                name="country"
                className="form-input"
                value={formData.country}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="" disabled>
                  Select your country
                </option>

                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Egypt">Egypt</option>
                <option value="Morocco">Morocco</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
                <option value="Cameroon">Cameroon</option>
                <option value="Ivory Coast">Ivory Coast</option>
                <option value="Senegal">Senegal</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="China">China</option>
                <option value="India">India</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Other">Other</option>
              </select>

              <small>
                Select your country
              </small>
            </div>

            {/* ==================================================
                BIRTHDAY
            ================================================== */}

            <div className="form-group">
              <label htmlFor="register-birthday">
                Date of Birth{" "}
                <span className="optional-mark">(optional)</span>
              </label>

              <input
                id="register-birthday"
                type="date"
                name="birthday"
                className="form-input"
                value={formData.birthday}
                onChange={handleChange}
                max={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                disabled={loading}
              />

              <small>
                You must be at least 18 years old
              </small>
            </div>

            {/* ==================================================
                CREATE ACCOUNT BUTTON — single click
            ================================================== */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
              aria-label={
                loading
                  ? "Creating account"
                  : "Create account"
              }
            >
              {loading ? (
                <>
                  <i
                    className="fas fa-circle-notch fa-spin"
                    aria-hidden="true"
                  />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <i
                    className="fas fa-user-plus"
                    aria-hidden="true"
                  />
                  <span>CREATE ACCOUNT</span>
                </>
              )}
            </button>

          </form>

          {/* ====================================================
              ACCOUNT FOOTER
          ==================================================== */}

          <div className="auth-footer">
            Already have account?{" "}
            <Link
              to="/login"
              state={{ from }}
              onClick={() => sounds.toggle()}
            >
              Sign in
            </Link>
          </div>

          {/* ====================================================
              BACK LINK
          ==================================================== */}

          {from !== "/" && (
            <div className="back-link">
              <Link
                to="/"
                onClick={() => sounds.toggle()}
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

export default Register;