import React from "react";

/**
 * Reusable star-rating component.
 *
 * Props:
 * - rating: number
 * - maxRating: number
 * - size: string
 * - interactive: boolean
 * - onChange: function
 * - showNumber: boolean
 */
const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = "20px",
  interactive = false,
  onChange,
  showNumber = false,
}) => {
  const safeRating = Math.max(
    0,
    Math.min(Number(rating) || 0, maxRating)
  );

  const handleClick = (value) => {
    if (!interactive || typeof onChange !== "function") {
      return;
    }

    onChange(value);
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
      }}
      aria-label={`${safeRating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const filled = safeRating >= starValue;
        const partial =
          !filled &&
          safeRating > index &&
          safeRating < starValue;

        return (
          <button
            key={starValue}
            type={interactive ? "button" : undefined}
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            aria-label={
              interactive
                ? `Rate ${starValue} star${
                    starValue === 1 ? "" : "s"
                  }`
                : undefined
            }
            style={{
              border: "none",
              background: "transparent",
              padding: interactive ? "2px" : "0",
              margin: 0,
              cursor: interactive
                ? "pointer"
                : "default",
              fontSize: size,
              lineHeight: 1,
              color:
                filled || partial
                  ? "#fbbc04"
                  : "#d1d5db",
              transition:
                "transform 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (interactive) {
                e.currentTarget.style.transform =
                  "scale(1.12)";
              }
            }}
            onMouseLeave={(e) => {
              if (interactive) {
                e.currentTarget.style.transform =
                  "scale(1)";
              }
            }}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}

      {showNumber && (
        <span
          style={{
            marginLeft: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#4b5563",
          }}
        >
          {safeRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;