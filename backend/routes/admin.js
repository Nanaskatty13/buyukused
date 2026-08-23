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
// EXPORT
// ============================================================

module.exports = router;