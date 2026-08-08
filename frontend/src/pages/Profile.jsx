import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ✅ Import helpers from API
import {
  getProducts,
  getNotifications,
  getImageUrl,
  API_URL,
} from '../services/api';

// ✅ CORRECT: named import (not namespace)
import { messages } from '../services/messages';

const Profile = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAds: 0,
    totalViews: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
  });

  // Edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(user?.photoURL || '');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Messaging state
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // ─── Data fetching ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
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
        console.log('👤 Fetching data for user:', userId);

        const [userProducts, userNotifs, userMessages] = await Promise.all([
          getProducts({ sellerId: userId }),
          getNotifications(userId, token),
          messages.getForUser(userId, token),
        ]);

        const productsList = userProducts?.products || [];
        const notifsList = Array.isArray(userNotifs) ? userNotifs : [];
        const messagesList = Array.isArray(userMessages) ? userMessages : [];

        setProducts(productsList);
        setNotifications(notifsList);
        setMessagesList(messagesList);

        const unreadMsgs = messagesList.filter(
          (m) => m.receiver === userId && !m.read
        ).length;

        setStats({
          totalAds: productsList.length,
          totalViews: productsList.reduce((sum, p) => sum + (p.views || 0), 0),
          totalNotifications: notifsList.length,
          unreadNotifications: notifsList.filter((n) => !n.read).length,
          unreadMessages: unreadMsgs,
        });
      } catch (error) {
        console.error('❌ Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  // ─── Edit Profile ──────────────────────────────────────────────────────
  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPhoto(file);
      setEditPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    const formData = new FormData();
    formData.append('name', editName);
    formData.append('email', editEmail);
    formData.append('phone', editPhone);
    if (editPhoto) {
      formData.append('photo', editPhoto);
    }

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        setEditError(data.message || 'Update failed');
      }
    } catch (err) {
      setEditError(err.message || 'Something went wrong');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Messaging ────────────────────────────────────────────────────────
  const openConversation = async (otherUserId) => {
    const msgs = messagesList.filter(
      (m) =>
        (m.sender?._id === otherUserId || m.receiver?._id === otherUserId) &&
        (m.sender?._id === user._id || m.receiver?._id === user._id)
    );
    setSelectedConversation({ userId: otherUserId, messages: msgs });

    const unread = msgs.filter((m) => m.receiver === user._id && !m.read);
    for (const m of unread) {
      try {
        await messages.markRead(m._id, token);
        setMessagesList((prev) =>
          prev.map((msg) =>
            msg._id === m._id ? { ...msg, read: true } : msg
          )
        );
        setStats((prev) => ({ ...prev, unreadMessages: prev.unreadMessages - 1 }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setSendingReply(true);
    try {
      const newMsg = await messages.send(
        selectedConversation.userId,
        replyMessage,
        null,
        token
      );
      setMessagesList((prev) => [newMsg, ...prev]);
      setSelectedConversation((prev) => ({
        ...prev,
        messages: [newMsg, ...prev.messages],
      }));
      setReplyMessage('');
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getConversations = () => {
    const partners = new Set();
    messagesList.forEach((m) => {
      if (m.sender?._id === user._id) partners.add(m.receiver?._id);
      if (m.receiver?._id === user._id) partners.add(m.sender?._id);
    });
    return Array.from(partners)
      .map((id) => {
        const msgs = messagesList.filter(
          (m) =>
            (m.sender?._id === id || m.receiver?._id === id) &&
            (m.sender?._id === user._id || m.receiver?._id === user._id)
        );
        const last = msgs[0] || null;
        const unread = msgs.filter(
          (m) => m.receiver?._id === user._id && !m.read
        ).length;
        const partner =
          msgs[0]?.sender?._id === id ? msgs[0]?.sender : msgs[0]?.receiver;
        return { userId: id, partner, last, unread };
      })
      .sort((a, b) => new Date(b.last?.createdAt) - new Date(a.last?.createdAt));
  };

  // ─── Render ──────────────────────────────────────────────────────────

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

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      {/* ─── Profile Header ─────────────────────────────────────────── */}
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
            <img
              src={user.photoURL}
              alt={user.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {user.name}
            {user.role === 'admin' && (
              <span
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                Admin
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--gray-500)' }}>{user.email}</p>
          <p style={{ color: 'var(--gray-500)' }}>
            <i className="fas fa-calendar-alt"></i> Member since{' '}
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : 'N/A'}
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
            onClick={() => setShowEditModal(true)}
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

      {/* ─── Stats Cards ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
            {stats.totalAds}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Total Ads</div>
        </div>
        <div
          style={{
            background: 'white',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6' }}>
            {stats.totalViews}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Total Views</div>
        </div>
        <div
          style={{
            background: 'white',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>
            {stats.totalNotifications}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            Notifications
          </div>
          {stats.unreadNotifications > 0 && (
            <span
              style={{
                background: '#e74c3c',
                color: 'white',
                fontSize: '11px',
                padding: '1px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
                marginTop: '4px',
              }}
            >
              {stats.unreadNotifications} unread
            </span>
          )}
        </div>
        <div
          style={{
            background: 'white',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0ea5e9' }}>
            {messagesList.length}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Messages</div>
          {stats.unreadMessages > 0 && (
            <span
              style={{
                background: '#e74c3c',
                color: 'white',
                fontSize: '11px',
                padding: '1px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
                marginTop: '4px',
              }}
            >
              {stats.unreadMessages} unread
            </span>
          )}
        </div>
      </div>

      {/* ─── Main content: My Ads + Messages ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-box" style={{ color: 'var(--primary)' }}></i> My Ads
            <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 400 }}>
              ({stats.totalAds})
            </span>
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <div
              style={{
                background: 'white',
                padding: '40px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'var(--gray-500)' }}>You haven't posted any ads yet.</p>
              <Link
                to="/post-ad"
                className="btn-primary"
                style={{ display: 'inline-block', marginTop: '12px' }}
              >
                Post Your First Ad
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {products.slice(0, 5).map((p) => {
                const imageUrl = p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : null;
                return (
                  <Link
                    to={`/product/${p._id}`}
                    key={p._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 16px',
                      background: 'white',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-200)',
                      textDecoration: 'none',
                      transition: 'var(--transition)',
                    }}
                  >
                    {imageUrl && (
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          flexShrink: 0,
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                        {p.category} • {p.location} •{' '}
                        <i className="fas fa-eye"></i> {p.views || 0}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ₵{p.price?.toLocaleString()}
                    </div>
                  </Link>
                );
              })}
              {products.length > 5 && (
                <Link
                  to="/products?my-ads=true"
                  style={{
                    color: 'var(--primary)',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  View all {products.length} ads →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Messages section */}
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-envelope" style={{ color: 'var(--primary)' }}></i> Messages
            {stats.unreadMessages > 0 && (
              <span
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  fontSize: '11px',
                  padding: '1px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                {stats.unreadMessages} new
              </span>
            )}
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : messagesList.length === 0 ? (
            <div
              style={{
                background: 'white',
                padding: '30px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'var(--gray-500)' }}>No messages yet.</p>
            </div>
          ) : (
            <div>
              {selectedConversation ? (
                <div
                  style={{
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--gray-200)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <strong>
                      {selectedConversation.messages[0]?.sender?._id ===
                      selectedConversation.userId
                        ? selectedConversation.messages[0]?.sender?.name || 'User'
                        : selectedConversation.messages[0]?.receiver?.name || 'User'}
                    </strong>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                      }}
                    >
                      &times;
                    </button>
                  </div>
                  <div
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {selectedConversation.messages.map((m) => (
                      <div
                        key={m._id}
                        style={{
                          alignSelf:
                            m.sender?._id === user._id ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          background:
                            m.sender?._id === user._id
                              ? 'var(--primary)'
                              : 'var(--gray-100)',
                          color:
                            m.sender?._id === user._id ? 'white' : 'var(--gray-800)',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                        }}
                      >
                        {m.message}
                        <div
                          style={{
                            fontSize: '10px',
                            opacity: 0.7,
                            marginTop: '4px',
                          }}
                        >
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleSendReply}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '12px',
                      borderTop: '1px solid var(--gray-200)',
                    }}
                  >
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type a reply..."
                      style={{
                        flex: 1,
                        padding: '8px 14px',
                        border: '1.5px solid var(--gray-200)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={sendingReply}
                      style={{
                        padding: '8px 20px',
                        background: 'var(--secondary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                        cursor: sendingReply ? 'not-allowed' : 'pointer',
                        opacity: sendingReply ? 0.7 : 1,
                      }}
                    >
                      {sendingReply ? 'Sending...' : 'Reply'}
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getConversations().map((conv) => (
                    <div
                      key={conv.userId}
                      onClick={() => openConversation(conv.userId)}
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
                          {conv.partner?.name || 'User'}
                          {conv.unread > 0 && (
                            <span
                              style={{
                                background: '#e74c3c',
                                color: 'white',
                                fontSize: '10px',
                                padding: '1px 8px',
                                borderRadius: 'var(--radius-full)',
                                marginLeft: '8px',
                              }}
                            >
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: 'var(--gray-500)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '150px',
                          }}
                        >
                          {conv.last?.message || 'No messages'}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                        {conv.last
                          ? new Date(conv.last.createdAt).toLocaleDateString()
                          : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Edit Profile Modal ──────────────────────────────────────── */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '480px',
              width: '100%',
              padding: '32px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '18px',
                fontSize: '28px',
                cursor: 'pointer',
                color: 'var(--gray-400)',
                background: 'none',
                border: 'none',
              }}
            >
              &times;
            </button>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Edit Profile
            </h2>

            {editError && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                }}
              >
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '13px',
                    marginBottom: '4px',
                  }}
                >
                  Profile Photo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'var(--gray-200)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {editPhotoPreview ? (
                      <img
                        src={editPhotoPreview}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <i
                        className="fas fa-user"
                        style={{ fontSize: '32px', color: 'var(--gray-400)' }}
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoChange}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '13px',
                    marginBottom: '4px',
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '13px',
                    marginBottom: '4px',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '13px',
                    marginBottom: '4px',
                  }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={editLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: editLoading ? 'not-allowed' : 'pointer',
                  opacity: editLoading ? 0.7 : 1,
                }}
              >
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