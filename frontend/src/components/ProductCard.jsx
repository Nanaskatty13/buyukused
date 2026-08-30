// frontend/src/components/ProductCard.jsx

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import {
  getImageUrl,
  updateProductStatus,
} from "../services/api";

import SoldBadge from "./SoldBadge";
import VerifiedBadge from "./VerifiedBadge";

const ProductCard = ({
  product,
  onStatusToggle,
  appleStyle = false,
  videoPreview = false,
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

  // ============================================================
  // PRODUCT ID
  // ============================================================

  const productId = product._id;

  // ============================================================
  // FAVORITE STATUS
  // ============================================================

  const liked = isFavorite(productId);

  // ============================================================
  // PRODUCT IMAGE
  // ============================================================

  const imagePath =
    product.images?.[0] ||
    product.image ||
    null;

  const imageUrl = imagePath
    ? getImageUrl(imagePath)
    : "https://placehold.co/400x300?text=No+Image";

  // ============================================================
  // BASIC PRODUCT DATA
  // ============================================================

  const swapLabel = product.swapAccepted
    ? "🔄 Swap OK"
    : "🚫 No swap";

  const isSold = product.status === "sold";

  // ============================================================
  // OWNER CHECK
  // ============================================================

  const isOwner =
    user &&
    (
      user.role === "admin" ||
      (
        product.sellerId?._id &&
        product.sellerId._id === user._id
      ) ||
      product.sellerId === user._id
    );

  // ============================================================
  // SELLER DATA
  // ============================================================

  const seller =
    product.sellerId ||
    product.seller ||
    {};

  const sellerName =
    seller.name ||
    seller.shopName ||
    "Seller";

  const isVerified =
    seller.isVerified === true;

  const sellerImage =
    seller.profileImage ||
    seller.avatar ||
    seller.photo ||
    seller.picture ||
    seller.profilePicture ||
    null;

  const sellerImageUrl =
    sellerImage
      ? getImageUrl(sellerImage)
      : null;

  // ============================================================
  // SELLER ATTRIBUTES
  // ============================================================

  const yearsOnPlatform =
    seller.yearsOnPlatform || 0;

  const accountType =
    seller.accountType || "";

  const isPopular =
    product.popular || false;

  const isVerifiedId =
    isVerified;

  // ============================================================
  // ACCOUNT BADGE
  // ============================================================

  const getAccountBadge = () => {
    const type =
      String(accountType).toLowerCase();

    if (type === "diamond") {
      return {
        label: "💎 DIAMOND",
        color: "#0ea5e9",
        bg: "#e0f2fe",
      };
    }

    if (type === "vip") {
      return {
        label: "⭐ VIP",
        color: "#f59e0b",
        bg: "#fef3c7",
      };
    }

    if (type === "enterprise") {
      return {
        label: "🏢 ENTERPRISE",
        color: "#8b5cf6",
        bg: "#ede9fe",
      };
    }

    return null;
  };

  const accountBadge =
    getAccountBadge();

  // ============================================================
  // CATEGORY-SPECIFIC SPECS
  // ============================================================

  const renderCategorySpecs = () => {
    const specs = [];

    const category =
      product.category;

    // ----------------------------------------------------------
    // LAPTOPS
    // ----------------------------------------------------------

    if (category === "Laptops") {
      if (product.brand) {
        specs.push({
          icon: "🏷️",
          label: product.brand,
        });
      }

      if (product.model) {
        specs.push({
          icon: "📟",
          label: product.model,
        });
      }

      if (product.processor) {
        specs.push({
          icon: "⚡",
          label: product.processor,
        });
      }

      if (product.ram) {
        specs.push({
          icon: "🧠",
          label: product.ram,
        });
      }

      if (product.graphics) {
        specs.push({
          icon: "🖥️",
          label: product.graphics,
        });
      }

      if (product.screenSize) {
        specs.push({
          icon: "📐",
          label: product.screenSize,
        });
      }

      if (product.storage) {
        specs.push({
          icon: "💾",
          label: product.storage,
        });
      }

      if (product.condition) {
        specs.push({
          icon: "📋",
          label: product.condition,
        });
      }
    }

    // ----------------------------------------------------------
    // TABLETS
    // ----------------------------------------------------------

    else if (category === "Tablets") {
      if (product.brand) {
        specs.push({
          icon: "🏷️",
          label: product.brand,
        });
      }

      if (product.model) {
        specs.push({
          icon: "📟",
          label: product.model,
        });
      }

      if (product.year) {
        specs.push({
          icon: "📅",
          label: product.year,
        });
      }

      if (product.connectivity) {
        specs.push({
          icon: "📶",
          label: product.connectivity,
        });
      }

      if (product.screenSize) {
        specs.push({
          icon: "📐",
          label: product.screenSize,
        });
      }

      if (product.storage) {
        specs.push({
          icon: "💾",
          label: product.storage,
        });
      }

      if (product.condition) {
        specs.push({
          icon: "📋",
          label: product.condition,
        });
      }
    }

    // ----------------------------------------------------------
    // PHONES
    // ----------------------------------------------------------

    else if (category === "Phones") {
      if (product.brand) {
        specs.push({
          icon: "🏷️",
          label: product.brand,
        });
      }

      if (product.model) {
        specs.push({
          icon: "📟",
          label: product.model,
        });
      }

      if (product.batteryHealth) {
        specs.push({
          icon: "🔋",
          label: `${product.batteryHealth}%`,
        });
      }

      if (product.faceId) {
        specs.push({
          icon: "😊",
          label: product.faceId,
        });
      }

      if (product.storage) {
        specs.push({
          icon: "💾",
          label: product.storage,
        });
      }

      if (product.condition) {
        specs.push({
          icon: "📋",
          label: product.condition,
        });
      }
    }

    // ----------------------------------------------------------
    // PROPERTY
    // ----------------------------------------------------------

    else if (
      category === "Property" ||
      category === "Real Estate"
    ) {
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

      if (product.condition) {
        specs.push({
          icon: "📋",
          label: product.condition,
        });
      }
    }

    // ----------------------------------------------------------
    // OTHER PRODUCTS
    // ----------------------------------------------------------

    else {
      if (product.brand) {
        specs.push({
          icon: "🏷️",
          label: product.brand,
        });
      }

      if (product.model) {
        specs.push({
          icon: "📟",
          label: product.model,
        });
      }

      if (product.storage) {
        specs.push({
          icon: "💾",
          label: product.storage,
        });
      }

      if (product.condition) {
        specs.push({
          icon: "📋",
          label: product.condition,
        });
      }
    }

    // Only show the first 4
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
            color: "#6b7280",
          }}
        >
          {spec.icon} {spec.label}
        </span>
      ));
  };

  // ============================================================
  // FAVORITE HANDLER
  // ============================================================

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // User must login
    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
        },
      });

      return;
    }

    if (!productId) {
      console.warn(
        "Cannot favorite product without product ID"
      );
      return;
    }

    // Toggle favorite
    toggleFavorite(productId);
  };

  // ============================================================
  // CHAT
  // ============================================================

  const handleChat = (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(
      `/product/${productId}?openChat=true`
    );
  };

  // ============================================================
  // CALL
  // ============================================================

  const handleCall = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rawPhone =
      seller?.phone || "";

    let phone =
      String(rawPhone).replace(/\D/g, "");

    if (
      phone.startsWith("0") &&
      phone.length === 10
    ) {
      phone =
        "233" +
        phone.substring(1);
    }

    if (
      !phone ||
      phone.length < 10
    ) {
      alert(
        "This seller has not provided a valid phone number."
      );

      return;
    }

    window.location.href =
      `tel:+${phone}`;
  };

  // ============================================================
  // MARK AS SOLD
  // ============================================================

  const handleMarkAsSold = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert(
        "Please login to manage your products."
      );

      return;
    }

    const newStatus =
      isSold
        ? "active"
        : "sold";

    const confirmMessage =
      isSold
        ? `Mark "${product.title}" as available again?`
        : `Mark "${product.title}" as sold? This will hide the Contact button.`;

    if (
      !window.confirm(
        confirmMessage
      )
    ) {
      return;
    }

    setIsUpdating(true);

    try {
      const result =
        await updateProductStatus(
          productId,
          newStatus,
          token
        );

      if (result.success) {
        alert(
          `✅ Product marked as ${
            newStatus === "sold"
              ? "sold"
              : "available"
          }!`
        );

        if (onStatusToggle) {
          onStatusToggle(productId);
        } else {
          window.location.reload();
        }
      } else {
        alert(
          "❌ Failed to update status: " +
          (
            result.message ||
            "Unknown error"
          )
        );
      }
    } catch (error) {
      alert(
        "❌ Error: " +
        (
          error.message ||
          "Something went wrong"
        )
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="product-card"
      style={{
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        border:
          "1px solid #e5e7eb",
        transition:
          "all 0.2s ease",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <Link
        to={`/product/${productId}`}
        className="image-wrapper"
        style={{
          position: "relative",
          paddingTop: "75%",
          background: "#f4f5f7",
          overflow: "hidden",
          display: "block",
        }}
      >
        <img
          src={imageUrl}
          alt={
            product.title ||
            "Product"
          }
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor:
              "#f4f5f7",
            transition:
              "transform 0.3s ease",
          }}
          loading="lazy"
          onError={(e) => {
            if (
              e.currentTarget.src !==
              "https://placehold.co/400x300?text=No+Image"
            ) {
              e.currentTarget.src =
                "https://placehold.co/400x300?text=No+Image";
            }
          }}
        />

        {/* ==================================================
            SOLD BADGE
        ================================================== */}

        {isSold && (
          <SoldBadge variant="card" />
        )}

        {/* ==================================================
            TOP-LEFT BADGES
        ================================================== */}

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
                  "#1DA1F2",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                textTransform:
                  "uppercase",
                display:
                  "inline-block",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              ✓ Verified ID
            </span>
          )}

          {isPopular && (
            <span
              style={{
                background:
                  "#f59e0b",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                textTransform:
                  "uppercase",
                display:
                  "inline-block",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              ★ Popular
            </span>
          )}

          {yearsOnPlatform >= 5 && (
            <span
              style={{
                background:
                  "#10b981",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                textTransform:
                  "uppercase",
                display:
                  "inline-block",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              {yearsOnPlatform}+
              {" "}
              years on platform
            </span>
          )}
        </div>

        {/* ==================================================
            ❤️ FAVORITE BUTTON
        ================================================== */}

        <button
          type="button"
          className="fav-btn"
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
            top: "10px",
            right: "10px",
            zIndex: 10,

            width: "40px",
            height: "40px",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            borderRadius: "50%",

            border:
              "1px solid rgba(255,255,255,0.8)",

            background:
              "rgba(255,255,255,0.94)",

            color: liked
              ? "#e53935"
              : "#374151",

            fontSize: "19px",

            cursor: "pointer",

            boxShadow:
              "0 3px 10px rgba(0,0,0,0.18)",

            backdropFilter:
              "blur(6px)",

            WebkitBackdropFilter:
              "blur(6px)",

            transition:
              "transform 0.2s ease, color 0.2s ease, background 0.2s ease",

            transform:
              liked
                ? "scale(1.05)"
                : "scale(1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "scale(1.12)";

            e.currentTarget.style.color =
              "#e53935";

            e.currentTarget.style.background =
              "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              liked
                ? "scale(1.05)"
                : "scale(1)";

            e.currentTarget.style.color =
              liked
                ? "#e53935"
                : "#374151";

            e.currentTarget.style.background =
              "rgba(255,255,255,0.94)";
          }}
        >
          <i
            className={
              liked
                ? "fas fa-heart"
                : "far fa-heart"
            }
          />
        </button>

        {/* ==================================================
            VIDEO BADGE
        ================================================== */}

        {videoPreview && (
          <div
            className="product-card-video-badge"
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              background:
                "rgba(0,0,0,0.7)",
              backdropFilter:
                "blur(4px)",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              fontSize: "14px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <span
              style={{
                marginLeft: "2px",
              }}
            >
              ▶
            </span>
          </div>
        )}
      </Link>

      {/* ======================================================
          PRODUCT INFORMATION
      ====================================================== */}

      <div
        className="info"
        style={{
          padding:
            "12px 14px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* ==================================================
            TITLE
        ================================================== */}

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
              display:
                "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient:
                "vertical",
              overflow: "hidden",
              color: "#111827",
              marginBottom: "2px",
            }}
          >
            {product.title ||
              "Untitled"}
          </div>
        </Link>

        {/* ==================================================
            PRICE
        ================================================== */}

        <div
          className="price"
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: isSold
              ? "#9ca3af"
              : "#0066cc",
            display: "flex",
            alignItems:
              "center",
            gap: "8px",
          }}
        >
          GH₵{" "}
          {Number(
            product.price || 0
          ).toLocaleString()}

          {isSold && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#dc2626",
                background:
                  "#fee2e2",
                padding:
                  "2px 8px",
                borderRadius: "4px",
              }}
            >
              SOLD
            </span>
          )}
        </div>

        {/* ==================================================
            LOCATION / CONDITION
        ================================================== */}

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "8px",
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "2px",
          }}
        >
          <span>
            {product.location ||
              "Ghana"}
          </span>

          <span>•</span>

          <span>
            {product.condition ||
              "Used"}
          </span>
        </div>

        {/* ==================================================
            SPECS
        ================================================== */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 10px",
            fontSize: "12px",
            color: "#6b7280",
            margin:
              "6px 0 8px",
          }}
        >
          {renderCategorySpecs()}

          {product.warranty && (
            <span
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "3px",
              }}
            >
              <i className="fas fa-shield-alt" />
              {" "}
              {product.warranty}
            </span>
          )}

          {product.simStatus &&
            product.category !==
              "Laptops" && (
              <span
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "3px",
                  color: "#0055a5",
                  fontWeight: 600,
                }}
              >
                <i className="fas fa-sim-card" />
                {" "}
                SIM:{" "}
                {product.simStatus}
              </span>
            )}

          <span>
            {swapLabel}
          </span>
        </div>

        {/* ==================================================
            ✨ DESCRIPTION (NEW)
        ================================================== */}

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

        {/* ==================================================
            SELLER INFORMATION
        ================================================== */}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems:
              "center",
            gap: "8px",
            paddingTop: "10px",
            borderTop:
              "1px solid #f3f4f6",
          }}
        >
          {sellerImageUrl ? (
            <img
              src={sellerImageUrl}
              alt={sellerName}
              style={{
                width: "28px",
                height: "28px",
                borderRadius:
                  "50%",
                objectFit: "cover",
                border:
                  "1px solid #e5e7eb",
              }}
            />
          ) : (
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius:
                  "50%",
                background:
                  "#e5e7eb",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "12px",
                color: "#9ca3af",
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
                alignItems:
                  "center",
                gap: "4px",
                flexWrap:
                  "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color:
                    "#111827",
                }}
              >
                {sellerName}
              </span>

              {isVerified && (
                <VerifiedBadge
                  size={12}
                />
              )}
            </div>

            {accountBadge && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color:
                    accountBadge.color,
                  background:
                    accountBadge.bg,
                  padding:
                    "1px 6px",
                  borderRadius:
                    "10px",
                  display:
                    "inline-block",
                  marginTop: "2px",
                }}
              >
                {accountBadge.label}
              </span>
            )}
          </div>

          {yearsOnPlatform >=
            3 && (
            <span
              style={{
                fontSize: "10px",
                color:
                  "#6b7280",
                whiteSpace:
                  "nowrap",
              }}
            >
              {yearsOnPlatform}+
              {" "}
              yrs
            </span>
          )}
        </div>

        {/* ==================================================
            CONTACT BUTTONS
        ================================================== */}

        {seller?.phone && (
          <div
            className="contact-buttons"
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "8px",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop:
                "1px solid #f3f4f6",
            }}
          >
            {/* CHAT */}

            <button
              type="button"
              onClick={handleChat}
              className="contact-btn chat-btn"
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "4px",
                padding:
                  "5px 12px",
                borderRadius:
                  "16px",
                border: "none",
                background:
                  "#25D366",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                cursor:
                  "pointer",
                transition:
                  "background 0.2s",
                flex: 1,
                minHeight:
                  "28px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#1ebe5c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#25D366";
              }}
            >
              <i
                className="fas fa-comment-dots"
                style={{
                  fontSize: "13px",
                }}
              />

              CHAT
            </button>

            {/* CALL */}

            <button
              type="button"
              onClick={handleCall}
              className="contact-btn call-btn"
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "4px",
                padding:
                  "5px 12px",
                borderRadius:
                  "16px",
                border: "none",
                background:
                  "#3b82f6",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                cursor:
                  "pointer",
                transition:
                  "background 0.2s",
                flex: 1,
                minHeight:
                  "28px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#3b82f6";
              }}
            >
              <i
                className="fas fa-phone"
                style={{
                  fontSize: "13px",
                }}
              />

              CALL
            </button>
          </div>
        )}

        {/* ==================================================
            OWNER ACTIONS
        ================================================== */}

        {isOwner && (
          <div
            style={{
              marginTop: "8px",
              display: "flex",
              gap: "6px",
            }}
          >
            {/* MARK SOLD */}

            <button
              type="button"
              onClick={
                handleMarkAsSold
              }
              disabled={
                isUpdating
              }
              style={{
                padding:
                  "4px 12px",
                background:
                  isSold
                    ? "#22c55e"
                    : "#dc2626",
                color: "white",
                border: "none",
                borderRadius:
                  "4px",
                fontSize: "12px",
                fontWeight: 600,
                cursor:
                  isUpdating
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  isUpdating
                    ? 0.6
                    : 1,
                flex: 1,
              }}
            >
              {isUpdating
                ? "⏳"
                : isSold
                ? "Mark Available"
                : "Mark Sold"}
            </button>

            {/* EDIT */}

            <Link
              to={`/edit-product/${productId}`}
              style={{
                padding:
                  "4px 12px",
                background:
                  "#2563eb",
                color: "white",
                borderRadius:
                  "4px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration:
                  "none",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;