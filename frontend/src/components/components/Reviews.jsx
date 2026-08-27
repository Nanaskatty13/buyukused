// ============================================================
// frontend/src/components/Reviews.jsx
// BuyUKUsed - Google Style Reviews
// ============================================================

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

// ============================================================
// API
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
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
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <button
            key={star}
            type={
              interactive
                ? "button"
                : undefined
            }
            onClick={() =>
              interactive &&
              onChange?.(star)
            }
            disabled={
              !interactive
            }
            aria-label={
              interactive
                ? `${star} star${
                    star > 1
                      ? "s"
                      : ""
                  }`
                : undefined
            }
            style={{
              border: "none",
              background:
                "transparent",
              padding: 0,
              margin: 0,
              cursor: interactive
                ? "pointer"
                : "default",
              fontSize: `${size}px`,
              lineHeight: 1,
              color:
                star <=
                roundedValue
                  ? "#f59e0b"
                  : "#d1d5db",
            }}
          >
            ★
          </button>
        )
      )}
    </div>
  );
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (
  date
) => {
  if (!date) {
    return "";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
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

const getInitials = (
  name
) => {
  return String(
    name || "Buyer"
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase()
    )
    .join("");
};

// ============================================================
// AVATAR
// ============================================================

const getAvatar = (
  reviewer
) => {
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

const Reviews = ({
  sellerId,
  productId,
  sellerName = "Seller",
  currentUser = null,
  showWriteReview = true,
}) => {
  const [reviews, setReviews] =
    useState([]);

  const [summary, setSummary] =
    useState({
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

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [filterRating, setFilterRating] =
    useState("");

  const [reportingId, setReportingId] =
    useState(null);

  const [replyingId, setReplyingId] =
    useState(null);

  const [replyText, setReplyText] =
    useState("");

  // ==========================================================
  // LOAD REVIEWS
  // ==========================================================

  const loadReviews =
    async () => {
      if (!sellerId && !productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: 10,
        };

        if (sellerId) {
          params.sellerId =
            sellerId;
        }

        if (productId) {
          params.productId =
            productId;
        }

        if (filterRating) {
          params.rating =
            filterRating;
        }

        const response =
          await axios.get(
            `${API_URL}/api/reviews`,
            {
              params,
              timeout: 30000,
            }
          );

        const data =
          response.data;

        setReviews(
          Array.isArray(
            data?.reviews
          )
            ? data.reviews
            : []
        );

        setSummary(
          data?.summary || {
            averageRating: 0,
            totalReviews: 0,
            breakdown: {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0,
            },
          }
        );

        setTotalPages(
          data?.pagination
            ?.totalPages || 1
        );
      } catch (err) {
        console.error(
          "❌ Load reviews error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to load reviews."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadReviews();
  }, [
    sellerId,
    productId,
    page,
    filterRating,
  ]);

  // ==========================================================
  // PERCENTAGE
  // ==========================================================

  const ratingPercentage =
    (rating) => {
      const total =
        summary.totalReviews ||
        0;

      if (!total) {
        return 0;
      }

      return Math.round(
        ((summary.breakdown?.[
          rating
        ] || 0) /
          total) *
          100
      );
    };

  // ==========================================================
  // SUBMIT REVIEW
  // ==========================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      if (!currentUser) {
        setError(
          "Please log in to write a review."
        );

        return;
      }

      if (!selectedRating) {
        setError(
          "Please select a star rating."
        );

        return;
      }

      if (
        comment.trim().length <
        3
      ) {
        setError(
          "Please write at least 3 characters."
        );

        return;
      }

      if (!sellerId) {
        setError(
          "Seller information is missing."
        );

        return;
      }

      try {
        setSubmitting(true);

        const token =
          getToken();

        if (!token) {
          setError(
            "Your login session has expired. Please log in again."
          );

          return;
        }

        const payload = {
          sellerId,
          rating:
            selectedRating,
          comment:
            comment.trim(),
        };

        if (productId) {
          payload.productId =
            productId;
        }

        const response =
          await axios.post(
            `${API_URL}/api/reviews`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              timeout: 30000,
            }
          );

        if (
          response.data?.success
        ) {
          setSuccess(
            "Your review has been posted successfully."
          );

          setComment("");
          setSelectedRating(0);
          setShowForm(false);
          setPage(1);

          await loadReviews();
        }
      } catch (err) {
        console.error(
          "❌ Submit review error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to post your review."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ==========================================================
  // HELPFUL
  // ==========================================================

  const handleHelpful =
    async (reviewId) => {
      const token =
        getToken();

      if (!token) {
        setError(
          "Please log in to mark a review helpful."
        );

        return;
      }

      try {
        const response =
          await axios.post(
            `${API_URL}/api/reviews/${reviewId}/helpful`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          response.data;

        setReviews(
          (previous) =>
            previous.map(
              (review) =>
                review._id ===
                reviewId
                  ? {
                      ...review,
                      helpfulCount:
                        data.helpfulCount,
                      hasHelpful:
                        data.helpful,
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
          err.response?.data
            ?.message ||
            "Unable to update helpful vote."
        );
      }
    };

  // ==========================================================
  // REPORT
  // ==========================================================

  const handleReport =
    async (reviewId) => {
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

        await axios.post(
          `${API_URL}/api/reviews/${reviewId}/report`,
          {
            reason:
              "Inappropriate or misleading review",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess(
          "Thank you. The review has been reported."
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to report review."
        );
      } finally {
        setReportingId(null);
      }
    };

  // ==========================================================
  // SELLER REPLY
  // ==========================================================

  const handleReply =
    async (reviewId) => {
      const token =
        getToken();

      if (!token) {
        setError(
          "Please log in."
        );

        return;
      }

      if (
        !replyText.trim()
      ) {
        return;
      }

      try {
        const response =
          await axios.post(
            `${API_URL}/api/reviews/${reviewId}/reply`,
            {
              text:
                replyText.trim(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setReviews(
          (previous) =>
            previous.map(
              (review) =>
                review._id ===
                reviewId
                  ? {
                      ...review,
                      sellerReply:
                        response
                          .data
                          ?.sellerReply,
                    }
                  : review
            )
        );

        setReplyText("");
        setReplyingId(null);
        setSuccess(
          "Reply posted successfully."
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to post reply."
        );
      }
    };

  // ==========================================================
  // CURRENT USER ID
  // ==========================================================

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  // ==========================================================
  // SELLER ID FROM CURRENT USER
  // ==========================================================

  const isCurrentUserSeller =
    currentUserId &&
    sellerId &&
    String(
      currentUserId
    ) === String(sellerId);

  // ==========================================================
  // EMPTY STATE
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
              margin:
                "6px 0 0",
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
              onClick={() =>
                setShowForm(
                  (value) =>
                    !value
                )
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
                fontWeight: 700,
                cursor:
                  "pointer",
              }}
            >
              {showForm
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
            color: "#991b1b",
            fontSize:
              "14px",
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
            color: "#166534",
            fontSize:
              "14px",
          }}
        >
          {success}
        </div>
      )}

      {/* ======================================================
          WRITE REVIEW
      ====================================================== */}

      {showForm && (
        <form
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
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            Share your experience
          </h3>

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

          <textarea
            value={comment}
            onChange={(e) =>
              setComment(
                e.target.value
              )
            }
            placeholder="Tell other buyers about your experience..."
            maxLength={2000}
            rows={5}
            disabled={
              submitting
            }
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              padding:
                "13px 14px",
              border:
                "1px solid #d1d5db",
              borderRadius:
                "10px",
              resize: "vertical",
              fontFamily:
                "inherit",
              fontSize:
                "14px",
              outline:
                "none",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginTop:
                "10px",
              gap: "12px",
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

            <button
              type="submit"
              disabled={
                submitting
              }
              style={{
                border: "none",
                borderRadius:
                  "999px",
                padding:
                  "12px 20px",
                background:
                  "#111827",
                color: "#fff",
                fontWeight: 700,
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
                ? "Posting..."
                : "Post review"}
            </button>
          </div>
        </form>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(150px, 220px) 1fr",
          gap: "28px",
          paddingBottom:
            "28px",
          borderBottom:
            "1px solid #e5e7eb",
        }}
      >
        {/* OVERALL */}

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
              lineHeight: 1,
              fontWeight: 800,
              color: "#111827",
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
            {summary.totalReviews}{" "}
            {summary.totalReviews ===
            1
              ? "review"
              : "reviews"}
          </div>
        </div>

        {/* BREAKDOWN */}

        <div>
          {[5, 4, 3, 2, 1].map(
            (rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => {
                  setFilterRating(
                    filterRating ===
                      String(
                        rating
                      )
                      ? ""
                      : String(
                          rating
                        )
                  );

                  setPage(1);
                }}
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "35px 1fr 42px",
                  alignItems:
                    "center",
                  width: "100%",
                  border: "none",
                  background:
                    "transparent",
                  padding:
                    "4px 0",
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
                  ] || 0}
                </span>
              </button>
            )
          )}

          {filterRating && (
            <button
              type="button"
              onClick={() => {
                setFilterRating(
                  ""
                );
                setPage(1);
              }}
              style={{
                marginTop:
                  "8px",
                border: "none",
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
                review.reviewer;

              const reviewerName =
                reviewer?.name ||
                review.reviewerName ||
                "Buyer";

              const avatar =
                getAvatar(
                  reviewer
                ) ||
                review.reviewerAvatar;

              const isSellerReview =
                isCurrentUserSeller;

              return (
                <article
                  key={
                    review._id
                  }
                  style={{
                    padding:
                      "22px 0",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        gap: "12px",
                      }}
                    >
                      {/* AVATAR */}

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
                            {
                              reviewerName
                            }
                          </strong>

                          {review.verifiedPurchase && (
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
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                            marginTop:
                              "4px",
                          }}
                        >
                          <Stars
                            value={
                              review.rating
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
                              review.createdAt
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
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
                      review.comment
                    }
                  </p>

                  {/* SELLER REPLY */}

                  {review.sellerReply
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
                      gap: "16px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleHelpful(
                          review._id
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        color:
                          review.hasHelpful
                            ? "#111827"
                            : "#6b7280",
                        fontWeight:
                          review.hasHelpful
                            ? 800
                            : 500,
                        cursor:
                          "pointer",
                        padding: 0,
                      }}
                    >
                      👍 Helpful
                      {review.helpfulCount
                        ? ` (${review.helpfulCount})`
                        : ""}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleReport(
                          review._id
                        )
                      }
                      disabled={
                        reportingId ===
                        review._id
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        color:
                          "#9ca3af",
                        cursor:
                          "pointer",
                        padding: 0,
                        fontSize:
                          "13px",
                      }}
                    >
                      {reportingId ===
                      review._id
                        ? "Reporting..."
                        : "Report"}
                    </button>

                    {isSellerReview &&
                      !review
                        .sellerReply
                        ?.text && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingId(
                              review._id
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
                            padding: 0,
                          }}
                        >
                          Reply
                        </button>
                      )}
                  </div>

                  {/* REPLY FORM */}

                  {replyingId ===
                    review._id && (
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
                          e
                        ) =>
                          setReplyText(
                            e.target
                              .value
                          )
                        }
                        rows={3}
                        maxLength={
                          2000
                        }
                        placeholder="Write a professional response..."
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
                          gap: "8px",
                          marginTop:
                            "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleReply(
                              review._id
                            )
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
                              "pointer",
                          }}
                        >
                          Post reply
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
            gap: "12px",
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
                  value - 1
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
                  value + 1
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

export default Reviews;