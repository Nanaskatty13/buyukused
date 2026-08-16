import React, { useState } from "react";
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
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔗 Login API_URL:", API_URL);

// ============================================================
// LOGIN PAGE
// ============================================================

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Return user to the page they originally wanted.
  const from = location.state?.from || "/";

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    }
  };

  // ==========================================================
  // GOOGLE LOGIN
  // ==========================================================

  const handleGoogleLogin = () => {
    setError("");

    window.location.href = `${API_URL}/auth/google`;
  };

  // ==========================================================
  // FACEBOOK LOGIN
  // ==========================================================

  const handleFacebookLogin = () => {
    setError("");

    window.location.href = `${API_URL}/auth/facebook`;
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="container"
      style={{
        maxWidth: "440px",
        padding: "40px 20px",
        margin: "0 auto",
      }}
    >
      <div
        className="card"
        style={{
          padding: "32px",
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <h2
          style={{
            fontSize: "24px",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Welcome Back 👋
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "var(--gray-500)",
            marginBottom: "24px",
          }}
        >
          {from !== "/"
            ? "Login to continue posting your ad"
            : "Login to your account"}
        </p>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            role="alert"
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            SOCIAL LOGIN
        ================================================== */}

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          {/* GOOGLE */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "14px",
              border: "1px solid #ddd",
              borderRadius: "50px",
              background: "#fff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
              fontSize: "15px",
              marginBottom: "12px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <FcGoogle size={22} />

            Continue with Google
          </button>

          {/* FACEBOOK */}

          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "14px",
              border: "none",
              borderRadius: "50px",
              background: "#1877F2",
              color: "#fff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
              fontSize: "15px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <FaFacebookF size={20} />

            Continue with Facebook
          </button>
        </div>

        {/* ==================================================
            DIVIDER
        ================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "20px 0",
          }}
        >
          <hr
            style={{
              flex: 1,
              border: "none",
              borderTop: "1px solid #e5e7eb",
            }}
          />

          <span
            style={{
              margin: "0 12px",
              color: "#777",
              fontSize: "14px",
            }}
          >
            OR
          </span>

          <hr
            style={{
              flex: 1,
              border: "none",
              borderTop: "1px solid #e5e7eb",
            }}
          />
        </div>

        {/* ==================================================
            LOGIN FORM
        ================================================== */}

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}

          <div
            className="form-group"
            style={{
              marginBottom: "16px",
            }}
          >
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: "13px",
                marginBottom: "6px",
              }}
            >
              Email
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="your@email.com"
              autoComplete="email"
              required
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 16px",
                border: "1.5px solid var(--gray-200)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontFamily: "inherit",
                background: "white",
              }}
            />
          </div>

          {/* PASSWORD */}

          <div
            className="form-group"
            style={{
              marginBottom: "10px",
            }}
          >
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: "13px",
                marginBottom: "6px",
              }}
            >
              Password
            </label>

            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 44px 12px 16px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  background: "white",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: "20px",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
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
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: "8px",
              marginBottom: "20px",
            }}
          >
            <Link
              to="/forgot-password"
              aria-label="Forgot your password?"
              style={{
                display: "inline-block",
                color: "var(--primary)",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                cursor: "pointer",
                visibility: "visible",
                opacity: 1,
                position: "relative",
                zIndex: 10,
              }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* ==================================================
              LOGIN BUTTON
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
            }}
          >
            {loading
              ? "Logging in..."
              : "Log In →"}
          </button>
        </form>

        {/* ==================================================
            REGISTER
        ================================================== */}

        <div
          className="auth-footer"
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "14px",
            color: "var(--gray-500)",
          }}
        >
          No account?{" "}
          <Link
            to="/register"
            state={{ from }}
            style={{
              color: "var(--primary)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Create free account
          </Link>
        </div>

        {/* ==================================================
            BACK HOME
        ================================================== */}

        {from !== "/" && (
          <div
            style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "13px",
              color: "var(--gray-400)",
            }}
          >
            <Link
              to="/"
              style={{
                color: "var(--gray-500)",
              }}
            >
              ← Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;