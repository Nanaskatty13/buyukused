import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import FeaturedSellers from '../components/FeaturedSellers';
import Footer from '../components/Footer';
import { getProducts } from '../services/api';

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);     // full list
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  // ─── Load products ───
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ─── Handle category selection ───
  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    if (category === 'all' || !category) {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => p.category === category);
      setFilteredProducts(filtered);
    }
  };

  // ─── Handle search (from Hero) ───
  const handleSearch = async (params) => {
    setLoading(true);
    try {
      const data = await getProducts(params);
      setAllProducts(data.products || []);
      setFilteredProducts(data.products || []);
      setActiveCategory(null); // reset category when search is performed
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
      <Categories
        products={allProducts}
        onCategorySelect={handleCategorySelect}
      />
      <FeaturedProducts
        products={filteredProducts}
        loading={loading}
        title={activeCategory ? `Products in ${activeCategory}` : 'Featured Products'}
      />
      <FeaturedSellers sellers={sellers} />
      <Footer />
    </>
  );
};

export default Home;