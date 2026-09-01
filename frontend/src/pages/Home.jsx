// ============================================================
// frontend/src/pages/Home.jsx
// BuyUKUsed Home Page
// ============================================================

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import FeaturedSellers from "../components/FeaturedSellers";
import Footer from "../components/Footer";

import { getProducts, getImageUrl } from "../services/api";

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
    if (Array.isArray(data?.products)) {
      return data.products;
    }
    if (Array.isArray(data?.data?.products)) {
      return data.data.products;
    }
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
        const id = product._id || product.id || product.slug || `${product.title}-${product.price}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    },
    []
  );

  // ==========================================================
  // EXTRACT TOP SELLERS FROM PRODUCTS
  // ==========================================================

  const topSellers = useMemo(() => {
    const sellerMap = new Map();

    allProducts.forEach((product) => {
      // Try to get seller object from multiple possible locations
      let seller = product.seller || product.sellerId || null;
      // If seller is a string (just an ID), we cannot get the name, so skip
      if (typeof seller === 'string') return;
      if (!seller || !seller._id) return;

      const sellerId = seller._id.toString();
      const existing = sellerMap.get(sellerId);

      // Build avatar URL – handle both Cloudinary paths and full URLs
      let avatar = null;
      const imageField = seller.profileImage || seller.avatar || seller.photo || seller.picture || null;
      if (imageField) {
        if (typeof imageField === 'string' && (imageField.startsWith('http://') || imageField.startsWith('https://'))) {
          avatar = imageField; // Full URL – use as is
        } else {
          avatar = getImageUrl(imageField); // Path – prepend base URL
        }
      }

      if (existing) {
        // Increment product count
        existing.productCount += 1;
      } else {
        // New seller – store name and profile image
        const name = seller.name || seller.shopName || 'Unknown Seller';
        sellerMap.set(sellerId, {
          _id: sellerId,
          name,
          avatar,
          productCount: 1,
          orders: 0, // Not available from product data – keep as 0
          country: '', // Not available – add later if needed
        });
      }
    });

    // Convert map to array, sort by product count descending, take top 8
    const sorted = Array.from(sellerMap.values())
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 8);

    // Add rank and ensure orders field
    return sorted.map((seller, index) => ({
      ...seller,
      rank: index + 1,
      orders: seller.productCount, // Using product count as "orders" for demo
      products: seller.productCount,
    }));
  }, [allProducts]);

  // ==========================================================
  // LOAD HOMEPAGE PRODUCTS
  // ==========================================================

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({
        page: 1,
        limit: 100,
      });
      const receivedProducts = extractProducts(data);
      const products = removeDuplicateProducts(receivedProducts);
      setAllProducts(products);
      setFilteredProducts(products);
      setActiveCategory(null);
    } catch (error) {
      console.error("❌ Failed to load homepage products:", error);
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
      const selectedCategory = String(category || "").trim();

      if (!selectedCategory || selectedCategory.toLowerCase() === "all") {
        setActiveCategory(null);
        setFilteredProducts(allProducts);
        return;
      }

      setActiveCategory(selectedCategory);
      setSearching(true);

      try {
        const data = await getProducts({
          category: selectedCategory,
          page: 1,
          limit: 100,
        });
        const receivedProducts = extractProducts(data);
        const products = removeDuplicateProducts(receivedProducts);
        setFilteredProducts(products);
      } catch (error) {
        console.error(`❌ Failed to load ${selectedCategory}:`, error);
        setFilteredProducts([]);
      } finally {
        setSearching(false);
      }
    },
    [allProducts, extractProducts, removeDuplicateProducts]
  );

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = useCallback(
    async (params = {}) => {
      setSearching(true);
      try {
        const searchParams = { ...params, page: 1, limit: 100 };
        const data = await getProducts(searchParams);
        const receivedProducts = extractProducts(data);
        const products = removeDuplicateProducts(receivedProducts);
        setAllProducts(products);
        setFilteredProducts(products);
        setActiveCategory(null);
      } catch (error) {
        console.error("❌ Search failed:", error);
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setSearching(false);
      }
    },
    [extractProducts, removeDuplicateProducts]
  );

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
        link="/products"
      />

      {/* ─── Top Sellers with real data and profile pictures ─── */}
      {topSellers.length > 0 && (
        <FeaturedSellers sellers={topSellers} />
      )}

      <Footer />
    </>
  );
};

export default Home;