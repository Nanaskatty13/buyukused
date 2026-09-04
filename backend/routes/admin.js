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
  verifyUser,
  unverifyUser,
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

// GET /api/admin/stats
//
// Compatibility endpoint because the frontend admin dashboard
// may request /api/admin/stats instead of /dashboard.

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

// ============================================================
// STATIC USER ROUTES
// ============================================================
//
// Static routes must be declared BEFORE:
//
// /users/:id
//
// This prevents Express from interpreting a static path
// such as "unverified-sellers" as a MongoDB user ID.
//
// ============================================================

// GET /api/admin/users/unverified-sellers
//
// Compatibility endpoint for seller-management implementations
// that use this path.

router.get(
  "/users/unverified-sellers",
  getUnverifiedSellers
);

// ============================================================
// VERIFY USER
// ============================================================
//
// These routes are for NORMAL marketplace users.
//
// Admin can:
//
// ✓ Verify User
// ✕ Unverify User
//
// ============================================================

// PATCH /api/admin/users/:id/verify
router.patch(
  "/users/:id/verify",
  verifyUser
);

// PUT compatibility endpoint.
//
// Kept for older frontend builds that may still use PUT.

router.put(
  "/users/:id/verify",
  verifyUser
);

// ============================================================
// UNVERIFY USER
// ============================================================

// PATCH /api/admin/users/:id/unverify
router.patch(
  "/users/:id/unverify",
  unverifyUser
);

// PUT compatibility endpoint.

router.put(
  "/users/:id/unverify",
  unverifyUser
);

// ============================================================
// GET SINGLE USER
// ============================================================

// GET /api/admin/users/:id
router.get(
  "/users/:id",
  getUserById
);

// ============================================================
// USER ROLE
// ============================================================

// PUT /api/admin/users/:id/role
router.put(
  "/users/:id/role",
  updateUserRole
);

// PATCH compatibility endpoint.

router.patch(
  "/users/:id/role",
  updateUserRole
);

// ============================================================
// DELETE USER
// ============================================================

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

// PATCH compatibility endpoint.

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

// ============================================================
// APPROVE RIDER
// ============================================================

// PUT /api/admin/riders/:id/approve
router.put(
  "/riders/:id/approve",
  approveRider
);

// PATCH compatibility endpoint.

router.patch(
  "/riders/:id/approve",
  approveRider
);

// ============================================================
// REJECT RIDER
// ============================================================

// PUT /api/admin/riders/:id/reject
router.put(
  "/riders/:id/reject",
  rejectRider
);

// PATCH compatibility endpoint.

router.patch(
  "/riders/:id/reject",
  rejectRider
);

// ============================================================
// RIDER STATUS
// ============================================================

// PUT /api/admin/riders/:id/status
router.put(
  "/riders/:id/status",
  updateRiderStatus
);

// PATCH compatibility endpoint.

router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

// ============================================================
// RIDER PROFILE
// ============================================================

// PUT /api/admin/riders/:id/profile
router.put(
  "/riders/:id/profile",
  updateRiderProfile
);

// PATCH compatibility endpoint.

router.patch(
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
// POST
// /api/admin/sellers/:id/verify
//
// PATCH
// /api/admin/sellers/:id/verify
//
// PUT
// /api/admin/sellers/:id/revoke-verification
//
// PATCH
// /api/admin/sellers/:id/revoke-verification
//
// ============================================================

// GET /api/admin/sellers/unverified
router.get(
  "/sellers/unverified",
  getUnverifiedSellers
);

// ============================================================
// VERIFY SELLER
// ============================================================

// PUT /api/admin/sellers/:id/verify
router.put(
  "/sellers/:id/verify",
  verifySeller
);

// POST compatibility endpoint.
//
// Kept temporarily for older frontend builds.

router.post(
  "/sellers/:id/verify",
  verifySeller
);

// PATCH compatibility endpoint.

router.patch(
  "/sellers/:id/verify",
  verifySeller
);

// ============================================================
// REVOKE SELLER VERIFICATION
// ============================================================

// PUT /api/admin/sellers/:id/revoke-verification
router.put(
  "/sellers/:id/revoke-verification",
  revokeVerification
);

// PATCH compatibility endpoint.

router.patch(
  "/sellers/:id/revoke-verification",
  revokeVerification
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;