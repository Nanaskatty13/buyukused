// frontend/src/pages/SearchResultsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";

// API
import { getProducts, getImageUrl } from "../services/api";

// ================================================================
// PRODUCT CARD (Tonaton Style)
// ================================================================

const ProductCard = ({ product }) => {
  if (!product) return null;

  const {
    _id,
    title,
    price,
    location,
    images,
    image,
    storage,
    simStatus,
    swapAccepted,
    condition,
    category,
    warranty,
    brand,
    model,
    processor,
    ram,
    screenSize,
    graphics,
    year,
    connectivity,
    batteryHealth,
    faceId,
  } = product;

  const imageUrl = images?.[0] || image || "/placeholder.png";

  const formattedPrice = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
  }).format(price || 0);

  const renderCategorySpecs = () => {
    const specs = [];

    if (category === "Laptops") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (processor) specs.push({ icon: "⚡", label: processor });
      if (ram) specs.push({ icon: "🧠", label: ram });
      if (graphics) specs.push({ icon: "🖥️", label: graphics });
      if (screenSize) specs.push({ icon: "📐", label: screenSize });
    } else if (category === "Tablets") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (year) specs.push({ icon: "📅", label: year });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
      if (screenSize) specs.push({ icon: "📐", label: screenSize });
    } else if (category === "TVs" || category === "TV") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (screenSize) specs.push({ icon: "📐", label: screenSize });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
    } else if (category === "Game Consoles" || category === "Consoles") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
    } else if (category === "Accessories") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
    } else if (category === "Phones") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (batteryHealth) specs.push({ icon: "🔋", label: `${batteryHealth}%` });
      if (faceId) specs.push({ icon: "😊", label: faceId });
      if (simStatus) specs.push({ icon: "📶", label: simStatus });
    }

    if (storage) specs.push({ icon: "💾", label: storage });
    if (condition && !specs.some(s => s.label === condition)) {
      specs.push({ icon: "📋", label: condition });
    }

    return specs.slice(0, 4).map((spec, index) => (
      <span
        key={index}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        {spec.icon} {spec.label}
      </span>
    ));
  };

  return (
    <div
      className="product-card"
      style={{
        background: "#fff",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link
        to={`/product/${_id}`}
        style={{
          display: "block",
          overflow: "hidden",
          background: "#f4f5f7",
          position: "relative",
          paddingTop: "75%",
        }}
      >
        <img
          src={imageUrl}
          alt={title || "Product"}
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            transition: "transform 0.3s ease",
          }}
          onError={(e) => {
            if (e.currentTarget.src !== "/placeholder.png") {
              e.currentTarget.src = "/placeholder.png";
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        />
      </Link>

      <div
        style={{
          padding: "12px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link
          to={`/product/${_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 4px 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              color: "#333",
            }}
          >
            {title || "Untitled Product"}
          </h3>
        </Link>

        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#0066cc",
            margin: "4px 0",
          }}
        >
          {formattedPrice}
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#777",
            marginBottom: "8px",
          }}
        >
          <i
            className="fas fa-map-marker-alt"
            style={{ marginRight: "4px" }}
          ></i>
          {location || "Ghana"}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 12px",
            margin: "6px 0 10px 0",
            fontSize: "12px",
            color: "#666",
          }}
        >
          {renderCategorySpecs()}

          {warranty && (
            <span
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <i className="fas fa-shield-alt"></i>
              {warranty}
            </span>
          )}

          {swapAccepted !== undefined && (
            <span
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              {swapAccepted ? (
                <span style={{ color: "#22c55e" }}>🔄 Swap OK</span>
              ) : (
                <span style={{ color: "#94a3b8" }}>🚫 No swap</span>
              )}
            </span>
          )}
        </div>

        <Link
          to={`/product/${_id}`}
          style={{
            marginTop: "auto",
            padding: "8px 16px",
            background: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: 600,
            fontSize: "13px",
            textAlign: "center",
            textDecoration: "none",
            transition: "all 0.2s ease",
            display: "block",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#005bb5";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0066cc";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

// ================================================================
// PRODUCT SKELETON (Tonaton Style)
// ================================================================

const ProductSkeleton = () => {
  return (
    <div
      className="product-card"
      style={{
        background: "#fff",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "200px",
          background: "#f4f5f7",
        }}
      />
      <div style={{ padding: "14px" }}>
        <div
          style={{
            width: "80%",
            height: "18px",
            background: "#e5e7eb",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        />
        <div
          style={{
            width: "45%",
            height: "20px",
            background: "#e5e7eb",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        />
        <div
          style={{
            width: "60%",
            height: "14px",
            background: "#e5e7eb",
            borderRadius: "4px",
            marginBottom: "18px",
          }}
        />
        <div
          style={{
            width: "100%",
            height: "34px",
            background: "#e5e7eb",
            borderRadius: "4px",
          }}
        />
      </div>
    </div>
  );
};

// ================================================================
// MAIN SEARCH RESULTS PAGE
// ================================================================

const SearchResultsPage = () => {
  const location = useLocation();

  // --------------------------------------------------------------
  // INITIAL URL FILTERS
  // --------------------------------------------------------------

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";
  const initialCategory = queryParams.get("category") || "all";
  const initialLocation = queryParams.get("location") || "all";

  // --------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    location: initialLocation,
  });

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);

  const [sortOption, setSortOption] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // --------------------------------------------------------------
  // KEEP FILTERS IN SYNC WITH URL
  // --------------------------------------------------------------

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const category = params.get("category") || "all";
    const locationFilter = params.get("location") || "all";

    setFilters((previous) => {
      if (
        previous.search === search &&
        previous.category === category &&
        previous.location === locationFilter
      ) {
        return previous;
      }
      return {
        search,
        category,
        location: locationFilter,
      };
    });
  }, [location.search]);

  // --------------------------------------------------------------
  // FETCH PRODUCTS
  // --------------------------------------------------------------

  const fetchProducts = useCallback(async () => {
    let cancelled = false;

    setLoading(true);
    setError("");

    try {
      const cleanFilters = {
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.category && filters.category !== "all"
          ? { category: filters.category }
          : {}),
        ...(filters.location && filters.location !== "all"
          ? { location: filters.location }
          : {}),
        ...(priceMin ? { priceMin } : {}),
        ...(priceMax ? { priceMax } : {}),
        ...(verifiedOnly ? { verified: true } : {}),
        ...(discountOnly ? { discount: true } : {}),
      };

      const data = await getProducts(cleanFilters);

      if (cancelled) return;

      const productList = Array.isArray(data?.products)
        ? data.products
        : [];

      const processedProducts = productList.map((product) => ({
        ...product,
        images: Array.isArray(product.images)
          ? product.images
              .filter(Boolean)
              .map((img) => getImageUrl(img))
          : [],
        image: product.image ? getImageUrl(product.image) : null,
      }));

      setProducts(processedProducts);
      setCurrentPage(1);
    } catch (err) {
      if (cancelled) return;

      console.error("❌ Error fetching products:", err);
      setError(err?.message || "Unable to load products. Please try again.");
      setProducts([]);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [
    filters.search,
    filters.category,
    filters.location,
    priceMin,
    priceMax,
    verifiedOnly,
    discountOnly,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------

  const handleSearch = useCallback((newFilters = {}) => {
    setFilters((previous) => ({
      ...previous,
      ...newFilters,
    }));
  }, []);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      location: "all",
    });
    setPriceMin("");
    setPriceMax("");
    setVerifiedOnly(false);
    setDiscountOnly(false);
  };

  // --------------------------------------------------------------
  // SORTING & PAGINATION
  // --------------------------------------------------------------

  const sortedProducts = React.useMemo(() => {
    if (!products.length) return [];

    let sorted = [...products];

    switch (sortOption) {
      case "price-asc":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [products, sortOption]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------

  return (
    <div
      className="search-results-page"
      style={{
        display: "flex",
        gap: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px 16px",
      }}
    >
      {/* Sidebar with filters */}
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        priceMin={priceMin}
        setPriceMin={setPriceMin}
        priceMax={priceMax}
        setPriceMax={setPriceMax}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        discountOnly={discountOnly}
        setDiscountOnly={setDiscountOnly}
        onClearFilters={handleClearFilters}
        activeCategory={filters.category}
      />

      {/* Main content */}
      <main
        className="main-content"
        style={{ flex: 1, minWidth: 0 }}
      >
        {/* Search bar */}
        <div style={{ marginBottom: "24px" }}>
          <SearchBar
            onSearch={handleSearch}
            initialQuery={filters}
          />
        </div>

        {/* Results header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
              color: "#333",
            }}
          >
            {loading
              ? "Loading..."
              : `${sortedProducts.length} results`}
            {filters.search && (
              <>
                {" "}
                for{" "}
                <span style={{ color: "#0066cc" }}>
                  "{filters.search}"
                </span>
              </>
            )}
            {filters.category !== "all" && (
              <>
                {" "}
                in{" "}
                <span style={{ color: "#0066cc" }}>
                  {filters.category}
                </span>
              </>
            )}
          </h1>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "30px 20px",
              marginBottom: "24px",
              color: "#dc2626",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
            }}
          >
            <p style={{ marginBottom: "12px" }}>{error}</p>
            <button
              type="button"
              onClick={() => fetchProducts()}
              style={{
                border: "none",
                borderRadius: "4px",
                padding: "8px 18px",
                cursor: "pointer",
                fontWeight: 600,
                background: "#0066cc",
                color: "white",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div
            className="products-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : currentProducts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#777",
            }}
          >
            No results found.
            <br />
            <Link
              to="/post-ad"
              style={{
                display: "inline-block",
                marginTop: "10px",
                color: "#0066cc",
                fontWeight: 600,
              }}
            >
              Post your ad now!
            </Link>
          </div>
        ) : (
          <>
            {/* Products grid */}
            <div
              className="products-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              {currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "32px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    background: "#fff",
                    cursor: currentPage === 1 ? "default" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                    fontWeight: 600,
                  }}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      style={{
                        padding: "8px 12px",
                        border:
                          page === currentPage
                            ? "1px solid #0066cc"
                            : "1px solid #e5e7eb",
                        borderRadius: "4px",
                        background: page === currentPage ? "#0066cc" : "#fff",
                        color: page === currentPage ? "#fff" : "#333",
                        cursor: "pointer",
                        fontWeight: page === currentPage ? 700 : 400,
                      }}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    background: "#fff",
                    cursor: currentPage === totalPages ? "default" : "pointer",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    fontWeight: 600,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchResultsPage;