import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';   // ✅ fixed: now points to services/api

const Wishlist = () => {
  const { favorites } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const data = await getProducts();
        const all = data.products || [];
        const favProducts = all.filter(p => favorites.includes(p._id));
        setProducts(favProducts);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [favorites]);

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>❤️ Your Favorites</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
        {loading ? 'Loading...' : `${products.length} saved items`}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
          No favorites yet. <a href="/products" style={{ color: 'var(--primary)', fontWeight: 600 }}>Browse ads</a>
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

export default Wishlist;