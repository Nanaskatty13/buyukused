import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import FeaturedSellers from '../components/FeaturedSellers';
import Footer from '../components/Footer';

// ✅ Fixed: correct path to your API module
import { getProducts } from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSearch = async (params) => {
    setLoading(true);
    try {
      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock sellers – in real app, fetch from API
  const sellers = [
    { _id: '1', name: 'KN Auto Dealer', productCount: 12 },
    { _id: '2', name: 'Compuville Systems', productCount: 8 },
    { _id: '3', name: 'KN Properties', productCount: 5 },
    { _id: '4', name: 'KN Fashion Store', productCount: 15 },
  ];

  return (
    <>
      <Hero onSearch={handleSearch} />
      <Categories products={products} />
      <FeaturedProducts products={products} />
      <FeaturedSellers sellers={sellers} />
      <Footer />
    </>
  );
};

export default Home;