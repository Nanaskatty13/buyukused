// components/ProductsTable.jsx
import React from 'react';

// ✅ Fixed: Now points to the correct API file
import { deleteProduct } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Optional: helper for image URLs (since api.js doesn't export getImageUrl)
const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/50x50?text=No+Image';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}${path}`;
};

const ProductsTable = ({ products, loading, refreshData, showNotification }) => {
  const { token } = useAuth();

  // Guard against missing props
  if (!products) return <div>No products data</div>;

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
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

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="table-container">
      <h2>📦 Products ({products.length})</h2>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Image</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Title</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Price</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px' }}>
                <img 
                  src={getImageUrl(product.image || product.images?.[0])} 
                  alt={product.title} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                />
              </td>
              <td style={{ padding: '8px' }}>{product.title}</td>
              <td style={{ padding: '8px' }}>GH₵ {Number(product.price).toLocaleString()}</td>
              <td style={{ padding: '8px' }}>{product.category || 'Other'}</td>
              <td style={{ padding: '8px' }}>
                <span style={{ 
                  background: product.status === 'active' ? '#10b981' : product.status === 'pending' ? '#f59e0b' : '#6b7280',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}>
                  {product.status || 'active'}
                </span>
              </td>
              <td style={{ padding: '8px' }}>
                <button 
                  onClick={() => handleDelete(product._id)} 
                  style={{ background: '#dc2626', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;