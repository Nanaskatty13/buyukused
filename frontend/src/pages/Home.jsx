// frontend/src/pages/Home.jsx

import React, { useEffect, useState, useCallback } from "react";

import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import FeaturedSellers from "../components/FeaturedSellers";
import Footer from "../components/Footer";

import { getProducts } from "../services/api";

// ============================================================
// HOME PAGE
// ============================================================

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);

  // ==========================================================
  // LOAD FEATURED PRODUCTS
  // ==========================================================

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * Do not request the entire marketplace here.
       *
       * The backend should return a limited number of products
       * for the homepage.
       */
      const data = await getProducts({
        limit: 12,
        page: 1,
      });

      const products = Array.isArray(data?.products)
        ? data.products
        : [];

      setAllProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error("❌ Failed to load homepage products:", error);

      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const data = await getProducts({
          limit: 12,
          page: 1,
        });

        if (!mounted) return;

        const products = Array.isArray(data?.products)
          ? data.products
          : [];

        setAllProducts(products);
        setFilteredProducts(products);
      } catch (error) {
        if (!mounted) return;

        console.error(
          "❌ Failed to load homepage products:",
          error
        );

        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // CATEGORY FILTER
  // ==========================================================

  const handleCategorySelect = useCallback(
    (category) => {
      setActiveCategory(category || null);

      if (!category || category === "all") {
        setFilteredProducts(allProducts);
        return;
      }

      const normalizedCategory = String(category)
        .trim()
        .toLowerCase();

      const filtered = allProducts.filter((product) => {
        const productCategory = String(
          product?.category || ""
        )
          .trim()
          .toLowerCase();

        return productCategory === normalizedCategory;
      });

      setFilteredProducts(filtered);
    },
    [allProducts]
  );

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = useCallback(async (params = {}) => {
    setSearching(true);

    try {
      const searchParams = {
        ...params,
        limit: 12,
        page: 1,
      };

      const data = await getProducts(searchParams);

      const products = Array.isArray(data?.products)
        ? data.products
        : [];

      setAllProducts(products);
      setFilteredProducts(products);

      setActiveCategory(null);
    } catch (error) {
      console.error("❌ Homepage search failed:", error);

      setFilteredProducts([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // ==========================================================
  // FEATURED SELLERS
  // ==========================================================

  const sellers = [
    {
      _id: "1",
      name: "KN Auto Dealer",
      productCount: 12,
    },
    {
      _id: "2",
      name: "Compuville Systems",
      productCount: 8,
    },
    {
      _id: "3",
      name: "KN Properties",
      productCount: 5,
    },
    {
      _id: "4",
      name: "KN Fashion Store",
      productCount: 15,
    },
  ];

  // ==========================================================
  // TITLE
  // ==========================================================

  const featuredTitle = activeCategory
    ? `Products in ${activeCategory}`
    : "Featured Products";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <Hero onSearch={handleSearch} />

      <Categories
        products={allProducts}
        onCategorySelect={handleCategorySelect}
      />

      <FeaturedProducts
        products={filteredProducts}
        loading={loading || searching}
        title={featuredTitle}
      />

      <FeaturedSellers sellers={sellers} />

      <Footer />
    </>
  );
};

export default Home;