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
    <section className="categories-apple">
      <div className="categories-apple-header">
        <h2 className="categories-apple-title">
          <span className="categories-apple-icon">⌘</span> Browse Categories
        </h2>
        <Link to="/products" className="categories-apple-link">See All →</Link>
      </div>

      <div className="categories-apple-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="categories-apple-card"
            onClick={() => handleCategoryClick(cat.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat.name)}
          >
            <div className="categories-apple-icon-wrapper">
              <i className={`fas ${cat.icon}`}></i>
            </div>
            <div className="categories-apple-name">{cat.name}</div>
            <div className="categories-apple-count">
              {cat.count} {cat.count === 1 ? 'item' : 'items'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;