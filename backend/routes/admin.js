// backend/routes/admin.js

const express = require("express");

const router = express.Router();

// ============================================================
// CONTROLLER
// ============================================================

const {
  getDashboardStats,

  // Users
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,

  // Products
  getProducts,
  deleteProduct,

  // Orders
  getOrders,
  updateOrderStatus,

  // Riders
  getRiders,
  getRiderById,
  approveRider,
  rejectRider,
  updateRiderStatus,
  updateRiderProfile,

  // ─── NEW: Seller Verification ──────────────────────────────
  getUnverifiedSellers,
  verifySeller,
  revokeVerification,
} = require("../controllers/adminController");

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

const {
  verifyToken,
  isAdmin,
} = require("../middleware/auth");

// ============================================================
// GLOBAL ADMIN PROTECTION
// ============================================================
//
// Every route below requires:
//
// 1. Valid JWT
// 2. Existing user
// 3. Active account
// 4. role === "admin"
//

router.use(verifyToken);
router.use(isAdmin);

// ============================================================
// DASHBOARD
// ============================================================

router.get(
  "/dashboard",
  getDashboardStats
);

// ============================================================
// USERS
// ============================================================

router.get(
  "/users",
  getUsers
);

router.get(
  "/users/:id",
  getUserById
);

router.put(
  "/users/:id/role",
  updateUserRole
);

router.delete(
  "/users/:id",
  deleteUser
);

// ============================================================
// PRODUCTS
// ============================================================

router.get(
  "/products",
  getProducts
);

router.delete(
  "/products/:id",
  deleteProduct
);

// ============================================================
// ORDERS
// ============================================================

router.get(
  "/orders",
  getOrders
);

router.put(
  "/orders/:id/status",
  updateOrderStatus
);

// ============================================================
// RIDERS
// ============================================================

router.get(
  "/riders",
  getRiders
);

router.get(
  "/riders/:id",
  getRiderById
);

router.put(
  "/riders/:id/approve",
  approveRider
);

router.put(
  "/riders/:id/reject",
  rejectRider
);

router.put(
  "/riders/:id/status",
  updateRiderStatus
);

router.put(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// SELLER VERIFICATION (NEW)
// ============================================================

// GET /api/admin/unverified-sellers
// List all sellers with isVerified = false
router.get(
  "/unverified-sellers",
  getUnverifiedSellers
);

// POST /api/admin/verify-seller/:id
// Mark a seller as verified
router.post(
  "/verify-seller/:id",
  verifySeller
);

// PUT /api/admin/revoke-verification/:id
// Revoke verification from a seller
router.put(
  "/revoke-verification/:id",
  revokeVerification
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;