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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: "440px",
          width: "100%",
          margin: "0 auto",
          padding: "0",
        }}
      >
        <div
          className="card"
          style={{
            padding: "32px",
            backgroundColor: "#ffffff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <h2
            style={{
              textAlign: "center",
              fontSize: "24px",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            Forgot Password?
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "var(--gray-500)",
              fontSize: "14px",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
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
              style={{
                background: "#dcfce7",
                color: "#166534",
                padding: "12px 14px",
                borderRadius: "8px",
                marginBottom: "18px",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
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
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "12px 14px",
                borderRadius: "8px",
                marginBottom: "18px",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* ==================================================
              FORM
          ================================================== */}

          <form onSubmit={handleSubmit} noValidate>
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                htmlFor="forgot-password-email"
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "13px",
                  marginBottom: "6px",
                }}
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
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 15px",
                  border:
                    "1.5px solid var(--gray-200)",
                  borderRadius:
                    "var(--radius-md)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  background: "white",
                  outline: "none",
                }}
              />
            </div>

            {/* ==================================================
                SEND BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "50px",
                background: "var(--primary)",
                color: "white",
                fontWeight: 700,
                fontSize: "16px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
                transition:
                  "opacity 0.2s ease",
              }}
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          {/* ==================================================
              BACK TO LOGIN
          ================================================== */}

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "14px",
            }}
          >
            <Link
              to="/login"
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;