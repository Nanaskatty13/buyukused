// ============================================================
// frontend/src/pages/Login.jsx
// BuyUKUsed Login Page
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

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔗 Login API_URL:", API_URL);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  // ============================================================
  // SLIDER STATE
  // ============================================================

  const [sliderProgress, setSliderProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef(null);
  const handleRef = useRef(null);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = await login(
        normalizedEmail,
        password
      );

      if (result?.success) {
        navigate(from, {
          replace: true,
        });

        return;
      }

      setError(
        result?.error ||
          result?.message ||
          "Login failed. Please check your email and password."
      );
    } catch (err) {
      console.error("❌ Login error:", err);

      setError(
        err?.response?.data?.message ||
          err?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      setSliderProgress(0);
    }
  };

  // ============================================================
  // SLIDER LOGIC
  // ============================================================

  const startDrag = (e) => {
    if (loading) {
      return;
    }

    setIsDragging(true);

    if (e?.preventDefault) {
      e.preventDefault();
    }
  };

  const onDrag = (e) => {
    if (!isDragging || loading) {
      return;
    }

    const container = sliderRef.current;

    if (!container) {
      return;
    }

    const rect =
      container.getBoundingClientRect();

    const clientX = e.touches
      ? e.touches[0].clientX
      : e.clientX;

    // ----------------------------------------------------------
    // Handle dimensions
    // ----------------------------------------------------------

    const isMobile =
      window.innerWidth <= 480;

    const handleSize = isMobile
      ? 54
      : 58;

    const padding = 3;

    const maxX =
      rect.width -
      handleSize -
      padding * 2;

    let x =
      clientX -
      rect.left -
      handleSize / 2;

    x = Math.max(
      0,
      Math.min(x, maxX)
    );

    const progress =
      maxX > 0
        ? (x / maxX) * 100
        : 0;

    setSliderProgress(progress);

    if (e?.preventDefault) {
      e.preventDefault();
    }
  };

  const endDrag = () => {
    if (!isDragging) {
      return;
    }

    setIsDragging(false);

    if (sliderProgress >= 95) {
      setSliderProgress(100);

      handleSubmit(
        new Event("submit")
      );
    } else {
      setSliderProgress(0);
    }
  };

  // ============================================================
  // SLIDER EVENTS
  // ============================================================

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      onDrag(e);
    };

    const handleTouchMove = (e) => {
      onDrag(e);
    };

    const handleEnd = () => {
      endDrag();
    };

    if (isDragging) {
      document.addEventListener(
        "mousemove",
        handleMouseMove
      );

      document.addEventListener(
        "touchmove",
        handleTouchMove,
        {
          passive: false,
        }
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
  }, [
    isDragging,
    sliderProgress,
  ]);

  // ============================================================
  // SOCIAL LOGIN
  // ============================================================

  const handleGoogleLogin = () => {
    setError("");

    window.location.href =
      `${API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    setError("");

    window.location.href =
      `${API_URL}/auth/facebook`;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <style>{`

        /* ======================================================
           GLOBAL LOGIN PAGE
        ====================================================== */

        .login-wrapper,
        .login-wrapper * {
          box-sizing: border-box;
        }

        .login-wrapper {
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;

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
           LOGIN CARD
        ====================================================== */

        .login-card {
          width: 100%;
          max-width: 400px;

          padding: 16px 20px;

          background: #ffffff;

          border-radius: 14px;

          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.18);

          overflow: hidden;
        }

        .login-card h2 {
          margin: 0 0 2px;

          font-size: 20px;

          line-height: 1.25;

          text-align: center;

          font-weight: 800;
        }

        .login-card .subtitle {
          margin: 0 0 14px;

          font-size: 13px;

          line-height: 1.35;

          text-align: center;

          color: var(--gray-500);

          font-weight: 900;
        }

        /* ======================================================
           FORM
        ====================================================== */

        .form-group {
          width: 100%;
          margin-bottom: 8px;
        }

        .form-group label {
          display: block;

          margin-bottom: 2px;

          font-size: 12px;

          line-height: 1.2;

          font-weight: 600;
        }

        .form-group input {
          display: block;

          width: 100%;

          min-width: 0;

          padding: 7px 12px;

          border:
            1.5px solid
            var(--gray-200);

          border-radius:
            var(--radius-md);

          background: #ffffff;

          color: #111827;

          font-family: inherit;

          /*
           * IMPORTANT:
           * 16px prevents mobile Safari from
           * automatically zooming when input
           * receives focus.
           */
          font-size: 16px;

          line-height: 1.35;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;

          -webkit-appearance: none;
          appearance: none;
        }

        .form-group input:focus {
          border-color:
            var(--primary);

          box-shadow:
            0 0 0 2px
            rgba(0, 0, 0, 0.05);
        }

        .form-group input:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .form-group small {
          display: block;

          margin-top: 1px;

          font-size: 10px;

          color: var(--gray-400);

          font-weight: 900;
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

          color: #64748b;

          cursor: pointer;

          font-size: 18px;

          touch-action: manipulation;

          -webkit-tap-highlight-color:
            transparent;
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
            1px solid #ddd;

          border-radius: 50px;

          background: #fff;

          cursor: pointer;

          font-family: inherit;

          font-weight: 600;

          font-size: 13px;

          margin-bottom: 8px;

          touch-action: manipulation;

          -webkit-tap-highlight-color:
            transparent;
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

        /* ======================================================
           DIVIDER
        ====================================================== */

        .divider {
          width: 100%;

          display: flex;
          align-items: center;

          margin: 8px 0 12px;
        }

        .divider hr {
          flex: 1;

          min-width: 0;

          border: none;

          border-top:
            1px solid #e5e7eb;
        }

        .divider span {
          flex: 0 0 auto;

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

          width: 100%;

          height: 64px;

          margin: 4px 0 0;

          background: #e5e7eb;

          border-radius: 12px;

          overflow: hidden;

          touch-action: none;

          user-select: none;

          -webkit-user-select: none;

          -webkit-touch-callout: none;

          box-shadow:
            inset 0 2px 4px
            rgba(0, 0, 0, 0.06);
        }

        .slider-track {
          position: absolute;

          left: 0;
          top: 0;

          height: 100%;

          background:
            var(--primary);

          border-radius: 12px 0 0 12px;

          transition:
            width 0.05s linear;

          pointer-events: none;

          z-index: 1;
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

          padding:
            0 65px;

          text-align: center;

          font-size: 17px;

          line-height: 1.2;

          font-weight: 700;

          color: #6b7280;

          pointer-events: none;

          transition:
            color 0.2s ease;

          z-index: 3;
        }

        .slider-text.active {
          color: #ffffff;
        }

        .slider-handle {
          position: absolute;

          top: 3px;

          left: 3px;

          width: 58px;
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #ffffff;

          border-radius: 50%;

          box-shadow:
            0 6px 20px
            rgba(0, 0, 0, 0.3);

          cursor: grab;

          transition:
            left 0.05s linear,
            transform 0.15s ease;

          touch-action: none;

          z-index: 5;

          -webkit-tap-highlight-color:
            transparent;
        }

        .slider-handle:active {
          cursor: grabbing;

          transform:
            scale(1.04);
        }

        .slider-handle svg {
          width: 38px;
          height: 38px;

          color:
            var(--primary);

          transition:
            transform 0.2s ease;
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
          width: 100%;

          text-align: center;

          margin-top: 10px;

          font-size: 12px;

          line-height: 1.4;

          color: var(--gray-500);
        }

        .auth-footer a {
          color: var(--primary);

          font-weight: 700;

          margin-left: 4px;

          text-decoration: none;
        }

        .back-link {
          width: 100%;

          text-align: center;

          margin-top: 6px;

          font-size: 12px;

          line-height: 1.4;

          color: var(--gray-400);
        }

        .back-link a {
          color:
            var(--gray-500);
        }

        /* ======================================================
           ERROR
        ====================================================== */

        .login-error {
          width: 100%;

          overflow-wrap: anywhere;

          background: #fee2e2;

          color: #dc2626;

          padding: 6px 10px;

          border-radius: 8px;

          margin-bottom: 10px;

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
          }
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
          }

          .login-wrapper {
            width: 100%;

            min-height: 100vh;
            min-height: 100dvh;

            display: flex;

            align-items: flex-start;

            justify-content: center;

            padding:
              12px 8px 16px;

            overflow-x: hidden;

            /*
             * Don't allow the page to move
             * sideways when keyboard opens.
             */
            position: relative;

            left: 0;
            right: 0;
          }

          .login-card {
            width: 100%;

            max-width: 400px;

            margin: 0 auto;

            padding:
              12px 12px 14px;

            border-radius: 12px;

            overflow: hidden;
          }

          .login-card h2 {
            font-size: 18px;

            line-height: 1.25;

            margin-bottom: 2px;
          }

          .login-card .subtitle {
            font-size: 12px;

            line-height: 1.35;

            margin-bottom: 9px;
          }

          /* ====================================================
             MOBILE FORM
          ==================================================== */

          .form-group {
            margin-bottom: 6px;
          }

          .form-group label {
            font-size: 11px;

            margin-bottom: 2px;
          }

          .form-group input {
            width: 100%;

            /*
             * CRITICAL:
             * Keep input at 16px on mobile.
             * This stops iOS Safari from zooming
             * into the input.
             */
            font-size: 16px !important;

            min-height: 42px;

            padding:
              8px 10px;

            border-radius: 7px;
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

          /* ====================================================
             SOCIAL BUTTONS
          ==================================================== */

          .social-btn {
            width: 100%;

            min-height: 40px;

            padding:
              8px 10px;

            margin-bottom: 6px;

            font-size: 12px;
          }

          /* ====================================================
             DIVIDER
          ==================================================== */

          .divider {
            margin:
              6px 0 9px;
          }

          .divider span {
            margin:
              0 8px;

            font-size: 11px;
          }

          /* ====================================================
             FORGOT PASSWORD
          ==================================================== */

          .forgot-password-row {
            width: 100%;

            margin-top: 4px;

            margin-bottom: 10px;
          }

          /* ====================================================
             MOBILE SLIDER
          ==================================================== */

          .slider-container {
            /*
             * IMPORTANT:
             * No calc(100% + ...)
             * No negative margins.
             *
             * This keeps the slider completely
             * inside the login card.
             */
            width: 100%;

            height: 64px;

            margin:
              5px 0 0;

            border-radius: 12px;

            overflow: hidden;
          }

          .slider-track {
            height: 100%;

            border-radius:
              12px 0 0 12px;
          }

          .slider-text {
            width: 100%;

            height: 100%;

            padding:
              0 62px;

            font-size: 15px;

            font-weight: 800;

            white-space: nowrap;
          }

          .slider-handle {
            width: 54px;
            height: 54px;

            top: 5px;
            left: 5px;

            box-shadow:
              0 4px 14px
              rgba(0, 0, 0, 0.25);
          }

          .slider-handle svg {
            width: 32px;
            height: 32px;
          }

          /* ====================================================
             FOOTERS
          ==================================================== */

          .auth-footer {
            margin-top: 8px;

            font-size: 11px;

            line-height: 1.4;
          }

          .back-link {
            margin-top: 3px;

            font-size: 11px;
          }

          .login-error {
            margin-bottom: 8px;

            padding:
              7px 9px;

            font-size: 11px;
          }
        }

        /* ======================================================
           VERY SMALL PHONES
        ====================================================== */

        @media (max-width: 360px) {

          .login-wrapper {
            padding:
              8px 6px 12px;
          }

          .login-card {
            padding:
              10px 9px 12px;

            border-radius: 10px;
          }

          .login-card h2 {
            font-size: 17px;
          }

          .login-card .subtitle {
            font-size: 11px;

            margin-bottom: 7px;
          }

          .form-group {
            margin-bottom: 5px;
          }

          .form-group label {
            font-size: 10px;
          }

          .form-group input {
            min-height: 40px;

            font-size: 16px !important;

            padding:
              7px 9px;
          }

          .social-btn {
            min-height: 38px;

            font-size: 11px;

            padding:
              7px 8px;
          }

          .slider-container {
            height: 60px;
          }

          .slider-handle {
            width: 50px;
            height: 50px;

            top: 5px;
            left: 5px;
          }

          .slider-handle svg {
            width: 29px;
            height: 29px;
          }

          .slider-text {
            padding:
              0 56px;

            font-size: 13px;
          }

          .auth-footer,
          .back-link {
            font-size: 10px;
          }
        }

        /* ======================================================
           LANDSCAPE MOBILE
        ====================================================== */

        @media (max-height: 500px)
          and (orientation: landscape) {

          .login-wrapper {
            align-items: flex-start;

            padding:
              8px;
          }

          .login-card {
            max-width: 420px;

            padding:
              8px 12px;
          }

          .login-card h2 {
            font-size: 17px;
          }

          .login-card .subtitle {
            margin-bottom: 5px;
          }

          .form-group {
            margin-bottom: 4px;
          }

          .form-group input {
            min-height: 38px;
          }

          .social-btn {
            min-height: 36px;

            padding:
              6px 10px;
          }

          .slider-container {
            height: 52px;
          }

          .slider-handle {
            width: 44px;
            height: 44px;

            top: 4px;
            left: 4px;
          }

          .slider-handle svg {
            width: 27px;
            height: 27px;
          }
        }

      `}</style>

      <div className="login-wrapper">
        <div className="login-card">

          <h2>
            Welcome Back 👋
          </h2>

          <p className="subtitle">
            {from !== "/"
              ? "Login to continue posting your ad"
              : "Login to your account"}
          </p>

          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (
            <div
              role="alert"
              className="login-error"
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

          {/* ====================================================
              DIVIDER
          ==================================================== */}

          <div className="divider">
            <hr />

            <span>
              OR
            </span>

            <hr />
          </div>

          {/* ====================================================
              LOGIN FORM
          ==================================================== */}

          <form
            onSubmit={handleSubmit}
            id="login-form"
          >

            {/* ==================================================
                EMAIL
            ================================================== */}

            <div className="form-group">
              <label htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
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

            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div className="form-group">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </button>

              </div>
            </div>

            {/* ==================================================
                FORGOT PASSWORD
            ================================================== */}

            <div
              className="forgot-password-row"
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                width: "100%",
                marginTop: "5px",
                marginBottom: "14px",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color:
                    "var(--primary)",
                  fontSize: "13px",
                  fontWeight: 900,
                  textDecoration:
                    "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* ==================================================
                SLIDER LOGIN
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
                  ? "Logging in..."
                  : "Slide to log in →"}
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
                    `calc(${Math.min(
                      sliderProgress,
                      100
                    )}% - ${
                      window.innerWidth <= 480
                        ? 27
                        : 29
                    }px)`,
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

          </form>

          {/* ====================================================
              CREATE ACCOUNT
          ==================================================== */}

          <div className="auth-footer">
            No account?{" "}

            <Link
              to="/register"
              state={{ from }}
            >
              Create free account
            </Link>
          </div>

          {/* ====================================================
              BACK HOME
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

export default Login;