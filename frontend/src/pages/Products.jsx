// frontend/src/pages/Products.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import Footer from "../components/Footer";

// API
import { getProducts, getImageUrl } from "../services/api";

// ================================================================
// CATEGORY HELPERS
// ================================================================

const normalizeCategory = (category) => {
  if (!category) return "";

  const value = String(category).trim().toLowerCase();

  if (["phone", "phones", "mobile phone", "mobile phones"].includes(value)) {
    return "Phones";
  }

  if (["laptop", "laptops", "macbook", "macbooks"].includes(value)) {
    return "Laptops";
  }

  if (["tablet", "tablets", "ipad", "ipads"].includes(value)) {
    return "Tablets";
  }

  if (["tv", "tvs", "television", "televisions"].includes(value)) {
    return "TVs";
  }

  if (
    [
      "game console",
      "game consoles",
      "console",
      "consoles",
      "gaming console",
    ].includes(value)
  ) {
    return "Game Consoles";
  }

  if (["accessory", "accessories"].includes(value)) {
    return "Accessories";
  }

  return category;
};

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

    description,

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

    sellerId,
    seller,
    sellerName: sellerNameProp,
    sellerProfileImage: sellerProfileImageProp,

    status,
  } = product;

  // ==============================================================
  // NORMALIZED CATEGORY
  // ==============================================================

  const normalizedCategory = normalizeCategory(category);

  // ==============================================================
  // SIM STATUS MUST ONLY APPEAR FOR PHONES
  // ==============================================================

  const isPhone = normalizedCategory === "Phones";

  // ==============================================================
  // DEBUG
  // ==============================================================

  console.log(`📦 Product ${_id}:`, {
    title,
    category,
    normalizedCategory,
    simStatus,
    isPhone,
  });

  // ==============================================================
  // SELLER
  // ==============================================================

  const sellerObj =
    sellerId && typeof sellerId === "object"
      ? sellerId
      : seller && typeof seller === "object"
        ? seller
        : null;

  const sellerName =
    sellerObj?.name ||
    sellerNameProp ||
    "Unknown Seller";

  const sellerImage =
    sellerObj?.profileImage ||
    sellerObj?.avatar ||
    sellerObj?.photo ||
    sellerObj?.picture ||
    sellerProfileImageProp ||
    null;

  const sellerImageUrl = sellerImage
    ? sellerImage.startsWith("http")
      ? sellerImage
      : getImageUrl(sellerImage)
    : null;

  const isVerified = sellerObj?.isVerified === true;

  // ==============================================================
  // PRODUCT IMAGE
  // ==============================================================

  const imageUrl =
    images?.[0] ||
    image ||
    "/placeholder.png";

  // ==============================================================
  // PRICE
  // ==============================================================

  const formattedPrice = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
  }).format(price || 0);

  // ==============================================================
  // CATEGORY SPECIFICATIONS
  // ==============================================================

  const renderCategorySpecs = () => {
    const specs = [];

    // ------------------------------------------------------------
    // LAPTOPS
    // ------------------------------------------------------------

    if (normalizedCategory === "Laptops") {
      if (brand) {
        specs.push({
          icon: "🏷️",
          label: brand,
        });
      }

      if (model) {
        specs.push({
          icon: "📟",
          label: model,
        });
      }

      if (processor) {
        specs.push({
          icon: "⚡",
          label: processor,
        });
      }

      if (ram) {
        specs.push({
          icon: "🧠",
          label: ram,
        });
      }

      if (graphics) {
        specs.push({
          icon: "🖥️",
          label: graphics,
        });
      }

      if (screenSize) {
        specs.push({
          icon: "📐",
          label: screenSize,
        });
      }

      if (storage) {
        specs.push({
          icon: "💾",
          label: storage,
        });
      }
    }

    // ------------------------------------------------------------
    // TABLETS
    // ------------------------------------------------------------

    else if (normalizedCategory === "Tablets") {
      if (brand) {
        specs.push({
          icon: "🏷️",
          label: brand,
        });
      }

      if (model) {
        specs.push({
          icon: "📟",
          label: model,
        });
      }

      if (year) {
        specs.push({
          icon: "📅",
          label: year,
        });
      }

      if (connectivity) {
        specs.push({
          icon: "📶",
          label: connectivity,
        });
      }

      if (screenSize) {
        specs.push({
          icon: "📐",
          label: screenSize,
        });
      }

      if (storage) {
        specs.push({
          icon: "💾",
          label: storage,
        });
      }
    }

    // ------------------------------------------------------------
    // TVS
    // ------------------------------------------------------------

    else if (normalizedCategory === "TVs") {
      if (brand) {
        specs.push({
          icon: "🏷️",
          label: brand,
        });
      }

      if (model) {
        specs.push({
          icon: "📟",
          label: model,
        });
      }

      if (screenSize) {
        specs.push({
          icon: "📐",
          label: screenSize,
        });
      }

      if (connectivity) {
        specs.push({
          icon: "📶",
          label: connectivity,
        });
      }
    }

    // ------------------------------------------------------------
    // GAME CONSOLES
    // ------------------------------------------------------------

    else if (normalizedCategory === "Game Consoles") {
      if (brand) {
        specs.push({
          icon: "🏷️",
          label: brand,
        });
      }

      if (model) {
        specs.push({
          icon: "🎮",
          label: model,
        });
      }

      if (storage) {
        specs.push({
          icon: "💾",
          label: storage,
        });
      }

      if (connectivity) {
        specs.push({
          icon: "📶",
          label: connectivity,
        });
      }
    }

    // ------------------------------------------------------------
    // ACCESSORIES
    // ------------------------------------------------------------

    else if (normalizedCategory === "Accessories") {
      if (brand) {
        specs.push({
          icon: "🏷️",
          label: brand,
        });
      }

      if (model) {
        specs.push({
          icon: "📟",
          label: model,
        });
      }

      if (connectivity) {
        specs.push({
          icon: "📶",
          label: connectivity,
        });
      }
    }

    // ------------------------------------------------------------
    // PHONES
    // ------------------------------------------------------------

    else if (normalizedCategory === "Phones") {
      if (brand) {
        specs.push({
          icon: "🏷️",
          label: brand,
        });
      }

      if (model) {
        specs.push({
          icon: "📟",
          label: model,
        });
      }

      if (storage) {
        specs.push({
          icon: "💾",
          label: storage,
        });
      }

      if (batteryHealth) {
        specs.push({
          icon: "🔋",
          label: `${batteryHealth}%`,
        });
      }

      if (faceId) {
        specs.push({
          icon: "😊",
          label: faceId,
        });
      }
    }

    // ============================================================
    // CONDITION
    // ============================================================

    if (
      condition &&
      !specs.some((spec) => spec.label === condition)
    ) {
      specs.push({
        icon: "📋",
        label: condition,
      });
    }

    // ============================================================
    // MAX 4 SPECS ON CARD
    // ============================================================

    return specs
      .slice(0, 4)
      .map((spec, index) => (
        <span
          key={`${spec.label}-${index}`}
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

  // ==============================================================
  // RENDER
  // ==============================================================

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
        minWidth: 0,
      }}
    >
      {/* ==========================================================
          IMAGE
      ========================================================== */}

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

        {/* ========================================================
            SELLER AVATAR + VERIFIED BADGE (NO NAME)
        ======================================================== */}

        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "40px",
              height: "40px",
            }}
          >
            {sellerImageUrl ? (
              <img
                src={sellerImageUrl}
                alt={sellerName}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
                onError={(e) => {
                  // If the image fails, hide it and show the fallback
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  const fallback = parent.querySelector(".seller-avatar-fallback");
                  if (fallback) {
                    fallback.style.display = "flex";
                  }
                }}
              />
            ) : null}

            {/* Fallback avatar (shown when no image or image fails) */}
            <div
              className="seller-avatar-fallback"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "#e5e7eb",
                display: sellerImageUrl ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <i
                className="fas fa-user"
                style={{
                  fontSize: "18px",
                  color: "#9ca3af",
                }}
              />
            </div>

            {isVerified && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "18px",
                  height: "18px",
                  background: "#1DA1F2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 10.5L9.5 12.5L14 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            SOLD
        ======================================================== */}

        {status === "sold" && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "#dc2626",
              color: "white",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            SOLD
          </div>
        )}
      </Link>

      {/* ==========================================================
          PRODUCT INFORMATION
      ========================================================== */}

      <div
        style={{
          padding: "12px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* TITLE */}

        <Link
          to={`/product/${_id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
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

        {/* PRICE */}

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

        {/* LOCATION */}

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
          />

          {location || "Ghana"}
        </div>

        {/* ========================================================
            SPECIFICATIONS
        ======================================================== */}

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

          {/* ======================================================
              SIM STATUS — PHONES ONLY
          ====================================================== */}

          {isPhone && simStatus && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#0055a5",
                fontWeight: 600,
              }}
            >
              <i className="fas fa-sim-card" />
              SIM: {simStatus}
            </span>
          )}

          {/* ======================================================
              WARRANTY
          ====================================================== */}

          {warranty && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <i className="fas fa-shield-alt" />
              {warranty}
            </span>
          )}

          {/* ======================================================
              SWAP
          ====================================================== */}

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

        {/* ========================================================
            PRODUCT DESCRIPTION
            APPEARS BELOW ALL EXISTING PRODUCT DETAILS
        ======================================================== */}

        {description && String(description).trim() && (
          <div
            style={{
              marginTop: "2px",
              marginBottom: "12px",
              paddingTop: "8px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#555",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              Description
            </div>

            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#666",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {description}
            </p>
          </div>
        )}

        {/* ========================================================
            VIEW DETAILS
        ======================================================== */}

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
// PRODUCT SKELETON
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
            marginBottom: "10px",
          }}
        />

        <div
          style={{
            width: "80%",
            height: "38px",
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
// MAIN PRODUCTS PAGE
// ================================================================

const Products = () => {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const initialCategory =
    queryParams.get("category") || "all";

  const initialSearch =
    queryParams.get("search") || "";

  const initialSimStatus =
    queryParams.get("simStatus") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    location: "all",
    simStatus: initialSimStatus,
  });

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [verifiedOnly, setVerifiedOnly] =
    useState(false);

  const [discountOnly, setDiscountOnly] =
    useState(false);

  const [sortOption, setSortOption] =
    useState("recommended");

  const [currentPage, setCurrentPage] =
    useState(1);

  const ITEMS_PER_PAGE = 8;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ==============================================================
  // KEEP URL FILTERS IN SYNC
  // ==============================================================

  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );

    const category =
      params.get("category") || "all";

    const search =
      params.get("search") || "";

    const simStatus =
      params.get("simStatus") || "";

    setFilters((prev) => ({
      ...prev,
      category,
      search,
      simStatus,
    }));

    setCurrentPage(1);
  }, [location.search]);

  // ==============================================================
  // FETCH PRODUCTS
  // ==============================================================

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
          ? {
              category: filters.category,
            }
          : {}),

        ...(filters.location &&
        filters.location !== "all"
          ? {
              location: filters.location,
            }
          : {}),

        ...(filters.simStatus
          ? {
              simStatus: filters.simStatus,
            }
          : {}),

        ...(priceMin
          ? {
              priceMin,
            }
          : {}),

        ...(priceMax
          ? {
              priceMax,
            }
          : {}),

        ...(verifiedOnly
          ? {
              verified: true,
            }
          : {}),

        ...(discountOnly
          ? {
              discount: true,
            }
          : {}),

        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      const data =
        await getProducts(cleanFilters);

      if (cancelled) return;

      const productList =
        Array.isArray(data?.products)
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

      setTotal(data?.total || 0);

      setTotalPages(
        data?.totalPages || 1
      );
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
      setTotal(0);
      setTotalPages(1);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }, [
    filters.search,
    filters.category,
    filters.location,
    filters.simStatus,
    priceMin,
    priceMax,
    verifiedOnly,
    discountOnly,
    currentPage,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ==============================================================
  // SEARCH
  // ==============================================================

  const handleSearch = useCallback(
    (newFilters = {}) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));

      setCurrentPage(1);
    },
    []
  );

  // ==============================================================
  // CLEAR FILTERS
  // ==============================================================

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      location: "all",
      simStatus: "",
    });

    setPriceMin("");
    setPriceMax("");

    setVerifiedOnly(false);
    setDiscountOnly(false);

    setCurrentPage(1);
  };

  // ==============================================================
  // PAGINATION
  // ==============================================================

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================================================
  // SORT
  // ==============================================================

  const sortedProducts =
    React.useMemo(() => {
      if (!products.length) {
        return [];
      }

      const sorted = [...products];

      switch (sortOption) {
        case "price-asc":
          sorted.sort(
            (a, b) =>
              (a.price || 0) -
              (b.price || 0)
          );
          break;

        case "price-desc":
          sorted.sort(
            (a, b) =>
              (b.price || 0) -
              (a.price || 0)
          );
          break;

        case "newest":
          sorted.sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
          );
          break;

        default:
          break;
      }

      return sorted;
    }, [products, sortOption]);

  // ==============================================================
  // RENDER
  // ==============================================================

  return (
    <>
      {/* ==========================================================
          RESPONSIVE PRODUCT GRID
          4 COLUMNS ON LARGE SCREENS
      ========================================================== */}

      <style>
        {`
          .products-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            width: 100%;
          }

          @media (max-width: 1100px) {
            .products-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 800px) {
            .products-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 520px) {
            .products-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div
        className="products-page"
        style={{
          display: "flex",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 16px",
        }}
      >
        {/* ========================================================
            SIDEBAR
        ======================================================== */}

        <div className="filter-sidebar-wrapper">
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
            onClearFilters={
              handleClearFilters
            }
            activeCategory={
              filters.category
            }
            simStatus={
              filters.simStatus
            }
            setSimStatus={(value) =>
              setFilters((prev) => ({
                ...prev,
                simStatus: value,
              }))
            }
          />
        </div>

        {/* ========================================================
            MAIN CONTENT
        ======================================================== */}

        <main
          className="main-content"
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <SearchBar
              onSearch={handleSearch}
              initialQuery={filters}
            />
          </div>

          {/* ======================================================
              HEADER
          ====================================================== */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
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
                : `${total} results`}

              {filters.category !==
                "all" && (
                <>
                  {" "}
                  for{" "}
                  <span
                    style={{
                      color: "#0066cc",
                    }}
                  >
                    {filters.category}
                  </span>
                </>
              )}
            </h1>

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(
                  e.target.value
                )
              }
              style={{
                padding: "8px 12px",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "4px",
                fontSize: "14px",
                outline: "none",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="recommended">
                Recommended
              </option>

              <option value="price-asc">
                Price: Low to High
              </option>

              <option value="price-desc">
                Price: High to Low
              </option>

              <option value="newest">
                Newest
              </option>
            </select>
          </div>

          {/* ======================================================
              ERROR
          ====================================================== */}

          {error && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "30px 20px",
                marginBottom: "24px",
                color: "#dc2626",
                background: "#fef2f2",
                border:
                  "1px solid #fecaca",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  marginBottom:
                    "12px",
                }}
              >
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchProducts()
                }
                style={{
                  border: "none",
                  borderRadius: "4px",
                  padding:
                    "8px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                  background:
                    "#0066cc",
                  color: "white",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* ======================================================
              LOADING
          ====================================================== */}

          {loading ? (
            <div className="products-grid">
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <ProductSkeleton
                  key={index}
                />
              ))}
            </div>
          ) : sortedProducts.length ===
            0 ? (
            /* ====================================================
               EMPTY
            ==================================================== */

            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#777",
              }}
            >
              No ads found.

              <br />

              <Link
                to="/post-ad"
                style={{
                  display:
                    "inline-block",
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
              {/* ==================================================
                  PRODUCTS GRID
              ================================================== */}

              <div className="products-grid">
                {sortedProducts.map(
                  (product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  )
                )}
              </div>

              {/* ==================================================
                  PAGINATION
              ================================================== */}

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    gap: "8px",
                    marginTop: "32px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.max(
                          1,
                          currentPage - 1
                        )
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                    style={{
                      padding:
                        "8px 12px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "4px",
                      background:
                        "#fff",
                      cursor:
                        currentPage === 1
                          ? "default"
                          : "pointer",
                      opacity:
                        currentPage === 1
                          ? 0.5
                          : 1,
                      fontWeight: 600,
                    }}
                  >
                    Prev
                  </button>

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() =>
                        handlePageChange(
                          page
                        )
                      }
                      style={{
                        padding:
                          "8px 12px",
                        border:
                          page ===
                          currentPage
                            ? "1px solid #0066cc"
                            : "1px solid #e5e7eb",
                        borderRadius:
                          "4px",
                        background:
                          page ===
                          currentPage
                            ? "#0066cc"
                            : "#fff",
                        color:
                          page ===
                          currentPage
                            ? "#fff"
                            : "#333",
                        cursor:
                          "pointer",
                        fontWeight:
                          page ===
                          currentPage
                            ? 700
                            : 400,
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(
                          totalPages,
                          currentPage + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    style={{
                      padding:
                        "8px 12px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "4px",
                      background:
                        "#fff",
                      cursor:
                        currentPage ===
                        totalPages
                          ? "default"
                          : "pointer",
                      opacity:
                        currentPage ===
                        totalPages
                          ? 0.5
                          : 1,
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

      <Footer />
    </>
  );
};

export default Products;