import React, {
  useEffect,
  useState,
} from "react";
import RatingStars from "./RatingStars";

const ReviewForm = ({
  productId,
  existingReview = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [rating, setRating] =
    useState(
      Number(existingReview?.rating) ||
        0
    );

  const [comment, setComment] =
    useState(
      existingReview?.comment ||
        existingReview?.text ||
        ""
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    setRating(
      Number(existingReview?.rating) ||
        0
    );

    setComment(
      existingReview?.comment ||
        existingReview?.text ||
        ""
    );

    setError("");
  }, [existingReview]);

  const isEditing =
    Boolean(existingReview);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!productId) {
      setError(
        "Product information is missing."
      );
      return;
    }

    if (!rating || rating < 1) {
      setError(
        "Please select a star rating."
      );
      return;
    }

    const trimmedComment =
      comment.trim();

    if (!trimmedComment) {
      setError(
        "Please write a review."
      );
      return;
    }

    if (trimmedComment.length < 5) {
      setError(
        "Your review must be at least 5 characters."
      );
      return;
    }

    if (trimmedComment.length > 2000) {
      setError(
        "Your review cannot exceed 2,000 characters."
      );
      return;
    }

    if (
      typeof onSubmit !==
      "function"
    ) {
      setError(
        "Review submission is not available."
      );
      return;
    }

    try {
      await onSubmit({
        productId,
        rating,
        comment: trimmedComment,
        reviewId:
          existingReview?._id ||
          existingReview?.id ||
          null,
      });
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Unable to submit your review."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        border:
          "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "22px",
        marginBottom: "25px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "15px",
          marginBottom: "18px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 750,
            color: "#111827",
          }}
        >
          {isEditing
            ? "Edit your review"
            : "Write a review"}
        </h3>

        {isEditing &&
          typeof onCancel ===
            "function" && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                border: "none",
                background:
                  "transparent",
                color: "#6b7280",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
          )}
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          role="alert"
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            border:
              "1px solid #fecaca",
            padding:
              "10px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          RATING
      ====================================================== */}

      <div
        style={{
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 700,
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Your rating
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <RatingStars
            rating={rating}
            interactive
            onChange={setRating}
            size="30px"
          />

          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            {rating === 0
              ? "Select rating"
              : `${rating}/5`}
          </span>
        </div>
      </div>

      {/* =====================================================
          COMMENT
      ====================================================== */}

      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <label
          htmlFor="review-comment"
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 700,
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Your review
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          placeholder="Share your experience with this product..."
          rows={5}
          maxLength={2000}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            resize: "vertical",
            border:
              "1px solid #d1d5db",
            borderRadius: "9px",
            padding: "12px",
            fontFamily: "inherit",
            fontSize: "14px",
            lineHeight: 1.6,
            outline: "none",
          }}
        />

        <div
          style={{
            textAlign: "right",
            marginTop: "5px",
            fontSize: "11px",
            color: "#9ca3af",
          }}
        >
          {comment.length}/2000
        </div>
      </div>

      {/* =====================================================
          SUBMIT
      ====================================================== */}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          border: "none",
          borderRadius: "9px",
          padding: "12px 16px",
          background: "#111827",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 700,
          cursor: loading
            ? "not-allowed"
            : "pointer",
          opacity: loading
            ? 0.65
            : 1,
        }}
      >
        {loading
          ? "Submitting..."
          : isEditing
          ? "Update Review"
          : "Post Review"}
      </button>
    </form>
  );
};

export default ReviewForm;