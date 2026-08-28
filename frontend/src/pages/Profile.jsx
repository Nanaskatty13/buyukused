// ============================================================
// frontend/src/pages/Profile.jsx
// ============================================================

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

// ============================================================
// PROFILE
// ============================================================

const Profile = () => {
  const {
    user,
    token,
  } = useAuth();

  const navigate = useNavigate();

  // ==========================================================
  // DATA
  // ==========================================================

  const [products, setProducts] =
    useState([]);

  const [notifications, setNotifications] =
    useState([]);

  const [messagesList, setMessagesList] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [reviewSummary, setReviewSummary] =
    useState({
      averageRating: 0,
      totalReviews: 0,
    });

  const [loading, setLoading] =
    useState(false);

  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  const [
    deletingProductId,
    setDeletingProductId,
  ] = useState(null);

  const [
    deletingReviewId,
    setDeletingReviewId,
  ] = useState(null);

  const [reviewError, setReviewError] =
    useState("");

  // ==========================================================
  // STATS
  // ==========================================================

  const [stats, setStats] = useState({
    totalAds: 0,
    totalViews: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
  });

  // ==========================================================
  // EDIT PROFILE
  // ==========================================================

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);

  const [editName, setEditName] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [editPhone, setEditPhone] =
    useState("");

  const [editRole, setEditRole] =
    useState("buyer");

  const [editPhoto, setEditPhoto] =
    useState(null);

  const [
    editPhotoPreview,
    setEditPhotoPreview,
  ] = useState("");

  const [
    editLoading,
    setEditLoading,
  ] = useState(false);

  const [editError, setEditError] =
    useState("");

  const [removePhoto, setRemovePhoto] =
    useState(false);

  // ==========================================================
  // KEEP EDIT FORM IN SYNC
  // ==========================================================

  useEffect(() => {
    if (!user) return;

    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");

    setEditRole(
      user.role || "buyer"
    );

    const photo =
      user.photoURL ||
      user.photo ||
      user.profileImage ||
      user.avatar ||
      "";

    setEditPhotoPreview(photo);
    setEditPhoto(null);
    setRemovePhoto(false);
    setEditError("");
  }, [user]);

  // ==========================================================
  // OPEN EDIT PROFILE
  // ==========================================================

  const openEditProfile = () => {
    if (!user) return;

    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");

    setEditRole(
      user.role || "buyer"
    );

    const photo =
      user.photoURL ||
      user.photo ||
      user.profileImage ||
      user.avatar ||
      "";

    setEditPhotoPreview(photo);
    setEditPhoto(null);
    setRemovePhoto(false);
    setEditError("");

    setShowEditModal(true);
  };

  // ==========================================================
  // LOAD REVIEWS
  // ==========================================================

  const loadReviews = useCallback(
    async () => {
      if (!user || !token) return;

      const userId =
        user._id ||
        user.id ||
        user.userId;

      if (!userId) return;

      setReviewsLoading(true);
      setReviewError("");

      try {
        const response =
          await getSellerReviews(
            userId,
            {
              page: 1,
              limit: 100,
            },
            token
          );

        const reviewList =
          Array.isArray(response)
            ? response
            : response?.reviews ||
              response?.data ||
              [];

        setReviews(reviewList);

        const summary =
          response?.summary ||
          {};

        const average =
          Number(
            summary.averageRating ??
              response?.averageRating ??
              0
          );

        const total =
          Number(
            summary.totalReviews ??
              response?.totalReviews ??
              reviewList.length
          );

        setReviewSummary({
          averageRating:
            Number.isFinite(average)
              ? average
              : 0,

          totalReviews:
            Number.isFinite(total)
              ? total
              : reviewList.length,
        });
      } catch (error) {
        console.error(
          "❌ Failed to load reviews:",
          error
        );

        setReviewError(
          error?.message ||
            "Unable to load reviews."
        );
      } finally {
        setReviewsLoading(false);
      }
    },
    [user, token]
  );

  // ==========================================================
  // LOAD PROFILE DATA
  // ==========================================================

  const loadUserData = useCallback(
    async () => {
      if (!user || !token) {
        return;
      }

      const userId =
        user._id ||
        user.id ||
        user.userId;

      if (!userId) {
        console.warn(
          "No user ID found:",
          user
        );

        return;
      }

      try {
        setLoading(true);

        // ------------------------------------------------------
        // LOAD PROFILE DATA
        // ------------------------------------------------------

        const results =
          await Promise.allSettled([
            getProducts({
              sellerId: userId,
              limit: 100,
            }),

            getUserNotifications(
              userId,
              token
            ),

            messages.getForUser(
              userId,
              token
            ),
          ]);

        // ======================================================
        // PRODUCTS
        // ======================================================

        let userProducts = [];

        if (
          results[0]?.status ===
          "fulfilled"
        ) {
          const response =
            results[0].value;

          userProducts =
            Array.isArray(response)
              ? response
              : response?.products ||
                response?.data ||
                [];
        } else {
          console.error(
            "Products failed:",
            results[0]?.reason
          );

          try {
            const response =
              await fetch(
                `${API_URL}/api/users/me/products`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );

            if (response.ok) {
              const data =
                await response.json();

              userProducts =
                data?.products || [];
            }
          } catch (
            fallbackError
          ) {
            console.error(
              "Fallback products failed:",
              fallbackError
            );
          }
        }

        // ======================================================
        // NOTIFICATIONS
        // ======================================================

        let userNotifications = [];

        if (
          results[1]?.status ===
          "fulfilled"
        ) {
          const response =
            results[1].value;

          userNotifications =
            Array.isArray(response)
              ? response
              : response?.notifications ||
                response?.data ||
                [];
        } else {
          console.error(
            "Notifications failed:",
            results[1]?.reason
          );
        }

        // ======================================================
        // MESSAGES
        // ======================================================

        let userMessages = [];

        if (
          results[2]?.status ===
          "fulfilled"
        ) {
          const response =
            results[2].value;

          userMessages =
            Array.isArray(response)
              ? response
              : response?.messages ||
                response?.data ||
                [];
        } else {
          console.error(
            "Messages failed:",
            results[2]?.reason
          );
        }

        // ======================================================
        // SAVE
        // ======================================================

        setProducts(
          userProducts
        );

        setNotifications(
          userNotifications
        );

        setMessagesList(
          userMessages
        );

        // ======================================================
        // UNREAD MESSAGES
        // ======================================================

        const unreadMessages =
          userMessages.filter(
            (message) => {
              const receiverId =
                typeof message.receiver ===
                "string"
                  ? message.receiver
                  : message.receiver?._id ||
                    message.receiver?.id;

              return (
                String(receiverId) ===
                  String(userId) &&
                !message.read
              );
            }
          ).length;

        // ======================================================
        // UNREAD NOTIFICATIONS
        // ======================================================

        const unreadNotifications =
          userNotifications.filter(
            (notification) =>
              !notification.read
          ).length;

        // ======================================================
        // TOTAL VIEWS
        // ======================================================

        const totalViews =
          userProducts.reduce(
            (total, product) =>
              total +
              Number(
                product.views || 0
              ),
            0
          );

        // ======================================================
        // STATS
        // ======================================================

        setStats({
          totalAds:
            userProducts.length,

          totalViews,

          totalNotifications:
            userNotifications.length,

          unreadNotifications,

          unreadMessages,
        });
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    [user, token]
  );

  // ==========================================================
  // LOAD EVERYTHING
  // ==========================================================

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    loadUserData();
    loadReviews();
  }, [
    user,
    token,
    loadUserData,
    loadReviews,
  ]);

  // ==========================================================
  // DELETE PRODUCT
  // ==========================================================

  const handleDeleteProduct =
    async (productId) => {
      if (
        !window.confirm(
          "Delete this ad permanently?"
        )
      ) {
        return;
      }

      if (!token) {
        alert(
          "Your session has expired. Please login again."
        );

        return;
      }

      setDeletingProductId(
        productId
      );

      try {
        const result =
          await deleteProduct(
            productId,
            token
          );

        if (
          result?.success ||
          result?.message
            ?.toLowerCase()
            ?.includes("deleted")
        ) {
          setProducts(
            (previous) =>
              previous.filter(
                (product) =>
                  product._id !==
                  productId
              )
          );

          setStats(
            (previous) => ({
              ...previous,

              totalAds:
                Math.max(
                  0,
                  previous.totalAds -
                    1
                ),
            })
          );
        } else {
          alert(
            result?.message ||
              "Delete failed."
          );
        }
      } catch (error) {
        console.error(
          "Delete product error:",
          error
        );

        alert(
          error?.message ||
            "Something went wrong."
        );
      } finally {
        setDeletingProductId(
          null
        );
      }
    };

  // ==========================================================
  // DELETE REVIEW
  // ==========================================================

  const handleDeleteReview =
    async (reviewId) => {
      if (!reviewId) return;

      if (
        !window.confirm(
          "Delete this review permanently?"
        )
      ) {
        return;
      }

      if (!token) {
        alert(
          "Your session has expired. Please login again."
        );

        return;
      }

      setDeletingReviewId(
        reviewId
      );

      setReviewError("");

      try {
        const result =
          await deleteReview(
            reviewId,
            token
          );

        if (
          result?.success !== false
        ) {
          setReviews(
            (previous) =>
              previous.filter(
                (review) =>
                  review._id !==
                  reviewId
              )
          );

          setReviewSummary(
            (previous) => {
              const remaining =
                Math.max(
                  0,
                  Number(
                    previous.totalReviews ||
                      0
                  ) - 1
                );

              const remainingReviews =
                reviews.filter(
                  (review) =>
                    review._id !==
                    reviewId
                );

              const average =
                remainingReviews.length
                  ? remainingReviews.reduce(
                      (sum, review) =>
                        sum +
                        Number(
                          review.rating ||
                            0
                        ),
                      0
                    ) /
                    remainingReviews.length
                  : 0;

              return {
                totalReviews:
                  remaining,

                averageRating:
                  average,
              };
            }
          );
        } else {
          throw new Error(
            result?.message ||
              "Unable to delete review."
          );
        }
      } catch (error) {
        console.error(
          "❌ Delete review error:",
          error
        );

        setReviewError(
          error?.message ||
            "Unable to delete review."
        );
      } finally {
        setDeletingReviewId(
          null
        );
      }
    };

  // ==========================================================
  // PHOTO CHANGE
  // ==========================================================

  const handleEditPhotoChange =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setEditError(
          "Please select an image file."
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setEditError(
          "Profile photo must be 5MB or smaller."
        );

        return;
      }

      if (
        editPhotoPreview &&
        editPhotoPreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          editPhotoPreview
        );
      }

      setEditPhoto(file);

      setEditPhotoPreview(
        URL.createObjectURL(file)
      );

      setRemovePhoto(false);
      setEditError("");
    };

  // ==========================================================
  // REMOVE PHOTO
  // ==========================================================

  const handleRemovePhoto =
    () => {
      if (
        editPhotoPreview &&
        editPhotoPreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          editPhotoPreview
        );
      }

      setEditPhoto(null);
      setEditPhotoPreview("");
      setRemovePhoto(true);
    };

  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  const handleUpdateProfile =
    async (event) => {
      event.preventDefault();

      if (!token) {
        setEditError(
          "Your session has expired. Please login again."
        );

        return;
      }

      const trimmedName =
        editName.trim();

      const trimmedEmail =
        editEmail
          .trim()
          .toLowerCase();

      const trimmedPhone =
        editPhone.trim();

      if (!trimmedName) {
        setEditError(
          "Please enter your name."
        );

        return;
      }

      if (!trimmedEmail) {
        setEditError(
          "Please enter your email."
        );

        return;
      }

      setEditError("");
      setEditLoading(true);

      try {
        const formData =
          new FormData();

        formData.append(
          "name",
          trimmedName
        );

        formData.append(
          "email",
          trimmedEmail
        );

        formData.append(
          "phone",
          trimmedPhone
        );

        formData.append(
          "role",
          editRole
        );

        if (removePhoto) {
          formData.append(
            "removePhoto",
            "true"
          );
        } else if (editPhoto) {
          formData.append(
            "photo",
            editPhoto
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/users/profile`,
            {
              method: "PUT",

              credentials: "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body: formData,
            }
          );

        let data = {};

        try {
          data =
            await response.json();
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

        if (
          data?.success !== false
        ) {
          setShowEditModal(
            false
          );

          window.location.reload();
        } else {
          setEditError(
            data?.message ||
              "Profile update failed."
          );
        }
      } catch (error) {
        console.error(
          "Profile update error:",
          error
        );

        setEditError(
          error?.message ||
            "Something went wrong."
        );
      } finally {
        setEditLoading(false);
      }
    };

  // ==========================================================
  // STAR DISPLAY
  // ==========================================================

  const renderStars = (
    rating,
    size = 14
  ) => {
    const numericRating =
      Number(rating || 0);

    return (
      <span
        className="profile-review-stars"
        aria-label={`${numericRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <i
              key={star}
              className={
                star <= numericRating
                  ? "fas fa-star"
                  : "far fa-star"
              }
              style={{
                fontSize: `${size}px`,
              }}
            />
          )
        )}
      </span>
    );
  };

  // ==========================================================
  // NOT LOGGED IN
  // ==========================================================

  if (!user) {
    return (
      <div className="container profile-page">
        <div className="profile-empty">
          <i
            className="fas fa-user-circle"
            style={{
              fontSize: "64px",
              color:
                "var(--gray-300)",
              marginBottom:
                "16px",
            }}
          />

          <h2>
            Please Login
          </h2>

          <p>
            You need to be logged in
            to view your profile.
          </p>

          <Link
            to="/login"
            className="btn-primary"
          >
            <i className="fas fa-sign-in-alt" />
            Login
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PROFILE VALUES
  // ==========================================================

  const profileName =
    user.name || "User";

  const profileEmail =
    user.email || "";

  const profilePhoto =
    user.photoURL ||
    user.photo ||
    user.profileImage ||
    user.avatar ||
    "";

  const profileInitial =
    profileName
      .charAt(0)
      .toUpperCase() || "U";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="container profile-page">

      {/* ======================================================
          PROFILE HEADER
      ====================================================== */}

      <section className="profile-header-card">

        <div className="profile-header-main">

          {/* PHOTO */}

          <div className="profile-avatar-large">
            {profilePhoto ? (
              <img
                src={getImageUrl(
                  profilePhoto
                )}
                alt={profileName}
                loading="eager"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              profileInitial
            )}
          </div>

          {/* INFORMATION */}

          <div className="profile-user-info">

            <div className="profile-name-row">

              <h1>
                {profileName}
              </h1>

              {/* ROLE BADGE REMOVED */}

            </div>

            {profileEmail && (
              <p className="profile-email">
                {profileEmail}
              </p>
            )}

            <p className="profile-member-date">
              <i className="fas fa-calendar-alt" />
              {" "}
              Member since{" "}
              {user.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString()
                : "N/A"}
            </p>

          </div>

          {/* HEADER ACTIONS */}

          <div className="profile-header-actions">

            <Link
              to="/post-ad"
              className="profile-post-btn"
            >
              <i className="fas fa-plus-circle" />
              Post Ad
            </Link>

            <button
              type="button"
              className="profile-edit-btn"
              onClick={
                openEditProfile
              }
            >
              <i className="fas fa-pen" />
              Edit Profile
            </button>

          </div>

        </div>

      </section>

      {/* ======================================================
          QUICK ACTIONS

          Messages
          Reviews

          My Ads removed from this bottom action area.
      ====================================================== */}

      <section className="profile-quick-actions">

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        <button
          type="button"
          className="profile-action-card"
          onClick={() =>
            navigate(
              "/messages"
            )
          }
        >

          <span className="profile-action-icon messages">
            <i className="fas fa-comments" />
          </span>

          <span className="profile-action-text">

            <strong>
              Messages
            </strong>

            <small>
              {stats.unreadMessages >
              0
                ? `${stats.unreadMessages} unread message${
                    stats.unreadMessages ===
                    1
                      ? ""
                      : "s"
                  }`
                : "View your messages"}
            </small>

          </span>

          {stats.unreadMessages >
            0 && (
            <span className="profile-unread-badge">
              {stats.unreadMessages >
              99
                ? "99+"
                : stats.unreadMessages}
            </span>
          )}

          <i className="fas fa-chevron-right profile-action-arrow" />

        </button>

        {/* ====================================================
            REVIEWS

            REPLACES MY ADS
        ==================================================== */}

        <button
          type="button"
          className="profile-action-card"
          onClick={() =>
            navigate(
              "/reviews"
            )
          }
        >

          <span className="profile-action-icon reviews">
            <i className="fas fa-star" />
          </span>

          <span className="profile-action-text">

            <strong>
              Reviews
            </strong>

            <small>
              {reviewSummary.totalReviews >
              0
                ? `${reviewSummary.totalReviews} review${
                    reviewSummary.totalReviews ===
                    1
                      ? ""
                      : "s"
                  } • ${reviewSummary.averageRating.toFixed(
                    1
                  )}/5`
                : "View reviews on your profile"}
            </small>

          </span>

          {reviewSummary.totalReviews >
            0 && (
            <span className="profile-action-count">
              {reviewSummary.totalReviews}
            </span>
          )}

          <i className="fas fa-chevron-right profile-action-arrow" />

        </button>

      </section>

      {/* ======================================================
          STATS
      ====================================================== */}

      <section className="profile-stats-grid">

        <button
          type="button"
          className="profile-stat-card"
          onClick={() =>
            navigate(
              "/my-ads"
            )
          }
        >
          <span className="profile-stat-number primary">
            {stats.totalAds}
          </span>

          <span className="profile-stat-label">
            TOTAL ADS
          </span>
        </button>

        <button
          type="button"
          className="profile-stat-card"
          onClick={() =>
            navigate(
              "/analytics"
            )
          }
        >
          <span className="profile-stat-number purple">
            {stats.totalViews}
          </span>

          <span className="profile-stat-label">
            TOTAL VIEWS
          </span>
        </button>

        <button
          type="button"
          className="profile-stat-card"
          onClick={() =>
            navigate(
              "/notifications"
            )
          }
        >
          <span className="profile-stat-number orange">
            {stats.totalNotifications}
          </span>

          <span className="profile-stat-label">
            NOTIFICATIONS
          </span>

          {stats.unreadNotifications >
            0 && (
            <span className="profile-stat-unread">
              {stats.unreadNotifications} unread
            </span>
          )}
        </button>

        <button
          type="button"
          className="profile-stat-card"
          onClick={() =>
            navigate(
              "/messages"
            )
          }
        >
          <span className="profile-stat-number blue">
            {messagesList.length}
          </span>

          <span className="profile-stat-label">
            MESSAGES
          </span>

          {stats.unreadMessages >
            0 && (
            <span className="profile-stat-unread">
              {stats.unreadMessages} unread
            </span>
          )}
        </button>

      </section>

      {/* ======================================================
          REVIEWS SECTION

          REPLACES THE OLD MY ADS SECTION AT THE BOTTOM
      ====================================================== */}

      <section className="profile-content-card profile-reviews-section">

        <div className="profile-section-heading">

          <div>

            <h2>
              Reviews
            </h2>

            <p>
              Reviews from customers on your products.
            </p>

          </div>

          <button
            type="button"
            className="view-all-btn"
            onClick={() =>
              navigate(
                "/reviews"
              )
            }
          >
            View All
            <i className="fas fa-arrow-right" />
          </button>

        </div>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        {reviewSummary.totalReviews >
          0 && (
          <div className="profile-review-summary">

            <div className="profile-review-average">

              <strong>
                {reviewSummary.averageRating.toFixed(
                  1
                )}
              </strong>

              {renderStars(
                reviewSummary.averageRating,
                17
              )}

              <span>
                {reviewSummary.totalReviews}{" "}
                {reviewSummary.totalReviews ===
                1
                  ? "review"
                  : "reviews"}
              </span>

            </div>

          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {reviewError && (
          <div className="profile-review-error">
            <i className="fas fa-exclamation-circle" />
            {reviewError}
          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {reviewsLoading ? (
          <div className="profile-loading">
            <span className="profile-spinner" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (

          <div className="profile-no-reviews">

            <div className="profile-no-reviews-icon">
              <i className="far fa-star" />
            </div>

            <h3>
              No reviews yet
            </h3>

            <p>
              Customer reviews for your products will appear here.
            </p>

          </div>

        ) : (

          <div className="profile-reviews-list">

            {reviews
              .slice(0, 5)
              .map((review) => {

                const reviewer =
                  review.reviewer ||
                  {};

                const reviewerName =
                  review.reviewerName ||
                  reviewer.name ||
                  "Customer";

                const product =
                  review.productId ||
                  {};

                const productTitle =
                  review.productTitle ||
                  product.title ||
                  "Product";

                const reviewerAvatar =
                  review.reviewerAvatar ||
                  reviewer.avatar ||
                  reviewer.profileImage ||
                  reviewer.photo ||
                  reviewer.photoURL ||
                  "";

                const reviewId =
                  review._id ||
                  review.id;

                const canDelete =
                  String(
                    review.reviewer?._id ||
                      review.reviewer?.id ||
                      review.reviewer ||
                      review.reviewerId ||
                      ""
                  ) ===
                  String(
                    user._id ||
                      user.id ||
                      user.userId
                  );

                return (
                  <article
                    key={reviewId}
                    className="profile-review-card"
                  >

                    {/* REVIEWER */}

                    <div className="profile-review-top">

                      <div className="profile-review-user">

                        <div className="profile-review-avatar">

                          {reviewerAvatar ? (
                            <img
                              src={getImageUrl(
                                reviewerAvatar
                              )}
                              alt={
                                reviewerName
                              }
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            reviewerName
                              .charAt(
                                0
                              )
                              .toUpperCase()
                          )}

                        </div>

                        <div>

                          <strong>
                            {reviewerName}
                          </strong>

                          <div className="profile-review-stars-row">

                            {renderStars(
                              review.rating,
                              13
                            )}

                            <span>
                              {Number(
                                review.rating ||
                                  0
                              ).toFixed(0)}/5
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* DELETE */}

                      {canDelete && (
                        <button
                          type="button"
                          className="profile-review-delete"
                          disabled={
                            deletingReviewId ===
                            reviewId
                          }
                          onClick={() =>
                            handleDeleteReview(
                              reviewId
                            )
                          }
                          title="Delete review"
                        >
                          {deletingReviewId ===
                          reviewId ? (
                            <i className="fas fa-spinner fa-spin" />
                          ) : (
                            <i className="fas fa-trash" />
                          )}

                          <span>
                            {deletingReviewId ===
                            reviewId
                              ? "Deleting..."
                              : "Delete"}
                          </span>
                        </button>
                      )}

                    </div>

                    {/* PRODUCT */}

                    <div className="profile-review-product">

                      <i className="fas fa-tag" />

                      <span>
                        {productTitle}
                      </span>

                    </div>

                    {/* TEXT */}

                    <p className="profile-review-comment">
                      {review.comment ||
                        "No review text."}
                    </p>

                    {/* DATE */}

                    {review.createdAt && (
                      <div className="profile-review-date">

                        <i className="far fa-clock" />

                        {new Date(
                          review.createdAt
                        ).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}

                      </div>
                    )}

                  </article>
                );
              })}

          </div>

        )}

      </section>

      {/* ======================================================
          EDIT PROFILE MODAL
      ====================================================== */}

      {showEditModal && (
        <div
          className="edit-profile-overlay"
          onClick={() =>
            setShowEditModal(
              false
            )
          }
        >

          <div
            className="edit-profile-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="edit-profile-close"
              onClick={() =>
                setShowEditModal(
                  false
                )
              }
              aria-label="Close"
            >
              &times;
            </button>

            {/* TITLE */}

            <div className="edit-profile-heading">

              <div className="edit-profile-heading-icon">
                <i className="fas fa-user-edit" />
              </div>

              <div>

                <h2>
                  Edit Profile
                </h2>

                <p>
                  Update your account information.
                </p>

              </div>

            </div>

            {/* ERROR */}

            {editError && (
              <div className="edit-profile-error">

                <i className="fas fa-exclamation-circle" />

                {editError}

              </div>
            )}

            <form
              onSubmit={
                handleUpdateProfile
              }
            >

              {/* PHOTO */}

              <div className="edit-form-group">

                <label>
                  Profile Photo
                </label>

                <div className="edit-photo-section">

                  <div className="edit-photo-preview">

                    {editPhotoPreview ? (
                      <img
                        src={
                          editPhotoPreview
                        }
                        alt="Preview"
                      />
                    ) : (
                      editName
                        ?.charAt(0)
                        ?.toUpperCase() ||
                      <i className="fas fa-user" />
                    )}

                  </div>

                  <div className="edit-photo-controls">

                    <label className="choose-photo-btn">

                      <i className="fas fa-camera" />

                      Choose Photo

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleEditPhotoChange
                        }
                      />

                    </label>

                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={
                        handleRemovePhoto
                      }
                    >
                      <i className="fas fa-trash" />
                      Remove
                    </button>

                  </div>

                </div>

                {removePhoto && (
                  <small className="edit-photo-warning">
                    Photo will be removed when you save.
                  </small>
                )}

              </div>

              {/* NAME */}

              <div className="edit-form-group">

                <label>
                  Full Name
                </label>

                <div className="edit-input-wrapper">

                  <i className="fas fa-user" />

                  <input
                    type="text"
                    value={editName}
                    onChange={(event) =>
                      setEditName(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="edit-form-group">

                <label>
                  Email
                </label>

                <div className="edit-input-wrapper">

                  <i className="fas fa-envelope" />

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

              </div>

              {/* PHONE */}

              <div className="edit-form-group">

                <label>
                  Phone
                </label>

                <div className="edit-input-wrapper">

                  <i className="fas fa-phone" />

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

              </div>

              {/* ACCOUNT TYPE */}

              <div className="edit-form-group">

                <label>
                  Account Type
                </label>

                <div className="edit-input-wrapper">

                  <i className="fas fa-id-card" />

                  <select
                    value={editRole}
                    onChange={(event) =>
                      setEditRole(
                        event.target.value
                      )
                    }
                  >
                    <option value="buyer">
                      Buyer
                    </option>

                    <option value="seller">
                      Seller
                    </option>

                    <option value="rider">
                      Rider
                    </option>
                  </select>

                </div>

                <small className="edit-role-help">
                  Your role determines what features you can access.
                </small>

              </div>

              {/* BUTTONS */}

              <div className="edit-profile-buttons">

                <button
                  type="button"
                  className="edit-cancel-btn"
                  onClick={() =>
                    setShowEditModal(
                      false
                    )
                  }
                  disabled={
                    editLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-save-btn"
                  disabled={
                    editLoading
                  }
                >

                  {editLoading ? (
                    <>
                      <span className="button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check" />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          PROFILE CSS
      ====================================================== */}

      <style>
        {`

          /* =====================================================
             PAGE
          ===================================================== */

          .profile-page {
            width: 100%;
            box-sizing: border-box;
            padding: 22px 16px 45px;
          }


          /* =====================================================
             HEADER
          ===================================================== */

          .profile-header-card {
            background: #ffffff;
            border: 1px solid var(--gray-200);
            border-radius: 16px;
            margin-bottom: 16px;
            overflow: hidden;
          }

          .profile-header-main {
            display: flex;
            align-items: center;
            gap: 18px;
            padding: 20px;
          }

          .profile-avatar-large {
            width: 76px;
            height: 76px;
            min-width: 76px;
            border-radius: 50%;
            overflow: hidden;
            background: var(--primary);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: 800;
          }

          .profile-avatar-large img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .profile-user-info {
            flex: 1;
            min-width: 0;
          }

          .profile-name-row {
            display: flex;
            align-items: center;
          }

          .profile-name-row h1 {
            margin: 0;
            color: var(--gray-900);
            font-size: 23px;
            line-height: 1.2;
            font-weight: 800;
          }

          .profile-email,
          .profile-member-date {
            margin: 5px 0 0;
            color: var(--gray-500);
            font-size: 12px;
          }

          .profile-member-date i {
            margin-right: 4px;
          }

          .profile-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .profile-post-btn,
          .profile-edit-btn {
            min-height: 38px;
            border-radius: 999px;
            padding: 0 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            box-sizing: border-box;
          }

          .profile-post-btn {
            background: var(--secondary);
            color: #ffffff;
            border: none;
          }

          .profile-post-btn:hover {
            opacity: 0.92;
          }

          .profile-edit-btn {
            background: #ffffff;
            color: var(--gray-700);
            border: 1px solid var(--gray-300);
          }

          .profile-edit-btn:hover {
            background: var(--gray-50);
          }


          /* =====================================================
             QUICK ACTIONS
          ===================================================== */

          .profile-quick-actions {
            display: flex;
            flex-direction: column;
            gap: 9px;
            margin-bottom: 16px;
          }

          .profile-action-card {
            width: 100%;
            min-height: 66px;
            background: #ffffff;
            border: 1px solid var(--gray-200);
            border-radius: 14px;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: left;
            cursor: pointer;
            color: inherit;
            transition:
              background 0.18s ease,
              border-color 0.18s ease,
              box-shadow 0.18s ease,
              transform 0.12s ease;
            box-sizing: border-box;
          }

          .profile-action-card:hover {
            background: var(--gray-50);
            border-color: var(--gray-300);
            box-shadow:
              0 4px 16px rgba(0,0,0,0.05);
          }

          .profile-action-card:active {
            transform: scale(0.995);
          }

          .profile-action-icon {
            width: 43px;
            height: 43px;
            min-width: 43px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }

          .profile-action-icon.messages {
            background: #e0f2fe;
            color: #0284c7;
          }

          .profile-action-icon.reviews {
            background: #fef3c7;
            color: #d97706;
          }

          .profile-action-text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .profile-action-text strong {
            color: var(--gray-900);
            font-size: 14px;
            font-weight: 750;
          }

          .profile-action-text small {
            color: var(--gray-500);
            font-size: 11px;
            line-height: 1.35;
          }

          .profile-unread-badge,
          .profile-action-count {
            min-width: 28px;
            height: 28px;
            padding: 0 8px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 11px;
            font-weight: 800;
          }

          .profile-unread-badge {
            background: #ef4444;
            color: #ffffff;
          }

          .profile-action-count {
            background: var(--gray-100);
            color: var(--gray-700);
          }

          .profile-action-arrow {
            color: var(--gray-400);
            font-size: 11px;
            flex-shrink: 0;
          }


          /* =====================================================
             STATS
          ===================================================== */

          .profile-stats-grid {
            display: grid;
            grid-template-columns:
              repeat(4, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 16px;
          }

          .profile-stat-card {
            background: #ffffff;
            border: 1px solid var(--gray-200);
            border-radius: 14px;
            padding: 15px 10px;
            text-align: center;
            cursor: pointer;
            transition: 0.18s ease;
          }

          .profile-stat-card:hover {
            background: var(--gray-50);
            transform: translateY(-1px);
          }

          .profile-stat-number {
            display: block;
            font-size: 25px;
            font-weight: 850;
            line-height: 1;
            margin-bottom: 7px;
          }

          .profile-stat-number.primary {
            color: var(--primary);
          }

          .profile-stat-number.purple {
            color: #8b5cf6;
          }

          .profile-stat-number.orange {
            color: #f59e0b;
          }

          .profile-stat-number.blue {
            color: #0ea5e9;
          }

          .profile-stat-label {
            display: block;
            font-size: 9px;
            color: var(--gray-500);
            font-weight: 700;
            letter-spacing: 0.04em;
          }

          .profile-stat-unread {
            display: inline-block;
            margin-top: 6px;
            padding: 2px 7px;
            border-radius: 999px;
            background: #fee2e2;
            color: #dc2626;
            font-size: 8px;
            font-weight: 700;
          }


          /* =====================================================
             CONTENT CARD
          ===================================================== */

          .profile-content-card {
            background: #ffffff;
            border: 1px solid var(--gray-200);
            border-radius: 16px;
            overflow: hidden;
          }

          .profile-section-heading {
            padding: 17px 18px;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .profile-section-heading h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 800;
            color: var(--gray-900);
          }

          .profile-section-heading p {
            margin: 4px 0 0;
            color: var(--gray-500);
            font-size: 11px;
          }

          .view-all-btn {
            border: none;
            background: transparent;
            color: var(--primary);
            font-size: 11px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            white-space: nowrap;
          }


          /* =====================================================
             REVIEWS SUMMARY
          ===================================================== */

          .profile-review-summary {
            padding: 15px 18px;
            background: var(--gray-50);
            border-bottom: 1px solid var(--gray-200);
          }

          .profile-review-average {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .profile-review-average strong {
            font-size: 28px;
            line-height: 1;
            color: var(--gray-900);
          }

          .profile-review-average > span:last-child {
            color: var(--gray-500);
            font-size: 11px;
          }

          .profile-review-stars {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            color: #f59e0b;
          }


          /* =====================================================
             REVIEW LIST
          ===================================================== */

          .profile-reviews-list {
            display: flex;
            flex-direction: column;
          }

          .profile-review-card {
            padding: 17px 18px;
            border-bottom: 1px solid var(--gray-100);
          }

          .profile-review-card:last-child {
            border-bottom: none;
          }

          .profile-review-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .profile-review-user {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .profile-review-avatar {
            width: 40px;
            height: 40px;
            min-width: 40px;
            border-radius: 50%;
            overflow: hidden;
            background: var(--gray-100);
            color: var(--gray-600);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 800;
          }

          .profile-review-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .profile-review-user strong {
            display: block;
            color: var(--gray-900);
            font-size: 13px;
            font-weight: 750;
          }

          .profile-review-stars-row {
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .profile-review-stars-row > span:last-child {
            color: var(--gray-500);
            font-size: 10px;
          }

          .profile-review-product {
            margin-top: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--gray-500);
            font-size: 10px;
          }

          .profile-review-product i {
            color: var(--primary);
          }

          .profile-review-comment {
            margin: 10px 0 0;
            color: var(--gray-700);
            font-size: 13px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .profile-review-date {
            margin-top: 10px;
            color: var(--gray-400);
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .profile-review-delete {
            flex-shrink: 0;
            border: 1px solid #fecaca;
            background: #fef2f2;
            color: #dc2626;
            min-height: 32px;
            border-radius: 8px;
            padding: 0 9px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
          }

          .profile-review-delete:hover {
            background: #fee2e2;
          }

          .profile-review-delete:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .profile-review-error {
            margin: 12px 18px;
            padding: 10px 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 9px;
            color: #b91c1c;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 7px;
          }


          /* =====================================================
             NO REVIEWS
          ===================================================== */

          .profile-no-reviews {
            padding: 45px 18px;
            text-align: center;
          }

          .profile-no-reviews-icon {
            width: 58px;
            height: 58px;
            margin: 0 auto 12px;
            border-radius: 50%;
            background: #fef3c7;
            color: #d97706;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 23px;
          }

          .profile-no-reviews h3 {
            margin: 0;
            color: var(--gray-800);
            font-size: 15px;
          }

          .profile-no-reviews p {
            margin: 5px auto 0;
            max-width: 350px;
            color: var(--gray-500);
            font-size: 11px;
            line-height: 1.5;
          }


          /* =====================================================
             LOADING
          ===================================================== */

          .profile-loading {
            padding: 35px 18px;
            text-align: center;
            color: var(--gray-500);
            font-size: 12px;
          }

          .profile-spinner {
            display: inline-block;
            width: 13px;
            height: 13px;
            border: 2px solid var(--gray-300);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation:
              profileSpin
              0.75s
              linear
              infinite;
            vertical-align: -2px;
            margin-right: 7px;
          }


          /* =====================================================
             EDIT PROFILE MODAL
          ===================================================== */

          .edit-profile-overlay {
            position: fixed;
            inset: 0;
            z-index: 99999;
            background:
              rgba(15, 23, 42, 0.62);
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
            max-height:
              calc(100vh - 36px);
            overflow-y: auto;
            background: #ffffff;
            border-radius: 18px;
            padding: 22px;
            box-shadow:
              0 25px 70px
              rgba(0,0,0,0.22);
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
            transform:
              translateY(-50%);
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
            padding:
              0 12px 0 34px;
            outline: none;
            font-size: 12px;
            color: var(--gray-800);
            box-sizing: border-box;
          }

          .edit-input-wrapper input:focus,
          .edit-input-wrapper select:focus {
            border-color: var(--primary);
            box-shadow:
              0 0 0 3px
              rgba(0,0,0,0.04);
          }

          .edit-role-help {
            display: block;
            margin-top: 5px;
            color: var(--gray-500);
            font-size: 9px;
            line-height: 1.4;
          }


          /* =====================================================
             PHOTO
          ===================================================== */

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


          /* =====================================================
             EDIT BUTTONS
          ===================================================== */

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

          .button-spinner {
            width: 11px;
            height: 11px;
            border-radius: 50%;
            border: 2px solid
              rgba(255,255,255,0.4);
            border-top-color:
              #ffffff;
            animation:
              profileSpin
              0.7s
              linear
              infinite;
          }


          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 700px) {

            .profile-page {
              padding:
                14px 10px 35px;
            }

            .profile-header-main {
              display: grid;
              grid-template-columns:
                auto 1fr;
              gap: 12px;
              padding: 15px;
            }

            .profile-avatar-large {
              width: 62px;
              height: 62px;
              min-width: 62px;
              font-size: 25px;
            }

            .profile-user-info {
              min-width: 0;
            }

            .profile-name-row h1 {
              font-size: 19px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .profile-email,
            .profile-member-date {
              font-size: 10px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .profile-header-actions {
              grid-column: 1 / -1;
              width: 100%;
              display: grid;
              grid-template-columns:
                1fr 1fr;
            }

            .profile-post-btn,
            .profile-edit-btn {
              width: 100%;
              min-height: 40px;
              font-size: 10px;
            }

            .profile-action-card {
              min-height: 62px;
              padding:
                9px 11px;
              gap: 9px;
            }

            .profile-action-icon {
              width: 40px;
              height: 40px;
              min-width: 40px;
              border-radius: 10px;
              font-size: 16px;
            }

            .profile-action-text strong {
              font-size: 12px;
            }

            .profile-action-text small {
              font-size: 9px;
            }

            .profile-unread-badge,
            .profile-action-count {
              min-width: 25px;
              height: 25px;
              font-size: 9px;
              padding: 0 6px;
            }

            .profile-stats-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
              gap: 8px;
            }

            .profile-stat-card {
              padding:
                14px 8px;
            }

            .profile-stat-number {
              font-size: 22px;
            }

            .profile-stat-label {
              font-size: 8px;
            }

            .profile-section-heading {
              padding:
                14px 13px;
            }

            .profile-section-heading h2 {
              font-size: 16px;
            }

            .profile-section-heading p {
              font-size: 9px;
            }

            .profile-review-card {
              padding:
                14px 13px;
            }

            .profile-review-top {
              gap: 8px;
            }

            .profile-review-delete {
              min-height: 29px;
              padding:
                0 7px;
              font-size: 9px;
            }

            .profile-review-delete span {
              display: none;
            }

            .profile-review-avatar {
              width: 36px;
              height: 36px;
              min-width: 36px;
              font-size: 12px;
            }

            .profile-review-user strong {
              font-size: 11px;
            }

            .profile-review-comment {
              font-size: 12px;
            }

            .profile-review-summary {
              padding:
                13px;
            }

            .profile-review-average strong {
              font-size: 24px;
            }

            .edit-profile-overlay {
              padding:
                10px;
              align-items:
                flex-start;
            }

            .edit-profile-modal {
              max-height:
                calc(100vh - 20px);
              margin-top: 5px;
              padding: 18px 15px;
              border-radius: 15px;
            }

            .edit-photo-section {
              align-items:
                flex-start;
            }

            .edit-profile-buttons {
              position:
                sticky;
              bottom: 0;
              background:
                #ffffff;
            }

          }


          /* =====================================================
             VERY SMALL PHONES
          ===================================================== */

          @media (max-width: 380px) {

            .profile-page {
              padding:
                12px 8px 30px;
            }

            .profile-header-main {
              padding:
                12px;
            }

            .profile-avatar-large {
              width: 56px;
              height: 56px;
              min-width: 56px;
            }

            .profile-name-row h1 {
              font-size: 17px;
            }

            .profile-header-actions {
              gap: 6px;
            }

            .profile-post-btn,
            .profile-edit-btn {
              font-size: 9px;
            }

            .profile-action-text small {
              display: none;
            }

            .profile-review-comment {
              font-size: 11px;
            }

          }


          /* =====================================================
             SPINNER
          ===================================================== */

          @keyframes profileSpin {
            from {
              transform:
                rotate(0deg);
            }

            to {
              transform:
                rotate(360deg);
            }
          }

        `}
      </style>

    </div>
  );
};

export default Profile;