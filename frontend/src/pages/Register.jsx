// frontend/src/pages/Register.jsx

import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

const API_URL = 'https://sell-platform2.onrender.com';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    birthday: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Slider state
  const [sliderProgress, setSliderProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const handleRef = useRef(null);

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
    const maxX = rect.width - 56;
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

  // ---- FORM SUBMIT ----
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setError('You must be at least 18 years old to register.');
        return;
      }
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;

      const payload = {
        ...registrationData,
        role: 'user', // NEUTRAL – no buyer/seller selection
      };

      const result = await register(payload);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setSliderProgress(0);
    }
  };

  return (
    <>
      <style>{`
        .register-wrapper {
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

        .register-card {
          max-width: 400px;
          width: 100%;
          padding: 16px 20px;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.18);
          overflow: hidden;
        }

        .register-card h2 {
          font-size: 20px;
          margin-bottom: 2px;
          text-align: center;
          font-weight: 800;
        }

        .register-card .subtitle {
          font-size: 13px;
          margin-bottom: 14px;
          text-align: center;
          color: var(--gray-500);
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

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 7px 12px;
          border: 1.5px solid var(--gray-200);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-family: inherit;
          transition: var(--transition);
          background: white;
        }

        .form-group small {
          font-size: 10px;
          color: var(--gray-400);
          display: block;
          margin-top: 1px;
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
          font-size: 12px;
        }

        /* ---- SLIDER STYLES (full‑width) ---- */
        .slider-container {
          position: relative;
          width: calc(100% + 40px);
          margin-left: -20px;
          margin-right: -20px;
          height: 56px;
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
          background: var(--secondary);
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
          font-size: 15px;
          color: #6b7280;
          pointer-events: none;
          transition: color 0.2s;
        }

        .slider-text.active {
          color: white;
        }

        .slider-handle {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: left 0.05s ease;
          left: calc(${sliderProgress}% - 24px);
          transform: translateX(0);
          touch-action: none;
          z-index: 2;
        }

        .slider-handle:active {
          cursor: grabbing;
          transform: scale(1.04);
        }

        .slider-handle svg {
          width: 28px;
          height: 28px;
          color: var(--secondary);
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
          .register-wrapper {
            padding: 8px;
            align-items: flex-start;
            padding-top: 16px;
          }
          .register-card {
            padding: 12px 12px;
            border-radius: 10px;
          }
          .register-card h2 {
            font-size: 18px;
          }
          .register-card .subtitle {
            font-size: 12px;
            margin-bottom: 10px;
          }
          .form-group {
            margin-bottom: 6px;
          }
          .form-group label {
            font-size: 11px;
          }
          .form-group input,
          .form-group select {
            padding: 6px 10px;
            font-size: 14px !important;
          }
          .form-group small {
            font-size: 10px;
          }
          .social-btn {
            padding: 8px 10px;
            font-size: 12px;
            margin-bottom: 6px;
          }
          .divider {
            margin: 6px 0 10px;
          }
          .divider span {
            font-size: 11px;
          }
          .slider-container {
            height: 48px;
            width: calc(100% + 24px);
            margin-left: -12px;
            margin-right: -12px;
          }
          .slider-handle {
            width: 40px;
            height: 40px;
            top: 4px;
            left: 4px;
          }
          .slider-handle svg {
            width: 24px;
            height: 24px;
          }
          .slider-text {
            font-size: 13px;
          }
          .auth-footer {
            font-size: 11px;
            margin-top: 8px;
          }
          .back-link {
            font-size: 11px;
            margin-top: 4px;
          }
        }
      `}</style>

      <div className="register-wrapper">
        <div className="register-card">
          <h2>Join BuyUk Used 🚀</h2>
          <p className="subtitle">
            {from !== '/' ? 'Create an account to post your ad' : 'Start buying and selling today'}
          </p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 10px', borderRadius: 'var(--radius-sm)', marginBottom: '10px', fontSize: '12px' }}>
              {error}
            </div>
          )}

          {/* SOCIAL LOGIN BUTTONS */}
          <div>
            <button
              type="button"
              className="social-btn"
              onClick={() => window.location.href = `${API_URL}/auth/google`}
            >
              <FcGoogle size={18} />
              Continue with Google
            </button>

            <button
              type="button"
              className="social-btn fb"
              onClick={() => window.location.href = `${API_URL}/auth/facebook`}
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

          <form onSubmit={handleSubmit} id="register-form">
            {/* FULL NAME */}
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                minLength="2"
              />
              <small>Minimum 2 characters</small>
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            {/* PASSWORD WITH TOGGLE */}
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength="6"
                  style={{ paddingRight: '36px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '16px',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </button>
              </div>
              {formData.password && (
                <div style={{ marginTop: '3px' }}>
                  <div style={{
                    width: '100%',
                    height: '3px',
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
                  <span style={{ fontSize: '10px', color: passwordStrength.color, fontWeight: 600 }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD WITH TOGGLE */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re‑enter your password"
                  required
                  minLength="6"
                  style={{ paddingRight: '36px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '16px',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </button>
              </div>
              {formData.confirmPassword && formData.password && formData.password !== formData.confirmPassword && (
                <small style={{ color: '#dc2626', display: 'block', marginTop: '2px' }}>
                  ⚠️ Passwords do not match
                </small>
              )}
            </div>

            {/* PHONE */}
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number (optional)"
              />
            </div>

            {/* COUNTRY DROPDOWN */}
            <div className="form-group">
              <label>Country <span style={{ color: '#dc2626' }}>*</span></label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select your country</option>
                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Egypt">Egypt</option>
                <option value="Morocco">Morocco</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
                <option value="Cameroon">Cameroon</option>
                <option value="Ivory Coast">Ivory Coast</option>
                <option value="Senegal">Senegal</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="China">China</option>
                <option value="India">India</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Other">Other</option>
              </select>
              <small>Select your country</small>
            </div>

            {/* BIRTHDAY */}
            <div className="form-group">
              <label>Date of Birth <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span></label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
              <small>You must be at least 18 years old</small>
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
                {loading ? 'Creating account...' : 'Slide to create account →'}
              </div>
              <div
                className={`slider-handle ${loading ? 'disabled' : ''} ${sliderProgress >= 95 ? 'done' : ''}`}
                ref={handleRef}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                style={{
                  left: `calc(${sliderProgress}% - 24px)`,
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
            Already have account?
            <Link to="/login" state={{ from }}>Sign in</Link>
          </div>

          {from !== '/' && (
            <div className="back-link">
              <Link to="/" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>← Back to home</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;