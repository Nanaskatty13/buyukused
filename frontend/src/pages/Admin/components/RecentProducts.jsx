import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import navigation

const RecentProducts = ({ products }) => {
  const navigate = useNavigate(); // ✅ hook for navigation

  const recent = products.slice(0, 5);

  const getStatusBadge = (status) => {
    const colors = {
      active: '#dcfce7',
      pending: '#fef9c3',
      inactive: '#fee2e2',
      sold: '#e0e7ff',
    };
    const textColors = {
      active: '#166534',
      pending: '#854d0e',
      inactive: '#991b1b',
      sold: '#1e40af',
    };
    return {
      background: colors[status] || '#f1f5f9',
      color: textColors[status] || '#64748b',
    };
  };

  // ─── Handlers ──────────────────────────────────────────────
  const handleViewAll = () => {
    navigate('/products'); // or '/admin/products' if you have an admin route
  };

  const handleViewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  const handleEditProduct = (id) => {
    navigate(`/edit-product/${id}`);
  };

  // ─── Filter select (optional) ─────────────────────────────
  // This is just a placeholder – you can implement filtering
  // by passing a callback via props if needed.
  const handleFilterChange = (e) => {
    console.log('Filter selected:', e.target.value);
    // You could call a parent function here: props.onFilter(e.target.value)
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Recent Products</h3>
        <div className="table-actions">
          <select className="filter-select" onChange={handleFilterChange}>
            <option value="all">All Categories</option>
            <option value="Cars">Cars</option>
            <option value="Phones">Phones</option>
            <option value="Real Estate">Real Estate</option>
          </select>
          <button className="btn-primary" onClick={handleViewAll}>
            View All
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No products found</td>
              </tr>
            ) : (
              recent.map((p) => {
                const badge = getStatusBadge(p.status);
                return (
                  <tr key={p._id}>
                    <td>
                      <div className="product-cell">
                        <img src={p.image || 'https://placehold.co/40'} alt={p.title} />
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td>{p.sellerName || 'Unknown'}</td>
                    <td>₵{p.price?.toLocaleString()}</td>
                    <td>{p.category}</td>
                    <td>
                      <span className="status-badge" style={badge}>
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn-view"
                          onClick={() => handleViewProduct(p._id)}
                          aria-label="View product"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEditProduct(p._id)}
                          aria-label="Edit product"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentProducts;