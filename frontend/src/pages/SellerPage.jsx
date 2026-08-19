// frontend/src/pages/SellerPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../services/api";

import {
  getPublicSellerProfile,
  getPublicSellerProducts,
} from "../services/sellerService";

import ProductCard from "../components/ProductCard";

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
  const diffMs = now - past;

  if (diffMs < 0) {
    return "Just now";
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  }

  if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  }

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  if (diffHr > 0) {
    return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  }

  if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  }

  return "Just now";
};

// ============================================================
// DATE FORMATTER
// ============================================================

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ============================================================
// PROFILE IMAGE RESOLVER
// ============================================================

const getSellerImage = (seller) => {
  if (!seller) return null;

  const possibleImages = [
    seller.avatar,
    seller.photoURL,
    seller.profileImage,
    seller.photo,
  ];

  const image = possibleImages.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  if (!image) {
    return null;
  }

  try {
    return getImageUrl(image.trim());
  } catch (error) {
    console.error(
      "❌ Failed to build seller image URL:",
      error
    );

    return image.trim();
  }
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

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

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
          "👤 Seller profile response:",
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
        // Use every possible profile-image field.
        // ------------------------------------------------------

        const resolvedAvatar =
          getSellerImage(sellerData);

        console.log(
          "🖼️ Seller image fields:",
          {
            avatar:
              sellerData.avatar,
            photoURL:
              sellerData.photoURL,
            profileImage:
              sellerData.profileImage,
            photo:
              sellerData.photo,
            resolvedAvatar,
          }
        );

        // ------------------------------------------------------
        // SELLER DATE
        //
        // sellerSince = actual seller registration date
        // createdAt   = account creation fallback
        // memberSince = backend-calculated fallback
        // ------------------------------------------------------

        const sellerDate =
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
            sellerData.shopName ||
            "Seller",

          shopName:
            sellerData.shopName ||
            sellerData.name ||
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

          avatar:
            resolvedAvatar,

          profileImage:
            sellerData.profileImage ||
            null,

          photo:
            sellerData.photo ||
            null,

          photoURL:
            sellerData.photoURL ||
            null,

          createdAt:
            sellerData.createdAt ||
            null,

          sellerSince:
            sellerData.sellerSince ||
            null,

          memberSince:
            sellerDate,

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
          "📦 Seller products response:",
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
        <div
          style={{
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Loading seller profile...
        </div>
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
        <i
          className="fas fa-exclamation-circle"
          style={{
            fontSize: "45px",
            marginBottom: "15px",
          }}
        />

        <div
          style={{
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  // ==========================================================
  // SELLER NOT FOUND
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

  const memberSince =
    formatDate(
      seller.memberSince
    );

  const memberDuration =
    timeAgo(
      seller.memberSince
    );

  const lastSeenDate =
    seller.lastActive ||
    seller.lastSeen ||
    null;

  const lastSeen =
    lastSeenDate
      ? timeAgo(lastSeenDate)
      : null;

  const productCount =
    pagination?.total ??
    seller.productsCount ??
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

    // Ghana local number:
    // 0241234567 -> 233241234567
    if (
      phone.startsWith("0") &&
      phone.length === 10
    ) {
      phone =
        "233" +
        phone.substring(1);
    }

    // Ghana number already supplied:
    // 233241234567
    if (
      phone.startsWith("233") &&
      phone.length === 12
    ) {
      // valid
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
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ======================================================
          RESPONSIVE STYLES
      ====================================================== */}

      <style>
        {`
          .seller-profile-card {
            background: #ffffff;
            border-radius: var(--radius-xl);
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            margin-bottom: 40px;
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            align-items: center;
          }

          .seller-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            background: var(--gray-200);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .seller-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .seller-info {
            flex: 1;
            min-width: 240px;
          }

          .seller-name {
            font-size: 28px;
            font-weight: 800;
            margin: 0 0 6px;
          }

          .seller-meta {
            color: var(--gray-500);
            margin-bottom: 6px;
          }

          .seller-stats {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin: 14px 0;
          }

          .seller-contact-btn {
            padding: 10px 24px;
            background: #25D366;
            color: white;
            border: none;
            border-radius: var(--radius-full);
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .seller-contact-btn:hover {
            opacity: 0.9;
          }

          .seller-login-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 24px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: var(--radius-full);
            font-weight: 700;
            font-size: 15px;
            text-decoration: none;
          }

          .seller-products-grid {
            display: grid;
            grid-template-columns: repeat(
              auto-fill,
              minmax(250px, 1fr)
            );
            gap: 24px;
          }

          .seller-product-card {
            min-width: 0;
          }

          @media (max-width: 600px) {
            .seller-profile-card {
              padding: 22px;
              gap: 20px;
              flex-direction: column;
              text-align: center;
            }

            .seller-avatar {
              width: 105px;
              height: 105px;
            }

            .seller-info {
              width: 100%;
              min-width: 0;
            }

            .seller-name {
              font-size: 24px;
            }

            .seller-stats {
              justify-content: center;
            }

            .seller-contact-btn,
            .seller-login-btn {
              width: 100%;
            }

            .seller-products-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
              gap: 12px;
            }
          }
        `}
      </style>

      {/* ======================================================
          MAIN CONTAINER
      ====================================================== */}

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

          {/* ==================================================
              PROFILE IMAGE
          ================================================== */}

          <div className="seller-avatar">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={sellerName}
                loading="eager"
                onError={(event) => {
                  console.error(
                    "❌ Seller profile image failed:",
                    seller.avatar
                  );

                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <i
                className="fas fa-user-circle"
                style={{
                  fontSize: "64px",
                  color: "var(--gray-400)",
                }}
              />
            )}

            {/* Fallback icon remains behind the image */}
            <i
              className="fas fa-user-circle"
              style={{
                fontSize: "64px",
                color: "var(--gray-400)",
                position: "absolute",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* ==================================================
              SELLER INFORMATION
          ================================================== */}

          <div className="seller-info">

            {/* Seller name */}
            <h1 className="seller-name">
              {sellerName}
            </h1>

            {/* Location */}
            {seller.location && (
              <div className="seller-meta">
                <i
                  className="fas fa-map-marker-alt"
                  style={{
                    marginRight: "7px",
                  }}
                />

                {seller.location}
              </div>
            )}

            {/* Role */}
            {seller.role && (
              <div className="seller-meta">
                <i
                  className="fas fa-user-tag"
                  style={{
                    marginRight: "7px",
                  }}
                />

                {seller.role
                  .charAt(0)
                  .toUpperCase() +
                  seller.role.slice(1)}
              </div>
            )}

            {/* =================================================
                MEMBER SINCE
            ================================================= */}

            <div className="seller-meta">
              <i
                className="fas fa-calendar-alt"
                style={{
                  marginRight: "7px",
                }}
              />

              Member since{" "}
              <strong>
                {memberSince}
              </strong>

              {memberDuration &&
                memberDuration !== "N/A" && (
                  <>
                    {" "}
                    ({memberDuration})
                  </>
                )}
            </div>

            {/* =================================================
                LAST ACTIVE
            ================================================= */}

            {lastSeen && (
              <div className="seller-meta">
                <i
                  className="fas fa-clock"
                  style={{
                    marginRight: "7px",
                  }}
                />

                Last seen:{" "}
                {lastSeen}
              </div>
            )}

            {/* =================================================
                STATS
            ================================================= */}

            <div className="seller-stats">

              <span
                style={{
                  fontWeight: 600,
                }}
              >
                <i
                  className="fas fa-box"
                  style={{
                    marginRight: "6px",
                  }}
                />

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
                      color: "#f59e0b",
                      marginRight: "6px",
                    }}
                  />

                  {seller.rating.toFixed
                    ? seller.rating.toFixed(1)
                    : seller.rating}{" "}
                  / 5
                </span>
              )}
            </div>

            {/* =================================================
                CONTACT SELLER
            ================================================= */}

            {user ? (
              <button
                type="button"
                onClick={
                  handleWhatsApp
                }
                className="seller-contact-btn"
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
                className="seller-login-btn"
              >
                Sign in to contact
              </Link>
            )}
          </div>
        </div>

        {/* ====================================================
            PRODUCTS TITLE
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

        {/* ====================================================
            NO PRODUCTS
        ==================================================== */}

        {productCount === 0 ? (
          <div
            style={{
              color: "var(--gray-500)",
              padding: "40px 0",
              textAlign: "center",
            }}
          >
            <i
              className="fas fa-box-open"
              style={{
                fontSize: "48px",
                display: "block",
                marginBottom: "12px",
              }}
            />

            This seller has not listed any
            products yet.
          </div>
        ) : (
          <>
            {/* ================================================
                PRODUCTS GRID
            ================================================ */}

            <div className="seller-products-grid">
              {products.map(
                (product) => (
                  <div
                    key={product._id}
                    className="seller-product-card"
                  >
                    <ProductCard
                      product={product}
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

            {/* ================================================
                PAGINATION
            ================================================ */}

            {pagination &&
              pagination.totalPages >
                1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    gap: "10px",
                    marginTop: "30px",
                  }}
                >
                  <button
                    type="button"
                    disabled
                    style={{
                      padding:
                        "8px 16px",
                      background:
                        "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius:
                        "var(--radius-md)",
                      cursor:
                        "not-allowed",
                      opacity: 0.7,
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