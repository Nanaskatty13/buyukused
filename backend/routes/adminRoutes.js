// ============================================================
// backend/routes/adminRoutes.js
// BuyUKUsed - Admin Routes
// ============================================================

const express = require("express");

const router = express.Router();

const {
  authenticate,
  requireAdmin,
} = require("../middleware/authMiddleware");

const {
  getDashboardStats,

  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  verifySeller,
  unverifySeller,
  deleteUser,

  getProducts,
  deleteProduct,

  getOrders,
  updateOrderStatus,

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
//
// Every route in this file requires:
// 1. A valid authentication token
// 2. The authenticated user to be an admin
//
// IMPORTANT:
// Keep these middleware calls before all admin endpoints.
// ============================================================

router.use(authenticate);
router.use(requireAdmin);

// ============================================================
// DASHBOARD
// ============================================================

// GET /api/admin/stats
router.get(
  "/stats",
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

// PATCH /api/admin/users/:id/verify-seller
router.patch(
  "/users/:id/verify-seller",
  verifySeller
);

// PATCH /api/admin/users/:id/unverify-seller
router.patch(
  "/users/:id/unverify-seller",
  unverifySeller
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

// PATCH /api/admin/orders/:id/status
router.patch(
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

// PATCH /api/admin/riders/:id/reject
router.patch(
  "/riders/:id/reject",
  rejectRider
);

// PATCH /api/admin/riders/:id/status
router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

// PATCH /api/admin/riders/:id/profile
router.patch(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;