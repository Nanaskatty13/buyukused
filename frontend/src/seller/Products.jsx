// frontend/src/seller/Products.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, deleteProduct, getImageUrl } from '../services/api';
import VerifiedBadge from '../components/VerifiedBadge';

const SellerProducts = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getProducts({ sellerId: user._id, limit: 100 });
        const productList = Array.isArray(response) ? response : response?.products || [];
        setProducts(productList);
      } catch (err) {
        console.error('Failed to fetch seller products:', err);
        setError(err?.message || 'Could not load your ads.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user, navigate]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this ad permanently?')) return;
    setDeletingId(productId);
    try {
      const result = await deleteProduct(productId, token);
      if (result?.success || result?.message?.includes('deleted')) {
        setProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        alert(result?.message || 'Delete failed.');
      }
    } catch (err) {
      alert(err.message || 'Something went wrong.');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Seller's own profile picture ─────────────────────────────
  // Get the image field from the user object (supports multiple field names)
  const sellerAvatar =
    user?.profileImage ||
    user?.avatar ||
    user?.photo ||
    user?.photoURL ||
    null;

  // ─── Always use getImageUrl to handle both relative paths and full Cloudinary URLs ───
  const sellerAvatarUrl = sellerAvatar ? getImageUrl(sellerAvatar) : null;

  const isVerified = user?.isVerified === true;

  if (loading) {
    return <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>Loading your ads...</div>;
  }

  if (error) {
    return <div className="container" style={{ padding: '40px 20px', color: '#e74c3c', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* ─── Header with seller avatar and verified badge ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'var(--gray-200)',
            flexShrink: 0,
            border: '2px solid var(--gray-100)',
            position: 'relative',
          }}
        >
          {sellerAvatarUrl ? (
            <img
              src={sellerAvatarUrl}
              alt={user?.name || 'Seller'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <i
              className="fas fa-user-circle"
              style={{ fontSize: '48px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
            />
          )}
        </div>

        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {user?.name || 'My Ads'}
            {isVerified && <VerifiedBadge size={24} showLabel />}
          </h1>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
            {products.length} {products.length === 1 ? 'ad' : 'ads'} posted
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <Link
            to="/post-ad"
            className="btn-secondary"
            style={{
              padding: '10px 20px',
              background: 'var(--secondary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-plus-circle"></i> Post New Ad
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
          You haven't posted any ads yet.
          <br />
          <Link to="/post-ad" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
            Post Your First Ad
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {products.map(product => {
            const imageUrl = product.images?.length > 0 ? getImageUrl(product.images[0]) : null;
            const isSold = product.status === 'sold';
            return (
              <div
                key={product._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)',
                  flexWrap: 'wrap',
                }}
              >
                {imageUrl && (
                  <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {product.title}
                    </Link>
                    {isSold && (
                      <span style={{ background: '#dc2626', color: 'white', fontSize: '10px', padding: '1px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        SOLD
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                    {product.category} • {product.location} • <i className="fas fa-eye"></i> {product.views || 0}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₵{Number(product.price || 0).toLocaleString()}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    style={{
                      padding: '6px 14px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <i className="fas fa-pen"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingId === product._id}
                    style={{
                      padding: '6px 14px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: deletingId === product._id ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      opacity: deletingId === product._id ? 0.6 : 1,
                    }}
                  >
                    {deletingId === product._id ? 'Deleting...' : <><i className="fas fa-trash"></i> Delete</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;