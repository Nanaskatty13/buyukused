// src/pages/Admin/components/StatsCards.jsx
import React from 'react';
import { 
  FaUsers, 
  FaBox, 
  FaStore, 
  FaEye, 
  FaCreditCard, 
  FaClock,
  FaShoppingCart,
  FaMotorcycle,
  FaChartBar,
  FaUserTimes,
  FaArrowRight
} from 'react-icons/fa';

const StatsCards = ({ stats, products, users, setActivePage }) => {
  // ─── Safely extract numbers ───────────────────────────────
  const totalUsers = users?.length || 0;
  const totalProducts = products?.length || 0;
  const totalSellers = users?.filter(u => u.role === 'seller').length || 0;
  const totalViews = products?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
  const totalRevenue = products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
  const pending = products?.filter(p => p.status === 'pending').length || 0;
  
  // Additional stats from the `stats` prop (if provided)
  const totalOrders = stats?.totalOrders || stats?.orders || 0;
  const totalRiders = stats?.totalRiders || stats?.riders || 0;
  const unverifiedUsers = users?.filter(u => !u.isVerified).length || 0;

  // ─── Card configuration ────────────────────────────────────
  const cards = [
    {
      key: 'users',
      label: 'Total Users',
      value: totalUsers,
      icon: FaUsers,
      color: '#0055a5',
      bg: '#e6f0ff',
      page: 'users',
    },
    {
      key: 'products',
      label: 'Total Products',
      value: totalProducts,
      icon: FaBox,
      color: '#2ecc71',
      bg: '#e6f9f0',
      page: 'products',
    },
    {
      key: 'sellers',
      label: 'Active Sellers',
      value: totalSellers,
      icon: FaStore,
      color: '#f59e0b',
      bg: '#fef3e6',
      page: 'sellers',
    },
    {
      key: 'orders',
      label: 'Orders',
      value: totalOrders,
      icon: FaShoppingCart,
      color: '#8b5cf6',
      bg: '#f0ebff',
      page: 'reports',
    },
    {
      key: 'riders',
      label: 'Riders',
      value: totalRiders,
      icon: FaMotorcycle,
      color: '#ef4444',
      bg: '#fee6e6',
      page: 'riders',
    },
    {
      key: 'revenue',
      label: 'Revenue (GH₵)',
      value: `₵${totalRevenue.toLocaleString()}`,
      icon: FaCreditCard,
      color: '#0055a5',
      bg: '#e6f0ff',
      page: 'reports',
    },
    {
      key: 'unverified',
      label: 'Unverified Users',
      value: unverifiedUsers,
      icon: FaUserTimes,
      color: '#dc2626',
      bg: '#fee6e6',
      page: 'users',
    },
    {
      key: 'pending',
      label: 'Pending Approval',
      value: pending,
      icon: FaClock,
      color: '#ef4444',
      bg: '#fee6e6',
      page: 'products',
    },
    {
      key: 'views',
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: FaEye,
      color: '#8b5cf6',
      bg: '#f0ebff',
      page: 'reports',
    },
  ];

  // ─── Handle click navigation ──────────────────────────────
  const handleCardClick = (page) => {
    if (setActivePage && page) {
      setActivePage(page);
    }
  };

  return (
    <div className="stats-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '28px',
    }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            onClick={() => handleCardClick(card.page)}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px 18px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              e.currentTarget.style.borderColor = '#f1f5f9';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: card.bg,
                color: card.color,
                fontSize: '22px',
              }}>
                <Icon />
              </div>
              {card.key === 'views' && (
                <FaArrowRight style={{ color: '#9ca3af', fontSize: '14px' }} />
              )}
            </div>
            <div>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#111827',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                {card.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: 500,
                marginTop: '2px',
              }}>
                {card.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;