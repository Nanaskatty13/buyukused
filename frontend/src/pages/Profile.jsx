// frontend/src/pages/Profile.jsx
import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/global.css";

import {
  getProducts,
  getUserNotifications,
  getImageUrl,
  API_URL,
  deleteProduct,
  getSellerReviews,
  deleteReview,
} from "../services/api";

import { messages } from "../services/messages";

// ─── Loading Dots ─────────────────────────────────────────────
const LoadingDots = ({ size = 14, color = "#0066cc" }) => {
  return (
    <span className="loading-dots-inline">
      <span></span>
      <span></span>
      <span></span>
      <style>
        {`
          .loading-dots-inline {
            display: inline-flex;
            gap: 6px;
            align-items: center;
          }
          .loading-dots-inline span {
            display: block;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            animation: loading-dot-bounce-inline 1.2s ease-in-out infinite;
          }
          .loading-dots-inline span:nth-child(1) { animation-delay: 0s; }
          .loading-dots-inline span:nth-child(2) { animation-delay: 0.2s; }
          .loading-dots-inline span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes loading-dot-bounce-inline {
            0%, 80%, 100% { transform: translateY(0) scale(0.8); opacity: 0.4; }
            40% { transform: translateY(-12px) scale(1); opacity: 1; }
          }
        `}
      </style>
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────
const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // ─── State ──────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewError, setReviewError] = useState("");

  // ─── Stats ──────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalAds: 0,
    totalViews: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
  });

  // ─── Edit Profile ──────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editState, setEditState] = useState("");
  const [editRole, setEditRole] = useState("buyer");
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);

  // ─── Tab state ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");

  // ─── Keep edit form in sync ───────────────────────────────
  useEffect(() => {
    if (!user) return;
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditLocation(user.location || "");
    setEditState(user.state || "");
    setEditRole(user.role || "buyer");
    const photo = user.photoURL || user.photo || user.profileImage || user.avatar || "";
    setEditPhotoPreview(photo);
    setEditPhoto(null);
    setRemovePhoto(false);
    setEditError("");
  }, [user]);

  // ─── Load reviews ──────────────────────────────────────────
  const loadReviews = useCallback(async () => {
    if (!user || !token) return;
    const userId = user._id || user.id || user.userId;
    if (!userId) return;
    setReviewsLoading(true);
    setReviewError("");
    try {
      const response = await getSellerReviews(userId, { page: 1, limit: 100 }, token);
      const reviewList = Array.isArray(response) ? response : response?.reviews || response?.data || [];
      setReviews(reviewList);
      const summary = response?.summary || {};
      const average = Number(summary.averageRating ?? response?.averageRating ?? 0);
      const total = Number(summary.totalReviews ?? response?.totalReviews ?? reviewList.length);
      setReviewSummary({
        averageRating: Number.isFinite(average) ? average : 0,
        totalReviews: Number.isFinite(total) ? total : reviewList.length,
      });
    } catch (error) {
      console.error("❌ Failed to load reviews:", error);
      setReviewError(error?.message || "Unable to load reviews.");
    } finally {
      setReviewsLoading(false);
    }
  }, [user, token]);

  // ─── Load profile data ─────────────────────────────────────
  const loadUserData = useCallback(async () => {
    if (!user || !token) return;
    const userId = user._id || user.id || user.userId;
    if (!userId) {
      console.warn("No user ID found:", user);
      return;
    }
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        getProducts({ sellerId: userId, limit: 100 }),
        getUserNotifications(userId, token),
        messages.getForUser(userId, token),
      ]);

      let userProducts = [];
      if (results[0]?.status === "fulfilled") {
        const response = results[0].value;
        userProducts = Array.isArray(response) ? response : response?.products || response?.data || [];
      } else {
        console.error("Products failed:", results[0]?.reason);
        try {
          const response = await fetch(`${API_URL}/api/users/me/products`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            userProducts = data?.products || [];
          }
        } catch (fallbackError) {
          console.error("Fallback products failed:", fallbackError);
        }
      }

      let userNotifications = [];
      if (results[1]?.status === "fulfilled") {
        const response = results[1].value;
        userNotifications = Array.isArray(response) ? response : response?.notifications || response?.data || [];
      } else {
        console.error("Notifications failed:", results[1]?.reason);
      }

      let userMessages = [];
      if (results[2]?.status === "fulfilled") {
        const response = results[2].value;
        userMessages = Array.isArray(response) ? response : response?.messages || response?.data || [];
      } else {
        console.error("Messages failed:", results[2]?.reason);
      }

      setProducts(userProducts);
      setNotifications(userNotifications);
      setMessagesList(userMessages);

      const unreadMessages = userMessages.filter((message) => {
        const receiverId = typeof message.receiver === "string" ? message.receiver : message.receiver?._id || message.receiver?.id;
        return String(receiverId) === String(userId) && !message.read;
      }).length;

      const unreadNotifications = userNotifications.filter((n) => !n.read).length;
      const totalViews = userProducts.reduce((sum, p) => sum + Number(p.views || 0), 0);

      setStats({
        totalAds: userProducts.length,
        totalViews,
        totalNotifications: userNotifications.length,
        unreadNotifications,
        unreadMessages,
      });
    } catch (error) {
      console.error("Profile loading error:", error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // ─── Initial load ──────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) return;
    loadUserData();
    loadReviews();
  }, [user, token, loadUserData, loadReviews]);

  // ─── Delete Product ────────────────────────────────────────
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this ad permanently?")) return;
    if (!token) {
      alert("Your session has expired. Please login again.");
      return;
    }
    setDeletingProductId(productId);
    try {
      const result = await deleteProduct(productId, token);
      if (result?.success || result?.message?.toLowerCase()?.includes("deleted")) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        setStats((prev) => ({ ...prev, totalAds: Math.max(0, prev.totalAds - 1) }));
      } else {
        alert(result?.message || "Delete failed.");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      alert(error?.message || "Something went wrong.");
    } finally {
      setDeletingProductId(null);
    }
  };

  // ─── Delete Review ─────────────────────────────────────────
  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;
    if (!window.confirm("Delete this review permanently?")) return;
    if (!token) {
      alert("Your session has expired. Please login again.");
      return;
    }
    setDeletingReviewId(reviewId);
    setReviewError("");
    try {
      const result = await deleteReview(reviewId, token);
      if (result?.success !== false) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setReviewSummary((prev) => {
          const remaining = Math.max(0, Number(prev.totalReviews || 0) - 1);
          const remainingReviews = reviews.filter((r) => r._id !== reviewId);
          const average = remainingReviews.length
            ? remainingReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / remainingReviews.length
            : 0;
          return { totalReviews: remaining, averageRating: average };
        });
      } else {
        throw new Error(result?.message || "Unable to delete review.");
      }
    } catch (error) {
      console.error("❌ Delete review error:", error);
      setReviewError(error?.message || "Unable to delete review.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  // ─── openEditProfile ───────────────────────────────────────
  const openEditProfile = () => {
    if (!user) return;
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditLocation(user.location || "");
    setEditState(user.state || "");
    setEditRole(user.role || "buyer");
    const photo = user.photoURL || user.photo || user.profileImage || user.avatar || "";
    setEditPhotoPreview(photo);
    setEditPhoto(null);
    setRemovePhoto(false);
    setEditError("");
    setShowEditModal(true);
  };

  // ─── Photo handlers ────────────────────────────────────────
  const handleEditPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setEditError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEditError("Profile photo must be 5MB or smaller.");
      return;
    }
    if (editPhotoPreview && editPhotoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(editPhotoPreview);
    }
    setEditPhoto(file);
    setEditPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
    setEditError("");
  };

  const handleRemovePhoto = () => {
    if (editPhotoPreview && editPhotoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(editPhotoPreview);
    }
    setEditPhoto(null);
    setEditPhotoPreview("");
    setRemovePhoto(true);
  };

  // ─── Update Profile ────────────────────────────────────────
  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    if (!token) {
      setEditError("Your session has expired. Please login again.");
      return;
    }
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();
    const trimmedPhone = editPhone.trim();
    const trimmedLocation = editLocation.trim();
    const trimmedState = editState.trim();
    if (!trimmedName) {
      setEditError("Please enter your name.");
      return;
    }
    if (!trimmedEmail) {
      setEditError("Please enter your email.");
      return;
    }
    setEditError("");
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("email", trimmedEmail);
      formData.append("phone", trimmedPhone);
      formData.append("location", trimmedLocation);
      formData.append("state", trimmedState);
      formData.append("role", editRole);
      if (removePhoto) {
        formData.append("removePhoto", "true");
      } else if (editPhoto) {
        formData.append("photo", editPhoto);
      }
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      let data = {};
      try { data = await response.json(); } catch { data = {}; }
      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Profile update failed (${response.status})`);
      }
      if (data?.success !== false) {
        setShowEditModal(false);
        window.location.reload();
      } else {
        setEditError(data?.message || "Profile update failed.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setEditError(error?.message || "Something went wrong.");
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Render Stars ──────────────────────────────────────────
  const renderStars = (rating, size = 14) => {
    const numericRating = Number(rating || 0);
    return (
      <span className="profile-review-stars" aria-label={`${numericRating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i key={star} className={star <= numericRating ? "fas fa-star" : "far fa-star"} style={{ fontSize: `${size}px` }} />
        ))}
      </span>
    );
  };

  // ─── Not logged in ─────────────────────────────────────────
  if (!user) {
    return (
      <div className="container profile-page">
        <div className="profile-empty">
          <i className="fas fa-user-circle" style={{ fontSize: "64px", color: "var(--gray-300)", marginBottom: "16px" }} />
          <h2>Please Login</h2>
          <p>You need to be logged in to view your profile.</p>
          <Link to="/login" className="btn-primary"><i className="fas fa-sign-in-alt" /> Login</Link>
        </div>
      </div>
    );
  }

  // ─── Profile values ────────────────────────────────────────
  const profileName = user.name || "User";
  const profileEmail = user.email || "";
  const profilePhone = user.phone || "";
  const profileLocation = user.location || "";
  const profileState = user.state || "";
  const profilePhoto = user.photoURL || user.photo || user.profileImage || user.avatar || "";
  const profileInitial = profileName.charAt(0).toUpperCase() || "U";
  const isVerified = user.isVerified === true || user.verified === true || user.verificationStatus === "verified" || user.verificationStatus === "approved";

  // ─── Tabs content ──────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {/* Quick Actions */}
            <section className="fb-quick-actions">
              <button className="fb-action-card" onClick={() => navigate("/messages")}>
                <span className="fb-action-icon messages"><i className="fas fa-comments" /></span>
                <span className="fb-action-text">
                  <strong>Messages</strong>
                  <small>{stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : "View your messages"}</small>
                </span>
                {stats.unreadMessages > 0 && <span className="fb-unread-badge">{stats.unreadMessages > 99 ? "99+" : stats.unreadMessages}</span>}
                <i className="fas fa-chevron-right fb-action-arrow" />
              </button>
              <button className="fb-action-card" onClick={() => navigate("/reviews")}>
                <span className="fb-action-icon reviews"><i className="fas fa-star" /></span>
                <span className="fb-action-text">
                  <strong>Reviews</strong>
                  <small>{reviewSummary.totalReviews > 0 ? `${reviewSummary.totalReviews} reviews • ${reviewSummary.averageRating.toFixed(1)}/5` : "View reviews"}</small>
                </span>
                {reviewSummary.totalReviews > 0 && <span className="fb-action-count">{reviewSummary.totalReviews}</span>}
                <i className="fas fa-chevron-right fb-action-arrow" />
              </button>
            </section>

            {/* Stats Grid */}
            <section className="fb-stats-grid">
              <button className="fb-stat-card" onClick={() => navigate("/my-ads")}>
                <span className="fb-stat-number primary">{stats.totalAds}</span>
                <span className="fb-stat-label">ADS</span>
              </button>
              <button className="fb-stat-card" onClick={() => navigate("/analytics")}>
                <span className="fb-stat-number purple">{stats.totalViews}</span>
                <span className="fb-stat-label">VIEWS</span>
              </button>
              <button className="fb-stat-card" onClick={() => navigate("/notifications")}>
                <span className="fb-stat-number orange">{stats.totalNotifications}</span>
                <span className="fb-stat-label">NOTIFICATIONS</span>
                {stats.unreadNotifications > 0 && <span className="fb-stat-unread">{stats.unreadNotifications} unread</span>}
              </button>
              <button className="fb-stat-card" onClick={() => navigate("/messages")}>
                <span className="fb-stat-number blue">{messagesList.length}</span>
                <span className="fb-stat-label">MESSAGES</span>
                {stats.unreadMessages > 0 && <span className="fb-stat-unread">{stats.unreadMessages} unread</span>}
              </button>
            </section>
          </>
        );

      case "reviews":
        return (
          <section className="fb-reviews-section">
            <div className="fb-section-header">
              <h2>Reviews</h2>
              <p>Reviews from customers on your products.</p>
            </div>
            {reviewSummary.totalReviews > 0 && (
              <div className="fb-review-summary">
                <div className="fb-review-average">
                  <strong>{reviewSummary.averageRating.toFixed(1)}</strong>
                  {renderStars(reviewSummary.averageRating, 17)}
                  <span>{reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? "review" : "reviews"}</span>
                </div>
              </div>
            )}
            {reviewError && (
              <div className="fb-review-error">
                <i className="fas fa-exclamation-circle" /> {reviewError}
              </div>
            )}
            {reviewsLoading ? (
              <div className="fb-loading">
                <LoadingDots size={20} color="#0066cc" />
                <span style={{ marginLeft: "10px", color: "#6b7280", fontSize: "14px" }}>Loading reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="fb-no-reviews">
                <div className="fb-no-reviews-icon"><i className="far fa-star" /></div>
                <h3>No reviews yet</h3>
                <p>Customer reviews for your products will appear here.</p>
              </div>
            ) : (
              <div className="fb-reviews-list">
                {reviews.slice(0, 10).map((review) => {
                  const reviewer = review.reviewer || {};
                  const reviewerName = review.reviewerName || reviewer.name || "Customer";
                  const product = review.productId || {};
                  const productTitle = review.productTitle || product.title || "Product";
                  const reviewerAvatar = review.reviewerAvatar || reviewer.avatar || reviewer.profileImage || reviewer.photo || reviewer.photoURL || "";
                  const reviewId = review._id || review.id;
                  const canDelete = String(review.reviewer?._id || review.reviewer?.id || review.reviewer || review.reviewerId || "") === String(user._id || user.id || user.userId);
                  return (
                    <article key={reviewId} className="fb-review-card">
                      <div className="fb-review-top">
                        <div className="fb-review-user">
                          <div className="fb-review-avatar">
                            {reviewerAvatar ? <img src={getImageUrl(reviewerAvatar)} alt={reviewerName} onError={(e) => e.currentTarget.style.display = "none"} /> : reviewerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{reviewerName}</strong>
                            <div className="fb-review-stars-row">
                              {renderStars(review.rating, 13)}
                              <span>{Number(review.rating || 0).toFixed(0)}/5</span>
                            </div>
                          </div>
                        </div>
                        {canDelete && (
                          <button className="fb-review-delete" disabled={deletingReviewId === reviewId} onClick={() => handleDeleteReview(reviewId)} title="Delete review">
                            {deletingReviewId === reviewId ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-trash" />}
                            <span>{deletingReviewId === reviewId ? "Deleting..." : "Delete"}</span>
                          </button>
                        )}
                      </div>
                      <div className="fb-review-product"><i className="fas fa-tag" /> <span>{productTitle}</span></div>
                      <p className="fb-review-comment">{review.comment || "No review text."}</p>
                      {review.createdAt && (
                        <div className="fb-review-date"><i className="far fa-clock" /> {new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );

      case "ads":
        return (
          <section className="fb-ads-section">
            <div className="fb-section-header">
              <h2>My Ads</h2>
              <p>Products you have listed for sale.</p>
            </div>
            {products.length === 0 ? (
              <div className="fb-no-ads">
                <div className="fb-no-ads-icon"><i className="fas fa-box-open" /></div>
                <h3>No ads yet</h3>
                <p>Start selling by posting your first ad.</p>
                <Link to="/post-ad" className="fb-post-ad-btn"><i className="fas fa-plus-circle" /> Post Ad</Link>
              </div>
            ) : (
              <div className="fb-ads-list">
                {products.map((product) => (
                  <div key={product._id} className="fb-ad-card">
                    <div className="fb-ad-image">
                      {product.images && product.images.length > 0 ? (
                        <img src={getImageUrl(product.images[0])} alt={product.title} />
                      ) : (
                        <div className="fb-ad-placeholder"><i className="fas fa-image" /></div>
                      )}
                    </div>
                    <div className="fb-ad-info">
                      <h4>{product.title}</h4>
                      <p className="fb-ad-price">£{product.price?.toFixed(2) || "0.00"}</p>
                      <p className="fb-ad-meta">{product.category || "Uncategorized"} • {product.location || "N/A"}</p>
                      <div className="fb-ad-actions">
                        <button className="fb-ad-delete" onClick={() => handleDeleteProduct(product._id)} disabled={deletingProductId === product._id}>
                          {deletingProductId === product._id ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-trash" />} Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  // ─── Main Render ────────────────────────────────────────────
  return (
    <div className="fb-profile-page">

      {/* Cover Photo */}
      <div className="fb-cover">
        <div className="fb-cover-image">
          <div className="fb-cover-gradient"></div>
        </div>
      </div>

      {/* Profile Info (overlapping cover) */}
      <div className="fb-profile-info">
        <div className="fb-avatar">
          {profilePhoto ? (
            <img src={getImageUrl(profilePhoto)} alt={profileName} />
          ) : (
            <span>{profileInitial}</span>
          )}
        </div>
        <div className="fb-name-area">
          <div className="fb-name-row">
            <h1>{profileName}</h1>
            {isVerified && (
              <span className="fb-verified-badge" title="Verified Account">
                <i className="fas fa-check-circle" />
              </span>
            )}
          </div>
          <div className="fb-details">
            {profileEmail && <span className="fb-detail-item"><i className="fas fa-envelope" /> {profileEmail}</span>}
            {profilePhone && <span className="fb-detail-item"><i className="fas fa-phone" /> {profilePhone}</span>}
            {(profileLocation || profileState) && (
              <span className="fb-detail-item"><i className="fas fa-map-marker-alt" /> {[profileLocation, profileState].filter(Boolean).join(", ")}</span>
            )}
            <span className="fb-detail-item"><i className="fas fa-calendar-alt" /> Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
          </div>
        </div>
        <div className="fb-actions">
          <Link to="/post-ad" className="fb-action-btn primary"><i className="fas fa-plus-circle" /> Post Ad</Link>
          <button className="fb-action-btn secondary" onClick={openEditProfile}><i className="fas fa-pen" /> Edit Profile</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="fb-tabs">
        <button className={activeTab === "overview" ? "fb-tab active" : "fb-tab"} onClick={() => setActiveTab("overview")}>
          <i className="fas fa-home" /> Overview
        </button>
        <button className={activeTab === "reviews" ? "fb-tab active" : "fb-tab"} onClick={() => setActiveTab("reviews")}>
          <i className="fas fa-star" /> Reviews
        </button>
        <button className={activeTab === "ads" ? "fb-tab active" : "fb-tab"} onClick={() => setActiveTab("ads")}>
          <i className="fas fa-box" /> My Ads
        </button>
      </div>

      {/* Tab Content */}
      <div className="fb-tab-content">
        {renderTabContent()}
      </div>

      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <div className="edit-profile-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="edit-profile-close" onClick={() => setShowEditModal(false)} aria-label="Close">&times;</button>
            <div className="edit-profile-heading">
              <div className="edit-profile-heading-icon"><i className="fas fa-user-edit" /></div>
              <div><h2>Edit Profile</h2><p>Update your account information.</p></div>
            </div>
            {editError && (
              <div className="edit-profile-error"><i className="fas fa-exclamation-circle" /> {editError}</div>
            )}
            <form onSubmit={handleUpdateProfile}>
              <div className="edit-form-group">
                <label>Profile Photo</label>
                <div className="edit-photo-section">
                  <div className="edit-photo-preview">
                    {editPhotoPreview ? <img src={editPhotoPreview} alt="Preview" /> : editName?.charAt(0)?.toUpperCase() || <i className="fas fa-user" />}
                  </div>
                  <div className="edit-photo-controls">
                    <label className="choose-photo-btn"><i className="fas fa-camera" /> Choose Photo <input type="file" accept="image/*" onChange={handleEditPhotoChange} /></label>
                    <button type="button" className="remove-photo-btn" onClick={handleRemovePhoto}><i className="fas fa-trash" /> Remove</button>
                  </div>
                </div>
                {removePhoto && <small className="edit-photo-warning">Photo will be removed when you save.</small>}
              </div>
              <div className="edit-form-group">
                <label>Full Name</label>
                <div className="edit-input-wrapper"><i className="fas fa-user" /><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required /></div>
              </div>
              <div className="edit-form-group">
                <label>Email</label>
                <div className="edit-input-wrapper"><i className="fas fa-envelope" /><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required /></div>
              </div>
              <div className="edit-form-group">
                <label>Phone</label>
                <div className="edit-input-wrapper"><i className="fas fa-phone" /><input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
              </div>
              <div className="edit-form-group">
                <label>Location</label>
                <div className="edit-input-wrapper"><i className="fas fa-map-marker-alt" /><input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="City" /></div>
              </div>
              <div className="edit-form-group">
                <label>State / Region</label>
                <div className="edit-input-wrapper"><i className="fas fa-flag" /><input type="text" value={editState} onChange={(e) => setEditState(e.target.value)} placeholder="State" /></div>
              </div>
              <div className="edit-form-group">
                <label>Account Type</label>
                <div className="edit-input-wrapper"><i className="fas fa-id-card" /><select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="buyer">Buyer</option><option value="seller">Seller</option><option value="rider">Rider</option>
                </select></div>
                <small className="edit-role-help">Your role determines what features you can access.</small>
              </div>
              <div className="edit-profile-buttons">
                <button type="button" className="edit-cancel-btn" onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancel</button>
                <button type="submit" className="edit-save-btn" disabled={editLoading}>
                  {editLoading ? <><LoadingDots size={16} color="#ffffff" /><span style={{ marginLeft: "6px" }}>Saving...</span></> : <><i className="fas fa-check" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Styles ── */}
      <style>{`
        /* ─── Page wrapper ──────────────────────────────────── */
        .fb-profile-page {
          max-width: 960px;
          margin: 0 auto;
          padding: 20px 16px 40px;
          background: #f0f2f5;
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ─── Cover photo ────────────────────────────────────── */
        .fb-cover {
          position: relative;
          height: 240px;
          border-radius: 12px 12px 0 0;
          overflow: hidden;
          background: #d1d5db;
        }
        .fb-cover-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #3b82f6, #9333ea);
          position: relative;
        }
        .fb-cover-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 70%);
        }

        /* ─── Profile info (overlap) ────────────────────────── */
        .fb-profile-info {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 16px 24px;
          padding: 0 20px 16px;
          background: #ffffff;
          margin: -60px 0 0;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: relative;
          z-index: 2;
        }

        .fb-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid #ffffff;
          background: #e5e7eb;
          overflow: hidden;
          flex-shrink: 0;
          margin-top: -30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 700;
          color: #374151;
        }
        .fb-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* ✅ Ensures image fills the circle without distortion */
          object-position: center;
        }

        .fb-name-area {
          flex: 1;
          min-width: 180px;
        }

        .fb-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .fb-name-row h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        /* ─── Verified Badge ────────────────────────────────── */
        .fb-verified-badge {
          display: inline-flex;
          align-items: center;
          color: #1d9bf0; /* Facebook blue */
          font-size: 22px;
          margin-left: 2px;
        }
        .fb-verified-badge i {
          background: #ffffff;
          border-radius: 50%;
          padding: 2px;
          box-shadow: 0 0 0 1px #ffffff;
        }

        .fb-details {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 20px;
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }
        .fb-detail-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .fb-detail-item i {
          width: 16px;
          color: #8b9bb5;
        }

        .fb-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-left: auto;
          align-items: center;
        }
        .fb-action-btn {
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: 0.2s;
          text-decoration: none;
        }
        .fb-action-btn.primary {
          background: #1877f2;
          color: #fff;
        }
        .fb-action-btn.primary:hover {
          background: #0d65d9;
        }
        .fb-action-btn.secondary {
          background: #e4e6eb;
          color: #1f2937;
        }
        .fb-action-btn.secondary:hover {
          background: #d1d5db;
        }
        .fb-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ─── Tabs ───────────────────────────────────────────── */
        .fb-tabs {
          display: flex;
          gap: 4px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 16px;
          margin: 12px 0 16px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow-x: auto;
        }
        .fb-tab {
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: 0.15s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .fb-tab:hover {
          color: #1f2937;
        }
        .fb-tab.active {
          color: #1877f2;
          border-bottom-color: #1877f2;
        }

        /* ─── Tab content ────────────────────────────────────── */
        .fb-tab-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ─── Quick actions ──────────────────────────────────── */
        .fb-quick-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fb-action-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: 0.15s;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
        }
        .fb-action-card:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        .fb-action-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .fb-action-icon.messages {
          background: #e0f2fe;
          color: #0284c7;
        }
        .fb-action-icon.reviews {
          background: #fef3c7;
          color: #d97706;
        }
        .fb-action-text {
          flex: 1;
        }
        .fb-action-text strong {
          display: block;
          font-size: 14px;
          color: #1f2937;
        }
        .fb-action-text small {
          font-size: 12px;
          color: #6b7280;
        }
        .fb-unread-badge, .fb-action-count {
          background: #e5e7eb;
          color: #1f2937;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }
        .fb-unread-badge {
          background: #ef4444;
          color: #fff;
        }
        .fb-action-arrow {
          color: #9ca3af;
          font-size: 14px;
        }

        /* ─── Stats grid ─────────────────────────────────────── */
        .fb-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .fb-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px 10px;
          text-align: center;
          cursor: pointer;
          transition: 0.15s;
        }
        .fb-stat-card:hover {
          background: #f9fafb;
          transform: translateY(-2px);
        }
        .fb-stat-number {
          display: block;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .fb-stat-number.primary { color: #3b82f6; }
        .fb-stat-number.purple { color: #8b5cf6; }
        .fb-stat-number.orange { color: #f59e0b; }
        .fb-stat-number.blue { color: #0ea5e9; }
        .fb-stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .fb-stat-unread {
          display: inline-block;
          margin-top: 4px;
          padding: 2px 8px;
          border-radius: 999px;
          background: #fee2e2;
          color: #dc2626;
          font-size: 10px;
          font-weight: 600;
        }

        /* ─── Reviews section ────────────────────────────────── */
        .fb-reviews-section {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .fb-section-header {
          padding: 16px 18px;
          border-bottom: 1px solid #e5e7eb;
        }
        .fb-section-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }
        .fb-section-header p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .fb-review-summary {
          padding: 16px 18px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .fb-review-average {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .fb-review-average strong {
          font-size: 30px;
          font-weight: 700;
          color: #1f2937;
        }
        .fb-review-average > span:last-child {
          font-size: 13px;
          color: #6b7280;
        }

        .fb-review-stars {
          display: inline-flex;
          gap: 2px;
          color: #f59e0b;
        }

        .fb-review-error {
          margin: 12px 18px;
          padding: 10px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #b91c1c;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .fb-loading {
          padding: 30px 18px;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          color: #6b7280;
        }

        .fb-no-reviews {
          padding: 40px 18px;
          text-align: center;
        }
        .fb-no-reviews-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: #fef3c7;
          color: #d97706;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .fb-no-reviews h3 {
          margin: 0 0 6px;
          font-size: 18px;
          color: #1f2937;
        }
        .fb-no-reviews p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .fb-reviews-list {
          display: flex;
          flex-direction: column;
        }
        .fb-review-card {
          padding: 16px 18px;
          border-bottom: 1px solid #f3f4f6;
        }
        .fb-review-card:last-child {
          border-bottom: none;
        }
        .fb-review-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .fb-review-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fb-review-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #374151;
          overflow: hidden;
          flex-shrink: 0;
        }
        .fb-review-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .fb-review-user strong {
          display: block;
          font-size: 14px;
          color: #1f2937;
        }
        .fb-review-stars-row {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
        .fb-review-stars-row > span:last-child {
          font-size: 12px;
          color: #6b7280;
        }
        .fb-review-delete {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .fb-review-delete:hover {
          background: #fee2e2;
        }
        .fb-review-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .fb-review-product {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }
        .fb-review-product i {
          color: #3b82f6;
        }
        .fb-review-comment {
          margin: 8px 0 0;
          font-size: 14px;
          color: #1f2937;
          line-height: 1.6;
        }
        .fb-review-date {
          margin-top: 8px;
          font-size: 12px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ─── Ads section ────────────────────────────────────── */
        .fb-ads-section {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .fb-no-ads {
          padding: 40px 18px;
          text-align: center;
        }
        .fb-no-ads-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .fb-no-ads h3 {
          margin: 0 0 6px;
          font-size: 18px;
          color: #1f2937;
        }
        .fb-no-ads p {
          margin: 0 0 16px;
          color: #6b7280;
          font-size: 14px;
        }
        .fb-post-ad-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1877f2;
          color: #fff;
          padding: 8px 20px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
        }
        .fb-post-ad-btn:hover {
          background: #0d65d9;
        }

        .fb-ads-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px;
        }
        .fb-ad-card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          transition: 0.15s;
        }
        .fb-ad-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .fb-ad-image {
          height: 150px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fb-ad-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .fb-ad-placeholder {
          font-size: 40px;
          color: #9ca3af;
        }
        .fb-ad-info {
          padding: 12px;
        }
        .fb-ad-info h4 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .fb-ad-price {
          font-weight: 700;
          color: #059669;
          margin: 0 0 4px;
        }
        .fb-ad-meta {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 8px;
        }
        .fb-ad-actions {
          display: flex;
          gap: 6px;
        }
        .fb-ad-delete {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .fb-ad-delete:hover {
          background: #fee2e2;
        }
        .fb-ad-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ─── Mobile responsiveness ──────────────────────────── */
        @media (max-width: 760px) {
          .fb-profile-page {
            padding: 10px 8px 30px;
          }
          .fb-cover {
            height: 140px;
            border-radius: 8px 8px 0 0;
          }
          .fb-profile-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-top: -40px;
            padding: 0 12px 12px;
            border-radius: 0 0 8px 8px;
          }
          .fb-avatar {
            width: 80px;
            height: 80px;
            margin-top: -20px;
            font-size: 32px;
          }
          .fb-name-row h1 {
            font-size: 22px;
          }
          .fb-verified-badge {
            font-size: 18px;
          }
          .fb-details {
            justify-content: center;
            font-size: 13px;
            gap: 6px 12px;
          }
          .fb-actions {
            margin-left: 0;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
          .fb-action-btn {
            font-size: 12px;
            padding: 6px 14px;
          }
          .fb-tabs {
            padding: 0 8px;
            margin: 8px 0 12px;
            overflow-x: auto;
            border-radius: 8px;
          }
          .fb-tab {
            font-size: 13px;
            padding: 10px 12px;
          }
          .fb-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .fb-stat-number {
            font-size: 22px;
          }
          .fb-ads-list {
            grid-template-columns: 1fr 1fr;
            padding: 12px;
          }
          .fb-ad-image {
            height: 120px;
          }
          .fb-review-avatar {
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 480px) {
          .fb-cover {
            height: 100px;
          }
          .fb-avatar {
            width: 64px;
            height: 64px;
            margin-top: -16px;
            font-size: 24px;
          }
          .fb-name-row h1 {
            font-size: 18px;
          }
          .fb-verified-badge {
            font-size: 16px;
          }
          .fb-details {
            font-size: 12px;
            flex-direction: column;
            gap: 4px;
          }
          .fb-actions {
            flex-direction: column;
            width: 100%;
          }
          .fb-action-btn {
            width: 100%;
            justify-content: center;
          }
          .fb-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          .fb-stat-card {
            padding: 12px 6px;
          }
          .fb-stat-number {
            font-size: 20px;
          }
          .fb-ads-list {
            grid-template-columns: 1fr;
          }
          .fb-tab {
            font-size: 12px;
            padding: 8px 10px;
          }
          .fb-tab i {
            display: none;
          }
          .fb-review-delete span {
            display: none;
          }
        }

        /* ─── Modal styles (unchanged) ───────────────────────── */
        .edit-profile-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(15, 23, 42, 0.62);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          overflow-y: auto;
          backdrop-filter: blur(3px);
        }
        .edit-profile-modal {
          position: relative;
          width: 100%;
          max-width: 520px;
          max-height: calc(100vh - 36px);
          overflow-y: auto;
          background: #ffffff;
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 25px 70px rgba(0,0,0,0.22);
          box-sizing: border-box;
        }
        .edit-profile-close {
          position: absolute;
          top: 10px;
          right: 12px;
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: var(--gray-100);
          color: var(--gray-600);
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }
        .edit-profile-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          padding-right: 35px;
          margin-bottom: 18px;
        }
        .edit-profile-heading-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #dcfce7;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
        }
        .edit-profile-heading h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }
        .edit-profile-heading p {
          margin: 3px 0 0;
          color: var(--gray-500);
          font-size: 11px;
        }
        .edit-profile-error {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          padding: 9px 11px;
          border-radius: 9px;
          font-size: 11px;
          margin-bottom: 14px;
        }
        .edit-form-group {
          margin-bottom: 14px;
        }
        .edit-form-group > label {
          display: block;
          margin-bottom: 5px;
          color: var(--gray-700);
          font-size: 11px;
          font-weight: 700;
        }
        .edit-input-wrapper {
          position: relative;
        }
        .edit-input-wrapper > i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          font-size: 12px;
          pointer-events: none;
        }
        .edit-input-wrapper input,
        .edit-input-wrapper select {
          width: 100%;
          height: 42px;
          border: 1px solid var(--gray-300);
          border-radius: 9px;
          background: #ffffff;
          padding: 0 12px 0 34px;
          outline: none;
          font-size: 12px;
          color: var(--gray-800);
          box-sizing: border-box;
        }
        .edit-input-wrapper input:focus,
        .edit-input-wrapper select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
        }
        .edit-role-help {
          display: block;
          margin-top: 5px;
          color: var(--gray-500);
          font-size: 9px;
          line-height: 1.4;
        }
        .edit-photo-section {
          display: flex;
          align-items: center;
          gap: 13px;
        }
        .edit-photo-preview {
          width: 66px;
          height: 66px;
          min-width: 66px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--gray-100);
          color: var(--gray-400);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
        }
        .edit-photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .edit-photo-controls {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }
        .choose-photo-btn,
        .remove-photo-btn {
          min-height: 34px;
          border-radius: 8px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          box-sizing: border-box;
        }
        .choose-photo-btn {
          background: var(--gray-100);
          color: var(--gray-700);
        }
        .choose-photo-btn input {
          display: none;
        }
        .remove-photo-btn {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #dc2626;
        }
        .edit-photo-warning {
          display: block;
          margin-top: 6px;
          color: #dc2626;
          font-size: 9px;
        }
        .edit-profile-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 7px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--gray-200);
        }
        .edit-cancel-btn,
        .edit-save-btn {
          min-height: 40px;
          border-radius: 9px;
          padding: 0 15px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .edit-cancel-btn {
          border: 1px solid var(--gray-300);
          background: #ffffff;
          color: var(--gray-700);
        }
        .edit-save-btn {
          border: none;
          background: var(--primary);
          color: #ffffff;
        }
        .edit-cancel-btn:disabled,
        .edit-save-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        @media (max-width: 700px) {
          .edit-profile-overlay {
            padding: 10px;
            align-items: flex-start;
          }
          .edit-profile-modal {
            max-height: calc(100vh - 20px);
            margin-top: 5px;
            padding: 18px 15px;
            border-radius: 15px;
          }
          .edit-photo-section {
            align-items: flex-start;
          }
          .edit-profile-buttons {
            position: sticky;
            bottom: 0;
            background: #ffffff;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;