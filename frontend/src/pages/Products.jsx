import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts } from '../api';

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';
  const initialSearch = queryParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    location: 'all',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts(filters);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleSearch = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Browse All Ads</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
        {loading ? 'Loading...' : `${products.length} ads found`}
      </p>

      <div style={{ marginBottom: '32px' }}>
        <SearchBar onSearch={handleSearch} initialQuery={filters} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
          No ads found. <a href="/post-ad" style={{ color: 'var(--primary)', fontWeight: 600 }}>Post your ad now!</a>
        </div>
      ) : (
        <div className="products-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;