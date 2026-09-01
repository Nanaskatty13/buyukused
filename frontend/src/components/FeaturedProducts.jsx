// frontend/src/components/FeaturedProducts.jsx
// BuyUKUsed Featured Products – Continuous Marquee (Minimal Cards)

import React from "react";

// ================================================================
// FEATURED PRODUCTS COMPONENT
// ================================================================

const FeaturedProducts = ({
  products = [],
  title = "Latest Ads",
  link = "/products",
  loading = false,
}) => {
  // ============================================================
  // SAFETY – use ALL products
  // ============================================================

  const displayProducts = Array.isArray(products) ? products : [];

  // ============================================================
  // DUPLICATE LIST FOR SEAMLESS INFINITE SCROLL
  // ============================================================

  const duplicatedProducts = [...displayProducts, ...displayProducts];

  // ============================================================
  // LOADING STATE
  // ============================================================

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

  // ============================================================
  // EMPTY STATE
  // ============================================================

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

  // ============================================================
  // EXTRACT SELLER NAME
  // ============================================================

  const getSellerName = (product) => {
    if (product.seller?.name) return product.seller.name;
    if (product.sellerName) return product.sellerName;
    if (product.sellerId?.name) return product.sellerId.name;
    return "Unknown Seller";
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ─── Styles ────────────────────────────────────────────── */}
      <style>
        {`
          .featured-apple {
            padding: 20px 0 40px;
            overflow: hidden;
          }

          .featured-apple-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 0 4px;
          }

          .featured-apple-title {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            color: #0f172a;
          }

          .featured-apple-icon {
            color: #2ecc71;
          }

          .featured-apple-link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
          }

          .featured-apple-link:hover {
            text-decoration: underline;
          }

          /* ─── Marquee Container ─── */
          .featured-marquee-wrapper {
            position: relative;
            overflow: hidden;
            border-radius: 16px;
            margin: 0 -8px;
            padding: 8px 0;
          }

          .featured-marquee-track {
            display: flex;
            gap: 20px;
            width: max-content;
            animation: marquee-scroll 28s linear infinite;
          }

          /* Pause on hover */
          .featured-marquee-wrapper:hover .featured-marquee-track {
            animation-play-state: paused;
          }

          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          /* ─── Individual Mini Card ─── */
          .featured-mini-card {
            flex: 0 0 auto;
            width: 220px;
            background: white;
            border: 2px solid #0055a5;      /* Deep blue border */
            border-radius: 16px;            /* Rounded corners */
            padding: 16px 14px;
            box-shadow: 0 4px 12px rgba(0, 85, 165, 0.08);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-height: 90px;
            justify-content: center;
          }

          .featured-mini-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 8px 24px rgba(0, 85, 165, 0.15);
          }

          .featured-mini-card .product-title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 4px;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .featured-mini-card .seller-name {
            font-size: 13px;
            color: #475569;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .featured-mini-card .seller-name::before {
            content: "👤";
            font-size: 12px;
          }

          /* ─── Responsive ─── */
          @media (max-width: 640px) {
            .featured-apple-title {
              font-size: 22px;
            }
            .featured-mini-card {
              width: 160px;
              padding: 12px 10px;
              min-height: 70px;
            }
            .featured-mini-card .product-title {
              font-size: 14px;
            }
            .featured-mini-card .seller-name {
              font-size: 12px;
            }
          }

          @media (max-width: 480px) {
            .featured-mini-card {
              width: 140px;
              padding: 10px 8px;
              min-height: 60px;
            }
            .featured-mini-card .product-title {
              font-size: 13px;
            }
          }
        `}
      </style>

      {/* ─── Section ─── */}
      <section className="featured-apple">

        {/* Header */}
        <div className="featured-apple-header">
          <h2 className="featured-apple-title">
            <span className="featured-apple-icon">✦</span> {title}
          </h2>
          <a href={link} className="featured-apple-link">View All →</a>
        </div>

        {/* Count */}
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', padding: '0 4px' }}>
          {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'}
        </div>

        {/* ─── Marquee ─── */}
        <div className="featured-marquee-wrapper">
          <div className="featured-marquee-track">
            {duplicatedProducts.map((product, index) => (
              <div key={`${product._id || product.id}-${index}`} className="featured-mini-card">
                <div className="product-title">{product.title || "Untitled"}</div>
                <div className="seller-name">{getSellerName(product)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedProducts;