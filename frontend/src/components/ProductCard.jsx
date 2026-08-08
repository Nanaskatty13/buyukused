import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/api';

const ProductCard = ({ product }) => {
  const { toggleFavorite, isFavorite } = useCart();
  const liked = isFavorite(product?._id);

  if (!product) return null;

  const imagePath = product.images?.[0] || product.image || null;
  const imageUrl = imagePath ? getImageUrl(imagePath) : 'https://placehold.co/400x300?text=No+Image';

  // Swap status display
  const swapLabel = product.swapAccepted ? '🔄 Swap OK' : '🚫 No swap';

  return (
    <div className="product-card" style={{
      background: 'white',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--gray-200)',
      transition: 'var(--transition)',
      boxShadow: 'var(--shadow-sm)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      // Reduce overall card size
      maxWidth: '280px',   // optional, but helps keep cards from being too wide
      margin: '0 auto',    // centre cards
    }}>
      {/* ─── Image – full picture, no cropping ─── */}
      <Link to={`/product/${product._id}`} className="image-wrapper" style={{
        position: 'relative',
        paddingTop: '85%',          // ≈ 5:6 aspect – still tall enough, but smaller than square
        background: 'var(--gray-100)',
        overflow: 'hidden',
        display: 'block',
        // Reduce image area size – you can adjust paddingTop to control height
      }}>
        <img
          src={imageUrl}
          alt={product.title || 'Product'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',    // ✅ shows the full image without cropping
            backgroundColor: 'var(--gray-100)',
          }}
          loading="lazy"
        />
        {/* Promo badge */}
        {product.promo && (
          <span className="promo-badge" style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: '#f59e0b',
            color: 'white',
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
          }}>Promoted</span>
        )}
        {/* Favourite button */}
        <button
          className="fav-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product._id);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: liked ? '#e74c3c' : 'var(--gray-600)',
            transition: 'var(--transition)',
          }}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <i className={liked ? 'fas fa-heart' : 'far fa-heart'}></i>
        </button>
      </Link>

      {/* ─── Product Info – smaller padding & fonts ─── */}
      <div className="info" style={{
        padding: '10px 12px 12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="title" style={{
            fontWeight: 600,
            fontSize: '14px',          // reduced
            marginBottom: '2px',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{product.title || 'Untitled'}</div>
        </Link>

        <div className="price" style={{
          fontSize: '16px',            // reduced
          fontWeight: 700,
          color: 'var(--primary)',
          marginBottom: '4px',
        }}>GH₵ {Number(product.price || 0).toLocaleString()}</div>

        {/* ─── Details – smaller text ─── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 10px',
          fontSize: '11px',           // reduced
          color: 'var(--gray-600)',
          marginBottom: '6px',
        }}>
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

        {/* ─── Location & Date ─── */}
        <div className="meta" style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',          // reduced
          color: 'var(--gray-500)',
          marginTop: '2px',
          marginBottom: '8px',
          flexWrap: 'wrap',
          gap: '3px',
        }}>
          <span className="location">
            <i className="fas fa-map-marker-alt"></i> {product.location || 'Ghana'}
          </span>
          <span className="date">
            {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''}
          </span>
        </div>

        {/* ─── View Product Button – smaller ─── */}
        <Link
          to={`/product/${product._id}`}
          style={{
            marginTop: 'auto',
            padding: '6px 14px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '12px',          // reduced
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'var(--transition)',
            display: 'block',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-dark)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
        >
          View Product →
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;