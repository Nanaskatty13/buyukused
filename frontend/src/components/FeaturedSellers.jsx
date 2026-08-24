// frontend/src/components/FeaturedSellers.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import VerifiedBadge from './VerifiedBadge'; // Import your existing VerifiedBadge

const FeaturedSellers = ({ sellers = [], title = 'Top Sellers', viewAllLink = '/sellers' }) => {
  if (!sellers || sellers.length === 0) {
    return (
      <section style={{ padding: '60px 0', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              <i className="fas fa-store" style={{ color: '#2ecc71', marginRight: '10px' }}></i>
              {title}
            </h2>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            No sellers available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>
        {`
          /* ─── BuyUKUsed Featured Sellers Grid ─── */
          .buyukused-sellers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 24px;
          }

          .buyukused-seller-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 24px 20px;
            text-align: center;
            border: 1px solid #f1f5f9;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
            text-decoration: none;
            color: inherit;
            display: block;
            position: relative;
          }

          .buyukused-seller-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
            border-color: #e2e8f0;
          }

          .buyukused-seller-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 14px;
            overflow: hidden;
            background: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 700;
            color: #2563eb;
            border: 3px solid #f1f5f9;
            transition: border-color 0.3s;
          }

          .buyukused-seller-card:hover .buyukused-seller-avatar {
            border-color: #2ecc71;
          }

          .buyukused-seller-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .buyukused-seller-name-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-bottom: 4px;
          }

          .buyukused-seller-name {
            font-weight: 700;
            font-size: 16px;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .buyukused-seller-products {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 8px;
          }

          .buyukused-seller-badge {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
            background: #dbeafe;
            color: #2563eb;
            margin-bottom: 8px;
          }

          .buyukused-seller-badge.verified {
            background: #d1fae5;
            color: #065f46;
          }

          .buyukused-seller-rating {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 14px;
            color: #64748b;
          }

          .buyukused-seller-rating .stars {
            color: #f59e0b;
          }

          /* ─── Responsive ─── */
          @media (max-width: 768px) {
            .buyukused-sellers-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
            .buyukused-seller-avatar {
              width: 64px;
              height: 64px;
              font-size: 24px;
            }
            .buyukused-seller-name {
              font-size: 15px;
            }
          }

          @media (max-width: 480px) {
            .buyukused-sellers-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            .buyukused-seller-card {
              padding: 16px 12px;
            }
            .buyukused-seller-avatar {
              width: 56px;
              height: 56px;
              font-size: 20px;
              margin-bottom: 10px;
            }
            .buyukused-seller-name {
              font-size: 14px;
            }
            .buyukused-seller-products {
              font-size: 12px;
            }
            .buyukused-seller-rating {
              font-size: 12px;
            }
          }
        `}
      </style>

      <section style={{ padding: '60px 0', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {/* ─── Header ─── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              <i className="fas fa-store" style={{ color: '#2ecc71', marginRight: '10px' }}></i>
              {title}
            </h2>
            <Link
              to={viewAllLink}
              style={{
                color: '#2563eb',
                fontWeight: 600,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              View All <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
            </Link>
          </div>

          {/* ─── Sellers Grid ─── */}
          <div className="buyukused-sellers-grid">
            {sellers.map((seller) => {
              const avatarUrl = seller.profileImage || seller.photo || seller.avatar || seller.picture;
              const imageUrl = avatarUrl ? getImageUrl(avatarUrl) : null;
              const sellerName = seller.name || seller.sellerName || 'Seller';
              const productCount = seller.productCount || seller.totalProducts || seller.count || 0;
              const rating = seller.rating || seller.averageRating || 0;
              const isVerified = seller.verified || seller.isVerified || false;
              const sellerId = seller._id || seller.id || seller.sellerId;

              return (
                <Link
                  to={`/seller/${sellerId}`}
                  key={sellerId}
                  className="buyukused-seller-card"
                >
                  {/* Verified Badge (top-right) */}
                  {isVerified && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#2ecc71',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(46, 204, 113, 0.3)',
                      }}
                    >
                      <i className="fas fa-check"></i>
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="buyukused-seller-avatar">
                    {imageUrl ? (
                      <img src={imageUrl} alt={sellerName} />
                    ) : (
                      sellerName.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Name with verified badge */}
                  <div className="buyukused-seller-name-wrapper">
                    <span className="buyukused-seller-name">{sellerName}</span>
                    {isVerified && <VerifiedBadge size={16} />}
                  </div>

                  {/* Product Count */}
                  <div className="buyukused-seller-products">
                    {productCount} {productCount === 1 ? 'product' : 'products'}
                  </div>

                  {/* Badge (below product count) */}
                  {isVerified ? (
                    <span className="buyukused-seller-badge verified">
                      <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i> Verified
                    </span>
                  ) : (
                    <span className="buyukused-seller-badge">
                      <i className="fas fa-store" style={{ marginRight: '4px' }}></i> Seller
                    </span>
                  )}

                  {/* Rating */}
                  <div className="buyukused-seller-rating">
                    <span className="stars">
                      <i className="fas fa-star"></i>
                    </span>
                    <span>{rating.toFixed(1)}</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                      ({Math.floor(Math.random() * 50 + 10)} reviews)
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedSellers;