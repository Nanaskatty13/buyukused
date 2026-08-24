// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAdminNotifications } from '../services/api';

const getToken = () => localStorage.getItem('token') || localStorage.getItem('authToken') || null;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { favorites } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Unread notification count ──────────────────────────────
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  // ─── Unread message count ──────────────────────────────────
  const [unreadMessages, setUnreadMessages] = useState(0);

  // ─── Close dropdowns on outside click ──────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Fetch unread counts ────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      setUnreadMessages(0);
      return;
    }

    const fetchCounts = async () => {
      // ─── Notifications: only for admins ───────────────────────
      if (user.role === 'admin') {
        try {
          const token = getToken();
          const data = await getAdminNotifications(token);
          const notifications = data?.notifications || data?.data || [];
          const unread = notifications.filter(n => !n.isRead).length;
          setUnreadNotifications(unread);
        } catch (err) {
          console.warn('Admin notification fetch failed:', err.message);
          setUnreadNotifications(0);
        }
      } else {
        // Non‑admin users have no notifications to show
        setUnreadNotifications(0);
      }

      // ─── Messages: try to fetch unread count ──────────────────
      const token = getToken();
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/unread-count`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUnreadMessages(data.count || 0);
          } else {
            // Silently ignore 401/404 – the endpoint might not exist
            setUnreadMessages(0);
          }
        } catch {
          setUnreadMessages(0);
        }
      } else {
        setUnreadMessages(0);
      }
    };

    fetchCounts();

    // Poll every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMobileDropdown = () => setMobileDropdownOpen(!mobileDropdownOpen);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const getProfileImage = () => {
    if (!user) return null;
    const image = user.profileImage || user.photo || user.avatar || user.picture;
    if (!image) return null;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return image.startsWith('http') ? image : `${base}${image}`;
  };

  const profileImageUrl = getProfileImage();

  const handleHeartClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  return (
    <>
      <style>
        {`
          .navbar-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .navbar-logo {
            font-size: 20px;
            font-weight: 800;
            color: #0055a5;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
          }
          .navbar-logo i {
            font-size: 18px;
          }
          .navbar-post-ad-text {
            display: inline;
          }
          .navbar-post-ad-icon {
            display: none;
          }
          .navbar-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #0055a5;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            position: relative;
          }
          .navbar-heart,
          .navbar-bell,
          .navbar-envelope {
            position: relative;
            font-size: 18px;
            color: #475569;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .navbar-badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #e74c3c;
            color: white;
            border-radius: 50%;
            padding: 2px 5px;
            font-size: 10px;
            font-weight: 700;
            min-width: 16px;
            text-align: center;
            line-height: 1.2;
          }
          .desktop-only {
            display: inline-block;
          }
          @keyframes dropdownFade {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 1024px) {
            .navbar-container {
              padding: 8px 12px;
              gap: 12px;
            }
            .navbar-logo {
              font-size: 18px;
            }
            .navbar-logo i {
              font-size: 16px;
            }
          }
          @media (max-width: 767px) {
            .desktop-only {
              display: none !important;
            }
            .navbar-post-ad-text {
              display: none !important;
            }
            .navbar-post-ad-icon {
              display: inline-flex !important;
            }
            .navbar-container {
              padding: 6px 10px;
              gap: 8px;
            }
            .navbar-logo {
              font-size: 18px;
            }
            .navbar-logo i {
              font-size: 16px;
            }
            .navbar-avatar {
              width: 24px;
              height: 24px;
              font-size: 10px;
            }
            .navbar-heart,
            .navbar-bell,
            .navbar-envelope {
              font-size: 16px;
            }
            .navbar-badge {
              font-size: 8px;
              padding: 1px 4px;
              min-width: 12px;
              top: -5px;
              right: -5px;
            }
            /* ─── More spacing for icons ─── */
            .navbar-container > div:last-child {
              gap: 22px !important;
            }
            .navbar-post-ad-btn {
              padding: 4px 10px !important;
              font-size: 11px !important;
            }
          }
          @media (max-width: 480px) {
            .navbar-logo {
              font-size: 16px !important;
            }
            .navbar-logo i {
              font-size: 14px !important;
            }
            .navbar-container {
              padding: 4px 8px !important;
              gap: 6px !important;
            }
            .navbar-heart,
            .navbar-bell,
            .navbar-envelope {
              font-size: 14px !important;
            }
            .navbar-avatar {
              width: 20px !important;
              height: 20px !important;
              font-size: 8px !important;
            }
            .navbar-post-ad-btn {
              padding: 3px 8px !important;
              font-size: 10px !important;
            }
            .navbar-badge {
              font-size: 7px;
              padding: 1px 3px;
              min-width: 10px;
              top: -4px;
              right: -4px;
            }
            .navbar-container > div:last-child {
              gap: 16px !important;
            }
          }
        `}
      </style>

      <header
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          transition: 'background 0.3s ease',
        }}
      >
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <i className="fas fa-tag"></i>
            BuyUk <span style={{ color: '#2ecc71' }}>Used</span>
          </Link>

          {/* Post Ad Button */}
          <Link
            to="/post-ad"
            className="navbar-post-ad-btn"
            style={{
              background: '#2ecc71',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(46, 204, 113, 0.3)',
              whiteSpace: 'nowrap',
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
            <i className="fas fa-plus-circle" style={{ fontSize: '14px' }}></i>
            <span className="navbar-post-ad-text">Start Selling</span>
          </Link>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/wishlist"
              onClick={handleHeartClick}
              className="navbar-heart"
            >
              <i className="fas fa-heart"></i>
              {favorites.length > 0 && (
                <span className="navbar-badge">{favorites.length}</span>
              )}
            </Link>

            {user && (
              <Link to="/notifications" className="navbar-bell">
                <i className="fas fa-bell"></i>
                {unreadNotifications > 0 && (
                  <span className="navbar-badge">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <Link to="/messages" className="navbar-envelope">
                <i className="fas fa-envelope"></i>
                {unreadMessages > 0 && (
                  <span className="navbar-badge">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </Link>
            )}

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
                  <div className="navbar-avatar">
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
                  <span className="desktop-only" style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                    {user.name}
                  </span>
                  <i
                    className={`desktop-only fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`}
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
                      to="/my-ads"
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
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
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
                  className="desktop-only"
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
                  className="desktop-only"
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

                <div ref={mobileDropdownRef} style={{ position: 'relative' }}>
                  <div
                    onClick={toggleMobileDropdown}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '4px',
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
                    <div className="navbar-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>

                  {mobileDropdownOpen && (
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
                        to="/wishlist"
                        onClick={() => setMobileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          color: '#334155',
                          fontSize: '13px',
                          textDecoration: 'none',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <i className="fas fa-heart"></i> Favorites
                        {favorites.length > 0 && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              background: '#e74c3c',
                              color: 'white',
                              borderRadius: '50%',
                              padding: '1px 6px',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            {favorites.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setMobileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          color: '#0055a5',
                          fontSize: '13px',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <i className="fas fa-sign-in-alt"></i> Log In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          color: '#0055a5',
                          fontSize: '13px',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <i className="fas fa-user-plus"></i> Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;