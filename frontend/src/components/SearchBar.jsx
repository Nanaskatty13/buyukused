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
    <form onSubmit={handleSubmit} className="search-box" style={{
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      borderRadius: 'var(--radius-full)',
      display: 'flex',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      flexWrap: 'wrap',
    }}>
      <div className="field" style={{
        flex: 1,
        minWidth: '140px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderRight: '1px solid var(--gray-200)',
        background: 'white',
      }}>
        <i className="fas fa-search" style={{ color: 'var(--gray-400)', marginRight: '10px' }}></i>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="What are you looking for?"
          style={{
            border: 'none',
            outline: 'none',
            padding: '14px 0',
            fontSize: '15px',
            fontFamily: 'inherit',
            width: '100%',
            background: 'transparent',
            color: 'var(--gray-800)',
          }}
        />
      </div>
      <div className="field" style={{
        flex: 1,
        minWidth: '120px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderRight: '1px solid var(--gray-200)',
        background: 'white',
      }}>
        <i className="fas fa-map-marker-alt" style={{ color: 'var(--gray-400)', marginRight: '10px' }}></i>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            padding: '14px 0',
            fontSize: '15px',
            fontFamily: 'inherit',
            width: '100%',
            background: 'transparent',
            color: 'var(--gray-800)',
          }}
        >
          <option value="all">All Locations</option>
          <option value="Accra">Accra</option>
          <option value="Kumasi">Kumasi</option>
          <option value="Tema">Tema</option>
          <option value="Takoradi">Takoradi</option>
          <option value="Tamale">Tamale</option>
        </select>
      </div>
      <div className="field" style={{
        flex: 1,
        minWidth: '120px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderRight: '1px solid var(--gray-200)',
        background: 'white',
      }}>
        <i className="fas fa-list-ul" style={{ color: 'var(--gray-400)', marginRight: '10px' }}></i>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            padding: '14px 0',
            fontSize: '15px',
            fontFamily: 'inherit',
            width: '100%',
            background: 'transparent',
            color: 'var(--gray-800)',
          }}
        >
          <option value="all">All Categories</option>
          <option value="Cars">Cars</option>
          <option value="Phones">Phones</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Jobs">Jobs</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home">Home</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <button type="submit" className="search-btn" style={{
        background: 'var(--secondary)',
        border: 'none',
        padding: '14px 36px',
        fontWeight: 700,
        fontSize: '16px',
        color: 'white',
        cursor: 'pointer',
        transition: 'var(--transition)',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        whiteSpace: 'nowrap',
      }}>
        <i className="fas fa-search"></i> Search
      </button>
    </form>
  );
};

export default SearchBar;