// frontend/src/components/ProductCard.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, updateProductStatus } from '../services/api';
import SoldBadge from './SoldBadge';

const ProductCard = ({ product, onStatusToggle, appleStyle = false, videoPreview = false }) => {
  const { toggleFavorite, isFavorite } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!product) return null;

  const liked = isFavorite(product._id);

  const imagePath = product.images?.[0] || product.image || null;
  const imageUrl = imagePath
    ? getImageUrl(imagePath)
    : 'https://placehold.co/400x300?text=No+Image';

  const swapLabel = product.swapAccepted ? '🔄 Swap OK' : '🚫 No swap';
  const isSold = product.status === 'sold';

  const isOwner = user && (
    user.role === 'admin' ||
    (product.sellerId?._id && product.sellerId._id === user._id) ||
    product.sellerId === user._id
  );

  // ─── Seller object ─────────────────────────────────────────────
  const seller = product.sellerId || product.seller || {};
  const sellerName = seller.name || seller.shopName || 'Seller';
  const isVerified = seller.isVerified === true;

  // ─── Seller profile image ─────────────────────────────────────
  const sellerImage =
    seller.profileImage ||
    seller.avatar ||
    seller.photo ||
    seller.picture ||
    seller.profilePicture ||
    null;

  const sellerImageUrl = sellerImage
    ? sellerImage.startsWith('http')
      ? sellerImage
      : getImageUrl(sellerImage)
    : null;

  // ─── Helper: render category‑specific specs ──────────────────
  const renderCategorySpecs = () => {
    const specs = [];
    const category = product.category;

    if (category === 'Laptops') {
      if (product.brand) specs.push({ icon: '🏷️', label: product.brand });
      if (product.model) specs.push({ icon: '📟', label: product.model });
      if (product.processor) specs.push({ icon: '⚡', label: product.processor });
      if (product.ram) specs.push({ icon: '🧠', label: product.ram });
      if (product.graphics) specs.push({ icon: '🖥️', label: product.graphics });
      if (product.screenSize) specs.push({ icon: '📐', label: product.screenSize });
      if (product.storage) specs.push({ icon: '💾', label: product.storage });
      if (product.condition) specs.push({ icon: '📋', label: product.condition });
    }
    else if (category === 'Tablets') {
      if (product.brand) specs.push({ icon: '🏷️', label: product.brand });
      if (product.model) specs.push({ icon: '📟', label: product.model });
      if (product.year) specs.push({ icon: '📅', label: product.year });
      if (product.connectivity) specs.push({ icon: '📶', label: product.connectivity });
      if (product.screenSize) specs.push({ icon: '📐', label: product.screenSize });
      if (product.storage) specs.push({ icon: '💾', label: product.storage });
      if (product.condition) specs.push({ icon: '📋', label: product.condition });
    }
    else if (category === 'Phones') {
      if (product.brand) specs.push({ icon: '🏷️', label: product.brand });
      if (product.model) specs.push({ icon: '📟', label: product.model });
      if (product.batteryHealth) specs.push({ icon: '🔋', label: `${product.batteryHealth}%` });
      if (product.faceId) specs.push({ icon: '😊', label: product.faceId });
      if (product.storage) specs.push({ icon: '💾', label: product.storage });
      if (product.condition) specs.push({ icon: '📋', label: product.condition });
    }
    else {
      if (product.brand) specs.push({ icon: '🏷️', label: product.brand });
      if (product.model) specs.push({ icon: '📟', label: product.model });
      if (product.storage) specs.push({ icon: '💾', label: product.storage });
      if (product.condition) specs.push({ icon: '📋', label: product.condition });
    }

    return specs.slice(0, 4).map((spec, index) => (
      <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
        {spec.icon} {spec.label}
      </span>
    ));
  };

  // ─── Handle "Mark as Sold" ─────────────────────────────────────
  const handleMarkAsSold = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please login to manage your products.');
      return;
    }

    const newStatus = isSold ? 'active' : 'sold';
    const confirmMessage = isSold
      ? `Mark "${product.title}" as available again?`
      : `Mark "${product.title}" as sold? This will hide the Contact button.`;

    if (!window.confirm(confirmMessage)) return;

    setIsUpdating(true);
    try {
      const result = await updateProductStatus(product._id, newStatus, token);
      if (result.success) {
        alert(`✅ Product marked as ${newStatus === 'sold' ? 'sold' : 'available'}!`);
        if (onStatusToggle) {
          onStatusToggle(product._id);
        } else {
          window.location.reload();
        }
      } else {
        alert('❌ Failed to update status: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      alert('❌ Error: ' + (error.message || 'Something went wrong'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`product-card ${appleStyle ? 'product-card-apple' : ''}`}
      style={{
        background: 'white',
        borderRadius: appleStyle ? '18px' : '8px',
        overflow: 'hidden',
        border: appleStyle ? 'none' : '1px solid #e5e7eb',
        transition: 'all 0.2s ease',
        boxShadow: appleStyle ? '0 2px 12px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '280px',
        margin: '0 auto',
        height: '100%',
      }}
    >
      {/* ─── Image ─── */}
      <Link
        to={`/product/${product._id}`}
        className="image-wrapper"
        style={{
          position: 'relative',
          paddingTop: '100%',
          background: '#f4f5f7',
          overflow: 'hidden',
          display: 'block',
        }}
      >
        <img
          src={imageUrl}
          alt={product.title || 'Product'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#f4f5f7',
            transition: 'transform 0.3s ease',
          }}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image';
          }}
        />

        {isSold && <SoldBadge variant="card" />}

        {product.promo && (
          <span
            className="promo-badge"
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: '#f59e0b',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            Promoted
          </span>
        )}

        {/* ─── SELLER AVATAR + VERIFIED BADGE (on image) ─── */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
            }}
          >
            {sellerImageUrl ? (
              <img
                src={sellerImageUrl}
                alt={sellerName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                <i
                  className="fas fa-user"
                  style={{
                    fontSize: '18px',
                    color: '#9ca3af',
                  }}
                />
              </div>
            )}

            {/* Verified badge */}
            {isVerified && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '18px',
                  height: '18px',
                  background: '#1DA1F2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 10.5L9.5 12.5L14 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {videoPreview && (
          <div
            className="product-card-video-badge"
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <span style={{ marginLeft: '2px' }}>▶</span>
          </div>
        )}

        {/* ─── FAVOURITE BUTTON (with auth check) ─── */}
        <button
          type="button"
          className="fav-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) {
              navigate('/login', { state: { from: location.pathname } });
              return;
            }
            toggleFavorite(product._id);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: liked ? '#e74c3c' : '#666',
            transition: '0.2s',
            cursor: 'pointer',
            zIndex: 3,
            backdropFilter: 'blur(4px)',
          }}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <i className={liked ? 'fas fa-heart' : 'far fa-heart'}></i>
        </button>
      </Link>

      {/* ─── Product Info ─── */}
      <div
        className="info"
        style={{
          padding: appleStyle ? '14px 16px 16px' : '12px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Link
          to={`/product/${product._id}`}
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            className="title"
            style={{
              fontWeight: 600,
              fontSize: appleStyle ? '15px' : '14px',
              marginBottom: '4px',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: '#333',
            }}
          >
            {product.title || 'Untitled'}
          </div>
        </Link>

        {/* ─── Seller name is now REMOVED ─── */}

        <div
          className="price"
          style={{
            fontSize: appleStyle ? '18px' : '16px',
            fontWeight: 700,
            color: isSold ? '#9ca3af' : '#0066cc',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          GH₵ {Number(product.price || 0).toLocaleString()}
          {isSold && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#dc2626',
                background: '#fee2e2',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              SOLD
            </span>
          )}
        </div>

        {/* ─── Category‑specific specs ─── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 10px',
            fontSize: '11px',
            color: '#666',
            marginBottom: '6px',
          }}
        >
          {renderCategorySpecs()}
        </div>

        {/* ─── Common extra fields ─── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 10px',
            fontSize: '11px',
            color: '#666',
            marginBottom: '6px',
          }}
        >
          {product.warranty && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <i className="fas fa-shield-alt"></i> {product.warranty}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {swapLabel}
          </span>

          {/* ─── SIM STATUS – hidden for laptops ─── */}
          {product.simStatus && product.category !== 'Laptops' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#0055a5', fontWeight: 600 }}>
              <i className="fas fa-sim-card"></i> SIM: {product.simStatus}
            </span>
          )}
        </div>

        <div
          className="meta"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#777',
            marginTop: '2px',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '3px',
          }}
        >
          <span className="location">
            <i className="fas fa-map-marker-alt"></i> {product.location || 'Ghana'}
          </span>
          <span className="date">
            {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginTop: 'auto',
          }}
        >
          <Link
            to={`/product/${product._id}`}
            style={{
              padding: appleStyle ? '8px 16px' : '8px 12px',
              background: isSold ? '#9ca3af' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: appleStyle ? '9999px' : '4px',
              fontWeight: 600,
              fontSize: appleStyle ? '13px' : '12px',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'block',
              cursor: isSold ? 'default' : 'pointer',
              boxShadow: isSold ? 'none' : '0 2px 4px rgba(0,102,204,0.2)',
            }}
            onMouseEnter={(e) => {
              if (!isSold) {
                e.currentTarget.style.background = '#005bb5';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSold) {
                e.currentTarget.style.background = '#0066cc';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isSold ? 'Sold Out' : 'View Product →'}
          </Link>

          {isOwner && !isUpdating && (
            <button
              onClick={handleMarkAsSold}
              style={{
                padding: appleStyle ? '6px 14px' : '4px 10px',
                background: isSold ? '#22c55e' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: appleStyle ? '9999px' : '4px',
                fontWeight: 600,
                fontSize: appleStyle ? '12px' : '11px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'block',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isSold ? '#16a34a' : '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isSold ? '#22c55e' : '#dc2626';
              }}
            >
              {isSold ? '🔁 Mark Available' : '⚡ Mark as Sold'}
            </button>
          )}

          {isOwner && isUpdating && (
            <div
              style={{
                padding: '6px 14px',
                background: '#9ca3af',
                color: 'white',
                borderRadius: appleStyle ? '9999px' : '4px',
                fontSize: '12px',
                textAlign: 'center',
                opacity: 0.7,
              }}
            >
              ⏳ Updating...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;