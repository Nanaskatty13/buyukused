import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import RatingStars from "./RatingStars";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

// ============================================================
// HELPERS
// ============================================================

const getCurrentUser = () => {
  try {
    const possibleKeys = [
      "user",
      "currentUser",
      "authUser",
    ];

    for (const key of possibleKeys) {
      const raw =
        localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed =
        JSON.parse(raw);

      if (parsed) {
        return parsed?.user || parsed;
      }
    }
  } catch (error) {
    console.warn(
      "Unable to read current user:",
      error
    );
  }

  return null;
};

const getAuthToken = () => {
  const keys = [
    "token",
    "authToken",
    "accessToken",
    "jwt",
  ];

  for (const key of keys) {
    const token =
      localStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  return null;
};

const getReviewId = (review) =>
  review?._id ||
  review?.id ||
  null;

// ============================================================
// REVIEW SECTION
// ============================================================

const ReviewSection = ({
  productId,
  user = null,
}) => {
  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingReview, setEditingReview] =
    useState(null);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalReviews, setTotalReviews] =
    useState(0);

  const [summary, setSummary] =
    useState(null);

  const [currentUser, setCurrentUser] =
    useState(user);

  // ==========================================================
  // CURRENT USER
  // ==========================================================

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      return;
    }

    setCurrentUser(
      getCurrentUser()
    );
  }, [user]);

  // ==========================================================
  // FETCH REVIEWS
  // ==========================================================

  const fetchReviews =
    useCallback(
      async () => {
        if (!productId) {
          setReviews([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await axios.get(
              `${API_URL}/api/reviews/product/${encodeURIComponent(
                productId
              )}`,
              {
                params: {
                  page,
                  limit: 10,
                },
                timeout: 30000,
              }
            );

          const data =
            response.data || {};

          /*
           Expected backend response:

           {
             success: true,
             reviews: [],
             totalReviews: 10,
             totalPages: 1,
             summary: {
               averageRating: 4.5,
               totalReviews: 10,
               distribution: {
                 5: 7,
                 4: 2,
                 3: 1,
                 2: 0,
                 1: 0
               }
             }
           }
          */

          setReviews(
            Array.isArray(
              data.reviews
            )
              ? data.reviews
              : []
          );

          setTotalReviews(
            Number(
              data.totalReviews
            ) ||
              Number(
                data.pagination
                  ?.total
              ) ||
              0
          );

          setTotalPages(
            Number(
              data.totalPages
            ) ||
              Number(
                data.pagination
                  ?.totalPages
              ) ||
              1
          );

          setSummary(
            data.summary ||
              data.ratingSummary ||
              null
          );
        } catch (err) {
          console.error(
            "❌ Failed to load reviews:",
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
      },
      [productId, page]
    );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ==========================================================
  // CALCULATE SUMMARY LOCALLY IF NECESSARY
  // ==========================================================

  const calculatedSummary =
    useMemo(() => {
      if (summary) {
        return summary;
      }

      if (!reviews.length) {
        return {
          averageRating: 0,
          totalReviews:
            totalReviews || 0,
          distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
        };
      }

      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      let totalRating = 0;

      reviews.forEach(
        (review) => {
          const rating = Math.max(
            1,
            Math.min(
              5,
              Math.round(
                Number(
                  review.rating
                ) || 0
              )
            )
          );

          distribution[rating] +=
            1;

          totalRating +=
            Number(
              review.rating
            ) || 0;
        }
      );

      return {
        averageRating:
          totalRating /
          reviews.length,
        totalReviews:
          totalReviews ||
          reviews.length,
        distribution,
      };
    }, [
      summary,
      reviews,
      totalReviews,
    ]);

  const averageRating =
    Number(
      calculatedSummary
        ?.averageRating
    ) || 0;

  const distribution =
    calculatedSummary
      ?.distribution || {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

  // ==========================================================
  // AUTH HEADERS
  // ==========================================================

  const getHeaders = () => {
    const token =
      getAuthToken();

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // ==========================================================
  // SUBMIT REVIEW
  // ==========================================================

  const handleSubmitReview =
    async (reviewData) => {
      try {
        setSubmitting(true);
        setError("");
        setSuccess("");

        const token =
          getAuthToken();

        if (!token) {
          throw new Error(
            "Please log in to submit a review."
          );
        }

        const isEditing =
          Boolean(
            reviewData.reviewId
          );

        const endpoint = isEditing
          ? `${API_URL}/api/reviews/${encodeURIComponent(
              reviewData.reviewId
            )}`
          : `${API_URL}/api/reviews`;

        const method = isEditing
          ? "put"
          : "post";

        const response =
          await axios({
            method,
            url: endpoint,
            data: {
              productId:
                productId,
              rating:
                reviewData.rating,
              comment:
                reviewData.comment,
            },
            headers: {
              ...getHeaders(),
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            timeout: 30000,
          });

        const message =
          response.data?.message ||
          (isEditing
            ? "Review updated successfully."
            : "Review posted successfully.");

        setSuccess(message);

        setShowForm(false);
        setEditingReview(null);

        await fetchReviews();
      } catch (err) {
        console.error(
          "❌ Review submission error:",
          err
        );

        throw new Error(
          err.response?.data
            ?.message ||
            err.message ||
            "Unable to submit review."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ==========================================================
  // EDIT REVIEW
  // ==========================================================

  const handleEditReview =
    (review) => {
      setError("");
      setSuccess("");
      setEditingReview(review);
      setShowForm(true);

      window.setTimeout(() => {
        document
          .getElementById(
            "review-form-section"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 50);
    };

  // ==========================================================
  // DELETE REVIEW
  // ==========================================================

  const handleDeleteReview =
    async (review) => {
      const reviewId =
        getReviewId(review);

      if (!reviewId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete your review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        const token =
          getAuthToken();

        if (!token) {
          setError(
            "Please log in again."
          );
          return;
        }

        const response =
          await axios.delete(
            `${API_URL}/api/reviews/${encodeURIComponent(
              reviewId
            )}`,
            {
              headers:
                getHeaders(),
              timeout: 30000,
            }
          );

        setSuccess(
          response.data?.message ||
            "Review deleted successfully."
        );

        await fetchReviews();
      } catch (err) {
        console.error(
          "❌ Delete review error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to delete review."
        );
      }
    };

  // ==========================================================
  // HELPFUL
  // ==========================================================

  const handleHelpful =
    async (review) => {
      const reviewId =
        getReviewId(review);

      if (!reviewId) {
        return;
      }

      try {
        const token =
          getAuthToken();

        if (!token) {
          setError(
            "Please log in to mark a review as helpful."
          );
          return;
        }

        await axios.post(
          `${API_URL}/api/reviews/${encodeURIComponent(
            reviewId
          )}/helpful`,
          {},
          {
            headers:
              getHeaders(),
            timeout: 30000,
          }
        );

        await fetchReviews();
      } catch (err) {
        console.error(
          "❌ Helpful review error:",
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
  // CANCEL EDIT
  // ==========================================================

  const handleCancelForm =
    () => {
      setShowForm(false);
      setEditingReview(null);
      setError("");
    };

  // ==========================================================
  // RATING DISTRIBUTION
  // ==========================================================

  const getPercentage =
    (star) => {
      const count =
        Number(
          distribution?.[star]
        ) || 0;

      const total =
        Number(
          calculatedSummary
            ?.totalReviews
        ) ||
        totalReviews ||
        0;

      if (!total) {
        return 0;
      }

      return Math.round(
        (count / total) * 100
      );
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  if (!productId) {
    return null;
  }

  return (
    <section
      id="reviews"
      style={{
        width: "100%",
        marginTop: "40px",
        paddingTop: "30px",
        borderTop:
          "1px solid #e5e7eb",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "26px",
              lineHeight: 1.2,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Customer Reviews
          </h2>

          <p
            style={{
              margin:
                "7px 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            See what customers think
            about this product.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              setError(
                "Please log in to write a review."
              );
              return;
            }

            setEditingReview(null);
            setShowForm(true);
            setError("");
            setSuccess("");

            window.setTimeout(() => {
              document
                .getElementById(
                  "review-form-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
            }, 50);
          }}
          style={{
            border: "none",
            borderRadius: "999px",
            padding:
              "11px 18px",
            background: "#111827",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ★ Write a Review
        </button>
      </div>

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div
          role="status"
          style={{
            background: "#dcfce7",
            border:
              "1px solid #bbf7d0",
            color: "#166534",
            padding:
              "11px 13px",
            borderRadius: "9px",
            fontSize: "13px",
            marginBottom: "18px",
          }}
        >
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          role="alert"
          style={{
            background: "#fee2e2",
            border:
              "1px solid #fecaca",
            color: "#991b1b",
            padding:
              "11px 13px",
            borderRadius: "9px",
            fontSize: "13px",
            marginBottom: "18px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          REVIEW FORM
      ====================================================== */}

      {showForm && (
        <div
          id="review-form-section"
        >
          <ReviewForm
            productId={productId}
            existingReview={
              editingReview
            }
            onSubmit={
              handleSubmitReview
            }
            onCancel={
              handleCancelForm
            }
            loading={submitting}
          />
        </div>
      )}

      {/* =====================================================
          RATING SUMMARY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(180px, 0.8fr) minmax(280px, 1.5fr)",
          gap: "30px",
          padding: "25px",
          background: "#fafafa",
          border:
            "1px solid #e5e7eb",
          borderRadius: "14px",
          marginBottom: "25px",
        }}
      >
        {/* OVERALL RATING */}

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            justifyContent:
              "center",
            alignItems:
              "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "46px",
              lineHeight: 1,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            {averageRating
              ? averageRating.toFixed(
                  1
                )
              : "0.0"}
          </div>

          <div
            style={{
              marginTop: "8px",
            }}
          >
            <RatingStars
              rating={
                averageRating
              }
              size="22px"
            />
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            {Number(
              calculatedSummary
                ?.totalReviews
            ) || 0}{" "}
            {Number(
              calculatedSummary
                ?.totalReviews
            ) === 1
              ? "review"
              : "reviews"}
          </div>
        </div>

        {/* DISTRIBUTION */}

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            justifyContent:
              "center",
            gap: "9px",
          }}
        >
          {[5, 4, 3, 2, 1].map(
            (star) => {
              const count =
                Number(
                  distribution?.[
                    star
                  ]
                ) || 0;

              const percentage =
                getPercentage(
                  star
                );

              return (
                <div
                  key={star}
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "48px 1fr 40px",
                    alignItems:
                      "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        "12px",
                      fontWeight:
                        600,
                      color:
                        "#4b5563",
                    }}
                  >
                    {star} star
                  </span>

                  <div
                    style={{
                      height:
                        "8px",
                      borderRadius:
                        "999px",
                      background:
                        "#e5e7eb",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height:
                          "100%",
                        background:
                          "#fbbc04",
                        borderRadius:
                          "999px",
                        transition:
                          "width 0.3s ease",
                      }}
                    />
                  </div>

                  <span
                    style={{
                      textAlign:
                        "right",
                      fontSize:
                        "12px",
                      color:
                        "#6b7280",
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div
          style={{
            padding:
              "30px 10px",
            textAlign:
              "center",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Loading reviews...
        </div>
      )}

      {/* =====================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        reviews.length === 0 && (
          <div
            style={{
              textAlign:
                "center",
              padding:
                "35px 20px",
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "12px",
              background:
                "#fff",
            }}
          >
            <div
              style={{
                fontSize:
                  "30px",
                marginBottom:
                  "8px",
              }}
            >
              ☆
            </div>

            <h3
              style={{
                margin:
                  "0 0 6px",
                fontSize:
                  "17px",
                color:
                  "#111827",
              }}
            >
              No reviews yet
            </h3>

            <p
              style={{
                margin: 0,
                color:
                  "#6b7280",
                fontSize:
                  "13px",
              }}
            >
              Be the first customer
              to review this product.
            </p>
          </div>
        )}

      {/* =====================================================
          REVIEWS
      ====================================================== */}

      {!loading &&
        reviews.length > 0 && (
          <div>
            {reviews.map(
              (review) => (
                <ReviewCard
                  key={
                    getReviewId(
                      review
                    ) ||
                    Math.random()
                  }
                  review={
                    review
                  }
                  currentUserId={
                    currentUser?._id ||
                    currentUser?.id
                  }
                  onEdit={
                    handleEditReview
                  }
                  onDelete={
                    handleDeleteReview
                  }
                  onHelpful={
                    handleHelpful
                  }
                />
              )
            )}
          </div>
        )}

      {/* =====================================================
          PAGINATION
      ====================================================== */}

      {!loading &&
        reviews.length > 0 &&
        totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
              gap: "12px",
              marginTop:
                "25px",
            }}
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
              style={{
                border:
                  "1px solid #d1d5db",
                background:
                  "#fff",
                borderRadius:
                  "8px",
                padding:
                  "8px 13px",
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
                  (current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                )
              }
              style={{
                border:
                  "1px solid #d1d5db",
                background:
                  "#fff",
                borderRadius:
                  "8px",
                padding:
                  "8px 13px",
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