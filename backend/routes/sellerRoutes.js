// ============================================================
// backend/routes/sellerRoutes.js
// BuyUKUsed Seller Routes
// ============================================================

const express = require("express");

const router = express.Router();

// ============================================================
// CONTROLLER
// ============================================================

const {
  registerSeller,
  getSellerProfile,
  updateSellerProfile,

  getSellerDashboard,
  getSellerEarnings,
  getSellerAnalytics,

  getMyProducts,
  createProductSeller,
  updateProductSeller,
  deleteProductSeller,

  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,

  getPublicSellerProfile,
  getPublicSellerProducts,
} = require("../controllers/sellerController");

// ============================================================
// MIDDLEWARE
// ============================================================

const { protect } = require("../middleware/auth");

// ============================================================
// OPTIONAL UPLOAD MIDDLEWARE
// ============================================================
//
// Your seller product controller may already handle uploads
// internally. If your project has a specific upload middleware,
// you can add it here.
//
// Example:
//
// const upload = require("../middleware/upload");
//
// Do NOT add upload middleware unless your controller expects it.
// ============================================================

// ============================================================
// SELLER REGISTRATION
// ============================================================

/**
 * POST /api/sellers/register
 *
 * Register the authenticated user as a seller.
 */
router.post(
  "/register",
  protect,
  registerSeller
);

// ============================================================
// OWN SELLER PROFILE
// ============================================================

/**
 * GET /api/sellers/profile
 *
 * Get currently authenticated seller profile.
 */
router.get(
  "/profile",
  protect,
  getSellerProfile
);

/**
 * PUT /api/sellers/profile
 *
 * Update currently authenticated seller profile.
 */
router.put(
  "/profile",
  protect,
  updateSellerProfile
);

// ============================================================
// SELLER DASHBOARD
// ============================================================

/**
 * GET /api/sellers/dashboard
 *
 * Seller dashboard statistics.
 *
 * Optional:
 * ?period=today
 * ?period=week
 * ?period=month
 * ?period=year
 * ?period=all
 */
router.get(
  "/dashboard",
  protect,
  getSellerDashboard
);

// ============================================================
// SELLER EARNINGS
// ============================================================

/**
 * GET /api/sellers/earnings
 *
 * Seller earnings.
 */
router.get(
  "/earnings",
  protect,
  getSellerEarnings
);

// ============================================================
// SELLER ANALYTICS
// ============================================================

/**
 * GET /api/sellers/analytics
 *
 * Seller analytics.
 */
router.get(
  "/analytics",
  protect,
  getSellerAnalytics
);

// ============================================================
// SELLER PRODUCT MANAGEMENT
// ============================================================

/**
 * GET /api/sellers/products
 *
 * Get products belonging to the authenticated seller.
 *
 * Example:
 *
 * /api/sellers/products?page=1&limit=20
 *
 * Optional:
 * ?status=active
 * ?status=sold
 * ?sort=-createdAt
 */
router.get(
  "/products",
  protect,
  getMyProducts
);

/**
 * POST /api/sellers/products
 *
 * Create a new product.
 *
 * The controller is responsible for processing the
 * product data and uploaded files.
 */
router.post(
  "/products",
  protect,
  createProductSeller
);

/**
 * PUT /api/sellers/products/:productId
 *
 * Update one of the authenticated seller's products.
 */
router.put(
  "/products/:productId",
  protect,
  updateProductSeller
);

/**
 * DELETE /api/sellers/products/:productId
 *
 * Delete one of the authenticated seller's products.
 */
router.delete(
  "/products/:productId",
  protect,
  deleteProductSeller
);

// ============================================================
// SELLER ORDERS
// ============================================================

/**
 * GET /api/sellers/orders
 *
 * Get orders containing the authenticated seller's products.
 */
router.get(
  "/orders",
  protect,
  getSellerOrders
);

/**
 * GET /api/sellers/orders/:orderId
 *
 * Get one seller order.
 */
router.get(
  "/orders/:orderId",
  protect,
  getSellerOrderById
);

/**
 * PUT /api/sellers/orders/:orderId/status
 *
 * Update seller order status.
 */
router.put(
  "/orders/:orderId/status",
  protect,
  updateSellerOrderStatus
);

// ============================================================
// PUBLIC SELLER PROFILE
// ============================================================
//
// IMPORTANT:
//
// These routes intentionally DO NOT use `protect`.
//
// This allows anyone to visit:
//
// /seller/:sellerId
//
// and see:
//
// - Seller name
// - Shop name
// - Profile image
// - Location
// - Member since
// - Seller rating
// - Product count
//
// without logging in.
// ============================================================

/**
 * GET /api/sellers/:sellerId
 *
 * Public seller profile.
 */
router.get(
  "/:sellerId",
  getPublicSellerProfile
);

/**
 * GET /api/sellers/:sellerId/products
 *
 * Public seller products.
 *
 * Example:
 *
 * /api/sellers/123/products?page=1&limit=20&sort=-createdAt
 *
 * Optional:
 *
 * ?status=active
 * ?category=Phones
 * ?search=iPhone
 */
router.get(
  "/:sellerId/products",
  getPublicSellerProducts
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;