// frontend/src/pages/Admin/components/AdminHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getNotifications, markNotificationRead } from '../../../api';

const AdminHeader = ({
  activePage,
  sidebarOpen,
  setSidebarOpen,
  onRefresh,
  onSearch,
  searchTerm,
}) => {
  const { user, token } = useAuth(); // ✅ get token
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch notifications – only if user and token exist
  const fetchNotifications = async () => {
    // Guard: user or token missing
    if (!user || !token || !user._id) return;

    try {
      setLoading(true);
      const data = await getNotifications(user._id, token); // ✅ pass token
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
    }
  }, [user, token]); // ✅ depend on token too

  // Auto‑refresh every 30 seconds
  useEffect(() => {
    if (!user || !token) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, token]);

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    if (!token) return;
    try {
      await markNotificationRead(id, token); // ✅ pass token
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const unread = notifications.filter(n => !n.read);
      for (const n of unread) {
        await markNotificationRead(n._id, token); // ✅ pass token
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ... (the rest of your JSX remains identical, just use the variables above)
  return (
    <header className="admin-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'white',
      borderBottom: '1px solid var(--gray-200)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexWrap: 'wrap',
      gap: '8px',
    }}>
      {/* Left side */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--gray-600)' }}>
          {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </span>
        {onSearch && (
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm || ''}
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
            style={{ padding: '8px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', width: '200px' }}
          />
        )}
        <button onClick={onRefresh} style={{ padding: '6px 14px', background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '14px' }}>
          🔄
        </button>
      </div>

      {/* Right side */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notifications */}
        <div ref={notificationRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '4px' }}>
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: '#dc2626', color: 'white', borderRadius: '50%',
                fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                minWidth: '18px', height: '18px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(220,38,38,0.3)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown" style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: '360px', maxHeight: '400px', background: 'white',
              borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: '1px solid var(--gray-200)', overflow: 'hidden', zIndex: 1000,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--gray-200)' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer' }}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)' }}>No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleMarkAsRead(notif._id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--gray-100)',
                        cursor: 'pointer',
                        background: notif.read ? 'white' : '#f0f7ff',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = notif.read ? 'var(--gray-50)' : '#e8f0fe'}
                      onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'white' : '#f0f7ff'}
                    >
                      <div style={{ fontSize: '13px', color: 'var(--gray-800)' }}>{notif.message}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu – keep as before */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gray-700)' }}>{user?.name}</span>
          </button>
          {showUserMenu && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--gray-200)', overflow: 'hidden', zIndex: 1000 }}>
              <div style={{ padding: '8px' }}>
                <button onClick={() => {}} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderRadius: 'var(--radius-sm)', color: 'var(--gray-700)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  👤 Profile
                </button>
                <button onClick={() => {}} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderRadius: 'var(--radius-sm)', color: 'var(--gray-700)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  ⚙️ Settings
                </button>
                <hr style={{ margin: '4px 0', borderColor: 'var(--gray-100)' }} />
                <button onClick={() => { /* logout */ }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderRadius: 'var(--radius-sm)', color: '#dc2626', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;