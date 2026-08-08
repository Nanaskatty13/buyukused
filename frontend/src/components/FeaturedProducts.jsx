import React from 'react';
import ProductCard from './ProductCard';

const FeaturedProducts = ({ products = [], title = 'Latest Ads', link = '/products' }) => {
  // Only show up to 8 products
  const display = products.slice(0, 8);

  // If no products, show a message
  if (display.length === 0) {
    return (
      <section className="section" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="section-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '8px 16px',
          }}>
            <h2 className="section-title" style={{ fontSize: '22px', fontWeight: 800 }}>
              <i className="fas fa-star" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              {title}
            </h2>
            <a href={link} className="section-link" style={{
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '14px',
            }}>View All <i className="fas fa-arrow-right"></i></a>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-500)' }}>
            No products available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="section-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '8px 16px',
        }}>
          <h2 className="section-title" style={{ fontSize: '22px', fontWeight: 800 }}>
            <i className="fas fa-star" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            {title}
          </h2>
          <a href={link} className="section-link" style={{
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '14px',
          }}>View All <i className="fas fa-arrow-right"></i></a>
        </div>

        <div className="products-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {display.map((product) => (
            // Pass the full product object – ProductCard will handle image rendering
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;