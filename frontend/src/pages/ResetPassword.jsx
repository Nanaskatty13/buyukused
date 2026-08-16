import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/password/reset/${token}`,
        { password, confirmPassword }
      );
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h2 className="reset-password-title">Set New Password</h2>
        <p className="reset-password-subtitle">
          Enter your new password below.
        </p>

        {error && (
          <div className="reset-password-message error">{error}</div>
        )}

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="reset-password-field">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <div className="reset-password-field">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <button
            className="reset-password-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="reset-password-back">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;