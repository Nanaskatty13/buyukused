// ============================================================
// backend/routes/sellerRoutes.js
// BuyUKUsed - Seller Routes
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
  getSellerAnalytics,
  getMyProducts,
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
  getSellerEarnings,
  getPublicSellerProfile,
  getPublicSellerProducts,
  verifySeller,
  rejectSeller,
} = require("../controllers/sellerController");

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

const {
  authenticate,
  requireRoles,
} = require("../middleware/authMiddleware");

// ============================================================
// ROLE MIDDLEWARE
// ============================================================

const requireSeller = requireRoles(
  "seller",
  "admin"
);

const requireAdmin = requireRoles(
  "admin"
);

// ============================================================
// REGISTER AS SELLER
// ============================================================

// POST /api/sellers/register
router.post(
  "/register",
  authenticate,
  registerSeller
);

// ============================================================
// PRIVATE SELLER PROFILE
// ============================================================

// GET /api/sellers/profile
router.get(
  "/profile",
  authenticate,
  requireSeller,
  getSellerProfile
);

// PUT /api/sellers/profile
router.put(
  "/profile",
  authenticate,
  requireSeller,
  updateSellerProfile
);

// PATCH /api/sellers/profile
router.patch(
  "/profile",
  authenticate,
  requireSeller,
  updateSellerProfile
);

// ============================================================
// SELLER DASHBOARD
// ============================================================

// GET /api/sellers/dashboard
router.get(
  "/dashboard",
  authenticate,
  requireSeller,
  getSellerDashboard
);

// ============================================================
// SELLER ANALYTICS
// ============================================================

// GET /api/sellers/analytics
router.get(
  "/analytics",
  authenticate,
  requireSeller,
  getSellerAnalytics
);

// ============================================================
// SELLER EARNINGS
// ============================================================

// GET /api/sellers/earnings
router.get(
  "/earnings",
  authenticate,
  requireSeller,
  getSellerEarnings
);

// ============================================================
// SELLER PRODUCTS
// ============================================================

// GET /api/sellers/products
router.get(
  "/products",
  authenticate,
  requireSeller,
  getMyProducts
);

// ============================================================
// SELLER ORDERS
// ============================================================

// GET /api/sellers/orders
router.get(
  "/orders",
  authenticate,
  requireSeller,
  getSellerOrders
);

// ============================================================
// SINGLE SELLER ORDER
// ============================================================

// GET /api/sellers/orders/:orderId
router.get(
  "/orders/:orderId",
  authenticate,
  requireSeller,
  getSellerOrderById
);

// ============================================================
// UPDATE SELLER ORDER STATUS
// ============================================================

// PATCH /api/sellers/orders/:orderId/status
router.patch(
  "/orders/:orderId/status",
  authenticate,
  requireSeller,
  updateSellerOrderStatus
);

// ============================================================
// PUBLIC SELLER PRODUCTS
// ============================================================
//
// IMPORTANT:
// These routes must appear before:
//
// /:sellerId
//
// Otherwise "/:sellerId" could catch "products"
// incorrectly.
//
// ============================================================

// GET /api/sellers/:sellerId/products
router.get(
  "/:sellerId/products",
  getPublicSellerProducts
);

// ============================================================
// PUBLIC SELLER PROFILE
// ============================================================

// GET /api/sellers/:sellerId
router.get(
  "/:sellerId",
  getPublicSellerProfile
);

// ============================================================
// ADMIN SELLER VERIFICATION
// ============================================================
//
// These routes are intentionally NOT inside the normal
// public seller routes.
//
// They are mounted separately by server.js at:
//
// /api/admin/sellers
//
// Therefore:
//
// POST /api/admin/sellers/:sellerId/verify
// POST /api/admin/sellers/:sellerId/reject
//
// ============================================================

// POST /api/admin/sellers/:sellerId/verify
router.post(
  "/:sellerId/verify",
  authenticate,
  requireAdmin,
  verifySeller
);

// POST /api/admin/sellers/:sellerId/reject
router.post(
  "/:sellerId/reject",
  authenticate,
  requireAdmin,
  rejectSeller
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;