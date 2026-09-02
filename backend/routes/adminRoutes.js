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

  // ----------------------------------------------------------
  // Users
  // ----------------------------------------------------------
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,

  // ----------------------------------------------------------
  // User verification
  // ----------------------------------------------------------
  getUnverifiedUsers,
  getVerifiedUsers,
  verifyUser,
  unverifyUser,

  // ----------------------------------------------------------
  // Backward compatibility
  // ----------------------------------------------------------
  getUnverifiedSellers,
  verifySeller,
  unverifySeller,

  // ----------------------------------------------------------
  // Products
  // ----------------------------------------------------------
  getProducts,
  deleteProduct,

  // ----------------------------------------------------------
  // Orders
  // ----------------------------------------------------------
  getOrders,
  updateOrderStatus,

  // ----------------------------------------------------------
  // Riders
  // ----------------------------------------------------------
  getRiders,
  getRiderById,
  approveRider,
  rejectRider,
  updateRiderStatus,
  updateRiderProfile,
} = require("../controllers/adminController");

// ============================================================
// ALL ADMIN ROUTES
// ============================================================

// Every route below requires authentication.
router.use(authenticate);

// Every route below requires admin privileges.
router.use(requireAdmin);

// ============================================================
// DASHBOARD
// ============================================================

router.get(
  "/stats",
  getDashboardStats
);

// ============================================================
// USERS
// ============================================================

// ------------------------------------------------------------
// IMPORTANT:
// Static routes MUST come before "/users/:id"
// ------------------------------------------------------------

// Get all users
router.get(
  "/users",
  getUsers
);

// Get all unverified users
router.get(
  "/users/unverified",
  getUnverifiedUsers
);

// Get all verified users
router.get(
  "/users/verified",
  getVerifiedUsers
);

// ------------------------------------------------------------
// SELLER VERIFICATION
// ------------------------------------------------------------

// Backward-compatible seller endpoint
router.get(
  "/users/unverified-sellers",
  getUnverifiedSellers
);

// Verify a user/seller
router.patch(
  "/users/:id/verify",
  verifyUser
);

// Unverify a user/seller
router.patch(
  "/users/:id/unverify",
  unverifyUser
);

// ------------------------------------------------------------
// BACKWARD-COMPATIBLE SELLER VERIFICATION ROUTES
// ------------------------------------------------------------

router.patch(
  "/users/:id/verify-seller",
  verifySeller
);

router.patch(
  "/users/:id/unverify-seller",
  unverifySeller
);

// ------------------------------------------------------------
// GET USER BY ID
// ------------------------------------------------------------

// IMPORTANT:
// Keep this AFTER all static /users/... routes.
router.get(
  "/users/:id",
  getUserById
);

// ============================================================
// USER ROLE
// ============================================================

router.patch(
  "/users/:id/role",
  updateUserRole
);

// ============================================================
// USER STATUS
// ============================================================

router.patch(
  "/users/:id/status",
  updateUserStatus
);

// ============================================================
// DELETE USER
// ============================================================

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

router.patch(
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

router.patch(
  "/riders/:id/approve",
  approveRider
);

router.patch(
  "/riders/:id/reject",
  rejectRider
);

router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

router.patch(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;