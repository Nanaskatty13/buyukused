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
  getMyProducts,
  getSellerOrders,
  getSellerEarnings,
  getPublicSellerProfile,
  getPublicSellerProducts,
} = require("../controllers/sellerController");

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

const {
  authenticate,
  requireRoles,
} = require("../middleware/authMiddleware");

// ============================================================
// SELLER ACCESS
// ============================================================

const requireSeller = requireRoles(
  "seller",
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
// PUBLIC SELLER PRODUCTS
// ============================================================
//
// IMPORTANT:
// This route must come before:
//
// /:sellerId
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
// EXPORT
// ============================================================

module.exports = router;