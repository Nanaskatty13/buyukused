// components/ProductsTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // for View navigation

// ✅ API and context
import { deleteProduct } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Helper for image URLs
const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/50x50?text=No+Image';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}${path}`;
};

const ProductsTable = ({ products, loading, refreshData, showNotification }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Guard
  if (!products) return <div>No products data</div>;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const result = await deleteProduct(id, token);
      if (result.success) {
        showNotification?.('Product deleted successfully', 'success');
        refreshData?.();
      } else {
        showNotification?.(result.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showNotification?.(err.message || 'Something went wrong', 'error');
    }
  };

  const handleView = (id) => {
    navigate(`/product/${id}`);
  };

  // ─── Loading state ──────────────────────────────
  if (loading) {
    return (
      <div className="table-container" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-500)' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '12px' }}></i>
        <div>Loading products…</div>
      </div>
    );
  }

  // ─── Empty state ────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="table-container" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-500)' }}>
        <i className="fas fa-box-open" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}></i>
        <div>No products found.</div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────
  return (
    <div
      className="table-container"
      style={{
        background: 'white',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        padding: '16px 0',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px 12px 20px',
          borderBottom: '1px solid var(--gray-200)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          📦 Products <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--gray-500)' }}>({products.length})</span>
        </h2>
        <button
          onClick={() => navigate('/products')}
          style={{
            padding: '6px 16px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          View All
        </button>
      </div>

      {/* Table – responsive wrapper */}
      <div style={{ overflowX: 'auto', padding: '0 4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-700)' }}>Image</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-700)' }}>Title</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-700)' }}>Price</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-700)' }}>Category</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-700)' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--gray-700)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              // Get first image
              const imgSrc = getImageUrl(product.image || product.images?.[0] || null);

              // Status badge colours
              const statusConfig = {
                active: { bg: '#dcfce7', color: '#166534' },
                pending: { bg: '#fef9c3', color: '#854d0e' },
                inactive: { bg: '#fee2e2', color: '#991b1b' },
                sold: { bg: '#e0e7ff', color: '#1e40af' },
              };
              const status = product.status || 'active';
              const badge = statusConfig[status] || { bg: '#f1f5f9', color: '#64748b' };

              return (
                <tr
                  key={product._id}
                  style={{
                    borderBottom: '1px solid var(--gray-100)',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 16px' }}>
                    <img
                      src={imgSrc}
                      alt={product.title}
                      style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--gray-200)',
                        background: 'var(--gray-100)',
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 500 }}>
                    {product.title}
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>
                    GH₵ {Number(product.price).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--gray-600)' }}>
                    {product.category || 'Other'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: badge.bg,
                        color: badge.color,
                      }}
                    >
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {/* View button */}
                      <button
                        onClick={() => handleView(product._id)}
                        style={{
                          padding: '4px 10px',
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-dark)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(product._id)}
                        style={{
                          padding: '4px 10px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;