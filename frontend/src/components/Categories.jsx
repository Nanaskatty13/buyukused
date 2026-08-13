import React from 'react';
import { Link } from 'react-router-dom';

// ─── Icon mapping ──────────────────────────────────────────
const getCategoryIcon = (name) => {
  const icons = {
    'Phones': 'fa-mobile-alt',
    'Laptops': 'fa-laptop',
    'Tablets': 'fa-tablet-alt',
    'Accessories': 'fa-headphones',
    'TV & Game Consoles': 'fa-tv',
    'Electronics': 'fa-laptop',
    'Cars': 'fa-car',
    'Real Estate': 'fa-home',
    'Jobs': 'fa-briefcase',
    'Fashion': 'fa-tshirt',
    'Home': 'fa-couch',
    'Other': 'fa-tag',
  };
  return icons[name] || 'fa-tag';
};

// ─── Main Component ──────────────────────────────────────
const Categories = ({ products = [], onCategorySelect }) => {
  // ─── Build dynamic categories from products ───
  const categoryMap = {};
  products.forEach((p) => {
    const cat = p.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const categories = Object.keys(categoryMap).map((name) => ({
    name,
    count: categoryMap[name],
    icon: getCategoryIcon(name),
  }));

  // ─── Handlers ──────────────────────────────────────────
  const handleCategoryClick = (catName) => {
    if (onCategorySelect) {
      onCategorySelect(catName);
    }
  };

  // ─── Render ─────────────────────────────────────────────
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
          {categories.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', textAlign: 'center', gridColumn: '1 / -1' }}>
              No categories yet
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.name}
                className="category-card"
                onClick={() => handleCategoryClick(cat.name)}
                style={{
                  background: 'white',
                  padding: '20px 12px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <i className={`fas ${cat.icon}`} style={{
                  fontSize: '32px',
                  color: 'var(--primary)',
                  display: 'block',
                  marginBottom: '8px',
                }}></i>
                <div className="name" style={{ fontWeight: 600, fontSize: '13px' }}>{cat.name}</div>
                <div className="count" style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                  {cat.count} ad{cat.count !== 1 ? 's' : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;