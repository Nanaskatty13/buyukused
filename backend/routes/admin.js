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
  // Dashboard
  getDashboardStats,

  // Users
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  verifySeller,
  unverifySeller,
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
// EVERY route below requires:
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

// Optional alias:
//
// GET /api/admin/stats
//
// Useful if your frontend currently calls /stats.

router.get(
  "/stats",
  getDashboardStats
);

// ============================================================
// USERS
// ============================================================

// ------------------------------------------------------------
// GET ALL USERS
// GET /api/admin/users
// ------------------------------------------------------------

router.get(
  "/users",
  getUsers
);

// ------------------------------------------------------------
// GET SINGLE USER
// GET /api/admin/users/:id
// ------------------------------------------------------------

router.get(
  "/users/:id",
  getUserById
);

// ------------------------------------------------------------
// UPDATE USER ROLE
// PATCH /api/admin/users/:id/role
// ------------------------------------------------------------

router.patch(
  "/users/:id/role",
  updateUserRole
);

// Also allow PUT for frontend compatibility.
router.put(
  "/users/:id/role",
  updateUserRole
);

// ------------------------------------------------------------
// UPDATE USER ACCOUNT STATUS
// PATCH /api/admin/users/:id/status
// ------------------------------------------------------------

router.patch(
  "/users/:id/status",
  updateUserStatus
);

// Also allow PUT for frontend compatibility.
router.put(
  "/users/:id/status",
  updateUserStatus
);

// ============================================================
// SELLER VERIFICATION
// ============================================================

// ------------------------------------------------------------
// VERIFY SELLER
// PATCH /api/admin/users/:id/verify-seller
// ------------------------------------------------------------
//
// This is the endpoint the Admin Dashboard should call when
// the administrator clicks "Verify Seller".
//
// ------------------------------------------------------------

router.patch(
  "/users/:id/verify-seller",
  verifySeller
);

// Also allow PUT for frontend compatibility.
router.put(
  "/users/:id/verify-seller",
  verifySeller
);

// ------------------------------------------------------------
// UNVERIFY SELLER
// PATCH /api/admin/users/:id/unverify-seller
// ------------------------------------------------------------

router.patch(
  "/users/:id/unverify-seller",
  unverifySeller
);

// Also allow PUT for frontend compatibility.
router.put(
  "/users/:id/unverify-seller",
  unverifySeller
);

// ------------------------------------------------------------
// DELETE USER
// DELETE /api/admin/users/:id
// ------------------------------------------------------------

router.delete(
  "/users/:id",
  deleteUser
);

// ============================================================
// PRODUCTS
// ============================================================

// ------------------------------------------------------------
// GET ALL PRODUCTS
// GET /api/admin/products
// ------------------------------------------------------------

router.get(
  "/products",
  getProducts
);

// ------------------------------------------------------------
// DELETE PRODUCT
// DELETE /api/admin/products/:id
// ------------------------------------------------------------

router.delete(
  "/products/:id",
  deleteProduct
);

// ============================================================
// ORDERS
// ============================================================

// ------------------------------------------------------------
// GET ALL ORDERS
// GET /api/admin/orders
// ------------------------------------------------------------

router.get(
  "/orders",
  getOrders
);

// ------------------------------------------------------------
// UPDATE ORDER STATUS
// PATCH /api/admin/orders/:id/status
// ------------------------------------------------------------

router.patch(
  "/orders/:id/status",
  updateOrderStatus
);

// Also allow PUT for frontend compatibility.
router.put(
  "/orders/:id/status",
  updateOrderStatus
);

// ============================================================
// RIDERS
// ============================================================

// ------------------------------------------------------------
// GET ALL RIDERS
// GET /api/admin/riders
// ------------------------------------------------------------

router.get(
  "/riders",
  getRiders
);

// ------------------------------------------------------------
// GET RIDER BY ID
// GET /api/admin/riders/:id
// ------------------------------------------------------------

router.get(
  "/riders/:id",
  getRiderById
);

// ------------------------------------------------------------
// APPROVE RIDER
// PATCH /api/admin/riders/:id/approve
// ------------------------------------------------------------

router.patch(
  "/riders/:id/approve",
  approveRider
);

// Also allow PUT.
router.put(
  "/riders/:id/approve",
  approveRider
);

// ------------------------------------------------------------
// REJECT RIDER
// PATCH /api/admin/riders/:id/reject
// ------------------------------------------------------------

router.patch(
  "/riders/:id/reject",
  rejectRider
);

// Also allow PUT.
router.put(
  "/riders/:id/reject",
  rejectRider
);

// ------------------------------------------------------------
// UPDATE RIDER ACCOUNT STATUS
// PATCH /api/admin/riders/:id/status
// ------------------------------------------------------------

router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

// Also allow PUT.
router.put(
  "/riders/:id/status",
  updateRiderStatus
);

// ------------------------------------------------------------
// UPDATE RIDER PROFILE
// PATCH /api/admin/riders/:id/profile
// ------------------------------------------------------------

router.patch(
  "/riders/:id/profile",
  updateRiderProfile
);

// Also allow PUT.
router.put(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;