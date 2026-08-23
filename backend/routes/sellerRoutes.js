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

const requireSeller =
  requireRoles(
    "seller",
    "admin"
  );

// ============================================================
// REGISTER AS SELLER
// ============================================================

router.post(
  "/register",
  authenticate,
  registerSeller
);

// ============================================================
// PRIVATE SELLER PROFILE
// ============================================================

router.get(
  "/profile",
  authenticate,
  requireSeller,
  getSellerProfile
);

// ============================================================
// UPDATE SELLER PROFILE
// ============================================================

router.put(
  "/profile",
  authenticate,
  requireSeller,
  updateSellerProfile
);

// ============================================================
// SELLER DASHBOARD
// ============================================================

router.get(
  "/dashboard",
  authenticate,
  requireSeller,
  getSellerDashboard
);

// ============================================================
// SELLER EARNINGS
// ============================================================

router.get(
  "/earnings",
  authenticate,
  requireSeller,
  getSellerEarnings
);

// ============================================================
// SELLER PRODUCTS
// ============================================================

router.get(
  "/products",
  authenticate,
  requireSeller,
  getMyProducts
);

// ============================================================
// SELLER ORDERS
// ============================================================

router.get(
  "/orders",
  authenticate,
  requireSeller,
  getSellerOrders
);

// ============================================================
// PUBLIC SELLER PRODUCTS
//
// IMPORTANT:
// This must come before /:sellerId
// ============================================================

router.get(
  "/:sellerId/products",
  getPublicSellerProducts
);

// ============================================================
// PUBLIC SELLER PROFILE
// ============================================================

router.get(
  "/:sellerId",
  getPublicSellerProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;