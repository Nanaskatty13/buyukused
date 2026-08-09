import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { favorites } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="header">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="logo">
          <i className="fas fa-tag"></i>
          BuyUK <span>Used</span>
        </Link>

        {/* Navigation Links */}
        <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => setMobileOpen(false)}>Home</Link></li>
          <li><Link to="/products" onClick={() => setMobileOpen(false)}>Browse</Link></li>
          <li>
            <Link 
              to="/post-ad" 
              className="post-ad-btn" 
              onClick={() => setMobileOpen(false)}
            >
              Post Ad
            </Link>
          </li>
        </ul>

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
                <div className="avatar">
                  {userInitial}
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

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="dropdown-menu">
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

          {/* Mobile Toggle Button */}
          <button className="mobile-toggle" onClick={toggleMobile}>
            <i className={mobileOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;