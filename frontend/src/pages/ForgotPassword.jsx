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
           FORGOT PASSWORD PAGE
        ===================================================== */

        .forgot-password-wrapper {
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 20px;
          overflow-x: hidden;

          background-image:
            linear-gradient(
              rgba(0,0,0,0.55),
              rgba(0,0,0,0.55)
            ),
            url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80');

          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .forgot-password-container {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .forgot-password-card {
          width: 100%;
          max-width: 440px;
          box-sizing: border-box;
          padding: 32px;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .forgot-password-title {
          text-align: center;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 800;
          margin: 0 0 8px;
        }

        .forgot-password-subtitle {
          text-align: center;
          color: var(--gray-500);
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 24px;
        }

        /* =====================================================
           MESSAGES
        ===================================================== */

        .forgot-password-message {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          font-size: 14px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .forgot-password-success {
          background: #dcfce7;
          color: #166534;
        }

        .forgot-password-error {
          background: #fee2e2;
          color: #b91c1c;
        }

        /* =====================================================
           FORM
        ===================================================== */

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
        }

        .forgot-password-input {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;

          padding: 13px 15px;

          border: 1.5px solid var(--gray-200);
          border-radius: var(--radius-md);

          font-size: 14px;
          line-height: 1.4;
          font-family: inherit;

          background: #ffffff;
          color: inherit;

          outline: none;

          appearance: none;
          -webkit-appearance: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .forgot-password-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(0,0,0,0.04);
        }

        .forgot-password-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* =====================================================
           SEND BUTTON
        ===================================================== */

        .forgot-password-submit {
          display: block;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;

          padding: 14px;

          border: none;
          border-radius: 50px;

          background: var(--primary);
          color: #ffffff;

          font-family: inherit;
          font-weight: 700;
          font-size: 16px;
          line-height: 1.2;

          cursor: pointer;

          transition:
            opacity 0.2s ease,
            transform 0.15s ease;
        }

        .forgot-password-submit:hover:not(:disabled) {
          opacity: 0.92;
        }

        .forgot-password-submit:active:not(:disabled) {
          transform: scale(0.99);
        }

        .forgot-password-submit:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        /* =====================================================
           BACK TO LOGIN
        ===================================================== */

        .forgot-password-back {
          width: 100%;
          box-sizing: border-box;
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
        }

        .forgot-password-back a {
          color: var(--primary);
          font-weight: 700;
          text-decoration: none;
        }

        /* =====================================================
           MOBILE
           
           IMPORTANT:
           16px input font prevents iOS Safari from
           automatically zooming the page when the input
           receives focus.
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

            border-radius: 10px;

            box-shadow:
              0 5px 20px rgba(0,0,0,0.16);
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
            border-radius: 7px;
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

            /*
             * DO NOT reduce this below 16px.
             * iPhone Safari zooms inputs below 16px.
             */
            font-size: 16px !important;

            line-height: 1.35;

            border-radius: 7px;
          }

          .forgot-password-submit {
            width: 100%;
            padding: 12px 10px;
            font-size: 14px;
          }

          .forgot-password-back {
            margin-top: 12px;
            font-size: 12px;
          }
        }

        /* =====================================================
           VERY SMALL PHONES
        ===================================================== */

        @media (max-width: 360px) {

          .forgot-password-wrapper {
            padding: 8px 5px;
          }

          .forgot-password-card {
            padding: 14px 10px;
            border-radius: 9px;
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

        /* =====================================================
           LANDSCAPE MOBILE
        ===================================================== */

        @media (max-width: 768px) and (orientation: landscape) {

          .forgot-password-wrapper {
            align-items: flex-start;
            padding-top: 10px;
            padding-bottom: 10px;
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