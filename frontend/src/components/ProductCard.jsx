import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { toggleFavorite, isFavorite } = useCart();
  const liked = isFavorite(product?._id);

  // Fallback in case product is undefined
  if (!product) return null;

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
    }}>
      <Link to={`/product/${product._id}`} className="image-wrapper" style={{
        position: 'relative',
        paddingTop: '75%',
        background: 'var(--gray-100)',
        overflow: 'hidden',
        display: 'block',
      }}>
        <img
          src={product.image || 'https://placehold.co/400x300?text=No+Image'}
          alt={product.title || 'Product'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          loading="lazy"
        />
        {product.promo && (
          <span className="promo-badge" style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#f59e0b',
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 12px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
          }}>Promoted</span>
        )}
        <button
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
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: liked ? '#e74c3c' : 'var(--gray-600)',
            transition: 'var(--transition)',
          }}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          {/* ✅ Fixed icon rendering – FontAwesome classes */}
          <i className={liked ? 'fas fa-heart' : 'far fa-heart'}></i>
        </button>
      </Link>

      <Link to={`/product/${product._id}`} className="info" style={{
        padding: '14px 16px 16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        color: 'inherit',
        textDecoration: 'none',
      }}>
        <div className="title" style={{
          fontWeight: 600,
          fontSize: '15px',
          marginBottom: '4px',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{product.title || 'Untitled'}</div>
        <div className="price" style={{
          fontSize: '20px',
          fontWeight: 800,
          color: 'var(--primary)',
        }}>GH₵ {Number(product.price || 0).toLocaleString()}</div>
        <div className="meta" style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--gray-500)',
          marginTop: '8px',
          flexWrap: 'wrap',
          gap: '4px',
        }}>
          <span className="location">
            <i className="fas fa-map-marker-alt"></i> {product.location || 'Ghana'}
          </span>
          <span className="date">
            {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;