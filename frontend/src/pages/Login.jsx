// frontend/src/pages/Login.jsx

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

  // Slider state
  const [sliderProgress, setSliderProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const handleRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = await login(normalizedEmail, password);
      if (result?.success) {
        navigate(from, { replace: true });
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

  // ---- SLIDER LOGIC ----
  const startDrag = (e) => {
    if (loading) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    const container = sliderRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let x = clientX - rect.left;
    const maxX = rect.width - 62; // handle width (58px) + margin
    x = Math.max(0, Math.min(x, maxX));
    const progress = (x / maxX) * 100;
    setSliderProgress(progress);
    e.preventDefault();
  };

  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (sliderProgress >= 95) {
      handleSubmit(new Event('submit'));
      setSliderProgress(0);
    } else {
      setSliderProgress(0);
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => onDrag(e);
    const handleTouchMove = (e) => onDrag(e);
    const handleEnd = () => endDrag();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, sliderProgress]);

  // ---- SOCIAL LOGIN HANDLERS ----
  const handleGoogleLogin = () => {
    setError("");
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    setError("");
    window.location.href = `${API_URL}/auth/facebook`;
  };

  return (
    <>
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .login-card {
          max-width: 400px;
          width: 100%;
          padding: 16px 20px;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.18);
          overflow: hidden;
        }

        .login-card h2 {
          font-size: 20px;
          margin-bottom: 2px;
          text-align: center;
          font-weight: 800;
        }

        /* Bolden the main subtitle – now 900 */
        .login-card .subtitle {
          font-size: 13px;
          margin-bottom: 14px;
          text-align: center;
          color: var(--gray-500);
          font-weight: 900;
        }

        .form-group {
          margin-bottom: 8px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 12px;
          margin-bottom: 2px;
        }

        .form-group input {
          width: 100%;
          padding: 7px 12px;
          border: 1.5px solid var(--gray-200);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-family: inherit;
          transition: var(--transition);
          background: white;
          box-sizing: border-box;
        }

        /* Bolden helper text if any (kept for consistency) */
        .form-group small {
          font-size: 10px;
          color: var(--gray-400);
          display: block;
          margin-top: 1px;
          font-weight: 900;
        }

        .social-btn {
          width: 100%;
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
        }

        .social-btn.fb {
          border: none;
          background: #1877F2;
          color: #fff;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 8px 0 12px;
        }
        .divider hr {
          flex: 1;
          border: none;
          border-top: 1px solid #e5e7eb;
        }
        .divider span {
          margin: 0 10px;
          color: #777;
          font-size: 13px;
          font-weight: 900;
        }

        /* ---- SLIDER STYLES (same as Register) ---- */
        .slider-container {
          position: relative;
          width: calc(100% + 40px);
          margin-left: -20px;
          margin-right: -20px;
          height: 64px; /* increased from 56px */
          background: #e5e7eb;
          border-radius: 0;
          overflow: hidden;
          margin-top: 4px;
          touch-action: none;
          user-select: none;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
        }

        .slider-track {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: var(--primary);
          border-radius: 0;
          transition: width 0.05s ease;
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
          font-size: 18px; /* increased from 15px */
          color: #6b7280;
          pointer-events: none;
          transition: color 0.2s;
        }

        .slider-text.active {
          color: white;
        }

        .slider-handle {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 58px; /* increased from 48px */
          height: 58px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: left 0.05s ease;
          left: calc(${sliderProgress}% - 29px);
          transform: translateX(0);
          touch-action: none;
          z-index: 2;
        }

        .slider-handle:active {
          cursor: grabbing;
          transform: scale(1.04);
        }

        .slider-handle svg {
          width: 38px; /* increased from 28px */
          height: 38px;
          color: var(--primary);
          transition: transform 0.2s;
          stroke-width: 2.5;
        }

        .slider-handle.done svg {
          color: #22c55e;
        }

        .slider-handle.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .slider-container.loading .slider-track {
          background: #9ca3af;
        }
        /* ---- END SLIDER ---- */

        .auth-footer {
          text-align: center;
          margin-top: 10px;
          font-size: 12px;
          color: var(--gray-500);
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
        }

        /* Mobile */
        @media (max-width: 480px) {
          .login-wrapper {
            padding: 4px;
            align-items: flex-start;
            padding-top: 12px;
          }
          .login-card {
            padding: 8px 10px;
            border-radius: 10px;
          }
          .login-card h2 {
            font-size: 16px;
            margin-bottom: 0;
          }
          .login-card .subtitle {
            font-size: 12px;
            margin-bottom: 6px;
            font-weight: 900;
          }
          .form-group {
            margin-bottom: 4px;
          }
          .form-group label {
            font-size: 10px;
            margin-bottom: 1px;
          }
          .form-group input {
            padding: 5px 8px;
            font-size: 13px !important;
            border-radius: 6px;
          }
          .form-group small {
            font-size: 10px;
            margin-top: 0;
            font-weight: 900;
          }
          .social-btn {
            padding: 6px 10px;
            font-size: 11px;
            margin-bottom: 4px;
          }
          .divider {
            margin: 4px 0 8px;
          }
          .divider span {
            font-size: 11px;
            font-weight: 900;
          }
          /* ---- MASSIVE SLIDER ON MOBILE ---- */
          .slider-container {
            height: 120px;
            width: calc(100% + 20px);
            margin-left: -10px;
            margin-right: -10px;
            margin-top: 6px;
          }
          .slider-handle {
            width: 96px;
            height: 96px;
            top: 12px;
            left: 12px;
          }
          .slider-handle svg {
            width: 58px;
            height: 58px;
          }
          .slider-text {
            font-size: 24px;
            font-weight: 800;
          }
          .slider-handle {
            left: calc(${sliderProgress}% - 48px);
          }
          .auth-footer {
            font-size: 10px;
            margin-top: 6px;
          }
          .back-link {
            font-size: 10px;
            margin-top: 2px;
          }
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-card">
          <h2>Welcome Back 👋</h2>
          <p className="subtitle">
            {from !== "/" ? "Login to continue posting your ad" : "Login to your account"}
          </p>

          {error && (
            <div
              role="alert"
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "6px 10px",
                borderRadius: "8px",
                marginBottom: "10px",
                fontSize: "12px",
              }}
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

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  style={{ paddingRight: "36px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: "16px",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "5px",
                marginBottom: "14px",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color: "var(--primary)",
                  fontSize: "13px",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* SLIDER BUTTON */}
            <div
              className={`slider-container ${loading ? 'loading' : ''}`}
              ref={sliderRef}
            >
              <div
                className="slider-track"
                style={{ width: `${sliderProgress}%` }}
              />
              <div
                className={`slider-text ${sliderProgress >= 10 ? 'active' : ''}`}
              >
                {loading ? 'Logging in...' : 'Slide to log in →'}
              </div>
              <div
                className={`slider-handle ${loading ? 'disabled' : ''} ${sliderProgress >= 95 ? 'done' : ''}`}
                ref={handleRef}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                style={{
                  left: `calc(${sliderProgress}% - 29px)`,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            {/* End slider */}

          </form>

          <div className="auth-footer">
            No account?{" "}
            <Link to="/register" state={{ from }}>
              Create free account
            </Link>
          </div>

          {from !== "/" && (
            <div className="back-link">
              <Link to="/" style={{ color: "var(--gray-500)" }}>← Back to home</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;