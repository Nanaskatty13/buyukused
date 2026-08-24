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

  const handleGoogleLogin = () => {
    setError("");

    window.location.href = `${API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    setError("");

    window.location.href = `${API_URL}/auth/facebook`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
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
          padding: "0",
          margin: "0",
        }}
      >
        <div
          className="card"
          style={{
            padding: "22px 28px",
            backgroundColor: "#ffffff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}
        >
          <h2
            style={{
              fontSize: "23px",
              fontWeight: 800,
              textAlign: "center",
              marginTop: "0",
              marginBottom: "5px",
            }}
          >
            Welcome Back 👋
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "var(--gray-500)",
              marginTop: "0",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {from !== "/"
              ? "Login to continue posting your ad"
              : "Login to your account"}
          </p>

          {error && (
            <div
              role="alert"
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "8px 12px",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "10px 14px",
                border: "1px solid #ddd",
                borderRadius: "50px",
                background: "#fff",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 600,
                fontSize: "14px",
                marginBottom: "8px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "10px 14px",
                border: "none",
                borderRadius: "50px",
                background: "#1877F2",
                color: "#fff",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 600,
                fontSize: "14px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <FaFacebookF size={18} />
              Continue with Facebook
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "14px 0",
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
                margin: "0 10px",
                color: "#777",
                fontSize: "12px",
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

          <form onSubmit={handleSubmit}>
            <div
              className="form-group"
              style={{
                marginBottom: "12px",
              }}
            >
              <label
                htmlFor="login-email"
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "12px",
                  marginBottom: "5px",
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
                  padding: "10px 14px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  background: "white",
                }}
              />
            </div>

            <div
              className="form-group"
              style={{
                marginBottom: "7px",
              }}
            >
              <label
                htmlFor="login-password"
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "12px",
                  marginBottom: "5px",
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
                    padding: "10px 42px 10px 14px",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
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
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: "18px",
                    padding: "4px",
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

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: "5px",
                marginBottom: "14px",
              }}
            >
              <Link
                to="/forgot-password"
                aria-label="Forgot your password?"
                style={{
                  display: "inline-block",
                  color: "var(--primary)",
                  fontSize: "13px",
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "11px",
                border: "none",
                borderRadius: "50px",
                background: "var(--primary)",
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
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

          <div
            className="auth-footer"
            style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "13px",
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

          {from !== "/" && (
            <div
              style={{
                textAlign: "center",
                marginTop: "8px",
                fontSize: "12px",
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
    </div>
  );
};

export default Login;