// frontend/src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

// Create context
export const NotificationContext = createContext();

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ----- Fetch notifications -----
  const fetchNotifications = useCallback(async () => {
    if (!user || !token || !user._id) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.notifications.getForUser(user._id, token);
      const list = data.notifications || [];
      setNotifications(list);
      const unread = list.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // ----- Mark a single notification as read -----
  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;
    try {
      await api.notifications.markRead(notificationId, token);
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [token]);

  // ----- Mark all notifications as read -----
  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length === 0) return;

    try {
      // Option 1: call markRead for each (if API supports batch, use batch)
      // For now, loop – can be optimized later
      await Promise.all(unreadIds.map(id => api.notifications.markRead(id, token)));
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [token, notifications]);

  // ----- Add a new notification (push) -----
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // ----- Clear notifications (remove all) -----
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // ----- Auto‑fetch when user logs in -----
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, token, fetchNotifications]);

  // ----- Auto‑refresh every 30 seconds -----
  useEffect(() => {
    if (!user || !token) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, token, fetchNotifications]);

  // ----- Memoized value -----
  const value = useMemo(() => ({
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications,
  }), [notifications, loading, error, unreadCount, fetchNotifications, markAsRead, markAllAsRead, addNotification, clearNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Also export the context itself
export default NotificationContext;