// frontend/src/pages/SellerPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/api';
import { getPublicSellerProfile, getPublicSellerProducts } from '../services/sellerService';
import ProductCard from '../components/ProductCard';

// ─── Helper: relative time ago ──────────────────────────────────
const timeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const SellerPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useCart();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  // ─── Fetch seller & products ──────────────────────────────────────
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) {
        setError('No seller ID provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch seller profile (public)
        const profileData = await getPublicSellerProfile(sellerId);
        console.log('👤 Seller profile:', profileData);

        if (profileData?.success && profileData.seller) {
          const sellerData = profileData.seller;
          setSeller({
            _id: sellerData._id || sellerId,
            name: sellerData.name || sellerData.shopName || 'Seller',
            shopName: sellerData.shopName || '',
            phone: sellerData.phone || '',
            email: sellerData.email || '',
            location: sellerData.location || '',
            avatar: sellerData.avatar || sellerData.profileImage || sellerData.photo || null,
            createdAt: sellerData.createdAt || '',
            lastActive: sellerData.lastActive || sellerData.lastSeen || '',
            role: sellerData.role || '',
            rating: sellerData.rating || 0,
            productsCount: sellerData.productsCount || 0,
          });
        } else {
          setError(profileData?.message || 'Failed to load seller profile.');
          setLoading(false);
          return;
        }

        // Fetch seller products (public)
        const productsData = await getPublicSellerProducts(sellerId, {
          page: 1,
          limit: 20,
          sort: '-createdAt',
        });
        console.log('📦 Seller products:', productsData);

        if (productsData?.success) {
          setProducts(productsData.products || []);
          if (productsData.pagination) {
            setPagination(productsData.pagination);
          }
        } else {
          // Don't show error for no products, just set empty array
          setProducts([]);
        }
      } catch (err) {
        console.error('❌ Error fetching seller data:', err);
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  // ─── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        Loading seller profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', color: '#e74c3c' }}>
        {error}
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        Seller not found.
      </div>
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────
  const sellerName = seller.shopName || seller.name || 'Unknown Seller';
  const memberSince = seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A';
  const memberDuration = timeAgo(seller.createdAt);
  const lastSeen = seller.lastActive ? timeAgo(seller.lastActive) : null;
  const productCount = products.length;

  // ─── Contact via WhatsApp ────────────────────────────────────────
  const handleWhatsApp = () => {
    const rawPhone = seller.phone || '';
    let phone = String(rawPhone).replace(/\D/g, '');
    if (phone.startsWith('0') && phone.length === 10) {
      phone = '233' + phone.substring(1);
    }
    if (!phone || phone.length < 10) {
      alert('This seller has not provided a valid phone number.');
      return;
    }
    const message = `Hi, I'm interested in your products listed on BuyUkUsed.com. Are you available?`;
    const encoded = encodeURIComponent(message);
    window.location.href = `https://wa.me/${phone}?text=${encoded}`;
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <>
      {/* ─── Responsive grid styles ──────────────────────────────── */}
      <style>
        {`
          @media (max-width: 600px) {
            .seller-products-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 12px !important;
            }
            .seller-products-grid .product-card {
              min-width: 0 !important;
            }
          }
        `}
      </style>

      <div className="container" style={{ padding: '30px 20px' }}>
        {/* Seller Profile Card */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginBottom: '40px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
            alignItems: 'center',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {seller.avatar ? (
              <img
                src={getImageUrl(seller.avatar)}
                alt={sellerName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  parent.innerHTML = `<i class="fas fa-user-circle" style="font-size: 64px; color: var(--gray-400);"></i>`;
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                }}
              />
            ) : (
              <i className="fas fa-user-circle" style={{ fontSize: '64px', color: 'var(--gray-400)' }} />
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
              {sellerName}
            </h1>

            {seller.location && (
              <div style={{ color: 'var(--gray-500)', marginBottom: '4px' }}>
                <i className="fas fa-map-marker-alt" /> {seller.location}
              </div>
            )}

            {seller.role && (
              <div style={{ color: 'var(--gray-500)', marginBottom: '4px' }}>
                <i className="fas fa-user-tag" /> {seller.role.charAt(0).toUpperCase() + seller.role.slice(1)}
              </div>
            )}

            <div style={{ color: 'var(--gray-500)', marginBottom: '4px' }}>
              <i className="fas fa-calendar-alt" /> Member since {memberSince} ({memberDuration})
            </div>

            {lastSeen && (
              <div style={{ color: 'var(--gray-500)', marginBottom: '12px' }}>
                <i className="fas fa-clock" /> Last seen: {lastSeen}
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600 }}>
                <i className="fas fa-box" /> {productCount} products
              </span>
              {seller.rating > 0 && (
                <span style={{ fontWeight: 600 }}>
                  <i className="fas fa-star" style={{ color: '#f59e0b' }} /> {seller.rating} / 5
                </span>
              )}
            </div>

            {/* Contact button */}
            {user && (
              <button
                onClick={handleWhatsApp}
                style={{
                  padding: '10px 24px',
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fab fa-whatsapp" /> Contact Seller
              </button>
            )}
            {!user && (
              <Link to="/login" state={{ from: `/seller/${sellerId}` }}>
                <button
                  style={{
                    padding: '10px 24px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  Sign in to contact
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
          Products by {sellerName}
        </h2>

        {productCount === 0 ? (
          <div style={{ color: 'var(--gray-500)', padding: '40px 0', textAlign: 'center' }}>
            <i className="fas fa-box-open" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }} />
            This seller has not listed any products yet.
          </div>
        ) : (
          <>
            <div
              className="seller-products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '24px',
              }}
            >
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <ProductCard
                    product={product}
                    isFavorite={isFavorite(product._id)}
                    onToggleFavorite={() => toggleFavorite(product._id)}
                  />
                </div>
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                <button
                  onClick={() => {
                    // fetch more products with next page
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SellerPage;