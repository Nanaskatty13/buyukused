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

  // TV categories
  TVs: "/categories/tv.webp",
  "TV & Game Consoles": "/categories/tv.webp",

  // Game consoles
  "Game Consoles": "/categories/game-consoles.webp",

  // Other categories
  Cars: "/categories/cars.webp",
  "Real Estate": "/categories/real-estate.webp",
  Jobs: "/categories/jobs.webp",
  Fashion: "/categories/fashion.webp",
  Home: "/categories/home.webp",

  Electronics: "/categories/electronics.webp",
  Other: "/categories/Smartwatches.jpg",
};

// ================================================================
// FALLBACK IMAGE
// ================================================================

const fallbackCategoryImage = "/categories/other.webp";

// ================================================================
// MAIN COMPONENT
// ================================================================

const Categories = ({
  products = [],
  onCategorySelect,
}) => {
  // ==============================================================
  // BUILD DYNAMIC CATEGORIES FROM PRODUCTS
  // ==============================================================

  const categoryMap = {};

  products.forEach((p) => {
    if (!p) return;

    const cat = p.category || "Other";

    categoryMap[cat] =
      (categoryMap[cat] || 0) + 1;
  });

  // ==============================================================
  // DEFAULT CATEGORIES
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

  const handleCategoryClick = (catName) => {
    if (onCategorySelect) {
      onCategorySelect(catName);
    }
  };

  // ==============================================================
  // IMAGE ERROR HANDLER
  // ==============================================================

  const handleImageError = (e) => {
    if (
      e.currentTarget.src !==
      window.location.origin +
        fallbackCategoryImage
    ) {
      e.currentTarget.src =
        fallbackCategoryImage;
    }
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
          }}
        >
          See All →
        </Link>
      </div>

      {/* ========================================================
          CATEGORY GRID
      ======================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        {categories.map((cat) => {
          const categoryImage =
            categoryImages[cat.name] ||
            fallbackCategoryImage;

          return (
            <div
              key={cat.name}
              onClick={() =>
                handleCategoryClick(
                  cat.name
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCategoryClick(
                    cat.name
                  );
                }
              }}
              style={{
                background: "#fff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "20px 16px",
                cursor: "pointer",
                transition:
                  "all 0.2s ease",
                textAlign: "center",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "#0066cc";

                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,102,204,0.15)";

                e.currentTarget.style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "#e5e7eb";

                e.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0,0,0,0.05)";

                e.currentTarget.style.transform =
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
                    "0 auto 14px",
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
                  src={categoryImage}
                  alt={cat.name}
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
                }}
              >
                {cat.name}
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
                {cat.count}{" "}
                {cat.count === 1
                  ? "item"
                  : "items"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;