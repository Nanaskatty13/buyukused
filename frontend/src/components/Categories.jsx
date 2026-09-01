// frontend/src/components/Categories.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";

// ================================================================
// NORMALIZE CATEGORY
// ================================================================

const normalizeCategory = (category) => {
  if (!category) return "Other";

  const value = String(category)
    .trim()
    .toLowerCase();

  // ==============================================================
  // PHONES
  // ==============================================================

  if (
    [
      "phone",
      "phones",
      "mobile",
      "mobiles",
      "mobile phone",
      "mobile phones",
      "smartphone",
      "smartphones",
      "cell phone",
      "cell phones",
      "cellphone",
      "cellphones",
    ].includes(value)
  ) {
    return "Phones";
  }

  // ==============================================================
  // LAPTOPS
  // ==============================================================

  if (
    [
      "laptop",
      "laptops",
      "macbook",
      "macbooks",
      "notebook",
      "notebooks",
    ].includes(value)
  ) {
    return "Laptops";
  }

  // ==============================================================
  // TABLETS
  // ==============================================================

  if (
    [
      "tablet",
      "tablets",
      "ipad",
      "ipads",
    ].includes(value)
  ) {
    return "Tablets";
  }

  // ==============================================================
  // TVS
  // ==============================================================

  if (
    [
      "tv",
      "tvs",
      "television",
      "televisions",
      "smart tv",
      "smart tvs",
    ].includes(value)
  ) {
    return "TVs";
  }

  // ==============================================================
  // GAME CONSOLES
  // ==============================================================

  if (
    [
      "game console",
      "game consoles",
      "console",
      "consoles",
      "gaming console",
      "gaming consoles",
      "playstation",
      "xbox",
      "nintendo",
    ].includes(value)
  ) {
    return "Game Consoles";
  }

  // ==============================================================
  // ACCESSORIES
  // ==============================================================

  if (
    [
      "accessory",
      "accessories",
    ].includes(value)
  ) {
    return "Accessories";
  }

  // ==============================================================
  // CARS
  // ==============================================================

  if (
    [
      "car",
      "cars",
      "auto",
      "automobile",
      "automobiles",
      "vehicle",
      "vehicles",
    ].includes(value)
  ) {
    return "Cars";
  }

  // ==============================================================
  // REAL ESTATE
  // ==============================================================

  if (
    [
      "real estate",
      "property",
      "properties",
      "land",
      "house",
      "houses",
      "apartment",
      "apartments",
    ].includes(value)
  ) {
    return "Real Estate";
  }

  // ==============================================================
  // JOBS
  // ==============================================================

  if (
    [
      "job",
      "jobs",
      "employment",
      "work",
    ].includes(value)
  ) {
    return "Jobs";
  }

  // ==============================================================
  // FASHION
  // ==============================================================

  if (
    [
      "fashion",
      "clothing",
      "clothes",
      "shoes",
      "wear",
    ].includes(value)
  ) {
    return "Fashion";
  }

  // ==============================================================
  // HOME
  // ==============================================================

  if (
    [
      "home",
      "furniture",
      "home & garden",
      "home and garden",
    ].includes(value)
  ) {
    return "Home";
  }

  return "Other";
};

// ================================================================
// CATEGORY ICONS
// ================================================================

const getCategoryIcon = (name) => {
  const icons = {
    Phones: "fa-mobile-alt",
    Laptops: "fa-laptop",
    Tablets: "fa-tablet-alt",
    Accessories: "fa-headphones",

    TVs: "fa-tv",
    "Game Consoles": "fa-gamepad",

    Cars: "fa-car",
    "Real Estate": "fa-home",
    Jobs: "fa-briefcase",
    Fashion: "fa-tshirt",
    Home: "fa-couch",

    Electronics: "fa-laptop",
    Other: "fa-tag",
  };

  return icons[name] || "fa-tag";
};

// ================================================================
// CATEGORY IMAGES
// ================================================================

const categoryImages = {
  Phones: "/categories/phones.webp",
  Laptops: "/categories/laptops.webp",
  Tablets: "/categories/tablets.webp",
  Accessories: "/categories/accessories.webp",

  TVs: "/categories/tv.webp",

  "Game Consoles":
    "/categories/game-consoles.webp",

  Cars: "/categories/cars.webp",

  "Real Estate":
    "/categories/real-estate.webp",

  Jobs: "/categories/jobs.webp",

  Fashion:
    "/categories/fashion.webp",

  Home:
    "/categories/home.webp",

  Electronics:
    "/categories/electronics.webp",

  Other:
    "/categories/other.webp",
};

// ================================================================
// FALLBACK IMAGE
// ================================================================

const fallbackCategoryImage =
  "/categories/other.webp";

// ================================================================
// DEFAULT CATEGORIES
// ================================================================

const defaultCategories = [
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

// ================================================================
// MAIN COMPONENT
// ================================================================

const Categories = ({
  products = [],
  onCategorySelect,
}) => {
  const navigate = useNavigate();

  // ==============================================================
  // CATEGORY COUNTS
  // ==============================================================

  const categoryMap = {};

  // --------------------------------------------------------------
  // ALWAYS CREATE THE MAIN CATEGORIES
  // --------------------------------------------------------------

  defaultCategories.forEach((category) => {
    categoryMap[category] = 0;
  });

  // --------------------------------------------------------------
  // COUNT PRODUCTS
  // --------------------------------------------------------------

  if (Array.isArray(products)) {
    products.forEach((product) => {
      if (!product) return;

      const normalizedCategory =
        normalizeCategory(
          product.category
        );

      categoryMap[
        normalizedCategory
      ] =
        (categoryMap[
          normalizedCategory
        ] || 0) + 1;
    });
  }

  // ==============================================================
  // CREATE CATEGORY OBJECTS
  // ==============================================================

  const categories =
    defaultCategories.map(
      (name) => ({
        name,
        count:
          categoryMap[name] || 0,
        icon:
          getCategoryIcon(name),
      })
    );

  // ==============================================================
  // CATEGORY CLICK – navigates to products page
  // ==============================================================

  const handleCategoryClick = (
    categoryName
  ) => {
    // ------------------------------------------------------------
    // Keep existing callback if supplied
    // ------------------------------------------------------------

    if (onCategorySelect) {
      onCategorySelect(
        categoryName
      );

      return;
    }

    // ------------------------------------------------------------
    // Otherwise go directly to products page with category filter
    // ------------------------------------------------------------

    navigate(
      `/products?category=${encodeURIComponent(
        categoryName
      )}`
    );
  };

  // ==============================================================
  // IMAGE ERROR
  // ==============================================================

  const handleImageError = (
    event
  ) => {
    const image =
      event.currentTarget;

    if (
      image.dataset.fallback ===
      "true"
    ) {
      return;
    }

    image.dataset.fallback =
      "true";

    image.src =
      fallbackCategoryImage;
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
          justifyContent:
            "space-between",
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
            textDecoration:
              "none",
            fontWeight: 600,
            fontSize: "14px",
            whiteSpace:
              "nowrap",
          }}
        >
          See All →
        </Link>
      </div>

      {/* ========================================================
          CATEGORY GRID
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
        {categories.map(
          (category) => {
            const image =
              categoryImages[
                category.name
              ] ||
              fallbackCategoryImage;

            return (
              <div
                key={
                  category.name
                }
                onClick={() =>
                  handleCategoryClick(
                    category.name
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key ===
                      " "
                  ) {
                    event.preventDefault();

                    handleCategoryClick(
                      category.name
                    );
                  }
                }}
                style={{
                  background:
                    "#fff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "8px",
                  padding:
                    "12px",
                  cursor:
                    "pointer",
                  transition:
                    "all 0.2s ease",
                  textAlign:
                    "center",
                  boxShadow:
                    "0 1px 2px rgba(0,0,0,0.05)",
                  minWidth: 0,
                  overflow:
                    "hidden",
                }}
                onMouseEnter={(
                  event
                ) => {
                  event.currentTarget.style.borderColor =
                    "#0066cc";

                  event.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,102,204,0.15)";

                  event.currentTarget.style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(
                  event
                ) => {
                  event.currentTarget.style.borderColor =
                    "#e5e7eb";

                  event.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0,0,0,0.05)";

                  event.currentTarget.style.transform =
                    "translateY(0)";
                }}
              >
                {/* ==================================================
                    CATEGORY IMAGE – increased height
                ================================================== */}

                <div
                  style={{
                    width:
                      "100%",
                    height:
                      "160px", // Increased from 120px
                    margin:
                      "0 auto 12px",
                    background:
                      "#f4f5f7",
                    borderRadius:
                      "8px",
                    overflow:
                      "hidden",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <img
                    src={image}
                    alt={
                      category.name
                    }
                    loading="lazy"
                    decoding="async"
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      objectFit:
                        "cover", // Ensures full picture fits
                      display:
                        "block",
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
                    fontSize:
                      "14px",
                    fontWeight: 600,
                    color:
                      "#333",
                    marginBottom:
                      "4px",
                    lineHeight:
                      1.3,
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {
                    category.name
                  }
                </div>

                {/* ==================================================
                    ITEM COUNT
                ================================================== */}

                <div
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#777",
                  }}
                >
                  {
                    category.count
                  }{" "}
                  {category.count ===
                  1
                    ? "item"
                    : "items"}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ========================================================
          RESPONSIVE DESIGN
      ======================================================== */}

      <style>
        {`
          /* ======================================================
             DESKTOP
             4 CATEGORIES PER ROW
          ====================================================== */

          .categories-grid {
            grid-template-columns:
              repeat(
                4,
                minmax(0, 1fr)
              ) !important;
          }

          /* ======================================================
             TABLET
             3 CATEGORIES PER ROW
          ====================================================== */

          @media (max-width: 900px) {
            .categories-grid {
              grid-template-columns:
                repeat(
                  3,
                  minmax(0, 1fr)
                ) !important;
            }
          }

          /* ======================================================
             MOBILE
             EXACTLY 2 CATEGORIES PER ROW
          ====================================================== */

          @media (max-width: 600px) {
            .categories-grid {
              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                ) !important;

              gap: 12px !important;
            }
          }

          /* ======================================================
             SMALL PHONES
             STILL 2 PER ROW
          ====================================================== */

          @media (max-width: 380px) {
            .categories-grid {
              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                ) !important;

              gap: 10px !important;
            }
          }

          /* ======================================================
             MOBILE – reduce image height
          ====================================================== */

          @media (max-width: 600px) {
            .categories-grid > div > div:first-child {
              height: 140px !important;
            }
          }

          @media (max-width: 380px) {
            .categories-grid > div > div:first-child {
              height: 120px !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default Categories;