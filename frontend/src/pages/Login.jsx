import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
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
        <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>Welcome Back 👋</h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '24px' }}>
          {from !== '/' ? 'Login to continue posting your ad' : 'Login to your account'}
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
            onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
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
            onClick={() => window.location.href = 'http://localhost:5000/auth/facebook'}
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
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
              transition: 'var(--transition)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Logging in...' : 'Log In →'}
          </button>
        </form>

        <div className="auth-footer" style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--gray-500)' }}>
          No account? <Link to="/register" state={{ from }} style={{ color: 'var(--primary)', fontWeight: 700 }}>Create free account</Link>
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

export default Login;