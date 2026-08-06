import React from 'react';

const RecentProducts = ({ products }) => {
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

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Recent Products</h3>
        <div className="table-actions">
          <select className="filter-select">
            <option value="all">All Categories</option>
            <option value="Cars">Cars</option>
            <option value="Phones">Phones</option>
            <option value="Real Estate">Real Estate</option>
          </select>
          <button className="btn-primary">View All</button>
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
                        <button className="btn-view"><i className="fas fa-eye"></i></button>
                        <button className="btn-edit"><i className="fas fa-pen"></i></button>
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