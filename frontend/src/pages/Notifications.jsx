// frontend/src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';
import VerifiedBadge from '../components/VerifiedBadge';

// ─── Helper to get the actor from a notification ─────────────
const getActor = (notif) => {
  // Assumes notification has `actor` or `sender` populated with `name`, `profileImage`, `isVerified`
  const actor = notif.actor || notif.sender || null;
  if (actor && typeof actor === 'object') return actor;
  return null;
};

// ─── Helper to get the message text ───────────────────────────
const getMessageText = (notif) => {
  return notif.message || notif.title || notif.text || 'Update';
};

const Notifications = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        setLoading(true);
        // Use the user‑specific endpoint (or admin endpoint if user is admin)
        const endpoint = user.role === 'admin'
          ? `${import.meta.env.VITE_API_URL}/api/notifications/admin`
          : `${import.meta.env.VITE_API_URL}/api/notifications/${user._id}`;
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.notifications || data?.data || [];
        setNotifications(list);
      } catch (err) {
        console.error(err);
        setError('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [user, token]);

  const markAsRead = async (notifId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === notifId ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px 20px' }}>Loading notifications...</div>;
  if (error) return <div className="container" style={{ padding: '40px 20px', color: '#e74c3c' }}>{error}</div>;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ padding: '8px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
          No notifications yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(notif => {
            const actor = getActor(notif);
            const actorName = actor?.name || 'System';
            const avatar = actor?.profileImage || actor?.avatar || actor?.photo || null;
            const avatarUrl = avatar ? getImageUrl(avatar) : null;
            const isVerified = actor?.isVerified === true;
            const message = getMessageText(notif);
            const link = notif.link || null;

            return (
              <div
                key={notif._id}
                style={{
                  background: 'white',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: notif.read ? 0.7 : 1,
                }}
              >
                {/* Avatar */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={actorName}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, color: '#6b7280', flexShrink: 0 }}>
                    {actorName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: notif.read ? 400 : 600 }}>{actorName}</span>
                    {isVerified && <VerifiedBadge size={16} />}
                    <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>·</span>
                    <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', color: 'var(--gray-700)', marginTop: '2px' }}>
                    {link ? (
                      <Link to={link} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{message}</Link>
                    ) : (
                      message
                    )}
                  </div>
                </div>

                {/* Mark Read button */}
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    style={{ padding: '4px 14px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;