import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

// ✅ API
import { getProducts } from '../services/api';

// ✅ Local helper for image URLs
const getImageUrl = (path) => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}${path}`;
};

// ─── ProductCard Component (inline) ────────────────────────────
const ProductCard = ({ product }) => {
  // ✅ Guard: if product is undefined, return null
  if (!product) return null;

  const {
    _id,
    title,
    price,
    location,
    images,
    image,
    storage,
    simStatus,
    swapAccepted,
    condition,
    category,
    warranty, // NEW: destructure warranty
  } = product;

  const imageUrl = images?.[0] || image || '/placeholder.png';

  const formattedPrice = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
  }).format(price || 0);

  return (
    <div className="product-card" style={{
      background: 'white',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'var(--transition)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Link to={`/product/${_id}`} style={{ display: 'block', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </Link>

      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link to={`/product/${_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            margin: '0 0 4px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
          }}>
            {title}
          </h3>
        </Link>

        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', margin: '4px 0' }}>
          {formattedPrice}
        </div>

        <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '8px' }}>
          <i className="fas fa-map-marker-alt" style={{ marginRight: '4px' }}></i>
          {location || 'Ghana'}
        </div>

        {/* ─── Additional Details ─── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 12px',
          margin: '6px 0 10px 0',
          fontSize: '12px',
          color: 'var(--gray-600)',
        }}>
          {storage && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fas fa-hdd"></i> {storage}
            </span>
          )}
          {simStatus && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fas fa-sim-card"></i> {simStatus}
            </span>
          )}
          {swapAccepted !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {swapAccepted ? (
                <span style={{ color: '#22c55e' }}>🔄 Swap OK</span>
              ) : (
                <span style={{ color: '#94a3b8' }}>🚫 No swap</span>
              )}
            </span>
          )}
          {condition && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fas fa-clipboard-check"></i> {condition}
            </span>
          )}
          {category && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fas fa-tag"></i> {category}
            </span>
          )}
          {/* ─── NEW: Warranty ─── */}
          {warranty && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fas fa-shield-alt"></i> {warranty}
            </span>
          )}
        </div>

        <Link
          to={`/product/${_id}`}
          style={{
            marginTop: 'auto',
            padding: '8px 16px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '13px',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'var(--transition)',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-dark)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

// ─── Main Products Page ──────────────────────────────────────
const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';
  const initialSearch = queryParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    location: 'all',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts(filters);
        const processedProducts = (data.products || []).map((product) => ({
          ...product,
          images: (product.images || []).map((img) => getImageUrl(img)),
          image: product.image ? getImageUrl(product.image) : null,
        }));
        setProducts(processedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleSearch = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Browse All Ads</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
        {loading ? 'Loading...' : `${products.length} ads found`}
      </p>

      <div style={{ marginBottom: '32px' }}>
        <SearchBar onSearch={handleSearch} initialQuery={filters} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
          No ads found. <a href="/post-ad" style={{ color: 'var(--primary)', fontWeight: 600 }}>Post your ad now!</a>
        </div>
      ) : (
        <div
          className="products-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;