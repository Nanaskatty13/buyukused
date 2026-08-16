// frontend/src/components/Categories.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// ─── Icon mapping (FontAwesome) ──────────────────────────
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

  // If no products, show a default set
  const fallbackCategories = [
    'Phones', 'Laptops', 'Tablets', 'Accessories', 'TV & Game Consoles',
    'Cars', 'Real Estate', 'Jobs', 'Fashion', 'Home'
  ];

  const categories = Object.keys(categoryMap).length > 0
    ? Object.keys(categoryMap).map((name) => ({
        name,
        count: categoryMap[name],
        icon: getCategoryIcon(name),
      }))
    : fallbackCategories.map((name) => ({
        name,
        count: 0,
        icon: getCategoryIcon(name),
      }));

  // ─── Handler ──────────────────────────────────────────
  const handleCategoryClick = (catName) => {
    if (onCategorySelect) {
      onCategorySelect(catName);
    }
  };

  return (
    <section style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#333',
          margin: 0,
        }}>
          Browse Categories
        </h2>
        <Link
          to="/products"
          style={{
            color: '#0066cc',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          See All →
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
      }}>
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat.name)}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0066cc';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,204,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              margin: '0 auto 12px',
              background: '#f4f5f7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: '#0066cc',
            }}>
              <i className={`fas ${cat.icon}`}></i>
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '4px',
            }}>
              {cat.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#777',
            }}>
              {cat.count} {cat.count === 1 ? 'item' : 'items'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;