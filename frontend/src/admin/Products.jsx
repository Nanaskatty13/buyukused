import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../../api';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states – added simStatus
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    simStatus: searchParams.get('simStatus') || '',   // ✅ NEW
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Available categories (hardcoded – can be fetched from API later)
  const categories = ['Phones', 'Laptops', 'Tablets', 'Electronics', 'Accessories', 'TV & Game Consoles', 'Other'];
  const locations = ['Ghana', 'Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Tema', 'Cape Coast'];

  // SIM status options
  const simStatusOptions = ['eSIM Unlocked', 'SIM Unlocked', 'Locked', 'Bypass'];

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters };
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      const data = await getProducts(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL when filters change
  useEffect(() => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'limit') {
        params[key] = filters[key];
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      simStatus: '',    // ✅ also cleared
      page: 1,
      limit: 12,
    });
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>🛒 Browse Products</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
        {total > 0 ? `Showing ${products.length} of ${total} products` : 'No products found'}
      </p>

      {/* Filter Bar */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'flex-end',
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: '1' }}>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search products..."
            style={{
              flex: '1 1 180px',
              padding: '10px 14px',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
            }}
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            style={{
              padding: '10px 14px',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            style={{
              padding: '10px 14px',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* ✅ NEW: SIM Status filter */}
          <select
            name="simStatus"
            value={filters.simStatus}
            onChange={handleFilterChange}
            style={{
              padding: '10px 14px',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">All SIM Status</option>
            {simStatusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min Price"
              style={{
                width: '100px',
                padding: '10px 14px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
              }}
            />
            <span>–</span>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max Price"
              style={{
                width: '100px',
                padding: '10px 14px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: 'var(--gray-600)',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </form>
      </div>

      {/* Loading / Error */}
      {loading && <Loader />}
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3 style={{ color: 'var(--gray-500)', fontSize: '20px' }}>No products found</h3>
              <p style={{ color: 'var(--gray-400)' }}>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '24px',
            }}>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '40px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => goToPage(filters.page - 1)}
                disabled={filters.page === 1}
                style={{
                  padding: '8px 16px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
                  opacity: filters.page === 1 ? 0.5 : 1,
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  style={{
                    padding: '8px 14px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    background: page === filters.page ? 'var(--primary)' : 'white',
                    color: page === filters.page ? 'white' : 'var(--gray-700)',
                    fontWeight: page === filters.page ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(filters.page + 1)}
                disabled={filters.page === totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  cursor: filters.page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: filters.page === totalPages ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;