// frontend/src/components/FeaturedSellers.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';

const FeaturedSellers = ({ sellers = [], title = 'Featured Sellers', viewAllLink = '/sellers' }) => {
  // If no sellers, show a message
  if (!sellers || sellers.length === 0) {
    return (
      <section className="section" style={{ padding: '40px 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <h2 className="section-title" style={{ fontSize: '22px', fontWeight: 800 }}>
              <i className="fas fa-store" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              {title}
            </h2>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-500)' }}>
            No sellers available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ padding: '40px 0', background: 'var(--gray-50)' }}>
      <div className="container">
        {/* Header with "View All" link */}
        <div className="section-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h2 className="section-title" style={{ fontSize: '22px', fontWeight: 800 }}>
            <i className="fas fa-store" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            {title}
          </h2>
          <Link
            to={viewAllLink}
            style={{
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            View All <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
          </Link>
        </div>

        {/* Sellers Grid */}
        <div className="sellers-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px',
        }}>
          {sellers.map((seller) => {
            // Get avatar URL if exists
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
                className="seller-card"
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 16px',
                  textAlign: 'center',
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Verified Badge */}
                {isVerified && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#2ecc71',
                      color: 'white',
                      width: '22px',
                      height: '22px',
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
                <div
                  className="seller-avatar"
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: imageUrl ? 'transparent' : 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 700,
                    margin: '0 auto 12px',
                    overflow: 'hidden',
                    border: '2px solid var(--gray-200)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={sellerName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.textContent = sellerName.charAt(0).toUpperCase();
                        e.currentTarget.parentElement.style.background = 'var(--primary)';
                      }}
                    />
                  ) : (
                    sellerName.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Name */}
                <div
                  className="seller-name"
                  style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: 'var(--gray-800)',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {sellerName}
                </div>

                {/* Product Count */}
                <div
                  className="seller-products"
                  style={{
                    fontSize: '13px',
                    color: 'var(--gray-500)',
                    marginBottom: '6px',
                  }}
                >
                  {productCount} {productCount === 1 ? 'product' : 'products'}
                </div>

                {/* Rating */}
                <div
                  className="seller-rating"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    color: 'var(--gray-600)',
                  }}
                >
                  <span style={{ color: '#f59e0b' }}>
                    <i className="fas fa-star"></i>
                  </span>
                  <span>{rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--gray-400)', fontSize: '11px' }}>
                    ({Math.floor(Math.random() * 50 + 10)} reviews)
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── Responsive Styles ─── */}
      <style>
        {`
          @media (max-width: 768px) {
            .sellers-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 12px !important;
            }
            .seller-card {
              padding: 16px 12px !important;
            }
            .seller-avatar {
              width: 56px !important;
              height: 56px !important;
              font-size: 22px !important;
            }
            .seller-name {
              font-size: 14px !important;
            }
            .section-title {
              font-size: 20px !important;
            }
          }

          @media (max-width: 480px) {
            .sellers-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 10px !important;
            }
            .seller-card {
              padding: 12px 8px !important;
            }
            .seller-avatar {
              width: 48px !important;
              height: 48px !important;
              font-size: 18px !important;
              margin-bottom: 8px !important;
            }
            .seller-name {
              font-size: 13px !important;
            }
            .seller-products {
              font-size: 11px !important;
            }
            .seller-rating {
              font-size: 12px !important;
            }
            .section-title {
              font-size: 18px !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default FeaturedSellers;