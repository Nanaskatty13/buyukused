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
// AUTHENTICATION
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

// GET /api/admin/stats
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
// PUT    /api/admin/users/:id/role
// ------------------------------------------------------------

router.patch(
  "/users/:id/role",
  updateUserRole
);

router.put(
  "/users/:id/role",
  updateUserRole
);

// ------------------------------------------------------------
// UPDATE USER STATUS
// PATCH /api/admin/users/:id/status
// PUT    /api/admin/users/:id/status
// ------------------------------------------------------------

router.patch(
  "/users/:id/status",
  updateUserStatus
);

router.put(
  "/users/:id/status",
  updateUserStatus
);

// ============================================================
// SELLER VERIFICATION
// ============================================================
//
// IMPORTANT:
//
// We support BOTH:
//
// /api/admin/users/:id/verify-seller
// /api/admin/users/:id/unverify-seller
//
// AND the older/frontend endpoints:
//
// /api/admin/sellers/:id/verify
// /api/admin/sellers/:id/unverify
//
// This prevents 404 errors when older frontend code is still
// calling the /sellers/... endpoints.
//
// ============================================================

// ------------------------------------------------------------
// VERIFY SELLER - PRIMARY
// PATCH /api/admin/users/:id/verify-seller
// PUT   /api/admin/users/:id/verify-seller
// ------------------------------------------------------------

router.patch(
  "/users/:id/verify-seller",
  verifySeller
);

router.put(
  "/users/:id/verify-seller",
  verifySeller
);

// ------------------------------------------------------------
// UNVERIFY SELLER - PRIMARY
// PATCH /api/admin/users/:id/unverify-seller
// PUT   /api/admin/users/:id/unverify-seller
// ------------------------------------------------------------

router.patch(
  "/users/:id/unverify-seller",
  unverifySeller
);

router.put(
  "/users/:id/unverify-seller",
  unverifySeller
);

// ============================================================
// SELLER COMPATIBILITY ROUTES
// ============================================================

// ------------------------------------------------------------
// VERIFY SELLER
// PATCH /api/admin/sellers/:id/verify
// PUT   /api/admin/sellers/:id/verify
// ------------------------------------------------------------

router.patch(
  "/sellers/:id/verify",
  verifySeller
);

router.put(
  "/sellers/:id/verify",
  verifySeller
);

// ------------------------------------------------------------
// UNVERIFY SELLER
// PATCH /api/admin/sellers/:id/unverify
// PUT   /api/admin/sellers/:id/unverify
// ------------------------------------------------------------
//
// THIS FIXES:
//
// Failed to remove verification:
// API endpoint not found
//
// ------------------------------------------------------------

router.patch(
  "/sellers/:id/unverify",
  unverifySeller
);

router.put(
  "/sellers/:id/unverify",
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
// PUT   /api/admin/orders/:id/status
// ------------------------------------------------------------

router.patch(
  "/orders/:id/status",
  updateOrderStatus
);

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
// PUT   /api/admin/riders/:id/approve
// ------------------------------------------------------------

router.patch(
  "/riders/:id/approve",
  approveRider
);

router.put(
  "/riders/:id/approve",
  approveRider
);

// ------------------------------------------------------------
// REJECT RIDER
// PATCH /api/admin/riders/:id/reject
// PUT   /api/admin/riders/:id/reject
// ------------------------------------------------------------

router.patch(
  "/riders/:id/reject",
  rejectRider
);

router.put(
  "/riders/:id/reject",
  rejectRider
);

// ------------------------------------------------------------
// UPDATE RIDER STATUS
// PATCH /api/admin/riders/:id/status
// PUT   /api/admin/riders/:id/status
// ------------------------------------------------------------

router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

router.put(
  "/riders/:id/status",
  updateRiderStatus
);

// ------------------------------------------------------------
// UPDATE RIDER PROFILE
// PATCH /api/admin/riders/:id/profile
// PUT   /api/admin/riders/:id/profile
// ------------------------------------------------------------

router.patch(
  "/riders/:id/profile",
  updateRiderProfile
);

router.put(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;