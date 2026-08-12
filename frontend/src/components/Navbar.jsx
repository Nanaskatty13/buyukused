import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { favorites } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const getProfileImage = () => {
    if (!user) return null;
    const image = user.profileImage || user.photo || user.avatar || user.picture;
    if (!image) return null;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return image.startsWith('http') ? image : `${base}${image}`;
  };

  const profileImageUrl = getProfileImage();

  return (
    <header className="header">
      <div className="container">
        {/* Logo - Left */}
        <Link to="/" className="logo">
          <i className="fas fa-tag"></i>
          BuyUk <span>Used</span>
        </Link>

        {/* ─── CENTER: Glowing Post Ad Button ─── */}
        <div className="nav-center">
          <Link to="/post-ad" className="glow-btn">
            <i className="fas fa-plus-circle"></i> Post Ad
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="nav-actions">
          {/* Wishlist */}
          <Link to="/wishlist" className="icon-btn">
            <i className="fas fa-heart"></i>
            {favorites.length > 0 && (
              <span className="badge">{favorites.length}</span>
            )}
          </Link>

          {/* User or Auth buttons */}
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <div className="profile-trigger" onClick={toggleDropdown}>
                <div className="avatar" style={{ position: 'relative' }}>
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={user.name || 'User'}
                      className="avatar-img"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.textContent = userInitial;
                      }}
                    />
                  ) : (
                    userInitial
                  )}
                  {user.role === 'admin' && (
                    <span className="admin-badge" style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#f59e0b',
                      color: 'white',
                      fontSize: '8px',
                      fontWeight: 700,
                      borderRadius: '50%',
                      padding: '1px 4px',
                      border: '2px solid white',
                    }}>★</span>
                  )}
                </div>
                <span className="username">{user.name}</span>
                <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '12px', color: 'var(--gray-400)' }}></i>
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  {/* ─── GLOWING POST AD BUTTON INSIDE DROPDOWN ─── */}
                  <Link 
                    to="/post-ad" 
                    className="glow-btn-dropdown" 
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="fas fa-plus-circle"></i> SELL
                  </Link>
                  
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    <i className="fas fa-user"></i> My Profile
                  </Link>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    <i className="fas fa-box"></i> My Ads
                  </Link>
                  <Link to="/wishlist" onClick={() => setDropdownOpen(false)}>
                    <i className="fas fa-heart"></i> Favorites
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                      <i className="fas fa-user-shield"></i> Admin Dashboard
                    </Link>
                  )}
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
                  <button onClick={handleLogout} className="dropdown-logout">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-outline">Log In</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;