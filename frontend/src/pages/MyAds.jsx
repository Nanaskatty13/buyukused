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
    <div className="container liquid-myads-page" style={{ padding: '40px 20px' }}>
      {/* ═══════════════════════════════════════════════════════
          LIQUID iOS27 — STYLES
          ═══════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes liquid-myads-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33%      { transform: translate3d(-30px, 24px, 0) scale(1.06); }
          66%      { transform: translate3d(24px, -20px, 0) scale(0.97); }
        }

        /* ─── Page — liquid mirror background ──────────────── */
        .liquid-myads-page {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #eef4ff 0%,
            #f5f0ff 40%,
            #eaf7ff 70%,
            #f2f8ff 100%
          );
        }

        .liquid-myads-page::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(circle at 8% 15%, rgba(0,102,204,0.22) 0%, rgba(0,102,204,0.08) 25%, transparent 55%),
            radial-gradient(circle at 92% 60%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 25%, transparent 55%),
            radial-gradient(circle at 50% 115%, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.06) 25%, transparent 55%),
            radial-gradient(circle at 30% 80%, rgba(59,130,246,0.12) 0%, transparent 50%);
          animation: liquid-myads-float 24s ease-in-out infinite;
          will-change: transform;
        }

        /* ─── Ad card — liquid glass panel ────────────────── */
        .liquid-myads-page .liquid-myads-card {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(238,246,255,0.42) 50%,
            rgba(255,255,255,0.62) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 16px;
          box-shadow:
            0 8px 28px rgba(31,38,135,0.10),
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(255,255,255,0.25);
          transition:
            transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1),
            border-color 0.2s ease;
        }
        .liquid-myads-page .liquid-myads-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.98);
          box-shadow:
            0 14px 40px rgba(31,38,135,0.16),
            inset 0 1px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(255,255,255,0.3);
        }

        /* ─── Image thumbnail — liquid glass frame ────────── */
        .liquid-myads-page .liquid-myads-thumb {
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 2px 8px rgba(31,38,135,0.08);
          backdrop-filter: blur(6px) saturate(180%);
          -webkit-backdrop-filter: blur(6px) saturate(180%);
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.6) 0%,
            rgba(238,246,255,0.4) 100%
          );
        }

        /* ─── Edit button — liquid blue glass ─────────────── */
        .liquid-myads-page .liquid-myads-btn-edit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.4);
          background: linear-gradient(
            135deg,
            rgba(0,102,204,0.94) 0%,
            rgba(0,85,165,0.88) 100%
          );
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 4px 14px rgba(0,102,204,0.30);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }
        .liquid-myads-page .liquid-myads-btn-edit:hover {
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 8px 24px rgba(0,102,204,0.42);
        }
        .liquid-myads-page .liquid-myads-btn-edit:active {
          transform: translateY(0) scale(0.98);
        }

        /* ─── Delete button — liquid red glass ────────────── */
        .liquid-myads-page .liquid-myads-btn-delete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.35);
          background: linear-gradient(
            135deg,
            rgba(239,68,68,0.92) 0%,
            rgba(220,38,38,0.85) 100%
          );
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 4px 14px rgba(239,68,68,0.30);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }
        .liquid-myads-page .liquid-myads-btn-delete:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 8px 24px rgba(239,68,68,0.42);
        }
        .liquid-myads-page .liquid-myads-btn-delete:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .liquid-myads-page .liquid-myads-btn-delete:disabled {
          cursor: not-allowed;
          opacity: 0.6;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.3),
            0 2px 8px rgba(239,68,68,0.15);
        }

        /* ─── Empty state — liquid glass panel ────────────── */
        .liquid-myads-page .liquid-myads-empty {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.68) 0%,
            rgba(238,246,255,0.42) 50%,
            rgba(255,255,255,0.58) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 18px;
          box-shadow:
            0 8px 28px rgba(31,38,135,0.10),
            inset 0 1px 0 rgba(255,255,255,0.95);
          padding: 40px 24px;
          text-align: center;
          color: #4b5563;
        }

        /* ─── Post Ad CTA — liquid blue glass ─────────────── */
        .liquid-myads-page .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 22px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.45);
          background: linear-gradient(
            135deg,
            rgba(0,102,204,0.94) 0%,
            rgba(0,85,165,0.88) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 4px 14px rgba(0,102,204,0.30);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .liquid-myads-page .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 8px 24px rgba(0,102,204,0.42);
        }

        /* ─── Reduced motion ──────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .liquid-myads-page::before { animation: none !important; }
          .liquid-myads-page .liquid-myads-card,
          .liquid-myads-page .liquid-myads-btn-edit,
          .liquid-myads-page .liquid-myads-btn-delete,
          .liquid-myads-page .btn-primary {
            transition: none !important;
          }
          .liquid-myads-page .liquid-myads-card:hover,
          .liquid-myads-page .liquid-myads-btn-edit:hover,
          .liquid-myads-page .liquid-myads-btn-delete:hover:not(:disabled),
          .liquid-myads-page .btn-primary:hover {
            transform: none !important;
          }
        }
      `}</style>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>My Ads</h1>
      {ads.length === 0 ? (
        <div className="liquid-myads-empty">
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
                className="liquid-myads-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  flexWrap: 'wrap',
                }}
              >
                {imageUrl && (
                  <div className="liquid-myads-thumb" style={{ width: '60px', height: '60px', flexShrink: 0 }}>
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
                    className="liquid-myads-btn-edit"
                  >
                    <i className="fas fa-pen"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingId === product._id}
                    className="liquid-myads-btn-delete"
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