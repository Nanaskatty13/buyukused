// frontend/src/components/ProductCard.jsx

import React, { useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import {
  getImageUrl,
  updateProductStatus,
} from "../services/api";

import SoldBadge from "./SoldBadge";
import VerifiedBadge from "./VerifiedBadge";

const ProductCard = React.memo(({
  product,
  onStatusToggle,
  appleStyle = false,
  videoPreview = false,
  isFirstCard = false,
}) => {
  const {
    toggleFavorite,
    isFavorite,
  } = useCart();

  const {
    user,
    token,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [isUpdating, setIsUpdating] = useState(false);

  if (!product) return null;

  const productId = product._id;

  const liked = useMemo(() => isFavorite(productId), [isFavorite, productId]);

  const imagePath = useMemo(
    () => product.images?.[0] || product.image || null,
    [product.images, product.image]
  );

  const imageUrl = useMemo(
    () => imagePath ? getImageUrl(imagePath) : "https://placehold.co/400x300?text=No+Image",
    [imagePath]
  );

  const swapLabel = useMemo(
    () => (product.swapAccepted ? "🔄 Swap OK" : "🚫 No swap"),
    [product.swapAccepted]
  );

  const isSold = useMemo(() => product.status === "sold", [product.status]);

  const isOwner = useMemo(
    () =>
      user &&
      (user.role === "admin" ||
        (product.sellerId?._id && product.sellerId._id === user._id) ||
        product.sellerId === user._id),
    [user, product.sellerId]
  );

  const seller = useMemo(
    () => product.sellerId || product.seller || {},
    [product.sellerId, product.seller]
  );

  const sellerName = useMemo(
    () => seller.name || seller.shopName || "Seller",
    [seller.name, seller.shopName]
  );

  const isVerified = useMemo(() => seller.isVerified === true, [seller.isVerified]);

  const sellerImage = useMemo(
    () =>
      seller.profileImage ||
      seller.avatar ||
      seller.photo ||
      seller.picture ||
      seller.profilePicture ||
      null,
    [seller.profileImage, seller.avatar, seller.photo, seller.picture, seller.profilePicture]
  );

  const sellerImageUrl = useMemo(
    () => (sellerImage ? getImageUrl(sellerImage) : null),
    [sellerImage]
  );

  const yearsOnPlatform = useMemo(() => seller.yearsOnPlatform || 0, [seller.yearsOnPlatform]);
  const accountType = useMemo(() => seller.accountType || "", [seller.accountType]);
  const isPopular = useMemo(() => product.popular || false, [product.popular]);
  const isVerifiedId = useMemo(() => isVerified, [isVerified]);

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

  const categorySpecs = useMemo(() => {
    const specs = [];
    const category = product.category;

    if (category === "Laptops") {
      if (product.brand) specs.push({ icon: "🏷️", label: product.brand });
      if (product.model) specs.push({ icon: "📟", label: product.model });
      if (product.processor) specs.push({ icon: "⚡", label: product.processor });
      if (product.ram) specs.push({ icon: "🧠", label: product.ram });
      if (product.graphics) specs.push({ icon: "🖥️", label: product.graphics });
      if (product.screenSize) specs.push({ icon: "📐", label: product.screenSize });
      if (product.storage) specs.push({ icon: "💾", label: product.storage });
      if (product.condition) specs.push({ icon: "📋", label: product.condition });
    } else if (category === "Tablets") {
      if (product.brand) specs.push({ icon: "🏷️", label: product.brand });
      if (product.model) specs.push({ icon: "📟", label: product.model });
      if (product.year) specs.push({ icon: "📅", label: product.year });
      if (product.connectivity) specs.push({ icon: "📶", label: product.connectivity });
      if (product.screenSize) specs.push({ icon: "📐", label: product.screenSize });
      if (product.storage) specs.push({ icon: "💾", label: product.storage });
      if (product.condition) specs.push({ icon: "📋", label: product.condition });
    } else if (category === "Phones") {
      if (product.brand) specs.push({ icon: "🏷️", label: product.brand });
      if (product.model) specs.push({ icon: "📟", label: product.model });
      if (product.batteryHealth) specs.push({ icon: "🔋", label: `${product.batteryHealth}%` });
      if (product.faceId) specs.push({ icon: "😊", label: product.faceId });
      if (product.storage) specs.push({ icon: "💾", label: product.storage });
      if (product.condition) specs.push({ icon: "📋", label: product.condition });
    } else if (category === "Property" || category === "Real Estate") {
      if (product.bedrooms) specs.push({ icon: "🛏️", label: `${product.bedrooms} bedrooms` });
      if (product.bathrooms) specs.push({ icon: "🚿", label: `${product.bathrooms} baths` });
      if (product.sqm) specs.push({ icon: "📐", label: `${product.sqm} sqm` });
      if (product.propertyType) specs.push({ icon: "🏠", label: product.propertyType });
      if (product.condition) specs.push({ icon: "📋", label: product.condition });
    } else {
      if (product.brand) specs.push({ icon: "🏷️", label: product.brand });
      if (product.model) specs.push({ icon: "📟", label: product.model });
      if (product.storage) specs.push({ icon: "💾", label: product.storage });
      if (product.condition) specs.push({ icon: "📋", label: product.condition });
    }

    return specs.slice(0, 4);
  }, [
    product.category,
    product.brand,
    product.model,
    product.processor,
    product.ram,
    product.graphics,
    product.screenSize,
    product.storage,
    product.condition,
    product.year,
    product.connectivity,
    product.batteryHealth,
    product.faceId,
    product.bedrooms,
    product.bathrooms,
    product.sqm,
    product.propertyType,
  ]);

  const cityOnly = useMemo(() => {
    if (!product.location) return "";
    const parts = String(product.location).split(",").map((s) => s.trim());
    return parts[0] || product.location;
  }, [product.location]);

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

  const handleFavorite = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      if (!productId) {
        console.warn("Cannot favorite product without product ID");
        return;
      }
      toggleFavorite(productId);
    },
    [user, productId, toggleFavorite, navigate, location.pathname]
  );

  const handleChat = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/product/${productId}?openChat=true`);
    },
    [productId, navigate]
  );

  const handleCall = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rawPhone = seller?.phone || "";
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
    [seller?.phone]
  );

  const handleMarkAsSold = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        alert("Please login to manage your products.");
        return;
      }
      const newStatus = isSold ? "active" : "sold";
      const confirmMessage = isSold
        ? `Mark "${product.title}" as available again?`
        : `Mark "${product.title}" as sold? This will hide the Contact button.`;
      if (!window.confirm(confirmMessage)) return;
      setIsUpdating(true);
      try {
        const result = await updateProductStatus(productId, newStatus, token);
        if (result.success) {
          alert(`✅ Product marked as ${newStatus === "sold" ? "sold" : "available"}!`);
          if (onStatusToggle) {
            onStatusToggle(productId);
          } else {
            window.location.reload();
          }
        } else {
          alert("❌ Failed to update status: " + (result.message || "Unknown error"));
        }
      } catch (error) {
        alert("❌ Error: " + (error.message || "Something went wrong"));
      } finally {
        setIsUpdating(false);
      }
    },
    [user, isSold, product.title, productId, token, onStatusToggle]
  );

  const renderCategorySpecs = useCallback(() => {
    return categorySpecs.map((spec, index) => (
      <span
        key={`${spec.label}-${index}`}
        className="pc-spec-chip"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "12px",
          color: "#374151",
        }}
      >
        {spec.icon} {spec.label}
      </span>
    ));
  }, [categorySpecs]);

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          LIQUID iOS27 — PRODUCT CARD
          ═══════════════════════════════════════════════════ */}
      <style>{`
        .product-card.liquid-pc {
          position: relative;
          isolation: isolate;
        }

        /* Card hover */
        .product-card.liquid-pc:hover {
          border-color: rgba(255,255,255,0.98) !important;
          box-shadow:
            0 14px 40px rgba(31,38,135,0.16),
            inset 0 1px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(255,255,255,0.3) !important;
          transform: translateY(-2px);
        }

        .product-card.liquid-pc > * { position: relative; z-index: 1; }

        /* Favorite hover (inline-style swap) */
        .product-card.liquid-pc .fav-btn {
          transition: transform 0.2s ease, color 0.2s ease, background 0.2s ease;
        }

        /* Contact button base — inline overrides remain */
        .product-card.liquid-pc .contact-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .product-card.liquid-pc .contact-btn:hover {
          transform: translateY(-1px);
        }
        .product-card.liquid-pc .contact-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* Location chip hover (inline handled, but soften) */
        .product-card.liquid-pc .loc-chip:active {
          transform: scale(0.97) !important;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .product-card.liquid-pc,
          .product-card.liquid-pc .fav-btn,
          .product-card.liquid-pc .contact-btn {
            transition: none !important;
          }
          .product-card.liquid-pc:hover {
            transform: none !important;
          }
          .product-card.liquid-pc .contact-btn:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div
        className="product-card liquid-pc"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(238,246,255,0.42) 50%, rgba(255,255,255,0.62) 100%)",
          backdropFilter: "blur(14px) saturate(180%)",
          WebkitBackdropFilter: "blur(14px) saturate(180%)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.75)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease",
          boxShadow:
            "0 8px 28px rgba(31,38,135,0.10), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.25)",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <Link
          to={`/product/${productId}`}
          className="image-wrapper"
          style={{
            position: "relative",
            paddingTop: "75%",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(238,246,255,0.3) 100%)",
            overflow: "hidden",
            display: "block",
          }}
        >
          {/* FIX: use lowercase `fetchpriority` */}
          <img
            src={imageUrl}
            alt={product.title || "Product"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "transparent",
              transition: "transform 0.3s ease",
            }}
            loading={isFirstCard ? "eager" : "lazy"}
            fetchpriority={isFirstCard ? "high" : "auto"}
            onError={(e) => {
              if (e.currentTarget.src !== "https://placehold.co/400x300?text=No+Image") {
                e.currentTarget.src = "https://placehold.co/400x300?text=No+Image";
              }
            }}
          />

          {isSold && <SoldBadge variant="card" />}

          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              zIndex: 2,
            }}
          >
            {isVerifiedId && (
              <span
                style={{
                  background:
                    "linear-gradient(135deg, rgba(29,161,242,0.94) 0%, rgba(29,161,242,0.78) 100%)",
                  backdropFilter: "blur(8px) saturate(180%)",
                  WebkitBackdropFilter: "blur(8px) saturate(180%)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                  display: "inline-block",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                ✓ Verified ID
              </span>
            )}
            {isPopular && (
              <span
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245,158,11,0.94) 0%, rgba(245,158,11,0.78) 100%)",
                  backdropFilter: "blur(8px) saturate(180%)",
                  WebkitBackdropFilter: "blur(8px) saturate(180%)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                  display: "inline-block",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.15)",
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
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                  display: "inline-block",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                {yearsOnPlatform}+ years on platform
              </span>
            )}
          </div>

          <button
            type="button"
            className="fav-btn"
            onClick={handleFavorite}
            aria-label={liked ? "Remove from favorites" : "Add to favorites"}
            title={liked ? "Remove from favorites" : "Add to favorites"}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 10,
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.65)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.4) 100%)",
              color: liked ? "#e53935" : "#374151",
              fontSize: "19px",
              cursor: "pointer",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.9), 0 3px 10px rgba(0,0,0,0.18)",
              backdropFilter: "blur(10px) saturate(180%)",
              WebkitBackdropFilter: "blur(10px) saturate(180%)",
              transition: "transform 0.2s ease, color 0.2s ease, background 0.2s ease",
              transform: liked ? "scale(1.05)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.12)";
              e.currentTarget.style.color = "#e53935";
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = liked ? "scale(1.05)" : "scale(1)";
              e.currentTarget.style.color = liked ? "#e53935" : "#374151";
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.4) 100%)";
            }}
          >
            <i className={liked ? "fas fa-heart" : "far fa-heart"} />
          </button>

          {videoPreview && (
            <div
              className="product-card-video-badge"
              style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                background:
                  "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 100%)",
                backdropFilter: "blur(10px) saturate(180%)",
                WebkitBackdropFilter: "blur(10px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.3)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              <span style={{ marginLeft: "2px" }}>▶</span>
            </div>
          )}
        </Link>

        <div
          className="info"
          style={{
            padding: "12px 14px 14px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <Link
            to={`/product/${productId}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
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
              {product.title || "Untitled"}
            </div>
          </Link>

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
            GH₵ {Number(product.price || 0).toLocaleString()}
            {isSold && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#b91c1c",
                  background:
                    "linear-gradient(135deg, rgba(254,226,226,0.9) 0%, rgba(254,202,202,0.7) 100%)",
                  backdropFilter: "blur(8px) saturate(180%)",
                  WebkitBackdropFilter: "blur(8px) saturate(180%)",
                  border: "1px solid rgba(252,165,165,0.6)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                SOLD
              </span>
            )}
          </div>

          <div
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
                className="loc-chip"
                onClick={handleLocationFilter}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(238,242,255,0.85) 0%, rgba(199,210,254,0.55) 100%)",
                  backdropFilter: "blur(8px) saturate(180%)",
                  WebkitBackdropFilter: "blur(8px) saturate(180%)",
                  color: "#4f46e5",
                  border: "1px solid rgba(255,255,255,0.75)",
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
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(31,38,135,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(224,231,255,0.95) 0%, rgba(199,210,254,0.7) 100%)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(238,242,255,0.85) 0%, rgba(199,210,254,0.55) 100%)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title={`Filter by ${cityOnly}`}
              >
                <i className="fas fa-map-pin" style={{ fontSize: "9px" }} />
                Loc:{cityOnly}
              </button>
            )}
            <span>•</span>
            <span>{product.condition || "Used"}</span>
          </div>

          <div
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
            {product.warranty && (
              <span
                className="pc-spec-chip"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  color: "#374151",
                }}
              >
                <i className="fas fa-shield-alt" /> {product.warranty}
              </span>
            )}
            {product.simStatus && product.category !== "Laptops" && (
              <span
                className="pc-spec-chip"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  color: "#0055a5",
                  fontWeight: 600,
                }}
              >
                <i className="fas fa-sim-card" /> SIM: {product.simStatus}
              </span>
            )}
            <span className="pc-spec-chip">{swapLabel}</span>
          </div>

          {product.description && (
            <div
              className="product-description"
              style={{
                margin: "4px 0 6px",
                fontSize: "13px",
                lineHeight: 1.4,
                color: "#6b7280",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {product.description}
            </div>
          )}

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              paddingTop: "10px",
              borderTop: "1px solid rgba(255,255,255,0.6)",
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
                  border: "1px solid rgba(255,255,255,0.85)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(238,246,255,0.45) 100%)",
                  backdropFilter: "blur(8px) saturate(180%)",
                  WebkitBackdropFilter: "blur(8px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.75)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#9ca3af",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
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
                    backdropFilter: "blur(6px) saturate(180%)",
                    WebkitBackdropFilter: "blur(6px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.65)",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    display: "inline-block",
                    marginTop: "2px",
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
                  fontSize: "10px",
                  color: "#6b7280",
                  whiteSpace: "nowrap",
                }}
              >
                {yearsOnPlatform}+ yrs
              </span>
            )}
          </div>

          {seller?.phone && (
            <div
              className="contact-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
                paddingTop: "8px",
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
                  gap: "4px",
                  padding: "5px 12px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background:
                    "linear-gradient(135deg, rgba(37,211,102,0.94) 0%, rgba(29,177,84,0.88) 100%)",
                  backdropFilter: "blur(12px) saturate(180%)",
                  WebkitBackdropFilter: "blur(12px) saturate(180%)",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.15s ease, box-shadow 0.15s ease",
                  flex: 1,
                  minHeight: "28px",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(37,211,102,0.28)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(37,211,102,1) 0%, rgba(29,177,84,0.94) 100%)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 20px rgba(37,211,102,0.42)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(37,211,102,0.94) 0%, rgba(29,177,84,0.88) 100%)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(37,211,102,0.28)";
                }}
              >
                <i className="fas fa-comment-dots" style={{ fontSize: "13px" }} />
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
                  gap: "4px",
                  padding: "5px 12px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.94) 0%, rgba(37,99,235,0.88) 100%)",
                  backdropFilter: "blur(12px) saturate(180%)",
                  WebkitBackdropFilter: "blur(12px) saturate(180%)",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.15s ease, box-shadow 0.15s ease",
                  flex: 1,
                  minHeight: "28px",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(59,130,246,0.28)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(59,130,246,1) 0%, rgba(37,99,235,0.94) 100%)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 20px rgba(59,130,246,0.42)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(59,130,246,0.94) 0%, rgba(37,99,235,0.88) 100%)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(59,130,246,0.28)";
                }}
              >
                <i className="fas fa-phone" style={{ fontSize: "13px" }} />
                CALL
              </button>
            </div>
          )}

          {isOwner && (
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                gap: "6px",
              }}
            >
              <button
                type="button"
                onClick={handleMarkAsSold}
                disabled={isUpdating}
                style={{
                  padding: "5px 12px",
                  background: isSold
                    ? "linear-gradient(135deg, rgba(34,197,94,0.94) 0%, rgba(22,163,74,0.88) 100%)"
                    : "linear-gradient(135deg, rgba(239,68,68,0.94) 0%, rgba(220,38,38,0.88) 100%)",
                  backdropFilter: "blur(12px) saturate(180%)",
                  WebkitBackdropFilter: "blur(12px) saturate(180%)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  opacity: isUpdating ? 0.6 : 1,
                  flex: 1,
                  boxShadow: isSold
                    ? "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(34,197,94,0.28)"
                    : "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(239,68,68,0.28)",
                }}
              >
                {isUpdating ? "⏳" : isSold ? "Mark Available" : "Mark Sold"}
              </button>
              <Link
                to={`/edit-product/${productId}`}
                style={{
                  padding: "5px 12px",
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.94) 0%, rgba(29,78,216,0.88) 100%)",
                  backdropFilter: "blur(12px) saturate(180%)",
                  WebkitBackdropFilter: "blur(12px) saturate(180%)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(37,99,235,0.28)",
                }}
              >
                Edit
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;