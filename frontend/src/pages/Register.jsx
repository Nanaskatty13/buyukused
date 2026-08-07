import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';

// 👇 Hardcode your backend URL or import from a config file
const API_URL = 'https://sell-platform2.onrender.com'; // or use your localhost for dev

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
    if (score >= 4) { label = 'Strong'; color = '#22c55e'; }
    else if (score >= 3) { label = 'Medium'; color = '#f59e0b'; }
    else if (score >= 2) { label = 'Weak'; color = '#ef4444'; }
    else { label = 'Very Weak'; color = '#dc2626'; }

    setPasswordStrength({ score: Math.min(score / 5, 1), label, color });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') evaluatePassword(value);
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

  // ... (JSX exactly as before – no changes to the UI)
  return (
    <div className="container" style={{ maxWidth: '440px', padding: '40px 20px' }}>
      {/* ... all the JSX from the previous version */}
      {/* Just copy the JSX from the last full version I gave you – it's identical */}
    </div>
  );
};

export default Register;