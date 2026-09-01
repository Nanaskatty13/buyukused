// frontend/src/pages/Products.jsx

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import Footer from "../components/Footer";

import { getProducts, getImageUrl } from "../services/api";

import VerifiedBadge from "../components/VerifiedBadge";
import SoldBadge from "../components/SoldBadge";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// ================================================================
// CATEGORY HELPERS
// ================================================================

const normalizeCategory = (category) => {
  if (!category) return "";

  const value = String(category).trim().toLowerCase();

  if (
    ["phone", "phones", "mobile phone", "mobile phones"].includes(value)
  ) {
    return "Phones";
  }

  if (
    ["laptop", "laptops", "macbook", "macbooks"].includes(value)
  ) {
    return "Laptops";
  }

  if (
    ["tablet", "tablets", "ipad", "ipads"].includes(value)
  ) {
    return "Tablets";
  }

  if (
    ["tv", "tvs", "television", "televisions"].includes(value)
  ) {
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

  if (["real estate", "property"].includes(value)) {
    return "Real Estate";
  }

  return category;
};

// ================================================================
// PRODUCT CARD – heavily memoised
// ================================================================

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { toggleFavorite, isFavorite } = useCart();
  const { user } = useAuth();

  if (!product) return null;

  const {
    _id,
    title,
    price,
    location: productLocation,
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
    popular = false,
  } = product;

  // ==============================================================
  // FAVORITE
  // ==============================================================

  const liked = Boolean(isFavorite(_id));

  const handleFavorite = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        navigate("/login", {
          state: { from: location.pathname + location.search },
        });
        return;
      }
      toggleFavorite(_id);
    },
    [user, _id, navigate, location.pathname, location.search, toggleFavorite]
  );

  // ==============================================================
  // CATEGORY
  // ==============================================================

  const normalizedCategory = useMemo(
    () => normalizeCategory(category),
    [category]
  );

  const isPhone = useMemo(() => normalizedCategory === "Phones", [normalizedCategory]);
  const isProperty = useMemo(
    () => normalizedCategory === "Real Estate" || normalizedCategory === "Property",
    [normalizedCategory]
  );

  // ==============================================================
  // SELLER – memoised
  // ==============================================================

  const sellerObj = useMemo(() => {
    return sellerId && typeof sellerId === "object"
      ? sellerId
      : seller && typeof seller === "object"
      ? seller
      : null;
  }, [sellerId, seller]);

  const sellerName = useMemo(
    () => sellerObj?.name || sellerNameProp || "Unknown Seller",
    [sellerObj, sellerNameProp]
  );

  const sellerImage = useMemo(
    () =>
      sellerObj?.profileImage ||
      sellerObj?.avatar ||
      sellerObj?.photo ||
      sellerObj?.picture ||
      sellerProfileImageProp ||
      null,
    [sellerObj, sellerProfileImageProp]
  );

  const sellerImageUrl = useMemo(
    () => (sellerImage ? getImageUrl(sellerImage) : null),
    [sellerImage]
  );

  const isVerified = useMemo(() => sellerObj?.isVerified === true, [sellerObj]);
  const yearsOnPlatform = useMemo(() => sellerObj?.yearsOnPlatform || 0, [sellerObj]);
  const accountType = useMemo(() => sellerObj?.accountType || "", [sellerObj]);

  // ==============================================================
  // ACCOUNT BADGE – memoised
  // ==============================================================

  const accountBadge = useMemo(() => {
    const type = accountType.toLowerCase();
    if (type === "diamond") {
      return { label: "💎 DIAMOND", color: "#0ea5e9", bg: "#e0f2fe" };
    }
    if (type === "vip") {
      return { label: "⭐ VIP", color: "#f59e0b", bg: "#fef3c7" };
    }
    if (type === "enterprise") {
      return { label: "🏢 ENTERPRISE", color: "#8b5cf6", bg: "#ede9fe" };
    }
    return null;
  }, [accountType]);

  // ==============================================================
  // IMAGE – optimised with Cloudinary
  // ==============================================================

  const rawImage = useMemo(() => images?.[0] || image || null, [images, image]);

  const imageUrl = useMemo(() => {
    if (!rawImage) return "/placeholder.png";
    let url = getImageUrl(rawImage);
    if (url.includes('res.cloudinary.com')) {
      // Thumbnail: 400x300, auto format & quality
      url = url.replace('/image/upload/', '/image/upload/w_400,h_300,c_fill,f_auto,q_auto/');
    }
    return url;
  }, [rawImage]);

  // ==============================================================
  // PRICE – memoised
  // ==============================================================

  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 0,
      }).format(price || 0),
    [price]
  );

  // ==============================================================
  // CITY – memoised
  // ==============================================================

  const cityOnly = useMemo(() => {
    if (!productLocation) return "";
    const parts = String(productLocation).split(",").map((s) => s.trim());
    return parts[0] || productLocation;
  }, [productLocation]);

  // ==============================================================
  // LOCATION FILTER – stabilised
  // ==============================================================

  const handleLocationFilter = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!cityOnly) return;
      const params = new URLSearchParams(location.search);
      params.set("location", cityOnly);
      navigate(`/products?${params.toString()}`);
    },
    [cityOnly, location.search, navigate]
  );

  // ==============================================================
  // CATEGORY SPECS – memoised
  // ==============================================================

  const categorySpecs = useMemo(() => {
    const specs = [];
    if (normalizedCategory === "Laptops") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (processor) specs.push({ icon: "⚡", label: processor });
      if (ram) specs.push({ icon: "🧠", label: ram });
      if (graphics) specs.push({ icon: "🖥️", label: graphics });
      if (screenSize) specs.push({ icon: "📐", label: screenSize });
      if (storage) specs.push({ icon: "💾", label: storage });
      if (condition) specs.push({ icon: "📋", label: condition });
    } else if (normalizedCategory === "Tablets") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (year) specs.push({ icon: "📅", label: year });
      if (connectivity) specs.push({ icon: "📶", label: connectivity });
      if (screenSize) specs.push({ icon: "📐", label: screenSize });
      if (storage) specs.push({ icon: "💾", label: storage });
      if (condition) specs.push({ icon: "📋", label: condition });
    } else if (normalizedCategory === "Phones") {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (storage) specs.push({ icon: "💾", label: storage });
      if (batteryHealth) specs.push({ icon: "🔋", label: `${batteryHealth}%` });
      if (faceId) specs.push({ icon: "😊", label: faceId });
      if (condition) specs.push({ icon: "📋", label: condition });
    } else if (isProperty) {
      if (product.bedrooms) specs.push({ icon: "🛏️", label: `${product.bedrooms} bedrooms` });
      if (product.bathrooms) specs.push({ icon: "🚿", label: `${product.bathrooms} baths` });
      if (product.sqm) specs.push({ icon: "📐", label: `${product.sqm} sqm` });
      if (product.propertyType) specs.push({ icon: "🏠", label: product.propertyType });
      if (condition) specs.push({ icon: "📋", label: condition });
    } else {
      if (brand) specs.push({ icon: "🏷️", label: brand });
      if (model) specs.push({ icon: "📟", label: model });
      if (storage) specs.push({ icon: "💾", label: storage });
      if (condition) specs.push({ icon: "📋", label: condition });
    }
    return specs.slice(0, 4);
  }, [
    normalizedCategory,
    brand,
    model,
    processor,
    ram,
    graphics,
    screenSize,
    storage,
    condition,
    year,
    connectivity,
    batteryHealth,
    faceId,
    isProperty,
    product,
  ]);

  // Render specs as JSX (memoised via callback)
  const renderCategorySpecs = useCallback(() => {
    return categorySpecs.map((spec, index) => (
      <span
        key={`${spec.label}-${index}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "12px",
          color: "#6b7280",
        }}
      >
        {spec.icon} {spec.label}
      </span>
    ));
  }, [categorySpecs]);

  const isSold = useMemo(() => status === "sold", [status]);

  // ==============================================================
  // CHAT / CALL – stabilised
  // ==============================================================

  const handleChat = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/product/${_id}?openChat=true`);
    },
    [_id, navigate]
  );

  const handleCall = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rawPhone = sellerObj?.phone || "";
      let phone = String(rawPhone).replace(/\D/g, "");
      if (phone.startsWith("0") && phone.length === 10) {
        phone = "233" + phone.substring(1);
      }
      if (!phone || phone.length < 10) {
        alert("This seller has not provided a valid phone number.");
        return;
      }
      window.location.href = `tel:+${phone}`;
    },
    [sellerObj?.phone]
  );

  // ==============================================================
  // RENDER
  // ==============================================================

  return (
    <div
      className="product-card"
      style={{
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* IMAGE */}
      <Link
        to={`/product/${_id}`}
        className="product-image-wrapper"
        style={{
          display: "block",
          overflow: "hidden",
          background: "#f4f5f7",
          position: "relative",
          width: "100%",
        }}
      >
        <img
          src={imageUrl}
          alt={title || "Product"}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            transition: "transform 0.3s ease",
          }}
          onError={(e) => {
            if (e.currentTarget.src !== "/placeholder.png") {
              e.currentTarget.src = "/placeholder.png";
            }
          }}
        />

        {isSold && <SoldBadge variant="card" />}

        {/* TOP LEFT BADGES */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            zIndex: 2,
          }}
        >
          {isVerified && (
            <span
              style={{
                background: "#1DA1F2",
                color: "white",
                fontSize: "8px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "8px",
                textTransform: "uppercase",
                display: "inline-block",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                letterSpacing: "0.3px",
              }}
            >
              ✓ Verified ID
            </span>
          )}
          {popular && (
            <span
              style={{
                background: "#f59e0b",
                color: "white",
                fontSize: "8px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "8px",
                textTransform: "uppercase",
                display: "inline-block",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              ★ Popular
            </span>
          )}
          {yearsOnPlatform >= 5 && (
            <span
              style={{
                background: "#10b981",
                color: "white",
                fontSize: "8px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "8px",
                textTransform: "uppercase",
                display: "inline-block",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              {yearsOnPlatform}+ years on Jiji
            </span>
          )}
        </div>

        {/* FAVOURITE HEART */}
        <button
          type="button"
          className={`favorite-button ${liked ? "favorite-active" : ""}`}
          onClick={handleFavorite}
          aria-label={liked ? "Remove from favorites" : "Add to favorites"}
          title={liked ? "Remove from favorites" : "Add to favorites"}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 5,
            color: liked ? "#e11d48" : "#374151",
            fontSize: "18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.16)",
            transition: "all 0.2s ease",
            backdropFilter: "blur(6px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.background = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <i
            className={liked ? "fas fa-heart" : "far fa-heart"}
            style={{
              color: liked ? "#e11d48" : "#374151",
              transition: "color 0.2s ease, transform 0.2s ease",
            }}
          />
        </button>
      </Link>

      {/* PRODUCT INFORMATION */}
      <div
        style={{
          padding: "12px 14px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* TITLE */}
        <Link
          to={`/product/${_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            className="title"
            style={{
              fontWeight: 600,
              fontSize: "15px",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: "#111827",
              marginBottom: "2px",
            }}
          >
            {title || "Untitled Product"}
          </div>
        </Link>

        {/* PRICE */}
        <div
          className="price"
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: isSold ? "#9ca3af" : "#0066cc",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {formattedPrice}
          {isSold && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#dc2626",
                background: "#fee2e2",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              SOLD
            </span>
          )}
        </div>

        {/* LOCATION + CONDITION with clickable location badge */}
        <div
          className="location-condition"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "2px",
            flexWrap: "wrap",
          }}
        >
          {cityOnly && (
            <button
              type="button"
              onClick={handleLocationFilter}
              style={{
                background: "#eef2ff",
                color: "#4f46e5",
                border: "1px solid #c7d2fe",
                borderRadius: "9999px",
                padding: "1px 10px",
                fontSize: "10px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "background 0.15s, transform 0.1s",
                fontFamily: "inherit",
                lineHeight: "1.6",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e0e7ff";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#eef2ff";
                e.currentTarget.style.transform = "scale(1)";
              }}
              title={`Filter by ${cityOnly}`}
            >
              <i className="fas fa-map-pin" style={{ fontSize: "9px" }} />
              loc:{cityOnly}
            </button>
          )}
          <span>•</span>
          <span>{condition || "Used"}</span>
        </div>

        {/* SPECS */}
        <div
          className="specs-row"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 10px",
            fontSize: "12px",
            color: "#6b7280",
            margin: "6px 0 8px",
          }}
        >
          {renderCategorySpecs()}
          {warranty && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <i className="fas fa-shield-alt" /> {warranty}
            </span>
          )}
          {isPhone && simStatus && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                color: "#0055a5",
                fontWeight: 600,
              }}
            >
              <i className="fas fa-sim-card" /> SIM: {simStatus}
            </span>
          )}
          <span>{swapAccepted ? "🔄 Swap OK" : "🚫 No swap"}</span>
        </div>

        {/* DESCRIPTION – full text */}
        {description && String(description).trim() && (
          <div
            className="product-description"
            style={{
              margin: "4px 0 6px",
              fontSize: "12px",
              lineHeight: 1.4,
              color: "#6b7280",
              wordBreak: "break-word",
            }}
          >
            {description}
          </div>
        )}

        {/* SELLER */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingTop: "10px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          {sellerImageUrl ? (
            <img
              src={sellerImageUrl}
              alt={sellerName}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #e5e7eb",
              }}
            />
          ) : (
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              <i className="fas fa-user" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#111827",
                }}
              >
                {sellerName}
              </span>
              {isVerified && <VerifiedBadge size={12} />}
            </div>
            {accountBadge && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: accountBadge.color,
                  background: accountBadge.bg,
                  padding: "1px 6px",
                  borderRadius: "10px",
                  display: "inline-block",
                  marginTop: "2px",
                }}
              >
                {accountBadge.label}
              </span>
            )}
          </div>
          {yearsOnPlatform >= 3 && (
            <span
              style={{
                fontSize: "10px",
                color: "#6b7280",
                whiteSpace: "nowrap",
              }}
            >
              {yearsOnPlatform}+ yrs
            </span>
          )}
        </div>

        {/* CONTACT BUTTONS */}
        {sellerObj?.phone && (
          <div
            className="contact-buttons"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <button
              onClick={handleChat}
              className="contact-btn chat-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "5px 12px",
                borderRadius: "16px",
                border: "none",
                background: "#25D366",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
                flex: 1,
                minHeight: "28px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1ebe5c")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#25D366")}
            >
              <i className="fas fa-comment-dots" style={{ fontSize: "13px" }} />
              CHAT
            </button>
            <button
              onClick={handleCall}
              className="contact-btn call-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "5px 12px",
                borderRadius: "16px",
                border: "none",
                background: "#3b82f6",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
                flex: 1,
                minHeight: "28px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
            >
              <i className="fas fa-phone" style={{ fontSize: "13px" }} />
              CALL
            </button>
          </div>
        )}

        {/* VIEW DETAILS */}
        <Link
          to={`/product/${_id}`}
          style={{
            marginTop: "8px",
            padding: "6px 0",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 600,
            color: "#0066cc",
            textDecoration: "none",
            borderTop: "1px solid #f3f4f6",
            paddingTop: "8px",
            display: "block",
          }}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
});

// ================================================================
// PRODUCT SKELETON
// ================================================================

const ProductSkeleton = () => {
  return (
    <div
      className="product-card"
      style={{
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="product-image-wrapper"
        style={{
          width: "100%",
          paddingBottom: "75%",
          background: "#f4f5f7",
          position: "relative",
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

  const initialCategory = queryParams.get("category") || "all";
  const initialSearch = queryParams.get("search") || "";
  const initialSimStatus = queryParams.get("simStatus") || "";
  const initialLocation = queryParams.get("location") || "all";

  // ─── STATE ──────────────────────────────────────────────────────

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    location: initialLocation,
    simStatus: initialSimStatus,
  });

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sortOption, setSortOption] = useState("recommended");

  // ─── CACHE KEY ─────────────────────────────────────────────────

  const getCacheKey = useCallback(() => {
    const params = new URLSearchParams({
      search: filters.search || "",
      category: filters.category || "all",
      location: filters.location || "all",
      simStatus: filters.simStatus || "",
      priceMin: priceMin || "",
      priceMax: priceMax || "",
      verifiedOnly: verifiedOnly ? "true" : "",
      discountOnly: discountOnly ? "true" : "",
      sort: sortOption,
    });
    return `products_${params.toString()}`;
  }, [filters, priceMin, priceMax, verifiedOnly, discountOnly, sortOption]);

  // ─── FETCH PRODUCTS ────────────────────────────────────────────

  const fetchProducts = useCallback(
    async (pageNum = 1, append = false) => {
      const limit = 20;

      const cleanFilters = {
        ...(filters.search && { search: filters.search }),
        ...(filters.category && filters.category !== "all" && { category: filters.category }),
        ...(filters.location && filters.location !== "all" && { location: filters.location }),
        ...(filters.simStatus && { simStatus: filters.simStatus }),
        ...(priceMin && { priceMin }),
        ...(priceMax && { priceMax }),
        ...(verifiedOnly && { verified: true }),
        ...(discountOnly && { discount: true }),
        page: pageNum,
        limit,
        sort: sortOption,
      };

      try {
        const data = await getProducts(cleanFilters);
        const productList = Array.isArray(data?.products) ? data.products : [];
        const total = data?.total || 0;

        const processed = productList.map((p) => ({
          ...p,
          images: Array.isArray(p.images)
            ? p.images.filter(Boolean).map((img) => getImageUrl(img))
            : [],
          image: p.image ? getImageUrl(p.image) : null,
        }));

        if (append) {
          setProducts((prev) => [...prev, ...processed]);
        } else {
          setProducts(processed);
        }

        setHasMore(pageNum * limit < total);
        return processed;
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        throw err;
      }
    },
    [filters, priceMin, priceMax, verifiedOnly, discountOnly, sortOption]
  );

  // ─── CACHE HELPERS ─────────────────────────────────────────────

  const loadFromCache = useCallback((cacheKey) => {
    const cached = sessionStorage.getItem(cacheKey);
    if (!cached) return null;
    try {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 5 minutes (increased from 2)
      if (Date.now() - timestamp > 5 * 60 * 1000) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }, []);

  const saveToCache = useCallback((cacheKey, data) => {
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      // Ignore quota errors
    }
  }, []);

  // ─── MAIN EFFECT ───────────────────────────────────────────────

  useEffect(() => {
    const cacheKey = getCacheKey();
    const cachedData = loadFromCache(cacheKey);

    if (cachedData) {
      setProducts(cachedData);
      setHasMore(cachedData.length === 20);
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      setPage(1);
      try {
        const data = await fetchProducts(1, false);
        if (data) {
          saveToCache(cacheKey, data);
        }
      } catch (err) {
        setError(err?.message || "Unable to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchProducts, getCacheKey, loadFromCache, saveToCache]);

  // ─── LOAD MORE ──────────────────────────────────────────────────

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await fetchProducts(nextPage, true);
      if (data) {
        setPage(nextPage);
        const cacheKey = getCacheKey();
        const cached = loadFromCache(cacheKey);
        if (cached) {
          const merged = [...cached, ...data];
          saveToCache(cacheKey, merged);
        }
      }
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ─── SCROLL RESTORATION ────────────────────────────────────────

  useEffect(() => {
    const scrollKey = `scroll_${location.pathname}`;
    const saved = sessionStorage.getItem(scrollKey);
    if (saved) {
      const y = parseInt(saved, 10);
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
      });
    }
    return () => {
      sessionStorage.setItem(scrollKey, window.scrollY);
    };
  }, [location.pathname]);

  // ─── SYNC URL FILTERS ──────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "all";
    const search = params.get("search") || "";
    const simStatus = params.get("simStatus") || "";
    const locationFilter = params.get("location") || "all";
    setFilters((prev) => ({ ...prev, category, search, simStatus, location: locationFilter }));
  }, [location.search]);

  // ─── SEARCH ─────────────────────────────────────────────────────

  const handleSearch = useCallback((newFilters = {}) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
    setProducts([]);
    setHasMore(true);
    sessionStorage.removeItem(getCacheKey());
  }, [getCacheKey]);

  // ─── CLEAR FILTERS ─────────────────────────────────────────────

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
    setPage(1);
    setProducts([]);
    setHasMore(true);
    sessionStorage.removeItem(getCacheKey());
  };

  // ─── SORT ───────────────────────────────────────────────────────

  const sortedProducts = useMemo(() => {
    if (!products.length) return [];
    return products;
  }, [products]);

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <>
      <style>
        {`
          .products-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
          }

          .favorite-button:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.18) !important;
          }

          .favorite-button:active {
            transform: scale(0.94) !important;
          }

          @media (max-width: 1100px) {
            .products-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
            }
          }

          @media (max-width: 800px) {
            .products-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 14px;
            }
          }

          @media (max-width: 520px) {
            .products-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .location-text {
              font-size: 12px !important;
            }

            .product-description {
              font-size: 10px !important;
              line-height: 1.3 !important;
              margin: 2px 0 4px !important;
            }

            .specs-row {
              font-size: 10px !important;
              gap: 3px 8px !important;
              margin: 4px 0 6px !important;
            }

            .specs-row span {
              font-size: 10px !important;
            }

            .contact-buttons {
              gap: 6px !important;
            }

            .contact-btn {
              padding: 4px 8px !important;
              font-size: 10px !important;
              min-height: 24px !important;
              border-radius: 12px !important;
            }

            .contact-btn i {
              font-size: 10px !important;
            }

            .product-card .title {
              font-size: 14px !important;
            }

            .product-card .price {
              font-size: 17px !important;
            }

            .location-condition {
              font-size: 11px !important;
              gap: 4px !important;
            }

            .location-condition button {
              font-size: 9px !important;
              padding: 1px 7px !important;
            }
          }

          @media (max-width: 380px) {
            .contact-btn {
              padding: 3px 6px !important;
              font-size: 9px !important;
              min-height: 22px !important;
            }

            .contact-btn i {
              font-size: 9px !important;
            }

            .product-description {
              font-size: 9px !important;
            }

            .specs-row {
              font-size: 9px !important;
            }

            .specs-row span {
              font-size: 9px !important;
            }

            .favorite-button {
              width: 34px !important;
              height: 34px !important;
              font-size: 16px !important;
            }

            .location-condition button {
              font-size: 8px !important;
              padding: 1px 5px !important;
            }
          }

          @media (min-width: 1200px) {
            .products-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
            }

            .product-card .title {
              font-size: 16px !important;
            }

            .product-card .price {
              font-size: 20px !important;
            }
          }

          @media (min-width: 1600px) {
            .products-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 28px;
              max-width: 1600px;
            }

            .product-card .title {
              font-size: 17px !important;
            }

            .product-card .price {
              font-size: 21px !important;
            }
          }

          .load-more-btn {
            display: block;
            margin: 30px auto 10px;
            padding: 12px 40px;
            border: none;
            border-radius: 30px;
            background: #0066cc;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
          }

          .load-more-btn:hover {
            background: #004d99;
          }

          .load-more-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>

      <div
        className="products-page"
        style={{
          display: "flex",
          gap: "24px",
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "20px 16px",
        }}
      >
        {/* FILTER SIDEBAR */}
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
            onClearFilters={handleClearFilters}
            activeCategory={filters.category}
            simStatus={filters.simStatus}
            setSimStatus={(value) =>
              setFilters((prev) => ({ ...prev, simStatus: value }))
            }
          />
        </div>

        {/* MAIN CONTENT */}
        <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
          {/* SEARCH */}
          <div style={{ marginBottom: "24px" }}>
            <SearchBar onSearch={handleSearch} initialQuery={filters} />
          </div>

          {/* HEADER */}
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
                : `${products.length} results`}
              {filters.category !== "all" && (
                <>
                  {" "}
                  for <span style={{ color: "#0066cc" }}>{filters.category}</span>
                </>
              )}
              {filters.location !== "all" && (
                <>
                  {" "}
                  in <span style={{ color: "#4f46e5" }}>{filters.location}</span>
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
                borderRadius: "8px",
              }}
            >
              <p style={{ marginBottom: "12px" }}>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
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

          {/* LOADING */}
          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
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
              <div className="products-grid">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* LOAD MORE */}
              {hasMore && (
                <button
                  type="button"
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading more..." : "Load More"}
                </button>
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