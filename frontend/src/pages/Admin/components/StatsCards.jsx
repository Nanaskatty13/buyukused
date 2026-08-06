import React from 'react';

const StatsCards = ({ stats, products, users }) => {
  const totalUsers = users?.length || 0;
  const totalProducts = products?.length || 0;
  const totalSellers = users?.filter(u => u.role === 'seller').length || 0;
  const totalViews = products?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
  const totalRevenue = products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
  const pending = products?.filter(p => p.status === 'pending').length || 0;

  const cards = [
    { id: 'users', label: 'Total Users', value: totalUsers, icon: 'fa-users', color: '#0055a5' },
    { id: 'products', label: 'Total Products', value: totalProducts, icon: 'fa-box', color: '#2ecc71' },
    { id: 'sellers', label: 'Active Sellers', value: totalSellers, icon: 'fa-store', color: '#f59e0b' },
    { id: 'views', label: 'Total Views', value: totalViews.toLocaleString(), icon: 'fa-eye', color: '#8b5cf6' },
    { id: 'revenue', label: 'Revenue (GH₵)', value: `₵${totalRevenue.toLocaleString()}`, icon: 'fa-credit-card', color: '#0055a5' },
    { id: 'pending', label: 'Pending Approval', value: pending, icon: 'fa-clock', color: '#ef4444' },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.id} className="stat-card">
          <div className="stat-icon" style={{ color: card.color }}>
            <i className={`fas ${card.icon}`}></i>
          </div>
          <div className="stat-info">
            <div className="stat-label">{card.label}</div>
            <div className="stat-number">{card.value}</div>
            <span className="stat-change up">
              <i className="fas fa-arrow-up"></i> 12%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;