import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';

// 👇 Set this to your actual backend URL
const API_URL = 'https://sell-platform2.onrender.com';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'buyer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const evaluatePassword = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let label = 'Weak';
    let color = '#ef4444';
    if (score >= 4) {
      label = 'Strong';
      color = '#22c55e';
    } else if (score >= 3) {
      label = 'Medium';
      color = '#f59e0b';
    } else if (score >= 2) {
      label = 'Weak';
      color = '#ef4444';
    } else {
      label = 'Very Weak';
      color = '#dc2626';
    }

    setPasswordStrength({ score: Math.min(score / 5, 1), label, color });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      evaluatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', padding: '40px 20px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
          Join KN Classifieds 🚀
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '24px' }}>
          {from !== '/' ? 'Create an account to post your ad' : 'Start posting and replying today'}
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* SOCIAL LOGIN BUTTONS */}
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => window.location.href = `${API_URL}/auth/google`}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '50px',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '15px',
              marginBottom: '12px',
            }}
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => window.location.href = `${API_URL}/auth/facebook`}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px',
              border: 'none',
              borderRadius: '50px',
              background: '#1877F2',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            <FaFacebookF size={20} />
            Continue with Facebook
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <span style={{ margin: '0 12px', color: '#777', fontSize: '14px' }}>OR</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'var(--transition)',
                background: 'white',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'var(--transition)',
                background: 'white',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
              minLength="6"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'var(--transition)',
                background: 'white',
              }}
            />
            {formData.password && (
              <div style={{ marginTop: '6px' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${passwordStrength.score * 100}%`,
                    height: '100%',
                    background: passwordStrength.color,
                    transition: 'width 0.3s ease, background 0.3s ease',
                    borderRadius: '4px',
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: passwordStrength.color, fontWeight: 600 }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re‑enter your password"
              required
              minLength="6"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'var(--transition)',
                background: 'white',
              }}
            />
            {formData.confirmPassword && formData.password && formData.password !== formData.confirmPassword && (
              <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>
                ⚠️ Passwords do not match
              </small>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number (optional)"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'var(--transition)',
                background: 'white',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
              I want to register as:
            </label>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={formData.role === 'buyer'}
                  onChange={handleChange}
                />
                Buyer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={formData.role === 'seller'}
                  onChange={handleChange}
                />
                Seller
              </label>
            </div>
            <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
              Sellers can post ads; Buyers can browse and contact sellers.
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: 'var(--secondary)',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
              transition: 'var(--transition)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div className="auth-footer" style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--gray-500)' }}>
          Already have account?
          <Link to="/login" state={{ from }} style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: '4px' }}>
            Sign in
          </Link>
        </div>

        {from !== '/' && (
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--gray-400)' }}>
            <Link to="/" style={{ color: 'var(--gray-500)' }}>← Back to home</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;