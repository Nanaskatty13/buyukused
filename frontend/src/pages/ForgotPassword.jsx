import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/password/forgot`,
        { email }
      );
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h2 className="forgot-password-title">Forgot Password</h2>
        <p className="forgot-password-subtitle">
          Enter your email and we'll send you a reset link.
        </p>

        {error && (
          <div className="forgot-password-message error">{error}</div>
        )}
        {message && (
          <div className="forgot-password-message success">{message}</div>
        )}

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="forgot-password-field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="forgot-password-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="forgot-password-back">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;