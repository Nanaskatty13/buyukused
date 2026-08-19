// frontend/src/pages/SellerPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  getPublicSellerProfile,
  getPublicSellerProducts,
} from "../services/sellerService";
import ProductCard from "../components/ProductCard";

// ============================================================
// IMAGE URL HELPER
// ============================================================
// IMPORTANT:
// Do NOT pass an already complete Cloudinary URL through
// getImageUrl(), because it may transform the URL incorrectly.
// ============================================================

const buildImageUrl = (image) => {
  if (!image) return null;

  const value = String(image).trim();

  if (!value) return null;

  // Cloudinary / external HTTPS URL
  if (
    value.startsWith("https://") ||
    value.startsWith("http://")
  ) {
    return value;
  }

  // Protocol-relative URL
  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  // Backend URL
  const apiBase =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:5000";

  const cleanBase = apiBase.replace(/\/+$/, "");

  // Already starts with /uploads
  if (value.startsWith("/uploads/")) {
    return `${cleanBase}${value}`;
  }

  // Already starts with uploads/
  if (value.startsWith("uploads/")) {
    return `${cleanBase}/${value}`;
  }

  // Relative path
  if (value.startsWith("/")) {
    return `${cleanBase}${value}`;
  }

  // Cloudinary public ID/path without protocol
  // If your database stores a relative Cloudinary path,
  // it will be handled by the backend URL.
  return `${cleanBase}/${value}`;
};

// ============================================================
// RELATIVE TIME
// ============================================================

const timeAgo = (dateString) => {
  if (!dateString) return "N/A";

  const past = new Date(dateString);

  if (Number.isNaN(past.getTime())) {
    return "N/A";
  }

  const now = new Date();

  const diffMs = Math.max(
    0,
    now.getTime() - past.getTime()
  );

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears} year${
      diffYears > 1 ? "s" : ""
    } ago`;
  }

  if (diffMonths > 0) {
    return `${diffMonths} month${
      diffMonths > 1 ? "s" : ""
    } ago`;
  }

  if (diffDays > 0) {
    return `${diffDays} day${
      diffDays > 1 ? "s" : ""
    } ago`;
  }

  if (diffHr > 0) {
    return `${diffHr} hour${
      diffHr > 1 ? "s" : ""
    } ago`;
  }

  if (diffMin > 0) {
    return `${diffMin} minute${
      diffMin > 1 ? "s" : ""
    } ago`;
  }

  return "Just now";
};

// ============================================================
// SELLER PAGE
// ============================================================

const SellerPage = () => {
  const { sellerId } = useParams();

  const { user } = useAuth();

  const {
    toggleFavorite,
    isFavorite,
  } = useCart();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [pagination, setPagination] =
    useState(null);

  // ==========================================================
  // FETCH SELLER DATA
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchSellerData = async () => {
      if (!sellerId) {
        setError("No seller ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // ------------------------------------------------------
        // SELLER PROFILE
        // ------------------------------------------------------

        const profileData =
          await getPublicSellerProfile(
            sellerId
          );

        console.log(
          "👤 COMPLETE SELLER PROFILE RESPONSE:",
          profileData
        );

        if (cancelled) return;

        if (
          !profileData?.success ||
          !profileData?.seller
        ) {
          setError(
            profileData?.message ||
              "Failed to load seller profile."
          );

          setLoading(false);
          return;
        }

        const sellerData =
          profileData.seller;

        // ------------------------------------------------------
        // IMPORTANT:
        // Support every profile-image field currently used
        // by your backend/database.
        // ------------------------------------------------------

        const rawAvatar =
          sellerData.avatar ||
          sellerData.photoURL ||
          sellerData.profileImage ||
          sellerData.photo ||
          null;

        const avatarUrl =
          buildImageUrl(rawAvatar);

        console.log(
          "🖼️ Seller raw avatar:",
          rawAvatar
        );

        console.log(
          "🖼️ Seller final avatar URL:",
          avatarUrl
        );

        // ------------------------------------------------------
        // SELLER DATE
        // ------------------------------------------------------

        const memberSince =
          sellerData.sellerSince ||
          sellerData.memberSince ||
          sellerData.createdAt ||
          null;

        const normalizedSeller = {
          _id:
            sellerData._id ||
            sellerId,

          name:
            sellerData.name ||
            "Seller",

          shopName:
            sellerData.shopName ||
            "",

          shopDescription:
            sellerData.shopDescription ||
            "",

          phone:
            sellerData.phone ||
            "",

          email:
            sellerData.email ||
            "",

          location:
            sellerData.location ||
            "",

          // Final image URL
          avatar:
            avatarUrl,

          // Keep original values too
          photoURL:
            sellerData.photoURL ||
            null,

          profileImage:
            sellerData.profileImage ||
            null,

          photo:
            sellerData.photo ||
            null,

          createdAt:
            sellerData.createdAt ||
            null,

          sellerSince:
            sellerData.sellerSince ||
            null,

          memberSince,

          lastActive:
            sellerData.lastActive ||
            null,

          lastSeen:
            sellerData.lastSeen ||
            null,

          role:
            sellerData.role ||
            "seller",

          rating:
            Number(
              sellerData.rating || 0
            ),

          productsCount:
            Number(
              sellerData.productsCount || 0
            ),
        };

        setSeller(
          normalizedSeller
        );

        // ------------------------------------------------------
        // SELLER PRODUCTS
        // ------------------------------------------------------

        const productsData =
          await getPublicSellerProducts(
            sellerId,
            {
              page: 1,
              limit: 20,
              sort: "-createdAt",
            }
          );

        if (cancelled) return;

        console.log(
          "📦 Seller products:",
          productsData
        );

        if (
          productsData?.success
        ) {
          setProducts(
            productsData.products ||
              []
          );

          if (
            productsData.pagination
          ) {
            setPagination(
              productsData.pagination
            );
          }
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (cancelled) return;

        console.error(
          "❌ Error fetching seller data:",
          err
        );

        setError(
          err?.message ||
            "An error occurred while loading the seller."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSellerData();

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        Loading seller profile...
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: "#e74c3c",
        }}
      >
        {error}
      </div>
    );
  }

  // ==========================================================
  // NO SELLER
  // ==========================================================

  if (!seller) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        Seller not found.
      </div>
    );
  }

  // ==========================================================
  // SELLER INFORMATION
  // ==========================================================

  const sellerName =
    seller.shopName ||
    seller.name ||
    "Unknown Seller";

  const sellerMemberDate =
    seller.memberSince ||
    seller.sellerSince ||
    seller.createdAt ||
    null;

  const memberSince =
    sellerMemberDate
      ? new Date(
          sellerMemberDate
        ).toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : "N/A";

  const memberDuration =
    sellerMemberDate
      ? timeAgo(
          sellerMemberDate
        )
      : "N/A";

  const lastSeen =
    seller.lastActive ||
    seller.lastSeen
      ? timeAgo(
          seller.lastActive ||
            seller.lastSeen
        )
      : null;

  const productCount =
    seller.productsCount ||
    products.length;

  // ==========================================================
  // WHATSAPP
  // ==========================================================

  const handleWhatsApp = () => {
    const rawPhone =
      seller.phone || "";

    let phone = String(
      rawPhone
    ).replace(/\D/g, "");

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

    const message =
      "Hi, I'm interested in your products listed on BuyUkUsed.com. Are you available?";

    const encoded =
      encodeURIComponent(
        message
      );

    window.location.href =
      `https://wa.me/${phone}?text=${encoded}`;
  };

  // ==========================================================
  // AVATAR ERROR HANDLER
  // ==========================================================

  const handleAvatarError = (
    event
  ) => {
    console.error(
      "❌ Seller profile image failed to load:",
      seller.avatar
    );

    event.currentTarget.style.display =
      "none";

    const fallback =
      event.currentTarget.parentElement?.querySelector(
        ".seller-avatar-fallback"
      );

    if (fallback) {
      fallback.style.display =
        "flex";
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <style>
        {`
          .seller-profile-card {
            background: white;
            border-radius: var(--radius-xl);
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            margin-bottom: 40px;
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            align-items: center;
          }

          .seller-avatar-wrapper {
            width: 120px;
            height: 120px;
            min-width: 120px;
            border-radius: 50%;
            overflow: hidden;
            background: var(--gray-200);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            flex-shrink: 0;
          }

          .seller-avatar-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            object-position: center;
          }

          .seller-avatar-fallback {
            position: absolute;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: var(--gray-200);
          }

          .seller-avatar-fallback i {
            font-size: 64px;
            color: var(--gray-400);
          }

          .seller-info {
            flex: 1;
            min-width: 250px;
          }

          .seller-products-grid {
            display: grid;
            grid-template-columns: repeat(
              auto-fill,
              minmax(250px, 1fr)
            );
            gap: 24px;
          }

          @media (max-width: 600px) {
            .seller-profile-card {
              padding: 20px;
              gap: 20px;
              flex-direction: column;
              text-align: center;
            }

            .seller-avatar-wrapper {
              width: 110px;
              height: 110px;
              min-width: 110px;
            }

            .seller-info {
              width: 100%;
              min-width: 0;
            }

            .seller-info-stats {
              justify-content: center !important;
            }

            .seller-products-grid {
              grid-template-columns: repeat(
                2,
                1fr
              ) !important;
              gap: 12px !important;
            }

            .seller-products-grid .product-card {
              min-width: 0 !important;
            }
          }
        `}
      </style>

      <div
        className="container"
        style={{
          padding: "30px 20px",
        }}
      >
        {/* ====================================================
            SELLER PROFILE
        ==================================================== */}

        <div className="seller-profile-card">
          {/* PROFILE PICTURE */}

          <div className="seller-avatar-wrapper">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={`${sellerName} profile`}
                className="seller-avatar-image"
                loading="eager"
                decoding="async"
                onError={
                  handleAvatarError
                }
              />
            ) : null}

            <div className="seller-avatar-fallback">
              <i className="fas fa-user-circle" />
            </div>

            {!seller.avatar && (
              <div
                className="seller-avatar-fallback"
                style={{
                  display: "flex",
                }}
              >
                <i className="fas fa-user-circle" />
              </div>
            )}
          </div>

          {/* SELLER INFORMATION */}

          <div className="seller-info">
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              {sellerName}
            </h1>

            {seller.location && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "4px",
                }}
              >
                <i className="fas fa-map-marker-alt" />{" "}
                {seller.location}
              </div>
            )}

            {seller.role && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "4px",
                }}
              >
                <i className="fas fa-user-tag" />{" "}
                {seller.role
                  .charAt(0)
                  .toUpperCase() +
                  seller.role.slice(
                    1
                  )}
              </div>
            )}

            <div
              style={{
                color:
                  "var(--gray-500)",
                marginBottom: "4px",
              }}
            >
              <i className="fas fa-calendar-alt" />{" "}
              Member since{" "}
              {memberSince}
              {memberDuration !==
                "N/A" && (
                <>
                  {" "}
                  ({memberDuration})
                </>
              )}
            </div>

            {lastSeen && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "12px",
                }}
              >
                <i className="fas fa-clock" />{" "}
                Last seen:{" "}
                {lastSeen}
              </div>
            )}

            <div
              className="seller-info-stats"
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                }}
              >
                <i className="fas fa-box" />{" "}
                {productCount} products
              </span>

              {seller.rating > 0 && (
                <span
                  style={{
                    fontWeight: 600,
                  }}
                >
                  <i
                    className="fas fa-star"
                    style={{
                      color:
                        "#f59e0b",
                    }}
                  />{" "}
                  {seller.rating} / 5
                </span>
              )}
            </div>

            {/* CONTACT SELLER */}

            {user ? (
              <button
                type="button"
                onClick={
                  handleWhatsApp
                }
                style={{
                  padding:
                    "10px 24px",
                  background:
                    "#25D366",
                  color: "white",
                  border: "none",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: "pointer",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: "8px",
                }}
              >
                <i className="fab fa-whatsapp" />
                Contact Seller
              </button>
            ) : (
              <Link
                to="/login"
                state={{
                  from: `/seller/${sellerId}`,
                }}
              >
                <button
                  type="button"
                  style={{
                    padding:
                      "10px 24px",
                    background:
                      "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius:
                      "var(--radius-full)",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                >
                  Sign in to contact
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        <h2
          style={{
            fontSize: "22px",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          Products by {sellerName}
        </h2>

        {products.length === 0 ? (
          <div
            style={{
              color:
                "var(--gray-500)",
              padding: "40px 0",
              textAlign: "center",
            }}
          >
            <i
              className="fas fa-box-open"
              style={{
                fontSize: "48px",
                display: "block",
                marginBottom:
                  "12px",
              }}
            />

            This seller has not
            listed any products yet.
          </div>
        ) : (
          <>
            <div className="seller-products-grid">
              {products.map(
                (product) => (
                  <div
                    key={
                      product._id
                    }
                    className="product-card"
                  >
                    <ProductCard
                      product={
                        product
                      }
                      isFavorite={isFavorite(
                        product._id
                      )}
                      onToggleFavorite={() =>
                        toggleFavorite(
                          product._id
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>

            {pagination &&
              pagination.totalPages >
                1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    gap: "10px",
                    marginTop:
                      "30px",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding:
                        "8px 16px",
                      background:
                        "var(--primary)",
                      color:
                        "white",
                      border: "none",
                      borderRadius:
                        "var(--radius-md)",
                      cursor:
                        "pointer",
                    }}
                  >
                    Load More
                  </button>
                </div>
              )}
          </>
        )}
      </div>
    </>
  );
};

export default SellerPage;