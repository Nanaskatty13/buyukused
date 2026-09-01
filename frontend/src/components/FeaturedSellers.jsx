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
          .top-sellers-section {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px 60px;
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

          .top-seller-card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px 18px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 14px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          }

          .top-seller-card:hover {
            border-color: #0055a5;
            box-shadow: 0 4px 16px rgba(0, 85, 165, 0.10);
            transform: translateY(-2px);
          }

          .top-seller-rank {
            font-size: 24px;
            font-weight: 800;
            color: #d1d5db;
            min-width: 36px;
            text-align: center;
            line-height: 1;
          }

          .top-seller-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: #6b7280;
            flex-shrink: 0;
            overflow: hidden;
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

          .top-seller-actions .btn-visit {
            background: #0055a5;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 4px 14px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
            transition: background 0.2s;
            white-space: nowrap;
          }

          .top-seller-actions .btn-visit:hover {
            background: #003f7a;
          }

          .top-seller-actions .btn-follow {
            background: transparent;
            color: #0055a5;
            border: 1px solid #0055a5;
            border-radius: 6px;
            padding: 3px 14px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          }

          .top-seller-actions .btn-follow:hover {
            background: #e8f0fe;
          }

          .top-seller-actions .btn-follow.following {
            background: #0055a5;
            color: white;
            border-color: #0055a5;
          }

          .top-seller-actions .btn-follow.following:hover {
            background: #003f7a;
          }

          @media (max-width: 768px) {
            .top-sellers-grid {
              grid-template-columns: 1fr;
            }
            .top-sellers-header h2 {
              font-size: 22px;
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