// frontend/src/pages/Profile.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';

import {
  getProducts,
  getUserNotifications,
  getImageUrl,
  API_URL,
  deleteProduct,
} from '../services/api';

import { messages } from '../services/messages';

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [stats, setStats] = useState({
    totalAds: 0,
    totalViews: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
  });

  // Edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);

  // Messaging
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Polling ref
  const pollInterval = useRef(null);

  // ================================================================
  // KEEP EDIT FIELDS IN SYNC WITH USER
  // ================================================================

  useEffect(() => {
    if (!user) return;
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditPhotoPreview(user.photoURL || '');
    setEditPhoto(null);
    setRemovePhoto(false);
  }, [user]);

  // ================================================================
  // LOAD PROFILE DATA – IMPROVED
  // ================================================================

  const loadUserData = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const userId = user._id || user.id || user.userId;
    if (!userId) {
      console.warn('⚠️ No user ID found in user object:', user);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('👤 Fetching data for user:', userId);

      // ─── PRODUCTS ──────────────────────────────────────────────
      let userProducts = [];
      try {
        const productResponse = await getProducts({ sellerId: userId, limit: 100 });
        userProducts = Array.isArray(productResponse)
          ? productResponse
          : productResponse?.products || [];
      } catch (productError) {
        console.error('❌ Error fetching user products:', productError);
        try {
          const response = await fetch(`${API_URL}/api/users/me/products`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            userProducts = data?.products || [];
          }
        } catch (fallbackError) {
          console.error('❌ Fallback product fetch also failed:', fallbackError);
        }
      }

      // ─── NOTIFICATIONS ─────────────────────────────────────────
      let userNotifs = [];
      try {
        const notifResponse = await getUserNotifications(userId, token);
        userNotifs = Array.isArray(notifResponse)
          ? notifResponse
          : notifResponse?.notifications || notifResponse?.data || [];
      } catch (notifError) {
        console.error('❌ Error fetching notifications:', notifError);
      }

      // ─── MESSAGES ──────────────────────────────────────────────
      let userMessages = [];
      try {
        const msgResponse = await messages.getForUser(userId, token);
        userMessages = Array.isArray(msgResponse)
          ? msgResponse
          : msgResponse?.messages || msgResponse?.data || [];
      } catch (msgError) {
        console.error('❌ Error fetching messages:', msgError);
      }

      setProducts(userProducts);
      setNotifications(userNotifs);
      setMessagesList(userMessages);

      // ─── UNREAD MESSAGES ──────────────────────────────────────
      const unreadMsgs = userMessages.filter((message) => {
        const receiverId =
          typeof message.receiver === 'string'
            ? message.receiver
            : message.receiver?._id;
        return receiverId === userId && !message.read;
      }).length;

      // ─── STATS ────────────────────────────────────────────────
      setStats({
        totalAds: userProducts.length,
        totalViews: userProducts.reduce((sum, p) => sum + Number(p.views || 0), 0),
        totalNotifications: userNotifs.length,
        unreadNotifications: userNotifs.filter((n) => !n.read).length,
        unreadMessages: unreadMsgs,
      });

      console.log('✅ Profile data loaded:', {
        totalAds: userProducts.length,
        notifications: userNotifs.length,
        messages: userMessages.length,
      });
    } catch (error) {
      console.error('❌ Profile loading error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // ================================================================
  // DELETE PRODUCT
  // ================================================================

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product permanently?')) return;
    if (!token) {
      alert('Session expired. Please login again.');
      return;
    }

    setDeletingProductId(productId);
    try {
      const result = await deleteProduct(productId, token);
      if (result?.success || result?.message?.includes('deleted')) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        setStats((prev) => ({ ...prev, totalAds: Math.max(0, prev.totalAds - 1) }));
      } else {
        alert(result?.message || 'Delete failed.');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert(error?.message || 'Something went wrong.');
    } finally {
      setDeletingProductId(null);
    }
  };

  // ================================================================
  // EDIT PROFILE PHOTO
  // ================================================================

  const handleEditPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEditPhoto(file);
    setEditPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleRemovePhoto = () => {
    setEditPhoto(null);
    setEditPhotoPreview('');
    setRemovePhoto(true);
  };

  // ================================================================
  // UPDATE PROFILE
  // ================================================================

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    if (!token) {
      setEditError('Session expired. Please login again.');
      return;
    }

    setEditError('');
    setEditLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('email', editEmail.trim().toLowerCase());
      formData.append('phone', editPhone.trim());
      if (removePhoto) {
        formData.append('removePhoto', 'true');
      } else if (editPhoto) {
        formData.append('photo', editPhoto);
      }

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Update failed (${response.status})`);
      }

      if (data.success !== false) {
        setShowEditModal(false);
        // Reload to refresh AuthContext
        window.location.reload();
      } else {
        setEditError(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setEditError(error?.message || 'Something went wrong.');
    } finally {
      setEditLoading(false);
    }
  };

  // ================================================================
  // OPEN CONVERSATION
  // ================================================================

  const openConversation = async (otherUserId) => {
    if (!user?._id) return;
    const currentUserId = user._id;

    const conversationMessages = messagesList.filter((message) => {
      const senderId = typeof message.sender === 'string' ? message.sender : message.sender?._id;
      const receiverId = typeof message.receiver === 'string' ? message.receiver : message.receiver?._id;
      return (
        (senderId === otherUserId || receiverId === otherUserId) &&
        (senderId === currentUserId || receiverId === currentUserId)
      );
    });

    setSelectedConversation({ userId: otherUserId, messages: conversationMessages });

    // Mark unread messages as read
    const unread = conversationMessages.filter((msg) => {
      const receiverId = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
      return receiverId === currentUserId && !msg.read;
    });

    for (const msg of unread) {
      try {
        await messages.markRead(msg._id, token);
        setMessagesList((prev) => prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m)));
        setSelectedConversation((prev) => ({
          ...prev,
          messages: prev.messages.map((m) => (m._id === msg._id ? { ...m, read: true } : m)),
        }));
        setStats((prev) => ({ ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) }));
      } catch (error) {
        console.error('❌ Error marking message as read:', error);
      }
    }

    // Start polling
    startPolling(otherUserId);
  };

  // ================================================================
  // POLLING – FETCH NEW MESSAGES
  // ================================================================

  const startPolling = (otherUserId) => {
    // Clear any existing interval
    if (pollInterval.current) clearInterval(pollInterval.current);

    // Poll every 5 seconds
    pollInterval.current = setInterval(async () => {
      if (!selectedConversation || !user?._id) return;
      try {
        const response = await fetch(`${API_URL}/api/messages/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
          // Filter messages for this conversation
          const newMessages = data.messages.filter((msg) => {
            const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
            const receiverId = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
            return (
              (senderId === otherUserId || receiverId === otherUserId) &&
              (senderId === user._id || receiverId === user._id)
            );
          });
          // Update messagesList and selectedConversation
          setMessagesList((prev) => {
            const existingIds = new Set(prev.map(m => m._id));
            const newMessagesOnly = newMessages.filter(m => !existingIds.has(m._id));
            return [...prev, ...newMessagesOnly];
          });
          setSelectedConversation((prev) => {
            if (!prev) return prev;
            const existingIds = new Set(prev.messages.map(m => m._id));
            const newMessagesOnly = newMessages.filter(m => !existingIds.has(m._id));
            return {
              ...prev,
              messages: [...prev.messages, ...newMessagesOnly],
            };
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);
  };

  // ================================================================
  // SEND REPLY (TEXT) – FIXED
  // ================================================================

  const handleSendReply = async (event) => {
    event.preventDefault();
    if (!replyMessage.trim() || !selectedConversation?.userId || !token) return;

    setSendingReply(true);
    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: selectedConversation.userId,
          message: replyMessage.trim(),
          productId: null,
        }),
      });

      if (!response.ok) {
        let errorData = {};
        try { errorData = await response.json(); } catch {}
        throw new Error(errorData.message || `Failed to send reply (${response.status})`);
      }

      const data = await response.json();
      const newMessage = data.message || data.data || data;

      if (!newMessage?._id) throw new Error('Invalid response from server');

      // Append to UI
      setMessagesList((prev) => [newMessage, ...prev]);
      setSelectedConversation((prev) => ({
        ...prev,
        messages: [newMessage, ...prev.messages],
      }));
      setReplyMessage('');
    } catch (error) {
      console.error('❌ Failed to send reply:', error);
      alert(error?.message || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  // ================================================================
  // SEND FILE ATTACHMENT (image/video/contact)
  // ================================================================

  const handleFileAttachment = async (file) => {
    if (!selectedConversation?.userId || !token) return;

    setUploading(true);
    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('File upload failed');
      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.url || uploadData.secure_url || uploadData.data?.url;

      if (!fileUrl) throw new Error('No URL returned from upload');

      // Determine type
      let label = '📎 File';
      if (file.type.startsWith('image/')) label = '📷 Image';
      else if (file.type.startsWith('video/')) label = '🎥 Video';
      else if (file.type === 'text/vcard') label = '📇 Contact';

      // Send message with URL
      const messageText = `${label}: ${fileUrl}`;

      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: selectedConversation.userId,
          message: messageText,
          productId: null,
        }),
      });

      if (!response.ok) throw new Error('Failed to send file message');

      const data = await response.json();
      const newMessage = data.message || data.data || data;

      if (!newMessage?._id) throw new Error('Invalid response');

      setMessagesList((prev) => [newMessage, ...prev]);
      setSelectedConversation((prev) => ({
        ...prev,
        messages: [newMessage, ...prev.messages],
      }));
    } catch (error) {
      console.error('❌ File attachment error:', error);
      alert(error?.message || 'Failed to send file.');
    } finally {
      setUploading(false);
    }
  };

  // ================================================================
  // GET CONVERSATIONS
  // ================================================================

  const getConversations = () => {
    if (!user?._id) return [];
    const currentUserId = user._id;
    const partners = new Set();

    messagesList.forEach((message) => {
      const senderId = typeof message.sender === 'string' ? message.sender : message.sender?._id;
      const receiverId = typeof message.receiver === 'string' ? message.receiver : message.receiver?._id;
      if (senderId === currentUserId && receiverId) partners.add(receiverId);
      if (receiverId === currentUserId && senderId) partners.add(senderId);
    });

    return Array.from(partners)
      .map((partnerId) => {
        const conversationMessages = messagesList.filter((msg) => {
          const s = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
          const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
          return (s === partnerId || r === partnerId) && (s === currentUserId || r === currentUserId);
        });
        const sorted = [...conversationMessages].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const last = sorted[0] || null;
        const unread = conversationMessages.filter((msg) => {
          const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
          return r === currentUserId && !msg.read;
        }).length;

        let partner = null;
        for (const msg of sorted) {
          const s = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
          const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
          if (s === partnerId) { partner = msg.sender; break; }
          if (r === partnerId) { partner = msg.receiver; break; }
        }

        return { userId: partnerId, partner, last, unread };
      })
      .sort((a, b) => new Date(b.last?.createdAt || 0) - new Date(a.last?.createdAt || 0));
  };

  // ================================================================
  // CLEANUP POLLING ON UNMOUNT
  // ================================================================

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  // ================================================================
  // NOT LOGGED IN
  // ================================================================

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Please Login</h2>
        <p style={{ color: 'var(--gray-500)' }}>You need to be logged in to view your profile.</p>
        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
          Login
        </Link>
      </div>
    );
  }

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      {/* Profile Header */}
      <div
        className="profile-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '24px 28px',
          background: 'white',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--gray-200)',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div
          className="profile-avatar"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 700,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {user.name}
            {user.role === 'admin' && (
              <span style={{ background: '#f59e0b', color: 'white', fontSize: '12px', padding: '2px 12px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                Admin
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--gray-500)' }}>{user.email}</p>
          <p style={{ color: 'var(--gray-500)' }}>
            <i className="fas fa-calendar-alt"></i> Member since{' '}
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/post-ad"
            className="btn-secondary"
            style={{
              padding: '10px 20px',
              background: 'var(--secondary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-plus-circle"></i> Post Ad
          </Link>
          <button
            className="btn-outline"
            onClick={() => {
              setShowEditModal(true);
              setRemovePhoto(false);
              setEditError('');
            }}
            style={{
              padding: '10px 20px',
              border: '1.5px solid var(--gray-300)',
              borderRadius: 'var(--radius-full)',
              background: 'transparent',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-pen"></i> Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalAds}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Total Ads</div>
        </div>
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6' }}>{stats.totalViews}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Total Views</div>
        </div>
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{stats.totalNotifications}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Notifications</div>
          {stats.unreadNotifications > 0 && (
            <span style={{ background: '#e74c3c', color: 'white', fontSize: '11px', padding: '1px 10px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginTop: '4px' }}>
              {stats.unreadNotifications} unread
            </span>
          )}
        </div>
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0ea5e9' }}>{messagesList.length}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Messages</div>
          {stats.unreadMessages > 0 && (
            <span style={{ background: '#e74c3c', color: 'white', fontSize: '11px', padding: '1px 10px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginTop: '4px' }}>
              {stats.unreadMessages} unread
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px' }}>
        {/* My Ads */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-box" style={{ color: 'var(--primary)' }}></i> My Ads
            <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 400 }}>({stats.totalAds})</span>
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray-500)' }}>You haven't posted any ads yet.</p>
              <Link to="/post-ad" className="btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
                Post Your First Ad
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {products.map((product) => {
                const imageUrl = product.images?.length > 0 ? getImageUrl(product.images[0]) : null;
                return (
                  <div
                    key={product._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 16px',
                      background: 'white',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-200)',
                      transition: 'var(--transition)',
                      position: 'relative',
                      flexWrap: 'wrap',
                    }}
                  >
                    {imageUrl && (
                      <div style={{ width: '60px', height: '60px', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <img src={imageUrl} alt={product.title || 'Product'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {product.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                        {product.category} • {product.location} • <i className="fas fa-eye"></i> {product.views || 0}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₵{Number(product.price || 0).toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => navigate(`/edit-product/${product._id}`)}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        <i className="fas fa-pen"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        disabled={deletingProductId === product._id}
                        style={{
                          padding: '6px 12px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: deletingProductId === product._id ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                          opacity: deletingProductId === product._id ? 0.6 : 1,
                        }}
                      >
                        {deletingProductId === product._id ? 'Deleting...' : <><i className="fas fa-trash"></i> Delete</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-envelope" style={{ color: 'var(--primary)' }}></i> Messages
            {stats.unreadMessages > 0 && (
              <span style={{ background: '#e74c3c', color: 'white', fontSize: '11px', padding: '1px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                {stats.unreadMessages} new
              </span>
            )}
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : messagesList.length === 0 ? (
            <div style={{ background: 'white', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray-500)' }}>No messages yet.</p>
            </div>
          ) : selectedConversation ? (
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>
                  {(() => {
                    const first = selectedConversation.messages[0];
                    if (!first) return 'User';
                    const senderId = typeof first.sender === 'string' ? first.sender : first.sender?._id;
                    return senderId === selectedConversation.userId
                      ? first.sender?.name || 'User'
                      : first.receiver?.name || 'User';
                  })()}
                </strong>
                <button onClick={() => {
                  setSelectedConversation(null);
                  if (pollInterval.current) clearInterval(pollInterval.current);
                }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
                  &times;
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[...selectedConversation.messages]
                  .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
                  .map((message) => {
                    const senderId = typeof message.sender === 'string' ? message.sender : message.sender?._id;
                    const isMine = senderId === user._id;
                    return (
                      <div
                        key={message._id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          background: isMine ? 'var(--primary)' : 'var(--gray-100)',
                          color: isMine ? 'white' : 'var(--gray-800)',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                        }}
                      >
                        {message.message}
                        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderTop: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type a reply..."
                    style={{ flex: 1, padding: '8px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || uploading}
                    style={{
                      padding: '8px 20px',
                      background: 'var(--secondary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      cursor: (sendingReply || uploading) ? 'not-allowed' : 'pointer',
                      opacity: (sendingReply || uploading) ? 0.7 : 1,
                    }}
                  >
                    {sendingReply ? 'Sending...' : 'Reply'}
                  </button>
                </div>

                {/* Attachment buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <label style={{ cursor: 'pointer', background: '#f1f5f9', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fas fa-image"></i> Image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <label style={{ cursor: 'pointer', background: '#f1f5f9', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fas fa-video"></i> Video
                    <input
                      type="file"
                      accept="video/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <label style={{ cursor: 'pointer', background: '#f1f5f9', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fas fa-address-card"></i> Contact
                    <input
                      type="file"
                      accept=".vcf,.vcard"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {uploading && <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Uploading...</span>}
                </div>
              </form>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getConversations().map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => openConversation(conversation.userId)}
                  style={{
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {conversation.partner?.name || 'User'}
                      {conversation.unread > 0 && (
                        <span style={{ background: '#e74c3c', color: 'white', fontSize: '10px', padding: '1px 8px', borderRadius: 'var(--radius-full)', marginLeft: '8px' }}>
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                      {conversation.last?.message || 'No messages'}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                    {conversation.last?.createdAt ? new Date(conversation.last.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="edit-profile-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowEditModal(false)}>
              &times;
            </button>
            <h2>Edit Profile</h2>
            {editError && <div className="error-banner">{editError}</div>}
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Profile Photo</label>
                <div className="photo-upload-row">
                  <div className="photo-preview">
                    {editPhotoPreview ? <img src={editPhotoPreview} alt="Preview" /> : <i className="fas fa-user"></i>}
                  </div>
                  <input type="file" accept="image/*" onChange={handleEditPhotoChange} />
                  <button type="button" className="remove-photo-btn" onClick={handleRemovePhoto}>
                    Remove Photo
                  </button>
                </div>
                {removePhoto && <small className="remove-photo-hint">Photo will be removed when you save.</small>}
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>

              <button type="submit" className="save-btn" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;