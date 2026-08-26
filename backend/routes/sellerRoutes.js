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
// AUTH MIDDLEWARE
// ============================================================

const { protect } = require("../middleware/auth");

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
 * Get authenticated seller profile.
 */
router.get(
  "/profile",
  protect,
  getSellerProfile
);

/**
 * PUT /api/sellers/profile
 *
 * Update authenticated seller profile.
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
 */
router.get(
  "/analytics",
  protect,
  getSellerAnalytics
);

// ============================================================
// SELLER PRODUCTS
// ============================================================

/**
 * GET /api/sellers/products
 *
 * Get authenticated seller's products.
 */
router.get(
  "/products",
  protect,
  getMyProducts
);

/**
 * POST /api/sellers/products
 *
 * Create seller product.
 */
router.post(
  "/products",
  protect,
  createProductSeller
);

/**
 * PUT /api/sellers/products/:productId
 *
 * Update seller product.
 */
router.put(
  "/products/:productId",
  protect,
  updateProductSeller
);

/**
 * DELETE /api/sellers/products/:productId
 *
 * Delete seller product.
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
 */
router.get(
  "/orders",
  protect,
  getSellerOrders
);

/**
 * GET /api/sellers/orders/:orderId
 */
router.get(
  "/orders/:orderId",
  protect,
  getSellerOrderById
);

/**
 * PUT /api/sellers/orders/:orderId/status
 */
router.put(
  "/orders/:orderId/status",
  protect,
  updateSellerOrderStatus
);

// ============================================================
// PUBLIC SELLER PROFILE
// ============================================================

/**
 * GET /api/sellers/:sellerId
 *
 * Public seller profile.
 *
 * NO protect middleware.
 */
router.get(
  "/:sellerId",
  getPublicSellerProfile
);

// ============================================================
// PUBLIC SELLER PRODUCTS
// ============================================================

/**
 * GET /api/sellers/:sellerId/products
 *
 * Public products belonging to seller.
 *
 * NO protect middleware.
 */
router.get(
  "/:sellerId/products",
  getPublicSellerProducts
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;