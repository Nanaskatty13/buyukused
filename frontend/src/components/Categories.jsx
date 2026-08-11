import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  // { name: 'Cars', icon: 'fa-car' },
  { name: 'Phones', icon: 'fa-mobile-alt' },
  { name: 'Laptops', icon: 'fa-laptop' },
  { name: 'Apple', icon: 'fa-apple-alt' },
  { name: 'TV & Game Consoles', icon: 'fa-tv' },
  // { name: 'Real Estate', icon: 'fa-home' },
  // { name: 'Jobs', icon: 'fa-briefcase' },
  { name: 'Electronics', icon: 'fa-laptop' },
  // { name: 'Fashion', icon: 'fa-tshirt' },
  // { name: 'Home', icon: 'fa-couch' },
  // { name: 'Other', icon: 'fa-tag' },
  { name: 'Accessories', icon: 'fa-headphones' },

];

const Categories = ({ products = [] }) => {
  const getCount = (cat) => products.filter(p => p.category === cat).length;

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
            <i className="fas fa-th-large" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            Popular Categories
          </h2>
          <Link to="/products" className="section-link" style={{
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '14px',
          }}>View All <i className="fas fa-arrow-right"></i></Link>
        </div>

        <div className="categories-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '16px',
        }}>
          {categories.map(cat => (
            <Link to={`/products?category=${cat.name}`} key={cat.name} className="category-card" style={{
              background: 'white',
              padding: '20px 12px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <i className={`fas ${cat.icon}`} style={{
                fontSize: '32px',
                color: 'var(--primary)',
                display: 'block',
                marginBottom: '8px',
              }}></i>
              <div className="name" style={{ fontWeight: 600, fontSize: '13px' }}>{cat.name}</div>
              <div className="count" style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                {getCount(cat.name)} ads
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;