// frontend/src/components/FeaturedSellers.jsx
// Top Sellers – with real names, avatars, and stats

import React, { useState } from "react";
import { Link } from "react-router-dom";

const FeaturedSellers = ({ sellers = [] }) => {
  const [following, setFollowing] = useState({});

  const handleFollow = (sellerId) => {
    setFollowing((prev) => ({
      ...prev,
      [sellerId]: !prev[sellerId],
    }));
  };

  if (!sellers || sellers.length === 0) {
    return null;
  }

  return (
    <section className="top-sellers-section">
      <style>
        {`
          /* ═══════════════════════════════════════════════════
             LIQUID iOS27 — FEATURED SELLERS
             ═══════════════════════════════════════════════════ */

          .top-sellers-section {
            position: relative;
            isolation: isolate;
            overflow: hidden;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px 60px;
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

          .top-sellers-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 0 4px;
          }

          .top-sellers-header h2 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            color: #0f172a;
          }

          .top-sellers-header h2 span {
            color: #2ecc71;
          }

          .top-sellers-subtitle {
            color: #6b7280;
            font-size: 15px;
            margin: 0 0 24px;
            padding: 0 4px;
          }

          .top-sellers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          }

          /* ─── Seller card — liquid glass ─────────────── */
          .top-seller-card {
            position: relative;
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 20px 18px;
            border-radius: 16px;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.72) 0%,
              rgba(238,246,255,0.42) 50%,
              rgba(255,255,255,0.62) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.75);
            box-shadow:
              0 8px 24px rgba(31,38,135,0.08),
              inset 0 1px 0 rgba(255,255,255,0.95),
              inset 0 -1px 0 rgba(255,255,255,0.25);
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          }

          .top-seller-card:hover {
            border-color: rgba(0,85,165,0.55);
            box-shadow:
              0 14px 32px rgba(0,85,165,0.15),
              inset 0 1px 0 rgba(255,255,255,1),
              inset 0 -1px 0 rgba(255,255,255,0.3);
            transform: translateY(-2px);
          }

          .top-seller-rank {
            font-size: 24px;
            font-weight: 800;
            color: #94a3b8;
            min-width: 36px;
            text-align: center;
            line-height: 1;
          }

          /* ─── Avatar — liquid glass circle ───────────── */
          .top-seller-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: #475569;
            flex-shrink: 0;
            overflow: hidden;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.72) 0%,
              rgba(238,246,255,0.42) 100%
            );
            backdrop-filter: blur(8px) saturate(180%);
            -webkit-backdrop-filter: blur(8px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.85);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.9),
              0 2px 8px rgba(31,38,135,0.08);
          }

          .top-seller-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .top-seller-info {
            flex: 1;
            min-width: 0;
          }

          .top-seller-name {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .top-seller-name .country-flag {
            font-size: 14px;
          }

          .top-seller-stats {
            display: flex;
            gap: 16px;
            font-size: 13px;
            color: #6b7280;
            margin-top: 2px;
          }

          .top-seller-stats span {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .top-seller-stats .stat-number {
            font-weight: 700;
            color: #0f172a;
          }

          .top-seller-actions {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex-shrink: 0;
          }

          /* ─── Visit Store — liquid blue glass ────────── */
          .top-seller-actions .btn-visit {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px 16px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.4);
            color: #ffffff;
            background: linear-gradient(
              135deg,
              rgba(0,85,165,0.94) 0%,
              rgba(0,63,122,0.88) 100%
            );
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
            white-space: nowrap;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.35),
              0 4px 14px rgba(0,85,165,0.30);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }

          .top-seller-actions .btn-visit:hover {
            transform: translateY(-1px);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.45),
              0 8px 20px rgba(0,85,165,0.42);
          }

          .top-seller-actions .btn-visit:active {
            transform: translateY(0) scale(0.98);
          }

          /* ─── Follow — liquid glass outline ──────────── */
          .top-seller-actions .btn-follow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 5px 16px;
            border-radius: 10px;
            border: 1px solid rgba(0,85,165,0.55);
            color: #0055a5;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.68) 0%,
              rgba(255,255,255,0.32) 100%
            );
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.9),
              0 2px 10px rgba(31,38,135,0.06);
            transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
          }

          .top-seller-actions .btn-follow:hover {
            transform: translateY(-1px);
            background: linear-gradient(
              135deg,
              rgba(232,240,254,0.85) 0%,
              rgba(199,210,254,0.55) 100%
            );
            border-color: rgba(0,85,165,0.85);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,1),
              0 6px 18px rgba(0,85,165,0.22);
          }

          .top-seller-actions .btn-follow:active {
            transform: translateY(0) scale(0.98);
          }

          /* ─── Following — solid liquid blue glass ────── */
          .top-seller-actions .btn-follow.following {
            color: #ffffff;
            border-color: rgba(255,255,255,0.4);
            background: linear-gradient(
              135deg,
              rgba(0,85,165,0.94) 0%,
              rgba(0,63,122,0.88) 100%
            );
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.35),
              0 4px 14px rgba(0,85,165,0.30);
          }

          .top-seller-actions .btn-follow.following:hover {
            transform: translateY(-1px);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.45),
              0 8px 20px rgba(0,85,165,0.42);
          }

          /* ─── Responsive ────────────────────────────── */
          @media (max-width: 768px) {
            .top-sellers-grid {
              grid-template-columns: 1fr;
            }
            .top-sellers-header h2 {
              font-size: 22px;
            }
            .top-sellers-section {
              backdrop-filter: blur(10px) saturate(180%);
              -webkit-backdrop-filter: blur(10px) saturate(180%);
            }
            .top-seller-card {
              backdrop-filter: blur(10px) saturate(180%);
              -webkit-backdrop-filter: blur(10px) saturate(180%);
            }
          }

          @media (max-width: 480px) {
            .top-seller-card {
              padding: 14px 12px;
              flex-wrap: wrap;
            }
            .top-seller-rank {
              font-size: 20px;
              min-width: 28px;
            }
            .top-seller-avatar {
              width: 40px;
              height: 40px;
              font-size: 15px;
            }
            .top-seller-stats {
              font-size: 12px;
              gap: 10px;
              flex-wrap: wrap;
            }
            .top-seller-actions {
              flex-direction: row;
              width: 100%;
              margin-top: 6px;
            }
            .top-seller-actions .btn-visit,
            .top-seller-actions .btn-follow {
              flex: 1;
              text-align: center;
            }
            /* Lighter blur for smooth mobile scroll */
            .top-sellers-section,
            .top-seller-card,
            .top-seller-avatar,
            .top-seller-actions .btn-visit,
            .top-seller-actions .btn-follow {
              backdrop-filter: blur(6px) saturate(180%);
              -webkit-backdrop-filter: blur(6px) saturate(180%);
            }
          }

          /* ─── Reduced motion ────────────────────────── */
          @media (prefers-reduced-motion: reduce) {
            .top-seller-card,
            .top-seller-actions .btn-visit,
            .top-seller-actions .btn-follow {
              transition: none !important;
            }
            .top-seller-card:hover,
            .top-seller-actions .btn-visit:hover,
            .top-seller-actions .btn-follow:hover {
              transform: none !important;
            }
          }
        `}
      </style>

      <div className="top-sellers-header">
        <h2>⭐ Top <span>Sellers</span></h2>
      </div>

      <p className="top-sellers-subtitle">
        Sellers already winning. Real stores. Real orders. Visit a storefront and see what’s possible.
      </p>

      <div className="top-sellers-grid">
        {sellers.map((seller) => {
          const isFollowing = following[seller._id] || false;

          return (
            <div key={seller._id} className="top-seller-card">
              <div className="top-seller-rank">{seller.rank || seller.index + 1}</div>

              <div className="top-seller-avatar">
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.textContent = seller.name?.charAt(0) || "S";
                    }}
                  />
                ) : (
                  seller.name?.charAt(0) || "S"
                )}
              </div>

              <div className="top-seller-info">
                <div className="top-seller-name">
                  {seller.name || "Unknown Seller"}
                  {seller.country && (
                    <span className="country-flag">{seller.country}</span>
                  )}
                </div>
                <div className="top-seller-stats">
                  <span>
                    <span className="stat-number">{seller.orders || 0}</span> Orders
                  </span>
                  <span>
                    <span className="stat-number">{seller.products || 0}</span> Products
                  </span>
                </div>
              </div>

              <div className="top-seller-actions">
                <Link
                  to={`/seller/${seller._id}`}
                  className="btn-visit"
                >
                  Visit Store
                </Link>
                <button
                  type="button"
                  className={`btn-follow ${isFollowing ? "following" : ""}`}
                  onClick={() => handleFollow(seller._id)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedSellers;