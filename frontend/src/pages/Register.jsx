// ============================================================
// frontend/src/pages/Register.jsx
// BuyUKUsed - Register Page
// ============================================================

import React, { useState, useRef } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import {
  AiFillEye,
  AiFillEyeInvisible,
} from "react-icons/ai";

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

  const { register } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // SLIDER STATE
  // ============================================================

  const [sliderProgress, setSliderProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef(null);
  const handleRef = useRef(null);

  const from = location.state?.from || "/";

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      evaluatePassword(value);
    }
  };

  // ============================================================
  // SLIDER LOGIC
  // ============================================================

  const startDrag = (e) => {
    if (loading) return;

    setIsDragging(true);

    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const onDrag = (e) => {
    if (!isDragging) return;

    const container = sliderRef.current;

    if (!container) return;

    const rect = container.getBoundingClientRect();

    const clientX = e.touches
      ? e.touches[0].clientX
      : e.clientX;

    let x = clientX - rect.left;

    const maxX = Math.max(
      1,
      rect.width - 64
    );

    x = Math.max(
      0,
      Math.min(x, maxX)
    );

    const progress = (x / maxX) * 100;

    setSliderProgress(progress);

    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const endDrag = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (sliderProgress >= 95) {
      handleSubmit(new Event("submit"));
      setSliderProgress(0);
    } else {
      setSliderProgress(0);
    }
  };

  // ============================================================
  // SLIDER EVENT LISTENERS
  // ============================================================

  React.useEffect(() => {
    const handleMouseMove = (e) => onDrag(e);

    const handleTouchMove = (e) => onDrag(e);

    const handleEnd = () => endDrag();

    if (isDragging) {
      document.addEventListener(
        "mousemove",
        handleMouseMove
      );

      document.addEventListener(
        "touchmove",
        handleTouchMove,
        { passive: false }
      );

      document.addEventListener(
        "mouseup",
        handleEnd
      );

      document.addEventListener(
        "touchend",
        handleEnd
      );
    }

    return () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "touchmove",
        handleTouchMove
      );

      document.removeEventListener(
        "mouseup",
        handleEnd
      );

      document.removeEventListener(
        "touchend",
        handleEnd
      );
    };
  }, [isDragging, sliderProgress]);

  // ============================================================
  // FORM SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setError("");

    // ----------------------------------------------------------
    // NAME VALIDATION
    // ----------------------------------------------------------

    if (formData.name.trim().length < 2) {
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
        navigate(from, {
          replace: true,
        });
      } else {
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

      setError(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
      setSliderProgress(0);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <style>{`
        /* ======================================================
           GLOBAL MOBILE SAFETY
           ====================================================== */

        html,
        body {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        /* ======================================================
           REGISTER WRAPPER
           ====================================================== */

        .register-wrapper {
          min-height: 100vh;
          min-height: 100dvh;

          width: 100%;
          max-width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 12px;

          overflow-x: hidden;

          background-image:
            linear-gradient(
              rgba(0, 0, 0, 0.55),
              rgba(0, 0, 0, 0.55)
            ),
            url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80");

          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;

          overscroll-behavior-x: none;
        }

        /* ======================================================
           REGISTER CARD
           ====================================================== */

        .register-card {
          max-width: 400px;
          width: 100%;

          padding: 16px 20px;

          background: #ffffff;

          border-radius: 14px;

          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.18);

          overflow: hidden;

          min-width: 0;
        }

        .register-card h2 {
          font-size: 20px;
          margin-bottom: 2px;
          text-align: center;
          font-weight: 800;
        }

        .register-card .subtitle {
          font-size: 13px;
          margin-bottom: 14px;
          text-align: center;
          color: var(--gray-500);
          font-weight: 900;
        }

        /* ======================================================
           FORM
           ====================================================== */

        .form-group {
          margin-bottom: 8px;
          width: 100%;
          min-width: 0;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 12px;
          margin-bottom: 2px;
        }

        .form-group input,
        .form-group select {
          display: block;

          width: 100%;
          max-width: 100%;

          min-width: 0;

          padding: 7px 12px;

          border: 1.5px solid var(--gray-200);

          border-radius: var(--radius-md);

          font-size: 13px;

          font-family: inherit;

          transition: var(--transition);

          background: white;

          box-sizing: border-box;

          appearance: auto;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;

          border-color: var(--primary);

          box-shadow:
            0 0 0 2px
            rgba(0, 0, 0, 0.05);
        }

        .form-group small {
          font-size: 11px;
          color: var(--gray-400);

          display: block;

          margin-top: 1px;

          font-weight: 900;
        }

        /* ======================================================
           SOCIAL BUTTONS
           ====================================================== */

        .social-btn {
          width: 100%;
          max-width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          padding: 9px 12px;

          border: 1px solid #ddd;

          border-radius: 50px;

          background: #fff;

          cursor: pointer;

          font-weight: 600;
          font-size: 13px;

          margin-bottom: 8px;

          box-sizing: border-box;

          -webkit-tap-highlight-color: transparent;
        }

        .social-btn.fb {
          border: none;
          background: #1877F2;
          color: #fff;
        }

        .social-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ======================================================
           DIVIDER
           ====================================================== */

        .divider {
          display: flex;
          align-items: center;

          width: 100%;

          margin: 8px 0 12px;
        }

        .divider hr {
          flex: 1;

          min-width: 0;

          border: none;

          border-top: 1px solid #e5e7eb;
        }

        .divider span {
          flex-shrink: 0;

          margin: 0 10px;

          color: #777;

          font-size: 13px;

          font-weight: 900;
        }

        /* ======================================================
           SLIDER
           ====================================================== */

        .slider-container {
          position: relative;

          width: calc(100% + 40px);

          margin-left: -20px;
          margin-right: -20px;

          height: 64px;

          background: #e5e7eb;

          border-radius: 0;

          overflow: hidden;

          margin-top: 4px;

          touch-action: none;

          user-select: none;

          -webkit-user-select: none;

          box-shadow:
            inset 0 2px 4px
            rgba(0, 0, 0, 0.06);

          max-width: none;
        }

        .slider-track {
          position: absolute;

          left: 0;
          top: 0;

          height: 100%;

          background: var(--secondary);

          border-radius: 0;

          transition:
            width 0.05s ease;

          width: ${sliderProgress}%;

          pointer-events: none;
        }

        .slider-text {
          position: absolute;

          left: 0;
          top: 0;

          width: 100%;
          height: 100%;

          display: flex;

          align-items: center;
          justify-content: center;

          font-weight: 700;

          font-size: 18px;

          color: #6b7280;

          pointer-events: none;

          transition:
            color 0.2s;

          padding-left: 70px;
          padding-right: 20px;

          text-align: center;
        }

        .slider-text.active {
          color: white;
        }

        .slider-handle {
          position: absolute;

          top: 4px;

          left: 4px;

          width: 56px;
          height: 56px;

          background: white;

          border-radius: 50%;

          box-shadow:
            0 6px 20px
            rgba(0, 0, 0, 0.3);

          cursor: grab;

          display: flex;

          align-items: center;
          justify-content: center;

          transition:
            left 0.05s ease;

          transform: translateX(0);

          touch-action: none;

          z-index: 2;

          -webkit-tap-highlight-color: transparent;
        }

        .slider-handle:active {
          cursor: grabbing;

          transform: scale(1.04);
        }

        .slider-handle svg {
          width: 32px;
          height: 32px;

          color: var(--secondary);

          transition:
            transform 0.2s;

          stroke-width: 2.5;
        }

        .slider-handle.done svg {
          color: #22c55e;
        }

        .slider-handle.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .slider-container.loading
        .slider-track {
          background: #9ca3af;
        }

        /* ======================================================
           FOOTER
           ====================================================== */

        .auth-footer {
          text-align: center;

          margin-top: 10px;

          font-size: 12px;

          color: var(--gray-500);

          width: 100%;
        }

        .auth-footer a {
          color: var(--primary);

          font-weight: 700;

          margin-left: 4px;

          text-decoration: none;
        }

        .back-link {
          text-align: center;

          margin-top: 6px;

          font-size: 12px;

          color: var(--gray-400);

          width: 100%;
        }

        /* ======================================================
           MOBILE
           ====================================================== */

        @media (max-width: 480px) {

          html,
          body {
            width: 100%;
            max-width: 100%;

            overflow-x: hidden;

            position: relative;
          }

          .register-wrapper {
            width: 100%;
            max-width: 100%;

            min-height: 100vh;
            min-height: 100dvh;

            padding: 8px;

            align-items: flex-start;

            justify-content: center;

            overflow-x: hidden;

            background-position: center;
          }

          .register-card {
            width: 100%;
            max-width: 400px;

            min-width: 0;

            padding: 10px 12px;

            border-radius: 10px;

            overflow: hidden;
          }

          .register-card h2 {
            font-size: 17px;

            line-height: 1.2;

            margin-bottom: 2px;
          }

          .register-card .subtitle {
            font-size: 12px;

            line-height: 1.3;

            margin-bottom: 8px;

            font-weight: 900;
          }

          /* ====================================================
             IMPORTANT:
             16PX PREVENTS MOBILE SAFARI AUTO-ZOOM
             ==================================================== */

          .form-group {
            width: 100%;

            margin-bottom: 6px;
          }

          .form-group label {
            font-size: 10px;

            margin-bottom: 2px;
          }

          .form-group input,
          .form-group select {
            width: 100%;
            max-width: 100%;

            height: 40px;

            padding: 8px 10px;

            font-size: 16px !important;

            line-height: 1.2;

            border-radius: 7px;

            box-sizing: border-box;

            /* Prevent iOS text inflation */
            -webkit-text-size-adjust: 100%;

            /* Prevent mobile Safari zoom */
            touch-action: manipulation;
          }

          .form-group small {
            font-size: 10px;

            line-height: 1.2;

            margin-top: 1px;

            font-weight: 900;
          }

          /* ====================================================
             PASSWORD WRAPPER
             ==================================================== */

          .form-group
          > div[style*="position: relative"] {
            width: 100% !important;
            max-width: 100% !important;
          }

          /* ====================================================
             SOCIAL BUTTONS
             ==================================================== */

          .social-btn {
            width: 100%;

            min-height: 38px;

            padding: 7px 10px;

            font-size: 12px;

            margin-bottom: 5px;

            border-radius: 50px;

            touch-action: manipulation;
          }

          /* ====================================================
             DIVIDER
             ==================================================== */

          .divider {
            width: 100%;

            margin: 5px 0 8px;
          }

          .divider span {
            font-size: 11px;

            margin: 0 8px;

            font-weight: 900;
          }

          /* ====================================================
             PASSWORD STRENGTH
             ==================================================== */

          .form-group
          div[style*="height: '3px'"] {
            max-width: 100%;
          }

          /* ====================================================
             MOBILE SLIDER
             IMPORTANT:
             Keep it inside the card.
             No negative width overflow.
             ==================================================== */

          .slider-container {
            width: calc(100% + 24px);

            max-width: none;

            margin-left: -12px;
            margin-right: -12px;

            height: 82px;

            margin-top: 8px;

            overflow: hidden;
          }

          .slider-track {
            height: 100%;
          }

          .slider-handle {
            width: 66px;
            height: 66px;

            top: 8px;

            left: 8px;

            border-radius: 50%;

            box-shadow:
              0 5px 16px
              rgba(0, 0, 0, 0.28);
          }

          .slider-handle svg {
            width: 38px;
            height: 38px;
          }

          .slider-text {
            width: 100%;

            padding-left: 72px;
            padding-right: 10px;

            font-size: 15px;

            line-height: 1.2;

            font-weight: 800;

            white-space: nowrap;
          }

          /* ====================================================
             IMPORTANT:
             Override inline slider left calculation behavior
             using the same React progress value.
             ==================================================== */

          .slider-handle {
            left: calc(${sliderProgress}% - 33px);
          }

          /* ====================================================
             FOOTERS
             ==================================================== */

          .auth-footer {
            font-size: 11px;

            line-height: 1.3;

            margin-top: 8px;
          }

          .back-link {
            font-size: 10px;

            line-height: 1.3;

            margin-top: 3px;
          }

          /* ====================================================
             EYE BUTTON
             ==================================================== */

          .form-group button {
            touch-action: manipulation;
          }
        }

        /* ======================================================
           VERY SMALL PHONES
           ====================================================== */

        @media (max-width: 360px) {

          .register-wrapper {
            padding: 5px;
          }

          .register-card {
            padding: 8px 10px;

            border-radius: 9px;
          }

          .register-card h2 {
            font-size: 16px;
          }

          .register-card .subtitle {
            font-size: 11px;

            margin-bottom: 6px;
          }

          .form-group input,
          .form-group select {
            height: 38px;

            font-size: 16px !important;

            padding: 7px 9px;
          }

          .social-btn {
            min-height: 36px;

            font-size: 11px;
          }

          .slider-container {
            height: 76px;

            width: calc(100% + 20px);

            margin-left: -10px;
            margin-right: -10px;
          }

          .slider-handle {
            width: 60px;
            height: 60px;

            top: 8px;
          }

          .slider-handle svg {
            width: 34px;
            height: 34px;
          }

          .slider-text {
            padding-left: 65px;

            font-size: 13px;
          }
        }

        /* ======================================================
           REDUCE MOTION
           ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          .register-card *,
          .register-card *::before,
          .register-card *::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* ======================================================
          REGISTER WRAPPER
          ====================================================== */}

      <div className="register-wrapper">
        <div className="register-card">

          {/* ====================================================
              HEADER
              ==================================================== */}

          <h2>
            Join BuyUk Used 🚀
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
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "6px 10px",
                borderRadius:
                  "var(--radius-sm)",
                marginBottom: "10px",
                fontSize: "12px",
                lineHeight: "1.3",
              }}
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
              onClick={() =>
                (window.location.href =
                  `${API_URL}/auth/google`)
              }
              disabled={loading}
            >
              <FcGoogle size={18} />

              Continue with Google
            </button>

            <button
              type="button"
              className="social-btn fb"
              onClick={() =>
                (window.location.href =
                  `${API_URL}/auth/facebook`)
              }
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

              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength="6"
                  autoComplete="new-password"
                  disabled={loading}
                  style={{
                    paddingRight: "36px",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: "16px",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    zIndex: 3,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </button>
              </div>

              {/* PASSWORD STRENGTH */}

              {formData.password && (
                <div
                  style={{
                    marginTop: "3px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "3px",
                      background: "#e5e7eb",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width:
                          `${passwordStrength.score * 100}%`,
                        height: "100%",
                        background:
                          passwordStrength.color,
                        transition:
                          "width 0.3s ease, background 0.3s ease",
                        borderRadius: "4px",
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: "10px",
                      color:
                        passwordStrength.color,
                      fontWeight: 600,
                    }}
                  >
                    {
                      passwordStrength.label
                    }
                  </span>
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

              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  minLength="6"
                  autoComplete="new-password"
                  disabled={loading}
                  style={{
                    paddingRight: "36px",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: "16px",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    zIndex: 3,
                  }}
                  tabIndex={-1}
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
                  <small
                    style={{
                      color: "#dc2626",
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    ⚠️ Passwords do not match
                  </small>
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
                <span
                  style={{
                    color: "#dc2626",
                  }}
                >
                  *
                </span>
              </label>

              <select
                id="register-country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option
                  value=""
                  disabled
                >
                  Select your country
                </option>

                <option value="Ghana">
                  Ghana
                </option>

                <option value="Nigeria">
                  Nigeria
                </option>

                <option value="Kenya">
                  Kenya
                </option>

                <option value="South Africa">
                  South Africa
                </option>

                <option value="Egypt">
                  Egypt
                </option>

                <option value="Morocco">
                  Morocco
                </option>

                <option value="Tanzania">
                  Tanzania
                </option>

                <option value="Uganda">
                  Uganda
                </option>

                <option value="Cameroon">
                  Cameroon
                </option>

                <option value="Ivory Coast">
                  Ivory Coast
                </option>

                <option value="Senegal">
                  Senegal
                </option>

                <option value="United States">
                  United States
                </option>

                <option value="United Kingdom">
                  United Kingdom
                </option>

                <option value="Canada">
                  Canada
                </option>

                <option value="Germany">
                  Germany
                </option>

                <option value="France">
                  France
                </option>

                <option value="China">
                  China
                </option>

                <option value="India">
                  India
                </option>

                <option value="United Arab Emirates">
                  United Arab Emirates
                </option>

                <option value="Other">
                  Other
                </option>
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
                <span
                  style={{
                    fontWeight: 400,
                    color: "var(--gray-400)",
                  }}
                >
                  (optional)
                </span>
              </label>

              <input
                id="register-birthday"
                type="date"
                name="birthday"
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
                SLIDER BUTTON
                ================================================== */}

            <div
              className={
                `slider-container ${
                  loading
                    ? "loading"
                    : ""
                }`
              }
              ref={sliderRef}
            >
              <div
                className="slider-track"
                style={{
                  width:
                    `${sliderProgress}%`,
                }}
              />

              <div
                className={
                  `slider-text ${
                    sliderProgress >= 10
                      ? "active"
                      : ""
                  }`
                }
              >
                {loading
                  ? "Creating account..."
                  : "Slide to create account →"}
              </div>

              <div
                className={
                  `slider-handle ${
                    loading
                      ? "disabled"
                      : ""
                  } ${
                    sliderProgress >= 95
                      ? "done"
                      : ""
                  }`
                }
                ref={handleRef}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                style={{
                  left:
                    `calc(${sliderProgress}% - 28px)`,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />

                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* End slider */}
          </form>

          {/* ====================================================
              ACCOUNT FOOTER
              ==================================================== */}

          <div className="auth-footer">
            Already have account?

            <Link
              to="/login"
              state={{ from }}
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
                style={{
                  color:
                    "var(--gray-500)",
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

export default Register;