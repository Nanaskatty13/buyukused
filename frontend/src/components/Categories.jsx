// frontend/src/components/Categories.jsx

import React from "react";
import { Link } from "react-router-dom";

// ================================================================
// CATEGORY ICON MAPPING
// ================================================================

const getCategoryIcon = (name) => {
  const icons = {
    Phones: "fa-mobile-alt",
    Laptops: "fa-laptop",
    Tablets: "fa-tablet-alt",
    Accessories: "fa-headphones",

    TVs: "fa-tv",
    "TV & Game Consoles": "fa-tv",
    "Game Consoles": "fa-gamepad",

    Electronics: "fa-laptop",
    Cars: "fa-car",
    "Real Estate": "fa-home",
    Jobs: "fa-briefcase",
    Fashion: "fa-tshirt",
    Home: "fa-couch",
    Other: "fa-tag",
  };

  return icons[name] || "fa-tag";
};

// ================================================================
// CATEGORY IMAGE MAPPING
// ================================================================

const categoryImages = {
  Phones: "/categories/phones.webp",
  Laptops: "/categories/laptops.webp",
  Tablets: "/categories/tablets.webp",
  Accessories: "/categories/accessories.webp",

  // TV
  TVs: "/categories/tv.webp",
  "TV & Game Consoles": "/categories/tv.webp",

  // Game Consoles
  "Game Consoles": "/categories/game-consoles.webp",

  // Other categories
  Cars: "/categories/cars.webp",
  "Real Estate": "/categories/real-estate.webp",
  Jobs: "/categories/jobs.webp",
  Fashion: "/categories/fashion.webp",
  Home: "/categories/home.webp",

  Electronics: "/categories/electronics.webp",

  Other: "/categories/other.webp",
};

// ================================================================
// FALLBACK IMAGE
// ================================================================

const fallbackCategoryImage =
  "/categories/other.webp";

// ================================================================
// MAIN COMPONENT
// ================================================================

const Categories = ({
  products = [],
  onCategorySelect,
}) => {
  // ==============================================================
  // BUILD CATEGORY COUNTS
  // ==============================================================

  const categoryMap = {};

  products.forEach((product) => {
    if (!product) return;

    const category =
      product.category || "Other";

    categoryMap[category] =
      (categoryMap[category] || 0) + 1;
  });

  // ==============================================================
  // FALLBACK CATEGORIES
  // ==============================================================

  const fallbackCategories = [
    "Phones",
    "Laptops",
    "Tablets",
    "Accessories",
    "TVs",
    "Game Consoles",
    "Cars",
    "Real Estate",
    "Jobs",
    "Fashion",
    "Home",
  ];

  // ==============================================================
  // CREATE CATEGORY LIST
  // ==============================================================

  const categories =
    Object.keys(categoryMap).length > 0
      ? Object.keys(categoryMap).map(
          (name) => ({
            name,
            count: categoryMap[name],
            icon: getCategoryIcon(name),
          })
        )
      : fallbackCategories.map(
          (name) => ({
            name,
            count: 0,
            icon: getCategoryIcon(name),
          })
        );

  // ==============================================================
  // CATEGORY CLICK
  // ==============================================================

  const handleCategoryClick = (categoryName) => {
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    }
  };

  // ==============================================================
  // IMAGE ERROR HANDLER
  // ==============================================================

  const handleImageError = (event) => {
    const image = event.currentTarget;

    // Prevent infinite fallback loop
    if (image.dataset.fallback === "true") {
      return;
    }

    image.dataset.fallback = "true";
    image.src = fallbackCategoryImage;
  };

  // ==============================================================
  // RENDER
  // ==============================================================

  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "12px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#333",
            margin: 0,
          }}
        >
          Browse Categories
        </h2>

        <Link
          to="/products"
          style={{
            color: "#0066cc",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          See All →
        </Link>
      </div>

      {/* ========================================================
          CATEGORY GRID

          Desktop = 4
          Tablet  = 3
          Mobile  = 2
      ======================================================== */}

      <div
        className="categories-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "16px",
        }}
      >
        {categories.map((category) => {
          const image =
            categoryImages[
              category.name
            ] || fallbackCategoryImage;

          return (
            <div
              key={category.name}
              onClick={() =>
                handleCategoryClick(
                  category.name
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();

                  handleCategoryClick(
                    category.name
                  );
                }
              }}
              style={{
                background: "#fff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
                cursor: "pointer",
                transition:
                  "all 0.2s ease",
                textAlign: "center",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.05)",
                minWidth: 0,
                overflow: "hidden",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor =
                  "#0066cc";

                event.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,102,204,0.15)";

                event.currentTarget.style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor =
                  "#e5e7eb";

                event.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0,0,0,0.05)";

                event.currentTarget.style.transform =
                  "translateY(0)";
              }}
            >
              {/* ==================================================
                  CATEGORY IMAGE
              ================================================== */}

              <div
                style={{
                  width: "100%",
                  height: "120px",
                  margin:
                    "0 auto 12px",
                  background: "#f4f5f7",
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                }}
              >
                <img
                  src={image}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={
                    handleImageError
                  }
                />
              </div>

              {/* ==================================================
                  CATEGORY NAME
              ================================================== */}

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "4px",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {category.name}
              </div>

              {/* ==================================================
                  ITEM COUNT
              ================================================== */}

              <div
                style={{
                  fontSize: "12px",
                  color: "#777",
                }}
              >
                {category.count}{" "}
                {category.count === 1
                  ? "item"
                  : "items"}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          RESPONSIVE GRID

          Desktop: 4
          Tablet: 3
          Mobile: 2
      ======================================================== */}

      <style>
        {`
          .categories-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          /* ================================================
             TABLET
          ================================================ */

          @media (max-width: 900px) {
            .categories-grid {
              grid-template-columns: repeat(
                3,
                minmax(0, 1fr)
              ) !important;
            }
          }

          /* ================================================
             MOBILE
          ================================================ */

          @media (max-width: 600px) {
            .categories-grid {
              grid-template-columns: repeat(
                2,
                minmax(0, 1fr)
              ) !important;

              gap: 12px !important;
            }
          }

          /* ================================================
             SMALL MOBILE

             STILL EXACTLY 2 PER ROW
          ================================================ */

          @media (max-width: 380px) {
            .categories-grid {
              grid-template-columns: repeat(
                2,
                minmax(0, 1fr)
              ) !important;

              gap: 10px !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default Categories;