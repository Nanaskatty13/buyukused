import React from 'react';

const FeaturedSellers = ({ sellers = [] }) => {
  if (sellers.length === 0) return null;

  return (
    <section className="section" style={{ padding: '40px 0', background: 'var(--gray-50)' }}>
      <div className="container">
        <div className="section-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 className="section-title" style={{ fontSize: '22px', fontWeight: 800 }}>
            <i className="fas fa-store" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            Featured Sellers
          </h2>
        </div>

        <div className="sellers-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}>
          {sellers.map(seller => (
            <div key={seller._id} className="seller-card" style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'var(--transition)',
            }}>
              <div className="avatar" style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 700,
                margin: '0 auto 12px',
              }}>{seller.name?.charAt(0).toUpperCase()}</div>
              <div className="name" style={{ fontWeight: 700, fontSize: '16px' }}>{seller.name}</div>
              <div className="products" style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                {seller.productCount || 0} products
              </div>
              <div className="rating" style={{ marginTop: '8px', color: '#f59e0b' }}>
                <i className="fas fa-star"></i> <span style={{ color: 'var(--gray-700)' }}>4.8</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSellers;