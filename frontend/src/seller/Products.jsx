// ============================================================
// frontend/src/seller/Products.jsx
// BuyUKUsed - Seller Products / My Ads
// ============================================================

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getProducts,
  deleteProduct,
  getImageUrl,
} from "../services/api";

import VerifiedBadge from "../components/VerifiedBadge";

// ============================================================
// SELLER PRODUCTS
// ============================================================

const SellerProducts = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // ==========================================================
  // LOAD SELLER PRODUCTS
  // ==========================================================

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts({
          sellerId: user._id,
          limit: 100,
        });

        const productList = Array.isArray(response)
          ? response
          : response?.products || [];

        setProducts(productList);
      } catch (err) {
        console.error(
          "Failed to fetch seller products:",
          err
        );

        setError(
          err?.message || "Could not load your ads."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  // ==========================================================
  // DELETE PRODUCT
  // ==========================================================

  const handleDelete = async (productId) => {
    if (
      !window.confirm(
        "Delete this ad permanently?"
      )
    ) {
      return;
    }

    setDeletingId(productId);

    try {
      const result = await deleteProduct(
        productId,
        token
      );

      if (
        result?.success ||
        result?.message
          ?.toLowerCase()
          ?.includes("deleted")
      ) {
        setProducts((previous) =>
          previous.filter(
            (product) =>
              product._id !== productId
          )
        );
      } else {
        alert(
          result?.message ||
            "Delete failed."
        );
      }
    } catch (err) {
      alert(
        err?.message ||
          "Something went wrong."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // SELLER PROFILE IMAGE
  // ==========================================================

  const sellerAvatar =
    user?.profileImage ||
    user?.avatar ||
    user?.photo ||
    user?.photoURL ||
    null;

  const sellerAvatarUrl = sellerAvatar
    ? getImageUrl(sellerAvatar)
    : null;

  const isVerified =
    user?.isVerified === true;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <>
        <style>
          {`
            .seller-products-page {
              padding-top: 76px;
              min-height: 100vh;
              box-sizing: border-box;
            }

            @media (max-width: 767px) {
              .seller-products-page {
                padding-top: 60px;
              }
            }

            @media (max-width: 480px) {
              .seller-products-page {
                padding-top: 56px;
              }
            }
          `}
        </style>

        <div className="seller-products-page">
          <div
            className="container"
            style={{
              padding:
                "40px 20px",
              textAlign: "center",
            }}
          >
            Loading your ads...
          </div>
        </div>
      </>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <>
        <style>
          {`
            .seller-products-page {
              padding-top: 76px;
              min-height: 100vh;
              box-sizing: border-box;
            }

            @media (max-width: 767px) {
              .seller-products-page {
                padding-top: 60px;
              }
            }

            @media (max-width: 480px) {
              .seller-products-page {
                padding-top: 56px;
              }
            }
          `}
        </style>

        <div className="seller-products-page">
          <div
            className="container"
            style={{
              padding:
                "40px 20px",
              color: "#e74c3c",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        </div>
      </>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <>
      <style>
        {`
          /* =====================================================
             PAGE
             Fixed navbar is approximately 46px tall.
             Extra spacing keeps page content below it.
             ===================================================== */

          .seller-products-page {
            width: 100%;
            min-height: 100vh;
            padding-top: 76px;
            box-sizing: border-box;
          }

          .seller-products-container {
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
            padding: 20px;
            box-sizing: border-box;
          }

          /* =====================================================
             HEADER
             ===================================================== */

          .seller-products-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }

          .seller-profile-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            overflow: hidden;
            background: var(--gray-200, #e5e7eb);
            flex-shrink: 0;
            border: 2px solid var(--gray-100, #f1f5f9);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .seller-profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .seller-products-title {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .seller-products-count {
            font-size: 14px;
            color: var(--gray-500, #64748b);
          }

          .seller-post-button {
            margin-left: auto;
            padding: 10px 20px;
            background: var(--secondary, #2ecc71);
            color: white;
            border: none;
            border-radius: var(--radius-full, 9999px);
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
          }

          /* =====================================================
             PRODUCT LIST
             ===================================================== */

          .seller-products-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .seller-product-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: white;
            border-radius: var(--radius-md, 12px);
            border: 1px solid var(--gray-200, #e5e7eb);
            box-sizing: border-box;
            min-width: 0;
          }

          .seller-product-image {
            width: 60px;
            height: 60px;
            border-radius: var(--radius-sm, 8px);
            overflow: hidden;
            flex-shrink: 0;
            background: #f1f5f9;
          }

          .seller-product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .seller-product-info {
            flex: 1;
            min-width: 0;
          }

          .seller-product-title-row {
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
          }

          .seller-product-title {
            text-decoration: none;
            color: inherit;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .seller-product-meta {
            font-size: 13px;
            color: var(--gray-500, #64748b);
            margin-top: 4px;
          }

          .seller-product-price {
            font-weight: 700;
            color: var(--primary, #0055a5);
            white-space: nowrap;
            flex-shrink: 0;
          }

          .seller-product-actions {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-shrink: 0;
          }

          .seller-product-action {
            padding: 6px 14px;
            color: white;
            border: none;
            border-radius: var(--radius-sm, 8px);
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
          }

          .seller-edit-button {
            background: var(--primary, #0055a5);
          }

          .seller-delete-button {
            background: #dc2626;
          }

          .seller-delete-button:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }

          .seller-sold-badge {
            background: #dc2626;
            color: white;
            font-size: 10px;
            padding: 1px 8px;
            border-radius: 9999px;
            font-weight: 700;
            flex-shrink: 0;
          }

          /* =====================================================
             EMPTY STATE
             ===================================================== */

          .seller-empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--gray-500, #64748b);
          }

          /* =====================================================
             TABLET
             ===================================================== */

          @media (max-width: 900px) {
            .seller-product-card {
              align-items: flex-start;
              flex-wrap: wrap;
            }

            .seller-product-info {
              min-width: calc(100% - 76px);
            }

            .seller-product-price {
              margin-left: 76px;
            }

            .seller-product-actions {
              margin-left: auto;
            }
          }

          /* =====================================================
             MOBILE
             ===================================================== */

          @media (max-width: 767px) {
            .seller-products-page {
              padding-top: 60px;
            }

            .seller-products-container {
              padding: 16px 12px 30px;
            }

            .seller-products-header {
              gap: 12px;
              margin-bottom: 18px;
            }

            .seller-profile-avatar {
              width: 48px;
              height: 48px;
            }

            .seller-products-title {
              font-size: 21px;
            }

            .seller-products-count {
              font-size: 13px;
            }

            .seller-post-button {
              width: 100%;
              justify-content: center;
              margin-left: 0;
              padding: 9px 16px;
            }

            .seller-product-card {
              gap: 12px;
              padding: 12px;
              align-items: flex-start;
            }

            .seller-product-image {
              width: 56px;
              height: 56px;
            }

            .seller-product-info {
              min-width: 0;
              flex: 1;
            }

            .seller-product-title {
              font-size: 14px;
            }

            .seller-product-meta {
              font-size: 12px;
              line-height: 1.5;
            }

            .seller-product-price {
              width: 100%;
              margin-left: 68px;
              margin-top: -4px;
              font-size: 15px;
            }

            .seller-product-actions {
              width: 100%;
              margin-left: 0;
              display: grid;
              grid-template-columns: 1fr 1fr;
            }

            .seller-product-action {
              width: 100%;
              padding: 8px 10px;
            }
          }

          /* =====================================================
             SMALL MOBILE
             ===================================================== */

          @media (max-width: 480px) {
            .seller-products-page {
              padding-top: 56px;
            }

            .seller-products-container {
              padding: 14px 8px 24px;
            }

            .seller-products-title {
              font-size: 19px;
            }

            .seller-profile-avatar {
              width: 44px;
              height: 44px;
            }

            .seller-product-card {
              padding: 10px;
            }

            .seller-product-image {
              width: 50px;
              height: 50px;
            }

            .seller-product-price {
              margin-left: 62px;
            }
          }
        `}
      </style>

      <div className="seller-products-page">
        <div className="seller-products-container">

          {/* ====================================================
              SELLER HEADER
          ==================================================== */}

          <div className="seller-products-header">

            <div className="seller-profile-avatar">
              {sellerAvatarUrl ? (
                <img
                  src={sellerAvatarUrl}
                  alt={
                    user?.name || "Seller"
                  }
                />
              ) : (
                <i
                  className="fas fa-user-circle"
                  style={{
                    fontSize: "44px",
                    color:
                      "var(--gray-400, #94a3b8)",
                  }}
                />
              )}
            </div>

            <div>
              <h1 className="seller-products-title">
                {user?.name || "My Ads"}

                {isVerified && (
                  <VerifiedBadge
                    size={24}
                    showLabel
                  />
                )}
              </h1>

              <div className="seller-products-count">
                {products.length}{" "}
                {products.length === 1
                  ? "ad"
                  : "ads"}{" "}
                posted
              </div>
            </div>

            <Link
              to="/post-ad"
              className="seller-post-button"
            >
              <i className="fas fa-plus-circle" />
              Post New Ad
            </Link>
          </div>

          {/* ====================================================
              EMPTY STATE
          ==================================================== */}

          {products.length === 0 ? (
            <div className="seller-empty-state">
              You haven't posted any ads yet.

              <br />

              <Link
                to="/post-ad"
                className="btn-primary"
                style={{
                  display: "inline-block",
                  marginTop: "16px",
                }}
              >
                Post Your First Ad
              </Link>
            </div>
          ) : (

            /* ==================================================
               PRODUCT LIST
            ================================================== */

            <div className="seller-products-list">

              {products.map((product) => {
                const imageUrl =
                  product.images?.length > 0
                    ? getImageUrl(
                        product.images[0]
                      )
                    : null;

                const isSold =
                  product.status === "sold";

                return (
                  <div
                    key={product._id}
                    className="seller-product-card"
                  >

                    {/* PRODUCT IMAGE */}

                    {imageUrl && (
                      <div className="seller-product-image">
                        <img
                          src={imageUrl}
                          alt={
                            product.title ||
                            "Product"
                          }
                        />
                      </div>
                    )}

                    {/* PRODUCT INFO */}

                    <div className="seller-product-info">

                      <div className="seller-product-title-row">

                        <Link
                          to={`/product/${product._id}`}
                          className="seller-product-title"
                        >
                          {product.title}
                        </Link>

                        {isSold && (
                          <span className="seller-sold-badge">
                            SOLD
                          </span>
                        )}

                      </div>

                      <div className="seller-product-meta">
                        {product.category}{" "}
                        •{" "}
                        {product.location}{" "}
                        •{" "}
                        <i className="fas fa-eye" />{" "}
                        {product.views || 0}
                      </div>

                    </div>

                    {/* PRICE */}

                    <div className="seller-product-price">
                      ₵
                      {Number(
                        product.price || 0
                      ).toLocaleString()}
                    </div>

                    {/* ACTIONS */}

                    <div className="seller-product-actions">

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/edit-product/${product._id}`
                          )
                        }
                        className="seller-product-action seller-edit-button"
                      >
                        <i className="fas fa-pen" />{" "}
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            product._id
                          )
                        }
                        disabled={
                          deletingId ===
                          product._id
                        }
                        className="seller-product-action seller-delete-button"
                      >
                        {deletingId ===
                        product._id ? (
                          "Deleting..."
                        ) : (
                          <>
                            <i className="fas fa-trash" />{" "}
                            Delete
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SellerProducts;