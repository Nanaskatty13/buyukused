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
          /* ═══════════════════════════════════════════════════
             LIQUID iOS27 — FEATURED PRODUCTS
             ═══════════════════════════════════════════════════ */

          .featured-apple {
            position: relative;
            isolation: isolate;
            padding: 20px 0 40px;
            overflow: hidden;
            border-radius: 20px;
            background: linear-gradient(
              135deg,
              rgba(238,244,255,0.7) 0%,
              rgba(245,240,255,0.55) 40%,
              rgba(234,247,255,0.7) 70%,
              rgba(242,248,255,0.65) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.9),
              0 8px 28px rgba(31,38,135,0.08);
          }

          .featured-apple-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 0 16px;
            gap: 12px;
            flex-wrap: wrap;
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

          /* ─── View All link — liquid blue glass pill ─── */
          .featured-apple-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 999px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.4);
            background: linear-gradient(
              135deg,
              rgba(37,99,235,0.94) 0%,
              rgba(0,85,165,0.88) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.35),
              0 4px 14px rgba(37,99,235,0.30);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .featured-apple-link:hover {
            text-decoration: none;
            transform: translateY(-1px);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.45),
              0 8px 24px rgba(37,99,235,0.42);
          }
          .featured-apple-link:active {
            transform: translateY(0) scale(0.98);
          }

          /* ─── Loading + empty states — liquid glass ─── */
          .featured-apple-loading,
          .featured-apple-empty {
            margin: 16px;
            padding: 24px 20px;
            text-align: center;
            color: #4b5563;
            font-size: 14px;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.75);
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.65) 0%,
              rgba(238,246,255,0.4) 100%
            );
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.9),
              0 4px 14px rgba(31,38,135,0.06);
          }

          /* ─── Marquee Container — liquid glass ─── */
          .featured-marquee-wrapper {
            position: relative;
            overflow: hidden;
            border-radius: 16px;
            margin: 0 8px;
            padding: 12px 0;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.35) 0%,
              rgba(238,246,255,0.2) 100%
            );
            backdrop-filter: blur(8px) saturate(180%);
            -webkit-backdrop-filter: blur(8px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.55);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.85);
          }

          .featured-marquee-track {
            display: flex;
            gap: 20px;
            width: max-content;
            animation: marquee-scroll 28s linear infinite;
            padding: 0 12px;
          }

          .featured-marquee-wrapper:hover .featured-marquee-track {
            animation-play-state: paused;
          }

          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          /* ─── Individual Mini Card — liquid glass ─── */
          .featured-mini-card {
            flex: 0 0 auto;
            width: 220px;
            padding: 16px 14px;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-height: 90px;
            justify-content: center;

            position: relative;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.72) 0%,
              rgba(238,246,255,0.42) 50%,
              rgba(255,255,255,0.62) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(0,85,165,0.45);
            box-shadow:
              0 8px 24px rgba(0,85,165,0.10),
              inset 0 1px 0 rgba(255,255,255,0.95),
              inset 0 -1px 0 rgba(255,255,255,0.25);
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          }

          .featured-mini-card:hover {
            transform: translateY(-4px) scale(1.02);
            border-color: rgba(0,85,165,0.85);
            box-shadow:
              0 14px 32px rgba(0,85,165,0.20),
              inset 0 1px 0 rgba(255,255,255,1),
              inset 0 -1px 0 rgba(255,255,255,0.3);
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
            .featured-apple-header {
              padding: 0 12px;
            }
            .featured-apple-title {
              font-size: 22px;
            }
            .featured-apple-link {
              font-size: 13px;
              padding: 7px 14px;
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
            /* Lighter glass on small screens */
            .featured-apple {
              backdrop-filter: blur(10px) saturate(180%);
              -webkit-backdrop-filter: blur(10px) saturate(180%);
            }
            .featured-mini-card {
              backdrop-filter: blur(10px) saturate(180%);
              -webkit-backdrop-filter: blur(10px) saturate(180%);
            }
          }

          @media (max-width: 480px) {
            .featured-marquee-wrapper {
              margin: 0 4px;
              border-radius: 12px;
            }
            .featured-mini-card {
              width: 140px;
              padding: 10px 8px;
              min-height: 60px;
            }
            .featured-mini-card .product-title {
              font-size: 13px;
            }
            /* Lighter blur again on tiny phones for smooth scroll */
            .featured-apple,
            .featured-mini-card,
            .featured-marquee-wrapper {
              backdrop-filter: blur(6px) saturate(180%);
              -webkit-backdrop-filter: blur(6px) saturate(180%);
            }
          }

          /* ─── Reduced motion ─── */
          @media (prefers-reduced-motion: reduce) {
            .featured-marquee-track {
              animation: none !important;
            }
            .featured-apple-link,
            .featured-mini-card {
              transition: none !important;
            }
            .featured-apple-link:hover,
            .featured-mini-card:hover {
              transform: none !important;
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
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', padding: '0 16px' }}>
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