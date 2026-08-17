import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserNotifications, API_URL } from '../services/api';

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
        const data = await getUserNotifications(user._id, token);
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
      const res = await fetch(`${API_URL}/api/notifications/${notifId}/read`, {
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
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
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
          {notifications.map(notif => (
            <div
              key={notif._id}
              style={{
                background: 'white',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: notif.read ? 0.7 : 1,
              }}
            >
              <div>
                <div style={{ fontWeight: notif.read ? 400 : 600 }}>{notif.message || notif.title || 'Update'}</div>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                  {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                </div>
              </div>
              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif._id)}
                  style={{ padding: '4px 14px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;