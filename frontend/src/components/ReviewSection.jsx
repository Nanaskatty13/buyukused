
// ============================================================
// frontend/src/components/ReviewSection.jsx
// BuyUKUsed – Review Section
// ============================================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getToken } from "../utils/storage";

import {
  createReview,
  updateReview,
  toggleReviewHelpful,
  reportReview,
  replyToReview,
  getSellerReviews,
  getProductReviews,
} from "../services/api";

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
// HELPERS
// ============================================================

const getId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return value._id || value.id || null;
  }

  return value;
};

const sameId = (a, b) => {
  const idA = getId(a);
  const idB = getId(b);

  if (!idA || !idB) {
    return false;
  }

  return String(idA) === String(idB);
};

const getReviewProductId = (review) => {
  return getId(review?.productId);
};

const getReviewSellerId = (review) => {
  return getId(review?.sellerId);
};

const getReviewUserId = (review) => {
  return (
    getId(review?.reviewer) ||
    getId(review?.userId) ||
    getId(review?.buyerId)
  );
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
  const numericValue = Number(value) || 0;
  const roundedValue = Math.round(numericValue);

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
          type="button"
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
            cursor: interactive ? "pointer" : "default",
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

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ============================================================
// INITIALS
// ============================================================

const getInitials = (name) => {
  const value = String(name || "Buyer").trim();

  if (!value) {
    return "B";
  }

  return value
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
// ERROR MESSAGE
// ============================================================

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
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
    currentUser?.id ||
    null;

  // ==========================================================
  // SELLER CHECK
  // ==========================================================

  const isCurrentUserSeller =
    Boolean(
      currentUserId &&
        sellerId &&
        sameId(
          currentUserId,
          sellerId
        )
    );

  // ==========================================================
  // REVIEW TYPE
  // ==========================================================

  const isProductReviewSection =
    Boolean(productId);

  const reviewType =
    isProductReviewSection
      ? "PRODUCT"
      : "SELLER";

  // ==========================================================
  // FIND CURRENT USER REVIEW
  //
  // PRODUCT REVIEW:
  //   Must belong to THIS product.
  //
  // SELLER REVIEW:
  //   Must NOT have a productId.
  // ==========================================================

  const userReview = useMemo(() => {
    if (!currentUserId) {
      return null;
    }

    if (
      !Array.isArray(reviews) ||
      reviews.length === 0
    ) {
      return null;
    }

    return (
      reviews.find((review) => {
        const reviewerId =
          getReviewUserId(review);

        if (
          !sameId(
            reviewerId,
            currentUserId
          )
        ) {
          return false;
        }

        const reviewProductId =
          getReviewProductId(
            review
          );

        // ------------------------------------------------------
        // PRODUCT REVIEW
        // ------------------------------------------------------

        if (productId) {
          return (
            Boolean(reviewProductId) &&
            sameId(
              reviewProductId,
              productId
            )
          );
        }

        // ------------------------------------------------------
        // SELLER REVIEW
        // ------------------------------------------------------

        return !reviewProductId;
      }) || null
    );
  }, [
    reviews,
    currentUserId,
    productId,
  ]);

  const hasUserReviewed =
    Boolean(userReview);

  // ==========================================================
  // LOAD REVIEWS
  // ==========================================================

  const loadReviews = useCallback(
    async (requestedPage = 1) => {
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

        let response;

        // ====================================================
        // PRODUCT REVIEWS
        // ====================================================

        if (productId) {
          response =
            await getProductReviews(
              productId,
              {
                page: requestedPage,
                limit: 10,
                ...(filterRating
                  ? {
                      rating:
                        filterRating,
                    }
                  : {}),
              }
            );
        }

        // ====================================================
        // SELLER REVIEWS
        // ====================================================

        else if (sellerId) {
          response =
            await getSellerReviews(
              sellerId,
              {
                page: requestedPage,
                limit: 10,
                ...(filterRating
                  ? {
                      rating:
                        filterRating,
                    }
                  : {}),
              }
            );
        }

        // ====================================================
        // INVALID
        // ====================================================

        else {
          setReviews([]);
          setSummary(EMPTY_SUMMARY);
          setTotalPages(1);
          return;
        }

        const data =
          response || {};

        const loadedReviews =
          Array.isArray(
            data.reviews
          )
            ? data.reviews
            : [];

        setReviews(
          loadedReviews
        );

        setSummary(
          data.summary ||
            EMPTY_SUMMARY
        );

        const returnedTotalPages =
          Number(
            data.pagination
              ?.totalPages
          ) || 1;

        setTotalPages(
          returnedTotalPages
        );

        console.log(
          "📝 Reviews loaded:",
          loadedReviews.length
        );

        console.log(
          "📝 Review type:",
          reviewType
        );

        console.log(
          "📝 Product ID:",
          productId ||
            "none"
        );

        console.log(
          "📝 Seller ID:",
          sellerId ||
            "none"
        );
      } catch (err) {
        console.error(
          "❌ Load reviews error:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to load reviews."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [
      sellerId,
      productId,
      filterRating,
      reviewType,
    ]
  );

  // ==========================================================
  // RESET WHEN PRODUCT / SELLER CHANGES
  // ==========================================================

  useEffect(() => {
    setPage(1);
    setReviews([]);
    setSummary(EMPTY_SUMMARY);
    setTotalPages(1);
    setShowForm(false);
    setEditingReviewId(null);
    setSelectedRating(0);
    setComment("");
    setError("");
    setSuccess("");
  }, [
    sellerId,
    productId,
  ]);

  // ==========================================================
  // LOAD WHEN PAGE / FILTER / IDs CHANGE
  // ==========================================================

  useEffect(() => {
    loadReviews(page);
  }, [
    loadReviews,
    page,
  ]);

  // ==========================================================
  // DEBUG
  // ==========================================================

  useEffect(() => {
    console.log(
      "📝 Reviews updated:",
      reviews
    );
  }, [reviews]);

  // ==========================================================
  // CLEAR MESSAGES
  // ==========================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
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
  // START EDITING
  // ==========================================================

  const startEditingReview = (
    review
  ) => {
    if (!review?._id) {
      return;
    }

    clearMessages();

    setEditingReviewId(
      review._id
    );

    setSelectedRating(
      Number(
        review.rating
      ) || 0
    );

    setComment(
      review.comment || ""
    );

    setShowForm(true);

    window.setTimeout(() => {
      const form =
        document.getElementById(
          "buyukused-review-section-form"
        );

      if (form) {
        form.scrollIntoView({
          behavior:
            "smooth",
          block:
            "center",
        });
      }
    }, 50);
  };

  // ==========================================================
  // OPEN REVIEW FORM
  // ==========================================================

  const openReviewForm = () => {
    clearMessages();

    if (
      hasUserReviewed &&
      userReview
    ) {
      startEditingReview(
        userReview
      );

      return;
    }

    setEditingReviewId(
      null
    );

    setSelectedRating(0);

    setComment("");

    setShowForm(
      (value) => !value
    );
  };

  // ==========================================================
  // SUBMIT REVIEW
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    clearMessages();

    // ========================================================
    // AUTH
    // ========================================================

    if (!currentUser) {
      setError(
        "Please log in to write a review."
      );

      return;
    }

    const token =
      getToken();

    if (!token) {
      setError(
        "Your login session has expired. Please log in again."
      );

      return;
    }

    // ========================================================
    // SELLER
    // ========================================================

    if (!sellerId) {
      setError(
        "Seller information is missing."
      );

      return;
    }

    // ========================================================
    // SELLER CANNOT REVIEW SELF
    // ========================================================

    if (
      isCurrentUserSeller
    ) {
      setError(
        "You cannot review your own seller account."
      );

      return;
    }

    // ========================================================
    // RATING
    // ========================================================

    const rating =
      Number(
        selectedRating
      );

    if (
      !Number.isInteger(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      setError(
        "Please select a star rating."
      );

      return;
    }

    // ========================================================
    // COMMENT
    // ========================================================

    const cleanComment =
      String(
        comment || ""
      ).trim();

    if (
      cleanComment.length <
      3
    ) {
      setError(
        "Please write at least 3 characters."
      );

      return;
    }

    if (
      cleanComment.length >
      2000
    ) {
      setError(
        "Review cannot exceed 2000 characters."
      );

      return;
    }

    // ========================================================
    // CLIENT DUPLICATE CHECK
    // ========================================================

    if (
      !editingReviewId &&
      hasUserReviewed &&
      userReview
    ) {
      startEditingReview(
        userReview
      );

      setSuccess(
        productId
          ? "You already reviewed this product. You can edit your review below."
          : "You already reviewed this seller. You can edit your review below."
      );

      return;
    }

    try {
      setSubmitting(true);

      // ======================================================
      // EDIT EXISTING REVIEW
      // ======================================================

      if (
        editingReviewId
      ) {
        console.log(
          "✏️ Updating review:",
          editingReviewId
        );

        const response =
          await updateReview(
            editingReviewId,
            {
              rating,
              comment:
                cleanComment,
            },
            token
          );

        const data =
          response || {};

        setSuccess(
          data.message ||
            "Your review has been updated successfully."
        );

        resetForm();

        setPage(1);

        await loadReviews(1);

        return;
      }

      // ======================================================
      // CREATE NEW REVIEW
      //
      // IMPORTANT:
      //
      // The backend requires:
      //
      // type: "PRODUCT"
      //
      // OR
      //
      // type: "SELLER"
      //
      // ======================================================

      const payload = {
        type: reviewType,
        sellerId,
        rating,
        comment:
          cleanComment,
      };

      // ------------------------------------------------------
      // PRODUCT REVIEW
      // ------------------------------------------------------
      //
      // Only include productId when this is a product review.
      //

      if (
        reviewType ===
        "PRODUCT"
      ) {
        if (!productId) {
          setError(
            "Product information is missing."
          );

          return;
        }

        payload.productId =
          productId;
      }

      // ======================================================
      // DEBUG
      // ======================================================

      console.log(
        "⭐ Creating review"
      );

      console.log(
        "⭐ Review payload:",
        {
          type:
            payload.type,
          sellerId:
            payload.sellerId,
          productId:
            payload.productId ||
            "none",
          rating:
            payload.rating,
          comment:
            payload.comment,
        }
      );

      // ======================================================
      // CREATE
      // ======================================================

      const response =
        await createReview(
          payload,
          token
        );

      const data =
        response || {};

      setSuccess(
        data.message ||
          "Your review has been posted successfully."
      );

      resetForm();

      setPage(1);

      await loadReviews(1);
    } catch (err) {
      console.error(
        "❌ Submit review error:",
        err
      );

      const status =
        err?.response
          ?.status ||
        err?.status;

      const responseData =
        err?.response
          ?.data ||
        err?.data ||
        {};

      const serverMessage =
        responseData?.message ||
        err?.message ||
        "";

      // ======================================================
      // 401
      // ======================================================

      if (
        status === 401
      ) {
        setError(
          "Your login session has expired. Please log in again."
        );

        return;
      }

      // ======================================================
      // 403
      // ======================================================

      if (
        status === 403
      ) {
        setError(
          serverMessage ||
            "You are not allowed to submit this review."
        );

        return;
      }

      // ======================================================
      // 409 CONFLICT
      // ======================================================

      if (
        status === 409
      ) {
        console.warn(
          "⚠️ Review conflict:",
          serverMessage
        );

        // ----------------------------------------------------
        // PRODUCT DUPLICATE
        // ----------------------------------------------------

        if (
          /already reviewed this product/i.test(
            serverMessage
          )
        ) {
          setError(
            "You have already reviewed this product. Your existing review can be edited."
          );

          setPage(1);

          await loadReviews(1);

          return;
        }

        // ----------------------------------------------------
        // SELLER DUPLICATE
        // ----------------------------------------------------

        if (
          /already reviewed this seller/i.test(
            serverMessage
          )
        ) {
          if (
            reviewType ===
            "SELLER"
          ) {
            setError(
              "You have already reviewed this seller. You can edit your existing seller review."
            );

            setPage(1);

            await loadReviews(1);

            return;
          }

          // --------------------------------------------------
          // PRODUCT REVIEW
          //
          // Do NOT turn this into a seller-review duplicate
          // on the frontend.
          // --------------------------------------------------

          setError(
            "The server says you have already reviewed this seller. Product reviews require a separate product-review duplicate rule in the backend."
          );

          return;
        }

        // ----------------------------------------------------
        // GENERIC CONFLICT
        // ----------------------------------------------------

        setError(
          serverMessage ||
            "You already submitted this review."
        );

        setPage(1);

        await loadReviews(1);

        return;
      }

      // ======================================================
      // OTHER ERRORS
      // ======================================================

      setError(
        serverMessage ||
          "Unable to post your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // HELPFUL
  // ==========================================================

  const handleHelpful = async (
    reviewId
  ) => {
    if (!reviewId) {
      return;
    }

    clearMessages();

    const token =
      getToken();

    if (!token) {
      setError(
        "Please log in to mark a review helpful."
      );

      return;
    }

    try {
      setHelpfulId(
        reviewId
      );

      const response =
        await toggleReviewHelpful(
          reviewId,
          token
        );

      const data =
        response || {};

      setReviews(
        (previous) =>
          previous.map(
            (review) => {
              if (
                !sameId(
                  review?._id,
                  reviewId
                )
              ) {
                return review;
              }

              return {
                ...review,

                helpfulCount:
                  data.helpfulCount ??
                  review.helpfulCount ??
                  0,

                hasHelpful:
                  data.helpful ??
                  review.hasHelpful ??
                  false,
              };
            }
          )
      );
    } catch (err) {
      console.error(
        "❌ Helpful error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to update helpful vote."
        )
      );
    } finally {
      setHelpfulId(
        null
      );
    }
  };

  // ==========================================================
  // REPORT
  // ==========================================================

  const handleReport = async (
    reviewId
  ) => {
    if (!reviewId) {
      return;
    }

    clearMessages();

    const token =
      getToken();

    if (!token) {
      setError(
        "Please log in to report a review."
      );

      return;
    }

    try {
      setReportingId(
        reviewId
      );

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
        getErrorMessage(
          err,
          "Unable to report review."
        )
      );
    } finally {
      setReportingId(
        null
      );
    }
  };

  // ==========================================================
  // SELLER REPLY
  // ==========================================================

  const handleReply = async (
    reviewId
  ) => {
    if (!reviewId) {
      return;
    }

    clearMessages();

    const token =
      getToken();

    if (!token) {
      setError(
        "Please log in to reply."
      );

      return;
    }

    const cleanReply =
      String(
        replyText || ""
      ).trim();

    if (
      cleanReply.length <
      2
    ) {
      setError(
        "Please write a reply."
      );

      return;
    }

    if (
      cleanReply.length >
      2000
    ) {
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

      setReviews(
        (previous) =>
          previous.map(
            (review) => {
              if (
                !sameId(
                  review?._id,
                  reviewId
                )
              ) {
                return review;
              }

              return {
                ...review,

                sellerReply:
                  data.sellerReply ||
                  review.sellerReply,
              };
            }
          )
      );

      setReplyText("");

      setReplyingId(
        null
      );

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
        getErrorMessage(
          err,
          "Unable to post reply."
        )
      );
    } finally {
      setReplying(false);
    }
  };

  // ==========================================================
  // RATING PERCENTAGE
  // ==========================================================

  const ratingPercentage = (
    rating
  ) => {
    const total =
      Number(
        summary.totalReviews
      ) || 0;

    if (!total) {
      return 0;
    }

    const count =
      Number(
        summary.breakdown?.[
          rating
        ]
      ) || 0;

    return Math.round(
      (count / total) *
        100
    );
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
        border: "1px solid #e5e7eb",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: "20px",
          flexWrap:
            "wrap",
          marginBottom:
            "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize:
                "24px",
              fontWeight:
                800,
              color:
                "#111827",
            }}
          >
            Reviews
          </h2>

          <p
            style={{
              margin:
                "6px 0 0",
              color:
                "#6b7280",
              fontSize:
                "14px",
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
              onClick={
                openReviewForm
              }
              style={{
                border: "none",
                borderRadius:
                  "999px",
                padding:
                  "11px 18px",
                background:
                  "#111827",
                color: "#fff",
                fontWeight:
                  700,
                cursor:
                  "pointer",
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

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div
          role="alert"
          style={{
            marginBottom:
              "16px",
            padding:
              "12px 14px",
            borderRadius:
              "10px",
            background:
              "#fee2e2",
            color:
              "#991b1b",
            fontSize:
              "14px",
            lineHeight:
              1.5,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          style={{
            marginBottom:
              "16px",
            padding:
              "12px 14px",
            borderRadius:
              "10px",
            background:
              "#dcfce7",
            color:
              "#166534",
            fontSize:
              "14px",
            lineHeight:
              1.5,
          }}
        >
          {success}
        </div>
      )}

      {/* ======================================================
          WRITE / EDIT FORM
      ====================================================== */}

      {showForm && (
        <form
          id="buyukused-review-section-form"
          onSubmit={
            handleSubmit
          }
          style={{
            marginBottom:
              "28px",
            padding:
              "20px",
            borderRadius:
              "14px",
            background:
              "#f9fafb",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              fontSize:
                "18px",
              fontWeight:
                800,
              color:
                "#111827",
            }}
          >
            {editingReviewId
              ? "Edit your review"
              : "Share your experience"}
          </h3>

          {/* RATING */}

          <div
            style={{
              marginBottom:
                "16px",
            }}
          >
            <Stars
              value={
                selectedRating
              }
              size={30}
              interactive
              onChange={
                setSelectedRating
              }
            />

            <div
              style={{
                marginTop:
                  "6px",
                color:
                  "#6b7280",
                fontSize:
                  "13px",
              }}
            >
              {selectedRating
                ? `${selectedRating} out of 5`
                : "Select a rating"}
            </div>
          </div>

          {/* COMMENT */}

          <textarea
            value={
              comment
            }
            onChange={(
              event
            ) =>
              setComment(
                event.target
                  .value
              )
            }
            placeholder="Tell other buyers about your experience..."
            maxLength={2000}
            rows={5}
            disabled={
              submitting
            }
            style={{
              width:
                "100%",
              boxSizing:
                "border-box",
              padding:
                "13px 14px",
              border:
                "1px solid #d1d5db",
              borderRadius:
                "10px",
              resize:
                "vertical",
              fontFamily:
                "inherit",
              fontSize:
                "14px",
              outline:
                "none",
            }}
          />

          {/* FORM FOOTER */}

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginTop:
                "10px",
              gap:
                "12px",
              flexWrap:
                "wrap",
            }}
          >
            <span
              style={{
                color:
                  "#6b7280",
                fontSize:
                  "12px",
              }}
            >
              {comment.length}
              /2000
            </span>

            <div
              style={{
                display:
                  "flex",
                gap:
                  "8px",
              }}
            >
              <button
                type="button"
                onClick={
                  resetForm
                }
                disabled={
                  submitting
                }
                style={{
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "999px",
                  padding:
                    "12px 20px",
                  background:
                    "#fff",
                  color:
                    "#374151",
                  fontWeight:
                    600,
                  cursor:
                    submitting
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting
                }
                style={{
                  border:
                    "none",
                  borderRadius:
                    "999px",
                  padding:
                    "12px 20px",
                  background:
                    "#111827",
                  color:
                    "#fff",
                  fontWeight:
                    700,
                  cursor:
                    submitting
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    submitting
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

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "minmax(150px, 220px) 1fr",
          gap:
            "28px",
          paddingBottom:
            "28px",
          borderBottom:
            "1px solid #e5e7eb",
        }}
      >
        {/* AVERAGE */}

        <div
          style={{
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              fontSize:
                "48px",
              lineHeight:
                1,
              fontWeight:
                800,
              color:
                "#111827",
            }}
          >
            {Number(
              summary.averageRating ||
                0
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
              marginTop:
                "7px",
              color:
                "#6b7280",
              fontSize:
                "14px",
            }}
          >
            {summary.totalReviews ||
              0}{" "}
            {Number(
              summary.totalReviews ||
                0
            ) === 1
              ? "review"
              : "reviews"}
          </div>
        </div>

        {/* BREAKDOWN */}

        <div>
          {[5, 4, 3, 2, 1].map(
            (rating) => {
              const active =
                filterRating ===
                String(
                  rating
                );

              return (
                <button
                  key={
                    rating
                  }
                  type="button"
                  onClick={() => {
                    setFilterRating(
                      active
                        ? ""
                        : String(
                            rating
                          )
                    );

                    setPage(
                      1
                    );
                  }}
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "35px 1fr 42px",
                    alignItems:
                      "center",
                    width:
                      "100%",
                    border:
                      "none",
                    background:
                      active
                        ? "#f9fafb"
                        : "transparent",
                    padding:
                      "4px 6px",
                    borderRadius:
                      "6px",
                    cursor:
                      "pointer",
                    textAlign:
                      "left",
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        "13px",
                      color:
                        "#374151",
                      fontWeight:
                        active
                          ? 700
                          : 400,
                    }}
                  >
                    {rating} ★
                  </span>

                  <div
                    style={{
                      height:
                        "8px",
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
                        height:
                          "100%",
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
                      fontSize:
                        "12px",
                      color:
                        "#6b7280",
                      textAlign:
                        "right",
                    }}
                  >
                    {summary
                      .breakdown?.[
                      rating
                    ] ||
                      0}
                  </span>
                </button>
              );
            }
          )}

          {filterRating && (
            <button
              type="button"
              onClick={() => {
                setFilterRating(
                  ""
                );

                setPage(
                  1
                );
              }}
              style={{
                marginTop:
                  "8px",
                border:
                  "none",
                background:
                  "transparent",
                color:
                  "#2563eb",
                fontSize:
                  "13px",
                fontWeight:
                  700,
                cursor:
                  "pointer",
              }}
            >
              Clear rating filter
            </button>
          )}
        </div>
      </div>

      {/* ======================================================
          REVIEW LIST
      ====================================================== */}

      <div
        style={{
          marginTop:
            "24px",
        }}
      >
        {loading ? (
          <div
            style={{
              padding:
                "40px 0",
              textAlign:
                "center",
              color:
                "#6b7280",
            }}
          >
            Loading reviews...
          </div>
        ) : reviews.length ===
          0 ? (
          <div
            style={{
              padding:
                "40px 0",
              textAlign:
                "center",
              color:
                "#6b7280",
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          reviews.map(
            (review) => {
              const reviewer =
                review?.reviewer;

              const reviewerName =
                reviewer?.name ||
                review?.reviewerName ||
                "Buyer";

              const avatar =
                getAvatar(
                  reviewer
                ) ||
                review?.reviewerAvatar ||
                "";

              const reviewOwner =
                currentUserId &&
                sameId(
                  getReviewUserId(
                    review
                  ),
                  currentUserId
                );

              const canEdit =
                Boolean(
                  reviewOwner &&
                    !isCurrentUserSeller
                );

              const reviewSellerId =
                getReviewSellerId(
                  review
                );

              const canReply =
                isCurrentUserSeller &&
                sameId(
                  reviewSellerId,
                  sellerId
                );

              const helpfulCount =
                Number(
                  review?.helpfulCount
                ) || 0;

              return (
                <article
                  key={
                    review?._id
                  }
                  style={{
                    padding:
                      "22px 0",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  {/* REVIEW HEADER */}

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap:
                        "16px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "12px",
                      }}
                    >
                      {avatar ? (
                        <img
                          src={
                            avatar
                          }
                          alt={
                            reviewerName
                          }
                          style={{
                            width:
                              "44px",
                            height:
                              "44px",
                            borderRadius:
                              "50%",
                            objectFit:
                              "cover",
                            flexShrink:
                              0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width:
                              "44px",
                            height:
                              "44px",
                            borderRadius:
                              "50%",
                            background:
                              "#111827",
                            color:
                              "#fff",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontWeight:
                              800,
                            fontSize:
                              "14px",
                            flexShrink:
                              0,
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
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "8px",
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
                            {
                              reviewerName
                            }
                          </strong>

                          {review
                            ?.verifiedPurchase && (
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
                              ✓ Verified
                              purchase
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "8px",
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
                          border:
                            "none",
                          background:
                            "transparent",
                          color:
                            "#2563eb",
                          fontSize:
                            "13px",
                          fontWeight:
                            700,
                          cursor:
                            "pointer",
                          padding:
                            0,
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* COMMENT */}

                  <p
                    style={{
                      margin:
                        "14px 0",
                      color:
                        "#374151",
                      fontSize:
                        "14px",
                      lineHeight:
                        1.7,
                      whiteSpace:
                        "pre-wrap",
                    }}
                  >
                    {
                      review?.comment
                    }
                  </p>

                  {/* SELLER REPLY */}

                  {review
                    ?.sellerReply
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
                          fontWeight:
                            800,
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
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "16px",
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
                        border:
                          "none",
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
                        padding:
                          0,
                      }}
                    >
                      {helpfulId ===
                      review?._id
                        ? "Updating..."
                        : "👍 Helpful"}

                      {helpfulCount >
                      0
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
                        border:
                          "none",
                        background:
                          "transparent",
                        color:
                          "#9ca3af",
                        cursor:
                          reportingId ===
                          review?._id
                            ? "not-allowed"
                            : "pointer",
                        padding:
                          0,
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

                            setReplyText(
                              ""
                            );
                          }}
                          style={{
                            border:
                              "none",
                            background:
                              "transparent",
                            color:
                              "#2563eb",
                            fontWeight:
                              700,
                            cursor:
                              "pointer",
                            padding:
                              0,
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
                        value={
                          replyText
                        }
                        onChange={(
                          event
                        ) =>
                          setReplyText(
                            event
                              .target
                              .value
                          )
                        }
                        rows={3}
                        maxLength={
                          2000
                        }
                        placeholder="Write a professional response..."
                        disabled={
                          replying
                        }
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          padding:
                            "11px",
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
                          gap:
                            "8px",
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
                            border:
                              "none",
                            borderRadius:
                              "999px",
                            padding:
                              "9px 16px",
                            background:
                              "#111827",
                            color:
                              "#fff",
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

                            setReplyText(
                              ""
                            );
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
                              replying
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            }
          )
        )}
      </div>

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      {totalPages > 1 && (
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            gap:
              "12px",
            marginTop:
              "24px",
          }}
        >
          <button
            type="button"
            disabled={
              page <= 1
            }
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
              borderRadius:
                "8px",
              padding:
                "8px 14px",
              background:
                "#fff",
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
              fontSize:
                "13px",
              color:
                "#6b7280",
            }}
          >
            Page {page} of{" "}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              page >=
              totalPages
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
              borderRadius:
                "8px",
              padding:
                "8px 14px",
              background:
                "#fff",
              cursor:
                page >=
                totalPages
                  ? "not-allowed"
                  : "pointer",
              opacity:
                page >=
                totalPages
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