// ============================================================
// frontend/src/components/ReviewSection.jsx
// BuyUKUsed – Review Section (standalone)
// ============================================================

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";

import { getToken } from "../utils/storage"; // ✅ use the same token helper

import {
  createReview,
  updateReview,
  toggleReviewHelpful,
  reportReview,
  replyToReview,
  deleteReviewReply,
  getSellerReviews,
  getProductReviews,
} from "../services/api"; // ✅ use centralized API

// ============================================================
// EMPTY SUMMARY
// ============================================================

const EMPTY_SUMMARY = {
  averageRating: 0,
  totalReviews: 0,
  breakdown: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  },
};

// ============================================================
// STAR COMPONENT
// ============================================================

const Stars = ({
  value = 0,
  size = 18,
  interactive = false,
  onChange,
}) => {
  const roundedValue = Math.round(
    Number(value) || 0
  );

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
      }}
      aria-label={`${roundedValue} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => {
            if (interactive) {
              onChange?.(star);
            }
          }}
          disabled={!interactive}
          aria-label={
            interactive
              ? `${star} star${star > 1 ? "s" : ""}`
              : undefined
          }
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
            cursor: interactive
              ? "pointer"
              : "default",
            fontSize: `${size}px`,
            lineHeight: 1,
            color:
              star <= roundedValue
                ? "#f59e0b"
                : "#d1d5db",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};

// ============================================================
// INITIALS
// ============================================================

const getInitials = (name) => {
  return String(name || "Buyer")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
};

// ============================================================
// AVATAR
// ============================================================

const getAvatar = (reviewer) => {
  return (
    reviewer?.avatar ||
    reviewer?.profileImage ||
    reviewer?.photo ||
    reviewer?.photoURL ||
    ""
  );
};

// ============================================================
// COMPONENT
// ============================================================

const ReviewSection = ({
  sellerId,
  productId,
  sellerName = "Seller",
  currentUser = null,
  showWriteReview = true,
}) => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [reviews, setReviews] = useState([]);

  const [summary, setSummary] =
    useState(EMPTY_SUMMARY);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedRating, setSelectedRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingReviewId, setEditingReviewId] =
    useState(null);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [filterRating, setFilterRating] =
    useState("");

  const [reportingId, setReportingId] =
    useState(null);

  const [helpfulId, setHelpfulId] =
    useState(null);

  const [replyingId, setReplyingId] =
    useState(null);

  const [replyText, setReplyText] =
    useState("");

  const [replying, setReplying] =
    useState(false);

  // ==========================================================
  // CURRENT USER ID
  // ==========================================================

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  // ==========================================================
  // SELLER CHECK
  // ==========================================================

  const isCurrentUserSeller =
    Boolean(
      currentUserId &&
      sellerId &&
      String(currentUserId) ===
        String(sellerId)
    );

  // ==========================================================
  // HAS USER REVIEWED? (CONTEXT-AWARE)
  // ==========================================================

  const userReview = useMemo(() => {
    if (!currentUserId || !reviews.length) {
      return null;
    }

    return reviews.find((r) => {
      // Get reviewer ID (handles object or string)
      const reviewerId = r.reviewer?._id || r.reviewer?.id || r.reviewer;
      if (!reviewerId) return false;

      // Must be the current user
      if (String(reviewerId) !== String(currentUserId)) return false;

      // If we are in product review mode (productId prop is provided)
      if (productId) {
        // Match a review with the same productId
        const reviewProductId = r.productId?._id || r.productId;
        return reviewProductId && String(reviewProductId) === String(productId);
      } else {
        // Seller review mode: must have no productId (null, undefined, or empty)
        const hasProductId = r.productId !== undefined && r.productId !== null && r.productId !== "";
        return !hasProductId;
      }
    });
  }, [reviews, currentUserId, productId]);

  const hasUserReviewed = Boolean(userReview);

  // ==========================================================
  // LOAD REVIEWS
  // ==========================================================

  const loadReviews = useCallback(
    async () => {
      if (!sellerId && !productId) {
        setReviews([]);
        setSummary(EMPTY_SUMMARY);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Use the API service functions
        let response;
        if (productId) {
          response = await getProductReviews(productId, {
            page,
            limit: 10,
            ...(filterRating && { rating: filterRating }),
          });
        } else if (sellerId) {
          response = await getSellerReviews(sellerId, {
            page,
            limit: 10,
            ...(filterRating && { rating: filterRating }),
          });
        } else {
          setReviews([]);
          setSummary(EMPTY_SUMMARY);
          setTotalPages(1);
          setLoading(false);
          return;
        }

        const data = response || {};

        setReviews(
          Array.isArray(data.reviews)
            ? data.reviews
            : []
        );

        setSummary(
          data.summary || EMPTY_SUMMARY
        );

        setTotalPages(
          Number(
            data.pagination?.totalPages
          ) || 1
        );
      } catch (err) {
        console.error(
          "❌ Load reviews error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load reviews."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      sellerId,
      productId,
      page,
      filterRating,
    ]
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ==========================================================
  // CLEAR MESSAGES
  // ==========================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // RATING PERCENTAGE
  // ==========================================================

  const ratingPercentage = (rating) => {
    const total =
      Number(summary.totalReviews) || 0;

    if (!total) {
      return 0;
    }

    const count =
      Number(
        summary.breakdown?.[rating]
      ) || 0;

    return Math.round(
      (count / total) * 100
    );
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setSelectedRating(0);
    setComment("");
    setEditingReviewId(null);
    setShowForm(false);
  };

  // ==========================================================
  // START EDITING REVIEW
  // ==========================================================

  const startEditingReview = (review) => {
    clearMessages();

    setEditingReviewId(
      review?._id || null
    );

    setSelectedRating(
      Number(review?.rating) || 0
    );

    setComment(
      review?.comment || ""
    );

    setShowForm(true);

    window.setTimeout(() => {
      const form =
        document.getElementById(
          "buyukused-review-section-form"
        );

      if (form) {
        form.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 50);
  };

  // ==========================================================
  // SUBMIT REVIEW (using API service)
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessages();

    // --------------------------------------------------------
    // AUTH
    // --------------------------------------------------------

    if (!currentUser) {
      setError(
        "Please log in to write a review."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your login session has expired. Please log in again."
      );

      return;
    }

    // --------------------------------------------------------
    // RATING
    // --------------------------------------------------------

    if (!selectedRating) {
      setError(
        "Please select a star rating."
      );

      return;
    }

    // --------------------------------------------------------
    // COMMENT
    // --------------------------------------------------------

    const cleanComment =
      comment.trim();

    if (cleanComment.length < 3) {
      setError(
        "Please write at least 3 characters."
      );

      return;
    }

    if (cleanComment.length > 2000) {
      setError(
        "Review cannot exceed 2000 characters."
      );

      return;
    }

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    if (!sellerId) {
      setError(
        "Seller information is missing."
      );

      return;
    }

    // --------------------------------------------------------
    // SELLER CANNOT REVIEW SELF
    // --------------------------------------------------------

    if (isCurrentUserSeller) {
      setError(
        "You cannot review your own seller account."
      );

      return;
    }

    // ========================================================
    // CLIENT‑SIDE CHECK FOR EXISTING REVIEW (CONTEXT-AWARE)
    // ========================================================

    if (!editingReviewId && hasUserReviewed && userReview) {
      // Pre‑fill the edit form and stop submission
      setEditingReviewId(userReview._id);
      setSelectedRating(userReview.rating);
      setComment(userReview.comment || "");
      setShowForm(true);
      setError("");
      setSuccess("You already have a review – you can edit it below.");
      return;
    }

    try {
      setSubmitting(true);

      // ======================================================
      // EDIT MODE
      // ======================================================

      if (editingReviewId) {
        const data =
          await updateReview(
            editingReviewId,
            {
              rating: selectedRating,
              comment: cleanComment,
            },
            token
          );

        setSuccess(
          data?.message ||
            "Your review has been updated successfully."
        );

        resetForm();

        setPage(1);

        await loadReviews();

        return;
      }

      // ======================================================
      // CREATE MODE
      // ======================================================

      const payload = {
        sellerId,
        rating: selectedRating,
        comment: cleanComment,
      };

      if (productId) {
        payload.productId =
          productId;
      }

      const response =
        await createReview(
          payload,
          token
        );

      const data =
        response || {};

      // ======================================================
      // CREATED SUCCESSFULLY
      // ======================================================

      if (data.success) {
        setSuccess(
          data.message ||
            "Your review has been posted successfully."
        );

        resetForm();

        setPage(1);

        await loadReviews();

        return;
      }

      setSuccess(
        "Your review has been posted successfully."
      );

      resetForm();

      setPage(1);

      await loadReviews();
    } catch (err) {
      console.error(
        "❌ Submit review error:",
        err
      );

      // ======================================================
      // IMPORTANT 409 HANDLING
      // ======================================================

      const status =
        err.response?.status ||
        err.status;

      const data =
        err.response?.data ||
        err.data ||
        {};

      if (
        status === 409 &&
        data?.review?._id
      ) {
        const existingReview =
          data.review;

        try {
          const updated =
            await updateReview(
              existingReview._id,
              {
                rating: selectedRating,
                comment: cleanComment,
              },
              token
            );

          setSuccess(
            updated?.message ||
              "Your existing review has been updated successfully."
          );

          resetForm();

          setPage(1);

          await loadReviews();

          return;
        } catch (updateError) {
          console.error(
            "❌ Automatic review update failed:",
            updateError
          );

          setEditingReviewId(
            existingReview._id
          );

          setSuccess(
            "You already reviewed this. You can edit your existing review."
          );

          setShowForm(true);

          return;
        }
      }

      // ======================================================
      // 409 WITHOUT REVIEW OBJECT – reload and try to find
      // ======================================================

      if (status === 409) {
        // Reload reviews to get the user's review
        await loadReviews();

        setError(""); // clear error
        setSuccess(
          "You have already reviewed this. You can edit your review below."
        );

        return;
      }

      // ======================================================
      // OTHER ERRORS
      // ======================================================

      setError(
        data?.message ||
          err.message ||
          "Unable to post your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // HELPFUL (using API service)
  // ==========================================================

  const handleHelpful = async (
    reviewId
  ) => {
    clearMessages();

    const token = getToken();

    if (!token) {
      setError(
        "Please log in to mark a review helpful."
      );

      return;
    }

    try {
      setHelpfulId(reviewId);

      const response =
        await toggleReviewHelpful(
          reviewId,
          token
        );

      const data =
        response || {};

      setReviews((previous) =>
        previous.map((review) =>
          String(review._id) ===
          String(reviewId)
            ? {
                ...review,
                helpfulCount:
                  data.helpfulCount ??
                  review.helpfulCount ??
                  0,
                hasHelpful:
                  data.helpful ??
                  review.hasHelpful ??
                  false,
              }
            : review
        )
      );
    } catch (err) {
      console.error(
        "❌ Helpful error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update helpful vote."
      );
    } finally {
      setHelpfulId(null);
    }
  };

  // ==========================================================
  // REPORT (using API service)
  // ==========================================================

  const handleReport = async (
    reviewId
  ) => {
    clearMessages();

    const token = getToken();

    if (!token) {
      setError(
        "Please log in to report a review."
      );

      return;
    }

    try {
      setReportingId(reviewId);

      await reportReview(
        reviewId,
        "Inappropriate or misleading review",
        token
      );

      setSuccess(
        "Thank you. The review has been reported."
      );
    } catch (err) {
      console.error(
        "❌ Report error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to report review."
      );
    } finally {
      setReportingId(null);
    }
  };

  // ==========================================================
  // SELLER REPLY (using API service)
  // ==========================================================

  const handleReply = async (
    reviewId
  ) => {
    clearMessages();

    const token = getToken();

    if (!token) {
      setError(
        "Please log in to reply."
      );

      return;
    }

    const cleanReply =
      replyText.trim();

    if (cleanReply.length < 2) {
      setError(
        "Please write a reply."
      );

      return;
    }

    if (cleanReply.length > 2000) {
      setError(
        "Reply cannot exceed 2000 characters."
      );

      return;
    }

    try {
      setReplying(true);

      const response =
        await replyToReview(
          reviewId,
          cleanReply,
          token
        );

      const data =
        response || {};

      setReviews((previous) =>
        previous.map((review) =>
          String(review._id) ===
          String(reviewId)
            ? {
                ...review,
                sellerReply:
                  data.sellerReply ||
                  review.sellerReply,
              }
            : review
        )
      );

      setReplyText("");
      setReplyingId(null);

      setSuccess(
        data.message ||
          "Reply posted successfully."
      );
    } catch (err) {
      console.error(
        "❌ Seller reply error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to post reply."
      );
    } finally {
      setReplying(false);
    }
  };

  // ==========================================================
  // EMPTY MESSAGE
  // ==========================================================

  const emptyMessage =
    productId
      ? "No reviews for this product yet."
      : `No reviews for ${sellerName} yet.`;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section
      style={{
        marginTop: "40px",
        background: "#fff",
        borderRadius: "16px",
        padding: "24px",
        border:
          "1px solid #e5e7eb",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Reviews
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Real customer experiences
          </p>
        </div>

        {showWriteReview &&
          currentUser &&
          !isCurrentUserSeller && (
            <button
              type="button"
              onClick={() => {
                clearMessages();

                if (hasUserReviewed && userReview) {
                  startEditingReview(userReview);
                } else if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "11px 18px",
                background: "#111827",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {hasUserReviewed
                ? "Edit your review"
                : showForm
                ? "Cancel"
                : "Write a review"}
            </button>
          )}
      </div>

      {/* MESSAGES */}
      {error && (
        <div
          role="alert"
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "#fee2e2",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "#dcfce7",
            color: "#166534",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      {/* WRITE / EDIT REVIEW FORM */}
      {showForm && (
        <form
          id="buyukused-review-section-form"
          onSubmit={handleSubmit}
          style={{
            marginBottom: "28px",
            padding: "20px",
            borderRadius: "14px",
            background: "#f9fafb",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            {editingReviewId
              ? "Edit your review"
              : "Share your experience"}
          </h3>

          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <Stars
              value={selectedRating}
              size={30}
              interactive
              onChange={
                setSelectedRating
              }
            />

            <div
              style={{
                marginTop: "6px",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              {selectedRating
                ? `${selectedRating} out of 5`
                : "Select a rating"}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            placeholder="Tell other buyers about your experience..."
            maxLength={2000}
            rows={5}
            disabled={submitting}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              border:
                "1px solid #d1d5db",
              borderRadius: "10px",
              resize: "vertical",
              fontFamily: "inherit",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginTop: "10px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: "#6b7280",
                fontSize: "12px",
              }}
            >
              {comment.length}/2000
            </span>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              {editingReviewId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  style={{
                    border:
                      "1px solid #d1d5db",
                    borderRadius:
                      "999px",
                    padding:
                      "12px 20px",
                    background: "#fff",
                    color: "#374151",
                    fontWeight: 600,
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "12px 20px",
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                  opacity: submitting
                    ? 0.6
                    : 1,
                }}
              >
                {submitting
                  ? editingReviewId
                    ? "Updating..."
                    : "Posting..."
                  : editingReviewId
                    ? "Update review"
                    : "Post review"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(150px, 220px) 1fr",
          gap: "28px",
          paddingBottom: "28px",
          borderBottom:
            "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              lineHeight: 1,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            {Number(
              summary.averageRating || 0
            ).toFixed(1)}
          </div>

          <Stars
            value={
              summary.averageRating
            }
            size={22}
          />

          <div
            style={{
              marginTop: "7px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            {summary.totalReviews || 0}{" "}
            {Number(
              summary.totalReviews || 0
            ) === 1
              ? "review"
              : "reviews"}
          </div>
        </div>

        <div>
          {[5, 4, 3, 2, 1].map(
            (rating) => {
              const active =
                filterRating ===
                String(rating);

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => {
                    setFilterRating(
                      active
                        ? ""
                        : String(rating)
                    );

                    setPage(1);
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "35px 1fr 42px",
                    alignItems:
                      "center",
                    width: "100%",
                    border: "none",
                    background:
                      active
                        ? "#f9fafb"
                        : "transparent",
                    padding: "4px 6px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      fontWeight: active
                        ? 700
                        : 400,
                    }}
                  >
                    {rating} ★
                  </span>

                  <div
                    style={{
                      height: "8px",
                      background:
                        "#e5e7eb",
                      borderRadius:
                        "999px",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${ratingPercentage(
                          rating
                        )}%`,
                        background:
                          "#f59e0b",
                        borderRadius:
                          "999px",
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      textAlign:
                        "right",
                    }}
                  >
                    {summary
                      .breakdown?.[
                      rating
                    ] || 0}
                  </span>
                </button>
              );
            }
          )}

          {filterRating && (
            <button
              type="button"
              onClick={() => {
                setFilterRating("");
                setPage(1);
              }}
              style={{
                marginTop: "8px",
                border: "none",
                background:
                  "transparent",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Clear rating filter
            </button>
          )}
        </div>
      </div>

      {/* REVIEW LIST */}
      <div
        style={{
          marginTop: "24px",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          reviews.map((review) => {
            const reviewer =
              review?.reviewer;

            const reviewerName =
              reviewer?.name ||
              review?.reviewerName ||
              "Buyer";

            const avatar =
              getAvatar(reviewer) ||
              review?.reviewerAvatar ||
              "";

            const reviewOwner =
              currentUserId &&
              review?.reviewer &&
              String(
                review.reviewer?._id ||
                  review.reviewer
              ) ===
                String(currentUserId);

            const canEdit =
              Boolean(
                reviewOwner &&
                  !isCurrentUserSeller
              );

            const canReply =
              isCurrentUserSeller &&
              String(review?.sellerId?._id ||
                review?.sellerId) ===
                String(sellerId);

            const helpfulCount =
              Number(
                review?.helpfulCount
              ) || 0;

            return (
              <article
                key={review?._id}
                style={{
                  padding: "22px 0",
                  borderBottom:
                    "1px solid #e5e7eb",
                }}
              >
                {/* REVIEW HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                    }}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={reviewerName}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius:
                            "50%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius:
                            "50%",
                          background:
                            "#111827",
                          color: "#fff",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontWeight: 800,
                          fontSize: "14px",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(
                          reviewerName
                        )}
                      </div>
                    )}

                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <strong
                          style={{
                            color:
                              "#111827",
                            fontSize:
                              "15px",
                          }}
                        >
                          {reviewerName}
                        </strong>

                        {review?.verifiedPurchase && (
                          <span
                            style={{
                              padding:
                                "3px 8px",
                              borderRadius:
                                "999px",
                              background:
                                "#dcfce7",
                              color:
                                "#166534",
                              fontSize:
                                "11px",
                              fontWeight:
                                700,
                            }}
                          >
                            ✓ Verified purchase
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                          marginTop:
                            "4px",
                        }}
                      >
                        <Stars
                          value={
                            review?.rating
                          }
                          size={16}
                        />

                        <span
                          style={{
                            color:
                              "#9ca3af",
                            fontSize:
                              "12px",
                          }}
                        >
                          {formatDate(
                            review?.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        startEditingReview(
                          review
                        )
                      }
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        color:
                          "#2563eb",
                        fontSize:
                          "13px",
                        fontWeight: 700,
                        cursor:
                          "pointer",
                        padding: 0,
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* COMMENT */}
                <p
                  style={{
                    margin: "14px 0",
                    color: "#374151",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {review?.comment}
                </p>

                {/* SELLER REPLY */}
                {review?.sellerReply
                  ?.text && (
                  <div
                    style={{
                      margin:
                        "14px 0",
                      padding:
                        "14px 16px",
                      background:
                        "#f3f4f6",
                      borderRadius:
                        "10px",
                      borderLeft:
                        "3px solid #111827",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize:
                          "13px",
                        color:
                          "#111827",
                        marginBottom:
                          "5px",
                      }}
                    >
                      Seller response
                    </div>

                    <div
                      style={{
                        color:
                          "#4b5563",
                        fontSize:
                          "13px",
                        lineHeight:
                          1.6,
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

                {/* ACTIONS */}
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "16px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleHelpful(
                        review?._id
                      )
                    }
                    disabled={
                      helpfulId ===
                      review?._id
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color:
                        review?.hasHelpful
                          ? "#111827"
                          : "#6b7280",
                      fontWeight:
                        review?.hasHelpful
                          ? 800
                          : 500,
                      cursor:
                        helpfulId ===
                        review?._id
                          ? "not-allowed"
                          : "pointer",
                      padding: 0,
                    }}
                  >
                    {helpfulId ===
                    review?._id
                      ? "Updating..."
                      : "👍 Helpful"}

                    {helpfulCount > 0
                      ? ` (${helpfulCount})`
                      : ""}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReport(
                        review?._id
                      )
                    }
                    disabled={
                      reportingId ===
                      review?._id
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color: "#9ca3af",
                      cursor:
                        reportingId ===
                        review?._id
                          ? "not-allowed"
                          : "pointer",
                      padding: 0,
                      fontSize:
                        "13px",
                    }}
                  >
                    {reportingId ===
                    review?._id
                      ? "Reporting..."
                      : "Report"}
                  </button>

                  {canReply &&
                    !review
                      ?.sellerReply
                      ?.text && (
                      <button
                        type="button"
                        onClick={() => {
                          clearMessages();
                          setReplyingId(
                            review?._id
                          );
                          setReplyText("");
                        }}
                        style={{
                          border: "none",
                          background:
                            "transparent",
                          color:
                            "#2563eb",
                          fontWeight:
                            700,
                          cursor:
                            "pointer",
                          padding: 0,
                        }}
                      >
                        Reply
                      </button>
                    )}
                </div>

                {/* REPLY FORM */}
                {replyingId ===
                  review?._id && (
                  <div
                    style={{
                      marginTop:
                        "14px",
                    }}
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) =>
                        setReplyText(
                          e.target.value
                        )
                      }
                      rows={3}
                      maxLength={2000}
                      placeholder="Write a professional response..."
                      disabled={replying}
                      style={{
                        width: "100%",
                        boxSizing:
                          "border-box",
                        padding: "11px",
                        border:
                          "1px solid #d1d5db",
                        borderRadius:
                          "8px",
                        fontFamily:
                          "inherit",
                        resize:
                          "vertical",
                      }}
                    />

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "8px",
                        marginTop:
                          "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleReply(
                            review?._id
                          )
                        }
                        disabled={
                          replying
                        }
                        style={{
                          border: "none",
                          borderRadius:
                            "999px",
                          padding:
                            "9px 16px",
                          background:
                            "#111827",
                          color: "#fff",
                          fontWeight:
                            700,
                          cursor:
                            replying
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            replying
                              ? 0.6
                              : 1,
                        }}
                      >
                        {replying
                          ? "Posting..."
                          : "Post reply"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReplyingId(
                            null
                          );
                          setReplyText("");
                        }}
                        disabled={
                          replying
                        }
                        style={{
                          border:
                            "1px solid #d1d5db",
                          borderRadius:
                            "999px",
                          padding:
                            "9px 16px",
                          background:
                            "#fff",
                          color:
                            "#374151",
                          fontWeight:
                            600,
                          cursor:
                            "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage(
                (value) =>
                  Math.max(
                    value - 1,
                    1
                  )
              )
            }
            style={{
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "8px 14px",
              background: "#fff",
              cursor:
                page <= 1
                  ? "not-allowed"
                  : "pointer",
              opacity:
                page <= 1
                  ? 0.5
                  : 1,
            }}
          >
            Previous
          </button>

          <span
            style={{
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            Page {page} of{" "}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              page >= totalPages
            }
            onClick={() =>
              setPage(
                (value) =>
                  Math.min(
                    value + 1,
                    totalPages
                  )
              )
            }
            style={{
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "8px 14px",
              background: "#fff",
              cursor:
                page >= totalPages
                  ? "not-allowed"
                  : "pointer",
              opacity:
                page >= totalPages
                  ? 0.5
                  : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default ReviewSection;