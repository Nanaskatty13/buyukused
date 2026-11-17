// frontend/src/pages/Products.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Footer from "../components/Footer";

import { getProducts, getImageUrl } from "../services/api";

import VerifiedBadge from "../components/VerifiedBadge";
import SoldBadge from "../components/SoldBadge";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// ================================================================
// LOADING DOTS
// ================================================================

const LoadingDots = () => {
  return (
    <div className="loading-dots-wrapper">
      <div className="loading-dots">
        <span />
        <span />
        <span />
      </div>

      <style>
        {`
          .loading-dots-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px 20px;
            width: 100%;
          }

          .loading-dots {
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .loading-dots span {
            display: block;
            width: 14px;
            height: 14px;
            background: linear-gradient(135deg, #0066cc 0%, #3b82f6 100%);
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0,102,204,0.35), inset 0 1px 0 rgba(255,255,255,0.4);
            animation: loading-dot-bounce 1.2s ease-in-out infinite;
          }

          .loading-dots span:nth-child(1) {
            animation-delay: 0s;
          }

          .loading-dots span:nth-child(2) {
            animation-delay: 0.2s;
          }

          .loading-dots span:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes loading-dot-bounce {
            0%,
            80%,
            100% {
              transform: translateY(0) scale(0.8);
              opacity: 0.4;
            }

            40% {
              transform: translateY(-20px) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

// ================================================================
// CATEGORY NORMALIZER
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
// GROUP FILTER OPTIONS
// ================================================================

const GROUPS = [
  {
    value: "all",
    label: "All",
    icon: "fa-layer-group",
  },
  {
    value: "Phones",
    label: "Phones",
    icon: "fa-mobile-alt",
  },
  {
    value: "Laptops",
    label: "Laptops",
    icon: "fa-laptop",
  },
  {
    value: "Tablets",
    label: "Tablets",
    icon: "fa-tablet-alt",
  },
  {
    value: "TVs",
    label: "TVs",
    icon: "fa-tv",
  },
  {
    value: "Game Consoles",
    label: "Game Consoles",
    icon: "fa-gamepad",
  },
  {
    value: "Accessories",
    label: "Accessories",
    icon: "fa-headphones",
  },
  {
    value: "Real Estate",
    label: "Real Estate",
    icon: "fa-home",
  },
];

// ================================================================
// GROUP FILTER
// ================================================================

const GroupFilter = memo(({ value, onChange }) => {
  return (
    <div className="group-filter-container">
      <div className="group-filter-header">
        <div className="group-filter-title">
          <i className="fas fa-filter" />
          <span>Group</span>
        </div>

        {value !== "all" && (
          <button
            type="button"
            className="group-filter-clear"
            onClick={() => onChange("all")}
          >
            Clear
          </button>
        )}
      </div>

      <div className="group-filter-list">
        {GROUPS.map((group) => {
          const active = value === group.value;

          return (
            <button
              key={group.value}
              type="button"
              className={`group-filter-item ${
                active ? "group-filter-item-active" : ""
              }`}
              onClick={() => onChange(group.value)}
              aria-pressed={active}
            >
              <span className="group-filter-icon">
                <i className={`fas ${group.icon}`} />
              </span>

              <span className="group-filter-label">
                {group.label}
              </span>

              {active && (
                <span className="group-filter-check">
                  <i className="fas fa-check" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ================================================================
// PRODUCT CARD
// ================================================================

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { toggleFavorite, isFavorite } = useCart();
  const { user } = useAuth();

  const [watermarkedSrc, setWatermarkedSrc] = useState(null);

  const imgRef = useRef(null);

  const productData = product || {};

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
  } = productData;

  const liked = Boolean(_id && isFavorite(_id));

  // ==============================================================
  // FAVORITE
  // ==============================================================

  const handleFavorite = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        navigate("/login", {
          state: {
            from: location.pathname + location.search,
          },
        });

        return;
      }

      if (_id) {
        toggleFavorite(_id);
      }
    },
    [
      user,
      _id,
      navigate,
      location.pathname,
      location.search,
      toggleFavorite,
    ]
  );

  // ==============================================================
  // CATEGORY
  // ==============================================================

  const normalizedCategory = useMemo(
    () => normalizeCategory(category),
    [category]
  );

  const isPhone = normalizedCategory === "Phones";

  const isProperty =
    normalizedCategory === "Real Estate" ||
    normalizedCategory === "Property";

  // ==============================================================
  // SELLER
  // ==============================================================

  const sellerObj = useMemo(() => {
    if (sellerId && typeof sellerId === "object") {
      return sellerId;
    }

    if (seller && typeof seller === "object") {
      return seller;
    }

    return null;
  }, [sellerId, seller]);

  const sellerName = useMemo(() => {
    return (
      sellerObj?.name ||
      sellerNameProp ||
      "Unknown Seller"
    );
  }, [sellerObj, sellerNameProp]);

  const sellerImage = useMemo(() => {
    return (
      sellerObj?.profileImage ||
      sellerObj?.avatar ||
      sellerObj?.photo ||
      sellerObj?.picture ||
      sellerProfileImageProp ||
      null
    );
  }, [sellerObj, sellerProfileImageProp]);

  const sellerImageUrl = useMemo(() => {
    return sellerImage ? getImageUrl(sellerImage) : null;
  }, [sellerImage]);

  const isVerified = sellerObj?.isVerified === true;

  const yearsOnPlatform = sellerObj?.yearsOnPlatform || 0;

  const accountType = sellerObj?.accountType || "";

  // ==============================================================
  // ACCOUNT BADGE
  // ==============================================================

  const accountBadge = useMemo(() => {
    const type = String(accountType).toLowerCase();

    if (type === "diamond") {
      return {
        label: "💎 DIAMOND",
        color: "#0ea5e9",
        bg: "rgba(224,242,254,0.75)",
      };
    }

    if (type === "vip") {
      return {
        label: "⭐ VIP",
        color: "#f59e0b",
        bg: "rgba(254,243,199,0.75)",
      };
    }

    if (type === "enterprise") {
      return {
        label: "🏢 ENTERPRISE",
        color: "#8b5cf6",
        bg: "rgba(237,233,254,0.75)",
      };
    }

    return null;
  }, [accountType]);

  // ==============================================================
  // PRODUCT IMAGE
  // ==============================================================

  const originalImageUrl = useMemo(() => {
    const firstImage =
      Array.isArray(images) && images.length > 0
        ? images[0]
        : image;

    return firstImage
      ? getImageUrl(firstImage)
      : "/placeholder.png";
  }, [images, image]);

  // ==============================================================
  // WATERMARK
  // ==============================================================

  useEffect(() => {
    let cancelled = false;

    if (!originalImageUrl) {
      return undefined;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setWatermarkedSrc(originalImageUrl);
      return undefined;
    }

    const img = new Image();

    img.crossOrigin = "Anonymous";

    img.onload = () => {
      if (cancelled) return;

      try {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height
        );

        const text = "Posted on buyukused.com";

        const fontSize = Math.max(
          16,
          Math.min(40, img.width / 18)
        );

        ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const x = img.width / 2;
        const y = img.height * 0.45;

        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = "rgba(255,255,255,0.5)";

        ctx.fillText(text, x, y);

        ctx.shadowColor = "transparent";

        setWatermarkedSrc(
          canvas.toDataURL("image/png")
        );
      } catch {
        setWatermarkedSrc(originalImageUrl);
      }
    };

    img.onerror = () => {
      if (!cancelled) {
        setWatermarkedSrc(originalImageUrl);
      }
    };

    img.src = originalImageUrl;

    return () => {
      cancelled = true;
    };
  }, [originalImageUrl]);

  // ==============================================================
  // PRICE
  // ==============================================================

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(price || 0);
  }, [price]);

  // ==============================================================
  // CITY
  // ==============================================================

  const cityOnly = useMemo(() => {
    if (!productLocation) return "";

    const parts = String(productLocation)
      .split(",")
      .map((item) => item.trim());

    return parts[0] || productLocation;
  }, [productLocation]);

  // ==============================================================
  // SPECS
  // ==============================================================

  const categorySpecs = useMemo(() => {
    const specs = [];

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

      if (condition) {
        specs.push({
          icon: "📋",
          label: condition,
        });
      }
    } else if (normalizedCategory === "Tablets") {
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

      if (condition) {
        specs.push({
          icon: "📋",
          label: condition,
        });
      }
    } else if (normalizedCategory === "Phones") {
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

      if (condition) {
        specs.push({
          icon: "📋",
          label: condition,
        });
      }
    } else if (isProperty) {
      if (product.bedrooms) {
        specs.push({
          icon: "🛏️",
          label: `${product.bedrooms} bedrooms`,
        });
      }

      if (product.bathrooms) {
        specs.push({
          icon: "🚿",
          label: `${product.bathrooms} baths`,
        });
      }

      if (product.sqm) {
        specs.push({
          icon: "📐",
          label: `${product.sqm} sqm`,
        });
      }

      if (product.propertyType) {
        specs.push({
          icon: "🏠",
          label: product.propertyType,
        });
      }

      if (condition) {
        specs.push({
          icon: "📋",
          label: condition,
        });
      }
    } else {
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

      if (condition) {
        specs.push({
          icon: "📋",
          label: condition,
        });
      }
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

  // ==============================================================
  // SOLD
  // ==============================================================

  const isSold = status === "sold";

  // ==============================================================
  // CHAT
  // ==============================================================

  const handleChat = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      navigate(`/product/${_id}?openChat=true`);
    },
    [_id, navigate]
  );

  // ==============================================================
  // CALL
  // ==============================================================

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
        alert(
          "This seller has not provided a valid phone number."
        );
        return;
      }

      window.location.href = `tel:+${phone}`;
    },
    [sellerObj?.phone]
  );

  // ==============================================================
  // CARD
  // ==============================================================

  return (
    <div
      className="product-card"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(238,246,255,0.42) 50%, rgba(255,255,255,0.62) 100%)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
        borderRadius: "16px",
        overflow: "hidden",
        border: isVerified
          ? "1.5px solid rgba(0,85,165,0.55)"
          : "1px solid rgba(255,255,255,0.75)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow:
          "0 8px 28px rgba(31,38,135,0.10), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.25)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
        isolation: "isolate",
      }}
    >
      {/* =========================================================
          PRODUCT IMAGE
      ========================================================== */}

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
          ref={imgRef}
          src={
            watermarkedSrc ||
            originalImageUrl ||
            "/placeholder.png"
          }
          alt={title || "Product"}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            transition: "transform 0.3s ease",
            objectFit: "contain",
          }}
          onError={(e) => {
            const fallback = "/placeholder.png";

            if (
              e.currentTarget.src !==
              window.location.origin + fallback
            ) {
              e.currentTarget.src = fallback;
            }
          }}
        />

        {isSold && <SoldBadge variant="card" />}

        {/* BADGES */}

        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            zIndex: 2,
          }}
        >
          {isVerified && (
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(29,161,242,0.94) 0%, rgba(29,161,242,0.78) 100%)",
                backdropFilter: "blur(8px) saturate(180%)",
                WebkitBackdropFilter: "blur(8px) saturate(180%)",
                color: "white",
                fontSize: "8px",
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: "6px",
                textTransform: "uppercase",
                display: "inline-block",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                letterSpacing: "0.3px",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              ✓ Verified ID
            </span>
          )}

          {popular && (
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.94) 0%, rgba(245,158,11,0.78) 100%)",
                backdropFilter: "blur(8px) saturate(180%)",
                WebkitBackdropFilter: "blur(8px) saturate(180%)",
                color: "white",
                fontSize: "8px",
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: "6px",
                textTransform: "uppercase",
                display: "inline-block",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              ★ Popular
            </span>
          )}

          {yearsOnPlatform >= 5 && (
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.94) 0%, rgba(16,185,129,0.78) 100%)",
                backdropFilter: "blur(8px) saturate(180%)",
                WebkitBackdropFilter: "blur(8px) saturate(180%)",
                color: "white",
                fontSize: "8px",
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: "6px",
                textTransform: "uppercase",
                display: "inline-block",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {yearsOnPlatform}+ yrs
            </span>
          )}
        </div>

        {/* FAVORITE */}

        <button
          type="button"
          className={`favorite-button ${
            liked ? "favorite-active" : ""
          }`}
          onClick={handleFavorite}
          aria-label={
            liked
              ? "Remove from favorites"
              : "Add to favorites"
          }
          title={
            liked
              ? "Remove from favorites"
              : "Add to favorites"
          }
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.65)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 100%)",
            backdropFilter: "blur(10px) saturate(180%)",
            WebkitBackdropFilter: "blur(10px) saturate(180%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 5,
            color: liked ? "#e11d48" : "#374151",
            fontSize: "15px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.9)",
            transition: "all 0.2s ease",
          }}
        >
          <i
            className={
              liked
                ? "fas fa-heart"
                : "far fa-heart"
            }
            style={{
              color: liked
                ? "#e11d48"
                : "#374151",
            }}
          />
        </button>
      </Link>

      {/* =========================================================
          PRODUCT CONTENT
      ========================================================== */}

      <div
        style={{
          padding: "8px 10px 10px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <Link
          to={`/product/${_id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            className="title"
            style={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: "#111827",
              marginBottom: "1px",
            }}
          >
            {title || "Untitled Product"}
          </div>
        </Link>

        {/* PRICE */}

        <div
          className="price"
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: isSold
              ? "#9ca3af"
              : "#0066cc",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {formattedPrice}

          {isSold && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#dc2626",
                background: "rgba(254,226,226,0.85)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.6)",
                padding: "1px 6px",
                borderRadius: "3px",
              }}
            >
              SOLD
            </span>
          )}
        </div>

        {/* LOCATION */}

        <div
          className="location-condition"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            color: "#6b7280",
          }}
        >
          <span className="location-text">
            {cityOnly || "Ghana"}
          </span>

          <span>•</span>

          <span>
            {condition || "Used"}
          </span>
        </div>

        {/* SPECS */}

        <div
          className="specs-row"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 6px",
            fontSize: "11px",
            color: "#6b7280",
            margin: "2px 0 4px",
          }}
        >
          {categorySpecs.map((spec, index) => (
            <span
              key={`${spec.label}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "11px",
                color: "#374151",
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(6px) saturate(180%)",
                WebkitBackdropFilter: "blur(6px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.7)",
                padding: "1px 6px",
                borderRadius: "4px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}
            >
              {spec.icon} {spec.label}
            </span>
          ))}

          {warranty && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(6px) saturate(180%)",
                WebkitBackdropFilter: "blur(6px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.7)",
                padding: "1px 6px",
                borderRadius: "4px",
                color: "#374151",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}
            >
              <i className="fas fa-shield-alt" />
              {warranty}
            </span>
          )}

          {isPhone && simStatus && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                background: "rgba(224,242,254,0.85)",
                backdropFilter: "blur(6px) saturate(180%)",
                WebkitBackdropFilter: "blur(6px) saturate(180%)",
                border: "1px solid rgba(191,219,254,0.85)",
                padding: "1px 6px",
                borderRadius: "4px",
                color: "#0055a5",
                fontWeight: 600,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <i className="fas fa-sim-card" />
              SIM: {simStatus}
            </span>
          )}

          <span
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(6px) saturate(180%)",
              WebkitBackdropFilter: "blur(6px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.7)",
              padding: "1px 6px",
              borderRadius: "4px",
              color: "#374151",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
            }}
          >
            {swapAccepted
              ? "🔄 Swap OK"
              : "🚫 No swap"}
          </span>
        </div>

        {/* DESCRIPTION */}

        {description &&
          String(description).trim() && (
            <div
              className="product-description"
              style={{
                margin: "2px 0 4px",
                fontSize: "13px",
                lineHeight: 1.4,
                color: "#4b5563",
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
            gap: "6px",
            paddingTop: "6px",
            borderTop: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          {sellerImageUrl ? (
            <img
              src={sellerImageUrl}
              alt={sellerName}
              loading="lazy"
              decoding="async"
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.85)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(6px) saturate(180%)",
                WebkitBackdropFilter: "blur(6px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: "#9ca3af",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}
            >
              <i className="fas fa-user" />
            </div>
          )}

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#111827",
                }}
              >
                {sellerName}
              </span>

              {isVerified && (
                <VerifiedBadge size={10} />
              )}
            </div>

            {accountBadge && (
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: accountBadge.color,
                  background: accountBadge.bg,
                  backdropFilter: "blur(6px) saturate(180%)",
                  WebkitBackdropFilter: "blur(6px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.65)",
                  padding: "1px 5px",
                  borderRadius: "8px",
                  display: "inline-block",
                  marginTop: "1px",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                }}
              >
                {accountBadge.label}
              </span>
            )}
          </div>

          {yearsOnPlatform >= 3 && (
            <span
              style={{
                fontSize: "9px",
                color: "#6b7280",
                whiteSpace: "nowrap",
              }}
            >
              {yearsOnPlatform}+ yrs
            </span>
          )}
        </div>

        {/* CONTACT */}

        {sellerObj?.phone && (
          <div
            className="contact-buttons"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "5px",
              paddingTop: "5px",
              borderTop: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <button
              type="button"
              onClick={handleChat}
              className="contact-btn chat-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                padding: "4px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.35)",
                background:
                  "linear-gradient(135deg, #2ecc71 0%, #25D366 100%)",
                backdropFilter: "blur(8px) saturate(180%)",
                WebkitBackdropFilter: "blur(8px) saturate(180%)",
                color: "white",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                flex: 1,
                minHeight: "22px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(37,211,102,0.25)",
              }}
            >
              <i
                className="fas fa-comment-dots"
                style={{
                  fontSize: "10px",
                }}
              />
              CHAT
            </button>

            <button
              type="button"
              onClick={handleCall}
              className="contact-btn call-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                padding: "4px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.35)",
                background:
                  "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                backdropFilter: "blur(8px) saturate(180%)",
                WebkitBackdropFilter: "blur(8px) saturate(180%)",
                color: "white",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                flex: 1,
                minHeight: "22px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(59,130,246,0.25)",
              }}
            >
              <i
                className="fas fa-phone"
                style={{
                  fontSize: "10px",
                }}
              />
              CALL
            </button>
          </div>
        )}

        {/* DETAILS */}

        <Link
          to={`/product/${_id}`}
          style={{
            marginTop: "6px",
            padding: "5px 0 4px",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: "#0066cc",
            textDecoration: "none",
            borderTop: "1px solid rgba(255,255,255,0.6)",
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
    <div className="product-card">
      <div className="skeleton-image" />

      <div className="skeleton-body">
        <div
          className="skeleton-line"
          style={{
            width: "80%",
            height: "16px",
          }}
        />

        <div
          className="skeleton-line"
          style={{
            width: "45%",
            height: "18px",
          }}
        />

        <div
          className="skeleton-line"
          style={{
            width: "60%",
            height: "12px",
          }}
        />

        <div
          className="skeleton-line"
          style={{
            width: "90%",
            height: "40px",
          }}
        />

        <div
          className="skeleton-line"
          style={{
            width: "100%",
            height: "26px",
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
  const navigate = useNavigate();

  // ==============================================================
  // URL
  // ==============================================================

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const initialCategory =
    queryParams.get("category") || "all";

  const initialSearch =
    queryParams.get("search") || "";

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [hasMore, setHasMore] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
  });

  const [sortOption, setSortOption] =
    useState("recommended");

  // ==============================================================
  // CACHE KEY
  // ==============================================================

  const getCacheKey = useCallback(() => {
    const params = new URLSearchParams({
      search: filters.search || "",
      category: filters.category || "all",
      sort: sortOption,
    });

    return `products_group_v1_${params.toString()}`;
  }, [
    filters.search,
    filters.category,
    sortOption,
  ]);

  // ==============================================================
  // FETCH PAGE
  // ==============================================================

  const fetchPage = useCallback(
    async (page, append = false) => {
      const pageSize = 20;

      const cleanFilters = {
        ...(filters.search && {
          search: filters.search,
        }),

        ...(filters.category &&
          filters.category !== "all" && {
            category: filters.category,
          }),

        page,
        limit: pageSize,
        sort: sortOption,
      };

      try {
        const data =
          await getProducts(cleanFilters);

        const productList = Array.isArray(
          data?.products
        )
          ? data.products
          : [];

        const processed = productList.map(
          (p) => ({
            ...p,

            images: Array.isArray(p.images)
              ? p.images
                  .filter(Boolean)
                  .map((img) =>
                    getImageUrl(img)
                  )
              : [],

            image: p.image
              ? getImageUrl(p.image)
              : null,
          })
        );

        const more =
          productList.length === pageSize;

        if (append) {
          setProducts((prev) => [
            ...prev,
            ...processed,
          ]);
        } else {
          setProducts(processed);
        }

        setHasMore(more);

        return {
          products: processed,
          hasMore: more,
        };
      } catch (err) {
        throw err;
      }
    },
    [
      filters.search,
      filters.category,
      sortOption,
    ]
  );

  // ==============================================================
  // LOAD MORE
  // ==============================================================

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage =
        currentPage + 1;

      await fetchPage(
        nextPage,
        true
      );

      setCurrentPage(nextPage);
    } catch (err) {
      console.error(
        "Failed to load more products",
        err
      );

      setError(
        "Failed to load more products. Please try again."
      );
    } finally {
      setLoadingMore(false);
    }
  }, [
    currentPage,
    hasMore,
    loadingMore,
    fetchPage,
  ]);

  // ==============================================================
  // CACHE
  // ==============================================================

  const loadFromCache = useCallback(
    (cacheKey) => {
      try {
        const cached =
          sessionStorage.getItem(
            cacheKey
          );

        if (!cached) {
          return null;
        }

        const parsed =
          JSON.parse(cached);

        if (
          Date.now() -
            parsed.timestamp >
          5 * 60 * 1000
        ) {
          sessionStorage.removeItem(
            cacheKey
          );

          return null;
        }

        return parsed.data;
      } catch {
        return null;
      }
    },
    []
  );

  const saveToCache = useCallback(
    (cacheKey, data) => {
      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch {
        // Ignore storage errors.
      }
    },
    []
  );

  // ==============================================================
  // LOAD PRODUCTS
  // ==============================================================

  useEffect(() => {
    let cancelled = false;

    const cacheKey =
      getCacheKey();

    const cachedData =
      loadFromCache(cacheKey);

    if (cachedData) {
      setProducts(cachedData);
      setHasMore(false);
      setCurrentPage(1);
      setLoading(false);

      return undefined;
    }

    const loadFirstPage =
      async () => {
        setLoading(true);
        setError("");
        setProducts([]);
        setHasMore(false);
        setCurrentPage(1);

        try {
          const result =
            await fetchPage(
              1,
              false
            );

          if (cancelled) {
            return;
          }

          if (!result.hasMore) {
            saveToCache(
              cacheKey,
              result.products
            );
          }
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            "Failed to load products",
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
      };

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [
    fetchPage,
    getCacheKey,
    loadFromCache,
    saveToCache,
  ]);

  // ==============================================================
  // SCROLL RESTORE
  // ==============================================================

  useEffect(() => {
    const scrollKey =
      `scroll_${location.pathname}`;

    const saved =
      sessionStorage.getItem(
        scrollKey
      );

    if (saved) {
      const y = parseInt(
        saved,
        10
      );

      requestAnimationFrame(() => {
        window.scrollTo(0, y);
      });
    }

    return () => {
      sessionStorage.setItem(
        scrollKey,
        String(window.scrollY)
      );
    };
  }, [location.pathname]);

  // ==============================================================
  // SYNC URL
  // ==============================================================

  useEffect(() => {
    const params =
      new URLSearchParams(
        location.search
      );

    const category =
      params.get("category") ||
      "all";

    const search =
      params.get("search") ||
      "";

    setFilters({
      category,
      search,
    });
  }, [location.search]);

  // ==============================================================
  // GROUP CHANGE
  // ==============================================================

  const handleGroupChange =
    useCallback(
      (category) => {
        const nextParams =
          new URLSearchParams(
            location.search
          );

        if (
          category &&
          category !== "all"
        ) {
          nextParams.set(
            "category",
            category
          );
        } else {
          nextParams.delete(
            "category"
          );
        }

        if (filters.search) {
          nextParams.set(
            "search",
            filters.search
          );
        } else {
          nextParams.delete(
            "search"
          );
        }

        navigate({
          pathname:
            location.pathname,
          search:
            nextParams.toString()
              ? `?${nextParams.toString()}`
              : "",
        });
      },
      [
        location.pathname,
        location.search,
        filters.search,
        navigate,
      ]
    );

  // ==============================================================
  // SORT
  // ==============================================================

  const handleSortChange =
    useCallback((e) => {
      setSortOption(
        e.target.value
      );
    }, []);

  // ==============================================================
  // PRODUCTS
  // ==============================================================

  const sortedProducts =
    useMemo(() => {
      return products || [];
    }, [products]);

  const activeGroupLabel =
    useMemo(() => {
      if (
        !filters.category ||
        filters.category === "all"
      ) {
        return "All Products";
      }

      return normalizeCategory(
        filters.category
      );
    }, [filters.category]);

  // ==============================================================
  // RENDER
  // ==============================================================

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          /* =====================================================
             LIQUID MIRROR — PAGE BACKGROUND (iOS27)
          ====================================================== */

          .products-page {
            position: relative;
            width: 100%;
            max-width: 1440px;
            margin: 0 auto;
            padding: 16px;
            overflow: hidden;
            background: linear-gradient(
              135deg,
              #eef4ff 0%,
              #f5f0ff 40%,
              #eaf7ff 70%,
              #f2f8ff 100%
            );
          }

          .products-page::before {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            background:
              radial-gradient(circle at 8% 15%, rgba(0,102,204,0.22) 0%, rgba(0,102,204,0.08) 25%, transparent 55%),
              radial-gradient(circle at 92% 60%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 25%, transparent 55%),
              radial-gradient(circle at 50% 115%, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.06) 25%, transparent 55%),
              radial-gradient(circle at 30% 80%, rgba(59,130,246,0.12) 0%, transparent 50%);
            animation: liquid-bg-float 24s ease-in-out infinite;
            will-change: transform;
          }

          .products-main {
            position: relative;
            z-index: 1;
            width: 100%;
          }

          @keyframes liquid-bg-float {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            33% {
              transform: translate3d(-30px, 24px, 0) scale(1.06);
            }
            66% {
              transform: translate3d(24px, -20px, 0) scale(0.97);
            }
          }

          /* =====================================================
             GROUP FILTER — LIQUID PANEL
          ====================================================== */

          .group-filter-container {
            width: 100%;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.62) 0%,
              rgba(255,255,255,0.22) 50%,
              rgba(255,255,255,0.52) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.7);
            border-radius: 16px;
            padding: 12px;
            margin-bottom: 18px;
            box-shadow:
              0 6px 24px rgba(31,38,135,0.08),
              inset 0 1px 0 rgba(255,255,255,0.9),
              inset 0 -1px 0 rgba(255,255,255,0.2);
          }

          .group-filter-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
          }

          .group-filter-title {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #111827;
            font-size: 14px;
            font-weight: 700;
          }

          .group-filter-title i {
            color: #0066cc;
          }

          .group-filter-clear {
            border: 1px solid rgba(255,255,255,0.65);
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.6) 0%,
              rgba(255,255,255,0.25) 100%
            );
            backdrop-filter: blur(8px) saturate(180%);
            -webkit-backdrop-filter: blur(8px) saturate(180%);
            color: #0066cc;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 8px;
            box-shadow:
              0 2px 8px rgba(31,38,135,0.06),
              inset 0 1px 0 rgba(255,255,255,0.85);
            transition: all 0.15s ease;
          }

          .group-filter-clear:hover {
            border-color: rgba(255,255,255,0.95);
            box-shadow:
              0 4px 12px rgba(0,102,204,0.15),
              inset 0 1px 0 rgba(255,255,255,1);
          }

          .group-filter-list {
            display: flex;
            align-items: center;
            gap: 8px;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 2px;
          }

          .group-filter-list::-webkit-scrollbar {
            display: none;
          }

          .group-filter-item {
            flex: 0 0 auto;
            min-height: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 7px 13px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.65);
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.6) 0%,
              rgba(255,255,255,0.24) 100%
            );
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
            box-shadow:
              0 2px 10px rgba(31,38,135,0.06),
              inset 0 1px 0 rgba(255,255,255,0.85);
            color: #374151;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition:
              background 0.18s ease,
              border-color 0.18s ease,
              color 0.18s ease,
              transform 0.18s ease,
              box-shadow 0.18s ease;
          }

          .group-filter-item:hover {
            border-color: rgba(255,255,255,0.95);
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.8) 0%,
              rgba(239,246,255,0.5) 100%
            );
            color: #0066cc;
            box-shadow:
              0 4px 14px rgba(31,38,135,0.10),
              inset 0 1px 0 rgba(255,255,255,1);
          }

          .group-filter-item:active {
            transform: scale(0.97);
          }

          .group-filter-item-active,
          .group-filter-item-active:hover {
            background: linear-gradient(
              135deg,
              rgba(0,102,204,0.94) 0%,
              rgba(0,85,165,0.9) 100%
            ) !important;
            border-color: rgba(255,255,255,0.4) !important;
            color: #ffffff !important;
            box-shadow:
              0 6px 18px rgba(0,102,204,0.35),
              inset 0 1px 0 rgba(255,255,255,0.4) !important;
          }

          .group-filter-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }

          .group-filter-check {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          }

          /* =====================================================
             PRODUCTS HEADER
          ====================================================== */

          .products-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 16px;
          }

          .products-heading {
            margin: 0;
            color: #111827;
            font-size: 20px;
            line-height: 1.3;
            font-weight: 700;
          }

          .active-group {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-left: 5px;
            padding: 3px 10px;
            border-radius: 10px;
            background: linear-gradient(
              135deg,
              rgba(224,242,254,0.9) 0%,
              rgba(191,219,254,0.72) 100%
            );
            backdrop-filter: blur(8px) saturate(180%);
            -webkit-backdrop-filter: blur(8px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.75);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
            color: #0066cc;
            font-size: 14px;
            font-weight: 600;
          }

          .sort-select {
            min-height: 36px;
            padding: 7px 11px;
            border: 1px solid rgba(255,255,255,0.7);
            border-radius: 10px;
            font-size: 13px;
            outline: none;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.65) 0%,
              rgba(255,255,255,0.28) 100%
            );
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
            box-shadow:
              0 2px 10px rgba(31,38,135,0.06),
              inset 0 1px 0 rgba(255,255,255,0.9);
            color: #374151;
            cursor: pointer;
          }

          .sort-select:focus {
            border-color: rgba(0,102,204,0.6);
            box-shadow:
              0 0 0 2px rgba(0,102,204,0.12),
              inset 0 1px 0 rgba(255,255,255,0.9);
          }

          /* =====================================================
             PRODUCTS GRID
          ====================================================== */

          .products-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            width: 100%;
          }

          .product-card {
            min-width: 0;
            position: relative;
            isolation: isolate;
          }

          .product-card > * {
            position: relative;
            z-index: 1;
          }

          /* Liquid shine sweep on card */
          .product-card::before {
            content: "";
            position: absolute;
            top: -50%;
            left: 0;
            width: 60%;
            height: 200%;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,0.55) 50%,
              transparent 100%
            );
            transform: translate3d(-200%, 0, 0) skewX(-25deg);
            transition: transform 0.75s ease;
            pointer-events: none;
            z-index: 0;
          }

          @media (hover: hover) and (prefers-reduced-motion: no-preference) {
            .product-card:hover::before {
              transform: translate3d(300%, 0, 0) skewX(-25deg);
            }
          }

          .product-card:hover {
            border-color: rgba(255,255,255,0.98) !important;
            box-shadow:
              0 14px 40px rgba(31,38,135,0.16),
              inset 0 1px 0 rgba(255,255,255,1),
              inset 0 -1px 0 rgba(255,255,255,0.3) !important;
            transform: translateY(-3px);
          }

          .product-card .product-image-wrapper {
            display: block;
            overflow: hidden;
            background: #f4f5f7;
            position: relative;
            width: 100%;
          }

          .product-card .product-image-wrapper img {
            width: 100%;
            height: auto;
            display: block;
            object-fit: contain;
          }

          .favorite-button:hover {
            box-shadow:
              0 4px 16px rgba(0,0,0,0.18),
              inset 0 1px 0 rgba(255,255,255,1) !important;
            transform: scale(1.05);
          }

          .favorite-button:active {
            transform: scale(0.94) !important;
          }

          /* =====================================================
             SKELETON — LIQUID GLASS
          ====================================================== */

          .skeleton-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.5) 0%,
              rgba(238,246,255,0.35) 50%,
              rgba(255,255,255,0.45) 100%
            );
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
          }

          .skeleton-image::after,
          .skeleton-line::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,0.7) 50%,
              transparent 100%
            );
            animation: skeleton-shimmer 1.4s ease-in-out infinite;
            will-change: transform;
          }

          .skeleton-body {
            padding: 10px;
          }

          .skeleton-line {
            background: rgba(255,255,255,0.55);
            border: 1px solid rgba(255,255,255,0.7);
            border-radius: 3px;
            margin-bottom: 6px;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
          }

          @keyframes skeleton-shimmer {
            0%   { transform: translate3d(-100%, 0, 0); }
            100% { transform: translate3d(100%, 0, 0); }
          }

          /* =====================================================
             EMPTY PRODUCTS — LIQUID GLASS PANEL
          ====================================================== */

          .empty-products {
            text-align: center;
            padding: 60px 20px;
            color: #4b5563;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.62) 0%,
              rgba(255,255,255,0.25) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.7);
            border-radius: 16px;
            box-shadow:
              0 6px 24px rgba(31,38,135,0.08),
              inset 0 1px 0 rgba(255,255,255,0.9);
          }

          .empty-products a {
            display: inline-block;
            margin-top: 12px;
            padding: 8px 20px;
            color: #0066cc;
            font-weight: 600;
            text-decoration: none;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.7) 0%,
              rgba(255,255,255,0.3) 100%
            );
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
            border: 1px solid rgba(0,102,204,0.4);
            border-radius: 12px;
            box-shadow:
              0 4px 14px rgba(0,102,204,0.15),
              inset 0 1px 0 rgba(255,255,255,0.9);
            transition: all 0.2s ease;
          }

          .empty-products a:hover {
            transform: translateY(-1px);
            box-shadow:
              0 6px 20px rgba(0,102,204,0.22),
              inset 0 1px 0 rgba(255,255,255,1);
          }

          /* =====================================================
             ERROR BOX — LIQUID GLASS
          ====================================================== */

          .error-box {
            text-align: center;
            padding: 24px 20px;
            margin-bottom: 16px;
            color: #b91c1c;
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.65) 0%,
              rgba(254,226,226,0.55) 100%
            );
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border: 1px solid rgba(252,165,165,0.55);
            border-radius: 12px;
            box-shadow:
              0 4px 18px rgba(220,38,38,0.08),
              inset 0 1px 0 rgba(255,255,255,0.9);
          }

          .error-retry-btn {
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 10px;
            padding: 8px 18px;
            cursor: pointer;
            font-weight: 600;
            background: linear-gradient(
              135deg,
              rgba(0,102,204,0.94) 0%,
              rgba(0,85,165,0.9) 100%
            );
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            color: white;
            box-shadow:
              0 4px 14px rgba(0,102,204,0.3),
              inset 0 1px 0 rgba(255,255,255,0.35);
            transition: all 0.15s ease;
          }

          .error-retry-btn:hover {
            transform: translateY(-1px);
            box-shadow:
              0 6px 20px rgba(0,102,204,0.4),
              inset 0 1px 0 rgba(255,255,255,0.45);
          }

          /* =====================================================
             LOAD MORE — LIQUID GLASS BUTTON
          ====================================================== */

          .load-more-container {
            text-align: center;
            margin-top: 24px;
          }

          .load-more-button {
            min-height: 42px;
            padding: 10px 28px;
            background: linear-gradient(
              135deg,
              rgba(0,102,204,0.94) 0%,
              rgba(0,85,165,0.9) 100%
            );
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow:
              0 6px 22px rgba(0,102,204,0.28),
              inset 0 1px 0 rgba(255,255,255,0.45);
            transition: all 0.2s ease;
          }

          .load-more-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow:
              0 10px 28px rgba(0,102,204,0.36),
              inset 0 1px 0 rgba(255,255,255,0.55);
          }

          .load-more-button:disabled {
            background: linear-gradient(
              135deg,
              rgba(209,213,219,0.9) 0%,
              rgba(156,163,175,0.85) 100%
            );
            border-color: rgba(255,255,255,0.3);
            cursor: default;
            box-shadow:
              0 2px 8px rgba(0,0,0,0.06),
              inset 0 1px 0 rgba(255,255,255,0.3);
          }

          .all-loaded {
            color: #6b7280;
            font-size: 14px;
          }

          /* =====================================================
             TABLET
          ====================================================== */

          @media (max-width: 1100px) {
            .products-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 14px;
            }
          }

          /* =====================================================
             MOBILE
          ====================================================== */

          @media (max-width: 800px) {
            .products-page {
              padding: 12px;
            }

            .products-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
            }

            .group-filter-container {
              padding: 10px;
              border-radius: 14px;
            }

            .group-filter-list {
              margin-right: -4px;
              padding-right: 4px;
            }

            .group-filter-item {
              min-height: 40px;
              padding: 8px 12px;
              font-size: 12px;
            }

            .products-heading {
              font-size: 18px;
            }

            .active-group {
              font-size: 13px;
            }
          }

          /* =====================================================
             SMALL PHONE
          ====================================================== */

          @media (max-width: 520px) {
            .products-page {
              padding: 8px;
            }

            .group-filter-container {
              margin-bottom: 12px;
            }

            .group-filter-title {
              font-size: 13px;
            }

            .group-filter-item {
              min-height: 38px;
              padding: 7px 11px;
              font-size: 11px;
              border-radius: 10px;
            }

            .group-filter-icon {
              font-size: 11px;
            }

            .products-header {
              gap: 8px;
              margin-bottom: 12px;
            }

            .products-heading {
              font-size: 17px;
            }

            .active-group {
              font-size: 12px;
              padding: 2px 8px;
            }

            .sort-select {
              min-height: 34px;
              font-size: 12px;
              padding: 6px 8px;
            }

            .products-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .product-card .title {
              font-size: 13px !important;
            }

            .product-card .price {
              font-size: 16px !important;
            }

            .location-condition {
              font-size: 10px !important;
            }

            .location-text {
              font-size: 10px !important;
            }

            .product-description {
              font-size: 12px !important;
              line-height: 1.3 !important;
            }

            .specs-row {
              font-size: 10px !important;
              gap: 3px 5px !important;
            }

            .specs-row span {
              font-size: 10px !important;
            }

            .contact-buttons {
              gap: 4px !important;
            }

            .contact-btn {
              padding: 3px 6px !important;
              font-size: 10px !important;
              min-height: 20px !important;
              border-radius: 10px !important;
            }

            .contact-btn i {
              font-size: 9px !important;
            }
          }

          @media (max-width: 380px) {
            .products-page {
              padding: 6px;
            }

            .group-filter-item {
              padding: 7px 9px;
              gap: 5px;
            }

            .products-heading {
              font-size: 16px;
            }

            .sort-select {
              font-size: 11px;
            }

            .contact-btn {
              padding: 2px 4px !important;
              font-size: 9px !important;
              min-height: 18px !important;
            }

            .contact-btn i {
              font-size: 8px !important;
            }

            .product-description {
              font-size: 11px !important;
            }

            .specs-row {
              font-size: 9px !important;
            }

            .specs-row span {
              font-size: 9px !important;
            }

            .favorite-button {
              width: 28px !important;
              height: 28px !important;
              font-size: 13px !important;
            }
          }

          /* =====================================================
             LARGE DESKTOP
          ====================================================== */

          @media (min-width: 1600px) {
            .products-page {
              max-width: 1600px;
            }

            .products-grid {
              gap: 18px;
            }

            .product-card .title {
              font-size: 15px !important;
            }

            .product-card .price {
              font-size: 19px !important;
            }
          }

          /* =====================================================
             REDUCED MOTION
          ====================================================== */

          @media (prefers-reduced-motion: reduce) {
            .products-page::before,
            .product-card::before,
            .skeleton-image::after,
            .skeleton-line::after,
            .loading-dots span {
              animation: none !important;
              transition: none !important;
            }
            .product-card:hover::before {
              transform: translate3d(-200%, 0, 0) skewX(-25deg) !important;
            }
            .product-card,
            .favorite-button,
            .contact-btn,
            .load-more-button,
            .group-filter-item,
            .group-filter-clear,
            .sort-select,
            .error-retry-btn,
            .empty-products a {
              transition: none !important;
            }
            .product-card:hover {
              transform: none !important;
            }
          }
        `}
      </style>

      <div className="products-page">
        <main className="products-main">

          {/* ====================================================
              ONLY GROUP FILTER
          ===================================================== */}

          <GroupFilter
            value={
              filters.category || "all"
            }
            onChange={handleGroupChange}
          />

          {/* ====================================================
              HEADER
          ===================================================== */}

          <div className="products-header">
            <h1 className="products-heading">
              {filters.category !== "all" ? (
                <>
                  Products for
                  <span className="active-group">
                    {activeGroupLabel}
                  </span>
                </>
              ) : (
                "Products"
              )}
            </h1>

            <select
              value={sortOption}
              onChange={handleSortChange}
              className="sort-select"
              aria-label="Sort products"
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

          {/* ====================================================
              ERROR
          ===================================================== */}

          {error && !loading && (
            <div className="error-box">
              <p
                style={{
                  marginBottom: "12px",
                }}
              >
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="error-retry-btn"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ====================================================
              LOADING
          ===================================================== */}

          {loading ? (
            <>
              <LoadingDots />

              <div className="products-grid">
                {Array.from({
                  length: 8,
                }).map((_, index) => (
                  <ProductSkeleton
                    key={index}
                  />
                ))}
              </div>
            </>
          ) : sortedProducts.length ===
            0 ? (
            /* ==================================================
               EMPTY
            =================================================== */

            <div className="empty-products">
              <div
                style={{
                  fontSize: "34px",
                  marginBottom: "8px",
                }}
              >
                📦
              </div>

              <div>
                No ads found.
              </div>

              <Link to="/post-ad">
                Post your ad now!
              </Link>
            </div>
          ) : (
            /* ==================================================
               PRODUCTS
            =================================================== */

            <>
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
                  LOAD MORE
              =================================================== */}

              <div className="load-more-container">
                {hasMore ? (
                  <button
                    type="button"
                    className="load-more-button"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? "Loading..."
                      : "Load More"}
                  </button>
                ) : (
                  <p className="all-loaded">
                    All products loaded
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Products;