
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
// PUBLIC SELLER ROUTES
// ============================================================
//
// IMPORTANT:
//
// These routes MUST NOT use protect.
//
// They allow visitors to view a seller profile and
// the seller's active products without logging in.
//


// ------------------------------------------------------------
// GET PUBLIC SELLER PRODUCTS
// GET /api/sellers/:sellerId/products
// ------------------------------------------------------------

router.get(
  "/:sellerId/products",
  getPublicSellerProducts
);


// ------------------------------------------------------------
// GET PUBLIC SELLER PROFILE
// GET /api/sellers/:sellerId
// ------------------------------------------------------------

router.get(
  "/:sellerId",
  getPublicSellerProfile
);


// ============================================================
// SELLER REGISTRATION
// ============================================================
//
// POST /api/sellers/register
//

router.post(
  "/register",
  protect,
  registerSeller
);


// ============================================================
// PRIVATE SELLER PROFILE
// ============================================================


// ------------------------------------------------------------
// GET MY SELLER PROFILE
// GET /api/sellers/profile
// ------------------------------------------------------------

router.get(
  "/profile",
  protect,
  getSellerProfile
);


// ------------------------------------------------------------
// UPDATE MY SELLER PROFILE
// PUT /api/sellers/profile
// ------------------------------------------------------------

router.put(
  "/profile",
  protect,
  updateSellerProfile
);


// ============================================================
// SELLER DASHBOARD
// ============================================================


// ------------------------------------------------------------
// GET SELLER DASHBOARD
// GET /api/sellers/dashboard
//
// Optional:
//
// ?period=today
// ?period=week
// ?period=month
// ?period=year
// ?period=all
// ------------------------------------------------------------

router.get(
  "/dashboard",
  protect,
  getSellerDashboard
);


// ============================================================
// SELLER EARNINGS
// ============================================================


// ------------------------------------------------------------
// GET SELLER EARNINGS
// GET /api/sellers/earnings
// ------------------------------------------------------------

router.get(
  "/earnings",
  protect,
  getSellerEarnings
);


// ============================================================
// SELLER ANALYTICS
// ============================================================


// ------------------------------------------------------------
// GET SELLER ANALYTICS
// GET /api/sellers/analytics
// ------------------------------------------------------------

router.get(
  "/analytics",
  protect,
  getSellerAnalytics
);


// ============================================================
// SELLER PRODUCTS
// ============================================================


// ------------------------------------------------------------
// GET MY PRODUCTS
// GET /api/sellers/products
//
// Example:
//
// /api/sellers/products?page=1&limit=20
// /api/sellers/products?status=active
// /api/sellers/products?sort=-createdAt
// ------------------------------------------------------------

router.get(
  "/products",
  protect,
  getMyProducts
);


// ============================================================
// SELLER ORDERS
// ============================================================


// ------------------------------------------------------------
// GET MY SELLER ORDERS
// GET /api/sellers/orders
// ------------------------------------------------------------

router.get(
  "/orders",
  protect,
  getSellerOrders
);


// ------------------------------------------------------------
// GET SELLER ORDER
// GET /api/sellers/orders/:orderId
// ------------------------------------------------------------

router.get(
  "/orders/:orderId",
  protect,
  getSellerOrderById
);


// ------------------------------------------------------------
// UPDATE SELLER ORDER STATUS
// PUT /api/sellers/orders/:orderId/status
// ------------------------------------------------------------

router.put(
  "/orders/:orderId/status",
  protect,
  updateSellerOrderStatus
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;