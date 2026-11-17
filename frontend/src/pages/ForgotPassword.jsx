// frontend/src/pages/ForgotPassword.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔗 Forgot Password API_URL:", API_URL);

// ============================================================
// FORGOT PASSWORD PAGE
// ============================================================

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    // --------------------------------------------------------
    // Validate email
    // --------------------------------------------------------

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      console.log(
        "📧 Sending password reset request..."
      );

      const response = await axios.post(
        `${API_URL}/api/password/forgot`,
        {
          email: normalizedEmail,
        },
        {
          timeout: 60000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log(
        "✅ Password reset response:",
        response.data
      );

      if (response.data?.success === false) {
        setError(
          response.data?.message ||
            "Unable to process your request."
        );

        return;
      }

      setSuccess(
        response.data?.message ||
          "If that email exists, a password reset link has been sent."
      );

      setEmail("");
    } catch (err) {
      console.error(
        "❌ Forgot password error:",
        err
      );

      if (
        err.code === "ECONNABORTED" ||
        err.code === "ETIMEDOUT"
      ) {
        setError(
          "The server took too long to respond. Please try again in a moment."
        );

        return;
      }

      if (err.response) {
        console.error(
          "❌ Backend response:",
          err.response.data
        );

        setError(
          err.response.data?.message ||
            `Request failed with status ${err.response.status}.`
        );

        return;
      }

      if (
        err.message === "Network Error" ||
        !err.response
      ) {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );

        return;
      }

      setError(
        "Unable to process your request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <style>{`
        /* =====================================================
           LIQUID iOS27 — FORGOT PASSWORD PAGE
           ===================================================== */

        @keyframes forgot-liquid-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33%      { transform: translate3d(-30px, 24px, 0) scale(1.06); }
          66%      { transform: translate3d(24px, -20px, 0) scale(0.97); }
        }

        /* ─── Page — liquid mirror backdrop ─────────────── */
        .forgot-password-wrapper {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 20px;
          overflow-x: hidden;

          background: linear-gradient(
            135deg,
            #eef4ff 0%,
            #f5f0ff 40%,
            #eaf7ff 70%,
            #f2f8ff 100%
          );
        }

        .forgot-password-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(circle at 8% 15%, rgba(0,102,204,0.24) 0%, rgba(0,102,204,0.08) 25%, transparent 55%),
            radial-gradient(circle at 92% 60%, rgba(139,92,246,0.20) 0%, rgba(139,92,246,0.06) 25%, transparent 55%),
            radial-gradient(circle at 50% 115%, rgba(6,182,212,0.20) 0%, rgba(6,182,212,0.06) 25%, transparent 55%),
            radial-gradient(circle at 30% 80%, rgba(59,130,246,0.14) 0%, transparent 50%);
          animation: forgot-liquid-float 24s ease-in-out infinite;
          will-change: transform;
        }

        .forgot-password-container {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* ─── Card — liquid glass ───────────────────────── */
        .forgot-password-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          box-sizing: border-box;
          padding: 32px;
          border-radius: 20px;
          overflow: hidden;

          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(238,246,255,0.42) 50%,
            rgba(255,255,255,0.62) 100%
          );
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow:
            0 24px 60px rgba(31,38,135,0.20),
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(255,255,255,0.25);
        }

        /* ─── Header ────────────────────────────────────── */
        .forgot-password-title {
          text-align: center;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 800;
          margin: 0 0 8px;
          color: #111827;
        }

        .forgot-password-subtitle {
          text-align: center;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 24px;
        }

        /* ─── Messages — liquid glass banners ───────────── */
        .forgot-password-message {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 12px;
          margin-bottom: 18px;
          font-size: 14px;
          line-height: 1.5;
          overflow-wrap: anywhere;
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 4px 18px rgba(31,38,135,0.08);
        }

        .forgot-password-success {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.65) 0%,
            rgba(220,252,231,0.65) 100%
          );
          color: #166534;
          border-color: rgba(187,247,208,0.75);
        }

        .forgot-password-error {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.65) 0%,
            rgba(254,226,226,0.6) 100%
          );
          color: #b91c1c;
          border-color: rgba(252,165,165,0.55);
        }

        /* ─── Form ──────────────────────────────────────── */
        .forgot-password-form-group {
          width: 100%;
          margin-bottom: 18px;
          box-sizing: border-box;
        }

        .forgot-password-label {
          display: block;
          width: 100%;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 6px;
          color: #111827;
        }

        /* ─── Input — liquid glass ──────────────────────── */
        .forgot-password-input {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding: 13px 15px;
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
          font-family: inherit;
          color: #111827;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(255,255,255,0.38) 100%
          );
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 2px 10px rgba(31,38,135,0.06);
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .forgot-password-input:focus {
          border-color: rgba(0,102,204,0.6);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,1),
            0 0 0 3px rgba(0,102,204,0.14),
            0 4px 14px rgba(31,38,135,0.10);
        }

        .forgot-password-input::placeholder {
          color: #8696a0;
        }

        .forgot-password-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* ─── Send button — liquid blue glass ───────────── */
        .forgot-password-submit {
          display: block;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 14px;
          color: #ffffff;
          font-family: inherit;
          font-weight: 700;
          font-size: 16px;
          line-height: 1.2;
          cursor: pointer;
          background: linear-gradient(
            135deg,
            rgba(0,102,204,0.94) 0%,
            rgba(0,85,165,0.88) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 4px 14px rgba(0,102,204,0.30);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .forgot-password-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 8px 24px rgba(0,102,204,0.42);
        }

        .forgot-password-submit:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }

        .forgot-password-submit:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.3),
            0 2px 8px rgba(0,102,204,0.15);
        }

        /* ─── Back to login link ────────────────────────── */
        .forgot-password-back {
          width: 100%;
          box-sizing: border-box;
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #4b5563;
        }

        .forgot-password-back a {
          color: #0066cc;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .forgot-password-back a:hover {
          color: #0055a5;
        }

        /* =====================================================
           MOBILE
           ===================================================== */
        @media (max-width: 480px) {
          html,
          body {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }

          .forgot-password-wrapper {
            width: 100%;
            min-height: 100vh;
            min-height: 100dvh;
            padding: 12px 8px;
            align-items: flex-start;
            justify-content: center;
            overflow-x: hidden;
          }

          .forgot-password-container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
          }

          .forgot-password-card {
            width: 100%;
            max-width: 100%;
            padding: 16px 12px;
            border-radius: 16px;
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
          }

          .forgot-password-title {
            font-size: 19px;
            margin-bottom: 6px;
          }

          .forgot-password-subtitle {
            font-size: 13px;
            line-height: 1.45;
            margin-bottom: 14px;
          }

          .forgot-password-message {
            padding: 9px 10px;
            margin-bottom: 12px;
            font-size: 12px;
            line-height: 1.45;
            border-radius: 10px;
          }

          .forgot-password-form-group {
            margin-bottom: 12px;
          }

          .forgot-password-label {
            font-size: 11px;
            margin-bottom: 4px;
          }

          .forgot-password-input {
            width: 100%;
            max-width: 100%;
            padding: 10px 11px;
            /* DO NOT reduce below 16px — prevents iOS auto-zoom */
            font-size: 16px !important;
            line-height: 1.35;
            border-radius: 10px;
          }

          .forgot-password-submit {
            width: 100%;
            padding: 12px 10px;
            font-size: 14px;
            border-radius: 12px;
          }

          .forgot-password-back {
            margin-top: 12px;
            font-size: 12px;
          }
        }

        /* ─── Very small phones ─────────────────────────── */
        @media (max-width: 360px) {
          .forgot-password-wrapper {
            padding: 8px 5px;
          }
          .forgot-password-card {
            padding: 14px 10px;
            border-radius: 14px;
          }
          .forgot-password-title {
            font-size: 18px;
          }
          .forgot-password-subtitle {
            font-size: 12px;
          }
          .forgot-password-input {
            padding: 9px 10px;
            font-size: 16px !important;
          }
          .forgot-password-submit {
            padding: 11px 10px;
            font-size: 13px;
          }
        }

        /* ─── Landscape mobile ──────────────────────────── */
        @media (max-width: 768px) and (orientation: landscape) {
          .forgot-password-wrapper {
            align-items: flex-start;
            padding-top: 10px;
            padding-bottom: 10px;
          }
        }

        /* ─── Reduced motion ────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .forgot-password-wrapper::before { animation: none !important; }
          .forgot-password-input,
          .forgot-password-submit,
          .forgot-password-back a {
            transition: none !important;
          }
          .forgot-password-submit:hover:not(:disabled) {
            transform: none !important;
          }
        }
      `}</style>

      <div className="forgot-password-wrapper">
        <div className="forgot-password-container">

          <div className="forgot-password-card">

            {/* ==================================================
                HEADER
            ================================================== */}

            <h2 className="forgot-password-title">
              Forgot Password?
            </h2>

            <p className="forgot-password-subtitle">
              Enter the email address associated with
              your account and we'll send you a password
              reset link.
            </p>

            {/* ==================================================
                SUCCESS MESSAGE
            ================================================== */}

            {success && (
              <div
                role="status"
                aria-live="polite"
                className="
                  forgot-password-message
                  forgot-password-success
                "
              >
                {success}
              </div>
            )}

            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="
                  forgot-password-message
                  forgot-password-error
                "
              >
                {error}
              </div>
            )}

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="forgot-password-form-group">

                <label
                  htmlFor="forgot-password-email"
                  className="forgot-password-label"
                >
                  Email Address
                </label>

                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  disabled={loading}
                  className="forgot-password-input"
                />

              </div>

              {/* ==================================================
                  SEND BUTTON
              ================================================== */}

              <button
                type="submit"
                disabled={loading}
                className="forgot-password-submit"
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>
            </form>

            {/* ==================================================
                BACK TO LOGIN
            ================================================== */}

            <div className="forgot-password-back">
              <Link to="/login">
                ← Back to Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;