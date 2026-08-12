// frontend/src/components/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, updateProductStatus } from '../services/api';
import SoldBadge from './SoldBadge';

const ProductCard = ({ product, onStatusToggle }) => {
  const { toggleFavorite, isFavorite } = useCart();
  const { user, token } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!product) return null;

  const liked = isFavorite(product._id);

  const imagePath = product.images?.[0] || product.image || null;
  const imageUrl = imagePath
    ? getImageUrl(imagePath)
    : 'https://placehold.co/400x300?text=No+Image';

  const swapLabel = product.swapAccepted ? '🔄 Swap OK' : '🚫 No swap';
  const isSold = product.status === 'sold';

  // Check if current user is the owner
  const isOwner = user && (
    user.role === 'admin' ||
    (product.sellerId?._id && product.sellerId._id === user._id) ||
    product.sellerId === user._id
  );

  // Handle "Mark as Sold" / "Mark Available"
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
      className="product-card"
      style={{
        background: 'white',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--gray-200)',
        transition: 'var(--transition)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '280px',
        margin: '0 auto',
      }}
    >
      {/* ─── Image ─── */}
      <Link
        to={`/product/${product._id}`}
        className="image-wrapper"
        style={{
          position: 'relative',
          paddingTop: '100%',
          background: 'var(--gray-100)',
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
            backgroundColor: 'var(--gray-100)',
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
              fontSize: '15px',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
            }}
          >
            Promoted
          </span>
        )}

        <button
          type="button"
          className="fav-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product._id);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '70%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            color: liked ? '#e74c3c' : 'var(--gray-600)',
            transition: 'var(--transition)',
            cursor: 'pointer',
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
          padding: '10px 12px 12px',
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
              fontSize: '14px',
              marginBottom: '2px',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.title || 'Untitled'}
          </div>
        </Link>

        <div
          className="price"
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: isSold ? '#9ca3af' : 'var(--primary)',
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
                fontSize: '12px',
                fontWeight: 700,
                color: '#dc2626',
                background: '#fee2e2',
                padding: '2px 10px',
                borderRadius: '4px',
              }}
            >
              SOLD
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 10px',
            fontSize: '11px',
            color: 'var(--gray-600)',
            marginBottom: '6px',
          }}
        >
          {product.storage && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <i className="fas fa-hdd"></i> {product.storage}
            </span>
          )}
          {product.simStatus && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <i className="fas fa-sim-card"></i> {product.simStatus}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {swapLabel}
          </span>
        </div>

        <div
          className="meta"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--gray-500)',
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
              padding: '6px 14px',
              background: isSold ? '#9ca3af' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '12px',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'var(--transition)',
              display: 'block',
              cursor: isSold ? 'default' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isSold) e.currentTarget.style.background = 'var(--primary-dark)';
            }}
            onMouseLeave={(e) => {
              if (!isSold) e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            {isSold ? 'Sold Out' : 'View Product →'}
          </Link>

          {isOwner && !isUpdating && (
            <button
              onClick={handleMarkAsSold}
              style={{
                padding: '4px 12px',
                background: isSold ? '#22c55e' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '11px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)',
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
                padding: '4px 12px',
                background: '#9ca3af',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
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