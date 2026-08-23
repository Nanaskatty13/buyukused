// ============================================================
// frontend/src/components/FeaturedProducts.jsx
// BuyUKUsed Featured Products
// ============================================================

import React from "react";
import ProductCard from "./ProductCard";

// ============================================================
// FEATURED PRODUCTS COMPONENT
// ============================================================

const FeaturedProducts = ({
  products = [],
  title = "Latest Ads",
  link = "/products",
  loading = false,
}) => {
  // ==========================================================
  // SAFETY
  // ==========================================================
  // IMPORTANT:
  //
  // Do NOT use:
  // products.slice(0, 4)
  // products.slice(0, 8)
  //
  // We want ALL products received from Home.jsx.
  // ==========================================================

  const displayProducts = Array.isArray(products)
    ? products
    : [];

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <section className="featured-apple">
        <div className="featured-apple-header">
          <h2 className="featured-apple-title">
            <span className="featured-apple-icon">
              ✦
            </span>{" "}
            {title}
          </h2>

          <a
            href={link}
            className="featured-apple-link"
          >
            View All →
          </a>
        </div>

        <div className="featured-apple-loading">
          Loading products...
        </div>
      </section>
    );
  }

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (displayProducts.length === 0) {
    return (
      <section className="featured-apple">
        <div className="featured-apple-header">
          <h2 className="featured-apple-title">
            <span className="featured-apple-icon">
              ✦
            </span>{" "}
            {title}
          </h2>

          <a
            href={link}
            className="featured-apple-link"
          >
            View All →
          </a>
        </div>

        <div className="featured-apple-empty">
          No products available.
        </div>
      </section>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="featured-apple">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="featured-apple-header">
        <h2 className="featured-apple-title">
          <span className="featured-apple-icon">
            ✦
          </span>{" "}
          {title}
        </h2>

        <a
          href={link}
          className="featured-apple-link"
        >
          View All →
        </a>
      </div>

      {/* ======================================================
          PRODUCT COUNT
      ====================================================== */}

      <div className="featured-apple-count">
        {displayProducts.length}{" "}
        {displayProducts.length === 1
          ? "product"
          : "products"}
      </div>

      {/* ======================================================
          PRODUCT GRID
          
          Desktop  : 4 per row
          Tablet   : 3 per row
          Mobile   : 2 per row

          ALL products are rendered.
      ====================================================== */}

      <div
        className="featured-apple-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "24px",
          width: "100%",
        }}
      >
        {displayProducts.map(
          (product, index) => {
            // --------------------------------------------------
            // Ignore invalid entries
            // --------------------------------------------------

            if (!product) {
              return null;
            }

            // --------------------------------------------------
            // Product ID
            // --------------------------------------------------

            const productId =
              product._id ||
              product.id ||
              `product-${index}`;

            // --------------------------------------------------
            // PRODUCT CARD
            // --------------------------------------------------

            return (
              <div
                key={productId}
                className="featured-apple-item"
                style={{
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <ProductCard
                  product={product}
                  appleStyle
                  videoPreview
                />
              </div>
            );
          }
        )}
      </div>

      {/* ======================================================
          RESPONSIVE GRID
          
          Desktop:
          4 products per row

          Tablet:
          3 products per row

          Mobile:
          2 products per row
      ====================================================== */}

      <style>
        {`
          .featured-apple-grid {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 24px;
            width: 100%;
          }

          .featured-apple-item {
            min-width: 0;
            width: 100%;
          }

          @media (max-width: 1024px) {
            .featured-apple-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 768px) {
            .featured-apple-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 16px;
            }
          }

          @media (max-width: 480px) {
            .featured-apple-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 12px;
            }
          }
        `}
      </style>
    </section>
  );
};

// ============================================================
// EXPORT
// ============================================================

export default FeaturedProducts;
