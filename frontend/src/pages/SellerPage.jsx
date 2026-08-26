// ============================================================
// frontend/src/pages/SellerPage.jsx
// BuyUKUsed - Public Seller Page
// ============================================================

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
import { useCart } from "../context/CartContext";

import {
  getImageUrl,
} from "../services/api";

import {
  getPublicSellerProfile,
  getPublicSellerProducts,
} from "../services/sellerService";

import ProductCard from "../components/ProductCard";
import VerifiedBadge from "../components/VerifiedBadge";

// ============================================================
// TIME AGO
// ============================================================

const timeAgo = (
  dateString
) => {
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

  const now =
    new Date();

  const diffMs =
    Math.max(
      0,
      now.getTime() -
        past.getTime()
    );

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
// IMAGE URL HELPER
// ============================================================

const getSellerImageUrl =
  (image) => {
    if (!image) {
      return null;
    }

    const value =
      String(image).trim();

    if (!value) {
      return null;
    }

    if (
      value.startsWith(
        "http://"
      ) ||
      value.startsWith(
        "https://"
      ) ||
      value.startsWith(
        "data:image/"
      ) ||
      value.startsWith(
        "blob:"
      )
    ) {
      return value;
    }

    return getImageUrl(
      value
    );
  };

// ============================================================
// COMPONENT
// ============================================================

const SellerPage = () => {
  const {
    sellerId,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

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

  const [
    imageError,
    setImageError,
  ] = useState(false);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  // ==========================================================
  // FETCH SELLER
  // ==========================================================

  useEffect(() => {
    const fetchSellerData =
      async () => {
        if (!sellerId) {
          setError(
            "No seller ID provided."
          );

          setLoading(false);

          return;
        }

        // ------------------------------------------------------
        // Your existing application requires login to view
        // seller pages.
        // ------------------------------------------------------

        if (!user) {
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
                "Failed to load seller profile."
            );
          }

          const sellerData =
            profileData.seller;

          console.log(
            "✅ Seller verification:",
            {
              isVerified:
                sellerData.isVerified,

              verificationStatus:
                sellerData.verificationStatus,
            }
          );

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
                sellerData.rating ||
                  0
              ),

            productsCount:
              Number(
                sellerData.productsCount ||
                  0
              ),

            isVerified:
              sellerData.isVerified ===
              true,

            verificationStatus:
              sellerData.verificationStatus ||
              "not_submitted",
          });

          // ----------------------------------------------------
          // SELLER PRODUCTS
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
          console.error(
            "❌ Error fetching seller data:",
            err
          );

          if (
            err?.status === 401 ||
            err?.response?.status === 401
          ) {
            navigate(
              "/login",
              {
                state: {
                  from: `/seller/${sellerId}`,
                },
              }
            );

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
  // LOAD MORE PRODUCTS
  // ==========================================================

  const handleLoadMore =
    async () => {
      if (
        !pagination ||
        loadingMore
      ) {
        return;
      }

      if (
        pagination.page >=
        pagination.totalPages
      ) {
        return;
      }

      try {
        setLoadingMore(
          true
        );

        const nextPage =
          pagination.page + 1;

        const productsData =
          await getPublicSellerProducts(
            sellerId,
            {
              page: nextPage,
              limit:
                pagination.limit ||
                20,

              sort: "-createdAt",
            }
          );

        if (
          productsData?.success
        ) {
          setProducts(
            (previous) => [
              ...previous,
              ...(productsData.products ||
                []),
            ]
          );

          if (
            productsData.pagination
          ) {
            setPagination(
              productsData.pagination
            );
          }
        }
      } catch (err) {
        console.error(
          "❌ Failed to load more seller products:",
          err
        );
      } finally {
        setLoadingMore(
          false
        );
      }
    };

  // ==========================================================
  // REQUIRE LOGIN
  // ==========================================================

  if (!user) {
    return (
      <div
        className="container"
        style={{
          minHeight: "60vh",
          padding:
            "80px 20px",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            background:
              "white",
            borderRadius:
              "var(--radius-xl)",
            padding:
              "40px 30px",
            textAlign:
              "center",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <i
            className="fas fa-user-lock"
            style={{
              fontSize:
                "56px",
              color:
                "var(--primary)",
              marginBottom:
                "20px",
            }}
          />

          <h1
            style={{
              fontSize:
                "28px",
              fontWeight: 800,
              marginBottom:
                "12px",
            }}
          >
            Sign in to view this seller
          </h1>

          <p
            style={{
              color:
                "var(--gray-500)",
              lineHeight: 1.6,
              marginBottom:
                "25px",
            }}
          >
            Please sign in or create a BuyUKUsed account before
            viewing seller profiles and their products.
          </p>

          <div
            style={{
              display:
                "flex",
              gap: "12px",
              justifyContent:
                "center",
              flexWrap:
                "wrap",
            }}
          >
            <Link
              to="/login"
              state={{
                from: `/seller/${sellerId}`,
              }}
              style={{
                textDecoration:
                  "none",
              }}
            >
              <button
                style={{
                  padding:
                    "12px 26px",
                  background:
                    "var(--primary)",
                  color:
                    "white",
                  border:
                    "none",
                  borderRadius:
                    "var(--radius-full)",
                  fontWeight: 700,
                  cursor:
                    "pointer",
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
                textDecoration:
                  "none",
              }}
            >
              <button
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
                  cursor:
                    "pointer",
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

  // ==========================================================
  // SELLER NOT FOUND
  // ==========================================================

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
            year:
              "numeric",

            month:
              "long",

            day:
              "numeric",
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
      ? timeAgo(
          lastSeenDate
        )
      : null;

  const productCount =
    seller.productsCount ||
    products.length ||
    0;

  const sellerImage =
    getSellerImageUrl(
      seller.avatar
    );

  const isVerified =
    seller.isVerified ===
    true;

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

      // Ghana local number.
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
          @media (max-width: 600px) {
            .seller-profile-card {
              flex-direction: column !important;
              text-align: center !important;
            }

            .seller-profile-info {
              width: 100% !important;
            }

            .seller-profile-details {
              justify-content: center !important;
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
        {/* ====================================================
            SELLER PROFILE CARD
        ==================================================== */}

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
          {/* ==================================================
              AVATAR
          ================================================== */}

          <div
            style={{
              position:
                "relative",
              width:
                "120px",
              height:
                "120px",
              flexShrink:
                0,
            }}
          >
            <div
              style={{
                width:
                  "100%",
                height:
                  "100%",
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
                border:
                  "3px solid var(--gray-100)",
              }}
            >
              {sellerImage &&
              !imageError ? (
                <img
                  src={
                    sellerImage
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
                    fontSize:
                      "64px",
                    color:
                      "var(--gray-400)",
                  }}
                />
              )}
            </div>

            {/* ==================================================
                VERIFIED AVATAR BADGE
            ================================================== */}

            {isVerified && (
              <div
                style={{
                  position:
                    "absolute",
                  bottom:
                    0,
                  right:
                    0,
                  width:
                    "36px",
                  height:
                    "36px",
                  background:
                    "#1DA1F2",
                  borderRadius:
                    "50%",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  border:
                    "3px solid white",
                  boxShadow:
                    "0 2px 6px rgba(0,0,0,0.25)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 10.5L9.5 12.5L14 8"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* ==================================================
              SELLER INFORMATION
          ================================================== */}

          <div
            className="seller-profile-info"
            style={{
              flex: 1,
              minWidth:
                "250px",
            }}
          >
            {/* Name + Badge */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                flexWrap:
                  "wrap",
                gap:
                  "10px",
                marginBottom:
                  "4px",
              }}
            >
              <h1
                style={{
                  fontSize:
                    "28px",
                  fontWeight:
                    800,
                  margin: 0,
                }}
              >
                {sellerName}
              </h1>

              {isVerified && (
                <VerifiedBadge
                  size={28}
                  showLabel
                />
              )}
            </div>

            {/* Shop Description */}

            {seller.shopDescription && (
              <p
                style={{
                  color:
                    "var(--gray-600)",
                  margin:
                    "8px 0 12px",
                  lineHeight:
                    1.6,
                }}
              >
                {
                  seller.shopDescription
                }
              </p>
            )}

            {/* Location */}

            {seller.location && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom:
                    "8px",
                }}
              >
                <i
                  className="fas fa-map-marker-alt"
                  style={{
                    marginRight:
                      "7px",
                  }}
                />

                {
                  seller.location
                }
              </div>
            )}

            {/* Phone */}

            {seller.phone && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom:
                    "8px",
                }}
              >
                <i
                  className="fas fa-phone"
                  style={{
                    marginRight:
                      "7px",
                  }}
                />

                {
                  seller.phone
                }
              </div>
            )}

            {/* Role */}

            {seller.role && (
              <div
                style={{
                  color:
                    "var(--gray-500)",
                  marginBottom:
                    "8px",
                }}
              >
                <i
                  className="fas fa-user-tag"
                  style={{
                    marginRight:
                      "7px",
                  }}
                />

                {seller.role
                  .charAt(
                    0
                  )
                  .toUpperCase() +
                  seller.role.slice(
                    1
                  )}
              </div>
            )}

            {/* Member Since */}

            <div
              style={{
                color:
                  "var(--gray-500)",
                marginBottom:
                  "8px",
              }}
            >
              <i
                className="fas fa-calendar-alt"
                style={{
                  marginRight:
                    "7px",
                }}
              />

              Member since{" "}
              {memberSince}

              {memberDuration &&
                memberDuration !==
                  "N/A" && (
                  <>
                    {" "}
                    (
                    {
                      memberDuration
                    }
                    )
                  </>
                )}
            </div>

            {/* Last Seen */}

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
                      "7px",
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
                display:
                  "flex",
                gap:
                  "20px",
                flexWrap:
                  "wrap",
                marginBottom:
                  "15px",
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
                        "6px",
                    }}
                  />

                  {
                    seller.rating
                  }{" "}
                  / 5
                </span>
              )}
            </div>

            {/* ==================================================
                CONTACT
            ================================================== */}

            <button
              onClick={
                handleWhatsApp
              }
              disabled={
                !seller.phone
              }
              style={{
                padding:
                  "10px 24px",
                background:
                  seller.phone
                    ? "#25D366"
                    : "var(--gray-300)",
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
                  seller.phone
                    ? "pointer"
                    : "not-allowed",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap:
                  "8px",
              }}
            >
              <i className="fab fa-whatsapp" />

              {seller.phone
                ? "Contact Seller"
                : "No Phone Number"}
            </button>
          </div>
        </div>

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

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

            This seller has not
            listed any products
            yet.
          </div>
        ) : (
          <>
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
                (
                  product
                ) => (
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

            {/* ==================================================
                LOAD MORE
            ================================================== */}

            {pagination &&
              pagination.totalPages >
                pagination.page && (
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "center",
                    marginTop:
                      "30px",
                  }}
                >
                  <button
                    onClick={
                      handleLoadMore
                    }
                    disabled={
                      loadingMore
                    }
                    style={{
                      padding:
                        "10px 24px",
                      background:
                        loadingMore
                          ? "var(--gray-300)"
                          : "var(--primary)",
                      color:
                        "white",
                      border:
                        "none",
                      borderRadius:
                        "var(--radius-md)",
                      cursor:
                        loadingMore
                          ? "not-allowed"
                          : "pointer",
                      fontWeight:
                        700,
                    }}
                  >
                    {loadingMore
                      ? "Loading..."
                      : "Load More"}
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