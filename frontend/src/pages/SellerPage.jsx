// ============================================================
// frontend/src/pages/SellerPage.jsx
// ============================================================

import React, { useState, useEffect } from "react";

import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import {
  getImageUrl,
  getSellerReviews,
  createReview,
  toggleReviewHelpful,
} from "../services/api";

import {
  getPublicSellerProfile,
  getPublicSellerProducts,
} from "../services/sellerService";

import ProductCard from "../components/ProductCard";

// ============================================================
// TIME AGO
// ============================================================

const timeAgo = (dateString) => {
  if (!dateString) {
    return "N/A";
  }

  const past = new Date(dateString);

  if (Number.isNaN(past.getTime())) {
    return "N/A";
  }

  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - past.getTime());

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  }

  if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  }

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  if (diffHr > 0) {
    return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  }

  if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  }

  return "Just now";
};

// ============================================================
// IMAGE URL HELPER
// ============================================================

const getSellerImageUrl = (image) => {
  if (!image) {
    return null;
  }

  const value = String(image).trim();

  if (!value) {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  ) {
    return value;
  }

  return getImageUrl(value);
};

// ============================================================
// STAR COMPONENT
// ============================================================

const Stars = ({ rating = 0, size = "16px" }) => {
  const numericRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  );

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
      }}
      aria-label={`${numericRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={
            star <= numericRating
              ? "fas fa-star"
              : "far fa-star"
          }
          style={{
            color: "#f59e0b",
            fontSize: size,
          }}
        />
      ))}
    </span>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const SellerPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    toggleFavorite,
    isFavorite,
  } = useCart();

  // ==========================================================
  // SELLER
  // ==========================================================

  const [seller, setSeller] = useState(null);

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);
  const [imageError, setImageError] = useState(false);

  // ==========================================================
  // REVIEWS
  // ==========================================================

  const [reviews, setReviews] = useState([]);

  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    breakdown: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // ==========================================================
  // REVIEW FORM
  // ==========================================================

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  // ==========================================================
  // FETCH SELLER
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchSellerData = async () => {
      if (!sellerId) {
        setError("No seller ID provided.");
        setLoading(false);
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setImageError(false);

        // ==================================================
        // PROFILE
        // ==================================================

        const profileData =
          await getPublicSellerProfile(sellerId);

        console.log("👤 Seller profile:", profileData);

        if (
          !profileData?.success ||
          !profileData?.seller
        ) {
          throw new Error(
            profileData?.message ||
              "Failed to load seller profile."
          );
        }

        const sellerData = profileData.seller;

        const normalizedSeller = {
          _id: sellerData._id || sellerId,

          name:
            sellerData.name ||
            "Seller",

          shopName:
            sellerData.shopName ||
            sellerData.name ||
            "Seller",

          phone:
            sellerData.phone ||
            "",

          email:
            sellerData.email ||
            "",

          location:
            sellerData.location ||
            "",

          avatar:
            sellerData.avatar ||
            sellerData.profileImage ||
            sellerData.photo ||
            sellerData.photoURL ||
            null,

          profileImage:
            sellerData.profileImage ||
            "",

          photo:
            sellerData.photo ||
            "",

          photoURL:
            sellerData.photoURL ||
            "",

          createdAt:
            sellerData.createdAt ||
            "",

          sellerSince:
            sellerData.sellerSince ||
            "",

          memberSince:
            sellerData.memberSince ||
            sellerData.sellerSince ||
            sellerData.createdAt ||
            "",

          lastActive:
            sellerData.lastActive ||
            sellerData.lastSeen ||
            "",

          lastSeen:
            sellerData.lastSeen ||
            sellerData.lastActive ||
            "",

          role:
            sellerData.role ||
            "seller",

          rating:
            Number(sellerData.rating || 0),

          reviewCount:
            Number(sellerData.reviewCount || 0),

          productsCount:
            Number(sellerData.productsCount || 0),
        };

        if (!cancelled) {
          setSeller(normalizedSeller);
        }

        // ==================================================
        // PRODUCTS
        // ==================================================

        const productsData =
          await getPublicSellerProducts(
            sellerId,
            {
              page: 1,
              limit: 20,
              sort: "-createdAt",
            }
          );

        console.log(
          "📦 Seller products:",
          productsData
        );

        if (cancelled) {
          return;
        }

        if (productsData?.success) {
          setProducts(
            Array.isArray(productsData.products)
              ? productsData.products
              : []
          );

          setPagination(
            productsData.pagination || null
          );
        } else {
          setProducts([]);
          setPagination(null);
        }
      } catch (err) {
        console.error(
          "❌ Error fetching seller data:",
          err
        );

        if (cancelled) {
          return;
        }

        if (
          err?.response?.status === 401 ||
          err?.status === 401
        ) {
          navigate("/login", {
            state: {
              from: `/seller/${sellerId}`,
            },
          });

          return;
        }

        setError(
          err?.message ||
            "An error occurred while loading seller profile."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSellerData();

    return () => {
      cancelled = true;
    };
  }, [sellerId, user, navigate]);

  // ==========================================================
  // FETCH REVIEWS
  // ==========================================================

  const fetchReviews = async (
    page = 1,
    append = false
  ) => {
    if (!sellerId) {
      return;
    }

    try {
      setReviewsLoading(true);
      setReviewError("");

      const response =
        await getSellerReviews(
          sellerId,
          {
            page,
            limit: 10,
          }
        );

      console.log(
        "⭐ Seller reviews:",
        response
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to load reviews."
        );
      }

      const incomingReviews =
        Array.isArray(response.reviews)
          ? response.reviews
          : [];

      setReviews((previous) =>
        append
          ? [
              ...previous,
              ...incomingReviews,
            ]
          : incomingReviews
      );

      if (response.summary) {
        setReviewSummary({
          averageRating:
            Number(
              response.summary.averageRating || 0
            ),

          totalReviews:
            Number(
              response.summary.totalReviews || 0
            ),

          breakdown: {
            5: Number(
              response.summary.breakdown?.[5] || 0
            ),
            4: Number(
              response.summary.breakdown?.[4] || 0
            ),
            3: Number(
              response.summary.breakdown?.[3] || 0
            ),
            2: Number(
              response.summary.breakdown?.[2] || 0
            ),
            1: Number(
              response.summary.breakdown?.[1] || 0
            ),
          },
        });
      }

      if (response.pagination) {
        setReviewsPagination(
          response.pagination
        );
      }
    } catch (err) {
      console.error(
        "❌ Error loading reviews:",
        err
      );

      setReviewError(
        err?.message ||
          "Unable to load seller reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  // ==========================================================
  // INITIAL REVIEWS
  // ==========================================================

  useEffect(() => {
    if (user && sellerId) {
      fetchReviews(1, false);
    } else {
      setReviews([]);
      setReviewsPagination(null);
    }
  }, [sellerId, user]);

  // ==========================================================
  // SUBMIT REVIEW
  // ==========================================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    setReviewError("");
    setReviewSuccess("");

    // ------------------------------------------------------
    // Rating
    // ------------------------------------------------------

    if (
      selectedRating < 1 ||
      selectedRating > 5
    ) {
      setReviewError(
        "Please select a rating from 1 to 5 stars."
      );

      return;
    }

    // ------------------------------------------------------
    // Comment
    // ------------------------------------------------------

    const cleanComment =
      reviewComment.trim();

    if (cleanComment.length < 3) {
      setReviewError(
        "Please write at least 3 characters."
      );

      return;
    }

    if (cleanComment.length > 2000) {
      setReviewError(
        "Your review cannot exceed 2000 characters."
      );

      return;
    }

    // ------------------------------------------------------
    // Cannot review yourself
    // ------------------------------------------------------

    const currentUserId =
      user?._id ||
      user?.id;

    if (
      currentUserId &&
      String(currentUserId) ===
        String(sellerId)
    ) {
      setReviewError(
        "You cannot review yourself."
      );

      return;
    }

    try {
      setSubmittingReview(true);

      const response =
        await createReview({
          sellerId,
          rating: selectedRating,
          comment: cleanComment,
        });

      console.log(
        "⭐ Review created:",
        response
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to post review."
        );
      }

      setSelectedRating(0);
      setReviewComment("");

      setReviewSuccess(
        "Your review has been posted successfully."
      );

      await fetchReviews(1, false);

      if (response?.review) {
        console.log(
          "New review rating:",
          response.review.rating
        );
      }
    } catch (err) {
      console.error(
        "❌ Create review error:",
        err
      );

      setReviewError(
        err?.message ||
          "Unable to post your review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // ==========================================================
  // HELPFUL
  // ==========================================================

  const handleHelpful = async (reviewId) => {
    if (!reviewId) {
      return;
    }

    if (!user) {
      navigate("/login", {
        state: {
          from: `/seller/${sellerId}`,
        },
      });

      return;
    }

    try {
      const response =
        await toggleReviewHelpful(
          reviewId
        );

      if (response?.success) {
        setReviews((previous) =>
          previous.map((review) => {
            if (
              String(review._id) !==
              String(reviewId)
            ) {
              return review;
            }

            return {
              ...review,

              helpfulCount:
                Number(
                  response.helpfulCount ??
                    review.helpfulCount ??
                    0
                ),

              hasHelpful:
                Boolean(
                  response.hasHelpful
                ),
            };
          })
        );
      }
    } catch (err) {
      console.error(
        "❌ Helpful action failed:",
        err
      );
    }
  };

  // ==========================================================
  // REQUIRE LOGIN
  // ==========================================================

  if (!user) {
    return (
      <div
        className="container"
        style={{
          minHeight: "60vh",
          padding: "80px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            background: "white",
            borderRadius:
              "var(--radius-xl)",
            padding: "40px 30px",
            textAlign: "center",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <i
            className="fas fa-user-lock"
            style={{
              fontSize: "56px",
              color: "var(--primary)",
              marginBottom: "20px",
            }}
          />

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            Sign in to view this seller
          </h1>

          <p
            style={{
              color: "var(--gray-500)",
              lineHeight: 1.6,
              marginBottom: "25px",
            }}
          >
            Please sign in or create a
            BuyUKUsed account before viewing
            seller profiles and their products.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/login"
              state={{
                from: `/seller/${sellerId}`,
              }}
              style={{
                textDecoration: "none",
              }}
            >
              <button
                type="button"
                style={{
                  padding: "12px 26px",
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            </Link>

            <Link
              to="/register"
              state={{
                from: `/seller/${sellerId}`,
              }}
              style={{
                textDecoration: "none",
              }}
            >
              <button
                type="button"
                style={{
                  padding: "12px 26px",
                  background: "var(--gray-100)",
                  color: "var(--gray-800)",
                  border:
                    "1px solid var(--gray-300)",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <i
          className="fas fa-spinner fa-spin"
          style={{
            marginRight: "8px",
          }}
        />

        Loading seller profile...
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: "#e74c3c",
        }}
      >
        {error}
      </div>
    );
  }

  if (!seller) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        Seller not found.
      </div>
    );
  }

  // ==========================================================
  // SELLER DATA
  // ==========================================================

  const sellerName =
    seller.shopName ||
    seller.name ||
    "Unknown Seller";

  const memberDate =
    seller.memberSince
      ? new Date(seller.memberSince)
      : null;

  const memberSince =
    memberDate &&
    !Number.isNaN(memberDate.getTime())
      ? memberDate.toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : "N/A";

  const memberDuration =
    seller.memberSince
      ? timeAgo(seller.memberSince)
      : "N/A";

  const lastSeenDate =
    seller.lastActive ||
    seller.lastSeen ||
    null;

  const lastSeen =
    lastSeenDate
      ? timeAgo(lastSeenDate)
      : null;

  const productCount =
    Number(seller.productsCount || 0) ||
    products.length ||
    0;

  const sellerImage =
    getSellerImageUrl(seller.avatar);

  const averageRating = Math.max(
    0,
    Math.min(
      5,
      Number(
        reviewSummary.averageRating ||
          seller.rating ||
          0
      )
    )
  );

  const totalReviews = Number(
    reviewSummary.totalReviews ||
      seller.reviewCount ||
      0
  );

  const breakdown =
    reviewSummary.breakdown || {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

  // ==========================================================
  // WHATSAPP
  // ==========================================================

  const handleWhatsApp = () => {
    const rawPhone = seller.phone || "";

    let phone = String(rawPhone).replace(
      /\D/g,
      ""
    );

    if (
      phone.startsWith("0") &&
      phone.length === 10
    ) {
      phone =
        "233" +
        phone.substring(1);
    }

    if (
      !phone ||
      phone.length < 10
    ) {
      alert(
        "This seller has not provided a valid phone number."
      );

      return;
    }

    const message =
      "Hi, I'm interested in your products listed on BuyUKUsed.com. Are you available?";

    const encoded =
      encodeURIComponent(message);

    const whatsappUrl =
      `https://wa.me/${phone}?text=${encoded}`;

    window.location.href = whatsappUrl;
  };

  // ==========================================================
  // LOAD MORE REVIEWS
  // ==========================================================

  const handleLoadMoreReviews =
    async () => {
      if (
        reviewsLoading ||
        !reviewsPagination
      ) {
        return;
      }

      const currentPage =
        Number(
          reviewsPagination.page || 1
        );

      const totalPages =
        Number(
          reviewsPagination.totalPages || 1
        );

      if (
        currentPage >= totalPages
      ) {
        return;
      }

      await fetchReviews(
        currentPage + 1,
        true
      );
    };

  // ==========================================================
  // LOAD MORE PRODUCTS
  // ==========================================================

  const handleLoadMoreProducts =
    async () => {
      if (
        loading ||
        !pagination
      ) {
        return;
      }

      const currentPage =
        Number(
          pagination.page || 1
        );

      const totalPages =
        Number(
          pagination.totalPages || 1
        );

      if (
        currentPage >= totalPages
      ) {
        return;
      }

      try {
        setLoading(true);

        const nextPage =
          currentPage + 1;

        const response =
          await getPublicSellerProducts(
            sellerId,
            {
              page: nextPage,
              limit: 20,
              sort: "-createdAt",
            }
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load more products."
          );
        }

        const newProducts =
          Array.isArray(
            response.products
          )
            ? response.products
            : [];

        setProducts(
          (previous) => [
            ...previous,
            ...newProducts,
          ]
        );

        setPagination(
          response.pagination ||
            pagination
        );
      } catch (err) {
        console.error(
          "❌ Error loading more products:",
          err
        );

        setError(
          err?.message ||
            "Unable to load more products."
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <style>
        {`
          @media (max-width: 600px) {
            .seller-profile-card {
              flex-direction: column !important;
              text-align: center !important;
            }

            .seller-profile-info {
              width: 100% !important;
            }

            .seller-profile-details {
              justify-content: center !important;
            }

            .seller-products-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 12px !important;
            }

            .seller-products-grid .product-card {
              min-width: 0 !important;
            }

            .reviews-summary {
              grid-template-columns: 1fr !important;
            }

            .review-form-grid {
              grid-template-columns: 1fr !important;
            }
          }

          .seller-review-star-button {
            transition: transform 0.15s ease;
          }

          .seller-review-star-button:hover {
            transform: scale(1.15);
          }

          .seller-review-card {
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease;
          }

          .seller-review-card:hover {
            transform: translateY(-1px);
            box-shadow:
              0 8px 25px rgba(0,0,0,0.08) !important;
          }
        `}
      </style>

      <div
        className="container"
        style={{
          padding: "30px 20px",
        }}
      >
        {/* ====================================================
            SELLER PROFILE CARD
        ==================================================== */}

        <div
          className="seller-profile-card"
          style={{
            background: "white",
            borderRadius:
              "var(--radius-xl)",
            padding: "30px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.08)",
            marginBottom: "40px",
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            alignItems: "center",
          }}
        >
          {/* AVATAR */}

          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              background:
                "var(--gray-200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border:
                "3px solid var(--gray-100)",
            }}
          >
            {sellerImage &&
            !imageError ? (
              <img
                src={sellerImage}
                alt={sellerName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={() => {
                  console.error(
                    "❌ Seller profile image failed:",
                    sellerImage
                  );

                  setImageError(true);
                }}
              />
            ) : (
              <i
                className="fas fa-user-circle"
                style={{
                  fontSize: "64px",
                  color:
                    "var(--gray-400)",
                }}
              />
            )}
          </div>

          {/* SELLER INFORMATION */}

          <div
            className="seller-profile-info"
            style={{
              flex: 1,
              minWidth: "250px",
            }}
          >
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              {sellerName}
            </h1>

            {seller.location && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "8px",
                }}
              >
                <i
                  className="fas fa-map-marker-alt"
                  style={{
                    marginRight: "7px",
                  }}
                />

                {seller.location}
              </div>
            )}

            {seller.phone && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "8px",
                }}
              >
                <i
                  className="fas fa-phone"
                  style={{
                    marginRight: "7px",
                  }}
                />

                {seller.phone}
              </div>
            )}

            {seller.role && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "8px",
                }}
              >
                <i
                  className="fas fa-user-tag"
                  style={{
                    marginRight: "7px",
                  }}
                />

                {seller.role
                  .charAt(0)
                  .toUpperCase() +
                  seller.role.slice(1)}
              </div>
            )}

            <div
              style={{
                color:
                  "var(--gray-500)",
                marginBottom: "8px",
              }}
            >
              <i
                className="fas fa-calendar-alt"
                style={{
                  marginRight: "7px",
                }}
              />

              Member since{" "}
              {memberSince}

              {memberDuration &&
                memberDuration !== "N/A" && (
                  <>
                    {" "}
                    ({memberDuration})
                  </>
                )}
            </div>

            {lastSeen && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "12px",
                }}
              >
                <i
                  className="fas fa-clock"
                  style={{
                    marginRight: "7px",
                  }}
                />

                Last seen: {lastSeen}
              </div>
            )}

            {/* STATS */}

            <div
              className="seller-profile-details"
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "15px",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                }}
              >
                <i
                  className="fas fa-box"
                  style={{
                    marginRight: "6px",
                  }}
                />

                {productCount} products
              </span>

              <span
                style={{
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <Stars
                  rating={averageRating}
                  size="15px"
                />

                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "No rating"}

                {totalReviews > 0 && (
                  <span
                    style={{
                      color:
                        "var(--gray-500)",
                      fontWeight: 500,
                    }}
                  >
                    ({totalReviews})
                  </span>
                )}
              </span>
            </div>

            {/* CONTACT */}

            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={!seller.phone}
              style={{
                padding: "10px 24px",
                background: seller.phone
                  ? "#25D366"
                  : "var(--gray-300)",
                color: "white",
                border: "none",
                borderRadius:
                  "var(--radius-full)",
                fontWeight: 700,
                fontSize: "15px",
                cursor: seller.phone
                  ? "pointer"
                  : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="fab fa-whatsapp" />

              {seller.phone
                ? "Contact Seller"
                : "No Phone Number"}
            </button>
          </div>
        </div>

        {/* ====================================================
            REVIEWS
        ==================================================== */}

        <section
          style={{
            marginBottom: "50px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Seller Reviews
              </h2>

              <p
                style={{
                  color:
                    "var(--gray-500)",
                  margin: "6px 0 0",
                }}
              >
                See what other buyers
                think about {sellerName}.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background:
                  "var(--gray-100)",
                padding: "10px 15px",
                borderRadius:
                  "var(--radius-full)",
              }}
            >
              <Stars
                rating={averageRating}
                size="16px"
              />

              <strong>
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "0.0"}
              </strong>

              <span
                style={{
                  color:
                    "var(--gray-500)",
                }}
              >
                {totalReviews}{" "}
                {totalReviews === 1
                  ? "review"
                  : "reviews"}
              </span>
            </div>
          </div>

          {/* REVIEW SUMMARY */}

          <div
            className="reviews-summary"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(230px, 0.8fr) minmax(300px, 1.5fr)",
              gap: "25px",
              marginBottom: "30px",
            }}
          >
            {/* RATING SCORE */}

            <div
              style={{
                background: "white",
                borderRadius:
                  "var(--radius-xl)",
                padding: "25px",
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  lineHeight: 1,
                  marginBottom: "10px",
                }}
              >
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "0.0"}
              </div>

              <Stars
                rating={averageRating}
                size="20px"
              />

              <div
                style={{
                  marginTop: "10px",
                  color:
                    "var(--gray-500)",
                }}
              >
                Based on {totalReviews}{" "}
                reviews
              </div>
            </div>

            {/* BREAKDOWN */}

            <div
              style={{
                background: "white",
                borderRadius:
                  "var(--radius-xl)",
                padding: "25px",
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              {[5, 4, 3, 2, 1].map(
                (rating) => {
                  const count =
                    Number(
                      breakdown[rating] || 0
                    );

                  const percentage =
                    totalReviews > 0
                      ? Math.round(
                          (count /
                            totalReviews) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={rating}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "55px 1fr 45px",
                        alignItems:
                          "center",
                        gap: "10px",
                        marginBottom:
                          rating === 1
                            ? 0
                            : "10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {rating}{" "}
                        <i
                          className="fas fa-star"
                          style={{
                            color:
                              "#f59e0b",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          height: "8px",
                          background:
                            "var(--gray-200)",
                          borderRadius:
                            "999px",
                          overflow:
                            "hidden",
                        }}
                      >
                        <div
                          style={{
                            width:
                              `${percentage}%`,
                            height: "100%",
                            background:
                              "#f59e0b",
                            borderRadius:
                              "999px",
                            transition:
                              "width 0.3s ease",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          color:
                            "var(--gray-500)",
                          textAlign: "right",
                        }}
                      >
                        {count}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* ==================================================
              WRITE REVIEW
          ================================================== */}

          <div
            style={{
              background: "white",
              borderRadius:
                "var(--radius-xl)",
              padding: "25px",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
              marginBottom: "30px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 800,
                marginTop: 0,
                marginBottom: "8px",
              }}
            >
              Write a Review
            </h3>

            <p
              style={{
                color:
                  "var(--gray-500)",
                marginTop: 0,
                marginBottom: "20px",
              }}
            >
              Share your experience
              with this seller.
            </p>

            {reviewError && (
              <div
                style={{
                  background:
                    "#fff1f2",
                  color: "#be123c",
                  border:
                    "1px solid #fecdd3",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
              >
                <i
                  className="fas fa-exclamation-circle"
                  style={{
                    marginRight: "8px",
                  }}
                />

                {reviewError}
              </div>
            )}

            {reviewSuccess && (
              <div
                style={{
                  background:
                    "#f0fdf4",
                  color: "#15803d",
                  border:
                    "1px solid #bbf7d0",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
              >
                <i
                  className="fas fa-check-circle"
                  style={{
                    marginRight: "8px",
                  }}
                />

                {reviewSuccess}
              </div>
            )}

            <form
              onSubmit={
                handleSubmitReview
              }
            >
              {/* STAR SELECTOR */}

              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  Your Rating
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        className="seller-review-star-button"
                        onClick={() =>
                          setSelectedRating(
                            star
                          )
                        }
                        aria-label={`Give ${star} star${
                          star > 1
                            ? "s"
                            : ""
                        }`}
                        style={{
                          border: "none",
                          background:
                            "transparent",
                          padding: "3px",
                          cursor:
                            "pointer",
                          fontSize: "28px",
                          color:
                            star <=
                            selectedRating
                              ? "#f59e0b"
                              : "var(--gray-300)",
                        }}
                      >
                        <i
                          className={
                            star <=
                            selectedRating
                              ? "fas fa-star"
                              : "far fa-star"
                          }
                        />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* COMMENT */}

              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <label
                  htmlFor="seller-review-comment"
                  style={{
                    display: "block",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  Your Review
                </label>

                <textarea
                  id="seller-review-comment"
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value
                    )
                  }
                  placeholder="Tell other buyers about your experience with this seller..."
                  maxLength={2000}
                  rows={5}
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    resize: "vertical",
                    border:
                      "1px solid var(--gray-300)",
                    borderRadius: "12px",
                    padding:
                      "13px 14px",
                    fontSize: "15px",
                    outline: "none",
                    fontFamily:
                      "inherit",
                  }}
                />

                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    color:
                      "var(--gray-500)",
                    marginTop: "5px",
                  }}
                >
                  {reviewComment.length}
                  /2000
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  submittingReview
                }
                style={{
                  padding: "12px 24px",
                  background:
                    submittingReview
                      ? "var(--gray-300)"
                      : "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight: 700,
                  cursor:
                    submittingReview
                      ? "not-allowed"
                      : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {submittingReview ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" />
                    Post Review
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ==================================================
              REVIEW LIST
          ================================================== */}

          <div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 800,
                marginBottom: "18px",
              }}
            >
              What Buyers Say
            </h3>

            {reviewsLoading &&
            reviews.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius:
                    "var(--radius-xl)",
                  padding: "35px",
                  textAlign: "center",
                  color:
                    "var(--gray-500)",
                }}
              >
                <i
                  className="fas fa-spinner fa-spin"
                  style={{
                    marginRight: "8px",
                  }}
                />

                Loading reviews...
              </div>
            ) : reviewError &&
              reviews.length === 0 ? (
              <div
                style={{
                  background:
                    "#fff7ed",
                  color: "#c2410c",
                  border:
                    "1px solid #fed7aa",
                  borderRadius: "12px",
                  padding: "15px",
                }}
              >
                {reviewError}
              </div>
            ) : reviews.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius:
                    "var(--radius-xl)",
                  padding:
                    "40px 25px",
                  textAlign: "center",
                  boxShadow:
                    "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <i
                  className="far fa-star"
                  style={{
                    fontSize: "48px",
                    color:
                      "var(--gray-300)",
                    marginBottom: "15px",
                  }}
                />

                <h4
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    margin:
                      "0 0 8px",
                  }}
                >
                  No reviews yet
                </h4>

                <p
                  style={{
                    color:
                      "var(--gray-500)",
                    margin: 0,
                  }}
                >
                  Be the first buyer
                  to review this seller.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "15px",
                  }}
                >
                  {reviews.map(
                    (review) => {
                      const reviewer =
                        review.reviewer ||
                        {};

                      const reviewerName =
                        review.reviewerName ||
                        reviewer.name ||
                        "Buyer";

                      const reviewerAvatar =
                        getSellerImageUrl(
                          review.reviewerAvatar ||
                            reviewer.avatar ||
                            reviewer.profileImage ||
                            reviewer.photo ||
                            reviewer.photoURL
                        );

                      const hasReply =
                        review.sellerReply
                          ?.text;

                      return (
                        <div
                          key={
                            review._id
                          }
                          className="seller-review-card"
                          style={{
                            background:
                              "white",
                            borderRadius:
                              "var(--radius-xl)",
                            padding:
                              "22px",
                            boxShadow:
                              "0 4px 18px rgba(0,0,0,0.05)",
                          }}
                        >
                          {/* REVIEWER */}

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "12px",
                              marginBottom:
                                "13px",
                            }}
                          >
                            <div
                              style={{
                                width: "46px",
                                height: "46px",
                                borderRadius:
                                  "50%",
                                overflow:
                                  "hidden",
                                background:
                                  "var(--gray-200)",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                flexShrink: 0,
                              }}
                            >
                              {reviewerAvatar ? (
                                <img
                                  src={
                                    reviewerAvatar
                                  }
                                  alt={
                                    reviewerName
                                  }
                                  style={{
                                    width:
                                      "100%",
                                    height:
                                      "100%",
                                    objectFit:
                                      "cover",
                                  }}
                                />
                              ) : (
                                <i
                                  className="fas fa-user"
                                  style={{
                                    color:
                                      "var(--gray-400)",
                                  }}
                                />
                              )}
                            </div>

                            <div
                              style={{
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight:
                                    700,
                                  marginBottom:
                                    "3px",
                                }}
                              >
                                {
                                  reviewerName
                                }
                              </div>

                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "8px",
                                  flexWrap:
                                    "wrap",
                                }}
                              >
                                <Stars
                                  rating={
                                    review.rating
                                  }
                                  size="13px"
                                />

                                <span
                                  style={{
                                    color:
                                      "var(--gray-500)",
                                    fontSize:
                                      "12px",
                                  }}
                                >
                                  {timeAgo(
                                    review.createdAt
                                  )}
                                </span>

                                {review.verifiedPurchase && (
                                  <span
                                    style={{
                                      color:
                                        "#15803d",
                                      fontSize:
                                        "12px",
                                      fontWeight:
                                        600,
                                      display:
                                        "inline-flex",
                                      alignItems:
                                        "center",
                                      gap: "4px",
                                    }}
                                  >
                                    <i className="fas fa-check-circle" />
                                    Verified
                                    purchase
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* COMMENT */}

                          <p
                            style={{
                              margin:
                                "0 0 15px",
                              color:
                                "var(--gray-700)",
                              lineHeight: 1.65,
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {review.comment}
                          </p>

                          {/* PRODUCT */}

                          {review.productId
                            ?.title && (
                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "var(--gray-500)",
                                marginBottom:
                                  "12px",
                              }}
                            >
                              <i
                                className="fas fa-box"
                                style={{
                                  marginRight:
                                    "6px",
                                }}
                              />

                              Review for:{" "}
                              {
                                review
                                  .productId
                                  .title
                              }
                            </div>
                          )}

                          {/* SELLER REPLY */}

                          {hasReply && (
                            <div
                              style={{
                                background:
                                  "var(--gray-100)",
                                borderRadius:
                                  "12px",
                                padding:
                                  "14px",
                                marginTop:
                                  "12px",
                                marginBottom:
                                  "14px",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight:
                                    700,
                                  fontSize:
                                    "13px",
                                  marginBottom:
                                    "5px",
                                }}
                              >
                                <i
                                  className="fas fa-reply"
                                  style={{
                                    marginRight:
                                      "6px",
                                  }}
                                />

                                Seller response
                              </div>

                              <div
                                style={{
                                  color:
                                    "var(--gray-700)",
                                  lineHeight:
                                    1.5,
                                  whiteSpace:
                                    "pre-wrap",
                                }}
                              >
                                {
                                  review
                                    .sellerReply
                                    .text
                                }
                              </div>
                            </div>
                          )}

                          {/* HELPFUL */}

                          <button
                            type="button"
                            onClick={() =>
                              handleHelpful(
                                review._id
                              )
                            }
                            style={{
                              border:
                                "1px solid var(--gray-300)",
                              background:
                                review.hasHelpful
                                  ? "var(--gray-100)"
                                  : "white",
                              color:
                                "var(--gray-700)",
                              borderRadius:
                                "var(--radius-full)",
                              padding:
                                "7px 12px",
                              cursor:
                                "pointer",
                              fontSize:
                                "13px",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "6px",
                            }}
                          >
                            <i
                              className={
                                review.hasHelpful
                                  ? "fas fa-thumbs-up"
                                  : "far fa-thumbs-up"
                              }
                            />

                            Helpful

                            {Number(
                              review.helpfulCount ||
                                0
                            ) > 0 && (
                              <span>
                                (
                                {
                                  review.helpfulCount
                                }
                                )
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* LOAD MORE REVIEWS */}

                {reviewsPagination &&
                  Number(
                    reviewsPagination.page || 1
                  ) <
                    Number(
                      reviewsPagination.totalPages ||
                        1
                    ) && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "center",
                        marginTop: "25px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={
                          handleLoadMoreReviews
                        }
                        disabled={
                          reviewsLoading
                        }
                        style={{
                          padding:
                            "11px 25px",
                          background:
                            reviewsLoading
                              ? "var(--gray-300)"
                              : "var(--primary)",
                          color: "white",
                          border: "none",
                          borderRadius:
                            "var(--radius-full)",
                          fontWeight: 700,
                          cursor:
                            reviewsLoading
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {reviewsLoading ? (
                          <>
                            <i
                              className="fas fa-spinner fa-spin"
                              style={{
                                marginRight:
                                  "7px",
                              }}
                            />

                            Loading...
                          </>
                        ) : (
                          <>
                            <i
                              className="fas fa-plus"
                              style={{
                                marginRight:
                                  "7px",
                              }}
                            />

                            Load More Reviews
                          </>
                        )}
                      </button>
                    </div>
                  )}
              </>
            )}
          </div>
        </section>

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        <h2
          style={{
            fontSize: "22px",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          Products by {sellerName}
        </h2>

        {productCount === 0 ? (
          <div
            style={{
              color: "var(--gray-500)",
              padding: "40px 0",
              textAlign: "center",
            }}
          >
            <i
              className="fas fa-box-open"
              style={{
                fontSize: "48px",
                display: "block",
                marginBottom: "12px",
              }}
            />

            This seller has not
            listed any products yet.
          </div>
        ) : (
          <>
            <div
              className="seller-products-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "24px",
              }}
            >
              {products.map(
                (product) => (
                  <div
                    key={product._id}
                    className="product-card"
                  >
                    <ProductCard
                      product={product}
                      isFavorite={isFavorite(
                        product._id
                      )}
                      onToggleFavorite={() =>
                        toggleFavorite(
                          product._id
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>

            {/* LOAD MORE PRODUCTS */}

            {pagination &&
              Number(
                pagination.page || 1
              ) <
                Number(
                  pagination.totalPages ||
                    1
                ) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    marginTop: "30px",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      handleLoadMoreProducts
                    }
                    disabled={loading}
                    style={{
                      padding: "11px 25px",
                      background:
                        loading
                          ? "var(--gray-300)"
                          : "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius:
                        "var(--radius-full)",
                      fontWeight: 700,
                      cursor: loading
                        ? "not-allowed"
                        : "pointer",
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap: "8px",
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus" />
                        Load More Products
                      </>
                    )}
                  </button>
                </div>
              )}
          </>
        )}
      </div>
    </>
  );
};

export default SellerPage;