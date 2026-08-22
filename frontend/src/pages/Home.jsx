// ============================================================
// frontend/src/pages/Home.jsx
// BuyUKUsed Home Page
// ============================================================

import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

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
  // ==========================================================
  // STATE
  // ==========================================================

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);

  // ==========================================================
  // NORMALIZE API RESPONSE
  // ==========================================================

  const extractProducts = useCallback((data) => {
    // --------------------------------------------------------
    // Standard response
    // --------------------------------------------------------

    if (Array.isArray(data?.products)) {
      return data.products;
    }

    // --------------------------------------------------------
    // Some APIs return data.products
    // --------------------------------------------------------

    if (Array.isArray(data?.data?.products)) {
      return data.data.products;
    }

    // --------------------------------------------------------
    // Some APIs return the array directly
    // --------------------------------------------------------

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }, []);

  // ==========================================================
  // REMOVE DUPLICATE PRODUCTS
  // ==========================================================

  const removeDuplicateProducts = useCallback(
    (products = []) => {
      const seen = new Set();

      return products.filter((product) => {
        if (!product) return false;

        const id =
          product._id ||
          product.id ||
          product.slug ||
          `${product.title}-${product.price}`;

        if (seen.has(id)) {
          return false;
        }

        seen.add(id);

        return true;
      });
    },
    []
  );

  // ==========================================================
  // LOAD HOMEPAGE PRODUCTS
  // ==========================================================

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      console.log("========================================");
      console.log("🏠 LOADING HOMEPAGE PRODUCTS");

      const data = await getProducts({
        page: 1,
        limit: 100,
      });

      console.log("📦 HOMEPAGE API RESPONSE:", data);

      const receivedProducts = extractProducts(data);

      const products =
        removeDuplicateProducts(receivedProducts);

      console.log(
        "📦 PRODUCTS RECEIVED:",
        receivedProducts.length
      );

      console.log(
        "✅ UNIQUE PRODUCTS:",
        products.length
      );

      console.log(
        "📋 PRODUCT TITLES:",
        products.map((product) => ({
          id: product._id,
          title: product.title,
          category: product.category,
          price: product.price,
        }))
      );

      console.log("========================================");

      setAllProducts(products);
      setFilteredProducts(products);
      setActiveCategory(null);
    } catch (error) {
      console.error(
        "❌ Failed to load homepage products:",
        error
      );

      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [extractProducts, removeDuplicateProducts]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ==========================================================
  // CATEGORY SELECT
  // ==========================================================

  const handleCategorySelect = useCallback(
    async (category) => {
      const selectedCategory =
        String(category || "").trim();

      // ------------------------------------------------------
      // ALL / RESET
      // ------------------------------------------------------

      if (
        !selectedCategory ||
        selectedCategory.toLowerCase() === "all"
      ) {
        setActiveCategory(null);

        setFilteredProducts(allProducts);

        return;
      }

      // ------------------------------------------------------
      // ACTIVE CATEGORY
      // ------------------------------------------------------

      setActiveCategory(selectedCategory);
      setSearching(true);

      try {
        console.log("========================================");
        console.log(
          "🔎 CATEGORY REQUEST:",
          selectedCategory
        );

        const data = await getProducts({
          category: selectedCategory,
          page: 1,
          limit: 100,
        });

        console.log(
          "📦 CATEGORY RESPONSE:",
          data
        );

        const receivedProducts =
          extractProducts(data);

        const products =
          removeDuplicateProducts(
            receivedProducts
          );

        console.log(
          `✅ ${selectedCategory}: ${products.length} unique products`
        );

        console.log(
          "📋 CATEGORY PRODUCTS:",
          products.map((product) => ({
            id: product._id,
            title: product.title,
            category: product.category,
            price: product.price,
          }))
        );

        console.log("========================================");

        setFilteredProducts(products);
      } catch (error) {
        console.error(
          `❌ Failed to load ${selectedCategory}:`,
          error
        );

        setFilteredProducts([]);
      } finally {
        setSearching(false);
      }
    },
    [
      allProducts,
      extractProducts,
      removeDuplicateProducts,
    ]
  );

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = useCallback(
    async (params = {}) => {
      setSearching(true);

      try {
        const searchParams = {
          ...params,
          page: 1,
          limit: 100,
        };

        console.log("========================================");
        console.log(
          "🔎 SEARCH REQUEST:",
          searchParams
        );

        const data =
          await getProducts(searchParams);

        console.log(
          "📦 SEARCH RESPONSE:",
          data
        );

        const receivedProducts =
          extractProducts(data);

        const products =
          removeDuplicateProducts(
            receivedProducts
          );

        console.log(
          "✅ SEARCH PRODUCTS:",
          products.length
        );

        console.log("========================================");

        setAllProducts(products);
        setFilteredProducts(products);
        setActiveCategory(null);
      } catch (error) {
        console.error(
          "❌ Search failed:",
          error
        );

        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setSearching(false);
      }
    },
    [extractProducts, removeDuplicateProducts]
  );

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
  // DEBUG
  // ==========================================================

  console.log("🏠 HOME STATE:", {
    allProducts: allProducts.length,
    filteredProducts: filteredProducts.length,
    activeCategory,
    loading,
    searching,
  });

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ======================================================
          HERO
      ====================================================== */}

      <Hero onSearch={handleSearch} />

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <Categories
        products={allProducts}
        onCategorySelect={handleCategorySelect}
      />

      {/* ======================================================
          PRODUCTS
      ====================================================== */}

      <FeaturedProducts
        products={filteredProducts}
        loading={loading || searching}
        title={featuredTitle}
        link="/products"
      />

      {/* ======================================================
          FEATURED SELLERS
      ====================================================== */}

      <FeaturedSellers sellers={sellers} />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Footer />
    </>
  );
};

export default Home;