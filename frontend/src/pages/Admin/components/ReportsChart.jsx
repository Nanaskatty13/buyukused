import React from 'react';

const ReportsChart = ({ products }) => {
  // Calculate category counts
  const categories = ['Cars', 'Phones', 'Real Estate', 'Jobs', 'Electronics', 'Fashion', 'Home', 'Other'];
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length,
  }));

  const totalProducts = products.length;
  const totalUsers = 0; // Would need to fetch users for this
  const totalRevenue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const pending = products.filter(p => p.status === 'pending').length;

  const maxCount = Math.max(...categoryCounts.map(c => c.count), 1);

  return (
    <div className="reports-container">
      <div className="reports-grid">
        <div className="chart-card">
          <h4>📊 Monthly Revenue</h4>
          <div className="chart-placeholder">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => {
              const height = 40 + Math.random() * 80;
              return (
                <div key={month} className="chart-bar" style={{ height: `${height}px` }}>
                  <span className="bar-value">₵{(height * 100).toFixed(0)}</span>
                  <span className="bar-label">{month}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span><span className="legend-dot" style={{ background: '#2ecc71' }}></span> Revenue</span>
            <span><span className="legend-dot" style={{ background: '#0055a5' }}></span> Target</span>
          </div>
        </div>

        <div>
          <div className="chart-card" style={{ marginBottom: '16px' }}>
            <h4>📈 Top Categories</h4>
            <div className="top-categories">
              {categoryCounts.map((cat) => {
                const pct = Math.round((cat.count / maxCount) * 100);
                return (
                  <div key={cat.name} className="category-bar">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">{cat.count}</span>
                    <div className="category-track">
                      <div className="category-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-card">
            <h4>📋 Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-number" style={{ color: '#0055a5' }}>{totalProducts}</div>
                <div className="summary-label">Products</div>
              </div>
              <div className="summary-item">
                <div className="summary-number" style={{ color: '#2ecc71' }}>{totalUsers}</div>
                <div className="summary-label">Users</div>
              </div>
              <div className="summary-item">
                <div className="summary-number" style={{ color: '#f59e0b' }}>₵{totalRevenue.toLocaleString()}</div>
                <div className="summary-label">Revenue</div>
              </div>
              <div className="summary-item">
                <div className="summary-number" style={{ color: '#ef4444' }}>{pending}</div>
                <div className="summary-label">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsChart;