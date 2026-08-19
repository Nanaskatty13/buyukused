// frontend/src/pages/SellerPage.jsx

import React, {
  useState,
  useEffect,
} from "react";

import {
  useParams,
  Link,
} from "react-router-dom";

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

const getSellerImageUrl = (image) => {
  if (!image) {
    return null;
  }

  const value = String(image).trim();

  if (!value) {
    return null;
  }

  // Cloudinary / external URL
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//")
  ) {
    return value;
  }

  // Local uploads
  if (value.startsWith("/")) {
    return value;
  }

  return `/uploads/${value}`;
};

// ============================================================
// RELATIVE TIME
// ============================================================

const timeAgo = (dateString) => {
  if (!dateString) {
    return "N/A";
  }

  const past =
    new Date(dateString);

  if (
    Number.isNaN(
      past.getTime()
    )
  ) {
    return "N/A";
  }

  const now = new Date();

  const diffMs =
    now.getTime() -
    past.getTime();

  if (diffMs < 0) {
    return "Just now";
  }

  const diffSec =
    Math.floor(
      diffMs / 1000
    );

  const diffMin =
    Math.floor(
      diffSec / 60
    );

  const diffHr =
    Math.floor(
      diffMin / 60
    );

  const diffDays =
    Math.floor(
      diffHr / 24
    );

  const diffMonths =
    Math.floor(
      diffDays / 30
    );

  const diffYears =
    Math.floor(
      diffDays / 365
    );

  if (diffYears > 0) {
    return `${diffYears} year${
      diffYears > 1
        ? "s"
        : ""
    } ago`;
  }

  if (diffMonths > 0) {
    return `${diffMonths} month${
      diffMonths > 1
        ? "s"
        : ""
    } ago`;
  }

  if (diffDays > 0) {
    return `${diffDays} day${
      diffDays > 1
        ? "s"
        : ""
    } ago`;
  }

  if (diffHr > 0) {
    return `${diffHr} hour${
      diffHr > 1
        ? "s"
        : ""
    } ago`;
  }

  if (diffMin > 0) {
    return `${diffMin} minute${
      diffMin > 1
        ? "s"
        : ""
    } ago`;
  }

  return "Just now";
};

// ============================================================
// DATE FORMAT
// ============================================================

const formatMemberDate = (
  dateString
) => {
  if (!dateString) {
    return "N/A";
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "N/A";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
};

// ============================================================
// SELLER PAGE
// ============================================================

const SellerPage = () => {
  const {
    sellerId,
  } = useParams();

  const { user } =
    useAuth();

  const {
    toggleFavorite,
    isFavorite,
  } = useCart();

  const [
    seller,
    setSeller,
  ] = useState(null);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    pagination,
    setPagination,
  ] = useState(null);

  // ==========================================================
  // FETCH SELLER
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchSellerData =
      async () => {
        if (!sellerId) {
          setError(
            "No seller ID provided."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          // ----------------------------------------------------
          // SELLER PROFILE
          // ----------------------------------------------------

          const profileData =
            await getPublicSellerProfile(
              sellerId
            );

          console.log(
            "👤 Seller profile:",
            profileData
          );

          if (
            !profileData?.success ||
            !profileData?.seller
          ) {
            throw new Error(
              profileData?.message ||
                "Seller not found."
            );
          }

          const sellerData =
            profileData.seller;

          // ----------------------------------------------------
          // PROFILE IMAGE
          // ----------------------------------------------------

          const avatar =
            sellerData.avatar ||
            sellerData.profileImage ||
            sellerData.photo ||
            null;

          // ----------------------------------------------------
          // SELLER DATE
          //
          // Prefer sellerSince, then memberSince,
          // then createdAt.
          // ----------------------------------------------------

          const memberSince =
            sellerData.sellerSince ||
            sellerData.memberSince ||
            sellerData.createdAt ||
            null;

          if (!cancelled) {
            setSeller({
              _id:
                sellerData._id ||
                sellerId,

              name:
                sellerData.name ||
                sellerData.shopName ||
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

              avatar,

              createdAt:
                sellerData.createdAt ||
                null,

              sellerSince:
                sellerData.sellerSince ||
                null,

              memberSince,

              lastActive:
                sellerData.lastActive ||
                sellerData.lastSeen ||
                null,

              role:
                sellerData.role ||
                "seller",

              rating:
                Number(
                  sellerData.rating ||
                    0
                ),

              productsCount:
                Number(
                  sellerData.productsCount ||
                    0
                ),
            });
          }

          // ----------------------------------------------------
          // PRODUCTS
          // ----------------------------------------------------

          const productsData =
            await getPublicSellerProducts(
              sellerId,
              {
                page: 1,
                limit: 20,
                sort: "-createdAt",
              }
            );

          console.log(
            "📦 Seller products:",
            productsData
          );

          if (!cancelled) {
            if (
              productsData?.success
            ) {
              setProducts(
                productsData.products ||
                  []
              );

              setPagination(
                productsData.pagination ||
                  null
              );
            } else {
              setProducts([]);
            }
          }
        } catch (err) {
          console.error(
            "❌ Error fetching seller data:",
            err
          );

          if (!cancelled) {
            setError(
              err.message ||
                "An error occurred while loading seller."
            );
          }
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
          padding:
            "60px 20px",
          textAlign:
            "center",
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
          padding:
            "60px 20px",
          textAlign:
            "center",
          color:
            "#e74c3c",
        }}
      >
        {error}
      </div>
    );
  }

  if (!seller) {
    return (
      <div
        className="container"
        style={{
          padding:
            "60px 20px",
          textAlign:
            "center",
        }}
      >
        Seller not found.
      </div>
    );
  }

  // ==========================================================
  // SELLER DATA
  // ==========================================================

  const sellerName =
    seller.shopName ||
    seller.name ||
    "Unknown Seller";

  const memberSinceDate =
    seller.memberSince ||
    seller.sellerSince ||
    seller.createdAt;

  const memberSince =
    formatMemberDate(
      memberSinceDate
    );

  const memberDuration =
    timeAgo(
      memberSinceDate
    );

  const lastSeen =
    seller.lastActive
      ? timeAgo(
          seller.lastActive
        )
      : null;

  const productCount =
    products.length ||
    seller.productsCount ||
    0;

  const sellerAvatar =
    getSellerImageUrl(
      seller.avatar
    );

  // ==========================================================
  // WHATSAPP
  // ==========================================================

  const handleWhatsApp =
    () => {
      const rawPhone =
        seller.phone || "";

      let phone =
        String(
          rawPhone
        ).replace(
          /\D/g,
          ""
        );

      if (
        phone.startsWith("0") &&
        phone.length === 10
      ) {
        phone =
          "233" +
          phone.substring(
            1
          );
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
      <style>
        {`
          @media (max-width: 600px) {
            .seller-profile-card {
              padding: 20px !important;
              gap: 20px !important;
            }

            .seller-avatar {
              width: 90px !important;
              height: 90px !important;
            }

            .seller-name {
              font-size: 23px !important;
            }

            .seller-products-grid {
              grid-template-columns: repeat(2, 1fr) !important;
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
          padding:
            "30px 20px",
        }}
      >
        {/* =====================================================
            SELLER PROFILE CARD
        ====================================================== */}

        <div
          className="seller-profile-card"
          style={{
            background:
              "white",
            borderRadius:
              "var(--radius-xl)",
            padding:
              "30px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.08)",
            marginBottom:
              "40px",
            display:
              "flex",
            flexWrap:
              "wrap",
            gap:
              "30px",
            alignItems:
              "center",
          }}
        >
          {/* =================================================
              AVATAR
          ================================================== */}

          <div
            className="seller-avatar"
            style={{
              width:
                "120px",
              height:
                "120px",
              borderRadius:
                "50%",
              overflow:
                "hidden",
              background:
                "var(--gray-200)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              flexShrink:
                0,
              border:
                "3px solid white",
              boxShadow:
                "0 2px 12px rgba(0,0,0,0.12)",
            }}
          >
            {sellerAvatar ? (
              <img
                src={
                  sellerAvatar
                }
                alt={
                  sellerName
                }
                style={{
                  width:
                    "100%",
                  height:
                    "100%",
                  objectFit:
                    "cover",
                  display:
                    "block",
                }}
                onError={(
                  event
                ) => {
                  console.error(
                    "❌ Seller image failed:",
                    sellerAvatar
                  );

                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <i
                className="fas fa-user-circle"
                style={{
                  fontSize:
                    "64px",
                  color:
                    "var(--gray-400)",
                }}
              />
            )}
          </div>

          {/* =================================================
              SELLER INFORMATION
          ================================================== */}

          <div
            style={{
              flex: 1,
              minWidth:
                "250px",
            }}
          >
            <h1
              className="seller-name"
              style={{
                fontSize:
                  "28px",
                fontWeight:
                  800,
                marginBottom:
                  "6px",
              }}
            >
              {sellerName}
            </h1>

            {seller.location && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom:
                    "5px",
                }}
              >
                <i
                  className="fas fa-map-marker-alt"
                  style={{
                    marginRight:
                      "6px",
                  }}
                />
                {seller.location}
              </div>
            )}

            {seller.role && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom:
                    "5px",
                }}
              >
                <i
                  className="fas fa-user-tag"
                  style={{
                    marginRight:
                      "6px",
                  }}
                />

                {seller.role
                  .charAt(0)
                  .toUpperCase() +
                  seller.role.slice(
                    1
                  )}
              </div>
            )}

            {/* =================================================
                MEMBER SINCE
            ================================================== */}

            <div
              style={{
                color:
                  "var(--gray-500)",
                marginBottom:
                  "5px",
              }}
            >
              <i
                className="fas fa-calendar-alt"
                style={{
                  marginRight:
                    "6px",
                }}
              />

              Member since{" "}
              <strong>
                {memberSince}
              </strong>

              {memberDuration !==
                "N/A" && (
                <span>
                  {" "}
                  ({memberDuration})
                </span>
              )}
            </div>

            {/* =================================================
                LAST SEEN
            ================================================== */}

            {lastSeen && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom:
                    "12px",
                }}
              >
                <i
                  className="fas fa-clock"
                  style={{
                    marginRight:
                      "6px",
                  }}
                />

                Last seen:{" "}
                {lastSeen}
              </div>
            )}

            {/* =================================================
                STATS
            ================================================== */}

            <div
              style={{
                display:
                  "flex",
                gap:
                  "20px",
                flexWrap:
                  "wrap",
                marginBottom:
                  "16px",
              }}
            >
              <span
                style={{
                  fontWeight:
                    600,
                }}
              >
                <i
                  className="fas fa-box"
                  style={{
                    marginRight:
                      "6px",
                  }}
                />

                {productCount}{" "}
                products
              </span>

              {seller.rating >
                0 && (
                <span
                  style={{
                    fontWeight:
                      600,
                  }}
                >
                  <i
                    className="fas fa-star"
                    style={{
                      color:
                        "#f59e0b",
                      marginRight:
                        "5px",
                    }}
                  />

                  {seller.rating}{" "}
                  / 5
                </span>
              )}
            </div>

            {/* =================================================
                CONTACT
            ================================================== */}

            {user ? (
              <button
                onClick={
                  handleWhatsApp
                }
                style={{
                  padding:
                    "10px 24px",
                  background:
                    "#25D366",
                  color:
                    "white",
                  border:
                    "none",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight:
                    700,
                  fontSize:
                    "15px",
                  cursor:
                    "pointer",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap:
                    "8px",
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
                  style={{
                    padding:
                      "10px 24px",
                    background:
                      "var(--primary)",
                    color:
                      "white",
                    border:
                      "none",
                    borderRadius:
                      "var(--radius-full)",
                    fontWeight:
                      700,
                    fontSize:
                      "15px",
                    cursor:
                      "pointer",
                  }}
                >
                  Sign in to contact
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* =====================================================
            PRODUCTS
        ====================================================== */}

        <h2
          style={{
            fontSize:
              "22px",
            fontWeight:
              800,
            marginBottom:
              "20px",
          }}
        >
          Products by{" "}
          {sellerName}
        </h2>

        {productCount ===
        0 ? (
          <div
            style={{
              color:
                "var(--gray-500)",
              padding:
                "40px 0",
              textAlign:
                "center",
            }}
          >
            <i
              className="fas fa-box-open"
              style={{
                fontSize:
                  "48px",
                display:
                  "block",
                marginBottom:
                  "12px",
              }}
            />

            This seller has
            not listed any
            products yet.
          </div>
        ) : (
          <div
            className="seller-products-grid"
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(250px, 1fr))",
              gap:
                "24px",
            }}
          >
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
        )}
      </div>
    </>
  );
};

export default SellerPage;