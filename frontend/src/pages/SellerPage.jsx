// frontend/src/pages/SellerPage.jsx

import React, {
  useState,
  useEffect,
} from "react";

import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { getImageUrl } from "../services/api";

import {
  getPublicSellerProfile,
  getPublicSellerProducts,
} from "../services/sellerService";

import ProductCard from "../components/ProductCard";

// ============================================================
// TIME AGO
// ============================================================

const timeAgo = (dateString) => {
  if (!dateString) {
    return "N/A";
  }

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
    value.startsWith("data:image/")
  ) {
    return value;
  }

  return getImageUrl(value);
};

// ============================================================
// COMPONENT
// ============================================================

const SellerPage = () => {
  const { sellerId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [seller, setSeller] = useState(null);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState(null);

  const [imageError, setImageError] = useState(false);

  // ==========================================================
  // FETCH SELLER
  // ==========================================================

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) {
        setError("No seller ID provided.");
        setLoading(false);
        return;
      }

      // ------------------------------------------------------
      // Require authentication
      // ------------------------------------------------------

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // ====================================================
        // PROFILE
        // ====================================================

        const profileData =
          await getPublicSellerProfile(sellerId);

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
              "Failed to load seller profile."
          );
        }

        const sellerData =
          profileData.seller;

        setSeller({
          _id:
            sellerData._id ||
            sellerId,

          name:
            sellerData.name ||
            "Seller",

          shopName:
            sellerData.shopName ||
            sellerData.name ||
            "Seller",

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
            sellerData.avatar ||
            sellerData.profileImage ||
            sellerData.photo ||
            sellerData.photoURL ||
            null,

          profileImage:
            sellerData.profileImage ||
            "",

          photo:
            sellerData.photo ||
            "",

          photoURL:
            sellerData.photoURL ||
            "",

          createdAt:
            sellerData.createdAt ||
            "",

          sellerSince:
            sellerData.sellerSince ||
            "",

          memberSince:
            sellerData.memberSince ||
            sellerData.sellerSince ||
            sellerData.createdAt ||
            "",

          lastActive:
            sellerData.lastActive ||
            sellerData.lastSeen ||
            "",

          lastSeen:
            sellerData.lastSeen ||
            sellerData.lastActive ||
            "",

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
        });

        // ====================================================
        // PRODUCTS
        // ====================================================

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

        if (productsData?.success) {
          setProducts(
            Array.isArray(
              productsData.products
            )
              ? productsData.products
              : []
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
        console.error(
          "❌ Error fetching seller data:",
          err
        );

        // ----------------------------------------------------
        // Unauthorized
        // ----------------------------------------------------

        if (
          err?.response?.status === 401 ||
          err?.status === 401
        ) {
          navigate("/login", {
            state: {
              from: `/seller/${sellerId}`,
            },
          });

          return;
        }

        setError(
          err?.message ||
            "An error occurred while loading seller profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [
    sellerId,
    user,
    navigate,
  ]);

  // ==========================================================
  // REQUIRE LOGIN
  // ==========================================================

  if (!user) {
    return (
      <div
        className="container"
        style={{
          minHeight: "60vh",
          padding: "80px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            background: "white",
            borderRadius:
              "var(--radius-xl)",
            padding: "40px 30px",
            textAlign: "center",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <i
            className="fas fa-user-lock"
            style={{
              fontSize: "56px",
              color: "var(--primary)",
              marginBottom: "20px",
            }}
          />

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            Sign in to view this seller
          </h1>

          <p
            style={{
              color: "var(--gray-500)",
              lineHeight: 1.6,
              marginBottom: "25px",
            }}
          >
            Please sign in or create a
            BuyUKUsed account before viewing
            seller profiles and their products.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/login"
              state={{
                from: `/seller/${sellerId}`,
              }}
              style={{
                textDecoration: "none",
              }}
            >
              <button
                type="button"
                style={{
                  padding:
                    "12px 26px",
                  background:
                    "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            </Link>

            <Link
              to="/register"
              state={{
                from: `/seller/${sellerId}`,
              }}
              style={{
                textDecoration: "none",
              }}
            >
              <button
                type="button"
                style={{
                  padding:
                    "12px 26px",
                  background:
                    "var(--gray-100)",
                  color:
                    "var(--gray-800)",
                  border:
                    "1px solid var(--gray-300)",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
  // SELLER DATA
  // ==========================================================

  const sellerName =
    seller.shopName ||
    seller.name ||
    "Unknown Seller";

  const memberDate =
    seller.memberSince
      ? new Date(
          seller.memberSince
        )
      : null;

  const memberSince =
    memberDate &&
    !Number.isNaN(
      memberDate.getTime()
    )
      ? memberDate.toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : "N/A";

  const memberDuration =
    seller.memberSince
      ? timeAgo(
          seller.memberSince
        )
      : "N/A";

  const lastSeenDate =
    seller.lastActive ||
    seller.lastSeen ||
    null;

  const lastSeen =
    lastSeenDate
      ? timeAgo(lastSeenDate)
      : null;

  const productCount =
    seller.productsCount ||
    products.length ||
    0;

  const sellerImage =
    getSellerImageUrl(
      seller.avatar
    );

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
      "Hi, I'm interested in your products listed on BuyUKUsed.com. Are you available?";

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
          .seller-page {
            width: 100%;
          }

          .seller-profile-card {
            position: relative;
            overflow: hidden;
          }

          .seller-profile-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: var(--primary);
          }

          .seller-products-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 24px;
          }

          .seller-products-grid > div {
            min-width: 0;
          }

          .seller-products-grid .product-card {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
          }

          .seller-stat {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .seller-stat-icon {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: var(--gray-100);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
          }

          @media (max-width: 1100px) {
            .seller-products-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 760px) {
            .seller-products-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px;
            }

            .seller-profile-card {
              flex-direction: column !important;
              text-align: center !important;
              padding: 25px !important;
            }

            .seller-profile-info {
              width: 100% !important;
              min-width: 0 !important;
            }

            .seller-profile-details {
              justify-content: center !important;
            }

            .seller-profile-contact {
              justify-content: center !important;
            }
          }

          @media (max-width: 430px) {
            .seller-products-grid {
              gap: 10px;
            }

            .seller-products-grid .product-card {
              border-radius: 12px !important;
            }
          }
        `}
      </style>

      <div
        className="container seller-page"
        style={{
          padding: "30px 20px 60px",
        }}
      >
        {/* ====================================================
            SELLER PROFILE CARD
        ==================================================== */}

        <div
          className="seller-profile-card"
          style={{
            background: "white",
            borderRadius:
              "var(--radius-xl)",
            padding: "30px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.08)",
            marginBottom: "40px",
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            alignItems: "center",
          }}
        >
          {/* ==================================================
              AVATAR
          ================================================== */}

          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              background:
                "var(--gray-200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border:
                "4px solid var(--gray-100)",
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            {sellerImage &&
            !imageError ? (
              <img
                src={sellerImage}
                alt={sellerName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(event) => {
                  console.error(
                    "❌ Seller profile image failed:",
                    sellerImage
                  );

                  setImageError(
                    true
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
                  color:
                    "var(--gray-400)",
                }}
              />
            )}
          </div>

          {/* ==================================================
              SELLER INFORMATION
          ================================================== */}

          <div
            className="seller-profile-info"
            style={{
              flex: 1,
              minWidth: "250px",
            }}
          >
            {/* Seller Name */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "8px",
              }}
            >
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                {sellerName}
              </h1>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background:
                    "#e8f5e9",
                  color: "#15803d",
                  padding:
                    "4px 9px",
                  borderRadius:
                    "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <i className="fas fa-check-circle" />
                Seller
              </span>
            </div>

            {/* Location */}

            {seller.location && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "8px",
                }}
              >
                <i
                  className="fas fa-map-marker-alt"
                  style={{
                    marginRight: "7px",
                  }}
                />
                {seller.location}
              </div>
            )}

            {/* Phone */}

            {seller.phone && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "8px",
                }}
              >
                <i
                  className="fas fa-phone"
                  style={{
                    marginRight: "7px",
                  }}
                />
                {seller.phone}
              </div>
            )}

            {/* Role */}

            {seller.role && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "8px",
                }}
              >
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

            {/* Member Since */}

            <div
              style={{
                color:
                  "var(--gray-500)",
                marginBottom: "8px",
              }}
            >
              <i
                className="fas fa-calendar-alt"
                style={{
                  marginRight: "7px",
                }}
              />

              Member since{" "}
              {memberSince}

              {memberDuration &&
                memberDuration !==
                  "N/A" && (
                  <>
                    {" "}
                    ({memberDuration})
                  </>
                )}
            </div>

            {/* Last Seen */}

            {lastSeen && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom: "12px",
                }}
              >
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

            {/* ==================================================
                STATS
            ================================================== */}

            <div
              className="seller-profile-details"
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div className="seller-stat">
                <span className="seller-stat-icon">
                  <i className="fas fa-box" />
                </span>

                <span
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {productCount}{" "}
                  {productCount === 1
                    ? "product"
                    : "products"}
                </span>
              </div>

              {seller.rating > 0 && (
                <div className="seller-stat">
                  <span className="seller-stat-icon">
                    <i
                      className="fas fa-star"
                      style={{
                        color: "#f59e0b",
                      }}
                    />
                  </span>

                  <span
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {seller.rating} / 5
                  </span>
                </div>
              )}
            </div>

            {/* ==================================================
                CONTACT
            ================================================== */}

            <div
              className="seller-profile-contact"
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={!seller.phone}
                style={{
                  padding:
                    "10px 24px",
                  background:
                    seller.phone
                      ? "#25D366"
                      : "var(--gray-300)",
                  color: "white",
                  border: "none",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor:
                    seller.phone
                      ? "pointer"
                      : "not-allowed",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  transition:
                    "transform 0.2s ease",
                }}
                onMouseEnter={(event) => {
                  if (seller.phone) {
                    event.currentTarget.style.transform =
                      "translateY(-1px)";
                  }
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform =
                    "translateY(0)";
                }}
              >
                <i className="fab fa-whatsapp" />

                {seller.phone
                  ? "Contact Seller"
                  : "No Phone Number"}
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================
            PRODUCTS HEADER
        ==================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                margin: 0,
              }}
            >
              Products by {sellerName}
            </h2>

            <p
              style={{
                marginTop: "5px",
                marginBottom: 0,
                color:
                  "var(--gray-500)",
                fontSize: "14px",
              }}
            >
              Browse the latest products
              listed by this seller.
            </p>
          </div>

          <span
            style={{
              background:
                "var(--gray-100)",
              color:
                "var(--gray-700)",
              padding:
                "7px 12px",
              borderRadius:
                "999px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {productCount}{" "}
            {productCount === 1
              ? "Product"
              : "Products"}
          </span>
        </div>

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        {productCount === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius:
                "var(--radius-xl)",
              padding: "50px 20px",
              textAlign: "center",
              color:
                "var(--gray-500)",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.05)",
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

            This seller has not listed
            any products yet.
          </div>
        ) : (
          <>
            <div
              className="seller-products-grid"
            >
              {products.map(
                (product) => {
                  if (!product) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        product._id ||
                        product.id
                      }
                      className="product-card-wrapper"
                    >
                      <ProductCard
                        product={product}
                        appleStyle
                        videoPreview
                      />
                    </div>
                  );
                }
              )}
            </div>

            {/* ==================================================
                PAGINATION
            ================================================== */}

            {pagination &&
              pagination.totalPages >
                1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    marginTop: "35px",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding:
                        "10px 22px",
                      background:
                        "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius:
                        "var(--radius-full)",
                      cursor:
                        "pointer",
                      fontWeight: 700,
                    }}
                    onClick={() => {
                      console.log(
                        "Load more seller products coming next."
                      );
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