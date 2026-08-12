import React, { useState } from 'react';

const SearchBar = ({ onSearch, initialQuery = {} }) => {
  const [search, setSearch] = useState(initialQuery.search || '');
  const [category, setCategory] = useState(initialQuery.category || 'all');
  const [location, setLocation] = useState(initialQuery.location || 'all');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search, category, location });
  };

  return (
    <div className="search-wrapper">
      <form onSubmit={handleSubmit} className="search-box-modern">
        {/* Primary row: search input + search button */}
        <div className="search-primary">
          <div className="search-input-wrap">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products..."
              className="search-input"
              aria-label="Search"
            />
          </div>
          <button type="submit" className="search-submit">
            <i className="fas fa-arrow-right"></i>
            <span>Search</span>
          </button>
        </div>

        {/* Secondary row: filters */}
        <div className="search-filters">
          <div className="filter-group">
            <i className="fas fa-map-marker-alt filter-icon"></i>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Locations</option>
              <option value="Accra">Accra</option>
              <option value="Kumasi">Kumasi</option>
              <option value="Tema">Tema</option>
              <option value="Takoradi">Takoradi</option>
              <option value="Tamale">Tamale</option>
            </select>
          </div>

          <div className="filter-group">
            <i className="fas fa-list-ul filter-icon"></i>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="Phones">Phones</option>
              <option value="Laptops">Laptops</option>
              <option value="Tablets">Tablets</option>
              <option value="Accessories">Accessories</option>
              <option value="TV & Game Consoles">TV & Game Consoles</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;