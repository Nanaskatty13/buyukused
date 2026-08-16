import React, { useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError(
        "This password reset link is invalid."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/password/reset/${encodeURIComponent(
          token
        )}`,
        {
          password,
          confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 30000,
        }
      );

      setMessage(
        res.data?.message ||
          "Password updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(
        "Reset password error:",
        err.response?.data || err.message
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to reset your password."
        );
      } else if (err.code === "ECONNABORTED") {
        setError(
          "The server took too long to respond. Please try again."
        );
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h2 className="reset-password-title">
          Set New Password
        </h2>

        <p className="reset-password-subtitle">
          Enter your new password below.
        </p>

        {error && (
          <div
            className="reset-password-message error"
            role="alert"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="reset-password-message success"
            role="status"
          >
            {message}
          </div>
        )}

        <form
          className="reset-password-form"
          onSubmit={handleSubmit}
        >
          <div className="reset-password-field">
            <label htmlFor="new-password">
              New Password
            </label>

            <input
              id="new-password"
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="new-password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="reset-password-field">
            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              autoComplete="new-password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            className="reset-password-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>

        <div className="reset-password-back">
          <Link to="/login">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;