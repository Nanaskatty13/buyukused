// frontend/src/pages/Profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  const [editRole, setEditRole] = useState('buyer'); // ✅ new state
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);

  // ================================================================
  // KEEP EDIT FIELDS IN SYNC WITH USER
  // ================================================================

  useEffect(() => {
    if (!user) return;
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'buyer'); // ✅ set role
    setEditPhotoPreview(user.photoURL || '');
    setEditPhoto(null);
    setRemovePhoto(false);
  }, [user]);

  // ================================================================
  // LOAD PROFILE DATA
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
  // DELETE PRODUCT (kept for potential future use)
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
      formData.append('role', editRole); // ✅ append role
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
  // NAVIGATION HELPERS (with fallback if route doesn't exist)
  // ================================================================

  const navigateTo = (path) => {
    navigate(path);
  };

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
            {user.role && user.role !== 'admin' && (
              <span style={{ background: '#525355', color: '#374151', fontSize: '12px', padding: '2px 12px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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

      {/* ─── STATS CARDS – CLICKABLE ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
        }}
      >
        {/* TOTAL ADS */}
        <div
          onClick={() => navigateTo('/my-ads')}
          style={{
            background: 'white',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalAds}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>TOTAL ADS</div>
        </div>

        {/* TOTAL VIEWS */}
        <div
          onClick={() => navigateTo('/analytics')}
          style={{
            background: 'white',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6' }}>{stats.totalViews}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>TOTAL VIEWS</div>
        </div>

        {/* NOTIFICATIONS */}
        <div
          onClick={() => navigateTo('/notifications')}
          style={{
            background: 'white',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{stats.totalNotifications}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>NOTIFICATIONS</div>
          {stats.unreadNotifications > 0 && (
            <span style={{ background: '#e74c3c', color: 'white', fontSize: '11px', padding: '1px 10px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginTop: '4px' }}>
              {stats.unreadNotifications} unread
            </span>
          )}
        </div>

        {/* MESSAGES */}
        <div
          onClick={() => navigateTo('/messages')}
          style={{
            background: 'white',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0ea5e9' }}>{messagesList.length}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>MESSAGES</div>
          {stats.unreadMessages > 0 && (
            <span style={{ background: '#e74c3c', color: 'white', fontSize: '11px', padding: '1px 10px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginTop: '4px' }}>
              {stats.unreadMessages} unread
            </span>
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

              {/* ✅ Account Type (Role) */}
              <div className="form-group">
                <label>Account Type</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="rider">Rider</option>
                </select>
                <small style={{ display: 'block', marginTop: '4px', color: 'var(--gray-500)' }}>
                  Your role determines what features you can access.
                </small>
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