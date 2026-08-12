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
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);

  // Messaging
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

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

      /*
       * IMPORTANT:
       *
       * Use getUserNotifications here.
       *
       * DO NOT use getNotifications because getNotifications
       * points to the ADMIN notification endpoint.
       */

      const [userProducts, userNotifs, userMessages] =
        await Promise.all([
          getProducts({ sellerId: userId }),

          // FIXED:
          getUserNotifications(userId, token),

          messages.getForUser(userId, token),
        ]);

      // ============================================================
      // PRODUCTS
      // ============================================================

      const productsList = Array.isArray(userProducts)
        ? userProducts
        : userProducts?.products || [];

      // ============================================================
      // NOTIFICATIONS
      // Supports:
      // []
      // { notifications: [] }
      // { data: [] }
      // ============================================================

      const notifsList = Array.isArray(userNotifs)
        ? userNotifs
        : Array.isArray(userNotifs?.notifications)
          ? userNotifs.notifications
          : Array.isArray(userNotifs?.data)
            ? userNotifs.data
            : [];

      // ============================================================
      // MESSAGES
      // ============================================================

      const loadedMessages = Array.isArray(userMessages)
        ? userMessages
        : Array.isArray(userMessages?.messages)
          ? userMessages.messages
          : Array.isArray(userMessages?.data)
            ? userMessages.data
            : [];

      setProducts(productsList);
      setNotifications(notifsList);
      setMessagesList(loadedMessages);

      // ============================================================
      // UNREAD MESSAGES
      // ============================================================

      const unreadMsgs = loadedMessages.filter((message) => {
        const receiverId =
          typeof message.receiver === 'string'
            ? message.receiver
            : message.receiver?._id;

        return receiverId === userId && !message.read;
      }).length;

      // ============================================================
      // STATS
      // ============================================================

      setStats({
        totalAds: productsList.length,

        totalViews: productsList.reduce(
          (sum, product) => sum + Number(product.views || 0),
          0
        ),

        totalNotifications: notifsList.length,

        unreadNotifications: notifsList.filter(
          (notification) => !notification.read
        ).length,

        unreadMessages: unreadMsgs,
      });

      console.log('✅ Profile data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching profile data:', error);

      /*
       * Do not crash the entire Profile page if notifications
       * fail. The rest of the profile can still display.
       */
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
    const confirmed = window.confirm(
      'Are you sure you want to delete this product? This action cannot be undone.'
    );

    if (!confirmed) return;

    if (!token) {
      alert('Your session has expired. Please login again.');
      return;
    }

    setDeletingProductId(productId);

    try {
      const result = await deleteProduct(productId, token);

      if (
        result?.success ||
        result?.message === 'Product deleted' ||
        result?.message === 'Product deleted successfully'
      ) {
        setProducts((prev) =>
          prev.filter((product) => product._id !== productId)
        );

        setStats((prev) => ({
          ...prev,
          totalAds: Math.max(0, prev.totalAds - 1),
        }));

        alert('Product deleted successfully.');
      } else {
        alert(result?.message || 'Failed to delete product.');
      }
    } catch (error) {
      console.error('❌ Delete product error:', error);

      alert(
        error?.message ||
          'An error occurred while deleting the product.'
      );
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
      setEditError('Your session has expired. Please login again.');
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

      const response = await fetch(
        `${API_URL}/api/users/profile`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Profile update failed (${response.status})`
        );
      }

      if (data.success !== false) {
        setShowEditModal(false);

        /*
         * Reloading ensures the AuthContext gets the latest
         * profile information.
         */
        window.location.reload();
      } else {
        setEditError(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);

      setEditError(
        error?.message || 'Something went wrong while updating your profile.'
      );
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
      const senderId =
        typeof message.sender === 'string'
          ? message.sender
          : message.sender?._id;

      const receiverId =
        typeof message.receiver === 'string'
          ? message.receiver
          : message.receiver?._id;

      return (
        (senderId === otherUserId || receiverId === otherUserId) &&
        (senderId === currentUserId || receiverId === currentUserId)
      );
    });

    setSelectedConversation({
      userId: otherUserId,
      messages: conversationMessages,
    });

    const unreadMessages = conversationMessages.filter((message) => {
      const receiverId =
        typeof message.receiver === 'string'
          ? message.receiver
          : message.receiver?._id;

      return receiverId === currentUserId && !message.read;
    });

    for (const message of unreadMessages) {
      try {
        await messages.markRead(message._id, token);

        setMessagesList((prev) =>
          prev.map((msg) =>
            msg._id === message._id
              ? { ...msg, read: true }
              : msg
          )
        );

        setSelectedConversation((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg._id === message._id
                ? { ...msg, read: true }
                : msg
            ),
          };
        });

        setStats((prev) => ({
          ...prev,
          unreadMessages: Math.max(
            0,
            prev.unreadMessages - 1
          ),
        }));
      } catch (error) {
        console.error(
          '❌ Error marking message as read:',
          error
        );
      }
    }
  };

  // ================================================================
  // SEND MESSAGE
  // ================================================================

  const handleSendReply = async (event) => {
    event.preventDefault();

    if (!replyMessage.trim()) return;
    if (!selectedConversation?.userId) return;
    if (!token) return;

    setSendingReply(true);

    try {
      const newMessage = await messages.send(
        selectedConversation.userId,
        replyMessage.trim(),
        null,
        token
      );

      const normalizedMessage =
        newMessage?.message || newMessage?.data
          ? newMessage?.message || newMessage?.data
          : newMessage;

      setMessagesList((prev) => [
        normalizedMessage,
        ...prev,
      ]);

      setSelectedConversation((prev) => ({
        ...prev,
        messages: [
          normalizedMessage,
          ...prev.messages,
        ],
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
  // GET CONVERSATIONS
  // ================================================================

  const getConversations = () => {
    if (!user?._id) return [];

    const currentUserId = user._id;
    const partners = new Set();

    messagesList.forEach((message) => {
      const senderId =
        typeof message.sender === 'string'
          ? message.sender
          : message.sender?._id;

      const receiverId =
        typeof message.receiver === 'string'
          ? message.receiver
          : message.receiver?._id;

      if (senderId === currentUserId && receiverId) {
        partners.add(receiverId);
      }

      if (receiverId === currentUserId && senderId) {
        partners.add(senderId);
      }
    });

    return Array.from(partners)
      .map((partnerId) => {
        const conversationMessages = messagesList.filter(
          (message) => {
            const senderId =
              typeof message.sender === 'string'
                ? message.sender
                : message.sender?._id;

            const receiverId =
              typeof message.receiver === 'string'
                ? message.receiver
                : message.receiver?._id;

            return (
              (senderId === partnerId ||
                receiverId === partnerId) &&
              (senderId === currentUserId ||
                receiverId === currentUserId)
            );
          }
        );

        const sortedMessages = [...conversationMessages].sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

        const last = sortedMessages[0] || null;

        const unread = conversationMessages.filter(
          (message) => {
            const receiverId =
              typeof message.receiver === 'string'
                ? message.receiver
                : message.receiver?._id;

            return (
              receiverId === currentUserId &&
              !message.read
            );
          }
        ).length;

        let partner = null;

        for (const message of sortedMessages) {
          const senderId =
            typeof message.sender === 'string'
              ? message.sender
              : message.sender?._id;

          const receiverId =
            typeof message.receiver === 'string'
              ? message.receiver
              : message.receiver?._id;

          if (senderId === partnerId) {
            partner = message.sender;
            break;
          }

          if (receiverId === partnerId) {
            partner = message.receiver;
            break;
          }
        }

        return {
          userId: partnerId,
          partner,
          last,
          unread,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.last?.createdAt || 0) -
          new Date(a.last?.createdAt || 0)
      );
  };

  // ================================================================
  // NOT LOGGED IN
  // ================================================================

  if (!user) {
    return (
      <div
        className="container"
        style={{
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <h2>Please Login</h2>

        <p
          style={{
            color: 'var(--gray-500)',
          }}
        >
          You need to be logged in to view your profile.
        </p>

        <Link
          to="/login"
          className="btn-primary"
          style={{
            display: 'inline-block',
            marginTop: '16px',
          }}
        >
          Login
        </Link>
      </div>
    );
  }

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div
      className="container"
      style={{
        padding: '30px 20px',
      }}
    >
      {/* ============================================================
          PROFILE HEADER
      ============================================================ */}

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
              alt={user.name || 'Profile'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            user.name?.charAt(0).toUpperCase() || 'U'
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
              flexWrap: 'wrap',
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

          <p style={{ color: 'var(--gray-500)' }}>
            {user.email}
          </p>

          <p style={{ color: 'var(--gray-500)' }}>
            <i className="fas fa-calendar-alt"></i>{' '}
            Member since{' '}
            {user.createdAt
              ? new Date(
                  user.createdAt
                ).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
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
            <i className="fas fa-plus-circle"></i>
            Post Ad
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
            <i className="fas fa-pen"></i>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ============================================================
          STATS
      ============================================================ */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(150px, 1fr))',
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
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--primary)',
            }}
          >
            {stats.totalAds}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: 'var(--gray-500)',
            }}
          >
            Total Ads
          </div>
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
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#8b5cf6',
            }}
          >
            {stats.totalViews}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: 'var(--gray-500)',
            }}
          >
            Total Views
          </div>
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
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#f59e0b',
            }}
          >
            {stats.totalNotifications}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: 'var(--gray-500)',
            }}
          >
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
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0ea5e9',
            }}
          >
            {messagesList.length}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: 'var(--gray-500)',
            }}
          >
            Messages
          </div>

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

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
          gap: '24px',
        }}
      >
        {/* ==========================================================
            MY ADS
        ========================================================== */}

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
            <i
              className="fas fa-box"
              style={{
                color: 'var(--primary)',
              }}
            ></i>

            My Ads

            <span
              style={{
                fontSize: '13px',
                color: 'var(--gray-500)',
                fontWeight: 400,
              }}
            >
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
              <p
                style={{
                  color: 'var(--gray-500)',
                }}
              >
                You haven't posted any ads yet.
              </p>

              <Link
                to="/post-ad"
                className="btn-primary"
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                }}
              >
                Post Your First Ad
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {products.slice(0, 5).map((product) => {
                const imageUrl =
                  product.images?.length > 0
                    ? getImageUrl(product.images[0])
                    : null;

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
                          alt={product.title || 'Product'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        flex: 1,
                        minWidth: '150px',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--gray-800)',
                        }}
                      >
                        <Link
                          to={`/product/${product._id}`}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                        >
                          {product.title}
                        </Link>
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          color: 'var(--gray-500)',
                        }}
                      >
                        {product.category} •{' '}
                        {product.location} •{' '}
                        <i className="fas fa-eye"></i>{' '}
                        {product.views || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        fontWeight: 700,
                        color: 'var(--primary)',
                      }}
                    >
                      ₵
                      {Number(
                        product.price || 0
                      ).toLocaleString()}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(
                            `/edit-product/${product._id}`
                          );
                        }}
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
                        <i className="fas fa-pen"></i>{' '}
                        Edit
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteProduct(
                            product._id
                          );
                        }}
                        disabled={
                          deletingProductId ===
                          product._id
                        }
                        style={{
                          padding: '6px 12px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor:
                            deletingProductId ===
                            product._id
                              ? 'not-allowed'
                              : 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                          opacity:
                            deletingProductId ===
                            product._id
                              ? 0.6
                              : 1,
                        }}
                      >
                        {deletingProductId ===
                        product._id ? (
                          'Deleting...'
                        ) : (
                          <>
                            <i className="fas fa-trash"></i>{' '}
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
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

        {/* ==========================================================
            MESSAGES
        ========================================================== */}

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
            <i
              className="fas fa-envelope"
              style={{
                color: 'var(--primary)',
              }}
            ></i>

            Messages

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
              <p
                style={{
                  color: 'var(--gray-500)',
                }}
              >
                No messages yet.
              </p>
            </div>
          ) : selectedConversation ? (
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
                  borderBottom:
                    '1px solid var(--gray-200)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <strong>
                  {(() => {
                    const first =
                      selectedConversation.messages[0];

                    if (!first) return 'User';

                    const senderId =
                      typeof first.sender === 'string'
                        ? first.sender
                        : first.sender?._id;

                    return senderId ===
                      selectedConversation.userId
                      ? first.sender?.name || 'User'
                      : first.receiver?.name || 'User';
                  })()}
                </strong>

                <button
                  onClick={() =>
                    setSelectedConversation(null)
                  }
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
                {[...selectedConversation.messages]
                  .sort(
                    (a, b) =>
                      new Date(
                        a.createdAt || 0
                      ) -
                      new Date(
                        b.createdAt || 0
                      )
                  )
                  .map((message) => {
                    const senderId =
                      typeof message.sender === 'string'
                        ? message.sender
                        : message.sender?._id;

                    const isMine =
                      senderId === user._id;

                    return (
                      <div
                        key={message._id}
                        style={{
                          alignSelf: isMine
                            ? 'flex-end'
                            : 'flex-start',
                          maxWidth: '80%',
                          background: isMine
                            ? 'var(--primary)'
                            : 'var(--gray-100)',
                          color: isMine
                            ? 'white'
                            : 'var(--gray-800)',
                          padding: '8px 14px',
                          borderRadius:
                            'var(--radius-md)',
                          fontSize: '14px',
                        }}
                      >
                        {message.message}

                        <div
                          style={{
                            fontSize: '10px',
                            opacity: 0.7,
                            marginTop: '4px',
                          }}
                        >
                          {message.createdAt
                            ? new Date(
                                message.createdAt
                              ).toLocaleTimeString()
                            : ''}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <form
                onSubmit={handleSendReply}
                style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '12px',
                  borderTop:
                    '1px solid var(--gray-200)',
                }}
              >
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(event) =>
                    setReplyMessage(event.target.value)
                  }
                  placeholder="Type a reply..."
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    border:
                      '1.5px solid var(--gray-200)',
                    borderRadius:
                      'var(--radius-md)',
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
                    borderRadius:
                      'var(--radius-full)',
                    fontWeight: 600,
                    cursor: sendingReply
                      ? 'not-allowed'
                      : 'pointer',
                    opacity: sendingReply ? 0.7 : 1,
                  }}
                >
                  {sendingReply
                    ? 'Sending...'
                    : 'Reply'}
                </button>
              </form>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {getConversations().map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() =>
                    openConversation(
                      conversation.userId
                    )
                  }
                  style={{
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius:
                      'var(--radius-md)',
                    border:
                      '1px solid var(--gray-200)',
                    cursor: 'pointer',
                    transition:
                      'var(--transition)',
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {conversation.partner?.name ||
                        'User'}

                      {conversation.unread > 0 && (
                        <span
                          style={{
                            background: '#e74c3c',
                            color: 'white',
                            fontSize: '10px',
                            padding: '1px 8px',
                            borderRadius:
                              'var(--radius-full)',
                            marginLeft: '8px',
                          }}
                        >
                          {conversation.unread}
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
                      {conversation.last?.message ||
                        'No messages'}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--gray-400)',
                    }}
                  >
                    {conversation.last?.createdAt
                      ? new Date(
                          conversation.last.createdAt
                        ).toLocaleDateString()
                      : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          EDIT PROFILE MODAL
      ============================================================ */}

      {showEditModal && (
        <div
          className="edit-profile-overlay"
          onClick={() =>
            setShowEditModal(false)
          }
        >
          <div
            className="edit-profile-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-btn"
              onClick={() =>
                setShowEditModal(false)
              }
            >
              &times;
            </button>

            <h2>Edit Profile</h2>

            {editError && (
              <div className="error-banner">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              {/* PHOTO */}

              <div className="form-group">
                <label>Profile Photo</label>

                <div className="photo-upload-row">
                  <div className="photo-preview">
                    {editPhotoPreview ? (
                      <img
                        src={editPhotoPreview}
                        alt="Preview"
                      />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleEditPhotoChange
                    }
                  />

                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={
                      handleRemovePhoto
                    }
                  >
                    Remove Photo
                  </button>
                </div>

                {removePhoto && (
                  <small className="remove-photo-hint">
                    Photo will be removed when
                    you save.
                  </small>
                )}
              </div>

              {/* NAME */}

              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(event.target.value)
                  }
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) =>
                    setEditEmail(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              {/* PHONE */}

              <div className="form-group">
                <label>Phone</label>

                <input
                  type="tel"
                  value={editPhone}
                  onChange={(event) =>
                    setEditPhone(
                      event.target.value
                    )
                  }
                />
              </div>

              <button
                type="submit"
                className="save-btn"
                disabled={editLoading}
              >
                {editLoading
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;