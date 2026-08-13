// `frontend/src/pages/Products.jsx`
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";

// API
import { getProducts, getImageUrl } from "../services/api";

// ================================================================
// PRODUCT CARD
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
    // ── Laptop / Tablet / TV / Console / Accessory fields ──
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

  const imageUrl =
    images?.[0] ||
    image ||
    "/placeholder.png";

  const formattedPrice = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
  }).format(price || 0);

  // ─── Helper: render category‑specific specs ──────────────────
  const renderCategorySpecs = () => {
    const specs = [];

    // Laptops
    if (category === "Laptops") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (processor) specs.push({ icon: "⚡", label: processor });
      if (ram) specs.push({ icon: "🧠", label: ram });
      if (graphics) specs.push({ icon: "🖥️", label: graphics });
      if (screenSize) specs.push({ icon: "📐", label: screenSize });
    }
    // Tablets
    else if (category === "Tablets") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (year) specs.push({ icon: "📅", label: year });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
      if (screenSize) specs.push({ icon: "📐", label: screenSize });
    }
    // TVs
    else if (category === "TVs" || category === "TV") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (screenSize) specs.push({ icon: "📐", label: screenSize });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
    }
    // Game Consoles
    else if (category === "Game Consoles" || category === "Consoles") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
    }
    // Accessories
    else if (category === "Accessories") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
    }
    // Phones (keep existing + additional)
    else if (category === "Phones") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (batteryHealth) specs.push({ icon: "🔋", label: `${batteryHealth}%` });
      if (faceId) specs.push({ icon: "😊", label: faceId });
      if (simStatus) specs.push({ icon: "📶", label: simStatus });
    }

    // Common: storage (if not already shown via category)
    if (storage) {
      specs.push({ icon: "💾", label: storage });
    }

    // Condition (if not already in the specs list, we add it)
    if (condition && !specs.some(s => s.label === condition)) {
      specs.push({ icon: "📋", label: condition });
    }

    // We'll show only first 4 to avoid clutter; we can limit
    const maxSpecs = 4;
    const displayed = specs.slice(0, maxSpecs);

    return displayed.map((spec, index) => (
      <span
        key={index}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "12px",
          color: "var(--gray-600)",
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
        background: "white",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: "1px solid var(--gray-200)",
        boxShadow: "var(--shadow-sm)",
        transition: "var(--transition)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* IMAGE */}
      <Link
        to={`/product/${_id}`}
        style={{
          display: "block",
          overflow: "hidden",
          background: "#f8fafc",
        }}
      >
        <img
          src={imageUrl}
          alt={title || "Product"}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
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

      {/* CONTENT */}
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
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              margin: "0 0 4px 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {title || "Untitled Product"}
          </h3>
        </Link>

        {/* PRICE */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--primary)",
            margin: "4px 0",
          }}
        >
          {formattedPrice}
        </div>

        {/* LOCATION */}
        <div
          style={{
            fontSize: "13px",
            color: "var(--gray-500)",
            marginBottom: "8px",
          }}
        >
          <i
            className="fas fa-map-marker-alt"
            style={{ marginRight: "4px" }}
          ></i>
          {location || "Ghana"}
        </div>

        {/* DETAILS / SPECS */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 12px",
            margin: "6px 0 10px 0",
            fontSize: "12px",
            color: "var(--gray-600)",
          }}
        >
          {/* ── Category‑specific specs ── */}
          {renderCategorySpecs()}

          {/* ── Common extra fields (not already shown) ── */}
          {warranty && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <i className="fas fa-shield-alt"></i>
              {warranty}
            </span>
          )}

          {swapAccepted !== undefined && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {swapAccepted ? (
                <span style={{ color: "#22c55e" }}>
                  🔄 Swap OK
                </span>
              ) : (
                <span style={{ color: "#94a3b8" }}>
                  🚫 No swap
                </span>
              )}
            </span>
          )}
        </div>

        {/* VIEW DETAILS */}
        <Link
          to={`/product/${_id}`}
          style={{
            marginTop: "auto",
            padding: "8px 16px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-full)",
            fontWeight: 600,
            fontSize: "13px",
            textAlign: "center",
            textDecoration: "none",
            transition: "var(--transition)",
            display: "inline-block",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "var(--primary-dark)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "var(--primary)";
          }}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

// ================================================================
// PRODUCT SKELETON
// ================================================================

const ProductSkeleton = () => {
  return (
    <div
      className="product-card"
      style={{
        background: "white",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: "1px solid var(--gray-200)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "200px",
          background: "#f1f5f9",
        }}
      />

      <div style={{ padding: "14px" }}>
        <div
          style={{
            width: "80%",
            height: "18px",
            background: "#f1f5f9",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        />

        <div
          style={{
            width: "45%",
            height: "20px",
            background: "#f1f5f9",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        />

        <div
          style={{
            width: "60%",
            height: "14px",
            background: "#f1f5f9",
            borderRadius: "6px",
            marginBottom: "18px",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "34px",
            background: "#f1f5f9",
            borderRadius: "20px",
          }}
        />
      </div>
    </div>
  );
};

// ================================================================
// MAIN PRODUCTS PAGE
// ================================================================

const Products = () => {
  const location = useLocation();

  // --------------------------------------------------------------
  // INITIAL URL FILTERS
  // --------------------------------------------------------------

  const queryParams = new URLSearchParams(location.search);

  const initialCategory =
    queryParams.get("category") || "all";

  const initialSearch =
    queryParams.get("search") || "";

  // --------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    location: "all",
  });

  // --------------------------------------------------------------
  // KEEP FILTERS IN SYNC WITH URL
  // --------------------------------------------------------------

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const category =
      params.get("category") || "all";

    const search =
      params.get("search") || "";

    setFilters((previous) => {
      if (
        previous.category === category &&
        previous.search === search
      ) {
        return previous;
      }

      return {
        ...previous,
        category,
        search,
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
        ...(filters.search
          ? { search: filters.search }
          : {}),

        ...(filters.category &&
        filters.category !== "all"
          ? { category: filters.category }
          : {}),

        ...(filters.location &&
        filters.location !== "all"
          ? { location: filters.location }
          : {}),
      };

      const data = await getProducts(cleanFilters);

      if (cancelled) return;

      const productList = Array.isArray(
        data?.products
      )
        ? data.products
        : [];

      const processedProducts =
        productList.map((product) => {
          const processedImages =
            Array.isArray(product.images)
              ? product.images
                  .filter(Boolean)
                  .map((img) =>
                    getImageUrl(img)
                  )
              : [];

          const processedImage =
            product.image
              ? getImageUrl(product.image)
              : null;

          return {
            ...product,
            images: processedImages,
            image: processedImage,
          };
        });

      setProducts(processedProducts);
    } catch (err) {
      if (cancelled) return;

      console.error(
        "❌ Error fetching products:",
        err
      );

      setError(
        err?.message ||
          "Unable to load products. Please try again."
      );

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
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const cleanFilters = {
          ...(filters.search
            ? { search: filters.search }
            : {}),

          ...(filters.category &&
          filters.category !== "all"
            ? { category: filters.category }
            : {}),

          ...(filters.location &&
          filters.location !== "all"
            ? { location: filters.location }
            : {}),
        };

        const data =
          await getProducts(cleanFilters);

        if (cancelled) return;

        const productList = Array.isArray(
          data?.products
        )
          ? data.products
          : [];

        const processedProducts =
          productList.map((product) => ({
            ...product,

            images: Array.isArray(
              product.images
            )
              ? product.images
                  .filter(Boolean)
                  .map((img) =>
                    getImageUrl(img)
                  )
              : [],

            image: product.image
              ? getImageUrl(product.image)
              : null,
          }));

        setProducts(processedProducts);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "❌ Error fetching products:",
          err
        );

        setError(
          err?.message ||
            "Unable to load products."
        );

        setProducts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    filters.search,
    filters.category,
    filters.location,
  ]);

  // --------------------------------------------------------------
  // SEARCH / FILTER
  // --------------------------------------------------------------

  const handleSearch = useCallback(
    (newFilters = {}) => {
      setFilters((previous) => ({
        ...previous,
        ...newFilters,
      }));
    },
    []
  );

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------

  return (
    <div
      className="container"
      style={{
        padding: "30px 20px",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 800,
          marginBottom: "8px",
        }}
      >
        Browse All Ads
      </h1>

      <p
        style={{
          color: "var(--gray-500)",
          marginBottom: "24px",
        }}
      >
        {loading
          ? "Loading products..."
          : `${products.length} ads found`}
      </p>

      {/* SEARCH */}
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <SearchBar
          onSearch={handleSearch}
          initialQuery={filters}
        />
      </div>

      {/* ERROR */}
      {error && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "30px 20px",
            marginBottom: "24px",
            color: "#dc2626",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
          }}
        >
          <p style={{ marginBottom: "12px" }}>
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              setFilters((previous) => ({
                ...previous,
              }));
            }}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading ? (
        <div className="products-grid">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <ProductSkeleton
                key={index}
              />
            )
          )}
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--gray-500)",
          }}
        >
          No ads found.

          <br />

          <Link
            to="/post-ad"
            style={{
              display: "inline-block",
              marginTop: "10px",
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            Post your ad now!
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;