// frontend/src/components/Navbar.jsx
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
    <header
      style={{
        background: 'rgba(255, 255, 255, 0.85)', // transparent with slight white
        backdropFilter: 'blur(10px)',              // blur effect
        WebkitBackdropFilter: 'blur(10px)',        // Safari support
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'background 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '8px 16px', // reduced padding for smaller height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Logo - Left */}
        <Link
          to="/"
          style={{
            fontSize: '20px', // reduced font size
            fontWeight: 800,
            color: '#0055a5',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <i className="fas fa-tag" style={{ fontSize: '18px' }}></i>
          BuyUk <span style={{ color: '#2ecc71' }}>Used</span>
        </Link>

        {/* CENTER: Post Ad Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link
            to="/post-ad"
            style={{
              background: '#2ecc71',
              color: 'white',
              padding: '6px 16px', // reduced padding
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(46, 204, 113, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#27ae60';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2ecc71';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <i className="fas fa-plus-circle" style={{ fontSize: '14px' }}></i> Post Ad
          </Link>
        </div>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Wishlist */}
          <Link
            to="/wishlist"
            style={{
              position: 'relative',
              fontSize: '18px',
              color: '#475569',
              textDecoration: 'none',
            }}
          >
            <i className="fas fa-heart"></i>
            {favorites.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#e74c3c',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 5px',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                {favorites.length}
              </span>
            )}
          </Link>

          {/* User or Auth buttons */}
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={toggleDropdown}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(241, 245, 249, 0.8)',
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '28px', // reduced size
                    height: '28px',
                    borderRadius: '50%',
                    background: '#0055a5',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                    position: 'relative',
                  }}
                >
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={user.name || 'User'}
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
                    <span
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        background: '#f59e0b',
                        color: 'white',
                        fontSize: '7px',
                        fontWeight: 700,
                        borderRadius: '50%',
                        padding: '1px 3px',
                        border: '1px solid white',
                      }}
                    >
                      ★
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                  {user.name}
                </span>
                <i
                  className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`}
                  style={{ fontSize: '10px', color: '#94a3b8' }}
                ></i>
              </div>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    minWidth: '180px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    padding: '4px 0',
                    zIndex: 1000,
                    animation: 'dropdownFade 0.2s ease',
                  }}
                >
                  <Link
                    to="/post-ad"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 14px',
                      color: '#2ecc71',
                      fontWeight: 600,
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <i className="fas fa-plus-circle"></i> SELL
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 14px',
                      color: '#334155',
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <i className="fas fa-user"></i> My Profile
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 14px',
                      color: '#334155',
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <i className="fas fa-box"></i> My Ads
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 14px',
                      color: '#334155',
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <i className="fas fa-heart"></i> Favorites
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 14px',
                        color: '#334155',
                        fontSize: '13px',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <i className="fas fa-user-shield"></i> Admin Dashboard
                    </Link>
                  )}

                  <hr
                    style={{
                      margin: '4px 0',
                      border: 'none',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  />

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 14px',
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link
                to="/login"
                style={{
                  border: '1px solid #0055a5',
                  color: '#0055a5',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e8f0fe')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Log In
              </Link>
              <Link
                to="/register"
                style={{
                  background: '#0055a5',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#003f7a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0055a5')}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;