// ============================================================
// backend/routes/admin.js
// BuyUKUsed Admin Routes
// ============================================================

const express = require("express");

const router = express.Router();

// ============================================================
// CONTROLLERS
// ============================================================

const {
  // Dashboard
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

  // Sellers
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
// Every route in this file requires:
//
// 1. Valid JWT
// 2. Existing user
// 3. Active account
// 4. role === "admin"
//
// ============================================================

router.use(verifyToken);
router.use(isAdmin);

// ============================================================
// DASHBOARD
// ============================================================

// GET /api/admin/dashboard
router.get(
  "/dashboard",
  getDashboardStats
);

// ============================================================
// USERS
// ============================================================

// GET /api/admin/users
router.get(
  "/users",
  getUsers
);

// GET /api/admin/users/:id
router.get(
  "/users/:id",
  getUserById
);

// PUT /api/admin/users/:id/role
router.put(
  "/users/:id/role",
  updateUserRole
);

// DELETE /api/admin/users/:id
router.delete(
  "/users/:id",
  deleteUser
);

// ============================================================
// PRODUCTS
// ============================================================

// GET /api/admin/products
router.get(
  "/products",
  getProducts
);

// DELETE /api/admin/products/:id
router.delete(
  "/products/:id",
  deleteProduct
);

// ============================================================
// ORDERS
// ============================================================

// GET /api/admin/orders
router.get(
  "/orders",
  getOrders
);

// PUT /api/admin/orders/:id/status
router.put(
  "/orders/:id/status",
  updateOrderStatus
);

// ============================================================
// RIDERS
// ============================================================

// GET /api/admin/riders
router.get(
  "/riders",
  getRiders
);

// GET /api/admin/riders/:id
router.get(
  "/riders/:id",
  getRiderById
);

// PUT /api/admin/riders/:id/approve
router.put(
  "/riders/:id/approve",
  approveRider
);

// PUT /api/admin/riders/:id/reject
router.put(
  "/riders/:id/reject",
  rejectRider
);

// PUT /api/admin/riders/:id/status
router.put(
  "/riders/:id/status",
  updateRiderStatus
);

// PUT /api/admin/riders/:id/profile
router.put(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// SELLER VERIFICATION
// ============================================================
//
// These routes are mounted by server.js:
//
// app.use("/api/admin", adminRoutes);
//
// Therefore:
//
// GET
// /api/admin/sellers/unverified
//
// PUT
// /api/admin/sellers/:id/verify
//
// PUT
// /api/admin/sellers/:id/revoke-verification
//
// ============================================================

// GET /api/admin/sellers/unverified
router.get(
  "/sellers/unverified",
  getUnverifiedSellers
);

// PUT /api/admin/sellers/:id/verify
router.put(
  "/sellers/:id/verify",
  verifySeller
);

// POST compatibility endpoint.
//
// This is kept temporarily so older frontend builds
// using POST can still verify sellers.
//
// POST /api/admin/sellers/:id/verify
router.post(
  "/sellers/:id/verify",
  verifySeller
);

// PUT /api/admin/sellers/:id/revoke-verification
router.put(
  "/sellers/:id/revoke-verification",
  revokeVerification
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;