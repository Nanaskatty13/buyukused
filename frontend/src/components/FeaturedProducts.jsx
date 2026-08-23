// ============================================================
// frontend/src/components/FeaturedProducts.jsx
// BuyUKUsed Featured Products – Responsive Grid (2 on mobile)
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
  // SAFETY – use ALL products
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
            <span className="featured-apple-icon">✦</span> {title}
          </h2>
          <a href={link} className="featured-apple-link">View All →</a>
        </div>
        <div className="featured-apple-loading">Loading products...</div>
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
            <span className="featured-apple-icon">✦</span> {title}
          </h2>
          <a href={link} className="featured-apple-link">View All →</a>
        </div>
        <div className="featured-apple-empty">No products available.</div>
      </section>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ─── Responsive styles for the grid ─── */}
      <style>
        {`
          .featured-apple-grid {
            display: grid;
            gap: 16px;
            grid-template-columns: repeat(4, 1fr); /* Desktop: 4 columns */
          }

          /* Tablet: 3 columns */
          @media (max-width: 1024px) {
            .featured-apple-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          /* Mobile: 2 columns – exactly what you asked for */
          @media (max-width: 767px) {
            .featured-apple-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
          }

          /* Extra small mobile: keep 2 columns, just smaller gap */
          @media (max-width: 480px) {
            .featured-apple-grid {
              gap: 8px;
            }
          }

          /* Optional: make each item fill the column */
          .featured-apple-item {
            width: 100%;
            height: auto;
          }

          /* Header and count styles (preserve existing) */
          .featured-apple-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .featured-apple-title {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
          }
          .featured-apple-link {
            color: #0071e3;
            text-decoration: none;
            font-weight: 500;
          }
          .featured-apple-count {
            font-size: 14px;
            color: #6e6e73;
            margin-bottom: 16px;
          }
          .featured-apple-loading,
          .featured-apple-empty {
            padding: 40px 0;
            text-align: center;
            color: #6e6e73;
          }
        `}
      </style>

      <section className="featured-apple">
        {/* ─── Header ─── */}
        <div className="featured-apple-header">
          <h2 className="featured-apple-title">
            <span className="featured-apple-icon">✦</span> {title}
          </h2>
          <a href={link} className="featured-apple-link">View All →</a>
        </div>

        {/* ─── Product count ─── */}
        <div className="featured-apple-count">
          {displayProducts.length}{" "}
          {displayProducts.length === 1 ? "product" : "products"}
        </div>

        {/* ─── Grid ─── */}
        <div className="featured-apple-grid">
          {displayProducts.map((product, index) => {
            if (!product) return null;
            const productId = product._id || product.id || `product-${index}`;
            return (
              <div key={productId} className="featured-apple-item">
                <ProductCard product={product} appleStyle videoPreview />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default FeaturedProducts;