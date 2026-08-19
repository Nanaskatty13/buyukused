import React, { useState } from 'react';
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
    birthday: '', // 👈 NEW
    role: 'buyer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      e.target.value = '';
      return;
    }

    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    const fileInput = document.getElementById('profileImageInput');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // 👇 Optional: check if user is at least 18
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

      const payload = { ...registrationData };
      if (profileImagePreview) {
        payload.profilePicture = profileImagePreview;
      }

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
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container" style={{ maxWidth: '440px', width: '100%', padding: '0', margin: '0 auto' }}>
        <div className="card" style={{ padding: '32px', backgroundColor: '#ffffff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
            Join BuyUk Used 🚀
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
            {/* FULL NAME */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                minLength="2"
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
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Minimum 2 characters
              </small>
            </div>

            {/* EMAIL */}
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

            {/* PASSWORD WITH TOGGLE */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '44px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'var(--transition)',
                    background: 'white',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '20px',
                    padding: '4px',
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

            {/* CONFIRM PASSWORD WITH TOGGLE */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re‑enter your password"
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '44px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'var(--transition)',
                    background: 'white',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '20px',
                    padding: '4px',
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
                <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>
                  ⚠️ Passwords do not match
                </small>
              )}
            </div>

            {/* PHONE */}
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

            {/* COUNTRY DROPDOWN */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                Country <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
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
                  outline: 'none',
                  cursor: 'pointer',
                }}
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
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Select the country you are based in.
              </small>
            </div>

            {/* 👇 NEW BIRTHDAY FIELD */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                Date of Birth <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
              </label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]} // prevents future dates
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
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                You must be at least 18 years old to register.
              </small>
            </div>

            {/* PROFILE PICTURE UPLOAD */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                Profile Picture <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {profileImagePreview && (
                  <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--gray-200)' }}>
                    <img src={profileImagePreview} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfileImageChange}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    background: 'white',
                  }}
                />
              </div>
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Max size 2MB. Supported: JPG, PNG, GIF, WebP
              </small>
            </div>

            {/* ROLE SELECTION */}
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
    </div>
  );
};

export default Register;