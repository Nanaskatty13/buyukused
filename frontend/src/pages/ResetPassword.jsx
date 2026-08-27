import React, { useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";
import axios from "axios";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔗 Reset Password API_URL:", API_URL);

// ============================================================
// RESET PASSWORD PAGE
// ============================================================

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setMessage("");

    // --------------------------------------------------------
    // CHECK TOKEN
    // --------------------------------------------------------

    if (!token || !token.trim()) {
      setError(
        "This password reset link is invalid or missing."
      );
      return;
    }

    // --------------------------------------------------------
    // NORMALIZE PASSWORD
    // --------------------------------------------------------

    const newPassword = String(password);
    const newConfirmPassword =
      String(confirmPassword);

    // --------------------------------------------------------
    // PASSWORD REQUIRED
    // --------------------------------------------------------

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (!newConfirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    // --------------------------------------------------------
    // PASSWORD LENGTH
    // --------------------------------------------------------

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    // --------------------------------------------------------
    // PASSWORD MATCH
    // --------------------------------------------------------

    if (
      newPassword !==
      newConfirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    // --------------------------------------------------------
    // START LOADING
    // --------------------------------------------------------

    setLoading(true);

    try {
      console.log(
        "🔐 Sending password reset request..."
      );

      console.log(
        "🌐 Reset password API:",
        `${API_URL}/api/password/reset/[TOKEN]`
      );

      // ------------------------------------------------------
      // SEND REQUEST
      // ------------------------------------------------------

      const response = await axios.post(
        `${API_URL}/api/password/reset/${encodeURIComponent(
          token
        )}`,
        {
          password: newPassword,
          confirmPassword:
            newConfirmPassword,
        },
        {
          timeout: 30000,

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
        }
      );

      console.log(
        "✅ Password reset response:",
        response.data
      );

      // ------------------------------------------------------
      // CHECK BACKEND SUCCESS
      // ------------------------------------------------------

      if (
        response.data?.success === false
      ) {
        setError(
          response.data?.message ||
            "Unable to reset your password."
        );

        return;
      }

      // ------------------------------------------------------
      // SUCCESS MESSAGE
      // ------------------------------------------------------

      setMessage(
        response.data?.message ||
          "Password updated successfully."
      );

      // ------------------------------------------------------
      // CLEAR PASSWORD FIELDS
      // ------------------------------------------------------

      setPassword("");
      setConfirmPassword("");

      // ------------------------------------------------------
      // REDIRECT TO LOGIN
      // ------------------------------------------------------

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1800);
    } catch (err) {
      console.error(
        "❌ Reset password error:",
        err
      );

      console.error(
        "❌ Backend response:",
        err.response?.data
      );

      // ------------------------------------------------------
      // BACKEND RESPONSE
      // ------------------------------------------------------

      if (err.response) {
        const backendMessage =
          err.response.data?.message;

        setError(
          backendMessage ||
            `Password reset failed with status ${err.response.status}.`
        );

        return;
      }

      // ------------------------------------------------------
      // TIMEOUT
      // ------------------------------------------------------

      if (
        err.code === "ECONNABORTED" ||
        err.code === "ETIMEDOUT"
      ) {
        setError(
          "The server took too long to respond. Please try again."
        );

        return;
      }

      // ------------------------------------------------------
      // NETWORK ERROR
      // ------------------------------------------------------

      if (
        err.message ===
        "Network Error"
      ) {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );

        return;
      }

      // ------------------------------------------------------
      // GENERAL ERROR
      // ------------------------------------------------------

      setError(
        "Unable to reset your password. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">

        {/* ==================================================
            TITLE
        ================================================== */}

        <h2 className="reset-password-title">
          Set New Password
        </h2>

        <p className="reset-password-subtitle">
          Enter your new password below.
        </p>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="reset-password-message error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {message && (
          <div
            className="reset-password-message success"
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        {!message && (
          <form
            className="reset-password-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* ==============================================
                NEW PASSWORD
            ============================================== */}

            <div className="reset-password-field">
              <label htmlFor="new-password">
                New Password
              </label>

              <input
                id="new-password"
                name="password"
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading}
              />
            </div>

            {/* ==============================================
                CONFIRM PASSWORD
            ============================================== */}

            <div className="reset-password-field">
              <label htmlFor="confirm-password">
                Confirm New Password
              </label>

              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading}
              />
            </div>

            {/* ==============================================
                PASSWORD REQUIREMENT
            ============================================== */}

            <p
              style={{
                marginTop: "-6px",
                marginBottom: "18px",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              Password must contain at least
              6 characters.
            </p>

            {/* ==============================================
                SUBMIT
            ============================================== */}

            <button
              className="reset-password-submit"
              type="submit"
              disabled={
                loading ||
                !token
              }
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>
          </form>
        )}

        {/* ==================================================
            BACK TO LOGIN
        ================================================== */}

        <div className="reset-password-back">
          <Link to="/login">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;