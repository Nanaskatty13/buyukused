import React, { useState } from "react";
import RatingStars from "./RatingStars";

const ReviewCard = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onHelpful,
}) => {
  const [helpfulLoading, setHelpfulLoading] =
    useState(false);

  if (!review) {
    return null;
  }

  const reviewer =
    review.user ||
    review.reviewer ||
    {};

  const reviewerId =
    reviewer._id ||
    reviewer.id ||
    review.userId ||
    review.reviewerId;

  const reviewerName =
    review.userName ||
    review.reviewerName ||
    reviewer.name ||
    "Anonymous User";

  const reviewerAvatar =
    review.userAvatar ||
    review.reviewerAvatar ||
    reviewer.avatar ||
    reviewer.photoURL ||
    "";

  const rating =
    Number(review.rating) || 0;

  const comment =
    review.comment ||
    review.text ||
    review.content ||
    "";

  const createdAt =
    review.createdAt ||
    review.date ||
    review.updatedAt;

  const helpfulCount =
    Number(review.helpfulCount) ||
    Number(review.helpful) ||
    0;

  const isOwner =
    currentUserId &&
    reviewerId &&
    String(currentUserId) ===
      String(reviewerId);

  const isVerified =
    review.verifiedBuyer === true ||
    review.isVerified === true ||
    review.verified === true;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      )
    : "";

  const handleHelpful = async () => {
    if (
      helpfulLoading ||
      typeof onHelpful !== "function"
    ) {
      return;
    }

    try {
      setHelpfulLoading(true);
      await onHelpful(review);
    } finally {
      setHelpfulLoading(false);
    }
  };

  return (
    <article
      style={{
        padding: "22px 0",
        borderBottom:
          "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
        }}
      >
        {/* =====================================================
            AVATAR
        ====================================================== */}

        {reviewerAvatar ? (
          <img
            src={reviewerAvatar}
            alt={reviewerName}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              background: "#f3f4f6",
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "17px",
              color: "#374151",
              flexShrink: 0,
            }}
          >
            {reviewerName
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        {/* =====================================================
            REVIEW CONTENT
        ====================================================== */}

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  flexWrap: "wrap",
                }}
              >
                <strong
                  style={{
                    fontSize: "15px",
                    color: "#111827",
                  }}
                >
                  {reviewerName}
                </strong>

                {isVerified && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#166534",
                      background: "#dcfce7",
                      padding:
                        "3px 7px",
                      borderRadius: "999px",
                    }}
                  >
                    ✓ Verified Buyer
                  </span>
                )}
              </div>

              {formattedDate && (
                <div
                  style={{
                    marginTop: "3px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  {formattedDate}
                </div>
              )}
            </div>

            {/* OWNER ACTIONS */}

            {isOwner && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                {typeof onEdit ===
                  "function" && (
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(review)
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color: "#2563eb",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                )}

                {typeof onDelete ===
                  "function" && (
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(review)
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color: "#dc2626",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RATING */}

          <div
            style={{
              marginTop: "9px",
            }}
          >
            <RatingStars
              rating={rating}
              size="17px"
            />
          </div>

          {/* COMMENT */}

          {comment && (
            <p
              style={{
                margin:
                  "11px 0 12px",
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#374151",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {comment}
            </p>
          )}

          {/* HELPFUL */}

          <button
            type="button"
            onClick={handleHelpful}
            disabled={helpfulLoading}
            style={{
              border:
                "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: "999px",
              padding:
                "6px 11px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#4b5563",
              cursor: helpfulLoading
                ? "not-allowed"
                : "pointer",
              opacity:
                helpfulLoading
                  ? 0.6
                  : 1,
            }}
          >
            👍 Helpful
            {helpfulCount > 0
              ? ` (${helpfulCount})`
              : ""}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ReviewCard;