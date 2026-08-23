// ============================================================
// backend/routes/admin.js
// BuyUKUsed - Admin Routes
// ============================================================

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
  updateUserStatus,
  deleteUser,

  // Sellers
  verifySeller,
  unverifySeller,

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

// PATCH /api/admin/users/:id/role
router.patch(
  "/users/:id/role",
  updateUserRole
);

// PATCH /api/admin/users/:id/status
router.patch(
  "/users/:id/status",
  updateUserStatus
);

// PUT /api/admin/users/:id/status
router.put(
  "/users/:id/status",
  updateUserStatus
);

// DELETE /api/admin/users/:id
router.delete(
  "/users/:id",
  deleteUser
);

// ============================================================
// SELLERS
// ============================================================
//
// IMPORTANT:
//
// Frontend is calling:
//
// /api/admin/sellers/:id/verify
//
// The controller already contains:
//
// verifySeller()
// unverifySeller()
//
// These routes were missing from admin.js.
// ============================================================

// PATCH /api/admin/sellers/:id/verify
router.patch(
  "/sellers/:id/verify",
  verifySeller
);

// PUT /api/admin/sellers/:id/verify
router.put(
  "/sellers/:id/verify",
  verifySeller
);

// PATCH /api/admin/sellers/:id/unverify
router.patch(
  "/sellers/:id/unverify",
  unverifySeller
);

// PUT /api/admin/sellers/:id/unverify
router.put(
  "/sellers/:id/unverify",
  unverifySeller
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

// PATCH /api/admin/orders/:id/status
router.patch(
  "/orders/:id/status",
  updateOrderStatus
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

// PATCH /api/admin/riders/:id/approve
router.patch(
  "/riders/:id/approve",
  approveRider
);

// PUT /api/admin/riders/:id/approve
router.put(
  "/riders/:id/approve",
  approveRider
);

// PATCH /api/admin/riders/:id/reject
router.patch(
  "/riders/:id/reject",
  rejectRider
);

// PUT /api/admin/riders/:id/reject
router.put(
  "/riders/:id/reject",
  rejectRider
);

// PATCH /api/admin/riders/:id/status
router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

// PUT /api/admin/riders/:id/status
router.put(
  "/riders/:id/status",
  updateRiderStatus
);

// PATCH /api/admin/riders/:id/profile
router.patch(
  "/riders/:id/profile",
  updateRiderProfile
);

// PUT /api/admin/riders/:id/profile
router.put(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;