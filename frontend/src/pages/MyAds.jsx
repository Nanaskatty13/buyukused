import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, getImageUrl, deleteProduct } from '../services/api';

const MyAds = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchAds = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ sellerId: user._id, limit: 100 });
        const products = Array.isArray(response) ? response : response?.products || [];
        setAds(products);
      } catch (err) {
        setError('Failed to load your ads.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [user, navigate]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this ad permanently?')) return;
    setDeletingId(productId);
    try {
      const result = await deleteProduct(productId, token);
      if (result?.success || result?.message?.includes('deleted')) {
        setAds(prev => prev.filter(p => p._id !== productId));
      } else {
        alert(result?.message || 'Delete failed.');
      }
    } catch (err) {
      alert(err.message || 'Something went wrong.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px 20px' }}>Loading your ads...</div>;
  if (error) return <div className="container" style={{ padding: '40px 20px', color: '#e74c3c' }}>{error}</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>My Ads</h1>
      {ads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
          You haven't posted any ads yet.
          <br />
          <Link to="/post-ad" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
            Post Your First Ad
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ads.map(product => {
            const imageUrl = product.images?.length > 0 ? getImageUrl(product.images[0]) : null;
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
                  <div style={{ fontWeight: 600 }}>
                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {product.title}
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                    {product.category} • {product.location} • <i className="fas fa-eye"></i> {product.views || 0}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₵{Number(product.price || 0).toLocaleString()}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    style={{ padding: '6px 14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    <i className="fas fa-pen"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingId === product._id}
                    style={{ padding: '6px 14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: deletingId === product._id ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, opacity: deletingId === product._id ? 0.6 : 1 }}
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

export default MyAds;